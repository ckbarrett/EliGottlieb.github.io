/*
let states = [
    dangerStates:
    danger up, danger down, 
    danger left, danger right

    directionStates:
    direction up, direction down
    direction left, direciton right,

    foodStates:
    food up, food down
    food left, food right,
]

actions: 
let actions = [up, down, left, right]
*/
let qLearningRate = 0.85;
let qDiscountFactor = 0.9;

class QLearner {
    constructor() {
        this.brain = new Network(12, 16, 16, 4);
        this.snake = null;
        this.apple = null;
        this.availableActions = ['up', 'down', 'left', 'right'];
        this.d = {}
        this.states = {}
        this.randomize = 1;
    }

    getCurrentState() {
        // Get direction of snake
        let xDir = this.snake.xDir[this.snake.xDir.length - 1];
        let yDir = this.snake.yDir[this.snake.yDir.length - 1];
        let directionStates = []
        if (xDir != 0) {
            if (xDir == 1) {
                // Snake going right
                directionStates = [0, 0, 0, 1];
            } else {
                // Snake going left
                directionStates = [0, 0, 1, 0];
            }
        } else {
            if (yDir == 1) {
                // Snake going down
                directionStates = [0, 1, 0, 0];
            } else {
                // Snake going up
                directionStates = [1, 0, 0, 0];
            }
        }

        // Get position of fruit relative to head
        var head = this.snake.head;
        var food = this.apple.square;
        var foodLeft = 0;
        var foodRight = 0;
        var foodUp = 0;
        var foodDown = 0;
        if (food.x < head.x) {
            foodLeft = 1;
        } else if (food.x > head.x) {
            foodRight = 1;
        }
        if (food.y < head.y) {
            foodUp = 1;
        } else if (food.y > head.y) {
            foodDown = 1;
        }
        let foodStates = [foodUp, foodDown, foodLeft, foodRight];

        // Get danger to snake
        var dangerUp = 0;
        var dangerDown = 0;
        var dangerLeft = 0;
        var dangerRight = 0;
        // Check near walls
        if (head.x == 0) dangerLeft = 1;
        if (head.y == 0) dangerUp = 1;
        if (onRightEdge()) dangerRight = 1;
        if (onBottomEdge()) dangerDown = 1;
        // Check near itself
        for (let index in this.snake.squares) {
            let squ = this.snake.squares[index]
            if (((head.x - squareWidth - xOffset) == squ.x) && (head.y == squ.y)) {
                dangerLeft = 1;
            }
            if (((head.x + squareWidth + xOffset) == squ.x) && (head.y == squ.y)) {
                dangerRight = 1;
            }
            if (((head.y + squareWidth + yOffset) == squ.y) && (head.x == squ.x)) {
                dangerDown = 1;
            }
            if (((head.y - squareWidth - yOffset) == squ.y) && (head.x == squ.x)) {
                dangerUp = 1;
            }

        }
        let dangerStates = [dangerUp, dangerDown, dangerLeft, dangerRight];
        return new State(dangerStates, directionStates, foodStates);
    }

    bestAction(state) {
        // Forbid the snake from turning around 
        let badActionIndex;
        let availableActions = []
        if (state.directionStates[0] == 1) {
            badActionIndex = 1;
        } else if (state.directionStates[1] == 1) {
            badActionIndex = 0;
        } else if (state.directionStates[2] == 1) {
            badActionIndex = 3;
        } else if (state.directionStates[3] == 1) {
            badActionIndex = 2;
        }
        for (let i = 0; i < this.availableActions.length; i++) {
            if (i == badActionIndex) continue;
            availableActions.push(this.availableActions[i]);
        }
        // End forbidding junky code

        // Choose a random direction sometimes
        if (Math.random() < this.randomize) {
            let random = Math.floor(Math.random() * (availableActions.length + 1));
            return availableActions[random];
        }

        //q becomes brain.predict() 
        let outputs = this.brain.predict(state.toArray())

        var m = outputs[0]
        var index = 0;
        for (let i = 1; i < outputs.length; i++) {
            if (outputs[i] > m) {
                index = i
                m = outputs[i]
            }
        }
        if (index == 0) {
            return "up"
        }
        if (index == 1) {
            return "down"
        }
        if (index == 2) {
            return "left"
        }
        return "right"
    }

    updateBrain(state0, state1, reward, act, done) {
        let newValue;
        if (done) {
            newValue = reward;
        } else {
            newValue = reward + qDiscountFactor * max(this.brain.predict(state1.toArray())) - max(this.brain.predict(state0.toArray()));
        }
        let newQ = (1 - qLearningRate) * max(this.brain.predict(state0.toArray())) + qLearningRate * newValue;
        this.updateD(state0, newQ, act)

        /*
        let outputs = this.brain.predict(state0.toArary())
        if(act == "up") {
            outputs[0] = newQ
        } else if(act == "down"){
            outputs[1] = newQ
        } else if(act == "left"){
            outputs[2] = newQ
        } else {
            outputs[3] = newQ
        }
        //console.log(outputs)
        this.brain.train(state0.toArary(), outputs)
        */
    }

    updateD(state, newQ, act) {
        let stateString = state.toString()
        this.states[stateString] = state
        let index = 0;
        if (act == "up") {
            index = 0;
        } else if (act == "down") {
            index = 1
        } else if (act == "left") {
            index = 2
        } else {
            index = 3
        }
        let entry = this.d[stateString]
        if (entry != null) {
            entry[index] = (entry[index] + newQ) / 2.0
            this.d[stateString] = entry
        }
        else {
            entry = [0,0,0,0]
            entry[index] = newQ
            this.d[stateString] = entry
        }
        console.log(Object.keys(this.d).length)
        if (Object.keys(this.d).length > 69) {
            for (let i = 0; i < Object.keys(this.d).length; i++) {
                let tempkey = Object.keys(this.d)[i]
                let tempstate = this.states[tempkey].toArray()
                let qvals = this.d[tempkey]
                console.log(tempstate)
                console.log(qvals)
                this.brain.train(tempstate, qvals)
            }
            console.log("Training")
            this.d = {}
            this.randomize -= 0.1
        }
    }

    max(arr) {
        let max = arr[0]
        for (let i = 1; i < arr.length; i++) {
            if (max < arr[i]) {
                max = arr[i]
            }
        }
        return max
    }
}

class State {
    constructor(dangerStates, directionStates, foodStates) {
        this.dangerStates = dangerStates;
        this.directionStates = directionStates;
        this.foodStates = foodStates;
    }
    toArray() {
        let arr = []
        for (let i = 0; i < this.dangerStates.length; i++) {
            arr.push(this.dangerStates[i])
        }
        for (let i = 0; i < this.directionStates.length; i++) {
            arr.push(this.directionStates[i])
        }
        for (let i = 0; i < this.foodStates.length; i++) {
            arr.push(this.foodStates[i])
        }
        return arr
    }
    toString() {
        let state = ""
        for (let i = 0; i < this.dangerStates.length; i++) {
            state += this.dangerStates[i] + ","
        }
        for (let i = 0; i < this.directionStates.length; i++) {
            state += this.directionStates[i] + ","
        }
        for (let i = 0; i < this.foodStates.length; i++) {
            state += this.foodStates[i] + ","
        }
        return state;
    }
}