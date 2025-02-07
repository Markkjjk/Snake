const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverDiv = document.getElementById('gameOver');
const finalScoreSpan = document.getElementById('finalScore');
const playerNameInput = document.getElementById('playerName');
const startGameButton = document.getElementById('startGameButton');
const toggleModeButton = document.getElementById('toggleModeButton');
const playAgainButton = document.getElementById('playAgain');
const rankingList = document.getElementById('rankingList');
const controls = document.getElementById('controls');
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

let playerSnake = [{ x: 200, y: 200 }];
let computerSnake = [{ x: 100, y: 100 }];
let food = { x: 0, y: 0 };
let playerDx = 10;
let playerDy = 0;
let computerDx = 0;
let computerDy = 10;
let playerScore = 0;
let computerScore = 0;
let gameOver = false;
let isVsComputer = false;
let ranking = JSON.parse(localStorage.getItem('ranking')) || [];

function getRandomFoodPosition() {
    return {
        x: Math.floor(Math.random() * (canvas.width / 10)) * 10,
        y: Math.floor(Math.random() * (canvas.height / 10)) * 10
    };
}

function drawSnake(snake, color) {
    ctx.fillStyle = color;
    snake.forEach(part => ctx.fillRect(part.x, part.y, 10, 10));
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 10, 10);
}

function moveSnake(snake, dx, dy) {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x >= canvas.width) head.x = 0;
    if (head.x < 0) head.x = canvas.width - 10;
    if (head.y >= canvas.height) head.y = 0;
    if (head.y < 0) head.y = canvas.height - 10;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        if (snake === playerSnake) playerScore += 10;
        else computerScore += 10;
        food = getRandomFoodPosition();
    } else {
        snake.pop();
    }
}

function checkCollision(snake) {
    const head = snake[0];
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function calculateComputerDirection() {
    const head = computerSnake[0];
    if (head.x < food.x) return { dx: 10, dy: 0 }; 
    if (head.x > food.x) return { dx: -10, dy: 0 }; 
    if (head.y < food.y) return { dx: 0, dy: 10 }; 
    if (head.y > food.y) return { dx: 0, dy: -10 }; 
    return { dx: computerDx, dy: computerDy }; 
}

function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake(playerSnake, 'green');
    if (isVsComputer) drawSnake(computerSnake, 'blue');
    drawFood();

    moveSnake(playerSnake, playerDx, playerDy);

    if (isVsComputer) {
        const direction = calculateComputerDirection();
        computerDx = direction.dx;
        computerDy = direction.dy;
        moveSnake(computerSnake, computerDx, computerDy);
    }

    if (checkCollision(playerSnake) || (isVsComputer && checkCollision(computerSnake))) {
        gameOver = true;
        finalScoreSpan.textContent = playerScore;
        gameOverDiv.classList.remove('hidden');
        updateRanking();
    } else {
        setTimeout(updateGame, 100);
    }
}

function startGame() {
    if (!playerNameInput.value.trim()) {
        alert("Por favor, insira seu nome antes de começar.");
        return;
    }

    playerSnake = [{ x: 200, y: 200 }];
    computerSnake = [{ x: 100, y: 100 }];
    food = getRandomFoodPosition();
    playerDx = 10;
    playerDy = 0;
    computerDx = 0;
    computerDy = 10;
    playerScore = 0;
    computerScore = 0;
    gameOver = false;
    startScreen.classList.add('hidden');
    gameOverDiv.classList.add('hidden');
    controls.classList.remove('hidden');
    updateGame();
}

function updateRanking() {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        ranking.push({ name: playerName, score: playerScore });
        ranking.sort((a, b) => b.score - a.score);
        ranking = ranking.slice(0, 5);
        localStorage.setItem('ranking', JSON.stringify(ranking));
        displayRanking();
    }
}

function displayRanking() {
  rankingList.innerHTML = '';
  ranking.slice(0, 5).forEach((entry, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
      rankingList.appendChild(li);
  });
}

document.addEventListener('keydown', e => {
    if (gameOver) return;
    switch (e.key) {
        case 'ArrowUp': if (playerDy === 0) { playerDx = 0; playerDy = -10; } break;
        case 'ArrowDown': if (playerDy === 0) { playerDx = 0; playerDy = 10; } break;
        case 'ArrowLeft': if (playerDx === 0) { playerDx = -10; playerDy = 0; } break;
        case 'ArrowRight': if (playerDx === 0) { playerDx = 10; playerDy = 0; } break;
    }
});

upButton.addEventListener('click', () => { if (playerDy === 0) { playerDx = 0; playerDy = -10; } });
downButton.addEventListener('click', () => { if (playerDy === 0) { playerDx = 0; playerDy = 10; } });
leftButton.addEventListener('click', () => { if (playerDx === 0) { playerDx = -10; playerDy = 0; } });
rightButton.addEventListener('click', () => { if (playerDx === 0) { playerDx = 10; playerDy = 0; } });

toggleModeButton.addEventListener('click', () => {
    isVsComputer = !isVsComputer;
    toggleModeButton.textContent = isVsComputer ? "Modo: Versus Computador" : "Modo: Solo";
});

startGameButton.addEventListener('click', startGame);

playAgainButton.addEventListener('click', () => {
    startGame();
});

displayRanking();