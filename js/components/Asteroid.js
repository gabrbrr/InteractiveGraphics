
export class Asteroid {
    constructor(player,gameEngine) {
        this.gameEngine=gameEngine;
        this.player=player
        this.asteroids = [];
        this.asteroid_bb= new THREE.Sphere();
        this.maxAsteroids = 100;
        this.asteroidDistanceThreshold = 350;
        this.maxrespawnDistance = 310;
        this.minrespawnDistance = 309.8;
        this.asteroidLoader = new THREE.GLTFLoader();
        this.asteroidModel = null;
    }

    async init(scene) {
        try {
            await this.loadAsteroidModel();
            for (let i = 0; i < this.maxAsteroids; i++) {
                this.spawnAsteroid(scene);
            }
        } catch (error) {
            console.error('Error loading asteroid model:', error);
        }
    }

    loadAsteroidModel() {
        return new Promise((resolve, reject) => {
            this.asteroidLoader.load(
                'assets/asteroid.glb',
                (gltf) => {
                    // Store the loaded model
                    this.asteroidModel = gltf.scene;
                    resolve();
                },
                undefined,
                reject
            );
        });
    }

    spawnAsteroid(scene) {
        const asteroid = this.asteroidModel.clone();
        const size = Math.random() * 0.5;
        asteroid.scale.set(size, size, size);

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * (this.maxrespawnDistance - this.minrespawnDistance) + this.minrespawnDistance;
        const x = Math.cos(angle) * distance;
        const y = (Math.random() - 0.5) * (this.maxrespawnDistance - this.minrespawnDistance);
        const z = Math.sin(angle) * distance;

        asteroid.position.set(x, y, z);
        scene.add(asteroid);
        this.asteroids.push(asteroid);
    }

    update() {
        this.asteroids.forEach(asteroid => {
            const distance = asteroid.position.distanceTo(this.player.spaceship.position);
            if (distance > this.asteroidDistanceThreshold) {
                this.repositionAsteroid(asteroid, this.player.spaceship);
            }
            else if(this.player.spaceship.position.distanceTo(asteroid.position) < 5){
                asteroid.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.computeBoundingSphere();  // Compute bounding sphere instead of box for spherical objects
                        this.asteroid_bb.copy(child.geometry.boundingSphere).applyMatrix4(child.matrixWorld);
                    }
                });
                this.player.spaceship.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.computeBoundingBox();
                        this.player.spaceship_bb.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld);
                    }
                });
                        if (this.player.spaceship_bb.intersectsSphere(this.asteroid_bb) ) {
                            var health = this.gameEngine.health-this.gameEngine.maxHealth; 
                            this.gameEngine.setHealth(health);
                    }
            
                };
        });
    }

    repositionAsteroid(asteroid, spaceship) {
        // Get the spaceship's position and forward direction
        const spaceshipPosition = spaceship.position.clone();
        const spaceshipDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(spaceship.quaternion);
        
        // Random distance in front of the spaceship
        const distance = Math.random() * (this.maxrespawnDistance - this.minrespawnDistance) + this.minrespawnDistance;
        
        // Random offsets for X and Y to spread the asteroids around the spaceship
        const xOffset = (Math.random() - 0.5) * 200; // Adjust the multiplier to control the spread
        const yOffset = (Math.random() - 0.5) * 200; // Adjust the multiplier to control the spread
        
        // Calculate the new position
        const newPosition = spaceshipPosition.clone().add(spaceshipDirection.clone().multiplyScalar(distance));
        newPosition.x += xOffset;
        newPosition.y += yOffset;
        
        // Set the new position for the asteroid
        asteroid.position.copy(newPosition);
    }
    
}
