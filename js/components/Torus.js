export class Torus {
    constructor(player, gameEngine) {
        this.player = player;
        this.gameEngine=gameEngine;
        this.torus = null;
        this.torusTraversed = 0;
        this.totalTorus = 5;
        this.range2d=20;
        this.range3d=100;
    }
    init(scene) {
        this.scene = scene;
        this.torusGeometry = new THREE.TorusGeometry(2.5, 0.3, 2, 4);
        this.torusMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        this.axisHelper = new THREE.AxesHelper(50);
    }
    spawnTorus() {
        
        this.torus = new THREE.Mesh(this.torusGeometry, this.torusMaterial);
        const axisHelper = new THREE.AxesHelper(5); // Adjust the size as needed
        this.torus.add(axisHelper);
        const spaceshipDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.spaceship.quaternion);
        
        
        // Random offsets for X and Y to spread the asteroids around the spaceship
        
        const xOffset = (Math.random() - 0.5) * (this.gameEngine.in2DMode ? this.range2d : this.range3d);
        const yOffset = (Math.random() - 0.5) * (this.gameEngine.in2DMode ? this.range2d : this.range3d);
        
        // Calculate the new position
        var cloneposition=this.player.spaceship.position.clone()
        if(!this.gameEngine.in2DMode){
            var newPosition = cloneposition.add(spaceshipDirection.clone().multiplyScalar(this.range3d));
            newPosition.y += yOffset;
            
        }
        else{
            this.torus.rotation.x=Math.PI/2;
            var newPosition = cloneposition.add(spaceshipDirection.clone().multiplyScalar(this.range2d));
            this.torus.scale.set(0.5, 0.5, 0.5);
        }
        newPosition.x += xOffset;
        
        // Set the new position for the asteroid
        this.torus.position.copy(newPosition);
        this.scene.add(this.torus);
    }

    update() { // Add 'scene' parameter to remove torus from scene
        if (this.torus && this.player.spaceship.position.distanceTo(this.torus.position) < 2) {
            this.scene.remove(this.torus);
            this.torus = null;
            this.torusTraversed++;
            this.spawnTorus();
            if (this.torusTraversed == this.totalTorus) {
                if (this.gameEngine.levelUp) {
                    this.gameEngine.levelUp(); // Call the level-up callback
                    this.torusTraversed=0;
                }
            }
        }
    }
    switch(){
        this.torus = null;
        this.torusTraversed=0;
        if(this.torus){
            this.scene.remove(this.torus);
        }
        
        this.spawnTorus();      

    }
}
