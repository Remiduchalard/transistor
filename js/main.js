/**
 * main.js — Entry point: init, game loop, event bindings
 */

(function () {
    "use strict";

    // Initialize
    Game.init();
    const loadResult = Game.load();
    UI.init();
    Bot.init();

    // Global App object to expose functions to desktop.js and mobile.js
    window.App = {
        toggleExpert: () => {
            Game.globals.expertMode = !Game.globals.expertMode;
            Game.saveGlobals();
            updateExpertMode();
        },
        triggerResetPopup: () => {
            const resetPopup = document.getElementById("reset-popup");
            const settingsPopup = document.getElementById("settings-popup");
            resetPopup.classList.remove("hidden");
            settingsPopup.classList.add("hidden"); 
            if (Game.globals.unlockedMusk) {
                document.getElementById("reset-musk-btn").classList.remove("hidden");
            } else {
                document.getElementById("reset-musk-btn").classList.add("hidden");
            }
            if (Game.globals.unlockedWeyland) {
                document.getElementById("reset-weyland-btn").classList.remove("hidden");
            } else {
                document.getElementById("reset-weyland-btn").classList.add("hidden");
            }
        },
        openStats: () => {
            const settingsPopup = document.getElementById("settings-popup");
            const statsPopup = document.getElementById("stats-popup");
            settingsPopup.classList.add("hidden");
            buildStatsTable();
            statsPopup.classList.remove("hidden");
        },
        toggleBot: () => {
            Bot.toggle();
        },
        toggleLanguage: () => {
            const newLang = I18n.lang === 'fr' ? 'en' : 'fr';
            I18n.setLanguage(newLang);
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
        
        Events.emit('notify', {
            message: Game.globals.devModeUnlocked ? "Mode développeur activé !" : "Mode développeur désactivé !",
            type: Game.globals.devModeUnlocked ? "unlock" : ""
        });
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
        if (typeof gtag === "function") {
            gtag('event', 'tutorial_complete', { 'tutorial_id': 'intro_popup' });
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
    Events.emit('statsUpdated');
    Events.emit('shopUpdated');
    
    if (loadResult === false || Game.virtualElapsed === 0) checkIntroPopup();

    // Expert mode toggle
    const expertToggleBtn = document.getElementById("expert-toggle-btn");
    const expertToggleBtnMobile = document.getElementById("expert-toggle-btn-mobile");
    const expertStatsRow = document.querySelector(".advanced-stat");

    function updateExpertMode() {
        const txt = Game.globals.expertMode ? I18n.t("expert_mode") + "ACTIVÉ" : I18n.t("expert_mode") + "DÉSACTIVÉ";
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

    // App export for specific submodule needs
    window.App.updateExpertMode = updateExpertMode;

    const settingsPopup = document.getElementById("settings-popup");
    const settingsClose = document.getElementById("settings-close");
    if (settingsClose) {
        settingsClose.addEventListener("click", () => {
            settingsPopup.classList.add("hidden");
        });
    }
    settingsPopup.addEventListener("click", (e) => {
        if (e.target === settingsPopup) settingsPopup.classList.add("hidden");
    });
    
    const resetPopup = document.getElementById("reset-popup");
    const resetCancel = document.getElementById("reset-cancel-btn");
    if (resetCancel) {
        resetCancel.addEventListener("click", () => {
            resetPopup.classList.add("hidden");
        });
    }

    function performReset(startingMoney) {
        if (typeof gtag === "function") {
            gtag('event', 'level_end', {
                'level_name': 'Max Year Reached',
                'success': true,
                'score': Game.currentYear,
                'virtual_elapsed_time': Math.floor(Game.virtualElapsed / 1000)
            });
        }

        Game.archiveAndReset(startingMoney);
        Events.emit('statsUpdated');
        Events.emit('shopUpdated');
        resetPopup.classList.add("hidden");
        checkIntroPopup();
    }

    document.getElementById("reset-bob-btn").addEventListener("click", () => {
        performReset(0);
    });

    document.getElementById("reset-musk-btn").addEventListener("click", () => {
        performReset(300_000_000_000); // 300B
    });

    document.getElementById("reset-weyland-btn").addEventListener("click", () => {
        performReset(1_000_000_000_000_000); // 1 Quadrillion
    });

    const achCloseBtn = document.getElementById("achievement-close-btn");
    if (achCloseBtn) {
        achCloseBtn.addEventListener("click", () => {
            document.getElementById("achievement-popup").classList.add("hidden");
        });
    }

    // === Game speed ===
    const updateSpeedBtns = () => {
        document.querySelectorAll(".speed-btn, .speed-btn-mobile").forEach(b => {
            b.classList.toggle("active", parseFloat(b.dataset.speed) === Game.gameSpeed);
        });
    };
    updateSpeedBtns();

    // Bind speed buttons
    document.querySelectorAll(".speed-btn, .speed-btn-mobile").forEach(btn => {
        btn.addEventListener("click", () => {
            window.App.updateSpeed(parseFloat(btn.dataset.speed));
        });
    });

    // === Stats popup ===
    const statsPopup = document.getElementById("stats-popup");
    const statsClose = document.getElementById("stats-close");
    if (statsClose) {
        statsClose.addEventListener("click", () => {
            statsPopup.classList.add("hidden");
        });
    }
    document.getElementById("stats-export-btn").addEventListener("click", () => {
        Game.save();
        const saveData = JSON.parse(localStorage.getItem("transistor_clicker_save") || "{}");
        const historyData = JSON.parse(localStorage.getItem("transistor_clicker_history") || "[]");
        const exportObj = { save: saveData, history: historyData };
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

    function buildStatsTable() {
        const container = document.getElementById("stats-table-container");
        const history = Game.getHistory();
        const decades = [];
        for (let d = 1950; d <= 2100; d += 10) decades.push(d);

        const currentElapsed = Game.virtualElapsed;
        const currentMilestones = { ...Game.decadeMilestones };
        const relevantDecades = decades.filter(d => {
            if (currentMilestones[d]) return true;
            return history.some(run => run.milestones && run.milestones[d]);
        });

        let html = '<table class="stats-table"><thead><tr><th></th>';
        history.forEach((run, i) => {
            html += `<th>Run ${i + 1}<br><span style="font-weight:400;font-size:0.65rem">${run.date}</span></th>`;
        });
        html += '<th class="current-run">En cours</th></tr></thead><tbody>';

        html += '<tr><td class="row-label">Temps total</td>';
        history.forEach(run => html += `<td>${UI.formatTime(run.totalElapsed)}</td>`);
        html += `<td class="current-run">${UI.formatTime(currentElapsed)}</td></tr>`;

        html += '<tr><td class="row-label">Assistée</td>';
        history.forEach(run => html += `<td>${run.usedAssistance ? 'Oui 🤖' : 'Non'}</td>`);
        html += `<td class="current-run">${Game.usedAssistance ? 'Oui 🤖' : 'Non'}</td></tr>`;

        html += '<tr><td class="row-label">Prod. mondiale max</td>';
        history.forEach(run => html += `<td>${UI.formatNumber(new Decimal(_worldProd(run.maxYear || 1947)).mul(25))}/an</td>`);
        html += `<td class="current-run">${UI.formatNumber(new Decimal(_worldProd(Game.currentYear)).mul(25))}/an</td></tr>`;

        html += '<tr><td class="row-label">Année max</td>';
        history.forEach(run => html += `<td>${run.maxYear || "?"}</td>`);
        html += `<td class="current-run">${Game.currentYear}</td></tr>`;

        for (const d of relevantDecades) {
            html += `<tr><td class="row-label">${d}</td>`;
            let bestMs = Infinity;
            history.forEach(run => {
                const t = run.milestones?.[d]?.time;
                if (t !== undefined && t < bestMs) bestMs = t;
            });
            const ct = currentMilestones[d]?.time;
            if (ct !== undefined && ct < bestMs) bestMs = ct;

            history.forEach(run => {
                const m = run.milestones?.[d];
                const isBest = m?.time !== undefined && m.time <= bestMs;
                html += `<td class="${isBest ? "best-time" : ""}">${UI.formatTime(m?.time)}</td>`;
            });
            const isBest = ct !== undefined && ct <= bestMs;
            html += `<td class="current-run ${isBest ? "best-time" : ""}">${UI.formatTime(ct)}</td></tr>`;
        }
        html += "</tbody></table>";
        container.innerHTML = (history.length === 0 && relevantDecades.length === 0) ? '<p>Aucune statistique.</p>' : html;
        renderStatsChart(history, currentMilestones, relevantDecades);
        buildEquivalences();
    }

    function buildEquivalences() {
        const container = document.getElementById("stats-equiv-container");
        if (!container) return;
        
        let html = `<h3 style="margin-top: 30px; color: var(--gold); text-align: left;">${I18n.t("equiv_title")}</h3>`;
        html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
        
        EQUIVALENCES.forEach(eq => {
            const canProduce = Game.totalTransistors.div(eq.trans).floor();
            const percentage = canProduce.div(eq.world).mul(100);
            
            let pctStr = "";
            if (percentage.gte(100)) pctStr = UI.formatNumber(percentage) + "%";
            else if (percentage.gte(0.01)) pctStr = percentage.toNumber().toFixed(2) + "%";
            else pctStr = percentage.toExponential(2).replace("e-", "e-") + "%";
            
            html += `
            <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 10px; border-radius: 8px; text-align: left; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 1.5rem; margin-right: 10px;">${eq.icon}</span>
                    <strong style="color: var(--text);">${I18n.t("equiv_" + eq.id)}</strong>
                </div>
                <div style="text-align: right; font-size: 0.9rem;">
                    <div style="color: var(--accent);">${I18n.t("equiv_can_produce")}: <b>${UI.formatNumber(canProduce)}</b></div>
                    <div style="color: var(--text-dim);">${I18n.t("equiv_world_pct")}: <b>${pctStr}</b></div>
                </div>
            </div>`;
        });
        
        // Time to produce 1970
        const prod1970 = new Decimal(1014120480); // Exact value from _worldProd(1970)
        let timeStr = I18n.t("time_infinity");
        if (Game.productionPerYear.gt(0)) {
            const prodPerSec = Game.productionPerYear.div(CONFIG.SECONDS_PER_YEAR); // Real seconds
            const effectiveProdPerSec = prodPerSec.mul(Game.getEffectiveTimeMultiplier());
            const secondsNeeded = prod1970.div(effectiveProdPerSec).toNumber();
            
            timeStr = formatDuration(secondsNeeded);
        }
        
        html += `<div style="margin-top: 15px; padding: 15px; background: rgba(56, 189, 248, 0.1); border: 1px solid var(--accent); border-radius: 8px; text-align: left; font-size: 0.95rem; color: var(--text); line-height: 1.5;">
            ${I18n.t("time_to_1970")} : <br><strong style="color: var(--accent); font-size: 1.1rem;">${timeStr}</strong>
        </div>`;
        
        html += `</div>`;
        container.innerHTML = html;
    }

    function formatDuration(seconds) {
        if (!isFinite(seconds) || seconds < 0) return I18n.t("time_infinity");
        if (seconds < 1) return I18n.t("time_instant");
        
        const days = Math.floor(seconds / 86400);
        seconds -= days * 86400;
        const hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        
        const parts = [];
        if (days > 0) parts.push(`${days} ${I18n.t("time_days")}`);
        if (hours > 0) parts.push(`${hours} ${I18n.t("time_hours")}`);
        if (minutes > 0) parts.push(`${minutes} ${I18n.t("time_mins")}`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs} ${I18n.t("time_secs")}`);
        
        return parts.slice(0, 2).join(I18n.lang === 'fr' ? " et " : " and "); // Keep only the two largest units
    }

    let chartMode = 'year';
    const chartToggle = document.getElementById("chart-toggle-btn");
    if (chartToggle) {
        chartToggle.addEventListener("click", (e) => {
            chartMode = chartMode === 'year' ? 'time' : 'year';
            e.target.textContent = `Axe : ${chartMode === 'year' ? 'Année' : 'Temps de jeu'}`;
            buildStatsTable();
        });
    }

    let statsChartInstance = null;
    function renderStatsChart(history, currentMilestones, relevantDecades) {
        const chartContainer = document.getElementById("stats-chart-container");
        const canvas = document.getElementById("stats-chart");
        if (!Object.keys(Game.yearlyProduction).length && !history.length) {
            chartContainer.style.display = "none";
            return;
        }
        chartContainer.style.display = "block";
        
        let maxYear = Game.currentYear;
        history.forEach(run => { if (run.maxYear > maxYear) maxYear = run.maxYear; });
        const labels = [];
        for (let y = 1947; y <= maxYear; y++) labels.push(y.toString());

        const datasets = [];
        const colors = ["#f87171", "#fbbf24", "#34d399", "#38bdf8", "#a78bfa", "#f472b6"];

        history.forEach((run, i) => {
            if (!run.yearlyProduction) return;
            const data = chartMode === 'year' 
                ? labels.map(y => run.yearlyProduction[y]?.prod ? new Decimal(run.yearlyProduction[y].prod).mul(25).toNumber() : null)
                : Object.values(run.yearlyProduction).map(v => ({ x: v.time, y: new Decimal(v.prod).mul(25).toNumber() }));
            
            datasets.push({
                label: `Run ${i + 1}`,
                data: data,
                borderColor: colors[i % colors.length],
                borderWidth: 2, pointRadius: 0, fill: false, tension: 0.1
            });
        });

        const currentData = chartMode === 'year'
            ? labels.map(y => Game.yearlyProduction[y]?.prod ? new Decimal(Game.yearlyProduction[y].prod).mul(25).toNumber() : null)
            : Object.values(Game.yearlyProduction).map(v => ({ x: v.time, y: new Decimal(v.prod).mul(25).toNumber() }));
        
        datasets.push({
            label: 'En cours',
            data: currentData,
            borderColor: '#ffffff',
            borderWidth: 2, pointRadius: 0, borderDash: [5, 5], fill: false, tension: 0.1
        });

        if (statsChartInstance) statsChartInstance.destroy();
        statsChartInstance = new Chart(canvas, {
            type: 'line',
            data: { datasets, labels: chartMode === 'year' ? labels : undefined },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: chartMode === 'year' ? { type: 'category' } : { type: 'linear', ticks: { callback: v => UI.formatTime(v) } },
                    y: { type: 'logarithmic', ticks: { callback: v => UI.formatNumber(v) } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: items => chartMode === 'time' ? UI.formatTime(items[0].parsed.x) : items[0].label,
                            label: item => `${item.dataset.label}: ${UI.formatNumber(item.parsed.y)}/an`
                        }
                    }
                }
            }
        });
    }

    // === Click handler ===
    const clickBtn = document.getElementById("click-btn");
    if (clickBtn) {
        clickBtn.addEventListener("click", () => {
            const produced = Game.click();
            
            const el = document.createElement("div");
            el.className = "float-number";
            el.textContent = "+" + UI.formatNumber(produced);
            el.style.left = (Math.random() * 160 + 30) + "px";
            document.getElementById("floating-numbers").appendChild(el);
            setTimeout(() => el.remove(), 1000);
            
            clickBtn.classList.remove("pulse");
            void clickBtn.offsetWidth;
            clickBtn.classList.add("pulse");
            
            Events.emit('statsUpdated');
            if (Game.hasYearChanged()) {
                Game.checkDecadeMilestone();
                Events.emit('shopUpdated');
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && e.target === document.body) {
            e.preventDefault();
            const btn = document.getElementById("click-btn");
            if (btn) btn.click();
        }
    });

    // === Game Loop ===
    let lastTick = performance.now();
    let renderAccumulator = 0;
    const RENDER_INTERVAL = 250;

    let frameCount = 0;
    let lastFpsTime = performance.now();
    let currentFps = 0;
    let lastTickDuration = 0;

    function gameLoop(now) {
        const tickStart = performance.now();
        const delta = now - lastTick;
        lastTick = now;
        const oldYear = Game.currentYear;
        
        Game.tick(delta);
        Bot.tick(delta * Game.getEffectiveTimeMultiplier(), delta);

        if (Game.currentYear !== oldYear) {
            Game.checkDecadeMilestone();
            Events.emit('shopUpdated');
        }

        renderAccumulator += delta;
        if (renderAccumulator >= RENDER_INTERVAL) {
            renderAccumulator = 0;
            Events.emit('statsUpdated');
            if (UI.Shop) UI.Shop.update(); 
        }
        
        lastTickDuration = performance.now() - tickStart;

        frameCount++;
        if (now - lastFpsTime >= 1000) {
            currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
            frameCount = 0;
            lastFpsTime = now;
            Events.emit('perfUpdated', { fps: currentFps, tick: lastTickDuration });
        }

        requestAnimationFrame(gameLoop);
    }

    const useBoostBtn = document.getElementById("use-boost-btn");
    if (useBoostBtn) {
        useBoostBtn.addEventListener("click", () => {
            if (Game.useConsumable()) {
                Events.emit('notify', { message: "🔥 Boost temporel activé !", type: "bonus" });
                Events.emit('statsUpdated');
            }
        });
    }

    requestAnimationFrame(gameLoop);
    setInterval(() => Game.save(), 30_000);
    window.addEventListener("beforeunload", () => Game.save());

})();
