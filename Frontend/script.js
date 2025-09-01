const VERSION = "15.17.1";
const ITEMS_JSON = `/items`;

let allItems = {};
const MAX_BUILD = 6;
let buildItems = Array(MAX_BUILD).fill(null);

document.addEventListener("DOMContentLoaded", () => {
  const veigarImg = document.querySelector(".champion img");
  const veigarSkins = [
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_1.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_2.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_3.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_4.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_5.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_6.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_7.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_8.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_9.jpg"
  ];
  let currentSkin = 0;

  veigarImg.addEventListener("click", () => {
    currentSkin = (currentSkin + 1) % veigarSkins.length;
    veigarImg.src = veigarSkins[currentSkin];
    veigarImg.style.width = "400px";
    veigarImg.style.height = "auto";
    veigarImg.style.border = "2px solid black";
    veigarImg.style.borderRadius = "5px";
  });
});



// Renderiza Minha Build (clean)
function renderBuild() {
  const slots = document.getElementById("buildSlots").children;
  for (let i = 0; i < MAX_BUILD; i++) {
    const slot = slots[i];
    const item = buildItems[i];
    slot.innerHTML = "";
    slot.classList.remove("filled");
    if (item) {
      const img = document.createElement("img");
      img.src = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/item/${item.image}`;
      img.alt = item.name;
      slot.appendChild(img);
      slot.classList.add("filled");
    }
  }
}

// Calcula stats da build com novos stats e efeitos únicos
function calcStats() {
  let totalStats = {
    health: 0,
    mana: 0,
    ap: 0,
    msPercent: 0,
    armor: 0,
    mr: 0,
  };

  // Soma stats base dos itens
  buildItems.forEach(item => {
    if (!item) return;
    const s = item.stats || {};
    totalStats.health += s.FlatHPPoolMod || 0;
    totalStats.mana += s.FlatMPPoolMod || 0;
    totalStats.ap += s.FlatMagicDamageMod || 0;
    totalStats.msPercent += s.PercentMovementSpeedMod || 0;
    totalStats.armor += s.FlatArmorMod || 0;
    totalStats.mr += s.FlatSpellBlockMod || 0;
  });

  // Aplica efeitos únicos baseados nos totais
  buildItems.forEach(item => {
    if (!item) return;
    if (item.name === "Riftmaker") totalStats.ap += 0.02 * totalStats.health;
    if (item.name === "Winter's Approach") totalStats.health += 0.15 * totalStats.mana;
    if (item.name === "Archangel's Staff") totalStats.ap += 0.01 * totalStats.mana;
    if (item.name === "Rabadon's Deathcap") totalStats.ap *= 1.3;
  });

  return totalStats;
}


// Atualiza stats na tela
function updateBuildStats() {
  const s = calcStats();
  const statsDiv = document.getElementById("buildStats");
  statsDiv.textContent = `Health: ${s.health} | Mana: ${s.mana} | AP: ${Math.round(s.ap)} | MS%: ${Math.round(s.msPercent*100)}% | Armor: ${s.armor} | MR: ${s.mr}`;
}


// Adiciona ou remove item da build
function toggleBuildItem(item, divElement) {
  const index = buildItems.findIndex(i => i && i.name === item.name);

  if (index !== -1) {
    buildItems[index] = null;
    divElement.classList.remove("selected");
  } else {
    const emptyIndex = buildItems.findIndex(i => i === null);
    if (emptyIndex !== -1) {
      buildItems[emptyIndex] = item;
      divElement.classList.add("selected");
    } else return; // Build cheia
  }
  renderBuild();
  updateBuildStats();
}

// Renderiza grid de itens
function renderItems() {
  const grid = document.getElementById("itemsGrid");
  grid.innerHTML = "";

  const showLife = document.getElementById("life").checked;
  const showAP = document.getElementById("ap").checked;
  const showMana = document.getElementById("mana").checked;

  Object.values(allItems).forEach(item => {
    const tags = item.tags || [];
    const s = item.stats || {};

    const hasAP = tags.includes("SpellDamage") || s.FlatMagicDamageMod;
    const hasMana = tags.includes("Mana") || s.FlatMPPoolMod;
    const hasHP = tags.includes("Health") || s.FlatHPPoolMod;

    if ((hasAP && showAP) || (hasMana && showMana) || (hasHP && showLife)) {
      const div = document.createElement("div");
      div.className = "item";

      const statsText = [];
      if (s.FlatHPPoolMod) statsText.push(`HP: ${s.FlatHPPoolMod}`);
      if (s.FlatMPPoolMod) statsText.push(`Mana: ${s.FlatMPPoolMod}`);
      if (s.FlatMagicDamageMod) statsText.push(`AP: ${s.FlatMagicDamageMod}`);
      if (s.FlatMovementSpeedMod) statsText.push(`MS: ${s.FlatMovementSpeedMod}`);
      if (s.PercentMovementSpeedMod) statsText.push(`MS%: ${Math.round(s.PercentMovementSpeedMod*100)}%`);
      if (s.FlatArmorMod) statsText.push(`Armor: ${s.FlatArmorMod}`);
      if (s.FlatSpellBlockMod) statsText.push(`MR: ${s.FlatSpellBlockMod}`);

      div.innerHTML = `
        <img src="https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/item/${item.image}" alt="${item.name}">
        <div class="item-name">${item.name}</div>
        <div class="item-stats">${statsText.join(' | ')}</div>
      `;

      div.addEventListener("click", () => toggleBuildItem(item, div));
      if (buildItems.find(i => i && i.name === item.name)) div.classList.add("selected");
      grid.appendChild(div);
    }
  });
}


fetch(ITEMS_JSON)
  .then(res => res.json())
  .then(data => {
    allItems = data;
    Object.values(allItems).forEach(item => { item.tags = item.tags || []; item.stats = item.stats || {}; });
    renderItems();
    updateBuildStats();
  });

document.getElementById("life").addEventListener("change", renderItems);
document.getElementById("ap").addEventListener("change", renderItems);
document.getElementById("mana").addEventListener("change", renderItems);
