function sigmoid(z) {  
    return 1 / (1 + Math.exp(-z));
  }
function dsigmoid(y) {
    return y * (1 - y)
}