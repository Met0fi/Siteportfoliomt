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
let parallaxFrame = 0;
let pointerX = window.innerWidth * 0.5;
let pointerY = window.innerHeight * 0.5;
let previousPointerX = pointerX;
let previousPointerY = pointerY;
let pointerSpeed = 0;

let currentLogoX = 0;
let currentLogoY = 0;
let currentCatX = 0;
let currentCatY = 0;
let targetLogoX = 0;
let targetLogoY = 0;
let targetCatX = 0;
let targetCatY = 0;

function syncMotionPreference() {
  const reduced = motionPreference.matches;
  if (tickerToggle) tickerToggle.hidden = reduced;
  document.documentElement.classList.toggle('has-pointer-effect', !reduced && pointerPreference.matches);
  if (reduced) {
    if (pointerFrame) {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
    }
    if (parallaxFrame) {
      cancelAnimationFrame(parallaxFrame);
      parallaxFrame = 0;
    }
    document.documentElement.style.removeProperty('--logo-shift-x');
    document.documentElement.style.removeProperty('--logo-shift-y');
    document.documentElement.style.removeProperty('--cat-shift-x');
    document.documentElement.style.removeProperty('--cat-shift-y');
  }
}

function renderHaloPosition() {
  pointerFrame = 0;
  document.documentElement.style.setProperty('--pointer-x', `${pointerX}px`);
  document.documentElement.style.setProperty('--pointer-y', `${pointerY}px`);
}

function updateParallaxElements() {
  parallaxFrame = 0;
  if (motionPreference.matches || !pointerPreference.matches || viewer.open) return;

  const ease = 0.06;
  currentLogoX += (targetLogoX - currentLogoX) * ease;
  currentLogoY += (targetLogoY - currentLogoY) * ease;
  currentCatX += (targetCatX - currentCatX) * ease;
  currentCatY += (targetCatY - currentCatY) * ease;

  document.documentElement.style.setProperty('--logo-shift-x', `${currentLogoX.toFixed(2)}px`);
  document.documentElement.style.setProperty('--logo-shift-y', `${currentLogoY.toFixed(2)}px`);
  document.documentElement.style.setProperty('--cat-shift-x', `${currentCatX.toFixed(2)}px`);
  document.documentElement.style.setProperty('--cat-shift-y', `${currentCatY.toFixed(2)}px`);

  const delta = Math.abs(targetLogoX - currentLogoX) + Math.abs(targetLogoY - currentLogoY) +
                Math.abs(targetCatX - currentCatX) + Math.abs(targetCatY - currentCatY);
  if (delta > 0.05) {
    parallaxFrame = requestAnimationFrame(updateParallaxElements);
  }
}

window.addEventListener('pointermove', event => {
  const dx = event.clientX - previousPointerX;
  const dy = event.clientY - previousPointerY;
  pointerSpeed = Math.hypot(dx, dy);
  previousPointerX = event.clientX;
  previousPointerY = event.clientY;
  pointerX = event.clientX;
  pointerY = event.clientY;

  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  const normalizedX = (event.clientX / width - 0.5) * 2;
  const normalizedY = (event.clientY / height - 0.5) * 2;

  targetLogoX = normalizedX * 11;
  targetLogoY = normalizedY * 8;
  targetCatX = -normalizedX * 14;
  targetCatY = -normalizedY * 10;

  if (!parallaxFrame && !motionPreference.matches && pointerPreference.matches && !viewer.open) {
    parallaxFrame = requestAnimationFrame(updateParallaxElements);
  }
  if (!pointerFrame && !motionPreference.matches && pointerPreference.matches && !viewer.open) {
    pointerFrame = requestAnimationFrame(renderHaloPosition);
  }
}, { passive: true });

if (tickerToggle && ticker) {
  tickerToggle.addEventListener('click', () => {
    const paused = ticker.classList.toggle('is-paused');
    tickerToggle.setAttribute('aria-pressed', String(paused));
    tickerToggle.setAttribute('aria-label', paused ? 'Play decorative strip' : 'Pause decorative strip');
    tickerToggle.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
  });
}

motionPreference.addEventListener('change', syncMotionPreference);
pointerPreference.addEventListener('change', syncMotionPreference);
syncMotionPreference();

const simplexTable = new Uint8Array(256);
for (let i = 0; i < 256; i++) simplexTable[i] = i;
for (let i = 255; i > 0; i--) {
  const rand = Math.abs((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1);
  const target = Math.floor(rand * (i + 1));
  const temp = simplexTable[i];
  simplexTable[i] = simplexTable[target];
  simplexTable[target] = temp;
}
const simplexPerm = new Uint8Array(512);
for (let i = 0; i < 512; i++) simplexPerm[i] = simplexTable[i & 255];

const simplexGradients = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
];

function dotGrad(grad, x, y, z) {
  return grad[0] * x + grad[1] * y + grad[2] * z;
}

function noise3D(xIn, yIn, zIn) {
  const F3 = 1.0 / 3.0;
  const G3 = 1.0 / 6.0;
  const skew = (xIn + yIn + zIn) * F3;
  const i = Math.floor(xIn + skew);
  const j = Math.floor(yIn + skew);
  const k = Math.floor(zIn + skew);
  const unskew = (i + j + k) * G3;
  const x0 = xIn - (i - unskew);
  const y0 = yIn - (j - unskew);
  const z0 = zIn - (k - unskew);

  let i1, j1, k1;
  let i2, j2, k2;
  if (x0 >= y0) {
    if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
    else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
  } else {
    if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
    else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
    else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
  }

  const x1 = x0 - i1 + G3;
  const y1 = y0 - j1 + G3;
  const z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2.0 * G3;
  const y2 = y0 - j2 + 2.0 * G3;
  const z2 = z0 - k2 + 2.0 * G3;
  const x3 = x0 - 1.0 + 3.0 * G3;
  const y3 = y0 - 1.0 + 3.0 * G3;
  const z3 = z0 - 1.0 + 3.0 * G3;

  const ii = i & 255;
  const jj = j & 255;
  const kk = k & 255;

  let n0 = 0.0;
  let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
  if (t0 > 0) {
    t0 *= t0;
    const g0 = simplexGradients[simplexPerm[ii + simplexPerm[jj + simplexPerm[kk]]] % 12];
    n0 = t0 * t0 * dotGrad(g0, x0, y0, z0);
  }

  let n1 = 0.0;
  let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
  if (t1 > 0) {
    t1 *= t1;
    const g1 = simplexGradients[simplexPerm[ii + i1 + simplexPerm[jj + j1 + simplexPerm[kk + k1]]] % 12];
    n1 = t1 * t1 * dotGrad(g1, x1, y1, z1);
  }

  let n2 = 0.0;
  let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
  if (t2 > 0) {
    t2 *= t2;
    const g2 = simplexGradients[simplexPerm[ii + i2 + simplexPerm[jj + j2 + simplexPerm[kk + k2]]] % 12];
    n2 = t2 * t2 * dotGrad(g2, x2, y2, z2);
  }

  let n3 = 0.0;
  let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
  if (t3 > 0) {
    t3 *= t3;
    const g3 = simplexGradients[simplexPerm[ii + 1 + simplexPerm[jj + 1 + simplexPerm[kk + 1]]] % 12];
    n3 = t3 * t3 * dotGrad(g3, x3, y3, z3);
  }

  return 32.0 * (n0 + n1 + n2 + n3);
}

const discCanvas = document.querySelector('#hero-disc');
if (discCanvas) {
  const ctx = discCanvas.getContext('2d');
  const heroSection = document.querySelector('.hero');
  const glitchTexture = new Image();
  glitchTexture.src = './assets/glitch-texture.png';

  let animationFrameId = null;
  let isHeroVisible = true;
  let simulationTime = 0;
  let currentElasticity = 0.18;
  let elasticityVelocity = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let baseRadius = 0;

  function resizeDiscCanvas() {
    const rect = discCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    discCanvas.width = Math.floor(rect.width * dpr);
    discCanvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    baseRadius = Math.min(rect.width, rect.height) * 0.38;
  }

  function renderDiscFrame() {
    animationFrameId = null;
    if (!isHeroVisible) return;

    simulationTime += 0.007;

    const naturalElasticity = 0.18 + 0.09 * Math.sin(simulationTime * 0.5) + 0.04 * Math.cos(simulationTime * 1.3);
    const elasticityDiff = naturalElasticity - currentElasticity;
    elasticityVelocity += elasticityDiff * 0.06;
    if (pointerSpeed > 0) {
      elasticityVelocity += Math.min(pointerSpeed * 0.0001, 0.02);
      pointerSpeed *= 0.9;
    }
    elasticityVelocity *= 0.88;
    currentElasticity += elasticityVelocity;

    const centerX = canvasWidth * 0.5;
    const centerY = canvasHeight * 0.5;
    const canvasBounds = discCanvas.getBoundingClientRect();
    const localPointerX = pointerX - canvasBounds.left;
    const localPointerY = pointerY - canvasBounds.top;
    const pointerVectorX = localPointerX - centerX;
    const pointerVectorY = localPointerY - centerY;
    const pointerDistance = Math.hypot(pointerVectorX, pointerVectorY);
    const pointerAngle = Math.atan2(pointerVectorY, pointerVectorX);

    const vertexCount = 180;
    const points = new Array(vertexCount);
    const chromaticPoints = new Array(vertexCount);

    for (let i = 0; i < vertexCount; i++) {
      const theta = (i / vertexCount) * Math.PI * 2;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const n1 = noise3D(cosTheta * 1.3, sinTheta * 1.3, simulationTime * 0.55);
      const n2 = noise3D(cosTheta * 2.8, sinTheta * 2.8, simulationTime * 0.95 + 10.0) * 0.35;
      const n3 = noise3D(cosTheta * 5.6, sinTheta * 5.6, simulationTime * 1.5 + 20.0) * 0.12;
      const combinedNoise = (n1 + n2 + n3) * baseRadius * currentElasticity;

      let angleDiff = Math.abs(theta - pointerAngle);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
      const falloff = Math.max(0, 1 - pointerDistance / (baseRadius * 1.9));
      const pullFactor = Math.exp(-Math.pow(angleDiff / 0.85, 2)) * falloff * (baseRadius * 0.12);

      const computedRadius = Math.max(baseRadius * 0.35, baseRadius + combinedNoise + pullFactor);
      points[i] = {
        x: centerX + cosTheta * computedRadius,
        y: centerY + sinTheta * computedRadius
      };
      chromaticPoints[i] = {
        x: centerX + cosTheta * (computedRadius + 1.5) + 1.5,
        y: centerY + sinTheta * (computedRadius + 1.5) - 1.0
      };
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.beginPath();
    let midX0 = (points[0].x + points[vertexCount - 1].x) * 0.5;
    let midY0 = (points[0].y + points[vertexCount - 1].y) * 0.5;
    ctx.moveTo(midX0, midY0);
    for (let i = 0; i < vertexCount; i++) {
      const nextIndex = (i + 1) % vertexCount;
      const midX = (points[i].x + points[nextIndex].x) * 0.5;
      const midY = (points[i].y + points[nextIndex].y) * 0.5;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    ctx.closePath();

    const radialGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 1.3);
    radialGrad.addColorStop(0, 'rgba(24, 15, 28, 0.88)');
    radialGrad.addColorStop(0.65, 'rgba(18, 12, 22, 0.76)');
    radialGrad.addColorStop(1, 'rgba(10, 8, 12, 0.60)');
    ctx.fillStyle = radialGrad;
    ctx.fill();

    if (glitchTexture.complete && glitchTexture.naturalWidth > 0) {
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = 0.12;
      ctx.globalCompositeOperation = 'screen';
      const texWidth = 320;
      const texHeight = (texWidth / glitchTexture.naturalWidth) * glitchTexture.naturalHeight;
      const shiftX = (simulationTime * 25) % texWidth;
      for (let x = -shiftX; x < canvasWidth + texWidth; x += texWidth) {
        for (let y = 0; y < canvasHeight; y += texHeight) {
          ctx.drawImage(glitchTexture, x, y, texWidth, texHeight);
        }
      }
      ctx.restore();
    }

    ctx.strokeStyle = 'rgba(235, 95, 175, 0.26)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.beginPath();
    midX0 = (chromaticPoints[0].x + chromaticPoints[vertexCount - 1].x) * 0.5;
    midY0 = (chromaticPoints[0].y + chromaticPoints[vertexCount - 1].y) * 0.5;
    ctx.moveTo(midX0, midY0);
    for (let i = 0; i < vertexCount; i++) {
      const nextIndex = (i + 1) % vertexCount;
      const midX = (chromaticPoints[i].x + chromaticPoints[nextIndex].x) * 0.5;
      const midY = (chromaticPoints[i].y + chromaticPoints[nextIndex].y) * 0.5;
      ctx.quadraticCurveTo(chromaticPoints[i].x, chromaticPoints[i].y, midX, midY);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(120, 230, 255, 0.14)';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    if (!motionPreference.matches && isHeroVisible) {
      animationFrameId = requestAnimationFrame(renderDiscFrame);
    }
  }

  function startDiscAnimation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (!motionPreference.matches && isHeroVisible) {
      animationFrameId = requestAnimationFrame(renderDiscFrame);
    } else {
      renderDiscFrame();
    }
  }

  window.addEventListener('resize', () => {
    resizeDiscCanvas();
    if (!animationFrameId) renderDiscFrame();
  }, { passive: true });

  if ('IntersectionObserver' in window && heroSection) {
    const heroObserver = new IntersectionObserver(entries => {
      isHeroVisible = entries[0].isIntersecting;
      if (isHeroVisible) {
        startDiscAnimation();
      } else if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }, { threshold: 0.05 });
    heroObserver.observe(heroSection);
  }

  resizeDiscCanvas();
  glitchTexture.onload = () => {
    if (!animationFrameId) renderDiscFrame();
  };
  startDiscAnimation();
}
