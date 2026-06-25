const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2c3e50);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('game-canvas').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xfff5e6, 1.5);
spotLight.position.set(0, 15, 10);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.bias = -0.001;
scene.add(spotLight);

const backLight = new THREE.PointLight(0xaaccff, 0.8, 20);
backLight.position.set(-5, 5, -5);
scene.add(backLight);

const mainGroup = new THREE.Group();
scene.add(mainGroup);

const floorGeo = new THREE.PlaneGeometry(30, 15, 30, 15);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -3;
floor.receiveShadow = true;
const positions = floorGeo.attributes.position;
for (let i = 0; i < positions.count; i++) {
    if (i % 2 === 0) positions.setZ(i, positions.getZ(i) + 0.05);
}
floorGeo.computeVertexNormals();
mainGroup.add(floor);

const wallGeo = new THREE.BoxGeometry(30, 10, 1);
const wallMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, roughness: 0.9 });
const wall = new THREE.Mesh(wallGeo, wallMat);
wall.position.set(0, 2, -6);
wall.receiveShadow = true;
mainGroup.add(wall);

const counterGeo = new THREE.BoxGeometry(16, 3, 3);
const counterMat = new THREE.MeshStandardMaterial({ color: 0x8e44ad, roughness: 0.6 });
const counter = new THREE.Mesh(counterGeo, counterMat);
counter.position.set(0, -1.5, 3);
counter.castShadow = true;
counter.receiveShadow = true;
mainGroup.add(counter);

const topGeo = new THREE.BoxGeometry(16.2, 0.2, 3.2);
const topMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.2, metalness: 0.1 });
const counterTop = new THREE.Mesh(topGeo, topMat);
counterTop.position.set(0, 0.1, 3);
counterTop.receiveShadow = true;
counterTop.castShadow = true;
mainGroup.add(counterTop);

const grillGroup = new THREE.Group();
grillGroup.position.set(-4, 0.2, 3);
const grillBaseGeo = new THREE.BoxGeometry(3, 0.5, 2);
const metalMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.8, roughness: 0.3 });
const grillBase = new THREE.Mesh(grillBaseGeo, metalMat);
grillBase.castShadow = true;
grillGroup.add(grillBase);

const grateGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.8);
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.9, roughness: 0.5 });
for(let i = 0; i < 12; i++) {
    const grate = new THREE.Mesh(grateGeo, darkMetal);
    grate.rotation.z = Math.PI / 2;
    grate.position.set(0, 0.26, -0.8 + (i * 0.15));
    grate.castShadow = true;
    grillGroup.add(grate);
}

const pattyGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
const rawMeat = new THREE.MeshStandardMaterial({ color: 0xa93226, roughness: 0.9 });
const cookedMeat = new THREE.MeshStandardMaterial({ color: 0x641e16, roughness: 1.0 });
const patties = [];
for(let i = 0; i < 4; i++) {
    const patty = new THREE.Mesh(pattyGeo, i % 2 === 0 ? cookedMeat : rawMeat);
    patty.position.set(-0.8 + (i%2)*1.6, 0.32, -0.4 + Math.floor(i/2)*0.8);
    patty.castShadow = true;
    patties.push(patty);
    grillGroup.add(patty);
}
mainGroup.add(grillGroup);

const shawarmaGroup = new THREE.Group();
shawarmaGroup.position.set(-6, 0.2, -4);
const sBaseGeo = new THREE.BoxGeometry(2, 0.4, 2);
const sBase = new THREE.Mesh(sBaseGeo, metalMat);
sBase.castShadow = true;
shawarmaGroup.add(sBase);

const sBackGeo = new THREE.BoxGeometry(1.5, 5, 0.2);
const sBack = new THREE.Mesh(sBackGeo, metalMat);
sBack.position.set(0, 2.7, -0.8);
sBack.castShadow = true;
shawarmaGroup.add(sBack);

const heaterGeo = new THREE.BoxGeometry(1.2, 0.8, 0.1);
const heaterMat = new THREE.MeshStandardMaterial({ color: 0xd35400, emissive: 0xd35400, emissiveIntensity: 2 });
for(let i = 0; i < 4; i++) {
    const heater = new THREE.Mesh(heaterGeo, heaterMat);
    heater.position.set(0, 1.2 + (i * 1), -0.7);
    shawarmaGroup.add(heater);
}

const skewerGeo = new THREE.CylinderGeometry(0.05, 0.05, 5.5);
const skewer = new THREE.Mesh(skewerGeo, metalMat);
skewer.position.set(0, 2.7, 0);
skewer.castShadow = true;
shawarmaGroup.add(skewer);

const meatStack = new THREE.Group();
meatStack.position.set(0, 2.7, 0);
const layers = 50;
const meatMat = new THREE.MeshStandardMaterial({ color: 0x873600, roughness: 1 });
for(let i = 0; i < layers; i++) {
    const r = 0.6 + Math.sin((i / layers) * Math.PI) * 0.3 + Math.random() * 0.05;
    const lGeo = new THREE.CylinderGeometry(r, r - 0.02, 0.08, 12);
    const pos = lGeo.attributes.position;
    for (let j = 0; j < pos.count; j++) {
        pos.setX(j, pos.getX(j) + (Math.random() * 0.04 - 0.02));
        pos.setZ(j, pos.getZ(j) + (Math.random() * 0.04 - 0.02));
    }
    lGeo.computeVertexNormals();
    const layer = new THREE.Mesh(lGeo, meatMat);
    layer.position.y = (i * 0.08) - (layers * 0.08) / 2;
    layer.rotation.y = Math.random() * Math.PI;
    layer.castShadow = true;
    layer.receiveShadow = true;
    meatStack.add(layer);
}
shawarmaGroup.add(meatStack);
mainGroup.add(shawarmaGroup);

const registerGroup = new THREE.Group();
registerGroup.position.set(5, 0.2, 3);
const rBaseGeo = new THREE.BoxGeometry(1.5, 0.8, 1.2);
const rMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
const rBase = new THREE.Mesh(rBaseGeo, rMat);
rBase.castShadow = true;
registerGroup.add(rBase);

const screenGeo = new THREE.BoxGeometry(1.2, 0.8, 0.1);
const screenMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const screen = new THREE.Mesh(screenGeo, screenMat);
screen.position.set(0, 0.8, -0.2);
screen.rotation.x = -Math.PI / 6;
registerGroup.add(screen);

const btnGeo = new THREE.BoxGeometry(0.15, 0.05, 0.15);
const btnMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6 });
for(let x = 0; x < 4; x++) {
    for(let z = 0; z < 3; z++) {
        const btn = new THREE.Mesh(btnGeo, btnMat);
        btn.position.set(-0.45 + (x * 0.3), 0.42, 0.1 + (z * 0.25));
        btn.rotation.x = Math.PI / 12;
        registerGroup.add(btn);
    }
}
mainGroup.add(registerGroup);

const trayGroup = new THREE.Group();
trayGroup.position.set(-1, 0.2, 3.5);
const trayGeo = new THREE.BoxGeometry(1, 0.2, 1);
const tMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, metalness: 0.5 });
const ingMats = [
    new THREE.MeshStandardMaterial({ color: 0x27ae60 }),
    new THREE.MeshStandardMaterial({ color: 0xc0392b }),
    new THREE.MeshStandardMaterial({ color: 0xf1c40f })
];
for(let i = 0; i < 3; i++) {
    const tray = new THREE.Mesh(trayGeo, tMat);
    tray.position.set(i * 1.2, 0, 0);
    tray.castShadow = true;
    
    const fillGeo = new THREE.BoxGeometry(0.8, 0.15, 0.8);
    const fill = new THREE.Mesh(fillGeo, ingMats[i]);
    fill.position.set(i * 1.2, 0.1, 0);
    fill.castShadow = true;
    
    trayGroup.add(tray);
    trayGroup.add(fill);
}
mainGroup.add(trayGroup);

camera.position.set(0, 6, 12);
camera.lookAt(0, 1, 0);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meatStack.children, true);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        hit.scale.set(hit.scale.x * 0.85, 1, hit.scale.z * 0.85);
        const coins = document.querySelector('.score-board');
        const current = parseInt(coins.innerText.replace('💰 ', ''));
        coins.innerText = `💰 ${current + 10}`;
    }
});

let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    meatStack.rotation.y += 0.005;
    skewer.rotation.y += 0.005;
    patties.forEach((p, i) => {
        p.position.y = 0.32 + Math.sin(time * 5 + i) * 0.01;
    });
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
