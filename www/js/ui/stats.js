/**
 * js/ui/stats.js — Handles the stats display and updates
 */

UI.Stats = {
    chartMode: 'year',
    statsChartInstance: null,

    init() {
        Events.on('statsUpdated', () => this.update());

        const statsPopup = document.getElementById("stats-popup");
        const statsClose = document.getElementById("stats-close");
        if (statsClose) {
            statsClose.addEventListener("click", () => {
                if (statsPopup) statsPopup.classList.add("hidden");
            });
        }
        
        const statsExportBtn = document.getElementById("stats-export-btn");
        if (statsExportBtn) {
            statsExportBtn.addEventListener("click", () => {
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
        }

        const chartToggle = document.getElementById("chart-toggle-btn");
        if (chartToggle) {
            chartToggle.addEventListener("click", (e) => {
                this.chartMode = this.chartMode === 'year' ? 'time' : 'year';
                e.target.textContent = this.chartMode === 'year' ? I18n.t('stats_axis_year') : I18n.t('stats_axis_time');
                this.buildStatsTable();
            });
        }
    },

    update() {
        if (!UI.els.stock) return;
        
        // Stock + sell section is always visible
        UI.els.stock.parentElement.style.display = "";
        const sellBtnMax = document.getElementById("sell-btn-max");
        if (sellBtnMax) sellBtnMax.style.display = "";

        UI.els.stock.textContent = UI.formatNumber(Game.transistors);
        const exactStock = document.getElementById("exact-stock");
        if (exactStock) exactStock.textContent = UI.formatExact(Game.transistors);

        UI.els.perYear.textContent = I18n.t("per_year", { val: UI.formatNumber(Game.productionPerYear.mul(CONFIG.DISPLAY_MULTIPLIER)) });
        const exactProd = document.getElementById("exact-prod");
        if (exactProd) exactProd.textContent = I18n.t("per_year", { val: UI.formatExact(Game.productionPerYear.mul(CONFIG.DISPLAY_MULTIPLIER)) });

        UI.els.money.textContent = UI.formatMoney(Game.money);
        const exactMoney = document.getElementById("exact-money");
        if (exactMoney) exactMoney.textContent = "$" + UI.formatExact(Game.money);
        
        if (UI.els.stickyMoney) UI.els.stickyMoney.textContent = UI.els.money.textContent;
        if (UI.els.stickyPerYear) UI.els.stickyPerYear.textContent = UI.els.perYear.textContent;
        
        UI.els.unitPrice.textContent = UI.formatPrice(Game.getEffectivePrice());
        const exactPrice = document.getElementById("exact-price");
        if (exactPrice) exactPrice.textContent = UI.formatExactPrice(Game.getEffectivePrice());
        UI.els.playTime.textContent = UI.formatTime(Game.virtualElapsed);
        
        let displayClickPower = Game.clickPower;
        if (Game.boostMs > 0) {
            displayClickPower = displayClickPower.mul(50);
        }
        
        let clickText = I18n.t("per_click", { val: UI.formatNumber(displayClickPower) });
        if (Game.globals.expertMode && Game.productionPerYear.gt(0)) {
            // Compare real click power vs real yearly production (x25 cancels out)
            const clickPct = displayClickPower.div(Game.productionPerYear).mul(100);
            let pctStr;
            if (clickPct.gte(1)) pctStr = clickPct.toNumber().toFixed(1);
            else if (clickPct.gte(0.01)) pctStr = clickPct.toNumber().toFixed(3);
            else pctStr = clickPct.toExponential(1);
            clickText += ` [${pctStr}%]`;
        }
        UI.els.clickPowerDisplay.textContent = clickText;
        
        const worldProdValue = new Decimal(_worldProd(Game.currentYear));
        // World production is historical (x1)
        UI.els.worldProd.textContent = I18n.t("per_year", { val: UI.formatNumber(worldProdValue) });

        // Market share calculation: uses the x25 scaled production vs historical world production
        if (worldProdValue.gt(0) && Game.productionPerYear.gt(0)) {
            const playerProdScaled = Game.productionPerYear.mul(CONFIG.DISPLAY_MULTIPLIER);
            const share = playerProdScaled.div(worldProdValue).mul(100);
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

        // Year progress (Reverted to x1 as requested)
        const yp = getYearProgress(Game.totalTransistors);
        UI.els.yearTotalProduced.textContent = UI.formatNumber(Game.totalTransistors);
        UI.els.yearProgressFill.style.width = (yp.progress * 100).toFixed(1) + "%";
        
        const advancedTotalEl = document.getElementById("total-transistors-advanced");
        if (advancedTotalEl) advancedTotalEl.textContent = UI.formatNumber(Game.totalTransistors);

        // Exact numbers for Settings tab
        document.querySelectorAll(".exact-total-produced").forEach(el => {
            el.textContent = UI.formatExact(Game.totalTransistors);
        });
        document.querySelectorAll(".exact-per-year").forEach(el => {
            el.textContent = UI.formatExact(Game.productionPerYear.mul(CONFIG.DISPLAY_MULTIPLIER));
        });

        if (yp.needed > 0) {
            UI.els.yearNextLabel.textContent = UI.formatNumber(yp.needed);
            const exactProg = document.getElementById("exact-progression");
            if (exactProg) exactProg.textContent = UI.formatExact(yp.needed);
        } else {
            UI.els.yearNextLabel.textContent = "MAX";
            const exactProg = document.getElementById("exact-progression");
            if (exactProg) exactProg.textContent = "MAX";
        }
    },

    buildStatsTable() {
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
        html += `<th class="current-run">${I18n.t("stats_current_run")}</th></tr></thead><tbody>`;

        html += `<tr><td class="row-label">${I18n.t("stats_total_time")}</td>`;
        history.forEach(run => html += `<td>${UI.formatTime(run.totalElapsed)}</td>`);
        html += `<td class="current-run">${UI.formatTime(currentElapsed)}</td></tr>`;

        html += `<tr><td class="row-label">${I18n.t("stats_assisted")}</td>`;
        history.forEach(run => html += `<td>${run.usedAssistance ? I18n.t("stats_yes") + ' 🤖' : I18n.t("stats_no")}</td>`);
        html += `<td class="current-run">${Game.usedAssistance ? I18n.t("stats_yes") + ' 🤖' : I18n.t("stats_no")}</td></tr>`;

        html += `<tr><td class="row-label">${I18n.t("stats_max_world_prod")}</td>`;
        history.forEach(run => html += `<td>${UI.formatNumber(new Decimal(_worldProd(run.maxYear || 1947)))}/an</td>`);
        html += `<td class="current-run">${UI.formatNumber(new Decimal(_worldProd(Game.currentYear)))}/an</td></tr>`;

        html += `<tr><td class="row-label">${I18n.t("stats_max_year")}</td>`;
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
        container.innerHTML = (history.length === 0 && relevantDecades.length === 0) ? `<p>${I18n.t("stats_no_data")}</p>` : html;
        this.renderStatsChart(history, currentMilestones, relevantDecades);
        this.buildEquivalences();
    },

    buildEquivalences() {
        const container = document.getElementById("stats-equiv-container");
        if (!container) return;
        
        let html = `<h3 style="margin-top: 30px; color: var(--gold); text-align: left;">${I18n.t("equiv_title")}</h3>`;
        html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
        
        EQUIVALENCES.forEach(eq => {
            const canProduce = Game.totalTransistors.div(eq.trans).floor();
            const percentage = canProduce.div(eq.world).mul(100);
            
            let pctStr = "";
            if (percentage.gte(100)) pctStr = UI.formatNumber(percentage) + "%";
            else if (percentage.gte(1)) pctStr = percentage.toNumber().toFixed(1) + "%";
            else pctStr = percentage.toNumber().toFixed(3) + "%";
            
            html += `
            <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 10px; border-radius: 8px; text-align: left; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 1.5rem; margin-right: 10px;">${eq.icon}</span>
                    <strong style="color: var(--text);">${I18n.t("equiv_" + eq.id)}</strong>
                    <div class="tooltip-container" style="margin-left: 8px; cursor: help; color: var(--text-dim); border-bottom: 1px dotted var(--text-dim); display: inline-block;">
                        ?
                        <div class="tooltip-text" style="width: 250px; white-space: normal; text-transform: none;">${I18n.t("equiv_" + eq.id + "_info")}</div>
                    </div>
                </div>
                <div style="text-align: right; font-size: 0.9rem;">
                    <div style="color: var(--accent);">${I18n.t("equiv_can_produce")}: <b>${UI.formatNumber(canProduce)}</b></div>
                    <div style="color: var(--text-dim);">${I18n.t("equiv_world_pct")}: <b>${pctStr}</b></div>
                </div>
            </div>`;
        });
        
        html += `<div style="margin-top: 15px; font-size: 0.85rem; color: var(--text-dim); text-align: left;">
            <p><strong>${I18n.t("equiv_can_produce")} :</strong> ${I18n.t("equiv_qty_help")}</p>
            <p style="margin-top:4px;"><strong>${I18n.t("equiv_world_pct")} :</strong> ${I18n.t("equiv_pct_help")}</p>
        </div>`;

        // Weights section
        html += `<h3 style="margin-top: 30px; color: var(--gold); text-align: left;">${I18n.t("weight_intro")}</h3>`;
        html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
        
        let highestWeight = null;
        WEIGHTS.forEach(w => {
            if (Game.totalTransistors.gte(w.trans)) {
                highestWeight = w;
            }
        });
        
        if (highestWeight) {
            const count = Game.totalTransistors.div(highestWeight.trans).floor();
            html += `
            <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 10px; border-radius: 8px; text-align: left; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 1.5rem; margin-right: 10px;">${highestWeight.icon}</span>
                    <strong style="color: var(--text);">${I18n.t("weight_" + highestWeight.id)}</strong>
                </div>
                <div style="text-align: right; font-size: 1.1rem; color: var(--accent); font-weight: bold;">
                    ${UI.formatNumber(count)}
                </div>
            </div>`;
        } else {
            // If less than a car (1.5e5 transistors * 10g = 1500kg = 1.5t)
            // Let's show raw kg. 1 trans = 10g = 0.01kg.
            const kg = Game.totalTransistors.mul(0.01).toNumber();
            html += `
            <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 10px; border-radius: 8px; text-align: left; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 1.5rem; margin-right: 10px;">⚖️</span>
                    <strong style="color: var(--text);">Masse brute</strong>
                </div>
                <div style="text-align: right; font-size: 1.1rem; color: var(--text-dim); font-weight: bold;">
                    ${kg < 1 ? (kg * 1000).toFixed(0) + " g" : kg.toFixed(2) + " kg"}
                </div>
            </div>`;
        }
        
        html += `</div>`;

        
        // Time to produce 1970
        const prod1970 = new Decimal(CONFIG.WORLD_PROD_1970); // Exact value from _worldProd(1970)
        let timeStr = I18n.t("time_infinity");
        if (Game.productionPerYear.gt(0)) {
            const prodPerSec = Game.productionPerYear.div(CONFIG.SECONDS_PER_YEAR); // Real seconds
            const effectiveProdPerSec = prodPerSec.mul(Game.getEffectiveTimeMultiplier());
            const secondsNeeded = prod1970.div(effectiveProdPerSec).toNumber();
            
            timeStr = this.formatDuration(secondsNeeded);
        }
        
        html += `<div style="margin-top: 15px; padding: 15px; background: rgba(56, 189, 248, 0.1); border: 1px solid var(--accent); border-radius: 8px; text-align: left; font-size: 0.95rem; color: var(--text); line-height: 1.5;">
            ${I18n.t("time_to_1970")} : <br><strong style="color: var(--accent); font-size: 1.1rem;">${timeStr}</strong>
        </div>`;
        
        html += `</div>`;
        container.innerHTML = html;
    },

    formatDuration(seconds) {
        if (!isFinite(seconds) || seconds < 0) return I18n.t("time_infinity");
        if (seconds === 0) return I18n.t("time_instant");
        
        if (seconds < 1) {
            if (seconds >= 1e-3) return (seconds * 1000).toFixed(2) + " " + I18n.t("time_ms");
            if (seconds >= 1e-6) return (seconds * 1e6).toFixed(2) + " " + I18n.t("time_us");
            return (seconds * 1e9).toFixed(2) + " " + I18n.t("time_ns");
        }
        
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
    },

    renderStatsChart(history, currentMilestones, relevantDecades) {
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
            const data = this.chartMode === 'year' 
                ? labels.map(y => run.yearlyProduction[y]?.prod ? new Decimal(run.yearlyProduction[y].prod).mul(CONFIG.DISPLAY_MULTIPLIER).toNumber() : null)
                : Object.values(run.yearlyProduction).map(v => ({ x: v.time, y: new Decimal(v.prod).mul(CONFIG.DISPLAY_MULTIPLIER).toNumber() }));
            
            datasets.push({
                label: `Run ${i + 1}`,
                data: data,
                borderColor: colors[i % colors.length],
                borderWidth: 2, pointRadius: 0, fill: false, tension: 0.1
            });
        });

        const currentData = this.chartMode === 'year'
            ? labels.map(y => Game.yearlyProduction[y]?.prod ? new Decimal(Game.yearlyProduction[y].prod).mul(CONFIG.DISPLAY_MULTIPLIER).toNumber() : null)
            : Object.values(Game.yearlyProduction).map(v => ({ x: v.time, y: new Decimal(v.prod).mul(CONFIG.DISPLAY_MULTIPLIER).toNumber() }));
        
        datasets.push({
            label: I18n.t('stats_current_run'),
            data: currentData,
            borderColor: '#ffffff',
            borderWidth: 2, pointRadius: 0, borderDash: [5, 5], fill: false, tension: 0.1
        });

        if (this.statsChartInstance) this.statsChartInstance.destroy();
        this.statsChartInstance = new Chart(canvas, {
            type: 'line',
            data: { datasets, labels: this.chartMode === 'year' ? labels : undefined },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: this.chartMode === 'year' ? { type: 'category' } : { type: 'linear', ticks: { callback: v => UI.formatTime(v) } },
                    y: { type: 'logarithmic', ticks: { callback: v => UI.formatNumber(v) } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: items => this.chartMode === 'time' ? UI.formatTime(items[0].parsed.x) : items[0].label,
                            label: item => `${item.dataset.label}: ${UI.formatNumber(item.parsed.y)}/an`
                        }
                    }
                }
            }
        });
    }

};
