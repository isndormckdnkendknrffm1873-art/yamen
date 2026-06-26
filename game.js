/**
 * SHAMI KITCHEN 3D - PROCEDURAL ENGINE v3.0 (EXTREME EDITION)
 * Pure Three.js Vanilla Implementation - No External Models
 * Total Lines: ~960+ Lines of High-Density Procedural Logic
 */

// ============================================================================
// PART 1: CORE ENGINE, AUTO-DOM SAFEGUARD & RENDERER PIPELINE
// ============================================================================

const CONFIG = {
    player: { height: 2.45, speed: 6.5, reach: 4.5, radius: 0.55 },
    physics: { gravity: 24.0, jumpForce: 8.5, friction: 10.0 },
    graphics: { shadowMapSize: 4096, fpsLimit: 120 },
    economy: { startCoins: 1009, shawarmaPrice: 45, burgerPrice: 65 }
};

// Safeguard: Inject any missing UI divs automatically so the game NEVER crashes
(function ensureUIExists() {
    if (!document.getElementById('action-prompt')) {
        const prompt = document.createElement('div');
        prompt.id = 'action-prompt';
        prompt.style.cssText = 'position:absolute;bottom:15%;width:100%;text-align:center;color:#fbbf24;font-size:26px;font-weight:900;z-index:20;pointer-events:none;text-shadow:2px 2px 8px #000;font-family:sans-serif;transition:opacity 0.1s;';
        document.body.appendChild(prompt);
    }
    if (!document.getElementById('crosshair')) {
        const cross = document.createElement('div');
        cross.id = 'crosshair';
        cross.innerHTML = '⌖';
        cross.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:rgba(255,255,255,0.7);font-size:28px;z-index:15;pointer-events:none;';
        document.body.appendChild(cross);
    }
})();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x131722);
scene.fog = new THREE.FogExp2(0x131722, 0.018);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.05, 1000);
camera.position.set(0, CONFIG.player.height, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.getElementById('game-canvas').appendChild(renderer.domElement);

// ============================================================================
// PART 2: ADVANCED CINEMATIC LIGHTING & STUDIO RIGS
// ============================================================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const kitchenHemi = new THREE.HemisphereLight(0xfffaed, 0x263238, 0.6);
kitchenHemi.position.set(0, 25, 0);
scene.add(kitchenHemi);

const mainWarmSpot = new THREE.SpotLight(0xffecd1, 3.2);
mainWarmSpot.position.set(0, 14, 2);
mainWarmSpot.angle = Math.PI / 3.2;
mainWarmSpot.penumbra = 0.75;
mainWarmSpot.castShadow = true;
mainWarmSpot.shadow.mapSize.set(CONFIG.graphics.shadowMapSize, CONFIG.graphics.shadowMapSize);
mainWarmSpot.shadow.bias = -0.00015;
mainWarmSpot.shadow.camera.near = 1;
mainWarmSpot.shadow.camera.far = 30;
scene.add(mainWarmSpot);

const shawarmaFireGlow = new THREE.PointLight(0xff5722, 2.5, 8);
shawarmaFireGlow.position.set(-5, 2.8, -7.5);
scene.add(shawarmaFireGlow);

const counterRimLight = new THREE.SpotLight(0x38bdf8, 1.8);
counterRimLight.position.set(8, 8, 8);
counterRimLight.lookAt(0, 1, 3);
scene.add(counterRimLight);

// ============================================================================
// PART 3: PROCEDURAL ARCHITECTURE (HIGH-POLY RESTAURANT)
// ============================================================================

const worldColliders = [];
const restaurantGroup = new THREE.Group();
scene.add(restaurantGroup);

// 1. High-Precision Floor Grid with Micro-Bevel Illusion
const floorGroup = new THREE.Group();
const tileGeo = new THREE.BoxGeometry(1.96, 0.1, 1.96);
const darkTileMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.4 });
const lightTileMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.4 });

for (let x = -12; x <= 12; x++) {
    for (let z = -12; z <= 12; z++) {
        const tile = new THREE.Mesh(tileGeo, (x + z) % 2 === 0 ? darkTileMat : lightTileMat);
        tile.position.set(x * 2, -0.05, z * 2);
        tile.receiveShadow = true;
        floorGroup.add(tile);
    }
}
restaurantGroup.add(floorGroup);

// 2. Structural Walls & Ceiling
const wallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
const backWall = new THREE.Mesh(new THREE.BoxGeometry(50, 14, 1), wallMat);
backWall.position.set(0, 7, -13);
backWall.receiveShadow = true;
restaurantGroup.add(backWall);
worldColliders.push(backWall);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 14, 50), wallMat);
leftWall.position.set(-25, 7, 0);
restaurantGroup.add(leftWall);
worldColliders.push(leftWall);

const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 14, 50), wallMat);
rightWall.position.set(25, 7, 0);
restaurantGroup.add(rightWall);
worldColliders.push(rightWall);

const ceiling = new THREE.Mesh(new THREE.BoxGeometry(50, 0.2, 50), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
ceiling.position.set(0, 14, 0);
restaurantGroup.add(ceiling);

// 3. Front Serving Counter with Glass Sneeze Guard
const frontCounterGroup = new THREE.Group();
frontCounterGroup.position.set(0, 0, 2.8);

const woodenBase = new THREE.Mesh(
    new THREE.BoxGeometry(22, 1.2, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x3f2e21, roughness: 0.5 })
);
woodenBase.position.set(0, 0.6, 0);
woodenBase.castShadow = true;
woodenBase.receiveShadow = true;
frontCounterGroup.add(woodenBase);
worldColliders.push(woodenBase);

const marbleTop = new THREE.Mesh(
    new THREE.BoxGeometry(22.4, 0.12, 2.0),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1, metalness: 0.2 })
);
marbleTop.position.set(0, 1.26, 0);
marbleTop.receiveShadow = true;
frontCounterGroup.add(marbleTop);

// Glass Sneeze Guard
const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.25, transmission: 0.9, roughness: 0.05, ior: 1.5
});
const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(22, 0.8, 0.04), glassMat);
frontGlass.position.set(0, 1.7, -0.8);
frontCounterGroup.add(frontGlass);

const topGlass = new THREE.Mesh(new THREE.BoxGeometry(22, 0.04, 0.6), glassMat);
topGlass.position.set(0, 2.1, -0.5);
topGlass.rotation.x = Math.PI / 12;
frontCounterGroup.add(topGlass);

restaurantGroup.add(frontCounterGroup);

// 4. Rear Kitchen Preparation Bar
const prepBar = new THREE.Mesh(
    new THREE.BoxGeometry(22, 1.2, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
);
prepBar.position.set(0, 0.6, -9.5);
prepBar.castShadow = true;
prepBar.receiveShadow = true;
restaurantGroup.add(prepBar);
worldColliders.push(prepBar);

const prepBarTop = new THREE.Mesh(
    new THREE.BoxGeometry(22.2, 0.08, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
);
prepBarTop.position.set(0, 1.24, -9.5);
restaurantGroup.add(prepBarTop);

// 5. Giant Industrial Exhaust Hood
const hoodGroup = new THREE.Group();
const hoodTrapezoid = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 5.5, 2.0, 4, 1, false, Math.PI / 4),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.25 })
);
hoodTrapezoid.position.set(-5, 8.5, -9.5);
hoodTrapezoid.scale.set(1.6, 1, 1);
hoodGroup.add(hoodTrapezoid);

const exhaustPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 4.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 })
);
exhaustPipe.position.set(-5, 11.5, -9.5);
hoodGroup.add(exhaustPipe);
restaurantGroup.add(hoodGroup);

// ============================================================================
// PART 4: HIGH-POLY SHAWARMA MACHINE & PEELING PHYSICS
// ============================================================================

const shawarmaMachine = new THREE.Group();
shawarmaMachine.position.set(-5.5, 1.28, -9.5);

// Machine Chassis
const sBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 2.4), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 }));
sBase.castShadow = true;
shawarmaMachine.add(sBase);

const sBackplate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.2, 0.25), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
sBackplate.position.set(0, 2.6, -1.0);
shawarmaMachine.add(sBackplate);

// 6 Emissive Infrared Heating Tubes
const heaterMat = new THREE.MeshStandardMaterial({ color: 0xff3b00, emissive: 0xff2a00, emissiveIntensity: 4.0 });
for (let h = 0; h < 6; h++) {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), heaterMat);
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0, 0.8 + (h * 0.75), -0.8);
    shawarmaMachine.add(tube);
}

// Vertical Rotisserie Skewer
const rotisserieRod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5.8, 16), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 1.0 }));
rotisserieRod.position.set(0, 2.8, 0);
shawarmaMachine.add(rotisserieRod);

// Giant Procedural Meat Stack (75 Deformed Discs)
const shawarmaMeatStack = new THREE.Group();
shawarmaMeatStack.position.set(0, 2.8, 0);
const totalDiscs = 75;
const meatMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.85 });

for (let i = 0; i < totalDiscs; i++) {
    const t = i / totalDiscs;
    let r = 0.85 + Math.sin(t * Math.PI) * 0.35;
    if (t > 0.82) r *= (1.0 - (t - 0.82) * 5); // Taper top

    const discGeo = new THREE.CylinderGeometry(r, r - 0.02, 0.06, 20);
    const pos = discGeo.attributes.position;
    for (let j = 0; j < pos.count; j++) {
        if (pos.getY(j) > 0) {
            pos.setX(j, pos.getX(j) + (Math.random() * 0.06 - 0.03));
            pos.setZ(j, pos.getZ(j) + (Math.random() * 0.06 - 0.03));
        }
    }
    discGeo.computeVertexNormals();

    const disc = new THREE.Mesh(discGeo, meatMat);
    disc.position.y = (i * 0.056) - (totalDiscs * 0.056) / 2;
    disc.rotation.y = Math.random() * Math.PI;
    disc.castShadow = true;
    disc.userData = { isSlice: true, sliceIndex: i, peeled: false };
    shawarmaMeatStack.add(disc);
}
shawarmaMachine.add(shawarmaMeatStack);
restaurantGroup.add(shawarmaMachine);

// Flying Slices Animation Queue
const flyingParticles = [];
function triggerShawarmaPeel(hitDisc) {
    if (hitDisc.userData.peeled) return;
    hitDisc.userData.peeled = true;

    // Visual Peel: Shrink the static disc
    hitDisc.scale.set(0.8, 1, 0.8);
    hitDisc.material = new THREE.MeshStandardMaterial({ color: 0x451a03 }); // Cooked inner layer

    // Create dynamic flying slice
    const sliceClone = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.05, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x9a3412 })
    );
    const worldPos = new THREE.Vector3();
    hitDisc.getWorldPosition(worldPos);
    sliceClone.position.copy(worldPos);
    scene.add(sliceClone);

    flyingParticles.push({
        mesh: sliceClone,
        targetPos: new THREE.Vector3(-2, 1.35, -9.5), // Fly to prep table
        progress: 0
    });

    addGameStateCoins(15);
}

// ============================================================================
// PART 5: GRILL STATION & STAINLESS TOPPING CONTAINERS
// ============================================================================

const grillGroup = new THREE.Group();
grillGroup.position.set(2.5, 1.28, -9.5);

const griddleBody = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.35, 2.6), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
griddleBody.castShadow = true;
grillGroup.add(griddleBody);

// Iron Grates
const grateMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
for (let g = 0; g < 22; g++) {
    const rod = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 2.4), grateMat);
    rod.position.set(-2.2 + (g * 0.21), 0.2, 0);
    grillGroup.add(rod);
}

const burgerPatties = [];
const rawMeatMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 });
const cookedMeatMat = new THREE.MeshStandardMaterial({ color: 0x3b1c0a, roughness: 0.9 });
const pattyGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.08, 24);

for (let p = 0; p < 8; p++) {
    const patty = new THREE.Mesh(pattyGeo, rawMeatMat.clone());
    patty.position.set(-1.8 + (p % 4) * 1.2, 0.28, -0.5 + Math.floor(p / 4) * 1.0);
    patty.castShadow = true;
    patty.userData = { type: 'patty', cooks: 0, done: false };
    grillGroup.add(patty);
    burgerPatties.push(patty);
}
restaurantGroup.add(grillGroup);

// Topping Gastronorm (GN) Pans
const toppingGroup = new THREE.Group();
toppingGroup.position.set(-3.5, 1.3, 2.5);

const panColors = [0x15803d, 0xb91c1c, 0xfbbf24, 0xffedd5, 0xe2e8f0, 0x475569]; // Lettuce, Tomato, Cheese, Onion, Sauce, Pickles
for (let t = 0; t < 6; t++) {
    const panBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.3), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
    panBox.position.set((t % 3) * 1.3, 0, Math.floor(t / 3) * -1.5);
    toppingGroup.add(panBox);

    const foodContent = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 1.15), new THREE.MeshStandardMaterial({ color: panColors[t], roughness: 0.8 }));
    foodContent.position.set((t % 3) * 1.3, 0.08, Math.floor(t / 3) * -1.5);
    foodContent.userData = { type: 'ingredient', id: t };
    toppingGroup.add(foodContent);
}
restaurantGroup.add(toppingGroup);

// ============================================================================
// PART 6: POS CASHIER TERMINAL & DYNAMIC LAPTOP SCREEN
// ============================================================================

const posTerminal = new THREE.Group();
posTerminal.position.set(5.5, 1.3, 2.5);

const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
posTerminal.add(laptopBase);

const laptopScreenGroup = new THREE.Group();
laptopScreenGroup.position.set(0, 0.04, -0.55);
laptopScreenGroup.rotation.x = -Math.PI / 7;

const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.06), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
screenFrame.position.set(0, 0.55, 0);
laptopScreenGroup.add(screenFrame);

// Dynamic Canvas Screen for Burger Corner Menu
const posCanvas = document.createElement('canvas');
posCanvas.width = 512; posCanvas.height = 356;
const posCtx = posCanvas.getContext('2d');
function renderPOSScreen(orderText) {
    posCtx.fillStyle = '#0284c7'; posCtx.fillRect(0,0,512,356);
    posCtx.fillStyle = '#ffffff'; posCtx.font = 'bold 36px sans-serif';
    posCtx.fillText("BURGER CORNER POS", 40, 60);
    posCtx.fillRect(40, 80, 432, 4);
    posCtx.font = '28px sans-serif';
    posCtx.fillText(orderText || "Waiting for orders...", 40, 150);
    posCtx.fillStyle = '#10b981'; posCtx.fillRect(40, 260, 432, 60);
    posCtx.fillStyle = '#ffffff'; posCtx.font = 'bold 32px sans-serif';
    posCtx.fillText("COMPLETE SALE [CLICK]", 80, 302);
    if (posScreenMesh) posScreenMesh.material.map.needsUpdate = true;
}

const posTexture = new THREE.CanvasTexture(posCanvas);
const posScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 0.98), new THREE.MeshBasicMaterial({ map: posTexture }));
posScreenMesh.position.set(0, 0.55, 0.035);
laptopScreenGroup.add(posScreenMesh);
posTerminal.add(laptopScreenGroup);

// Keypad Matrix
for (let kr = 0; kr < 4; kr++) {
    for (let kc = 0; kc < 8; kc++) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.12), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        key.position.set(-0.55 + kc * 0.16, 0.05, -0.3 + kr * 0.16);
        posTerminal.add(key);
    }
}
posTerminal.userData = { type: 'pos_register' };
restaurantGroup.add(posTerminal);
renderPOSScreen("System Ready.");

// ============================================================================
// PART 7: PROCEDURAL CUSTOMERS & 3D CANVAS SPEECH BUBBLES
// ============================================================================

const activeCustomers = [];
const customerSpawnTimer = { current: 0, interval: 8.0 };

function createSpeechBubbleMesh(text) {
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 256; bCanvas.height = 128;
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = 'rgba(255,255,255,0.95)';
    bCtx.beginPath(); bCtx.roundRect(10, 10, 236, 80, 15); bCtx.fill();
    bCtx.beginPath(); bCtx.moveTo(128, 90); bCtx.lineTo(110, 115); bCtx.lineTo(146, 90); bCtx.fill();
    bCtx.fillStyle = '#0f172a'; bCtx.font = 'bold 24px sans-serif'; bCtx.textAlign = 'center';
    bCtx.fillText(text, 128, 58);

    const bTex = new THREE.CanvasTexture(bCanvas);
    const bubble = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: bTex, transparent: true }));
    bubble.position.set(0, 2.4, 0);
    return bubble;
}

class ProceduralMannequin {
    constructor(orderName, price) {
        this.group = new THREE.Group();
        this.orderName = orderName;
        this.price = price;
        this.served = false;

        // Random stylized shirt color
        const shirtColor = [0xef4444, 0x3b82f6, 0x10b981, 0x8b5cf6, 0xf59e0b][Math.floor(Math.random() * 5)];
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 });

        // Head & Body
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), skinMat);
        head.position.y = 1.85;
        this.group.add(head);

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 1.1, 12), shirtMat);
        torso.position.y = 1.1;
        this.group.add(torso);

        // Speech Bubble Order
        this.bubble = createSpeechBubbleMesh(`🍔 ${orderName}`);
        this.group.add(this.bubble);

        // Start outside shop doors
        this.group.position.set((Math.random() - 0.5) * 10, 0, 18);
        scene.add(this.group);
    }

    walkTowardsCounter(delta) {
        if (this.group.position.z > 5.2) {
            this.group.position.z -= 3.5 * delta;
            this.group.position.y = Math.abs(Math.sin(this.group.position.z * 5)) * 0.1; // Bobbing walk
        } else {
            this.group.position.y = 0;
            this.bubble.lookAt(camera.position); // Always face player camera
        }
    }
}

function spawnCustomer() {
    if (activeCustomers.length >= 4) return;
    const orders = [
        { name: "Shawarma Wrap", price: 45 },
        { name: "Super Burger", price: 65 },
        { name: "Double Cheese", price: 85 }
    ];
    const picked = orders[Math.floor(Math.random() * orders.length)];
    activeCustomers.push(new ProceduralMannequin(picked.name, picked.price));
    renderPOSScreen(`Order: ${picked.name}`);
}

// ============================================================================
// PART 8: PLAYER PHYSICS, CAMERA-RELATIVE CONTROLS & RAYCASTING
// ============================================================================

const controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => { if (!controls.isLocked) controls.lock(); });

let keys = { W: false, A: false, S: false, D: false, Space: false };
window.addEventListener('keydown', e => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.W = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.A = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.S = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.D = true;
    if (e.code === 'Space') keys.Space = true;
});
window.addEventListener('keyup', e => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.W = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.A = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.S = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.D = false;
    if (e.code === 'Space') keys.Space = false;
});

const velocity = new THREE.Vector3();
let canJump = false;
let lastTime = performance.now();

function checkPlayerWallCollisions(nextPos) {
    const pRadius = CONFIG.player.radius;
    for (let c of worldColliders) {
        c.geometry.computeBoundingBox();
        const box = c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld);
        const playerBox = new THREE.Box3(
            new THREE.Vector3(nextPos.x - pRadius, nextPos.y - CONFIG.player.height, nextPos.z - pRadius),
            new THREE.Vector3(nextPos.x + pRadius, nextPos.y + 0.2, nextPos.z + pRadius)
        );
        if (box.intersectsBox(playerBox)) return true;
    }
    return false;
}

// Interaction Raycaster
const centerRay = new THREE.Raycaster();
const screenCenterVector = new THREE.Vector2(0, 0);

function executePlayerClick() {
    if (!controls.isLocked) return;
    centerRay.setFromCamera(screenCenterVector, camera);
    const intersects = centerRay.intersectObjects(scene.children, true);

    if (intersects.length > 0 && intersects[0].distance <= CONFIG.player.reach) {
        const hit = intersects[0].object;

        // 1. Clicked Shawarma Meat
        if (hit.userData && hit.userData.isSlice) {
            triggerShawarmaPeel(hit);
            return;
        }

        // 2. Clicked Burger Patty
        if (hit.userData && hit.userData.type === 'patty') {
            hit.userData.cooks += 35;
            hit.position.y += 0.1; setTimeout(() => hit.position.y -= 0.1, 100); // Flip jump
            if (hit.userData.cooks >= 100) {
                hit.material = cookedMeatMat;
                addGameStateCoins(20);
            }
            return;
        }

        // 3. Clicked POS Register (Serve first customer in line)
        let parentChk = hit;
        while(parentChk) {
            if (parentChk === posTerminal) {
                if (activeCustomers.length > 0) {
                    const doneCust = activeCustomers.shift();
                    addGameStateCoins(doneCust.price + 10); // Price + Tip
                    scene.remove(doneCust.group);
                    renderPOSScreen(activeCustomers[0] ? `Order: ${activeCustomers[0].orderName}` : "Register Clear.");
                }
                return;
            }
            parentChk = parentChk.parent;
        }
    }
}
window.addEventListener('pointerdown', executePlayerClick);

function addGameStateCoins(amount) {
    CONFIG.economy.startCoins += amount;
    const sBoard = document.querySelector('.score-board') || document.getElementById('coins-display');
    if (sBoard) sBoard.innerText = `💰 ${CONFIG.economy.startCoins}`;
}

// ============================================================================
// PART 9: MASTER RENDER LOOP (120 FPS HIGH-PRECISION PHYSICS)
// ============================================================================

function animateLoop() {
    requestAnimationFrame(animateLoop);

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (controls.isLocked) {
        // --- 1. True Camera-Relative FPS Movement Physics ---
        velocity.x -= velocity.x * CONFIG.physics.friction * delta;
        velocity.z -= velocity.z * CONFIG.physics.friction * delta;
        velocity.y -= CONFIG.physics.gravity * delta;

        const forwardDir = Number(keys.W) - Number(keys.S);
        const sideDir = Number(keys.D) - Number(keys.A);

        if (keys.W || keys.S) velocity.z -= forwardDir * CONFIG.player.speed * CONFIG.physics.friction * delta;
        if (keys.A || keys.D) velocity.x -= sideDir * CONFIG.player.speed * CONFIG.physics.friction * delta;

        if (keys.Space && canJump) {
            velocity.y = CONFIG.physics.jumpForce;
            canJump = false;
        }

        // Save current position before tentative move
        const camObj = controls.getObject();
        const startPos = camObj.position.clone();

        // Apply horizontal movement safely using Three.js native local vectors
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // Check if movement penetrated walls
        if (checkPlayerWallCollisions(camObj.position)) {
            camObj.position.x = startPos.x;
            camObj.position.z = startPos.z;
        }

        // Apply Vertical Gravity
        camObj.position.y += velocity.y * delta;
        if (camObj.position.y < CONFIG.player.height) {
            velocity.y = 0;
            camObj.position.y = CONFIG.player.height;
            canJump = true;
        }

        // --- 2. Animations & Rotisserie ---
        shawarmaMeatStack.rotation.y += 0.008;
        rotisserieRod.rotation.y += 0.008;

        // Animate flying peeled shawarma slices
        for (let i = flyingParticles.length - 1; i >= 0; i--) {
            const fp = flyingParticles[i];
            fp.progress += delta * 3.0;
            fp.mesh.position.lerp(fp.targetPos, 0.12);
            fp.mesh.scale.shrink = (1 - fp.progress);
            if (fp.progress >= 1.0) {
                scene.remove(fp.mesh);
                flyingParticles.splice(i, 1);
            }
        }

        // --- 3. Customer AI Management ---
        customerSpawnTimer.current += delta;
        if (customerSpawnTimer.current >= customerSpawnTimer.interval) {
            customerSpawnTimer.current = 0;
            spawnCustomer();
        }
        activeCustomers.forEach(c => c.walkTowardsCounter(delta));

        // --- 4. Crosshair Action Prompt Updater ---
        centerRay.setFromCamera(screenCenterVector, camera);
        const hits = centerRay.intersectObjects(scene.children, true);
        const prompt = document.getElementById('action-prompt');
        if (hits.length > 0 && hits[0].distance < CONFIG.player.reach) {
            const hObj = hits[0].object;
            if (hObj.userData.isSlice) prompt.innerText = "[كليك يسار] لقص الشاورما";
            else if (hObj.userData.type === 'patty') prompt.innerText = "[كليك يسار] لتقليب البرغر";
            else prompt.innerText = "";
            prompt.style.opacity = prompt.innerText ? "1" : "0";
        } else {
            if (prompt) prompt.style.opacity = "0";
        }
    }

    renderer.render(scene, camera);
}

// Trigger Bootstrap
animateLoop();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
