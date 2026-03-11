/**
 * Dart AR Trainer - app.js
 * MindAR startet automatisch - wir steuern nur UI und Spiellogik
 */

const App = (() => {

  const FIELDS = {
    random:  ['T20','T19','T18','T17','T16','T15','D20','D19','D18','D17','D16','D15','D10','D8','D5','D3','BULL','20','19','18','17','16'],
    treble:  ['T20','T19','T18','T17','T16','T15','T14','T13','T12','T11','T10'],
    double:  ['D20','D19','D18','D17','D16','D15','D10','D8','D5','D3','D2','D1'],
    cricket: ['20','19','18','17','16','15','BULL'],
  };

  const FIELD_ANGLES = {
    20:0,1:18,18:36,4:54,13:72,6:90,10:108,15:126,2:144,17:162,
    3:180,19:198,7:216,16:234,8:252,11:270,14:288,9:306,12:324,5:342
  };

  const FIELD_COLORS = { T:'#ff4d00', D:'#00aaff', B:'#ff0055', S:'#ffbb00' };
  const MODES       = ['random','treble','double','cricket'];
  const MODE_LABELS = { random:'Zufaellig', treble:'Triple', double:'Doppel', cricket:'Cricket' };

  let state = {
    currentTarget:'T20', hits:0, streak:0, total:0,
    modeIndex:0, markerFound:false
  };

  function getEl(id) { return document.getElementById(id); }

  function getFieldType(t) {
    if (t==='BULL') return 'B';
    if (t.startsWith('T')) return 'T';
    if (t.startsWith('D')) return 'D';
    return 'S';
  }

  function getFieldColor(t) { return FIELD_COLORS[getFieldType(t)] || '#ffbb00'; }
  function getFieldAngle(t) { var n=parseInt(t.replace(/[TDB]/g,'')); return isNaN(n)?0:(FIELD_ANGLES[n]||0); }

  function pickTarget() {
    var pool=FIELDS[MODES[state.modeIndex]], next;
    do { next=pool[Math.floor(Math.random()*pool.length)]; }
    while (next===state.currentTarget && pool.length>1);
    return next;
  }

  function setStatus(text, cls) {
    var s=getEl('status');
    if(s){ s.textContent=text; s.className=cls||'searching'; }
  }

  function updateUI() {
    var target=state.currentTarget, color=getFieldColor(target), angle=getFieldAngle(target);
    var h=getEl('score-hits'), st=getEl('score-streak'), to=getEl('score-total');
    if(h)  h.textContent=state.hits;
    if(st) st.textContent=state.streak;
    if(to) to.textContent=state.total;
    var tf=getEl('target-field');
    if(tf){ tf.textContent=target; tf.style.color=color; tf.style.textShadow='0 0 30px '+color+'88'; }
    var arText=getEl('ar-target-text');
    if(arText) arText.setAttribute('value', target);
    var ro=getEl('ring-outer'), rm=getEl('ring-mid'), b=getEl('ar-bull');
    if(ro) ro.setAttribute('color',color);
    if(rm) rm.setAttribute('color',color);
    if(b)  b.setAttribute('color',color);
    var sec=getEl('sector-highlight');
    if(sec) sec.setAttribute('rotation','0 0 '+(-angle));
    var bm=getEl('btn-mode');
    if(bm) bm.textContent='Modus: '+MODE_LABELS[MODES[state.modeIndex]];
  }

  function nextTarget() {
    state.total++;
    state.currentTarget=pickTarget();
    var tf=getEl('target-field');
    if(tf){ tf.classList.remove('hit'); void tf.offsetWidth; }
    updateUI();
  }

  function registerHit() {
    state.hits++; state.streak++;
    var tf=getEl('target-field');
    if(tf) tf.classList.add('hit');
    setTimeout(function(){ nextTarget(); }, 700);
  }

  function toggleMode() {
    state.modeIndex=(state.modeIndex+1)%MODES.length;
    state.streak=0;
    nextTarget();
  }

  function resetStats() {
    state.hits=0; state.streak=0; state.total=0;
    updateUI();
  }

  // Marker-Events beim Laden registrieren
  document.addEventListener('DOMContentLoaded', function() {
    updateUI();

    var anchor = getEl('ar-anchor');
    if(anchor) {
      anchor.addEventListener('targetFound', function(){
        state.markerFound=true;
        setStatus('Scheibe erkannt','found');
      });
      anchor.addEventListener('targetLost', function(){
        state.markerFound=false;
        setStatus('Scheibe suchen...','searching');
      });
    }
  });

  return { nextTarget, registerHit, toggleMode, resetStats };
})();
