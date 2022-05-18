function sigmoid(z) {
  if (z == -1)
    throw "ALSDFJASDLKFJ ASDLKFJ ASLDKFJASLDKFJASLDKFJ"
  return 1 / (1 + Math.exp(-z));
}
function dligmoid(y) {
  return y * (1 - y)
}

// Credit to https://www.javascripttutorial.net/javascript-queue/
class Queue {
  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }
  enqueue(element) {
    this.elements[this.tail] = element;
    this.tail++;
  }
  dequeue() {
    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;
    return item;
  }
  peek() {
    return this.elements[this.head];
  }
  length() {
    return this.tail - this.head;
  }
  isEmpty() {
    return this.length === 0;
  }
}
