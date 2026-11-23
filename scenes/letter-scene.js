import { config, personalize } from '../config.js';

export function createLetterScene(section, reduced) {
  const wrap = section.querySelector('.letter-wrap');
  const copy = section.querySelector('#letter-body');
  const closing = section.querySelector('#closing');
  const skip = section.querySelector('#skip');
  const reread = section.querySelector('#reread');
  const lines = config.letter.map(line => Array.from(personalize(line)));
  const paragraphs = lines.map((line, index) => {
    const paragraph = document.createElement('p');
    if (line.join('') === '我喜欢你。') paragraph.className = 'accent';
    if (index === lines.length - 1) paragraph.className = 'signoff';
    return paragraph;
  });
  copy.append(...paragraphs);
  closing.textContent = personalize(config.closing);

  let active = false;
  let frame = 0;
  let previous = 0;
  let remainder = 0;
  let index = 0;
  let count = 0;

  function stopFrame() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
  }

  function finish() {
    stopFrame();
    for (const [position, paragraph] of paragraphs.entries()) {
      paragraph.textContent = lines[position].join('');
      paragraph.hidden = false;
    }
    index = lines.length;
    closing.hidden = false;
    skip.disabled = true;
  }

  function type(now) {
    frame = 0;
    if (!active || document.hidden) return;
    if (previous) remainder += Math.min(now - previous, 90);
    previous = now;

    // Keep punctuation in the rhythm of the sentence and give each new paragraph a breath.
    while (index < lines.length) {
      const delay = count === 0 ? (index === 0 ? 30 : 130) : 26;
      if (remainder < delay) break;
      remainder -= delay;
      const line = lines[index];
      const paragraph = paragraphs[index];
      paragraph.hidden = false;
      paragraph.textContent = line.slice(0, ++count).join('');
      if (count === line.length) {
        index++;
        count = 0;
      }
    }
    if (index === lines.length) finish();
    else frame = requestAnimationFrame(type);
  }

  function resume() {
    if (active && !frame && index < lines.length && !document.hidden) frame = requestAnimationFrame(type);
  }

  function start() {
    active = true;
    stopFrame();
    wrap.scrollTop = 0;
    if (reduced.matches) {
      finish();
      return;
    }
    index = count = remainder = 0;
    for (const paragraph of paragraphs) {
      paragraph.textContent = '';
      paragraph.hidden = true;
    }
    closing.hidden = true;
    skip.disabled = false;
    resume();
  }

  skip.addEventListener('click', () => {
    finish();
    copy.tabIndex = -1;
    copy.focus({preventScroll: true});
  });
  reread.addEventListener('click', () => {
    start();
    section.querySelector('h1').focus({preventScroll: true});
  });
  document.addEventListener('visibilitychange', () => document.hidden ? stopFrame() : resume());
  reduced.addEventListener('change', () => {
    if (active && reduced.matches) finish();
  });
  return {
    start,
    stop() {
      active = false;
      stopFrame();
    }
  };
}

