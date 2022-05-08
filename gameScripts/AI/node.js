class Node {
    constructor(numInLayer, predecesors, weights, bias) {
        this.numInLayer = numInLayer;
        this.predecesors = predecesors;
        this.weights = weights;
        this.bias = bias;
        this.value = null;
    }
    calculateValue(){
        let sum = 0;
        for(let i = 0; i < this.predecesors.length; i++){
            sum += this.predecesors[i].value * this.predecesors[i].weights[numInLayer];
        }
        sum += this.bias;
        return sigmoid(sum); 
    }
}