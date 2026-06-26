const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);
scene.fog = new THREE.FogExp2(0x0f172a, 0.025);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.8, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.getElementById('game-canvas').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const mainSpotLight = new THREE.SpotLight(0xfff5e6, 2.8);
mainSpotLight.position.set(0, 12, 2);
mainSpotLight.angle = Math.PI / 3;
mainSpotLight.penumbra = 0.8;
mainSpotLight.castShadow = true;
mainSpotLight.shadow.mapSize.width = 4096;
mainSpotLight.shadow.mapSize.height = 4096;
mainSpotLight.shadow.camera.near = 0.5;
mainSpotLight.shadow.camera.far = 25;
mainSpotLight.shadow.bias = -0.0002;
scene.add(mainSpotLight);

const fillLight = new THREE.PointLight(0x3b82f6, 1.5, 15);
fillLight.position.set(-6, 4, -4);
scene.add(fillLight);

const controls = new THREE.PointerLockControls(camera, document.body);
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

instructions.addEventListener('click', () => {
    controls.lock();
});

controls.addEventListener('lock', () => {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});

controls.addEventListener('unlock', () => {
    blocker.style.display = 'flex';
    instructions.style.display = '';
});
scene.add(controls.getObject());

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const collisionObjects = []; 

const onKeyDown = (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (canJump === true) velocity.y += 8.5;
            canJump = false;
            break;
    }
};

const onKeyUp = (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const playerRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
const interactionRaycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);
const floorGroup = new THREE.Group();
const tileGeo = new THREE.BoxGeometry(1.9, 0.1, 1.9);
const tileMat1 = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.5 });
const tileMat2 = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.5 });

for (let x = -10; x <= 10; x++) {
    for (let z = -10; z <= 10; z++) {
        const tile = new THREE.Mesh(tileGeo, (x + z) % 2 === 0 ? tileMat1 : tileMat2);
        tile.position.set(x * 2, -0.05, z * 2);
        tile.receiveShadow = true;
        floorGroup.add(tile);
    }
}
scene.add(floorGroup);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.1 });
const wallTileGeo = new THREE.BoxGeometry(0.1, 0.8, 1.8);
const groutMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

const backWallGroup = new THREE.Group();
const backWallBase = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 0.4), wallMaterial);
backWallBase.position.set(0, 4, -10);
backWallBase.receiveShadow = true;
backWallBase.castShadow = true;
backWallGroup.add(backWallBase);
collisionObjects.push(backWallBase);

for (let y = 0; y < 8; y++) {
    for (let x = -10; x < 10; x++) {
        const tileFace = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.4, 0.02), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1 }));
        tileFace.position.set(x * 2 + 0.95, y * 0.5 + 0.25, -9.78);
        tileFace.receiveShadow = true;
        backWallGroup.add(tileFace);
    }
}
scene.add(backWallGroup);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 40), wallMaterial);
leftWall.position.set(-20, 4, 0);
leftWall.receiveShadow = true;
leftWall.castShadow = true;
scene.add(leftWall);
collisionObjects.push(leftWall);

const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 40), wallMaterial);
rightWall.position.set(20, 4, 0);
rightWall.receiveShadow = true;
rightWall.castShadow = true;
scene.add(rightWall);
collisionObjects.push(rightWall);

const ceiling = new THREE.Mesh(new THREE.BoxGeometry(40, 0.2, 40), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
ceiling.position.set(0, 8, 0);
scene.add(ceiling);

const mainCounterGroup = new THREE.Group();
const counterBase = new THREE.Mesh(new THREE.BoxGeometry(18, 1.4, 1.8), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.2 }));
counterBase.position.set(0, 0.7, 2);
counterBase.castShadow = true;
counterBase.receiveShadow = true;
mainCounterGroup.add(counterBase);
collisionObjects.push(counterBase);

const counterTopMesh = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.1, 2.2), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.05, metalness: 0.1 }));
counterTopMesh.position.set(0, 1.45, 2);
counterTopMesh.castShadow = true;
counterTopMesh.receiveShadow = true;
mainCounterGroup.add(counterTopMesh);

for (let i = -4; i <= 4; i++) {
    const piller = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.1 }));
    piller.position.set(i * 2, 0.7, 2.91);
    piller.castShadow = true;
    mainCounterGroup.add(piller);
}
scene.add(mainCounterGroup);

const backWorkGroup = new THREE.Group();
const workBase = new THREE.Mesh(new THREE.BoxGeometry(18, 1.4, 1.6), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 }));
workBase.position.set(0, 0.7, -8.8);
workBase.castShadow = true;
workBase.receiveShadow = true;
backWorkGroup.add(workBase);
collisionObjects.push(workBase);

const workTopMesh = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.08, 1.8), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.1, metalness: 0.8 }));
workTopMesh.position.set(0, 1.44, -8.8);
workTopMesh.castShadow = true;
workTopMesh.receiveShadow = true;
backWorkGroup.add(workTopMesh);
scene.add(backWorkGroup);

const ventHoodGroup = new THREE.Group();
const hoodMain = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 1.5, 4, 1, false, Math.PI / 4), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 }));
hoodMain.position.set(-4, 6.5, -8.5);
hoodMain.scale.set(1.5, 1, 1);
hoodMain.castShadow = true;
ventHoodGroup.add(hoodMain);

const pipeGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 16);
const pipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 }));
pipe.position.set(-4, 7.5, -8.5);
ventHoodGroup.add(pipe);
scene.add(ventHoodGroup);
const shawarmaStation = new THREE.Group();
shawarmaStation.position.set(-5, 1.48, -8.8);

const machineBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.3, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
);
machineBase.castShadow = true;
machineBase.receiveShadow = true;
shawarmaStation.add(machineBase);

const machineBack = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 4.8, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
);
machineBack.position.set(0, 2.4, -1.05);
machineBack.castShadow = true;
shawarmaStation.add(machineBack);

const burnerMat = new THREE.MeshStandardMaterial({ 
    color: 0xea580c, 
    emissive: 0xea580c, 
    emissiveIntensity: 3.5,
    roughness: 0.5 
});
for (let b = 0; b < 5; b++) {
    const burner = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.1), burnerMat);
    burner.position.set(0, 0.8 + (b * 0.8), -0.85);
    burner.castShadow = true;
    shawarmaStation.add(burner);
}

const mainSkewer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 5.2, 16),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 1.0, roughness: 0.1 })
);
mainSkewer.position.set(0, 2.5, 0);
mainSkewer.castShadow = true;
shawarmaStation.add(mainSkewer);

const meatCluster = new THREE.Group();
meatCluster.position.set(0, 2.5, 0);
const totalMeatLayers = 60;
const meatTextureMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95, metalness: 0.0 });

for (let m = 0; m < totalMeatLayers; m++) {
    const heightFactor = m / totalMeatLayers;
    let layerRadius = 0.75 + Math.sin(heightFactor * Math.PI) * 0.35;
    if (heightFactor > 0.85) layerRadius *= (1.0 - (heightFactor - 0.85) * 4);
    
    const layerGeo = new THREE.CylinderGeometry(layerRadius, layerRadius - 0.03, 0.07, 16);
    const vPos = layerGeo.attributes.position;
    for (let v = 0; v < vPos.count; v++) {
        let vx = vPos.getX(v);
        let vy = vPos.getY(v);
        let vz = vPos.getZ(v);
        if (vy > 0) {
            vx += (Math.random() * 0.05 - 0.025);
            vz += (Math.random() * 0.05 - 0.025);
            vPos.setXYZ(v, vx, vy, vz);
        }
    }
    layerGeo.computeVertexNormals();
    
    const meatLayer = new THREE.Mesh(layerGeo, meatTextureMat);
    meatLayer.position.y = (m * 0.065) - (totalMeatLayers * 0.065) / 2;
    meatLayer.rotation.y = (m * 123.45) % Math.PI;
    meatLayer.castShadow = true;
    meatLayer.receiveShadow = true;
    meatCluster.add(meatLayer);
}
shawarmaStation.add(meatCluster);
scene.add(shawarmaStation);

const grillSystem = new THREE.Group();
grillSystem.position.set(2, 1.48, -8.8);

const grillFrame = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.4, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 })
);
grillFrame.castShadow = true;
grillSystem.add(grillFrame);

const rodGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.3, 8);
const rodMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.4 });
for (let r = 0; r < 24; r++) {
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(-2.1 + (r * 0.18), 0.21, 0);
    rod.castShadow = true;
    grillSystem.add(rod);
}

const burgerPatties = [];
const rawPattyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
const burgerGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.09, 24);

for (let p = 0; p < 6; p++) {
    const pattyMesh = new THREE.Mesh(burgerGeo, rawPattyMat.clone());
    pattyMesh.position.set(-1.4 + (p % 3) * 1.4, 0.26, -0.6 + Math.floor(p / 3) * 1.2);
    pattyMesh.castShadow = true;
    pattyMesh.userData = { cookingProgress: 0, isDone: false, type: "patty" };
    grillSystem.add(pattyMesh);
    burgerPatties.push(pattyMesh);
}
scene.add(grillSystem);

const toppingStation = new THREE.Group();
toppingStation.position.set(-4, 1.5, 2.0);

const containerGeo = new THREE.BoxGeometry(1.4, 0.4, 1.4);
const steelContainerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.1 });
const ingredientColors = [0x166534, 0x991b1b, 0xd97706, 0xf8fafc]; 

for (let t = 0; t < 4; t++) {
    const container = new THREE.Mesh(containerGeo, steelContainerMat);
    container.position.set(-2.2 + (t * 1.5), 0, 0);
    container.castShadow = true;
    container.receiveShadow = true;
    toppingStation.add(container);
    
    const fillMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.38, 1.2),
        new THREE.MeshStandardMaterial({ color: ingredientColors[t], roughness: 0.6 })
    );
    fillMesh.position.set(-2.2 + (t * 1.5), 0.05, 0);
    fillMesh.castShadow = true;
    fillMesh.userData = { type: "ingredient", index: t };
    toppingStation.add(fillMesh);
}
scene.add(toppingStation);
const cashierStation = new THREE.Group();
cashierStation.position.set(4, 1.5, 2.0);

const posBaseGeo = new THREE.BoxGeometry(1.6, 0.4, 1.4);
const posBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
const posBase = new THREE.Mesh(posBaseGeo, posBaseMat);
posBase.castShadow = true;
cashierStation.add(posBase);

const screenSupportGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 12);
const screenSupport = new THREE.Mesh(screenSupportGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 }));
screenSupport.position.set(0, 0.4, -0.3);
screenSupport.rotation.x = Math.PI / 12;
cashierStation.add(screenSupport);

const posScreenGeo = new THREE.BoxGeometry(2.0, 1.3, 0.1);
const posScreen = new THREE.Mesh(posScreenGeo, posBaseMat);
posScreen.position.set(0, 0.8, -0.2);
posScreen.rotation.x = -Math.PI / 6;
posScreen.castShadow = true;
cashierStation.add(posScreen);

const displayPanelGeo = new THREE.PlaneGeometry(1.8, 1.1);
const displayPanelMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
const displayPanel = new THREE.Mesh(displayPanelGeo, displayPanelMat);
displayPanel.position.set(0, 0.8, -0.14);
displayPanel.rotation.x = -Math.PI / 6;
cashierStation.add(displayPanel);

const keyboardGeo = new THREE.BoxGeometry(1.3, 0.05, 0.6);
const keyboard = new THREE.Mesh(keyboardGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a }));
keyboard.position.set(0, 0.21, 0.3);
keyboard.rotation.x = Math.PI / 24;
cashierStation.add(keyboard);

const keyGeo = new THREE.BoxGeometry(0.08, 0.03, 0.08);
const keyMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2 });
for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 7; col++) {
        const keyMesh = new THREE.Mesh(keyGeo, keyMat);
        keyMesh.position.set(-0.48 + (col * 0.16), 0.24, 0.12 + (row * 0.12));
        keyMesh.rotation.x = Math.PI / 24;
        cashierStation.add(keyMesh);
    }
}

const printerBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.6, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
);
printerBase.position.set(1.5, 0.3, 0.1);
printerBase.castShadow = true;
cashierStation.add(printerBase);

const paperSlot = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.15),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
paperSlot.position.set(1.5, 0.61, 0.1);
paperSlot.rotation.x = -Math.PI / 2;
cashierStation.add(paperSlot);
scene.add(cashierStation);

let currentCoins = 1009;
let activeOrders = [];
let maxOrders = 3;
let scoreElement = document.getElementById('coins-display');
let tasksElement = document.getElementById('tasks-display');

const recipes = [
    { id: "shawarma", name: "وجبة شاورما شامية", value: 45, steps: ["meat", "ingredient_0", "ingredient_2"] },
    { id: "burger", name: "برغر سوبر ديلوكس", value: 65, steps: ["patty", "ingredient_0", "ingredient_1", "ingredient_3"] },
    { id: "combo", name: "وجبة كومبو عائلية", value: 120, steps: ["meat", "patty", "ingredient_0", "ingredient_1"] }
];

function generateNewOrder() {
    if (activeOrders.length >= maxOrders) return;
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    const order = {
        ...randomRecipe,
        uid: Math.random().toString(36).substr(2, 9),
        timeLeft: 60,
        progress: []
    };
    activeOrders.push(order);
    updateOrderUI();
}

function updateOrderUI() {
    if (tasksElement) {
        tasksElement.innerText = `الطلبات النشطة: ${activeOrders.length}`;
    }
}

setInterval(() => {
    if (controls.isLocked) {
        for (let i = activeOrders.length - 1; i >= 0; i--) {
            activeOrders[i].timeLeft -= 1;
            if (activeOrders[i].timeLeft <= 0) {
                activeOrders.splice(i, 1);
                updateOrderUI();
            }
        }
        if (Math.random() < 0.15) {
            generateNewOrder();
        }
    }
}, 1000);
const playerHeight = 1.8;
const playerRadius = 0.6;
const gravity = 9.8 * 2.2;
const movementSpeed = 45.0;
const jumpForce = 8.0;

function checkWalletCollision(futurePosition) {
    for (let i = 0; i < collisionObjects.length; i++) {
        const obj = collisionObjects[i];
        if (!obj.geometry) continue;
        
        if (!obj.geometry.boundingBox) {
            obj.geometry.computeBoundingBox();
        }
        
        const box = obj.geometry.boundingBox.clone();
        box.applyMatrix4(obj.matrixWorld);
        
        const pBox = new THREE.Box3(
            new THREE.Vector3(futurePosition.x - playerRadius, futurePosition.y - playerHeight, futurePosition.z - playerRadius),
            new THREE.Vector3(futurePosition.x + playerRadius, futurePosition.y + 0.2, futurePosition.z + playerRadius)
        );
        
        if (box.intersectsBox(pBox)) {
            return true;
        }
    }
    return false;
}

function handleInteractions() {
    if (!controls.isLocked) return;

    interactionRaycaster.setFromCamera(screenCenter, camera);
    const intersects = interactionRaycaster.intersectObjects(scene.children, true);
    const promptElement = document.getElementById('action-prompt');

    if (intersects.length > 0 && intersects[0].distance < 3.5) {
        let hitObject = intersects[0].object;
        let parentGroup = hitObject.parent;
        
        if (hitObject.userData && hitObject.userData.type === "patty") {
            promptElement.innerText = "اضغط كليك يسار لطهي أو حمل قطعة البرغر";
            promptElement.style.opacity = "1";
            return hitObject;
        }
        if (parentGroup && parentGroup === meatCluster) {
            promptElement.innerText = "اضغط كليك يسار لتقطيع الشاورما الطازجة";
            promptElement.style.opacity = "1";
            return meatCluster;
        }
        if (hitObject.userData && hitObject.userData.type === "ingredient") {
            promptElement.innerText = `اضغط لإضافة المكون إلى طاولة التحضير`;
            promptElement.style.opacity = "1";
            return hitObject;
        }
        if (hitObject.matrixWorld.getPosition().distanceTo(cashierStation.position) < 2.0) {
            promptElement.innerText = "اضغط لخدمة الزبائن عبر شاشة الكاشير";
            promptElement.style.opacity = "1";
            return cashierStation;
        }
    }
    
    if (promptElement) promptElement.style.opacity = "0";
    return null;
}

window.addEventListener('click', () => {
    const target = handleInteractions();
    if (!target) return;

    if (target === meatCluster) {
        if (meatCluster.children.length > 0) {
            const randomLayer = meatCluster.children[Math.floor(Math.random() * meatCluster.children.length)];
            randomLayer.scale.set(randomLayer.scale.x * 0.9, 1, randomLayer.scale.z * 0.9);
            
            currentCoins += 15;
            if (scoreElement) scoreElement.innerText = `💰 ${currentCoins}`;
        }
    }
    
    if (target.userData && target.userData.type === "patty") {
        if (!target.userData.isDone) {
            target.userData.cookingProgress += 25;
            if (target.userData.cookingProgress >= 100) {
                target.userData.isDone = true;
                target.material.color.setHex(0x451a03); 
                currentCoins += 20;
                if (scoreElement) scoreElement.innerText = `💰 ${currentCoins}`;
            }
        }
    }

    if (target === cashierStation) {
        if (activeOrders.length > 0) {
            const completedOrder = activeOrders.shift();
            currentCoins += completedOrder.value;
            if (scoreElement) scoreElement.innerText = `💰 ${currentCoins}`;
            updateOrderUI();
        }
    }
});

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    
    if (controls.isLocked === true) {
        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= gravity * delta; 

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); 

        if (moveForward || moveBackward) velocity.z -= direction.z * movementSpeed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * movementSpeed * delta;

        const currentPos = controls.getObject().position.clone();
        
        const nextX = currentPos.clone().setX(currentPos.x + velocity.x * delta);
        if (!checkWalletCollision(nextX)) {
            controls.getObject().position.x += velocity.x * delta;
        } else {
            velocity.x = 0;
        }

        const nextZ = currentPos.clone().setZ(currentPos.z + velocity.z * delta);
        if (!checkWalletCollision(nextZ)) {
            controls.getObject().position.z += velocity.z * delta;
        } else {
            velocity.z = 0;
        }

        controls.getObject().position.y += (velocity.y * delta);

        if (controls.getObject().position.y < playerHeight) {
            velocity.y = 0;
            controls.getObject().position.y = playerHeight;
            canJump = true;
        }

        meatCluster.rotation.y += 0.006;
        mainSkewer.rotation.y += 0.006;

        burgerPatties.forEach((patty, idx) => {
            if (patty.userData.cookingProgress > 0 && !patty.userData.isDone) {
                patty.position.y = 0.26 + Math.sin(time * 0.01 + idx) * 0.005;
            }
        });

        handleInteractions();
    }

    prevTime = time;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
