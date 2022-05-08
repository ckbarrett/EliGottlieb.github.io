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

        this.learningrate = 0.1;
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

        let targets = Matrix.fromArray(target_array);
        
        // Calculater error matrix as targets - outputs
        let output_errs = Matrix.subtract(targets, outputs)

        //find gradient of outputs by mapping derivative of sigmoid
        let ouput_gradients = Matrix.map(outputs, dsigmoid);
        output_gradients.multiply(output_errs);
        output_gradients.multiply(this.learningrate)


    }
}
