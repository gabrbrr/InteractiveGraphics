export class Enemy {
    constructor(player,gameEngine) {
        this.player = player;
        this.gameEngine=gameEngine;
        this.enemies = [];
        this.enemy_bb=new THREE.Box3();
        this.enemyBullets = [];
        this.difficulty = 1;
        this.enemyModel = null;
        
        
    }

    init(scene) {
        this.scene = scene;
        const loader = new THREE.GLTFLoader();
        loader.load('assets/spaceship_ezno.glb', (gltf) => {
            this.enemyModel = gltf.scene;
            this.enemyModel.scale.set(0.15,0.15,0.15);
        }, undefined, (error) => {
            console.error('An error occurred while loading the spaceship model', error);
        });
        this.bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        this.bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        //this.spawnInterval = setInterval(() => this.spawnEnemy(), 5000);
    }
    spawnEnemy() {
        if (!this.enemyModel) {
            console.warn('Enemy model is not loaded yet.');
            return;
        }

        // Clone the loaded model to create a new enemy
        const enemy = this.enemyModel.clone();
        const distances = [80, -30];
        const enemyOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            distances[Math.floor(Math.random() * distances.length)],
        );
        enemyOffset.applyQuaternion(this.player.spaceship.quaternion);
        enemy.position.copy(this.player.spaceship.position).add(enemyOffset);
        this.scene.add(enemy);
        this.enemies.push(enemy);
    }
a
    update() {
        
        this.enemies.forEach((enemy, index) => {
            const directionToPlayer = new THREE.Vector3().subVectors( this.player.spaceship.position,enemy.position).normalize();
            
            // Create a quaternion representing the rotation towards the spaceship
            const targetQuaternion = new THREE.Quaternion();
            const lookAtPosition = this.player.spaceship.position.clone();
            enemy.lookAt(lookAtPosition);
            targetQuaternion.copy(enemy.quaternion);

            // Calculate rotation speed based on difficulty (lower speed at higher difficulty)
            const rotationSpeed = Math.max(0.01, 0.01 / this.difficulty); // Adjust 0.1 as needed

            // Smoothly interpolate the enemy's rotation towards the target rotation
            enemy.quaternion.slerp(targetQuaternion, rotationSpeed);

            // Move the enemy towards the spaceship
            enemy.position.add(directionToPlayer.multiplyScalar(0.05 * this.difficulty));


            if (Math.random() < 0.006 * this.difficulty) {
                    this.shootEnemyBullet(enemy);
            }

            // Collision detection between bullets and enemies
            this.player.bullets.forEach((bullet, bulletIndex) => {
                if (bullet.position.distanceTo(enemy.position) < 0.5) {
                    this.scene.remove(enemy);
                    this.scene.remove(bullet);
                    this.enemies.splice(index, 1);
                    this.gameEngine.createExplosion(enemy.position,enemy);
                    this.player.bullets.splice(bulletIndex, 1);
                }
            });

            if (enemy.position.distanceTo(this.player.spaceship.position) < 0.5) {
                enemy.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.computeBoundingBox();
                        this.enemy_bb.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld);
                    }
                });
                if(this.player.spaceship_bb.intersect(this.enemy_bb)){
                    var health = this.gameEngine.health-2/3*this.gameEngine.maxHealth;  // Reduce health by 1/3 if hit by a bullet
                    this.gameEngine.setHealth(health);
                    this.scene.remove(enemy);
                    this.enemies.splice(index, 1);
                    this.gameEngine.createExplosion(enemy.position,enemy);
                }
            }
        });
        this.updateEnemyBullets();
    }

    shootEnemyBullet(enemy) {
        const bullet = new THREE.Mesh(this.bulletGeometry, this.bulletMaterial);
        bullet.position.copy(enemy.position);
        var enemyBulletSpeed=0.3*this.difficulty;
        const bulletDirection = new THREE.Vector3().subVectors(this.player.spaceship.position,enemy.position).normalize();
        bullet.userData.velocity = bulletDirection.clone().multiplyScalar(enemyBulletSpeed);
        this.scene.add(bullet);
        this.enemyBullets.push(bullet);
    }

    updateEnemyBullets() {
        this.enemyBullets.forEach((bullet, index) => {
            bullet.position.add(bullet.userData.velocity);
            if (bullet.position.distanceTo(this.player.spaceship.position) < 0.5) {
                this.scene.remove(bullet);
                this.enemyBullets.splice(index, 1);
                var health = this.gameEngine.health-1/3*this.gameEngine.maxHealth;  // Reduce health by 1/3 if hit by a bullet
                this.gameEngine.setHealth(health);
        }
        });
    }
    increaseDifficulty() {
        this.difficulty += 1; // Increase difficulty (you can adjust this logic)
    }
    

}
