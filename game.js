// 1. إعداد المشهد والكاميرا والمحرك (Renderer)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // خلفية رمادية غامقة للمطبخ

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-canvas').appendChild(renderer.domElement);

// 2. إضافة الإضاءة (مهمة جداً لإظهار تفاصيل وألوان الـ 3D)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // إضاءة محيطية شاملة
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); // إضاءة موجهة للشمس لإنشاء أبعاد
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// ضبط موقع الكاميرا وزاوية الرؤية فوق طاولة التحضير
camera.position.set(0, 2, 4);
camera.lookAt(0, 0, 0);

// 3. طريقة تحميل ملف الـ GLB الجاهز مع معالجة الأخطاء والخامات
const loader = new THREE.GLTFLoader();
let burger;

loader.load('./burger.glb', function(gltf) {
    burger = gltf.scene;
    
    // فحص أجزاء المجسم لتجنب الشاشة السوداء في حال لم تظهر صورة الألوان فوراً
    burger.traverse((child) => {
        if (child.isMesh) {
            // إذا كان هناك خامات مفقودة، يتم وضع لون ذهبي/برتقالي افتراضي لتظهر الشطيرة
            if (!child.material.map) {
                child.material.color.setHex(0xffbe07); 
            }
        }
    });

    // تكبير حجم مجسمات Kenney لأنها تأتي صغيرة جداً في الوضع الافتراضي
    burger.scale.set(12, 12, 12); 
    burger.position.set(0, -0.5, 0); // ضبط الارتفاع ليكون في منتصف الشاشة
    
    scene.add(burger);
    console.log("تم تحميل البرغر بنجاح وظهوره في المطبخ!");
}, undefined, function(error) {
    console.error('حدث خطأ في تحميل المجسم ثلاثي الأبعاد:', error);
});

// 4. حلقة التحديث المستمر للعبة (Game Loop)
function animate() {
    requestAnimationFrame(animate);
    
    // تدوير البرغر ببطء لإعطاء حيوية للعبة داخل المتصفح
    if (burger) {
        burger.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
}
animate();

// 5. إعادة ضبط الأبعاد تلقائياً عند تدوير الهاتف أو تغيير حجم الشاشة
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
