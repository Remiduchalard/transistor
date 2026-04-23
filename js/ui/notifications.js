/**
 * js/ui/notifications.js — Handles notifications, milestones, and achievements
 */

UI.Notifications = {
    init() {
        Events.on('notify', (data) => this.notify(data.message, data.type));
        Events.on('milestoneReached', (data) => this.showMilestone(data.title, data.desc));
        Events.on('achievementUnlocked', (id) => this.showAchievement(id));
        
        const closeBtn = document.getElementById("milestone-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                UI.els.milestonePopup.classList.add("hidden");
            });
        }
    },

    notify(message, type = "") {
        const el = document.createElement("div");
        el.className = "notification " + type;
        el.textContent = message;
        UI.els.notifications.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    },

    showMilestone(title, text) {
        UI.els.milestoneTitle.textContent = title;
        UI.els.milestoneText.textContent = text;
        UI.els.milestonePopup.classList.remove("hidden");
    },

    showAchievement(id) {
        const popup = document.getElementById("achievement-popup");
        if (popup) {
            const titleEl = document.getElementById("achievement-title");
            const descEl = document.getElementById("achievement-desc");
            if (titleEl) titleEl.textContent = I18n.t("achiev_" + id + "_title");
            if (descEl) descEl.innerHTML = I18n.t("achiev_" + id + "_desc");
            
            popup.classList.remove("hidden");
            setTimeout(() => {
                popup.classList.add("hidden");
            }, 10000);
        }
    }
};
