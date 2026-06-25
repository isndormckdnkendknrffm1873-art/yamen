const scene = new THREE.Scene();
scene.background = new THREE.Color(0x11141a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-canvas').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

camera.position.set(0, 3, 5);
camera.lookAt(0, 0, 0);

const burgerGroup = new THREE.Group();

const bottomBunGeo = new THREE.CylinderGeometry(1, 1.1, 0.2, 32);
const bunMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.5 });
const bottomBun = new THREE.Mesh(bottomBunGeo, bunMat);
bottomBun.position.y = -0.4;
burgerGroup.add(bottomBun);

const meatGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.25, 32);
const meatMat = new THREE.MeshStandardMaterial({ color: 0x4f2f1d, roughness: 0.8 });
const meat = new THREE.Mesh(meatGeo, meatMat);
meat.position.y = -0.15;
burgerGroup.add(meat);

const cheeseGeo = new THREE.BoxGeometry(1.8, 0.04, 1.8);
const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xffbe07 });
const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
cheese.position.y = 0.01;
cheese.rotation.y = Math.PI / 4;
burgerGroup.add(cheese);

const topBunGeo = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
const topBun = new THREE.Mesh(topBunGeo, bunMat);
topBun.position.y = 0.05;
topBun.scale.y = 0.6;
burgerGroup.add(topBun);

scene.add(burgerGroup);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(burgerGroup, true);

    if (intersects.length > 0) {
        burgerGroup.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => {
            burgerGroup.scale.set(1, 1, 1);
        }, 150);

        const coinsElement = document.getElementById('coins');
        coinsElement.innerText = parseInt(coinsElement.innerText) + 25;
    }
});

function animate() {
    requestAnimationFrame(animate);
    burgerGroup.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
