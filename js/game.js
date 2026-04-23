/**
 * game.js — Core game state and logic
 */

const Game = {
    // State
    totalTransistors: new Decimal(0),      // Total ever produced (for year calculation)
    transistors: new Decimal(0),            // Current stock (can be sold)
    money: new Decimal(0),

    // Owned machines: { machineId: count }
    ownedMachines: {},

    // Purchased upgrades: Set of upgrade ids
    purchasedUpgrades: new Set(),

    // R&D unlocked machines: { machineId: true }
    unlockedRD: {},

    // Speed multiplier (affects production tick + stat time accounting)
    gameSpeed: 1,
    usedAssistance: false,        // tracked if bot or gameSpeed > 1 was ever used in this run

    // Boost variables
    consumables: 0,
    purchaseCounter: 0,
    boostMs: 0,                   // Remaining real-time ms for the x50 boost

    // Stats tracking (virtualElapsed = real time weighted by speed)
    startTime: Date.now(),
    virtualElapsed: 0,                    // accumulated game-time in ms
    decadeMilestones: {},                 // { "1950": {time, share, production}, ... }
    yearlyProduction: {},                 // { "1947": 1, "1948": 5, ... }
    lastRecordedDecade: 1940,
    lastRecordedYear: 1946,
    lastSavedTime: Date.now(),            // real-time ms timestamp for offline calc

    currentYear: 1947,
    previousYear: 1947,
    // Computed values
    clickPower: new Decimal(1),
    productionPerYear: new Decimal(0),
    autoSellRate: 0,           // fraction of stock sold per second (0-1)
    offlineRate: 0,            // fraction of production when game is closed

    // Accumulator for smooth production
    productionAccumulator: new Decimal(0),
    autoSellAccumulator: new Decimal(0),

    globals: { unlockedMusk: false, expertMode: false },

    saveGlobals() {
        localStorage.setItem("transistor_clicker_globals", JSON.stringify(this.globals));
    },

    loadGlobals() {
        const raw = localStorage.getItem("transistor_clicker_globals");
        if (raw) {
            try {
                this.globals = JSON.parse(raw);
                if (this.globals.expertMode === undefined) this.globals.expertMode = false;
                if (this.globals.devModeUnlocked === undefined) this.globals.devModeUnlocked = false;
            } catch (e) {}
        } else {
            this.globals = { unlockedMusk: false, expertMode: false, devModeUnlocked: false };
        }
    },

    /**
     * Initialize / reset game state
     */
    init(startingMoney = 0) {
        this.loadGlobals();
        this.totalTransistors = new Decimal(0);
        this.transistors = new Decimal(0);
        this.money = new Decimal(startingMoney);
        this.currentYear = 1947;
        this.previousYear = 1947;
        this.purchasedUpgrades = new Set();
        this.productionAccumulator = new Decimal(0);
        this.autoSellAccumulator = new Decimal(0);
        this.gameSpeed = 1;
        this.usedAssistance = false;
        this.consumables = 0;
        this.purchaseCounter = 0;
        this.boostMs = 0;
        this.startTime = Date.now();
        this.virtualElapsed = 0;
        this.decadeMilestones = {};
        this.yearlyProduction = {};
        this.lastRecordedDecade = 1940;
        this.lastRecordedYear = 1946;
        this.lastSavedTime = Date.now();
        this.ownedMachines = {};
        this.unlockedRD = {};
        for (const machine of MACHINES) {
            this.ownedMachines[machine.id] = 0;
            // Auto-unlock machines with no R&D cost
            if (machine.rdCost === 0) {
                this.unlockedRD[machine.id] = true;
            }
        }
        this.recalculate();
    },

    /**
     * Check and record decade milestones
     */
    checkDecadeMilestone() {
        const currentDecade = Math.floor(this.currentYear / 10) * 10;
        if (currentDecade > this.lastRecordedDecade) {
            for (let d = this.lastRecordedDecade + 10; d <= currentDecade; d += 10) {
                if (!this.decadeMilestones[d]) {
                    const worldProdValue = new Decimal(_worldProd(d));
                    const share = worldProdValue.gt(0) ? this.productionPerYear.div(worldProdValue).mul(100).toNumber() : 0;
                    this.decadeMilestones[d] = {
                        time: this.virtualElapsed,
                        share: share,
                        production: this.productionPerYear.toString() // Save as string for JSON
                    };
                    
                    // Analytics: Decade reached
                    if (typeof gtag === "function") {
                        gtag('event', 'level_up', {
                            'level': d,
                            'character': 'Decade Reached'
                        });
                    }
                }
            }
            this.lastRecordedDecade = currentDecade;
        }
        
        // Record yearly stats as well
        if (this.currentYear > this.lastRecordedYear) {
            for (let y = this.lastRecordedYear + 1; y <= this.currentYear; y++) {
                this.yearlyProduction[y] = {
                    prod: this.productionPerYear.toString(),
                    time: this.virtualElapsed
                };
            }
            this.lastRecordedYear = this.currentYear;
        }
    },

    /**
     * Recalculate all derived values
     */
    recalculate() {
        // Click power
        this.clickPower = new Decimal(CONFIG.CLICK_BASE);
        for (const upgrade of UPGRADES) {
            if (this.purchasedUpgrades.has(upgrade.id) && upgrade.type === "click_multiplier") {
                this.clickPower = this.clickPower.mul(upgrade.value);
            }
        }

        // Auto-sell rate (best tier owned)
        this.autoSellRate = 0;
        for (const upgrade of UPGRADES) {
            if (this.purchasedUpgrades.has(upgrade.id) && upgrade.type === "autosell") {
                this.autoSellRate = Math.max(this.autoSellRate, upgrade.value);
            }
        }

        // Offline rate
        this.offlineRate = 0;
        for (const upgrade of UPGRADES) {
            if (this.purchasedUpgrades.has(upgrade.id) && upgrade.type === "offline_prod") {
                this.offlineRate += upgrade.value;
            }
        }

        // Total production per year
        this.productionPerYear = new Decimal(0);
        for (const machine of MACHINES) {
            const owned = this.ownedMachines[machine.id] || 0;
            const machineProd = new Decimal(machine.baseProduction).mul(owned);
            this.productionPerYear = this.productionPerYear.add(machineProd);
        }

        // Year
        this.previousYear = this.currentYear;
        const newYear = computeYear(this.totalTransistors.toNumber());
        
        if (newYear > this.previousYear && this.autoSellRate > 0) {
            // Sell at end of year using the price of the year that just ended
            for (let y = this.previousYear; y < newYear; y++) {
                if (this.transistors.lte(0)) break;
                // Rough approximation of stock to sell per year elapsed
                // If skipping multiple years, sell a fraction per year, but simple is just selling all at once at previous year price?
                // Wait, if we want to be exact, we should do it correctly. 
                // But normally we only advance 1 year at a time.
                let toSell = this.transistors.mul(this.autoSellRate).floor();
                if (toSell.gt(0)) {
                    let unitPrice = getTransistorPrice(y);
                    this.transistors = this.transistors.sub(toSell);
                    this.money = this.money.add(toSell.mul(unitPrice));
                }
            }
        }
        
        this.currentYear = newYear;
    },

    /**
     * Increment purchase counter and award consumables
     */
    addPurchases(amount) {
        this.purchaseCounter += amount;
        while (this.purchaseCounter >= 100) {
            this.consumables++;
            this.purchaseCounter -= 100;
            Events.emit("notify", { message: I18n.t("boost_earned") || "🎁 Boost x50 gagné !", type: "bonus" });
        }
    },

    /**
     * Use a consumable to trigger the 1-minute x50 boost
     */
    useConsumable() {
        if (this.consumables > 0) {
            this.consumables--;
            this.boostMs += 60_000; // Adds 1 minute
            return true;
        }
        return false;
    },

    /**
     * Handle a click on the transistor button
     */
    click() {
        let produced = this.clickPower;
        if (this.boostMs > 0) {
            produced = produced.mul(50);
        }
        this.transistors = this.transistors.add(produced);
        this.totalTransistors = this.totalTransistors.add(produced);
        this.recalculate();
        return produced;
    },

    /**
     * Return effective time multiplier for external systems (like the Bot)
     */
    getEffectiveTimeMultiplier() {
        return this.gameSpeed * (this.boostMs > 0 ? 50 : 1);
    },

    /**
     * Game tick — called every TICK_INTERVAL ms
     */
    tick(deltaMs) {
        // Handle consumable boost timer (always real-time countdown regardless of gameSpeed)
        let boostMult = 1;
        if (this.boostMs > 0) {
            this.boostMs -= deltaMs;
            if (this.boostMs < 0) this.boostMs = 0;
            boostMult = 50;
        }

        // Apply game speed & boost
        const effectiveDelta = deltaMs * this.gameSpeed * boostMult;

        // Accumulate virtual elapsed time (for stats)
        this.virtualElapsed += effectiveDelta;

        // Convert production per year to production per ms
        const msPerYear = CONFIG.SECONDS_PER_YEAR * 1000;

        // Production
        if (this.productionPerYear.gt(0)) {
            const productionPerMs = this.productionPerYear.div(msPerYear);
            this.productionAccumulator = this.productionAccumulator.add(productionPerMs.mul(effectiveDelta));

            const produced = this.productionAccumulator.floor();
            if (produced.gt(0)) {
                this.productionAccumulator = this.productionAccumulator.sub(produced);
                this.transistors = this.transistors.add(produced);
                this.totalTransistors = this.totalTransistors.add(produced);
                this.recalculate();
            }
        }

        // Auto-sell tick logic removed

        return 0;
    },

    /**
     * Unlock R&D for a machine
     */
    unlockRD(machineId) {
        const machine = MACHINES.find(m => m.id === machineId);
        if (!machine) return false;
        if (this.unlockedRD[machineId]) return false;
        
        // Dynamic cost: can be unlocked early with a penalty
        const cost = getDynamicRDCost(machine, this.currentYear);
        if (this.money.lt(cost)) return false;

        this.money = this.money.sub(cost);
        this.unlockedRD[machineId] = true;
        this.addPurchases(1); // Gain 1 purchase towards consumable
        this.recalculate();
        return true;
    },

    /**
     * Buy N machines at once
     */
    buyMachine(machineId, qty = 1) {
        const machine = MACHINES.find(m => m.id === machineId);
        if (!machine) return 0;
        if (!this.unlockedRD[machineId]) return 0;

        let bought = 0;
        for (let i = 0; i < qty; i++) {
            const owned = this.ownedMachines[machineId] || 0;
            const cost = getMachineCost(machine, owned, this.currentYear);
            if (this.money.lt(cost)) break;
            this.money = this.money.sub(cost);
            this.ownedMachines[machineId] = owned + 1;
            bought++;
        }

        if (bought > 0) {
            this.addPurchases(bought); // Gain towards consumable
            this.recalculate();
            if (machineId === "terrafab" && this.ownedMachines[machineId] === 1 && !this.globals.unlockedMusk) {
                this.globals.unlockedMusk = true;
                this.saveGlobals();
                Events.emit("achievementUnlocked", "terrafab_musk");
            }
            if (machineId === "kuiper_mining" && this.ownedMachines[machineId] === 1 && !this.globals.unlockedWeyland) {
                this.globals.unlockedWeyland = true;
                this.saveGlobals();
                Events.emit("achievementUnlocked", "kuiper_weyland");
            }
        }
        return bought;
    },

    /**
     * Buy an upgrade
     */
    buyUpgrade(upgradeId) {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return false;
        if (this.purchasedUpgrades.has(upgradeId)) return false;
        if (this.money.lt(upgrade.cost)) return false;
        if (this.currentYear < upgrade.unlockYear) return false;

        this.money = this.money.sub(upgrade.cost);
        this.purchasedUpgrades.add(upgradeId);
        this.recalculate();
        return true;
    },

    /**
     * Sell transistors
     */
    sell(amount) {
        let amtToSell;
        if (amount === "max") amtToSell = this.transistors;
        else amtToSell = Decimal.min(new Decimal(amount), this.transistors);
        
        if (amtToSell.lte(0)) return 0;

        const unitPrice = getTransistorPrice(this.currentYear);
        const revenue = amtToSell.mul(unitPrice);

        this.transistors = this.transistors.sub(amtToSell);
        this.money = this.money.add(revenue);
        return revenue;
    },

    /**
     * Get effective sell price per transistor
     */
    getEffectivePrice() {
        return getTransistorPrice(this.currentYear);
    },

    /**
     * Check if year has changed
     */
    hasYearChanged() {
        return this.currentYear !== this.previousYear;
    },

    /**
     * Save game to localStorage
     */
    save() {
        this.lastSavedTime = Date.now();
        const data = {
            totalTransistors: this.totalTransistors.toString(),
            transistors: this.transistors.toString(),
            money: this.money.toString(),
            ownedMachines: this.ownedMachines,
            purchasedUpgrades: [...this.purchasedUpgrades],
            unlockedRD: this.unlockedRD,
            startTime: this.startTime,
            virtualElapsed: this.virtualElapsed,
            decadeMilestones: this.decadeMilestones,
            yearlyProduction: this.yearlyProduction,
            lastRecordedDecade: this.lastRecordedDecade,
            lastRecordedYear: this.lastRecordedYear,
            lastSavedTime: this.lastSavedTime,
            gameSpeed: this.gameSpeed,
            usedAssistance: this.usedAssistance,
            consumables: this.consumables,
            purchaseCounter: this.purchaseCounter,
            boostMs: this.boostMs,
        };
        localStorage.setItem("transistor_clicker_save", JSON.stringify(data));
    },

    /**
     * Load game from localStorage
     */
    load() {
        this.loadGlobals();
        const raw = localStorage.getItem("transistor_clicker_save");
        if (!raw) return false;

        try {
            const data = JSON.parse(raw);
            this.totalTransistors = new Decimal(data.totalTransistors || 0);
            this.transistors = new Decimal(data.transistors || 0);
            this.money = new Decimal(data.money || 0);

            if (data.ownedMachines) {
                for (const key of Object.keys(data.ownedMachines)) {
                    this.ownedMachines[key] = data.ownedMachines[key];
                }
            }

            if (data.purchasedUpgrades) {
                this.purchasedUpgrades = new Set(data.purchasedUpgrades);
            }

            if (data.unlockedRD) {
                this.unlockedRD = data.unlockedRD;
            }

            if (data.startTime) this.startTime = data.startTime;
            if (data.virtualElapsed !== undefined) this.virtualElapsed = data.virtualElapsed;
            if (data.decadeMilestones) this.decadeMilestones = data.decadeMilestones;
            if (data.yearlyProduction) this.yearlyProduction = data.yearlyProduction;
            if (data.lastRecordedDecade) this.lastRecordedDecade = data.lastRecordedDecade;
            if (data.lastRecordedYear) this.lastRecordedYear = data.lastRecordedYear;
            if (data.gameSpeed) this.gameSpeed = data.gameSpeed;
            if (data.usedAssistance !== undefined) this.usedAssistance = data.usedAssistance;
            this.consumables = data.consumables || 0;
            this.purchaseCounter = data.purchaseCounter || 0;
            this.boostMs = data.boostMs || 0;
            this.lastSavedTime = data.lastSavedTime || Date.now();

            this.recalculate(); // Need this first for offline logic

            // Process offline progress
            const now = Date.now();
            const offlineMs = now - this.lastSavedTime;
            let offlineData = null;

            // Only calculate if more than 10 seconds offline and offline rate > 0
            if (offlineMs > 10000 && this.offlineRate > 0 && this.productionPerYear.gt(0)) {
                const effectiveOfflineMs = offlineMs * this.gameSpeed;
                const msPerYear = CONFIG.SECONDS_PER_YEAR * 1000;
                
                const productionPerMs = this.productionPerYear.div(msPerYear);
                const totalProduced = productionPerMs.mul(effectiveOfflineMs).mul(this.offlineRate).floor();

                if (totalProduced.gt(0)) {
                    let remaining = new Decimal(totalProduced);
                    let startMoney = new Decimal(this.money);

                    while (remaining.gt(0)) {
                        const nextThreshold = CONFIG.YEAR_THRESHOLDS.find(t => t.year === this.currentYear + 1);
                        let step = remaining;
                        if (nextThreshold && this.totalTransistors.add(step).gt(nextThreshold.transistors)) {
                            step = new Decimal(nextThreshold.transistors).sub(this.totalTransistors);
                            if (step.lte(0)) step = new Decimal(1);
                        }
                        step = Decimal.min(step, remaining);

                        // If beyond all thresholds, take a larger step (e.g., 10%)
                        if (!nextThreshold && remaining.gt(100)) {
                            step = remaining.div(10).floor();
                            if (step.lte(0)) step = remaining;
                        }

                        this.transistors = this.transistors.add(step);
                        this.totalTransistors = this.totalTransistors.add(step);
                        remaining = remaining.sub(step);
                        
                        this.recalculate();
                    }

                    let earned = this.money.sub(startMoney);

                    // Add elapsed time so it counts in stats correctly
                    this.virtualElapsed += effectiveOfflineMs;

                    offlineData = {
                        offlineMs,
                        produced: totalProduced,
                        earned: earned,
                        rate: this.offlineRate
                    };
                }
            }

            this.lastSavedTime = now;
            return offlineData || true; // Returns object if progress happened, otherwise true
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    /**
     * Archive current run stats into history, then reset
     */
    archiveAndReset(startingMoney = 0) {
        const run = {
            date: new Date().toLocaleDateString("fr-FR"),
            totalElapsed: this.virtualElapsed,
            maxYear: this.currentYear,
            milestones: { ...this.decadeMilestones },
            yearlyProduction: { ...this.yearlyProduction },
            usedAssistance: this.usedAssistance,
        };

        // Load history
        const history = JSON.parse(localStorage.getItem("transistor_clicker_history") || "[]");
        history.push(run);
        localStorage.setItem("transistor_clicker_history", JSON.stringify(history));

        // Reset
        localStorage.removeItem("transistor_clicker_save");
        this.init(startingMoney);
    },

    /**
     * Get all past run histories
     */
    getHistory() {
        return JSON.parse(localStorage.getItem("transistor_clicker_history") || "[]");
    },
};
