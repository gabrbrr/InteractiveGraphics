export class UIManager {
    constructor(gameEngine, initializeGame) {
        this.gameEngine = gameEngine;
        this.initializeGame = initializeGame;

        // Existing UI elements
        this.healthElement = document.getElementById('health');
        this.scoreElement = document.getElementById('score');

        // Menu Buttons
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.quitButton = document.getElementById('quitButton');

        this.isPaused = false;

        this.initializeMenuListeners();
    }

    update() {
        this.updateHealthBar();
        this.updateLevelIndicator();
    }

    updateHealthBar() {
        const healthBar = document.getElementById('healthBar').firstElementChild;
        healthBar.style.width = `${Math.max(0,this.gameEngine.health) * 100}%`;
    }
    triggerGameOver() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        gameOverScreen.style.display = 'flex'; // Show the Game Over screen
    
        // Add restart functionality
        const restartButton = document.getElementById('restartButton');
        restartButton.addEventListener('click', () => {
            gameOverScreen.style.display = 'none'; // Hide the Game Over screen
            this.gameEngine.reset();  // Reset the game engine
        });
    }

    // Level Indicator Update
    updateLevelIndicator() {
        document.getElementById('levelIndicator').innerText = `Level: ${this.gameEngine.level}`;
    }

    initializeMenuListeners() {
        this.startButton.addEventListener('click', () => this.onStartButtonClick());
        this.pauseButton.addEventListener('click', () => this.onPauseButtonClick());
        this.quitButton.addEventListener('click', () => this.onQuitButtonClick());
    }

    onStartButtonClick() {
        if (!this.isPaused && !this.gameEngine.isRunning) {
            this.initializeGame();
            this.gameEngine.start();
            this.isPaused = false;
        } else if (this.isPaused) {
            this.gameEngine.start();
            this.isPaused = false;
        }
    }

    onPauseButtonClick() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.gameEngine.stop();
        } else {
            this.gameEngine.start();
        }
    }

    onQuitButtonClick() {
        if (confirm('Are you sure you want to quit?')) {
            window.location.reload();
        }
    }
}
