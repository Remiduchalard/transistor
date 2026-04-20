/**
 * ui.js — All DOM manipulation and UI updates
 */

const UI = {
    // Cached DOM elements
    els: {},
    buyQty: 1,

    init() {
        this.els = {
            stock: document.getElementById("stock"),
            totalTransistors: document.getElementById("total-transistors"),
            perYear: document.getElementById("per-year"),
            money: document.getElementById("money"),
            stickyMoney: document.getElementById("sticky-money"),
            stickyPerYear: document.getElementById("sticky-per-year"),
            unitPrice: document.getElementById("unit-price"),
            playTime: document.getElementById("play-time"),
            currentYear: document.getElementById("current-year"),
            eraName: document.getElementById("era-name"),
            clickBtn: document.getElementById("click-btn"),
            clickPowerDisplay: document.getElementById("click-power-display"),
            floatingNumbers: document.getElementById("floating-numbers"),
            machinesList: document.getElementById("machines-list"),
            upgradesList: document.getElementById("upgrades-list"),
            notifications: document.getElementById("notifications"),
            milestonePopup: document.getElementById("milestone-popup"),
            milestoneTitle: document.getElementById("milestone-title"),
            milestoneText: document.getElementById("milestone-text"),
            milestoneClose: document.getElementById("milestone-close"),
            worldProd: document.getElementById("world-prod"),
            marketShare: document.getElementById("market-share"),
            yearTotalProduced: document.getElementById("year-total-produced"),
            yearProgressFill: document.getElementById("year-progress-fill"),
            yearNextLabel: document.getElementById("year-next-label"),
            nextYearDisplay: document.getElementById("next-year-display"),
            botPlanner: document.getElementById("bot-planner"),
            botNextAction: document.getElementById("bot-next-action"),
            boostProgressText: document.getElementById("boost-progress-text"),
            boostProgressBar: document.getElementById("boost-progress-bar"),
            useBoostBtn: document.getElementById("use-boost-btn"),
            boostStock: document.getElementById("boost-stock"),
            boostActiveDisplay: document.getElementById("boost-active-display"),
            boostTimer: document.getElementById("boost-timer"),
        };
    },

    setBotNextAction(text) {
        if (!text) {
            this.els.botPlanner.classList.add("hidden");
        } else {
            this.els.botPlanner.classList.remove("hidden");
            this.els.botNextAction.textContent = text;
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

    // === Number Formatting ===

    formatNumber(val) {
        const d = new Decimal(val);
        if (d.eq(0)) return "0";
        if (d.lt(0)) return "-" + this.formatNumber(d.abs());

        const suffixes = [
            { value: new Decimal(1e93), suffix: " Tg" },
            { value: new Decimal(1e90), suffix: " Nv" },
            { value: new Decimal(1e87), suffix: " Ov" },
            { value: new Decimal(1e84), suffix: " Spv" },
            { value: new Decimal(1e81), suffix: " Sxv" },
            { value: new Decimal(1e78), suffix: " Qiv" },
            { value: new Decimal(1e75), suffix: " Qav" },
            { value: new Decimal(1e72), suffix: " Tv" },
            { value: new Decimal(1e69), suffix: " Dv" },
            { value: new Decimal(1e66), suffix: " Uv" },
            { value: new Decimal(1e63), suffix: " V" },
            { value: new Decimal(1e60), suffix: " Nd" },
            { value: new Decimal(1e57), suffix: " Od" },
            { value: new Decimal(1e54), suffix: " Spd" },
            { value: new Decimal(1e51), suffix: " Sxd" },
            { value: new Decimal(1e48), suffix: " Qid" },
            { value: new Decimal(1e45), suffix: " Qad" },
            { value: new Decimal(1e42), suffix: " Td" },
            { value: new Decimal(1e39), suffix: " Dd" },
            { value: new Decimal(1e36), suffix: " Ud" },
            { value: new Decimal(1e33), suffix: " Dc" },
            { value: new Decimal(1e30), suffix: " Nn" },
            { value: new Decimal(1e27), suffix: " Oc" },
            { value: new Decimal(1e24), suffix: " Sp" },
            { value: new Decimal(1e21), suffix: " Sx" },
            { value: new Decimal(1e18), suffix: " Qi" },
            { value: new Decimal(1e15), suffix: " Qa" },
            { value: new Decimal(1e12), suffix: " T" },
            { value: new Decimal(1e9), suffix: " G" },
            { value: new Decimal(1e6), suffix: " M" },
            { value: new Decimal(1e3), suffix: " K" },
        ];

        for (const { value, suffix } of suffixes) {
            if (d.gte(value)) {
                const display = d.div(value).toNumber();
                return display.toFixed(display < 10 ? 2 : display < 100 ? 1 : 0) + suffix;
            }
        }

        return d.floor().toNumber().toLocaleString("fr-FR");
    },

    formatMoney(val) {
        const d = new Decimal(val);
        if (d.gte(1e3)) return "$" + this.formatNumber(d);
        if (d.gte(1)) return "$" + d.toNumber().toFixed(2);
        if (d.gte(0.01)) return "$" + d.toNumber().toFixed(4);
        if (d.gte(0.0001)) return "$" + d.toNumber().toFixed(6);
        if (d.gt(0)) return "$" + d.toExponential(2);
        return "$0.00";
    },

    formatPrice(val) {
        const d = new Decimal(val);
        if (d.gte(1)) return "$" + d.toNumber().toFixed(2);
        if (d.gte(0.01)) return "$" + d.toNumber().toFixed(4);
        if (d.gte(0.0001)) return "$" + d.toNumber().toFixed(6);
        if (d.gt(0)) return "$" + d.toExponential(2);
        return "$0.00";
    },

    formatTime(ms) {
        if (ms === undefined || ms === null) return "—";
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    },

    // === Stats Update ===

    updateStats() {
        const fullAutoSell = Game.autoSellRate >= 1;

        // Stock + sell section: hide only when 100% auto-sell
        this.els.stock.parentElement.style.display = fullAutoSell ? "none" : "";
        const sellBtnMax = document.getElementById("sell-btn-max");
        if (sellBtnMax) sellBtnMax.style.display = fullAutoSell ? "none" : "";

        this.els.stock.textContent = this.formatNumber(Game.transistors);
        this.els.perYear.textContent = this.formatNumber(Game.productionPerYear) + "/an";
        this.els.money.textContent = this.formatMoney(Game.money);
        if (this.els.stickyMoney) this.els.stickyMoney.textContent = this.els.money.textContent;
        if (this.els.stickyPerYear) this.els.stickyPerYear.textContent = this.els.perYear.textContent;
        this.els.unitPrice.textContent = this.formatPrice(Game.getEffectivePrice());
        this.els.playTime.textContent = this.formatTime(Game.virtualElapsed);
        this.els.clickPowerDisplay.textContent = `+${this.formatNumber(Game.clickPower)} par clic`;
        const worldProdValue = new Decimal(_worldProd(Game.currentYear));
        this.els.worldProd.textContent = this.formatNumber(worldProdValue) + "/an";

        // Market share
        if (worldProdValue.gt(0) && Game.productionPerYear.gt(0)) {
            const share = Game.productionPerYear.div(worldProdValue).mul(100);
            if (share.gte(100)) {
                this.els.marketShare.textContent = this.formatNumber(share) + "%";
            } else if (share.gte(1)) {
                this.els.marketShare.textContent = share.toNumber().toFixed(1) + "%";
            } else if (share.gte(0.01)) {
                this.els.marketShare.textContent = share.toNumber().toFixed(3) + "%";
            } else {
                this.els.marketShare.textContent = share.toExponential(1).replace("e-", "e-") + "%";
            }
        } else {
            this.els.marketShare.textContent = "0%";
        }

        // Boost UI
        this.els.boostProgressText.textContent = Game.purchaseCounter + " / 100";
        this.els.boostProgressBar.style.width = Game.purchaseCounter + "%";
        
        if (Game.boostMs > 0) {
            this.els.boostActiveDisplay.style.display = "block";
            this.els.boostTimer.textContent = (Game.boostMs / 1000).toFixed(1);
        } else {
            this.els.boostActiveDisplay.style.display = "none";
        }
        
        if (Game.consumables > 0) {
            this.els.useBoostBtn.style.display = "block";
            this.els.boostStock.textContent = Game.consumables;
        } else {
            this.els.useBoostBtn.style.display = "none";
        }

        // Year
        const yearEl = this.els.currentYear;
        if (yearEl.textContent !== String(Game.currentYear)) {
            yearEl.textContent = Game.currentYear;
            yearEl.classList.remove("year-advance");
            void yearEl.offsetWidth; // reflow
            yearEl.classList.add("year-advance");
        }

        // Era
        const era = getCurrentEra(Game.currentYear);
        this.els.eraName.textContent = era.name;

        // Year progress
        const yp = getYearProgress(Game.totalTransistors);
        this.els.yearTotalProduced.textContent = this.formatNumber(Game.totalTransistors);
        this.els.yearProgressFill.style.width = (yp.progress * 100).toFixed(1) + "%";
        
        const advancedTotalEl = document.getElementById("total-transistors-advanced");
        if (advancedTotalEl) advancedTotalEl.textContent = this.formatNumber(Game.totalTransistors);
        
        // Exact numbers for Settings tab
        document.querySelectorAll(".exact-total-produced").forEach(el => {
            el.textContent = new Decimal(Game.totalTransistors).floor().toNumber().toLocaleString("fr-FR");
        });
        document.querySelectorAll(".exact-per-year").forEach(el => {
            el.textContent = new Decimal(Game.productionPerYear).floor().toNumber().toLocaleString("fr-FR");
        });
        
        if (yp.needed > 0) {
            this.els.yearNextLabel.textContent = this.formatNumber(yp.needed);
        } else {
            this.els.yearNextLabel.textContent = "MAX";
        }
    },

    // === Floating Click Numbers ===

    spawnFloatingNumber(amount) {
        const el = document.createElement("div");
        el.className = "float-number";
        el.textContent = "+" + this.formatNumber(amount);
        el.style.left = (Math.random() * 160 + 30) + "px";
        el.style.top = "-20px";
        this.els.floatingNumbers.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    },

    // === Click Button Pulse ===

    pulseClickBtn() {
        this.els.clickBtn.classList.remove("pulse");
        void this.els.clickBtn.offsetWidth;
        this.els.clickBtn.classList.add("pulse");
    },

    // === Machines List ===

    renderMachines() {
        const container = this.els.machinesList;
        container.innerHTML = "";
        const qty = this.buyQty;

        for (const machine of MACHINES) {
            const owned = Game.ownedMachines[machine.id] || 0;
            const bulkCost = getBulkMachineCost(machine, owned, qty, Game.currentYear);
            
            // Machines are visible if they are historical or within 10 years of release
            const visible = Game.currentYear >= machine.unlockYear - 10;
            if (!visible) continue;

            const unlocked = Game.currentYear >= machine.unlockYear;
            const rdDone = !!Game.unlockedRD[machine.id];
            const affordable = Game.money >= bulkCost;
            
            const currentRDCost = getDynamicRDCost(machine, Game.currentYear);
            const rdAffordable = Game.money >= currentRDCost;
            
            const totalProd = machine.baseProduction * owned;

            const card = document.createElement("div");
            card.className = "machine-card";
            card.dataset.tier = machine.tier;
            card.dataset.id = machine.id;

            const isEarly = Game.currentYear < machine.unlockYear;

            // Reset classes
            card.className = "machine-card";
            if (machine.id !== "hand") card.dataset.tier = machine.tier;
            card.dataset.id = machine.id;

            if (!rdDone && !rdAffordable && isEarly) {
                card.classList.add("locked");
            } else if (!rdDone) {
                card.classList.add("needs-rd");
                if (rdAffordable) card.classList.add("affordable");
                if (isEarly) card.classList.add("early-access");
            } else {
                if (affordable) card.classList.add("affordable");
                if (isEarly) card.classList.add("early-access");
            }

            let costAreaHtml;
            const earlyLabel = isEarly ? `<div class="early-warning">Avance : +${Math.round((Math.pow(2, machine.unlockYear - Game.currentYear) - 1)*100)}%</div>` : "";
            
            if (!rdDone) {
                // Show R&D cost (potentially dynamic)
                costAreaHtml = `
                    <div class="machine-cost-area">
                        ${earlyLabel}
                        <div class="machine-rd-cost">R&D: ${this.formatMoney(currentRDCost)}</div>
                        <button class="machine-rd-btn ${rdAffordable ? "" : "locked"}">Rechercher</button>
                    </div>
                `;
            } else {
                const costLabel = qty > 1 ? `${this.formatMoney(bulkCost)} (x${qty})` : this.formatMoney(bulkCost);
                costAreaHtml = `
                    <div class="machine-cost-area">
                        ${earlyLabel}
                        <div class="machine-cost">${costLabel}</div>
                        ${owned > 0 ? `<div class="machine-count">x${owned}</div>` : ""}
                        ${owned > 0 ? `<div class="machine-production-total">Total: ${this.formatNumber(totalProd)}/an</div>` : ""}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="machine-icon-wrapper">
                    <div class="machine-icon">${machine.icon}</div>
                    <button class="machine-info-btn">?</button>
                </div>
                <div class="machine-info">
                    <div class="machine-name">${machine.name} ${isEarly ? '<span class="early-tag">Future</span>' : ''}</div>
                    <div class="machine-desc">${machine.desc}</div>
                    <div class="machine-stats">
                        <span class="machine-stat production">${this.formatNumber(machine.baseProduction)}/an</span>
                        <span class="machine-stat year-tag">${machine.unlockYear}</span>
                    </div>
                </div>
                ${costAreaHtml}
            `;

            // "?" button toggles info panel with both realInfo and rdInfo
            const infoBtn = card.querySelector(".machine-info-btn");
            if (infoBtn) {
                infoBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const existing = card.querySelector(".machine-real-info");
                    if (existing) {
                        existing.remove();
                    } else {
                        const infoEl = document.createElement("div");
                        infoEl.className = "machine-real-info";
                        let infoText = machine.realInfo;
                        if (machine.rdInfo) {
                            infoText += "\n\n" + machine.rdInfo;
                        }
                        infoEl.innerText = infoText;
                        card.appendChild(infoEl);
                    }
                });
            }

            // R&D button click
            const rdBtn = card.querySelector(".machine-rd-btn");
            if (rdBtn) {
                rdBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (Game.unlockRD(machine.id)) {
                        this.renderMachines();
                        this.updateStats();
                        this.notify(`R&D terminée : ${machine.name}`, "unlock");
                    }
                });
            }

            // Buy on card click (only if R&D done)
            if (rdDone) {
                card.addEventListener("click", () => {
                    const bought = Game.buyMachine(machine.id, qty);
                    if (bought > 0) {
                        this.renderMachines();
                        this.renderUpgrades();
                        this.updateStats();
                    }
                });
            }

            container.appendChild(card);
        }
    },

    // === Upgrades List ===

    renderUpgrades() {
        const container = this.els.upgradesList;
        container.innerHTML = "";

        // For autosell: find the current tier owned and only show the next one
        const autosellUpgrades = UPGRADES.filter(u => u.type === "autosell");
        let currentAutoTier = 0;
        for (const u of autosellUpgrades) {
            if (Game.purchasedUpgrades.has(u.id)) {
                currentAutoTier = Math.max(currentAutoTier, u.tier);
            }
        }
        const nextAutoSell = autosellUpgrades.find(u => u.tier === currentAutoTier + 1);

        const available = UPGRADES.filter(u => {
            // Autosell: only show current owned tier (as purchased) or next tier
            if (u.type === "autosell") {
                if (Game.purchasedUpgrades.has(u.id) && u.tier === currentAutoTier) return true;
                if (u === nextAutoSell && Game.currentYear >= u.unlockYear - 5) return true;
                return false;
            }
            if (Game.purchasedUpgrades.has(u.id)) return true;
            return Game.currentYear >= u.unlockYear - 5;
        });

        for (const upgrade of available) {
            const purchased = Game.purchasedUpgrades.has(upgrade.id);
            const unlocked = Game.currentYear >= upgrade.unlockYear;
            const affordable = Game.money >= upgrade.cost;

            const item = document.createElement("div");
            item.className = "upgrade-item";
            item.dataset.id = upgrade.id;
            if (purchased) item.classList.add("purchased");
            else if (!unlocked || !affordable) item.classList.add("locked");

            item.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">${purchased ? "✅ " : ""}${upgrade.name}</div>
                    <div class="upgrade-desc">${upgrade.desc}${!unlocked ? ` (${upgrade.unlockYear})` : ""}</div>
                </div>
                ${!purchased ? `<div class="upgrade-cost">${this.formatMoney(upgrade.cost)}</div>` : ""}
            `;

            if (!purchased && unlocked) {
                item.addEventListener("click", () => {
                    if (Game.buyUpgrade(upgrade.id)) {
                        this.renderUpgrades();
                        this.renderMachines();
                        this.updateStats();
                        this.notify(`Amélioration achetée : ${upgrade.name}`, "unlock");
                    }
                });
            }

            container.appendChild(item);
        }
    },

    // === Sell Buttons ===

    initSellButtons() {
        const buttons = document.querySelectorAll(".sell-btn");
        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                const amount = btn.dataset.amount;
                const qty = amount === "max" ? "max" : parseInt(amount);
                const revenue = Game.sell(qty);
                if (revenue > 0) {
                    this.updateStats();
                    this.notify(`Vendu ! +${this.formatMoney(revenue)}`, "sell");
                }
            });
        });
    },

    // === Notifications ===

    notify(message, type = "") {
        const el = document.createElement("div");
        el.className = "notification " + type;
        el.textContent = message;
        this.els.notifications.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    },

    // === Milestone Popup ===

    showMilestone(title, text) {
        this.els.milestoneTitle.textContent = title;
        this.els.milestoneText.textContent = text;
        this.els.milestonePopup.classList.remove("hidden");
    },

    initMilestoneClose() {
        this.els.milestoneClose.addEventListener("click", () => {
            this.els.milestonePopup.classList.add("hidden");
        });
    },

    showAchievement(id) {
        const popup = document.getElementById("achievement-popup");
        if (popup) {
            popup.classList.remove("hidden");
            // Auto hide after 10s
            setTimeout(() => {
                popup.classList.add("hidden");
            }, 10000);
        }
    },

    // === Check for new machine unlocks ===

    checkUnlocks(oldYear, newYear) {
        if (newYear <= oldYear) return;

        for (const machine of MACHINES) {
            if (machine.unlockYear > oldYear && machine.unlockYear <= newYear) {
                this.notify(`🔓 Nouveau : ${machine.name} (${machine.unlockYear})`, "unlock");
            }
        }

        // Check era changes
        const oldEra = getCurrentEra(oldYear);
        const newEra = getCurrentEra(newYear);
        if (newEra.startYear !== oldEra.startYear) {
            this.showMilestone(newEra.name, newEra.desc);
            this.notify(`Nouvelle ère : ${newEra.name}`, "era");
        }
    },
};
