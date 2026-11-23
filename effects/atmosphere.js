const random = (min, max) => min + Math.random() * (max - min);

export function createAtmosphere(background, reduced) {
  const mobile = matchMedia('(pointer: coarse), (max-width: 740px)').matches;
  const extras = document.createElement('div');
  const bursts = document.createElement('div');
  bursts.id = 'bursts';
  bursts.setAttribute('aria-hidden', 'true');
  document.body.append(bursts);
  background.append(extras);

  function particle(parent, className, values, symbol = '') {
    const element = document.createElement('span');
    element.className = className;
    for (const [key, value] of Object.entries(values)) element.style.setProperty('--' + key, value);
    element.textContent = symbol;
    parent.append(element);
    return element;
  }

  for (let index = 0; index < (mobile ? 58 : 118); index++) {
    particle(background, 'star', {
      x: random(1, 99) + '%', y: random(2, 98) + '%', size: random(.65, 2.7) + 'px',
      opacity: random(.20, .8), duration: random(3.5, 8) + 's', delay: -random(0, 8) + 's'
    });
  }

  function scene(name) {
    extras.replaceChildren();
    bursts.replaceChildren();
    if (reduced.matches || name === 'opening') return;
    const flower = name === 'flower';
    const count = flower ? (mobile ? 9 : 16) : 8;
    for (let index = 0; index < count; index++) {
      const duration = random(9, 18);
      const side = index % 2;
      const x = mobile && flower ? random(1, 17) + side * 81 : random(3, 96);
      particle(extras, 'falling', {
        x: x + '%', size: random(4, 14) + 'px', blur: random(0, 1.4) + 'px',
        duration: duration + 's', delay: -random(0, duration) + 's'
      });
    }
    if (flower) for (let index = 0; index < (mobile ? 5 : 9); index++) {
      particle(extras, 'ambient-heart', {
        x: (index % 2 ? random(81, 96) : random(4, 27)) + '%',
        y: random(21, 86) + '%', size: random(8, 16) + 'px',
        duration: random(3, 7) + 's', delay: -random(0, 6) + 's'
      }, '♡');
    }
  }

  const previous = new Map();
  function burst(kind, x, y) {
    const now = performance.now();
    if (now - (previous.get(kind) ?? -Infinity) < 105) return;
    previous.set(kind, now);
    const heart = kind === 'heart';
    const gift = kind === 'gift';
    const still = reduced.matches;
    const count = still ? 4 : heart ? 13 : gift ? 30 : 7;
    const rotation = random(0, Math.PI * 2);
    for (let index = 0; index < count; index++) {
      const angle = rotation + index / count * Math.PI * 2;
      const distance = still ? random(16, 28) : random(30, gift ? 215 : heart ? 105 : 62);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - (heart ? 26 : 0);
      const duration = random(.63, 1.23);
      const node = particle(bursts, 'burst ' + (heart ? 'heart-burst' : 'star-burst'), {
        size: random(heart ? 10 : 4, heart ? 20 : 12) + 'px',
        dx: dx + 'px', dy: dy + 'px', turn: random(-40, 40) + 'deg', duration: duration + 's'
      }, heart ? (index % 4 ? '♡' : '♥') : (index % 3 ? '·' : '✦'));
      node.style.left = (x + (still ? dx : 0)) + 'px';
      node.style.top = (y + (still ? dy : 0)) + 'px';
      setTimeout(() => node.remove(), still ? 400 : duration * 1000 + 50);
    }
  }

  return {scene, burst};
}

