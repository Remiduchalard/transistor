/**
 * config.js — Game constants, eras, and year progression thresholds
 *
 * Production model:
 *   1947–1970: exponential from 1 to 1 billion/year
 *              prod(year) = (1e9)^((year-1947)/23)  → ×2.46/year
 *   1970+:     doubles every 14 months
 *              prod(year) = 1e9 × 2^((year-1970)×6/7)
 *
 *   Year thresholds = cumulative integral of the production curve.
 */

const CONFIG = {
    // Aesthetics
    DISPLAY_MULTIPLIER: 25, // Multiply displayed production numbers
    WORLD_PROD_1970: 1014120480, // Base value used for time estimations

    // Game tick rate (ms)
    TICK_INTERVAL: 50,

    // How many real seconds = 1 game year
    SECONDS_PER_YEAR: 1,

    // Starting year
    START_YEAR: 1947,

    // Price scaling factor per unit owned
    PRICE_SCALE: 1.15,

    // Transistor click base
    CLICK_BASE: 1,

    // Year thresholds based on cumulative world production
    // Calculated as the integral of _worldProd(y) from 1947 to y
    YEAR_THRESHOLDS: [
        { year: 1947, transistors: 0 },
        { year: 1948, transistors: 1 },
        { year: 1950, transistors: 9 },
        { year: 1955, transistors: 922 },
        { year: 1960, transistors: 83556 },
        { year: 1965, transistors: 7559679 },
        { year: 1970, transistors: 683951300 },
        { year: 1975, transistors: 23487918750 },
        { year: 1980, transistors: 468261481818 },
        { year: 1985, transistors: 9143222224375 },
        { year: 1990, transistors: 178341551742195 },
        { year: 1995, transistors: 3478422734955176 },
        { year: 2000, transistors: 67843927092073300 },
        { year: 2005, transistors: 1323242785829427000 },
        { year: 2010, transistors: 25808816390206243000 },
        { year: 2015, transistors: 503380793266430540000 },
        { year: 2020, transistors: 9818048964107098000000 },
        { year: 2025, transistors: 191493371918324530000000 },
    ],

    // Eras with names and descriptions
    ERAS: [
        { startYear: 1947, name: I18n.t("era_0_name"), desc: I18n.t("era_0_desc") },
        { startYear: 1955, name: I18n.t("era_1_name"), desc: I18n.t("era_1_desc") },
        { startYear: 1961, name: I18n.t("era_2_name"), desc: I18n.t("era_2_desc") },
        { startYear: 1971, name: I18n.t("era_3_name"), desc: I18n.t("era_3_desc") },
        { startYear: 1980, name: I18n.t("era_4_name"), desc: I18n.t("era_4_desc") },
        { startYear: 1993, name: I18n.t("era_5_name"), desc: I18n.t("era_5_desc") },
        { startYear: 2000, name: I18n.t("era_6_name"), desc: I18n.t("era_6_desc") },
        { startYear: 2010, name: I18n.t("era_7_name"), desc: I18n.t("era_7_desc") },
        { startYear: 2018, name: I18n.t("era_8_name"), desc: I18n.t("era_8_desc") },
        { startYear: 2023, name: I18n.t("era_9_name"), desc: I18n.t("era_9_desc") },
    ],

    // Price of a transistor varies by year (in dollars)
    // ÷2 every 24 months, anchored on real data points
    TRANSISTOR_PRICES: [
        { year: 1947, price: 45.00 },         // first transistor, lab-made
        { year: 1950, price: 18.00 },
        { year: 1954, price: 5.00 },
        { year: 1958, price: 1.50 },
        { year: 1962, price: 0.50 },
        { year: 1966, price: 0.20 },
        { year: 1970, price: 0.10 },          // known
        { year: 1974, price: 0.01 },
        { year: 1978, price: 0.004 },
        { year: 1980, price: 0.002 },         // known
        { year: 1984, price: 0.0005 },
        { year: 1988, price: 0.0002 },
        { year: 1990, price: 0.0001 },        // known
        { year: 1994, price: 0.000005 },
        { year: 1998, price: 0.000001 },
        { year: 2000, price: 5e-7 },          // known
        { year: 2004, price: 1.5e-7 },
        { year: 2008, price: 7e-8 },
        { year: 2010, price: 5e-8 },          // known
        { year: 2014, price: 1.2e-8 },
        { year: 2018, price: 5e-9 },
        { year: 2020, price: 3e-9 },          // known
        { year: 2024, price: 1e-9 },          // known
        { year: 2025, price: 5e-10 },         // known (current)
    ],
};

/**
 * Get the current era for a given year
 */
function getCurrentEra(year) {
    let era = CONFIG.ERAS[0];
    for (const e of CONFIG.ERAS) {
        if (year >= e.startYear) era = e;
    }
    return era;
}

/**
 * Get the transistor unit price for a given year (interpolated)
 */
function getTransistorPrice(year) {
    const prices = CONFIG.TRANSISTOR_PRICES;
    if (year <= prices[0].year) return prices[0].price;

    // Beyond last data point: extrapolate ÷2 every 24 months
    const last = prices[prices.length - 1];
    if (year >= last.year) {
        const yearsAfter = year - last.year;
        return last.price * Math.pow(0.5, yearsAfter / 2);
    }

    for (let i = 0; i < prices.length - 1; i++) {
        if (year >= prices[i].year && year < prices[i + 1].year) {
            const t = (year - prices[i].year) / (prices[i + 1].year - prices[i].year);
            const logA = Math.log(prices[i].price);
            const logB = Math.log(prices[i + 1].price);
            return Math.exp(logA + t * (logB - logA));
        }
    }
    return last.price;
}

/**
 * Compute the game year based on total transistors produced.
 * Beyond the last threshold, extrapolates using the doubling-every-14-months curve.
 */
function computeYear(totalTransistors) {
    const thresholds = CONFIG.YEAR_THRESHOLDS;
    if (totalTransistors <= 0) return CONFIG.START_YEAR;

    const last = thresholds[thresholds.length - 1];

    // Beyond last threshold: extrapolate
    if (totalTransistors >= last.transistors) {
        // Production doubles every 14 months → cumulative grows similarly
        // Solve: last.transistors * 2^((y - last.year) * 12/14) = totalTransistors
        const ratio = totalTransistors / last.transistors;
        const extraYears = Math.log2(ratio) * 14 / 12;
        return Math.floor(last.year + extraYears);
    }

    for (let i = thresholds.length - 2; i >= 0; i--) {
        if (totalTransistors >= thresholds[i].transistors) {
            const current = thresholds[i];
            const next = thresholds[i + 1];
            const progress = (totalTransistors - current.transistors) / (next.transistors - current.transistors);
            const yearProgress = Math.min(progress, 1) * (next.year - current.year);
            return Math.floor(current.year + yearProgress);
        }
    }
    return CONFIG.START_YEAR;
}

/**
 * Get the progress toward the next year (0 to 1) and the next year's threshold
 */
function getYearProgress(totalTransistors) {
    const thresholds = CONFIG.YEAR_THRESHOLDS;
    const currentYear = computeYear(totalTransistors);

    // Find which two thresholds we're between
    for (let i = 0; i < thresholds.length - 1; i++) {
        const current = thresholds[i];
        const next = thresholds[i + 1];

        if (totalTransistors >= current.transistors && totalTransistors < next.transistors) {
            const yearSpan = next.year - current.year;
            const transistorSpan = next.transistors - current.transistors;
            const transistorsPerYear = transistorSpan / yearSpan;

            const transistorsIntoSegment = totalTransistors - current.transistors;
            const currentYearInSegment = currentYear - current.year;
            const transistorsAtCurrentYear = currentYearInSegment * transistorsPerYear;
            const transistorsAtNextYear = (currentYearInSegment + 1) * transistorsPerYear;

            const progressInYear = (transistorsIntoSegment - transistorsAtCurrentYear) /
                                   (transistorsAtNextYear - transistorsAtCurrentYear);

            return {
                progress: Math.max(0, Math.min(1, progressInYear)),
                nextYear: currentYear + 1,
                needed: Math.ceil(current.transistors + transistorsAtNextYear),
            };
        }
    }

    // Beyond last threshold: extrapolate using doubling curve
    const last = thresholds[thresholds.length - 1];
    if (totalTransistors >= last.transistors) {
        // Threshold for year Y after last: last.transistors * 2^((Y-last.year)*12/14)
        const yearsFromLast = currentYear - last.year;
        const thresholdCurrent = last.transistors * Math.pow(2, yearsFromLast * 12 / 14);
        const thresholdNext = last.transistors * Math.pow(2, (yearsFromLast + 1) * 12 / 14);

        const progressInYear = (totalTransistors - thresholdCurrent) / (thresholdNext - thresholdCurrent);

        return {
            progress: Math.max(0, Math.min(1, progressInYear)),
            nextYear: currentYear + 1,
            needed: Math.ceil(thresholdNext),
        };
    }

    return { progress: 0, nextYear: CONFIG.START_YEAR + 1, needed: 0 };
}
