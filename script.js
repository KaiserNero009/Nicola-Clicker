// script.js
let score = 0;
let perSecond = 0;
let upgrades = [
  { name: "Autoklicker", cost: 10, cps: 1, img: "assets/upgrades/autoclicker.png" },
  { name: "Farm", cost: 100, cps: 5, img: "assets/upgrades/farm.png" },
  { name: "Fabrik", cost: 500, cps: 20, img: "assets/upgrades/factory.png" }
];
let owned = {};
let prestigePoints = 0;

const clicker = document.getElementById("clicker");
const scoreEl = document.getElementById("score");
const perSecondEl = document.getElementById("perSecond");
const upgradesEl = document.getElementById("upgrades");
const goldenEgg = document.getElementById("golden-egg");
const prestigeBtn = document.getElementById("prestigeBtn");

clicker.addEventListener("click", () => {
  score += 1 + prestigePoints;
  updateUI();
  playSound("click");
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
  scoreEl.textContent = `${score} Nicolas`;
  perSecondEl.textContent = `${perSecond} pro Sekunde`;
}

function loop() {
  score += perSecond / 10;
  updateUI();
  if (Math.random() < 0.002) showGoldenEgg();
  save();
}

function showGoldenEgg() {
  goldenEgg.classList.remove("hidden");
  setTimeout(() => goldenEgg.classList.add("hidden"), 5000);
}

goldenEgg.addEventListener("click", () => {
  score += 100 * (1 + prestigePoints);
  playSound("golden_egg");
  goldenEgg.classList.add("hidden");
});

prestigeBtn.addEventListener("click", () => {
  if (score >= 10000) {
    prestigePoints += 1;
    score = 0;
    owned = {};
    upgrades.forEach(u => u.cost = u.cost / Math.pow(1.15, (owned[u.name] || 0)));
    updateProduction();
    updateUI();
    playSound("prestige");
  }
});

function playSound(name) {
  const audio = new Audio(`assets/sound/${name}.mp3`);
  audio.play();
}

function save() {
  const saveData = { score, owned, prestigePoints };
  localStorage.setItem("save", JSON.stringify(saveData));
}

function load() {
  const data = JSON.parse(localStorage.getItem("save"));
  if (data) {
    score = data.score;
    owned = data.owned;
    prestigePoints = data.prestigePoints;
    updateProduction();
    updateUI();
  }
}

function renderUpgrades() {
  upgradesEl.innerHTML = "";
  upgrades.forEach(upg => {
    const div = document.createElement("div");
    div.className = "upgrade";
    div.innerHTML = `<img src="${upg.img}" alt="${upg.name}" /> <div><strong>${upg.name}</strong><br>${upg.cost} Nicolas<br>+${upg.cps}/s</div>`;
    div.onclick = () => buyUpgrade(upg.name);
    upgradesEl.appendChild(div);
  });
}

load();
renderUpgrades();
setInterval(loop, 100);
