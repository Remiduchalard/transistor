/**
 * js/bot.js — ROI-based automated player with target caching & batched rendering
 */

const Bot = {
    active: false,
    needsRecalculation: true,
    currentTarget: null,
    clickAccumulator: 0,
    sellAccumulator: 0,
    CLICK_INTERVAL: 500,
    SELL_INTERVAL: 3000,
    CLICK_STOP: 10_000,

    init() {
        // Whenever the shop updates externally (e.g., player buys manually, year changes),
        // we invalidate the bot's target cache to force a recalculation on the next tick.
        Events.on('shopUpdated', () => {
            this.needsRecalculation = true;
        });
    },

    toggle() {
        this.active = !this.active;
        const txt = this.active ? I18n.t("settings_bot_off") || "Désactiver le Bot" : I18n.t("settings_bot") || "Activer le Bot";
        const col = this.active ? "var(--red)" : "var(--green)";
        const statusTxt = this.active ? I18n.t("settings_bot_status_on") || "Actif" : I18n.t("settings_bot_status_off") || "Inactif";
        const cls = this.active ? "bot-status-on" : "bot-status-off";

        [document.getElementById("bot-toggle-btn"), document.getElementById("bot-toggle-btn-mobile")].forEach(b => {
            if (b) {
                b.textContent = txt;
                b.style.borderColor = col;
                b.style.color = col;
            }
        });

        [document.getElementById("bot-status"), document.getElementById("bot-status-mobile")].forEach(s => {
            if (s) {
                s.textContent = statusTxt;
                s.className = cls;
            }
        });

        if (this.active) {
            Game.usedAssistance = true;
            this.clickAccumulator = 0;
            this.sellAccumulator = 0;
            this.needsRecalculation = true;
        } else {
            this.setNextActionLabel(null);
        }
    },

    setNextActionLabel(text) {
        const planner = document.getElementById("bot-planner");
        const actionEl = document.getElementById("bot-next-action");
        if (!text) {
            planner.classList.add("hidden");
        } else {
            planner.classList.remove("hidden");
            actionEl.textContent = text;
        }
    },

    highlightAction(type, id) {
        let el = null;
        if (type === "upgrade") {
            el = document.querySelector(`.upgrade-item[data-id="${id}"]`);
        } else if (type === "machine" || type === "rd") {
            el = document.querySelector(`.machine-card[data-id="${id}"]`);
        }

        if (el) {
            el.classList.add("bot-highlight");
            setTimeout(() => el.classList.remove("bot-highlight"), 400);
        }
    },

    tick(effectiveDeltaMs) {
        if (!this.active) return;

        // Auto-click
        if (Game.totalTransistors.lt(this.CLICK_STOP)) {
            this.clickAccumulator += effectiveDeltaMs;
            while (this.clickAccumulator >= this.CLICK_INTERVAL && Game.totalTransistors.lt(this.CLICK_STOP)) {
                Game.click();
                this.clickAccumulator -= this.CLICK_INTERVAL;
            }
        }

        // Auto-sell
        this.sellAccumulator += effectiveDeltaMs;
        if (this.sellAccumulator >= this.SELL_INTERVAL) {
            this.sellAccumulator -= this.SELL_INTERVAL;
            if (Game.transistors.gt(0)) {
                Game.sell("max");
            }
        }

        // Process ROI logic and queued purchases
        this.processInvestments();
    },

    findBestInvestment() {
        this.needsRecalculation = false;
        
        const unitPrice = Game.getEffectivePrice();
        const incomeFromProd = Game.productionPerYear.div(CONFIG.SECONDS_PER_YEAR).mul(unitPrice);
        let incomeFromClick = new Decimal(0);
        
        if (Game.totalTransistors.lt(this.CLICK_STOP)) {
            incomeFromClick = new Decimal(1000 / this.CLICK_INTERVAL).mul(Game.clickPower).mul(unitPrice);
        }
        const currentIncomePerSec = incomeFromProd.add(incomeFromClick);

        const investments = [];

        // Upgrades Analysis
        UPGRADES.forEach((upgrade, index) => {
            if (Game.purchasedUpgrades.has(upgrade.id)) return;
            if (Game.currentYear < upgrade.unlockYear) return;

            let gainPerSec = new Decimal(0);
            if (upgrade.type === "click_multiplier" && Game.totalTransistors.lt(this.CLICK_STOP)) {
                gainPerSec = Game.clickPower.mul(upgrade.value - 1).mul(1000 / this.CLICK_INTERVAL).mul(unitPrice);
            } else if (upgrade.type === "autosell") {
                gainPerSec = Game.productionPerYear.mul(upgrade.value - Game.autoSellRate).div(CONFIG.SECONDS_PER_YEAR).mul(unitPrice);
            } else if (upgrade.type === "offline_prod") {
                gainPerSec = incomeFromProd.mul(0.01);
            }

            if (gainPerSec.gt(0)) {
                investments.push({ type: "upgrade", id: upgrade.id, cost: new Decimal(upgrade.cost), gainPerSec, index });
            }
        });

        // Machines Analysis
        MACHINES.forEach((machine) => {
            if (Game.currentYear < machine.unlockYear - 10) return;
            
            const owned = Game.ownedMachines[machine.id] || 0;
            const gainPerSec = new Decimal(machine.baseProduction).div(CONFIG.SECONDS_PER_YEAR).mul(unitPrice);

            if (!Game.unlockedRD[machine.id]) {
                const rdCost = getDynamicRDCost(machine, Game.currentYear);
                const totalCost = rdCost.add(getMachineCost(machine, 0, Game.currentYear));
                investments.push({ type: "rd", id: machine.id, cost: totalCost, rdCost, gainPerSec });
            } else {
                const cost = getMachineCost(machine, owned, Game.currentYear);
                investments.push({ type: "machine", id: machine.id, cost, gainPerSec });
            }
        });

        if (investments.length === 0) {
            this.currentTarget = null;
            this.setNextActionLabel("Rien à faire");
            return;
        }

        // Score based on Waiting Time + Payback Time
        investments.forEach(inv => {
            const waitingTime = Game.money.gte(inv.cost) ? 0 : (currentIncomePerSec.gt(0) ? inv.cost.sub(Game.money).div(currentIncomePerSec).toNumber() : Infinity);
            const paybackTime = inv.gainPerSec.gt(0) ? inv.cost.div(inv.gainPerSec).toNumber() : Infinity;
            inv.score = waitingTime + paybackTime;
        });

        investments.sort((a, b) => a.score - b.score);
        this.currentTarget = investments[0];
    },

    processInvestments() {
        let iterations = 0;
        let maxIterations = Game.gameSpeed > 2 ? 50 : 1;
        if (Game.gameSpeed >= 500) maxIterations = 200;

        let madePurchases = false;

        while (iterations < maxIterations) {
            if (this.needsRecalculation) {
                this.findBestInvestment();
            }

            if (!this.currentTarget) break;

            const best = this.currentTarget;
            const isAffordable = (best.type === "rd") ? Game.money.gte(best.rdCost) : Game.money.gte(best.cost);

            // Dynamically update UI on the first frame only to avoid overhead
            if (iterations === 0) {
                let name = "Objet";
                if (best.type === "upgrade") name = I18n.t(`upg_${best.index}_name`);
                else name = MACHINES.find(m => m.id === best.id)?.name || "Usine";
                const verb = isAffordable ? "Achat de" : "Économie pour";
                this.setNextActionLabel(`${verb} : ${name}`);
            }

            if (!isAffordable) break;

            // Execute purchase
            let success = false;
            if (best.type === "upgrade") success = Game.buyUpgrade(best.id);
            else if (best.type === "machine") success = Game.buyMachine(best.id, 1) > 0;
            else if (best.type === "rd") success = Game.unlockRD(best.id);

            if (success) {
                this.highlightAction(best.type, best.id);
                madePurchases = true;
                
                // Target has been bought, force a recalculation on the next while iteration
                this.needsRecalculation = true; 
            } else {
                break;
            }

            iterations++;
        }

        // BATCH DOM UPDATES: ONLY trigger interface refresh once after all high-speed purchases are done
        if (madePurchases) {
            Events.emit('shopUpdated');
            Events.emit('statsUpdated');
        }
    }
};