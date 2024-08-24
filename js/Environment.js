export class Environment {
    init(scene) {
        this.scene = scene;

        const loader = new THREE.CubeTextureLoader();
        const skybox = loader.load([
            'assets/galaxy/px.png', 'assets/galaxy/nx.png',
            'assets/galaxy/py.png', 'assets/galaxy/ny.png',
            'assets/galaxy/pz.png', 'assets/galaxy/nz.png',
        ]);

        this.scene.background = skybox;

        const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
        directionalLight.position.set(1000, 1000, -1000);
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        this.loadSun();
    }

    loadSun() {
        const sunLoader = new THREE.GLTFLoader();
        sunLoader.load('assets/sun.glb', (gltf) => {
            const sun = gltf.scene;
            sun.scale.set(0.5, 0.5, 0.5);
            sun.position.set(-500, 500, 1000);
            this.scene.add(sun);
        });
    }

    update() {
        // Any environment updates go here
    }
}
