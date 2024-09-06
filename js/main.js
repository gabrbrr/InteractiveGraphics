import { GameEngine } from './GameEngine.js';
import { Player } from './components/Player.js';
import { Environment } from './Environment.js';
import { Enemy } from './components/Enemy.js';
import { UIManager } from './UIManager.js';
import { Asteroid } from './components/Asteroid.js';
import { Torus } from './components/Torus.js';

const gameEngine = new GameEngine();
const uiManager = new UIManager(gameEngine, initializeGame);

async function initializeGame() {
    const player = new Player(gameEngine);
    const environment = new Environment();
    const asteroid = new Asteroid(player,gameEngine);
    const torus = new Torus(player,gameEngine,gameEngine.levelUp);
    const enemy = new Enemy(player, gameEngine);

    try {
        await Promise.all([
            player.init(gameEngine.scene, gameEngine.renderer),
            environment.init(gameEngine.scene),
            asteroid.init(gameEngine.scene),
            torus.init(gameEngine.scene),
            enemy.init(gameEngine.scene)
        ]);

        gameEngine.addEntity(player);
        gameEngine.addEntity(environment);
        gameEngine.addEntity(enemy);
        gameEngine.addEntity(asteroid);
        gameEngine.addEntity(torus);
        gameEngine.setUIManager(uiManager);
        torus.spawnTorus();
    } catch (error) {
        console.error('Failed to load assets:', error);
    }
}

