const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");





// 🔊 LOAD SOUNDS
const jumpSound = new Audio("./jump.mp3");
const hitSound = new Audio("./hit.mp3");

// make them louder
jumpSound.volume = 1.0;
hitSound.volume = 1.0;

// 🔓 AUDIO UNLOCK (Required for Chrome/Edge)
function unlockAudio() {
    jumpSound.play().then(() => {
        jumpSound.pause();
        jumpSound.currentTime = 0;
    });
    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
}
document.addEventListener("click", unlockAudio);
document.addEventListener("keydown", unlockAudio);

// player (water blob)
let player = {
    x: 60,
    y: 250,
    width: 40,
    height: 35,
    dy: 0,
    gravity: 0.6,
    grounded: true,
    squash: 1,
    stretch: 1,
    jumpHeld: false
};

// tree obstacle
let tree = {
    x: 600,
    y: 245,
    width: 40,
    height: 55,
    speed: 4
};

let gameOver = false;

// Restart game
function restartGame() {
    player.y = 250;
    player.dy = 0;
    player.grounded = true;
    player.jumpHeld = false;

    tree.x = 600;
    gameOver = false;

    restartBtn.style.display = "none";
    update();
}

restartBtn.addEventListener("click", restartGame);

// SPACE -> restart after game over
document.addEventListener("keydown", e => {
    if (gameOver && e.code === "Space") restartGame();
});

// START holding jump
document.addEventListener("keydown", e => {
    if (e.code === "Space" && !gameOver) {
        player.jumpHeld = true;

        // 🔊 play jump sound ONLY when jump begins
        if (player.grounded) {
            jumpSound.currentTime = 0;
            jumpSound.play();
        }

        // squish down before rising
        if (player.grounded) {
            player.squash = 1.2;
            player.stretch = 0.8;
        }
    }
});

// STOP holding jump
document.addEventListener("keyup", e => {
    if (e.code === "Space") {
        player.jumpHeld = false;
    }
});

// mobile/click taps
document.addEventListener("mousedown", () => {
    if (!gameOver) {
        player.jumpHeld = true;

        if (player.grounded) {
            jumpSound.currentTime = 0;
            jumpSound.play();
        }
    }
});
document.addEventListener("mouseup", () => {
    player.jumpHeld = false;
});

// game loop
function update() {
    if (gameOver) return;

    // HOLD JUMP = rise upward
    if (player.jumpHeld) {
        if (player.grounded) {
            // start jump
            player.dy = -8;
            player.grounded = false;
        } else {
            // continue rising while held
            if (player.dy > -12) player.dy -= 0.4;
        }
    }

    // apply gravity
    player.dy += player.gravity;
    player.y += player.dy;

    // ground collision
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.grounded = true;

        // landing bounce
        player.squash = 1.3;
        player.stretch = 0.7;
        setTimeout(() => {
            player.squash = 1;
            player.stretch = 1;
        }, 100);

        player.dy = 0;
    }

    // move tree
    tree.x -= tree.speed;
    if (tree.x + tree.width < 0) {
        tree.x = 600;
    }

    // collision
    if (
        player.x < tree.x + tree.width &&
        player.x + player.width > tree.x &&
        player.y < tree.y + tree.height &&
        player.y + player.height > tree.y
    ) {
        gameOver = true;

        // 💥 play hit sound
        hitSound.currentTime = 0;
        hitSound.play();

        restartBtn.style.display = "inline-block";
    }

    draw();
    requestAnimationFrame(update);
}

// draw block helper
function drawBlock(color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// draw blob with squash/stretch
function drawBlob() {
    ctx.save();

    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.scale(player.squash, player.stretch);

    ctx.fillStyle = "#97e8ff";
    ctx.beginPath();
    ctx.ellipse(0, 0, player.width / 2, player.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // tree (blocky minecraft style)
    drawBlock("#8b4513", tree.x + 14, tree.y + 20, 12, 35);
    drawBlock("#3fa34d", tree.x, tree.y, 40, 25);

    drawBlob();
}

update();




