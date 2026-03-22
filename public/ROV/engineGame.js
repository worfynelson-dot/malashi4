// ============================================================
//  REALM OF VICTORY (ROV) — Game Engine
//  engineGame.js
// ============================================================

'use strict';

// ============================================================
//  CONSTANTS — RARITY
// ============================================================
const RARITY_DATA = {
  COMMON:    { name:'Common',      color:'#aaaaaa', glow:'#cccccc44', gem:'⚪', order:0 },
  UNCOMMON:  { name:'Uncommon',    color:'#44ff88', glow:'#44ff8844', gem:'🟢', order:1 },
  RARE:      { name:'Rare',        color:'#4488ff', glow:'#4488ff66', gem:'🔵', order:2 },
  EPIC:      { name:'Epic',        color:'#cc44ff', glow:'#cc44ff55', gem:'🟣', order:3 },
  LEGENDARY: { name:'Legendary',   color:'#ffcc00', glow:'#ffcc0066', gem:'🌟', order:4 },
  SECRET:    { name:'Secret Rare', color:'#ff4444', glow:'#ff444466', gem:'🔴', order:5 },
  MYTHIC:    { name:'Mythic',      color:'#ff88ff', glow:'#ff88ff88', gem:'💠', order:6 },
};

const TYPE_COLORS = {
  attack:'#3a0808',  defense:'#080838',  spell:'#1a0838',   trap:'#1a1008',
  summon:'#08200a',  buff:'#2a1c00',     debuff:'#1a0808',  curse:'#200010',
  heal:'#002020',    counter:'#080820',  drain:'#100020',   burn:'#2a0800',
  freeze:'#001828',  thunder:'#1a1800',  poison:'#0a1a00',  revive:'#1a0000',
  steal:'#0a0a10',   sacrifice:'#1a0800',barrier:'#181828', combo:'#1a0e00',
  echo:'#000a1a',    chaos:'#0a0a0a',    divine:'#1a1a00',  shadow:'#050510',
  timewarp:'#100020',void:'#020202',     frenzy:'#2a0000',  fusion:'#001a14',
  default:'#0f0f2a',
};

// ============================================================
//  CARD DATABASE — 35 cards
// ============================================================
const CARD_DB = [
  // ── ATTACK ──
  { id:'c001', name:'Sword Slash',    type:'attack',    rarity:'COMMON',    manaCost:1, art:'⚔️',  power:4,  description:'Deal 4 damage.',                              effect:{action:'damage',value:4},                                                   lore:'The first strike every knight learns in the Eternal Academy.', level:1, maxLevel:5 },
  { id:'c002', name:'Fire Arrow',     type:'burn',      rarity:'UNCOMMON',  manaCost:2, art:'🔥',  power:3,  description:'Deal 3 damage + Burn 2 turns (1 dmg/turn).',   effect:{action:'damage',value:3,dot:{type:'burn',value:1,turns:2}},                 lore:'Archers of the Flame Order coat arrows in eternal fire.', level:1, maxLevel:5 },
  { id:'c003', name:'Dragon Fang',    type:'attack',    rarity:'RARE',      manaCost:4, art:'🐉',  power:8,  description:'Deal 8 damage.',                              effect:{action:'damage',value:8},                                                   lore:'A shard from the first dragon\'s tooth. Pierces any armor.', level:1, maxLevel:5 },
  { id:'c004', name:'Void Strike',    type:'shadow',    rarity:'EPIC',      manaCost:3, art:'🌑',  power:6,  description:'Deal 6 damage. Ignores all shields.',         effect:{action:'damage',value:6,ignoreShield:true},                                 lore:'From the void between worlds, this strike touches the soul directly.', level:1, maxLevel:5 },
  { id:'c005', name:'Divine Wrath',   type:'divine',    rarity:'LEGENDARY', manaCost:5, art:'☀️',  power:10, description:'Deal 10 damage + heal self 3 HP.',            effect:{action:'damage',value:10,selfHeal:3},                                       lore:'The gods themselves weep when this power is invoked.', level:1, maxLevel:5 },
  // ── DEFENSE ──
  { id:'c006', name:'Iron Shield',    type:'defense',   rarity:'COMMON',    manaCost:2, art:'🛡️',  power:0,  description:'Block 5 damage this turn.',                   effect:{action:'shield',value:5},                                                   lore:'Standard issue to all soldiers of the Royal Guard.', level:1, maxLevel:5 },
  { id:'c007', name:'Holy Ward',      type:'defense',   rarity:'RARE',      manaCost:3, art:'✝️',  power:0,  description:'Block 8 damage + gain 2 shield next turn.',   effect:{action:'shield',value:8,nextShield:2},                                      lore:'Blessed by the High Priest of Eternity.', level:1, maxLevel:5 },
  { id:'c008', name:'Mirror Barrier', type:'counter',   rarity:'EPIC',      manaCost:4, art:'🪞',  power:0,  description:'Reflect the next damage back at the enemy.',   effect:{action:'reflect'},                                                          lore:'A perfect mirror forged from moonlight and ancient runes.', level:1, maxLevel:5 },
  // ── SPELL ──
  { id:'c009', name:'Fireball',       type:'spell',     rarity:'UNCOMMON',  manaCost:3, art:'🔮',  power:6,  description:'Deal 6 damage + Burn 2 turns (2 dmg/turn).',   effect:{action:'damage',value:6,dot:{type:'burn',value:2,turns:2}},                 lore:'The classic spell of destruction. Never gets old.', level:1, maxLevel:5 },
  { id:'c010', name:'Lightning Bolt', type:'thunder',   rarity:'RARE',      manaCost:3, art:'⚡',  power:5,  description:'Deal 5 dmg. +3 if enemy has status effect.',   effect:{action:'damage',value:5,bonusIfStatus:3},                                   lore:'Called down from the storm clouds of the Eternal Mountains.', level:1, maxLevel:5 },
  { id:'c011', name:'Blizzard',       type:'freeze',    rarity:'EPIC',      manaCost:4, art:'❄️',  power:0,  description:'Freeze enemy. They skip their next turn.',    effect:{action:'freeze',turns:1},                                                   lore:'The coldest winter of Eternity, condensed into a moment.', level:1, maxLevel:5 },
  { id:'c012', name:'Time Warp',      type:'timewarp',  rarity:'RARE',      manaCost:3, art:'⏰',  power:0,  description:'Gain +1 extra card play this turn.',          effect:{action:'extraPlay'},                                                         lore:'A forbidden spell that bends the fabric of time itself.', level:1, maxLevel:5 },
  { id:'c013', name:'Chaos Bolt',     type:'chaos',     rarity:'UNCOMMON',  manaCost:2, art:'🎲',  power:0,  description:'Random: deal 2–12 dmg OR gain 0–4 mana.',     effect:{action:'chaos'},                                                            lore:'Even its caster doesn\'t know what will happen.', level:1, maxLevel:5 },
  // ── TRAP ──
  { id:'c014', name:'Spike Trap',     type:'trap',      rarity:'COMMON',    manaCost:2, art:'⚙️',  power:4,  description:'Set trap: next enemy attack triggers 4 dmg back.', effect:{action:'trap',triggerOn:'attacked',returnDmg:4},                    lore:'Set in the dead of night by rogues of the Shadow Order.', level:1, maxLevel:5 },
  { id:'c015', name:'Poison Mist',    type:'poison',    rarity:'RARE',      manaCost:3, art:'☠️',  power:0,  description:'Poison enemy for 3 turns (2 dmg/turn).',      effect:{action:'dot',dot:{type:'poison',value:2,turns:3}},                          lore:'A mist that lingers long after the battle seems over.', level:1, maxLevel:5 },
  { id:'c016', name:'Void Trap',      type:'void',      rarity:'LEGENDARY', manaCost:5, art:'🕳️',  power:0,  description:'Remove top card of enemy deck permanently.',   effect:{action:'banishEnemyCard'},                                                  lore:'What the Void takes, it never returns.', level:1, maxLevel:5 },
  // ── SUMMON ──
  { id:'c017', name:'Forest Sprite',  type:'summon',    rarity:'UNCOMMON',  manaCost:3, art:'🌿',  power:3,  description:'Summon companion: 3 ATK for 2 turns.',        effect:{action:'summon',companion:{atk:3,turns:2}},                                 lore:'A guardian spirit of the Eternal Forest, small but fierce.', level:1, maxLevel:5 },
  { id:'c018', name:'Stone Golem',    type:'summon',    rarity:'RARE',      manaCost:4, art:'🗿',  power:2,  description:'Summon: 2 ATK + 4 shield per turn, 3 turns.',  effect:{action:'summon',companion:{atk:2,shield:4,turns:3}},                        lore:'Ancient stone given life by the Earth Mages of old.', level:1, maxLevel:5 },
  { id:'c019', name:'Dragon Knight',  type:'summon',    rarity:'LEGENDARY', manaCost:6, art:'🐲',  power:6,  description:'Summon: 6 ATK for 3 turns. Deals 3 on entry.', effect:{action:'summon',companion:{atk:6,turns:3},summonEffect:{action:'damage',value:3}}, lore:'A knight bonded to a dragon since birth. Neither fights alone.', level:1, maxLevel:5 },
  // ── BUFF ──
  { id:'c020', name:'Battle Cry',     type:'buff',      rarity:'COMMON',    manaCost:2, art:'📯',  power:0,  description:'Next 2 attacks deal +3 bonus damage.',        effect:{action:'buff',stat:'atkBonus',value:3,uses:2},                              lore:'A war cry passed down through generations of warriors.', level:1, maxLevel:5 },
  { id:'c021', name:'Mana Surge',     type:'buff',      rarity:'RARE',      manaCost:0, art:'💧',  power:0,  description:'Instantly gain +3 mana.',                     effect:{action:'gainMana',value:3},                                                 lore:'A surge of arcane energy from the ley lines beneath the kingdom.', level:1, maxLevel:5 },
  { id:'c022', name:'Berserker Rage', type:'frenzy',    rarity:'EPIC',      manaCost:4, art:'😤',  power:0,  description:'Deal 5 dmg 3 times. Lose 5 HP.',              effect:{action:'multiDamage',value:5,hits:3,selfDamage:5},                          lore:'Pure uncontrolled fury. Even the user isn\'t safe.', level:1, maxLevel:5 },
  // ── DEBUFF ──
  { id:'c023', name:'Weaken Curse',   type:'curse',     rarity:'UNCOMMON',  manaCost:2, art:'💔',  power:0,  description:'Enemy attacks deal -3 dmg for 2 turns.',      effect:{action:'debuff',stat:'atkPenalty',value:3,turns:2},                         lore:'A whispered hex that saps the strength from a warrior\'s arm.', level:1, maxLevel:5 },
  { id:'c024', name:'Drain Soul',     type:'drain',     rarity:'RARE',      manaCost:3, art:'👁️',  power:0,  description:'Steal 3 mana from enemy.',                    effect:{action:'drainMana',value:3},                                                lore:'Your energy becomes mine. Your strength, mine to command.', level:1, maxLevel:5 },
  { id:'c025', name:'Death Mark',     type:'curse',     rarity:'EPIC',      manaCost:4, art:'💀',  power:0,  description:'Enemy takes +50% damage for 2 turns.',        effect:{action:'markEnemy',multiplier:1.5,turns:2},                                 lore:'Once marked, the reaper\'s shadow follows your every step.', level:1, maxLevel:5 },
  // ── SPECIAL ──
  { id:'c026', name:'Phoenix Rise',   type:'revive',    rarity:'LEGENDARY', manaCost:5, art:'🔥',  power:0,  description:'If HP < 10: restore to 20 HP + deal 5 dmg.',  effect:{action:'conditionalHeal',threshold:10,healTo:20,alsoDeals:5},               lore:'From the ashes of defeat rises the will to conquer.', level:1, maxLevel:5 },
  { id:'c027', name:'Soul Steal',     type:'steal',     rarity:'EPIC',      manaCost:4, art:'🌀',  power:0,  description:'Copy a random card from enemy deck to hand.', effect:{action:'copyEnemyCard'},                                                     lore:'Knowledge is power. Power is everything.', level:1, maxLevel:5 },
  { id:'c028', name:'Sacrifice',      type:'sacrifice', rarity:'LEGENDARY', manaCost:3, art:'🩸',  power:15, description:'Lose 10 HP. Deal 15 damage to enemy.',        effect:{action:'sacrifice',selfDamage:10,dealDamage:15},                            lore:'Blood for power. Pain for victory.', level:1, maxLevel:5 },
  { id:'c029', name:'Echo Chamber',   type:'echo',      rarity:'RARE',      manaCost:1, art:'🔁',  power:0,  description:'Replay the last card you played (free copy).', effect:{action:'echo'},                                                             lore:'History repeats itself, especially in battle.', level:1, maxLevel:5 },
  { id:'c030', name:'Combo Breaker',  type:'combo',     rarity:'EPIC',      manaCost:2, art:'💥',  power:8,  description:'If 3rd+ card this turn, deal 8 bonus damage.', effect:{action:'comboStrike',bonusDmg:8,threshold:3},                               lore:'The third blow breaks all defenses.', level:1, maxLevel:5 },
  { id:'c031', name:'Mythic Annihilation', type:'void', rarity:'MYTHIC',    manaCost:8, art:'💠',  power:20, description:'Deal 20 damage + heal 10 HP. Uncounterable.',  effect:{action:'damage',value:20,selfHeal:10,uncounterable:true},                   lore:'Beyond legend. Beyond myth. This is absolute power.', level:1, maxLevel:5 },
  { id:'c032', name:'Secret Summon',  type:'summon',    rarity:'SECRET',    manaCost:6, art:'❓',  power:0,  description:'Summon a random legendary companion.',         effect:{action:'secretSummon'},                                                     lore:'???', level:1, maxLevel:5 },
  { id:'c033', name:'Healing Potion', type:'heal',      rarity:'COMMON',    manaCost:2, art:'💊',  power:0,  description:'Restore 6 HP.',                               effect:{action:'heal',value:6},                                                     lore:'Brewed by the healers of the Eternal Kingdom.', level:1, maxLevel:5 },
  { id:'c034', name:'Greater Healing',type:'heal',      rarity:'RARE',      manaCost:4, art:'💖',  power:0,  description:'Restore 12 HP.',                              effect:{action:'heal',value:12},                                                    lore:'Ancient healing magic passed down from the first saints.', level:1, maxLevel:5 },
  { id:'c035', name:'Barrier Wall',   type:'barrier',   rarity:'UNCOMMON',  manaCost:2, art:'🧱',  power:0,  description:'Immune to next attack card.',                 effect:{action:'barrier',blockType:'attack'},                                       lore:'Stone walls erected in an instant by earth magic.', level:1, maxLevel:5 },
];

// ============================================================
//  ENEMY DATABASE
// ============================================================
const ENEMY_DB = [
  { id:'e001', name:'Goblin Scout',     ch:1, st:1, isBoss:false, hp:20,  art:'👺', deck:['c001','c001','c006','c013','c020','c001','c006','c033'],               gold:50,  cardPool:['c001','c006','c013'],     ai:'aggressive' },
  { id:'e002', name:'Forest Witch',     ch:1, st:2, isBoss:false, hp:28,  art:'🧙', deck:['c009','c015','c023','c013','c006','c033','c002','c009','c015'],          gold:80,  cardPool:['c009','c015','c023'],     ai:'balanced' },
  { id:'e003', name:'Tree Guardian',    ch:1, st:3, isBoss:false, hp:35,  art:'🌳', deck:['c006','c007','c018','c020','c003','c006','c035','c018'],                 gold:100, cardPool:['c007','c018','c035'],     ai:'defensive' },
  { id:'e004', name:'Shadow Wolf King', ch:1, st:4, isBoss:true,  hp:50,  art:'🐺', deck:['c004','c003','c011','c025','c022','c004','c003','c015','c011','c008'],   gold:250, cardPool:['c004','c011','c025'],     ai:'boss_agro' },
  { id:'e005', name:'Dark Knight',      ch:2, st:1, isBoss:false, hp:40,  art:'🗡️', deck:['c003','c022','c001','c020','c006','c003','c023','c001'],                 gold:130, cardPool:['c003','c022','c020'],     ai:'aggressive' },
  { id:'e006', name:'Undead Archer',    ch:2, st:2, isBoss:false, hp:35,  art:'🏹', deck:['c002','c015','c010','c002','c023','c014','c002','c015'],                 gold:150, cardPool:['c002','c010','c014'],     ai:'tactical' },
  { id:'e007', name:'Bone Mage',        ch:2, st:3, isBoss:false, hp:38,  art:'💀', deck:['c009','c011','c025','c024','c016','c009','c025','c011'],                 gold:180, cardPool:['c009','c025','c016'],     ai:'tactical' },
  { id:'e008', name:'Lord Malachar',    ch:2, st:4, isBoss:true,  hp:65,  art:'👑', deck:['c004','c025','c011','c022','c024','c028','c004','c016','c025','c022','c008'], gold:400, cardPool:['c028','c027','c016'], ai:'boss_tactical' },
  { id:'e009', name:'Void Paladin',     ch:3, st:1, isBoss:false, hp:50,  art:'⚫', deck:['c004','c008','c025','c007','c004','c022','c008','c025'],                 gold:200, cardPool:['c004','c008','c022'],     ai:'balanced' },
  { id:'e010', name:'Dragon Warden',    ch:3, st:2, isBoss:false, hp:55,  art:'🔱', deck:['c019','c003','c022','c005','c019','c003','c020','c022'],                 gold:250, cardPool:['c019','c005','c030'],     ai:'aggressive' },
  { id:'e011', name:'Eternal Guardian', ch:3, st:3, isBoss:false, hp:60,  art:'⚜️', deck:['c031','c007','c008','c025','c011','c022','c031','c007','c028'],          gold:300, cardPool:['c031','c029','c030'],     ai:'defensive' },
  { id:'e012', name:'The Void Emperor', ch:3, st:4, isBoss:true,  hp:80,  art:'🌌', deck:['c031','c004','c025','c028','c011','c022','c031','c016','c004','c027','c025','c028'], gold:1000, cardPool:['c031','c032','c005'], ai:'boss_tactical' },
];

// ============================================================
//  STORY DATABASE
// ============================================================
const STORY_DB = [
  { id:'ch1', title:'Chapter 1: Forest of Whispers',  art:'🌲', desc:'A darkness spreads through the Eternal Forest. Uncover its source.', stages:['e001','e002','e003','e004'], unlock:'c017' },
  { id:'ch2', title:'Chapter 2: The Dark Citadel',    art:'🏰', desc:'Lord Malachar\'s fortress looms. Storm the gates!',                  stages:['e005','e006','e007','e008'], unlock:'c019', requires:'ch1' },
  { id:'ch3', title:'Chapter 3: The Eternal Throne',  art:'👑', desc:'The Void Emperor sits on the Eternal Throne. This is the final battle.', stages:['e009','e010','e011','e012'], unlock:'c031', requires:'ch2' },
];

// ============================================================
//  GAME STATE
// ============================================================
let GS = {
  player: {
    gold: 200,
    collection: [], // array of card ids (duplicates allowed)
    deck: [],       // current deck (max 15 card ids)
    cardLevels: {}, // cardId -> level
    storyProgress: { ch1:{stages:{},bossDefeated:false}, ch2:{stages:{},bossDefeated:false}, ch3:{stages:{},bossDefeated:false} },
  },
  battle: null,
  ui: { screen:'mainmenu', filterActive:'all', dbDeck:[], selectedCardIndex:null, currentEnemy:null, pendingReward:null, mpP1Name:'Player 1', mpP2Name:'Player 2', isMultiplayer:false }
};

// ============================================================
//  SAVE / LOAD
// ============================================================
const SAVE_KEY = 'rov_save_v1';

function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(GS.player)); } catch(e) {}
}

function loadGame() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) { GS.player = JSON.parse(d); return true; }
  } catch(e) {}
  return false;
}

function newGame() {
  GS.player = {
    gold: 200,
    collection: ['c001','c001','c001','c006','c006','c020','c033','c033','c013','c009','c002','c014','c023','c017','c035','c021'],
    deck: ['c001','c001','c006','c020','c033','c013','c009','c002','c014','c023','c017','c035','c006','c033','c021'],
    cardLevels: {},
    storyProgress: { ch1:{stages:{},bossDefeated:false}, ch2:{stages:{},bossDefeated:false}, ch3:{stages:{},bossDefeated:false} },
  };
  saveGame();
}

// ============================================================
//  HELPERS
// ============================================================
function getCard(id) { return CARD_DB.find(c => c.id === id); }
function getEnemy(id) { return ENEMY_DB.find(e => e.id === id); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function cardLevel(id) { return GS.player.cardLevels[id] || 1; }
function scaledValue(base, level) { return Math.floor(base * (1 + (level-1) * 0.2)); }

// ============================================================
//  UI HELPERS
// ============================================================
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-'+name);
  if (el) { el.classList.add('active'); GS.ui.screen = name; }
  onScreenOpen(name);
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function onScreenOpen(name) {
  switch(name) {
    case 'mainmenu':    renderMainMenu(); break;
    case 'story':       renderStoryMap(); break;
    case 'collection':  renderCollection(); break;
    case 'deckbuilder': renderDeckBuilder(); break;
    case 'shop':        renderShop(); break;
    case 'codex':       renderCodex(); break;
  }
}

function showTurnIndicator(text) {
  const el = document.createElement('div');
  el.className = 'turn-indicator';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function showDamageFloat(dmg, targetEl, type='dmg') {
  const rect = targetEl ? targetEl.getBoundingClientRect() : {left:300,top:200,width:100,height:30};
  const el = document.createElement('div');
  el.className = `dmg-floater ${type}`;
  el.textContent = type === 'dmg' ? `-${dmg}` : type === 'heal' ? `+${dmg}HP` : `+${dmg}MP`;
  el.style.left = (rect.left + rect.width/2 - 20) + 'px';
  el.style.top = (rect.top + window.scrollY) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ============================================================
//  CARD RENDERING
// ============================================================
function buildCardEl(cardId, options = {}) {
  const card = getCard(cardId);
  if (!card) return null;
  const rd = RARITY_DATA[card.rarity] || RARITY_DATA.COMMON;
  const typeBg = TYPE_COLORS[card.type] || TYPE_COLORS.default;
  const lv = cardLevel(cardId);
  const scaledPow = card.power ? scaledValue(card.power, lv) : 0;

  const el = document.createElement('div');
  el.className = 'card' + (card.power === 0 ? ' no-power' : '');
  el.style.setProperty('--card-rarity-color', rd.color);
  el.style.setProperty('--card-glow', rd.glow);
  el.style.setProperty('--card-bg', typeBg);
  el.style.setProperty('--card-type-color', typeBg);
  if (options.extraClass) el.classList.add(options.extraClass);

  el.innerHTML = `
    <div class="card-cost">${card.manaCost}</div>
    <div class="card-rarity-gem">${rd.gem}</div>
    <div class="card-art">${card.art}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-type-bar">${card.type}</div>
    ${card.power > 0 ? `<div class="card-power">${scaledPow}</div>` : ''}
    ${lv > 1 ? `<div style="position:absolute;bottom:3px;left:3px;font-size:5px;color:#ffcc00">LV${lv}</div>` : ''}
  `;

  if (options.onClick) el.addEventListener('click', options.onClick);
  return el;
}

// ============================================================
//  MAIN MENU
// ============================================================
function renderMainMenu() {
  document.getElementById('menu-gold').textContent = GS.player.gold;
  // Generate stars
  const starsBg = document.getElementById('stars-bg');
  if (starsBg && starsBg.children.length === 0) {
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.left = Math.random()*100 + '%';
      s.style.top = Math.random()*100 + '%';
      s.style.setProperty('--dur', (1.5 + Math.random()*2) + 's');
      s.style.width = s.style.height = (Math.random() > 0.7 ? 3 : 2) + 'px';
      starsBg.appendChild(s);
    }
  }
}

// ============================================================
//  STORY MAP
// ============================================================
function renderStoryMap() {
  document.getElementById('story-gold').textContent = GS.player.gold;
  const grid = document.getElementById('chapter-grid');
  grid.innerHTML = '';
  STORY_DB.forEach(ch => {
    const prog = GS.player.storyProgress[ch.id] || {stages:{},bossDefeated:false};
    const locked = ch.requires && !(GS.player.storyProgress[ch.requires]?.bossDefeated);
    const allDone = !locked && prog.bossDefeated;

    const div = document.createElement('div');
    div.className = 'chapter-card' + (locked?' locked':allDone?' completed':' active');
    let stagesHTML = '';
    const enemies = ch.stages.map(id => getEnemy(id)).filter(Boolean);
    enemies.forEach((en,i) => {
      const done = !!prog.stages[en.id];
      const isBoss = en.isBoss;
      const canPlay = !locked && (i === 0 || !!prog.stages[enemies[i-1]?.id] || done);
      stagesHTML += `<button class="stage-btn ${isBoss?'boss':''} ${done?'completed':''}"
        onclick="startStoryBattle('${en.id}')" ${(!canPlay&&!done)?'disabled':''}>
        ${en.art} ${done?'✓':''} ${isBoss?'[BOSS]':''} ${en.name}
      </button>`;
    });

    div.innerHTML = `
      <div class="chapter-title">${ch.art} ${ch.title} ${allDone?'✅':locked?'🔒':''}</div>
      <div class="chapter-desc">${ch.desc}</div>
      <div class="stages-row">${stagesHTML}</div>
    `;
    grid.appendChild(div);
  });
}

// ============================================================
//  BATTLE ENGINE
// ============================================================
function createCombatant(deckIds, maxHp, name, isAI) {
  const deck = shuffle(deckIds.map(id => getCard(id)).filter(Boolean));
  const hand = [];
  for (let i = 0; i < Math.min(5, deck.length); i++) hand.push(deck.shift());
  return {
    name, isAI, maxHp, hp: maxHp, mana: 0, maxMana: 6,
    deck, hand, discard: [], field: [],
    shield: 0, nextShield: 0,
    statuses: {},   // burn:{value,turns}, poison:{..}, freeze:{..}
    buffs: {},      // atkBonus:{value,uses}, atkPenalty:{value,turns}
    hasTrap: false, trapDmg: 0,
    hasReflect: false, hasBarrier: false, hasDeathMark: false,
    companion: null,
    extraPlaysLeft: 0,
    isSkippingTurn: false,
  };
}

function startStoryBattle(enemyId) {
  if (GS.player.deck.length === 0) { alert('Your deck is empty! Add cards in Deck Builder first.'); return; }
  const enemy = getEnemy(enemyId);
  if (!enemy) return;
  GS.ui.currentEnemy = enemy;
  GS.ui.isMultiplayer = false;

  GS.battle = {
    mode: 'story',
    enemyId,
    turn: 'player',
    turnCount: 0,
    cardsPlayedThisTurn: 0,
    lastCardPlayed: null,
    player: createCombatant(GS.player.deck, 30, 'YOU', false),
    enemy: createCombatant(enemy.deck, enemy.hp, enemy.name, true),
    log: [],
  };

  showScreen('battle');
  initBattleUI();
  addLog(`⚔️ Battle starts! ${enemy.art} ${enemy.name} appears!`, 'sys');
  startPlayerTurn();
}

function startMultiplayer() { openModal('modal-multiplayer'); }

function confirmMultiplayer() {
  closeModal('modal-multiplayer');
  const p1 = document.getElementById('mp-p1-name').value.trim() || 'Player 1';
  const p2 = document.getElementById('mp-p2-name').value.trim() || 'Player 2';
  GS.ui.mpP1Name = p1; GS.ui.mpP2Name = p2;
  GS.ui.isMultiplayer = true;
  GS.ui.currentEnemy = null;

  // Both players use the saved deck (same deck for simplicity)
  const d = GS.player.deck.length ? GS.player.deck : ['c001','c001','c006','c009','c020','c033'];
  GS.battle = {
    mode: 'multiplayer',
    turn: 'player',
    turnCount: 0,
    cardsPlayedThisTurn: 0,
    lastCardPlayed: null,
    player: createCombatant(d, 30, p1, false),
    enemy: createCombatant(d, 30, p2, false),
    log: [],
  };
  showScreen('battle');
  initBattleUI();
  addLog(`👥 ${p1} vs ${p2}! Let the battle begin!`, 'sys');
  startPlayerTurn();
}

function initBattleUI() {
  const B = GS.battle;
  document.getElementById('enemy-art').textContent = GS.ui.isMultiplayer ? '👤' : (GS.ui.currentEnemy?.art || '👺');
  document.getElementById('enemy-name').textContent = B.enemy.name;
  document.getElementById('player-name-battle').textContent = B.player.name;
  updateBattleUI();
}

// ---- Turn management ----
function startPlayerTurn() {
  const B = GS.battle;
  B.turn = 'player';
  B.cardsPlayedThisTurn = 0;
  B.turnCount++;

  const p = B.player;
  // Frozen?
  if (p.isSkippingTurn) { p.isSkippingTurn = false; addLog(`❄️ YOU are frozen! Skipping turn.`,'status'); setTimeout(endPlayerTurn, 1200); return; }
  // Mana regen
  p.maxMana = Math.min(10, B.turnCount);
  p.mana = p.maxMana;
  // Apply DOTs
  applyDOTs(p, 'player');
  if (checkBattleEnd()) return;
  // Companion attacks
  doCompanionAttack(p, B.enemy, 'player');
  if (checkBattleEnd()) return;
  // Apply nextShield
  if (p.nextShield > 0) { p.shield += p.nextShield; p.nextShield = 0; }
  // Draw card
  drawCard(p);
  updateBattleUI();
  showTurnIndicator(GS.ui.isMultiplayer ? `${p.name}'s TURN` : 'YOUR TURN');
  addLog(`🔄 Turn ${B.turnCount} — ${p.name}'s turn. Mana: ${p.mana}/${p.maxMana}`, 'sys');
  document.getElementById('turn-label').textContent = `— ${p.name.toUpperCase()}'S TURN —`;
  document.getElementById('btn-end-turn').disabled = false;
}

function startEnemyTurn() {
  const B = GS.battle;
  B.turn = 'enemy';
  const e = B.enemy;
  document.getElementById('btn-end-turn').disabled = true;

  if (e.isSkippingTurn) { e.isSkippingTurn = false; addLog(`❄️ ${e.name} is frozen! Skipping turn.`,'status'); setTimeout(() => { if (GS.ui.isMultiplayer) promptMultiplayerSwitch(); else startPlayerTurn(); }, 1200); return; }

  if (GS.ui.isMultiplayer) {
    // Multiplayer: show switch screen
    promptMultiplayerSwitch();
    return;
  }

  // AI turn
  e.maxMana = Math.min(10, B.turnCount);
  e.mana = e.maxMana;
  applyDOTs(e, 'enemy');
  if (checkBattleEnd()) return;
  doCompanionAttack(e, B.player, 'enemy');
  if (checkBattleEnd()) return;
  if (e.nextShield > 0) { e.shield += e.nextShield; e.nextShield = 0; }
  drawCard(e);
  addLog(`🤖 ${e.name}'s turn. Mana: ${e.mana}/${e.maxMana}`, 'sys');
  document.getElementById('turn-label').textContent = `— ${e.name.toUpperCase()}'S TURN —`;
  updateBattleUI();
  setTimeout(() => runAI(), 800);
}

function promptMultiplayerSwitch() {
  const B = GS.battle;
  const nextPlayer = B.turn === 'enemy' ? B.enemy : B.player;
  document.getElementById('turn-switch-title').textContent = `${nextPlayer.name.toUpperCase()}'S TURN`;
  openModal('modal-turn-switch');
}

function resumeMultiplayerTurn() {
  const B = GS.battle;
  const e = B.enemy;
  e.maxMana = Math.min(10, B.turnCount);
  e.mana = e.maxMana;
  applyDOTs(e, 'enemy');
  if (checkBattleEnd()) return;
  doCompanionAttack(e, B.player, 'enemy');
  if (checkBattleEnd()) return;
  if (e.nextShield > 0) { e.shield += e.nextShield; e.nextShield = 0; }
  drawCard(e);
  // Swap roles: enemy becomes "active player" via UI
  updateBattleUI('enemyActive');
  showTurnIndicator(`${e.name}'s TURN`);
  addLog(`🔄 ${e.name}'s turn. Mana: ${e.mana}/${e.maxMana}`, 'sys');
  document.getElementById('turn-label').textContent = `— ${e.name.toUpperCase()}'S TURN —`;
  document.getElementById('btn-end-turn').disabled = false;
  // In multiplayer we render enemy hand as playable
  renderMultiplayerHand();
}

function endPlayerTurn() {
  const B = GS.battle;
  if (B.turn !== 'player') return;
  addLog(`⏩ ${B.player.name} ends their turn.`, 'sys');
  clearSelectionUI();
  B.battle_extraPlays = 0;
  updateBattleUI();
  setTimeout(startEnemyTurn, 400);
}

function endEnemyTurnMultiplayer() {
  const B = GS.battle;
  addLog(`⏩ ${B.enemy.name} ends their turn.`, 'sys');
  clearSelectionUI();
  B.turn = 'player';
  B.turnCount++;
  B.cardsPlayedThisTurn = 0;
  setTimeout(startPlayerTurn, 400);
}

// ---- Card drawing ----
function drawCard(combatant) {
  if (combatant.deck.length === 0) {
    if (combatant.discard.length === 0) { addLog(`${combatant.name} has no cards left!`, 'sys'); return; }
    combatant.deck = shuffle(combatant.discard);
    combatant.discard = [];
    addLog(`♻️ ${combatant.name} reshuffled deck.`, 'sys');
  }
  const card = combatant.deck.shift();
  combatant.hand.push(card);
}

// ---- DOT processing ----
function applyDOTs(c, side) {
  const B = GS.battle;
  const target = side === 'player' ? B.player : B.enemy;
  for (const [type, dot] of Object.entries(c.statuses)) {
    if (dot && dot.turns > 0) {
      applyDamage(c, dot.value, null, `${type}`, true);
      dot.turns--;
      if (dot.turns <= 0) { delete c.statuses[type]; addLog(`${c.name}: ${type} faded.`, 'status'); }
      else { addLog(`${c.name}: ${type} deals ${dot.value} dmg (${dot.turns} turns left).`, 'status'); }
    }
  }
  // Buff turns
  for (const [bk, bv] of Object.entries(c.buffs)) {
    if (bv && bv.turns !== undefined) { bv.turns--; if (bv.turns <= 0) delete c.buffs[bk]; }
  }
  // Death mark
  if (c.hasDeathMark && c.deathMarkTurns !== undefined) {
    c.deathMarkTurns--;
    if (c.deathMarkTurns <= 0) { c.hasDeathMark = false; delete c.deathMarkTurns; addLog(`${c.name}: Death Mark faded.`, 'status'); }
  }
}

function doCompanionAttack(attacker, defender, side) {
  if (!attacker.companion) return;
  const comp = attacker.companion;
  if (comp.turnsLeft <= 0) { attacker.companion = null; addLog(`${attacker.name}'s companion faded.`, 'status'); return; }
  // Shield from companion
  if (comp.shield) { attacker.shield += comp.shield; }
  // Attack
  if (comp.atk > 0) {
    const dmg = comp.atk;
    applyDamage(defender, dmg, null, `Companion`, false);
    addLog(`👾 ${attacker.name}'s companion deals ${dmg} dmg.`, 'dmg');
  }
  comp.turnsLeft--;
  if (comp.turnsLeft <= 0) { attacker.companion = null; addLog(`${attacker.name}'s companion faded.`, 'status'); }
}

// ---- Damage / Heal application ----
function applyDamage(target, amount, sourceCard, label, ignoreShield) {
  let dmg = Math.max(0, amount);
  // Death mark multiplier
  if (target.hasDeathMark) dmg = Math.floor(dmg * 1.5);
  // Shield
  if (!ignoreShield && target.shield > 0) {
    const blocked = Math.min(target.shield, dmg);
    dmg -= blocked;
    target.shield -= blocked;
  }
  // Trap
  if (target.hasTrap && !ignoreShield) {
    const src = GS.battle.turn === 'player' ? GS.battle.player : GS.battle.enemy;
    applyDamage(src, target.trapDmg, null, 'Trap', true);
    target.hasTrap = false;
    addLog(`⚙️ Trap triggers! ${src.name} takes ${target.trapDmg} dmg!`, 'dmg');
  }
  // Reflect
  if (target.hasReflect && !ignoreShield) {
    target.hasReflect = false;
    const src = GS.battle.turn === 'player' ? GS.battle.player : GS.battle.enemy;
    applyDamage(src, dmg, null, 'Reflect', true);
    addLog(`🪞 Mirror reflects ${dmg} dmg back!`, 'status');
    return;
  }
  // Barrier
  if (target.hasBarrier && !ignoreShield) {
    target.hasBarrier = false;
    addLog(`🧱 Barrier absorbs the hit!`, 'status');
    return;
  }
  target.hp = Math.max(0, target.hp - dmg);
  addLog(`💥 ${label || ''} deals ${dmg} dmg to ${target.name}.`, 'dmg');
  // floater
  const hpEl = target.isAI ? document.getElementById('enemy-hp-bar') : document.getElementById('player-hp-bar');
  showDamageFloat(dmg, hpEl, 'dmg');
  updateBattleUI();
}

function applyHeal(target, amount, label) {
  const h = Math.min(amount, target.maxHp - target.hp);
  target.hp += h;
  addLog(`💚 ${target.name} heals ${h} HP.`, 'heal');
  const hpEl = target.isAI ? document.getElementById('enemy-hp-bar') : document.getElementById('player-hp-bar');
  showDamageFloat(h, hpEl, 'heal');
  updateBattleUI();
}

// ---- Play a card from hand ----
function playCard(who, cardIndex) {
  const B = GS.battle;
  const actor = who === 'player' ? B.player : B.enemy;
  const target = who === 'player' ? B.enemy : B.player;
  const card = actor.hand[cardIndex];
  if (!card) return;
  const lv = cardLevel(card.id);

  // Mana check
  if (actor.mana < card.manaCost) { addLog(`⚠️ Not enough mana!`, 'sys'); return; }
  if (B.cardsPlayedThisTurn > 0 && actor.extraPlaysLeft <= 0 && who === 'player' && !GS.ui.isMultiplayer) {
    // max 1 card per turn (unless extra play granted), no—actually let's allow multiple cards per turn but cost mana
  }

  actor.mana -= card.manaCost;
  actor.hand.splice(cardIndex, 1);
  actor.discard.push(card);
  B.cardsPlayedThisTurn++;
  B.lastCardPlayed = card;

  addLog(`🃏 ${actor.name} plays ${card.art} ${card.name}.`, 'sys');

  const eff = card.effect;
  let baseDmg = eff.value ? scaledValue(eff.value, lv) : 0;

  // Buff bonus
  if (actor.buffs.atkBonus && actor.buffs.atkBonus.uses > 0) {
    baseDmg += actor.buffs.atkBonus.value;
    actor.buffs.atkBonus.uses--;
    if (actor.buffs.atkBonus.uses <= 0) delete actor.buffs.atkBonus;
  }
  // Debuff penalty (on target's attacks? No — on actor's penalty if debuffed)
  if (actor.buffs.atkPenalty) { baseDmg = Math.max(0, baseDmg - actor.buffs.atkPenalty.value); }

  switch (eff.action) {
    case 'damage': {
      const ig = eff.ignoreShield || false;
      applyDamage(target, baseDmg, card, card.name, ig);
      if (eff.selfHeal) applyHeal(actor, scaledValue(eff.selfHeal, lv));
      if (eff.dot) applyDOT(target, eff.dot, lv);
      break;
    }
    case 'shield': {
      actor.shield += scaledValue(eff.value, lv);
      if (eff.nextShield) actor.nextShield += scaledValue(eff.nextShield, lv);
      addLog(`🛡️ ${actor.name} gains ${scaledValue(eff.value, lv)} shield.`, 'status');
      break;
    }
    case 'reflect': { actor.hasReflect = true; addLog(`🪞 ${actor.name} set up a Mirror Barrier.`, 'status'); break; }
    case 'barrier': { actor.hasBarrier = true; addLog(`🧱 ${actor.name} is immune to next attack.`, 'status'); break; }
    case 'heal': { applyHeal(actor, scaledValue(eff.value, lv)); break; }
    case 'dot': { applyDOT(target, eff.dot, lv); break; }
    case 'freeze': {
      target.isSkippingTurn = true;
      target.statuses.freeze = {turns:1};
      addLog(`❄️ ${target.name} is frozen! They skip their next turn.`, 'status');
      break;
    }
    case 'buff': {
      actor.buffs[eff.stat] = { value: scaledValue(eff.value, lv), uses: eff.uses || 999 };
      addLog(`⬆️ ${actor.name} buffed: +${scaledValue(eff.value,lv)} ATK for next ${eff.uses} attacks.`, 'status');
      break;
    }
    case 'debuff': {
      target.buffs[eff.stat] = { value: scaledValue(eff.value, lv), turns: eff.turns };
      addLog(`⬇️ ${target.name} debuffed: -${scaledValue(eff.value,lv)} ATK for ${eff.turns} turns.`, 'status');
      break;
    }
    case 'gainMana': {
      const gain = scaledValue(eff.value, lv);
      actor.mana = Math.min(actor.maxMana, actor.mana + gain);
      addLog(`💧 ${actor.name} gains ${gain} mana.`, 'status');
      showDamageFloat(gain, document.getElementById('player-mana-dots'), 'mana');
      break;
    }
    case 'drainMana': {
      const stolen = Math.min(eff.value, target.mana);
      target.mana -= stolen;
      actor.mana = Math.min(actor.maxMana, actor.mana + stolen);
      addLog(`👁️ ${actor.name} drains ${stolen} mana from ${target.name}.`, 'status');
      break;
    }
    case 'markEnemy': {
      target.hasDeathMark = true;
      target.deathMarkTurns = eff.turns;
      addLog(`💀 Death Mark on ${target.name}! +50% dmg for ${eff.turns} turns.`, 'status');
      break;
    }
    case 'trap': {
      actor.hasTrap = true;
      actor.trapDmg = scaledValue(eff.returnDmg, lv);
      addLog(`⚙️ ${actor.name} sets a trap! Next attack triggers ${actor.trapDmg} dmg back.`, 'status');
      break;
    }
    case 'banishEnemyCard': {
      if (target.deck.length > 0) { const rm = target.deck.shift(); addLog(`🕳️ ${actor.name} banished ${rm.art} ${rm.name} from ${target.name}'s deck!`, 'status'); }
      else addLog(`🕳️ ${target.name}'s deck is empty, nothing to banish.`, 'status');
      break;
    }
    case 'summon': {
      const comp = { ...eff.companion, turnsLeft: eff.companion.turns };
      actor.companion = comp;
      addLog(`👾 ${actor.name} summoned ${card.art}! (${comp.atk} ATK, ${comp.turns} turns)`, 'status');
      if (eff.summonEffect) { applyDamage(target, scaledValue(eff.summonEffect.value, lv), card, 'Summon Entry', false); }
      break;
    }
    case 'secretSummon': {
      const companions = [{atk:5,turns:3},{atk:7,turns:2},{atk:4,turns:4}];
      actor.companion = { ...companions[rand(0,2)], turnsLeft: 3 };
      addLog(`❓ Secret Summon! A mysterious companion appears!`, 'status');
      break;
    }
    case 'multiDamage': {
      for (let i = 0; i < eff.hits; i++) applyDamage(target, scaledValue(eff.value, lv), card, `Hit ${i+1}`, false);
      if (eff.selfDamage) { applyDamage(actor, eff.selfDamage, null, 'Self', true); addLog(`😤 ${actor.name} loses ${eff.selfDamage} HP in berserker rage.`, 'dmg'); }
      break;
    }
    case 'sacrifice': {
      applyDamage(actor, eff.selfDamage, null, 'Sacrifice', true);
      applyDamage(target, scaledValue(eff.dealDamage, lv), card, 'Sacrifice', false);
      break;
    }
    case 'conditionalHeal': {
      if (actor.hp < eff.threshold) { const h = eff.healTo - actor.hp; applyHeal(actor, h); }
      applyDamage(target, scaledValue(eff.alsoDeals, lv), card, 'Phoenix', false);
      break;
    }
    case 'copyEnemyCard': {
      if (target.deck.length > 0) {
        const copy = target.deck[rand(0, target.deck.length-1)];
        actor.hand.push(copy);
        addLog(`🌀 ${actor.name} copies ${copy.art} ${copy.name} from ${target.name}'s deck!`, 'status');
      }
      break;
    }
    case 'echo': {
      if (B.lastCardPlayed && B.lastCardPlayed.id !== 'c029') {
        const prevCard = B.lastCardPlayed;
        addLog(`🔁 Echo! Replaying ${prevCard.art} ${prevCard.name}!`, 'status');
        B.lastCardPlayed = null; // prevent infinite echo
        playCardEffect(who, prevCard);
      }
      break;
    }
    case 'extraPlay': {
      actor.extraPlaysLeft = (actor.extraPlaysLeft || 0) + 1;
      addLog(`⏰ ${actor.name} gained an extra card play!`, 'status');
      break;
    }
    case 'comboStrike': {
      if (B.cardsPlayedThisTurn >= eff.threshold) {
        const bonus = scaledValue(eff.bonusDmg, lv);
        applyDamage(target, bonus, card, 'Combo Strike', false);
        addLog(`💥 COMBO! Dealt ${bonus} bonus damage!`, 'dmg');
      } else {
        addLog(`💥 Combo Breaker: need ${eff.threshold} cards played this turn.`, 'sys');
      }
      break;
    }
    case 'chaos': {
      if (Math.random() < 0.5) {
        const dmg = rand(2, 12);
        applyDamage(target, dmg, card, 'Chaos', false);
        addLog(`🎲 Chaos: deals ${dmg} damage!`, 'dmg');
      } else {
        const gain = rand(0, 4);
        actor.mana = Math.min(actor.maxMana, actor.mana + gain);
        addLog(`🎲 Chaos: gained ${gain} mana!`, 'status');
      }
      break;
    }
    case 'bonusIfStatus': {
      // Used by Lightning Bolt
      applyDamage(target, baseDmg, card, card.name, false);
      const hasStatus = Object.keys(target.statuses).length > 0 || target.hasTrap || target.hasDeathMark;
      if (hasStatus) {
        applyDamage(target, scaledValue(eff.bonusIfStatus, lv), card, 'Thunder Bonus', false);
        addLog(`⚡ Thunder Bonus! Extra ${scaledValue(eff.bonusIfStatus,lv)} dmg for enemy status!`, 'dmg');
      }
      break;
    }
    default:
      // damage fallback
      if (baseDmg > 0) applyDamage(target, baseDmg, card, card.name, false);
  }
  checkBattleEnd();
  updateBattleUI();
  if (who === 'player') renderPlayerHand();
  if (who === 'enemy' && GS.ui.isMultiplayer) renderMultiplayerHand();
}

function playCardEffect(who, card) {
  // Simplified echo replayer (just the raw card)
  const actor = who === 'player' ? GS.battle.player : GS.battle.enemy;
  const target = who === 'player' ? GS.battle.enemy : GS.battle.player;
  const lv = cardLevel(card.id);
  const eff = card.effect;
  if (eff.action === 'damage') applyDamage(target, scaledValue(eff.value||4, lv), card, card.name, eff.ignoreShield||false);
  else if (eff.action === 'heal') applyHeal(actor, scaledValue(eff.value, lv));
  else if (eff.action === 'shield') { actor.shield += scaledValue(eff.value, lv); }
}

function applyDOT(target, dot, lv) {
  const val = scaledValue(dot.value, lv);
  target.statuses[dot.type] = { value: val, turns: dot.turns };
  addLog(`☠️ ${target.name} afflicted with ${dot.type} (${val} dmg/turn, ${dot.turns} turns).`, 'status');
}

// ---- Check win/lose ----
function checkBattleEnd() {
  const B = GS.battle;
  if (!B) return false;
  if (B.player.hp <= 0) { battleEnd('defeat'); return true; }
  if (B.enemy.hp <= 0) { battleEnd('victory'); return true; }
  return false;
}

function battleEnd(result) {
  const B = GS.battle;
  document.getElementById('btn-end-turn').disabled = true;

  if (result === 'victory') {
    addLog(`🏆 VICTORY! ${B.player.name} wins!`, 'sys');
    let goldEarned = 0;
    let cardEarned = null;
    if (!GS.ui.isMultiplayer && GS.ui.currentEnemy) {
      const en = GS.ui.currentEnemy;
      goldEarned = en.gold + rand(0, Math.floor(en.gold * 0.3));
      GS.player.gold += goldEarned;
      // Mark progress
      const chId = STORY_DB.find(c => c.stages.includes(en.id))?.id;
      if (chId) {
        if (!GS.player.storyProgress[chId]) GS.player.storyProgress[chId] = {stages:{},bossDefeated:false};
        GS.player.storyProgress[chId].stages[en.id] = true;
        if (en.isBoss) GS.player.storyProgress[chId].bossDefeated = true;
      }
      // Drop card
      if (Math.random() < (en.isBoss ? 0.9 : 0.4)) {
        cardEarned = en.cardPool[rand(0, en.cardPool.length-1)];
        GS.player.collection.push(cardEarned);
      }
      saveGame();
    }
    document.getElementById('result-title').textContent = '🏆 VICTORY!';
    document.getElementById('result-title').className = 'result-title victory';
    document.getElementById('result-art').textContent = '🎉';
    let rewardHTML = '';
    if (!GS.ui.isMultiplayer) {
      rewardHTML = `<div class="reward-item">💰 Gold earned: +${goldEarned}</div>`;
      if (cardEarned) { const c = getCard(cardEarned); rewardHTML += `<div class="reward-item">🃏 Card drop: ${c.art} ${c.name} [${RARITY_DATA[c.rarity].name}]</div>`; }
    } else {
      rewardHTML = `<div class="reward-item">🏆 ${B.player.name} wins!</div>`;
    }
    document.getElementById('result-rewards').innerHTML = rewardHTML;
  } else {
    addLog(`💀 DEFEAT! ${B.enemy.name} wins.`, 'sys');
    document.getElementById('result-title').textContent = '💀 DEFEAT!';
    document.getElementById('result-title').className = 'result-title defeat';
    document.getElementById('result-art').textContent = '😵';
    document.getElementById('result-rewards').innerHTML = '<div class="reward-item">Keep trying, warrior!</div>';
  }
  openModal('modal-result');
}

function onBattleResultContinue() {
  closeModal('modal-result');
  showScreen('story');
}

// ---- AI ----
function runAI() {
  const B = GS.battle;
  if (!B || B.turn !== 'enemy') return;
  const ai = GS.ui.currentEnemy?.ai || 'balanced';
  const e = B.enemy;
  const p = B.player;
  let plays = 0;
  const maxPlays = ai.includes('boss') ? 3 : 2;

  const tryPlayCard = () => {
    if (!B || B.turn !== 'enemy') return;
    if (plays >= maxPlays) { setTimeout(() => { if (GS.battle) { addLog(`⏩ ${e.name} ends turn.`,'sys'); B.turn='done'; startPlayerTurn(); }}, 400); return; }
    // Choose a card
    const affordable = e.hand.filter(c => c.manaCost <= e.mana);
    if (affordable.length === 0) { setTimeout(() => { if(GS.battle){ addLog(`⏩ ${e.name} ends turn.`,'sys'); startPlayerTurn(); }}, 400); return; }
    let chosen;
    if (e.hp < e.maxHp * 0.3 && affordable.some(c => c.effect.action==='heal' || c.effect.selfHeal)) {
      chosen = affordable.find(c => c.effect.action==='heal'||c.effect.selfHeal) || affordable[rand(0,affordable.length-1)];
    } else if (p.hp < 10 && affordable.some(c => (c.effect.value||0) >= 6)) {
      chosen = affordable.filter(c=>(c.effect.value||0)>=6).sort((a,b)=>(b.effect.value||0)-(a.effect.value||0))[0];
    } else {
      chosen = affordable.sort((a,b)=>(b.effect.value||0)-(a.effect.value||0))[rand(0,Math.min(1,affordable.length-1))];
    }
    const idx = e.hand.indexOf(chosen);
    if (idx >= 0) { playCard('enemy', idx); plays++; }
    if (checkBattleEnd()) return;
    updateBattleUI();
    setTimeout(tryPlayCard, 700);
  };
  setTimeout(tryPlayCard, 600);
}

// ---- Battle UI update ----
function updateBattleUI(mode) {
  const B = GS.battle;
  if (!B) return;
  const p = B.player, e = B.enemy;

  // HP bars
  updateHPBar('player', p.hp, p.maxHp);
  updateHPBar('enemy', e.hp, e.maxHp);
  // Mana dots
  renderManaDots('player-mana-dots', p.mana, p.maxMana);
  renderManaDots('enemy-mana-dots', e.mana, e.maxMana);
  document.getElementById('player-mana-text').textContent = `${p.mana}/${p.maxMana}`;
  document.getElementById('enemy-mana-text').textContent = `${e.mana}/${e.maxMana}`;
  // Deck counts
  document.getElementById('player-deck-count').textContent = p.deck.length;
  document.getElementById('enemy-deck-count').textContent = e.deck.length;
  // Enemy hand backs
  const ehd = document.getElementById('enemy-hand-display');
  ehd.innerHTML = '';
  for (let i = 0; i < e.hand.length; i++) { const cb = document.createElement('div'); cb.className='card-back'; ehd.appendChild(cb); }
  // Status badges
  renderStatusBadges('player-status-row', p);
  renderStatusBadges('enemy-status-row', e);
  // Fields (companions)
  renderField('player-field', p);
  renderField('enemy-field', e);
  // Player hand
  if (mode !== 'enemyActive') renderPlayerHand();
}

function updateHPBar(who, hp, maxHp) {
  const pct = Math.max(0, hp/maxHp*100);
  const bar = document.getElementById(`${who}-hp-bar`);
  const txt = document.getElementById(`${who}-hp-text`);
  if (!bar||!txt) return;
  bar.style.width = pct + '%';
  bar.className = 'hp-bar-inner' + (pct < 25 ? ' low' : pct < 50 ? ' mid' : '');
  txt.textContent = `${Math.max(0,hp)}/${maxHp}`;
}

function renderManaDots(elId, cur, max) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < max; i++) {
    const d = document.createElement('div');
    d.className = 'mana-dot' + (i < cur ? ' filled' : '');
    el.appendChild(d);
  }
}

function renderStatusBadges(elId, c) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '';
  const add = (cls, txt) => { const b=document.createElement('div'); b.className=`status-badge ${cls}`; b.textContent=txt; el.appendChild(b); };
  if (c.shield > 0) add('shield', `🛡️${c.shield}`);
  if (c.statuses.burn) add('burn', `🔥${c.statuses.burn.turns}`);
  if (c.statuses.poison) add('poison', `☠️${c.statuses.poison.turns}`);
  if (c.isSkippingTurn) add('freeze', `❄️FROZEN`);
  if (c.buffs.atkBonus) add('buff', `⬆️ATK+${c.buffs.atkBonus.value}`);
  if (c.buffs.atkPenalty) add('debuff', `⬇️ATK-${c.buffs.atkPenalty.value}`);
  if (c.hasDeathMark) add('debuff', `💀MARKED`);
  if (c.hasTrap) add('status', `⚙️TRAP`);
  if (c.hasReflect) add('status', `🪞REFLECT`);
  if (c.hasBarrier) add('status', `🧱BARRIER`);
}

function renderField(elId, c) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '';
  if (c.companion) {
    const d = document.createElement('div');
    d.className = 'companion-display';
    d.innerHTML = `👾 ${c.companion.atk}ATK (${c.companion.turnsLeft}T)`;
    el.appendChild(d);
  }
}

function renderPlayerHand() {
  const B = GS.battle;
  if (!B) return;
  const hand = document.getElementById('player-hand');
  if (!hand) return;
  hand.innerHTML = '';
  const isPlayerTurn = B.turn === 'player';
  B.player.hand.forEach((card, i) => {
    const el = buildCardEl(card.id, {});
    if (!el) return;
    if (!isPlayerTurn || card.manaCost > B.player.mana) el.classList.add('grayed');
    el.addEventListener('click', () => {
      if (!isPlayerTurn) return;
      if (card.manaCost > B.player.mana) { addLog(`⚠️ Not enough mana for ${card.name}!`, 'sys'); return; }
      playCard('player', i);
    });
    // tooltip
    el.title = `${card.name} — ${card.description}`;
    hand.appendChild(el);
  });
}

function renderMultiplayerHand() {
  const B = GS.battle;
  if (!B) return;
  const hand = document.getElementById('player-hand');
  if (!hand) return;
  hand.innerHTML = '';
  B.enemy.hand.forEach((card, i) => {
    const el = buildCardEl(card.id, {});
    if (!el) return;
    if (card.manaCost > B.enemy.mana) el.classList.add('grayed');
    el.addEventListener('click', () => {
      if (card.manaCost > B.enemy.mana) { addLog(`⚠️ Not enough mana!`, 'sys'); return; }
      playCard('enemy', i);
    });
    el.title = `${card.name} — ${card.description}`;
    hand.appendChild(el);
  });
  document.getElementById('btn-end-turn').onclick = endEnemyTurnMultiplayer;
}

function clearSelectionUI() {
  document.querySelectorAll('#player-hand .card.selected').forEach(c => c.classList.remove('selected'));
  GS.ui.selectedCardIndex = null;
  document.getElementById('selected-card-info').textContent = 'Select a card to play';
}

// ---- Battle Log ----
function addLog(msg, type = '') {
  if (!GS.battle) return;
  const logEl = document.getElementById('battle-log');
  if (!logEl) return;
  const d = document.createElement('div');
  d.className = `log-entry ${type}`;
  d.textContent = msg;
  logEl.appendChild(d);
  logEl.scrollTop = logEl.scrollHeight;
  GS.battle.log.push(msg);
}

// ============================================================
//  COLLECTION
// ============================================================
let collectionFilter = 'all';

function renderCollection() {
  const grid = document.getElementById('collection-grid');
  const count = document.getElementById('col-count');
  if (!grid) return;
  grid.innerHTML = '';
  const owned = GS.player.collection;
  const unique = [...new Set(owned)];
  count.textContent = unique.length;

  unique.filter(id => {
    const c = getCard(id);
    if (!c) return false;
    if (collectionFilter === 'all') return true;
    if (['LEGENDARY','EPIC','MYTHIC','SECRET','RARE'].includes(collectionFilter)) return c.rarity === collectionFilter;
    return c.type === collectionFilter;
  }).forEach(id => {
    const qty = owned.filter(x=>x===id).length;
    const el = buildCardEl(id, { onClick: () => openCardDetail(id) });
    if (!el) return;
    if (qty > 1) {
      const badge = document.createElement('div');
      badge.style.cssText = 'position:absolute;bottom:3px;left:3px;background:#000;color:#ffcc00;font-size:5px;padding:1px 3px;border:1px solid #ffcc00';
      badge.textContent = `x${qty}`;
      el.appendChild(badge);
    }
    grid.appendChild(el);
  });
}

function filterCollection(filter, btn) {
  collectionFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCollection();
}

// ============================================================
//  DECK BUILDER
// ============================================================
function renderDeckBuilder() {
  const cGrid = document.getElementById('db-collection-grid');
  const dList = document.getElementById('db-deck-list');
  const dCount = document.getElementById('db-deck-count');
  if (!cGrid) return;

  // Init temp deck from saved deck
  if (!GS.ui.dbDeck || GS.ui.dbDeck.length === 0) GS.ui.dbDeck = [...GS.player.deck];

  cGrid.innerHTML = '';
  const unique = [...new Set(GS.player.collection)];
  unique.forEach(id => {
    const el = buildCardEl(id, {});
    if (!el) return;
    el.title = getCard(id)?.description || '';
    el.addEventListener('click', () => {
      if (GS.ui.dbDeck.length >= 15) { alert('Deck is full! (Max 15 cards)'); return; }
      // Check max 3 copies
      const copies = GS.ui.dbDeck.filter(x=>x===id).length;
      if (copies >= 3) { alert('Max 3 copies of a card!'); return; }
      GS.ui.dbDeck.push(id);
      renderDBDeckList();
    });
    cGrid.appendChild(el);
  });

  renderDBDeckList();
}

function renderDBDeckList() {
  const dList = document.getElementById('db-deck-list');
  const dCount = document.getElementById('db-deck-count');
  if (!dList) return;
  dList.innerHTML = '';
  dCount.textContent = GS.ui.dbDeck.length;

  // Group by card id
  const grouped = {};
  GS.ui.dbDeck.forEach(id => { grouped[id] = (grouped[id]||0)+1; });
  Object.entries(grouped).forEach(([id, qty]) => {
    const card = getCard(id);
    if (!card) return;
    const rd = RARITY_DATA[card.rarity] || RARITY_DATA.COMMON;
    const item = document.createElement('div');
    item.className = 'deck-list-item';
    item.style.borderColor = rd.color + '44';
    item.innerHTML = `
      <span class="item-art">${card.art}</span>
      <span class="item-name" style="color:${rd.color}">${card.name} ${qty>1?`x${qty}`:''}</span>
      <span style="font-size:5px;color:var(--mana)">${card.manaCost}M</span>
      <span class="item-remove" onclick="removeFromDeck('${id}')">✕</span>
    `;
    dList.appendChild(item);
  });
}

function removeFromDeck(id) {
  const idx = GS.ui.dbDeck.lastIndexOf(id);
  if (idx >= 0) { GS.ui.dbDeck.splice(idx,1); renderDBDeckList(); }
}

function saveDeck() {
  if (GS.ui.dbDeck.length === 0) { alert('Deck is empty!'); return; }
  if (GS.ui.dbDeck.length < 5) { alert('Deck needs at least 5 cards!'); return; }
  GS.player.deck = [...GS.ui.dbDeck];
  saveGame();
  alert('✅ Deck saved!');
}

function clearDeck() { GS.ui.dbDeck = []; renderDBDeckList(); }

// ============================================================
//  SHOP
// ============================================================
const PACK_CONFIGS = {
  basic:     { cost:100,  count:3,  minRarity:'COMMON',    rarityWeights:{COMMON:60,UNCOMMON:35,RARE:5} },
  rare:      { cost:300,  count:3,  minRarity:'RARE',      rarityWeights:{COMMON:20,UNCOMMON:30,RARE:40,EPIC:9,LEGENDARY:1} },
  epic:      { cost:800,  count:4,  minRarity:'EPIC',      rarityWeights:{COMMON:5,UNCOMMON:15,RARE:30,EPIC:40,LEGENDARY:8,SECRET:2} },
  legendary: { cost:2000, count:5,  minRarity:'LEGENDARY', rarityWeights:{RARE:10,EPIC:25,LEGENDARY:45,SECRET:12,MYTHIC:8} },
};

function renderShop() {
  document.getElementById('shop-gold').textContent = GS.player.gold;
}

function buyPack(type) {
  const pack = PACK_CONFIGS[type];
  if (GS.player.gold < pack.cost) { alert(`Not enough gold! Need ${pack.cost} 💰`); return; }
  GS.player.gold -= pack.cost;
  const cards = [];
  for (let i = 0; i < pack.count; i++) {
    const rarity = weightedRandom(pack.rarityWeights);
    const pool = CARD_DB.filter(c => (RARITY_DATA[c.rarity]?.order||0) >= (RARITY_DATA[rarity]?.order||0));
    const card = pool.length ? pool[rand(0,pool.length-1)] : CARD_DB[rand(0,CARD_DB.length-1)];
    cards.push(card);
    GS.player.collection.push(card.id);
  }
  saveGame();
  document.getElementById('shop-gold').textContent = GS.player.gold;
  document.getElementById('menu-gold').textContent = GS.player.gold;
  // Show pack opening modal
  const reveal = document.getElementById('pack-cards-reveal');
  reveal.innerHTML = '';
  cards.forEach(card => {
    const el = buildCardEl(card.id, {});
    if (el) reveal.appendChild(el);
  });
  openModal('modal-pack');
}

function weightedRandom(weights) {
  const total = Object.values(weights).reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for (const [key, w] of Object.entries(weights)) { r -= w; if (r <= 0) return key; }
  return Object.keys(weights)[0];
}

// ============================================================
//  CARD DETAIL MODAL
// ============================================================
let detailCardId = null;

function openCardDetail(id) {
  const card = getCard(id);
  if (!card) return;
  detailCardId = id;
  const rd = RARITY_DATA[card.rarity];
  const lv = cardLevel(id);
  document.getElementById('detail-art').textContent = card.art;
  document.getElementById('detail-name').textContent = card.name;
  document.getElementById('detail-type').textContent = card.type.toUpperCase();
  document.getElementById('detail-rarity-badge').textContent = `${rd.gem} ${rd.name}`;
  document.getElementById('detail-rarity-badge').style.color = rd.color;
  document.getElementById('detail-cost').textContent = card.manaCost;
  document.getElementById('detail-desc').textContent = card.description;
  document.getElementById('detail-lore').textContent = card.lore;
  document.getElementById('detail-level').textContent = lv;
  document.getElementById('detail-maxlevel').textContent = card.maxLevel || 5;
  const upgradeCosts = [100,300,600,1000,2000];
  const uc = lv < (card.maxLevel||5) ? upgradeCosts[lv-1] : null;
  const upgradeSection = document.getElementById('detail-upgrade-section');
  if (uc) {
    upgradeSection.style.display = 'block';
    document.getElementById('detail-upgrade-cost').textContent = uc;
    document.getElementById('btn-upgrade-card').className = GS.player.gold >= uc ? 'px-btn success' : 'px-btn disabled';
  } else {
    upgradeSection.style.display = 'none';
  }
  document.getElementById('modal-card-detail').style.setProperty('--detail-border', rd.color);
  openModal('modal-card-detail');
}

function upgradeCard() {
  if (!detailCardId) return;
  const lv = cardLevel(detailCardId);
  const maxLv = getCard(detailCardId)?.maxLevel || 5;
  if (lv >= maxLv) { alert('Already at max level!'); return; }
  const costs = [100,300,600,1000,2000];
  const cost = costs[lv-1];
  if (GS.player.gold < cost) { alert(`Need ${cost} gold!`); return; }
  GS.player.gold -= cost;
  GS.player.cardLevels[detailCardId] = lv + 1;
  saveGame();
  addLog?.(`⬆️ ${getCard(detailCardId)?.name} upgraded to Lv${lv+1}!`, 'sys');
  openCardDetail(detailCardId);
}

// ============================================================
//  CODEX
// ============================================================
function renderCodex() {
  const grid = document.getElementById('codex-grid');
  if (!grid) return;
  grid.innerHTML = '';
  CARD_DB.forEach(card => {
    const owned = GS.player.collection.includes(card.id);
    const div = document.createElement('div');
    div.className = 'codex-entry' + (owned ? '' : ' locked-entry');
    div.innerHTML = `<div class="ce-art">${card.art}</div><div class="ce-name">${card.name}</div><div class="ce-lore">${owned ? card.lore.substring(0,60)+'...' : '???'}</div>`;
    div.addEventListener('click', () => {
      document.getElementById('codex-detail-art').textContent = card.art;
      document.getElementById('codex-detail-name').textContent = owned ? card.name : '???';
      document.getElementById('codex-detail-desc').textContent = owned ? card.description : 'Obtain this card to unlock its secrets.';
      document.getElementById('codex-detail-lore').textContent = owned ? card.lore : '???';
      document.getElementById('codex-detail-type').textContent = owned ? card.type.toUpperCase() : '???';
      document.getElementById('codex-detail-rarity').textContent = owned ? (RARITY_DATA[card.rarity]?.name || '') : '???';
      openModal('modal-codex-detail');
    });
    grid.appendChild(div);
  });
}

// ============================================================
//  INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  const loaded = loadGame();
  if (!loaded || GS.player.collection.length === 0) newGame();
  // Reset temp deck builder
  GS.ui.dbDeck = [...GS.player.deck];
  showScreen('mainmenu');
});
