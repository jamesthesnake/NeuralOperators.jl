var documenterSearchIndex = {"docs":
[{"location":"apis/#Index","page":"APIs","title":"Index","text":"","category":"section"},{"location":"apis/","page":"APIs","title":"APIs","text":"","category":"page"},{"location":"apis/#Layers","page":"APIs","title":"Layers","text":"","category":"section"},{"location":"apis/#Spectral-convolutional-layer","page":"APIs","title":"Spectral convolutional layer","text":"","category":"section"},{"location":"apis/","page":"APIs","title":"APIs","text":"F(s) = mathcalF  v(x)  \nF(s) = g(F(s)) \nv(x) = mathcalF^-1  F(s) ","category":"page"},{"location":"apis/","page":"APIs","title":"APIs","text":"where v(x) and v(x) denotes input and output function, mathcalF  cdot , mathcalF^-1  cdot  are Fourier transform, inverse Fourier transform, respectively. Function g is a linear transform for lowering Fouier modes.","category":"page"},{"location":"apis/","page":"APIs","title":"APIs","text":"SpectralConv","category":"page"},{"location":"apis/#NeuralOperators.SpectralConv","page":"APIs","title":"NeuralOperators.SpectralConv","text":"SpectralConv(\n    ch, modes;\n    init=c_glorot_uniform, permuted=false, T=ComplexF32\n)\n\nArguments\n\nch: Input and output channel size, e.g. 64=>64.\nmodes: The Fourier modes to be preserved.\npermuted: Whether the dim is permuted. If permuted=true, layer accepts   data in the order of (ch, ..., batch), otherwise the order is (..., ch, batch).\n\nExample\n\njulia> SpectralConv(2=>5, (16, ))\nSpectralConv(2 => 5, (16,), permuted=false)\n\njulia> SpectralConv(2=>5, (16, ), permuted=true)\nSpectralConv(2 => 5, (16,), permuted=true)\n\n\n\n\n\n","category":"type"},{"location":"apis/","page":"APIs","title":"APIs","text":"Reference: Fourier Neural Operator for Parametric Partial Differential Equations","category":"page"},{"location":"apis/","page":"APIs","title":"APIs","text":"","category":"page"},{"location":"apis/#Fourier-operator-layer","page":"APIs","title":"Fourier operator layer","text":"","category":"section"},{"location":"apis/","page":"APIs","title":"APIs","text":"v_t+1(x) = sigma(W v_t(x) + mathcalK  v_t(x)  )","category":"page"},{"location":"apis/","page":"APIs","title":"APIs","text":"where v_t(x) is the input function for t-th layer and mathcalK  cdot  denotes spectral convolutional layer. Activation function sigma can be arbitrary non-linear function.","category":"page"},{"location":"apis/","page":"APIs","title":"APIs","text":"FourierOperator","category":"page"},{"location":"apis/#NeuralOperators.FourierOperator","page":"APIs","title":"NeuralOperators.FourierOperator","text":"FourierOperator(ch, modes, σ=identity; permuted=false)\n\nArguments\n\nch: Input and output channel size for spectral convolution, e.g. 64=>64.\nmodes: The Fourier modes to be preserved for spectral convolution.\nσ: Activation function.\npermuted: Whether the dim is permuted. If permuted=true, layer accepts   data in the order of (ch, ..., batch), otherwise the order is (..., ch, batch).\n\nExample\n\njulia> FourierOperator(2=>5, (16, ))\nFourierOperator(2 => 5, (16,), σ=identity, permuted=false)\n\njulia> using Flux\n\njulia> FourierOperator(2=>5, (16, ), relu)\nFourierOperator(2 => 5, (16,), σ=relu, permuted=false)\n\njulia> FourierOperator(2=>5, (16, ), relu, permuted=true)\nFourierOperator(2 => 5, (16,), σ=relu, permuted=true)\n\n\n\n\n\n","category":"type"},{"location":"apis/","page":"APIs","title":"APIs","text":"Reference: Fourier Neural Operator for Parametric Partial Differential Equations","category":"page"},{"location":"apis/#Models","page":"APIs","title":"Models","text":"","category":"section"},{"location":"apis/#Fourier-neural-operator","page":"APIs","title":"Fourier neural operator","text":"","category":"section"},{"location":"apis/","page":"APIs","title":"APIs","text":"FourierNeuralOperator","category":"page"},{"location":"apis/#NeuralOperators.FourierNeuralOperator","page":"APIs","title":"NeuralOperators.FourierNeuralOperator","text":"FourierNeuralOperator(;\n    ch=(2, 64, 64, 64, 64, 64, 128, 1),\n    modes=(16, ),\n    σ=gelu\n)\n\nFourier neural operator learns a neural operator with Dirichlet kernel to form a Fourier transformation. It performs Fourier transformation across infinite-dimensional function spaces and learns better than neural operator.\n\n\n\n\n\n","category":"function"},{"location":"apis/","page":"APIs","title":"APIs","text":"Reference: Fourier Neural Operator for Parametric Partial Differential Equations","category":"page"},{"location":"apis/","page":"APIs","title":"APIs","text":"","category":"page"},{"location":"apis/#Markov-neural-operator","page":"APIs","title":"Markov neural operator","text":"","category":"section"},{"location":"apis/","page":"APIs","title":"APIs","text":"MarkovNeuralOperator","category":"page"},{"location":"apis/#NeuralOperators.MarkovNeuralOperator","page":"APIs","title":"NeuralOperators.MarkovNeuralOperator","text":"MarkovNeuralOperator(;\n    ch=(1, 64, 64, 64, 64, 64, 1),\n    modes=(24, 24),\n    σ=gelu\n)\n\nMarkov neural operator learns a neural operator with Fourier operators. With only one time step information of learning, it can predict the following few steps with low loss by linking the operators into a Markov chain.\n\n\n\n\n\n","category":"function"},{"location":"apis/","page":"APIs","title":"APIs","text":"Reference: Markov Neural Operators for Learning Chaotic Systems","category":"page"},{"location":"","page":"Home","title":"Home","text":"CurrentModule = NeuralOperators","category":"page"},{"location":"#NeuralOperators","page":"Home","title":"NeuralOperators","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Documentation for NeuralOperators.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Ground Truth Inferenced\n(Image: ) (Image: )","category":"page"},{"location":"","page":"Home","title":"Home","text":"The demonstration shown above is Navier-Stokes equation learned by the MarkovNeuralOperator with only one time step information. Example can be found in example/FlowOverCircle.","category":"page"},{"location":"#Abstract","page":"Home","title":"Abstract","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Neural operator is a novel deep learning architecture. It learns a operator, which is a mapping between infinite-dimensional function spaces. It can be used to resolve partial differential equations (PDE). Instead of solving by finite element method, a PDE problem can be resolved by training a neural network to learn an operator mapping from infinite-dimensional space (u, t) to infinite-dimensional space f(u, t). Neural operator learns a continuous function between two continuous function spaces. The kernel can be trained on different geometry, which is learned from a graph.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Fourier neural operator learns a neural operator with Dirichlet kernel to form a Fourier transformation. It performs Fourier transformation across infinite-dimensional function spaces and learns better than neural operator.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Markov neural operator learns a neural operator with Fourier operators. With only one time step information of learning, it can predict the following few steps with low loss by linking the operators into a Markov chain.","category":"page"},{"location":"","page":"Home","title":"Home","text":"DeepONet operator (Deep Operator Network)learns a neural operator with the help of two sub-neural net structures described as the branch and the trunk network. The branch network is fed the initial conditions data, whereas the trunk is fed with the locations where the target(output) is evaluated from the corresponding initial conditions. It is important that the output size of the branch and trunk subnets is same so that a dot product can be performed between them.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Currently, the FourierOperator layer is provided in this work. As for model, there are FourierNeuralOperator and MarkovNeuralOperator provided. Please take a glance at them here.","category":"page"},{"location":"#Quick-start","page":"Home","title":"Quick start","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The package can be installed with the Julia package manager. From the Julia REPL, type ] to enter the Pkg REPL mode and run:","category":"page"},{"location":"","page":"Home","title":"Home","text":"pkg> add NeuralOperators","category":"page"},{"location":"#Usage","page":"Home","title":"Usage","text":"","category":"section"},{"location":"#Fourier-Neural-Operator","page":"Home","title":"Fourier Neural Operator","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"model = Chain(\n    # lift (d + 1)-dimensional vector field to n-dimensional vector field\n    # here, d == 1 and n == 64\n    Dense(2, 64),\n    # map each hidden representation to the next by integral kernel operator\n    FourierOperator(64=>64, (16, ), gelu),\n    FourierOperator(64=>64, (16, ), gelu),\n    FourierOperator(64=>64, (16, ), gelu),\n    FourierOperator(64=>64, (16, )),\n    # project back to the scalar field of interest space\n    Dense(64, 128, gelu),\n    Dense(128, 1),\n    flatten\n)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Or one can just call:","category":"page"},{"location":"","page":"Home","title":"Home","text":"model = FourierNeuralOperator(\n    ch=(2, 64, 64, 64, 64, 64, 128, 1),\n    modes=(16, ),\n    σ=gelu\n)","category":"page"},{"location":"","page":"Home","title":"Home","text":"And then train as a Flux model.","category":"page"},{"location":"","page":"Home","title":"Home","text":"loss(𝐱, 𝐲) = sum(abs2, 𝐲 .- model(𝐱)) / size(𝐱)[end]\nopt = Flux.Optimiser(WeightDecay(1f-4), Flux.ADAM(1f-3))\nFlux.@epochs 50 Flux.train!(loss, params(model), data, opt)","category":"page"},{"location":"#DeepONet","page":"Home","title":"DeepONet","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"#tuple of Ints for branch net architecture and then for trunk net, followed by activations for branch and trunk respectively\nmodel = DeepONet((32,64,72), (24,64,72), σ, tanh)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Or specify branch and trunk as separate Chain from Flux and pass to DeepONet","category":"page"},{"location":"","page":"Home","title":"Home","text":"branch = Chain(Dense(32,64,σ), Dense(64,72,σ))\ntrunk = Chain(Dense(24,64,tanh), Dense(64,72,tanh))\nmodel = DeepONet(branch,trunk)","category":"page"},{"location":"","page":"Home","title":"Home","text":"You can again specify loss, optimization and training parameters just as you would for a simple neural network with Flux.","category":"page"},{"location":"","page":"Home","title":"Home","text":"loss(xtrain,ytrain,sensor) = Flux.Losses.mse(model(xtrain,sensor),ytrain)\nevalcb() = @show(loss(xval,yval,grid))\n\nlearning_rate = 0.001\nopt = ADAM(learning_rate)\nparameters = params(model)\nFlux.@epochs 400 Flux.train!(loss, parameters, [(xtrain,ytrain,grid)], opt, cb = evalcb)","category":"page"},{"location":"","page":"Home","title":"Home","text":"A more complete example using DeepONet architecture to solve Burgers' equation can be found in the examples","category":"page"}]
}