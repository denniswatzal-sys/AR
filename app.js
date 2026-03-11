/**
 * Dart AR Trainer - app.js
 * Kamera + Canvas Overlay, kein externes AR-Framework
 */

const App = (() => {

  const FIELDS = {
    random:  ['T20','T19','T18','T17','T16','T15','D20','D19','D18','D17','D16','D15','D10','D8','D5','D3','BULL'],
    treble:  ['T20','T19','T18','T17','T16','T15','T14','T13','T12','T11','T10'],
    double:  ['D20','D19','D18','D17','D16','D15','D10','D8','D5','D3','D2','D1'],
    cricket: ['20','19','18','17','16','15','BULL'],
  };

  const FIELD_COLORS = { T:'#ff4d00', D:'#00aaff', B:'#ff0055', S:'#ffbb00' };
  const MODES        = ['random','treble','double','cricket'];
  const MODE_LABELS  = { random:'Zufaellig', treble:'Triple', double:'Doppel', cricket:'Cricket' };

  let state = {
    currentTarget:'T20', hits:0, streak:0, total:0, modeIndex:0
  };

  let canvas, ctx, video, pulse = 0;

  function getEl(id) { return document.getElementById(id); }

  function getFieldType(t) {
    if(t==='BULL') return 'B';
    if(t.startsWith('T')) return 'T';
    if(t.startsWith('D')) return 'D';
    return 'S';
  }

  function getFieldColor(t) { return FIELD_COLORS[getFieldType(t)] || '#ffbb00'; }

  function pickTarget() {
    var pool = FIELDS[MODES[state.modeIndex]], next;
    do { next = pool[Math.floor(Math.random()*pool.length)]; }
    while(next === state.currentTarget && pool.length > 1);
    return next;
  }

  function updateScores() {
    var h=getEl('score-hits'), s=getEl('score-streak'), t=getEl('score-total');
    if(h) h.textContent = state.hits;
    if(s) s.textContent = state.streak;
    if(t) t.textContent = state.total;
  }

  function updateTargetDisplay() {
    var tf = getEl('target-field');
    var color = getFieldColor(state.currentTarget);
    if(tf) {
      tf.textContent = state.currentTarget;
      tf.style.color = color;
      tf.style.textShadow = '0 0 30px ' + color + '88';
    }
    var bm = getEl('btn-mode');
    if(bm) bm.textContent = 'Modus: ' + MODE_LABELS[MODES[state.modeIndex]];
  }

  // Canvas zeichnen: Video + Overlay
  function drawFrame() {
    if(!ctx || !canvas) return;

    var w = canvas.width, h = canvas.height;

    // Video als Hintergrund
    if(video && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
    }

    // Overlay in der Mitte zeichnen
    drawOverlay(w/2, h/2);

    pulse += 0.04;
    requestAnimationFrame(drawFrame);
  }

  function drawOverlay(cx, cy) {
    var color = getFieldColor(state.currentTarget);
    var r = Math.min(canvas.width, canvas.height) * 0.22 + Math.sin(pulse) * 8;

    // Aeusserer Ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.6 + Math.sin(pulse) * 0.3;
    ctx.stroke();

    // Mittlerer Ring
    ctx.beginPath();
    ctx.arc(cx, cy, r*0.6, 0, Math.PI*2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.stroke();

    // Bull
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fill();

    // Zielfeld-Text
    var fontSize = Math.min(canvas.width, canvas.height) * 0.1;
    ctx.font = 'bold ' + fontSize + 'px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 1;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillText(state.currentTarget, cx, cy - r - 10);
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 1;
  }

  async function start() {
    try {
      // Kamera starten
      var stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode:'environment' }
      });

      // Video-Element erstellen (unsichtbar - nur fuer Canvas)
      video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay  = true;
      video.playsInline = true;
      video.muted     = true;
      video.style.display = 'none';
      document.body.appendChild(video);

      // Canvas setup
      canvas = getEl('c');
      ctx    = canvas.getContext('2d');
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      window.addEventListener('resize', function() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      });

      // Startscreen ausblenden
      var ss = getEl('start-screen');
      if(ss) ss.style.display = 'none';

      // Status
      var st = getEl('status');
      if(st) { st.textContent = 'Kamera aktiv'; st.className = 'active'; }

      // Zeichnen starten
      video.onplay = function() { drawFrame(); };

      updateTargetDisplay();
      updateScores();

    } catch(err) {
      alert('Kamera Fehler: ' + err.name + '\n' + err.message);
    }
  }

  function nextTarget() {
    state.total++;
    state.currentTarget = pickTarget();
    var tf = getEl('target-field');
    if(tf) { tf.classList.remove('hit'); void tf.offsetWidth; }
    updateTargetDisplay();
    updateScores();
  }

  function registerHit() {
    state.hits++;
    state.streak++;
    var tf = getEl('target-field');
    if(tf) tf.classList.add('hit');
    updateScores();
    setTimeout(function() { nextTarget(); }, 700);
  }

  function toggleMode() {
    state.modeIndex = (state.modeIndex+1) % MODES.length;
    state.streak = 0;
    nextTarget();
  }

  return { start, nextTarget, registerHit, toggleMode };
})();
