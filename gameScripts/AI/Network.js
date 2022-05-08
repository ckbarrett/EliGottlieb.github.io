

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

        this.learningrate = 0.2;
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
        // Calculate raw hidden1 activation
        let inputs = Matrix.fromArray(input_array);
        let targets = Matrix.fromArray(target_array);

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

        
        // Calculater error matrix as targets - outputs
        let errs = Matrix.subtract(targets, outputs)
        let layers = [inputs, hidden1, hidden2, outputs]
        let weights = [this.weights_input_h1, this.weights_h1_h2, this.weights_h2_output]
        let biases = [this.bias_h1, this.bias_h2, this.bias_output]

        for (let i = layers.length - 1; i > 0; i--){
            let currentLayer = layers[i];
            let previousLayer = layers[i-1];
            let gapIndex = i-1;
            let currentWeights = weights[gapIndex];
            let currentBiases = biases[gapIndex];

            let currentLayer_gradients = Matrix.map(currentLayer, dligmoid);
            currentLayer_gradients.multiply(errs);
            currentLayer_gradients.multiply(this.learningrate);

            let previousLayer_T = Matrix.transpose(previousLayer);
            let weight_deltas = Matrix.multiply(currentLayer_gradients, previousLayer_T);

            weights[gapIndex] = currentWeights.add(weight_deltas);
            biases[gapIndex] = currentBiases.add(currentLayer_gradients);

            let currentWeights_T = Matrix.transpose(currentWeights)
            errs = Matrix.multiply(currentWeights_T, errs)
        }
        this.weights_input_h1 = weights[0];
        this.weights_h1_h2 = weights[1];
        this.weights_h2_output = weights[2];

        this.bias_h1 = biases[0];
        this.bias_h2 = biases[1];
        this.bias_output = biases[2];
    }
}
