
let squareWidth = 30;
let xOffset = 5; 
let yOffset = 5;

// Snake Class
class Snake {
  constructor() {
    this.squares = [
      new Square(0, 0, squareWidth),
      new Square(xOffset + squareWidth, 0, squareWidth),
      new Square(xOffset * 2 + squareWidth * 2, 0, squareWidth)
    ]
    this.head = this.squares[this.squares.length - 1];
    this.oldTail = null;
    this.oldTailxDir = 0;
    this.oldTailyDir = 0;
    this.xDir = [1, 1, 1];
    this.yDir = [0, 0, 0];
  } 
  move() {
    // Update old tail
    // Make a deep copy
    let oldTail = this.squares[0];
    this.oldTail = new Square(oldTail.x, oldTail.y, oldTail.width);
    // Update all squares in array
    for(let i = 0; i < this.squares.length; i++){
      let sq = this.squares[i];
      sq.x += this.xDir[i] * (xOffset + squareWidth);
      sq.y += this.yDir[i] * (yOffset + squareWidth);
    }
    // Update head
    this.head = this.squares[this.squares.length - 1];
    // Update directions
    this.oldTailxDir = this.xDir[0];
    this.oldTailyDir = this.yDir[0];
    for(let i = 0; i < this.xDir.length; i++){
      if(i == this.xDir.length - 1) { continue; }
      this.xDir[i] = this.xDir[i + 1];
      this.yDir[i] = this.yDir[i + 1];
    }
  }
}

// Class Apple
class Apple {
  constructor() {
    this.square = this.getRandomSquare();
  }
  getRandomSquare() {
    let x = 0;
    let y = 0;
    do {
      let numSqauresx = Math.ceil(width / (squareWidth + xOffset));
      let xCoord = Math.floor(Math.random() * numSqauresx);
      let numSqauresy = Math.ceil(height / (squareWidth + yOffset));
      let yCoord = Math.floor(Math.random() * numSqauresy);
      x = xCoord * (squareWidth + xOffset);
      y = yCoord * (squareWidth + yOffset);
    } while(snakeContains(x, y));
    return new Square(x, y, squareWidth);
  }
}

let fr = 15;
let snake;
let apple;
var gameOver = false;
let inputUsed = false;

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

function drawSnake(){
  drawSquare(snake.head, color(0,255,0));
  drawOffset(snake.squares[snake.squares.length - 2], snake.xDir[snake.xDir.length - 2], 
    snake.yDir[snake.yDir.length - 2], color(0,255,0));
  drawSquare(snake.oldTail, color(255,255,255));
  drawOffset(snake.oldTail, snake.oldTailxDir, snake.oldTailyDir, color(255,255,255));
}

function drawSnakeComplete() {
  // Draw Squares
  for(let i = 0; i < snake.squares.length; i++){
    let sq = snake.squares[i];
    drawSquare(sq, color(0,255,0));
  }
  // Fill offsets
  for(let i = 0; i < snake.squares.length -1; i++) {
    drawOffset(snake.squares[i], snake.xDir[i], snake.yDir[i], color(0,255,0));
  }
}

function drawOffset(sq, xDir, yDir, clr) {
  if(xDir != 0){
    if(xDir == -1){
      // This square going left
      drawRect(sq.x - xOffset, sq.y, xOffset, squareWidth, clr);
    } else {
      // This square going right
      drawRect(sq.x + squareWidth, sq.y, xOffset, squareWidth, clr);
    }
  } else {
    if(yDir == -1) {
      // This square going up
      drawRect(sq.x, sq.y - yOffset, squareWidth, yOffset, clr);
    } else {
      // This square going down
      drawRect(sq.x, sq.y + squareWidth, squareWidth, yOffset, clr);
    }
  }
}

function drawPlayAgainButton(){
  let playAgainRectWidth = 200;
  let playAgainRectHeight = 50;
  let playAgainx = (width - playAgainRectWidth) / 2;
  let playAgainy = (height - playAgainRectHeight) / 2;
  fill(color(255,0,0));
  stroke(0);
  strokeWeight(4);
  rect(playAgainx,playAgainy,playAgainRectWidth,playAgainRectHeight);
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
  for(let i = 0; i < snake.squares.length - 1; i++){
    let sq = snake.squares[i];
    if((sq.x == snake.head.x) && (sq.y == snake.head.y)) {
      hittingSelf = true;
      break;
    }
  }
  if(hitRightWall || hitLeftWall || hitBottomWall || hitTopWall || hittingSelf){
    gameOver = true;
  }
}

function checkEatingApple() {
  if((snake.head.x == apple.square.x) && (snake.head.y == apple.square.y)) {
    snake.squares.unshift(new Square(snake.oldTail.x, snake.oldTail.y, squareWidth))
    snake.xDir.unshift(snake.oldTailxDir);
    snake.yDir.unshift(snake.oldTailyDir);
    apple.square = apple.getRandomSquare();
    drawSquare(apple.square, color(255,0,0));
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

function snakeContains(x,y){
  for(let i = 0; i < snake.squares.length; i++){
    let sq = snake.squares[i];
    if(sq.x == x && sq.y == y) return true;
  }
  return false;
}

function restartGame() {
  snake = new Snake();
  apple = new Apple();
  background(255);
  drawSnakeComplete();
  drawSquare(apple.square, color(255,0,0));
  gameOver = false;
}

///////////////// End Util Functions /////////////////////////////////////////

//////////////// P5 Functions /////////////////////////////////////////////////
function setup() {
  let dimensions = calculateCanvasSize();
  createCanvas(dimensions.canvasWidth, dimensions.canvasHeight);
  frameRate(fr);
  restartGame();
}

function draw() {
  checkCollisions();
  if(gameOver) { 
    drawPlayAgainButton();
    return; 
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
  drawSquare(apple.square, color(255,0,0));
}

function keyPressed() {
  switch (keyCode) {
    case UP_ARROW:
      if((snake.yDir[snake.yDir.length - 1] != 0) || inputUsed) break;
      snake.xDir[snake.xDir.length - 1] = 0;
      snake.yDir[snake.yDir.length - 1] = -1;
      inputUsed = true;
      break;
    case DOWN_ARROW:
      if((snake.yDir[snake.yDir.length - 1] != 0) || inputUsed) break;
      snake.xDir[snake.xDir.length - 1] = 0;
      snake.yDir[snake.yDir.length - 1] = 1;
      inputUsed = true;
      break;
    case LEFT_ARROW:
      if((snake.xDir[snake.xDir.length - 1] != 0) || inputUsed) break;
      snake.xDir[snake.xDir.length - 1] = -1;
      snake.yDir[snake.yDir.length - 1] = 0;
      inputUsed = true;
      break;
    case RIGHT_ARROW:
      if((snake.xDir[snake.xDir.length - 1] != 0) || inputUsed) break;
      snake.xDir[snake.xDir.length - 1] = 1;
      snake.yDir[snake.yDir.length - 1] = 0;
      inputUsed = true;
      break;
  }
}

function mouseReleased() {
  if(gameOver) {
    let playAgainRectWidth = 200;
    let playAgainRectHeight = 50;
    let playAgainx = (width - playAgainRectWidth) / 2;
    let playAgainy = (height - playAgainRectHeight) / 2;
    if((mouseX >= playAgainx) && (mouseX <= (playAgainx + playAgainRectWidth)) &&
      (mouseY >= playAgainy) && (mouseY <= (playAgainy + playAgainRectHeight))) {
        restartGame();
      }
  }
}
///////////////////////// End P5 Functions ///////////////////////////