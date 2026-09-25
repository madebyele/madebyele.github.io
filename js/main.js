(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const mobileNavigation = document.querySelector('#mobile-navigation');
  const mobileLinks = mobileNavigation?.querySelectorAll('a') ?? [];
  const desktopLinks = document.querySelectorAll('.desktop-nav a[href^="#"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setMenu(open, restoreFocus = false) {
    if (!menuButton || !mobileNavigation) return;

    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.sr-only').textContent = open ? '메뉴 닫기' : '메뉴 열기';
    mobileNavigation.setAttribute('aria-hidden', String(!open));
    mobileNavigation.inert = !open;
    mobileNavigation.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);

    if (open) {
      mobileNavigation.querySelector('a')?.focus();
    } else if (restoreFocus) {
      menuButton.focus();
    }
  }

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
  });

  mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', (event) => {
    if (!mobileNavigation?.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      setMenu(false, true);
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = [menuButton, ...mobileLinks];
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const sections = ['featured', 'experience', 'about', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const navigationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        desktopLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach((section) => navigationObserver.observe(section));
  }

  const revealElements = document.querySelectorAll('[data-reveal]');

  function revealAll() {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  reducedMotion.addEventListener?.('change', (event) => {
    if (event.matches) revealAll();
  });

  const desktopQuery = window.matchMedia('(min-width: 48rem)');
  desktopQuery.addEventListener?.('change', (event) => {
    if (event.matches && mobileNavigation?.classList.contains('is-open')) {
      setMenu(false);
    }
  });

  const year = document.querySelector('[data-current-year]');
  if (year) {
    const currentYear = new Date().getFullYear();
    year.textContent = String(currentYear);
    year.setAttribute('datetime', String(currentYear));
  }
})();
