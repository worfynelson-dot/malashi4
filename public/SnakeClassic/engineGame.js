// ============================================================
//  engineGame.js — Nokia Snake | XCV Sterwork
//  All game logic, audio, UI state, snake engine
// ============================================================
(function () {
  'use strict';

  // ============================================================
  //  AUDIO ENGINE  (Web Audio API)
  // ============================================================
  let _ac = null;
  function ac() {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    return _ac;
  }
  function beep(freq, dur, type, vol) {
    try {
      const c = ac(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type || 'square';
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.08, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.start(c.currentTime); o.stop(c.currentTime + dur);
    } catch (_) {}
  }
  const sfx = {
    click:   () => beep(1100, 0.04, 'square', 0.06),
    nav:     () => beep(750,  0.04, 'square', 0.07),
    select:  () => { beep(900,0.06,'square',.09); setTimeout(()=>beep(1300,.09,'square',.09),55); },
    eat:     () => { beep(520,.08,'square',.14); setTimeout(()=>beep(780,.1,'square',.14),75); },
    over:    () => { beep(360,.18,'sawtooth',.18); setTimeout(()=>beep(260,.18,'sawtooth',.18),190); setTimeout(()=>beep(160,.35,'sawtooth',.18),380); },
    unlock:  () => [700,900,1100,1500].forEach((f,i)=>setTimeout(()=>beep(f,.1,'square',.1),i*55)),
    startup: () => { beep(880,.1,'square',.08); setTimeout(()=>beep(1100,.08,'square',.08),110); setTimeout(()=>beep(1320,.15,'square',.08),200); },
    pause:   () => beep(600,.1,'triangle',.1),
    resume:  () => { beep(600,.06,'triangle',.1); setTimeout(()=>beep(900,.08,'triangle',.1),70); },
  };

  // ============================================================
  //  LEVELS
  // ============================================================
  const LEVELS = [
    { name:'BABY MODE',     speed:420 },
    { name:'SUPER EASY',    speed:310 },
    { name:'EASY',          speed:230 },
    { name:'SUPER NORMAL',  speed:185 },
    { name:'NORMAL',        speed:155 },
    { name:'BETWEEN V1',    speed:125 },
    { name:'BETWEEN V2',    speed:100 },
    { name:'SUPER HARD',    speed: 78 },
    { name:'HARD',          speed: 58 },
    { name:'HARDEST EVILS', speed: 36 },
  ];

  // ============================================================
  //  STATE
  // ============================================================
  let state      = 'startup';
  let menuIdx    = 0;
  let levelIdx   = 0;

  // Snake game variables
  const COLS = 20, ROWS = 12;
  let snake, food, dir, nextDir, score, gameTimer, paused;

  // ============================================================
  //  DOM REFS
  // ============================================================
  const $ = id => document.getElementById(id);
  const panels = {
    startup : $('panel-startup'),
    lock    : $('panel-lock'),
    menu    : $('panel-menu'),
    level   : $('panel-level'),
    game    : $('panel-game'),
    over    : $('panel-over'),
  };
  const canvas = $('gameCanvas');
  const ctx    = canvas.getContext('2d');

  // ============================================================
  //  SCREEN SWITCHING
  // ============================================================
  const skLabels = {
    startup : ['','',''],
    lock    : ['','',''],
    menu    : ['BACK','SEL','OK'],
    level   : ['BACK','','START'],
    game    : ['QUIT','PAUSE',''],
    over    : ['MENU','','RETRY'],
  };

  function show(name) {
    Object.values(panels).forEach(p => p.classList.remove('active'));
    panels[name].classList.add('active');
    state = name;
    const lb = skLabels[name] || ['','',''];
    $('sk-left').textContent  = lb[0];
    $('sk-mid').textContent   = lb[1];
    $('sk-right').textContent = lb[2];
    if (name === 'game') $('pause-overlay').classList.remove('show');
  }

  // ============================================================
  //  CLOCK & STATUS
  // ============================================================
  function updateClock() {
    const now  = new Date();
    const h    = String(now.getHours()).padStart(2,'0');
    const m    = String(now.getMinutes()).padStart(2,'0');
    $('lock-time').textContent = h + ':' + m;
    const days   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    $('lock-date').textContent =
      days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];
  }

  async function updateBattery() {
    try {
      if (!navigator.getBattery) throw new Error('no api');
      const b   = await navigator.getBattery();
      const set = (batt) => {
        const p = Math.round(batt.level * 100);
        $('batt-fill').style.width = p + '%';
        $('batt-pct').textContent  = p + '%';
      };
      set(b);
      b.addEventListener('levelchange', () => set(b));
    } catch(_) {
      // No battery API — show full
      $('batt-fill').style.width = '100%';
      $('batt-pct').textContent  = '100%';
    }
  }

  // ============================================================
  //  STARTUP SEQUENCE
  // ============================================================
  function runStartup() {
    show('startup');
    const logo = $('startup-logo');
    requestAnimationFrame(() => {
      setTimeout(() => {
        logo.classList.add('show');
        sfx.startup();
        setTimeout(() => {
          logo.classList.remove('show');
          setTimeout(() => show('lock'), 500);
        }, 1400);
      }, 200);
    });
  }

  // ============================================================
  //  SLIDE TO UNLOCK
  // ============================================================
  function initSlide() {
    const track = $('slide-track');
    const thumb = $('slide-thumb');
    let dragging = false, startX = 0, curX = 0, maxX = 0;

    function calcMax() { maxX = track.offsetWidth - thumb.offsetWidth - 4; }

    function onStart(e) {
      calcMax();
      dragging = true;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      startX = cx - curX;
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      curX = Math.max(0, Math.min(cx - startX, maxX));
      thumb.style.left = (2 + curX) + 'px';
      e.preventDefault();
    }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      calcMax();
      if (curX >= maxX * 0.78) {
        sfx.unlock();
        setTimeout(() => show('menu'), 280);
      } else {
        thumb.style.transition = 'left .25s';
        curX = 0; thumb.style.left = '2px';
        setTimeout(() => { thumb.style.transition = ''; }, 260);
      }
    }

    thumb.addEventListener('mousedown',  onStart);
    thumb.addEventListener('touchstart', onStart, { passive:false });
    document.addEventListener('mousemove',  onMove);
    document.addEventListener('touchmove',  onMove, { passive:false });
    document.addEventListener('mouseup',    onEnd);
    document.addEventListener('touchend',   onEnd);
  }

  // ============================================================
  //  MENU
  // ============================================================
  const MENU_COUNT = 4;
  function renderMenu() {
    for (let i = 0; i < MENU_COUNT; i++) {
      const el = $('mi-' + i);
      if (el) el.classList.toggle('sel', i === menuIdx);
    }
  }
  function menuNav(dir) {
    menuIdx = (menuIdx + dir + MENU_COUNT) % MENU_COUNT;
    sfx.nav(); renderMenu();
  }
  function menuActivate() {
    if (menuIdx === 0) { sfx.select(); buildLevelList(); show('level'); }
    // other slots are empty placeholders
  }

  // ============================================================
  //  LEVEL SELECT
  // ============================================================
  function buildLevelList() {
    const list = $('level-list');
    list.innerHTML = '';
    LEVELS.forEach((lvl, i) => {
      const d = document.createElement('div');
      d.className = 'lvl-row' + (i === levelIdx ? ' sel' : '');
      d.id = 'li-' + i;
      d.textContent = (i + 1) + '. ' + lvl.name;
      list.appendChild(d);
    });
  }
  function renderLevels() {
    LEVELS.forEach((_, i) => {
      const el = $('li-' + i);
      if (el) el.classList.toggle('sel', i === levelIdx);
    });
    const sel = $('li-' + levelIdx);
    if (sel) sel.scrollIntoView({ block:'nearest' });
  }
  function levelNav(dir) {
    levelIdx = (levelIdx + dir + LEVELS.length) % LEVELS.length;
    sfx.nav(); renderLevels();
  }

  // ============================================================
  //  HIGH SCORE
  // ============================================================
  function getHS(li) { return parseInt(localStorage.getItem('nk_hs_'+li)||'0'); }
  function setHS(li, v) { if (v > getHS(li)) localStorage.setItem('nk_hs_'+li, v); }

  // ============================================================
  //  SNAKE GAME
  // ============================================================
  function initCanvas() {
    const wrap  = $('game-canvas-wrap');
    const wW    = wrap.offsetWidth  || 190;
    const wH    = wrap.offsetHeight || 110;
    const cell  = Math.max(7, Math.min(Math.floor(wW/COLS), Math.floor(wH/ROWS)));
    canvas.width  = COLS * cell;
    canvas.height = ROWS * cell;
    return cell;
  }

  let cellSz = 8;

  function startGame() {
    show('game');
    cellSz = initCanvas();

    const mx = Math.floor(COLS/2), my = Math.floor(ROWS/2);
    snake = [{x:mx,y:my},{x:mx-1,y:my},{x:mx-2,y:my}];
    dir   = {x:1,y:0};
    nextDir = {x:1,y:0};
    score = 0;
    paused = false;

    spawnFood();
    hudUpdate();

    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(step, LEVELS[levelIdx].speed);
    draw();
  }

  function spawnFood() {
    let p;
    do { p = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) }; }
    while (snake.some(s => s.x===p.x && s.y===p.y));
    food = p;
  }

  function step() {
    if (paused) return;
    dir = { ...nextDir };

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      endGame(); return;
    }
    // Self collision
    if (snake.some(s => s.x===head.x && s.y===head.y)) {
      endGame(); return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      sfx.eat();
      spawnFood();
      hudUpdate();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    const c = cellSz;
    const W = canvas.width, H = canvas.height;
    const fg = '#1a3f0a', bg = '#8fac44', hl = '#a8c860';

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(15,45,8,.1)';
    ctx.lineWidth = .5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*c,0); ctx.lineTo(x*c,H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*c); ctx.lineTo(W,y*c); ctx.stroke(); }

    // Border
    ctx.strokeStyle = fg;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.75, 0.75, W-1.5, H-1.5);

    // Food — small blinking square (always drawn)
    const fp = 2;
    ctx.fillStyle = fg;
    ctx.fillRect(food.x*c+fp, food.y*c+fp, c-fp*2, c-fp*2);

    // Snake body
    snake.forEach((seg, i) => {
      if (i === 0) {
        // Head: brighter
        ctx.fillStyle = hl;
        ctx.fillRect(seg.x*c+1, seg.y*c+1, c-2, c-2);
        ctx.fillStyle = fg;
        ctx.fillRect(seg.x*c+2, seg.y*c+2, c-4, c-4);
      } else {
        ctx.fillStyle = fg;
        ctx.fillRect(seg.x*c+1, seg.y*c+1, c-2, c-2);
        // Inner lighter pixel
        ctx.fillStyle = hl;
        ctx.fillRect(seg.x*c+2, seg.y*c+2, 2, 2);
      }
    });
  }

  function hudUpdate() {
    $('game-hud').textContent = 'SCORE:' + score + '  |  BEST:' + Math.max(score, getHS(levelIdx));
  }

  function togglePause() {
    paused = !paused;
    const overlay = $('pause-overlay');
    if (paused) {
      overlay.classList.add('show');
      $('sk-mid').textContent = 'RESUME';
      sfx.pause();
    } else {
      overlay.classList.remove('show');
      $('sk-mid').textContent = 'PAUSE';
      sfx.resume();
    }
  }

  function endGame() {
    clearInterval(gameTimer); gameTimer = null;
    setHS(levelIdx, score);
    sfx.over();
    $('over-score').textContent = 'SCORE: ' + score;
    $('over-best').textContent  = 'BEST: '  + getHS(levelIdx);
    show('over');
  }

  // ============================================================
  //  KEY HANDLER
  // ============================================================
  function onKey(k) {
    switch(state) {
      case 'lock':
        // Handled by slide gesture; pressing any key does nothing (Nokia style)
        break;

      case 'menu':
        if (k==='up')              menuNav(-1);
        else if (k==='down')       menuNav(1);
        else if (k==='ok'||k==='rsoft') menuActivate();
        else if (k==='lsoft'||k==='end') { /* top level, nothing */ }
        break;

      case 'level':
        if (k==='up')              levelNav(-1);
        else if (k==='down')       levelNav(1);
        else if (k==='ok'||k==='rsoft') { sfx.select(); startGame(); }
        else if (k==='lsoft'||k==='end') { sfx.nav(); show('menu'); }
        break;

      case 'game':
        if (k==='up'    && dir.y!==1)  nextDir={x:0,y:-1};
        else if(k==='down'  && dir.y!==-1) nextDir={x:0,y:1};
        else if(k==='left'  && dir.x!==1)  nextDir={x:-1,y:0};
        else if(k==='right' && dir.x!==-1) nextDir={x:1,y:0};
        // 2/4/6/8 numpad also work
        else if(k==='2' && dir.y!==1)  nextDir={x:0,y:-1};
        else if(k==='8' && dir.y!==-1) nextDir={x:0,y:1};
        else if(k==='4' && dir.x!==1)  nextDir={x:-1,y:0};
        else if(k==='6' && dir.x!==-1) nextDir={x:1,y:0};
        else if(k==='ok') togglePause();
        else if(k==='lsoft'||k==='end') { clearInterval(gameTimer); gameTimer=null; sfx.nav(); show('menu'); }
        break;

      case 'over':
        if (k==='ok'||k==='rsoft')     { sfx.select(); startGame(); }
        else if(k==='lsoft'||k==='end') { sfx.nav(); show('menu'); }
        break;
    }
  }

  // ============================================================
  //  BUTTON & KEYBOARD LISTENERS
  // ============================================================
  function initButtons() {
    document.querySelectorAll('.key:not(.dpad-empty)').forEach(btn => {
      const k = btn.dataset.key;
      if (!k) return;

      function press(e) {
        e.preventDefault();
        sfx.click();
        btn.classList.add('pressed');
        onKey(k);
      }
      function release() { btn.classList.remove('pressed'); }

      btn.addEventListener('mousedown',  press);
      btn.addEventListener('touchstart', press, {passive:false});
      btn.addEventListener('mouseup',    release);
      btn.addEventListener('touchend',   release);
      btn.addEventListener('mouseleave', release);
    });
  }

  function initKeyboard() {
    const map = {
      ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
      w:'up', s:'down', a:'left', d:'right',
      W:'up', S:'down', A:'left', D:'right',
      Enter:'ok', ' ':'ok',
      Escape:'lsoft', Backspace:'lsoft',
      '2':'2','4':'4','6':'6','8':'8',
    };
    document.addEventListener('keydown', e => {
      const k = map[e.key];
      if (k) { e.preventDefault(); sfx.click(); onKey(k); }
    });
  }

  // ============================================================
  //  INIT
  // ============================================================
  function init() {
    updateClock();
    setInterval(updateClock, 1000);
    updateBattery();

    initSlide();
    initButtons();
    initKeyboard();

    renderMenu();
    runStartup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
