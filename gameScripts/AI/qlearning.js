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
let randomize = 0.05;

class QLearner {
    constructor() {
        this.qTable = {};
        this.snake = null;
        this.apple = null;
        this.availableActions = ['up', 'down', 'left', 'right'];
    }
    getCurrentState() {
        // Get direction of snake
        
        let xDir = this.snake.xDir[this.snake.xDir.length - 1];
        let yDir = this.snake.yDir[this.snake.yDir.length - 1];
        let directionStates = []
        if(xDir != 0) {
            if(xDir == 1) {
                // Snake going right
                directionStates = [0,0,0,1];
            } else {
                // Snake going left
                directionStates = [0,0,1,0];
            }
        } else {
            if(yDir == 1) {
                // Snake going down
                directionStates = [0,1,0,0];
            } else {
                // Snake going up
                directionStates = [1,0,0,0];
            }
        }

        // Get position of fruit relative to head
        let head = this.snake.head;
        let food = this.apple.square;
        var foodLeft = 0;
        var foodRight = 0;
        var foodUp = 0;
        var foodDown = 0;
        if(food.x < head.x) {
            foodLeft = 1;
        } else if(food.x > head.x) {
            foodRight = 1;
        }
        if(food.y < head.y) {
            foodUp = 1;
        } else if(food.y > head.y){
            foodDown = 1;
        }
        let foodStates = [foodUp, foodDown, foodLeft, foodRight];
        
        // Get danger to snake
        var dangerUp = 0;
        var dangerDown = 0;
        var dangerLeft = 0;
        var dangerRight = 0;
        // Check near walls
        if(head.x == 0) dangerLeft = 1;
        if(head.y == 0) dangerUp = 1;
        if(onRightEdge()) dangerRight = 1;
        if(onBottomEdge()) dangerDown = 1;
        // Check near itself
        for(sq in this.snake.squares){
            if(((head.x - squareWidth - xOffset) == sq.x) &&
                head.y == sq.y) dangerLeft = 1;
            else if(((head.x + squareWidth + xOffset) == sq.x) &&
                head.y == sq.y) dangerRight = 1;
            else if(((head.y + squareWidth + yOffset) == sq.y) &&
                head.x == sq.x) dangerDown = 1;      
            else if(((head.y - squareWidth - yOffset) == sq.y) &&
                head.x == sq.x) dangerUp = 1;  
        }
        let dangerStates = [dangerUp, dangerDown, dangerLeft, dangerRight];
        return new State(dangerStates, directionStates, foodStates);
    }
    whichTable(state) {
        let stateString = state.toString();
        if(this.qTable[stateString] == undefined) {
            this.qTable[stateString] = {'up':0,'down':0,'left':0,'right':0}
        }
        return this.qTable[stateString];
    }

    bestAction(state) {
        // Forbid the snake from turning around 
        let badActionIndex;
        let availableActions = []
        if(state.directionStates[0] == 1){
            badActionIndex = 1;
        } else if(state.directionStates[1] == 1){
            badActionIndex = 0;
        } else if(state.directionStates[2] == 1){
            badActionIndex = 3;
        } else if(state.directionStates[3] == 1){
            badActionIndex = 2;
        }
        for(let i = 0; i < this.availableActions.length; i++){
            if(i == badActionIndex) continue;
            availableActions.push(this.availableActions[i]);
        }
        // End forbidding junky code

        // Choose a random direction sometimes
        if(Math.random() < randomize) {
            let random = Math.floor(Math.random() * (availableActions.length + 1));
            return availableActions[random];
        }

        let q = this.whichTable(state.toString());
        let maxValue = q[availableActions[0]];
        let choseAction = availableActions[0];
        let actionsZero = [];
        for(let i = 0; i < availableActions.length; i++) {
            if(q[availableActions[i]] == 0) actionsZero.push(availableActions[i]);
            if(q[availableActions[i]] > maxValue) {
                maxValue = q[availableActions[i]];
                choseAction = availableActions[i];
            }
        }

        if(maxValue == 0){
            let random = Math.floor(Math.random() * (actionsZero.length + 1));
            choseAction = actionsZero[random];
          }
      
        return choseAction;
    }
    updateQTable(state0, state1, reward, act) {
        var q0 = this.whichTable(state0);
        var q1 = this.whichTable(state1);

        var newValue = reward + qDiscountFactor * Math.max(q1.up, q1.down, q1.left, q1.right) - q0[act];
        this.qTable[state0][act] = q0[act] + qLearningRate * newValue;
    }
}

class State {
    constructor(dangerStates, directionStates, foodStates) {
        this.dangerStates = dangerStates;
        this.directionStates = directionStates;
        this.foodStates = foodStates;
    }
    toString(){
        let state = ""
        for(let val in this.dangerStates){
            state += val + ","
        }
        for(let val in this.directionStates){
            state += val + ","
        }
        for(let val in this.foodStates){
            state += val + ","
        }
        return state;
    }
}