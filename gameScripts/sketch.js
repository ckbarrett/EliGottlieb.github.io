let squareWidth = 30;
let xOffset = 5;
let yOffset = 5;
let fr;
let snake;
let apple;
var gameOver = false;
let inputUsed = false;
let userInput = true;
let score = 0;
let genCount = 1;

///////////////// Util Functions ///////////////////////
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
  drawSquare(snake.oldTail, color(255, 255, 255));
  drawOffset(snake.oldTail, snake.oldTailxDir, snake.oldTailyDir, color(255, 255, 255));
  drawSquare(snake.head, color(0, 255, 0));
  drawOffset(snake.squares[snake.squares.length - 2], snake.xDir[snake.xDir.length - 2],
    snake.yDir[snake.yDir.length - 2], color(0, 255, 0));
}

function drawSnakeComplete() {
  // Draw Squares
  for (let i = 0; i < snake.squares.length; i++) {
    let sq = snake.squares[i];
    drawSquare(sq, color(0, 255, 0));
  }
  // Fill offsets
  for (let i = 0; i < snake.squares.length - 1; i++) {
    drawOffset(snake.squares[i], snake.xDir[i], snake.yDir[i], color(0, 255, 0));
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

function checkCollisions() {
  let xtile = (squareWidth + xOffset);
  let ytile = (squareWidth + yOffset);
  // Define collisions
  let hitRightWall = (snake.head.x + squareWidth + xtile > width) &&
    (snake.xDir[snake.xDir.length - 1] == 1);
  let hitLeftWall = (snake.head.x - xtile < 0) && (snake.xDir[snake.xDir.length - 1] == -1);
  let hitBottomWall = (snake.head.y + squareWidth + ytile > height) &&
    (snake.yDir[snake.yDir.length - 1] == 1);
  let hitTopWall = (snake.head.y - ytile < 0) && (snake.yDir[snake.yDir.length - 1] == -1);
  let hittingSelf = false;
  for (let i = 0; i < snake.squares.length - 1; i++) {
    let sq = snake.squares[i];
    if ((sq.x == snake.head.x) && (sq.y == snake.head.y)) {
      hittingSelf = true;
      break;
    }
  }
  if (hitRightWall || hitLeftWall || hitBottomWall || hitTopWall || hittingSelf) {
    gameOver = true;
  }
}

function checkEatingApple() {
  if ((snake.head.x == apple.square.x) && (snake.head.y == apple.square.y)) {
    snake.squares.unshift(new Square(snake.oldTail.x, snake.oldTail.y, squareWidth))
    snake.xDir.unshift(snake.oldTailxDir);
    snake.yDir.unshift(snake.oldTailyDir);
    apple.square = apple.getRandomSquare();
    drawSquare(apple.square, color(255, 0, 0));
    score++;
    document.getElementById("score-counter").innerText = score;
  }
}

function calculateCanvasSize() {
  // Extra width and height will be split automatically when canvas is centered
  let extraWidth = (window.innerWidth % (xOffset + squareWidth)) + xOffset;
  let canvasWidth = window.innerWidth - extraWidth;
  let extraHeight = (window.innerHeight % (yOffset + squareWidth)) + yOffset;
  let canvasHeight = window.innerHeight - extraHeight;
  return { canvasWidth, canvasHeight };
}

function snakeContains(x, y) {
  for (let i = 0; i < snake.squares.length; i++) {
    let sq = snake.squares[i];
    if (sq.x == x && sq.y == y) return true;
  }
  return false;
}

function restartGame() {
  snake = new Snake();
  apple = new Apple();
  score = 0;
  document.getElementById("score-counter").innerText = score;
  background(255);
  drawSnakeComplete();
  drawSquare(apple.square, color(255, 0, 0));
  gameOver = false;
  if(!userInput) document.getElementById("generation-counter").innerText = "Generation: " + genCount;
}

function goUp() {
  snake.xDir[snake.xDir.length - 1] = 0;
  snake.yDir[snake.yDir.length - 1] = -1;
}
function goDown() {
  snake.xDir[snake.xDir.length - 1] = 0;
  snake.yDir[snake.yDir.length - 1] = 1;
}
function goLeft() {
  snake.xDir[snake.xDir.length - 1] = -1;
  snake.yDir[snake.yDir.length - 1] = 0;
}
function goRight() {
  snake.xDir[snake.xDir.length - 1] = 1;
  snake.yDir[snake.yDir.length - 1] = 0;
}


///////////////// End Util Functions /////////////////////////////////////////


///////////////// XOR Example ////////////////////////////////////////////////

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

//////////////// P5 Functions /////////////////////////////////////////////////
function setup() {
  n = new Network(2, 2, 2, 1)
  for (let i = 0; i < 1; i++) {
    console.log("pog")
    let data = random(training_data);
    n.train(data.inputs, data.outputs);
  }

  console.log(n.predict([1,0]));
  console.log(n.predict([0,1]));
  console.log(n.predict([1,1]));
  console.log(n.predict([0,0]));

  let dimensions = calculateCanvasSize();
  createCanvas(dimensions.canvasWidth, dimensions.canvasHeight);
  fr = userInput ? 15 : 100;
  frameRate(fr);
  restartGame();
}

function draw() {
  checkCollisions();
  if (gameOver) {
    if (userInput) {
      drawPlayAgainButton();
      return;
    } else {
      genCount++
      restartGame();
      return;
    }
  }
  if (!userInput) {
    snake.getInputFromSnake();
    document.getElementById("generation-counter").innerText = " - Generation: " + genCount;
  }
  checkEatingApple();
  snake.move();
  drawSnake();
  inputUsed = false;
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
      if ((snake.yDir[snake.yDir.length - 1] != 0) || inputUsed) break;
      goUp();
      inputUsed = true;
      break;
    case DOWN_ARROW:
      if ((snake.yDir[snake.yDir.length - 1] != 0) || inputUsed) break;
      goDown();
      inputUsed = true;
      break;
    case LEFT_ARROW:
      if ((snake.xDir[snake.xDir.length - 1] != 0) || inputUsed) break;
      goLeft();
      inputUsed = true;
      break;
    case RIGHT_ARROW:
      if ((snake.xDir[snake.xDir.length - 1] != 0) || inputUsed) break;
      goRight();
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