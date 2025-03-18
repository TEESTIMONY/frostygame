const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

// Load images
const playerImg = new Image();
playerImg.src = "player1.png"; 
const powerUpImg = new Image();
powerUpImg.src = "ronke.png"; 
const platformImg = new Image();
platformImg.src = "platform.png"; 
const enemyImg = new Image();
enemyImg.src = "fire.png";

// Constants
const GRAVITY = 0.4;
const JUMP_POWER = -17;
const PLAYER_SPEED = 5;
const PLATFORM_WIDTH = 90;
const PLATFORM_HEIGHT = 60;
const NUM_PLATFORMS = 6;
const POWER_UP_SIZE = 80;
const ENEMY_SIZE = 60;

let player = { x: 0, y: 0, width: 80, height: 80, velocityY: 0, velocityX: 0 };
let platforms = [];
let powerUps = [];
let enemies = [];
let particles = [];
let gameStarted = false;
let gameOverState = false;
let score = 0;

// Generate platforms
function createPlatforms() {
    platforms = [];
    let spacing = canvas.height / NUM_PLATFORMS;
    for (let i = 0; i < NUM_PLATFORMS; i++) {
        let x = Math.random() * (canvas.width - PLATFORM_WIDTH);
        let y = canvas.height - (i + 1) * spacing;
        platforms.push({ x, y, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT });
    }
}

// Place player on the lowest platform
function placePlayerOnPlatform() {
    let bottomPlatform = platforms[platforms.length - 1];
    player.x = bottomPlatform.x + bottomPlatform.width / 2 - player.width / 2;
    player.y = bottomPlatform.y - player.height;
}

// Move player (keyboard controls)
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") player.velocityX = -PLAYER_SPEED;
    if (event.key === "ArrowRight") player.velocityX = PLAYER_SPEED;
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") player.velocityX = 0;
});

// Touch controls for mobile
canvas.addEventListener("touchstart", (event) => {
    let touchX = event.touches[0].clientX;
    if (touchX < canvas.width / 2) {
        player.velocityX = -PLAYER_SPEED;
    } else {
        player.velocityX = PLAYER_SPEED;
    }
});

canvas.addEventListener("touchend", () => {
    player.velocityX = 0;
});

// Spawn power-ups
function spawnPowerUp() {
    let platform = platforms[Math.floor(Math.random() * platforms.length)];
    powerUps.push({ x: platform.x + PLATFORM_WIDTH / 2 - POWER_UP_SIZE / 2, y: platform.y - POWER_UP_SIZE });
}

// Spawn enemies
function spawnEnemy() {
    let x = Math.random() * (canvas.width - ENEMY_SIZE);
    let y = Math.random() * canvas.height / 2;
    enemies.push({ x, y, width: ENEMY_SIZE, height: ENEMY_SIZE, direction: Math.random() < 0.5 ? 1 : -1 });
}

// Game over function
function gameOver() {
    if (gameOverState) return; // Prevent multiple calls
    gameOverState = true;
    gameStarted = false;
    player.velocityY = 0;

    // Clear game elements
    enemies = [];
    powerUps = [];
    particles = [];

    // Display Game Over message
    ctx.fillStyle = "white";
    ctx.font = "30px 'Rubik Glitch', system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 40);

    startButton.style.display = "block";
}

// Main game loop
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOverState) {
        ctx.fillStyle = "white";
        ctx.font = "50px 'Rubik Glitch', system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
        ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 40);
        return;
    }

    if (gameStarted) {
        player.velocityY += GRAVITY;
        player.y += player.velocityY;
        player.x += player.velocityX;

        // Wrap around screen
        // Prevent player from going outside screen bounds
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;


        // Platform collision
        platforms.forEach((platform) => {
            if (
                player.velocityY > 0 &&
                player.y + player.height >= platform.y + 1 &&
                player.y + player.height - player.velocityY <= platform.y + 1 &&
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width
            ) {
                player.velocityY = JUMP_POWER;
                score += 10;

                // Randomly spawn power-ups and enemies
                if (Math.random() < 0.2) spawnPowerUp();
                if (Math.random() < 0.15) spawnEnemy();

                // Jump particles
                particles.push({ x: player.x + player.width / 2, y: player.y + player.height, lifetime: 10 });
            }
        });

        // Move platforms down
        if (player.y < canvas.height / 3) {
            player.y = canvas.height / 3;
            platforms.forEach((platform) => {
                platform.y += Math.abs(player.velocityY);
                if (platform.y > canvas.height) {
                    platform.x = Math.random() * (canvas.width - PLATFORM_WIDTH);
                    platform.y = -PLATFORM_HEIGHT;
                    score += 10;
                }
            });

            // Move power-ups & enemies down
            powerUps.forEach((powerUp, index) => {
                powerUp.y += Math.abs(player.velocityY);
                if (powerUp.y > canvas.height) powerUps.splice(index, 1);
            });

            enemies.forEach((enemy, index) => {
                enemy.y += Math.abs(player.velocityY);
                if (enemy.y > canvas.height) enemies.splice(index, 1);
            });
        }

        // Power-up collision
        powerUps.forEach((powerUp, index) => {
            if (
                player.x < powerUp.x + POWER_UP_SIZE &&
                player.x + player.width > powerUp.x &&
                player.y < powerUp.y + POWER_UP_SIZE &&
                player.y + player.height > powerUp.y
            ) {
                powerUps.splice(index, 1);
                player.velocityY = JUMP_POWER * 3;
            }
        });

        // Enemy movement & collision
        enemies.forEach((enemy) => {
            enemy.x += enemy.direction * 2;
            if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                enemy.direction *= -1;
            }

            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                gameOver();
            }
        });

        // Game over if player falls off screen
        if (player.y > canvas.height) gameOver();
    }

    // Draw elements
    platforms.forEach((platform) => ctx.drawImage(platformImg, platform.x, platform.y, PLATFORM_WIDTH, PLATFORM_HEIGHT));
    powerUps.forEach((powerUp) => ctx.drawImage(powerUpImg, powerUp.x, powerUp.y, POWER_UP_SIZE, POWER_UP_SIZE));
    enemies.forEach((enemy) => ctx.drawImage(enemyImg, enemy.x, enemy.y, ENEMY_SIZE, ENEMY_SIZE));
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    updateAnimationFrame = requestAnimationFrame(update);
}

// Start button event
startButton.addEventListener("click", () => {
    if (!gameStarted) { 
        gameOverState = false;
        gameStarted = true;
        score = 0;
        startButton.style.display = "none";

        // Reset player properties
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 100;
        player.velocityX = 0;
        player.velocityY = 0;

        // Reset platforms
        createPlatforms();
        placePlayerOnPlatform();

        // Reset other game elements
        powerUps = [];
        enemies = [];
        particles = [];

        // Cancel all previous animation frames before starting a new loop
        cancelAnimationFrame(updateAnimationFrame);
        updateAnimationFrame = requestAnimationFrame(update);
    }
});

// Init game
createPlatforms();
placePlayerOnPlatform();
update();
