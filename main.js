import { config, personalize } from './config.js';
import { createAtmosphere } from './effects/atmosphere.js';
import { createLetterScene } from './scenes/letter-scene.js';

const body = document.body;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll('.scene')];
const open = document.querySelector('#open');
const read = document.querySelector('#read');
const replay = document.querySelector('#replay');
const effects = document.querySelector('#effects');
const atmosphere = createAtmosphere(effects, reduced);
const canvas = document.querySelector('#world');
const rose = document.querySelector('#touch-rose');
const letter = createLetterScene(document.querySelector('#letter'), reduced);
const music = config.musicEnabled && config.musicSource ? new Audio(config.musicSource) : null;
if (music) {
  music.loop = true;
  music.volume = .5;
  music.preload = 'none';
}
let openTimer;
let flower;
let flowerReady;

function prepareFlower() {
  flowerReady ??= import('./scenes/flower-scene.js').then(({createFlowerScene}) => {
    flower = createFlowerScene(canvas, reduced, () => { body.dataset.renderer = 'fallback'; });
    if (!flower) body.dataset.renderer = 'fallback';
    if (body.dataset.scene === 'flower') flower?.start();
  }).catch(() => {
    body.dataset.renderer = 'fallback';
    flowerReady = null;
  });
}

function burstAt(kind, element, xRatio = .5, yRatio = .5) {
  const rect = element.getBoundingClientRect();
  atmosphere.burst(kind, rect.x + rect.width * xRatio, rect.y + rect.height * yRatio);
}

for (const element of document.querySelectorAll('[data-copy]')) {
  element.textContent = personalize(config[element.dataset.copy]);
}
body.dataset.theme = config.theme;
body.dataset.flowerType = config.flowerType;

function show(name, focus = true) {
  if (body.dataset.scene === 'flower') flower?.stop();
  if (body.dataset.scene === 'letter') letter.stop();
  body.dataset.scene = name;
  atmosphere.scene(name);
  if (name === 'flower') flower?.start();
  if (name === 'letter') letter.start();
  for (const section of sections) {
    const active = section.id === name;
    section.inert = !active;
    section.setAttribute('aria-hidden', String(!active));
  }
  if (focus) document.querySelector('#' + name + ' h1').focus({preventScroll: true});
}

open.addEventListener('click', () => {
  open.disabled = true;
  body.dataset.opening = 'true';
  music?.play().catch(() => {});
  prepareFlower();
  burstAt('gift', document.querySelector('.gift'), .5, .51);
  openTimer = setTimeout(() => show('flower'), reduced.matches ? 45 : 1030);
});
rose.addEventListener('click', () => burstAt('heart', rose, .5, .45));
effects.addEventListener('pointerdown', event => {
  if (body.dataset.scene !== 'letter') atmosphere.burst('star', event.clientX, event.clientY);
});
reduced.addEventListener('change', () => atmosphere.scene(body.dataset.scene));
document.addEventListener('visibilitychange', () => body.toggleAttribute('data-paused', document.hidden));
read.addEventListener('click', () => show('letter'));
replay.addEventListener('click', () => {
  clearTimeout(openTimer);
  if (music) {
    music.pause();
    music.currentTime = 0;
  }
  open.disabled = false;
  delete body.dataset.opening;
  show('opening');
});
show('opening', false);

