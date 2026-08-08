const root = document.documentElement;
const body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const revealItems = document.querySelectorAll('.reveal');
const parallaxItems = document.querySelectorAll('[data-parallax]');
const workCards = document.querySelectorAll('.work-card');
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let pointerFrame = 0;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const renderPointer = () => {
  pointerFrame = 0;
  root.style.setProperty('--mx', `${pointerX}px`);
  root.style.setProperty('--my', `${pointerY}px`);

  parallaxItems.forEach((item) => {
    if (item.classList.contains('hero-title') || window.innerWidth < 1400) {
      item.style.transform = 'none';
      return;
    }

    const strength = Number(item.dataset.parallax || 0);
    const offsetX = clamp((pointerX - window.innerWidth / 2) * strength, -6, 6);
    const offsetY = clamp((pointerY - window.innerHeight / 2) * strength, -6, 6);
    item.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  });
};

const queuePointer = (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;

  if (!pointerFrame) {
    pointerFrame = requestAnimationFrame(renderPointer);
  }
};

if (!reducedMotion && finePointer) {
  window.addEventListener('pointermove', queuePointer, { passive: true });
}

window.addEventListener('resize', () => {
  parallaxItems.forEach((item) => {
    if (window.innerWidth < 1400 || item.classList.contains('hero-title')) {
      item.style.transform = 'none';
    }
  });
}, { passive: true });

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -7% 0px'
  });

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (!reducedMotion && finePointer) {
  workCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${y * -1.8}deg`);
      card.style.setProperty('--tilt-y', `${x * 1.8}deg`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

document.querySelectorAll('[data-empty-link]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

const pulseGlitch = () => {
  if (reducedMotion || document.hidden) {
    window.setTimeout(pulseGlitch, 5000);
    return;
  }

  body.classList.add('is-glitching');
  window.setTimeout(() => body.classList.remove('is-glitching'), 90);
  window.setTimeout(pulseGlitch, 4200 + Math.random() * 4200);
};

window.setTimeout(pulseGlitch, 2600);
