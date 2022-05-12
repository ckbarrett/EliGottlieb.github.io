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
let qLearningRate = 0.9;
let qDiscountFactor = 0.85;

class QLearner {
    constructor(sn, apple) {
        this.brain = new Network(13, 24, 24, 4);
        this.snake = sn;
        this.apple = apple;
        this.availableActions = ['up', 'down', 'left', 'right'];
        this.d = {}
        this.states = {}
        this.randomize = 1;
        this.moves = 0;
    }
    setSnake(sn) {
        this.snake = sn
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
        var distance = 0;
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
        distance = sigmoid(Math.sqrt(Math.pow(food.x - head.x, 2) + Math.pow(food.y - head.y, 2))/1000.0)
        let foodStates = [foodUp, foodDown, foodLeft, foodRight, distance];

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
        for (let i = 0; i < this.snake.squares.length; i++) {
            let squ = this.snake.squares[i]
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
        this.moves++;
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
        console.log("Prediction: ");
        console.log(outputs);
        var m = outputs[0]
        var index = 0;
        for (let i = 1; i < outputs.length; i++) {
            if (outputs[i] > m) {
                index = i
                m = outputs[i]
            }
        }
        if (index == 0) {
            return 'up'
        }
        if (index == 1) {
            return 'down'
        }
        if (index == 2) {
            return 'left'
        }
        return 'right'
    }

    updateBrain(state0, futurestates, futurerewards, dones) {
        let newQs = []
        for (let i = 0; i < futurestates.length; i++) {
            let newValue;
            if (dones[i]) {
                newValue = futurerewards[i];
            } else {
                // newValue = reward + discount factor * estimate of optimal future value - old q value
                // newValue = reward for going a direction + discount factor * estimate of optimal future value after going that direction - current q value of going that direction 
                newValue = futurerewards[i] + qDiscountFactor * max(this.brain.predict(futurestates[i].toArray())) - max(this.brain.predict(state0.toArray()));
            }
            newQs.push(sigmoid(max(this.brain.predict(state0.toArray())) + qLearningRate * newValue));
        }
        this.updateD(state0, newQs)
    }

    updateD(state, newQs) {
        let stateString = state.toString()
        this.states[stateString] = state
        let entry = this.d[stateString]
        if (entry != null) {
            for (let i = 0; i < entry.length; i++) {
                if (entry[i] != 0)
                    entry[i] = (entry[i] + newQs[i]) / 2.0
                else
                    entry[i] = newQs[i]
            }
            this.d[stateString] = entry
        }
        else {
            entry = newQs
            this.d[stateString] = entry
        }
        //console.log(Object.keys(this.d).length)
        if (Object.keys(this.d).length > 60 || this.moves > 250) {
            console.log("-------------------Training-------------------")
            training++;
            sets+=Object.keys(this.d).length
            document.getElementById("training-counter").innerText = "- Trained: " + training;
            document.getElementById("set-counter").innerText = "- Sets: " + sets
            for (let i = 0; i < Object.keys(this.d).length; i++) {
                let tempkey = Object.keys(this.d)[i]
                let tempstate = this.states[tempkey].toArray()
                let qvals = this.d[tempkey]
                this.brain.train(tempstate, qvals)
            }
            this.d = {}
            this.moves = 0;
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