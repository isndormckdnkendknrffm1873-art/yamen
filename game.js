/**
 * SHAMI KITCHEN 3D - MASTER PROCEDURAL ENGINE v5.0
 * PART 1 OF 2: CORE ENGINE, ARCHITECTURE & CHEF CHARACTER RIG
 * Pure Vanilla Three.js Implementation - Zero External Assets
 * Part 1 Density: ~630 Lines of Solid Geometric Math
 */

const CONFIG = {
    world: { width: 44, height: 16, depth: 32 },
    player: { height: 2.45, speed: 6.8, reach: 5.0, radius: 0.55 },
    physics: { gravity: 25.0, jumpForce: 8.8, friction: 10.0 },
    gfx: { shadowSize: 4096, fov: 66 }
};

const worldColliders = [];
const interactiveTargets = [];
let gameState = { coins: 1009, shift: 1, activeOrders: [] };

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x11141a);
scene.fog = new THREE.FogExp2(0x11141a, 0.018);

const camera = new THREE.PerspectiveCamera(CONFIG.gfx.fov, window.innerWidth / window.innerHeight, 0.05, 1000);
camera.position.set(0, CONFIG.player.height, 5.0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
document.getElementById('game-canvas').appendChild(renderer.domElement);

function generateProceduralTextures() {
    const textures = {};

    const menuCanvas = document.createElement('canvas');
    menuCanvas.width = 512; menuCanvas.height = 256;
    const mCtx = menuCanvas.getContext('2d');
    mCtx.fillStyle = '#1e293b'; mCtx.fillRect(0, 0, 512, 256);
    mCtx.strokeStyle = '#38bdf8'; mCtx.lineWidth = 8; mCtx.strokeRect(4, 4, 504, 248);
    mCtx.fillStyle = '#f59e0b'; mCtx.font = 'bold 36px sans-serif'; mCtx.textAlign = 'center';
    mCtx.fillText('SHAMI KITCHEN MENU', 256, 50);
    mCtx.fillStyle = '#ffffff'; mCtx.font = '24px monospace'; mCtx.textAlign = 'left';
    const items = ['Shawarma Wrap ..... 45$', 'Super Burger ...... 65$', 'Arabian Meal ...... 85$', 'Crispy Fries ...... 25$', 'Cold Pepsi ........ 15$'];
    items.forEach((it, idx) => mCtx.fillText(it, 40, 100 + idx * 32));
    textures.menuBoard = new THREE.CanvasTexture(menuCanvas);

    const apronCanvas = document.createElement('canvas');
    apronCanvas.width = 256; apronCanvas.height = 256;
    const aCtx = apronCanvas.getContext('2d');
    aCtx.fillStyle = '#7f1d1d'; aCtx.fillRect(0, 0, 256, 256);
    aCtx.strokeStyle = '#fbbf24'; aCtx.lineWidth = 6; aCtx.strokeRect(10, 10, 236, 236);
    aCtx.fillStyle = '#fbbf24'; aCtx.beginPath(); aCtx.arc(128, 90, 35, 0, Math.PI * 2); aCtx.fill();
    aCtx.fillStyle = '#7f1d1d'; aCtx.font = 'bold 30px sans-serif'; aCtx.textAlign = 'center';
    aCtx.fillText('SK', 128, 100);
    aCtx.fillStyle = '#ffffff'; aCtx.font = 'bold 26px sans-serif';
    aCtx.fillText('SHAMI', 128, 165);
    aCtx.font = '20px sans-serif';
    aCtx.fillText('KITCHEN', 128, 195);
    textures.apronLogo = new THREE.CanvasTexture(apronCanvas);

    const marbleCanvas = document.createElement('canvas');
    marbleCanvas.width = 256; marbleCanvas.height = 256;
    const mbCtx = marbleCanvas.getContext('2d');
    mbCtx.fillStyle = '#f8fafc'; mbCtx.fillRect(0, 0, 256, 256);
    mbCtx.strokeStyle = '#cbd5e1'; mbCtx.lineWidth = 3;
    for(let i=0; i<8; i++) {
        mbCtx.beginPath(); mbCtx.moveTo(Math.random()*256, 0);
        mbCtx.bezierCurveTo(Math.random()*256, 80, Math.random()*256, 180, Math.random()*256, 256);
        mbCtx.stroke();
    }
    textures.marble = new THREE.CanvasTexture(marbleCanvas);

    return textures;
}
const TEX = generateProceduralTextures();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const studioHemi = new THREE.HemisphereLight(0xfffaed, 0x1e293b, 0.65);
studioHemi.position.set(0, 30, 0);
scene.add(studioHemi);

const mainSpot = new THREE.SpotLight(0xfff3d6, 3.5);
mainSpot.position.set(0, CONFIG.world.height - 2, 4);
mainSpot.angle = Math.PI / 2.8;
mainSpot.penumbra = 0.8;
mainSpot.castShadow = true;
mainSpot.shadow.mapSize.set(CONFIG.gfx.shadowSize, CONFIG.gfx.shadowSize);
mainSpot.shadow.bias = -0.00015;
mainSpot.shadow.camera.near = 1;
mainSpot.shadow.camera.far = 35;
scene.add(mainSpot);

const kitchenFill = new THREE.PointLight(0x38bdf8, 1.6, 22);
kitchenFill.position.set(-8, 6, -6);
scene.add(kitchenFill);

const warmStoveGlow = new THREE.PointLight(0xf97316, 2.0, 14);
warmStoveGlow.position.set(-5, 3, -8);
scene.add(warmStoveGlow);

const masterGroup = new THREE.Group();
scene.add(masterGroup);

function buildArchitecturalShell() {
    const shellGroup = new THREE.Group();

    const floorGroup = new THREE.Group();
    const tileGeo = new THREE.BoxGeometry(1.94, 0.12, 1.94);
    const matDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.2 });
    const matLight = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.2 });

    for(let x = -11; x <= 11; x++) {
        for(let z = -8; z <= 8; z++) {
            const tile = new THREE.Mesh(tileGeo, (x+z)%2 === 0 ? matDark : matLight);
            tile.position.set(x * 2, -0.06, z * 2);
            tile.receiveShadow = true;
            floorGroup.add(tile);
        }
    }
    shellGroup.add(floorGroup);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.world.width, CONFIG.world.height, 1), wallMat);
    backWall.position.set(0, CONFIG.world.height/2, -16.5);
    backWall.receiveShadow = true;
    shellGroup.add(backWall);
    worldColliders.push(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, CONFIG.world.height, CONFIG.world.depth), wallMat);
    leftWall.position.set(-CONFIG.world.width/2 - 0.5, CONFIG.world.height/2, 0);
    leftWall.receiveShadow = true;
    shellGroup.add(leftWall);
    worldColliders.push(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, CONFIG.world.height, CONFIG.world.depth), wallMat);
    rightWall.position.set(CONFIG.world.width/2 + 0.5, CONFIG.world.height/2, 0);
    rightWall.receiveShadow = true;
    shellGroup.add(rightWall);
    worldColliders.push(rightWall);

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.world.width, 0.4, CONFIG.world.depth), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    ceiling.position.set(0, CONFIG.world.height, 0);
    shellGroup.add(ceiling);

    const menuBoardMesh = new THREE.Mesh(
        new THREE.BoxGeometry(7.0, 3.5, 0.2),
        new THREE.MeshBasicMaterial({ map: TEX.menuBoard })
    );
    menuBoardMesh.position.set(6, 9.5, -15.8);
    shellGroup.add(menuBoardMesh);

    const moldingGeo = new THREE.BoxGeometry(CONFIG.world.width, 0.6, 0.6);
    const moldingMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const topMolding = new THREE.Mesh(moldingGeo, moldingMat);
    topMolding.position.set(0, CONFIG.world.height - 0.3, -15.8);
    shellGroup.add(topMolding);

    return shellGroup;
}
masterGroup.add(buildArchitecturalShell());

function buildProceduralChef() {
    const chefGroup = new THREE.Group();
    chefGroup.position.set(0, 0, -2.5);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcb98d, roughness: 0.5 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, map: TEX.apronLogo, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

    const bootsLeft = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.7), pantsMat);
    bootsLeft.position.set(-0.35, 0.25, 0.1);
    bootsLeft.castShadow = true;
    chefGroup.add(bootsLeft);

    const bootsRight = bootsLeft.clone();
    bootsRight.position.x = 0.35;
    chefGroup.add(bootsRight);

    const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 1.6, 12), pantsMat);
    legLeft.position.set(-0.35, 1.2, 0);
    legLeft.castShadow = true;
    chefGroup.add(legLeft);

    const legRight = legLeft.clone();
    legRight.position.x = 0.35;
    chefGroup.add(legRight);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 1.8, 16), shirtMat);
    torso.position.set(0, 2.8, 0);
    torso.castShadow = true;
    chefGroup.add(torso);

    const apronMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.52, 1.5, 16, 1, false, -Math.PI/2, Math.PI), apronMat);
    apronMesh.position.set(0, 2.55, 0.02);
    chefGroup.add(apronMesh);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.3, 12), skinMat);
    neck.position.set(0, 3.8, 0);
    chefGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 4.25, 0);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), skinMat);
    skull.castShadow = true;
    headGroup.add(skull);

    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI*2, 0, Math.PI/2), hairMat);
    hairTop.position.y = 0.05;
    headGroup.add(hairTop);

    const beardGeo = new THREE.TorusGeometry(0.35, 0.08, 8, 16, Math.PI);
    const beard = new THREE.Mesh(beardGeo, hairMat);
    beard.position.set(0, -0.05, 0.08);
    beard.rotation.z = Math.PI;
    headGroup.add(beard);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
    eyeL.position.set(-0.14, 0.08, 0.33);
    headGroup.add(eyeL);

    const eyeR = eyeL.clone();
    eyeR.position.x = 0.14;
    headGroup.add(eyeR);

    chefGroup.add(headGroup);

    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), shirtMat);
    shoulderL.position.set(-0.68, 3.5, 0);
    chefGroup.add(shoulderL);

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 1.3, 12), shirtMat);
    armL.position.set(-0.72, 2.8, 0.3);
    armL.rotation.x = -Math.PI / 6;
    armL.castShadow = true;
    chefGroup.add(armL);

    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), skinMat);
    handL.position.set(-0.72, 2.1, 0.65);
    chefGroup.add(handL);

    const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), shirtMat);
    shoulderR.position.set(0.68, 3.5, 0);
    chefGroup.add(shoulderR);

    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.68, 3.5, 0);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 1.3, 12), shirtMat);
    armR.position.set(0, -0.65, 0.35);
    armR.rotation.x = -Math.PI / 4;
    armR.castShadow = true;
    armRGroup.add(armR);

    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), skinMat);
    handR.position.set(0, -1.2, 0.85);
    armRGroup.add(handR);

    const knifeGroup = new THREE.Group();
    knifeGroup.position.set(0, -1.2, 0.95);
    knifeGroup.rotation.x = Math.PI / 3;

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    handle.position.y = 0.17;
    knifeGroup.add(handle);

    const bladeGeo = new THREE.BoxGeometry(0.08, 0.8, 0.02);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.9, roughness: 0.1 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0, 0.7, 0);
    blade.castShadow = true;
    knifeGroup.add(blade);

    armRGroup.add(knifeGroup);
    chefGroup.add(armRGroup);

    chefGroup.userData = { type: 'chef_rig', rightArm: armRGroup, head: headGroup };
    return chefGroup;
}
const chefInstance = buildProceduralChef();
masterGroup.add(chefInstance);
worldColliders.push(chefInstance.children[4]);

function buildFrontServiceCounter() {
    const counterGroup = new THREE.Group();
    counterGroup.position.set(0, 0, 3.2);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3f2e21, roughness: 0.6 });
    const marbleMat = new THREE.MeshStandardMaterial({ map: TEX.marble, roughness: 0.1 });

    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(26, 1.3, 1.8), woodMat);
    mainBody.position.set(0, 0.65, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    counterGroup.add(mainBody);
    worldColliders.push(mainBody);

    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(26.4, 0.12, 2.2), marbleMat);
    topSlab.position.set(0, 1.36, 0);
    topSlab.receiveShadow = true;
    counterGroup.add(topSlab);

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.05, transmission: 0.95, thickness: 0.1
    });

    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(25.8, 0.9, 0.04), glassMat);
    frontGlass.position.set(0, 1.85, -0.9);
    counterGroup.add(frontGlass);

    const topGlass = new THREE.Mesh(new THREE.BoxGeometry(25.8, 0.04, 0.7), glassMat);
    topGlass.position.set(0, 2.28, -0.58);
    topGlass.rotation.x = Math.PI / 10;
    counterGroup.add(topGlass);

    const postMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    for(let i = -12; i <= 12; i += 6) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.96, 8), postMat);
        post.position.set(i, 1.84, -0.92);
        counterGroup.add(post);
    }

    return counterGroup;
}
masterGroup.add(buildFrontServiceCounter());
const prepStationGroup = new THREE.Group();
prepStationGroup.position.set(0, 0, -8.5);

const prepBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
const prepTopMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

const prepBody = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 1.8), prepBaseMat);
prepBody.position.set(0, 0.6, 0);
prepBody.castShadow = true;
prepBody.receiveShadow = true;
prepStationGroup.add(prepBody);
worldColliders.push(prepBody);

const prepTop = new THREE.Mesh(new THREE.BoxGeometry(22.2, 0.08, 2.0), prepTopMat);
prepTop.position.set(0, 1.24, 0);
prepStationGroup.add(prepTop);

const shelfMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(20, 0.08, 0.8), shelfMat);
shelf1.position.set(0, 4.5, -0.6);
prepStationGroup.add(shelf1);

const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(20, 0.08, 0.8), shelfMat);
shelf2.position.set(0, 6.2, -0.6);
prepStationGroup.add(shelf2);

const hoodMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
const hoodMain = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 5.2, 2.2, 4, 1, false, Math.PI / 4), hoodMat);
hoodMain.position.set(-4.5, 8.5, 0);
hoodMain.scale.set(1.6, 1.0, 1.0);
prepStationGroup.add(hoodMain);

const hoodPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 4.8, 16), hoodMat);
hoodPipe.position.set(-4.5, 11.5, 0);
prepStationGroup.add(hoodPipe);
masterGroup.add(prepStationGroup);

const shawarmaStation = new THREE.Group();
shawarmaStation.position.set(-5.5, 1.28, -8.5);

const sMachineBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 2.4), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 }));
sMachineBase.castShadow = true;
shawarmaStation.add(sMachineBase);

const sMachineBack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.4, 0.25), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 }));
sMachineBack.position.set(0, 2.7, -1.05);
shawarmaStation.add(sMachineBack);

const heaterMat = new THREE.MeshStandardMaterial({ color: 0xff3b00, emissive: 0xff2a00, emissiveIntensity: 4.5 });
const h1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 0.08), heaterMat);
h1.position.set(0, 0.9, -0.9);
shawarmaStation.add(h1);

const h2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 0.08), heaterMat);
h2.position.set(0, 1.65, -0.9);
shawarmaStation.add(h2);

const h3 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 0.08), heaterMat);
h3.position.set(0, 2.4, -0.9);
shawarmaStation.add(h3);

const h4 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 0.08), heaterMat);
h4.position.set(0, 3.15, -0.9);
shawarmaStation.add(h4);

const h5 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 0.08), heaterMat);
h5.position.set(0, 3.9, -0.9);
shawarmaStation.add(h5);

const h6 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 0.08), heaterMat);
h6.position.set(0, 4.65, -0.9);
shawarmaStation.add(h6);

const skewerRod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 5.8, 16), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 1.0 }));
skewerRod.position.set(0, 2.8, 0);
shawarmaStation.add(skewerRod);

const meatStackGroup = new THREE.Group();
meatStackGroup.position.set(0, 2.8, 0);
const rawOuterMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.85 });
const cookedInnerMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 });

const shawarmaDiscs = [];
for (let m = 0; m < 75; m++) {
    const factor = m / 75.0;
    let rad = 0.86 + Math.sin(factor * Math.PI) * 0.38;
    if (factor > 0.82) rad *= (1.0 - (factor - 0.82) * 5.2);

    const g = new THREE.CylinderGeometry(rad, rad - 0.02, 0.055, 20);
    const pos = g.attributes.position;
    for (let v = 0; v < pos.count; v++) {
        if (pos.getY(v) > 0) {
            pos.setX(v, pos.getX(v) + (Math.random() * 0.06 - 0.03));
            pos.setZ(v, pos.getZ(v) + (Math.random() * 0.06 - 0.03));
        }
    }
    g.computeVertexNormals();

    const disc = new THREE.Mesh(g, rawOuterMat.clone());
    disc.position.y = (m * 0.053) - (75 * 0.053) / 2.0;
    disc.rotation.y = (m * 2.41) % (Math.PI * 2);
    disc.castShadow = true;
    disc.receiveShadow = true;
    disc.userData = { id: m, isMeat: true, peeled: false };
    meatStackGroup.add(disc);
    shawarmaDiscs.push(disc);
}
shawarmaStation.add(meatStackGroup);
masterGroup.add(shawarmaStation);

const flyingSlices = [];
function sliceShawarmaDisc(targetDisc) {
    if (targetDisc.userData.peeled) return;
    targetDisc.userData.peeled = true;
    targetDisc.scale.set(0.78, 1.0, 0.78);
    targetDisc.material = cookedInnerMat;

    const flyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 0.35), new THREE.MeshStandardMaterial({ color: 0x9a3412 }));
    const wPos = new THREE.Vector3();
    targetDisc.getWorldPosition(wPos);
    flyMesh.position.copy(wPos);
    scene.add(flyMesh);

    flyingSlices.push({
        mesh: flyMesh,
        target: new THREE.Vector3(-2.0, 1.35, -8.5),
        alpha: 0
    });
    gameState.coins += 15;
    updateHUD();
}

const grillStation = new THREE.Group();
grillStation.position.set(2.5, 1.28, -8.5);

const griddleBase = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 2.6), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
griddleBase.castShadow = true;
grillStation.add(griddleBase);

const rodMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
for (let r = 0; r < 22; r++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 2.4), rodMat);
    bar.position.set(-2.2 + (r * 0.21), 0.2, 0);
    grillStation.add(bar);
}

const burgerPattiesList = [];
const rawPattyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 });
const donePattyMat = new THREE.MeshStandardMaterial({ color: 0x3b1c0a, roughness: 0.9 });
const pattyGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.08, 24);

const p1 = new THREE.Mesh(pattyGeo, rawPattyMat.clone());
p1.position.set(-1.8, 0.28, -0.5);
p1.castShadow = true;
p1.userData = { type: 'patty', cooks: 0, done: false };
grillStation.add(p1);
burgerPattiesList.push(p1);

const p2 = new THREE.Mesh(pattyGeo, rawPattyMat.clone());
p2.position.set(-0.6, 0.28, -0.5);
p2.castShadow = true;
p2.userData = { type: 'patty', cooks: 0, done: false };
grillStation.add(p2);
burgerPattiesList.push(p2);

const p3 = new THREE.Mesh(pattyGeo, rawPattyMat.clone());
p3.position.set(0.6, 0.28, -0.5);
p3.castShadow = true;
p3.userData = { type: 'patty', cooks: 0, done: false };
grillStation.add(p3);
burgerPattiesList.push(p3);

const p4 = new THREE.Mesh(pattyGeo, rawPattyMat.clone());
p4.position.set(1.8, 0.28, -0.5);
p4.castShadow = true;
p4.userData = { type: 'patty', cooks: 0, done: false };
grillStation.add(p4);
burgerPattiesList.push(p4);

const p5 = new THREE.Mesh(pattyGeo, rawPattyMat.clone());
p5.position.set(-1.8, 0.28, 0.5);
p5.castShadow = true;
p5.userData = { type: 'patty', cooks: 0, done: false };
grillStation.add(p5);
burgerPattiesList.push(p5);

const p6 = new THREE.Mesh(pattyGeo, rawPattyMat.clone());
p6.position.set(-0.6, 0.28, 0.5);
p6.castShadow = true;
p6.userData = { type: 'patty', cooks: 0, done: false };
grillStation.add(p6);
burgerPattiesList.push(p6);

const p7 = new THREE.Mesh(pattyGeo, rawPattyMat.clone());
p7.position.set(0.6, 0.28, 0.5);
p7.castShadow = true;
p7.userData = { type: 'patty', cooks: 0, done: false };
grillStation.add(p7);
burgerPattiesList.push(p7);

const p8 = new THREE.Mesh(pattyGeo, rawPattyMat.clone());
p8.position.set(1.8, 0.28, 0.5);
p8.castShadow = true;
p8.userData = { type: 'patty', cooks: 0, done: false };
grillStation.add(p8);
burgerPattiesList.push(p8);

masterGroup.add(grillStation);

const toppingStation = new THREE.Group();
toppingStation.position.set(-3.5, 1.3, 2.8);
const panColors = [0x15803d, 0xb91c1c, 0xfbbf24, 0xffedd5, 0xe2e8f0, 0x475569];

const t1Box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.3), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
t1Box.position.set(0, 0, 0);
toppingStation.add(t1Box);
const t1Food = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 1.15), new THREE.MeshStandardMaterial({ color: panColors[0], roughness: 0.8 }));
t1Food.position.set(0, 0.08, 0);
toppingStation.add(t1Food);

const t2Box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.3), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
t2Box.position.set(1.3, 0, 0);
toppingStation.add(t2Box);
const t2Food = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 1.15), new THREE.MeshStandardMaterial({ color: panColors[1], roughness: 0.8 }));
t2Food.position.set(1.3, 0.08, 0);
toppingStation.add(t2Food);

const t3Box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.3), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
t3Box.position.set(2.6, 0, 0);
toppingStation.add(t3Box);
const t3Food = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 1.15), new THREE.MeshStandardMaterial({ color: panColors[2], roughness: 0.8 }));
t3Food.position.set(2.6, 0.08, 0);
toppingStation.add(t3Food);

const t4Box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.3), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
t4Box.position.set(0, 0, -1.5);
toppingStation.add(t4Box);
const t4Food = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 1.15), new THREE.MeshStandardMaterial({ color: panColors[3], roughness: 0.8 }));
t4Food.position.set(0, 0.08, -1.5);
toppingStation.add(t4Food);

const t5Box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.3), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
t5Box.position.set(1.3, 0, -1.5);
toppingStation.add(t5Box);
const t5Food = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 1.15), new THREE.MeshStandardMaterial({ color: panColors[4], roughness: 0.8 }));
t5Food.position.set(1.3, 0.08, -1.5);
toppingStation.add(t5Food);

const t6Box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.3), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
t6Box.position.set(2.6, 0, -1.5);
toppingStation.add(t6Box);
const t6Food = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 1.15), new THREE.MeshStandardMaterial({ color: panColors[5], roughness: 0.8 }));
t6Food.position.set(2.6, 0.08, -1.5);
toppingStation.add(t6Food);

masterGroup.add(toppingStation);

const posTerminal = new THREE.Group();
posTerminal.position.set(5.5, 1.3, 2.8);

const lBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
posTerminal.add(lBase);

const lScreenGroup = new THREE.Group();
lScreenGroup.position.set(0, 0.04, -0.55);
lScreenGroup.rotation.x = -Math.PI / 7;

const sFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.06), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
sFrame.position.set(0, 0.55, 0);
lScreenGroup.add(sFrame);

const posCanvas = document.createElement('canvas');
posCanvas.width = 512;
posCanvas.height = 356;
const posCtx = posCanvas.getContext('2d');
function renderPOSScreen(msg) {
    posCtx.fillStyle = '#0284c7';
    posCtx.fillRect(0, 0, 512, 356);
    posCtx.fillStyle = '#ffffff';
    posCtx.font = 'bold 36px sans-serif';
    posCtx.fillText("BURGER CORNER POS", 40, 60);
    posCtx.fillRect(40, 80, 432, 4);
    posCtx.font = '28px sans-serif';
    posCtx.fillText(msg || "Waiting for orders...", 40, 150);
    posCtx.fillStyle = '#10b981';
    posCtx.fillRect(40, 260, 432, 60);
    posCtx.fillStyle = '#ffffff';
    posCtx.font = 'bold 32px sans-serif';
    posCtx.fillText("COMPLETE SALE [CLICK]", 80, 302);
    if (posScreenMesh) posScreenMesh.material.map.needsUpdate = true;
}

const posTexture = new THREE.CanvasTexture(posCanvas);
const posScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 0.98), new THREE.MeshBasicMaterial({ map: posTexture }));
posScreenMesh.position.set(0, 0.55, 0.035);
lScreenGroup.add(posScreenMesh);
posTerminal.add(lScreenGroup);

for (let kr = 0; kr < 4; kr++) {
    for (let kc = 0; kc < 8; kc++) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.12), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        key.position.set(-0.55 + kc * 0.16, 0.05, -0.3 + kr * 0.16);
        posTerminal.add(key);
    }
}
posTerminal.userData = { type: 'pos_register' };
masterGroup.add(posTerminal);
renderPOSScreen("System Ready.");

const activeCustomersList = [];
let customerTimer = 0;

function createBubbleMesh(text) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 80, 15);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(128, 90);
    ctx.lineTo(110, 115);
    ctx.lineTo(146, 90);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 58);

    const tex = new THREE.CanvasTexture(c);
    const bubble = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    bubble.position.set(0, 2.5, 0);
    return bubble;
}

class CustomerAI {
    constructor(orderName, price) {
        this.group = new THREE.Group();
        this.orderName = orderName;
        this.price = price;
        this.targetZ = 4.8;
        this.speed = 3.0;
        this.time = Math.random() * 10;

        const colors = [0xef4444, 0x3b82f6, 0x10b981, 0x8b5cf6, 0xf59e0b];
        const pickedColor = colors[Math.floor(Math.random() * colors.length)];
        const skin = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });
        const shirt = new THREE.MeshStandardMaterial({ color: pickedColor, roughness: 0.8 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x111827 });

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), skin);
        head.position.y = 1.95;
        this.group.add(head);

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 1.1, 12), shirt);
        torso.position.y = 1.15;
        this.group.add(torso);

        this.legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.25), dark);
        this.legL.position.set(-0.16, 0.4, 0);
        this.group.add(this.legL);

        this.legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.25), dark);
        this.legR.position.set(0.16, 0.4, 0);
        this.group.add(this.legR);

        this.armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.2), shirt);
        this.armL.position.set(-0.46, 1.25, 0);
        this.group.add(this.armL);

        this.armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.2), shirt);
        this.armR.position.set(0.46, 1.25, 0);
        this.group.add(this.armR);

        this.bubble = createBubbleMesh(`🍔 ${orderName}`);
        this.group.add(this.bubble);

        this.group.position.set((Math.random() - 0.5) * 8.0, 0, 18.0);
        scene.add(this.group);
    }

    update(dt) {
        if (this.group.position.z > this.targetZ) {
            this.time += dt * 6.0;
            this.group.position.z -= this.speed * dt;
            this.legL.rotation.x = Math.sin(this.time) * 0.5;
            this.legR.rotation.x = -Math.sin(this.time) * 0.5;
            this.armL.rotation.x = -Math.sin(this.time) * 0.4;
            this.armR.rotation.x = Math.sin(this.time) * 0.4;
        } else {
            this.legL.rotation.x = 0;
            this.legR.rotation.x = 0;
            this.armL.rotation.x = 0;
            this.armR.rotation.x = 0;
            this.bubble.lookAt(camera.position);
        }
    }
}

function spawnNewCustomer() {
    if (activeCustomersList.length >= 4) return;
    const menu = [
        { n: "Shawarma Wrap", p: 45 },
        { n: "Super Burger", p: 65 },
        { n: "Arabian Meal", p: 85 }
    ];
    const sel = menu[Math.floor(Math.random() * menu.length)];
    activeCustomersList.push(new CustomerAI(sel.n, sel.p));
    renderPOSScreen(`Order: ${sel.n}`);
}

const controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => {
    if (!controls.isLocked) controls.lock();
});

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
    for (let i = 0; i < worldColliders.length; i++) {
        const c = worldColliders[i];
        if (!c || !c.geometry) continue;
        if (!c.geometry.boundingBox) c.geometry.computeBoundingBox();
        const box = c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld);
        const playerBox = new THREE.Box3(
            new THREE.Vector3(nextPos.x - pRadius, nextPos.y - CONFIG.player.height, nextPos.z - pRadius),
            new THREE.Vector3(nextPos.x + pRadius, nextPos.y + 0.2, nextPos.z + pRadius)
        );
        if (box.intersectsBox(playerBox)) return true;
    }
    return false;
}

const centerRay = new THREE.Raycaster();
const screenCenterVector = new THREE.Vector2(0, 0);

function updateHUD() {
    const sBoard = document.querySelector('.score-board');
    if (sBoard) sBoard.innerText = `💰 ${gameState.coins}`;
}

function executePlayerClick() {
    if (!controls.isLocked) return;
    centerRay.setFromCamera(screenCenterVector, camera);
    const intersects = centerRay.intersectObjects(scene.children, true);

    if (intersects.length > 0 && intersects[0].distance <= CONFIG.player.reach) {
        const hit = intersects[0].object;

        if (hit.userData && hit.userData.isMeat) {
            sliceShawarmaDisc(hit);
            return;
        }

        if (hit.userData && hit.userData.type === 'patty') {
            hit.userData.cooks += 35;
            hit.position.y += 0.12;
            setTimeout(() => hit.position.y -= 0.12, 120);
            if (hit.userData.cooks >= 100 && !hit.userData.done) {
                hit.userData.done = true;
                hit.material = donePattyMat;
                gameState.coins += 20;
                updateHUD();
            }
            return;
        }

        let p = hit;
        while (p) {
            if (p === posTerminal) {
                if (activeCustomersList.length > 0) {
                    const doneCust = activeCustomersList.shift();
                    gameState.coins += doneCust.price;
                    scene.remove(doneCust.group);
                    updateHUD();
                    renderPOSScreen(activeCustomersList[0] ? `Order: ${activeCustomersList[0].orderName}` : "Queue Clear.");
                }
                return;
            }
            p = p.parent;
        }
    }
}
window.addEventListener('pointerdown', executePlayerClick);

function animateLoop() {
    requestAnimationFrame(animateLoop);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (controls.isLocked) {
        velocity.x -= velocity.x * CONFIG.physics.friction * dt;
        velocity.z -= velocity.z * CONFIG.physics.friction * dt;
        velocity.y -= CONFIG.physics.gravity * dt;

        const forwardDir = Number(keys.W) - Number(keys.S);
        const sideDir = Number(keys.D) - Number(keys.A);

        if (keys.W || keys.S) velocity.z -= forwardDir * CONFIG.player.speed * CONFIG.physics.friction * dt;
        if (keys.A || keys.D) velocity.x -= sideDir * CONFIG.player.speed * CONFIG.physics.friction * dt;

        if (keys.Space && canJump) {
            velocity.y = CONFIG.physics.jumpForce;
            canJump = false;
        }

        const camObj = controls.getObject();
        const startPos = camObj.position.clone();

        controls.moveRight(-velocity.x * dt);
        controls.moveForward(-velocity.z * dt);

        if (checkPlayerWallCollisions(camObj.position)) {
            camObj.position.x = startPos.x;
            camObj.position.z = startPos.z;
        }

        camObj.position.y += velocity.y * dt;
        if (camObj.position.y < CONFIG.player.height) {
            velocity.y = 0;
            camObj.position.y = CONFIG.player.height;
            canJump = true;
        }

        meatStackGroup.rotation.y += 0.008;
        skewerRod.rotation.y += 0.008;

        for (let i = flyingSlices.length - 1; i >= 0; i--) {
            const fs = flyingSlices[i];
            fs.alpha += dt * 3.2;
            fs.mesh.position.lerp(fs.target, 0.14);
            fs.mesh.scale.setScalar(1.0 - fs.alpha);
            if (fs.alpha >= 1.0) {
                scene.remove(fs.mesh);
                flyingSlices.splice(i, 1);
            }
        }

        customerTimer += dt;
        if (customerTimer >= 7.5) {
            customerTimer = 0;
            spawnNewCustomer();
        }
        activeCustomersList.forEach(c => c.update(dt));

        centerRay.setFromCamera(screenCenterVector, camera);
        const hits = centerRay.intersectObjects(scene.children, true);
        const prompt = document.getElementById('action-prompt');
        if (hits.length > 0 && hits[0].distance < CONFIG.player.reach) {
            const h = hits[0].object;
            if (h.userData && h.userData.isMeat) prompt.innerText = "[كليك يسار] لقص الشاورما";
            else if (h.userData && h.userData.type === 'patty') prompt.innerText = "[كليك يسار] لتقليب البرغر";
            else prompt.innerText = "";
            prompt.style.opacity = prompt.innerText ? "1" : "0";
        } else {
            if (prompt) prompt.style.opacity = "0";
        }
    }

    renderer.render(scene, camera);
}
animateLoop();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
