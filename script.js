const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion) {
  window.addEventListener('pointermove', (event) => {
    root.style.setProperty('--cursor-x', `${event.clientX}px`);
    root.style.setProperty('--cursor-y', `${event.clientY}px`);
  }, { passive: true });
}

const reveals = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, revealObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -6% 0px'
  });

  reveals.forEach((element) => observer.observe(element));
}

const magneticItems = document.querySelectorAll('.magnetic');

if (!reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  magneticItems.forEach((item) => {
    item.addEventListener('pointermove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`;
    });

    item.addEventListener('pointerleave', () => {
      item.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

const emptyExternalLinks = document.querySelectorAll('a[href="#"][target="_blank"]');

emptyExternalLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
  });
});
