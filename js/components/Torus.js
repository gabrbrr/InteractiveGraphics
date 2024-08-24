export class Torus {
    constructor(player, levelUpCallback) {
        this.player = player;
        this.torus = null;
        this.torusTraversed = 0;
        this.totalTorus = 5;
        this.levelUpCallback = levelUpCallback; // Add a callback function for level-up
    }
    init(scene) {
        this.scene = scene;
        this.torusGeometry = new THREE.TorusGeometry(2.5, 0.3, 2, 4);
        this.torusMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    }
    spawnTorus() {
        
        this.torus = new THREE.Mesh(this.torusGeometry, this.torusMaterial);
        
        const spaceshipDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.spaceship.quaternion);
        
        
        // Random offsets for X and Y to spread the asteroids around the spaceship
        const xOffset = (Math.random() - 0.5) * 50; // Adjust the multiplier to control the spread
        const yOffset = (Math.random() - 0.5) * 50; // Adjust the multiplier to control the spread
        
        // Calculate the new position
        const newPosition = this.player.spaceship.position.clone().add(spaceshipDirection.clone().multiplyScalar(100));
        newPosition.x += xOffset;
        newPosition.y += yOffset;
        
        // Set the new position for the asteroid
        this.torus.position.copy(newPosition);
        this.scene.add(this.torus);
        console.log("torus")
    }

    update() { // Add 'scene' parameter to remove torus from scene
        if (this.torus && this.player.spaceship.position.distanceTo(this.torus.position) < 2) {
            this.scene.remove(this.torus);
            this.torus = null;
            this.torusTraversed++;
            if (this.torusTraversed < this.totalTorus) {
                this.spawnTorus();
            } else {
                if (this.levelUpCallback) {
                    this.levelUpCallback(); // Call the level-up callback
                }
            }
        }
    }
}
