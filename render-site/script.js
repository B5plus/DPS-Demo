'use strict';



/* ── SCROLL PROGRESS BAR ── */
window.addEventListener('scroll', () => {
  const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  document.getElementById('progress-bar').style.width = Math.min(scrolled, 100) + '%';
});

/* ── NAV SHRINK ON SCROLL ── */
const mainNav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── DARK MODE ── */
const root = document.documentElement;
let dark = localStorage.getItem('dps-theme') === 'dark';
if (dark) root.setAttribute('data-theme', 'dark');
function toggleTheme() {
  dark = !dark;
  root.setAttribute('data-theme', dark ? 'dark' : '');
  localStorage.setItem('dps-theme', dark ? 'dark' : 'light');
  document.querySelector('.theme-btn').textContent = dark ? '☀️' : '🌙';
}
if (dark) document.querySelector('.theme-btn').textContent = '☀️';

/* ── HERO SLIDER ── */
let cur = 0, total = 3, sliderTimer, progressTimer, progressPct = 0;
const SLIDE_DURATION = 5000;

function goSlide(n) {
  cur = n;
  document.getElementById('slides').style.transform = `translateX(-${cur * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === cur);
    d.setAttribute('aria-selected', i === cur);
  });
  resetProgress();
}
function nextSlide() { goSlide((cur + 1) % total); }
function prevSlide() { goSlide((cur - 1 + total) % total); }

function resetProgress() {
  clearInterval(progressTimer);
  progressPct = 0;
  const fill = document.getElementById('slideProgress');
  fill.style.width = '0%';
  progressTimer = setInterval(() => {
    progressPct += (100 / (SLIDE_DURATION / 100));
    fill.style.width = Math.min(progressPct, 100) + '%';
    if (progressPct >= 100) clearInterval(progressTimer);
  }, 100);
}

function startAutoSlide() {
  sliderTimer = setInterval(nextSlide, SLIDE_DURATION);
  resetProgress();
}
function stopAutoSlide() {
  clearInterval(sliderTimer);
  clearInterval(progressTimer);
}

startAutoSlide();
const heroEl = document.querySelector('.hero');
heroEl.addEventListener('mouseenter', stopAutoSlide);
heroEl.addEventListener('mouseleave', startAutoSlide);
// Touch/swipe support for mobile
let touchStartX = 0;
heroEl.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
heroEl.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
});

/* ── COUNTER ANIMATION — FIXED ── */
function animCounter(el) {
  const target = +el.dataset.target;
  const suffix = el.dataset.suffix || '';
  let v = 0;
  const step = target / 55;
  const run = () => {
    v += step;
    if (v >= target) { el.textContent = target.toLocaleString() + suffix; return; }
    el.textContent = Math.floor(v).toLocaleString() + suffix;
    requestAnimationFrame(run);
  };
  run();
}
// FIXED: Use IntersectionObserver properly for stat counters
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && e.target.dataset.target) {
      animCounter(e.target);
      statObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
// Only observe stats that need counting (not the year)
['stat2','stat3','stat4'].forEach(id => {
  const el = document.getElementById(id);
  if (el) statObs.observe(el);
});

/* ── SCROLL REVEAL — FIXED ── */
try {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('animate'));
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
} catch(e) {
  // Fallback: if observer fails, just show everything
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

/* ── MOBILE NAV ── */
function openMobileNav() {
  document.getElementById('mobileNav').classList.add('open');
  document.getElementById('mobOverlay').classList.add('open');
  document.getElementById('hamburger').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('mobOverlay').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = '';
}
function toggleMobSub(id) {
  const sub = document.getElementById('mob-' + id);
  const ch = document.getElementById(id + '-ch');
  sub.classList.toggle('open');
  ch.textContent = sub.classList.contains('open') ? '▲' : '▼';
}

/* ── SEARCH ── */
const searchData = [
  { icon:'🎓', text:'Cambridge IGCSE Programme' },
  { icon:'📚', text:'AS & A Level Programme' },
  { icon:'🌱', text:'Cambridge Pre-Primary (Ages 3–5)' },
  { icon:'🌍', text:'IBDP — International Baccalaureate' },
  { icon:'🏊', text:'Swimming Pool Facility' },
  { icon:'🔬', text:'Science Laboratories' },
  { icon:'💻', text:'Computer Labs — 2 State-of-the-Art Labs' },
  { icon:'🏆', text:'Achievements & Awards 2025' },
  { icon:'📋', text:'Admissions Process & Requirements' },
  { icon:'🚌', text:'School Transport — 22 Routes' },
  { icon:'📰', text:'Latest School News' },
  { icon:'👩‍💼', text:'About the Principal — Dr. Seema V. Nair' },
  { icon:'📞', text:'Contact Us — +233 55 662 0540' },
  { icon:'📍', text:'Location — Community 25, Tema, Ghana' },
];
function toggleSearch() {
  const overlay = document.getElementById('searchOverlay');
  overlay.classList.toggle('open');
  if (overlay.classList.contains('open')) {
    setTimeout(() => document.getElementById('searchInput').focus(), 100);
    renderSearchResults(searchData);
  }
}
function renderSearchResults(items) {
  document.getElementById('searchResults').innerHTML = items.map(i =>
    `<div class="sr-item"><span class="sr-icon">${i.icon}</span>${i.text}</div>`
  ).join('');
}
function handleSearch(q) {
  const filtered = q.length < 2
    ? searchData
    : searchData.filter(i => i.text.toLowerCase().includes(q.toLowerCase()));
  renderSearchResults(filtered.length ? filtered : [{ icon:'❌', text:'No results found for "' + q + '"' }]);
}
document.getElementById('searchOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('searchOverlay')) toggleSearch();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('searchOverlay').classList.contains('open')) toggleSearch();
    if (document.getElementById('aiWindow').classList.contains('open')) toggleAI();
    if (document.getElementById('mobileNav').classList.contains('open')) closeMobileNav();
  }
});

/* ── AI CHATBOT — Powered by Anthropic API ── */
const aiKnowledge = {
  "admission": "To apply for admission at DPS Ghana: 1️⃣ Visit our website or office in Community 25, Tema 2️⃣ Fill in the online enquiry/application form 3️⃣ Attend a placement assessment 4️⃣ Receive your offer letter 5️⃣ Complete enrolment & fee payment. You can also call +233 55 662 0540 or email Principal@dpsghana.edu.gh.",
  "fees": "For the current fee structure, please contact our Finance Office directly at +233 55 662 0540 or email Principal@dpsghana.edu.gh. Instalment payment plans are available for all year groups.",
  "programmes": "DPS Ghana offers: 🌱 Cambridge Pre-Primary (3–5 yrs) | 📚 Cambridge Primary (5–11 yrs) | 🔬 Cambridge Lower Secondary (11–14 yrs) | 🎓 Cambridge IGCSE (14–16 yrs) | ⭐ AS & A Level (16–18 yrs) | 🌍 IBDP (16–18 yrs).",
  "location": "📍 DPS International Ghana is located at Community 25 (P2P7+C23), Tema, Greater Accra Region, Ghana. We are about 30–40 minutes from central Accra via the N1 motorway. School buses serve 19 routes across Tema and Accra.",
  "transport": "DPSI operates 22 school buses across 19 different routes covering Tema and Accra. All buses are GPS-tracked, air-conditioned, and driven by 26 professional dedicated drivers. Around 200 students commute daily.",
  "contact": "📞 Call us: +233 55 662 0540 | +233 54 435 3199 | +233 54 434 9579\n✉️ Email: Principal@dpsghana.edu.gh\n🕐 Office Hours: Mon–Fri 7AM–5PM | Sat 8AM–1PM",
  "pre-primary": "Our Cambridge Pre-Primary programme accepts children aged 3 to 5 years. It's a nurturing, play-based environment that develops curiosity, creativity and a love of learning through discovery.",
  "igcse": "Cambridge IGCSE is offered for students aged 14–16. It's one of the world's most recognised qualifications, offered across 70+ subjects. Our students consistently achieve outstanding results with 94%+ scoring A*–C.",
  "ibdp": "The International Baccalaureate Diploma Programme (IBDP) is offered for students aged 16–18. It's a rigorous, internationally recognised qualification accepted by top universities worldwide.",
  "facilities": "DPS Ghana offers: 🏫 State-of-the-art infrastructure | 📺 Smart classrooms with digital boards | 🔬 Physics, Chemistry & Biology labs | 💻 2 computer labs | 📚 Well-stocked library | 🏊 Olympic-size swimming pool | ⚽ Football pitch | 🏀 Basketball courts | 🎭 1000-seat Amphitheatre | 🏛️ 700-seat Auditorium | 🍽️ School canteen | 🚌 School transport.",
  "default": "I'm here to help with information about DPS International Ghana! You can ask me about admissions, programmes (IGCSE, A-Level, IBDP, Primary), fees, facilities, location, transport, or contact details. What would you like to know?"
};

function getAIResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('admission') || m.includes('apply') || m.includes('enrol')) return aiKnowledge.admission;
  if (m.includes('fee') || m.includes('cost') || m.includes('price') || m.includes('pay')) return aiKnowledge.fees;
  if (m.includes('programme') || m.includes('program') || m.includes('curriculum') || m.includes('offer')) return aiKnowledge.programmes;
  if (m.includes('location') || m.includes('where') || m.includes('address') || m.includes('find')) return aiKnowledge.location;
  if (m.includes('transport') || m.includes('bus') || m.includes('route')) return aiKnowledge.transport;
  if (m.includes('contact') || m.includes('phone') || m.includes('email') || m.includes('call')) return aiKnowledge.contact;
  if (m.includes('pre-primary') || m.includes('creche') || m.includes('nursery') || m.includes('3') || m.includes('4') || m.includes('5')) return aiKnowledge['pre-primary'];
  if (m.includes('igcse') || m.includes('gcse')) return aiKnowledge.igcse;
  if (m.includes('ib') || m.includes('diploma') || m.includes('ibdp')) return aiKnowledge.ibdp;
  if (m.includes('facilit') || m.includes('lab') || m.includes('pool') || m.includes('librar') || m.includes('sport')) return aiKnowledge.facilities;
  return aiKnowledge.default;
}

let aiOpen = false;
function toggleAI() {
  aiOpen = !aiOpen;
  const win = document.getElementById('aiWindow');
  const btn = document.getElementById('aiToggleBtn');
  win.classList.toggle('open', aiOpen);
  btn.setAttribute('aria-expanded', aiOpen);
  if (aiOpen) setTimeout(() => document.getElementById('aiInput').focus(), 300);
}

function addMsg(text, type) {
  const msgs = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = `ai-msg ${type}`;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('aiMessages');
  const typing = document.createElement('div');
  typing.className = 'ai-typing';
  typing.id = 'aiTyping';
  typing.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('aiTyping');
  if (t) t.remove();
}

function sendAI() {
  const input = document.getElementById('aiInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  document.getElementById('aiQuickReplies').style.display = 'none';
  addMsg(msg, 'user');
  showTyping();
  setTimeout(() => {
    removeTyping();
    const response = getAIResponse(msg);
    addMsg(response, 'bot');
  }, 900 + Math.random() * 600);
}

function sendQuick(msg) {
  document.getElementById('aiInput').value = msg;
  if (!aiOpen) toggleAI();
  setTimeout(sendAI, 200);
}

/* ── FORM VALIDATION — FIXED ── */
function validateField(input, type) {
  let valid = false;
  const v = input.value.trim();
  if (type === 'phone') valid = /^[\+\d\s\-]{7,}$/.test(v);
  else if (type === 'name') valid = v.length >= 2;
  else if (type === 'age') valid = +v >= 3 && +v <= 18;
  else valid = v.length > 0;
  input.classList.toggle('error', !valid && v.length > 0);
  input.classList.toggle('success', valid);
}

function submitEnroll() {
  const phone = document.getElementById('ef-phone');
  const first = document.getElementById('ef-first');
  const last = document.getElementById('ef-last');
  const age = document.getElementById('ef-age');
  const cls = document.getElementById('ef-class');
  // Validate all
  validateField(phone, 'phone');
  validateField(first, 'name');
  validateField(last, 'name');
  validateField(age, 'age');
  const hasErrors = [phone, first, last, age].some(f => f.classList.contains('error') || !f.value.trim());
  if (hasErrors || !cls.value) {
    if (!cls.value) cls.style.borderColor = '#ff6b6b';
    return;
  }
  const btn = document.getElementById('enrollBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Submitting...';
  setTimeout(() => {
    btn.style.display = 'none';
    document.getElementById('enrollSuccess').classList.add('show');
    [phone, first, last, age].forEach(field => {
      field.value = '';
      field.classList.remove('error', 'success');
    });
    cls.selectedIndex = 0;
    cls.style.borderColor = '';
    btn.disabled = false;
    btn.textContent = 'Submit Application →';
  }, 1200);
}
