// Adapted from Particle-bouquet by zhouchaofei. MIT, see ../LICENSE.
// https://github.com/zhouchaofei/Particle-bouquet/tree/98bbffbac946096650d7750c1ea72a863a77db8e
import * as THREE from "../vendor/three.module.min.js";

export function createParticleBouquet(density) {
  let sample = 0;
  const positions = [];
  const starts = [];
  const colors = [];
  const seeds = [];
  const sizes = [];
  const scratchColor = new THREE.Color();
  const pearl = new THREE.Color(0xfff6f0);

  function addPoint(x, y, z, hex, size = .7, pearlMix = 0) {
    sample += density;
    if (sample < 1) return;
    sample -= 1;
    scratchColor.set(hex).lerp(pearl, Math.min(.58, pearlMix + Math.random() * .055));
    positions.push(x, y, z);

    const angle = Math.random() * Math.PI * 2;
    const radius = 4.5 + Math.pow(Math.random(), .6) * 4.5;
    starts.push(
      x * .12 + Math.cos(angle) * radius,
      y * .12 + (Math.random() - .5) * radius * 1.25,
      z * .12 + Math.sin(angle) * radius - 1.8
    );
    colors.push(scratchColor.r, scratchColor.g, scratchColor.b);
    seeds.push(Math.random());
    sizes.push(size * (.72 + Math.random() * .56));
  }

  function rotatePoint(x, y, z, yaw, pitch, roll = 0) {
    const cr = Math.cos(roll), sr = Math.sin(roll);
    const x1 = x * cr - y * sr;
    const y1 = x * sr + y * cr;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const x2 = x1 * cy - z * sy;
    const z2 = x1 * sy + z * cy;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    return [x2, y1 * cp - z2 * sp, y1 * sp + z2 * cp];
  }

  // Explicit petal surfaces keep the folded rose structure visible.
  function addRose(cx, cy, cz, scale, palette, yaw, pitch, roll, count = 1900) {
    const layers = 7;
    for (let i = 0; i < count; i++) {
      const layer = Math.min(layers - 1, Math.floor(Math.pow(Math.random(), .78) * layers));
      const petalCount = 4 + layer * 2;
      const petal = Math.floor(Math.random() * petalCount);
      const u = Math.random() * 2 - 1;
      const v = Math.pow(Math.random(), .68);
      const centerAngle = petal * Math.PI * 2 / petalCount + layer * .71;
      const spread = (.34 + v * .72) * Math.PI / petalCount;
      const angle = centerAngle + u * spread;
      const baseRadius = scale * (.035 + layer * .050);
      const radius = baseRadius + scale * v * (.102 + layer * .006);
      const rim = Math.sin(v * Math.PI);

      let x = Math.cos(angle) * radius;
      let y = Math.sin(angle) * radius * (.90 + layer * .013);
      let z = scale * (
        .145 * (1 - v) +
        rim * (.030 + layer * .011) -
        layer * .021 +
        Math.cos(u * Math.PI) * .018
      );

      const fray = scale * layer / layers * .009;
      x += (Math.random() - .5) * fray;
      y += (Math.random() - .5) * fray;
      [x, y, z] = rotatePoint(x, y, z, yaw, pitch, roll);

      const tone = palette[(petal + layer + (Math.random() * palette.length | 0)) % palette.length];
      const highlight = layer < 2 ? .10 : layer > 5 ? .14 : .02;
      addPoint(cx + x, cy + y, cz + z, tone, layer < 2 ? .66 : .52, highlight);
    }

    for (let i = 0; i < 120; i++) {
      const t = i / 120 * Math.PI * 7 + Math.random() * .18;
      const r = scale * (.006 + i / 120 * .075);
      let x = Math.cos(t) * r;
      let y = Math.sin(t) * r;
      let z = scale * (.16 - i / 120 * .035);
      [x, y, z] = rotatePoint(x, y, z, yaw, pitch, roll);
      addPoint(cx + x, cy + y, cz + z, palette[0], .62, .18);
    }
  }

  const ivory = ["#f8ccdc", "#eeb5cc", "#ffebed", "#eec8c4"];
  const blush = ["#de87a7", "#eda6c0", "#b45680", "#f7becf"];
  const peach = ["#d66f9b", "#e486a7", "#b3577d", "#f2aac4"];
  const pink = ["#de7584", "#ea909b", "#cb6374", "#f0a9ae"];

  // Overlapping centres form a broad, dense floral dome.
  const roses = [
    [-1.52, 1.20, -.06, .76, blush, -.18, .14, -.18],
    [-1.00, 1.60, -.17, .69, ivory, -.10, -.08,  .24],
    [ -.40, 1.78, -.20, .72, peach,  .08, -.12, -.12],
    [  .25, 1.82, -.12, .74, ivory, -.04, -.10,  .16],
    [  .88, 1.61, -.12, .72, blush,  .13, -.06, -.15],
    [ 1.43, 1.22, -.02, .74, ivory,  .20,  .12,  .18],
    [-1.72,  .67,  .04, .71, ivory, -.24, .10,  .10],
    [-1.12,  .86,  .23, .80, peach, -.17, .14, -.21],
    [ -.48, 1.07,  .31, .84, blush, -.07, .16,  .12],
    [  .23, 1.10,  .36, .86, ivory,  .05, .16, -.08],
    [  .94,  .91,  .26, .81, pink,   .16, .13,  .20],
    [ 1.56,  .64,  .08, .70, peach,  .23, .08, -.13],
    [-1.43,  .16,  .04, .64, pink,  -.20, .15, -.10],
    [ -.82,  .34,  .31, .76, ivory, -.12, .20,  .18],
    [ -.15,  .42,  .48, .82, peach, -.02, .23, -.14],
    [  .58,  .38,  .39, .78, blush,  .10, .20,  .16],
    [ 1.25,  .14,  .14, .68, ivory,  .20, .15, -.16],
    [ -.82, -.10,  .20, .60, blush, -.10, .18,  .14],
    [ -.10, -.15,  .36, .65, ivory,  .00, .22, -.12],
    [  .63, -.09,  .25, .60, peach,  .12, .18,  .16],
  ];
  roses.forEach((rose) => addRose(...rose));

  // Fine petal dust bridges the gaps between individual roses. The outer
  // rose silhouettes still define the edge, while the centre becomes the
  // continuous soft dome visible in the reference frame.
  const petalMist = ["#e1a1b9", "#d78eaa", "#f2c7bf", "#d87570", "#efb8b1"];
  for (let i = 0; i < 9600; i++) {
    const y = -.05 + Math.random() * 1.92;
    const normalizedY = (y - .90) / 1.03;
    const halfWidth = 1.66 * Math.sqrt(Math.max(.06, 1 - normalizedY * normalizedY));
    const x = (Math.random() * 2 - 1) * halfWidth;
    const edgeBias = Math.abs(x) / halfWidth;
    const z = -.18 + Math.random() * (.48 - edgeBias * .10);
    addPoint(
      x + (Math.random() - .5) * .025,
      y + (Math.random() - .5) * .025,
      z,
      petalMist[i % petalMist.length],
      .27,
      .04 + Math.random() * .12
    );
  }

  // ---------- sage foliage ----------
  function addLeaf(bx, by, bz, length, width, angle, tilt, hex) {
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const px = -dy, py = dx;
    for (let i = 0; i < 120; i++) {
      const u = Math.pow(Math.random(), .83);
      const v = Math.random() * 2 - 1;
      const blade = Math.sin(u * Math.PI) * width;
      const curve = Math.sin(u * Math.PI) * length * .12;
      addPoint(
        bx + dx * u * length + px * v * blade,
        by + dy * u * length + py * v * blade,
        bz + curve * tilt + v * blade * .18,
        hex, .36, .18 + Math.random() * .15
      );
    }
  }

  for (let i = 0; i < 48; i++) {
    const side = i % 2 ? 1 : -1;
    const band = Math.random();
    const bx = side * (.18 + Math.random() * 1.25);
    const by = -.48 + band * .92;
    const angle = side > 0
      ? -.08 + Math.random() * .82
      : Math.PI + .08 - Math.random() * .82;
    addLeaf(
      bx, by, -.08 + Math.random() * .42,
      .34 + Math.random() * .54,
      .055 + Math.random() * .085,
      angle,
      Math.random() * 1.2 - .35,
      i % 4 === 0 ? "#aeb3a3" : i % 3 === 0 ? "#899489" : "#c2c3b5"
    );
  }

  // ---------- airy filler branches ----------
  for (let branch = 0; branch < 64; branch++) {
    const side = branch % 2 ? 1 : -1;
    const startX = side * (Math.random() * .36);
    const startY = -.64 + Math.random() * .32;
    const endX = side * (.65 + Math.random() * 1.55);
    const endY = -.22 + Math.random() * 1.35;
    const endZ = -.28 + Math.random() * .60;
    const branchColor = branch % 3 === 0 ? "#a9afa4" : "#d0cdc4";

    for (let i = 0; i < 54; i++) {
      const t = i / 53;
      const curve = Math.sin(t * Math.PI) * side * .12;
      addPoint(
        THREE.MathUtils.lerp(startX, endX, t) + curve,
        THREE.MathUtils.lerp(startY, endY, t) + Math.sin(t * 5 + branch) * .016,
        THREE.MathUtils.lerp(.02, endZ, t),
        branchColor, .27, .22
      );
    }

    const buds = 4 + (Math.random() * 5 | 0);
    for (let bud = 0; bud < buds; bud++) {
      const t = .55 + Math.random() * .45;
      const cx = THREE.MathUtils.lerp(startX, endX, t) + side * (Math.random() - .2) * .13;
      const cy = THREE.MathUtils.lerp(startY, endY, t) + (Math.random() - .5) * .16;
      const cz = THREE.MathUtils.lerp(.02, endZ, t);
      for (let p = 0; p < 28; p++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * .048;
        addPoint(
          cx + Math.cos(a) * r,
          cy + Math.sin(a) * r,
          cz + (Math.random() - .5) * .05,
          "#ede7de", .32, .28
        );
      }
    }
  }

  // Misty collar directly beneath the flowers.
  for (let i = 0; i < 5200; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random());
    const x = Math.cos(angle) * radius * (1.82 - Math.random() * .24);
    const y = -.28 + Math.sin(angle) * radius * .42 + Math.random() * .36;
    const z = .28 + Math.random() * .42;
    const tone = i % 4 === 0 ? "#dedbd2" : i % 3 === 0 ? "#aeb5aa" : "#c5c8bd";
    addPoint(x, y, z, tone, .42, .22);
  }

  // ---------- bouquet binding and stems ----------
  const stemTops = roses.map(([x, y, z]) => [x * .82, y - .14, z - .04]);
  stemTops.forEach(([x, y, z], index) => {
    for (let i = 0; i < 330; i++) {
      const t = Math.random();
      const lowerX = (index / (stemTops.length - 1) - .5) * .34;
      const spread = .018 + (1 - t) * .025;
      const stemY = THREE.MathUtils.lerp(y, -2.05 - Math.random() * .28, t);
      const freeX = THREE.MathUtils.lerp(x, lowerX, t);
      // Once a stem reaches the binding height, force it into the cinched core.
      const cinch = THREE.MathUtils.smoothstep(-stemY, .18, .72);
      addPoint(
        THREE.MathUtils.lerp(freeX, lowerX, cinch) + (Math.random() - .5) * spread,
        stemY,
        THREE.MathUtils.lerp(z, .06, t) + (Math.random() - .5) * spread,
        index % 3 === 0 ? "#8a7f79" : "#625d62",
        .43, .045
      );
    }
  });

  // White glittering wrap around the narrow waist.
  for (let i = 0; i < 3000; i++) {
    const t = Math.random();
    const angle = Math.random() * Math.PI * 2;
    const radius = .23 + Math.random() * .23;
    addPoint(
      Math.cos(angle) * radius * (1.05 - t * .18),
      -.68 - t * .48,
      .10 + Math.sin(angle) * radius * .62,
      i % 7 === 0 ? "#fff8ed" : "#e9dfd7",
      .38, .25
    );
  }

  function addRibbonCurve(side, tail = false) {
    const count = tail ? 600 : 850;
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const width = (Math.random() - .5) * (tail ? .045 : .075);
      let x, y;
      if (tail) {
        x = side * (.05 + t * .70) + width;
        y = -.91 - t * (.48 + Math.random() * .24);
      } else {
        x = side * (Math.sin(t * Math.PI) * .54 + .06) + width;
        y = -.91 + Math.sin(t * Math.PI * 2) * .17 + width * .5;
      }
      addPoint(x, y, .31 + Math.sin(t * Math.PI) * .08, "#f7eee6", .33, .32);
    }
  }
  addRibbonCurve(-1);
  addRibbonCurve(1);
  addRibbonCurve(-1, true);
  addRibbonCurve(1, true);

  // Restrained sparkle field near the floral silhouette.
  for (let i = 0; i < 1350; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.75 + Math.pow(Math.random(), .7) * .75;
    const y = .58 + Math.sin(angle) * 1.05 + (Math.random() - .5) * .42;
    addPoint(Math.cos(angle) * radius, y, -.35 + Math.random() * .56, "#f1e9df", .25, .25);
  }

  // ---------- GPU particle material ----------
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aStart", new THREE.Float32BufferAttribute(starts, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPixelRatio: { value: 1 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uProgress;
      uniform float uPixelRatio;
      attribute vec3 aStart;
      attribute vec3 color;
      attribute float aSeed;
      attribute float aSize;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float begin = aSeed * .18;
        float arrive = smoothstep(begin, .76 + aSeed * .17, uProgress);
        vec3 curl = vec3(
          sin(aSeed * 43. + uTime * 1.5),
          cos(aSeed * 57. + uTime * 1.2),
          sin(aSeed * 31. + uTime * 1.1)
        ) * (1. - arrive) * (.18 + aSeed * .31);
        vec3 shimmer = vec3(0., sin(uTime * 1.15 + aSeed * 60.) * .006, 0.);
        vec3 p = mix(aStart, position, arrive) + curl + shimmer * arrive;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_PointSize = aSize * (1. + sin(uTime * 2.2 + aSeed * 50.) * .15)
          * uPixelRatio * (38. / -mv.z);
        gl_Position = projectionMatrix * mv;
        vColor = color;
        vAlpha = .14 + arrive * .86;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(.5));
        float core = (1. - smoothstep(.08, .46, d));
        float halo = (1. - smoothstep(.22, .51, d)) * .17;
        float alpha = (core * .86 + halo) * vAlpha;
        gl_FragColor = vec4(vColor * (1.08 + core * .10), alpha);
        #include <colorspace_fragment>
      }
    `,
  });

  const bouquet = new THREE.Points(geometry, material);
  bouquet.position.y = .18;
  bouquet.scale.setScalar(1.24);
  bouquet.frustumCulled = false;
  return bouquet;
}
