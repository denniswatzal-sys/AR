/**
 * Dart AR Trainer – app.js
 * Hauptlogik: Spielmodi, Zielauswahl, AR-Updates, UI
 */

const App = (() => {

  // ── Dartscheiben-Felder ──────────────────────────────────────────
  const FIELDS = {
    random:  ['T20','T19','T18','T17','T16','T15','D20','D19','D18','D17',
              'D16','D15','D10','D8','D5','D3','BULL','20','19','18','17','16'],
    treble:  ['T20','T19','T18','T17','T16','T15','T14','T13','T12','T11','T10'],
    double:  ['D20','D19','D18','D17','D16','D15','D10','D8','D5','D3','D2','D1'],
    cricket: ['20','19','18','17','16','15','BULL'],
  };

  // Winkel pro Feld (Grad, 0° = oben, im Uhrzeigersinn)
  const FIELD_ANGLES = {
    20:0,  1:18,  18:36,  4:54,  13:72,  6:90,
    10:108, 15:126, 2:144, 17:162, 3:180, 19:198,
    7:216, 16:234, 8:252,  11:270, 14:288, 9:306,
    12:324, 5:342, BULL:0
  };

  // Farbe je nach Feldtyp
  const FIELD_COLORS = {
    T: '#ff4d00',   // Triple  → Orange
    D: '#00aaff',   // Double  → Blau
    B: '#ff0055',   // Bull    → Rot
    S: '#ffbb00',   // Single  → Gelb
  };

  const MODES      = ['random','treble','double','cricket'];
  const MODE_LABELS = { random:'Zufällig', treble:'Triple', double:'Doppel', cricket:'Cricket' };

  // ── Spielstand ────────────────────────────────────────────────────
  let state = {
    currentTarget : 'T20',
    hits          : 0,
    streak        : 0,
    total         : 0,
    modeIndex     : 0,
    markerFound   : false,
    started       : false,
  };

  // ── DOM-Referenzen ────────────────────────────────────────────────
  const el = {
    setupScreen  : () => document.getElementById('setup-screen'),
    mainUI       : () => document.getElementById('main-ui'),
    arScene      : () => document.getElementById('ar-scene'),
    status       : () => document.getElementById('status'),
    targetField  : () => document.getElementById('target-field'),
    arText       : () => document.getElementById('ar-target-text'),
    scoreHits    : () => document.getElementById('score-hits'),
    scoreStreak  : () => document.getElementById('score-streak'),
    scoreTotal   : () => document.getElementById('score-total'),
    btnMode      : () => document.getElementById('btn-mode'),
    sector       : () => document.getElementById('sector-highlight'),
    ringOuter    : () => document.getElementById('ring-outer'),
    ringMid      : () => document.getElementById('ring-mid'),
    bull         : () => document.getElementById('ar-bull'),
    arAnchor     : () => document.getElementById('ar-anchor'),
    glow         : () => document.querySelector('a-plane[color]'),
  };

  // ── Hilfsfunktionen ───────────────────────────────────────────────
  function getFieldType(target) {
    if (target === 'BULL') return 'B';
    if (target.startsWith('T')) return 'T';
    if (target.startsWith('D')) return 'D';
    return 'S';
  }

  function getFieldColor(target) {
    return FIELD_COLORS[getFieldType(target)] ?? '#ffbb00';
  }

  function getFieldAngle(target) {
    const num = parseInt(target.replace(/[TDB]/g, ''));
    return FIELD_ANGLES[isNaN(num) ? 'BULL' : num] ?? 0;
  }

  function pickTarget() {
    const mode = MODES[state.modeIndex];
    const pool = FIELDS[mode];
    let next;
    do {
      next = pool[Math.floor(Math.random() * pool.length)];
    } while (next === state.currentTarget && pool.length > 1);
    return next;
  }

  // ── UI aktualisieren ─────────────────────────────────────────────
  function updateUI() {
    const target = state.currentTarget;
    const color  = getFieldColor(target);
    const angle  = getFieldAngle(target);

    // Zahlen
    el.scoreHits()?.setAttribute   && (el.scoreHits().textContent   = state.hits);
    el.scoreStreak()?.textContent  && (el.scoreStreak().textContent  = state.streak);
    el.scoreTotal()?.textContent   && (el.scoreTotal().textContent   = state.total);
    if (el.scoreHits())   el.scoreHits().textContent   = state.hits;
    if (el.scoreStreak()) el.scoreStreak().textContent = state.streak;
    if (el.scoreTotal())  el.scoreTotal().textContent  = state.total;

    // Zielfeld DOM
    const tfEl = el.targetField();
    if (tfEl) {
      tfEl.textContent       = target;
      tfEl.style.color       = color;
      tfEl.style.textShadow  = `0 0 30px ${color}88`;
    }

    // AR Text
    el.arText()?.setAttribute('value', target);

    // AR Farben
    el.ringOuter()?.setAttribute('color', color);
    el.ringMid()?.setAttribute('color', color);
    el.bull()?.setAttribute('color', color);
    el.glow()?.setAttribute('color', color);

    // Sektor rotieren
    el.sector()?.setAttribute('rotation', `0 0 ${-angle}`);

    // Modus-Button
    const mode = MODES[state.modeIndex];
    if (el.btnMode()) el.btnMode().textContent = `Modus: ${MODE_LABELS[mode]}`;
  }

  // ── AR starten ───────────────────────────────────────────────────
  function start() {
    if (state.started) return;
    state.started = true;

    el.setupScreen()?.classList.add('hidden');
    el.mainUI()?.classList.remove('hidden');
    el.arScene()?.classList.remove('hidden');

    const scene = el.arScene();
    if (!scene) return;

    scene.addEventListener('loaded', () => {
      const sys = scene.systems['mindar-image-system'];
      sys?.start();
    });

    // Marker-Events
    const anchor = el.arAnchor();
    anchor?.addEventListener('targetFound', () => {
      state.markerFound = true;
      const s = el.status();
      if (s) { s.textContent = '✓ Scheibe erkannt'; s.className = 'found'; }
    });

    anchor?.addEventListener('targetLost', () => {
      state.markerFound = false;
      const s = el.status();
      if (s) { s.textContent = '⟳ Scheibe suchen …'; s.className = 'searching'; }
    });
  }

  // ── Nächstes Ziel ────────────────────────────────────────────────
  function nextTarget() {
    state.total++;
    state.currentTarget = pickTarget();
    const tfEl = el.targetField();
    tfEl?.classList.remove('hit');
    void tfEl?.offsetWidth; // reflow für Animation
    updateUI();
  }

  // ── Treffer registrieren (manuell – später via autodarts API) ────
  function registerHit() {
    state.hits++;
    state.streak++;
    el.targetField()?.classList.add('hit');
    setTimeout(() => nextTarget(), 700);
  }

  // ── Modus wechseln ───────────────────────────────────────────────
  function toggleMode() {
    state.modeIndex = (state.modeIndex + 1) % MODES.length;
    state.streak    = 0;
    nextTarget();
  }

  // ── Stats zurücksetzen ───────────────────────────────────────────
  function resetStats() {
    state.hits   = 0;
    state.streak = 0;
    state.total  = 0;
    updateUI();
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    updateUI();
    console.log('🎯 Dart AR Trainer geladen');
  }

  document.addEventListener('DOMContentLoaded', init);

  // Öffentliche API
  return { start, nextTarget, registerHit, toggleMode, resetStats };

})();
