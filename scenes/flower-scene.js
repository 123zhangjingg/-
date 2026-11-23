import * as THREE from '../vendor/three.module.min.js';
import { createParticleBouquet } from '../effects/particle-bouquet.js';
import { createRose } from '../components/rose-bloom.js';

export function createFlowerScene(canvas, reduced, onContextLost) {
  const options = {alpha: true, antialias: true, powerPreference: 'low-power'};
  const context = canvas.getContext('webgl2', options) || canvas.getContext('webgl', options);
  if (!context) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, context, ...options });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 35);
  camera.position.set(0, .23, 9.5);
  camera.lookAt(0, -.02, 0);
  const group = new THREE.Group();
  group.rotation.z = -.09;
  group.position.y = .14;
  scene.add(group);

  const mobile = matchMedia('(pointer: coarse), (max-width: 740px)').matches;
  const bouquet = createParticleBouquet(mobile ? .33 : .66);
  bouquet.position.set(0, -.09, -.22);
  bouquet.scale.setScalar(1.06);
  group.add(bouquet);
  canvas.dataset.points = bouquet.geometry.getAttribute('position').count;

  const arrangements = [
    [-1.03, 1.25, .35, .59, -.23, -.38, .29],
    [1.04, 1.09, .44, .60, -.13, .33, -.47],
    [-1.40, .48, .34, .48, .19, -.23, .72],
    [1.38, .42, .37, .49, .13, .35, .59],
    [.18, 1.63, .17, .53, -.37, .09, -.14],
    [.00, .64, .64, 1.01, -.10, -.14, .09]
  ];
  const sideRoses = mobile ? arrangements.filter((_, index) => index !== 2 && index !== 3) : arrangements;
  const roses = sideRoses.map(([x, y, z, size, tilt, yaw, roll]) => {
    const rose = createRose();
    rose.group.position.set(x, y, z);
    rose.group.scale.setScalar(size);
    rose.group.rotation.set(tilt, yaw, roll);
    group.add(rose.group);
    return rose;
  });

  scene.add(new THREE.HemisphereLight(0xffe8ee, 0x6b395a, 2.13));
  const key = new THREE.DirectionalLight(0xffe1cc, 2.40);
  key.position.set(-3, 4, 7);
  const rim = new THREE.DirectionalLight(0xd1bafa, 1.9);
  rim.position.set(4, 2, -4);
  scene.add(key, rim);

  let active = false;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  let appliedBloom = -1;
  let lost = false;
  const cursor = new THREE.Vector2();
  const eased = new THREE.Vector2();

  function resize() {
    if (lost) return;
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.45 : 1.75));
    renderer.setSize(width, height, false);
    bouquet.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    if (active && reduced.matches) renderStatic();
  }

  function render() {
    const still = reduced.matches;
    const progress = still ? 1 : Math.min(1, elapsed / 4.1);
    const uniforms = bouquet.material.uniforms;
    uniforms.uTime.value = still ? 0 : elapsed;
    uniforms.uProgress.value = still ? 1 : Math.min(1, .13 + elapsed / 3.1);
    // The mesh blooms while the original particle system assembles around it.
    if (progress !== appliedBloom) {
      for (const [index, rose] of roses.entries()) {
        const delay = index === roses.length - 1 ? 0 : .085 + index * .025;
        rose.update(still ? 1 : Math.max(0, (progress - delay) / (1 - delay)));
      }
      appliedBloom = progress;
      canvas.dataset.bloom = String(Math.round(progress * 1000) / 1000);
    }
    eased.lerp(cursor, .045);
    const turn = Math.max(0, elapsed - 4.1);
    group.rotation.y = still ? 0 : Math.sin(turn * .44) * .26 + eased.x * .12;
    group.rotation.x = still ? 0 : Math.sin(turn * .27) * .07 - eased.y * .07;
    renderer.render(scene, camera);
  }

  function renderStatic() {
    if (active && !lost) render();
  }

  function tick(now) {
    frame = 0;
    if (!active || document.hidden || lost) return;
    if (previous) elapsed += Math.min((now - previous) / 1000, .085);
    previous = now;
    render();
    if (!reduced.matches) frame = requestAnimationFrame(tick);
  }

  function resume() {
    if (frame || !active || document.hidden || lost) return;
    previous = 0;
    frame = requestAnimationFrame(tick);
  }

  function pause() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  window.addEventListener('resize', resize, {passive: true});
  window.addEventListener('pointermove', event => {
    if (!active || reduced.matches) return;
    cursor.set(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
  }, {passive: true});
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
  reduced.addEventListener('change', () => {
    if (!active) return;
    pause();
    resume();
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    pause();
    onContextLost();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    resize();
    if (active) {
      render();
      document.body.dataset.renderer = 'webgl';
    }
    resume();
  });

  return {
    start() {
      active = true;
      elapsed = 0;
      cursor.set(0, 0);
      eased.set(0, 0);
      resize();
      if (!lost) {
        render();
        document.body.dataset.renderer = 'webgl';
      }
      resume();
    },
    stop() {
      active = false;
      pause();
    }
  };
}

