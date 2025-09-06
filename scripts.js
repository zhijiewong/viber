// Ultra-Modern Three.js Scene with Morphing Geometries
class ViberScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('bg'),
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.objects = [];
    this.time = 0;
    this.morphTargets = [];

    this.init();
    this.createMorphingGeometry();
    this.createParticleSystem();
    this.createFloatingOrbs();
    this.addAdvancedLighting();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.camera.position.set(0, 0, 8);
  }

  createMorphingGeometry() {
    // Create morphing geometry with multiple target shapes
    const geometry = new THREE.SphereGeometry(2, 64, 64);

    // Create morph targets
    const octahedron = new THREE.OctahedronGeometry(2, 0);
    const icosahedron = new THREE.IcosahedronGeometry(2, 1);
    const torus = new THREE.TorusGeometry(1.5, 0.8, 16, 100);

    // Add morph attributes
    geometry.morphAttributes.position = [];
    geometry.morphAttributes.position[0] = octahedron.attributes.position;
    geometry.morphAttributes.position[1] = icosahedron.attributes.position;
    geometry.morphAttributes.position[2] = torus.attributes.position;

    const material = new THREE.MeshPhongMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
      specular: 0x111111,
      morphTargets: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.objects.push(mesh);
    this.morphingMesh = mesh;
  }

  createParticleSystem() {
    const particlesCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      // Create sphere distribution
      const radius = Math.random() * 25 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Color gradient from blue to purple to cyan
      const colorProgress = Math.random();
      if (colorProgress < 0.33) {
        colors[i3] = 0.0; // R
        colors[i3 + 1] = 0.8 + Math.random() * 0.2; // G
        colors[i3 + 2] = 1.0; // B
      } else if (colorProgress < 0.66) {
        colors[i3] = 0.5 + Math.random() * 0.3; // R
        colors[i3 + 1] = 0.0; // G
        colors[i3 + 2] = 0.8 + Math.random() * 0.2; // B
      } else {
        colors[i3] = Math.random() * 0.2; // R
        colors[i3 + 1] = 0.5 + Math.random() * 0.3; // G
        colors[i3 + 2] = 1.0; // B
      }

      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;

        void main() {
          vColor = color;

          vec3 pos = position;

          // Add wave motion
          pos.y += sin(time * 2.0 + position.x * 0.01) * 0.5;
          pos.x += cos(time * 1.5 + position.z * 0.01) * 0.3;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float r = distance(gl_PointCoord, vec2(0.5, 0.5));
          if (r > 0.5) discard;

          gl_FragColor = vec4(vColor, 0.8 * (1.0 - r * 2.0));
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    this.objects.push(particles);
    this.particles = particles;
  }

  createFloatingOrbs() {
    const orbCount = 8;
    for (let i = 0; i < orbCount; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / orbCount, 0.8, 0.6),
        transparent: true,
        opacity: 0.7,
        emissive: new THREE.Color().setHSL(i / orbCount, 0.8, 0.3),
        emissiveIntensity: 0.2
      });

      const orb = new THREE.Mesh(geometry, material);

      // Position in circle
      const angle = (i / orbCount) * Math.PI * 2;
      const radius = 6;
      orb.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 2,
        Math.sin(angle) * radius
      );

      this.scene.add(orb);
      this.objects.push(orb);
    }
  }

  addAdvancedLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Colored point lights
    const colors = [0x00d4ff, 0x8338ec, 0xff6b6b, 0x06ffa5];
    colors.forEach((color, index) => {
      const pointLight = new THREE.PointLight(color, 0.5, 20);
      const angle = (index / colors.length) * Math.PI * 2;
      pointLight.position.set(
        Math.cos(angle) * 8,
        Math.sin(angle * 0.5) * 3,
        Math.sin(angle) * 8
      );
      this.scene.add(pointLight);
    });

    // Atmospheric fog
    this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = scrollY / maxScroll;

      // Camera movement based on scroll
      this.camera.position.z = 8 - scrollProgress * 4;
      this.camera.position.y = scrollProgress * 2;

      // Update morphing
      if (this.morphingMesh) {
        this.morphingMesh.morphTargetInfluences[0] = Math.sin(scrollProgress * Math.PI * 2) * 0.5 + 0.5;
        this.morphingMesh.morphTargetInfluences[1] = Math.cos(scrollProgress * Math.PI * 2) * 0.5 + 0.5;
        this.morphingMesh.morphTargetInfluences[2] = Math.sin(scrollProgress * Math.PI * 4) * 0.5 + 0.5;
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.time += 0.01;

    // Animate morphing mesh
    if (this.morphingMesh) {
      this.morphingMesh.rotation.x += 0.005;
      this.morphingMesh.rotation.y += 0.008;
      this.morphingMesh.position.y = Math.sin(this.time) * 0.5;
    }

    // Animate particles
    if (this.particles && this.particles.material.uniforms) {
      this.particles.material.uniforms.time.value = this.time;
      this.particles.rotation.y += 0.001;
    }

    // Animate floating orbs
    this.objects.forEach((obj, index) => {
      if (obj.type === 'Mesh' && obj.geometry.type === 'SphereGeometry') {
        obj.position.y += Math.sin(this.time * 2 + index) * 0.01;
        obj.rotation.x += 0.02;
        obj.rotation.z += 0.01;
      }
    });

    // Mouse interaction
    this.camera.position.x += (this.mouse.x * 3 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 3 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the scene
const viberScene = new ViberScene();

// Add scroll-triggered animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

// Observe sections for animations
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section');
  sections.forEach(section => observer.observe(section));
});
