/**
 * desktop.js — Desktop-specific interactions
 */
(function () {
    "use strict";

    window.addEventListener('load', () => {
        const expertToggleBtn = document.getElementById("expert-toggle-btn");
        if (expertToggleBtn) expertToggleBtn.addEventListener("click", () => window.App.toggleExpert());

        const settingsBtn = document.getElementById("settings-btn");
        if (settingsBtn) {
            settingsBtn.addEventListener("click", () => {
                document.getElementById("settings-popup").classList.remove("hidden");
            });
        }

        const resetSaveBtn = document.getElementById("reset-save-btn");
        if (resetSaveBtn) resetSaveBtn.addEventListener("click", () => window.App.triggerResetPopup());

        const statsBtn = document.getElementById("stats-btn");
        if (statsBtn) statsBtn.addEventListener("click", () => window.App.openStats());

        const botToggleBtn = document.getElementById("bot-toggle-btn");
        if (botToggleBtn) botToggleBtn.addEventListener("click", () => window.App.toggleBot());

        const langToggleBtn = document.getElementById("lang-toggle-btn");
        if (langToggleBtn) langToggleBtn.addEventListener("click", () => window.App.toggleLanguage());

        document.querySelectorAll(".speed-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                window.App.updateSpeed(parseFloat(btn.dataset.speed));
            });
        });
    });

})();
