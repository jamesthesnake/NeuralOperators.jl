export
       OperatorConv,
       SpectralConv,
       OperatorKernel

struct OperatorConv{P, T, S, TT}
    weight::T
    in_channel::S
    out_channel::S
    transform::TT
end

function OperatorConv{P}(weight::T,
                         in_channel::S,
                         out_channel::S,
                         transform::TT) where {P, T, S, TT <: AbstractTransform}
    return OperatorConv{P, T, S, TT}(weight, in_channel, out_channel, transform)
end

"""
    OperatorConv(ch, modes, transform;
                 init=glorot_uniform, permuted=false, T=ComplexF32)

## Arguments

  - `ch`: A `Pair` of input and output channel size `ch_in=>ch_out`, e.g. `64=>64`.
  - `modes`: The modes to be preserved. A tuple of length `d`,
    where `d` is the dimension of data.
  - `Transform`: The trafo to operate the transformation.

## Keyword Arguments

  - `init`: Initial function to initialize parameters.
  - `permuted`: Whether the dim is permuted. If `permuted=true`, the layer accepts
    data in the order of `(ch, x_1, ... , x_d , batch)`.
    Otherwise the order is `(x_1, ... , x_d, ch, batch)`.
  - `T`: Datatype of parameters.

## Example

```jldoctest
julia> OperatorConv(2 => 5, (16,), FourierTransform)
OperatorConv(2 => 5, (16,), FourierTransform, permuted=false)

julia> OperatorConv(2 => 5, (16,), FourierTransform, permuted = true)
OperatorConv(2 => 5, (16,), FourierTransform, permuted=true)
```
"""
function OperatorConv(ch::Pair{S, S},
                      modes::NTuple{N, S},
                      Transform::Type{<:AbstractTransform};
                      init = (dims...) -> Flux.glorot_uniform(eltype(Transform), dims...),
                      permuted = false,
                      T::DataType = eltype(Transform)) where {S <: Integer, N}
    in_chs, out_chs = ch
    scale = one(T) / (in_chs * out_chs)
    weights = scale * init(prod(modes), in_chs, out_chs)
    transform = Transform(modes)

    return OperatorConv{permuted}(weights, in_chs, out_chs, transform)
end

function SpectralConv(ch::Pair{S, S},
                      modes::NTuple{N, S};
                      init = c_glorot_uniform,
                      permuted = false,
                      T::DataType = ComplexF32) where {S <: Integer, N}
    return OperatorConv(ch, modes, FourierTransform,
                        init = init, permuted = permuted, T = T)
end

Flux.@functor OperatorConv{true}
Flux.@functor OperatorConv{false}

Base.ndims(oc::OperatorConv) = ndims(oc.transform)

ispermuted(::OperatorConv{P}) where {P} = P

function Base.show(io::IO, l::OperatorConv{P}) where {P}
    print(io,
          "OperatorConv(" *
          "$(l.in_channel) => $(l.out_channel), " *
          "$(l.transform.modes), " *
          "$(nameof(typeof(l.transform))), " *
          "permuted=$P)")
end

function operator_conv(m::OperatorConv, 𝐱::AbstractArray)
    𝐱_transformed = transform(m.transform, 𝐱) # [size(x)..., in_chs, batch]
    𝐱_truncated = truncate_modes(m.transform, 𝐱_transformed) # [modes..., in_chs, batch]
    𝐱_applied_pattern = apply_pattern(𝐱_truncated, m.weight) # [modes..., out_chs, batch]
    𝐱_padded = pad_modes(𝐱_applied_pattern,
                         (size(𝐱_transformed)[1:(end - 2)]...,
                          size(𝐱_applied_pattern)[(end - 1):end]...)) # [size(x)..., out_chs, batch] <- [modes..., out_chs, batch]
    𝐱_inversed = inverse(m.transform, 𝐱_padded, size(𝐱))

    return 𝐱_inversed
end

function (m::OperatorConv{false})(𝐱)
    𝐱ᵀ = permutedims(𝐱, (ntuple(i -> i + 1, ndims(m))..., 1, ndims(m) + 2)) # [x, in_chs, batch] <- [in_chs, x, batch]
    𝐱_out = operator_conv(m, 𝐱ᵀ) # [x, out_chs, batch]
    𝐱_outᵀ = permutedims(𝐱_out, (ndims(m) + 1, 1:ndims(m)..., ndims(m) + 2)) # [out_chs, x, batch] <- [x, out_chs, batch]

    return 𝐱_outᵀ
end

function (m::OperatorConv{true})(𝐱)
    return operator_conv(m, 𝐱) # [x, out_chs, batch]
end

############
# operator #
############

struct OperatorKernel{L, C, F} <: AbstractOperatorKernel
    linear::L
    conv::C
    σ::F
end

"""
    OperatorKernel(ch, modes, σ=identity; permuted=false)

## Arguments

  - `ch`: A `Pair` of input and output channel size for spectral convolution `in_ch=>out_ch`,
    e.g. `64=>64`.
  - `modes`: The modes to be preserved for spectral convolution. A tuple of length `d`,
    where `d` is the dimension of data.
  - `σ`: Activation function.

## Keyword Arguments

  - `permuted`: Whether the dim is permuted. If `permuted=true`, the layer accepts
    data in the order of `(ch, x_1, ... , x_d , batch)`,
    otherwise the order is `(x_1, ... , x_d, ch, batch)`.

## Example

```jldoctest
julia> OperatorKernel(2 => 5, (16,), FourierTransform)
OperatorKernel(2 => 5, (16,), FourierTransform, σ=identity, permuted=false)

julia> using Flux

julia> OperatorKernel(2 => 5, (16,), FourierTransform, relu)
OperatorKernel(2 => 5, (16,), FourierTransform, σ=relu, permuted=false)

julia> OperatorKernel(2 => 5, (16,), FourierTransform, relu, permuted = true)
OperatorKernel(2 => 5, (16,), FourierTransform, σ=relu, permuted=true)
```
"""
function OperatorKernel(ch::Pair{S, S},
                        modes::NTuple{N, S},
                        Transform::Type{<:AbstractTransform},
                        σ = identity;
                        permuted = false) where {S <: Integer, N}
    linear = permuted ? Conv(Tuple(ones(Int, length(modes))), ch) :
             Dense(ch.first, ch.second)
    conv = OperatorConv(ch, modes, Transform; permuted = permuted)

    return OperatorKernel(linear, conv, σ)
end

Flux.@functor OperatorKernel

function Base.show(io::IO, l::OperatorKernel)
    print(io,
          "OperatorKernel(" *
          "$(l.conv.in_channel) => $(l.conv.out_channel), " *
          "$(l.conv.transform.modes), " *
          "$(nameof(typeof(l.conv.transform))), " *
          "σ=$(string(l.σ)), " *
          "permuted=$(ispermuted(l.conv))" *
          ")")
end

function (m::OperatorKernel)(𝐱)
    return m.σ.(m.linear(𝐱) + m.conv(𝐱))
end

#########
# utils #
#########

c_glorot_uniform(dims...) = Flux.glorot_uniform(dims...) + Flux.glorot_uniform(dims...) * im
Flux.glorot_uniform(::Type{<:Real}, dims...) = Flux.glorot_uniform(dims...)
Flux.glorot_uniform(::Type{<:Complex}, dims...) = c_glorot_uniform(dims...)

# [prod(modes), out_chs, batch] <- [prod(modes), in_chs, batch] * [out_chs, in_chs, prod(modes)]
einsum(𝐱₁, 𝐱₂) = @tullio 𝐲[m, o, b] := 𝐱₁[m, i, b] * 𝐱₂[m, i, o]

function apply_pattern(𝐱_truncated, 𝐰)
    x_size = size(𝐱_truncated) # [m.modes..., in_chs, batch]

    𝐱_flattened = reshape(𝐱_truncated, :, x_size[(end - 1):end]...) # [prod(m.modes), in_chs, batch], only 3-dims
    𝐱_weighted = einsum(𝐱_flattened, 𝐰) # [prod(m.modes), out_chs, batch], only 3-dims
    𝐱_shaped = reshape(𝐱_weighted, x_size[1:(end - 2)]..., size(𝐱_weighted)[2:3]...) # [m.modes..., out_chs, batch]

    return 𝐱_shaped
end

pad_modes(𝐱::AbstractArray, dims::NTuple) = pad_modes!(similar(𝐱, dims), 𝐱)

function pad_modes!(𝐱_padded::AbstractArray, 𝐱::AbstractArray)
    fill!(𝐱_padded, eltype(𝐱)(0)) # zeros(eltype(𝐱), dims)
    𝐱_padded[map(d -> 1:d, size(𝐱))...] .= 𝐱

    return 𝐱_padded
end

function ChainRulesCore.rrule(::typeof(pad_modes), 𝐱::AbstractArray, dims::NTuple)
    function pad_modes_pullback(𝐲̄)
        return NoTangent(), view(𝐲̄, map(d -> 1:d, size(𝐱))...), NoTangent()
    end

    return pad_modes(𝐱, dims), pad_modes_pullback
end
