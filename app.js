const MEDIA_BASE = 'https://raw.githubusercontent.com/amirmushichge/veyra-interactive-car/v1.0.0/public/media/';
const asset = (path) => MEDIA_BASE + path;

const ROOT_IMAGE = asset('exterior-polished.png');

const systems = {
  battery: {
    index: '01',
    label: 'Battery',
    category: 'Energy storage',
    title: ['The energy', 'beneath you.'],
    short: 'Explore the battery pack',
    description: 'A traction battery stores electrical energy and supplies it to the drive system. In this concept, it sits low beneath the cabin.',
    benefit: 'A low, flat package leaves the cabin above it open.',
    image: asset('battery-blue.png'),
    anchor: { x: 64, y: 72 },
    points: [
      { label: 'Cell modules', text: 'Cells grouped into modules store the energy.', x: 31, y: 42 },
      { label: 'High-voltage connection', text: 'Orange connections mark the high-voltage electrical path in this illustration.', x: 27, y: 55 },
      { label: 'Protective enclosure', text: 'The pack housing supports and protects the assembly.', x: 49, y: 49 }
    ]
  },
  drive: {
    index: '02',
    label: 'Electric drive',
    category: 'Power delivery',
    title: ['Electricity,', 'into motion.'],
    short: 'Explore the drive unit',
    description: 'The electric motor turns electrical energy into rotation. A reduction gear transfers that rotation to the wheels.',
    benefit: 'Control of motor torque gives the driver a responsive connection to the wheels.',
    image: asset('drive-blue.png'),
    anchor: { x: 25, y: 48 },
    points: [
      { label: 'Stator windings', text: 'Stationary windings create a rotating magnetic field.', x: 32, y: 46 },
      { label: 'Rotor', text: 'The rotor turns within the stator and drives the shaft.', x: 24, y: 49 },
      { label: 'Reduction gear', text: 'Gearing lowers rotational speed and increases wheel torque.', x: 48, y: 51 }
    ]
  }
};

const hotspots = [
  { id: 'battery', label: 'Battery', anchor: systems.battery.anchor, target: 'battery' },
  { id: 'drive', label: 'Electric drive', anchor: systems.drive.anchor, target: 'drive' },
  { id: 'paint', label: 'Body colour', anchor: { x: 55, y: 51 }, target: null },
  { id: 'wheels', label: 'Wheel design', anchor: { x: 48, y: 71 }, target: null }
];

const appearanceOptions = {
  paint: [
    { id: 'silver', label: 'Studio Silver', color: '#c9cfd2', image: ROOT_IMAGE },
    { id: 'electric', label: 'Electric Green', color: '#edff39', image: asset('config/electric-green.png') },
    { id: 'lime', label: 'Lime Green', color: '#9fdc32', image: asset('config/lime-green.png') },
    { id: 'sky', label: 'Sky Blue', color: '#708fa2', image: asset('config/sky-blue.png') },
    { id: 'graphite', label: 'Graphite', color: '#30363c', image: asset('config/graphite.png') }
  ],
  wheels: [
    { id: 'original', label: 'Multi-spoke', image: ROOT_IMAGE },
    { id: 'aero', label: 'Aero Disc', image: asset('config/wheels-aero.png') },
    { id: 'forged', label: 'Sport Forged', image: asset('config/wheels-forged.png') }
  ]
};

const clipSources = {
  drive: [asset('hood-hover-forward.mp4'), asset('hood-hover-reverse.mp4')],
  battery: [asset('battery-hover-forward.mp4'), asset('battery-hover-reverse.mp4')]
};

const el = {
  experience: document.querySelector('#experience'),
  stage: document.querySelector('#stage'),
  imagePlane: document.querySelector('#imagePlane'),
  carImage: document.querySelector('#carImage'),
  hoverCanvas: document.querySelector('#hoverCanvas'),
  appearanceVisual: document.querySelector('#appearanceVisual'),
  appearanceImage: document.querySelector('#appearanceImage'),
  detailVisual: document.querySelector('#detailVisual'),
  detailImage: document.querySelector('#detailImage'),
  hotspotLayer: document.querySelector('#hotspotLayer'),
  annotationLayer: document.querySelector('#annotationLayer'),
  intro: document.querySelector('#intro'),
  backButton: document.querySelector('#backButton'),
  backLabel: document.querySelector('#backLabel'),
  detailCopy: document.querySelector('#detailCopy'),
  transitionStatus: document.querySelector('#transitionStatus'),
  transitionText: document.querySelector('#transitionText'),
  footerSentence: document.querySelector('#footerSentence'),
  liveStatus: document.querySelector('#liveStatus'),
  errorMessage: document.querySelector('#errorMessage'),
  errorText: document.querySelector('#errorText'),
  dismissError: document.querySelector('#dismissError')
};

const state = {
  phase: 'overview',
  selected: 'battery',
  hovered: null,
  annotation: null,
  ready: false,
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  detailVisible: false,
  appearance: null,
  appearancePinned: false,
  appearanceClosing: false,
  optionId: 'silver',
  appearanceImage: ROOT_IMAGE,
  neutral: true,
  loadedOptions: new Set([ROOT_IMAGE]),
  failedOptions: new Set(),
  lock: false,
  request: 0,
  transitionTimer: 0,
  revealTimer: 0,
  leaveTimer: 0,
  appearanceTimer: 0
};

const plusIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>';
const arrowIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"><path d="M7 17L17 7M7 7h10v10"/></svg>';
const closeIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"><path d="M6 6l12 12M18 6L6 18"/></svg>';

class HoverController {
  constructor(canvas, onNeutral) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.onNeutral = onNeutral;
    this.desired = null;
    this.mode = 'overview';
    this.reduced = state.reduced;
    this.settled = null;
    this.active = null;
    this.running = false;
    this.frozen = false;
    this.failed = false;
    this.generation = 0;
    this.raf = 0;
    this.watchdog = 0;
    this.cancelFrame = null;
    this.videos = new Map();

    Object.entries(clipSources).forEach(([id, pair]) => {
      pair.forEach((src, direction) => {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';
        video.src = src;
        this.videos.set(`${id}-${direction}`, video);
      });
    });
  }

  draw(video) {
    if (!video || video.readyState < 2 || video.seeking || !video.videoWidth) return;
    try {
      if (this.canvas.width !== video.videoWidth || this.canvas.height !== video.videoHeight) {
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;
      }
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
      this.canvas.style.opacity = '1';
    } catch {
      this.fail();
    }
  }

  stop() {
    this.generation += 1;
    if (this.active) {
      this.active.pause();
      this.active.onended = null;
      this.active.onerror = null;
      this.active.onloadeddata = null;
      this.active.onseeked = null;
    }
    if (this.cancelFrame) this.cancelFrame();
    this.cancelFrame = null;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.watchdog);
    this.running = false;
    this.active = null;
  }

  fail() {
    this.stop();
    this.failed = true;
    this.onNeutral(true);
  }

  setDesired(value) {
    this.desired = value;
    this.reconcile();
  }

  setMode(mode) {
    this.mode = mode;
    this.reconcile();
  }

  setReduced(value) {
    this.reduced = value;
    this.reconcile();
  }

  reconcile() {
    if (this.mode === 'entering') {
      if (!this.frozen) {
        this.stop();
        this.frozen = true;
      }
      return;
    }

    if (this.mode === 'detail' || this.reduced) {
      this.stop();
      this.settled = null;
      this.frozen = false;
      this.canvas.style.opacity = '0';
      this.onNeutral(true);
      return;
    }

    if (this.mode !== 'overview' || this.running || this.failed) return;
    this.frozen = false;

    if (this.settled === this.desired) return;
    const next = this.settled
      ? { id: this.settled, reverse: true }
      : this.desired
        ? { id: this.desired, reverse: false }
        : null;

    if (!next) return;
    this.play(next);
  }

  play(next) {
    const video = this.videos.get(`${next.id}-${next.reverse ? 1 : 0}`);
    if (!video) return;

    this.active = video;
    this.running = true;
    this.onNeutral(false);
    const token = ++this.generation;
    const valid = () => token === this.generation;

    const complete = () => {
      if (!valid()) return;
      this.draw(video);
      this.stop();
      this.settled = next.reverse ? null : next.id;
      this.onNeutral(this.settled === null);
      this.reconcile();
    };

    const paint = () => {
      if (!valid()) return;
      this.draw(video);
      if ('requestVideoFrameCallback' in video) {
        const handle = video.requestVideoFrameCallback(paint);
        this.cancelFrame = () => video.cancelVideoFrameCallback(handle);
      } else {
        this.raf = requestAnimationFrame(paint);
      }
    };

    const start = () => {
      if (!valid()) return;
      video.onseeked = null;
      video.onloadeddata = null;
      if ('requestVideoFrameCallback' in video) {
        const handle = video.requestVideoFrameCallback(paint);
        this.cancelFrame = () => video.cancelVideoFrameCallback(handle);
      } else {
        this.raf = requestAnimationFrame(paint);
      }
      video.play().catch(() => this.fail());
    };

    const prepare = () => {
      if (!valid()) return;
      video.onloadeddata = null;
      if (video.currentTime > 0.001) {
        video.onseeked = start;
        video.currentTime = 0;
      } else {
        start();
      }
    };

    video.onended = complete;
    video.onerror = () => this.fail();
    this.watchdog = setTimeout(() => this.fail(), 15000);
    if (video.readyState >= 2) prepare();
    else {
      video.onloadeddata = prepare;
      video.load();
    }
  }

  destroy() {
    this.stop();
    this.videos.forEach((video) => {
      video.removeAttribute('src');
      video.load();
    });
  }
}

const hover = new HoverController(el.hoverCanvas, (neutral) => {
  state.neutral = neutral;
  syncAppearanceVisual();
  updateAppearanceMenu();
});

function canUseHotspot(id) {
  return !state.appearanceClosing && (!state.appearance || state.appearance === id);
}

function setPhase(phase) {
  state.phase = phase;
  el.experience.className = `experience phase-${phase}${state.reduced ? ' reduced' : ''}`;
  const busy = phase === 'entering' || phase === 'returning';
  el.experience.setAttribute('aria-busy', String(busy));
  hover.setMode(phase);
  syncUI();
}

function updatePlane() {
  const width = el.stage.getBoundingClientRect().width;
  const mobile = width <= 900;
  const mediaHeight = Math.max(700, window.innerHeight) - (window.innerHeight <= 780 ? 64 : 76) - 164 - 88;
  const w = mobile
    ? Math.max(280, width - 40)
    : Math.min(width - 2 * Math.min(72, Math.max(24, width * 0.04)), mediaHeight * 1672 / 941);
  const h = w * 941 / 1672;
  el.imagePlane.style.width = `${w}px`;
  el.imagePlane.style.height = `${h}px`;
  el.imagePlane.style.left = `${(width - w) / 2}px`;
  el.imagePlane.style.top = `${mobile ? 132 : 88}px`;
  el.experience.style.setProperty('--scene-width', `${w}px`);
  el.experience.style.setProperty('--scene-height', `${h}px`);
}

function setSelected(id) {
  state.selected = id;
  const current = systems[id];
  el.imagePlane.style.setProperty('--focus-x', `${current.anchor.x}%`);
  el.imagePlane.style.setProperty('--focus-y', `${current.anchor.y}%`);
  el.detailImage.src = current.image;
  el.detailImage.alt = `Illustrative cutaway of the ${current.label.toLowerCase()}`;
  renderDetailCopy();
}

function showError(message) {
  el.errorText.textContent = message;
  el.errorMessage.hidden = false;
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const decoded = image.decode ? image.decode() : Promise.resolve();
      decoded.then(resolve, resolve);
    };
    image.onerror = reject;
    image.src = src;
  });
}

async function preloadAppearance(mode) {
  const pending = appearanceOptions[mode].filter((option) => !state.loadedOptions.has(option.image));
  await Promise.allSettled(pending.map(async (option) => {
    try {
      await preloadImage(option.image);
      state.loadedOptions.add(option.image);
      state.failedOptions.delete(option.image);
    } catch {
      state.failedOptions.add(option.image);
    }
  }));
  updateAppearanceMenu();
}

function buildHotspots() {
  el.hotspotLayer.innerHTML = '';

  hotspots.forEach((item) => {
    if (item.id === 'paint' || item.id === 'wheels') {
      const owner = document.createElement('div');
      owner.className = 'appearance-hotspot';
      owner.dataset.mode = item.id;
      owner.style.setProperty('--anchor-x', `${item.anchor.x}%`);
      owner.style.setProperty('--anchor-y', `${item.anchor.y}%`);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hotspot';
      button.dataset.hotspot = item.id;
      button.setAttribute('aria-label', item.label);
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = `<span class="hotspot-ring">${plusIcon}</span><span class="hotspot-label">${item.id === 'paint' ? 'Paint' : 'Wheels'}</span>`;
      owner.append(button);

      const enter = () => openAppearance(item.id);
      button.addEventListener('pointerenter', enter);
      button.addEventListener('focus', enter);
      button.addEventListener('click', () => {
        if (state.appearance === item.id && state.appearancePinned) closeAppearance();
        else {
          openAppearance(item.id);
          state.appearancePinned = true;
          syncUI();
        }
      });

      owner.addEventListener('pointerleave', () => {
        if (!state.appearancePinned && !owner.contains(document.activeElement)) {
          clearTimeout(state.leaveTimer);
          state.leaveTimer = setTimeout(() => closeAppearance(false), 140);
        }
      });

      owner.addEventListener('focusout', (event) => {
        if (!state.appearancePinned && !owner.contains(event.relatedTarget)) closeAppearance(false);
      });

      el.hotspotLayer.append(owner);
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hotspot';
    button.dataset.hotspot = item.id;
    button.style.left = `${item.anchor.x}%`;
    button.style.top = `${item.anchor.y}%`;
    button.setAttribute('aria-label', systems[item.target].short);
    button.innerHTML = `<span class="hotspot-ring">${plusIcon}</span><span class="hotspot-label">${item.label}${arrowIcon}</span>`;

    const enter = () => {
      if (!canUseHotspot(item.id)) return;
      state.hovered = item.id;
      hover.setDesired(item.id);
      syncHotspotStates();
    };
    const leave = () => {
      if (state.hovered === item.id) state.hovered = null;
      hover.setDesired(null);
      syncHotspotStates();
    };

    button.addEventListener('pointerenter', enter);
    button.addEventListener('pointerleave', leave);
    button.addEventListener('focus', enter);
    button.addEventListener('blur', leave);
    button.addEventListener('click', () => transition(item.target));

    el.hotspotLayer.append(button);
  });

  syncHotspotStates();
}

function syncHotspotStates() {
  document.querySelectorAll('[data-hotspot]').forEach((button) => {
    const id = button.dataset.hotspot;
    const enabled = state.phase === 'overview' && state.ready && canUseHotspot(id);
    button.disabled = !enabled;
    button.classList.toggle('active', state.hovered === id || state.appearance === id);
    if (id === 'paint' || id === 'wheels') {
      button.setAttribute('aria-expanded', String(state.appearance === id && !state.appearanceClosing));
      const ring = button.querySelector('.hotspot-ring');
      ring.innerHTML = state.appearance === id && state.appearancePinned ? closeIcon : plusIcon;
    }
  });

  document.querySelectorAll('.appearance-hotspot').forEach((owner) => {
    owner.classList.toggle('expanded', state.appearance === owner.dataset.mode && !state.appearanceClosing);
  });
}

function openAppearance(mode) {
  if (state.phase !== 'overview' || !state.ready || !canUseHotspot(mode)) return;
  clearTimeout(state.leaveTimer);
  state.hovered = null;
  hover.setDesired(null);
  if (state.appearance === mode) return;

  state.appearance = mode;
  state.appearancePinned = false;
  state.optionId = appearanceOptions[mode][0].id;
  state.appearanceImage = ROOT_IMAGE;
  el.appearanceImage.src = state.appearanceImage;

  renderAppearanceMenu();
  preloadAppearance(mode);
  syncUI();
}

function closeAppearance(restoreFocus = true) {
  if (!state.appearance || state.appearanceClosing) return;
  const previousMode = state.appearance;
  state.appearanceClosing = true;
  state.hovered = null;
  hover.setDesired(null);
  clearTimeout(state.leaveTimer);
  syncUI();

  clearTimeout(state.appearanceTimer);
  state.appearanceTimer = setTimeout(() => {
    state.appearance = null;
    state.appearancePinned = false;
    state.appearanceClosing = false;
    state.appearanceImage = ROOT_IMAGE;
    el.appearanceImage.src = ROOT_IMAGE;
    document.querySelectorAll('.appearance-menu,.menu-bridge').forEach((node) => node.remove());
    syncUI();

    if (restoreFocus) {
      const button = document.querySelector(`[data-hotspot="${previousMode}"]`);
      if (button) button.focus({ preventScroll: true });
    }
  }, state.reduced ? 0 : 260);
}

function chooseAppearance(id) {
  if (!state.appearance || state.appearanceClosing || !state.neutral) return;
  const option = appearanceOptions[state.appearance].find((item) => item.id === id);
  if (!option || !state.loadedOptions.has(option.image)) return;
  state.appearancePinned = true;
  state.optionId = id;
  state.appearanceImage = option.image;
  el.appearanceImage.src = option.image;
  renderAppearanceMenu();
  syncUI();
}

function renderAppearanceMenu() {
  document.querySelectorAll('.appearance-menu,.menu-bridge').forEach((node) => node.remove());
  if (!state.appearance || state.appearanceClosing) return;

  const owner = document.querySelector(`.appearance-hotspot[data-mode="${state.appearance}"]`);
  if (!owner) return;

  const bridge = document.createElement('span');
  bridge.className = 'menu-bridge';
  bridge.setAttribute('aria-hidden', 'true');
  owner.append(bridge);

  const menu = document.createElement('div');
  menu.className = `appearance-menu ${state.appearance}`;
  menu.id = `appearance-${state.appearance}`;
  menu.setAttribute('role', 'group');
  menu.setAttribute('aria-label', state.appearance === 'paint' ? 'Body colour' : 'Wheel design');

  const options = appearanceOptions[state.appearance];
  const current = options.find((option) => option.id === state.optionId) || options[0];
  const heading = document.createElement('div');
  heading.className = 'appearance-heading';
  heading.innerHTML = `<span>${state.appearance === 'paint' ? 'Paint' : 'Wheels'}</span>`;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'appearance-close';
  close.setAttribute('aria-label', 'Close and restore original vehicle');
  close.innerHTML = closeIcon;
  close.addEventListener('click', () => closeAppearance());
  heading.append(close);
  menu.append(heading);

  const optionsWrap = document.createElement('div');
  optionsWrap.className = 'appearance-options';

  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `appearance-option${option.id === state.optionId ? ' selected' : ''}`;
    button.disabled = !state.neutral || !state.loadedOptions.has(option.image);
    button.setAttribute('aria-label', `${option.label}${state.failedOptions.has(option.image) ? ' — unavailable' : ''}`);
    button.setAttribute('aria-pressed', String(option.id === state.optionId));
    button.title = option.label;

    if (state.appearance === 'paint') {
      const chip = document.createElement('span');
      chip.className = 'paint-chip';
      chip.style.backgroundColor = option.color;
      chip.style.color = option.id === 'graphite' ? '#fff' : '#111';
      chip.innerHTML = option.id === state.optionId ? '<span aria-hidden="true">✓</span>' : '';
      button.append(chip);
    } else {
      const chip = document.createElement('span');
      chip.className = 'wheel-chip';
      chip.style.backgroundImage = `url("${option.image}")`;
      button.append(chip);
    }

    button.addEventListener('click', () => chooseAppearance(option.id));
    optionsWrap.append(button);
  });

  menu.append(optionsWrap);

  const caption = document.createElement('div');
  caption.className = 'appearance-caption';
  caption.setAttribute('aria-live', 'polite');
  caption.innerHTML = `${state.neutral ? current.label : 'Returning to exterior…'}<small>${state.failedOptions.size ? 'Some options could not load' : 'Close to explore other systems'}</small>`;
  menu.append(caption);
  owner.append(menu);
}

function updateAppearanceMenu() {
  if (state.appearance && !state.appearanceClosing) renderAppearanceMenu();
}

function syncAppearanceVisual() {
  const shown = Boolean(state.appearance && state.neutral && !state.appearanceClosing);
  el.appearanceVisual.classList.toggle('shown', shown);
}

function renderDetailCopy() {
  const current = systems[state.selected];
  el.detailCopy.innerHTML = '';

  const intro = document.createElement('div');
  intro.className = 'detail-introduction';
  intro.innerHTML = `<p class="eyebrow">${current.category}</p><h2>${current.title.map((line) => `<span>${line}</span>`).join('')}</h2><p class="system-description">${current.description}</p>`;
  el.detailCopy.append(intro);

  const components = document.createElement('div');
  components.className = 'detail-components';
  const list = document.createElement('div');
  list.className = 'part-list';

  current.points.forEach((point, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = state.phase === 'detail' ? 0 : -1;
    if (state.annotation === index) button.classList.add('selected');
    button.setAttribute('aria-expanded', String(state.annotation === index));
    button.innerHTML = `<span class="part-row"><small>${String(index + 1).padStart(2, '0')}</small>${point.label}${plusIcon}</span>${state.annotation === index ? `<span class="part-description">${point.text}</span>` : ''}`;
    button.addEventListener('click', () => toggleAnnotation(index));
    list.append(button);
  });

  components.append(list);
  const benefit = document.createElement('div');
  benefit.className = 'benefit';
  benefit.innerHTML = `<span>For the driver</span><p>${current.benefit}</p>`;
  components.append(benefit);
  el.detailCopy.append(components);
}

function renderAnnotations() {
  el.annotationLayer.innerHTML = '';
  if (state.phase !== 'detail') return;

  systems[state.selected].points.forEach((point, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `annotation${state.annotation === index ? ' open' : ''}`;
    button.style.left = `${point.x}%`;
    button.style.top = `${point.y}%`;
    button.setAttribute('aria-label', point.label);
    button.setAttribute('aria-expanded', String(state.annotation === index));
    button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><span class="annotation-label">${point.label}</span>`;
    button.addEventListener('click', () => toggleAnnotation(index));
    el.annotationLayer.append(button);
  });
}

function toggleAnnotation(index) {
  state.annotation = state.annotation === index ? null : index;
  renderDetailCopy();
  renderAnnotations();
}

function finishTransition(returning, id) {
  clearTimeout(state.transitionTimer);
  state.phase = returning ? 'overview' : 'detail';
  state.detailVisible = !returning;
  state.lock = false;
  setPhase(state.phase);
  setTimeout(() => {
    if (returning) {
      const button = document.querySelector(`[data-hotspot="${id}"]`);
      if (button) button.focus({ preventScroll: true });
    } else {
      el.backButton.focus({ preventScroll: true });
    }
  }, 0);
}

function transition(id, returning = false) {
  if (!systems[id] || state.appearance || state.lock || !state.ready || (!returning && state.phase !== 'overview')) return;
  state.lock = true;
  const token = ++state.request;
  state.selected = id;
  state.hovered = null;
  state.annotation = null;
  hover.setDesired(null);
  setSelected(id);
  setPhase(returning ? 'returning' : 'entering');

  clearTimeout(state.revealTimer);
  state.revealTimer = setTimeout(() => {
    if (state.request !== token) return;
    state.detailVisible = !returning;
    syncUI();
  }, state.reduced ? 0 : 350);

  clearTimeout(state.transitionTimer);
  state.transitionTimer = setTimeout(() => {
    if (state.request === token) finishTransition(returning, id);
  }, state.reduced ? 0 : 1250);
}

function returnToCar() {
  if (state.phase === 'detail') transition(state.selected, true);
}

function syncUI() {
  const busy = state.phase === 'entering' || state.phase === 'returning';
  const current = systems[state.selected];

  el.intro.classList.toggle('hide', state.phase !== 'overview');
  el.intro.setAttribute('aria-hidden', String(state.phase !== 'overview'));

  el.detailVisual.classList.toggle('shown', state.detailVisible);
  el.detailCopy.classList.toggle('shown', state.phase === 'detail');
  el.detailCopy.setAttribute('aria-hidden', String(state.phase !== 'detail'));

  el.backButton.hidden = state.phase === 'overview';
  el.backButton.disabled = busy;
  el.backLabel.textContent = state.phase === 'returning' ? 'Returning to vehicle' : 'Back to vehicle';

  el.transitionStatus.hidden = state.ready && !busy;
  el.transitionText.textContent = !state.ready
    ? 'Preparing the views'
    : state.phase === 'returning'
      ? 'Returning to the exterior'
      : `Inside the ${current.label.toLowerCase()}`;

  el.footerSentence.textContent = state.phase === 'overview'
    ? 'Explore systems. Personalise the exterior.'
    : 'Illustrative engineering. Concept visualisation.';

  el.liveStatus.textContent = busy
    ? `${state.phase === 'entering' ? 'Opening' : 'Closing'} ${current.label}`
    : state.phase === 'detail'
      ? `${current.label} view. Press Escape to return.`
      : 'Vehicle overview. Choose a system.';

  renderAnnotations();
  renderDetailCopy();
  syncAppearanceVisual();
  syncHotspotStates();
}

async function init() {
  el.carImage.src = ROOT_IMAGE;
  el.appearanceImage.src = ROOT_IMAGE;
  setSelected('battery');
  buildHotspots();
  updatePlane();

  const observer = new ResizeObserver(updatePlane);
  observer.observe(el.stage);
  window.addEventListener('resize', updatePlane);

  const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
  motionMedia.addEventListener('change', (event) => {
    state.reduced = event.matches;
    hover.setReduced(state.reduced);
    setPhase(state.phase);
  });

  el.backButton.addEventListener('click', returnToCar);
  el.dismissError.addEventListener('click', () => { el.errorMessage.hidden = true; });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (state.appearance) closeAppearance();
    else returnToCar();
  });

  try {
    await Promise.all([ROOT_IMAGE, systems.battery.image, systems.drive.image].map(preloadImage));
    state.ready = true;
    el.transitionStatus.hidden = true;
    syncUI();
  } catch {
    showError('An image could not load. Reload to retry.');
  }

  window.addEventListener('pagehide', () => hover.destroy(), { once: true });
}

init();
