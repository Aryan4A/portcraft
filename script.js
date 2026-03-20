/* ============================================================
   PORTCRAFT — script.js   (shared across all pages)
   ============================================================ */

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
const hbg    = document.getElementById('hbg');
const navMenu   = document.getElementById('navMenu');
const navActions= document.getElementById('navActions');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('solid', window.scrollY > 30);
  }, { passive:true });
}

if (hbg && navMenu) {
  hbg.addEventListener('click', () => {
    hbg.classList.toggle('open');
    navMenu.classList.toggle('open');
    navActions && navActions.classList.toggle('open');
  });
  // Close on link click
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hbg.classList.remove('open');
    navMenu.classList.remove('open');
    navActions && navActions.classList.remove('open');
  }));
}

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin:'0px 0px -40px 0px' });

document.querySelectorAll('.rv').forEach(el => revealObserver.observe(el));

/* ── FAQ accordion ── */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── Contact form ── */
const contactForm = document.getElementById('mainContactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = contactForm.querySelector('#c-name')?.value?.trim();
    const email = contactForm.querySelector('#c-email')?.value?.trim();
    const msg = contactForm.querySelector('#c-msg')?.value?.trim();
    if (!name || !email || !msg) {
      showAlert('Please fill in all required fields.', 'error');
      return;
    }
    const btn = contactForm.querySelector('button[type=submit]');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      const suc = document.getElementById('contactSuccess');
      if (suc) { suc.style.display = 'flex'; setTimeout(()=>suc.style.display='none',5000); }
      contactForm.reset();
    }, 1200);
  });
}

/* ── Counter animation ── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let cur = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur + suffix;
      if (cur >= target) clearInterval(timer);
    }, 16);
  });
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounters(); counterObserver.disconnect(); }
  });
}, { threshold:0.5 });

const counterSection = document.querySelector('[data-count]');
if (counterSection) counterObserver.observe(counterSection.closest('section') || counterSection);

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
    }
  });
});

/* ── Alert/toast helper ── */
function showAlert(msg, type='info') {
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  const container = document.getElementById('toastContainer') || createToastContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||'•'}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(30px)';
    el.style.transition = 'all 0.4s';
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'toastContainer';
  c.className = 'toast-container';
  document.body.appendChild(c);
  return c;
}
