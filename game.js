import * as THREE from 'three';

// --- CONFIGURATION ---
const COLORS = {
    ground: 0xeae2b7,
    upasaka: 0xfcbf49, // Saffron-ish
    mara: 0xd62828,    // Temptation/Wrath Red
    angulimala: 0x003049, // Dark, misguided blue
    light: 0xffffff
};

// --- CORE ENGINE ---
class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xfdf6e3);
        
        // Isometric Camera Setup
        const aspect = window.innerWidth / window.innerHeight;
        const d = 10;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        this.camera.position.set(20, 20, 20); // The "Isometric" angle
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.initLights();
        this.initWorld();
        
        this.player = new Player(this.scene);
        this.enemies = [];
        this.spawnEnemies();

        this.animate();
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);
    }

    initWorld() {
        const grid = new THREE.GridHelper(20, 20, 0x93a1a1, 0xeee8d5);
        this.scene.add(grid);
        const groundGeo = new THREE.PlaneGeometry(20, 20);
        const groundMat = new THREE.MeshLambertMaterial({ color: COLORS.ground });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);
    }

    spawnEnemies() {
        // Logic to spawn Mara or Angulimala
        this.enemies.push(new Enemy(this.scene, 'Mara', COLORS.mara, { x: -5, z: -5 }));
        this.enemies.push(new Enemy(this.scene, 'Angulimala', COLORS.angulimala, { x: 5, z: -5 }));
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.player.update();
        this.enemies.forEach(e => e.update(this.player.mesh.position));
        this.renderer.render(this.scene, this.camera);
    }
}

// --- MODULE: PLAYER ---
class Player {
    constructor(scene) {
        const geo = new THREE.BoxGeometry(1, 1.5, 1);
        const mat = new THREE.MeshLambertMaterial({ color: COLORS.upasaka });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.y = 0.75;
        scene.add(this.mesh);

        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    update() {
        const speed = 0.1;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) this.mesh.position.z -= speed;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) this.mesh.position.z += speed;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.mesh.position.x -= speed;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.mesh.position.x += speed;
    }
}

// --- MODULE: ENEMY ---
class Enemy {
    constructor(scene, name, color, startPos) {
        this.name = name;
        const geo = new THREE.BoxGeometry(0.8, 1.2, 0.8);
        const mat = new THREE.MeshLambertMaterial({ color: color });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.set(startPos.x, 0.6, startPos.z);
        scene.add(this.mesh);
    }

    update(playerPosition) {
        // Simple AI: Move slowly toward player
        const dir = new THREE.Vector3().subVectors(playerPosition, this.mesh.position).normalize();
        this.mesh.position.addScaledVector(dir, 0.03);
    }
}

new Game();