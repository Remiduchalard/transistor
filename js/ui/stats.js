/**
 * js/ui/stats.js — Handles the stats display and updates
 */

UI.Stats = {
    init() {
        Events.on('statsUpdated', () => this.update());
    },

    update() {
        if (!UI.els.stock) return;
        
        // Stock + sell section is always visible
        UI.els.stock.parentElement.style.display = "";
        const sellBtnMax = document.getElementById("sell-btn-max");
        if (sellBtnMax) sellBtnMax.style.display = "";

        UI.els.stock.textContent = UI.formatNumber(Game.transistors);
        UI.els.perYear.textContent = I18n.t("per_year", { val: UI.formatNumber(Game.productionPerYear) });
        UI.els.money.textContent = UI.formatMoney(Game.money);
        
        if (UI.els.stickyMoney) UI.els.stickyMoney.textContent = UI.els.money.textContent;
        if (UI.els.stickyPerYear) UI.els.stickyPerYear.textContent = UI.els.perYear.textContent;
        
        UI.els.unitPrice.textContent = UI.formatPrice(Game.getEffectivePrice());
        UI.els.playTime.textContent = UI.formatTime(Game.virtualElapsed);
        
        let displayClickPower = Game.clickPower;
        if (Game.boostMs > 0) {
            displayClickPower = displayClickPower.mul(50);
        }
        UI.els.clickPowerDisplay.textContent = I18n.t("per_click", { val: UI.formatNumber(displayClickPower) });
        
        const worldProdValue = new Decimal(_worldProd(Game.currentYear));
        UI.els.worldProd.textContent = I18n.t("per_year", { val: UI.formatNumber(worldProdValue) });

        // Market share
        if (worldProdValue.gt(0) && Game.productionPerYear.gt(0)) {
            const share = Game.productionPerYear.div(worldProdValue).mul(100);
            if (share.gte(100)) {
                UI.els.marketShare.textContent = UI.formatNumber(share) + "%";
            } else if (share.gte(1)) {
                UI.els.marketShare.textContent = share.toNumber().toFixed(1) + "%";
            } else if (share.gte(0.01)) {
                UI.els.marketShare.textContent = share.toNumber().toFixed(3) + "%";
            } else {
                UI.els.marketShare.textContent = share.toExponential(1) + "%";
            }
        } else {
            UI.els.marketShare.textContent = "0%";
        }

        // Boost UI
        UI.els.boostProgressText.textContent = Game.purchaseCounter + " / 100";
        UI.els.boostProgressBar.style.width = Game.purchaseCounter + "%";
        
        if (Game.boostMs > 0) {
            UI.els.boostActiveDisplay.style.display = "block";
            UI.els.boostTimer.textContent = (Game.boostMs / 1000).toFixed(1);
        } else {
            UI.els.boostActiveDisplay.style.display = "none";
        }
        
        if (Game.consumables > 0) {
            UI.els.useBoostBtn.style.display = "block";
            UI.els.boostStock.textContent = Game.consumables;
        } else {
            UI.els.useBoostBtn.style.display = "none";
        }

        // Year
        const yearEl = UI.els.currentYear;
        if (yearEl.textContent !== String(Game.currentYear)) {
            yearEl.textContent = Game.currentYear;
            yearEl.classList.remove("year-advance");
            void yearEl.offsetWidth; // reflow
            yearEl.classList.add("year-advance");
        }

        // Era
        const era = getCurrentEra(Game.currentYear);
        UI.els.eraName.textContent = era.name;

        // Year progress
        const yp = getYearProgress(Game.totalTransistors);
        UI.els.yearTotalProduced.textContent = UI.formatNumber(Game.totalTransistors);
        UI.els.yearProgressFill.style.width = (yp.progress * 100).toFixed(1) + "%";
        
        const advancedTotalEl = document.getElementById("total-transistors-advanced");
        if (advancedTotalEl) advancedTotalEl.textContent = UI.formatNumber(Game.totalTransistors);
        
        // Exact numbers for Settings tab
        document.querySelectorAll(".exact-total-produced").forEach(el => {
            el.textContent = new Decimal(Game.totalTransistors).floor().toNumber().toLocaleString(I18n.lang === 'fr' ? 'fr-FR' : 'en-US');
        });
        document.querySelectorAll(".exact-per-year").forEach(el => {
            el.textContent = new Decimal(Game.productionPerYear).floor().toNumber().toLocaleString(I18n.lang === 'fr' ? 'fr-FR' : 'en-US');
        });
        
        if (yp.needed > 0) {
            UI.els.yearNextLabel.textContent = UI.formatNumber(yp.needed);
        } else {
            UI.els.yearNextLabel.textContent = "MAX";
        }
    }
};
