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
            
            // UI elements update themselves by listening to this event
            Events.emit('languageChanged', newLang);
            
            this.updateDOM();
            
            if (typeof window.App !== 'undefined' && window.App.updateExpertMode) {
                window.App.updateExpertMode();
            }
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
