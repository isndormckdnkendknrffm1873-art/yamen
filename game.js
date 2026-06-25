// 1. إعداد المشهد والكاميرا والمحرك
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // خلفية رمادية غامقة للمطبخ

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-canvas').appendChild(renderer.domElement);

// 2. إضافة الإضاءة (سر التصميم الاحترافي)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

camera.position.set(0, 3, 5);
camera.lookAt(0, 0, 0);

// 3. طريقة تحميل ملف الـ GLB الجاهز من مجلداتك
const loader = new THREE.GLTFLoader();
let burger;

// هنا نضع مسار ملف البرغر الذي تملكه داخل مجلد المشروع
loader.load('burger.glb', function(gltf) {
    burger = gltf.scene;
    burger.scale.set(2, 2, 2); // تكبير الحجم
    burger.position.set(0, 0, 0); // وضعه في المنتصف
    scene.add(burger);
}, undefined, function(error) {
    console.error('حدث خطأ في تحميل المجسم الاجتماعي:', error);
});

// 4. حلقة التحديث المستمر (Game Loop)
function animate() {
    requestAnimationFrame(animate);
    
    // تدوير البرغر ببطء لإعطاء تأثير حركي لطيف
    if (burger) {
        burger.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
}
animate();

// ضبط الأبعاد عند تغيير حجم الشاشة (أو تدوير الهاتف)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});