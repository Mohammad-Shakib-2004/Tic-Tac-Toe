// Splash Screen
const splashScreen = document.getElementById('splashScreen');
const enterGameButton = document.getElementById('enterGameButton');
const mainContent = document.getElementById('mainContent');

enterGameButton.addEventListener('click', () => {
    splashScreen.style.display = 'none';
    mainContent.style.display = 'block';
    backgroundMusic.volume = 0.3;
    backgroundMusic.play();
});

// Background Color Change
setInterval(() => {
    const colors = ['#ffcccb', '#ffe4e1', '#f5f5f5', '#e6e6fa', '#f0f8ff', '#d3f8e2', '#a2d2ff'];
    document.body.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
}, 2000);

// Game Variables
const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('resetButton');
const playFriendButton = document.getElementById('playFriend');
const playComputerButton = document.getElementById('playComputer');
const playerXNameInput = document.getElementById('playerXNameInput');
const playerONameInput = document.getElementById('playerONameInput');
const startGameButton = document.getElementById('startGameButton');
const difficultySelection = document.getElementById('difficultySelection');
const easyModeButton = document.getElementById('easyMode');
const mediumModeButton = document.getElementById('mediumMode');
const hardModeButton = document.getElementById('hardMode');
const gameStatus = document.getElementById('gameStatus');
const soundToggle = document.getElementById('soundToggle');

// Audio Elements
const backgroundMusic = document.getElementById('backgroundMusic');
const tapSound = document.getElementById('tapSound');
const winSound = document.getElementById('winSound');
const tieSound = document.getElementById('tieSound');

let currentPlayer = 'X';
let boardState = Array(9).fill(null);
let gameActive = false;
let playMode = ''; // 'friend' or 'computer'
let difficulty = 'easy'; // Default difficulty
let playerXName = 'Player X';
let playerOName = 'Player O';
let soundOn = true;

// Sound Toggle
soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.textContent = `Sound: ${soundOn ? 'On' : 'Off'}`;
    if (soundOn) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
});

// Play Sound Helper
function playSound(sound) {
    if (soundOn) {
        sound.currentTime = 0;
        sound.play();
    }
}

// Check Winner
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const [a, b, c] of winningCombinations) {
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    return null;
}

// Handle Move
function handleMove(index) {
    if (!gameActive || boardState[index]) return;

    boardState[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    playSound(tapSound);

    const winner = checkWinner();
    if (winner) {
        gameStatus.textContent = `${winner === 'X' ? playerXName : playerOName} Wins!`;
        playSound(winSound);
        gameActive = false;
    } else if (!boardState.includes(null)) {
        gameStatus.textContent = "It's a Tie!";
        playSound(tieSound);
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (playMode === 'computer' && currentPlayer === 'O') {
            setTimeout(computerMove, 500);
        } else {
            gameStatus.textContent = `It's ${currentPlayer === 'X' ? playerXName : playerOName}'s Turn`;
        }
    }
}

// Computer Move Logic
function computerMove() {
    let moveIndex;

    // Easy Mode: Random Move
    if (difficulty === 'easy') {
        const emptyCells = boardState.map((cell, idx) => (cell === null ? idx : null)).filter(idx => idx !== null);
        moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // Medium Mode: A basic strategy (blocking the opponent or taking the center if available)
    else if (difficulty === 'medium') {
        moveIndex = mediumAI();
    }

    // Hard Mode: Implementing a simple Minimax strategy (competitive AI)
    else if (difficulty === 'hard') {
        moveIndex = hardAI();
    }

    handleMove(moveIndex);
}

// Medium AI - Block or Take the Center
function mediumAI() {
    // If the center is empty, take it
    if (boardState[4] === null) {
        return 4;
    }

    // Otherwise, try to block the player if they are about to win
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const [a, b, c] of winningCombinations) {
        const cellsToCheck = [a, b, c];
        const emptyCells = cellsToCheck.filter(idx => boardState[idx] === null);
        if (emptyCells.length === 1) {
            return emptyCells[0];
        }
    }

    // Otherwise, pick a random empty cell
    return boardState.findIndex(cell => cell === null);
}

// Hard AI - Minimax Algorithm (Best move calculation)
function hardAI() {
    const emptyCells = boardState.map((cell, idx) => (cell === null ? idx : null)).filter(idx => idx !== null);

    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < emptyCells.length; i++) {
        const index = emptyCells[i];
        boardState[index] = 'O';
        let score = minimax(boardState, false);
        boardState[index] = null;
        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }
    }

    return bestMove;
}

// Minimax Algorithm to calculate the best score
function minimax(board, isMaximizing) {
    const winner = checkWinner();
    if (winner === 'O') return 1;
    if (winner === 'X') return -1;
    if (!board.includes(null)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                let score = minimax(board, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                let score = minimax(board, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Reset Game
function resetGame() {
    boardState.fill(null);
    cells.forEach(cell => (cell.textContent = ''));
    currentPlayer = 'X';
    gameStatus.textContent = '';
    gameActive = false;
}

// Start Game
startGameButton.addEventListener('click', () => {
    playerXName = playerXNameInput.value || 'Player X';
    playerOName = playerONameInput.value || (playMode === 'friend' ? 'Player O' : 'Computer');
    gameStatus.textContent = `It's ${playerXName}'s Turn`;
    gameActive = true;
    gameStatus.style.display = 'block';
});

// Mode Selection
playFriendButton.addEventListener('click', () => {
    playMode = 'friend';
    difficultySelection.style.display = 'none';
    playerXNameInput.style.display = 'inline-block';
    playerONameInput.style.display = 'inline-block';
    gameStatus.textContent = `It's ${playerXName}'s Turn`;
    gameStatus.style.display = 'block';
    resetGame();
});

playComputerButton.addEventListener('click', () => {
    playMode = 'computer';
    difficultySelection.style.display = 'inline-block';
    playerXNameInput.style.display = 'none';
    playerONameInput.style.display = 'none';
    gameStatus.textContent = `It's ${playerXName}'s Turn`;
    gameStatus.style.display = 'block';
    resetGame();
});

// Difficulty Selection
easyModeButton.addEventListener('click', () => {
    difficulty = 'easy';
    difficultySelection.style.display = 'none';
    gameStatus.textContent = `It's ${playerXName}'s Turn`;
    gameActive = true;
});

mediumModeButton.addEventListener('click', () => {
    difficulty = 'medium';
    difficultySelection.style.display = 'none';
    gameStatus.textContent = `It's ${playerXName}'s Turn`;
    gameActive = true;
});

hardModeButton.addEventListener('click', () => {
    difficulty = 'hard';
    difficultySelection.style.display = 'none';
    gameStatus.textContent = `It's ${playerXName}'s Turn`;
    gameActive = true;
});

// Cell Event Listeners
cells.forEach((cell, index) => cell.addEventListener('click', () => handleMove(index)));

// Reset Button
resetButton.addEventListener('click', resetGame);
