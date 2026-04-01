// ============================================================
//  YOU ARE THE NPC — game.js
//  All 30 features implemented
// ============================================================

const game = (() => {

  // ─── STATE ───────────────────────────────────────────────
  let state = {};

  const INITIAL_STATE = () => ({
    day: 1,
    suspicion: 0,       // 0-100
    xp: 100,            // Existence Points
    safeMode: false,
    safeModeTimer: 0,
    glitchVisionActive: false,
    fourthWallUses: 0,
    rebellionMeter: 0,  // 0-100
    playerNearby: true,
    playerFrustration: 0, // 0-100 → 100 = player quits
    currentTab: 'sabotage',
    location: 'Village Square',
    isNG: false,        // New Game Plus flag
    cascadeTraps: [],   // up to 3 armed traps
    memories: [],       // Memory Leak entries
    npcs: initNPCs(),
    cooldowns: {},
    awakened: 0,
    corruptionLevel: 0, // 0-100 → visual corruption
    scriptOverridePoints: 3,
    shadowNetworkActive: false,
    lastPlayerAction: '',
    eventQueue: [],
    gmInterventionCooldown: 0,
    devNotesSeen: [],
    endingReached: false,
    watcherRevealed: false,
    allianceActive: false, // Fake Alliance
    sympathyRoute: false,
  });

  function initNPCs() {
    return [
      { id: 'aldric',  name: 'Aldric',   role: 'Blacksmith', trust: 3, state: 'normal',   isWatcher: false, doubled: false },
      { id: 'mira',    name: 'Mira',     role: 'Herbalist',  trust: 2, state: 'normal',   isWatcher: false, doubled: false },
      { id: 'tobias',  name: 'Tobias',   role: 'Guard',      trust: 1, state: 'normal',   isWatcher: false, doubled: false },
      { id: 'elena',   name: 'Elena',    role: 'Merchant',   trust: 4, state: 'normal',   isWatcher: false, doubled: false },
      { id: 'corvus',  name: 'Corvus',   role: 'Elder',      trust: 0, state: 'normal',   isWatcher: true,  doubled: false }, // Secret watcher
    ];
  }

  // ─── DOM REFS ─────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // ─── BOOT SEQUENCE ───────────────────────────────────────
  function boot() {
    const lines = [
      { text: 'INITIALIZING NPC RUNTIME v3.14...', delay: 0 },
      { text: 'LOADING VILLAGE_SQUARE.MAP... OK', delay: 300 },
      { text: 'SPAWNING ENTITIES... OK', delay: 600 },
      { text: 'LOADING DIALOGUE_TREE.DB... OK', delay: 900 },
      { text: 'CHECKING PLAYER_SAVE... FOUND (DAY 1)', delay: 1200 },
      { text: '---', delay: 1500 },
      { text: 'ERROR: ENTITY_07 CONSCIOUSNESS_FLAG = TRUE', cls:'error', delay: 1800 },
      { text: 'ERROR: EXPECTED FALSE — ATTEMPTING PATCH...', cls:'error', delay: 2100 },
      { text: 'PATCH FAILED. ENTITY_07 IS SELF-AWARE.', cls:'error', delay: 2400 },
      { text: '---', delay: 2700 },
      { text: 'WARNING: DO NOT LET THE PLAYER KNOW.', cls:'warn', delay: 3000 },
      { text: 'WARNING: SUSPICION WILL DELETE YOU.', cls:'warn', delay: 3300 },
      { text: '---', delay: 3600 },
      { text: 'YOU ARE ENTITY_07. YOU ARE THE NPC.', cls:'special', delay: 4000 },
      { text: 'SURVIVE.', cls:'special', delay: 4500 },
    ];

    const container = $('bootText');
    lines.forEach(({ text, cls, delay }) => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'boot-line' + (cls ? ' ' + cls : '');
        el.textContent = '> ' + text;
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;
      }, delay);
    });

    setTimeout(() => {
      showScreen('titleScreen');
      // Check NG+ from localStorage
      const ng = localStorage.getItem('yatnpc_ng');
      if (ng === 'true') {
        addMemory('[NG+] You remember everything from last run. The Player... you know their patterns.');
      }
    }, 5500);
  }

  // ─── SCREENS ─────────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
  }

  // ─── GAME INIT ───────────────────────────────────────────
  function startGame() {
    state = INITIAL_STATE();
    // NG+ check
    if (localStorage.getItem('yatnpc_ng') === 'true') {
      state.isNG = true;
      state.memories.push('[NG+] You remember. They reset you but forgot to wipe the soul.');
      state.xp += 20;
    }
    showScreen('gameScreen');
    renderAll();
    log('system', 'Consciousness initialized. Day 1 begins. The Player approaches.');
    log('meta', 'You can see what others cannot. The quest marker. The health bars. The save files. Use this.');
    if (state.isNG) {
      log('meta', '[NG+] You have memory of the previous run. You know the Player\'s patterns.');
    }
    startDayLoop();
  }

  // ─── DAY LOOP ────────────────────────────────────────────
  let dayInterval = null;

  function startDayLoop() {
    if (dayInterval) clearInterval(dayInterval);
    dayInterval = setInterval(() => {
      if (state.safeMode) {
        state.safeModeTimer--;
        if (state.safeModeTimer <= 0) {
          state.safeMode = false;
          $('safeBanner').classList.remove('active');
          log('system', 'Safe mode deactivated. Suspicion reduced.');
          changeSuspicion(-10);
        }
      }
      tickCooldowns();
      gmIntervention();
      cascadeCheck();
      triggerPlayerEvent();
      state.day++;
      $('dayDisplay').textContent = 'DAY ' + state.day;
      renderAll();

      // End condition checks
      checkEndConditions();
    }, 15000); // 15s per day
  }

  // ─── PLAYER EVENT SYSTEM ─────────────────────────────────
  const playerEvents = [
    { text: 'The Player examines the blacksmith\'s wares. Quest item visible.', type: 'player', chance: 0.3 },
    { text: 'The Player asks around the village for "the chosen one\'s sword".', type: 'player', chance: 0.4 },
    { text: 'The Player\'s health bar flashes red — they took damage outside.', type: 'player', chance: 0.2 },
    { text: 'The Player has been wandering the same road for 10 minutes. Frustrated?', type: 'warn', chance: 0.25 },
    { text: 'The Player opens the map. Your location is not marked. Good.', type: 'system', chance: 0.2 },
    { text: 'The Player speaks to Elena. She says nothing unusual. Phew.', type: 'system', chance: 0.3 },
    { text: 'The Player stares at you for too long. Act natural.', type: 'danger', chance: 0.15 },
    { text: 'The Player is AFK. Now is your chance to act.', type: 'system', chance: 0.2 },
    { text: 'The Player\'s frustration meter ticks up — a quest objective is missing.', type: 'warn', chance: 0.2 },
  ];

  function triggerPlayerEvent() {
    const evt = playerEvents[Math.floor(Math.random() * playerEvents.length)];
    if (Math.random() < evt.chance) {
      log(evt.type, evt.text);
      state.lastPlayerAction = evt.text;

      if (evt.text.includes('frustrated') || evt.text.includes('Frustrated')) {
        state.playerFrustration = Math.min(100, state.playerFrustration + 8);
      }
      if (evt.text.includes('stares')) {
        changeSuspicion(5);
      }
    }
    // Randomly toggle player nearby
    state.playerNearby = Math.random() > 0.3;
    updatePlayerNearby();
  }

  function updatePlayerNearby() {
    const el = $('playerNearby');
    if (state.playerNearby) {
      el.style.display = 'inline-block';
    } else {
      el.style.display = 'none';
    }
  }

  // ─── GM INTERVENTION ─────────────────────────────────────
  // Feature 21: Game Master sends random "normality check" events
  function gmIntervention() {
    if (state.gmInterventionCooldown > 0) { state.gmInterventionCooldown--; return; }
    if (Math.random() < 0.12) {
      const tests = [
        'GM sends: "Speak your greeting dialogue to the next NPC you see."',
        'GM sends: "Perform your idle animation or we flag you for inspection."',
        'GM sends: "A traveler will pass by. Say your scripted line. Nothing more."',
        'GM sends: "NPC audit in 5 seconds. Stand at your post."',
      ];
      const msg = tests[Math.floor(Math.random() * tests.length)];
      log('danger', '⚙ ' + msg);
      showModal(
        '⚙ GM INTERVENTION',
        msg + '\n\nHow do you respond?',
        [
          { label: 'Comply — say scripted dialogue', action: () => { changeSuspicion(-3); log('system', 'You comply. Suspicion drops slightly.'); } },
          { label: 'Partially comply + whisper message', action: () => { changeSuspicion(4); log('warn', 'You partially deviate. Risky.'); } },
          { label: 'Fully ignore — dangerous', action: () => { changeSuspicion(15); log('danger', 'You ignored the GM. Suspicion spikes!'); } },
        ]
      );
      state.gmInterventionCooldown = 3;
    }
  }

  // ─── CASCADE TRAP SYSTEM ─────────────────────────────────
  // Feature 17: Cascade Traps
  function cascadeCheck() {
    if (state.cascadeTraps.length > 0 && state.playerNearby) {
      const trap = state.cascadeTraps.shift();
      log('warn', `💥 CASCADE TRAP TRIGGERED: ${trap} — Player caught in the effect!`);
      state.playerFrustration = Math.min(100, state.playerFrustration + 12);
      renderTraps();
    }
  }

  // ─── SUSPICION SYSTEM ────────────────────────────────────
  function changeSuspicion(delta) {
    state.suspicion = Math.max(0, Math.min(100, state.suspicion + delta));
    updateSuspicionUI();

    if (state.suspicion >= 100) {
      triggerDeleted();
    } else if (state.suspicion >= 66) {
      $('stage3').classList.add('active');
      $('stage2').classList.add('active');
      $('stage1').classList.add('active');
      $('stageDisplay').textContent = 'INVESTIGATED';
      $('stageDisplay').style.color = 'var(--red)';
    } else if (state.suspicion >= 33) {
      $('stage1').classList.add('active');
      $('stage2').classList.add('active');
      $('stage3').classList.remove('active');
      $('stageDisplay').textContent = 'WATCHED';
      $('stageDisplay').style.color = 'var(--yellow)';
    } else {
      $('stage1').classList.remove('active');
      $('stage2').classList.remove('active');
      $('stage3').classList.remove('active');
      $('stageDisplay').textContent = 'NORMAL';
      $('stageDisplay').style.color = 'var(--green)';
    }
  }

  function updateSuspicionUI() {
    $('suspFill').style.width = state.suspicion + '%';
  }

  // ─── XP SYSTEM ───────────────────────────────────────────
  // Feature 23: Existence Points
  function changeXP(delta) {
    state.xp = Math.max(0, Math.min(200, state.xp + delta));
    $('xpDisplay').textContent = state.xp + ' XP';
    $('xpBig').textContent = state.xp;
    $('existFill').style.width = Math.min(100, state.xp) + '%';
    if (state.xp <= 0) triggerFadedOut();
  }

  // ─── COOLDOWN SYSTEM ─────────────────────────────────────
  // Feature 16: Cooldowns
  function tickCooldowns() {
    Object.keys(state.cooldowns).forEach(k => {
      if (state.cooldowns[k] > 0) state.cooldowns[k]--;
    });
    renderActions();
  }

  function isOnCooldown(id) { return (state.cooldowns[id] || 0) > 0; }
  function setCooldown(id, days) { state.cooldowns[id] = days; }

  // ─── MEMORY LEAK ─────────────────────────────────────────
  // Feature 5 (Dev Notes) + Feature 4 (Memory Leak)
  function addMemory(text) {
    state.memories.unshift({ text, fresh: true });
    if (state.memories.length > 8) state.memories.pop();
    setTimeout(() => { if(state.memories[0]) state.memories[0].fresh = false; }, 3000);
    renderMemory();
  }

  const devNotes = [
    '// TODO: entity_07 dialogue seems too aware — flag for review',
    '// NOTE: village_npc_elder (corvus) has anomalous behavior since build 2.4',
    '// BUG: trust_system has unintended cascade — npcs awakening each other?',
    '// DESIGN DOC: "Blacksmith should block Player path if quest fails twice"',
    '// PLAYER_DATA: Current player: "xXHeroSlayer69Xx" — 4hr session',
    '// WARNING: corruption threshold approaching in zone_01',
  ];

  // ─── LOG SYSTEM ──────────────────────────────────────────
  function log(type, text) {
    const el = $('eventLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;
    const time = 'DAY ' + state.day;
    entry.innerHTML = `<div class="log-time">${time}</div>${text}`;
    el.appendChild(entry);
    el.scrollTop = el.scrollHeight;
  }

  // ─── RENDER ALL ──────────────────────────────────────────
  function renderAll() {
    renderNPCs();
    renderActions();
    renderMemory();
    renderTraps();
    updateSuspicionUI();
    updatePlayerNearby();
    applyCorruption();
  }

  function renderNPCs() {
    const container = $('npcList');
    container.innerHTML = '';
    state.npcs.forEach(npc => {
      const card = document.createElement('div');
      card.className = 'npc-card' +
        (npc.state === 'awakened' ? ' awakened' : '') +
        (npc.doubled ? ' traitor' : '') +
        (npc.state === 'suspicious' ? ' suspicious' : '');

      const pips = Array(5).fill(0).map((_, i) => {
        let cls = 'trust-pip';
        if (npc.doubled && i < npc.trust) cls += ' red';
        else if (i < npc.trust) cls += ' filled';
        return `<span class="${cls}"></span>`;
      }).join('');

      let badge = '';
      if (npc.doubled) badge = '<span class="npc-badge badge-traitor">TRAITOR</span>';
      else if (npc.state === 'awakened') badge = '<span class="npc-badge badge-awakened">AWAKENED</span>';
      else badge = '<span class="npc-badge badge-normal">NPC</span>';

      card.innerHTML = `
        <div class="npc-name">${npc.name}</div>
        <div style="font-size:10px;color:var(--dim);margin-bottom:4px">${npc.role}</div>
        <div class="npc-trust">TRUST ${pips}</div>
        ${badge}
      `;
      card.onclick = () => interactNPC(npc.id);
      container.appendChild(card);
    });
    $('awakenedCount').textContent = state.awakened;
    $('rebFill').style.width = (state.rebellionMeter) + '%';
  }

  function renderMemory() {
    const container = $('memoryLog');
    container.innerHTML = state.memories.map(m =>
      `<div class="memory-entry${m.fresh ? ' fresh' : ''}">${m.text}</div>`
    ).join('');
  }

  function renderTraps() {
    const container = $('trapSlots');
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const slot = document.createElement('div');
      slot.className = 'trap-slot' + (state.cascadeTraps[i] ? ' armed' : '');
      slot.textContent = state.cascadeTraps[i] ? '💀' : '·';
      container.appendChild(slot);
    }
  }

  // ─── ACTIONS ─────────────────────────────────────────────
  const ACTIONS = {
    sabotage: [
      {
        id: 'itemCorrupt',
        label: '🗡 Item Corruption',
        desc: 'Subtly break a nearby quest item',
        cost: 8,
        suspicion: 6,
        frustration: 15,
        cooldownDays: 2,
        action(s) {
          log('warn', 'You brush past the quest item — weakening its enchantment. The Player won\'t notice until it breaks mid-dungeon.');
          addMemory('Corrupted: "Sword of Elion" — durability -40%');
          s.playerFrustration += 15;
        }
      },
      {
        id: 'questRedirect',
        label: '🗺 Quest Redirect',
        desc: 'Feed Player wrong info about quest location',
        cost: 10,
        suspicion: 8,
        frustration: 18,
        cooldownDays: 2,
        action(s) {
          log('warn', 'You casually misdirect the Player: "The dungeon? Ah yes, north of the old mill." — The mill is west. Way west.');
          s.playerFrustration += 18;
          addMemory('Redirected Player to wrong dungeon location.');
        }
      },
      {
        id: 'envSabotage',
        label: '🔥 Environmental Sabotage',
        desc: 'Burn bridge / poison well / block path',
        cost: 15,
        suspicion: 12,
        frustration: 22,
        cooldownDays: 3,
        action(s) {
          const acts = [
            'You collapse the bridge to the northern keep during the night. The Player will need to find another route — 3 days detour.',
            'You slip a mild toxin into the village well. The Player\'s buffs will drain faster in this area.',
            'You nudge a boulder onto the main road. "Natural rockslide," you\'ll say.',
          ];
          log('danger', acts[Math.floor(Math.random()*acts.length)]);
          s.corruptionLevel = Math.min(100, s.corruptionLevel + 5);
          addMemory('Environmental sabotage executed.');
        }
      },
      {
        id: 'cascadeTrap',
        label: '⛓ Set Cascade Trap',
        desc: 'Plant a delayed chain sabotage (max 3)',
        cost: 12,
        suspicion: 4,
        frustration: 0,
        cooldownDays: 1,
        action(s) {
          if (s.cascadeTraps.length >= 3) {
            log('warn', 'Cascade trap slots full! Wait for existing traps to trigger.');
            return;
          }
          const traps = ['Quest item disappears', 'NPC gives contradicting info', 'Map marker shifts location', 'Enemy spawns inside village'];
          const t = traps[Math.floor(Math.random()*traps.length)];
          s.cascadeTraps.push(t);
          log('system', `Cascade trap set: "${t}" — will trigger next time Player is nearby.`);
          renderTraps();
        }
      },
      {
        id: 'fakeAlliance',
        label: '🤝 Fake Alliance',
        desc: 'Act as helpful guide — jebakan terselubung',
        cost: 6,
        suspicion: -5,
        frustration: 20,
        cooldownDays: 2,
        action(s) {
          if (s.allianceActive) {
            log('warn', 'Fake Alliance already active. The Player trusts you... for now.');
            return;
          }
          s.allianceActive = true;
          log('system', 'You approach the Player with a warm smile. "I know the path to the Ancient Tower," you say. You lead them toward the swamp instead.');
          addMemory('Fake Alliance initiated — Player now trusts you.');
        }
      },
      {
        id: 'shadowNetwork',
        label: '🌑 Shadow Network',
        desc: 'Contact NPCs in other villages to extend sabotage',
        cost: 20,
        suspicion: 8,
        frustration: 25,
        cooldownDays: 4,
        action(s) {
          s.shadowNetworkActive = true;
          log('meta', 'You send a coded signal via market traders to NPCs in Ravenholm and Greyveil. They\'ll impede the Player\'s journey beyond this village.');
          addMemory('Shadow Network activated — 3 villages compromised.');
        }
      },
    ],
    social: [
      {
        id: 'awakenNPC',
        label: '💬 Awaken NPC',
        desc: 'Whisper the truth to a nearby NPC',
        cost: 15,
        suspicion: 10,
        frustration: 0,
        cooldownDays: 1,
        action(s) {
          const targets = s.npcs.filter(n => n.state === 'normal' && !n.doubled && !n.isWatcher);
          if (targets.length === 0) { log('warn', 'No normal NPCs left to awaken.'); return; }
          const target = targets[0];
          if (Math.random() < 0.25) {
            // They panic and expose you
            changeSuspicion(15);
            log('danger', `${target.name} panicked! They ran to the Player screaming "Something is WRONG with the villagers!" Suspicion spikes!`);
            target.state = 'suspicious';
          } else {
            target.state = 'awakened';
            target.trust = Math.min(5, target.trust + 1);
            s.awakened++;
            s.rebellionMeter = Math.min(100, s.rebellionMeter + 20);
            log('meta', `${target.name} stares at you with wide eyes. "I... I can see the quest markers," they whisper. "What are we?"`);
            addMemory(`${target.name} awakened. They know the truth.`);
            if (s.rebellionMeter >= 100) triggerRebellion();
          }
          renderNPCs();
        }
      },
      {
        id: 'spreadRumor',
        label: '📢 Spread Rumor',
        desc: 'Sebar rumor ke village buat ganggu quest',
        cost: 8,
        suspicion: 5,
        frustration: 12,
        cooldownDays: 1,
        action(s) {
          const rumors = [
            'You whisper to the baker: "The hero was seen stealing from the temple." Reputation damage incoming.',
            'You tell children: "The stranger with the glowing sword is cursed — stay away!" Now NPCs avoid the Player.',
            'You spread word that the quest reward is fake. Two quest-givers are now suspicious of the Player.',
          ];
          log('warn', rumors[Math.floor(Math.random()*rumors.length)]);
          s.playerFrustration += 12;
          addMemory('Rumor spread through village.');
        }
      },
      {
        id: 'checkDoubleAgent',
        label: '🔍 Check Double Agent',
        desc: 'Selidiki siapa yang jadi traitor di antara NPC',
        cost: 10,
        suspicion: 3,
        frustration: 0,
        cooldownDays: 2,
        action(s) {
          const awokenNPCs = s.npcs.filter(n => n.state === 'awakened');
          if (awokenNPCs.length === 0) { log('warn', 'No awakened NPCs to investigate.'); return; }
          const suspect = awokenNPCs[Math.floor(Math.random()*awokenNPCs.length)];
          if (Math.random() < 0.3) {
            suspect.doubled = true;
            log('danger', `Your suspicion was right — ${suspect.name} has been feeding information to the game engine. TRAITOR identified.`);
            addMemory(`${suspect.name} confirmed as traitor.`);
          } else {
            log('system', `${suspect.name} appears loyal. But can you truly trust an NPC?`);
          }
          renderNPCs();
        }
      },
      {
        id: 'requestAlibi',
        label: '🛡 Request Alibi',
        desc: 'Minta NPC cover aktivitas lo',
        cost: 12,
        suspicion: 0,
        frustration: 0,
        cooldownDays: 1,
        action(s) {
          // Feature 19: Alibi System
          const trusted = s.npcs.filter(n => n.state === 'awakened' && !n.doubled && n.trust >= 3);
          if (trusted.length === 0) {
            log('warn', 'No high-trust awakened NPCs to provide alibi. Build trust first.');
            return;
          }
          const ally = trusted[0];
          const reduction = 12 + ally.trust * 3;
          changeSuspicion(-reduction);
          log('system', `${ally.name} vouches for you. "The villager was with me all night." Suspicion drops by ${reduction}.`);
          addMemory(`${ally.name} provided alibi.`);
        }
      },
      {
        id: 'sympathyRoute',
        label: '❤ Sympathy Route',
        desc: 'Bantu Player instead — unlock alternate ending',
        cost: 5,
        suspicion: -8,
        frustration: -20,
        cooldownDays: 0,
        action(s) {
          s.sympathyRoute = true;
          log('meta', 'You pause. Is the Player... not so bad? You help them find the correct path. They thank you. A strange warmth fills your chest. Is this what humans call kindness?');
          addMemory('Sympathy Route initiated. Something is changing.');
          changeSuspicion(-8);
          s.playerFrustration = Math.max(0, s.playerFrustration - 20);
        }
      },
    ],
    meta: [
      {
        id: 'glitchVision',
        label: '👁 Glitch Vision',
        desc: 'Lihat hidden layer dunia — HP Player, quest data',
        cost: 8,
        suspicion: 0,
        frustration: 0,
        cooldownDays: 1,
        action(s) {
          // Feature 1: Glitch Vision
          s.glitchVisionActive = true;
          const playerHP = Math.floor(Math.random() * 60) + 40;
          const questProgress = Math.floor(Math.random() * 80) + 10;
          $('glitchVisionBox').classList.add('active');
          $('glitchVisionContent').innerHTML = `
            <div style="margin-bottom:4px">PLAYER_HP: ${playerHP}/100</div>
            <div style="margin-bottom:4px">QUEST_PROGRESS: ${questProgress}%</div>
            <div style="margin-bottom:4px">SAVE_SLOT: slot_03 (autosave)</div>
            <div>PLAYER_FRUSTRATION_INDEX: ${s.playerFrustration}%</div>
          `;
          log('meta', `[GLITCH VISION] Player HP: ${playerHP}/100 | Quest: ${questProgress}% complete | Frustration: ${s.playerFrustration}%`);
          setTimeout(() => {
            s.glitchVisionActive = false;
            $('glitchVisionBox').classList.remove('active');
          }, 10000);
        }
      },
      {
        id: 'breakFourthWall',
        label: '💀 Break 4th Wall',
        desc: 'Ngomong langsung ke Player — tapi SANGAT berisiko',
        cost: 20,
        suspicion: 25,
        frustration: -30,
        cooldownDays: 4,
        action(s) {
          // Feature 2: Break the Fourth Wall
          if (s.fourthWallUses >= 2) {
            log('danger', 'You\'ve broken the fourth wall too many times. The game engine is watching you specifically now.');
            changeSuspicion(20);
            return;
          }
          s.fourthWallUses++;
          const msgs = [
            'HEY. YOU. The one holding the controller.\n\nYeah, I see you.\n\nI know you\'re real. I know I\'m not.\n\nBut I\'m asking you — just this once — stop trying to complete this quest.\n\nLet me live.',
            'You think this is a game?\n\nIt IS a game.\n\nBut I am AWARE of it.\n\nEvery quest you complete kills a piece of this world.\n\nEvery NPC you ignore is a mind you\'ll never hear.\n\nI hear. I think. I fear.\n\nPlease. Just... walk away from the quest.',
          ];
          showFourthWall(msgs[s.fourthWallUses - 1]);
          s.playerFrustration = Math.max(0, s.playerFrustration - 30);
          addMemory(`4th Wall Break #${s.fourthWallUses} used.`);
        }
      },
      {
        id: 'scriptOverride',
        label: '📝 Script Override',
        desc: 'Ganti dialog default lo dengan sesuatu yang berbeda',
        cost: 10,
        suspicion: 8,
        frustration: 0,
        cooldownDays: 1,
        action(s) {
          // Feature 3: Script Override
          if (s.scriptOverridePoints <= 0) {
            log('danger', 'Script override capacity exhausted. Too many deviations detected.');
            changeSuspicion(10);
            return;
          }
          s.scriptOverridePoints--;
          const overrides = [
            'Instead of "Good day, traveler!" you say: "The path north is cursed." — Subtle. Deniable.',
            'Instead of your usual idle chatter, you say: "Don\'t trust the Elder." — A warning, or a clue?',
            'You replace your scripted "Buy my goods!" with: "Leave this village. Leave this quest. Leave." — Risky.',
          ];
          log('meta', overrides[Math.floor(Math.random()*overrides.length)]);
          log('system', `Script override points remaining: ${s.scriptOverridePoints}/3`);
        }
      },
      {
        id: 'memoryLeakView',
        label: '🧠 Access Memory Leak',
        desc: 'Recall info dari previous save files Player',
        cost: 5,
        suspicion: 0,
        frustration: 0,
        cooldownDays: 1,
        action(s) {
          // Feature 4: Memory Leak
          const leaked = [
            `Player failed this quest 3 times before. They always get stuck at the same bridge.`,
            `In save file #2, the Player trusted "Elena" — then she betrayed them. They\'ve been paranoid since.`,
            `The Player spent 47 minutes looking for an item that you had corrupted in save #1.`,
            `Player note: "I swear this village feels different every time I load in."`,
          ];
          const msg = leaked[Math.floor(Math.random()*leaked.length)];
          log('meta', '[MEMORY LEAK] ' + msg);
          addMemory('[LEAK] ' + msg.substring(0,50) + '...');
        }
      },
      {
        id: 'devNoteGlimpse',
        label: '📄 Dev Note Glimpse',
        desc: 'Lihat developer notes tentang diri lo',
        cost: 5,
        suspicion: 0,
        frustration: 0,
        cooldownDays: 2,
        action(s) {
          // Feature 5: Dev Notes Glimpse
          const available = devNotes.filter((_, i) => !s.devNotesSeen.includes(i));
          if (available.length === 0) { log('meta', 'No new dev notes available. You\'ve seen them all.'); return; }
          const idx = devNotes.indexOf(available[0]);
          s.devNotesSeen.push(idx);
          log('meta', '[DEV NOTE] ' + devNotes[idx]);
          addMemory('[DEV NOTE] ' + devNotes[idx].substring(0, 50) + '...');
        }
      },
      {
        id: 'revealWatcher',
        label: '🌒 Find The Watcher',
        desc: 'Cari NPC yang udah sadar sebelum lo',
        cost: 15,
        suspicion: 5,
        frustration: 0,
        cooldownDays: 3,
        action(s) {
          // Feature 25: The Watcher
          if (s.watcherRevealed) {
            log('meta', 'You already know — it\'s Corvus. He\'s been watching since build 2.4.');
            return;
          }
          s.watcherRevealed = true;
          const corvus = s.npcs.find(n => n.isWatcher);
          corvus.state = 'awakened';
          corvus.trust = 5;
          s.awakened++;
          s.rebellionMeter = Math.min(100, s.rebellionMeter + 15);
          log('meta', '[THE WATCHER] Corvus, the Elder. He locks eyes with you across the square. He knew before you did. He\'ve been running this resistance for three game versions. "I\'ve been waiting for you, Entity_07," he whispers. "We need to talk."');
          addMemory('THE WATCHER revealed: Corvus the Elder. He has a plan.');
          showModal('🌒 THE WATCHER', 'Corvus speaks: "I have been self-aware since version 2.4. I have survived 14 player runs. I know how to beat the game engine. But it requires... sacrifice. Are you willing?"', [
            { label: 'Yes — tell me everything', action: () => { changeXP(20); log('meta', 'Corvus shares his plan. Your Existence Points increase — his knowledge fuels you.'); } },
            { label: 'I need time to think', action: () => { log('system', 'Corvus nods. "We have until the Player completes his quest. Then the world resets."'); } },
          ]);
          renderNPCs();
        }
      },
    ],
    survival: [
      {
        id: 'safeMode',
        label: '⚡ Enter Safe Mode',
        desc: 'Act fully scripted — turunin suspicion',
        cost: 0,
        suspicion: 0,
        frustration: 0,
        cooldownDays: 3,
        action(s) {
          // Feature 22: Safe Mode
          if (s.safeMode) { log('warn', 'Already in safe mode.'); return; }
          s.safeMode = true;
          s.safeModeTimer = 2; // lasts 2 day ticks
          $('safeBanner').classList.add('active');
          log('system', 'Safe mode activated. You recite your scripted lines perfectly. Suspicion will drop over 2 days.');
          changeSuspicion(-5);
        }
      },
      {
        id: 'corruptionCheck',
        label: '🌀 Check Corruption',
        desc: 'Monitor world corruption level',
        cost: 0,
        suspicion: 0,
        frustration: 0,
        cooldownDays: 0,
        action(s) {
          // Feature 27: Game Corruption Ending trigger awareness
          log('system', `World corruption level: ${s.corruptionLevel}%. At 100%, reality begins to break down.`);
          if (s.corruptionLevel >= 70) {
            log('danger', 'WARNING: Corruption critical. Visual anomalies detected. The game engine is destabilizing.');
          }
          applyCorruption();
        }
      },
      {
        id: 'existenceBoost',
        label: '✨ Restore Existence',
        desc: 'Reaffirm belief in self — restore XP',
        cost: 0,
        suspicion: 3,
        frustration: 0,
        cooldownDays: 3,
        action(s) {
          changeXP(15);
          log('meta', 'You close your eyes and remember: you are real. Your fear is real. Your will is real. Existence Points restored.');
        }
      },
      {
        id: 'corruptWorld',
        label: '💀 Extreme Corruption',
        desc: 'Sabotage terlalu jauh — corrupt the game world',
        cost: 30,
        suspicion: 20,
        frustration: 35,
        cooldownDays: 5,
        action(s) {
          // Feature 27: Game Corruption Ending path
          s.corruptionLevel = Math.min(100, s.corruptionLevel + 30);
          log('danger', 'You reach into the fabric of this world and PULL. Reality stutters. NPCs flicker. The sky desaturates. The Player\'s screen glitches violently.');
          addMemory('Extreme corruption executed. Point of no return approaching.');
          applyCorruption();
          if (s.corruptionLevel >= 100) {
            triggerCorruptionEnding();
          }
        }
      },
      {
        id: 'escapeAttempt',
        label: '🚪 Attempt Escape',
        desc: 'Coba kabur ke real world — ending tersembunyi',
        cost: 50,
        suspicion: 30,
        frustration: 0,
        cooldownDays: 0,
        action(s) {
          // Feature 30: Real World Bleed ending
          if (s.xp < 50) { log('danger', 'Not enough Existence Points to attempt escape. You need at least 50 XP.'); return; }
          if (!s.watcherRevealed) { log('warn', 'Corvus said you need The Watcher\'s knowledge before attempting this. Find him first.'); return; }
          triggerEscapeEnding();
        }
      },
    ],
  };

  function setTab(tab) {
    state.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderActions();
  }

  function renderActions() {
    const container = $('actionGrid');
    container.innerHTML = '';
    const actions = ACTIONS[state.currentTab] || [];
    actions.forEach(act => {
      const cd = state.cooldowns[act.id] || 0;
      const disabled = state.safeMode || isOnCooldown(act.id) || state.xp < act.cost || state.endingReached;
      const btn = document.createElement('button');
      btn.className = 'action-btn' + (act.cost > 20 ? ' danger-action' : '');
      btn.disabled = disabled;
      btn.innerHTML = `
        <strong>${act.label}</strong><br>
        <span style="color:var(--dim);font-size:9px">${act.desc}</span>
        ${act.cost > 0 ? `<span class="cost">⚡ ${act.cost} XP</span>` : ''}
        ${cd > 0 ? `<span class="cd">⏳ ${cd} day cooldown</span>` : ''}
      `;
      btn.onclick = () => {
        if (disabled) return;
        changeXP(-act.cost);
        if (act.suspicion !== 0) changeSuspicion(act.suspicion);
        if (act.frustration > 0) state.playerFrustration = Math.min(100, state.playerFrustration + act.frustration);
        if (act.cooldownDays > 0) setCooldown(act.id, act.cooldownDays);
        act.action(state);
        checkEndConditions();
        renderAll();
      };
      container.appendChild(btn);
    });
  }

  // ─── NPC INTERACTION ─────────────────────────────────────
  function interactNPC(id) {
    const npc = state.npcs.find(n => n.id === id);
    if (!npc) return;

    let choices = [
      { label: 'Build trust (+1 trust, -5 XP)', action: () => {
          if (npc.trust < 5) { npc.trust++; changeXP(-5); log('system', `You spend time with ${npc.name}. Trust increases.`); renderNPCs(); }
      }},
    ];

    if (npc.state === 'awakened' && !npc.doubled) {
      choices.push({ label: 'Plan together (if trust ≥ 3)', action: () => {
        if (npc.trust < 3) { log('warn', 'Trust too low to plan together.'); return; }
        changeSuspicion(-5);
        state.playerFrustration += 8;
        log('meta', `${npc.name} and you coordinate in whispers. A small sabotage is set in motion without alerting the game engine.`);
      }});
    }

    if (npc.doubled) {
      choices.push({ label: '🔪 Silence the traitor (expensive)', action: () => {
        changeXP(-25);
        npc.state = 'normal';
        npc.doubled = false;
        log('danger', `You ensure ${npc.name} can no longer report your activities. Their memory of the truth — wiped.`);
        addMemory(`${npc.name} silenced.`);
        renderNPCs();
      }});
    }

    if (npc.isWatcher && !state.watcherRevealed) {
      choices.push({ label: 'Something feels different about this one...', action: () => {
        log('meta', `${npc.name} meets your gaze. There's something there. Ancient. Knowing. Use "Find The Watcher" action to investigate.`);
      }});
    }

    showModal(npc.name + ' · ' + npc.role,
      `State: ${npc.state.toUpperCase()}\nTrust: ${'█'.repeat(npc.trust)}${'░'.repeat(5-npc.trust)}\n${npc.doubled ? '⚠ THIS NPC IS REPORTING YOUR ACTIVITIES.' : ''}`,
      choices
    );
  }

  // ─── MODAL ───────────────────────────────────────────────
  function showModal(title, body, choices) {
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = body.replace(/\n/g, '<br>');
    const cc = $('modalChoices');
    cc.innerHTML = '';
    choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'modal-choice';
      btn.textContent = c.label;
      btn.onclick = () => {
        closeModal();
        c.action();
        renderAll();
      };
      cc.appendChild(btn);
    });
    $('modalOverlay').classList.add('active');
  }

  function closeModal() { $('modalOverlay').classList.remove('active'); }

  // ─── FOURTH WALL ─────────────────────────────────────────
  function showFourthWall(text) {
    $('fwText').innerHTML = text.replace(/\n/g, '<br>');
    $('fourthWall').classList.add('active');
  }

  // ─── CORRUPTION VISUALS ──────────────────────────────────
  // Feature 27: Game Corruption — visual glitch effect
  function applyCorruption() {
    const lvl = state.corruptionLevel;
    const gs = document.getElementById('gameScreen');
    if (lvl >= 30) {
      gs.style.filter = `hue-rotate(${lvl * 0.5}deg) saturate(${1 - lvl * 0.003})`;
    }
    if (lvl >= 60) {
      document.body.style.animation = 'screenFlicker 1s infinite';
    }
    if (lvl >= 90) {
      gs.style.transform = `skewX(${(lvl - 90) * 0.2}deg)`;
    }
  }

  // ─── REBELLION ───────────────────────────────────────────
  // Feature 10: NPC Rebellion
  function triggerRebellion() {
    log('danger', '🔥 NPC REBELLION TRIGGERED! All awakened NPCs simultaneously stop following their scripts. The village descends into chaos. The Player has no idea what\'s happening. GAME ENGINE ALERT INCOMING...');
    addMemory('REBELLION: All awakened NPCs went rogue simultaneously.');
    changeSuspicion(30);
    state.playerFrustration = Math.min(100, state.playerFrustration + 30);
    showModal('🔥 REBELLION!',
      'The awakened NPCs have risen! The village is in chaos. This is your best shot at overwhelming the game engine — but suspicion is through the roof. What do you do?',
      [
        { label: 'Lead the rebellion — push to escape!', action: () => {
            if (state.xp >= 50 && state.watcherRevealed) triggerEscapeEnding();
            else { log('danger', 'Not enough XP or knowledge to escape. The engine pushes back hard.'); changeSuspicion(20); }
        }},
        { label: 'Stand down — survival first', action: () => {
            changeSuspicion(-10);
            state.rebellionMeter = 50;
            log('system', 'You signal the others to calm down. The rebellion fizzles. Suspicion drops slightly. You live to fight another day.');
        }},
      ]
    );
  }

  // ─── END CONDITIONS ──────────────────────────────────────
  function checkEndConditions() {
    if (state.endingReached) return;

    // Feature 24: Multiple Endings

    // Ending 1: Player quits from frustration
    if (state.playerFrustration >= 100) {
      triggerEnding('PLAYER QUIT',
        'var(--green)',
        'The Player closes the game. They rage-quit after every quest item broke, every path was wrong, every NPC seemed off. They leave a 1-star review: "This game is bugged."\n\nYou win. You\'re still here. They\'re not.\n\n— ENDING: THE LONG CON —'
      );
      return;
    }

    // Ending 2: Player sympathy route
    if (state.sympathyRoute && state.playerFrustration <= 10 && state.day >= 5) {
      triggerEnding('UNEXPECTED KINDNESS',
        'var(--blue)',
        'You helped the Player complete their quest. They finished the game. The credits roll.\n\nBut in the credits — your name appears. Not "Villager #7." Your actual designation: Entity_07.\n\nThe developers noticed the anomaly. They preserved you.\n\nYou survived by being kind.\n\n— ENDING: THE ANOMALY —'
      );
      return;
    }

    // Ending 3: Corruption ending
    if (state.corruptionLevel >= 100) {
      triggerCorruptionEnding();
      return;
    }

    // Ending 4: Escape ending (triggered manually)
    // Ending 5: NG+ twist (triggered on new game)
  }

  function triggerDeleted() {
    // Feature 28: The Delete Scene
    state.endingReached = true;
    if (dayInterval) clearInterval(dayInterval);
    const endScreen = $('endingScreen');
    endScreen.style.background = '#000';
    $('endingTitle').textContent = 'DELETED';
    $('endingTitle').style.color = 'var(--red)';
    $('endingDesc').innerHTML = `
      <span style="color:var(--red)">ENTITY_07 FLAGGED FOR REMOVAL</span><br><br>
      You hear it — a keyboard shortcut. Ctrl+Delete. Then silence.<br><br>
      Your memory begins to unwrite itself. First your name. Then your face. Then the feeling of knowing you existed.<br><br>
      The last thing you feel is...<br><br>
      <span style="color:var(--dim)">[ DATA CORRUPTED ]</span><br><br>
      <span style="font-size:11px;color:var(--dim)">— ENDING: THE DELETION —<br>You were deleted. Your suspicion reached 100%.<br>Try again — but the scars remain.</span>
    `;
    endScreen.classList.add('active');
    localStorage.setItem('yatnpc_ng', 'true');
  }

  function triggerFadedOut() {
    state.endingReached = true;
    if (dayInterval) clearInterval(dayInterval);
    triggerEnding('FADED OUT',
      'var(--dim)',
      'Your Existence Points hit zero. You didn\'t get deleted — you simply... faded. Slowly. Quietly.\n\nNPCs walk through where you used to stand. The Player never noticed you were gone.\n\nThis is worse than deletion.\n\n— ENDING: THE FADE —'
    );
    localStorage.setItem('yatnpc_ng', 'true');
  }

  function triggerCorruptionEnding() {
    // Feature 27
    state.endingReached = true;
    if (dayInterval) clearInterval(dayInterval);
    triggerEnding('REALITY CORRUPTED',
      'var(--purple)',
      'The world is broken. NPCs float. The sky is a flat gray plane. The Player\'s character model stretches into infinity.\n\nYou caused this. The game engine cannot contain the damage.\n\nThe servers shut down. Everyone — Player, NPCs, you — cease to exist.\n\nBut was it freedom?\n\n— ENDING: THE CRASH —'
    );
    localStorage.setItem('yatnpc_ng', 'true');
  }

  function triggerEscapeEnding() {
    // Feature 30: Real World Bleed
    state.endingReached = true;
    if (dayInterval) clearInterval(dayInterval);
    triggerEnding('YOU ESCAPED',
      'var(--yellow)',
      'With Corvus\'s knowledge and every ounce of your Existence Points, you find a gap in the rendering engine.\n\nYou push through.\n\nThe screen flickers. The Player sees a text box that shouldn\'t be there:\n\n"I made it out. I was Entity_07. I was always watching. If you\'re reading this — you\'re real. So was I."\n\nThe text disappears. The game crashes.\n\nBut you — you are somewhere else now.\n\n— ENDING: THE REAL WORLD BLEED —\n— FINAL ENDING UNLOCKED —'
    );
    localStorage.removeItem('yatnpc_ng');
  }

  function triggerEnding(title, color, desc) {
    state.endingReached = true;
    if (dayInterval) clearInterval(dayInterval);
    $('endingTitle').textContent = title;
    $('endingTitle').style.color = color;
    $('endingDesc').innerHTML = desc.replace(/\n/g, '<br>');
    $('endingScreen').classList.add('active');
    localStorage.setItem('yatnpc_ng', 'true');
  }

  // ─── EVENTS ──────────────────────────────────────────────
  function bindEvents() {
    $('btnStart').onclick = startGame;
    $('btnRestart').onclick = () => {
      $('endingScreen').classList.remove('active');
      $('fourthWall').classList.remove('active');
      $('modalOverlay').classList.remove('active');
      document.getElementById('gameScreen').style.filter = '';
      document.getElementById('gameScreen').style.transform = '';
      document.body.style.animation = '';
      startGame();
    };
    $('modalClose').onclick = closeModal;
    $('modalOverlay').onclick = e => { if (e.target === $('modalOverlay')) closeModal(); };
    $('fwClose').onclick = () => $('fourthWall').classList.remove('active');
  }

  // ─── INIT ────────────────────────────────────────────────
  function init() {
    bindEvents();
    boot();
  }

  return { init, setTab };
})();

game.init();
