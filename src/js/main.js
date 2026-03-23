import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x91c3d6);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1000,
);
camera.position.set(4, 5, 11);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 30;
controls.maxDistance = 300;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide,
});

const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(groundMesh);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff4e0, 1.0); // было 2.0
sunLight.position.set(50, 100, 50);
scene.add(sunLight);

// Подсветка снизу
const bottomLight = new THREE.DirectionalLight(0x006994, 0.4); // было 1.2
bottomLight.position.set(0, -100, 0);
scene.add(bottomLight);

// Спереди
const frontLight = new THREE.DirectionalLight(0x00aaff, 0.5); // было 1.5
frontLight.position.set(0, 20, 100);
scene.add(frontLight);

// Сзади
const backLight = new THREE.DirectionalLight(0x0077cc, 0.3); // было 1.0
backLight.position.set(0, 20, -100);
scene.add(backLight);

// Слева
const leftLight = new THREE.DirectionalLight(0x00ccff, 0.3); // было 1.0
leftLight.position.set(-100, 30, 0);
scene.add(leftLight);

// Справа
const rightLight = new THREE.DirectionalLight(0xffffff, 0.3); // было 1.0
rightLight.position.set(100, 30, 0);
scene.add(rightLight);

// Точечный свет в центре
const pointLight = new THREE.PointLight(0x00cfff, 1.0, 500); // было 3.0
pointLight.position.set(0, 10, 0);
scene.add(pointLight);

const loader = new GLTFLoader().setPath("sea.v2/");
loader.load("Untitled.gltf", (gltf) => {
  const mesh = gltf.scene;
  mesh.position.set(0, 1.05, -1);
  scene.add(mesh);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
