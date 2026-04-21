const fs = require('fs');

// Fonction pour récupérer le contenu d'un fichier
function readFile(path) { return fs.readFileSync(path, 'utf8'); }
// Fonction pour sauvegarder le contenu
function writeFile(path, content) { fs.writeFileSync(path, content, 'utf8'); }

let dictFr = {};
let dictEn = {};

// 1. Initialiser le dictionnaire UI de base
Object.assign(dictFr, {
    "nav_action": "Action",
    "nav_upgrades": "Bonus",
    "nav_machines": "Usines",
    "nav_options": "Options",
    "manual_fabrication": "Fabrication manuelle",
    "make_transistor": "Fabriquer un transistor",
    "next_boost": "Prochain boost :",
    "purchases": "achats",
    "activate_boost": "Activer Boost x50",
    "stock": "Stock:",
    "boost_active": "BOOST x50 ACTIF :",
    "sell_all": "TOUT VENDRE",
    "upgrades_title": "Améliorations",
    "machines_title": "Machines & Procédés",
    "total_produced_label": "Total Produit",
    "prod_per_year_label": "Production / an",
    "settings_title": "Options",
    "expert_mode": "Mode Avancé : ",
    "stats_btn": "Statistiques",
    "moore_law_link": "Loi de Moore vs. Loi de la Prolifération",
    "reset_save_btn": "Réinitialiser la sauvegarde",
    "bot_enable": "Activer le Bot",
    "bot_inactive": "Inactif",
    "game_speed": "Vitesse du jeu",
    "per_click": "+{val} par clic",
    "bot_active": "Actif",
    "bot_disable": "Désactiver le Bot",
    "rd_done": "R&D terminée : {val}",
    "upgrade_bought": "Amélioration achetée : {val}",
    "sold_for": "Vendu ! +{val}",
    "new_machine": "🔓 Nouveau : {name} ({year})",
    "new_era": "Nouvelle ère : {val}",
    "per_year": "{val}/an",
    "total_historique": "La quantité exacte de tous les transistors fabriqués depuis 1947 dans cette partie.",
    "prod_mondiale_reelle": "Ce qui a été historiquement produit sur Terre à cette année précise.",
    "domination": "Votre production comparée à la production mondiale historique. Atteignez 100% pour dominer le monde réel !",
    "temps_virtuel": "Temps écoulé dans le jeu. L'accélérateur et les boosts augmentent ce compteur plus vite que le temps réel."
});

Object.assign(dictEn, {
    "nav_action": "Action",
    "nav_upgrades": "Upgrades",
    "nav_machines": "Factories",
    "nav_options": "Settings",
    "manual_fabrication": "Manual Fabrication",
    "make_transistor": "Manufacture a transistor",
    "next_boost": "Next boost:",
    "purchases": "purchases",
    "activate_boost": "Activate x50 Boost",
    "stock": "Stock:",
    "boost_active": "x50 BOOST ACTIVE:",
    "sell_all": "SELL ALL",
    "upgrades_title": "Upgrades",
    "machines_title": "Machines & Processes",
    "total_produced_label": "Total Produced",
    "prod_per_year_label": "Production / year",
    "settings_title": "Settings",
    "expert_mode": "Expert Mode: ",
    "stats_btn": "Statistics",
    "moore_law_link": "Moore's Law vs. Proliferation Law",
    "reset_save_btn": "Reset Save",
    "bot_enable": "Enable Bot",
    "bot_inactive": "Inactive",
    "game_speed": "Game Speed",
    "per_click": "+{val} per click",
    "bot_active": "Active",
    "bot_disable": "Disable Bot",
    "rd_done": "R&D completed: {val}",
    "upgrade_bought": "Upgrade purchased: {val}",
    "sold_for": "Sold! +{val}",
    "new_machine": "🔓 New: {name} ({year})",
    "new_era": "New era: {val}",
    "per_year": "{val}/yr",
    "total_historique": "The exact quantity of all transistors manufactured since 1947 in this run.",
    "prod_mondiale_reelle": "What was historically produced on Earth in this specific year.",
    "domination": "Your production compared to historical world production. Reach 100% to dominate the real world!",
    "temps_virtuel": "Time elapsed in-game. The accelerator and boosts increase this counter faster than real time."
});

// 2. Extraire et remplacer dans machines.js
let machinesCode = readFile('js/machines.js');
let mMatches = [...machinesCode.matchAll(/name:\s*"([^"]+)",\s*desc:\s*"([^"]+)",[\s\S]*?realInfo:\s*"([^"]+)",\s*rdInfo:\s*"([^"]+)"/g)];

mMatches.forEach((match, index) => {
    let keyName = "machine_" + index + "_name";
    let keyDesc = "machine_" + index + "_desc";
    let keyReal = "machine_" + index + "_real";
    let keyRd = "machine_" + index + "_rd";

    dictFr[keyName] = match[1];
    dictFr[keyDesc] = match[2];
    dictFr[keyReal] = match[3];
    dictFr[keyRd] = match[4];

    // Basic auto-english fallback for now to ensure data exists (we'll translate key parts manually or via LLM later, but for now we put EN = FR to not break the game)
    dictEn[keyName] = match[1];
    dictEn[keyDesc] = match[2];
    dictEn[keyReal] = match[3];
    dictEn[keyRd] = match[4];

    // Remplacer dans le code
    machinesCode = machinesCode.replace(
        `name: "${match[1]}",\n        desc: "${match[2]}"`,
        `name: I18n.t("${keyName}"),\n        desc: I18n.t("${keyDesc}")`
    );
    machinesCode = machinesCode.replace(
        `realInfo: "${match[3]}",\n        rdInfo: "${match[4]}"`,
        `realInfo: I18n.t("${keyReal}"),\n        rdInfo: I18n.t("${keyRd}")`
    );
});
writeFile('js/machines.js', machinesCode);

// 3. Extraire et remplacer dans upgrades.js
let upgradesCode = readFile('js/upgrades.js');
let uMatches = [...upgradesCode.matchAll(/name:\s*"([^"]+)",\s*desc:\s*"([^"]+)"/g)];

uMatches.forEach((match, index) => {
    let keyName = "upg_" + index + "_name";
    let keyDesc = "upg_" + index + "_desc";

    dictFr[keyName] = match[1];
    dictFr[keyDesc] = match[2];
    
    dictEn[keyName] = match[1];
    dictEn[keyDesc] = match[2];

    upgradesCode = upgradesCode.replace(
        `name: "${match[1]}",\n        desc: "${match[2]}"`,
        `name: I18n.t("${keyName}"),\n        desc: I18n.t("${keyDesc}")`
    );
});
writeFile('js/upgrades.js', upgradesCode);

// 4. Extraire et remplacer dans config.js (Eras)
let configCode = readFile('js/config.js');
let eMatches = [...configCode.matchAll(/name:\s*"([^"]+)",\s*desc:\s*"([^"]+)"/g)];

eMatches.forEach((match, index) => {
    let keyName = "era_" + index + "_name";
    let keyDesc = "era_" + index + "_desc";

    dictFr[keyName] = match[1];
    dictFr[keyDesc] = match[2];
    dictEn[keyName] = match[1];
    dictEn[keyDesc] = match[2];

    configCode = configCode.replace(
        `name: "${match[1]}", desc: "${match[2]}"`,
        `name: I18n.t("${keyName}"), desc: I18n.t("${keyDesc}")`
    );
});
writeFile('js/config.js', configCode);

// 5. Générer js/i18n.js
const i18nCode = `
const Locales = {
    fr: ${JSON.stringify(dictFr, null, 4)},
    en: ${JSON.stringify(dictEn, null, 4)}
};

const I18n = {
    lang: 'fr',

    init() {
        const navLang = (navigator.language || navigator.userLanguage).slice(0, 2);
        this.lang = Locales[navLang] ? navLang : 'en';
        document.documentElement.lang = this.lang;
    },

    t(key, vars = {}) {
        let str = Locales[this.lang][key] || Locales['en'][key] || key;
        for (const [k, v] of Object.entries(vars)) {
            str = str.replace(new RegExp(\`\\\\{\${k}\\\\}\`, 'g'), v);
        }
        return str;
    },

    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.innerHTML = this.t(el.getAttribute('data-i18n'));
        });
    }
};

I18n.init();
`;

writeFile('js/i18n.js', i18nCode);
console.log("i18n successfully built.");
