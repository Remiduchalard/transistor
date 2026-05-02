
const Locales = {
    fr: {
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
},
    en: {
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
}
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
            str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
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
