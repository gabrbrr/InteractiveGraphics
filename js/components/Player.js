
export class Player {
    constructor() {
        this.spaceship = null;
        this.spaceship_bb= new THREE.Box3();
        this.speed = 0.1;
        this.maxSpeed = 0.5;
        this.acceleration = 0.01;
        this.bullets = [];
        this.bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        this.bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.controls = { yawLeft: false, yawRight: false, pitchUp: false, pitchDown: false, rollLeft: false, rollRight: false, accelerating: false };
        this.CameraPosition = new THREE.Vector3(0, 1.8, -4);
    
    }

    init(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.camera.position.copy(this.CameraPosition);
        
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
        
        
        // Apply pitch (rotate around the spaceship's local X-axis)
        if (this.controls.pitchUp) quaternionPitch.setFromAxisAngle(pitchAxis.applyQuaternion(this.spaceship.quaternion), rotationSpeed);
        if (this.controls.pitchDown) quaternionPitch.setFromAxisAngle(pitchAxis.applyQuaternion(this.spaceship.quaternion), -rotationSpeed);
        this.spaceship.quaternion.multiplyQuaternions(quaternionPitch, this.spaceship.quaternion);
    
        // Apply roll (rotate around the spaceship's local Z-axis)
        if (this.controls.rollLeft) quaternionRoll.setFromAxisAngle(rollAxis.applyQuaternion(this.spaceship.quaternion), rotationSpeed);
        if (this.controls.rollRight) quaternionRoll.setFromAxisAngle(rollAxis.applyQuaternion(this.spaceship.quaternion), -rotationSpeed);
        this.spaceship.quaternion.multiplyQuaternions(quaternionRoll, this.spaceship.quaternion);
    
        // Move the spaceship forward in the direction it's facing
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.spaceship.quaternion);
        forward.multiplyScalar(this.speed);
        this.spaceship.position.add(forward);
    
        this.updateBullets();
        this.updateCamera();
    }
    

    updateBullets() {
        this.bullets.forEach((bullet, index) => {
            bullet.position.add(bullet.userData.velocity);
            // if (bullet.position.length() > 100) {
            //     this.scene.remove(bullet);
            //     this.bullets.splice(index, 1);
            // }
        });
    }

    updateCamera() {
        if (!this.spaceship || !this.camera) return;
    
        // Define an offset for the camera relative to the spaceship
        //const cameraOffset = new THREE.Vector3(0, 2, 5); // Position camera slightly above and behind the spaceship
    
        // Apply the spaceship's quaternion (rotation) to the offset
        const offsetPosition = this.CameraPosition.clone().applyQuaternion(this.spaceship.quaternion);
    
        // Set the new camera position based on the spaceship's position plus the offset
        const desiredCameraPosition = this.spaceship.position.clone().add(offsetPosition);
    
        // Smoothly interpolate the camera position
        this.camera.position.lerp(desiredCameraPosition, 0.1);
    
        // Make the camera look at the spaceship
        this.camera.lookAt(this.spaceship.position);
    }
    
}