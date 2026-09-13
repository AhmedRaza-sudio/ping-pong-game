// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 15;
const paddleHeight = 80;
const ballRadius = 8;

let playerPaddle = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

let computerPaddle = {
    x: canvas.width - 20 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballRadius,
    speed: 5
};

let score = {
    player: 0,
    computer: 0
};

let gameRunning = false;
let keys = {};

// Mouse position tracking
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetScore);

// Start game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        document.getElementById('startBtn').textContent = 'Pause';
    } else {
        gameRunning = false;
        document.getElementById('startBtn').textContent = 'Resume';
    }
}

// Reset score
function resetScore() {
    score.player = 0;
    score.computer = 0;
    gameRunning = false;
    document.getElementById('startBtn').textContent = 'Start Game';
    document.getElementById('playerScore').textContent = score.player;
    document.getElementById('computerScore').textContent = score.computer;
    resetBall();
}

// Reset ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 6;
}

// Update game state
function update() {
    if (!gameRunning) return;

    // Player paddle movement (mouse or arrow keys)
    if (keys['ArrowUp']) {
        playerPaddle.y = Math.max(0, playerPaddle.y - playerPaddle.speed);
    }
    if (keys['ArrowDown']) {
        playerPaddle.y = Math.min(canvas.height - playerPaddle.height, playerPaddle.y + playerPaddle.speed);
    }
    
    // Also support mouse movement
    playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, mouseY - playerPaddle.height / 2));

    // Computer paddle AI
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    if (computerCenter < ball.y - 35) {
        computerPaddle.y = Math.min(canvas.height - computerPaddle.height, computerPaddle.y + computerPaddle.speed);
    } else if (computerCenter > ball.y + 35) {
        computerPaddle.y = Math.max(0, computerPaddle.y - computerPaddle.speed);
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = Math.abs(ball.dx);
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        ball.dy = (collidePoint / (playerPaddle.height / 2)) * ball.speed;
    }

    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -Math.abs(ball.dx);
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy = (collidePoint / (computerPaddle.height / 2)) * ball.speed;
    }

    // Ball out of bounds - score points
    if (ball.x - ball.radius < 0) {
        score.computer++;
        document.getElementById('computerScore').textContent = score.computer;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        score.player++;
        document.getElementById('playerScore').textContent = score.player;
        resetBall();
    }
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles and ball
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
