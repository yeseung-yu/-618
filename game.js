// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let lives = 3;
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');

class Player {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 10; // 속도를 2배로 증가
    this.dx = 0;
    this.dy = 0;
  }

  draw() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;

    // Boundary detection
    if (this.x < 0) {
      this.x = 0;
    }

    if (this.x + this.width > canvas.width) {
      this.x = canvas.width - this.width;
    }

    if (this.y < 0) {
      this.y = 0;
    }

    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
    }
  }

  setDirection(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }
}

class Bullet {
  constructor(x, y) {
    this.width = 5;
    this.height = 10;
    this.x = x;
    this.y = y;
    this.speed = 14; // 속도를 2배로 증가
  }

  draw() {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y -= this.speed;
  }
}

class Enemy {
  constructor(x, y) {
    this.width = 50;
    this.height = 50;
    this.x = x;
    this.y = y;
    this.speed = 2;
  }

  draw() {
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.speed;
  }
}

let player = new Player();
let bullets = [];
let enemies = [];
let gameOver = false;
const keys = {};

function spawnEnemy() {
  const x = Math.random() * (canvas.width - 50);
  const y = -50;
  enemies.push(new Enemy(x, y));
}

function update() {
  if (gameOver) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.draw();
  player.move();

  bullets.forEach((bullet, bulletIndex) => {
    bullet.update();
    bullet.draw();

    // Remove bullet if it goes off-screen
    if (bullet.y + bullet.height < 0) {
      bullets.splice(bulletIndex, 1);
    }

    enemies.forEach((enemy, enemyIndex) => {
      if (bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y) {
        // Collision detected
        setTimeout(() => {
          bullets.splice(bulletIndex, 1);
          enemies.splice(enemyIndex, 1);
          score++;
          scoreElement.textContent = `Score: ${score}`;
        }, 0);
      }
    });
  });

  enemies.forEach((enemy, index) => {
    enemy.update();
    enemy.draw();

    // Check if enemy reached the bottom
    if (enemy.y + enemy.height > canvas.height) {
      enemies.splice(index, 1);
      lives--;
      livesElement.textContent = `Lives: ${lives}`;
      if (lives <= 0) {
        gameOver = true;
        gameOverElement.style.display = 'block';
      }
    }

    // Check for collision with player
    if (enemy.x < player.x + player.width &&
      enemy.x + enemy.width > player.x &&
      enemy.y < player.y + player.height &&
      enemy.y + enemy.height > player.y) {
      // Collision with player detected
      enemies.splice(index, 1);
      lives--;
      livesElement.textContent = `Lives: ${lives}`;
      if (lives <= 0) {
        gameOver = true;
        gameOverElement.style.display = 'block';
      }
    }
  });

  // Update player direction based on keys
  if (keys['ArrowRight']) {
    player.setDirection(player.speed, player.dy);
  } else if (keys['ArrowLeft']) {
    player.setDirection(-player.speed, player.dy);
  } else {
    player.setDirection(0, player.dy);
  }

  if (keys['ArrowUp']) {
    player.setDirection(player.dx, -player.speed);
  } else if (keys['ArrowDown']) {
    player.setDirection(player.dx, player.speed);
  } else {
    player.setDirection(player.dx, 0);
  }

  requestAnimationFrame(update);
}

function shoot() {
  const x = player.x + player.width / 2 - 2.5;
  const y = player.y;
  bullets.push(new Bullet(x, y));
}

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') {
    shoot();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

restartButton.addEventListener('click', () => {
  // Reset game variables
  score = 0;
  lives = 3;
  gameOver = false;
  player = new Player();
  bullets = [];
  enemies = [];
  scoreElement.textContent = `Score: ${score}`;
  livesElement.textContent = `Lives: ${lives}`;
  gameOverElement.style.display = 'none';
  update();
});

// Spawn enemies at intervals
setInterval(spawnEnemy, 1000);

// Start the game loop
update();
