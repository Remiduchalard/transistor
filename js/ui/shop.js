/**
 * js/ui/shop.js — Handles the machines and upgrades lists with performance optimization
 */

UI.Shop = {
    machineEls: {}, // machineId -> { card, costArea, rdBtn, count, prodTotal, infoBtn, tags }
    upgradeEls: {}, // upgradeId -> { element, name, desc, cost }
    
    init() {
        Events.on('shopUpdated', () => this.update());
        this.initBulkButtons();
        this.initSellButtons();
        
        // Initial build
        this.fullRefresh();
    },

    fullRefresh() {
        this.machineEls = {};
        this.upgradeEls = {};
        this.renderMachines();
        this.renderUpgrades();
    },

    update() {
        this.updateMachines();
        this.updateUpgrades();
    },

    initBulkButtons() {
        document.querySelectorAll(".qty-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                UI.buyQty = parseInt(btn.dataset.qty);
                this.updateMachines();
                // update active state in UI
                document.querySelectorAll(".qty-btn").forEach(b => b.classList.toggle("active", parseInt(b.dataset.qty) === UI.buyQty));
            });
        });
    },

    initSellButtons() {
        document.querySelectorAll(".sell-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const amount = btn.dataset.amount;
                const qty = amount === "max" ? "max" : parseInt(amount);
                const revenue = Game.sell(qty);
                if (revenue > 0) {
                    UI.updateStats();
                    Events.emit("notify", { message: I18n.t("sold_for", { val: UI.formatMoney(revenue) }), type: "sell" });
                }
            });
        });
    },

    // === Machines ===

    renderMachines() {
        const container = UI.els.machinesList;
        if (!container) return;
        container.innerHTML = "";
        
        MACHINES.forEach((machine, index) => {
            const card = document.createElement("div");
            card.className = "machine-card hidden";
            card.dataset.id = machine.id;
            
            card.innerHTML = `
                <div class="machine-icon-wrapper">
                    <div class="machine-icon">${machine.icon}</div>
                    <button class="machine-info-btn">?</button>
                </div>
                <div class="machine-info">
                    <div class="machine-name-row">
                        <span class="machine-name"></span>
                        <span class="early-tag hidden">Future</span>
                    </div>
                    <div class="machine-desc"></div>
                    <div class="machine-stats">
                        <span class="machine-stat production"></span>
                        <span class="machine-stat year-tag">${machine.unlockYear}</span>
                    </div>
                </div>
                <div class="machine-cost-area"></div>
            `;

            // Info button
            const infoBtn = card.querySelector(".machine-info-btn");
            infoBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const existing = card.querySelector(".machine-real-info");
                if (existing) {
                    existing.remove();
                } else {
                    const infoEl = document.createElement("div");
                    infoEl.className = "machine-real-info";
                    const realInfo = I18n.t(`machine_${index}_real`);
                    const rdInfo = I18n.t(`machine_${index}_rd`);
                    infoEl.innerText = realInfo + (rdInfo ? "\n\n" + rdInfo : "");
                    card.appendChild(infoEl);
                }
            });

            // Card click for buying
            card.addEventListener("click", () => {
                if (!Game.unlockedRD[machine.id]) return;
                const bought = Game.buyMachine(machine.id, UI.buyQty);
                if (bought > 0) {
                    this.update();
                    UI.updateStats();
                } else {
                    Events.emit("notify", { message: I18n.t("insufficient_funds"), type: "error" });
                }
            });

            container.appendChild(card);
            
            this.machineEls[machine.id] = {
                card,
                name: card.querySelector(".machine-name"),
                earlyTag: card.querySelector(".early-tag"),
                desc: card.querySelector(".machine-desc"),
                prod: card.querySelector(".machine-stat.production"),
                costArea: card.querySelector(".machine-cost-area"),
                index
            };
        });
        
        this.updateMachines();
    },

    updateMachines() {
        let canAfford10 = false;
        let canAfford100 = false;
        let canAfford1000 = false;

        MACHINES.forEach((machine) => {
            const els = this.machineEls[machine.id];
            if (!els) return;

            const owned = Game.ownedMachines[machine.id] || 0;
            const visible = Game.currentYear >= machine.unlockYear - 10;
            const isEarly = Game.currentYear < machine.unlockYear;
            const rdDone = !!Game.unlockedRD[machine.id];
            
            if (!visible) {
                els.card.classList.add("hidden");
                return;
            }
            els.card.classList.remove("hidden");
            
            // Affordability for bulk buttons
            if (rdDone) {
                if (Game.money.gte(getBulkMachineCost(machine, owned, 10, Game.currentYear))) canAfford10 = true;
                if (Game.money.gte(getBulkMachineCost(machine, owned, 100, Game.currentYear))) canAfford100 = true;
                if (Game.money.gte(getBulkMachineCost(machine, owned, 1000, Game.currentYear))) canAfford1000 = true;
            }

            // Update text content (Translations)
            els.name.textContent = I18n.t(`machine_${els.index}_name`);
            els.desc.textContent = I18n.t(`machine_${els.index}_desc`);
            els.prod.textContent = I18n.t("per_year", { val: UI.formatNumber(new Decimal(machine.baseProduction).mul(CONFIG.DISPLAY_MULTIPLIER)) });
            els.earlyTag.classList.toggle("hidden", !isEarly);

            // Cost area & Classes
            const currentRDCost = getDynamicRDCost(machine, Game.currentYear);
            const rdAffordable = Game.money.gte(currentRDCost);
            const singleCost = getMachineCost(machine, owned, Game.currentYear);
            const canAffordAtLeastOne = Game.money.gte(singleCost);

            els.card.classList.remove("locked", "needs-rd", "affordable", "early-access");
            if (isEarly) els.card.classList.add("early-access");

            if (!rdDone) {
                if (!rdAffordable && isEarly) {
                    els.card.classList.add("locked");
                } else {
                    els.card.classList.add("needs-rd");
                    if (rdAffordable) els.card.classList.add("affordable");
                }
                
                const earlyLabel = isEarly ? `<div class="early-warning">Avance : +${Math.round((Math.pow(2, machine.unlockYear - Game.currentYear) - 1)*100)}%</div>` : "";
                els.costArea.innerHTML = `
                    ${earlyLabel}
                    <div class="machine-rd-cost">R&D: ${UI.formatMoney(currentRDCost)}</div>
                    <button class="machine-rd-btn ${rdAffordable ? "" : "locked"}">${I18n.t("research") || "Rechercher"}</button>
                    <div class="machine-base-cost">${I18n.t("machine_price_label")}${UI.formatMoney(machine.baseCost)}</div>
                `;
                
                const rdBtn = els.costArea.querySelector(".machine-rd-btn");
                rdBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (Game.unlockRD(machine.id)) {
                        this.update();
                        UI.updateStats();
                        Events.emit("notify", { message: I18n.t("rd_done", { val: els.name.textContent }), type: "unlock" });
                    } else {
                        Events.emit("notify", { message: I18n.t("insufficient_funds"), type: "error" });
                    }
                };
            } else {
                if (canAffordAtLeastOne) els.card.classList.add("affordable");
                
                const bulkCost = getBulkMachineCost(machine, owned, UI.buyQty, Game.currentYear);
                const earlyLabel = isEarly ? `<div class="early-warning">Avance : +${Math.round((Math.pow(2, machine.unlockYear - Game.currentYear) - 1)*100)}%</div>` : "";
                const costLabel = UI.buyQty > 1 ? `${UI.formatMoney(bulkCost)} (x${UI.buyQty})` : UI.formatMoney(bulkCost);
                const totalProd = new Decimal(machine.baseProduction).mul(owned);

                els.costArea.innerHTML = `
                    ${earlyLabel}
                    <div class="machine-cost">${costLabel}</div>
                    ${owned > 0 ? `<div class="machine-count">x${owned}</div>` : ""}
                    ${owned > 0 ? `<div class="machine-production-total">Total: ${I18n.t("per_year", { val: UI.formatNumber(totalProd.mul(CONFIG.DISPLAY_MULTIPLIER)) })}</div>` : ""}
                `;
            }
        });

        // Bulk buttons visibility
        const selector = document.getElementById("buy-qty-selector");
        if (selector) {
            if (!canAfford10) {
                selector.style.display = "none";
                UI.buyQty = 1;
            } else {
                selector.style.display = "flex";
                selector.querySelector('[data-qty="10"]').style.display = canAfford10 ? "" : "none";
                selector.querySelector('[data-qty="100"]').style.display = canAfford100 ? "" : "none";
                selector.querySelector('[data-qty="1000"]').style.display = canAfford1000 ? "" : "none";
                
                if (UI.buyQty === 1000 && !canAfford1000) UI.buyQty = 100;
                if (UI.buyQty === 100 && !canAfford100) UI.buyQty = 10;
                if (UI.buyQty === 10 && !canAfford10) UI.buyQty = 1;
            }
            document.querySelectorAll(".qty-btn").forEach(btn => btn.classList.toggle("active", parseInt(btn.dataset.qty) === UI.buyQty));
        }
    },

    // === Upgrades ===

    renderUpgrades() {
        const container = UI.els.upgradesList;
        if (!container) return;
        container.innerHTML = "";

        UPGRADES.forEach((upgrade, index) => {
            const item = document.createElement("div");
            item.className = "upgrade-item hidden";
            item.dataset.id = upgrade.id;
            
            item.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name"></div>
                    <div class="upgrade-desc"></div>
                </div>
                <div class="upgrade-cost"></div>
            `;

            item.addEventListener("click", () => {
                if (Game.purchasedUpgrades.has(upgrade.id)) return;
                if (Game.currentYear < upgrade.unlockYear) {
                    Events.emit("notify", { message: I18n.t("req_year", { val: upgrade.unlockYear }), type: "error" });
                    return;
                }
                if (Game.money.lt(upgrade.cost)) {
                    Events.emit("notify", { message: I18n.t("insufficient_funds"), type: "error" });
                    return;
                }
                if (Game.buyUpgrade(upgrade.id)) {
                    this.update();
                    UI.updateStats();
                    Events.emit("notify", { message: I18n.t("upgrade_bought", { val: I18n.t(`upg_${index}_name`) }), type: "unlock" });
                }
            });

            container.appendChild(item);
            this.upgradeEls[upgrade.id] = {
                element: item,
                name: item.querySelector(".upgrade-name"),
                desc: item.querySelector(".upgrade-desc"),
                cost: item.querySelector(".upgrade-cost"),
                index
            };
        });
        
        this.updateUpgrades();
    },

    updateUpgrades() {
        // For autosell: find the current tier owned and only show the next one
        const autosellUpgrades = UPGRADES.filter(u => u.type === "autosell");
        let currentAutoTier = 0;
        for (const u of autosellUpgrades) {
            if (Game.purchasedUpgrades.has(u.id)) {
                currentAutoTier = Math.max(currentAutoTier, u.tier);
            }
        }
        const nextAutoSell = autosellUpgrades.find(u => u.tier === currentAutoTier + 1);

        UPGRADES.forEach((upgrade) => {
            const els = this.upgradeEls[upgrade.id];
            if (!els) return;

            const purchased = Game.purchasedUpgrades.has(upgrade.id);
            const unlocked = Game.currentYear >= upgrade.unlockYear;
            const affordable = Game.money.gte(upgrade.cost);

            // Visibility logic
            let visible = false;
            if (upgrade.type === "autosell") {
                if (purchased && upgrade.tier === currentAutoTier) visible = true;
                else if (upgrade === nextAutoSell && Game.currentYear >= upgrade.unlockYear - 5) visible = true;
            } else {
                if (purchased) visible = true;
                else if (Game.currentYear >= upgrade.unlockYear - 5) visible = true;
            }

            if (!visible) {
                els.element.classList.add("hidden");
                return;
            }
            els.element.classList.remove("hidden");

            // Classes
            els.element.classList.toggle("purchased", purchased);
            els.element.classList.toggle("locked", !purchased && (!unlocked || !affordable));

            // Content
            const name = I18n.t(`upg_${els.index}_name`);
            els.name.textContent = (purchased ? "✅ " : "") + name;
            
            let extraInfo = "";
            if (!purchased) {
                if (!unlocked) {
                    extraInfo = ` <br><span style="font-size:0.75rem; color: var(--red); font-weight: bold;">${I18n.t("req_year", { val: upgrade.unlockYear })}</span>`;
                } else if (!affordable) {
                    // Optional: could add explicit "Fonds insuffisants" but usually the cost being red is enough.
                    // We'll leave it empty to just rely on the .locked class grey-out.
                }
            }
            els.desc.innerHTML = I18n.t(`upg_${els.index}_desc`) + extraInfo;
            els.cost.textContent = purchased ? "" : UI.formatMoney(upgrade.cost);
            if (!purchased && !affordable && unlocked) els.cost.style.color = "var(--red)";
            else els.cost.style.color = "";
            
            // Sorting via flex order
            let baseOrder = purchased ? 10000 : 0;
            if (upgrade.type === "offline_prod") baseOrder += 1000;
            else if (upgrade.type === "autosell") baseOrder += 2000;
            else if (upgrade.type === "click_multiplier") baseOrder += 3000;
            
            els.element.style.order = baseOrder + els.index;
        });
    }
};
