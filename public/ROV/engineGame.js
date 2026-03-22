//  REALM OF VICTORY (ROV) — Game Engine
// ============================================================
'use strict';

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
  attack:'#3a0808', defense:'#080838', spell:'#1a0838', trap:'#1a1008',
  summon:'#08200a', buff:'#2a1c00',    debuff:'#1a0808', curse:'#200010',
  heal:'#002020',   counter:'#080820', drain:'#100020', burn:'#2a0800',
  freeze:'#001828', thunder:'#1a1800', poison:'#0a1a00', revive:'#1a0000',
  steal:'#0a0a10',  sacrifice:'#1a0800', barrier:'#181828', combo:'#1a0e00',
  echo:'#000a1a',   chaos:'#0a0a0a',  divine:'#1a1a00', shadow:'#050510',
  timewarp:'#100020', void:'#020202', frenzy:'#2a0000', fusion:'#001a14',
  default:'#0f0f2a',
};

const CARD_DB = [
  { id:'c001', name:'Sword Slash',    type:'attack',    rarity:'COMMON',    manaCost:1, art:'⚔️',  power:4,  description:'Deal 4 damage.',                               effect:{action:'damage',value:4},                                                    lore:'The first strike every knight learns in the Eternal Academy.', level:1, maxLevel:5 },
  { id:'c002', name:'Fire Arrow',     type:'burn',      rarity:'UNCOMMON',  manaCost:2, art:'🔥',  power:3,  description:'Deal 3 damage + Burn 2 turns (1 dmg/turn).',    effect:{action:'damage',value:3,dot:{type:'burn',value:1,turns:2}},                  lore:'Archers of the Flame Order coat arrows in eternal fire.', level:1, maxLevel:5 },
  { id:'c003', name:'Dragon Fang',    type:'attack',    rarity:'RARE',      manaCost:4, art:'🐉',  power:8,  description:'Deal 8 damage.',                               effect:{action:'damage',value:8},                                                    lore:'A shard from the first dragon. Pierces any armor.', level:1, maxLevel:5 },
  { id:'c004', name:'Void Strike',    type:'shadow',    rarity:'EPIC',      manaCost:3, art:'🌑',  power:6,  description:'Deal 6 damage. Ignores all shields.',          effect:{action:'damage',value:6,ignoreShield:true},                                  lore:'From the void between worlds, this strike touches the soul directly.', level:1, maxLevel:5 },
  { id:'c005', name:'Divine Wrath',   type:'divine',    rarity:'LEGENDARY', manaCost:5, art:'☀️',  power:10, description:'Deal 10 damage + heal self 3 HP.',             effect:{action:'damage',value:10,selfHeal:3},                                        lore:'The gods themselves weep when this power is invoked.', level:1, maxLevel:5 },
  { id:'c006', name:'Iron Shield',    type:'defense',   rarity:'COMMON',    manaCost:2, art:'🛡️',  power:0,  description:'Block 5 damage this turn.',                    effect:{action:'shield',value:5},                                                    lore:'Standard issue to all soldiers of the Royal Guard.', level:1, maxLevel:5 },
  { id:'c007', name:'Holy Ward',      type:'defense',   rarity:'RARE',      manaCost:3, art:'✝️',  power:0,  description:'Block 8 damage + gain 2 shield next turn.',    effect:{action:'shield',value:8,nextShield:2},                                       lore:'Blessed by the High Priest of Eternity.', level:1, maxLevel:5 },
  { id:'c008', name:'Mirror Barrier', type:'counter',   rarity:'EPIC',      manaCost:4, art:'🪞',  power:0,  description:'Reflect the next damage back at the enemy.',    effect:{action:'reflect'},                                                           lore:'A perfect mirror forged from moonlight and ancient runes.', level:1, maxLevel:5 },
  { id:'c009', name:'Fireball',       type:'spell',     rarity:'UNCOMMON',  manaCost:3, art:'🔮',  power:6,  description:'Deal 6 damage + Burn 2 turns (2 dmg/turn).',    effect:{action:'damage',value:6,dot:{type:'burn',value:2,turns:2}},                  lore:'The classic spell of destruction. Never gets old.', level:1, maxLevel:5 },
  { id:'c010', name:'Lightning Bolt', type:'thunder',   rarity:'RARE',      manaCost:3, art:'⚡',  power:5,  description:'Deal 5 dmg. +3 if enemy has status effect.',   effect:{action:'bonusIfStatus',value:5,bonusIfStatus:3},                             lore:'Called down from the storm clouds of the Eternal Mountains.', level:1, maxLevel:5 },
  { id:'c011', name:'Blizzard',       type:'freeze',    rarity:'EPIC',      manaCost:4, art:'❄️',  power:0,  description:'Freeze enemy. They skip their next turn.',     effect:{action:'freeze',turns:1},                                                    lore:'The coldest winter of Eternity condensed into a moment.', level:1, maxLevel:5 },
  { id:'c012', name:'Time Warp',      type:'timewarp',  rarity:'RARE',      manaCost:3, art:'⏰',  power:0,  description:'Gain +1 extra card play this turn.',           effect:{action:'extraPlay'},                                                          lore:'A forbidden spell that bends the fabric of time itself.', level:1, maxLevel:5 },
  { id:'c013', name:'Chaos Bolt',     type:'chaos',     rarity:'UNCOMMON',  manaCost:2, art:'🎲',  power:0,  description:'Random: deal 2-12 dmg OR gain 0-4 mana.',      effect:{action:'chaos'},                                                             lore:'Even its caster does not know what will happen.', level:1, maxLevel:5 },
  { id:'c014', name:'Spike Trap',     type:'trap',      rarity:'COMMON',    manaCost:2, art:'⚙️',  power:4,  description:'Set trap: next enemy attack triggers 4 dmg.',   effect:{action:'trap',triggerOn:'attacked',returnDmg:4},                            lore:'Set in the dead of night by rogues of the Shadow Order.', level:1, maxLevel:5 },
  { id:'c015', name:'Poison Mist',    type:'poison',    rarity:'RARE',      manaCost:3, art:'☠️',  power:0,  description:'Poison enemy for 3 turns (2 dmg/turn).',       effect:{action:'dot',dot:{type:'poison',value:2,turns:3}},                           lore:'A mist that lingers long after the battle seems over.', level:1, maxLevel:5 },
  { id:'c016', name:'Void Trap',      type:'void',      rarity:'LEGENDARY', manaCost:5, art:'🕳️',  power:0,  description:'Remove top card of enemy deck permanently.',    effect:{action:'banishEnemyCard'},                                                   lore:'What the Void takes, it never returns.', level:1, maxLevel:5 },
  { id:'c017', name:'Forest Sprite',  type:'summon',    rarity:'UNCOMMON',  manaCost:3, art:'🌿',  power:3,  description:'Summon companion: 3 ATK for 2 turns.',         effect:{action:'summon',companion:{atk:3,turns:2}},                                  lore:'A guardian spirit of the Eternal Forest, small but fierce.', level:1, maxLevel:5 },
  { id:'c018', name:'Stone Golem',    type:'summon',    rarity:'RARE',      manaCost:4, art:'🗿',  power:2,  description:'Summon: 2 ATK + 4 shield per turn, 3 turns.',   effect:{action:'summon',companion:{atk:2,shield:4,turns:3}},                         lore:'Ancient stone given life by the Earth Mages of old.', level:1, maxLevel:5 },
  { id:'c019', name:'Dragon Knight',  type:'summon',    rarity:'LEGENDARY', manaCost:6, art:'🐲',  power:6,  description:'Summon: 6 ATK for 3 turns. Deals 3 on entry.', effect:{action:'summon',companion:{atk:6,turns:3},summonEffect:{action:'damage',value:3}}, lore:'A knight bonded to a dragon since birth. Neither fights alone.', level:1, maxLevel:5 },
  { id:'c020', name:'Battle Cry',     type:'buff',      rarity:'COMMON',    manaCost:2, art:'📯',  power:0,  description:'Next 2 attacks deal +3 bonus damage.',         effect:{action:'buff',stat:'atkBonus',value:3,uses:2},                               lore:'A war cry passed down through generations of warriors.', level:1, maxLevel:5 },
  { id:'c021', name:'Mana Surge',     type:'buff',      rarity:'RARE',      manaCost:0, art:'💧',  power:0,  description:'Instantly gain +3 mana.',                      effect:{action:'gainMana',value:3},                                                  lore:'A surge of arcane energy from the ley lines beneath the kingdom.', level:1, maxLevel:5 },
  { id:'c022', name:'Berserker Rage', type:'frenzy',    rarity:'EPIC',      manaCost:4, art:'😤',  power:0,  description:'Deal 5 dmg 3 times. Lose 5 HP.',               effect:{action:'multiDamage',value:5,hits:3,selfDamage:5},                           lore:'Pure uncontrolled fury. Even the user is not safe.', level:1, maxLevel:5 },
  { id:'c023', name:'Weaken Curse',   type:'curse',     rarity:'UNCOMMON',  manaCost:2, art:'💔',  power:0,  description:'Enemy attacks deal -3 dmg for 2 turns.',       effect:{action:'debuff',stat:'atkPenalty',value:3,turns:2},                          lore:'A whispered hex that saps the strength from a warrior.', level:1, maxLevel:5 },
  { id:'c024', name:'Drain Soul',     type:'drain',     rarity:'RARE',      manaCost:3, art:'👁️',  power:0,  description:'Steal 3 mana from enemy.',                     effect:{action:'drainMana',value:3},                                                 lore:'Your energy becomes mine. Your strength, mine to command.', level:1, maxLevel:5 },
  { id:'c025', name:'Death Mark',     type:'curse',     rarity:'EPIC',      manaCost:4, art:'💀',  power:0,  description:'Enemy takes +50% damage for 2 turns.',         effect:{action:'markEnemy',multiplier:1.5,turns:2},                                  lore:'Once marked, the reaper follows your every step.', level:1, maxLevel:5 },
  { id:'c026', name:'Phoenix Rise',   type:'revive',    rarity:'LEGENDARY', manaCost:5, art:'🦅',  power:0,  description:'If HP < 10: restore to 20 HP + deal 5 dmg.',   effect:{action:'conditionalHeal',threshold:10,healTo:20,alsoDeals:5},                lore:'From the ashes of defeat rises the will to conquer.', level:1, maxLevel:5 },
  { id:'c027', name:'Soul Steal',     type:'steal',     rarity:'EPIC',      manaCost:4, art:'🌀',  power:0,  description:'Copy a random card from enemy deck to hand.',  effect:{action:'copyEnemyCard'},                                                      lore:'Knowledge is power. Power is everything.', level:1, maxLevel:5 },
  { id:'c028', name:'Sacrifice',      type:'sacrifice', rarity:'LEGENDARY', manaCost:3, art:'🩸',  power:15, description:'Lose 10 HP. Deal 15 damage to enemy.',         effect:{action:'sacrifice',selfDamage:10,dealDamage:15},                             lore:'Blood for power. Pain for victory.', level:1, maxLevel:5 },
  { id:'c029', name:'Echo Chamber',   type:'echo',      rarity:'RARE',      manaCost:1, art:'🔁',  power:0,  description:'Replay the last card you played (free copy).',  effect:{action:'echo'},                                                              lore:'History repeats itself, especially in battle.', level:1, maxLevel:5 },
  { id:'c030', name:'Combo Breaker',  type:'combo',     rarity:'EPIC',      manaCost:2, art:'💥',  power:8,  description:'If 3rd+ card this turn, deal 8 bonus damage.',  effect:{action:'comboStrike',bonusDmg:8,threshold:3},                                lore:'The third blow breaks all defenses.', level:1, maxLevel:5 },
  { id:'c031', name:'Mythic Annihilation', type:'void', rarity:'MYTHIC',    manaCost:8, art:'💠',  power:20, description:'Deal 20 damage + heal 10 HP. Uncounterable.',   effect:{action:'damage',value:20,selfHeal:10,uncounterable:true},                    lore:'Beyond legend. Beyond myth. This is absolute power.', level:1, maxLevel:5 },
  { id:'c032', name:'Secret Summon',  type:'summon',    rarity:'SECRET',    manaCost:6, art:'❓',  power:0,  description:'Summon a random legendary companion.',          effect:{action:'secretSummon'},                                                      lore:'The identity of this summon is unknown even to its caster.', level:1, maxLevel:5 },
  { id:'c033', name:'Healing Potion', type:'heal',      rarity:'COMMON',    manaCost:2, art:'💊',  power:0,  description:'Restore 6 HP.',                                effect:{action:'heal',value:6},                                                      lore:'Brewed by the healers of the Eternal Kingdom.', level:1, maxLevel:5 },
  { id:'c034', name:'Greater Healing',type:'heal',      rarity:'RARE',      manaCost:4, art:'💖',  power:0,  description:'Restore 12 HP.',                               effect:{action:'heal',value:12},                                                     lore:'Ancient healing magic passed down from the first saints.', level:1, maxLevel:5 },
  { id:'c035', name:'Barrier Wall',   type:'barrier',   rarity:'UNCOMMON',  manaCost:2, art:'🧱',  power:0,  description:'Immune to next attack card.',                  effect:{action:'barrier',blockType:'attack'},                                        lore:'Stone walls erected in an instant by earth magic.', level:1, maxLevel:5 },
];

const ENEMY_DB = [
  { id:'e001', name:'Goblin Scout',     ch:1, st:1, isBoss:false, hp:20, art:'👺', deck:['c001','c001','c006','c013','c020','c001','c006','c033'],                       gold:50,  cardPool:['c001','c006','c013'],       ai:'aggressive' },
  { id:'e002', name:'Forest Witch',     ch:1, st:2, isBoss:false, hp:28, art:'🧙', deck:['c009','c015','c023','c013','c006','c033','c002','c009','c015'],                gold:80,  cardPool:['c009','c015','c023'],       ai:'balanced'   },
  { id:'e003', name:'Tree Guardian',    ch:1, st:3, isBoss:false, hp:35, art:'🌳', deck:['c006','c007','c018','c020','c003','c006','c035','c018'],                       gold:100, cardPool:['c007','c018','c035'],       ai:'defensive'  },
  { id:'e004', name:'Shadow Wolf King', ch:1, st:4, isBoss:true,  hp:50, art:'🐺', deck:['c004','c003','c011','c025','c022','c004','c003','c015','c011','c008'],         gold:250, cardPool:['c004','c011','c025'],       ai:'boss_agro'  },
  { id:'e005', name:'Dark Knight',      ch:2, st:1, isBoss:false, hp:40, art:'🗡️', deck:['c003','c022','c001','c020','c006','c003','c023','c001'],                       gold:130, cardPool:['c003','c022','c020'],       ai:'aggressive' },
  { id:'e006', name:'Undead Archer',    ch:2, st:2, isBoss:false, hp:35, art:'🏹', deck:['c002','c015','c010','c002','c023','c014','c002','c015'],                       gold:150, cardPool:['c002','c010','c014'],       ai:'tactical'   },
  { id:'e007', name:'Bone Mage',        ch:2, st:3, isBoss:false, hp:38, art:'💀', deck:['c009','c011','c025','c024','c016','c009','c025','c011'],                       gold:180, cardPool:['c009','c025','c016'],       ai:'tactical'   },
  { id:'e008', name:'Lord Malachar',    ch:2, st:4, isBoss:true,  hp:65, art:'👑', deck:['c004','c025','c011','c022','c024','c028','c004','c016','c025','c022','c008'],  gold:400, cardPool:['c028','c027','c016'],       ai:'boss_tactical' },
  { id:'e009', name:'Void Paladin',     ch:3, st:1, isBoss:false, hp:50, art:'⚫', deck:['c004','c008','c025','c007','c004','c022','c008','c025'],                       gold:200, cardPool:['c004','c008','c022'],       ai:'balanced'   },
  { id:'e010', name:'Dragon Warden',    ch:3, st:2, isBoss:false, hp:55, art:'🔱', deck:['c019','c003','c022','c005','c019','c003','c020','c022'],                       gold:250, cardPool:['c019','c005','c030'],       ai:'aggressive' },
  { id:'e011', name:'Eternal Guardian', ch:3, st:3, isBoss:false, hp:60, art:'⚜️', deck:['c031','c007','c008','c025','c011','c022','c031','c007','c028'],                gold:300, cardPool:['c031','c029','c030'],       ai:'defensive'  },
  { id:'e012', name:'Void Emperor',     ch:3, st:4, isBoss:true,  hp:80, art:'🌌', deck:['c031','c004','c025','c028','c011','c022','c031','c016','c004','c027','c025','c028'], gold:1000, cardPool:['c031','c032','c005'], ai:'boss_tactical' },
];

const STORY_DB = [
  { id:'ch1', title:'Chapter 1: Forest of Whispers',  art:'🌲', desc:'A darkness spreads through the Eternal Forest. Uncover its source.',            stages:['e001','e002','e003','e004'], unlock:'c017' },
  { id:'ch2', title:'Chapter 2: The Dark Citadel',    art:'🏰', desc:'Lord Malachar\'s fortress looms. Storm the gates and defeat his champions!',    stages:['e005','e006','e007','e008'], unlock:'c019', requires:'ch1' },
  { id:'ch3', title:'Chapter 3: The Eternal Throne',  art:'👑', desc:'The Void Emperor sits on the Eternal Throne. This is the final battle.',        stages:['e009','e010','e011','e012'], unlock:'c031', requires:'ch2' },
];

let GS = {
  player: { gold:200, collection:[], deck:[], cardLevels:{}, storyProgress:{ch1:{stages:{},bossDefeated:false},ch2:{stages:{},bossDefeated:false},ch3:{stages:{},bossDefeated:false}} },
  battle: null,
  ui: { screen:'mainmenu', filterActive:'all', dbDeck:[], selectedCardIndex:null, currentEnemy:null, isMultiplayer:false, mpP1Name:'Player 1', mpP2Name:'Player 2' }
};

const SAVE_KEY = 'rov_save_v2';
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(GS.player)); } catch(e){} }
function loadGame() { try { const d=localStorage.getItem(SAVE_KEY); if(d){ GS.player=JSON.parse(d); return true; } } catch(e){} return false; }
function newGame() {
  GS.player = {
    gold:200, cardLevels:{},
    storyProgress:{ch1:{stages:{},bossDefeated:false},ch2:{stages:{},bossDefeated:false},ch3:{stages:{},bossDefeated:false}},
    collection:['c001','c001','c001','c006','c006','c020','c033','c033','c013','c009','c002','c014','c023','c017','c035','c021','c034','c012'],
    deck:['c001','c001','c006','c020','c033','c013','c009','c002','c014','c023','c017','c035','c006','c033','c021'],
  };
  saveGame();
}

function getCard(id) { return CARD_DB.find(c=>c.id===id); }
function getEnemy(id) { return ENEMY_DB.find(e=>e.id===id); }
function rand(min,max) { return Math.floor(Math.random()*(max-min+1))+min; }
function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function cardLevel(id) { return GS.player.cardLevels[id]||1; }
function scaledValue(base,level) { return Math.floor(base*(1+(level-1)*0.2)); }

// ---- SCREEN MANAGEMENT ----
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById('screen-'+name);
  if(el) { el.classList.add('active'); GS.ui.screen=name; }
  onScreenOpen(name);
}
function openModal(id) { const el=document.getElementById(id); if(el) el.classList.add('active'); }
function closeModal(id) { const el=document.getElementById(id); if(el) el.classList.remove('active'); }
function onScreenOpen(name) {
  if(name==='mainmenu')    renderMainMenu();
  else if(name==='story')       renderStoryMap();
  else if(name==='collection')  renderCollection();
  else if(name==='deckbuilder') renderDeckBuilder();
  else if(name==='shop')        renderShop();
  else if(name==='codex')       renderCodex();
}

function showTurnIndicator(text) {
  const el=document.createElement('div'); el.className='turn-indicator'; el.textContent=text;
  document.body.appendChild(el); setTimeout(()=>el.remove(),1200);
}
function showDamageFloat(dmg,targetEl,type='dmg') {
  const rect=targetEl?targetEl.getBoundingClientRect():{left:200,top:200,width:80,height:20};
  const el=document.createElement('div'); el.className=`dmg-floater ${type}`;
  el.textContent=type==='dmg'?`-${dmg}`:type==='heal'?`+${dmg}HP`:`+${dmg}MP`;
  el.style.left=(rect.left+rect.width/2-20)+'px'; el.style.top=(rect.top+window.scrollY-20)+'px';
  document.body.appendChild(el); setTimeout(()=>el.remove(),1000);
}

// ---- CARD ELEMENT BUILDER ----
function buildCardEl(cardId, opts) {
  const card=getCard(cardId); if(!card) return null;
  const rd=RARITY_DATA[card.rarity]||RARITY_DATA.COMMON;
  const typeBg=TYPE_COLORS[card.type]||TYPE_COLORS.default;
  const lv=cardLevel(cardId);
  const scaledPow=card.power?scaledValue(card.power,lv):0;
  const el=document.createElement('div');
  el.className='card'+(card.power===0?' no-power':'');
  el.style.setProperty('--card-rarity-color',rd.color);
  el.style.setProperty('--card-glow',rd.glow);
  el.style.setProperty('--card-bg',typeBg);
  el.style.setProperty('--card-type-color',typeBg);
  if(opts&&opts.extraClass) el.classList.add(opts.extraClass);
  el.innerHTML=`
    <div class="card-cost">${card.manaCost}</div>
    <div class="card-rarity-gem">${rd.gem}</div>
    <div class="card-art">${card.art}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-type-bar">${card.type}</div>
    ${card.power>0?`<div class="card-power">${scaledPow}</div>`:''}
    ${lv>1?`<div style="position:absolute;bottom:3px;left:3px;font-size:5px;color:#ffcc00">LV${lv}</div>`:''}
  `;
  if(opts&&opts.onClick) el.addEventListener('click',opts.onClick);
  return el;
}

// ---- MAIN MENU ----
function renderMainMenu() {
  const gEl=document.getElementById('menu-gold'); if(gEl) gEl.textContent=GS.player.gold;
  const starsBg=document.getElementById('stars-bg');
  if(starsBg&&starsBg.children.length===0) {
    for(let i=0;i<80;i++){
      const s=document.createElement('div'); s.className='star';
      s.style.left=Math.random()*100+'%'; s.style.top=Math.random()*100+'%';
      s.style.setProperty('--dur',(1.5+Math.random()*2)+'s');
      const sz=Math.random()>0.7?3:2; s.style.width=sz+'px'; s.style.height=sz+'px';
      starsBg.appendChild(s);
    }
  }
}

// ---- STORY MAP ----
function renderStoryMap() {
  const gEl=document.getElementById('story-gold'); if(gEl) gEl.textContent=GS.player.gold;
  const grid=document.getElementById('chapter-grid'); if(!grid) return;
  grid.innerHTML='';
  STORY_DB.forEach(ch=>{
    const prog=GS.player.storyProgress[ch.id]||{stages:{},bossDefeated:false};
    const locked=ch.requires&&!(GS.player.storyProgress[ch.requires]&&GS.player.storyProgress[ch.requires].bossDefeated);
    const allDone=!locked&&prog.bossDefeated;
    const div=document.createElement('div');
    div.className='chapter-card'+(locked?' locked':allDone?' completed':' active');
    const enemies=ch.stages.map(id=>getEnemy(id)).filter(Boolean);
    let stagesHTML='';
    enemies.forEach((en,i)=>{
      const done=!!(prog.stages&&prog.stages[en.id]);
      const canPlay=!locked&&(i===0||!!(prog.stages&&prog.stages[enemies[i-1]&&enemies[i-1].id])||done);
      stagesHTML+=`<button class="stage-btn${en.isBoss?' boss':''}${done?' completed':''}"
        onclick="startStoryBattle('${en.id}')"${(!canPlay&&!done)?' disabled':''}>
        ${en.art}${done?' ✓':''} ${en.isBoss?'[BOSS] ':''}${en.name}
      </button>`;
    });
    div.innerHTML=`
      <div class="chapter-title">${ch.art} ${ch.title} ${allDone?'✅':locked?'🔒':''}</div>
      <div class="chapter-desc">${ch.desc}</div>
      <div class="stages-row">${stagesHTML}</div>`;
    grid.appendChild(div);
  });
}

// ---- BATTLE ENGINE ----
function createCombatant(deckIds,maxHp,name,isAI) {
  const deck=shuffle(deckIds.map(id=>getCard(id)).filter(Boolean));
  const hand=[];
  for(let i=0;i<Math.min(5,deck.length);i++) hand.push(deck.shift());
  return { name,isAI,maxHp,hp:maxHp,mana:0,maxMana:6,deck,hand,discard:[],field:[],
    shield:0,nextShield:0,statuses:{},buffs:{},hasTrap:false,trapDmg:0,
    hasReflect:false,hasBarrier:false,hasDeathMark:false,companion:null,extraPlaysLeft:0,isSkippingTurn:false };
}

function startStoryBattle(enemyId) {
  if(!GS.player.deck||GS.player.deck.length===0){ alert('Your deck is empty! Add cards in Deck Builder first.'); return; }
  const enemy=getEnemy(enemyId); if(!enemy) return;
  GS.ui.currentEnemy=enemy; GS.ui.isMultiplayer=false;
  GS.battle={ mode:'story',enemyId,turn:'player',turnCount:0,cardsPlayedThisTurn:0,lastCardPlayed:null,
    player:createCombatant(GS.player.deck,30,'YOU',false),
    enemy:createCombatant(enemy.deck,enemy.hp,enemy.name,true), log:[] };
  showScreen('battle'); initBattleUI();
  addLog('⚔️ Battle starts! '+enemy.art+' '+enemy.name+' appears!','sys');
  startPlayerTurn();
}

function startMultiplayer() { openModal('modal-multiplayer'); }
function confirmMultiplayer() {
  closeModal('modal-multiplayer');
  const p1=document.getElementById('mp-p1-name').value.trim()||'Player 1';
  const p2=document.getElementById('mp-p2-name').value.trim()||'Player 2';
  GS.ui.mpP1Name=p1; GS.ui.mpP2Name=p2; GS.ui.isMultiplayer=true; GS.ui.currentEnemy=null;
  const d=GS.player.deck&&GS.player.deck.length?GS.player.deck:['c001','c001','c006','c009','c020','c033'];
  GS.battle={ mode:'multiplayer',turn:'player',turnCount:0,cardsPlayedThisTurn:0,lastCardPlayed:null,
    player:createCombatant(d,30,p1,false), enemy:createCombatant(d,30,p2,false), log:[] };
  showScreen('battle'); initBattleUI();
  addLog('👥 '+p1+' vs '+p2+'! Let the battle begin!','sys');
  startPlayerTurn();
}

function initBattleUI() {
  const B=GS.battle;
  const eArt=document.getElementById('enemy-art'); if(eArt) eArt.textContent=GS.ui.isMultiplayer?'👤':(GS.ui.currentEnemy?GS.ui.currentEnemy.art:'👺');
  const eName=document.getElementById('enemy-name'); if(eName) eName.textContent=B.enemy.name;
  const pName=document.getElementById('player-name-battle'); if(pName) pName.textContent=B.player.name;
  updateBattleUI();
}

function startPlayerTurn() {
  const B=GS.battle; if(!B) return;
  B.turn='player'; B.cardsPlayedThisTurn=0; B.turnCount++;
  const p=B.player;
  if(p.isSkippingTurn){ p.isSkippingTurn=false; addLog('❄️ YOU are frozen! Skipping turn.','status'); setTimeout(endPlayerTurn,1200); return; }
  p.maxMana=Math.min(10,B.turnCount); p.mana=p.maxMana;
  applyDOTs(p); if(checkBattleEnd()) return;
  doCompanionAttack(p,B.enemy); if(checkBattleEnd()) return;
  if(p.nextShield>0){ p.shield+=p.nextShield; p.nextShield=0; }
  drawCard(p); updateBattleUI();
  showTurnIndicator(GS.ui.isMultiplayer?p.name+'\'s TURN':'YOUR TURN');
  addLog('🔄 Turn '+B.turnCount+' — '+p.name+'\'s turn. Mana: '+p.mana+'/'+p.maxMana,'sys');
  const tl=document.getElementById('turn-label'); if(tl) tl.textContent='— '+p.name.toUpperCase()+'\'S TURN —';
  const btn=document.getElementById('btn-end-turn'); if(btn){ btn.disabled=false; btn.onclick=endPlayerTurn; }
}

function endPlayerTurn() {
  const B=GS.battle; if(!B||B.turn!=='player') return;
  addLog('⏩ '+B.player.name+' ends their turn.','sys');
  updateBattleUI(); setTimeout(startEnemyTurn,400);
}

function startEnemyTurn() {
  const B=GS.battle; if(!B) return;
  B.turn='enemy';
  const e=B.enemy;
  const btn=document.getElementById('btn-end-turn'); if(btn) btn.disabled=true;
  if(e.isSkippingTurn){ e.isSkippingTurn=false; addLog('❄️ '+e.name+' is frozen! Skipping.','status'); setTimeout(()=>{if(GS.ui.isMultiplayer)promptMPSwitch();else startPlayerTurn();},1200); return; }
  if(GS.ui.isMultiplayer){ promptMPSwitch(); return; }
  e.maxMana=Math.min(10,B.turnCount); e.mana=e.maxMana;
  applyDOTs(e); if(checkBattleEnd()) return;
  doCompanionAttack(e,B.player); if(checkBattleEnd()) return;
  if(e.nextShield>0){ e.shield+=e.nextShield; e.nextShield=0; }
  drawCard(e);
  const tl=document.getElementById('turn-label'); if(tl) tl.textContent='— '+e.name.toUpperCase()+'\'S TURN —';
  addLog('🤖 '+e.name+'\'s turn. Mana: '+e.mana+'/'+e.maxMana,'sys');
  updateBattleUI(); setTimeout(runAI,800);
}

function promptMPSwitch() {
  const B=GS.battle; const next=B.turn==='enemy'?B.enemy:B.player;
  const t=document.getElementById('turn-switch-title'); if(t) t.textContent=next.name.toUpperCase()+'\'S TURN';
  openModal('modal-turn-switch');
}

function resumeMultiplayerTurn() {
  const B=GS.battle; if(!B) return; const e=B.enemy;
  e.maxMana=Math.min(10,B.turnCount); e.mana=e.maxMana;
  applyDOTs(e); if(checkBattleEnd()) return;
  doCompanionAttack(e,B.player); if(checkBattleEnd()) return;
  if(e.nextShield>0){ e.shield+=e.nextShield; e.nextShield=0; }
  drawCard(e);
  showTurnIndicator(e.name+'\'s TURN');
  addLog('🔄 '+e.name+'\'s turn. Mana: '+e.mana+'/'+e.maxMana,'sys');
  const tl=document.getElementById('turn-label'); if(tl) tl.textContent='— '+e.name.toUpperCase()+'\'S TURN —';
  const btn=document.getElementById('btn-end-turn'); if(btn){ btn.disabled=false; btn.onclick=endEnemyTurnMP; }
  updateBattleUI(); renderMultiplayerHand();
}

function endEnemyTurnMP() {
  const B=GS.battle; if(!B) return;
  addLog('⏩ '+B.enemy.name+' ends their turn.','sys');
  B.turn='player'; B.turnCount++; B.cardsPlayedThisTurn=0;
  setTimeout(startPlayerTurn,400);
}

function drawCard(c) {
  if(c.deck.length===0){
    if(c.discard.length===0){ addLog(c.name+' has no cards left!','sys'); return; }
    c.deck=shuffle(c.discard); c.discard=[]; addLog('♻️ '+c.name+' reshuffled.','sys');
  }
  c.hand.push(c.deck.shift());
}

function applyDOTs(c) {
  for(const [type,dot] of Object.entries(c.statuses)){
    if(dot&&dot.turns>0){
      applyDmgRaw(c,dot.value,type+' DoT');
      dot.turns--;
      if(dot.turns<=0){ delete c.statuses[type]; addLog(c.name+': '+type+' faded.','status'); }
    }
  }
}

function doCompanionAttack(attacker,defender) {
  if(!attacker.companion) return;
  const comp=attacker.companion;
  if(comp.turnsLeft<=0){ attacker.companion=null; addLog(attacker.name+'\'s companion faded.','status'); return; }
  if(comp.shield) attacker.shield+=comp.shield;
  if(comp.atk>0){ applyDamage(defender,comp.atk,null,'Companion',false); }
  comp.turnsLeft--;
  if(comp.turnsLeft<=0){ attacker.companion=null; addLog(attacker.name+'\'s companion faded.','status'); }
}

function applyDmgRaw(target,amount,label) {
  target.hp=Math.max(0,target.hp-amount);
  addLog('💥 '+label+' deals '+amount+' to '+target.name+'.','dmg');
  const hpEl=target.isAI?document.getElementById('enemy-hp-bar'):document.getElementById('player-hp-bar');
  showDamageFloat(amount,hpEl,'dmg');
  updateBattleUI();
}

function applyDamage(target,amount,card,label,ignoreShield) {
  let dmg=Math.max(0,amount);
  if(target.hasDeathMark) dmg=Math.floor(dmg*1.5);
  if(!ignoreShield&&target.shield>0){ const b=Math.min(target.shield,dmg); dmg-=b; target.shield-=b; }
  if(target.hasReflect&&!ignoreShield){
    target.hasReflect=false;
    const src=GS.battle.turn==='player'?GS.battle.player:GS.battle.enemy;
    applyDmgRaw(src,dmg,'Reflect'); addLog('🪞 Mirror reflects '+dmg+' dmg!','status'); return;
  }
  if(target.hasBarrier&&!ignoreShield){ target.hasBarrier=false; addLog('🧱 Barrier absorbs the hit!','status'); return; }
  if(target.hasTrap&&!ignoreShield){
    const src2=GS.battle.turn==='player'?GS.battle.player:GS.battle.enemy;
    applyDmgRaw(src2,target.trapDmg,'Trap'); target.hasTrap=false;
  }
  applyDmgRaw(target,dmg,label||'Attack');
}

function applyHeal(target,amount) {
  const h=Math.min(amount,target.maxHp-target.hp); target.hp+=h;
  addLog('💚 '+target.name+' heals '+h+' HP.','heal');
  const hpEl=target.isAI?document.getElementById('enemy-hp-bar'):document.getElementById('player-hp-bar');
  showDamageFloat(h,hpEl,'heal'); updateBattleUI();
}

function applyDOT(target,dot,lv) {
  const val=scaledValue(dot.value,lv);
  target.statuses[dot.type]={value:val,turns:dot.turns};
  addLog('☠️ '+target.name+' afflicted: '+dot.type+' ('+val+' dmg/turn, '+dot.turns+'t).','status');
}

function playCard(who,cardIndex) {
  const B=GS.battle; if(!B) return;
  const actor=who==='player'?B.player:B.enemy;
  const target=who==='player'?B.enemy:B.player;
  const card=actor.hand[cardIndex]; if(!card) return;
  const lv=cardLevel(card.id);
  if(actor.mana<card.manaCost){ addLog('⚠️ Not enough mana!','sys'); return; }
  actor.mana-=card.manaCost;
  actor.hand.splice(cardIndex,1);
  actor.discard.push(card);
  B.cardsPlayedThisTurn++;
  const prevLast=B.lastCardPlayed;
  B.lastCardPlayed=card;
  addLog('🃏 '+actor.name+' plays '+card.art+' '+card.name+'.','sys');
  const eff=card.effect;
  let baseDmg=eff.value?scaledValue(eff.value,lv):0;
  if(actor.buffs.atkBonus&&actor.buffs.atkBonus.uses>0){ baseDmg+=actor.buffs.atkBonus.value; actor.buffs.atkBonus.uses--; if(actor.buffs.atkBonus.uses<=0) delete actor.buffs.atkBonus; }
  if(actor.buffs.atkPenalty) baseDmg=Math.max(0,baseDmg-actor.buffs.atkPenalty.value);
  switch(eff.action){
    case 'damage':
      applyDamage(target,baseDmg,card,card.name,eff.ignoreShield||false);
      if(eff.selfHeal) applyHeal(actor,scaledValue(eff.selfHeal,lv));
      if(eff.dot) applyDOT(target,eff.dot,lv);
      break;
    case 'shield':
      actor.shield+=scaledValue(eff.value,lv);
      if(eff.nextShield) actor.nextShield+=scaledValue(eff.nextShield,lv);
      addLog('🛡️ '+actor.name+' gains '+scaledValue(eff.value,lv)+' shield.','status'); break;
    case 'reflect': actor.hasReflect=true; addLog('🪞 '+actor.name+' set Mirror Barrier.','status'); break;
    case 'barrier': actor.hasBarrier=true; addLog('🧱 '+actor.name+' is immune to next attack.','status'); break;
    case 'heal': applyHeal(actor,scaledValue(eff.value,lv)); break;
    case 'dot': applyDOT(target,eff.dot,lv); break;
    case 'freeze': target.isSkippingTurn=true; target.statuses.freeze={turns:1}; addLog('❄️ '+target.name+' is frozen!','status'); break;
    case 'buff': actor.buffs[eff.stat]={value:scaledValue(eff.value,lv),uses:eff.uses||999}; addLog('⬆️ '+actor.name+' buffed: +'+scaledValue(eff.value,lv)+' ATK x'+eff.uses+'.','status'); break;
    case 'debuff': target.buffs[eff.stat]={value:scaledValue(eff.value,lv),turns:eff.turns}; addLog('⬇️ '+target.name+' debuffed: -'+scaledValue(eff.value,lv)+' ATK.','status'); break;
    case 'gainMana': { const g=scaledValue(eff.value,lv); actor.mana=Math.min(actor.maxMana,actor.mana+g); addLog('💧 '+actor.name+' gains '+g+' mana.','status'); break; }
    case 'drainMana': { const stolen=Math.min(eff.value,target.mana); target.mana-=stolen; actor.mana=Math.min(actor.maxMana,actor.mana+stolen); addLog('👁️ '+actor.name+' drains '+stolen+' mana.','status'); break; }
    case 'markEnemy': target.hasDeathMark=true; target.deathMarkTurns=eff.turns; addLog('💀 Death Mark on '+target.name+'! +50% dmg '+eff.turns+'t.','status'); break;
    case 'trap': actor.hasTrap=true; actor.trapDmg=scaledValue(eff.returnDmg,lv); addLog('⚙️ '+actor.name+' sets a trap ('+actor.trapDmg+' dmg).','status'); break;
    case 'banishEnemyCard': if(target.deck.length>0){ const rm=target.deck.shift(); addLog('🕳️ Banished '+rm.art+' '+rm.name+'!','status'); } break;
    case 'summon': {
      const comp={...eff.companion,turnsLeft:eff.companion.turns}; actor.companion=comp;
      addLog('👾 '+actor.name+' summoned '+card.art+'! ('+comp.atk+' ATK, '+comp.turns+'t)','status');
      if(eff.summonEffect) applyDamage(target,scaledValue(eff.summonEffect.value,lv),card,'Summon Entry',false);
      break;
    }
    case 'secretSummon': { const opts=[{atk:5,turns:3},{atk:7,turns:2},{atk:4,turns:4}]; actor.companion={...opts[rand(0,2)],turnsLeft:3}; addLog('❓ Secret Summon!','status'); break; }
    case 'multiDamage': for(let i=0;i<eff.hits;i++) applyDamage(target,scaledValue(eff.value,lv),card,'Hit '+(i+1),false); if(eff.selfDamage) applyDmgRaw(actor,eff.selfDamage,'Rage Self'); break;
    case 'sacrifice': applyDmgRaw(actor,eff.selfDamage,'Sacrifice'); applyDamage(target,scaledValue(eff.dealDamage,lv),card,'Sacrifice',false); break;
    case 'conditionalHeal': if(actor.hp<eff.threshold){ applyHeal(actor,eff.healTo-actor.hp); } applyDamage(target,scaledValue(eff.alsoDeals,lv),card,'Phoenix',false); break;
    case 'copyEnemyCard': if(target.deck.length>0){ const copy=target.deck[rand(0,target.deck.length-1)]; actor.hand.push(copy); addLog('🌀 Copied '+copy.art+' '+copy.name+'!','status'); } break;
    case 'echo': if(prevLast&&prevLast.id!=='c029'){ addLog('🔁 Echo: replaying '+prevLast.art+' '+prevLast.name+'!','status'); B.lastCardPlayed=null; echoPlay(who,prevLast,lv); } break;
    case 'extraPlay': actor.extraPlaysLeft=(actor.extraPlaysLeft||0)+1; addLog('⏰ Extra card play granted!','status'); break;
    case 'comboStrike': if(B.cardsPlayedThisTurn>=eff.threshold){ const b=scaledValue(eff.bonusDmg,lv); applyDamage(target,b,card,'Combo',false); addLog('💥 COMBO! '+b+' bonus dmg!','dmg'); } break;
    case 'chaos': if(Math.random()<0.5){ const d=rand(2,12); applyDamage(target,d,card,'Chaos',false); addLog('🎲 Chaos: '+d+' dmg!','dmg'); } else { const g=rand(0,4); actor.mana=Math.min(actor.maxMana,actor.mana+g); addLog('🎲 Chaos: +'+g+' mana!','status'); } break;
    case 'bonusIfStatus': applyDamage(target,baseDmg,card,card.name,false); if(Object.keys(target.statuses).length>0||target.hasDeathMark){ const b=scaledValue(eff.bonusIfStatus,lv); applyDamage(target,b,card,'Thunder Bonus',false); } break;
    default: if(baseDmg>0) applyDamage(target,baseDmg,card,card.name,false);
  }
  checkBattleEnd(); updateBattleUI();
  if(who==='player') renderPlayerHand();
  if(who==='enemy'&&GS.ui.isMultiplayer) renderMultiplayerHand();
}

function echoPlay(who,card,lv) {
  const actor=who==='player'?GS.battle.player:GS.battle.enemy;
  const target=who==='player'?GS.battle.enemy:GS.battle.player;
  const eff=card.effect;
  if(eff.action==='damage') applyDamage(target,scaledValue(eff.value||4,lv),card,card.name,eff.ignoreShield||false);
  else if(eff.action==='heal') applyHeal(actor,scaledValue(eff.value,lv));
  else if(eff.action==='shield'){ actor.shield+=scaledValue(eff.value,lv); }
}

function checkBattleEnd() {
  const B=GS.battle; if(!B) return false;
  if(B.player.hp<=0){ battleEnd('defeat'); return true; }
  if(B.enemy.hp<=0){ battleEnd('victory'); return true; }
  return false;
}

function battleEnd(result) {
  const B=GS.battle;
  const btn=document.getElementById('btn-end-turn'); if(btn) btn.disabled=true;
  if(result==='victory'){
    addLog('🏆 VICTORY! '+B.player.name+' wins!','sys');
    let goldEarned=0; let cardEarned=null;
    if(!GS.ui.isMultiplayer&&GS.ui.currentEnemy){
      const en=GS.ui.currentEnemy;
      goldEarned=en.gold+rand(0,Math.floor(en.gold*0.3));
      GS.player.gold+=goldEarned;
      const chId=STORY_DB.find(c=>c.stages.includes(en.id))&&STORY_DB.find(c=>c.stages.includes(en.id)).id;
      if(chId){ if(!GS.player.storyProgress[chId]) GS.player.storyProgress[chId]={stages:{},bossDefeated:false}; GS.player.storyProgress[chId].stages[en.id]=true; if(en.isBoss) GS.player.storyProgress[chId].bossDefeated=true; }
      if(Math.random()<(en.isBoss?0.9:0.4)){ cardEarned=en.cardPool[rand(0,en.cardPool.length-1)]; GS.player.collection.push(cardEarned); }
      saveGame();
    }
    const rt=document.getElementById('result-title'); if(rt){ rt.textContent='🏆 VICTORY!'; rt.className='result-title victory'; }
    const ra=document.getElementById('result-art'); if(ra) ra.textContent='🎉';
    let rwHTML=GS.ui.isMultiplayer?`<div class="reward-item">🏆 ${B.player.name} wins!</div>`:`<div class="reward-item">💰 Gold: +${goldEarned}</div>`;
    if(cardEarned){ const c=getCard(cardEarned); rwHTML+=`<div class="reward-item">🃏 Drop: ${c.art} ${c.name} [${RARITY_DATA[c.rarity].name}]</div>`; }
    const rw=document.getElementById('result-rewards'); if(rw) rw.innerHTML=rwHTML;
  } else {
    addLog('💀 DEFEAT!','sys');
    const rt=document.getElementById('result-title'); if(rt){ rt.textContent='💀 DEFEAT!'; rt.className='result-title defeat'; }
    const ra=document.getElementById('result-art'); if(ra) ra.textContent='😵';
    const rw=document.getElementById('result-rewards'); if(rw) rw.innerHTML='<div class="reward-item">Keep trying, warrior!</div>';
  }
  openModal('modal-result');
}

function onBattleResultContinue() { closeModal('modal-result'); showScreen('story'); }

// ---- AI ----
function runAI() {
  const B=GS.battle; if(!B||B.turn!=='enemy') return;
  const ai=GS.ui.currentEnemy?GS.ui.currentEnemy.ai:'balanced';
  const e=B.enemy; const p=B.player; let plays=0;
  const maxPlays=ai.includes('boss')?3:2;
  const tick=()=>{
    if(!GS.battle||B.turn!=='enemy') return;
    if(plays>=maxPlays){ setTimeout(()=>{ if(GS.battle){ addLog('⏩ '+e.name+' ends turn.','sys'); startPlayerTurn(); }},400); return; }
    const affordable=e.hand.filter(c=>c.manaCost<=e.mana);
    if(affordable.length===0){ setTimeout(()=>{ if(GS.battle){ addLog('⏩ '+e.name+' ends turn.','sys'); startPlayerTurn(); }},400); return; }
    let chosen;
    if(e.hp<e.maxHp*0.3&&affordable.some(c=>c.effect.action==='heal'||c.effect.selfHeal)) chosen=affordable.find(c=>c.effect.action==='heal'||c.effect.selfHeal);
    else if(p.hp<10&&affordable.some(c=>(c.effect.value||0)>=6)){ const hi=affordable.filter(c=>(c.effect.value||0)>=6); chosen=hi.sort((a,b)=>(b.effect.value||0)-(a.effect.value||0))[0]; }
    else chosen=affordable.sort((a,b)=>(b.effect.value||0)-(a.effect.value||0))[rand(0,Math.min(1,affordable.length-1))];
    if(!chosen) chosen=affordable[0];
    const idx=e.hand.indexOf(chosen);
    if(idx>=0){ playCard('enemy',idx); plays++; }
    if(checkBattleEnd()) return;
    setTimeout(tick,700);
  };
  setTimeout(tick,600);
}

// ---- BATTLE UI ----
function updateBattleUI() {
  const B=GS.battle; if(!B) return;
  const p=B.player,e=B.enemy;
  updateHPBar('player',p.hp,p.maxHp); updateHPBar('enemy',e.hp,e.maxHp);
  renderManaDots('player-mana-dots',p.mana,p.maxMana); renderManaDots('enemy-mana-dots',e.mana,e.maxMana);
  const pmt=document.getElementById('player-mana-text'); if(pmt) pmt.textContent=p.mana+'/'+p.maxMana;
  const emt=document.getElementById('enemy-mana-text');  if(emt) emt.textContent=e.mana+'/'+e.maxMana;
  const pdc=document.getElementById('player-deck-count'); if(pdc) pdc.textContent=p.deck.length;
  const edc=document.getElementById('enemy-deck-count');  if(edc) edc.textContent=e.deck.length;
  const ehd=document.getElementById('enemy-hand-display'); if(ehd){ ehd.innerHTML=''; e.hand.forEach(()=>{ const cb=document.createElement('div'); cb.className='card-back'; ehd.appendChild(cb); }); }
  renderStatusBadges('player-status-row',p); renderStatusBadges('enemy-status-row',e);
  renderField('player-field',p); renderField('enemy-field',e);
  renderPlayerHand();
}

function updateHPBar(who,hp,maxHp) {
  const pct=Math.max(0,hp/maxHp*100);
  const bar=document.getElementById(who+'-hp-bar'); const txt=document.getElementById(who+'-hp-text');
  if(!bar||!txt) return;
  bar.style.width=pct+'%';
  bar.className='hp-bar-inner'+(pct<25?' low':pct<50?' mid':'');
  txt.textContent=Math.max(0,hp)+'/'+maxHp;
}

function renderManaDots(elId,cur,max) {
  const el=document.getElementById(elId); if(!el) return; el.innerHTML='';
  for(let i=0;i<max;i++){ const d=document.createElement('div'); d.className='mana-dot'+(i<cur?' filled':''); el.appendChild(d); }
}

function renderStatusBadges(elId,c) {
  const el=document.getElementById(elId); if(!el) return; el.innerHTML='';
  const add=(cls,txt)=>{ const b=document.createElement('div'); b.className='status-badge '+cls; b.textContent=txt; el.appendChild(b); };
  if(c.shield>0) add('shield','🛡️'+c.shield);
  if(c.statuses.burn) add('burn','🔥'+c.statuses.burn.turns);
  if(c.statuses.poison) add('poison','☠️'+c.statuses.poison.turns);
  if(c.isSkippingTurn) add('freeze','❄️FROZEN');
  if(c.buffs&&c.buffs.atkBonus) add('buff','⬆️ATK+'+c.buffs.atkBonus.value);
  if(c.buffs&&c.buffs.atkPenalty) add('debuff','⬇️ATK-'+c.buffs.atkPenalty.value);
  if(c.hasDeathMark) add('debuff','💀MARKED');
  if(c.hasTrap) add('status','⚙️TRAP');
  if(c.hasReflect) add('status','🪞REFLECT');
  if(c.hasBarrier) add('status','🧱BARRIER');
}

function renderField(elId,c) {
  const el=document.getElementById(elId); if(!el) return; el.innerHTML='';
  if(c.companion){ const d=document.createElement('div'); d.className='companion-display'; d.innerHTML='👾 '+c.companion.atk+'ATK ('+c.companion.turnsLeft+'T)'; el.appendChild(d); }
}

function renderPlayerHand() {
  const B=GS.battle; if(!B) return;
  const hand=document.getElementById('player-hand'); if(!hand) return; hand.innerHTML='';
  const isPlayerTurn=B.turn==='player';
  B.player.hand.forEach((card,i)=>{
    const el=buildCardEl(card.id,{});  if(!el) return;
    if(!isPlayerTurn||card.manaCost>B.player.mana) el.classList.add('grayed');
    el.title=card.name+' — '+card.description;
    el.addEventListener('click',()=>{
      if(!isPlayerTurn) return;
      if(card.manaCost>B.player.mana){ addLog('⚠️ Not enough mana for '+card.name+'!','sys'); return; }
      playCard('player',i);
    });
    hand.appendChild(el);
  });
}

function renderMultiplayerHand() {
  const B=GS.battle; if(!B) return;
  const hand=document.getElementById('player-hand'); if(!hand) return; hand.innerHTML='';
  B.enemy.hand.forEach((card,i)=>{
    const el=buildCardEl(card.id,{}); if(!el) return;
    if(card.manaCost>B.enemy.mana) el.classList.add('grayed');
    el.title=card.name+' — '+card.description;
    el.addEventListener('click',()=>{
      if(card.manaCost>B.enemy.mana){ addLog('⚠️ Not enough mana!','sys'); return; }
      playCard('enemy',i);
    });
    hand.appendChild(el);
  });
}

function addLog(msg,type) {
  if(!GS.battle) return;
  const logEl=document.getElementById('battle-log'); if(!logEl) return;
  const d=document.createElement('div'); d.className='log-entry '+(type||''); d.textContent=msg;
  logEl.appendChild(d); logEl.scrollTop=logEl.scrollHeight;
}

// ---- COLLECTION ----
let collectionFilter='all';
function renderCollection() {
  const grid=document.getElementById('collection-grid'); const ct=document.getElementById('col-count');
  if(!grid) return; grid.innerHTML='';
  const owned=GS.player.collection; const unique=[...new Set(owned)];
  if(ct) ct.textContent=unique.length;
  unique.filter(id=>{ const c=getCard(id); if(!c) return false;
    if(collectionFilter==='all') return true;
    if(['LEGENDARY','EPIC','MYTHIC','SECRET','RARE'].includes(collectionFilter)) return c.rarity===collectionFilter;
    return c.type===collectionFilter;
  }).forEach(id=>{
    const qty=owned.filter(x=>x===id).length;
    const el=buildCardEl(id,{onClick:()=>openCardDetail(id)}); if(!el) return;
    if(qty>1){ const badge=document.createElement('div'); badge.style.cssText='position:absolute;bottom:3px;left:3px;background:#000;color:#ffcc00;font-size:5px;padding:1px 3px;border:1px solid #ffcc00'; badge.textContent='x'+qty; el.appendChild(badge); }
    grid.appendChild(el);
  });
}
function filterCollection(filter,btn) {
  collectionFilter=filter;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  renderCollection();
}

// ---- DECK BUILDER ----
function renderDeckBuilder() {
  if(!GS.ui.dbDeck||GS.ui.dbDeck.length===0) GS.ui.dbDeck=[...GS.player.deck];
  const cGrid=document.getElementById('db-collection-grid'); if(!cGrid) return; cGrid.innerHTML='';
  const unique=[...new Set(GS.player.collection)];
  unique.forEach(id=>{
    const el=buildCardEl(id,{}); if(!el) return;
    el.title=getCard(id)?getCard(id).description:'';
    el.addEventListener('click',()=>{
      if(GS.ui.dbDeck.length>=15){ alert('Deck full! Max 15 cards.'); return; }
      if(GS.ui.dbDeck.filter(x=>x===id).length>=3){ alert('Max 3 copies of a card!'); return; }
      GS.ui.dbDeck.push(id); renderDBDeckList();
    });
    cGrid.appendChild(el);
  });
  renderDBDeckList();
}
function renderDBDeckList() {
  const dList=document.getElementById('db-deck-list'); const dCount=document.getElementById('db-deck-count');
  if(!dList) return; dList.innerHTML=''; if(dCount) dCount.textContent=GS.ui.dbDeck.length;
  const grouped={};
  GS.ui.dbDeck.forEach(id=>{ grouped[id]=(grouped[id]||0)+1; });
  Object.entries(grouped).forEach(([id,qty])=>{
    const card=getCard(id); if(!card) return;
    const rd=RARITY_DATA[card.rarity]||RARITY_DATA.COMMON;
    const item=document.createElement('div'); item.className='deck-list-item'; item.style.borderColor=rd.color+'44';
    item.innerHTML=`<span class="item-art">${card.art}</span><span class="item-name" style="color:${rd.color}">${card.name}${qty>1?' x'+qty:''}</span><span style="font-size:5px;color:var(--mana)">${card.manaCost}M</span><span class="item-remove" onclick="removeFromDeck('${id}')">✕</span>`;
    dList.appendChild(item);
  });
}
function removeFromDeck(id) { const i=GS.ui.dbDeck.lastIndexOf(id); if(i>=0){ GS.ui.dbDeck.splice(i,1); renderDBDeckList(); } }
function saveDeck() { if(GS.ui.dbDeck.length<5){ alert('Need at least 5 cards!'); return; } GS.player.deck=[...GS.ui.dbDeck]; saveGame(); alert('✅ Deck saved!'); }
function clearDeck() { GS.ui.dbDeck=[]; renderDBDeckList(); }

// ---- SHOP ----
const PACK_CONFIGS = {
  basic:     { cost:100,  count:3, rarityWeights:{COMMON:60,UNCOMMON:35,RARE:5} },
  rare:      { cost:300,  count:3, rarityWeights:{COMMON:20,UNCOMMON:30,RARE:40,EPIC:9,LEGENDARY:1} },
  epic:      { cost:800,  count:4, rarityWeights:{COMMON:5,UNCOMMON:15,RARE:30,EPIC:40,LEGENDARY:8,SECRET:2} },
  legendary: { cost:2000, count:5, rarityWeights:{RARE:10,EPIC:25,LEGENDARY:45,SECRET:12,MYTHIC:8} },
};
function renderShop() { const g=document.getElementById('shop-gold'); if(g) g.textContent=GS.player.gold; }
function buyPack(type) {
  const pack=PACK_CONFIGS[type]; if(!pack) return;
  if(GS.player.gold<pack.cost){ alert('Not enough gold! Need '+pack.cost+' 💰'); return; }
  GS.player.gold-=pack.cost;
  const cards=[];
  for(let i=0;i<pack.count;i++){
    const rarity=weightedRandom(pack.rarityWeights);
    const pool=CARD_DB.filter(c=>(RARITY_DATA[c.rarity]&&RARITY_DATA[c.rarity].order||0)>=(RARITY_DATA[rarity]&&RARITY_DATA[rarity].order||0));
    const card=pool.length?pool[rand(0,pool.length-1)]:CARD_DB[rand(0,CARD_DB.length-1)];
    cards.push(card); GS.player.collection.push(card.id);
  }
  saveGame();
  const sg=document.getElementById('shop-gold'); if(sg) sg.textContent=GS.player.gold;
  const mg=document.getElementById('menu-gold'); if(mg) mg.textContent=GS.player.gold;
  const reveal=document.getElementById('pack-cards-reveal'); if(reveal){ reveal.innerHTML=''; cards.forEach(card=>{ const el=buildCardEl(card.id,{}); if(el) reveal.appendChild(el); }); }
  openModal('modal-pack');
}
function weightedRandom(weights) {
  const total=Object.values(weights).reduce((a,b)=>a+b,0); let r=Math.random()*total;
  for(const [k,w] of Object.entries(weights)){ r-=w; if(r<=0) return k; }
  return Object.keys(weights)[0];
}

// ---- CARD DETAIL ----
let detailCardId=null;
function openCardDetail(id) {
  const card=getCard(id); if(!card) return; detailCardId=id;
  const rd=RARITY_DATA[card.rarity]||RARITY_DATA.COMMON; const lv=cardLevel(id);
  const setTxt=(elId,v)=>{ const el=document.getElementById(elId); if(el) el.textContent=v; };
  setTxt('detail-art',card.art); setTxt('detail-name',card.name); setTxt('detail-type',card.type.toUpperCase());
  const rb=document.getElementById('detail-rarity-badge'); if(rb){ rb.textContent=rd.gem+' '+rd.name; rb.style.color=rd.color; }
  setTxt('detail-cost',card.manaCost); setTxt('detail-desc',card.description); setTxt('detail-lore',card.lore);
  setTxt('detail-level',lv); setTxt('detail-maxlevel',card.maxLevel||5);
  const costs=[100,300,600,1000,2000];
  const uc=lv<(card.maxLevel||5)?costs[lv-1]:null;
  const us=document.getElementById('detail-upgrade-section');
  if(us){ us.style.display=uc?'block':'none'; if(uc){ setTxt('detail-upgrade-cost',uc); const ub=document.getElementById('btn-upgrade-card'); if(ub) ub.className=GS.player.gold>=uc?'px-btn success':'px-btn disabled'; } }
  const mo=document.getElementById('modal-card-detail'); if(mo) mo.style.setProperty('--detail-border',rd.color);
  openModal('modal-card-detail');
}
function upgradeCard() {
  if(!detailCardId) return;
  const lv=cardLevel(detailCardId); const maxLv=getCard(detailCardId)?getCard(detailCardId).maxLevel||5:5;
  if(lv>=maxLv){ alert('Max level!'); return; }
  const costs=[100,300,600,1000,2000]; const cost=costs[lv-1];
  if(GS.player.gold<cost){ alert('Need '+cost+' gold!'); return; }
  GS.player.gold-=cost; GS.player.cardLevels[detailCardId]=lv+1; saveGame();
  openCardDetail(detailCardId);
}

// ---- CODEX ----
function renderCodex() {
  const grid=document.getElementById('codex-grid'); if(!grid) return; grid.innerHTML='';
  CARD_DB.forEach(card=>{
    const owned=GS.player.collection.includes(card.id);
    const div=document.createElement('div'); div.className='codex-entry'+(owned?'':' locked-entry');
    div.innerHTML='<div class="ce-art">'+card.art+'</div><div class="ce-name">'+card.name+'</div><div class="ce-lore">'+(owned?card.lore.substring(0,60)+'...':'???')+'</div>';
    div.addEventListener('click',()=>{
      const setTxt=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
      setTxt('codex-detail-art',card.art); setTxt('codex-detail-name',owned?card.name:'???');
      setTxt('codex-detail-desc',owned?card.description:'Obtain this card to unlock its secrets.');
      setTxt('codex-detail-lore',owned?card.lore:'???');
      setTxt('codex-detail-type',owned?card.type.toUpperCase():'???');
      setTxt('codex-detail-rarity',owned?(RARITY_DATA[card.rarity]?RARITY_DATA[card.rarity].name:''):'???');
      openModal('modal-codex-detail');
    });
    grid.appendChild(div);
  });
}

// ---- INIT ----
window.addEventListener('DOMContentLoaded',()=>{
  const loaded=loadGame();
  if(!loaded||!GS.player.collection||GS.player.collection.length===0) newGame();
  GS.ui.dbDeck=[...(GS.player.deck||[])];
  showScreen('mainmenu');
});
