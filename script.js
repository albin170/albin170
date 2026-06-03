/* ================================================================
   ALBIN BINU — NATURE PORTFOLIO
   main.js — Navigation, Scroll Reveal, Counters, Interactions
================================================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     SMOOTH NAV
  ══════════════════════════════════════════════════════ */
  const nav      = document.getElementById('topnav');
  const navLinks = document.querySelectorAll('.navlink');
  const sections = document.querySelectorAll('section[id]');

  function setActiveLink () {
    const scrollY = window.scrollY;
    let currentId = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop - 120) currentId = sec.id;
    });
    navLinks.forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + currentId)
    );
  }
  function handleNavScroll () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    setActiveLink();
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  setActiveLink();

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('nav-links').classList.remove('open');
      }
    });
  });

  /* ══════════════════════════════════════════════════════
     MOBILE MENU
  ══════════════════════════════════════════════════════ */
  window.toggleMenu = function () {
    document.getElementById('nav-links').classList.toggle('open');
  };

  /* ══════════════════════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════════════════════ */
  const revealEls = document.querySelectorAll(
    '.skill-group,.proj-card,.counter-card,.ach-card,.about-grid,.hero-content'
  );
  revealEls.forEach(el => {
    el.classList.add('reveal');
    if (el.parentElement) {
      const idx = Array.from(el.parentElement.children).indexOf(el);
      if (idx > 0 && idx < 5) el.classList.add('reveal-delay-' + idx);
    }
  });
  const ro = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  revealEls.forEach(el => ro.observe(el));

  /* ══════════════════════════════════════════════════════
     COUNTER ANIMATION — replays every visit
  ══════════════════════════════════════════════════════ */
  const counterCards = document.querySelectorAll('.counter-card');
  let counterRunning = false;

  function runCounters () {
    if (counterRunning) return;
    counterRunning = true;
    counterCards.forEach((card, idx) => {
      const target = parseInt(card.dataset.target, 10);
      const el     = document.getElementById('cnt-' + idx);
      if (!el) return;
      const suffix = idx === 3 ? '%' : '+';
      el.textContent = '0' + suffix;
      let current = 0;
      const step  = Math.max(1, Math.ceil(target / 60));
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + suffix;
        if (current >= target) clearInterval(timer);
      }, 28);
    });
    setTimeout(() => { counterRunning = false; }, 2500);
  }

  const achSection = document.getElementById('achievements');
  if (achSection) {
    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) runCounters(); });
    }, { threshold: 0.3 }).observe(achSection);
  }

  /* ══════════════════════════════════════════════════════
     VIDEO AVATAR — autoplay + tap-to-play fallback
  ══════════════════════════════════════════════════════ */
  (function () {
    const vid = document.getElementById('avatar-video');
    if (!vid) return;

    vid.play().catch(() => {
      /* Browser blocked autoplay — show a tap overlay */
      const wrap = vid.closest('.avatar-frame');
      if (!wrap) return;
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:absolute;inset:0;z-index:20;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;border-radius:20px;
        background:rgba(4,13,6,0.5);
        backdrop-filter:blur(4px);
      `;
      overlay.innerHTML =
        '<span style="font-size:3.5rem;filter:drop-shadow(0 0 16px rgba(74,222,128,0.9))">▶</span>';
      overlay.addEventListener('click', () => {
        vid.play();
        overlay.remove();
      });
      wrap.appendChild(overlay);
    });
  })();

  /* ══════════════════════════════════════════════════════
     PROJECT DETAIL toast
  ══════════════════════════════════════════════════════ */
  const projectDetails = {
    healthcare: { title: 'Healthcare AI Assistant', desc: 'AI-powered symptom analysis with real-time health recommendations.' },
    english:    { title: 'English Speaking AI',     desc: 'AI-driven pronunciation and communication skill trainer.' },
    canteen:    { title: 'Smart Canteen System',    desc: 'Campus food ordering and order management platform.' },
    fitness:    { title: 'Fitness Food Marketplace',desc: 'Digital marketplace for healthy nutrition products.' },
    study:      { title: 'AI Study Planner',        desc: 'Smart academic scheduling and progress tracking with AI.' },
    interview:  { title: 'Mock Interview AI',       desc: 'AI interview practice with real-time scoring and feedback.' },
    election:   { title: 'Election Assistant',      desc: 'Simplifies electoral processes and voting guidance.' },
    portfolio:  { title: 'Personal Portfolio',      desc: 'This nature-themed portfolio — built with pure HTML, CSS & JS.' }
  };

  window.openProject = function (key) {
    const p = projectDetails[key];
    if (!p) return;
    const existing = document.getElementById('proj-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'proj-toast';
    toast.style.cssText = `
      position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      background:rgba(6,18,8,0.96);border:1px solid rgba(74,222,128,0.3);
      border-radius:16px;padding:18px 28px;z-index:9990;
      font-family:var(--f-body,Inter);max-width:380px;width:90vw;
      box-shadow:0 16px 50px rgba(0,0,0,0.5);text-align:center;
      animation:toastIn 0.3s ease;
    `;
    toast.innerHTML = `
      <p style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;
                color:#f0fdf4;margin-bottom:6px">${p.title}</p>
      <p style="font-size:0.82rem;color:#6b7280;line-height:1.6;margin-bottom:14px">${p.desc}</p>
      <a href="https://github.com/albin170/" target="_blank"
         style="background:linear-gradient(135deg,#16a34a,#4ade80);color:#052e16;font-weight:700;
                padding:8px 20px;border-radius:99px;font-size:0.8rem;display:inline-block;">
        View on GitHub →
      </a>`;
    if (!document.getElementById('toast-style')) {
      const s = document.createElement('style');
      s.id = 'toast-style';
      s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease';
      toast.style.opacity    = '0';
      setTimeout(() => toast.remove(), 420);
    }, 4000);
  };

  /* ══════════════════════════════════════════════════════
     CONTACT MODAL
  ══════════════════════════════════════════════════════ */
  const contactModal = document.getElementById('contact-modal');
  if (contactModal) {
    contactModal.addEventListener('click', e => {
      if (e.target === contactModal) contactModal.classList.add('hidden');
    });
  }

  /* ══════════════════════════════════════════════════════
     RESUME BUTTON
  ══════════════════════════════════════════════════════ */
  ['resume-btn', 'dl-resume'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => {
      e.preventDefault();
      alert('📄 Resume download coming soon!\n\nContact: albinbinu170@gmail.com');
    });
  });

  /* ══════════════════════════════════════════════════════
     CURSOR SPARKLE on click
  ══════════════════════════════════════════════════════ */
  document.addEventListener('click', e => {
    const emojis = ['🌿', '🍃', '✨', '🌱', '💚'];
    const el = document.createElement('div');
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.cssText = `
      position:fixed;left:${e.clientX}px;top:${e.clientY}px;
      font-size:1.2rem;pointer-events:none;z-index:99999;
      transform:translate(-50%,-50%);animation:sparkle-up 0.8s ease forwards;
    `;
    if (!document.getElementById('sparkle-style')) {
      const s = document.createElement('style');
      s.id = 'sparkle-style';
      s.textContent = '@keyframes sparkle-up{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-120%) scale(1.4)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 820);
  });

  console.log('🌿 Nature Portfolio Initialized — Albin Binu');
})();
