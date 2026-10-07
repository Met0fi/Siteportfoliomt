const artworkLinks = [...document.querySelectorAll('[data-artwork]')];
const viewer = document.querySelector('.viewer');
const image = document.querySelector('.viewer-image');
const title = document.querySelector('#viewer-title');
const counter = document.querySelector('.viewer-count');
const stage = document.querySelector('.viewer-stage');
const error = document.querySelector('.viewer-error');
const originalLink = document.querySelector('.viewer-retry');
const previous = document.querySelector('.viewer-prev');
const next = document.querySelector('.viewer-next');
const close = document.querySelector('.viewer-close');
let currentIndex = 0;
let returnFocus = null;
let pendingImage = null;

function showArtwork(index) {
  currentIndex = index;
  const link = artworkLinks[index];
  const thumbnail = link.querySelector('img');
  if (pendingImage) {
    pendingImage.onload = null;
    pendingImage.onerror = null;
  }
  const request = new Image();
  pendingImage = request;
  title.textContent = `Artwork ${index + 1}`;
  counter.textContent = `${index + 1} / ${artworkLinks.length}`;
  previous.disabled = index === 0;
  next.disabled = index === artworkLinks.length - 1;
  error.hidden = true;
  originalLink.href = link.href;
  stage.dataset.state = 'loading';
  stage.setAttribute('aria-busy', 'true');
  image.alt = thumbnail.alt;
  request.onload = () => {
    if (pendingImage !== request || !viewer.open) return;
    image.src = request.src;
    stage.dataset.state = 'success';
    stage.setAttribute('aria-busy', 'false');
  };
  request.onerror = () => {
    if (pendingImage !== request || !viewer.open) return;
    stage.dataset.state = 'error';
    stage.setAttribute('aria-busy', 'false');
    error.hidden = false;
  };
  request.src = link.href;
}

function openArtwork(event, index) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!viewer || typeof viewer.showModal !== 'function') return;
  event.preventDefault();
  returnFocus = event.currentTarget;
  viewer.showModal();
  document.body.classList.add('viewer-open');
  showArtwork(index);
  close.focus();
}

function moveArtwork(direction) {
  const index = currentIndex + direction;
  if (index < 0 || index >= artworkLinks.length) return;
  const activeControl = document.activeElement;
  showArtwork(index);
  if (activeControl.disabled) {
    (direction > 0 ? previous : next).focus();
  }
}

artworkLinks.forEach((link, index) => {
  link.addEventListener('click', event => openArtwork(event, index));
});
close.addEventListener('click', () => viewer.close());
previous.addEventListener('click', () => moveArtwork(-1));
next.addEventListener('click', () => moveArtwork(1));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    moveArtwork(event.key === 'ArrowRight' ? 1 : -1);
  }
});
viewer.addEventListener('click', event => {
  if (event.target !== viewer) return;
  const rect = viewer.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
    viewer.close();
  }
});
viewer.addEventListener('close', () => {
  document.body.classList.remove('viewer-open');
  if (pendingImage) {
    pendingImage.onload = null;
    pendingImage.onerror = null;
    pendingImage = null;
  }
  if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerPreference = window.matchMedia('(hover: hover) and (pointer: fine)');
const ticker = document.querySelector('.hero-ticker');
const tickerToggle = document.querySelector('.ticker-toggle');
let pointerFrame = 0;
let pointerX = 0;
let pointerY = 0;

function syncMotionPreference() {
  const reduced = motionPreference.matches;
  tickerToggle.hidden = reduced;
  document.documentElement.classList.toggle('has-pointer-effect', !reduced && pointerPreference.matches);
  if (reduced && pointerFrame) {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
  }
}

function renderHaloPosition() {
  pointerFrame = 0;
  document.documentElement.style.setProperty('--pointer-x', `${pointerX}px`);
  document.documentElement.style.setProperty('--pointer-y', `${pointerY}px`);
}

window.addEventListener('pointermove', event => {
  if (motionPreference.matches || !pointerPreference.matches || viewer.open) return;
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (!pointerFrame) pointerFrame = requestAnimationFrame(renderHaloPosition);
}, { passive: true });
tickerToggle.addEventListener('click', () => {
  const paused = ticker.classList.toggle('is-paused');
  tickerToggle.setAttribute('aria-pressed', String(paused));
  tickerToggle.setAttribute('aria-label', paused ? 'Play decorative strip' : 'Pause decorative strip');
  tickerToggle.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
});
motionPreference.addEventListener('change', syncMotionPreference);
pointerPreference.addEventListener('change', syncMotionPreference);
syncMotionPreference();
