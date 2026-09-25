"use strict";

/* =========================================================
   RUN FOR KAK VANES
   Original HTML5 Canvas Endless Runner
========================================================= */

/* =========================
   DOM
========================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const anotherPraiseButton = document.getElementById("anotherPraiseButton");

const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const muteButton = document.getElementById("muteButton");

const pauseOverlay = document.getElementById("pauseOverlay");

const scoreText = document.getElementById("scoreText");
const highScoreText = document.getElementById("highScoreText");

const startHighScore = document.getElementById("startHighScore");

const finalScore = document.getElementById("finalScore");
const finalHighScore = document.getElementById("finalHighScore");

const praiseText = document.getElementById("praiseText");
const praiseCounter = document.getElementById("praiseCounter");

const milestoneMessage = document.getElementById("milestoneMessage");

/* =========================
   CANVAS
========================= */

let width = 0;
let height = 0;
let dpr = 1;

function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    updateGroundPosition();
}

window.addEventListener("resize", resizeCanvas);

/* =========================
   GAME STATE
========================= */

let gameRunning = false;
let paused = false;
let gameOver = false;

let score = 0;
let highScore = Number(localStorage.getItem("runForKakVanesHighScore")) || 0;

let speed = 6;
let distance = 0;

let lastTime = 0;
let animationFrame = 0;

let groundY = 0;

let obstacleTimer = 0;
let nextObstacleTime = 1000;

let cloudOffset = 0;
let hillOffset = 0;
let groundOffset = 0;

let screenShake = 0;

let gameOverTimer = 0;

/* =========================
   MILESTONES
========================= */

const milestones = {
    10: "Kak Vanes tetap keren! ✨",
    25: "25 poin! Tapi pesona Kak Vanes masih jauh lebih tinggi.",
    50: "50 POIN! Kak Vanes memang luar biasa. 💫",
    100: "100 POIN! 👑 Kak Vanes resmi menjadi legenda!",
    150: "150 POIN! Game ini mulai kewalahan mengejar kehebatan Kak Vanes!"
};

const triggeredMilestones = new Set();

/* =========================
   PRAISE SYSTEM
========================= */

const praises = [
    "Game boleh berakhir, tapi Kak Vanes tetap juara.",
    "Kalau keren punya skor, Kak Vanes sudah tidak muat di leaderboard.",
    "Rintangannya boleh banyak, tapi alasan mengagumi Kak Vanes jauh lebih banyak.",
    "Tidak perlu power-up, Kak Vanes sendiri sudah punya aura spesial.",
    "Kak Vanes tetap luar biasa, bahkan ketika game ini berhasil mengalahkanmu.",
    "Skornya boleh berhenti, tapi kekaguman untuk Kak Vanes tidak ikut berhenti.",
    "Game Over bukan berarti kalah dalam hal menjadi orang spesial.",
    "Kak Vanes berhasil membuat game sederhana ini terasa lebih berarti.",
    "Kalau ada penghargaan untuk orang paling spesial hari ini, Kak Vanes kandidat kuat.",
    "Coba lagi! Dunia belum siap melihat skor tertinggi Kak Vanes.",
    "Rintangan boleh menghadang, tapi pesona Kak Vanes tidak bisa dihentikan.",
    "Satu hal yang tidak pernah Game Over: kehebatan Kak Vanes.",
    "Skor boleh kecil, tapi senyum Kak Vanes tetap punya nilai tak terhingga.",
    "Bahkan rintangan pun sepertinya gugup ketika berhadapan dengan Kak Vanes.",
    "Kak Vanes punya bakat membuat hal sederhana menjadi spesial.",
    "Kalau game ini punya favorit, jawabannya mungkin Kak Vanes.",
    "Tidak semua legenda membutuhkan mahkota. Kak Vanes contohnya.",
    "Game selesai, tetapi kekaguman masih lanjut ke level berikutnya.",
    "Kak Vanes adalah alasan kenapa tombol retry terasa menyenangkan.",
    "Sepertinya rintangan tadi terlalu percaya diri.",
    "Kak Vanes kalah satu ronde, tetapi tetap menang dalam hal menjadi keren.",
    "Kalau ada tombol 'terlalu keren', mungkin game ini sudah crash.",
    "Hari ini belum menjadi rekor, tapi Kak Vanes tetap menjadi highlight.",
    "Game ini punya banyak rintangan, tapi Kak Vanes punya lebih banyak semangat.",
    "Satu nyawa habis, seribu alasan untuk tetap tersenyum.",
    "Kak Vanes berhasil membuat layar Game Over terasa manis.",
    "Tidak perlu skor tinggi untuk membuktikan kalau Kak Vanes itu spesial.",
    "Rintangannya menang sebentar. Kak Vanes tetap punya kesempatan comeback.",
    "Kalau semangat punya bentuk, mungkin bentuknya seperti Kak Vanes terus mencoba.",
    "Kak Vanes mungkin berhenti berlari, tetapi level keren tidak pernah berhenti.",
    "Game Over hanya tulisan. Kehebatan Kak Vanes adalah kenyataan.",
    "Poinnya mungkin berhenti, tetapi vibe positif Kak Vanes tetap jalan.",
    "Kak Vanes cocok mendapatkan bonus poin hanya karena tetap mencoba.",
    "Rintangan tadi berhasil mengejutkan pemain, bukan mengalahkan pesona Kak Vanes.",
    "Kalau ada leaderboard untuk orang yang paling menyenangkan, Kak Vanes layak ada di sana.",
    "Tidak ada tombol yang bisa menghapus fakta bahwa Kak Vanes tetap keren.",
    "Level berikutnya menunggu, tapi pujian ini tidak perlu menunggu.",
    "Kak Vanes adalah tipe orang yang membuat perjalanan terasa lebih seru.",
    "Skor belum sempurna? Tidak masalah. Kak Vanes tetap punya cerita bagus hari ini.",
    "Bahkan layar Game Over pun tidak bisa menghilangkan suasana positif.",
    "Kak Vanes punya satu skill rahasia: membuat orang tersenyum.",
    "Game ini mungkin sulit, tetapi apresiasi untuk Kak Vanes sangat mudah diberikan.",
    "Kalau ketekunan punya wajah, mungkin dia sedang tersenyum seperti Kak Vanes.",
    "Kak Vanes tetap keren meskipun rintangan berhasil melakukan kejutan.",
    "Satu percobaan lagi bisa menjadi cerita baru.",
    "Rintangan datang dan pergi. Aura positif Kak Vanes tetap bertahan.",
    "Kak Vanes tidak membutuhkan cheat code untuk menjadi spesial.",
    "Game ini punya ending sementara, tapi pujian hari ini belum habis.",
    "Kalau keren adalah sebuah permainan, Kak Vanes sudah membuka semua level.",
    "Achievement unlocked: tetap keren setelah Game Over. 🏆"
];

let unusedPraises = [];
let currentPraise = "";
let praiseShown = 0;

function resetPraisePool() {
    unusedPraises = [...praises];

    for (let i = unusedPraises.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [unusedPraises[i], unusedPraises[j]] =
            [unusedPraises[j], unusedPraises[i]];
    }
}

function getNewPraise() {
    if (unusedPraises.length === 0) {
        resetPraisePool();
    }

    const next = unusedPraises.pop();

    currentPraise = next;
    praiseShown++;

    return next;
}

resetPraisePool();

/* =========================
   AUDIO
========================= */

let audioContext = null;
let muted = false;

function initializeAudio() {
    if (!audioContext) {
        try {
            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        } catch (error) {
            audioContext = null;
        }
    }

    if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
    }
}

function playTone(
    frequency,
    duration,
    type = "sine",
    volume = 0.045,
    endFrequency = null
) {
    if (muted || !audioContext) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(
            frequency,
            audioContext.currentTime
        );

        if (endFrequency) {
            oscillator.frequency.exponentialRampToValueAtTime(
                Math.max(20, endFrequency),
                audioContext.currentTime + duration
            );
        }

        gain.gain.setValueAtTime(
            volume,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        /* Audio is optional. */
    }
}

function jumpSound() {
    playTone(360, 0.08, "square", 0.035, 650);
}

function milestoneSound() {
    playTone(520, 0.1, "sine", 0.04, 780);

    setTimeout(() => {
        playTone(780, 0.15, "sine", 0.035, 1040);
    }, 90);
}

function gameOverSound() {
    playTone(240, 0.15, "sawtooth", 0.035, 140);

    setTimeout(() => {
        playTone(130, 0.2, "sawtooth", 0.025, 90);
    }, 130);
}

function buttonSound() {
    playTone(500, 0.05, "sine", 0.025, 650);
}

function praiseSound() {
    playTone(500, 0.08, "sine", 0.03, 700);

    setTimeout(() => {
        playTone(700, 0.12, "sine", 0.025, 900);
    }, 80);
}

/* =========================
   PLAYER
========================= */

const player = {
    x: 100,
    y: 0,

    width: 42,
    height: 55,

    velocityY: 0,

    gravity: 0.78,
    jumpPower: -15,

    grounded: true,

    animation: 0,
    blinkTimer: 0,

    rotation: 0,

    reset() {
        this.width = Math.max(36, Math.min(46, width * 0.045));
        this.height = this.width * 1.3;

        this.x = Math.max(40, width * 0.13);
        this.y = groundY - this.height;

        this.velocityY = 0;
        this.grounded = true;
        this.animation = 0;
        this.rotation = 0;
    },

    jump() {
        if (!gameRunning || paused || gameOver) return;

        if (this.grounded) {
            this.velocityY = this.jumpPower;
            this.grounded = false;

            jumpSound();

            createJumpParticles();
        }
    },

    update(dt) {
        const frame = dt / 16.666;

        this.animation += 0.25 * frame;

        if (!this.grounded) {
            this.velocityY += this.gravity * frame;
            this.y += this.velocityY * frame;

            this.rotation = Math.max(
                -0.12,
                Math.min(0.12, this.velocityY * 0.008)
            );

            if (this.y >= groundY - this.height) {
                this.y = groundY - this.height;
                this.velocityY = 0;
                this.grounded = true;
                this.rotation = 0;

                createLandingParticles();
            }
        }
    },

    draw() {
        ctx.save();

        const legMove = this.grounded
            ? Math.sin(this.animation) * 4
            : 0;

        const bob = this.grounded
            ? Math.abs(Math.sin(this.animation * 2)) * 1.5
            : 0;

        const x = this.x;
        const y = this.y + bob;

        ctx.translate(
            x + this.width / 2,
            y + this.height / 2
        );

        ctx.rotate(this.rotation);

        /* shadow */
        ctx.save();

        ctx.globalAlpha = this.grounded ? 0.2 : 0.1;
        ctx.fillStyle = "#302743";

        ctx.beginPath();

        ctx.ellipse(
            0,
            this.height / 2 + 7,
            this.width * 0.48,
            5,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

        /* back hair */
        ctx.fillStyle = "#4c294f";

        ctx.beginPath();

        ctx.arc(
            -this.width * 0.03,
            -this.height * 0.19,
            this.width * 0.44,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* body */
        ctx.fillStyle = "#ff8db8";

        roundRect(
            ctx,
            -this.width * 0.31,
            -this.height * 0.02,
            this.width * 0.62,
            this.height * 0.48,
            9
        );

        ctx.fill();

        /* shirt decoration */
        ctx.fillStyle = "#fff0a8";

        ctx.beginPath();

        ctx.arc(
            0,
            this.height * 0.15,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* head */
        ctx.fillStyle = "#ffd0b0";

        ctx.beginPath();

        ctx.arc(
            0,
            -this.height * 0.25,
            this.width * 0.37,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* hair */
        ctx.fillStyle = "#55304f";

        ctx.beginPath();

        ctx.arc(
            0,
            -this.height * 0.34,
            this.width * 0.38,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.arc(
            -this.width * 0.28,
            -this.height * 0.21,
            this.width * 0.13,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* eyes */
        ctx.fillStyle = "#33253a";

        ctx.beginPath();

        ctx.arc(
            -this.width * 0.13,
            -this.height * 0.24,
            2.2,
            0,
            Math.PI * 2
        );

        ctx.arc(
            this.width * 0.13,
            -this.height * 0.24,
            2.2,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* smile */
        ctx.strokeStyle = "#a95268";
        ctx.lineWidth = 1.5;

        ctx.beginPath();

        ctx.arc(
            0,
            -this.height * 0.16,
            6,
            0.1,
            Math.PI - 0.1
        );

        ctx.stroke();

        /* arms */
        ctx.strokeStyle = "#ffd0b0";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";

        ctx.beginPath();

        ctx.moveTo(
            -this.width * 0.3,
            this.height * 0.06
        );

        ctx.lineTo(
            -this.width * 0.46,
            this.height * 0.2 + legMove
        );

        ctx.moveTo(
            this.width * 0.3,
            this.height * 0.06
        );

        ctx.lineTo(
            this.width * 0.46,
            this.height * 0.2 - legMove
        );

        ctx.stroke();

        /* legs */
        ctx.strokeStyle = "#443052";
        ctx.lineWidth = 6;

        ctx.beginPath();

        ctx.moveTo(
            -this.width * 0.14,
            this.height * 0.43
        );

        ctx.lineTo(
            -this.width * 0.2 + legMove * 0.5,
            this.height * 0.62
        );

        ctx.moveTo(
            this.width * 0.14,
            this.height * 0.43
        );

        ctx.lineTo(
            this.width * 0.2 - legMove * 0.5,
            this.height * 0.62
        );

        ctx.stroke();

        /* shoes */
        ctx.fillStyle = "#fff0a8";

        ctx.beginPath();

        ctx.ellipse(
            -this.width * 0.22 + legMove * 0.5,
            this.height * 0.63,
            this.width * 0.14,
            4,
            0,
            0,
            Math.PI * 2
        );

        ctx.ellipse(
            this.width * 0.22 - legMove * 0.5,
            this.height * 0.63,
            this.width * 0.14,
            4,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    },

    getHitbox() {
        return {
            x: this.x + 7,
            y: this.y + 5,
            width: this.width - 14,
            height: this.height - 8
        };
    }
};

/* =========================
   OBSTACLES
========================= */

let obstacles = [];

const obstacleTypes = [
    "rock",
    "bush",
    "box",
    "plant",
    "brokenHeart"
];

function createObstacle() {
    const type =
        obstacleTypes[
            Math.floor(Math.random() * obstacleTypes.length)
        ];

    let obstacleWidth = 40;
    let obstacleHeight = 40;

    if (type === "rock") {
        obstacleWidth = 43;
        obstacleHeight = 34;
    }

    if (type === "bush") {
        obstacleWidth = 58;
        obstacleHeight = 38;
    }

    if (type === "box") {
        obstacleWidth = 43;
        obstacleHeight = 43;
    }

    if (type === "plant") {
        obstacleWidth = 32;
        obstacleHeight = 48;
    }

    if (type === "brokenHeart") {
        obstacleWidth = 46;
        obstacleHeight = 43;
    }

    const scale =
        Math.max(0.8, Math.min(1.15, width / 900));

    obstacleWidth *= scale;
    obstacleHeight *= scale;

    obstacles.push({
        type,
        x: width + 50,
        y: groundY - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight,
        rotation: (Math.random() - 0.5) * 0.08,
        passed: false
    });
}

function updateObstacles(dt) {
    const frame = dt / 16.666;

    obstacleTimer += dt;

    if (obstacleTimer >= nextObstacleTime) {
        createObstacle();

        obstacleTimer = 0;

        const difficulty = Math.min(
            0.75,
            score / 600
        );

        nextObstacleTime =
            850 +
            Math.random() * 900 -
            difficulty * 350;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];

        obstacle.x -= speed * frame;

        if (
            !obstacle.passed &&
            obstacle.x + obstacle.width < player.x
        ) {
            obstacle.passed = true;
        }

        if (obstacle.x + obstacle.width < -80) {
            obstacles.splice(i, 1);
        }
    }
}

function drawObstacle(obstacle) {
    const x = obstacle.x;
    const y = obstacle.y;
    const w = obstacle.width;
    const h = obstacle.height;

    ctx.save();

    ctx.translate(
        x + w / 2,
        y + h / 2
    );

    ctx.rotate(obstacle.rotation);

    ctx.translate(
        -w / 2,
        -h / 2
    );

    /* shadow */
    ctx.fillStyle = "rgba(45, 35, 50, 0.18)";

    ctx.beginPath();

    ctx.ellipse(
        w / 2,
        h + 5,
        w * 0.45,
        5,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    if (obstacle.type === "rock") {
        drawRock(w, h);
    }

    if (obstacle.type === "bush") {
        drawBush(w, h);
    }

    if (obstacle.type === "box") {
        drawBox(w, h);
    }

    if (obstacle.type === "plant") {
        drawPlant(w, h);
    }

    if (obstacle.type === "brokenHeart") {
        drawBrokenHeart(w, h);
    }

    ctx.restore();
}

function drawRock(w, h) {
    ctx.fillStyle = "#75677f";

    ctx.beginPath();

    ctx.moveTo(w * 0.05, h);
    ctx.lineTo(w * 0.15, h * 0.42);
    ctx.lineTo(w * 0.43, h * 0.12);
    ctx.lineTo(w * 0.77, h * 0.25);
    ctx.lineTo(w, h * 0.65);
    ctx.lineTo(w * 0.9, h);
    ctx.closePath();

    ctx.fill();

    ctx.fillStyle = "#968aa0";

    ctx.beginPath();

    ctx.moveTo(w * 0.2, h * 0.45);
    ctx.lineTo(w * 0.43, h * 0.2);
    ctx.lineTo(w * 0.57, h * 0.32);
    ctx.lineTo(w * 0.38, h * 0.48);
    ctx.closePath();

    ctx.fill();
}

function drawBush(w, h) {
    ctx.fillStyle = "#487d65";

    const circles = [
        [0.22, 0.55, 0.29],
        [0.5, 0.36, 0.35],
        [0.78, 0.55, 0.3]
    ];

    for (const c of circles) {
        ctx.beginPath();

        ctx.arc(
            w * c[0],
            h * c[1],
            Math.min(w, h) * c[2],
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.fillStyle = "#68a57d";

    ctx.beginPath();

    ctx.arc(
        w * 0.42,
        h * 0.32,
        h * 0.12,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

function drawBox(w, h) {
    ctx.fillStyle = "#e0a052";

    roundRect(
        ctx,
        1,
        1,
        w - 2,
        h - 2,
        6
    );

    ctx.fill();

    ctx.strokeStyle = "#9a623a";
    ctx.lineWidth = 3;

    ctx.stroke();

    ctx.strokeStyle = "#f4cb77";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(w * 0.15, h * 0.15);
    ctx.lineTo(w * 0.85, h * 0.85);

    ctx.moveTo(w * 0.85, h * 0.15);
    ctx.lineTo(w * 0.15, h * 0.85);

    ctx.stroke();

    ctx.fillStyle = "#fff0a6";
    ctx.font = `bold ${Math.max(12, w * 0.35)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", w / 2, h / 2);
}

function drawPlant(w, h) {
    ctx.strokeStyle = "#3c8c62";
    ctx.lineWidth = Math.max(4, w * 0.14);
    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(w / 2, h);
    ctx.lineTo(w / 2, h * 0.32);

    ctx.moveTo(w / 2, h * 0.65);
    ctx.lineTo(w * 0.22, h * 0.48);

    ctx.moveTo(w / 2, h * 0.55);
    ctx.lineTo(w * 0.78, h * 0.35);

    ctx.stroke();

    ctx.fillStyle = "#5aaa72";

    ctx.beginPath();

    ctx.ellipse(
        w * 0.21,
        h * 0.44,
        w * 0.2,
        h * 0.1,
        -0.5,
        0,
        Math.PI * 2
    );

    ctx.ellipse(
        w * 0.79,
        h * 0.32,
        w * 0.2,
        h * 0.1,
        0.5,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

function drawBrokenHeart(w, h) {
    ctx.fillStyle = "#d65b82";

    drawHeartPath(
        ctx,
        w * 0.5,
        h * 0.52,
        w * 0.4,
        h * 0.4
    );

    ctx.fill();

    ctx.strokeStyle = "#8d365b";
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(w * 0.52, h * 0.12);
    ctx.lineTo(w * 0.42, h * 0.39);
    ctx.lineTo(w * 0.55, h * 0.52);
    ctx.lineTo(w * 0.44, h * 0.76);

    ctx.stroke();

    ctx.fillStyle = "#f7a0b8";

    ctx.beginPath();

    ctx.arc(
        w * 0.32,
        h * 0.34,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

/* =========================
   COLLISION
========================= */

function checkCollision() {
    const a = player.getHitbox();

    for (const obstacle of obstacles) {
        const b = {
            x: obstacle.x + 5,
            y: obstacle.y + 5,
            width: obstacle.width - 10,
            height: obstacle.height - 7
        };

        const padding = 4;

        if (
            a.x + padding < b.x + b.width &&
            a.x + a.width - padding > b.x &&
            a.y + padding < b.y + b.height &&
            a.y + a.height - padding > b.y
        ) {
            return true;
        }
    }

    return false;
}

/* =========================
   BACKGROUND
========================= */

const clouds = [];

function initializeClouds() {
    clouds.length = 0;

    const amount = Math.max(
        5,
        Math.floor(width / 170)
    );

    for (let i = 0; i < amount; i++) {
        clouds.push({
            x: Math.random() * width,
            y: 60 + Math.random() * height * 0.3,
            width: 60 + Math.random() * 90,
            speed: 0.12 + Math.random() * 0.2,
            alpha: 0.45 + Math.random() * 0.3
        });
    }
}

function drawBackground(dt) {
    const skyGradient = ctx.createLinearGradient(
        0,
        0,
        0,
        height
    );

    skyGradient.addColorStop(0, "#7bcce9");
    skyGradient.addColorStop(0.6, "#b8e8ee");
    skyGradient.addColorStop(1, "#f6d6b0");

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    /* sun */
    const sunX = width * 0.78;
    const sunY = height * 0.2;
    const sunRadius = Math.min(55, width * 0.07);

    const sunGlow = ctx.createRadialGradient(
        sunX,
        sunY,
        2,
        sunX,
        sunY,
        sunRadius * 2.8
    );

    sunGlow.addColorStop(0, "rgba(255,238,158,0.8)");
    sunGlow.addColorStop(1, "rgba(255,238,158,0)");

    ctx.fillStyle = sunGlow;

    ctx.beginPath();

    ctx.arc(
        sunX,
        sunY,
        sunRadius * 2.8,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#fff0a6";

    ctx.beginPath();

    ctx.arc(
        sunX,
        sunY,
        sunRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* clouds */
    const frame = dt / 16.666;

    for (const cloud of clouds) {
        cloud.x -= cloud.speed * frame;

        if (cloud.x + cloud.width < -30) {
            cloud.x = width + Math.random() * 150;
            cloud.y = 50 + Math.random() * height * 0.3;
        }

        drawCloud(cloud);
    }

    /* distant hills */
    hillOffset -= speed * 0.08 * frame;

    drawHills(
        "#9cc7b0",
        height * 0.58,
        0.5,
        hillOffset
    );

    drawHills(
        "#72aa8d",
        height * 0.68,
        0.8,
        hillOffset * 1.3
    );

    /* ground */
    drawGround();
}

function drawCloud(cloud) {
    ctx.save();

    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = "#ffffff";

    const x = cloud.x;
    const y = cloud.y;
    const w = cloud.width;

    ctx.beginPath();

    ctx.arc(
        x + w * 0.25,
        y + 12,
        w * 0.18,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + w * 0.47,
        y,
        w * 0.25,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + w * 0.7,
        y + 12,
        w * 0.19,
        0,
        Math.PI * 2
    );

    ctx.rect(
        x + w * 0.15,
        y + 10,
        w * 0.65,
        22
    );

    ctx.fill();

    ctx.restore();
}

function drawHills(color, baseY, scale, offset) {
    ctx.fillStyle = color;

    const hillWidth = 360 * scale;

    ctx.beginPath();

    ctx.moveTo(0, height);

    let start = offset % hillWidth;

    if (start > 0) {
        start -= hillWidth;
    }

    for (
        let x = start;
        x < width + hillWidth;
        x += hillWidth
    ) {
        ctx.quadraticCurveTo(
            x + hillWidth * 0.25,
            baseY - 70 * scale,
            x + hillWidth * 0.5,
            baseY
        );

        ctx.quadraticCurveTo(
            x + hillWidth * 0.75,
            baseY - 85 * scale,
            x + hillWidth,
            baseY
        );
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    ctx.fill();
}

function drawGround() {
    groundOffset -= speed * 0.7;

    ctx.fillStyle = "#5c916c";

    ctx.fillRect(
        0,
        groundY,
        width,
        height - groundY
    );

    /* top line */
    ctx.fillStyle = "#76ad7a";

    ctx.fillRect(
        0,
        groundY,
        width,
        8
    );

    /* moving ground details */
    ctx.fillStyle = "rgba(36, 74, 54, 0.25)";

    const spacing = 60;

    let offset = groundOffset % spacing;

    for (
        let x = offset;
        x < width;
        x += spacing
    ) {
        ctx.fillRect(
            x,
            groundY + 30,
            25,
            3
        );

        ctx.fillRect(
            x + 35,
            groundY + 58,
            13,
            3
        );
    }

    /* small flowers */
    ctx.fillStyle = "#fff0a8";

    for (
        let x = offset + 20;
        x < width;
        x += 130
    ) {
        ctx.beginPath();

        ctx.arc(
            x,
            groundY + 20,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

function updateGroundPosition() {
    groundY = height * 0.78;

    if (height < 600) {
        groundY = height * 0.75;
    }

    if (player) {
        if (!gameRunning) {
            player.y = groundY - player.height;
        }
    }
}

/* =========================
   PARTICLES
========================= */

const particles = [];

function createParticle(
    x,
    y,
    options = {}
) {
    particles.push({
        x,
        y,
        vx: options.vx ?? (Math.random() - 0.5) * 3,
        vy: options.vy ?? (Math.random() - 0.5) * 3,
        gravity: options.gravity ?? 0.08,
        life: options.life ?? 500,
        maxLife: options.life ?? 500,
        size: options.size ?? 4,
        type: options.type ?? "circle",
        rotation: Math.random() * Math.PI * 2
    });
}

function createJumpParticles() {
    for (let i = 0; i < 8; i++) {
        createParticle(
            player.x + player.width / 2,
            groundY,
            {
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2,
                life: 350,
                size: 2 + Math.random() * 3
            }
        );
    }
}

function createLandingParticles() {
    for (let i = 0; i < 7; i++) {
        createParticle(
            player.x + player.width / 2,
            groundY,
            {
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 1.4,
                life: 280,
                size: 2 + Math.random() * 2
            }
        );
    }
}

function createCrashParticles() {
    for (let i = 0; i < 35; i++) {
        createParticle(
            player.x + player.width / 2,
            player.y + player.height / 2,
            {
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 9,
                gravity: 0.18,
                life: 700 + Math.random() * 400,
                size: 2 + Math.random() * 5,
                type: Math.random() > 0.5
                    ? "circle"
                    : "square"
            }
        );
    }
}

function updateParticles(dt) {
    const frame = dt / 16.666;

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx * frame;
        p.y += p.vy * frame;
        p.vy += p.gravity * frame;
        p.life -= dt;
        p.rotation += 0.08 * frame;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        const alpha =
            Math.max(0, p.life / p.maxLife);

        ctx.save();

        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ffe39b";

        if (p.type === "square") {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            ctx.fillRect(
                -p.size / 2,
                -p.size / 2,
                p.size,
                p.size
            );
        } else {
            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx.restore();
    }
}

/* =========================
   GAME LOOP
========================= */

function gameLoop(timestamp) {
    if (!gameRunning) return;

    if (!lastTime) {
        lastTime = timestamp;
    }

    let dt = timestamp - lastTime;

    lastTime = timestamp;

    dt = Math.min(dt, 40);

    if (!paused && !gameOver) {
        updateGame(dt);
    }

    drawGame(dt);

    animationFrame =
        requestAnimationFrame(gameLoop);
}

function updateGame(dt) {
    /* score */
    distance += speed * dt * 0.06;

    score = Math.floor(distance / 10);

    /* difficulty */
    speed = Math.min(
        15,
        6 + score * 0.012
    );

    player.update(dt);
    updateObstacles(dt);
    updateParticles(dt);

    if (screenShake > 0) {
        screenShake -= dt;
    }

    /* milestones */
    for (const value of Object.keys(milestones)) {
        const milestone = Number(value);

        if (
            score >= milestone &&
            !triggeredMilestones.has(milestone)
        ) {
            triggeredMilestones.add(milestone);
            showMilestone(milestones[milestone]);
        }
    }

    /* collision */
    if (checkCollision()) {
        triggerGameOver();
        return;
    }

    updateHUD();
}

function drawGame(dt) {
    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    ctx.save();

    if (screenShake > 0) {
        const intensity =
            Math.min(8, screenShake * 0.03);

        ctx.translate(
            (Math.random() - 0.5) * intensity,
            (Math.random() - 0.5) * intensity
        );
    }

    drawBackground(dt);

    for (const obstacle of obstacles) {
        drawObstacle(obstacle);
    }

    player.draw();

    drawParticles();

    ctx.restore();
}

/* =========================
   HUD
========================= */

function formatScore(value) {
    return String(Math.floor(value))
        .padStart(6, "0");
}

function updateHUD() {
    scoreText.textContent =
        formatScore(score);

    highScoreText.textContent =
        formatScore(highScore);
}

function updateStartHighScore() {
    startHighScore.textContent =
        formatScore(highScore);
}

/* =========================
   MILESTONE
========================= */

let milestoneTimeout = null;

function showMilestone(message) {
    milestoneMessage.textContent = message;

    milestoneMessage.classList.remove("show");

    void milestoneMessage.offsetWidth;

    milestoneMessage.classList.add("show");

    milestoneSound();

    for (let i = 0; i < 18; i++) {
        createParticle(
            width / 2,
            height * 0.25,
            {
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7,
                gravity: 0.08,
                life: 900,
                size: 2 + Math.random() * 4,
                type: "square"
            }
        );
    }

    clearTimeout(milestoneTimeout);

    milestoneTimeout = setTimeout(() => {
        milestoneMessage.classList.remove("show");
    }, 2200);
}

/* =========================
   GAME START
========================= */

function startGame() {
    initializeAudio();
    buttonSound();

    gameRunning = true;
    paused = false;
    gameOver = false;

    score = 0;
    distance = 0;
    speed = 6;

    obstacleTimer = 0;
    nextObstacleTime = 900;

    obstacles = [];
    particles.length = 0;

    triggeredMilestones.clear();

    screenShake = 0;

    player.reset();

    pauseOverlay.classList.remove("visible");

    startScreen.classList.remove("active");
    gameOverScreen.classList.remove("active");

    gameScreen.classList.add("active");

    updateHUD();

    lastTime = performance.now();

    cancelAnimationFrame(animationFrame);

    animationFrame =
        requestAnimationFrame(gameLoop);
}

/* =========================
   GAME OVER
========================= */

function triggerGameOver() {
    if (gameOver) return;

    gameOver = true;

    screenShake = 250;

    createCrashParticles();

    gameOverSound();

    player.velocityY = 0;

    if (score > highScore) {
        highScore = score;

        localStorage.setItem(
            "runForKakVanesHighScore",
            String(highScore)
        );
    }

    updateHUD();

    gameOverTimer = 0;

    setTimeout(() => {
        showGameOverScreen();
    }, 650);
}

function showGameOverScreen() {
    finalScore.textContent =
        formatScore(score);

    finalHighScore.textContent =
        formatScore(highScore);

    const firstPraise = getNewPraise();

    setPraiseText(firstPraise);

    updatePraiseCounter();

    gameScreen.classList.remove("active");

    gameOverScreen.classList.add("active");

    praiseSound();

    updateStartHighScore();
}

function setPraiseText(text) {
    praiseText.classList.remove("change");

    void praiseText.offsetWidth;

    praiseText.textContent = text;

    praiseText.classList.add("change");
}

function updatePraiseCounter() {
    praiseCounter.textContent =
        `${praiseShown} pujian sudah ditemukan • ${praises.length} total pujian`;
}

/* =========================
   RESTART
========================= */

function restartGame() {
    initializeAudio();
    buttonSound();

    gameOverScreen.classList.remove("active");

    setTimeout(() => {
        startGame();
    }, 150);
}

/* =========================
   NEW PRAISE
========================= */

function anotherPraise() {
    initializeAudio();

    const newPraise = getNewPraise();

    setPraiseText(newPraise);

    updatePraiseCounter();

    praiseSound();
}

/* =========================
   PAUSE
========================= */

function togglePause() {
    if (!gameRunning || gameOver) return;

    paused = !paused;

    if (paused) {
        pauseOverlay.classList.add("visible");
        pauseButton.textContent = "▶";
    } else {
        pauseOverlay.classList.remove("visible");
        pauseButton.textContent = "⏸";

        lastTime = performance.now();
    }

    buttonSound();
}

function resumeGame() {
    if (!paused) return;

    paused = false;

    pauseOverlay.classList.remove("visible");

    pauseButton.textContent = "⏸";

    lastTime = performance.now();

    buttonSound();
}

/* =========================
   MUTE
========================= */

function toggleMute() {
    muted = !muted;

    muteButton.textContent =
        muted ? "🔇" : "🔊";

    if (!muted) {
        initializeAudio();
        buttonSound();
    }
}

/* =========================
   INPUT
========================= */

document.addEventListener("keydown", (event) => {
    if (
        event.code === "Space" ||
        event.code === "ArrowUp"
    ) {
        event.preventDefault();

        if (
            startScreen.classList.contains("active")
        ) {
            startGame();
            return;
        }

        if (
            gameOverScreen.classList.contains("active")
        ) {
            return;
        }

        if (paused) {
            resumeGame();
            return;
        }

        player.jump();
    }

    if (event.code === "KeyP") {
        event.preventDefault();

        togglePause();
    }

    if (event.code === "KeyM") {
        event.preventDefault();

        toggleMute();
    }
});

/* Mobile / pointer controls */

canvas.addEventListener(
    "pointerdown",
    (event) => {
        if (!gameRunning) return;
        if (paused) return;
        if (gameOver) return;

        event.preventDefault();

        player.jump();
    },
    { passive: false }
);

/* =========================
   BUTTON EVENTS
========================= */

startButton.addEventListener("click", () => {
    startGame();
});

restartButton.addEventListener("click", () => {
    restartGame();
});

anotherPraiseButton.addEventListener(
    "click",
    () => {
        anotherPraise();
    }
);

pauseButton.addEventListener(
    "click",
    () => {
        togglePause();
    }
);

resumeButton.addEventListener(
    "click",
    () => {
        resumeGame();
    }
);

muteButton.addEventListener(
    "click",
    () => {
        toggleMute();
    }
);

/* =========================
   UTILITY DRAWING
========================= */

function roundRect(
    context,
    x,
    y,
    w,
    h,
    radius
) {
    const r = Math.min(
        radius,
        w / 2,
        h / 2
    );

    context.beginPath();

    context.moveTo(x + r, y);

    context.arcTo(
        x + w,
        y,
        x + w,
        y + h,
        r
    );

    context.arcTo(
        x + w,
        y + h,
        x,
        y + h,
        r
    );

    context.arcTo(
        x,
        y + h,
        x,
        y,
        r
    );

    context.arcTo(
        x,
        y,
        x + w,
        y,
        r
    );

    context.closePath();
}

function drawHeartPath(
    context,
    centerX,
    centerY,
    width,
    height
) {
    context.beginPath();

    const topY =
        centerY - height * 0.35;

    context.moveTo(
        centerX,
        centerY + height * 0.5
    );

    context.bezierCurveTo(
        centerX - width,
        centerY - height * 0.05,
        centerX - width * 0.8,
        topY - height * 0.25,
        centerX - width * 0.42,
        topY
    );

    context.bezierCurveTo(
        centerX - width * 0.15,
        topY - height * 0.2,
        centerX,
        topY,
        centerX,
        topY + height * 0.2
    );

    context.bezierCurveTo(
        centerX,
        topY,
        centerX + width * 0.15,
        topY - height * 0.2,
        centerX + width * 0.42,
        topY
    );

    context.bezierCurveTo(
        centerX + width * 0.8,
        topY - height * 0.25,
        centerX + width,
        centerY - height * 0.05,
        centerX,
        centerY + height * 0.5
    );

    context.closePath();
}

/* =========================
   INITIALIZATION
========================= */

function initializeGame() {
    resizeCanvas();

    initializeClouds();

    player.reset();

    updateStartHighScore();
    updateHUD();

    /* Initial background rendering */
    drawBackground(16);

    /* prevent browser scrolling */
    document.body.addEventListener(
        "touchmove",
        (event) => {
            if (gameRunning) {
                event.preventDefault();
            }
        },
        { passive: false }
    );
}

initializeGame();
