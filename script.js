/* ================================================================
   KL ATTENDANCE CALCULATOR — script.js
   ================================================================
   Features:
   ✔ Theme selector (Boys / Girls)
   ✔ Canvas particle backgrounds (Neon grid for Boys, Stars for Girls)
   ✔ Simple Attendance Calculator
   ✔ LTPS Weighted Attendance Calculator
        L=100, T=25, P=50, S=25 (empty fields fully ignored)
   ✔ Detailed analysis: Safe / Condonation / Not Eligible
   ✔ Animated progress ring with counter
   ✔ Toast notifications
   ✔ Live formula preview for LTPS
   ================================================================ */

/* ──────────────────────────────────
   1.  GLOBAL STATE
─────────────────────────────────── */
let currentTheme = null;   // 'boys' | 'girls'
let bgAnimId     = null;   // requestAnimationFrame id for bg canvas

/* ──────────────────────────────────
   2.  CANVAS BACKGROUNDS
─────────────────────────────────── */

/** Selector-screen colourful particle rain */
function initSelectorCanvas() {
  const canvas = document.getElementById('selectorCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], id;

  const COLORS = ['#e8192c','#00c8f0','#b97cf8','#7c86f5','#39ff14','#ffaa00'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle(randomY = false) {
    return {
      x     : Math.random() * W,
      y     : randomY ? Math.random() * H : H + 5,
      r     : Math.random() * 1.4 + 0.25,
      vy    : -(Math.random() * 0.38 + 0.1),
      vx    : (Math.random() - 0.5) * 0.28,
      life  : randomY ? Math.random() : 1,
      decay : Math.random() * 0.002 + 0.0008,
      color : COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }

  resize();
  for (let i = 0; i < 140; i++) particles.push(mkParticle(true));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0 || p.y < -5) Object.assign(p, mkParticle());
      ctx.globalAlpha = p.life * 0.62;
      ctx.fillStyle = ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    id = requestAnimationFrame(draw);
  }

  draw();
  window.addEventListener('resize', resize);
  return () => cancelAnimationFrame(id);
}

/** Boys theme: neon grid + red/cyan rising particles */
function initBoysCanvas() {
  if (bgAnimId) cancelAnimationFrame(bgAnimId);
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkP(randomY = false) {
    return {
      x    : Math.random() * W,
      y    : randomY ? Math.random() * H : H + 5,
      r    : Math.random() * 1.7 + 0.3,
      vy   : -(Math.random() * 0.75 + 0.18),
      vx   : (Math.random() - 0.5) * 0.45,
      life : 1,
      decay: Math.random() * 0.0038 + 0.001,
      color: Math.random() > 0.5 ? '#e8192c' : '#00c8f0'
    };
  }

  resize();
  for (let i = 0; i < 90; i++) particles.push(mkP(true));

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Grid */
    ctx.strokeStyle = 'rgba(232,25,44,0.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 56) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 56) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }

    /* Horizon glow */
    const grad = ctx.createLinearGradient(0, H*0.65, 0, H);
    grad.addColorStop(0, 'rgba(232,25,44,0.055)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.fillRect(0, H*0.65, W, H*0.35);

    /* Particles */
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0 || p.y < -6) Object.assign(p, mkP());
      ctx.globalAlpha = p.life * 0.52;
      ctx.fillStyle = ctx.shadowColor = p.color;
      ctx.shadowBlur = 9;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    bgAnimId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

/** Girls theme: twinkling stars + soft nebula blobs */
function initGirlsCanvas() {
  if (bgAnimId) cancelAnimationFrame(bgAnimId);
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], t = 0;

  const COLS = ['#b97cf8','#7c86f5','#f9a8d4','#e0d4ff','#c4b5fd'];

  function buildStars() {
    stars = Array.from({ length: 190 }, () => ({
      x     : Math.random() * W,
      y     : Math.random() * H,
      r     : Math.random() * 1.2 + 0.2,
      speed : Math.random() * 0.3 + 0.06,
      phase : Math.random() * Math.PI * 2,
      color : COLS[Math.floor(Math.random() * COLS.length)],
      maxA  : Math.random() * 0.55 + 0.18
    }));
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function drawNebula() {
    [
      { x: W*0.15, y: H*0.3,  r: 300, c:'rgba(185,124,248,0.038)' },
      { x: W*0.82, y: H*0.62, r: 260, c:'rgba(124,134,245,0.036)' },
      { x: W*0.5,  y: H*0.85, r: 220, c:'rgba(249,168,212,0.028)' }
    ].forEach(b => {
      const g = ctx.createRadialGradient(b.x,b.y,0, b.x,b.y,b.r);
      g.addColorStop(0, b.c); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    });
  }

  resize();

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.005;
    drawNebula();
    stars.forEach(s => {
      const alpha = s.maxA * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ctx.shadowColor = s.color;
      ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    bgAnimId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  draw();
}

/* ──────────────────────────────────
   3.  THEME SELECTION
─────────────────────────────────── */

/** Called when user clicks a theme card */
function selectTheme(theme) {
  currentTheme = theme;

  /* Exit animation for selector */
  const sel = document.getElementById('themeSelector');
  sel.classList.add('exit');

  setTimeout(() => {
    sel.style.display = 'none';

    const app = document.getElementById('mainApp');
    app.classList.remove('hidden');

    /* Apply theme-specific classes / labels */
    if (theme === 'girls') {
      document.body.classList.add('girls-theme');
      document.getElementById('doodleLayer').classList.remove('hidden');
      document.getElementById('headerSub').textContent  = '✨ Dreamy Edition · KL University';
      document.getElementById('modeBadge').textContent  = '✨ Girls Mode';
      initGirlsCanvas();
    } else {
      document.body.classList.remove('girls-theme');
      document.getElementById('doodleLayer').classList.add('hidden');
      document.getElementById('headerSub').textContent  = '😎 Gaming Edition · KL University';
      document.getElementById('modeBadge').textContent  = '😎 Boys Mode';
      initBoysCanvas();
    }

    /* Entrance animation for main app */
    app.style.opacity   = '0';
    app.style.transform = 'translateY(18px)';
    app.style.transition= 'opacity 0.55s ease, transform 0.55s ease';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      app.style.opacity   = '1';
      app.style.transform = 'translateY(0)';
    }));
  }, 580);

  showToast(theme === 'boys' ? '😎 Boys Mode Activated!' : '✨ Girls Mode Activated!');
}

/** Back button → return to selector */
function goBack() {
  const app = document.getElementById('mainApp');
  app.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  app.style.opacity    = '0';
  app.style.transform  = 'translateY(18px)';

  setTimeout(() => {
    app.classList.add('hidden');
    app.style.cssText = '';          // reset inline styles
    hideResult();
    resetAllInputs();

    const sel = document.getElementById('themeSelector');
    sel.classList.remove('exit');
    sel.style.display = '';
  }, 380);
}

/* ──────────────────────────────────
   4.  TAB SWITCHING
─────────────────────────────────── */
function switchTab(tab) {
  /* Update button states */
  document.getElementById('tabSimple').classList.toggle('active', tab === 'simple');
  document.getElementById('tabLtps').classList.toggle('active',  tab === 'ltps');

  /* Show / hide panels */
  document.getElementById('panelSimple').classList.toggle('show-panel', tab === 'simple');
  document.getElementById('panelLtps').classList.toggle('show-panel',   tab === 'ltps');

  hideResult();
}

/* ──────────────────────────────────
   5.  INPUT HELPERS
─────────────────────────────────── */
function resetAllInputs() {
  ['totalClasses','attendedClasses','lectureAtt','tutorialAtt','practicalAtt','skillingAtt']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  updateFormula();
}

/** Shake animation on invalid input */
function shakeField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetWidth;                       // reflow
  el.style.animation = 'shakeX 0.38s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

/* Inject shake keyframe once */
(function injectShake() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes shakeX {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-5px)}
      80%{transform:translateX(5px)}
    }`;
  document.head.appendChild(s);
})();

/* ──────────────────────────────────
   6.  LIVE FORMULA PREVIEW (LTPS)
─────────────────────────────────── */

/**
 * LTPS weight map — these are the official KL weightings
 * L=100, T=25, P=50, S=25
 */
const LTPS_WEIGHTS = {
  lectureAtt  : { label: 'L', weight: 100 },
  tutorialAtt : { label: 'T', weight: 25  },
  practicalAtt: { label: 'P', weight: 50  },
  skillingAtt : { label: 'S', weight: 25  }
};

/**
 * Reads all LTPS inputs, filters out empty ones,
 * and returns an array of { id, label, value, weight }.
 * Empty = treat as "not entered", DO NOT include.
 */
function getFilledLTPS() {
  const filled = [];
  Object.entries(LTPS_WEIGHTS).forEach(([id, meta]) => {
    const raw = document.getElementById(id)?.value?.trim();
    if (raw === '' || raw === null || raw === undefined) return;
    const val = parseFloat(raw);
    if (!isNaN(val)) filled.push({ id, label: meta.label, value: val, weight: meta.weight });
  });
  return filled;
}

/** Updates the live formula preview below the inputs */
function updateFormula() {
  const box      = document.getElementById('formulaBox');
  const textEl   = document.getElementById('formulaText');
  const filled   = getFilledLTPS();

  if (filled.length === 0) {
    textEl.className = 'formula-text placeholder';
    textEl.textContent = 'Fill in the fields above to preview the formula';
    box.classList.remove('has-formula');
    return;
  }

  /* Build numerator parts and denominator */
  const numParts = filled.map(f => `(${f.value} × ${f.weight})`);
  const denomStr = filled.map(f => f.weight).join(' + ');
  const numStr   = numParts.join(' + ');

  /* Compute result */
  const numerator   = filled.reduce((s, f) => s + f.value * f.weight, 0);
  const denominator = filled.reduce((s, f) => s + f.weight, 0);
  const result      = denominator > 0 ? (numerator / denominator).toFixed(2) : '0.00';

  textEl.className   = 'formula-text';
  textEl.innerHTML   =
    `(${numStr}) ÷ (${denomStr})<br>` +
    `= ${numerator.toFixed(2)} ÷ ${denominator}<br>` +
    `= <strong>${result}%</strong>`;
  box.classList.add('has-formula');
}

/* ──────────────────────────────────
   7.  CALCULATORS
─────────────────────────────────── */

/** Simple: (attended / total) × 100 */
function calculateSimple() {
  const total    = parseFloat(document.getElementById('totalClasses').value);
  const attended = parseFloat(document.getElementById('attendedClasses').value);

  /* Validation */
  if (isNaN(total) || isNaN(attended)) {
    showToast('⚠️ Please fill in both fields!');
    shakeField('totalClasses'); shakeField('attendedClasses');
    return;
  }
  if (total <= 0)      { showToast('⚠️ Total classes must be greater than 0!'); shakeField('totalClasses'); return; }
  if (attended < 0)    { showToast('⚠️ Attended classes cannot be negative!'); shakeField('attendedClasses'); return; }
  if (attended > total){ showToast('⚠️ Attended cannot exceed total classes!'); shakeField('attendedClasses'); return; }

  const pct = (attended / total) * 100;
  renderResult(pct, total, attended);
}

/**
 * LTPS Weighted Average
 *
 * Formula (only for filled fields):
 *   Weighted % = Σ(value_i × weight_i) / Σ(weight_i)
 *
 * Weights: L=100, T=25, P=50, S=25
 * Empty fields are completely IGNORED — not treated as 0.
 */
function calculateLTPS() {
  const filled = getFilledLTPS();

  /* Need at least one field */
  if (filled.length === 0) {
    showToast('⚠️ Please fill in at least one LTPS field!');
    return;
  }

  /* Validate ranges */
  for (const f of filled) {
    if (f.value < 0 || f.value > 100) {
      showToast(`⚠️ ${f.label}: Enter a value between 0 and 100`);
      shakeField(f.id);
      return;
    }
  }

  /* Weighted average calculation */
  const numerator   = filled.reduce((sum, f) => sum + f.value * f.weight, 0);
  const denominator = filled.reduce((sum, f) => sum + f.weight, 0);
  const pct         = numerator / denominator;

  /* For LTPS we don't have raw class counts → pass null */
  renderResult(pct, null, null);
}

/* ──────────────────────────────────
   8.  RESULT RENDERER
─────────────────────────────────── */

/**
 * Main result rendering function.
 * @param {number}      pct      – attendance percentage (0–100)
 * @param {number|null} total    – total classes (null for LTPS)
 * @param {number|null} attended – attended classes (null for LTPS)
 */
function renderResult(pct, total, attended) {
  const isSimple = (total !== null && attended !== null);

  /* Show result section */
  const sec = document.getElementById('resultSection');
  sec.classList.remove('hidden');

  /* Scroll to result */
  setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

  /* Animate ring */
  animateRing(pct);

  /* Branch by status */
  if      (pct >= 85) renderSafe(pct, total, attended, isSimple);
  else if (pct >= 75) renderCondonation(pct, total, attended, isSimple);
  else                renderDanger(pct, total, attended, isSimple);
}

/* ── Ring animation ── */
function animateRing(pct) {
  const CIRCUMFERENCE = 515.22;                // 2π × 82
  const ring = document.getElementById('ringProgress');
  const numEl= document.getElementById('ringNumber');

  /* Colour by status */
  const color = pct >= 85 ? getVar('--safe')
              : pct >= 75 ? getVar('--warn')
              :               getVar('--danger');

  ring.style.stroke  = color;
  ring.style.filter  = `drop-shadow(0 0 10px ${color})`;
  numEl.style.color  = color;

  /* Offset */
  const offset = CIRCUMFERENCE - (Math.min(pct, 100) / 100) * CIRCUMFERENCE;
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 80);

  /* Counter */
  const duration = 1500, start = performance.now();
  (function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    numEl.textContent = (eased * pct).toFixed(1) + '%';
    if (progress < 1) requestAnimationFrame(tick);
    else numEl.textContent = pct.toFixed(2) + '%';
  })(start);
}

function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ── Helpers: build hl span ── */
function hl(text, cls) { return `<span class="hl ${cls}">${text}</span>`; }

/* ── Status banners ── */
function setBanner(type) {
  const banner  = document.getElementById('statusBanner');
  const emoji   = document.getElementById('statusEmoji');
  const title   = document.getElementById('statusTitle');
  const desc    = document.getElementById('statusDesc');
  banner.className = `status-banner is-${type}`;

  const MAP = {
    safe  : { e:'✅', t:'SAFE — EXCELLENT!',         d:'Your attendance is excellent. You are completely safe.' },
    warn  : { e:'⚠️',  t:'CONDONATION ZONE',          d:'You are above 75% but below 85%. Condonation may be required.' },
    danger: { e:'❌', t:'NOT ELIGIBLE',               d:'Your attendance is critically low. Immediate action required!' }
  };

  emoji.textContent = MAP[type].e;
  title.textContent = MAP[type].t;
  desc.textContent  = MAP[type].d;
}

/* ── Render analysis cards ── */
function buildCards(cards) {
  const grid = document.getElementById('analysisGrid');
  grid.innerHTML = '';

  cards.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'acard';
    div.style.animationDelay = `${i * 0.08}s`;

    let barHTML = '';
    if (c.progress != null) {
      const pct = Math.min(Math.max(c.progress, 0), 100).toFixed(1);
      barHTML = `<div class="acard-bar">
        <div class="acard-bar-fill ${c.cls}" style="width:0" data-target="${pct}"></div>
      </div>`;
    }

    div.innerHTML = `
      <div class="acard-head">
        <span class="acard-ico">${c.icon}</span>
        <span class="acard-lbl">${c.title}</span>
      </div>
      <div class="acard-value ${c.cls}">${c.value}</div>
      <div class="acard-detail">${c.detail}</div>
      ${barHTML}`;

    grid.appendChild(div);
  });

  /* Animate bars after DOM paint */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    grid.querySelectorAll('.acard-bar-fill').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }));
}

/* ── Helpers: how many consecutive classes needed ── */
function neededFor(currentAttended, currentTotal, targetPct) {
  let a = currentAttended, t = currentTotal, count = 0;
  while ((a / t) * 100 < targetPct) { a++; t++; count++; if (count > 9999) break; }
  return { count, finalAttended: a, finalTotal: t };
}

/* ── SAFE (≥ 85%) ── */
function renderSafe(pct, total, attended, isSimple) {
  setBanner('safe');
  const cls = 'c-safe';
  const cards = [];

  cards.push({
    icon: '📊', title: 'Current Attendance',
    value: `${pct.toFixed(2)}%`, cls,
    detail: isSimple
      ? `You have attended ${hl(attended, cls)} out of ${hl(total, cls)} classes.`
      : `Your weighted LTPS average attendance is ${hl(pct.toFixed(2)+'%', cls)}.`,
    progress: pct
  });


  cards.push({
    icon: '⭐', title: 'Status',
    value: 'No Action Needed', cls,
    detail: 'Excellent work! Consistent attendance shows academic discipline. Keep it up!',
    progress: null
  });

  buildCards(cards);
  document.getElementById('dangerCard').classList.add('hidden');
  document.getElementById('condoCard').classList.add('hidden');
  showToast('✅ Great attendance! You are completely safe!');
}

/* ── CONDONATION (75 – 84.99%) ── */
function renderCondonation(pct, total, attended, isSimple) {
  setBanner('warn');
  const cls = 'c-warn';
  const cards = [];

  cards.push({
    icon: '📊', title: 'Current Attendance',
    value: `${pct.toFixed(2)}%`, cls,
    detail: isSimple
      ? `You have attended ${hl(attended, cls)} out of ${hl(total, cls)} classes.`
      : `Your weighted LTPS average is ${hl(pct.toFixed(2)+'%', cls)}.`,
    progress: pct
  });

  if (isSimple) {
    /* Can miss while staying ≥ 75% */
    const maxTotal75 = Math.floor(attended / 0.75);
    const canMiss75  = Math.max(0, maxTotal75 - total);

    
    /* Classes needed to reach 85% */
    const { count: n85, finalAttended: a85, finalTotal: t85 } = neededFor(attended, total, 85);
    cards.push({
      icon: '🎯', title: 'Classes Needed for 85%',
      value: `${n85} more class${n85!==1?'es':''}`,
      cls,
      detail: `You need to attend ${hl(n85+' consecutive class'+(n85!==1?'es':''), cls)} to reach 85%.<br>
        Current: ${hl(attended+'/'+total, cls)} → ${pct.toFixed(2)}%<br>
        After attending: ${hl(a85+'/'+t85, cls)} → ${((a85/t85)*100).toFixed(2)}%`,
      progress: null
    });
  }

  buildCards(cards);
  document.getElementById('dangerCard').classList.add('hidden');
  document.getElementById('condoCard').classList.remove('hidden');
  showToast('⚠️ Condonation zone — take action soon!');
}

/* ── DANGER (< 75%) ── */
function renderDanger(pct, total, attended, isSimple) {
  setBanner('danger');
  const cls = 'c-danger';
  const cards = [];

  cards.push({
    icon: '📊', title: 'Current Attendance',
    value: `${pct.toFixed(2)}% (Not Eligible)`, cls,
    detail: isSimple
      ? `You have attended ${hl(attended, cls)} out of ${hl(total, cls)} classes.`
      : `Your weighted LTPS average is ${hl(pct.toFixed(2)+'%', cls)}.`,
    progress: pct
  });

  cards.push({
    icon: '🚫', title: 'Classes You Can Miss',
    value: 'None — 0 Classes', cls,
    detail: `You ${hl('cannot miss any more classes', cls)} while maintaining 75% attendance. Attend every class immediately.`,
    progress: null
  });

  if (isSimple) {
    /* Classes needed for 75% */
    const { count: n75, finalAttended: a75, finalTotal: t75 } = neededFor(attended, total, 75);
    

    /* Classes needed for 85% */
    const { count: n85, finalAttended: a85, finalTotal: t85 } = neededFor(attended, total, 85);
    cards.push({
      icon: '🎯', title: 'Classes Needed for 85%',
      value: `${n85} more class${n85!==1?'es':''}`,
      cls,
      detail: `You need to attend ${hl(n85+' consecutive class'+(n85!==1?'es':''), cls)} to reach the safe 85% zone.<br>
        Current: ${hl(attended+'/'+total, cls)} → ${pct.toFixed(2)}%<br>
        After attending: ${hl(a85+'/'+t85, cls)} → ${((a85/t85)*100).toFixed(2)}%`,
      progress: null
    });

    /* Current fraction */
    cards.push({
      icon: '🔢', title: 'Current Attendance Fraction',
      value: `${attended} / ${total}`,
      cls,
      detail: `You have attended ${attended} out of ${total} classes — resulting in ${hl(pct.toFixed(2)+'%', cls)} attendance.`,
      progress: pct
    });
  }

  buildCards(cards);
  document.getElementById('dangerCard').classList.remove('hidden');
  document.getElementById('condoCard').classList.add('hidden');
  showToast('❌ Critical! Attendance is below 75%!');
}

/* ── Hide result ── */
function hideResult() {
  document.getElementById('resultSection').classList.add('hidden');
  document.getElementById('dangerCard').classList.add('hidden');
  document.getElementById('condoCard').classList.add('hidden');
  const grid = document.getElementById('analysisGrid');
  if (grid) grid.innerHTML = '';
}

/* ──────────────────────────────────
   9.  TOAST NOTIFICATION
─────────────────────────────────── */
let toastTimer = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ──────────────────────────────────
   10.  KEYBOARD SHORTCUTS
─────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const ltpsVisible = document.getElementById('panelLtps').classList.contains('show-panel');
  ltpsVisible ? calculateLTPS() : calculateSimple();
});

/* ──────────────────────────────────
   11.  BOOT
─────────────────────────────────── */
window.addEventListener('load', () => {
  initSelectorCanvas();  // start the selector screen particles
});
