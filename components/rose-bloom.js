import * as THREE from '../vendor/three.module.min.js';

const petalMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true, side: THREE.DoubleSide, roughness: .78, metalness: .025
});

function petalGeometry(layer, variation) {
  const rows = 15;
  const columns = 12;
  const start = [];
  const end = [];
  const colors = [];
  const triangles = [];
  const deep = new THREE.Color(layer < 2 ? '#932952' : '#a54570');
  const middle = new THREE.Color(layer < 2 ? '#e183a6' : '#ec96b3');
  const edge = new THREE.Color(layer < 2 ? '#ffb1ca' : '#ffd2dc');
  const radius = (.26 + layer * .178) * (1 + variation * .09);
  const tint = new THREE.Color();
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    for (let column = 0; column <= columns; column++) {
      const u = column / columns * 2 - 1;
      const rim = Math.abs(u);
      const width = (.15 + layer * .074) * Math.pow(Math.sin(Math.PI * t * .90), .76) + .007;
      const ruffle = t ** 4 * Math.sin(u * 7.8 + variation * 6) * (.013 + layer * .007);
      const notch = t ** 5 * Math.cos(u * 4.4) * (.019 + layer * .005);
      const x = u * width + Math.sin(t * Math.PI / 2) * variation * .07;
      const y = .025 + radius * t - rim ** 2 * (.046 + layer * .017) * t + notch;
      const z = .16 - layer * .080 + (.34 - layer * .039) * Math.sin(t * 1.95)
        + rim ** 2 * t * .113 + ruffle - .08 * t ** 5;
      end.push(x, y, z);
      start.push(x * .36, .015 + y * (.30 + layer * .018), z * .50 + t * (.35 - layer * .019));
      const tone = Math.min(1, t * .97 + rim * .12 + variation * .06);
      if (tone < .73) tint.copy(deep).lerp(middle, tone / .73);
      else tint.copy(middle).lerp(edge, (tone - .73) / .27);
      tint.multiplyScalar(1 + .017 * Math.sin(u * 42 + t * 4));
      colors.push(tint.r, tint.g, tint.b);
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column;
        const b = a + columns + 1;
        triangles.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(triangles);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(end, 3));
  geometry.computeVertexNormals();
  geometry.morphAttributes.normal = [geometry.getAttribute('normal').clone()];
  geometry.morphAttributes.position = [geometry.getAttribute('position').clone()];
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(start, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

const layerSizes = [3, 5, 6, 7, 8];
let petalLayers;

export function createRose() {
  if (!petalLayers) {
    petalLayers = layerSizes.map((count, layer) => Array.from(
      {length: count}, (_, index) => petalGeometry(layer, Math.sin(index * 7.21 + layer * 3.91))
    ));
  }

  const group = new THREE.Group();
  const layers = petalLayers.map((geometries, layer) => geometries.map((geometry, index) => {
    const mesh = new THREE.Mesh(geometry, petalMaterial);
    mesh.rotation.z = index * Math.PI * 2 / geometries.length + layer * .75 + Math.sin(index * 2) * .11;
    mesh.frustumCulled = false;
    group.add(mesh);
    return mesh;
  }));

  return {
    group,
    update(progress) {
      for (const [layer, petals] of layers.entries()) {
        for (const [index, petal] of petals.entries()) {
          const start = layer * .115 + index * .009;
          petal.morphTargetInfluences[0] = THREE.MathUtils.smoothstep(progress, start, start + .43);
        }
      }
    }
  };
}

