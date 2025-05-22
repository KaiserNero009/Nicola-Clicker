let score = 0;
let perSecond = 0;
let upgrades = [
  { name: "Autoklicker", cost: 10, cps: 1, img: "assets/upgrades/autoclicker.png" },
  { name: "Farm", cost: 100, cps: 5, img: "assets/upgrades/farm.png" },
  { name: "Fabrik", cost: 500, cps: 20, img: "assets/upgrades/factory.png" }
];
let owned = {};
let prestigePoints = 0;
let achievements = [];
let stats = { clicks: 0, goldenEggs: 0, totalEarned: 0 };
let settings = { sound: true };

const clicker = document.getElementById("clicker");
const scoreEl = document.getElementById("score");
const perSecondEl = document.getElementById("perSecond");
const upgradesEl = document.getElementById("upgrades");
const goldenEgg = document.getElementById("golden-egg");
const prestigeBtn = document.getElementById("prestigeBtn");

const btnAchievements = document.getElementById("btn-achievements");
const btnStats = document.getElementById("btn-stats");
const btnSettings = document.getElementById("btn-settings");

const panelAchievements = document.getElementById("panel-achievements");
const panelStats = document.getElementById("panel-stats");
const panelSettings = document.getElementById("panel-settings");

const achievementsList = document.getElementById("achievements-list");
const statClicks = document.getElementById("stat-clicks");
const statGoldenEggs = document.getElementById("stat-goldenEggs");
const statTotalEarned = document.getElementById("stat-totalEarned");
const toggleSound = document.getElementById("toggle-sound");

clicker.addEventListener("click", () => {
  let gain = 1 + prestigePoints;
  score += gain;
  stats.clicks++;
  stats.totalEarned += gain;
  updateUI();
  if (settings.sound) playSound("click");
  checkAchievements();
});

function buyUpgrade(name) {
  const upgrade = upgrades.find(u => u.name === name);
  if (score >= upgrade.cost) {
    score -= upgrade.cost;
    owned[name] = (owned[name] || 0) + 1;
    upgrade.cost = Math.floor(upgrade.cost * 1.15);
    updateProduction();
    updateUI();
  }
}

function updateProduction() {
  perSecond = 0;
  upgrades.forEach(upg => {
    perSecond += (owned[upg.name] || 0) * upg.cps;
  });
}

function updateUI() {
  scoreEl.textContent = `${Math.floor(score)} Nicolas`;
  perSecondEl.textContent = `${Math.floor(perSecond)} pro Sekunde`;
}

function loop() {
  score += perSecond / 10;
  stats.totalEarned += perSecond / 10;
  updateUI();
  if (Math.random() < 0.002) showGoldenEgg();
  save();
}

function showGoldenEgg() {
  goldenEgg.classList.remove("hidden");
  setTimeout(() => goldenEgg.classList.add("hidden"), 5000);
}

goldenEgg.addEventListener("click", () => {
  let bonus = 100 * (1 + prestigePoints);
  score += bonus;
  stats.goldenEggs++;
  stats.totalEarned += bonus;
  if (settings.sound) playSound("golden_egg");
  goldenEgg.classList.add("hidden");
  checkAchievements();
});

prestigeBtn.addEventListener("click", () => {
  if (score >= 10000) {
    prestigePoints++;
    score = 0;
    owned = {};
    upgrades.forEach(u => (u.cost = u.cost / Math.pow(1.15, owned[u.name] || 0)));
    updateProduction();
    updateUI();
    if (settings.sound) playSound("prestige");
    checkAchievements();
  }
});

function playSound(name) {
  const audio = new Audio(`assets/sound/${name}.mp3`);
  audio.play();
}

function checkAchievements() {
  const list = [
    { key: "click100", condition: stats.clicks >= 100, label: "100 Klicks!" },
    { key: "egg5", condition: stats.goldenEggs >= 5, label: "5 goldene Eier!" },
    { key: "prestige1", condition: prestigePoints >= 1, label: "Erstes Prestige!" },
    { key: "rich", condition: stats.totalEarned >= 10000, label: "10.000 Nicolas verdient!" }
  ];
  list.forEach(a => {
    if (a.condition && !achievements.includes(a.key)) {
      achievements.push(a.key);
      alert(`Achievement: ${a.label}`);
    }
  });
}

function save() {
  const saveData = { score, owned, prestigePoints, stats, achievements, settings };
  localStorage.setItem("save", JSON.stringify(saveData));
}

function load() {
  const data = JSON.parse(localStorage.getItem("save"));
  if (data) {
    score = data.score;
    owned = data.owned;
    prestigePoints = data.prestigePoints;
    stats = data.stats || stats;
    achievements = data.achievements || [];
    settings = data.settings || settings;
    updateProduction();
    updateUI();
  }
}

function renderUpgrades() {
  upgradesEl.innerHTML = "";
  upgrades.forEach(u => {
    const div = document.createElement("div");
    div.classList.add("upgrade");
    div.innerHTML = `
      <img src="${u.img}" alt="${u.name}" />
      <div>
        <strong>${u.name}</strong><br/>
        Kosten: ${Math.floor(u.cost)}<br/>
        +${u.cps} pro Sekunde<br/>
        Besitzt: ${owned[u.name] || 0}
      </div>
    `;
    div.addEventListener("click", () => buyUpgrade(u.name));
    upgradesEl.appendChild(div);
  });
}

// Panel-Funktionen

function showPanel(panel) {
  [panelAchievements, panelStats, panelSettings].forEach(p => p.classList.add("hidden"));
  panel.classList.remove("hidden");
}

btnAchievements.addEventListener("click", () => {
  renderAchievements();
  showPanel(panelAchievements);
});

btnStats.addEventListener("click", () => {
  renderStats();
  showPanel(panelStats);
});

btnSettings.addEventListener("click", () => {
  toggleSound.checked = settings.sound;
  showPanel(panelSettings);
});

toggleSound.addEventListener("change", () => {
  settings.sound = toggleSound.checked;
  save();
});

function renderAchievements() {
  achievementsList.innerHTML = "";
  if (achievements.length === 0) {
    achievementsList.innerHTML = "<li>Keine Achievements bisher.</li>";
  } else {
    achievements.forEach(key => {
      let label = key;
      if (key === "click100") label = "100 Klicks!";
      else if (key === "egg5") label = "5 goldene Eier!";
      else if (key === "prestige1") label = "Erstes Prestige!";
      else if (key === "rich") label = "10.000 Nicolas verdient!";
      const li = document.createElement("li");
      li.textContent = label;
      achievementsList.appendChild(li);
    });
  }
}

function renderStats() {
  statClicks.textContent = stats.clicks;
  statGoldenEggs.textContent = stats.goldenEggs;
  statTotalEarned.textContent = Math.floor(stats.totalEarned);
}

// Init

load();
renderUpgrades();
updateProduction();
updateUI();

setInterval(loop, 100);

