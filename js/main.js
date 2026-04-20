/**
 * main.js — Entry point: init, game loop, event bindings
 */

(function () {
    "use strict";

    // Initialize
    Game.init();
    const loadResult = Game.load();
    UI.init();

    // Global App object to expose functions to desktop.js and mobile.js
    window.App = {
        toggleExpert: () => {
            Game.globals.expertMode = !Game.globals.expertMode;
            Game.saveGlobals();
            updateExpertMode();
        },
        triggerResetPopup: () => {
            resetPopup.classList.remove("hidden");
            settingsPopup.classList.add("hidden"); 
            if (Game.globals.unlockedMusk) {
                document.getElementById("reset-musk-btn").classList.remove("hidden");
            } else {
                document.getElementById("reset-musk-btn").classList.add("hidden");
            }
        },
        openStats: () => {
            settingsPopup.classList.add("hidden");
            buildStatsTable();
            statsPopup.classList.remove("hidden");
        },
        toggleBot: () => {
            toggleBot();
        },
        updateSpeed: (speed) => {
            Game.gameSpeed = speed;
            if (Game.gameSpeed > 1) Game.usedAssistance = true;
            updateSpeedBtns();
            Game.save();
        }
    };

    // Developer Mode logic
    let devClickCount = 0;
    let devClickTimer = null;
    
    function toggleDevMode() {
        Game.globals.devModeUnlocked = !Game.globals.devModeUnlocked;
        Game.saveGlobals();
        
        if (Game.globals.devModeUnlocked) {
            document.querySelectorAll(".dev-option").forEach(el => el.classList.remove("hidden"));
        } else {
            document.querySelectorAll(".dev-option").forEach(el => el.classList.add("hidden"));
        }
        
        const el = document.createElement("div");
        el.className = "notification " + (Game.globals.devModeUnlocked ? "unlock" : "");
        el.textContent = Game.globals.devModeUnlocked ? "Mode développeur activé !" : "Mode développeur désactivé !";
        document.getElementById("notifications").appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }

    if (Game.globals.devModeUnlocked) {
        document.querySelectorAll(".dev-option").forEach(el => el.classList.remove("hidden"));
    }

    function handleDevClick() {
        devClickCount++;
        if (devClickCount === 1) {
            devClickTimer = setTimeout(() => {
                devClickCount = 0;
            }, 10000);
        }
        
        if (devClickCount >= 10) {
            clearTimeout(devClickTimer);
            devClickCount = 0;
            toggleDevMode();
        }
    }

    document.querySelectorAll(".made-by-tarah").forEach(el => {
        el.addEventListener("click", handleDevClick);
    });

    const introPopup = document.getElementById("intro-popup");
    document.getElementById("intro-start-btn").addEventListener("click", () => {
        introPopup.classList.add("hidden");
        // Analytics: Game Started
        if (typeof gtag === "function") {
            gtag('event', 'tutorial_complete', {
                'tutorial_id': 'intro_popup'
            });
            gtag('event', 'game_start');
        }
    });
    
    function checkIntroPopup() {
        if (Game.virtualElapsed === 0) {
            introPopup.classList.remove("hidden");
        }
    }

    // Handle Offline Popup
    if (typeof loadResult === "object" && loadResult !== null && loadResult !== true) {
        const offlinePopup = document.getElementById("offline-popup");
        document.getElementById("offline-time").textContent = UI.formatTime(loadResult.offlineMs);
        document.getElementById("offline-rate").textContent = Math.round(loadResult.rate * 100);
        document.getElementById("offline-produced").textContent = UI.formatNumber(loadResult.produced);
        document.getElementById("offline-earned").textContent = UI.formatMoney(loadResult.earned);
        offlinePopup.classList.remove("hidden");
        
        document.getElementById("offline-close-btn").addEventListener("click", () => {
            offlinePopup.classList.add("hidden");
        });
    }

    // Initial render
    UI.updateStats();
    UI.renderMachines();
    UI.renderUpgrades();
    UI.initSellButtons();
    UI.initMilestoneClose();
    
    if (loadResult === false || Game.virtualElapsed === 0) checkIntroPopup();

    // Auto-save every 10 seconds
    setInterval(() => {
        Game.save();
    }, 10000);

    // === Buy quantity selector ===
    document.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".qty-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            UI.buyQty = parseInt(btn.dataset.qty);
            UI.renderMachines();
        });
    });

    // Expert mode toggle
    const expertToggleBtn = document.getElementById("expert-toggle-btn");
    const expertToggleBtnMobile = document.getElementById("expert-toggle-btn-mobile");
    const expertStatsRow = document.querySelector(".advanced-stat");

    function updateExpertMode() {
        const txt = Game.globals.expertMode ? "Mode Avancé : ACTIVÉ" : "Mode Avancé : DÉSACTIVÉ";
        const col = Game.globals.expertMode ? "var(--green)" : "var(--accent)";
        
        [expertToggleBtn, expertToggleBtnMobile].forEach(btn => {
            if (!btn) return;
            btn.textContent = txt;
            btn.style.color = col;
            btn.style.borderColor = col;
        });

        if (Game.globals.expertMode) {
            expertStatsRow.classList.remove("hidden");
        } else {
            expertStatsRow.classList.add("hidden");
        }
    }
    
    updateExpertMode();

    const settingsPopup = document.getElementById("settings-popup");
    document.getElementById("settings-close").addEventListener("click", () => {
        settingsPopup.classList.add("hidden");
    });
    settingsPopup.addEventListener("click", (e) => {
        if (e.target === settingsPopup) settingsPopup.classList.add("hidden");
    });
    
    const resetPopup = document.getElementById("reset-popup");
    document.getElementById("reset-cancel-btn").addEventListener("click", () => {
        resetPopup.classList.add("hidden");
    });

    function performReset(startingMoney) {
        // Analytics: End of run
        if (typeof gtag === "function") {
            gtag('event', 'level_end', {
                'level_name': 'Max Year Reached',
                'success': true,
                'score': Game.currentYear,
                'virtual_elapsed_time': Math.floor(Game.virtualElapsed / 1000)
            });
        }

        Game.archiveAndReset(startingMoney);
        UI.updateStats();
        UI.renderMachines();
        UI.renderUpgrades();
        resetPopup.classList.add("hidden");
        checkIntroPopup();
    }

    document.getElementById("reset-bob-btn").addEventListener("click", () => {
        performReset(0);
    });

    document.getElementById("reset-musk-btn").addEventListener("click", () => {
        performReset(300_000_000_000); // 300B
    });

    const achCloseBtn = document.getElementById("achievement-close-btn");
    if (achCloseBtn) {
        achCloseBtn.addEventListener("click", () => {
            document.getElementById("achievement-popup").classList.add("hidden");
        });
    }

    // === Game speed ===
    // Restore active button from saved speed
    const updateSpeedBtns = () => {
        document.querySelectorAll(".speed-btn, .speed-btn-mobile").forEach(b => {
            b.classList.toggle("active", parseFloat(b.dataset.speed) === Game.gameSpeed);
        });
    };
    updateSpeedBtns();

    // === Stats popup ===
    const statsPopup = document.getElementById("stats-popup");
    document.getElementById("stats-close").addEventListener("click", () => {
        statsPopup.classList.add("hidden");
    });
    document.getElementById("stats-export-btn").addEventListener("click", () => {
        Game.save(); // Ensure latest state is in localStorage
        const saveData = JSON.parse(localStorage.getItem("transistor_clicker_save") || "{}");
        const historyData = JSON.parse(localStorage.getItem("transistor_clicker_history") || "[]");
        
        const exportObj = {
            save: saveData,
            history: historyData
        };
        
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transistor_clicker_save_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    statsPopup.addEventListener("click", (e) => {
        if (e.target === statsPopup) statsPopup.classList.add("hidden");
    });

    function formatElapsed(ms) {
        if (ms === undefined || ms === null) return "—";
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    function buildStatsTable() {
        const container = document.getElementById("stats-table-container");
        const history = Game.getHistory();

        // Decades to show: 1950 to max reached across all runs + current
        const decades = [];
        for (let d = 1950; d <= 2100; d += 10) decades.push(d);

        // Current run data (virtual elapsed = speed-weighted time)
        const currentElapsed = Game.virtualElapsed;
        const currentMilestones = { ...Game.decadeMilestones };

        // Filter decades to only show ones that at least one run reached
        const relevantDecades = decades.filter(d => {
            if (currentMilestones[d]) return true;
            return history.some(run => run.milestones && run.milestones[d]);
        });

        // Build table
        let html = '<table class="stats-table">';

        // Header row
        html += "<thead><tr><th></th>";
        history.forEach((run, i) => {
            html += `<th>Run ${i + 1}<br><span style="font-weight:400;font-size:0.65rem">${run.date}</span></th>`;
        });
        html += '<th class="current-run">En cours</th>';
        html += "</tr></thead><tbody>";

        // Total time row
        html += '<tr><td class="row-label">Temps total</td>';
        history.forEach(run => {
            html += `<td>${formatElapsed(run.totalElapsed)}</td>`;
        });
        html += `<td class="current-run">${formatElapsed(currentElapsed)}</td>`;
        html += "</tr>";

        // Assistance row
        html += '<tr><td class="row-label" title="Utilisation de l\'accélérateur de temps ou du bot">Assistée</td>';
        history.forEach(run => {
            const ast = run.usedAssistance ? '<span style="color:var(--gold)">Oui 🤖</span>' : '<span style="color:var(--text-dim)">Non</span>';
            html += `<td>${ast}</td>`;
        });
        const cAst = Game.usedAssistance ? '<span style="color:var(--gold)">Oui 🤖</span>' : '<span style="color:var(--text-dim)">Non</span>';
        html += `<td class="current-run">${cAst}</td>`;
        html += "</tr>";

        // Global production row
        html += '<tr><td class="row-label">Prod. mondiale max</td>';
        history.forEach(run => {
            const prod = run.maxYear ? _worldProd(run.maxYear) : 0;
            html += `<td>${UI.formatNumber(prod)}/an</td>`;
        });
        const currentProd = _worldProd(Game.currentYear);
        html += `<td class="current-run">${UI.formatNumber(currentProd)}/an</td>`;
        html += "</tr>";

        // Max year row
        html += '<tr><td class="row-label">Année max</td>';
        history.forEach(run => {
            html += `<td>${run.maxYear || "?"}</td>`;
        });
        html += `<td class="current-run">${Game.currentYear}</td>`;
        html += "</tr>";

        // Decade rows
        for (const d of relevantDecades) {
            html += `<tr><td class="row-label">${d}</td>`;

            // Find best time across all runs for highlighting
            let bestMs = Infinity;
            history.forEach(run => {
                const milestone = run.milestones && run.milestones[d];
                const t = typeof milestone === 'object' ? milestone.time : milestone;
                if (t !== undefined && t < bestMs) bestMs = t;
            });
            const currentMilestone = currentMilestones[d];
            const ct = typeof currentMilestone === 'object' ? currentMilestone.time : currentMilestone;
            if (ct !== undefined && ct < bestMs) bestMs = ct;

            function formatShare(share) {
                const s = new Decimal(share);
                if (s.gte(100)) return UI.formatNumber(s) + "%";
                if (s.gte(1)) return s.toNumber().toFixed(1) + "%";
                if (s.gte(0.01)) return s.toNumber().toFixed(3) + "%";
                return s.toExponential(1) + "%";
            }

            history.forEach(run => {
                const milestone = run.milestones && run.milestones[d];
                const t = typeof milestone === 'object' ? milestone.time : milestone;
                const share = typeof milestone === 'object' ? milestone.share : undefined;
                
                const isBest = t !== undefined && t <= bestMs;
                let cellHtml = formatElapsed(t);
                if (share !== undefined) {
                    cellHtml += `<br><span style="font-size:0.7em; color:var(--text-dim)">Part: ${formatShare(share)}</span>`;
                }
                html += `<td class="${isBest ? "best-time" : ""}">${cellHtml}</td>`;
            });

            const isBest = ct !== undefined && ct <= bestMs;
            let currentCellHtml = formatElapsed(ct);
            const currentShare = typeof currentMilestone === 'object' ? currentMilestone.share : undefined;
            if (currentShare !== undefined) {
                currentCellHtml += `<br><span style="font-size:0.7em; color:var(--text-dim)">Part: ${formatShare(currentShare)}</span>`;
            }
            html += `<td class="current-run ${isBest ? "best-time" : ""}">${currentCellHtml}</td>`;
            html += "</tr>";
        }

        html += "</tbody></table>";

        if (history.length === 0 && relevantDecades.length === 0) {
            html = '<p style="color:var(--text-dim)">Aucune statistique pour le moment. Joue et atteins des décennies !</p>';
        }

        container.innerHTML = html;

        // Render Chart
        renderStatsChart(history, currentMilestones, relevantDecades);
    }

    // Chart Mode Toggle
    let chartMode = 'year'; // or 'time'
    document.getElementById("chart-toggle-btn").addEventListener("click", (e) => {
        chartMode = chartMode === 'year' ? 'time' : 'year';
        e.target.textContent = `Axe : ${chartMode === 'year' ? 'Année' : 'Temps de jeu'}`;
        buildStatsTable(); // Re-render to update the chart
    });

    let statsChartInstance = null;

    function renderStatsChart(history, currentMilestones, relevantDecades) {
        const chartContainer = document.getElementById("stats-chart-container");
        const canvas = document.getElementById("stats-chart");

        const currentYearProduction = Game.yearlyProduction;
        const hasCurrentData = Object.keys(currentYearProduction).length > 0;
        const hasHistoryData = history.some(run => run.yearlyProduction && Object.keys(run.yearlyProduction).length > 0);

        if (!hasCurrentData && !hasHistoryData) {
            chartContainer.style.display = "none";
            return;
        }

        chartContainer.style.display = "block";

        // Find min and max year across all datasets
        let minYear = 1947;
        let maxYear = Game.currentYear;
        history.forEach(run => {
            if (run.maxYear && run.maxYear > maxYear) maxYear = run.maxYear;
        });

        const labels = [];
        for (let y = minYear; y <= maxYear; y++) {
            labels.push(y.toString());
        }

        const datasets = [];
        const colors = [
            "#f87171", "#fbbf24", "#34d399", "#38bdf8", "#a78bfa", "#f472b6"
        ];

        // Helper to extract prod and time from mixed data structures
        function getProdAndTime(val) {
            if (val === undefined || val === null) return null;
            if (typeof val === 'number') return { prod: val, time: null };
            return { prod: val.prod || 0, time: val.time };
        }

        // Process history runs
        history.forEach((run, i) => {
            if (!run.yearlyProduction) return;
            
            if (chartMode === 'year') {
                const data = labels.map(y => {
                    const info = getProdAndTime(run.yearlyProduction[y]);
                    return info ? info.prod : null;
                });

                if (data.some(val => val !== null)) {
                    datasets.push({
                        label: `Run ${i + 1}`,
                        data: data,
                        borderColor: colors[i % colors.length],
                        backgroundColor: colors[i % colors.length] + '40',
                        borderWidth: 2,
                        pointRadius: 0,
                        hitRadius: 5,
                        fill: false,
                        tension: 0.1
                    });
                }
            } else {
                // Time mode
                const dataPoints = [];
                for (let y = minYear; y <= maxYear; y++) {
                    const info = getProdAndTime(run.yearlyProduction[y]);
                    if (info && info.time !== null && info.time !== undefined) {
                        dataPoints.push({ x: info.time, y: info.prod });
                    }
                }
                
                if (dataPoints.length > 0) {
                    datasets.push({
                        label: `Run ${i + 1}`,
                        data: dataPoints,
                        borderColor: colors[i % colors.length],
                        backgroundColor: colors[i % colors.length] + '40',
                        borderWidth: 2,
                        pointRadius: 0,
                        hitRadius: 5,
                        fill: false,
                        tension: 0.1
                    });
                }
            }
        });

        // Add current run
        if (chartMode === 'year') {
            const currentData = labels.map(y => {
                const info = getProdAndTime(currentYearProduction[y]);
                return info ? info.prod : null;
            });

            if (currentData.some(val => val !== null)) {
                datasets.push({
                    label: 'En cours',
                    data: currentData,
                    borderColor: '#ffffff',
                    backgroundColor: '#ffffff40',
                    borderWidth: 2,
                    pointRadius: 0,
                    hitRadius: 5,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1
                });
            }
        } else {
            const currentDataPoints = [];
            for (let y = minYear; y <= maxYear; y++) {
                const info = getProdAndTime(currentYearProduction[y]);
                if (info && info.time !== null && info.time !== undefined) {
                    currentDataPoints.push({ x: info.time, y: info.prod });
                }
            }
            if (currentDataPoints.length > 0) {
                datasets.push({
                    label: 'En cours',
                    data: currentDataPoints,
                    borderColor: '#ffffff',
                    backgroundColor: '#ffffff40',
                    borderWidth: 2,
                    pointRadius: 0,
                    hitRadius: 5,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1
                });
            }
        }

        if (statsChartInstance) {
            statsChartInstance.destroy();
        }

        const chartConfig = {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                    axis: 'x'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0',
                            font: { size: 10 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                if (chartMode === 'time') {
                                    return formatElapsed(context[0].parsed.x);
                                } else {
                                    return context[0].label;
                                }
                            },
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) {
                                    label += UI.formatNumber(context.parsed.y) + '/an';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: chartMode === 'year' ? {
                        type: 'category',
                        labels: labels,
                        grid: { display: false },
                        ticks: {
                            color: '#8892a4',
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 20
                        }
                    } : {
                        type: 'linear',
                        grid: { color: '#2a3a4e' },
                        ticks: {
                            color: '#8892a4',
                            maxRotation: 0,
                            callback: function(value) {
                                return formatElapsed(value);
                            },
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        type: 'logarithmic',
                        grid: { color: '#2a3a4e' },
                        ticks: {
                            color: '#8892a4',
                            callback: function(value) {
                                return UI.formatNumber(value);
                            }
                        }
                    }
                }
            }
        };

        if (chartMode === 'year') {
            chartConfig.data.labels = labels;
        }

        statsChartInstance = new Chart(canvas, chartConfig);
    }

    // === Bot ===
    let botActive = false;
    let botClickAccumulator = 0;   // game-time ms accumulator for clicks
    let botSellAccumulator = 0;    // game-time ms accumulator for selling
    const BOT_CLICK_INTERVAL = 500;   // 2 clicks/sec in game-time (500ms)
    const BOT_SELL_INTERVAL = 3000;   // sell every 3s in game-time
    const BOT_CLICK_STOP = 10_000;    // stop clicking after 10k total transistors

    const botToggleBtn = document.getElementById("bot-toggle-btn");
    const botToggleBtnMobile = document.getElementById("bot-toggle-btn-mobile");
    const botStatus = document.getElementById("bot-status");
    const botStatusMobile = document.getElementById("bot-status-mobile");

    const toggleBot = () => {
        botActive = !botActive;
        const txt = botActive ? "Désactiver le Bot" : "Activer le Bot";
        const col = botActive ? "var(--red)" : "var(--green)";
        const statTxt = botActive ? "Actif" : "Inactif";
        const cls = botActive ? "bot-status-on" : "bot-status-off";

        [botToggleBtn, botToggleBtnMobile].forEach(b => {
            if(!b) return;
            b.textContent = txt;
            b.style.borderColor = col;
            b.style.color = col;
        });

        [botStatus, botStatusMobile].forEach(s => {
            if(!s) return;
            s.textContent = statTxt;
            s.className = cls;
        });

        if (botActive) {
            Game.usedAssistance = true;
            botClickAccumulator = 0;
            botSellAccumulator = 0;
        } else {
            UI.setBotNextAction(null);
        }
    };

    botToggleBtn.addEventListener("click", toggleBot);
    if(botToggleBtnMobile) botToggleBtnMobile.addEventListener("click", toggleBot);

    function botTick(effectiveDeltaMs) {
        if (!botActive) return;

        // --- Auto-click (2/sec game-time), stops after 10k total ---
        if (Game.totalTransistors < BOT_CLICK_STOP) {
            botClickAccumulator += effectiveDeltaMs;
            while (botClickAccumulator >= BOT_CLICK_INTERVAL && Game.totalTransistors < BOT_CLICK_STOP) {
                Game.click();
                botClickAccumulator -= BOT_CLICK_INTERVAL;
            }
        }

        // --- Auto-sell all stock every 3s game-time ---
        botSellAccumulator += effectiveDeltaMs;
        if (botSellAccumulator >= BOT_SELL_INTERVAL) {
            botSellAccumulator -= BOT_SELL_INTERVAL;
            if (Game.transistors > 0) {
                Game.sell("max");
            }
        }

        // --- ROI-based Purchasing (Payback Time) ---
        // Loop to buy everything that is currently the best ROI and affordable
        let iterations = 0;
        // À vitesse normale (x1 ou x2), on limite à 1 achat par tick pour bien voir le bot acheter "un par un".
        // À haute vitesse, on augmente la limite pour ne pas prendre de retard sur l'accumulation d'argent.
        let maxIterations = 1;
        if (Game.gameSpeed > 2) maxIterations = 50;
        if (Game.gameSpeed >= 500) maxIterations = 200; 

        while (iterations < maxIterations) {
            iterations++;
            const unitPrice = new Decimal(Game.getEffectivePrice());
            const incomeFromProduction = Game.productionPerYear.div(CONFIG.SECONDS_PER_YEAR).mul(unitPrice);
            let incomeFromClicking = new Decimal(0);
            if (Game.totalTransistors.lt(BOT_CLICK_STOP)) {
                incomeFromClicking = new Decimal(1000 / BOT_CLICK_INTERVAL).mul(Game.clickPower).mul(unitPrice);
            }
            const currentIncomePerSec = incomeFromProduction.add(incomeFromClicking);

            const investments = [];

            // 1. Upgrades
            for (const upgrade of UPGRADES) {
                if (Game.purchasedUpgrades.has(upgrade.id)) continue;
                if (Game.currentYear < upgrade.unlockYear) continue;

                let gainPerSec = new Decimal(0);
                if (upgrade.type === "click_multiplier") {
                    if (Game.totalTransistors.lt(BOT_CLICK_STOP)) {
                        const currentClickPower = Game.clickPower;
                        const newClickPower = currentClickPower.mul(upgrade.value);
                        const gainPerClick = newClickPower.sub(currentClickPower);
                        const clicksPerSec = 1000 / BOT_CLICK_INTERVAL;
                        gainPerSec = gainPerClick.mul(clicksPerSec).mul(unitPrice);
                    }
                } else if (upgrade.type === "autosell") {
                    const currentRate = Game.autoSellRate;
                    const newRate = upgrade.value;
                    if (newRate > currentRate) {
                        const gainPerYear = Game.productionPerYear.mul(newRate - currentRate);
                        gainPerSec = gainPerYear.div(CONFIG.SECONDS_PER_YEAR).mul(unitPrice);
                    }
                } else if (upgrade.type === "offline_prod") {
                    // C'est un investissement "confort", on le prend si c'est très abordable (ex: s'amortit virtuellement vite)
                    // Disons arbitrairement que ça "rapporte" 1% de la prod globale pour le calcul ROI.
                    gainPerSec = Game.productionPerYear.div(CONFIG.SECONDS_PER_YEAR).mul(unitPrice).mul(0.01);
                }

                if (gainPerSec.gt(0)) {
                    investments.push({
                        type: "upgrade",
                        id: upgrade.id,
                        cost: new Decimal(upgrade.cost),
                        gainPerSec: gainPerSec
                    });
                }
            }

            // 2. Machines (Already unlocked)
            for (const machine of MACHINES) {
                if (!Game.unlockedRD[machine.id]) continue;

                const owned = Game.ownedMachines[machine.id] || 0;
                const cost = getMachineCost(machine, owned, Game.currentYear);
                const gainPerSec = new Decimal(machine.baseProduction).div(CONFIG.SECONDS_PER_YEAR).mul(unitPrice);

                investments.push({
                    type: "machine",
                    id: machine.id,
                    cost: cost,
                    gainPerSec: gainPerSec
                });
            }

            // 3. R&D (Unlock + first machine)
            for (const machine of MACHINES) {
                // Same visibility threshold as UI
                if (Game.currentYear < machine.unlockYear - 10) continue;
                if (Game.unlockedRD[machine.id]) continue;

                const rdCost = getDynamicRDCost(machine, Game.currentYear);
                const cost = rdCost.add(getMachineCost(machine, 0, Game.currentYear));
                const gainPerSec = new Decimal(machine.baseProduction).div(CONFIG.SECONDS_PER_YEAR).mul(unitPrice);

                investments.push({
                    type: "rd",
                    id: machine.id,
                    cost: cost,
                    rdCost: rdCost,
                    gainPerSec: gainPerSec
                });
            }

            if (investments.length === 0) break;

            // Score each investment: Score = Time to afford + Time to payback
            for (const inv of investments) {
                // Le score doit TOUJOURS prendre en compte le coût total de l'investissement final (usine incluse)
                // Sinon le bot sous-estime le temps d'attente, achète la R&D, et réalise ensuite que l'usine est trop chère.
                const waitingTime = Game.money.gte(inv.cost) ? 0 :
                    (currentIncomePerSec.gt(0) ? inv.cost.sub(Game.money).div(currentIncomePerSec).toNumber() : Infinity);

                const paybackTime = inv.gainPerSec.gt(0) ? inv.cost.div(inv.gainPerSec).toNumber() : Infinity;
                inv.score = waitingTime + paybackTime;
            }

            // Find best ROI (lowest score)
            investments.sort((a, b) => a.score - b.score);
            const best = investments[0];

            if (best.score === Infinity) {
                UI.setBotNextAction("Rien à faire");
                break;
            }

            // If best is affordable, buy it and loop. If not, wait (don't buy anything else).
            const isAffordable = (best.type === "rd") ? (Game.money.gte(best.rdCost)) : (Game.money.gte(best.cost));

            // Update UI with bot's plan
            if (iterations === 1) {
                let itemName = "Objet";
                if (best.type === "upgrade") itemName = UPGRADES.find(u => u.id === best.id)?.name || "Amélioration";
                else if (best.type === "rd") itemName = "R&D " + (MACHINES.find(m => m.id === best.id)?.name || "");
                else if (best.type === "machine") itemName = MACHINES.find(m => m.id === best.id)?.name || "Machine";

                const actionVerb = isAffordable ? "Achat de" : "Économie pour";
                UI.setBotNextAction(`${actionVerb} : ${itemName}`);
            }

            if (isAffordable) {
                let success = false;

                if (best.type === "upgrade") {
                    success = Game.buyUpgrade(best.id);
                    if (success) UI.highlightAction("upgrade", best.id);
                } else if (best.type === "machine") {
                    success = Game.buyMachine(best.id, 1) > 0;
                    if (success) UI.highlightAction("machine", best.id);
                } else if (best.type === "rd") {
                    success = Game.unlockRD(best.id);
                    if (success) UI.highlightAction("rd", best.id);
                }

                if (success) {
                    // Refresh UI immediately after a successful bot action
                    UI.renderMachines();
                    UI.renderUpgrades();
                    UI.updateStats();
                } else {
                    // Évite de boucler dans le vide si l'achat a échoué (ex: problème d'arrondi)
                    break;
                }
            } else {
                break;
            }
        }    }

    // === Click handler ===
    UI.els.clickBtn.addEventListener("click", (e) => {
        const produced = Game.click();
        UI.spawnFloatingNumber(produced);
        UI.pulseClickBtn();
        UI.updateStats();

        if (Game.hasYearChanged()) {
            Game.checkDecadeMilestone();
            UI.checkUnlocks(Game.previousYear, Game.currentYear);
            UI.renderMachines();
            UI.renderUpgrades();
        }
    });

    // Keyboard shortcut: space to click
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && e.target === document.body) {
            e.preventDefault();
            UI.els.clickBtn.click();
        }
    });

    // === Game Loop ===
    let lastTick = performance.now();
    let renderAccumulator = 0;
    const RENDER_INTERVAL = 250; // UI update every 250ms

    function gameLoop(now) {
        const delta = now - lastTick;
        lastTick = now;

        // Physics tick + bot tick
        const oldYear = Game.currentYear;
        Game.tick(delta);
        
        // Pass the effective time multiplier to the bot so it acts 50x faster too
        const effectiveBotDelta = delta * Game.getEffectiveTimeMultiplier();
        botTick(effectiveBotDelta);

        // Check year changes from production + bot actions
        if (Game.currentYear !== oldYear) {
            Game.checkDecadeMilestone();
            UI.checkUnlocks(oldYear, Game.currentYear);
            UI.renderMachines();
            UI.renderUpgrades();
        }

        // Render at lower frequency
        renderAccumulator += delta;
        if (renderAccumulator >= RENDER_INTERVAL) {
            renderAccumulator = 0;
            UI.updateStats();
            // Refresh machine affordability
            refreshMachineAffordability();
        }

        requestAnimationFrame(gameLoop);
    }

    /**
     * Quick pass to update affordable/locked classes without full re-render
     */
    function refreshMachineAffordability() {
        const qty = UI.buyQty;
        const cards = document.querySelectorAll(".machine-card");
        cards.forEach(card => {
            const id = card.dataset.id;
            const machine = MACHINES.find(m => m.id === id);
            if (!machine) return;

            const owned = Game.ownedMachines[machine.id] || 0;
            const bulkCost = getBulkMachineCost(machine, owned, qty, Game.currentYear);
            const unlocked = Game.currentYear >= machine.unlockYear;
            const rdDone = !!Game.unlockedRD[machine.id];
            const affordable = Game.money.gte(bulkCost);
            const rdAffordable = Game.money.gte(getDynamicRDCost(machine, Game.currentYear));
            const isEarly = Game.currentYear < machine.unlockYear;

            // Reset all state classes
            card.classList.remove("locked", "needs-rd", "affordable", "early-access");

            // Apply new state classes mutually exclusively where it matters
            if (!rdDone && !rdAffordable && isEarly) {
                // Not historically unlocked and can't afford the R&D penalty: totally locked out
                card.classList.add("locked");
            } else if (!rdDone) {
                // Needs R&D (either historical or early access)
                card.classList.add("needs-rd");
                if (rdAffordable) card.classList.add("affordable");
                if (isEarly) card.classList.add("early-access");
            } else {
                // R&D is done, just regular factory buying
                if (affordable) card.classList.add("affordable");
                if (isEarly) card.classList.add("early-access");
            }

            // Update R&D button state
            const rdBtn = card.querySelector(".machine-rd-btn");
            if (rdBtn) {
                rdBtn.classList.toggle("locked", !rdAffordable);
            }

            // Update cost display (only for machines with R&D done)
            const costEl = card.querySelector(".machine-cost");
            if (costEl) {
                costEl.textContent = qty > 1
                    ? `${UI.formatMoney(bulkCost)} (x${qty})`
                    : UI.formatMoney(bulkCost);
            }

            // Update count
            const countEl = card.querySelector(".machine-count");
            if (countEl) countEl.textContent = "x" + owned;

            // Update total production display
            const totalProdEl = card.querySelector(".machine-production-total");
            if (totalProdEl && owned > 0) {
                const totalProd = new Decimal(machine.baseProduction).mul(owned);
                totalProdEl.textContent = "Total: " + UI.formatNumber(totalProd) + "/an";
            }
        });
    }

    // === Boost ===
    document.getElementById("use-boost-btn").addEventListener("click", () => {
        if (Game.useConsumable()) {
            if (typeof UI !== 'undefined' && UI.notify) {
                UI.notify("🔥 Boost temporel activé !", "bonus");
            }
            UI.updateStats();
        }
    });

    // Start game loop
    requestAnimationFrame(gameLoop);

    // === Auto-save every 30 seconds ===
    setInterval(() => {
        Game.save();
    }, 30_000);

    // Save on page close
    window.addEventListener("beforeunload", () => {
        Game.save();
    });

})();
