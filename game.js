"use strict";

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  banner: document.querySelector("#banner"),
  bannerKicker: document.querySelector("#bannerKicker"),
  bannerTitle: document.querySelector("#bannerTitle"),
  bannerText: document.querySelector("#bannerText"),
  primaryButton: document.querySelector("#primaryButton"),
  level: document.querySelector("#levelValue"),
  score: document.querySelector("#scoreValue"),
  cores: document.querySelector("#coresValue"),
  target: document.querySelector("#targetValue"),
  time: document.querySelector("#timeValue"),
  health: document.querySelector("#healthValue"),
  energy: document.querySelector("#energyBar"),
  pulse: document.querySelector("#pulseBar"),
  soundButton: document.querySelector("#soundButton"),
  soundIcon: document.querySelector("#soundIcon"),
  stick: document.querySelector("#stick"),
  stickKnob: document.querySelector("#stickKnob"),
  dashButton: document.querySelector("#dashButton"),
  pulseButton: document.querySelector("#pulseButton"),
  skinGrid: document.querySelector("#skinGrid"),
  skinToggle: document.querySelector("#skinToggle"),
  levelGrid: document.querySelector("#levelGrid"),
  levelPanel: document.querySelector("#levelPanel"),
  selectedLevelLabel: document.querySelector("#selectedLevelLabel"),
};

const TAU = Math.PI * 2;
const MAX_LEVEL = 95;
const BASE_PLAYER_SPEED = 420;
const PLAYER_RADIUS = 15;
const SKIN_STORAGE_KEY = "novaMantaSkin";
const PROGRESS_STORAGE_KEY = "novaMantaProgress";

const SKINS = [
  { id: "classic", name: "Classique", shape: "manta", c1: "#1ad3d0", c2: "#f5f7fb", c3: "#ffcf5a", glow: "#48e3d7", trail: "#48e3d7", dash: "#ffcf5a" },
  { id: "crimson", name: "Cramoisi", shape: "dart", c1: "#ff3b5c", c2: "#ffd0d8", c3: "#ff8a00", glow: "#ff6f61", trail: "#ff3b5c", dash: "#ff8a00" },
  { id: "phantom", name: "Fantome", shape: "wedge", c1: "#7b8cff", c2: "#e8ecff", c3: "#b58cff", glow: "#b58cff", trail: "#7b8cff", dash: "#e8ecff" },
  { id: "solar", name: "Solaire", shape: "manta", c1: "#ff9f1c", c2: "#fff4d6", c3: "#ffcf5a", glow: "#ffcf5a", trail: "#ff9f1c", dash: "#ffffff" },
  { id: "abyss", name: "Abysses", shape: "dart", c1: "#006d77", c2: "#83c5be", c3: "#48e3d7", glow: "#48e3d7", trail: "#006d77", dash: "#83c5be" },
  { id: "violet", name: "Violette", shape: "hex", c1: "#7c3aed", c2: "#ddd6fe", c3: "#f472b6", glow: "#b58cff", trail: "#7c3aed", dash: "#f472b6" },
  { id: "arctic", name: "Arctique", shape: "manta", c1: "#38bdf8", c2: "#f0f9ff", c3: "#bae6fd", glow: "#7dd3fc", trail: "#38bdf8", dash: "#ffffff" },
  { id: "toxic", name: "Toxique", shape: "wedge", c1: "#65a30d", c2: "#d9f99d", c3: "#bef264", glow: "#86f27d", trail: "#65a30d", dash: "#d9f99d" },
  { id: "rose", name: "Rose Or", shape: "diamond", c1: "#f43f5e", c2: "#ffe4e6", c3: "#fbbf24", glow: "#fb7185", trail: "#f43f5e", dash: "#fbbf24" },
  { id: "midnight", name: "Minuit", shape: "dart", c1: "#1e293b", c2: "#94a3b8", c3: "#48e3d7", glow: "#64748b", trail: "#334155", dash: "#48e3d7" },
  { id: "ember", name: "Braise", shape: "manta", c1: "#ea580c", c2: "#fed7aa", c3: "#fbbf24", glow: "#fb923c", trail: "#ea580c", dash: "#fef3c7" },
  { id: "cyber", name: "Cyber", shape: "hex", c1: "#ec4899", c2: "#fce7f3", c3: "#22d3ee", glow: "#f472b6", trail: "#ec4899", dash: "#22d3ee" },
  { id: "steel", name: "Acier", shape: "wedge", c1: "#64748b", c2: "#e2e8f0", c3: "#cbd5e1", glow: "#94a3b8", trail: "#64748b", dash: "#f8fafc" },
  { id: "prism", name: "Prisme", shape: "diamond", c1: "#06b6d4", c2: "#fef08a", c3: "#a855f7", glow: "#f472b6", trail: "#06b6d4", dash: "#a855f7" },
  { id: "void", name: "Neant", shape: "dart", c1: "#312e81", c2: "#818cf8", c3: "#c084fc", glow: "#6366f1", trail: "#312e81", dash: "#c084fc" },
  { id: "jade", name: "Jade", shape: "manta", c1: "#059669", c2: "#a7f3d0", c3: "#34d399", glow: "#10b981", trail: "#059669", dash: "#ecfdf5" },
  { id: "lava", name: "Lave", shape: "hex", c1: "#dc2626", c2: "#fecaca", c3: "#f97316", glow: "#ef4444", trail: "#dc2626", dash: "#fdba74" },
  { id: "bolt", name: "Eclair", shape: "wedge", c1: "#2563eb", c2: "#dbeafe", c3: "#facc15", glow: "#3b82f6", trail: "#2563eb", dash: "#facc15" },
  { id: "sakura", name: "Sakura", shape: "diamond", c1: "#f9a8d4", c2: "#fff1f2", c3: "#fda4af", glow: "#fb7185", trail: "#f9a8d4", dash: "#fecdd3" },
  { id: "ghost", name: "Spectre", shape: "manta", c1: "rgba(200,220,255,0.55)", c2: "rgba(255,255,255,0.9)", c3: "rgba(180,200,255,0.7)", glow: "#e2e8f0", trail: "#cbd5e1", dash: "#ffffff" },
];

let selectedSkinId = localStorage.getItem(SKIN_STORAGE_KEY) || "classic";

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { maxUnlocked: clamp(Math.floor(data.maxUnlocked || 1), 1, MAX_LEVEL) };
    }
  } catch (error) {
    /* ignore corrupted save */
  }
  return { maxUnlocked: 1 };
}

let progress = loadProgress();
let selectedLevel = progress.maxUnlocked;
let levelConfig = null;
let meteorTimer = 0;
let levelAnnounce = { text: "", life: 0 };

let width = 1;
let height = 1;
let dpr = 1;
let lastTime = 0;
let audioContext = null;
let muted = false;
let rafId = 0;

// --- Musique de fond ---
let musicBuffer = null;
let musicSource = null;
let musicGain = null;
let musicLoaded = false;

async function loadMusic() {
  if (musicLoaded) return;
  musicLoaded = true;
  try {
    const response = await fetch("Loop-song.wav");
    const arrayBuffer = await response.arrayBuffer();
    musicBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.warn("Impossible de charger Loop-song.wav :", err);
  }
}

function startMusic() {
  if (muted || !audioContext || !musicBuffer) return;
  stopMusic();
  musicGain = audioContext.createGain();
  musicGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  musicGain.gain.linearRampToValueAtTime(0.32, audioContext.currentTime + 1.5);
  musicGain.connect(audioContext.destination);
  musicSource = audioContext.createBufferSource();
  musicSource.buffer = musicBuffer;
  musicSource.loop = true;
  musicSource.connect(musicGain);
  musicSource.start(0);
}

function stopMusic(fade = false) {
  if (!musicSource) return;
  if (fade && musicGain) {
    const t = audioContext.currentTime;
    musicGain.gain.setValueAtTime(musicGain.gain.value, t);
    musicGain.gain.linearRampToValueAtTime(0.0001, t + 0.8);
    const src = musicSource;
    setTimeout(() => { try { src.stop(); } catch (_) {} }, 900);
  } else {
    try { musicSource.stop(); } catch (_) {}
  }
  musicSource = null;
  musicGain = null;
}

async function ensureMusic() {
  if (muted) return;
  makeAudio();                          // crée le contexte si absent
  if (!audioContext) return;
  if (!musicLoaded) await loadMusic();
  if (!musicSource && musicBuffer) startMusic();
}

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  dash: false,
  pulse: false,
  joystick: { active: false, id: null, x: 0, y: 0 },
};

const game = {
  mode: "ready",
  level: 1,
  score: 0,
  bestCombo: 1,
  combo: 1,
  comboTimer: 0,
  cores: 0,
  target: 0,
  time: 0,
  shake: 0,
  flash: 0,
  levelClearTimer: 0,
  messageTimer: 0,
};

const player = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  angle: -Math.PI / 2,
  health: 4,
  maxHealth: 4,
  energy: 100,
  pulse: 100,
  shield: 0,
  invulnerable: 0,
  dashTime: 0,
  dashCooldown: 0,
  speedBoost: 0,
};

let stars = [];
let cores = [];
let pickups = [];
let enemies = [];
let bullets = [];
let mines = [];
let gravityWells = [];
let meteors = [];
let barriers = [];
let toxicZones = [];
let blackHoles = [];
let windZones = [];
let turrets = [];
let particles = [];
let popups = [];
let portal = null;
let pulseWave = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function dist(a, b, c, d) {
  return Math.hypot(a - c, b - d);
}

function formatScore(value) {
  return Math.floor(value).toLocaleString("fr-FR");
}

function getSkin() {
  return SKINS.find((skin) => skin.id === selectedSkinId) || SKINS[0];
}

function capCount(value, max) {
  return Math.min(Math.max(0, Math.floor(value)), max);
}

function getSectorName(level) {
  const names = [
    "Eclaireur", "Brume", "Courant", "Eclat", "Fracture", "Orage", "Nebuleuse", "Rupture", "Echo", "Zenith",
    "Abime", "Cyclone", "Mirage", "Foudre", "Eclipse", "Tempete", "Aurore", "Chaos", "Singularite", "Omega",
  ];
  const phase = Math.floor((level - 1) / 5);
  const sub = ((level - 1) % 5) + 1;
  return `${names[Math.min(phase, names.length - 1)]} ${sub}`;
}

function getNewMechanic(level) {
  const unlocks = [
    [6, "Tourbillons hostiles"],
    [12, "Tireurs de precision"],
    [15, "Puits gravitationnels"],
    [20, "Spectres teleporteurs"],
    [22, "Pluie de meteores"],
    [25, "Noyaux charges"],
    [28, "Ricocheurs"],
    [32, "Barrieres rotatives"],
    [36, "Diviseurs"],
    [40, "Zones toxiques"],
    [44, "Fantomes"],
    [50, "Trous noirs"],
    [52, "Traqueurs a tete chercheuse"],
    [58, "Courants solaires"],
    [60, "Brise-boucliers"],
    [68, "Tourelles laser"],
    [75, "Tempete magnetique"],
    [85, "Secteur apocalyptique"],
    [95, "Noyau final"],
  ];
  const found = unlocks.find(([unlock]) => unlock === level);
  return found ? found[1] : null;
}

function getLevelConfig(level) {
  const t = (level - 1) / (MAX_LEVEL - 1);
  const diff = 1 + t * 2.4;
  return {
    level,
    target: Math.floor(8 + level * 1.45 + Math.sqrt(level) * 2.2),
    time: Math.max(36, Math.floor(70 - level * 0.28 + Math.floor(level / 12) * 4)),
    mineCount: capCount((level - 4) * 0.38 * diff, 28),
    hunters: capCount((1 + level * 0.42) * diff, 22),
    spinners: capCount(level >= 6 ? (level - 5) * 0.38 * diff : 0, 18),
    shooters: capCount(level >= 12 ? (level - 11) * 0.3 * diff : 0, 14),
    wraiths: capCount(level >= 20 ? (level - 19) * 0.2 * diff : 0, 10),
    bouncers: capCount(level >= 28 ? (level - 27) * 0.18 * diff : 0, 10),
    splitters: capCount(level >= 36 ? (level - 35) * 0.16 * diff : 0, 8),
    phantoms: capCount(level >= 44 ? (level - 43) * 0.14 * diff : 0, 10),
    stalkers: capCount(level >= 52 ? (level - 51) * 0.12 * diff : 0, 8),
    breakers: capCount(level >= 60 ? (level - 59) * 0.1 * diff : 0, 6),
    turrets: capCount(level >= 68 ? (level - 67) * 0.09 * diff : 0, 6),
    gravityWells: capCount(level >= 15 ? (level - 14) * 0.07 : 0, 5),
    barriers: capCount(level >= 32 ? (level - 31) * 0.055 : 0, 4),
    toxicZones: capCount(level >= 40 ? (level - 39) * 0.045 : 0, 4),
    blackHoles: capCount(level >= 50 ? (level - 49) * 0.035 : 0, 3),
    windZones: capCount(level >= 58 ? (level - 57) * 0.035 : 0, 3),
    meteorRate: level >= 22 ? 0.7 + t * 2.2 : 0,
    chargedCoreChance: level >= 25 ? Math.min(0.5, 0.08 + t * 0.42) : 0,
    enemySpeedMul: 1 + t * 1.6,
    bulletSpeedMul: 1 + t * 1.1,
    sectorName: getSectorName(level),
    newMechanic: getNewMechanic(level),
  };
}

function makeAudio() {
  if (audioContext || muted) return;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;
  audioContext = new AudioCtor();
}

function tone(freq, duration, type = "sine", gain = 0.05, slide = 0) {
  if (muted || !audioContext) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const amp = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slide) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), now + duration);
  }
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp);
  amp.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + duration + 0.03);
}

function chord(notes, duration, type = "sine", gain = 0.035) {
  notes.forEach((note, index) => {
    setTimeout(() => tone(note, duration, type, gain), index * 38);
  });
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = Math.max(1, Math.floor(rect.width));
  height = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (!stars.length) {
    stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: rand(0.2, 1),
      twinkle: Math.random() * TAU,
    }));
  } else {
    stars.forEach((star) => {
      star.x = clamp(star.x, 0, width);
      star.y = clamp(star.y, 0, height);
    });
  }

  player.x = clamp(player.x || width * 0.5, 28, width - 28);
  player.y = clamp(player.y || height * 0.72, 28, height - 28);
}

function isLevelUnlocked(level) {
  return level >= 1 && level <= progress.maxUnlocked;
}

function unlockLevel(completedLevel) {
  if (completedLevel >= progress.maxUnlocked) {
    progress.maxUnlocked = Math.min(completedLevel + 1, MAX_LEVEL);
    saveProgress();
    renderLevelSelector();
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function resetRun(level = selectedLevel) {
  const startAt = clamp(Math.floor(level), 1, progress.maxUnlocked);
  selectedLevel = startAt;
  game.mode = "playing";
  game.level = startAt;
  game.score = 0;
  game.bestCombo = 1;
  game.combo = 1;
  game.comboTimer = 0;
  player.health = player.maxHealth;
  player.energy = 100;
  player.pulse = 100;
  player.shield = 0;
  player.invulnerable = 1;
  player.speedBoost = 0;
  player.vx = 0;
  player.vy = 0;
  startLevel(startAt);
  hideBanner();
  renderLevelSelector();
  chord([220, 330, 494], 0.1, "triangle", 0.035);
  ensureMusic();
}

function startLevel(level) {
  levelConfig = getLevelConfig(level);
  game.level = level;
  game.cores = 0;
  game.target = levelConfig.target;
  game.time = levelConfig.time;
  game.levelClearTimer = 0;
  game.combo = 1;
  game.comboTimer = 0;
  game.flash = 0.12;
  meteorTimer = 2.4;
  player.x = width * 0.5;
  player.y = height * 0.72;
  player.vx = 0;
  player.vy = 0;
  player.speedBoost = 0;
  player.invulnerable = Math.max(player.invulnerable, 1.2);
  player.energy = Math.max(player.energy, 70);
  player.pulse = Math.max(player.pulse, level === 1 ? 100 : 35);
  portal = null;
  pulseWave = null;
  cores = [];
  pickups = [];
  enemies = [];
  bullets = [];
  mines = [];
  gravityWells = [];
  meteors = [];
  barriers = [];
  toxicZones = [];
  blackHoles = [];
  windZones = [];
  turrets = [];
  particles = [];
  popups = [];

  for (let i = 0; i < game.target + 6; i += 1) {
    cores.push(makeCore());
  }

  for (let i = 0; i < levelConfig.mineCount; i += 1) mines.push(makeMine());
  for (let i = 0; i < levelConfig.hunters; i += 1) enemies.push(makeEnemy("hunter"));
  for (let i = 0; i < levelConfig.spinners; i += 1) enemies.push(makeEnemy("spinner"));
  for (let i = 0; i < levelConfig.shooters; i += 1) enemies.push(makeEnemy("shooter"));
  for (let i = 0; i < levelConfig.wraiths; i += 1) enemies.push(makeEnemy("wraith"));
  for (let i = 0; i < levelConfig.bouncers; i += 1) enemies.push(makeEnemy("bouncer"));
  for (let i = 0; i < levelConfig.splitters; i += 1) enemies.push(makeEnemy("splitter"));
  for (let i = 0; i < levelConfig.phantoms; i += 1) enemies.push(makeEnemy("phantom"));
  for (let i = 0; i < levelConfig.stalkers; i += 1) enemies.push(makeEnemy("stalker"));
  for (let i = 0; i < levelConfig.breakers; i += 1) enemies.push(makeEnemy("breaker"));
  for (let i = 0; i < levelConfig.turrets; i += 1) turrets.push(makeTurret());
  for (let i = 0; i < levelConfig.gravityWells; i += 1) gravityWells.push(makeGravityWell());
  for (let i = 0; i < levelConfig.barriers; i += 1) barriers.push(makeBarrier());
  for (let i = 0; i < levelConfig.toxicZones; i += 1) toxicZones.push(makeToxicZone());
  for (let i = 0; i < levelConfig.blackHoles; i += 1) blackHoles.push(makeBlackHole());
  for (let i = 0; i < levelConfig.windZones; i += 1) windZones.push(makeWindZone());

  pickups.push(makePickup(level === 1 ? "shield" : Math.random() > 0.55 ? "shield" : "pulse"));
  if (level >= 30 && Math.random() > 0.6) pickups.push(makePickup("time"));

  const announce = levelConfig.newMechanic
    ? `Nouveau: ${levelConfig.newMechanic}`
    : `Secteur ${String(level).padStart(2, "0")} - ${levelConfig.sectorName}`;
  levelAnnounce = { text: announce, life: 2.8 };
  updateHud();
}

function spawnAway(radius = 40, margin = 42) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < 100; i += 1) {
    x = rand(margin, width - margin);
    y = rand(margin, height - margin);
    if (dist(x, y, player.x, player.y) > Math.min(width, height) * 0.24 + radius) {
      return { x, y };
    }
  }
  return { x: rand(margin, width - margin), y: rand(margin, height - margin) };
}

function makeCore() {
  const pos = spawnAway(20, 44);
  const charged = levelConfig && Math.random() < levelConfig.chargedCoreChance;
  return {
    x: pos.x,
    y: pos.y,
    r: rand(9, 13),
    spin: rand(0, TAU),
    wobble: rand(0, TAU),
    value: charged ? 180 : 100,
    charged,
  };
}

function makeMine() {
  const pos = spawnAway(50, 55);
  return {
    x: pos.x,
    y: pos.y,
    r: 18,
    spin: rand(0, TAU),
    armed: 0.6,
  };
}

function makePickup(type) {
  const pos = spawnAway(60, 58);
  return {
    type,
    x: pos.x,
    y: pos.y,
    r: 15,
    t: rand(0, TAU),
  };
}

function makeEnemy(type, mini = false) {
  const pos = spawnAway(80, 56);
  const sizes = {
    hunter: 16, spinner: 16, shooter: 18, wraith: 15, bouncer: 14,
    splitter: 20, phantom: 16, stalker: 17, breaker: 19,
  };
  const hps = {
    hunter: 1, spinner: 1, shooter: 2, wraith: 1, bouncer: 1,
    splitter: 2, phantom: 1, stalker: 2, breaker: 2,
  };
  return {
    type,
    x: pos.x,
    y: pos.y,
    vx: rand(-80, 80),
    vy: rand(-80, 80),
    r: mini ? 10 : (sizes[type] || 16),
    hp: mini ? 1 : (hps[type] || 1),
    angle: rand(0, TAU),
    turn: rand(-1, 1),
    stun: 0,
    fire: rand(0.4, 1.8),
    phase: rand(0, TAU),
    teleport: rand(1.5, 3.5),
    mini,
  };
}

function makeTurret() {
  const pos = spawnAway(90, 60);
  return { x: pos.x, y: pos.y, angle: rand(0, TAU), fire: rand(0.5, 1.4), r: 22 };
}

function makeGravityWell() {
  const pos = spawnAway(100, 64);
  return { x: pos.x, y: pos.y, r: rand(38, 52), pull: rand(95, 130), spin: rand(0, TAU) };
}

function makeBarrier() {
  const pos = spawnAway(110, 66);
  return { x: pos.x, y: pos.y, angle: rand(0, TAU), len: rand(70, 110), spin: rand(-0.8, 0.8) };
}

function makeToxicZone() {
  const pos = spawnAway(100, 64);
  return { x: pos.x, y: pos.y, r: rand(42, 58), pulse: rand(0, TAU) };
}

function makeBlackHole() {
  const pos = spawnAway(120, 68);
  return { x: pos.x, y: pos.y, r: rand(32, 44), pull: rand(180, 240), spin: rand(0, TAU) };
}

function makeWindZone() {
  const pos = spawnAway(100, 64);
  const angle = rand(0, TAU);
  return { x: pos.x, y: pos.y, r: rand(55, 75), angle, force: rand(120, 200) };
}

function makeMeteor() {
  return {
    x: rand(40, width - 40),
    y: -30,
    vx: rand(-40, 40),
    vy: rand(280, 420) + game.level * 2,
    r: rand(10, 18),
    spin: rand(-3, 3),
    angle: rand(0, TAU),
  };
}

function createPortal() {
  portal = {
    x: width * 0.5,
    y: Math.max(80, height * 0.22),
    r: 38,
    t: 0,
    ready: false,
  };
  burst(portal.x, portal.y, "#48e3d7", 42, 260, 1.1);
  chord([330, 494, 660], 0.15, "triangle", 0.045);
}

function freezeEnemies(duration) {
  enemies.forEach((enemy) => {
    enemy.stun = Math.max(enemy.stun, duration);
  });
}

function addScore(points, x, y, color = "#f5f7fb") {
  game.score += points;
  popups.push({ x, y, text: `+${points}`, color, life: 0.78, maxLife: 0.78 });
}

function collectCore(core, index) {
  if (core.charged && player.dashTime <= 0) {
    burst(core.x, core.y, "#ff6f61", 10, 120, 0.5);
    tone(180, 0.05, "square", 0.02);
    return;
  }
  cores.splice(index, 1);
  game.cores += 1;
  game.comboTimer = 2.6;
  game.combo = clamp(game.combo + 0.35, 1, 6);
  game.bestCombo = Math.max(game.bestCombo, Math.floor(game.combo));
  const points = Math.round(core.value * Math.floor(game.combo));
  addScore(points, core.x, core.y, "#ffcf5a");
  player.pulse = clamp(player.pulse + 13, 0, 100);
  player.energy = clamp(player.energy + 9, 0, 100);
  burst(core.x, core.y, "#ffcf5a", 22, 160, 0.8);
  tone(620 + Math.min(450, game.combo * 40), 0.09, "triangle", 0.035, 80);

  if (game.cores >= game.target && !portal) {
    createPortal();
  }
}

function usePickup(pickup, index) {
  pickups.splice(index, 1);
  if (pickup.type === "heart") {
    player.health = clamp(player.health + 1, 0, player.maxHealth);
    addScore(150, pickup.x, pickup.y, "#86f27d");
    tone(420, 0.11, "sine", 0.04, 180);
  } else if (pickup.type === "shield") {
    player.shield = 8;
    addScore(120, pickup.x, pickup.y, "#48e3d7");
    chord([280, 420], 0.11, "sine", 0.035);
  } else if (pickup.type === "time") {
    game.time += 12;
    addScore(200, pickup.x, pickup.y, "#ffcf5a");
    chord([440, 660], 0.1, "triangle", 0.035);
  } else {
    player.pulse = 100;
    addScore(120, pickup.x, pickup.y, "#b58cff");
    chord([300, 510, 760], 0.08, "triangle", 0.032);
  }
  const burstColor = pickup.type === "heart" ? "#86f27d" : pickup.type === "shield" ? "#48e3d7" : pickup.type === "time" ? "#ffcf5a" : "#b58cff";
  burst(pickup.x, pickup.y, burstColor, 30, 180, 0.9);
}

function damagePlayer(amount, x, y, ignoreShield = false) {
  if (player.invulnerable > 0 || player.dashTime > 0 || (!ignoreShield && player.shield > 0)) {
    burst(x, y, "#48e3d7", 14, 130, 0.55);
    tone(180, 0.06, "square", 0.018, -40);
    return;
  }
  player.health -= amount;
  player.invulnerable = 1.45;
  game.shake = 12;
  game.combo = 1;
  game.comboTimer = 0;
  burst(player.x, player.y, "#ff6f61", 34, 260, 1.0);
  tone(160, 0.16, "sawtooth", 0.052, -70);
  if (player.health <= 0) {
    endGame(false);
  }
}

function dash() {
  if (player.energy < 30 || player.dashCooldown > 0 || player.dashTime > 0 || game.mode !== "playing") return;
  const dir = movementVector();
  let dx = dir.x;
  let dy = dir.y;
  if (Math.hypot(dx, dy) < 0.1) {
    dx = Math.cos(player.angle);
    dy = Math.sin(player.angle);
  }
  player.energy -= 30;
  player.dashTime = 0.19;
  player.dashCooldown = 0.46;
  player.vx = dx * 860;
  player.vy = dy * 860;
  player.angle = Math.atan2(dy, dx);
  game.shake = Math.max(game.shake, 4);
  for (let i = 0; i < 12; i += 1) {
    particles.push({
      x: player.x - dx * rand(8, 28),
      y: player.y - dy * rand(8, 28),
      vx: -dx * rand(120, 260) + rand(-45, 45),
      vy: -dy * rand(120, 260) + rand(-45, 45),
      life: rand(0.22, 0.5),
      maxLife: 0.5,
      size: rand(2, 5),
      color: getSkin().trail,
    });
  }
  tone(240, 0.09, "triangle", 0.04, 230);
}

function pulse() {
  if (player.pulse < 100 || game.mode !== "playing") return;
  player.pulse = 0;
  player.invulnerable = Math.max(player.invulnerable, 0.35);
  player.speedBoost = 5;
  freezeEnemies(5);
  pulseWave = { x: player.x, y: player.y, r: 12, max: 180, life: 0.42, maxLife: 0.42 };
  game.shake = 7;
  tone(120, 0.18, "sine", 0.05, 320);

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    if (dist(player.x, player.y, bullet.x, bullet.y) < 190) {
      bullets.splice(i, 1);
      burst(bullet.x, bullet.y, "#b58cff", 10, 120, 0.45);
      addScore(20, bullet.x, bullet.y, "#b58cff");
    }
  }

  enemies.forEach((enemy) => {
    const d = dist(player.x, player.y, enemy.x, enemy.y);
    if (d < 190) {
      const nx = (enemy.x - player.x) / Math.max(1, d);
      const ny = (enemy.y - player.y) / Math.max(1, d);
      enemy.vx += nx * 460;
      enemy.vy += ny * 460;
      enemy.stun = Math.max(enemy.stun, 1.1);
      enemy.hp -= 1;
      burst(enemy.x, enemy.y, "#b58cff", 18, 180, 0.7);
    }
  });

  cleanupEnemies();
}

function movementVector() {
  let x = 0;
  let y = 0;
  if (input.left) x -= 1;
  if (input.right) x += 1;
  if (input.up) y -= 1;
  if (input.down) y += 1;
  if (input.joystick.active || Math.hypot(input.joystick.x, input.joystick.y) > 0.05) {
    x += input.joystick.x;
    y += input.joystick.y;
  }
  const length = Math.hypot(x, y);
  if (length > 1) {
    x /= length;
    y /= length;
  }
  return { x, y };
}

function updatePlayer(dt) {
  const mv = movementVector();
  const moving = Math.hypot(mv.x, mv.y) > 0.05;
  const boostActive = player.speedBoost > 0;
  if (moving && player.dashTime <= 0) {
    const accel = BASE_PLAYER_SPEED * (boostActive ? 7.2 : 5.2);
    player.vx += mv.x * accel * dt;
    player.vy += mv.y * accel * dt;
    player.angle = Math.atan2(mv.y, mv.x);
  }

  const maxSpeed = player.dashTime > 0 ? 900 : boostActive ? 760 : BASE_PLAYER_SPEED;
  const speed = Math.hypot(player.vx, player.vy);
  if (speed > maxSpeed) {
    player.vx = (player.vx / speed) * maxSpeed;
    player.vy = (player.vy / speed) * maxSpeed;
  }

  const drag = player.dashTime > 0 ? 0.98 : moving ? 0.88 : 0.82;
  player.vx *= Math.pow(drag, dt * 60);
  player.vy *= Math.pow(drag, dt * 60);
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  if (player.x < PLAYER_RADIUS) {
    player.x = PLAYER_RADIUS;
    player.vx = Math.abs(player.vx) * 0.5;
  }
  if (player.x > width - PLAYER_RADIUS) {
    player.x = width - PLAYER_RADIUS;
    player.vx = -Math.abs(player.vx) * 0.5;
  }
  if (player.y < PLAYER_RADIUS) {
    player.y = PLAYER_RADIUS;
    player.vy = Math.abs(player.vy) * 0.5;
  }
  if (player.y > height - PLAYER_RADIUS) {
    player.y = height - PLAYER_RADIUS;
    player.vy = -Math.abs(player.vy) * 0.5;
  }

  player.energy = clamp(player.energy + (player.dashTime > 0 ? 7 : 19) * dt, 0, 100);
  player.pulse = clamp(player.pulse + 4.5 * dt, 0, 100);
  player.speedBoost = Math.max(0, player.speedBoost - dt);
  player.shield = Math.max(0, player.shield - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.dashTime = Math.max(0, player.dashTime - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);

  if (input.dash) {
    dash();
    input.dash = false;
  }
  if (input.pulse) {
    pulse();
    input.pulse = false;
  }

  const skin = getSkin();
  windZones.forEach((zone) => {
    if (dist(player.x, player.y, zone.x, zone.y) < zone.r) {
      player.vx += Math.cos(zone.angle) * zone.force * dt;
      player.vy += Math.sin(zone.angle) * zone.force * dt;
    }
  });

  if (Math.random() < dt * (moving ? 28 : 8)) {
    particles.push({
      x: player.x - Math.cos(player.angle) * 15 + rand(-4, 4),
      y: player.y - Math.sin(player.angle) * 15 + rand(-4, 4),
      vx: -Math.cos(player.angle) * rand(25, 95) + rand(-22, 22),
      vy: -Math.sin(player.angle) * rand(25, 95) + rand(-22, 22),
      life: rand(0.25, 0.6),
      maxLife: 0.6,
      size: rand(1.4, 3.8),
      color: player.dashTime > 0 ? skin.dash : skin.trail,
    });
  }
}

function updateEnemies(dt) {
  const speedMul = levelConfig?.enemySpeedMul || 1;
  const bulletMul = levelConfig?.bulletSpeedMul || 1;

  enemies.forEach((enemy) => {
    enemy.phase += dt;
    enemy.angle += (enemy.turn || 0.4) * dt;
    enemy.stun = Math.max(0, enemy.stun - dt);
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    const nx = dx / d;
    const ny = dy / d;

    if (enemy.stun <= 0) {
      if (enemy.type === "hunter" || enemy.mini) {
        const accel = (120 + game.level * 10) * speedMul;
        enemy.vx += nx * accel * dt;
        enemy.vy += ny * accel * dt;
      } else if (enemy.type === "spinner") {
        const tangentX = -ny;
        const tangentY = nx;
        const orbit = Math.sin(enemy.phase * 1.8) * 0.7;
        enemy.vx += (tangentX * 110 + nx * 40 * orbit) * speedMul * dt;
        enemy.vy += (tangentY * 110 + ny * 40 * orbit) * speedMul * dt;
      } else if (enemy.type === "shooter") {
        const desired = d < 230 ? -1 : 1;
        enemy.vx += nx * 56 * desired * dt;
        enemy.vy += ny * 56 * desired * dt;
        enemy.fire -= dt;
        if (enemy.fire <= 0 && d < 520) {
          enemy.fire = rand(1.35, 2.05) - Math.min(0.55, game.level * 0.02);
          bullets.push({
            x: enemy.x + nx * 20,
            y: enemy.y + ny * 20,
            vx: nx * (170 + game.level * 8) * bulletMul,
            vy: ny * (170 + game.level * 8) * bulletMul,
            r: 6,
            life: 4,
          });
          tone(330, 0.045, "square", 0.017, -90);
        }
      } else if (enemy.type === "wraith") {
        enemy.teleport -= dt;
        enemy.vx += nx * 70 * speedMul * dt;
        enemy.vy += ny * 70 * speedMul * dt;
        if (enemy.teleport <= 0) {
          enemy.teleport = rand(2, 3.8);
          enemy.x = clamp(player.x + rand(-140, 140), enemy.r, width - enemy.r);
          enemy.y = clamp(player.y + rand(-140, 140), enemy.r, height - enemy.r);
          burst(enemy.x, enemy.y, "#b58cff", 16, 180, 0.6);
        }
      } else if (enemy.type === "bouncer") {
        enemy.vx += nx * 40 * speedMul * dt;
        enemy.vy += ny * 40 * speedMul * dt;
      } else if (enemy.type === "splitter") {
        enemy.vx += nx * 55 * speedMul * dt;
        enemy.vy += ny * 55 * speedMul * dt;
      } else if (enemy.type === "phantom") {
        enemy.vx += nx * 95 * speedMul * dt;
        enemy.vy += ny * 95 * speedMul * dt;
      } else if (enemy.type === "stalker") {
        enemy.vx += nx * 48 * dt;
        enemy.vy += ny * 48 * dt;
        enemy.fire -= dt;
        if (enemy.fire <= 0 && d < 480) {
          enemy.fire = rand(1.8, 2.8);
          const speed = (140 + game.level * 6) * bulletMul;
          bullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: nx * speed * 0.55,
            vy: ny * speed * 0.55,
            r: 7,
            life: 5,
            homing: true,
          });
        }
      } else if (enemy.type === "breaker") {
        enemy.vx += nx * 88 * speedMul * dt;
        enemy.vy += ny * 88 * speedMul * dt;
      }
    }

    const speedCaps = {
      hunter: 178 + game.level * 4, spinner: 155, shooter: 115, wraith: 140,
      bouncer: 220 * speedMul, splitter: 125, phantom: 165 * speedMul,
      stalker: 120, breaker: 150 * speedMul,
    };
    const maxSpeed = (speedCaps[enemy.type] || 130) * (enemy.mini ? 1.35 : 1);
    const speed = Math.hypot(enemy.vx, enemy.vy);
    if (speed > maxSpeed) {
      enemy.vx = (enemy.vx / speed) * maxSpeed;
      enemy.vy = (enemy.vy / speed) * maxSpeed;
    }
    const drag = enemy.type === "bouncer" ? 0.99 : 0.94;
    enemy.vx *= Math.pow(drag, dt * 60);
    enemy.vy *= Math.pow(drag, dt * 60);
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;

    if (enemy.type === "bouncer") {
      if (enemy.x < enemy.r || enemy.x > width - enemy.r) {
        enemy.vx *= -1.05;
        enemy.x = clamp(enemy.x, enemy.r, width - enemy.r);
      }
      if (enemy.y < enemy.r || enemy.y > height - enemy.r) {
        enemy.vy *= -1.05;
        enemy.y = clamp(enemy.y, enemy.r, height - enemy.r);
      }
    } else {
      if (enemy.x < enemy.r || enemy.x > width - enemy.r) {
        enemy.vx *= -0.8;
        enemy.x = clamp(enemy.x, enemy.r, width - enemy.r);
      }
      if (enemy.y < enemy.r || enemy.y > height - enemy.r) {
        enemy.vy *= -0.8;
        enemy.y = clamp(enemy.y, enemy.r, height - enemy.r);
      }
    }

    if (dist(player.x, player.y, enemy.x, enemy.y) < PLAYER_RADIUS + enemy.r) {
      if (player.dashTime > 0) {
        enemy.hp -= enemy.type === "splitter" ? 1 : 2;
        enemy.stun = 1;
        addScore(enemy.type === "splitter" ? 240 : 180, enemy.x, enemy.y, "#48e3d7");
        burst(enemy.x, enemy.y, "#48e3d7", 26, 220, 0.8);
        game.shake = Math.max(game.shake, 5);
      } else {
        damagePlayer(1, enemy.x, enemy.y, enemy.type === "breaker");
        const push = 280;
        player.vx -= nx * push;
        player.vy -= ny * push;
        enemy.vx += nx * push * 0.6;
        enemy.vy += ny * push * 0.6;
      }
    }
  });

  cleanupEnemies();
}

function cleanupEnemies() {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    if (enemies[i].hp <= 0) {
      const enemy = enemies[i];
      enemies.splice(i, 1);
      const scores = { shooter: 300, stalker: 350, splitter: 280, breaker: 320, phantom: 260, wraith: 240, bouncer: 220 };
      addScore(scores[enemy.type] || 180, enemy.x, enemy.y, "#ff6f61");
      burst(enemy.x, enemy.y, enemy.type === "shooter" || enemy.type === "stalker" ? "#b58cff" : "#ff6f61", 32, 240, 0.9);
      if (enemy.type === "splitter" && !enemy.mini) {
        for (let j = 0; j < 2; j += 1) {
          const mini = makeEnemy("hunter", true);
          mini.x = enemy.x + rand(-20, 20);
          mini.y = enemy.y + rand(-20, 20);
          enemies.push(mini);
        }
      }
      tone(95, 0.09, "sawtooth", 0.032, -25);
    }
  }
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    if (bullet.homing) {
      const dx = player.x - bullet.x;
      const dy = player.y - bullet.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const turn = 2.8 * dt;
      const targetVx = (dx / d) * Math.hypot(bullet.vx, bullet.vy);
      const targetVy = (dy / d) * Math.hypot(bullet.vx, bullet.vy);
      bullet.vx = lerp(bullet.vx, targetVx, turn);
      bullet.vy = lerp(bullet.vy, targetVy, turn);
    }
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    if (
      bullet.life <= 0 ||
      bullet.x < -30 ||
      bullet.x > width + 30 ||
      bullet.y < -30 ||
      bullet.y > height + 30
    ) {
      bullets.splice(i, 1);
      continue;
    }
    if (dist(player.x, player.y, bullet.x, bullet.y) < PLAYER_RADIUS + bullet.r) {
      bullets.splice(i, 1);
      damagePlayer(1, bullet.x, bullet.y);
    }
  }
}

function updateCollectibles(dt) {
  for (let i = cores.length - 1; i >= 0; i -= 1) {
    const core = cores[i];
    core.spin += dt * 2.4;
    core.wobble += dt * 4;
    if (dist(player.x, player.y, core.x, core.y) < PLAYER_RADIUS + core.r + 6) {
      collectCore(core, i);
    }
  }

  for (let i = pickups.length - 1; i >= 0; i -= 1) {
    const pickup = pickups[i];
    pickup.t += dt * 2;
    if (dist(player.x, player.y, pickup.x, pickup.y) < PLAYER_RADIUS + pickup.r + 6) {
      usePickup(pickup, i);
    }
  }

  if (Math.random() < dt * 0.035 && pickups.length < 3) {
    const roll = Math.random();
    const type = roll < 0.24 ? "heart" : roll < 0.52 ? "shield" : roll < 0.82 ? "pulse" : "time";
    if (type === "time" && game.level < 30) pickups.push(makePickup(Math.random() > 0.5 ? "shield" : "pulse"));
    else pickups.push(makePickup(type));
  }

  mines.forEach((mine) => {
    mine.spin += dt;
    mine.armed = Math.max(0, mine.armed - dt);
    const d = dist(player.x, player.y, mine.x, mine.y);
    if (d < PLAYER_RADIUS + mine.r) {
      if (player.dashTime > 0) {
        mine.dead = true;
        burst(mine.x, mine.y, "#ffcf5a", 42, 310, 1.0);
        addScore(220, mine.x, mine.y, "#ffcf5a");
        tone(110, 0.1, "sawtooth", 0.03, 120);
      } else {
        mine.dead = true;
        damagePlayer(1, mine.x, mine.y);
        burst(mine.x, mine.y, "#ff6f61", 54, 340, 1.05);
      }
    }
  });
  mines = mines.filter((mine) => !mine.dead);
}

function updateHazards(dt) {
  if (!levelConfig) return;

  if (levelConfig.meteorRate > 0) {
    meteorTimer -= dt;
    if (meteorTimer <= 0) {
      meteors.push(makeMeteor());
      meteorTimer = rand(1.2, 2.8) / levelConfig.meteorRate;
    }
  }

  gravityWells.forEach((well) => {
    well.spin += dt * 0.6;
    const d = dist(player.x, player.y, well.x, well.y);
    if (d < well.r * 1.4) {
      const pull = well.pull * (1 - d / (well.r * 1.4));
      player.vx += ((well.x - player.x) / Math.max(1, d)) * pull * dt;
      player.vy += ((well.y - player.y) / Math.max(1, d)) * pull * dt;
    }
  });

  blackHoles.forEach((hole) => {
    hole.spin += dt;
    const d = dist(player.x, player.y, hole.x, hole.y);
    if (d < hole.r * 1.6) {
      const pull = hole.pull * (1 - d / (hole.r * 1.6));
      player.vx += ((hole.x - player.x) / Math.max(1, d)) * pull * dt;
      player.vy += ((hole.y - player.y) / Math.max(1, d)) * pull * dt;
      if (d < hole.r * 0.55 && player.invulnerable <= 0) {
        damagePlayer(1, hole.x, hole.y);
      }
    }
  });

  toxicZones.forEach((zone) => {
    zone.pulse += dt * 2;
    if (dist(player.x, player.y, zone.x, zone.y) < zone.r && player.invulnerable <= 0 && player.dashTime <= 0) {
      if (Math.random() < dt * 1.8) damagePlayer(1, zone.x, zone.y);
    }
  });

  barriers.forEach((barrier) => {
    barrier.angle += barrier.spin * dt;
    const cos = Math.cos(barrier.angle);
    const sin = Math.sin(barrier.angle);
    const hx = cos * barrier.len * 0.5;
    const hy = sin * barrier.len * 0.5;
    const x1 = barrier.x - hx;
    const y1 = barrier.y - hy;
    const x2 = barrier.x + hx;
    const y2 = barrier.y + hy;
    const closest = pointToSegment(player.x, player.y, x1, y1, x2, y2);
    if (closest.d < PLAYER_RADIUS + 6 && player.dashTime <= 0) {
      damagePlayer(1, closest.x, closest.y);
      const push = 320;
      player.vx += (player.x - closest.x) / Math.max(1, closest.d) * push * dt;
      player.vy += (player.y - closest.y) / Math.max(1, closest.d) * push * dt;
    }
  });

  turrets.forEach((turret) => {
    turret.angle += dt * 0.9;
    turret.fire -= dt;
    if (turret.fire <= 0) {
      turret.fire = rand(1.1, 1.9);
      for (let i = 0; i < 3; i += 1) {
        const a = turret.angle + (i - 1) * 0.35;
        bullets.push({
          x: turret.x,
          y: turret.y,
          vx: Math.cos(a) * (160 + game.level * 5) * (levelConfig.bulletSpeedMul || 1),
          vy: Math.sin(a) * (160 + game.level * 5) * (levelConfig.bulletSpeedMul || 1),
          r: 5,
          life: 3.5,
        });
      }
      tone(280, 0.04, "square", 0.015, -60);
    }
  });

  for (let i = meteors.length - 1; i >= 0; i -= 1) {
    const meteor = meteors[i];
    meteor.x += meteor.vx * dt;
    meteor.y += meteor.vy * dt;
    meteor.angle += meteor.spin * dt;
    if (meteor.y > height + 40 || meteor.x < -40 || meteor.x > width + 40) {
      meteors.splice(i, 1);
      continue;
    }
    if (dist(player.x, player.y, meteor.x, meteor.y) < PLAYER_RADIUS + meteor.r) {
      if (player.dashTime > 0) {
        meteors.splice(i, 1);
        addScore(160, meteor.x, meteor.y, "#ffcf5a");
        burst(meteor.x, meteor.y, "#ffcf5a", 24, 240, 0.8);
      } else {
        meteors.splice(i, 1);
        damagePlayer(1, meteor.x, meteor.y);
        burst(meteor.x, meteor.y, "#ff6f61", 30, 280, 0.9);
      }
    }
  }
}

function pointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 > 0 ? clamp(((px - x1) * dx + (py - y1) * dy) / len2, 0, 1) : 0;
  const x = x1 + t * dx;
  const y = y1 + t * dy;
  return { x, y, d: dist(px, py, x, y) };
}

function updateLevel(dt) {
  game.time -= dt;
  if (levelAnnounce.life > 0) levelAnnounce.life -= dt;
  if (game.comboTimer > 0) {
    game.comboTimer -= dt;
    if (game.comboTimer <= 0) game.combo = 1;
  }

  if (portal) {
    portal.t += dt;
    portal.ready = true;
    if (dist(player.x, player.y, portal.x, portal.y) < portal.r + PLAYER_RADIUS * 0.6) {
      game.levelClearTimer += dt;
      if (game.levelClearTimer > 0.22) {
        addScore(Math.max(0, Math.round(game.time)) * 20 + game.level * 250, portal.x, portal.y, "#48e3d7");
        const cleared = game.level;
        unlockLevel(cleared);
        if (cleared >= MAX_LEVEL) {
          endGame(true);
        } else {
          selectedLevel = cleared + 1;
          startLevel(cleared + 1);
        }
      }
    } else {
      game.levelClearTimer = 0;
    }
  }

  if (game.time <= 0) {
    damagePlayer(1, player.x, player.y);
    if (game.mode === "playing") {
      game.time = 18;
      game.cores = Math.max(0, game.cores - 1);
      if (portal) portal = null;
      burst(player.x, player.y, "#ffcf5a", 28, 220, 0.85);
    }
  }
}

function updateEffects(dt) {
  game.shake = Math.max(0, game.shake - dt * 22);
  game.flash = Math.max(0, game.flash - dt * 2.5);

  stars.forEach((star) => {
    star.twinkle += dt * (0.8 + star.z);
    star.y += dt * (12 + star.z * 22);
    if (star.y > height + 5) {
      star.y = -5;
      star.x = Math.random() * width;
    }
  });

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.94, dt * 60);
    p.vy *= Math.pow(0.94, dt * 60);
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = popups.length - 1; i >= 0; i -= 1) {
    const popup = popups[i];
    popup.y -= dt * 32;
    popup.life -= dt;
    if (popup.life <= 0) popups.splice(i, 1);
  }

  if (pulseWave) {
    pulseWave.life -= dt;
    const t = 1 - pulseWave.life / pulseWave.maxLife;
    pulseWave.r = lerp(12, pulseWave.max, t);
    if (pulseWave.life <= 0) pulseWave = null;
  }
}

function maybeSpawnCore() {
  if (cores.length < Math.max(3, game.target - game.cores) && game.cores < game.target) {
    cores.push(makeCore());
  }
}

function update(dt) {
  if (game.mode !== "playing") {
    updateEffects(dt);
    draw();
    return;
  }

  updateLevel(dt);
  updatePlayer(dt);
  updateEnemies(dt);
  updateBullets(dt);
  updateHazards(dt);
  updateCollectibles(dt);
  updateEffects(dt);
  maybeSpawnCore();
  updateHud();
  draw();
}

function burst(x, y, color, count = 18, speed = 180, life = 0.7) {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * TAU;
    const s = rand(speed * 0.18, speed);
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(life * 0.45, life),
      maxLife: life,
      size: rand(1.6, 5.6),
      color,
    });
  }
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#070a12");
  grad.addColorStop(0.48, "#0b1118");
  grad.addColorStop(1, "#0d0a14");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#48e3d7";
  ctx.lineWidth = 1;
  const grid = 52;
  const offset = (performance.now() * 0.012) % grid;
  for (let x = -grid + offset; x < width + grid; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - width * 0.12, height);
    ctx.stroke();
  }
  ctx.strokeStyle = "#ffcf5a";
  ctx.globalAlpha = 0.065;
  for (let y = -grid + offset; y < height + grid; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + width * 0.08);
    ctx.stroke();
  }
  ctx.restore();

  stars.forEach((star) => {
    const alpha = 0.25 + Math.sin(star.twinkle) * 0.18 + star.z * 0.42;
    ctx.fillStyle = `rgba(245, 247, 251, ${clamp(alpha, 0.12, 0.8)})`;
    ctx.fillRect(star.x, star.y, 1.1 + star.z * 1.4, 1.1 + star.z * 1.4);
  });
}

function drawCore(core) {
  const bob = Math.sin(core.wobble) * 3;
  const color = core.charged ? "#ff6f61" : "#ffcf5a";
  ctx.save();
  ctx.translate(core.x, core.y + bob);
  ctx.rotate(core.spin);
  ctx.shadowBlur = core.charged ? 28 : 20;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -core.r);
  ctx.lineTo(core.r * 0.78, 0);
  ctx.lineTo(0, core.r);
  ctx.lineTo(-core.r * 0.78, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff2b0";
  ctx.beginPath();
  ctx.moveTo(0, -core.r * 0.55);
  ctx.lineTo(core.r * 0.35, 0);
  ctx.lineTo(0, core.r * 0.3);
  ctx.lineTo(-core.r * 0.35, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPickup(pickup) {
  const colors = {
    heart: "#86f27d",
    shield: "#48e3d7",
    pulse: "#b58cff",
    time: "#ffcf5a",
  };
  const color = colors[pickup.type];
  ctx.save();
  ctx.translate(pickup.x, pickup.y + Math.sin(pickup.t * 1.8) * 4);
  ctx.rotate(pickup.t);
  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, pickup.r, 0, TAU);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  if (pickup.type === "heart") {
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-16, -4, -10, -14, 0, -7);
    ctx.bezierCurveTo(10, -14, 16, -4, 0, 8);
    ctx.fill();
  } else if (pickup.type === "shield") {
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(10, -5);
    ctx.lineTo(7, 9);
    ctx.lineTo(0, 14);
    ctx.lineTo(-7, 9);
    ctx.lineTo(-10, -5);
    ctx.closePath();
    ctx.fill();
  } else if (pickup.type === "time") {
    ctx.font = "bold 18px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+T", 0, 1);
  } else {
    for (let i = 0; i < 6; i += 1) {
      ctx.rotate(TAU / 6);
      ctx.fillRect(-2, -13, 4, 13);
    }
  }
  ctx.restore();
}

function drawMine(mine) {
  ctx.save();
  ctx.translate(mine.x, mine.y);
  ctx.rotate(mine.spin);
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#ff6f61";
  ctx.strokeStyle = mine.armed > 0 ? "rgba(255, 255, 255, 0.28)" : "#ff6f61";
  ctx.fillStyle = "rgba(255, 111, 97, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * TAU;
    const radius = i % 2 ? mine.r * 0.68 : mine.r;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffcf5a";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawEnemy(enemy) {
  const colors = {
    hunter: "#ff6f61", spinner: "#ffcf5a", shooter: "#b58cff", wraith: "#818cf8",
    bouncer: "#f97316", splitter: "#22d3ee", phantom: "#94a3b8", stalker: "#f472b6", breaker: "#ef4444",
  };
  const d = dist(player.x, player.y, enemy.x, enemy.y);
  const phantomAlpha = enemy.type === "phantom" ? clamp(0.15 + (1 - d / 280) * 0.85, 0.12, 1) : 1;
  ctx.save();
  ctx.globalAlpha = phantomAlpha;
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(enemy.type === "hunter" || enemy.type === "breaker" ? Math.atan2(player.y - enemy.y, player.x - enemy.x) : enemy.angle);
  const color = colors[enemy.type] || "#ff6f61";
  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.fillStyle = enemy.stun > 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)";

  if (enemy.type === "hunter" || enemy.mini) {
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-13, -13);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-13, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, -2, 7, 4);
  } else if (enemy.type === "wraith") {
    ctx.globalAlpha = phantomAlpha * (0.5 + Math.sin(enemy.phase * 6) * 0.25);
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(14, 0);
    ctx.lineTo(0, 16);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (enemy.type === "bouncer") {
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-4, -4, 8, 8);
  } else if (enemy.type === "splitter") {
    for (let i = 0; i < 3; i += 1) {
      ctx.rotate(TAU / 3);
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(12, 10);
      ctx.lineTo(-12, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (enemy.type === "phantom") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 10, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  } else if (enemy.type === "stalker") {
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-12, -12);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ff6f61";
    ctx.beginPath();
    ctx.arc(4, 0, 3, 0, TAU);
    ctx.fill();
  } else if (enemy.type === "breaker") {
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-10, -16);
    ctx.lineTo(-10, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(2, -3, 10, 6);
  } else if (enemy.type === "spinner") {
    for (let i = 0; i < 4; i += 1) {
      ctx.rotate(TAU / 4);
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(23, 0);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, TAU);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, -7);
    ctx.lineTo(24, 0);
    ctx.lineTo(4, 7);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawBullet(bullet) {
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#b58cff";
  ctx.fillStyle = "#b58cff";
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.r * 0.35, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawPortal() {
  if (!portal) return;
  ctx.save();
  ctx.translate(portal.x, portal.y);
  ctx.rotate(portal.t * 1.6);
  ctx.shadowBlur = 28;
  ctx.shadowColor = "#48e3d7";
  for (let i = 0; i < 3; i += 1) {
    ctx.rotate(TAU / 3);
    ctx.strokeStyle = i === 1 ? "#ffcf5a" : "#48e3d7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, portal.r + i * 7, 0.2, Math.PI * 1.45);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.3 + Math.sin(portal.t * 8) * 0.1;
  ctx.fillStyle = "#48e3d7";
  ctx.beginPath();
  ctx.arc(0, 0, portal.r * 0.62, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawPlayerShape(skin) {
  const body = ctx.createLinearGradient(-18, 0, 22, 0);
  body.addColorStop(0, skin.c1);
  body.addColorStop(0.55, skin.c2);
  body.addColorStop(1, skin.c3);
  ctx.fillStyle = body;
  if (skin.shape === "dart") {
    ctx.beginPath();
    ctx.moveTo(26, 0);
    ctx.lineTo(-8, -10);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();
  } else if (skin.shape === "wedge") {
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-18, -16);
    ctx.lineTo(-18, 16);
    ctx.closePath();
    ctx.fill();
  } else if (skin.shape === "diamond") {
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(18, 0);
    ctx.lineTo(0, 20);
    ctx.lineTo(-18, 0);
    ctx.closePath();
    ctx.fill();
  } else if (skin.shape === "hex") {
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * TAU - Math.PI / 2;
      const x = Math.cos(a) * 20;
      const y = Math.sin(a) * 16;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.bezierCurveTo(7, -9, -5, -22, -23, -19);
    ctx.bezierCurveTo(-13, -8, -13, 8, -23, 19);
    ctx.bezierCurveTo(-5, 22, 7, 9, 24, 0);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(5, 8, 14, 0.72)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#071017";
  ctx.beginPath();
  ctx.ellipse(4, 0, 7, 4.5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
  ctx.beginPath();
  ctx.arc(6, -1, 2, 0, TAU);
  ctx.fill();
}

function drawPlayer() {
  const flicker = player.invulnerable > 0 && Math.floor(player.invulnerable * 16) % 2 === 0;
  if (flicker) return;
  const skin = getSkin();
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  if (player.shield > 0 || player.dashTime > 0) {
    ctx.save();
    ctx.rotate(-player.angle + performance.now() * 0.002);
    ctx.globalAlpha = player.dashTime > 0 ? 0.45 : 0.34 + Math.sin(performance.now() * 0.012) * 0.08;
    ctx.strokeStyle = player.dashTime > 0 ? skin.dash : skin.glow;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 24;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  ctx.shadowBlur = 22;
  ctx.shadowColor = player.dashTime > 0 ? skin.dash : skin.glow;
  drawPlayerShape(skin);
  ctx.restore();
}

function drawParticles() {
  particles.forEach((p) => {
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 14;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.5 + alpha * 0.7), 0, TAU);
    ctx.fill();
    ctx.restore();
  });

  popups.forEach((popup) => {
    const alpha = clamp(popup.life / popup.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = popup.color;
    ctx.font = "800 16px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 10;
    ctx.shadowColor = popup.color;
    ctx.fillText(popup.text, popup.x, popup.y);
    ctx.restore();
  });
}

function drawPulseWave() {
  if (!pulseWave) return;
  const alpha = clamp(pulseWave.life / pulseWave.maxLife, 0, 1);
  ctx.save();
  ctx.globalAlpha = alpha * 0.85;
  ctx.strokeStyle = "#b58cff";
  ctx.lineWidth = 4;
  ctx.shadowBlur = 28;
  ctx.shadowColor = "#b58cff";
  ctx.beginPath();
  ctx.arc(pulseWave.x, pulseWave.y, pulseWave.r, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = alpha * 0.18;
  ctx.fillStyle = "#b58cff";
  ctx.beginPath();
  ctx.arc(pulseWave.x, pulseWave.y, pulseWave.r * 0.78, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawGravityWell(well) {
  ctx.save();
  ctx.translate(well.x, well.y);
  ctx.rotate(well.spin);
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#48e3d7";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, well.r * (0.45 + i * 0.22), 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBlackHole(hole) {
  ctx.save();
  ctx.translate(hole.x, hole.y);
  ctx.rotate(hole.spin);
  const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, hole.r);
  grad.addColorStop(0, "rgba(0,0,0,0.95)");
  grad.addColorStop(0.6, "rgba(99,102,241,0.35)");
  grad.addColorStop(1, "rgba(99,102,241,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, hole.r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawBarrier(barrier) {
  const cos = Math.cos(barrier.angle);
  const sin = Math.sin(barrier.angle);
  const hx = cos * barrier.len * 0.5;
  const hy = sin * barrier.len * 0.5;
  ctx.save();
  ctx.strokeStyle = "#ffcf5a";
  ctx.lineWidth = 5;
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#ffcf5a";
  ctx.beginPath();
  ctx.moveTo(barrier.x - hx, barrier.y - hy);
  ctx.lineTo(barrier.x + hx, barrier.y + hy);
  ctx.stroke();
  ctx.restore();
}

function drawToxicZone(zone) {
  const pulse = 0.7 + Math.sin(zone.pulse) * 0.15;
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#86f27d";
  ctx.beginPath();
  ctx.arc(zone.x, zone.y, zone.r * pulse, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = "#65a30d";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawWindZone(zone) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(zone.x, zone.y, zone.r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#38bdf8";
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 4; i += 1) {
    const a = zone.angle + i * (TAU / 4);
    ctx.beginPath();
    ctx.moveTo(zone.x, zone.y);
    ctx.lineTo(zone.x + Math.cos(a) * zone.r * 0.8, zone.y + Math.sin(a) * zone.r * 0.8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTurret(turret) {
  ctx.save();
  ctx.translate(turret.x, turret.y);
  ctx.rotate(turret.angle);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.strokeStyle = "#f472b6";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 14;
  ctx.shadowColor = "#f472b6";
  ctx.beginPath();
  ctx.arc(0, 0, turret.r, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f472b6";
  ctx.fillRect(0, -4, 24, 8);
  ctx.restore();
}

function drawMeteor(meteor) {
  ctx.save();
  ctx.translate(meteor.x, meteor.y);
  ctx.rotate(meteor.angle);
  ctx.fillStyle = "#ff8a00";
  ctx.shadowBlur = 14;
  ctx.shadowColor = "#ffcf5a";
  ctx.beginPath();
  ctx.moveTo(meteor.r, 0);
  for (let i = 1; i < 6; i += 1) {
    const a = (i / 6) * TAU;
    const r = i % 2 ? meteor.r * 0.65 : meteor.r;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLevelAnnounce() {
  if (!levelAnnounce.life || levelAnnounce.life <= 0) return;
  const alpha = clamp(levelAnnounce.life / 2.8, 0, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#f5f7fb";
  ctx.font = "800 18px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#48e3d7";
  ctx.fillText(levelAnnounce.text, width * 0.5, 18);
  ctx.restore();
}

function drawVignette() {
  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.52, Math.min(width, height) * 0.12, width * 0.5, height * 0.52, Math.max(width, height) * 0.72);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (game.flash > 0) {
    ctx.globalAlpha = game.flash;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }
}

function draw() {
  ctx.save();
  const shakeX = game.shake > 0 ? rand(-game.shake, game.shake) : 0;
  const shakeY = game.shake > 0 ? rand(-game.shake, game.shake) : 0;
  ctx.translate(shakeX, shakeY);

  drawBackground();
  windZones.forEach(drawWindZone);
  toxicZones.forEach(drawToxicZone);
  gravityWells.forEach(drawGravityWell);
  blackHoles.forEach(drawBlackHole);
  barriers.forEach(drawBarrier);
  turrets.forEach(drawTurret);
  drawPortal();
  mines.forEach(drawMine);
  meteors.forEach(drawMeteor);
  cores.forEach(drawCore);
  pickups.forEach(drawPickup);
  bullets.forEach(drawBullet);
  enemies.forEach(drawEnemy);
  drawPulseWave();
  drawPlayer();
  drawParticles();
  drawLevelAnnounce();
  drawVignette();
  ctx.restore();
}

function updateHud() {
  ui.level.textContent = String(game.level).padStart(2, "0");
  ui.score.textContent = formatScore(game.score);
  ui.cores.textContent = String(game.cores);
  ui.target.textContent = String(game.target);
  ui.time.textContent = String(Math.max(0, Math.ceil(game.time))).padStart(2, "0");
  ui.energy.style.transform = `scaleX(${player.energy / 100})`;
  ui.pulse.style.transform = `scaleX(${player.pulse / 100})`;

  ui.health.innerHTML = "";
  for (let i = 0; i < player.maxHealth; i += 1) {
    const heart = document.createElement("span");
    heart.className = `heart${i >= player.health ? " empty" : ""}`;
    ui.health.appendChild(heart);
  }
}

function showBanner(title, text, button, kicker = "Nova Manta", showLevels = true) {
  ui.bannerTitle.textContent = title;
  ui.bannerText.textContent = text;
  ui.primaryButton.textContent = button;
  ui.bannerKicker.textContent = kicker;
  ui.banner.classList.remove("is-hidden");
  if (ui.levelPanel) ui.levelPanel.hidden = !showLevels;
  if (showLevels) renderLevelSelector();
}

function hideBanner() {
  ui.banner.classList.add("is-hidden");
}

function endGame(won) {
  if (game.mode !== "playing") return;
  game.mode = won ? "won" : "over";
  game.flash = won ? 0.35 : 0.08;
  game.shake = won ? 10 : 16;
  if (won) {
    chord([330, 440, 660, 880], 0.15, "triangle", 0.045);
    showBanner("Victoire", `95 secteurs conquis ! Score ${formatScore(game.score)} - combo x${game.bestCombo}`, "Rejouer", "Noyau final stabilise");
  } else {
    selectedLevel = game.level;
    tone(90, 0.28, "sawtooth", 0.055, -45);
    showBanner("Coque perdue", `Score ${formatScore(game.score)} - secteur ${String(game.level).padStart(2, "0")}`, "Rejouer", "Signal coupe");
  }
}

function togglePause() {
  if (game.mode === "playing") {
    game.mode = "paused";
    showBanner("Pause", `Score ${formatScore(game.score)} - secteur ${String(game.level).padStart(2, "0")}`, "Continuer", "Nova Manta", false);
  } else if (game.mode === "paused") {
    game.mode = "playing";
    hideBanner();
  }
}

function loop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  rafId = requestAnimationFrame(loop);
}

function handlePrimary() {
  makeAudio();
  if (audioContext?.state === "suspended") audioContext.resume();
  if (game.mode === "ready" || game.mode === "over" || game.mode === "won") {
    resetRun();
  } else if (game.mode === "paused") {
    togglePause();
  }
}

function setKey(code, down) {
  if (code === "ArrowUp" || code === "KeyW" || code === "KeyZ") input.up = down;
  if (code === "ArrowDown" || code === "KeyS") input.down = down;
  if (code === "ArrowLeft" || code === "KeyA" || code === "KeyQ") input.left = down;
  if (code === "ArrowRight" || code === "KeyD") input.right = down;
}

window.addEventListener("keydown", (event) => {
  const codes = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "KeyZ", "KeyQ", "Space", "KeyE", "KeyP", "Enter", "KeyR"];
  if (codes.includes(event.code)) event.preventDefault();
  setKey(event.code, true);
  if (event.code === "Space") {
    if (game.mode === "ready") handlePrimary();
    else input.dash = true;
  }
  if (event.code === "KeyE") input.pulse = true;
  if (event.code === "KeyP") togglePause();
  if (event.code === "Enter") handlePrimary();
  if (event.code === "KeyR" && game.mode !== "playing") resetRun();
});

window.addEventListener("keyup", (event) => {
  setKey(event.code, false);
});

ui.primaryButton.addEventListener("click", handlePrimary);

ui.soundButton.addEventListener("click", () => {
  muted = !muted;
  ui.soundButton.classList.toggle("is-muted", muted);
  ui.soundButton.setAttribute("aria-label", muted ? "Son coupe" : "Son active");
  if (!muted) {
    makeAudio();
    tone(500, 0.08, "sine", 0.035, 120);
    ensureMusic();
  } else {
    stopMusic(true);
  }
});

ui.dashButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  input.dash = true;
  makeAudio();
});

ui.pulseButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  input.pulse = true;
  makeAudio();
});

function updateStick(clientX, clientY) {
  const rect = ui.stick.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const max = rect.width * 0.34;
  const length = Math.hypot(dx, dy);
  const limited = Math.min(max, length);
  const nx = length > 0 ? dx / length : 0;
  const ny = length > 0 ? dy / length : 0;
  ui.stickKnob.style.transform = `translate(calc(-50% + ${nx * limited}px), calc(-50% + ${ny * limited}px))`;
  input.joystick.x = clamp(dx / max, -1, 1);
  input.joystick.y = clamp(dy / max, -1, 1);
}

ui.stick.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  ui.stick.setPointerCapture(event.pointerId);
  input.joystick.active = true;
  input.joystick.id = event.pointerId;
  updateStick(event.clientX, event.clientY);
  makeAudio();
  if (game.mode === "ready") handlePrimary();
});

ui.stick.addEventListener("pointermove", (event) => {
  if (!input.joystick.active || input.joystick.id !== event.pointerId) return;
  updateStick(event.clientX, event.clientY);
});

function releaseStick(event) {
  if (input.joystick.id !== event.pointerId) return;
  input.joystick.active = false;
  input.joystick.id = null;
  input.joystick.x = 0;
  input.joystick.y = 0;
  ui.stickKnob.style.transform = "translate(-50%, -50%)";
}

ui.stick.addEventListener("pointerup", releaseStick);
ui.stick.addEventListener("pointercancel", releaseStick);

window.addEventListener("blur", () => {
  input.up = false;
  input.down = false;
  input.left = false;
  input.right = false;
});

window.addEventListener("resize", resize);

function drawSkinPreview(canvas, skin) {
  const pctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  pctx.clearRect(0, 0, w, h);
  pctx.save();
  pctx.translate(w / 2, h / 2);
  pctx.rotate(-Math.PI / 2);
  const grad = pctx.createLinearGradient(-12, 0, 14, 0);
  grad.addColorStop(0, skin.c1);
  grad.addColorStop(0.55, skin.c2);
  grad.addColorStop(1, skin.c3);
  pctx.fillStyle = grad;
  pctx.shadowBlur = 8;
  pctx.shadowColor = skin.glow;
  if (skin.shape === "dart") {
    pctx.beginPath();
    pctx.moveTo(14, 0);
    pctx.lineTo(-6, -6);
    pctx.lineTo(-12, 0);
    pctx.lineTo(-6, 6);
    pctx.closePath();
    pctx.fill();
  } else if (skin.shape === "wedge") {
    pctx.beginPath();
    pctx.moveTo(12, 0);
    pctx.lineTo(-10, -9);
    pctx.lineTo(-10, 9);
    pctx.closePath();
    pctx.fill();
  } else if (skin.shape === "diamond") {
    pctx.beginPath();
    pctx.moveTo(0, -12);
    pctx.lineTo(10, 0);
    pctx.lineTo(0, 12);
    pctx.lineTo(-10, 0);
    pctx.closePath();
    pctx.fill();
  } else if (skin.shape === "hex") {
    pctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * TAU - Math.PI / 2;
      const x = Math.cos(a) * 12;
      const y = Math.sin(a) * 10;
      if (i === 0) pctx.moveTo(x, y);
      else pctx.lineTo(x, y);
    }
    pctx.closePath();
    pctx.fill();
  } else {
    pctx.beginPath();
    pctx.moveTo(14, 0);
    pctx.bezierCurveTo(4, -5, -2, -12, -12, -10);
    pctx.bezierCurveTo(-7, -4, -7, 4, -12, 10);
    pctx.bezierCurveTo(-2, 12, 4, 5, 14, 0);
    pctx.fill();
  }
  pctx.restore();
}

function selectSkin(skinId) {
  selectedSkinId = skinId;
  localStorage.setItem(SKIN_STORAGE_KEY, skinId);
  document.querySelectorAll(".skin-option").forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.skin === skinId);
  });
  tone(520, 0.06, "sine", 0.03, 80);
}

function selectLevel(level) {
  if (!isLevelUnlocked(level)) {
    tone(140, 0.08, "square", 0.02, -30);
    return;
  }
  selectedLevel = level;
  if (ui.selectedLevelLabel) {
    ui.selectedLevelLabel.textContent = String(level).padStart(2, "0");
  }
  document.querySelectorAll(".level-option").forEach((btn) => {
    btn.classList.toggle("is-selected", Number(btn.dataset.level) === level);
  });
  tone(380 + level * 2, 0.05, "triangle", 0.028);
}

function renderLevelSelector() {
  if (!ui.levelGrid) return;
  ui.levelGrid.innerHTML = "";
  for (let level = 1; level <= MAX_LEVEL; level += 1) {
    const unlocked = isLevelUnlocked(level);
    const isCurrent = level === progress.maxUnlocked;
    const isCompleted = level < progress.maxUnlocked;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.level = String(level);
    btn.className = [
      "level-option",
      unlocked ? "is-unlocked" : "is-locked",
      level === selectedLevel ? "is-selected" : "",
      isCurrent ? "is-current" : "",
      isCompleted ? "is-completed" : "",
    ].filter(Boolean).join(" ");
    btn.disabled = !unlocked;
    btn.title = unlocked
      ? isCompleted
        ? `Secteur ${level} termine`
        : isCurrent
          ? `Secteur ${level} en cours`
          : `Secteur ${level}`
      : `Secteur ${level} verrouille`;
    btn.setAttribute("aria-label", btn.title);
    btn.textContent = unlocked ? String(level).padStart(2, "0") : "🔒";
    if (unlocked) {
      btn.addEventListener("click", () => selectLevel(level));
    }
    ui.levelGrid.appendChild(btn);
  }
  if (ui.selectedLevelLabel) {
    ui.selectedLevelLabel.textContent = String(selectedLevel).padStart(2, "0");
  }
}

function initLevelSelector() {
  selectedLevel = clamp(selectedLevel, 1, progress.maxUnlocked);
  renderLevelSelector();
}

function initSkinSelector() {
  if (!ui.skinGrid) return;
  ui.skinGrid.innerHTML = "";
  SKINS.forEach((skin) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `skin-option${skin.id === selectedSkinId ? " is-selected" : ""}`;
    btn.dataset.skin = skin.id;
    btn.title = skin.name;
    btn.setAttribute("aria-label", skin.name);
    const preview = document.createElement("canvas");
    preview.width = 48;
    preview.height = 36;
    drawSkinPreview(preview, skin);
    const label = document.createElement("span");
    label.textContent = skin.name;
    btn.append(preview, label);
    btn.addEventListener("click", () => selectSkin(skin.id));
    ui.skinGrid.appendChild(btn);
  });
}

if (ui.skinToggle) {
  ui.skinToggle.addEventListener("click", () => {
    const panel = document.querySelector("#skinPanel");
    if (panel) panel.classList.toggle("is-open");
    makeAudio();
  });
}

resize();
initSkinSelector();
initLevelSelector();
levelConfig = getLevelConfig(selectedLevel);
updateHud();
draw();
rafId = requestAnimationFrame(loop);
