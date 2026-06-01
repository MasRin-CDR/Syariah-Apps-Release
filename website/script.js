/* ============================================================
   SYARIAH APP — INTERACTIVE JAVASCRIPT
   Canvas Particles | Scroll Animations | Counter | Modal
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   1. CANVAS PARTICLE SYSTEM (Islamic Geometric)
   ────────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;
  const PRIMARY = { r: 0, g: 150, b: 136 };
  const GOLD    = { r: 245, g: 158, b: 11 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(random = false) {
      this.x     = Math.random() * W;
      this.y     = random ? Math.random() * H : H + 10;
      this.size  = Math.random() * 2 + 0.5;
      this.speed = Math.random() * 0.4 + 0.1;
      this.angle = Math.random() * Math.PI * 2;
      this.drift = (Math.random() - 0.5) * 0.3;
      this.life  = 0;
      this.maxLife = Math.random() * 200 + 100;
      this.isGold = Math.random() < 0.15;
      // Islamic star shape or circle
      this.shape = Math.random() < 0.2 ? 'star' : 'circle';
    }

    update() {
      this.y    -= this.speed;
      this.x    += this.drift;
      this.angle += 0.01;
      this.life++;
      if (this.y < -10 || this.life > this.maxLife) this.reset();
    }

    draw() {
      const progress = this.life / this.maxLife;
      const alpha = progress < 0.1
        ? progress / 0.1
        : progress > 0.8
          ? (1 - progress) / 0.2
          : 1;

      const c = this.isGold ? GOLD : PRIMARY;
      ctx.globalAlpha = alpha * 0.4;

      if (this.shape === 'star') {
        drawStar(ctx, this.x, this.y, 5, this.size * 2, this.size, this.angle, c);
      } else {
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},1)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawStar(ctx, cx, cy, spikes, outerR, innerR, angle, c) {
    ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},1)`;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r   = i % 2 === 0 ? outerR : innerR;
      const a   = angle + (i * Math.PI) / spikes;
      const x   = cx + Math.cos(a) * r;
      const y   = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  /* Connecting lines between nearby particles */
  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.08;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = `rgba(0,150,136,1)`;
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor(W * H / 14000), 80);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  animate();
})();


/* ──────────────────────────────────────────────
   2. NAVBAR SCROLL BEHAVIOR
   ────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastY = 0;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();


/* ──────────────────────────────────────────────
   3. HAMBURGER / MOBILE MENU
   ────────────────────────────────────────────── */
(function initMobileMenu() {
  const btn  = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('active');
    }
  });
})();


/* ──────────────────────────────────────────────
   4. SCROLL REVEAL ANIMATIONS
   ────────────────────────────────────────────── */
(function initReveal() {
  const targets = [
    { selector: '#features-header',  cls: 'reveal',       delay: 0   },
    { selector: '#feat-quran',        cls: 'reveal',       delay: 0   },
    { selector: '#feat-hadis',        cls: 'reveal',       delay: 100 },
    { selector: '#feat-search',       cls: 'reveal',       delay: 200 },
    { selector: '#feat-waris',        cls: 'reveal',       delay: 0   },
    { selector: '#feat-bookmark',     cls: 'reveal',       delay: 100 },
    { selector: '#feat-ui',           cls: 'reveal',       delay: 200 },
    { selector: '#platforms-header',  cls: 'reveal',       delay: 0   },
    { selector: '#plat-android',      cls: 'reveal-left',  delay: 0   },
    { selector: '#plat-windows',      cls: 'reveal-right', delay: 100 },
    { selector: '#download-header',   cls: 'reveal',       delay: 0   },
    { selector: '#dl-android',        cls: 'reveal-left',  delay: 0   },
    { selector: '#dl-windows',        cls: 'reveal-right', delay: 150 },
    { selector: '#about-text',        cls: 'reveal-left',  delay: 0   },
    { selector: '#about-logo',        cls: 'reveal-right', delay: 150 },
    { selector: '#developer-header',  cls: 'reveal',       delay: 0   },
    { selector: '#dev-photo-col',     cls: 'reveal-left',  delay: 0   },
    { selector: '#dev-info-col',      cls: 'reveal-right', delay: 150 },
    { selector: '#contact-banner',    cls: 'reveal',       delay: 0   },
  ];

  targets.forEach(({ selector, cls, delay }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add(cls);
    if (delay) el.style.transitionDelay = delay + 'ms';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   5. ANIMATED COUNTER (Stats)
   ────────────────────────────────────────────── */
(function initCounters() {
  const stats = document.querySelectorAll('.stat-number[data-target]');
  if (!stats.length) return;

  function formatNumber(n) {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K+';
    return n.toString() + '+';
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const startTime = performance.now();

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = formatNumber(current);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   6. SMOOTH ACTIVE NAV LINK (Scroll Spy)
   ────────────────────────────────────────────── */
(function initScrollSpy() {
  const sections = ['hero', 'features', 'platforms', 'download', 'developer', 'about'];
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();


/* ──────────────────────────────────────────────
   7. DOWNLOAD MODAL
   ────────────────────────────────────────────── */
async function handleDownload(e, platform) {
  e.preventDefault();
  const link = e.currentTarget || document.getElementById('dl-windows-btn');
  const href = link?.getAttribute('href') || '/downloads/SyariahAppSetup.exe';
  const version = link?.dataset?.version || '1.0.11';

  if (platform !== 'windows') return;
  try { window.va?.('event', 'download_windows', { version }); } catch (e) {}

  const modal     = document.getElementById('downloadModal');
  const title     = document.getElementById('modalTitle');
  const desc      = document.getElementById('modalDesc');
  const bar       = document.getElementById('progressBar');
  const icon      = document.getElementById('modalIcon');

  const labels = {
    windows: {
      title: 'Mengunduh untuk Windows',
      desc:  'SyariahAppSetup.exe',
      color: 'rgba(0,120,212,0.1)',
      border:'rgba(0,120,212,0.3)',
    }
  };

  const cfg = labels[platform] || labels.windows;
  title.textContent = cfg.title;
  desc.textContent  = cfg.desc;
  icon.style.background = cfg.color;
  icon.style.borderColor = cfg.border;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Simulate progress bar
  bar.style.width = '0%';
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        title.textContent = '✓ Unduhan Siap!';
        desc.textContent  = 'Download dimulai. Silakan cek folder Downloads.';
        icon.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>`;
        icon.style.color = '#22C55E';
        icon.style.background = 'rgba(34,197,94,0.1)';
        icon.style.borderColor = 'rgba(34,197,94,0.3)';
        window.location.href = href;
      }, 300);
    }
    bar.style.width = progress + '%';
  }, 120);

  await trackEvent('download', { platform, version, file: 'SyariahAppSetup.exe' });
}

function closeModal() {
  const modal = document.getElementById('downloadModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  // Reset modal icon
  const icon = document.getElementById('modalIcon');
  icon.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>`;
  icon.style.color = '';
  icon.style.background = '';
  icon.style.borderColor = '';
}

// Close modal on backdrop click
document.getElementById('downloadModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});


/* ──────────────────────────────────────────────
   8. TILT EFFECT on Feature Cards
   ────────────────────────────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.feature-card, .download-card, .platform-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -4;
      const tiltY = dx *  4;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
})();


/* ──────────────────────────────────────────────
   9. MAGNETIC BUTTON EFFECT
   ────────────────────────────────────────────── */
(function initMagnetic() {
  const btns = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.25;
      const dy   = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => btn.style.transition = '', 400);
    });
  });
})();


/* ──────────────────────────────────────────────
   10. PARALLAX on Hero Logo
   ────────────────────────────────────────────── */
(function initParallax() {
  const wrap = document.getElementById('hero-logo-wrap');
  const hero = document.getElementById('hero');
  if (!wrap || !hero) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    wrap.style.transform = `translate(${dx * 12}px, ${dy * 8}px)`;
  });
})();


/* ──────────────────────────────────────────────
   11. ACTIVE NAV LINK STYLE
   ────────────────────────────────────────────── */
(function addNavActiveStyle() {
  const style = document.createElement('style');
  style.textContent = `.nav-link.active { color: var(--primary) !important; }
  .nav-link.active::after { transform: translateX(-50%) scaleX(1) !important; }`;
  document.head.appendChild(style);
})();


/* ──────────────────────────────────────────────
   12. ISLAMIC GEOMETRIC PATTERN (SVG Overlay)
   ────────────────────────────────────────────── */
(function injectGeometricPattern() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const sections = document.querySelectorAll('.download, .features');
  sections.forEach(section => {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    Object.assign(svg.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none',
      opacity: '0.025',
      overflow: 'hidden',
    });

    // Repeating star pattern
    const defs = document.createElementNS(svgNS, 'defs');
    const pattern = document.createElementNS(svgNS, 'pattern');
    pattern.setAttribute('id', 'geo-' + Math.random().toString(36).slice(2, 7));
    pattern.setAttribute('x', '0');
    pattern.setAttribute('y', '0');
    pattern.setAttribute('width', '80');
    pattern.setAttribute('height', '80');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    // 8-point star path
    const star = document.createElementNS(svgNS, 'path');
    star.setAttribute('d', buildStarPath(40, 40, 30, 12, 8));
    star.setAttribute('fill', 'none');
    star.setAttribute('stroke', '#009688');
    star.setAttribute('stroke-width', '0.8');

    pattern.appendChild(star);
    defs.appendChild(pattern);

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', `url(#${pattern.id})`);

    svg.appendChild(defs);
    svg.appendChild(rect);

    section.style.position = 'relative';
    section.insertBefore(svg, section.firstChild);
  });

  function buildStarPath(cx, cy, outerR, innerR, points) {
    let path = '';
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (Math.PI / points) * i - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
    }
    return path + 'Z';
  }
})();


/* ──────────────────────────────────────────────
   13. CURSOR GLOW TRAIL
   ────────────────────────────────────────────── */
(function initCursorGlow() {
  // Only on desktop
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'fixed',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,150,136,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: '0',
    transform: 'translate(-50%, -50%)',
    transition: 'left 0.15s ease, top 0.15s ease',
    willChange: 'left, top',
  });
  document.body.appendChild(glow);

  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();


/* ──────────────────────────────────────────────
   14. PAGE LOAD PROGRESS BAR
   ────────────────────────────────────────────── */
(function initLoadBar() {
  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position: 'fixed',
    top: '0', left: '0',
    height: '3px',
    width: '0%',
    background: 'linear-gradient(90deg, #009688, #4DD0C4, #F59E0B)',
    zIndex: '9999',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 10px rgba(0,150,136,0.8)',
  });
  document.body.prepend(bar);

  let prog = 0;
  const id = setInterval(() => {
    prog += Math.random() * 20;
    if (prog >= 90) { clearInterval(id); prog = 90; }
    bar.style.width = prog + '%';
  }, 100);

  window.addEventListener('load', () => {
    clearInterval(id);
    bar.style.width = '100%';
    setTimeout(() => { bar.style.opacity = '0'; bar.style.transition += ', opacity 0.4s'; }, 400);
    setTimeout(() => bar.remove(), 900);
  });
})();


/* ──────────────────────────────────────────────
   15. SMOOTH SCROLL LINKS
   ────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ──────────────────────────────────────────────
   16. RIPPLE EFFECT on Download Buttons
   ────────────────────────────────────────────── */
(function initRipple() {
  document.querySelectorAll('.dl-btn, .btn-primary, .platform-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      Object.assign(ripple.style, {
        position:     'absolute',
        width:        size + 'px',
        height:       size + 'px',
        left:         x + 'px',
        top:          y + 'px',
        borderRadius: '50%',
        background:   'rgba(255,255,255,0.25)',
        transform:    'scale(0)',
        animation:    'rippleAnim 0.6s linear',
        pointerEvents:'none',
      });

      // Inject keyframes once
      if (!document.getElementById('ripple-style')) {
        const s = document.createElement('style');
        s.id = 'ripple-style';
        s.textContent = `@keyframes rippleAnim {
          to { transform: scale(2.5); opacity: 0; }
        }`;
        document.head.appendChild(s);
      }

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();

/* -----------------------------
   Simple local tracking helper
   /track (POST) increments counters
   /stats (GET) returns current counts
   ----------------------------- */
async function trackEvent(event, meta) {
  try {
    const payload = { event, meta: meta || {}, path: location.pathname, ts: Date.now() };
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/track', blob);
    } else {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  } catch (e) { /* ignore */ }
}

// send visit event on page load
window.addEventListener('load', () => { try { trackEvent('visit'); } catch (e) {} });

console.log('%c🕌 Syariah App', 'color:#009688;font-size:20px;font-weight:bold;');
console.log('%cBismillahirrahmanirrahim — Semoga bermanfaat 🤲', 'color:#F59E0B;font-size:12px;');

function updateLiveStats(stats) {
  try {
    const v = document.getElementById('live-visits');
    const d = document.getElementById('live-downloads');
    const visits = stats?.visits ?? stats?.visitors?.total ?? 0;
    const downloads = stats?.downloads ?? stats?.downloadStats?.total ?? 0;
    if (v) v.textContent = visits;
    if (d) d.textContent = downloads;
  } catch (e) { /* ignore */ }
}

function subscribeLiveStats() {
  // initial fetch
  fetch('/api/stats').then(r => r.json()).then(j => { if (j && j.ok) updateLiveStats(j.stats); }).catch(()=>{});
  setInterval(() => {
    fetch('/api/stats').then(r => r.json()).then(j => { if (j && j.ok) updateLiveStats(j.stats); }).catch(()=>{});
  }, 30000);
}

// start subscription
subscribeLiveStats();
