using Burgers
using FluxTraining
using Test

@testset "Burgers" begin
    xs, ys = Burgers.get_data(n = 1000)

    @test size(xs) == (2, 1024, 1000)
    @test size(ys) == (1, 1024, 1000)

    learner = Burgers.train(epochs = 100)
    loss = learner.cbstate.metricsepoch[ValidationPhase()][:Loss].values[end]
    @test loss < 0.1

    # include("deeponet.jl")
end

@testset "Burger: NOMAD Training Accuracy" begin
    ϵ = Burgers.train_nomad(; cuda = true, epochs = 100)
    @test ϵ < 0.4 # epoch=100 returns 0.233
end
