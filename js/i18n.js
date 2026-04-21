
window.Locales = window.Locales || {};

const I18n = {
    lang: 'fr',

    init() {
        const savedLang = localStorage.getItem('transistor_clicker_lang');
        if (savedLang && Locales[savedLang]) {
            this.lang = savedLang;
        } else {
            const navLang = (navigator.language || navigator.userLanguage).slice(0, 2);
            this.lang = Locales[navLang] ? navLang : 'en';
        }
        document.documentElement.lang = this.lang;
    },

    setLanguage(newLang) {
        if (Locales[newLang]) {
            this.lang = newLang;
            localStorage.setItem('transistor_clicker_lang', newLang);
            document.documentElement.lang = this.lang;
            this.updateDOM();
            this.updateGameData();
            if (typeof UI !== 'undefined') {
                UI.renderMachines();
                UI.renderUpgrades();
                UI.updateStats();
            }
            if (typeof window.App !== 'undefined' && window.App.updateExpertMode) {
                window.App.updateExpertMode();
            }
        }
    },

    updateGameData() {
        if (typeof CONFIG !== 'undefined' && CONFIG.ERAS) {
            CONFIG.ERAS.forEach((e, i) => {
                e.name = this.t("era_" + i + "_name");
                e.desc = this.t("era_" + i + "_desc");
            });
        }
        if (typeof MACHINES !== 'undefined') {
            MACHINES.forEach((m, i) => {
                m.name = this.t("machine_" + i + "_name");
                m.desc = this.t("machine_" + i + "_desc");
                m.realInfo = this.t("machine_" + i + "_real");
                m.rdInfo = this.t("machine_" + i + "_rd");
            });
        }
        if (typeof UPGRADES !== 'undefined') {
            UPGRADES.forEach((u, i) => {
                u.name = this.t("upg_" + i + "_name");
                u.desc = this.t("upg_" + i + "_desc");
            });
        }
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
