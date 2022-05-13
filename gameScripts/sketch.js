//One snake that is visable and moving
//One snake to test everything the realsnake doesnt do?
let squareWidth = 20;
let xOffset = 5;
let yOffset = 5;
let fr;
var realsnake;
let apple;
var gameOver = false;
let inputUsed = false;
let userInput = false;
var score = 0;
let userhighscore = 0;
let genCount = 1;
let randomize_slider;
let speed_slider;

var set1 = []
var set2 = []
var set3 = []
var set4 = []

var appleReward = 10
var deathReward = -10
var safeReward = 0
var training = 0;
var sets = 0;
var hiddenLayerSize = 24;
var qlearner;

///////////////// Util Functions ///////////////////////
// Hard reset storage to restart the learning processes
function resetJimmy() {
  console.log("Jimmy has been wiped.")
  // Wipe storage 
  window.localStorage.setItem("age", 0)
  window.localStorage.setItem("highscore", 0)
  window.localStorage.setItem("training", 0)
  window.localStorage.setItem("sets", 0)

  // Reset HTML elements
  document.getElementById("training-counter").innerText = "- Trained: " + 0;
  document.getElementById("set-counter").innerText = "- Sets: " + 0;
  document.getElementById("highscore").innerText = 0;
  document.getElementById("generation-counter").innerText = "- Jimmy's: " + 0;

  // Create new brain and overwrite old brain
  qlearner.brain = new Network(13, hiddenLayerSize, hiddenLayerSize, 4);
  uploadBrain()
  restartGame()
}

// Create graph in HTML
function graph() {
  trialmarkers = []
  for (let i = 0; i < set1.length; i++) {
    trialmarkers.push(i)
  }
  Plotly.newPlot("myDiv", [{ x: trialmarkers, y: set1 }, { x: trialmarkers, y: set2 }, { x: trialmarkers, y: set3 }, { x: trialmarkers, y: set4 }])
  document.getElementById("myDiv").style.display = "block";
  document.getElementById("hidegraph").style.visibility = "visible";
  console.log("graphed")
}

function hidegraph() {
  document.getElementById("myDiv").style.display = "none";
  document.getElementById("hidegraph").style.visibility = "hidden"
  document.getElementById("graph").style.visibility = "visible";
}

function drawSquare(square, clr) {
  fill(clr);
  noStroke();
  rect(square.x, square.y, square.width, square.width);
}

function drawRect(x, y, w, h, clr) {
  fill(clr);
  noStroke();
  rect(x, y, w, h);
}

function drawSnake() {
  drawSquare(realsnake.oldTail, color(255, 255, 255));
  drawOffset(realsnake.oldTail, realsnake.oldTailxDir, realsnake.oldTailyDir, color(255, 255, 255));
  drawSquare(realsnake.head, color(0, 255, 0));
  drawOffset(realsnake.squares[realsnake.squares.length - 2], realsnake.xDir[realsnake.xDir.length - 2], realsnake.yDir[realsnake.yDir.length - 2], color(0, 255, 0));
}

function drawSnakeComplete() {
  // Draw Squares
  for (let i = 0; i < realsnake.squares.length; i++) {
    let tempsq = realsnake.squares[i];
    drawSquare(tempsq, color(0, 255, 0));
  }
  // Fill offsets
  for (let i = 0; i < realsnake.squares.length - 1; i++) {
    drawOffset(realsnake.squares[i], realsnake.xDir[i], realsnake.yDir[i], color(0, 255, 0));
  }
}

function drawOffset(sq, xDir, yDir, clr) {
  if (xDir != 0) {
    if (xDir == -1) {
      // This square going left
      drawRect(sq.x - xOffset, sq.y, xOffset, squareWidth, clr);
    } else {
      // This square going right
      drawRect(sq.x + squareWidth, sq.y, xOffset, squareWidth, clr);
    }
  } else {
    if (yDir == -1) {
      // This square going up
      drawRect(sq.x, sq.y - yOffset, squareWidth, yOffset, clr);
    } else {
      // This square going down
      drawRect(sq.x, sq.y + squareWidth, squareWidth, yOffset, clr);
    }
  }
}

function drawPlayAgainButton() {
  let playAgainRectWidth = 200;
  let playAgainRectHeight = 50;
  let playAgainx = (width - playAgainRectWidth) / 2;
  let playAgainy = (height - playAgainRectHeight) / 2;
  fill(color(255, 0, 0));
  stroke(0);
  strokeWeight(4);
  rect(playAgainx, playAgainy, playAgainRectWidth, playAgainRectHeight);
  textSize(32);
  fill(0);
  text('Play Again', playAgainx + 25, playAgainy + 35);
}

function checkCollisions(sn) {
  let gO = false;
  let xtile = (squareWidth + xOffset);
  let ytile = (squareWidth + yOffset);
  // Define collisions
  let hitRightWall = ((sn.head.x + squareWidth + xtile > width) && (sn.xDir[sn.xDir.length - 1] == 1))
  let hitLeftWall = ((sn.head.x - xtile < 0) && (sn.xDir[sn.xDir.length - 1] == -1))
  let hitBottomWall = ((sn.head.y + squareWidth + ytile > height) && (sn.yDir[sn.yDir.length - 1] == 1))
  let hitTopWall = ((sn.head.y - ytile < 0) && (sn.yDir[sn.yDir.length - 1] == -1))
  let hittingSelf = false;
  for (let i = 0; i < sn.squares.length - 1; i++) {
    let tempsq = sn.squares[i];
    if ((tempsq.x == sn.head.x) && (tempsq.y == sn.head.y)) {
      hittingSelf = true;
      break;
    }
  }
  if (hitRightWall || hitLeftWall || hitBottomWall || hitTopWall || hittingSelf) {
    gO = true;
  }
  gameOver = gO
}

function checkEatingApple(sn, sim) {
  if ((sn.head.x == apple.square.x) && (sn.head.y == apple.square.y)) {
    if (sim) {
      return true;
    }
    sn.squares.unshift(new Square(sn.oldTail.x, sn.oldTail.y, squareWidth))
    sn.xDir.unshift(sn.oldTailxDir);
    sn.yDir.unshift(sn.oldTailyDir);
    apple.square = apple.getRandomSquare();
    drawSquare(apple.square, color(255, 0, 0));
    score++;
    document.getElementById("score-counter").innerText = score;
    if (userInput) {
      if (score > highscore) {
        highscore = score
        document.getElementById("highscore").innerText = score;
      }
    }
    if (score > parseInt(window.localStorage.getItem("highscore"))) {
      window.localStorage.setItem("highscore", score)
      document.getElementById("highscore").innerText = score;
    }
    return true;
  }
  return false;
}

function calculateCanvasSize() {
  // Extra width and height will be split automatically when canvas is centered
  let extraWidth = (window.innerWidth % (xOffset + squareWidth)) + xOffset;
  let canvasWidth = window.innerWidth - extraWidth;
  let extraHeightBuffer = 3 * (squareWidth + yOffset);
  let extraHeight = (window.innerHeight % (yOffset + squareWidth)) + yOffset + extraHeightBuffer;
  let canvasHeight = window.innerHeight - extraHeight;
  return { canvasWidth, canvasHeight };
}

function snakeContains(x, y) {
  for (let i = 0; i < realsnake.squares.length; i++) {
    let tempsq = realsnake.squares[i];
    if (tempsq.x == x && tempsq.y == y) return true;
  }
  return false;
}

// Set elements in storage to corresponding brain attributes
function uploadBrain() {
  window.localStorage.setItem("bias_h1", JSON.stringify(qlearner.brain.bias_h1.data))
  window.localStorage.setItem("bias_h2", JSON.stringify(qlearner.brain.bias_h2.data))
  window.localStorage.setItem("bias_output", JSON.stringify(qlearner.brain.bias_output.data))
  window.localStorage.setItem("weights_input_h1", JSON.stringify(qlearner.brain.weights_input_h1.data))
  window.localStorage.setItem("weights_h1_h2", JSON.stringify(qlearner.brain.weights_h1_h2.data))
  window.localStorage.setItem("weights_h2_output", JSON.stringify(qlearner.brain.weights_h2_output.data))
}

// Set attributes of brain to elements in storage
function downloadBrain() {
  qlearner.brain.bias_h1.data = JSON.parse(window.localStorage.getItem("bias_h1"))
  qlearner.brain.bias_h2.data = JSON.parse(window.localStorage.getItem("bias_h2"))
  qlearner.brain.bias_output.data = JSON.parse(window.localStorage.getItem("bias_output"))
  qlearner.brain.weights_input_h1.data = JSON.parse(window.localStorage.getItem("weights_input_h1"))
  qlearner.brain.weights_h1_h2.data = JSON.parse(window.localStorage.getItem("weights_h1_h2"))
  qlearner.brain.weights_h2_output.data = JSON.parse(window.localStorage.getItem("weights_h2_output"))
}

// Restart game but do not hard reset learning process
function restartGame() {
  realsnake = new Snake();
  apple = new Apple();
  if (!userInput) {
    savedsnake = new Snake();
    // Reset snake and apple
    qlearner.snake = realsnake;
    qlearner.apple = apple;
    // Update generation counter in storage and HTML element
    let globalgencount = parseInt(window.localStorage.getItem("age"))
    globalgencount++;
    window.localStorage.setItem("age", globalgencount)
    document.getElementById("generation-counter").innerText = "- Jimmy's: " + globalgencount;
    // Upload brain to save on death
    uploadBrain()
  }
  // Reset score to 0
  resetscore = 0;
  score = resetscore
  document.getElementById("score-counter").innerText = resetscore;
  background(255);
  drawSnakeComplete();
  drawSquare(apple.square, color(255, 0, 0));
  gameOver = false;
}

function goUp(sn) {
  sn.xDir[sn.xDir.length - 1] = 0;
  sn.yDir[sn.yDir.length - 1] = -1;
}
function goDown(sn) {
  sn.xDir[sn.xDir.length - 1] = 0;
  sn.yDir[sn.yDir.length - 1] = 1;
}
function goLeft(sn) {
  sn.xDir[sn.xDir.length - 1] = -1;
  sn.yDir[sn.yDir.length - 1] = 0;
}
function goRight(sn) {
  sn.xDir[sn.xDir.length - 1] = 1;
  sn.yDir[sn.yDir.length - 1] = 0;
}
function doAction(action, sn) {
  switch (action) {
    case 'up':
      goUp(sn);
      break;
    case 'down':
      goDown(sn);
      break;
    case 'left':
      goLeft(sn);
      break;
    case 'right':
      goRight(sn);
      break;
  }
}

function onRightEdge() {
  if (realsnake.head.x + squareWidth >= width) return true;
  else return false;
}
function onBottomEdge() {
  if (realsnake.head.y + squareWidth >= height) return true;
  else return false;
}

function createSliders() {
  // Create outside div
  let slider_div = createDiv();
  slider_div.elt.style.display = "flex"
  // Create randomness label
  randomize_label = createSpan('Randomness: ');
  randomize_label.parent(slider_div);
  randomize_label.elt.style.flex = "1"
  // Create randomness slider
  randomize_slider = createSlider(0, 1, 0, .1)
  randomize_slider.parent(slider_div)
  randomize_slider.elt.style.flex = "1"
  randomize_slider.elt.style.marginRight = "20px"
  // Create framerate label
  framerate_label = createSpan('Framerate: ');
  framerate_label.parent(slider_div)
  framerate_label.elt.style.flex = "1"
  // Create framerate slider
  framerate_slider = createSlider(1, 60, 60, 1)
  framerate_slider.parent(slider_div)
  framerate_slider.elt.style.flex = "1"
}

///////////////// End Util Functions /////////////////////////////////////////


///////////////// XOR Example ////////////////////////////////////////////////
var errors = []
var trialmarkers = []
var deltas = []

let training_data = [{
  inputs: [0, 0],
  outputs: [0]
},
{
  inputs: [0, 1],
  outputs: [1]
},
{
  inputs: [1, 0],
  outputs: [1]
},
{
  inputs: [1, 1],
  outputs: [0]
}];

/*
n = new Network(2, 32, 32, 1)
for (let i = 0; i < 1000; i++) {
  let data = random(training_data);
  n.train(data.inputs, data.outputs);
  trialmarkers.push(i)
}
 
//{x: trialmarkers, y: errors}, 
//{x: trialmarkers, y: deltas}
Plotly.newPlot('myDiv', [{x: trialmarkers, y: errors}])
console.log(n.predict([1, 0]));
console.log(n.predict([0, 1]));
console.log(n.predict([1, 1]));
console.log(n.predict([0, 0]));
*/

//////////////// P5 Functions /////////////////////////////////////////////////
function setup() {
  if (userInput) {
    highscore = 0;
    document.getElementById("highscore").innerText = highscore
    document.getElementById("reset").style.visibility = "hidden"
    document.getElementById("graph").style.visibility = "hidden"
    document.getElementById("hidegraph").style.visibility = "hidden"
    frameRate(30)
  }
  else {
    // Create labels and sliders for randomness and framerate
    randomize_label = createDiv('Randomness');
    randomize_slider = createSlider(0, 1, 0, .1)
    randomize_slider.parent(randomize_label)
    framerate_label = createDiv('Framerate');
    framerate_slider = createSlider(1, 60, 60, 1)
    framerate_slider.parent(framerate_label)
    frameRate(framerate_slider.value());

    // Set headers from storage
    document.getElementById("hidegraph").style.visibility = "hidden"
    document.getElementById("highscore").innerText = parseInt(window.localStorage.getItem("highscore"))
    document.getElementById("set-counter").innerText = "- Sets: " + parseInt(window.localStorage.getItem("sets"))
    document.getElementById("training-counter").innerText = "- Training: " + parseInt(window.localStorage.getItem("training"))

    // Create qlearner and set brain to brain informaiton saved in storage
    qlearner = new QLearner(realsnake, apple);
    downloadBrain()

    // Create event listeners for clicking buttons
    document.getElementById("reset").onclick = resetJimmy
    document.getElementById("graph").onclick = graph
    document.getElementById("hidegraph").onclick = hidegraph
  }

  // Create canvas and set framerate
  let dimensions = calculateCanvasSize();
  createCanvas(dimensions.canvasWidth, dimensions.canvasHeight);
  restartGame();
}

function draw() {
  if (!userInput) {
    // initialize and read slider values
    let oldState = null;
    let bestaction = null;
    frameRate(framerate_slider.value())
    qlearner.randomize = randomize_slider.value()

    // Prepare to simulate and initialize move information
    oldState = qlearner.getCurrentState();
    var actionList = ['up', 'down', 'left', 'right']
    var rewardList = [safeReward, safeReward, safeReward, safeReward]
    var newstates = [0, 0, 0, 0]
    var dones = [false, false, false, false]
    var savedsnake;
    for (let i = 0; i < actionList.length; i++) {
      // Copy realsnake into savedsnake in order to simulate moves with savedsnake
      // Set qlearner's snake to savedsnake to get the state after actions are performed
      savedsnake = Snake.copy(realsnake)
      qlearner.snake = savedsnake

      // Calculate reward and dones for actionList[i]
      // doAction calls the corresponding goUp, goDown, goLeft, goRight which changes savedsnake's attributes
      doAction(actionList[i], savedsnake)

      // checkEatingApple will not move the apple if true because the second parameter represents a simulated move
      if (checkEatingApple(savedsnake, true)) {
        rewardList[i] = appleReward
      }

      // checkCollisions
      if (actionList[i] == 'up' && oldState.toArray()[0] == 1) {
        rewardList[i] = deathReward
        dones[i] = true
      }
      else if (actionList[i] == 'down' && oldState.toArray()[1] == 1) {
        rewardList[i] = deathReward
        dones[i] = true
      }
      else if (actionList[i] == 'left' && oldState.toArray()[2] == 1) {
        rewardList[i] = deathReward
        dones[i] = true
      }
      else if (actionList[i] == 'right' && oldState.toArray()[3] == 1) {
        rewardList[i] = deathReward
        dones[i] = true
      }
      savedsnake.move()
      newstates[i] = qlearner.getCurrentState()

      // Reward moving closer to apple
      let distanceIndex = 12;
      if (newstates[i].toArray()[distanceIndex] < oldState.toArray()[distanceIndex]) {
        rewardList[i]++;
      }
    }

    // Reset qlearner's snake to realsnake 
    qlearner.snake = realsnake

    // Get best action and do the action
    bestaction = qlearner.bestAction(oldState);
    doAction(bestaction, realsnake);
    checkEatingApple(realsnake, false)
    qlearner.updateBrain(oldState, newstates, rewardList, dones);
    checkCollisions(realsnake, false)
    if (gameOver) {
      genCount++;
      restartGame();
      return;
    }
    realsnake.move();
    drawSnake();
    inputUsed = false;
  }
  else {
    // Check if eating apple to update score. Reward does not need to be updated as all possible rewards for moves have already been calculated
    checkEatingApple(realsnake, false)

    // Update qlearner's brain
    // Check for collisions and end game
    checkCollisions(realsnake, false)
    if (gameOver) {
      drawPlayAgainButton();
      return;
    }

    // Update the game
    realsnake.move()
    drawSnake();
    inputUsed = false;
  }
}

function windowResized() {
  let dimensions = calculateCanvasSize();
  resizeCanvas(dimensions.canvasWidth, dimensions.canvasHeight);
  background(255);
  drawSnakeComplete();
  apple.square = apple.getRandomSquare();
  drawSquare(apple.square, color(255, 0, 0));
}

function keyPressed() {
  if (!userInput) return;
  switch (keyCode) {
    case UP_ARROW:
      if ((realsnake.yDir[realsnake.yDir.length - 1] != 0) || inputUsed) break;
      goUp(realsnake);
      inputUsed = true;
      break;
    case DOWN_ARROW:
      if ((realsnake.yDir[realsnake.yDir.length - 1] != 0) || inputUsed) break;
      goDown(realsnake);
      inputUsed = true;
      break;
    case LEFT_ARROW:
      if ((realsnake.xDir[realsnake.xDir.length - 1] != 0) || inputUsed) break;
      goLeft(realsnake);
      inputUsed = true;
      break;
    case RIGHT_ARROW:
      if ((realsnake.xDir[realsnake.xDir.length - 1] != 0) || inputUsed) break;
      goRight(realsnake);
      inputUsed = true;
      break;
  }
}

function mouseReleased() {
  if (gameOver) {
    let playAgainRectWidth = 200;
    let playAgainRectHeight = 50;
    let playAgainx = (width - playAgainRectWidth) / 2;
    let playAgainy = (height - playAgainRectHeight) / 2;
    if ((mouseX >= playAgainx) && (mouseX <= (playAgainx + playAgainRectWidth)) &&
      (mouseY >= playAgainy) && (mouseY <= (playAgainy + playAgainRectHeight))) {
      restartGame();
    }
  }
}
///////////////////////// End P5 Functions ///////////////////////////