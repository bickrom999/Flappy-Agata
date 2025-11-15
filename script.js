// ======================================
// 1. GAME CONFIGURATION
// ======================================
const BIRD_IMAGE_PATH = 'custom_bird.png';
const BG_IMAGE_PATH = 'background.png';
const PIPE_IMAGE_PATH = 'pipe.png';
const GAME_OVER_IMAGE_PATH = 'game_over_screen.png';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const jumpSound = new Audio('jump.mp3');
const gameOverSound = new Audio('gameover.mp3');

jumpSound.preload = 'auto';
gameOverSound.preload = 'auto';

// ======================================
// 2. GAME CONSTANTS
// ======================================
const GRAVITY = 0.38;
const JUMP_STRENGTH = -6.2;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 80;
const PIPE_GAP = 220;
const PIPE_SPAWN_DELAY = 1800;

// Sensitivity কমানো হলো
const COLLISION_PADDING = 40;

// ======================================
// 3. GAME VARIABLES
// ======================================
let gameRunning = false;
let score = 0;
let pipes = [];
let pipeInterval;
let audioReady = false;

let bird = {
  x: 100,
  y: canvas.height / 2,
  width: 140,
  height: 110,
  velocity: 0
};

// ======================================
// 4. LOAD IMAGES
// ======================================
const bgImage = new Image();
bgImage.src = BG_IMAGE_PATH;
const birdImage = new Image();
birdImage.src = BIRD_IMAGE_PATH;
const pipeImage = new Image();
pipeImage.src = PIPE_IMAGE_PATH;
const gameOverImage = new Image();
gameOverImage.src = GAME_OVER_IMAGE_PATH;

// ======================================
// 5. DRAW FUNCTION
// ======================================
function draw() {
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  // Bird
  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

  // Pipes
  pipes.forEach(pipe => {
    ctx.drawImage(pipeImage, pipe.x, pipe.y, PIPE_WIDTH, canvas.height - pipe.y);

    ctx.save();
    ctx.translate(pipe.x, pipe.y - PIPE_GAP);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImage, 0, 0, PIPE_WIDTH, canvas.height);
    ctx.restore();
  });

  // Score
  ctx.fillStyle = 'white';
  ctx.font = '36px sans-serif';
  ctx.fillText('Score: ' + score, 20, 40);
}

// ======================================
// 6. COLLISION CHECK (Sensitivity Reduced)
// ======================================
function checkCollision() {
  const bx = bird.x + COLLISION_PADDING;
  const by = bird.y + COLLISION_PADDING;
  const bw = bird.width - COLLISION_PADDING * 2;
  const bh = bird.height - COLLISION_PADDING * 2;

  for (const pipe of pipes) {
    if (
      bx < pipe.x + PIPE_WIDTH &&
      bx + bw > pipe.x &&
      (by < pipe.y - PIPE_GAP || by + bh > pipe.y)
    ) {
      return true;
    }
  }

  if (bird.y + bird.height >= canvas.height || bird.y < 0) return true;

  return false;
}

// ======================================
// 7. UPDATE FUNCTION
// ======================================
function update() {
  if (!gameRunning) return;

  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  if (checkCollision()) {
    endGame();
    return;
  }

  pipes.forEach(pipe => {
    pipe.x -= PIPE_SPEED;
    if (pipe.x + PIPE_WIDTH < bird.x && !pipe.scored) {
      score++;
      pipe.scored = true;
    }
  });

  pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

  draw();
  requestAnimationFrame(update);
}

// ======================================
// 8. PIPE SPAWNING
// ======================================
function spawnPipe() {
  if (!gameRunning) return;

  const minY = 180;
  const maxY = canvas.height - 180;
  const y = Math.floor(Math.random() * (maxY - minY)) + minY;

  pipes.push({ x: canvas.width, y, scored: false });
}

// ======================================
// 9. SOUND + INPUT
// ======================================
function enableAudio() {
  if (audioReady) return;
  const unlock = new Audio();
  unlock.play().catch(() => {});
  audioReady = true;
  jumpSound.load();
  gameOverSound.load();
}

function jump() {
  bird.velocity = JUMP_STRENGTH;
  if (audioReady) {
    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => {});
  }
}

// ======================================
// 10. GAME FLOW
// ======================================
function startGame() {
  enableAudio();
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  gameRunning = true;
  clearInterval(pipeInterval);
  pipeInterval = setInterval(spawnPipe, PIPE_SPAWN_DELAY);
  requestAnimationFrame(update);
}

function endGame() {
  gameRunning = false;
  clearInterval(pipeInterval);
  if (audioReady) {
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {});
  }

  ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '40px sans-serif';
  ctx.fillText('Game Over!', canvas.width / 2 - 110, canvas.height / 2 - 40);
  ctx.fillText('Score: ' + score, canvas.width / 2 - 80, canvas.height / 2 + 20);
  ctx.fillText(
    'Tap or Press SPACE to Restart',
    canvas.width / 2 - 220,
    canvas.height / 2 + 80
  );
}

// ======================================
// 11. INPUT HANDLERS
// ======================================
function handleInput() {
  if (!audioReady) enableAudio();
  if (!gameRunning) startGame();
  else jump();
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    handleInput();
  }
});

canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  handleInput();
});

// ======================================
// 12. INITIAL SCREEN
// ======================================
bgImage.onload = () => {
  draw();
  ctx.fillStyle = 'black';
  ctx.font = '36px sans-serif';
  ctx.fillText('Press SPACE or TAP to Start', canvas.width / 2 - 220, canvas.height / 2);
};