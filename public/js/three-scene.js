/**
 * Mubarak Atheeb 3D WebGL Background Scene
 * Built with Three.js: Constellations, 3D Geometries & Reactive Mouse Physics
 */

(function () {
  const container = document.getElementById('canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 35;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x00f2fe, 2, 50);
  cyanLight.position.set(10, 15, 10);
  scene.add(cyanLight);

  const purpleLight = new THREE.PointLight(0x9d4edd, 2, 50);
  purpleLight.position.set(-15, -10, 10);
  scene.add(purpleLight);

  // 1. STARFIELD / PARTICLE CONSTELLATION
  const particleCount = 1200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color(0x00f2fe), // cyan
    new THREE.Color(0x4facfe), // sky blue
    new THREE.Color(0x9d4edd), // purple
    new THREE.Color(0xffffff), // white
    new THREE.Color(0x10b981)  // emerald
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 120;
    positions[i3 + 1] = (Math.random() - 0.5) * 90;
    positions[i3 + 2] = (Math.random() - 0.5) * 60;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i3] = chosenColor.r;
    colors[i3 + 1] = chosenColor.g;
    colors[i3 + 2] = chosenColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.28,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, particleMaterial);
  scene.add(particleSystem);

  // 2. FLOATING 3D WIREFRAME CYBER CORE (Icosahedron)
  const icoGeo = new THREE.IcosahedronGeometry(7, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
    roughness: 0.2,
    metalness: 0.8
  });
  const cyberCore = new THREE.Mesh(icoGeo, icoMat);
  cyberCore.position.set(18, 2, -5);
  scene.add(cyberCore);

  // Inner solid core with glow
  const innerGeo = new THREE.OctahedronGeometry(3.5, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x7928ca,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  const innerCore = new THREE.Mesh(innerGeo, innerMat);
  cyberCore.add(innerCore);

  // 3. FLOATING 3D TORUS KNOT (Left Ambience)
  const torusGeo = new THREE.TorusKnotGeometry(4.5, 0.8, 80, 16);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });
  const torusMesh = new THREE.Mesh(torusGeo, torusMat);
  torusMesh.position.set(-20, -6, -8);
  scene.add(torusMesh);

  // 4. FLOATING DATA NODES (Small geometric meshes)
  const floatingNodes = [];
  const nodeGeos = [
    new THREE.TetrahedronGeometry(1.2),
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.DodecahedronGeometry(1.0)
  ];

  for (let i = 0; i < 9; i++) {
    const geo = nodeGeos[i % nodeGeos.length];
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00f2fe : 0xec4899,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 35,
      (Math.random() - 0.5) * 20 - 5
    );
    mesh.userData = {
      rotX: (Math.random() - 0.5) * 0.02,
      rotY: (Math.random() - 0.5) * 0.02,
      speedY: 0.005 + Math.random() * 0.008,
      initialY: mesh.position.y
    };
    scene.add(mesh);
    floatingNodes.push(mesh);
  }

  // Mouse Interaction Physics
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Smooth 3D Scroll Journey & Parallax Inertia
  let currentScrollY = window.pageYOffset || 0;
  let targetScrollY = currentScrollY;
  let scrollProgress = 0;

  window.addEventListener('scroll', () => {
    targetScrollY = window.pageYOffset || window.scrollY || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress = targetScrollY / maxScroll;
  }, { passive: true });

  // Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse inertia
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Smooth scroll inertia for 3D camera and geometry travel
    currentScrollY += (targetScrollY - currentScrollY) * 0.08;

    // 1. Dynamic 3D Camera Travel through Cyber Space
    camera.position.y = -currentScrollY * 0.014;
    camera.position.z = 35 + Math.sin(scrollProgress * Math.PI) * 8;
    camera.rotation.z = Math.sin(scrollProgress * Math.PI * 2) * 0.04;

    // 2. Parallax particle constellation
    particleSystem.position.y = currentScrollY * 0.006;
    particleSystem.rotation.y = elapsedTime * 0.03 + targetX * 0.2 + currentScrollY * 0.0003;
    particleSystem.rotation.x = targetY * 0.15 + currentScrollY * 0.0002;

    // 3. Cyber core rotations & vertical drift
    cyberCore.position.y = -currentScrollY * 0.012;
    cyberCore.rotation.x = elapsedTime * 0.18 + targetY * 0.3 + currentScrollY * 0.001;
    cyberCore.rotation.y = elapsedTime * 0.22 + targetX * 0.4 + currentScrollY * 0.001;
    innerCore.rotation.x = -elapsedTime * 0.3;
    innerCore.rotation.z = elapsedTime * 0.2;

    // 4. Torus knot smooth scroll trajectory
    torusMesh.rotation.x = elapsedTime * 0.12 + currentScrollY * 0.001;
    torusMesh.rotation.y = elapsedTime * 0.15;
    torusMesh.position.y = -6 - currentScrollY * 0.01 + Math.sin(elapsedTime * 0.8) * 1.5;
    torusMesh.position.x = -18 + Math.cos(scrollProgress * Math.PI * 2) * 4;

    // 5. Dynamic point light tracking
    cyanLight.position.x = 10 + targetX * 15;
    cyanLight.position.y = 15 - targetY * 15 - currentScrollY * 0.014;

    // 6. Floating nodes animation
    floatingNodes.forEach((node, idx) => {
      node.rotation.x += node.userData.rotX;
      node.rotation.y += node.userData.rotY;
      node.position.y = node.userData.initialY - currentScrollY * (0.008 + idx * 0.002) + Math.sin(elapsedTime * 1.2 + node.position.x) * 1.5;
    });

    renderer.render(scene, camera);
  }

  animate();
})();

