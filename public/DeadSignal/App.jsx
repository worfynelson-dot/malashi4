// ============================================================
// ZOMBIE APOCALYPSE TEXT RPG - App.jsx
// Built by Asep Seko ZakBar 🗿🪓
// ============================================================

const { useState, useEffect, useRef, useCallback } = React;

// ============================================================
// GAME DATA
// ============================================================

const ITEMS = {
  medkit: { id: "medkit", name: "Med Kit", icon: "💊", desc: "Restores 40 HP", type: "heal", value: 40, weight: 2 },
  bandage: { id: "bandage", name: "Bandage", icon: "🩹", desc: "Restores 15 HP", type: "heal", value: 15, weight: 1 },
  energy_drink: { id: "energy_drink", name: "Energy Drink", icon: "⚡", desc: "Restores 25 HP + 10 ATK temp", type: "boost", value: 25, atkBoost: 10, weight: 1 },
  molotov: { id: "molotov", name: "Molotov", icon: "🔥", desc: "Deals 35 fire damage", type: "weapon", damage: 35, weight: 2 },
  grenade: { id: "grenade", name: "Grenade", icon: "💣", desc: "Deals 50 damage", type: "weapon", damage: 50, weight: 3 },
  antidote: { id: "antidote", name: "Antidote", icon: "🧪", desc: "Cures infection", type: "cure", weight: 1 },
  ration: { id: "ration", name: "Ration Pack", icon: "🍱", desc: "Restores 20 HP", type: "heal", value: 20, weight: 1 },
  scrap_metal: { id: "scrap_metal", name: "Scrap Metal", icon: "🔩", desc: "Used for crafting", type: "material", weight: 2 },
  knife: { id: "knife", name: "Combat Knife", icon: "🔪", desc: "+15 ATK permanently", type: "equip", atkBoost: 15, weight: 1 },
  vest: { id: "vest", name: "Bulletproof Vest", icon: "🦺", desc: "+20 DEF permanently", type: "equip", defBoost: 20, weight: 3 },
};

const ENEMIES = {
  walker: {
    name: "Rotting Walker", icon: "🧟", hp: 30, maxHp: 30, atk: 8, def: 2, exp: 15, loot: ["bandage"],
    desc: "A slow, decaying zombie. Easy prey.",
    actions: ["bite", "scratch"]
  },
  runner: {
    name: "Feral Runner", icon: "🏃", hp: 45, maxHp: 45, atk: 14, def: 4, exp: 25, loot: ["energy_drink"],
    desc: "Fast and aggressive. Don't let it close in.",
    actions: ["lunge", "bite", "scratch"]
  },
  bloater: {
    name: "Bloater", icon: "🫁", hp: 80, maxHp: 80, atk: 18, def: 8, exp: 45, loot: ["medkit", "scrap_metal"],
    desc: "A grotesque swollen zombie. Hits hard.",
    actions: ["slam", "toxic_spit"]
  },
  mutant: {
    name: "Mutant Brute", icon: "👾", hp: 120, maxHp: 120, atk: 25, def: 12, exp: 80, loot: ["medkit", "antidote", "grenade"],
    desc: "A terrifying evolved zombie. Boss-level threat.",
    actions: ["slam", "maul", "toxic_spit"]
  },
  horde: {
    name: "Zombie Horde", icon: "🧟‍♂️🧟‍�️🧟", hp: 200, maxHp: 200, atk: 30, def: 5, exp: 150, loot: ["medkit", "grenade", "vest"],
    desc: "A massive wave. The final test.",
    actions: ["overwhelm", "bite", "slam"]
  }
};

const LOCATIONS = {
  shelter: {
    name: "Emergency Shelter", icon: "🏠",
    desc: "Your makeshift base. A rusted shipping container with a reinforced door.",
    npcs: ["survivor_jay", "doctor_ren"],
    actions: ["rest", "craft", "talk", "inventory"]
  },
  street: {
    name: "Dead City Streets", icon: "🌆",
    desc: "Abandoned streets littered with burned cars and debris. Danger lurks everywhere.",
    enemies: ["walker", "runner"],
    loot: ["bandage", "scrap_metal"],
    actions: ["explore", "scavenge", "fight", "go_back"]
  },
  hospital: {
    name: "Abandoned Hospital", icon: "🏥",
    desc: "A once-great hospital. The smell of death is overwhelming. High risk, high reward.",
    enemies: ["bloater", "runner"],
    loot: ["medkit", "antidote", "bandage"],
    actions: ["explore", "scavenge", "fight", "go_back"]
  },
  outpost: {
    name: "Military Outpost", icon: "🪖",
    desc: "A collapsed military base. Mutants have taken over. Dangerous beyond measure.",
    enemies: ["mutant", "bloater"],
    loot: ["grenade", "vest", "knife"],
    actions: ["explore", "scavenge", "fight", "go_back"],
    minLevel: 5
  },
  tower: {
    name: "The Black Tower", icon: "🗼",
    desc: "The source of the outbreak. The final destination. No turning back.",
    enemies: ["horde", "mutant"],
    loot: ["medkit", "grenade"],
    actions: ["fight", "go_back"],
    minLevel: 8,
    finalBoss: true
  }
};

const NPCS = {
  survivor_jay: {
    name: "Jay", icon: "👤",
    lines: [
      "Stay sharp out there. The dead don't rest.",
      "I heard the military outpost has weapons. Too dangerous for me though.",
      "You look strong. Maybe YOU can end this nightmare.",
      "There's a rumor about a cure in the Black Tower... or maybe that's just a death trap."
    ],
    quest: {
      id: "jay_quest",
      desc: "Jay needs 3 Scrap Metal to reinforce the shelter.",
      reward: { exp: 50, item: "energy_drink" },
      requires: { item: "scrap_metal", count: 3 }
    }
  },
  doctor_ren: {
    name: "Dr. Ren", icon: "👩‍⚕️",
    lines: [
      "The infection mutates fast. Find antidotes whenever you can.",
      "I've been analyzing the virus. It originated from the Black Tower.",
      "Bring me 2 antidotes and I'll upgrade your stats.",
      "Rest here. I'll patch you up for free once per day."
    ],
    quest: {
      id: "ren_quest",
      desc: "Dr. Ren needs 2 Antidotes for research.",
      reward: { exp: 80, statBoost: { hp: 20, atk: 5 } },
      requires: { item: "antidote", count: 2 }
    }
  }
};

const STORY_EVENTS = [
  {
    id: "intro",
    title: "Day Zero",
    text: "You wake up in a cold sweat. The emergency broadcast crackles: 'OUTBREAK CONFIRMED. EVACUATE IMMEDIATELY.' Through the cracked window, you see your neighbors — moving wrong. Too slow. Too hungry. The apocalypse isn't coming. It's here.",
    choices: [
      { text: "Grab your bag and run to the shelter", next: "shelter_arrival", effect: { item: "bandage" } },
      { text: "Search the apartment for supplies first", next: "apartment_search", effect: { item: "medkit" } }
    ]
  },
  {
    id: "shelter_arrival",
    title: "Safe... For Now",
    text: "You burst through the shelter door. Jay slams it shut behind you. 'You made it,' he says, catching his breath. 'Most didn't.' Dr. Ren tends to a wounded survivor in the corner. This is home now. What's left of it.",
    choices: [
      { text: "Begin your mission", next: null }
    ]
  },
  {
    id: "apartment_search",
    title: "Close Call",
    text: "You find a med kit under the sink. Smart. But as you turn to leave, a zombie crashes through the door. You barely escape, heart pounding. You reach the shelter just before the streets flood with the dead.",
    choices: [
      { text: "Begin your mission", next: null }
    ]
  }
];

const ENDINGS = {
  hero: {
    title: "THE LAST STAND",
    icon: "🏆",
    text: "You fought through the horde. You climbed the Black Tower. And at the top, you destroyed the source. The sky clears. The dead fall still. You stand on the rooftop, wind in your hair, surrounded by silence for the first time in months. You saved what was left of humanity. The world will rebuild. And it starts with you.",
    condition: "Defeat the horde at the Black Tower"
  },
  survivor: {
    title: "FADE INTO SHADOW",
    icon: "🌑",
    text: "You chose survival over heroism. Quietly, you gathered supplies and disappeared into the wilderness. The city burned behind you. Maybe someone else will save the world. But not today. Today, you live.",
    condition: "Flee from the final battle"
  },
  infected: {
    title: "CONSUMED",
    icon: "💀",
    text: "The bite you ignored became a fever. The fever became madness. You stood in the dark shelter and looked at your shaking hands. Dr. Ren saw your eyes. She knew. Everyone knew. The last thing you remember is the sound of the shelter door slamming shut — from the outside.",
    condition: "Die from infection"
  }
};

// ============================================================
// UTILITY
// ============================================================
function rollDice(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcExpToLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function createPlayer(name) {
  return {
    name,
    hp: 100, maxHp: 100,
    atk: 15, def: 8,
    level: 1, exp: 0, expToLevel: 100,
    inventory: [{ ...ITEMS.bandage, qty: 2 }, { ...ITEMS.ration, qty: 1 }],
    equipped: [],
    infected: false,
    infectionTimer: 0,
    location: "shelter",
    questsDone: [],
    scavenged: 0,
    kills: 0,
    day: 1,
    gold: 10,
  };
}

// ============================================================
// COMPONENTS
// ============================================================

function TypewriterText({ text, speed = 18, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    idx.current = 0;
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        clearInterval(interval);
        setDone(true);
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="cursor-blink">▌</span>}
    </span>
  );
}

function HPBar({ current, max, label, color = "#e63946" }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = pct > 60 ? "#4ade80" : pct > 30 ? "#facc15" : color;
  return (
    <div className="hp-bar-wrap">
      {label && <span className="hp-label">{label}</span>}
      <div className="hp-bar-bg">
        <div className="hp-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span className="hp-text">{current}/{max}</span>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function LogLine({ line }) {
  const typeClass = line.type === "damage" ? "log-damage"
    : line.type === "heal" ? "log-heal"
    : line.type === "exp" ? "log-exp"
    : line.type === "warn" ? "log-warn"
    : line.type === "death" ? "log-death"
    : line.type === "system" ? "log-system"
    : "log-normal";
  return <div className={`log-line ${typeClass}`}>{line.text}</div>;
}

// ============================================================
// SCREENS
// ============================================================

function TitleScreen({ onStart }) {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState("title"); // title | name | intro

  return (
    <div className="screen title-screen">
      <div className="title-bg-overlay" />
      <div className="title-content">
        {phase === "title" && (
          <>
            <div className="title-eyebrow">A TEXT-BASED SURVIVAL RPG</div>
            <h1 className="title-main">
              <span className="title-dead">DEAD</span>
              <span className="title-signal">SIGNAL</span>
            </h1>
            <p className="title-sub">The city is gone. The dead walk. You remain.</p>
            <div className="title-zombies">🧟🧟‍♀️🧟‍♂️</div>
            <button className="btn-primary pulse" onClick={() => setPhase("name")}>
              ▶ BEGIN SURVIVAL
            </button>
          </>
        )}
        {phase === "name" && (
          <div className="name-entry">
            <h2 className="name-title">Who are you, survivor?</h2>
            <p className="name-sub">Your name will be remembered. Or forgotten.</p>
            <input
              className="name-input"
              placeholder="Enter your name..."
              value={name}
              maxLength={20}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && name.trim() && onStart(name.trim())}
              autoFocus
            />
            <button
              className="btn-primary"
              disabled={!name.trim()}
              onClick={() => name.trim() && onStart(name.trim())}
            >
              SURVIVE AS {name.toUpperCase() || "???"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StoryScreen({ event, onChoice }) {
  const [textDone, setTextDone] = useState(false);
  return (
    <div className="screen story-screen">
      <div className="story-card">
        <div className="story-title">{event.title}</div>
        <div className="story-text">
          <TypewriterText text={event.text} onDone={() => setTextDone(true)} />
        </div>
        {textDone && (
          <div className="story-choices">
            {event.choices.map((c, i) => (
              <button key={i} className="btn-choice" onClick={() => onChoice(c)}>
                {c.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BattleScreen({ player, enemyKey, onResult }) {
  const baseEnemy = ENEMIES[enemyKey];
  const [enemy, setEnemy] = useState({ ...baseEnemy, hp: baseEnemy.hp });
  const [pHp, setPHp] = useState(player.hp);
  const [log, setLog] = useState([]);
  const [phase, setPhase] = useState("player"); // player | enemy | result
  const [result, setResult] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const logRef = useRef();

  function addLog(text, type = "normal") {
    setLog(prev => [...prev, { text, type }]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  }

  function enemyTurn(currentPHp) {
    setTimeout(() => {
      const action = baseEnemy.actions[rollDice(0, baseEnemy.actions.length - 1)];
      let dmg = Math.max(1, enemy.atk - player.def + rollDice(-3, 5));
      let msg = "";
      if (action === "toxic_spit") {
        msg = `${enemy.icon} ${enemy.name} spits toxic bile! `;
        dmg = Math.floor(dmg * 1.2);
      } else if (action === "overwhelm") {
        msg = `${enemy.icon} The horde OVERWHELMS you! `;
        dmg = Math.floor(dmg * 1.5);
      } else if (action === "lunge") {
        msg = `${enemy.icon} ${enemy.name} lunges at you! `;
        dmg = Math.floor(dmg * 1.1);
      } else {
        msg = `${enemy.icon} ${enemy.name} attacks! `;
      }
      const newPHp = Math.max(0, currentPHp - dmg);
      setPHp(newPHp);
      addLog(`${msg}You take ${dmg} damage!`, "damage");
      if (newPHp <= 0) {
        addLog("💀 You have been defeated...", "death");
        setResult("defeat");
        setPhase("result");
        setTimeout(() => onResult("defeat", player, enemy), 1500);
      } else {
        setPhase("player");
      }
    }, 800);
  }

  function handleAttack() {
    if (phase !== "player") return;
    setPhase("enemy");
    const dmg = Math.max(1, player.atk - enemy.def + rollDice(-2, 6));
    const newEHp = Math.max(0, enemy.hp - dmg);
    setEnemy(prev => ({ ...prev, hp: newEHp }));
    addLog(`⚔️ You strike for ${dmg} damage!`, "damage");
    if (newEHp <= 0) {
      addLog(`✅ ${enemy.name} is destroyed! +${baseEnemy.exp} EXP`, "exp");
      setResult("victory");
      setPhase("result");
      setTimeout(() => onResult("victory", { ...player, hp: pHp }, enemy), 1200);
      return;
    }
    enemyTurn(pHp);
  }

  function handleSkill() {
    if (phase !== "player") return;
    setPhase("enemy");
    const dmg = Math.max(1, Math.floor(player.atk * 1.8) - enemy.def + rollDice(0, 8));
    const newEHp = Math.max(0, enemy.hp - dmg);
    setEnemy(prev => ({ ...prev, hp: newEHp }));
    addLog(`💥 POWER STRIKE! You deal ${dmg} massive damage!`, "damage");
    if (newEHp <= 0) {
      addLog(`✅ ${enemy.name} is destroyed! +${baseEnemy.exp} EXP`, "exp");
      setResult("victory");
      setPhase("result");
      setTimeout(() => onResult("victory", { ...player, hp: pHp }, enemy), 1200);
      return;
    }
    enemyTurn(pHp);
  }

  function handleItem(item) {
    if (phase !== "player") return;
    setShowInventory(false);
    if (item.type === "heal") {
      const newHp = Math.min(player.maxHp, pHp + item.value);
      setPHp(newHp);
      addLog(`${item.icon} Used ${item.name}. Restored ${item.value} HP!`, "heal");
    } else if (item.type === "weapon") {
      const newEHp = Math.max(0, enemy.hp - item.damage);
      setEnemy(prev => ({ ...prev, hp: newEHp }));
      addLog(`${item.icon} Used ${item.name}! Dealt ${item.damage} damage!`, "damage");
      if (newEHp <= 0) {
        addLog(`✅ ${enemy.name} is destroyed! +${baseEnemy.exp} EXP`, "exp");
        setResult("victory");
        setPhase("result");
        setTimeout(() => onResult("victory", { ...player, hp: pHp }, enemy), 1200);
        return;
      }
    }
    setPhase("enemy");
    enemyTurn(pHp);
  }

  function handleFlee() {
    if (phase !== "player") return;
    const chance = rollDice(1, 100);
    if (chance > 40) {
      addLog("🏃 You escape successfully!", "system");
      setTimeout(() => onResult("flee", { ...player, hp: pHp }, enemy), 800);
    } else {
      addLog("❌ Failed to escape!", "warn");
      setPhase("enemy");
      enemyTurn(pHp);
    }
  }

  const usableItems = player.inventory.filter(i => i.type === "heal" || i.type === "weapon");

  return (
    <div className="screen battle-screen">
      <div className="battle-header">⚔️ COMBAT INITIATED</div>
      <div className="battle-arena">
        <div className="battle-entity player-entity">
          <div className="entity-name">🧍 {player.name}</div>
          <HPBar current={pHp} max={player.maxHp} label="HP" />
          <div className="entity-stats">ATK: {player.atk} | DEF: {player.def}</div>
        </div>
        <div className="battle-vs">VS</div>
        <div className="battle-entity enemy-entity">
          <div className="entity-name">{enemy.icon} {enemy.name}</div>
          <HPBar current={enemy.hp} max={enemy.maxHp} label="HP" color="#e63946" />
          <div className="entity-desc">{enemy.desc}</div>
        </div>
      </div>

      <div className="battle-log" ref={logRef}>
        {log.length === 0 && <div className="log-normal">⚠️ {enemy.name} appears! What will you do?</div>}
        {log.map((l, i) => <LogLine key={i} line={l} />)}
      </div>

      {phase === "player" && !showInventory && (
        <div className="battle-actions">
          <button className="btn-battle attack" onClick={handleAttack}>⚔️ Attack</button>
          <button className="btn-battle skill" onClick={handleSkill}>💥 Power Strike</button>
          <button className="btn-battle item" onClick={() => setShowInventory(true)}>🎒 Item</button>
          <button className="btn-battle flee" onClick={handleFlee}>🏃 Flee</button>
        </div>
      )}

      {showInventory && (
        <div className="battle-inventory">
          <div className="inv-title">Select Item:</div>
          {usableItems.length === 0 && <div className="inv-empty">No usable items!</div>}
          {usableItems.map((item, i) => (
            <button key={i} className="btn-item" onClick={() => handleItem(item)}>
              {item.icon} {item.name} — {item.desc}
            </button>
          ))}
          <button className="btn-battle flee" onClick={() => setShowInventory(false)}>← Back</button>
        </div>
      )}

      {phase === "enemy" && <div className="turn-indicator">🧟 Enemy is acting...</div>}
    </div>
  );
}

function InventoryScreen({ player, onClose, onUseItem }) {
  return (
    <div className="screen inventory-screen">
      <div className="inv-header">🎒 INVENTORY <span className="inv-sub">Lv.{player.level} {player.name}</span></div>
      <div className="inv-grid">
        {player.inventory.length === 0 && <div className="inv-empty">Your bag is empty.</div>}
        {player.inventory.map((item, i) => (
          <div key={i} className="inv-item-card">
            <span className="inv-item-icon">{item.icon}</span>
            <div className="inv-item-info">
              <div className="inv-item-name">{item.name}</div>
              <div className="inv-item-desc">{item.desc}</div>
            </div>
            {(item.type === "heal" || item.type === "equip" || item.type === "cure" || item.type === "boost") && (
              <button className="btn-use" onClick={() => onUseItem(item, i)}>USE</button>
            )}
          </div>
        ))}
      </div>
      <button className="btn-back" onClick={onClose}>← Back</button>
    </div>
  );
}

function MapScreen({ player, onTravel, onClose }) {
  return (
    <div className="screen map-screen">
      <div className="map-header">🗺️ WORLD MAP</div>
      <div className="map-grid">
        {Object.entries(LOCATIONS).map(([key, loc]) => {
          const locked = loc.minLevel && player.level < loc.minLevel;
          const current = player.location === key;
          return (
            <div key={key} className={`map-card ${current ? "map-current" : ""} ${locked ? "map-locked" : ""}`}>
              <div className="map-icon">{loc.icon}</div>
              <div className="map-name">{loc.name}</div>
              <div className="map-desc">{loc.desc}</div>
              {locked && <div className="map-lock">🔒 Requires Lv.{loc.minLevel}</div>}
              {!current && !locked && (
                <button className="btn-travel" onClick={() => onTravel(key)}>→ TRAVEL</button>
              )}
              {current && <div className="map-here">📍 YOU ARE HERE</div>}
            </div>
          );
        })}
      </div>
      <button className="btn-back" onClick={onClose}>← Back</button>
    </div>
  );
}

function NPCScreen({ npc, player, onClose, onQuestComplete }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [questMsg, setQuestMsg] = useState(null);
  const data = NPCS[npc];
  const questDone = player.questsDone.includes(data.quest?.id);

  function tryQuest() {
    const q = data.quest;
    if (!q) return;
    const needed = q.requires;
    const found = player.inventory.filter(i => i.id === needed.item);
    const total = found.reduce((a, b) => a + (b.qty || 1), 0);
    if (total >= needed.count) {
      setQuestMsg(`✅ Quest completed! Received ${q.reward.exp} EXP`);
      onQuestComplete(npc, data.quest);
    } else {
      setQuestMsg(`❌ You need ${needed.count}x ${ITEMS[needed.item]?.name || needed.item}`);
    }
  }

  return (
    <div className="screen npc-screen">
      <div className="npc-header">{data.icon} {data.name}</div>
      <div className="npc-bubble">
        <TypewriterText key={lineIdx} text={data.lines[lineIdx % data.lines.length]} />
      </div>
      <button className="btn-primary" onClick={() => setLineIdx(i => i + 1)}>Continue talking</button>
      {data.quest && !questDone && (
        <div className="npc-quest">
          <div className="quest-title">📋 Quest: {data.quest.desc}</div>
          <button className="btn-quest" onClick={tryQuest}>Hand in items</button>
          {questMsg && <div className="quest-msg">{questMsg}</div>}
        </div>
      )}
      {questDone && <div className="quest-done">✅ Quest completed!</div>}
      <button className="btn-back" onClick={onClose}>← Leave</button>
    </div>
  );
}

function EndingScreen({ endingKey }) {
  const ending = ENDINGS[endingKey];
  return (
    <div className="screen ending-screen">
      <div className="ending-icon">{ending.icon}</div>
      <div className="ending-title">{ending.title}</div>
      <div className="ending-text">{ending.text}</div>
      <button className="btn-primary" onClick={() => window.location.reload()}>↩ Play Again</button>
    </div>
  );
}

function HUDBar({ player, onMap, onInventory }) {
  return (
    <div className="hud">
      <div className="hud-left">
        <span className="hud-name">🧍 {player.name}</span>
        <span className="hud-level">Lv.{player.level}</span>
        {player.infected && <span className="hud-infected">☣️ INFECTED</span>}
      </div>
      <div className="hud-center">
        <HPBar current={player.hp} max={player.maxHp} label="HP" />
        <div className="hud-exp">EXP: {player.exp}/{player.expToLevel}</div>
      </div>
      <div className="hud-right">
        <button className="hud-btn" onClick={onMap}>🗺️ Map</button>
        <button className="hud-btn" onClick={onInventory}>🎒 Bag</button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN GAME
// ============================================================

export default function App() {
  const [screen, setScreen] = useState("title");
  const [player, setPlayer] = useState(null);
  const [storyEvent, setStoryEvent] = useState(null);
  const [battleEnemy, setBattleEnemy] = useState(null);
  const [activeNPC, setActiveNPC] = useState(null);
  const [log, setLog] = useState([]);
  const [ending, setEnding] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const logRef = useRef();

  function addLog(text, type = "normal") {
    setLog(prev => [...prev.slice(-30), { text, type }]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  }

  function startGame(name) {
    const p = createPlayer(name);
    setPlayer(p);
    const firstEvent = STORY_EVENTS[0];
    setStoryEvent(firstEvent);
    setScreen("story");
  }

  function handleStoryChoice(choice) {
    if (choice.effect?.item) {
      addItemToPlayer(ITEMS[choice.effect.item]);
      addLog(`📦 Obtained: ${ITEMS[choice.effect.item].name}`, "system");
    }
    if (choice.next) {
      const nextEvent = STORY_EVENTS.find(e => e.id === choice.next);
      if (nextEvent) { setStoryEvent(nextEvent); return; }
    }
    setScreen("explore");
  }

  function addItemToPlayer(item) {
    setPlayer(prev => {
      const inv = [...prev.inventory];
      const existing = inv.find(i => i.id === item.id);
      if (existing) { existing.qty = (existing.qty || 1) + 1; }
      else { inv.push({ ...item, qty: 1 }); }
      return { ...prev, inventory: inv };
    });
  }

  function removeItemFromPlayer(itemId, count = 1) {
    setPlayer(prev => {
      let inv = [...prev.inventory];
      let remaining = count;
      inv = inv.map(i => {
        if (i.id === itemId && remaining > 0) {
          const remove = Math.min(remaining, i.qty || 1);
          remaining -= remove;
          return { ...i, qty: (i.qty || 1) - remove };
        }
        return i;
      }).filter(i => (i.qty || 1) > 0);
      return { ...prev, inventory: inv };
    });
  }

  function gainExp(amount) {
    setPlayer(prev => {
      let { exp, level, expToLevel, maxHp, atk, def } = prev;
      exp += amount;
      let leveled = false;
      while (exp >= expToLevel) {
        exp -= expToLevel;
        level++;
        expToLevel = calcExpToLevel(level);
        maxHp += 15;
        atk += 3;
        def += 2;
        leveled = true;
      }
      if (leveled) addLog(`🎉 LEVEL UP! Now Lv.${level}! HP+15 ATK+3 DEF+2`, "exp");
      return { ...prev, exp, level, expToLevel, maxHp, atk, def, hp: leveled ? maxHp : prev.hp };
    });
  }

  function handleBattleResult(result, updatedPlayer, enemy) {
    if (result === "victory") {
      gainExp(ENEMIES[battleEnemy].exp);
      const loot = ENEMIES[battleEnemy].loot;
      if (loot && loot.length > 0) {
        const drop = loot[rollDice(0, loot.length - 1)];
        if (drop && ITEMS[drop]) {
          addItemToPlayer(ITEMS[drop]);
          addLog(`📦 Looted: ${ITEMS[drop].name}`, "system");
        }
      }
      setPlayer(prev => ({ ...prev, hp: updatedPlayer.hp, kills: prev.kills + 1 }));
      if (LOCATIONS[updatedPlayer.location]?.finalBoss) {
        setEnding("hero");
        setScreen("ending");
        return;
      }
    } else if (result === "defeat") {
      setEnding("infected");
      setScreen("ending");
      return;
    } else {
      setPlayer(prev => ({ ...prev, hp: updatedPlayer.hp }));
      addLog("🏃 You escaped.", "warn");
    }
    setBattleEnemy(null);
    setScreen("explore");
  }

  function handleExploreAction(action) {
    const loc = LOCATIONS[player.location];
    if (action === "fight" || action === "explore") {
      if (loc.enemies && loc.enemies.length > 0) {
        const enemyKey = loc.enemies[rollDice(0, loc.enemies.length - 1)];
        setBattleEnemy(enemyKey);
        setScreen("battle");
      } else {
        addLog("No enemies nearby.", "normal");
      }
    } else if (action === "scavenge") {
      if (loc.loot && loc.loot.length > 0) {
        const found = loc.loot[rollDice(0, loc.loot.length - 1)];
        if (found && ITEMS[found] && rollDice(1, 100) > 35) {
          addItemToPlayer(ITEMS[found]);
          addLog(`📦 Scavenged: ${ITEMS[found].name}!`, "heal");
          gainExp(10);
        } else {
          addLog("🔍 Searched the area... nothing useful.", "warn");
        }
      }
    } else if (action === "rest") {
      const healed = Math.floor(player.maxHp * 0.4);
      setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healed), day: prev.day + 1 }));
      addLog(`😴 You rest. Restored ${healed} HP. Day ${player.day + 1} begins.`, "heal");
    } else if (action === "talk") {
      if (loc.npcs && loc.npcs.length > 0) {
        setActiveNPC(loc.npcs[rollDice(0, loc.npcs.length - 1)]);
        setScreen("npc");
      }
    } else if (action === "go_back") {
      setPlayer(prev => ({ ...prev, location: "shelter" }));
      addLog("🏠 Returned to shelter.", "system");
    } else if (action === "inventory") {
      setShowInventory(true);
    }
  }

  function handleUseItem(item, idx) {
    if (item.type === "heal" || item.type === "boost") {
      const healed = item.value || 0;
      setPlayer(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + healed),
        atk: item.atkBoost ? prev.atk + item.atkBoost : prev.atk
      }));
      removeItemFromPlayer(item.id);
      addLog(`${item.icon} Used ${item.name}. +${healed} HP`, "heal");
    } else if (item.type === "equip") {
      setPlayer(prev => ({
        ...prev,
        atk: item.atkBoost ? prev.atk + item.atkBoost : prev.atk,
        def: item.defBoost ? prev.def + item.defBoost : prev.def,
        equipped: [...prev.equipped, item.id]
      }));
      removeItemFromPlayer(item.id);
      addLog(`🛡️ Equipped ${item.name}!`, "system");
    } else if (item.type === "cure") {
      setPlayer(prev => ({ ...prev, infected: false, infectionTimer: 0 }));
      removeItemFromPlayer(item.id);
      addLog("🧪 Antidote used. Infection cured!", "heal");
    }
    setShowInventory(false);
  }

  function handleTravel(locationKey) {
    setPlayer(prev => ({ ...prev, location: locationKey }));
    addLog(`🗺️ Traveled to: ${LOCATIONS[locationKey].name}`, "system");
    setShowMap(false);
    setScreen("explore");
  }

  function handleQuestComplete(npcKey, quest) {
    removeItemFromPlayer(quest.requires.item, quest.requires.count);
    gainExp(quest.reward.exp);
    if (quest.reward.item) addItemToPlayer(ITEMS[quest.reward.item]);
    if (quest.reward.statBoost) {
      setPlayer(prev => ({
        ...prev,
        maxHp: prev.maxHp + (quest.reward.statBoost.hp || 0),
        atk: prev.atk + (quest.reward.statBoost.atk || 0)
      }));
    }
    setPlayer(prev => ({ ...prev, questsDone: [...prev.questsDone, quest.id] }));
    addLog(`✅ Quest done! +${quest.reward.exp} EXP`, "exp");
  }

  // ============================================================
  // RENDER
  // ============================================================

  if (screen === "title") return <TitleScreen onStart={startGame} />;
  if (screen === "story") return <StoryScreen event={storyEvent} onChoice={handleStoryChoice} />;
  if (screen === "battle") return (
    <BattleScreen player={player} enemyKey={battleEnemy} onResult={handleBattleResult} />
  );
  if (screen === "npc") return (
    <NPCScreen npc={activeNPC} player={player} onClose={() => setScreen("explore")} onQuestComplete={handleQuestComplete} />
  );
  if (screen === "ending") return <EndingScreen endingKey={ending} />;

  const loc = LOCATIONS[player.location];

  return (
    <div className="game-root">
      <HUDBar player={player} onMap={() => setShowMap(true)} onInventory={() => setShowInventory(true)} />

      {showMap && (
        <MapScreen player={player} onTravel={handleTravel} onClose={() => setShowMap(false)} />
      )}
      {showInventory && (
        <InventoryScreen player={player} onClose={() => setShowInventory(false)} onUseItem={handleUseItem} />
      )}

      {!showMap && !showInventory && (
        <div className="explore-root">
          <div className="location-header">
            <span className="loc-icon">{loc.icon}</span>
            <div>
              <div className="loc-name">{loc.name}</div>
              <div className="loc-desc">{loc.desc}</div>
            </div>
          </div>

          <div className="stats-row">
            <StatCard icon="⚔️" label="ATK" value={player.atk} />
            <StatCard icon="🛡️" label="DEF" value={player.def} />
            <StatCard icon="🌟" label="LVL" value={player.level} />
            <StatCard icon="☠️" label="KILLS" value={player.kills} />
            <StatCard icon="📅" label="DAY" value={player.day} />
          </div>

          <div className="action-panel">
            <div className="action-title">🎯 Actions</div>
            <div className="action-grid">
              {loc.actions.map((action, i) => {
                const labels = {
                  explore: "🔍 Explore Area",
                  scavenge: "📦 Scavenge",
                  fight: "⚔️ Fight",
                  rest: "😴 Rest",
                  talk: "🗣️ Talk to NPC",
                  inventory: "🎒 Inventory",
                  craft: "🔧 Craft",
                  go_back: "🏠 Return to Shelter"
                };
                return (
                  <button key={i} className="btn-action" onClick={() => handleExploreAction(action)}>
                    {labels[action] || action}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="game-log" ref={logRef}>
            <div className="log-title">📋 Event Log</div>
            {log.length === 0 && <div className="log-normal">Your story begins...</div>}
            {log.map((l, i) => <LogLine key={i} line={l} />)}
          </div>
        </div>
      )}
    </div>
  );
}
