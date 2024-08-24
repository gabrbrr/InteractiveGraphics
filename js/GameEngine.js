import { Enemy } from './components/Enemy.js';
import { Player } from './components/Player.js';
export class GameEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500);
        this.renderer = new THREE.WebGLRenderer();
        this.entities = [];
        this.uiManager = null;
        this.level = 1;
        this.maxHealth = 1.0;
        this.health = this.maxHealth;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.onResize.bind(this));

        this.isRunning = false; // To track if the game is running
        this.enemySpawnInterval = null;
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }

    start() {
        if (this.isRunning) return; // Prevent multiple calls to start
        this.isRunning = true;
        this.startEnemySpawning();
        const animate = () => {
            if (!this.isRunning) return; // Stop the animation if the game is paused

            requestAnimationFrame(animate);
            const now = performance.now();
        this.entities.forEach((entity, index) => {
            if (entity instanceof THREE.Points) {
                const elapsed = now - entity.userData.birthTime;
                const positions = entity.geometry.attributes.position.array;
                const velocities = entity.geometry.attributes.velocity.array;

                // Update particle positions
                for (let i = 0; i < positions.length / 3; i++) {
                    positions[i * 3] += velocities[i * 3] * 0.01;
                    positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.01;
                    positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.01;
                }
                entity.geometry.attributes.position.needsUpdate = true;

                // Fade out particles over time
                entity.material.opacity = Math.max(0, 1.0 - elapsed / 1000);

                // Remove the explosion after 1 second
                if (elapsed > 1000) {
                    this.scene.remove(entity);
                    this.entities.splice(index, 1);
                }
            } else {
                entity.update(); // Call update on other entities
            }
        });
            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    stop() {
        this.isRunning = false; // Stop the game loop
        this.stopEnemySpawning(); // Stop enemy spawning
    }
    reset() {
        window.location.reload();
    }

    startEnemySpawning() {
            this.enemySpawnInterval = setInterval(() => {
               this.entities.find(entity => entity instanceof Enemy).spawnEnemy(); // Call spawnEnemy from Enemy class
            }, 2000); // Spawn an enemy every 2 seconds
    }

    stopEnemySpawning() {
        if (this.enemySpawnInterval) {
            clearInterval(this.enemySpawnInterval);
            this.enemySpawnInterval = null;
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    levelUp() {
        const enemy = this.entities.find(entity => entity instanceof Enemy);
        this.level++;
        if (enemy) {
            enemy.increaseDifficulty(); // Increase difficulty
        }
        this.uiManager.update(); // Example of adding score on level-up
    }

    setHealth(health) {
        this.health = health;
        const player=this.entities.find(entity => entity instanceof Player);
        this.uiManager.update();
        if(this.health<=0  && player){
            player.CameraPosition = new THREE.Vector3(0, 10, -20);
            this.scene.remove(player.spaceship);
            this.createExplosion(player.spaceship.position,player, () => {
                // After explosion finishes, call game over
                this.uiManager.triggerGameOver();
            });
        }
        
    }
    createExplosion(position,element,onComplete) {
        const totalObjects = 20;
        const movementSpeed = 50;
        const objectSize = 0.15;
        var color=null;
        if (element instanceof Player){
            color = 0xFF0FFF;
        }
        else{
            color=0x6A5ACD;
        }
        
        // Geometry to hold particles
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(totalObjects * 3); // Each vertex needs 3 values (x, y, z)
        const velocities = new Float32Array(totalObjects * 3); // Velocities for each particle

        // Populate positions and velocities
        for (let i = 0; i < totalObjects; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;

            velocities[i * 3] = (Math.random() - 0.5) * movementSpeed;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * movementSpeed;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * movementSpeed;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        // Material for the particles
        const material = new THREE.PointsMaterial({
            size: objectSize,
            color: color,
            transparent: true,
            opacity: 1.0,
        });

        // Create particle system
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        // Store the particles and their creation time
        particles.userData = { birthTime: performance.now(), geometry };
        this.addEntity(particles);
        setTimeout(() => {
            this.scene.remove(particles);
            this.entities = this.entities.filter(entity => entity !== particles);
            if (onComplete) onComplete(); // Call the callback after explosion
        }, 1000); // Wait 1 second for the explosion to finish
    }
    

   
    
}
