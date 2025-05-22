// --- Variablen & Grundwerte ---
let score = 0;
let nps = 0; // Nicolas per second
let upgrades = [];
let prestigePoints = 0;

const scoreEl = document.getElementById('score');
const npsEl = document.getElementById('nps');
const nicolaBtn = document.getElementById('nicola-button');
const upgradesContainer = document.getElementById('upgrades-container');
const prestigeBtn = document.getElementById('prestige-button');
const goldenEggEl = document.getElementById('golden-egg');
const tooltip = document.getElementById('tooltip');

const STORAGE_KEY = 'nicolaClickerSave';

// Beispiel-Upgrades (id, name, beschreibung, kosten, npsBonus, bild)
const availableUpgrades = [
  {id: 'autoclicker', name: 'Autoklicker', description: 'Klickt automatisch für dich.', cost: 50, nps: 1, img: 'assets/upgrades/autoclicker.png'},
  {id: 'farm', name: 'Farm', description: 'Produziert Nicolas passiv.', cost: 200, nps: 5, img: 'assets/upgrades/farm.png'},
  {id: 'factory', name: 'Fabrik', description: 'Große Nicolas-Produktion.', cost: 1000, nps: 20, img: 'assets/upgrades/factory.png'},
];

// --- Funktionen ---

// Punkte aktualisieren & anzeigen
function updateScore(amount) {
  score += amount;
  if (score < 0) score = 0;
  scoreEl.textContent = Math.floor(score);
  checkUpgradeAvailability();
  updatePrestigeButton();
}

// NPS berechnen
function calculateNPS() {
  nps = upgrades.reduce((sum, upg) => sum + (upg.nps * upg.count), 0);
  npsEl.textContent = nps.toFixed(1);
}

// Upgrades rendern
function renderUpgrades() {
  upgradesContainer.innerHTML = '';
  upgrades.forEach(upg => {
    const div = document.createElement('div');
    div.className = 'upgrade' + (score >= upg.cost ? '' : ' disabled');
    div.dataset.id = upg.id;
    div.setAttribute('tabindex', '0');
    div.setAttribute('role', 'button');
    div.setAttribute('aria-pressed', 'false');

    div.innerHTML = `
      <img src="${upg.img}" alt="${upg.name}" />
      <div class="upgrade-info">
        <h4>${upg.name} (${upg.count})</h4>
        <p>${upg.description}</p>
      </div>
      <div class="upgrade-cost">${upg.cost} Nicolas</div>
    `;

    // Tooltip-Events
    div.addEventListener('mouseenter', () => showTooltip(upg.description, div));
    div.addEventListener('mouseleave', hideTooltip);

    // Klick auf Upgrade
    div.addEventListener('click', () => buyUpgrade(upg.id));

    // Tastatursteuerung
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        buyUpgrade(upg.id);
      }
    });

    upgradesContainer.appendChild(div);
  });
}

// Upgrade kaufen
function buyUpgrade(id) {
  const upg = upgrades.find(u => u.id === id);
  if (!upg) return;
  if (score >= upg.cost) {
    updateScore(-upg.cost);
    upg.count++;
    // Upgrade kostet nach dem Kauf 15% mehr
    upg.cost = Math.ceil(upg.cost * 1.15);
    calculateNPS();
    renderUpgrades();
    saveGame();
  }
}

// Klick-Event
nicolaBtn.addEventListener('click', () => {
  updateScore(1 + prestigePoints);
  playSound('click');
});

// Automatisch NPS hinzufügen
setInterval(() => {
  if (nps > 0) {
    updateScore(nps);
  }
}, 1000);

// Goldenes Ei Event (zufällig alle 30-90 Sekunden)
function showGoldenEgg() {
  goldenEggEl.style.display = 'block';
  goldenEggEl.onclick = () => {
    updateScore(50 + prestigePoints * 10);
    hideGoldenEgg();
    playSound('golden_egg');
  };
  // Verschwindet nach 10s automatisch
  setTimeout(hideGoldenEgg, 10000);
}

function hideGoldenEgg() {
  goldenEggEl.style.display = 'none';
  goldenEggEl.onclick = null;
}

function randomGoldenEggTimer() {
  const interval = (Math.random() * 60 + 30) * 1000;
  setTimeout(() => {
    showGoldenEgg();
    randomGoldenEggTimer();
  }, interval);
}

// Prestige-Button aktivieren/deaktivieren
function updatePrestigeButton() {
  prestigeBtn.disabled = score < 1000;
  prestigeBtn.textContent = `Prestige (${prestigePoints} Punkte)`;
}

// Prestige aktivieren
prestigeBtn.addEventListener('click', () => {
  if (score >= 1000) {
    prestigePoints++;
    score = 0;
    upgrades.forEach(u => {
      u.count = 0;
      u.cost = availableUpgrades.find(a => a.id === u.id).cost;
    });
    calculateNPS();
    renderUpgrades();
    updateScore(0); // Update Anzeige
    saveGame();
    playSound('prestige');
    alert(`Prestige aktiviert! Du hast jetzt ${prestigePoints} Prestige-Punkte.`);
  }
});

// Speicher laden
function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    score = data.score || 0;
    prestigePoints = data.prestigePoints || 0;
    upgrades = data.upgrades || availableUpgrades.map(u => ({...u, count: 0}));
  } else {
    upgrades = availableUpgrades.map(u => ({...u, count: 0}));
  }
  calculateNPS();
  renderUpgrades();
  updateScore(0);
  updatePrestigeButton();
}

// Speicher sichern
function saveGame() {
  const data = {
    score,
    prestigePoints,
    upgrades
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Upgrade-Verfügbarkeit prüfen
function checkUpgradeAvailability() {
  const upgradeDivs = upgradesContainer.querySelectorAll('.upgrade');
  upgrades.forEach((upg, i) => {
    const div = upgradeDivs[i];
    if (!div) return;
    if (score >= upg.cost) {
      div.classList.remove('disabled');
      div.setAttribute('aria-disabled', 'false');
    } else {
      div.classList.add('disabled');
      div.setAttribute('aria-disabled', 'true');
    }
  });
}

// Tooltip anzeigen
function showTooltip(text, target) {
  tooltip.textContent = text;
  tooltip.style.opacity = '1';
  tooltip.setAttribute('aria-hidden', 'false');

  const rect = target.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset;
  let top = rect.top + scrollY - tooltip.offsetHeight - 8;
  if (top < 0) top = rect.bottom + scrollY + 8;
  let left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
  if (left < 0) left = 8;
  if (left + tooltip.offsetWidth > window.innerWidth) left = window.innerWidth - tooltip.offsetWidth - 8;

  tooltip.style.top = top + 'px';
  tooltip.style.left = left + 'px';
}

// Tooltip verstecken
function hideTooltip() {
  tooltip.style.opacity = '0';
  tooltip.setAttribute('aria-hidden', 'true');
}

// Sounds abspielen (optional - einfache Implementation)
function playSound(name) {
  const audio = new Audio(`assets/sound/${name}.mp3`);
  audio.volume = 0.3;
  audio.play().catch(() => {});
}

// Initialisierung
loadGame();
randomGoldenEggTimer();

// Autosave alle 10 Sekunden
setInterval(saveGame, 10000);
