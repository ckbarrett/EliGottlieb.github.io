var squareWidth = 20;
var xOffset = 5;
var yOffset = 5;
var fr;
var realsnake;
var apple;
var gameOver = false;
var inputUsed = false;
var userInput = true;
var score = 0;
var userhighscore = 0;
var genCount = 1;
var randomize_slider;
var speed_slider;

var set1 = []
var set2 = []
var set3 = []
var set4 = []

var appleReward = 10
var deathReward = -10
var safeReward = 0
var training = 0;
var sets = 0;
var hiddenLayerSize = 60;
var qlearner;
var contGraph;
var slider_div

///////////////// Util Functions /////////////////////
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
///////////////// End Util Functions /////////////////////////////////////////

//////////////// P5 Functions /////////////////////////////////////////////////
function setup() {
  setButtons()
  createSliders()
  if (userInput) {
    highscore = 0;
    document.getElementById("highscore").innerText = highscore
    slider_div.style("display", "none")
    document.getElementById("jimmyinfo").style.display = "none"
    frameRate(30)
  }
  else {
    // Set headers from storage
    document.getElementById("hidegraph").style.display = "none"
    document.getElementById("highscore").innerText = parseInt(window.localStorage.getItem("highscore"))
    document.getElementById("set-counter").innerText = "- Sets: " + parseInt(window.localStorage.getItem("sets"))
    document.getElementById("training-counter").innerText = "- Training: " + parseInt(window.localStorage.getItem("training"))

    // Create qlearner and set brain to brain informaiton saved in storage
    qlearner = new QLearner(realsnake, apple);
    downloadBrain()
  }

  // Create canvas
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
    // Check if eating apple
    checkEatingApple(realsnake, false)
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
    document.getElementById("generation-counter").innerText = "Jimmy's: " + globalgencount;
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

function windowResized() {
  let dimensions = calculateCanvasSize();
  resizeCanvas(dimensions.canvasWidth, dimensions.canvasHeight);
  background(255);
  drawSnakeComplete();
  apple.square = apple.getRandomSquare();
  drawSquare(apple.square, color(255, 0, 0));
}

function keyPressed() {
  if (!userInput || gameOver) return;
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