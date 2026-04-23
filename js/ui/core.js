/**
 * js/ui/core.js — Base UI logic and element caching
 */

const UI = {
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
            mobileEraName: document.getElementById("mobile-era-name"),
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

        // Initialize sub-modules
        if (this.Stats) this.Stats.init();
        if (this.Shop) this.Shop.init();
        if (this.Notifications) this.Notifications.init();

        // Listen for language changes
        Events.on('languageChanged', () => {
            if (this.Shop) this.Shop.fullRefresh();
            this.updateStats();
        });
    },

    updateStats() {
        if (this.Stats) this.Stats.update();
    },

    // Global helpers inherited by submodules or used externally
    formatExact(val) {
        const d = new Decimal(val);
        if (d.eq(0)) return "0";
        if (d.lt(0)) return "-" + this.formatExact(d.abs());
        
        let str;
        // Check if Decimal has an object structure that allows us to bypass scientific notation
        if (typeof d.toFixed === 'function') {
            // For Decimal.js or BreakEternity.js, toFixed usually returns string representation without e
            // If it still returns 'e', we can manually construct the string from mantissa/exponent
            if (d.mantissa !== undefined && d.exponent !== undefined) {
                let mStr = Math.abs(d.mantissa).toString();
                let e = d.exponent;
                
                let decimalPos = mStr.indexOf(".");
                if (decimalPos !== -1) {
                    mStr = mStr.replace(".", "");
                    e -= (mStr.length - decimalPos);
                }
                
                if (e >= 0) {
                    str = mStr + "0".repeat(e);
                } else {
                    // Fallback for very weird edge cases or small numbers
                    str = d.floor().toString();
                }
            } else {
                str = d.floor().toString();
                // If it still contains 'e', manual parse
                if (str.includes('e')) {
                    const [base, exp] = str.split('e');
                    let zeros = parseInt(exp);
                    str = base.replace('.', '');
                    zeros -= (str.length - 1);
                    if (zeros > 0) str += '0'.repeat(zeros);
                }
            }
        } else {
            str = Math.floor(val).toString();
        }
        
        // Add spaces every 3 digits
        return str.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    formatExactPrice(val) {
        const d = new Decimal(val);
        if (d.eq(0)) return "$0.00";
        if (d.gte(1)) return "$" + d.toNumber().toFixed(2);

        // Find the first non-zero digit after the decimal point
        const numStr = d.toExponential(2); // e.g. "3.33e-4"
        const numParts = numStr.split('e');
        const coefficient = parseFloat(numParts[0]); // e.g. 3.33
        const exponent = parseInt(numParts[1]); // e.g. -4

        // Construct the string with exactly 2 digits after the first non-zero
        // Using Decimal to avoid float precision issues when converting back to string
        const truncated = new Decimal(coefficient).mul(new Decimal(10).pow(exponent));

        // We need to format it to a fixed number of decimal places to avoid scientific notation
        // The number of decimal places is absolute(exponent) + 2 (for the two digits after the first non-zero)
        let str = truncated.toFixed(Math.abs(exponent) + 2);

        // Remove trailing zeros to keep it clean if it was shorter than 2 digits
        str = str.replace(/0+$/, "");
        if (str.endsWith('.')) str = str.slice(0, -1);

        return "$" + str;
    },
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

        return d.floor().toNumber().toLocaleString(I18n.lang === 'fr' ? 'fr-FR' : 'en-US');
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
        if (d.eq(0)) return "$0.00";
        if (d.gte(1)) return "$" + d.toNumber().toFixed(2);
        
        const microSuffixes = [
            { value: new Decimal(1e-3),  suffix: " m" },
            { value: new Decimal(1e-6),  suffix: " µ" },
            { value: new Decimal(1e-9),  suffix: " n" },
            { value: new Decimal(1e-12), suffix: " p" },
            { value: new Decimal(1e-15), suffix: " f" },
            { value: new Decimal(1e-18), suffix: " a" },
            { value: new Decimal(1e-21), suffix: " z" },
            { value: new Decimal(1e-24), suffix: " y" },
            { value: new Decimal(1e-27), suffix: " r" },
            { value: new Decimal(1e-30), suffix: " q" }
        ];

        for (const { value, suffix } of microSuffixes) {
            if (d.gte(value)) {
                const display = d.div(value).toNumber();
                return "$" + display.toFixed(display < 10 ? 2 : display < 100 ? 1 : 0) + suffix;
            }
        }
        
        return "$" + d.toExponential(2);
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
    }
};
