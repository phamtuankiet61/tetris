import BRICK_LAYOUT from "./brick_layout.js";

const COLS = 10;
const ROWS = 20;
const COLS_NEXT_BRICK_LAYOUT = 4;
const ROWS_NEXT_BRICK_LAYOUT = 4;
const BLOCK_SIDES = 30;
const COLOR_MAPPINGS = [
  "red",
  "orange",
  "green",
  "purple",
  "blue",
  "cyan",
  "yellow",
  "white",
];
const WHITE_COLOR_ID = 7;

const KEY_CODES = {
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
  UP: "ArrowUp",
  DOWN: "ArrowDown",
};

var board;
var brick;
var nextBrick;

var nextBrickLayout;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const playElement = document.getElementById("play-btn");

ctx.canvas.width = COLS * BLOCK_SIDES;
ctx.canvas.height = ROWS * BLOCK_SIDES;

// ---------
const canvasNextBrick = document.getElementById('next-brick');
const context = canvasNextBrick.getContext('2d');

context.canvas.width = COLS_NEXT_BRICK_LAYOUT * BLOCK_SIDES;
context.canvas.height = ROWS_NEXT_BRICK_LAYOUT * BLOCK_SIDES;

class NextBrick {
  constructor(context) {
    this.context = context;
    this.grid = this.generateWhiteBoard();
    this.colPos = 0;
    this.rowPos = 0;
  }

  generateWhiteBoard() {
    return Array.from({ length: ROWS_NEXT_BRICK_LAYOUT }, () => Array(COLS_NEXT_BRICK_LAYOUT).fill(WHITE_COLOR_ID));
  }

  drawCell(x, y, colorId) {
    this.context.fillStyle =
      COLOR_MAPPINGS[colorId] || COLOR_MAPPINGS[WHITE_COLOR_ID];
    this.context.fillRect(
      x * BLOCK_SIDES,
      y * BLOCK_SIDES,
      BLOCK_SIDES,
      BLOCK_SIDES
    );
    this.context.fillStyle = "black";
    this.context.strokeRect(
      x * BLOCK_SIDES,
      y * BLOCK_SIDES,
      BLOCK_SIDES,
      BLOCK_SIDES
    );
  }

  drawBoard() {
    for (var row = 0; row < this.grid.length; row++) {
      for (var col = 0; col < this.grid[0].length; col++) {
        this.drawCell(col, row, this.grid[row][col]);
      }
    }
  }

  drawBrick(id) {
    for (var row = 0; row < BRICK_LAYOUT[id][0].length; row++) {
      for (var col = 0; col < BRICK_LAYOUT[id][0][0].length; col++) {
        if (BRICK_LAYOUT[id][0][row][col] !== WHITE_COLOR_ID) {
          this.drawCell(this.colPos + col, this.rowPos + row, id);
        }
      }
    }
  }
  clear() {
    for (var row = 0; row < this.grid.length; row++) {
      for (var col = 0; col < this.grid[0].length; col++) {
        this.drawCell(col, row, WHITE_COLOR_ID);
      }
    }
  }
}


class Board {
  constructor(ctx) {
    this.ctx = ctx;
    this.grid = this.generateWhiteBoard();
    this.score = 0;
    this.gameOver = false;
    this.isPlaying = false;

    this.clearAudio = new Audio("../Audio/sounds_clear.wav");
    this.audioGame = new Audio("../Audio/waterfall-140894.mp3");
  }

  reset() {
    this.score = 0;
    this.grid = this.generateWhiteBoard();
    this.gameOver = false;
    this.drawBoard();
  }

  generateWhiteBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(WHITE_COLOR_ID));
  }

  drawCell(x, y, colorId) {
    this.ctx.fillStyle =
      COLOR_MAPPINGS[colorId] || COLOR_MAPPINGS[WHITE_COLOR_ID];
    this.ctx.fillRect(
      x * BLOCK_SIDES,
      y * BLOCK_SIDES,
      BLOCK_SIDES,
      BLOCK_SIDES
    );
    this.ctx.fillStyle = "black";
    this.ctx.strokeRect(
      x * BLOCK_SIDES,
      y * BLOCK_SIDES,
      BLOCK_SIDES,
      BLOCK_SIDES
    );
  }

  drawBoard() {
    for (var row = 0; row < this.grid.length; row++) {
      for (var col = 0; col < this.grid[0].length; col++) {
        this.drawCell(col, row, this.grid[row][col]);
      }
    }
  }

  handleCompleteRows() {
    const latestGrid = this.grid.filter((rows) =>
      rows.some((col) => col === WHITE_COLOR_ID)
    );
    const newScore = ROWS - latestGrid.length; // số hàng đã đầy

    if (newScore) {
      const newRows = Array.from({ length: newScore }, () =>
        Array(COLS).fill(WHITE_COLOR_ID)
      );
      this.grid = [...newRows, ...latestGrid];
      this.clearAudio.play();
      this.handleScore(newScore * 10);
    }
  }

  handleScore(newScore) {
    this.score += newScore;
    scoreElement.innerText = this.score;
  }

  handleGameover() {
    this.gameOver = true;
    this.isPlaying = false;
    this.audioGame.pause();
    ctx.font = "50px san-serif";
    ctx.fillStyle = "black";
    ctx.fillText("Game Over!", 20, canvas.height / 2);
  }
}

class Brick {
  constructor(id) {
    this.id = id;
    this.layout = BRICK_LAYOUT[id];
    this.activeIndex = 0;
    this.colPos = 3;
    this.rowPos = -2;
  }

  draw() {
    for (var row = 0; row < this.layout[this.activeIndex].length; row++) {
      for (var col = 0; col < this.layout[this.activeIndex][0].length; col++) {
        if (this.layout[this.activeIndex][row][col] !== WHITE_COLOR_ID) {
          board.drawCell(this.colPos + col, this.rowPos + row, this.id);
        }
      }
    }
  }

  clear() {
    for (let row = 0; row < this.layout[this.activeIndex].length; row++) {
      for (let col = 0; col < this.layout[this.activeIndex][0].length; col++) {
        if (this.layout[this.activeIndex][row][col] !== WHITE_COLOR_ID) {
          board.drawCell(col + this.colPos, row + this.rowPos, WHITE_COLOR_ID);
        }
      }
    }
  }

  moveLeft() {
    if (
      !this.checkCollistion(
        this.rowPos,
        this.colPos - 1,
        this.layout[this.activeIndex]
      )
    ) {
      this.clear();
      this.colPos--;
      this.draw();
    }
  }

  moveRight() {
    if (
      !this.checkCollistion(
        this.rowPos,
        this.colPos + 1,
        this.layout[this.activeIndex]
      )
    ) {
      this.clear();
      this.colPos++;
      this.draw();
    }
  }

  moveDown() {
    if (
      !this.checkCollistion(
        this.rowPos + 1,
        this.colPos,
        this.layout[this.activeIndex]
      )
    ) {
      this.clear();
      this.rowPos++;
      this.draw();
      return;
    }
    this.handleLanded();
    if (!board.gameOver) {
      brick = generateNewBrick();
      brick.draw();
    }
  }

  rotate() {
    if (
      !this.checkCollistion(
        this.rowPos,
        this.colPos,
        this.layout[(this.activeIndex + 1) % 4]
      )
    ) {
      this.clear();
      this.activeIndex = (this.activeIndex + 1) % 4;
      this.draw();
    }
  }

  checkCollistion(nextRow, nextCol, nextLayout) {
    for (let row = 0; row < nextLayout.length; row++) {
      for (let col = 0; col < nextLayout[0].length; col++) {
        if (nextLayout[row][col] !== WHITE_COLOR_ID && nextRow >= 0) {
          if (
            col + nextCol < 0 ||
            col + nextCol >= COLS ||
            row + nextRow >= ROWS ||
            board.grid[row + nextRow][col + nextCol] !== WHITE_COLOR_ID
          )
            return true;
        }
      }
    }
    return false;
  }

  handleLanded() {
    if (this.rowPos <= 0) {
      board.handleGameover();
      return;
    }

    for (let row = 0; row < this.layout[this.activeIndex].length; row++) {
      for (let col = 0; col < this.layout[this.activeIndex][0].length; col++) {
        if (this.layout[this.activeIndex][row][col] !== WHITE_COLOR_ID) {
          board.grid[row + this.rowPos][col + this.colPos] = this.id;
        }
      }
    }
    board.handleCompleteRows();
    board.drawBoard();
  }
}

function generateNewBrick() {
  var idBrick;
  if (nextBrickLayout || nextBrickLayout === 0) {
    idBrick = nextBrickLayout;
    nextBrickLayout = generateNextBrickId();
    nextBrick.clear();
    nextBrick.drawBrick(nextBrickLayout);
  } else {
    idBrick = Math.floor(Math.random() * 10) % BRICK_LAYOUT.length;
  }
  return new Brick(idBrick);
}

function generateNextBrickId() {
  return Math.floor(Math.random() * 10) % BRICK_LAYOUT.length;
}

board = new Board(ctx);
board.drawBoard();

nextBrick = new NextBrick(context);
nextBrick.drawBoard();

playElement.addEventListener("click", () => {
  board.reset();
  board.score = 0;
  board.handleScore(board.score);
  board.isPlaying = true;
  board.audioGame.play();

  brick = generateNewBrick();
  brick.draw();

  nextBrickLayout = generateNextBrickId();
  nextBrick.drawBrick(nextBrickLayout);

  const refesh = setInterval(() => {
    if (!board.gameOver) {
      brick.moveDown();
    } else {
      clearInterval(refesh);
    }
  }, 500);
});

document.addEventListener("keydown", (e) => {
  if (!board.gameOver && board.isPlaying) {
    switch (e.code) {
      case KEY_CODES.LEFT:
        brick.moveLeft();
        break;
      case KEY_CODES.RIGHT:
        brick.moveRight();
        break;
      case KEY_CODES.DOWN:
        brick.moveDown();
        break;
      case KEY_CODES.UP:
        brick.rotate();
        break;
      default:
        break;
    }
  }
});

// settings.js
const settingElement = document.querySelector(".settings");
const modalSettings = document.querySelector(".modal_settings");
const settingsPanel = document.querySelector(".settings_panel");
const titleBarClose = document.querySelector(".title_bar--close");
const btnCancel = document.querySelector(".btn_cancel");
const btnOk = document.querySelector(".btn_ok");
const lightBtn = document.querySelector(".light-btn");
const darkBtn = document.querySelector(".dark-btn");
const btnVolumeOn = document.querySelector(".volume_on");
const btnVolumeOff = document.querySelector(".volume_off");

settingElement.onclick = (e) => {
  modalSettings.style.display = "block";
};

// settingsPanel.addEventListener('mouseout', (e) => {
// });

titleBarClose.onclick = () => {
  modalSettings.style.display = "none";
};

btnCancel.onclick = () => {
  modalSettings.style.display = "none";
};

btnOk.onclick = () => {
  modalSettings.style.display = "none";
};

darkBtn.onclick = () => {
  document.body.style.backgroundImage =
    "linear-gradient(0deg,#0E8388, #635985)";
  document.body.style.color = "#E3DFFD";
};

lightBtn.onclick = () => {
  document.body.style.backgroundImage =
    "linear-gradient(45deg,#CDFCF6, #E3DFFD)";
  document.body.style.color = "#443C68";
};

btnVolumeOn.onclick = () => {
  btnVolumeOn.style.display = "none";
  btnVolumeOff.style.display = "block";
  board.audioGame.pause();
};

btnVolumeOff.onclick = () => {
  btnVolumeOff.style.display = "none";
  btnVolumeOn.style.display = "block";
  board.audioGame.play();
};
