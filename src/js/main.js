import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { CatmullRomCurve3 } from "three";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// 🌫️ Туманный серо-голубой фон как на референсе
scene.background = new THREE.Color(0xc8d8e0);
scene.fog = new THREE.FogExp2(0xc8d8e0, 0.004); // туман вдаль

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1000,
);

// ====================================
// 🌊 ВОДА — светлая, отражающая
// ====================================
const waterGeometry = new THREE.PlaneGeometry(1000, 1000);

const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/waternormals.jpg",
    (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    },
  ),
  sunDirection: new THREE.Vector3(0.5, 1, 0).normalize(),
  sunColor: 0xffffff,
  waterColor: 0xa8c8d8, // светло-голубой как на референсе
  distortionScale: 1.5, // мелкие волны
  fog: true,
});

water.rotation.x = -Math.PI / 2;
water.position.y = 0;
scene.add(water);

// ====================================
// 💡 ОСВЕЩЕНИЕ — мягкое, рассеянное
// ====================================

// Основной мягкий свет — главный источник
const ambientLight = new THREE.AmbientLight(0xd0dde5, 2.5);
scene.add(ambientLight);

// Солнце сзади-сверху (как на референсе — свет с горизонта)
const sunLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
sunLight.position.set(0, 80, -200);
scene.add(sunLight);

// Мягкая подсветка спереди
const frontLight = new THREE.DirectionalLight(0xe8f0f5, 0.6);
frontLight.position.set(0, 30, 200);
scene.add(frontLight);

// Боковые — очень мягкие
const leftLight = new THREE.DirectionalLight(0xd5e8f0, 0.3);
leftLight.position.set(-200, 50, 0);
scene.add(leftLight);

const rightLight = new THREE.DirectionalLight(0xd5e8f0, 0.3);
rightLight.position.set(200, 50, 0);
scene.add(rightLight);

// Снизу — отражение от воды
const bottomLight = new THREE.DirectionalLight(0xb0d0e0, 0.4);
bottomLight.position.set(0, -50, 0);
scene.add(bottomLight);

// ====================================
// МОДЕЛЬ
// ====================================
const loader = new GLTFLoader().setPath("sea.v2/");
loader.load(
  "Untitled.glb",
  (gltf) => {
    const mesh = gltf.scene;
    mesh.position.set(0, 1.05, -1);

    // Делаем материалы матовыми как на референсе
    mesh.traverse((child) => {
      if (child.isMesh) {
        child.material.roughness = 0.8; // матовость
        child.material.metalness = 0.2; // чуть металлик
        child.material.envMapIntensity = 0.5;
      }
    });

    scene.add(mesh);
    console.log("✅ Модель загружена");
  },
  (xhr) =>
    console.log("Загрузка:", Math.round((xhr.loaded / xhr.total) * 100) + "%"),
  (error) => console.error("❌ Ошибка:", error),
);

// ====================================
// 📍 ПУТЬ КАМЕРЫ ПО СКРОЛЛУ
// ====================================
const path = new CatmullRomCurve3([
  new THREE.Vector3(0, 80, 200),
  new THREE.Vector3(60, 50, 120),
  new THREE.Vector3(80, 30, 30),
  new THREE.Vector3(0, 20, 0),
  new THREE.Vector3(-80, 30, -30),
  new THREE.Vector3(-60, 50, -120),
  new THREE.Vector3(0, 80, -200),
]);

const lookAtPath = new CatmullRomCurve3([
  new THREE.Vector3(0, 0, 100),
  new THREE.Vector3(30, 0, 30),
  new THREE.Vector3(40, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(-40, 0, -10),
  new THREE.Vector3(-30, 0, -80),
  new THREE.Vector3(0, 0, -100),
]);

let scrollProgress = 0;
document.body.style.height = "2000vh";

window.addEventListener("scroll", () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollProgress = window.scrollY / maxScroll;
});

// ====================================
// АНИМАЦИЯ
// ====================================
function animate() {
  requestAnimationFrame(animate);

  // Волны 🌊
  water.material.uniforms["time"].value += 0.3 / 60.0; // медленные волны

  // Камера по скроллу
  const t = Math.max(0, Math.min(1, scrollProgress));
  const camPos = path.getPointAt(t);
  const lookAt = lookAtPath.getPointAt(t);
  camera.position.copy(camPos);
  camera.lookAt(lookAt);

  renderer.render(scene, camera);
}

animate();

// ====================================
// RESIZE
// ====================================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
