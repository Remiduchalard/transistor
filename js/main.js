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
            if (settingsPopup) settingsPopup.classList.add("hidden");
            if (UI.Stats) UI.Stats.buildStatsTable();
            if (statsPopup) statsPopup.classList.remove("hidden");
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
    function handleOfflineData(data) {
        if (typeof data === "object" && data !== null && data !== true) {
            const offlinePopup = document.getElementById("offline-popup");
            document.getElementById("offline-time").textContent = UI.formatTime(data.offlineMs);
            document.getElementById("offline-rate").textContent = Math.round(data.rate * 100);
            document.getElementById("offline-produced").textContent = UI.formatNumber(data.produced);
            document.getElementById("offline-earned").textContent = UI.formatMoney(data.earned);
            offlinePopup.classList.remove("hidden");
            
            const closeBtn = document.getElementById("offline-close-btn");
            // Remove old listeners to avoid multiple popups stacking behaviors
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener("click", () => {
                offlinePopup.classList.add("hidden");
            });
        }
    }

    handleOfflineData(loadResult);

    // Capacitor App State Handling
    let isPaused = false;
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        const App = window.Capacitor.Plugins.App;
        App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                console.log("App resumed. Calculating offline progress...");
                isPaused = false;
                lastTick = performance.now();
                const offlineData = Game.processOfflineProgress();
                if (offlineData) {
                    handleOfflineData(offlineData);
                    Events.emit('shopUpdated');
                    Events.emit('statsUpdated');
                }
            } else {
                console.log("App backgrounded. Saving and pausing...");
                Game.save();
                isPaused = true;
            }
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

        const statsExportBtn = document.getElementById("stats-export-btn");

        if (Game.globals.expertMode) {
            expertStatsRow.classList.remove("hidden");
            if (statsExportBtn) statsExportBtn.classList.remove("hidden");
        } else {
            expertStatsRow.classList.add("hidden");
            if (statsExportBtn) statsExportBtn.classList.add("hidden");
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
    
    // Handle tab visibility to process missed time properly
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            const now = performance.now();
            const missedMs = now - lastTick;
            
            // If we missed more than 10 seconds (tab was inactive)
            // Using processOfflineProgress to apply offlineRate as requested
            if (missedMs > 10000) {
                console.log(`Tab was inactive for ${missedMs}ms. Catching up...`);
                const offlineData = Game.processOfflineProgress();
                if (offlineData) {
                    handleOfflineData(offlineData);
                    Events.emit('shopUpdated');
                    Events.emit('statsUpdated');
                    if (UI.Shop) UI.Shop.update();
                }
            }
            
            // Reset lastTick to now so the main loop doesn't process the huge delta again
            lastTick = performance.now();
            isPaused = false;
        } else {
            isPaused = true;
            Game.save();
        }
    });

    function gameLoop(now) {
        const tickStart = performance.now();
        let delta = now - lastTick;
        lastTick = now;

        if (isPaused) {
            requestAnimationFrame(gameLoop);
            return;
        }
        
        // Prevent huge lag spikes when switching tabs (cap at 1 second)
        if (delta > 1000) {
            delta = 1000;
        }
        
        const oldYear = Game.currentYear;
        
        Game.tick(delta);
        if (typeof Bot !== 'undefined') Bot.tick(delta * Game.getEffectiveTimeMultiplier());

        if (Game.currentYear !== oldYear) {
            Game.checkDecadeMilestone();
            Events.emit('shopUpdated');
            if (typeof Bot !== 'undefined' && Bot.active) {
                const worldProd = new Decimal(_worldProd(Game.currentYear));
                const share = worldProd.gt(0) && Game.productionPerYear.gt(0) ? Game.productionPerYear.mul(CONFIG.DISPLAY_MULTIPLIER).div(worldProd).mul(100) : new Decimal(0);
                
                let shareStr = "";
                if (share.gte(100)) shareStr = UI.formatNumber(share) + "%";
                else if (share.gte(1)) shareStr = share.toNumber().toFixed(1) + "%";
                else if (share.gte(0.01)) shareStr = share.toNumber().toFixed(3) + "%";
                else shareStr = share.toExponential(1) + "%";
                
                let clickPctStr = "0%";
                if (Game.productionPerYear.gt(0)) {
                    let displayClickPower = Game.clickPower;
                    if (Game.boostMs > 0) displayClickPower = displayClickPower.mul(50);
                    const clickPct = displayClickPower.div(Game.productionPerYear).mul(100);
                    if (clickPct.gte(1)) clickPctStr = clickPct.toNumber().toFixed(1) + "%";
                    else if (clickPct.gte(0.01)) clickPctStr = clickPct.toNumber().toFixed(3) + "%";
                    else clickPctStr = clickPct.toExponential(1) + "%";
                }
                
                console.log(`[Bot] ${Game.currentYear} atteinte | Temps de jeu : ${UI.formatTime(Game.virtualElapsed)} | Part de marché : ${shareStr} | Clic = ${clickPctStr} de la prod annuelle`);
            }
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
    setInterval(() => {
        if (!isPaused) Game.save();
    }, 30_000);
    window.addEventListener("beforeunload", () => Game.save());

})();
