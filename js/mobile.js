/**
 * mobile.js — Mobile-specific interactions
 */
(function () {
    "use strict";

    // Mobile Tab Navigation
    document.querySelectorAll(".nav-btn[data-target]").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.querySelectorAll(".mobile-tab").forEach(tab => tab.classList.remove("active-tab"));
            const targetId = btn.dataset.target;
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.classList.add("active-tab");
            window.scrollTo(0, 0);
        });
    });

    // Scroll behavior for mobile header
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            document.body.classList.add("scrolled");
        } else {
            document.body.classList.remove("scrolled");
        }
    });

    // Mobile-specific event listeners
    window.addEventListener('load', () => {
        const expertToggleBtnMobile = document.getElementById("expert-toggle-btn-mobile");
        if (expertToggleBtnMobile) expertToggleBtnMobile.addEventListener("click", () => window.App.toggleExpert());

        const resetSaveBtnMobile = document.getElementById("reset-save-btn-mobile");
        if (resetSaveBtnMobile) resetSaveBtnMobile.addEventListener("click", () => window.App.triggerResetPopup());

        const statsBtnMobile = document.getElementById("stats-btn-mobile");
        if (statsBtnMobile) statsBtnMobile.addEventListener("click", () => window.App.openStats());

        const botToggleBtnMobile = document.getElementById("bot-toggle-btn-mobile");
        if (botToggleBtnMobile) botToggleBtnMobile.addEventListener("click", () => window.App.toggleBot());

        document.querySelectorAll(".speed-btn-mobile").forEach(btn => {
            btn.addEventListener("click", () => {
                window.App.updateSpeed(parseFloat(btn.dataset.speed));
            });
        });
    });

})();
