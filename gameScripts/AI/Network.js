class Network {
    constructor(input_nodes, hid1_nodes, hid2_nodes, output_nodes) {
        this.input_nodes = input_nodes;
        this.hidden_nodes_1 = hid1_nodes;
        this.hidden_nodes_2 = hid2_nodes;
        this.output_nodes = output_nodes;

        this.weights_input_h1 = new Matrix(this.hidden_nodes_1, this.input_nodes);
        this.weights_h1_h2 = new Matrix(this.hidden_nodes_2, this.hidden_nodes_1);
        this.weights_h2_output = new Matrix(this.output_nodes, this.hidden_nodes_2);
        this.weights_input_h1.randomize();
        this.weights_h1_h2.randomize();
        this.weights_h2_output.randomize();

        this.bias_h1 = new Matrix(this.hidden_nodes_1, 1);
        this.bias_h2 = new Matrix(this.hidden_nodes_2, 1);
        this.bias_output = new Matrix(this.output_nodes, 1);
        this.bias_h1.randomize();
        this.bias_h2.randomize();
        this.bias_output.randomize();

        this.learningrate = 0.5;
    }

    predict(input_array) {
        // Calculate raw hidden1 activation
        let inputs = Matrix.fromArray(input_array);
        let hidden1 = Matrix.multiply(this.weights_input_h1, inputs);
        hidden1.add(this.bias_h1);

        // Map sigmoid on h1 activation
        hidden1.map(sigmoid);

        // Calculate raw hidden2 activation
        let hidden2 = Matrix.multiply(this.weights_h1_h2, hidden1);
        hidden2.add(this.bias_h2);

        // Map sigmoid on h2 activation
        hidden2.map(sigmoid);

        // Calculate raw output activation
        let outputs = Matrix.multiply(this.weights_h2_output, hidden2);
        outputs.add(this.bias_output);

        // Map sigmoid on output activation
        outputs.map(sigmoid)

        return outputs.toArray();
    }

    train(input_array, target_array) {
        let inputs = Matrix.fromArray(input_array);
        let targets = Matrix.fromArray(target_array);

        // Calculate raw hidden1 activation
        let hidden1 = Matrix.multiply(this.weights_input_h1, inputs);
        hidden1.add(this.bias_h1);
        // Map sigmoid on h1 activation
        hidden1.map(sigmoid);

        // Calculate raw hidden2 activation
        let hidden2 = Matrix.multiply(this.weights_h1_h2, hidden1);
        hidden2.add(this.bias_h2);
        // Map sigmoid on h2 activation
        hidden2.map(sigmoid);

        // Calculate raw output activation
        let outputs = Matrix.multiply(this.weights_h2_output, hidden2);
        outputs.add(this.bias_output);
        // Map sigmoid on output activation
        outputs.map(sigmoid)

        /*
        // Calculate initial error
        let output_errors = Matrix.subtract(targets, outputs)
        errors.push(output_errors.data[0][0])

        // Calculate output gradients
        let gradients_h2_o = Matrix.map(outputs, dligmoid)
        gradients_h2_o.multiply(output_errors)
        gradients_h2_o.multiply(this.learningrate)

        // Calculate deltas
        let hidden2_T = Matrix.transpose(hidden2)
        let weight_h2_o_deltas = Matrix.multiply(gradients_h2_o, hidden2_T)
        deltas.push(weight_h2_o_deltas.data[0][0])

        // Adjust weights by deltas
        this.weights_h2_output.add(weight_h2_o_deltas)
        // Adjust biases by deltas
        this.bias_output.add(gradients_h2_o)

        // Calculate hidden2 error
        let weights_h2_output_T = Matrix.transpose(this.weights_h2_output)
        let hidden2_errors = Matrix.multiply(weights_h2_output_T, output_errors)

        // Calculate hidden2 gradients
        let gradients_h1_h2 = Matrix.map(hidden2, dligmoid)
        gradients_h1_h2.multiply(hidden2_errors)
        gradients_h1_h2.multiply(this.learningrate)

        // Calculate deltas
        let hidden1_T = Matrix.transpose(hidden1)
        let weights_h1_h2_deltas = Matrix.multiply(gradients_h1_h2, hidden1_T)

        // Adjust weights by deltas
        this.weights_h1_h2.add(weights_h1_h2_deltas)
        // Adjust biases by deltas
        this.bias_h2.add(gradients_h1_h2)

        // Calculate hidden1 error
        let weights_h1_h2_T = Matrix.transpose(this.weights_h1_h2)
        let hidden1_errors = Matrix.multiply(weights_h1_h2_T, hidden2_errors)

        // Calculate hidden1 gradients
        let graidents_input_h1 = Matrix.map(hidden1, dligmoid)
        graidents_input_h1.multiply(hidden1_errors)
        graidents_input_h1.multiply(this.learningrate)

        // Calculate deltas
        let input_T = Matrix.transpose(inputs)
        let weights_input_h1_deltas = Matrix.multiply(graidents_input_h1, input_T)

        // Adjust weights by deltas
        this.weights_input_h1.add(weights_input_h1_deltas)
        // Adjust biases by deltas
        this.bias_h1.add(graidents_input_h1)
        */
        // Calculater error matrix as targets - outputs
        
        var errs = Matrix.subtract(targets, outputs)
        console.log("Errors: ")
        console.log(errs.data)
        let layers = [inputs, hidden1, hidden2, outputs]
        let weights = [this.weights_input_h1, this.weights_h1_h2, this.weights_h2_output]
        let biases = [this.bias_h1, this.bias_h2, this.bias_output]
        errors.push(errs.data[0][0])
        for (let i = layers.length - 1; i > 0; i--) {
            let currentLayer = layers[i];
            let previousLayer = layers[i - 1];
            let gapIndex = i - 1;
            
            let currentLayer_gradients = Matrix.map(currentLayer, dligmoid);
            currentLayer_gradients.multiply(errs);
            currentLayer_gradients.multiply(this.learningrate);

            let previousLayer_T = Matrix.transpose(previousLayer);
            let weight_deltas = Matrix.multiply(currentLayer_gradients, previousLayer_T);

            weights[gapIndex].add(weight_deltas);
            biases[gapIndex].add(currentLayer_gradients);

            let currentWeights_T = Matrix.transpose(weights[gapIndex])
            errs = Matrix.multiply(currentWeights_T, errs)
        }

        this.weights_input_h1 = weights[0];
        this.weights_h1_h2 = weights[1];
        this.weights_h2_output = weights[2];

        this.bias_h1 = biases[0];
        this.bias_h2 = biases[1];
        this.bias_output = biases[2]

    }
}
