/**
 * mobile.js — Mobile-specific interactions
 */
(function () {
    "use strict";

    // Mobile Tab Navigation
    function switchTab(targetId) {
        const btn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
        if (!btn) return;

        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        document.querySelectorAll(".mobile-tab").forEach(tab => tab.classList.remove("active-tab"));
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.add("active-tab");
        
        window.scrollTo(0, 0);
    }

    document.querySelectorAll(".nav-btn[data-target]").forEach(btn => {
        btn.addEventListener("click", () => {
            switchTab(btn.dataset.target);
        });
    });

    // Swipe Detection
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    const tabs = ["tab-action", "tab-upgrades", "tab-machines", "tab-settings"];

    function handleSwipe() {
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Ensure it's mostly a horizontal swipe and long enough
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            const activeTab = document.querySelector(".mobile-tab.active-tab");
            if (!activeTab) return;
            
            const currentIndex = tabs.indexOf(activeTab.id);
            if (currentIndex === -1) return;

            if (dx > 0) {
                // Swipe Right -> Go to previous tab
                if (currentIndex > 0) {
                    switchTab(tabs[currentIndex - 1]);
                }
            } else {
                // Swipe Left -> Go to next tab
                if (currentIndex < tabs.length - 1) {
                    switchTab(tabs[currentIndex + 1]);
                }
            }
        }
    }

    const mainArea = document.getElementById("main-area");
    if (mainArea) {
        mainArea.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        mainArea.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });
    }

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

        const langToggleBtnMobile = document.getElementById("lang-toggle-btn-mobile");
        if (langToggleBtnMobile) langToggleBtnMobile.addEventListener("click", () => window.App.toggleLanguage());

        document.querySelectorAll(".speed-btn-mobile").forEach(btn => {
            btn.addEventListener("click", () => {
                window.App.updateSpeed(parseFloat(btn.dataset.speed));
            });
        });
    });

})();
