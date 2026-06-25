// 1. إعداد المشهد والمحرك مع تفعيل الظلال الفيزيائية (السر في الجودة العالية)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1c23); // لون خلفية عميق

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // تفعيل الظلال
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // ظلال ناعمة احترافية
document.getElementById('game-canvas').appendChild(renderer.domElement);

// 2. هندسة الإضاءة الاحترافية
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// إضاءة موجهة تخلق ظلالاً دقيقة
const spotLight = new THREE.SpotLight(0xffffff, 1.2);
spotLight.position.set(5, 10, 5);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
scene.add(spotLight);

// 3. بناء بيئة المطبخ برمجياً (Procedural Environment)

// --- أ. طاولة التحضير (The Counter) ---
const counterGeo = new THREE.BoxGeometry(10, 1.5, 3);
const counterMat = new THREE.MeshStandardMaterial({ 
    color: 0x2c3e50, 
    roughness: 0.2, 
    metalness: 0.8 
}); // معدن داكن
const counter = new THREE.Mesh(counterGeo, counterMat);
counter.position.set(0, -1, 0);
counter.receiveShadow = true;
scene.add(counter);

// سطح الطاولة (رخام/بلاستيك مقوى)
const topGeo = new THREE.BoxGeometry(10.2, 0.1, 3.2);
const topMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.9 });
const counterTop = new THREE.Mesh(topGeo, topMat);
counterTop.position.set(0, -0.2, 0);
counterTop.receiveShadow = true;
scene.add(counterTop);

// --- ب. آلة الشاورما المعقدة (Procedural Shawarma Machine) ---
const machineGroup = new THREE.Group();
machineGroup.position.set(-2, 0, -0.5);

// قاعدة الآلة
const baseGeo = new THREE.BoxGeometry(2, 0.2, 2);
const steelMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.9, roughness: 0.3 });
const base = new THREE.Mesh(baseGeo, steelMat);
base.castShadow = true;
base.receiveShadow = true;
machineGroup.add(base);

// اللوح الخلفي للآلة
const backGeo = new THREE.BoxGeometry(1.8, 3.5, 0.2);
const backPanel = new THREE.Mesh(backGeo, steelMat);
backPanel.position.set(0, 1.85, -0.8);
backPanel.castShadow = true;
machineGroup.add(backPanel);

// عناصر التسخين (شمعات النار المشعة)
const heaterGeo = new THREE.BoxGeometry(1.4, 0.6, 0.1);
const heaterMat = new THREE.MeshStandardMaterial({ 
    color: 0xff3300, 
    emissive: 0xff3300, 
    emissiveIntensity: 0.8 
});
for(let i = 0; i < 4; i++) {
    const heater = new THREE.Mesh(heaterGeo, heaterMat);
    heater.position.set(0, 0.8 + (i * 0.7), -0.7);
    machineGroup.add(heater);
}

// سيخ الشاورما (المعدن المركزي)
const skewerGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.8, 16);
const skewer = new THREE.Mesh(skewerGeo, steelMat);
skewer.position.set(0, 1.9, 0);
skewer.castShadow = true;
machineGroup.add(skewer);

// --- ج. بناء كتلة اللحم هندسياً (The Meat Stack) ---
const meatGroup = new THREE.Group();
meatGroup.position.set(0, 1.9, 0);

// نولد طبقات اللحم بأحجام عشوائية لتبدو واقعية وطبيعية
const meatLayers = 25;
const meatMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b3a0e, 
    roughness: 0.9,
    bumpScale: 0.05
});

for(let i = 0; i < meatLayers; i++) {
    // قطر عشوائي لكل طبقة ليعطي شكل الشاورما المخروطي غير المنتظم
    const radius = 0.5 + Math.random() * 0.15 - (Math.abs(i - meatLayers/2) * 0.015);
    const layerGeo = new THREE.CylinderGeometry(radius, radius - 0.05, 0.12, 16);
    
    // تشويه المضلعات (Vertices) لتبدو كل قطعة لحم مختلفة
    const positions = layerGeo.attributes.position;
    for (let j = 0; j < positions.count; j++) {
        positions.setX(j, positions.getX(j) + (Math.random() * 0.02 - 0.01));
        positions.setZ(j, positions.getZ(j) + (Math.random() * 0.02 - 0.01));
    }
    layerGeo.computeVertexNormals();

    const layer = new THREE.Mesh(layerGeo, meatMaterial);
    layer.position.y = (i * 0.1) - (meatLayers * 0.1) / 2;
    layer.castShadow = true;
    layer.receiveShadow = true;
    
    // تدوير عشوائي لكل طبقة
    layer.rotation.y = Math.random() * Math.PI;
    meatGroup.add(layer);
}
machineGroup.add(meatGroup);
scene.add(machineGroup);

// إعداد الكاميرا لتنظر للآلة
camera.position.set(0, 2.5, 5);
camera.lookAt(-1, 1.5, 0);

// 4. التفاعل (القص من الشاورما)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // إذا ضغط اللاعب على كتلة اللحم
    const intersects = raycaster.intersectObject(meatGroup, true);
    if (intersects.length > 0) {
        // تصغير بسيط للطبقة التي تم ضغطها (كأنك قصصت منها)
        const hitLayer = intersects[0].object;
        hitLayer.scale.set(hitLayer.scale.x * 0.9, 1, hitLayer.scale.z * 0.9);

        // إضافة نقود
        const coinsElement = document.getElementById('coins');
        coinsElement.innerText = parseInt(coinsElement.innerText) + 15;
    }
});

// 5. حلقة التحديث المستمر
function animate() {
    requestAnimationFrame(animate);
    
    // دوران سيخ الشاورما ببطء أمام النار
    meatGroup.rotation.y += 0.005;
    skewer.rotation.y += 0.005;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
