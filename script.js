/* ─────────────────────────────────────────
   BOLLENIX — Main JavaScript
   ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 0. Page load reveal animations ── */
  const loadItems = [
    { selector: '.hero-eyebrow',          delay:   0 },
    { selector: '.hero h1',               delay:  90 },
    { selector: '.hero-subtitle',         delay: 180 },
    { selector: '.hero-buttons',          delay: 270 },
  ];
  loadItems.forEach(({ selector, delay }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('load-reveal');
    el.style.animationDelay = delay + 'ms';
    setTimeout(() => el.classList.add('start'), 10);
  });

  /* ── 1. Transparent → solid nav on scroll + hide on scroll down ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const isHomepage = !!document.querySelector('.hero');
    if (!isHomepage) {
      nav.classList.add('nav-scrolled');
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNav = () => {
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;

      // Transparent → solid
      if (isHomepage) {
        nav.classList.toggle('nav-scrolled', scrollY > 100);
      }

      // Hide on scroll down (only after 120px), show on scroll up
      if (scrollY > 120) {
        if (scrollDelta > 4) {
          // Scrolling down — hide nav
          nav.classList.add('nav-hidden');
          // Close mobile menu if open
          const navLinks = document.querySelector('.nav-links');
          const toggle = document.querySelector('.nav-toggle');
          if (navLinks) navLinks.classList.remove('open');
          if (toggle) { toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
        } else if (scrollDelta < -4) {
          // Scrolling up — show nav
          nav.classList.remove('nav-hidden');
        }
      } else {
        // Near top — always show
        nav.classList.remove('nav-hidden');
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });

    updateNav(); // run once on load
  }

  /* ── 2. Mobile menu toggle ── */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', (e) => {
      if (nav && !nav.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
      }
    });
  }

  /* ── 3. Dropdown (mobile click) ── */
  document.querySelectorAll('.has-dropdown').forEach(item => {
    const btn = item.querySelector('.dropdown-toggle');
    if (btn) {
      btn.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle('open');
        }
      });
    }
  });

  /* ── 4. Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── 5. Fade-in on scroll ── */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => io.observe(el));
  }

  /* ── 6. Animated number counters ── */
  const counters = document.querySelectorAll('.counter');
  if (counters.length) {
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(easeOut(progress) * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  }

  /* ── 7. Testimonials carousel ── */
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const track = carousel.querySelector('.testimonials-track');
    const slides = carousel.querySelectorAll('.testimonial-slide');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    let current = 0;
    let autoTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(dot);
    });

    const goTo = (i) => {
      current = ((i % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      carousel.querySelectorAll('.dot').forEach((d, j) => d.classList.toggle('active', j === current));
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    const startAuto = () => { autoTimer = setInterval(() => goTo(current + 1), 5000); };
    const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', startAuto);

    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
    });

    startAuto();
  }


  /* ── 9. Mobile accordion for service-detail sections ── */
  const serviceDetails = document.querySelectorAll('.service-detail');
  if (serviceDetails.length && window.innerWidth <= 768) {
    serviceDetails.forEach((detail, i) => {
      const content = detail.querySelector('.service-detail-content');
      if (!content) return;
      const eyebrow = content.querySelector('.section-eyebrow');
      const h3 = content.querySelector('h3');
      if (!eyebrow || !h3) return;

      // Wrap eyebrow + h3 + arrow in a clickable header
      const header = document.createElement('div');
      header.className = 'sd-toggle';
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');

      const textWrap = document.createElement('div');
      textWrap.className = 'sd-toggle-text';

      const arrow = document.createElement('div');
      arrow.className = 'sd-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      content.insertBefore(header, eyebrow);
      textWrap.appendChild(eyebrow);
      textWrap.appendChild(h3);
      header.appendChild(textWrap);
      header.appendChild(arrow);

      // Wrap remaining content (paragraphs, checklist, btn) in collapsible div
      const collapsible = document.createElement('div');
      collapsible.className = 'service-detail-collapsible';
      while (content.children.length > 1) {
        collapsible.appendChild(content.children[1]);
      }
      content.appendChild(collapsible);

      // First item open by default
      if (i === 0) {
        detail.classList.add('sd-open');
        collapsible.style.maxHeight = collapsible.scrollHeight + 'px';
      }

      const toggle = () => {
        const isOpen = detail.classList.toggle('sd-open');
        collapsible.style.maxHeight = isOpen ? collapsible.scrollHeight + 'px' : '0';
        header.setAttribute('aria-expanded', isOpen);
      };
      header.addEventListener('click', toggle);
      header.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ── 10. Contact forms ── */
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const success = form.querySelector('.form-success');
      if (btn) { btn.disabled = true; btn.textContent = 'Versturen...'; }
      setTimeout(() => {
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = 'Verstuur bericht'; }
        if (success) success.style.display = 'block';
      }, 900);
    });
  });

});
