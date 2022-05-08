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
      this.count = 0;
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
    getInputFromSnake(){
        
    }
  }
  