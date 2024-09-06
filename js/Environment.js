export class Environment {
    init(scene) {
        this.scene = scene;

        this.skybox = new THREE.CubeTextureLoader().load([
            'assets/galaxy/px.png', 'assets/galaxy/nx.png',
            'assets/galaxy/py.png', 'assets/galaxy/ny.png',
            'assets/galaxy/pz.png', 'assets/galaxy/nz.png',
        ]);


        this.scene.background = this.skybox;

        const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
        directionalLight.position.set(1000, 1000, -1000);
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        const axesHelper = new THREE.AxesHelper(50);  // Size of the axes lines
        this.scene.add(axesHelper);
        this.loadSun();
    }

    loadSun() {
        const sunLoader = new THREE.GLTFLoader();
        sunLoader.load('assets/sun.glb', (gltf) => {
            const sun = gltf.scene;
            sun.scale.set(0.5, 0.5, 0.5);
            sun.position.set(-80, 800, 1400);
            this.scene.add(sun);
        });
    }
    switchTo2D() {
        console.log('Switching to 2D background');
    
        // Remove the 3D skybox
        this.scene.background = null;
        console.log('3D skybox removed');
    
        // Create a plane geometry for the 2D background
        const frustumSize = 3000; // Same as used in the orthographic camera
        const aspect = window.innerWidth / window.innerHeight;
        const planeWidth = frustumSize * aspect;
        const planeHeight = frustumSize;
    
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('assets/space_2d.png', () => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(50, 50); // Adjust these values as needed
            console.log('2D texture loaded successfully');
            const material = new THREE.MeshBasicMaterial({ map: texture });
    
            // Create the mesh for the 2D background
            this.backgroundMesh = new THREE.Mesh(geometry, material);
    
            // Position the plane behind all the objects in the scene
            this.backgroundMesh.position.set(0, -5, 0); // Match the orthographic camera's position in 2D mode
    
            // Ensure the plane is facing the camera
            this.backgroundMesh.rotation.x = -Math.PI / 2;
            
    
            // Add the mesh to the scene
            this.scene.add(this.backgroundMesh);
        }, undefined, (error) => {
            console.error('Error loading 2D texture:', error);
        });
    }
    

    switchTo3D() {
        // Remove the 2D background mesh
        if (this.backgroundMesh) {
            this.scene.remove(this.backgroundMesh);
            this.backgroundMesh = null;
        }

        // Restore the 3D skybox
        this.scene.background = this.skybox;
    }
    update() {
        // Any environment updates go here
    }
    switch() {
        // Toggle between 3D and 2D background
        if (this.scene.background === this.skybox) {
            this.switchTo2D();
            console.log("switched");
        } else {
            this.switchTo3D();
        }
    }
}
