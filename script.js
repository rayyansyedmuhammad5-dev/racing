
const game = document.getElementById("game");
const player = document.getElementById("player");
const overlay = document.getElementById("overlay");
const scoreText = document.getElementById("score");

let lane = 1;
let score = 0;
let best = Number(localStorage.getItem("bestScore") || 0);
let enemies = [];
let lines = [];
let running = false;
let speed = 5;
let animation;
let lastSpawn = 0;

function width() {
  return game.clientWidth;
}

function positionPlayer() {
  const laneWidth = width() / 3;
  player.style.left =
    (lane * laneWidth + laneWidth / 2 - 24) + "px";
}

function move(dir) {
  if (!running) return;

  lane = Math.max(0, Math.min(2, lane + dir));
  positionPlayer();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a") {
    move(-1);
  }

  if (e.key === "ArrowRight" || e.key === "d") {
    move(1);
  }
});

function createLines() {
  for (let i = 0; i < 8; i++) {
    let line = document.createElement("div");

    line.className = "line";
    line.style.top = (i * 100) + "px";

    game.appendChild(line);
    lines.push({
      el: line,
      y: i * 100
    });
  }
}

function spawnEnemy() {
  const laneNum = Math.floor(Math.random() * 3);

  const enemy = document.createElement("div");

  enemy.className = "car enemy";

  enemy.innerHTML = `
    <div class="window"></div>
    <div class="wheel w1"></div>
    <div class="wheel w2"></div>
  `;

  enemy.style.left =
    (laneNum * width() / 3 + width() / 6 - 24) + "px";

  enemy.style.top = "-100px";

  game.appendChild(enemy);

  enemies.push({
    el: enemy,
    y: -100,
    lane: laneNum
  });
}

function startGame() {
  enemies.forEach(e => e.el.remove());
  enemies = [];

  lines.forEach(l => l.el.remove());
  lines = [];

  score = 0;
  speed = 5;
  lane = 1;
  lastSpawn = 0;
  running = true;

  overlay.style.display = "none";

  positionPlayer();
  createLines();

  cancelAnimationFrame(animation);

  animation = requestAnimationFrame(loop);
}

function gameOver() {
  running = false;

  best = Math.max(best, score);

  localStorage.setItem("bestScore", best);

  overlay.innerHTML = `
    <h1>💥 GAME OVER!</h1>
    <h2>Score: ${score}</h2>
    <h3>Best: ${best}</h3>
    <button onclick="startGame()">PLAY AGAIN</button>
  `;

  overlay.style.display = "flex";
}

function loop(timestamp) {
  if (!running) return;

  lines.forEach(line => {
    line.y += speed;

    if (line.y > game.clientHeight) {
      line.y -= 800;
    }

    line.el.style.top = line.y + "px";
  });

  if (
    timestamp - lastSpawn >
    Math.max(450, 1100 - score * 3)
  ) {
    spawnEnemy();
    lastSpawn = timestamp;
  }

  enemies.forEach(enemy => {
    enemy.y += speed;
    enemy.el.style.top = enemy.y + "px";

    const playerY = game.clientHeight - 100;

    if (
      enemy.lane === lane &&
      enemy.y + 70 > playerY &&
      enemy.y < playerY + 80
    ) {
      gameOver();
    }
  });

  if (!running) return;

  enemies = enemies.filter(enemy => {
    if (enemy.y > game.clientHeight) {
      enemy.el.remove();
      score++;
      return false;
    }

    return true;
  });

  speed = Math.min(13, 5 + score * 0.12);

  scoreText.textContent =
    `Score: ${score} | Best: ${Math.max(best, score)}`;

  animation = requestAnimationFrame(loop);
}

positionPlayer();

window.addEventListener("resize", positionPlayer);
