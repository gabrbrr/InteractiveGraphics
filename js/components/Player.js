
export class Player {
    constructor(gameEngine) {
        this.gameEngine=gameEngine;
        this.spaceship = null;
        this.spaceship_bb= new THREE.Box3();
        this.speed = 0.1;
        this.maxSpeed = 0.5;
        this.acceleration = 0.01;
        this.bullets = [];
        this.bulletGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        this.bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0FFF });
        this.controls = { yawLeft: false, yawRight: false, pitchUp: false, pitchDown: false, rollLeft: false, rollRight: false, accelerating: false };
        
    
    }

    init(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        
        return this.loadSpaceshipModel().then(() => {
            this.setupControls();
        });
    }

    loadSpaceshipModel() {
        return new Promise((resolve, reject) => {
            const gltfLoader = new THREE.GLTFLoader();
            gltfLoader.load('assets/light_fighter_spaceship_-_free_-.glb', (gltf) => {
                this.spaceship = gltf.scene;
                this.spaceship.scale.set(0.1, 0.1, 0.1);
                this.spaceship.position.z = -5;

                this.scene.add(this.spaceship);
                resolve();
            }, undefined, (error) => {
                reject(error);
            });
        });
    }
    setupControls() {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
        switch (event.key) {
            case 'a': this.controls.yawLeft = true; break;
            case 'd': this.controls.yawRight = true; break;
            case 'ArrowLeft': this.controls.rollRight = true; break;
            case 'ArrowRight': this.controls.rollLeft = true; break;
            case 'w': this.controls.pitchUp = true; break;
            case 's': this.controls.pitchDown = true; break;
            case ' ': this.shootBullet(); break;
            case 'e': this.controls.accelerating = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.key) {
            case 'a': this.controls.yawLeft = false; break;
            case 'd': this.controls.yawRight = false; break;
            case 'ArrowLeft': this.controls.rollRight = false; break;
            case 'ArrowRight': this.controls.rollLeft = false; break;
            case 'w': this.controls.pitchUp = false; break;
            case 's': this.controls.pitchDown = false; break;
            case 'e': this.controls.accelerating = false; break;
        }
    }


    shootBullet() {
        
        const bullet = new THREE.Mesh(this.bulletGeometry,this.bulletMaterial);
        bullet.position.copy(this.spaceship.position);
        const bulletSpeed=0.8;
        const bulletDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(this.spaceship.quaternion);
        bullet.userData.velocity = bulletDirection.clone().multiplyScalar(bulletSpeed);
        this.scene.add(bullet);
        this.bullets.push(bullet);
    }
    
    update() {
        if (!this.spaceship) return;
    
        const rotationSpeed = 0.02;
        
        if (this.controls.accelerating) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else {
            this.speed = Math.max(this.speed - this.acceleration, 0.1);
        }

        // Local axes
        const yawAxis = new THREE.Vector3(0, 1, 0);    // Y-axis for yaw
        const pitchAxis = new THREE.Vector3(1, 0, 0);  // X-axis for pitch
        const rollAxis = new THREE.Vector3(0, 0, 1);   // Z-axis for roll
    
        // Quaternions for each rotation
        const quaternionYaw = new THREE.Quaternion();
        const quaternionPitch = new THREE.Quaternion();
        const quaternionRoll = new THREE.Quaternion();

        // Apply yaw (rotate around the world's Y-axis)
        if (this.controls.yawLeft) quaternionYaw.setFromAxisAngle(yawAxis, rotationSpeed);
        if (this.controls.yawRight) quaternionYaw.setFromAxisAngle(yawAxis, -rotationSpeed);
        this.spaceship.quaternion.multiplyQuaternions(quaternionYaw, this.spaceship.quaternion);
        
        if(!this.gameEngine.in2DMode){
            // Apply pitch (rotate around the spaceship's local X-axis)
            if (this.controls.pitchUp) quaternionPitch.setFromAxisAngle(pitchAxis.applyQuaternion(this.spaceship.quaternion), rotationSpeed);
            if (this.controls.pitchDown) quaternionPitch.setFromAxisAngle(pitchAxis.applyQuaternion(this.spaceship.quaternion), -rotationSpeed);
            this.spaceship.quaternion.multiplyQuaternions(quaternionPitch, this.spaceship.quaternion);
        
            // Apply roll (rotate around the spaceship's local Z-axis)
            if (this.controls.rollLeft) quaternionRoll.setFromAxisAngle(rollAxis.applyQuaternion(this.spaceship.quaternion), rotationSpeed);
            if (this.controls.rollRight) quaternionRoll.setFromAxisAngle(rollAxis.applyQuaternion(this.spaceship.quaternion), -rotationSpeed);
            this.spaceship.quaternion.multiplyQuaternions(quaternionRoll, this.spaceship.quaternion);
        }
    
        // Move the spaceship forward in the direction it's facing
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.spaceship.quaternion);
        forward.multiplyScalar(this.speed);
        this.spaceship.position.add(forward);
        this.updateBullets();
        
    }
    

    updateBullets() {
        this.bullets.forEach((bullet, index) => {
            bullet.position.add(bullet.userData.velocity);
        });
    }
    switch() {
        // Reset the spaceship's rotation to align with the XZ plane
        this.spaceship.rotation.set(0, 0, 0); // Facing along the negative Z-axis
        // Ensure the spaceship is at the correct Z position for 2D mode
        this.spaceship.position.y = 0;

        this.controls = { yawLeft: false, yawRight: false, pitchUp: false, pitchDown: false, rollLeft: false, rollRight: false, accelerating: false };
    }
    
    
}