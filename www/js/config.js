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
        { year: 1949, transistors: 3 },
        { year: 1950, transistors: 9 },
        { year: 1951, transistors: 24 },
        { year: 1952, transistors: 61 },
        { year: 1953, transistors: 151 },
        { year: 1954, transistors: 374 },
        { year: 1955, transistors: 922 },
        { year: 1956, transistors: 2273 },
        { year: 1957, transistors: 5597 },
        { year: 1958, transistors: 13783 },
        { year: 1959, transistors: 33936 },
        { year: 1960, transistors: 83556 },
        { year: 1961, transistors: 205723 },
        { year: 1962, transistors: 506512 },
        { year: 1963, transistors: 1247080 },
        { year: 1964, transistors: 3070428 },
        { year: 1965, transistors: 7559679 },
        { year: 1966, transistors: 18612631 },
        { year: 1967, transistors: 45826018 },
        { year: 1968, transistors: 112827893 },
        { year: 1969, transistors: 277792701 },
        { year: 1970, transistors: 683951300 },
        { year: 1971, transistors: 1683951300 },
        { year: 1972, transistors: 3495398628 },
        { year: 1973, transistors: 6776740052 },
        { year: 1974, transistors: 12720717209 },
        { year: 1975, transistors: 23487918750 },
        { year: 1976, transistors: 42992137217 },
        { year: 1977, transistors: 78323001655 },
        { year: 1978, transistors: 142323001655 },
        { year: 1979, transistors: 258255630680 },
        { year: 1980, transistors: 468261481818 },
        { year: 1981, transistors: 848676019837 },
        { year: 1982, transistors: 1537776918465 },
        { year: 1983, transistors: 2786046900371 },
        { year: 1984, transistors: 5047222224375 },
        { year: 1985, transistors: 9143222224375 },
        { year: 1986, transistors: 16562910482025 },
        { year: 1987, transistors: 30003284954854 },
        { year: 1988, transistors: 54349815388073 },
        { year: 1989, transistors: 98452272900250 },
        { year: 1990, transistors: 178341551742195 },
        { year: 1991, transistors: 323056772478449 },
        { year: 1992, transistors: 585200772478449 },
        { year: 1993, transistors: 1060060820968044 },
        { year: 1994, transistors: 1920244787229110 },
        { year: 1995, transistors: 3478422734955176 },
        { year: 1996, transistors: 6300980015734504 },
        { year: 1997, transistors: 11413893861618948 },
        { year: 1998, transistors: 20675667988739196 },
        { year: 1999, transistors: 37452883988739200 },
        { year: 2000, transistors: 67843927092073300 },
        { year: 2001, transistors: 122895700932781500 },
        { year: 2002, transistors: 222619089587249760 },
        { year: 2003, transistors: 403262755557126700 },
        { year: 2004, transistors: 730489241693731100 },
        { year: 2005, transistors: 1323242785829427000 },
        { year: 2006, transistors: 2396984609829427000 },
        { year: 2007, transistors: 4342011368442809300 },
        { year: 2008, transistors: 7865324894248135000 },
        { year: 2009, transistors: 14247621768134087000 },
        { year: 2010, transistors: 25808816390206243000 },
        { year: 2011, transistors: 46751311502948925000 },
        { year: 2012, transistors: 84687538327633560000 },
        { year: 2013, transistors: 153407015063633560000 },
        { year: 2014, transistors: 277888727614889720000 },
        { year: 2015, transistors: 503380793266430540000 },
        { year: 2016, transistors: 911847793195131600000 },
        { year: 2017, transistors: 1.6517642490077496e+21 },
        { year: 2018, transistors: 2.9920839362232813e+21 },
        { year: 2019, transistors: 5.420002453003098e+21 },
        { year: 2020, transistors: 9.818048964107098e+21 },
        { year: 2021, transistors: 1.778487856738749e+22 },
        { year: 2022, transistors: 3.22163707690861e+22 },
        { year: 2023, transistors: 5.835825876452297e+22 },
        { year: 2024, transistors: 1.057129119365305e+23 },
        { year: 2025, transistors: 1.9149337191832453e+23 },
        { year: 2026, transistors: 3.468801569922328e+23 },
        { year: 2027, transistors: 6.283551337028888e+23 },
        { year: 2028, transistors: 1.138232228312834e+24 },
        { year: 2029, transistors: 2.0618477292215452e+24 },
        { year: 2030, transistors: 3.734928560929504e+24 },
        { year: 2031, transistors: 6.765626363937986e+24 },
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
    if (year <= prices[0].year) return new Decimal(prices[0].price);

    // Beyond last data point: extrapolate ÷2 every 24 months
    const last = prices[prices.length - 1];
    if (year >= last.year) {
        const yearsAfter = year - last.year;
        return new Decimal(last.price).mul(new Decimal(0.5).pow(yearsAfter / 2));
    }

    for (let i = 0; i < prices.length - 1; i++) {
        if (year >= prices[i].year && year < prices[i + 1].year) {
            const t = (year - prices[i].year) / (prices[i + 1].year - prices[i].year);
            const pA = new Decimal(prices[i].price);
            const pB = new Decimal(prices[i + 1].price);
            // Logarithmic interpolation
            return pA.mul(pB.div(pA).pow(t));
        }
    }
    return new Decimal(last.price);
}

/**
 * Compute the game year based on total transistors produced.
 * Beyond the last threshold, extrapolates using the doubling-every-14-months curve.
 */
function computeYear(totalTransistors) {
    const thresholds = CONFIG.YEAR_THRESHOLDS;
    const total = new Decimal(totalTransistors);
    if (total.lte(0)) return CONFIG.START_YEAR;

    const last = thresholds[thresholds.length - 1];
    const lastTransistors = new Decimal(last.transistors);

    // Beyond last threshold: extrapolate
    if (total.gte(lastTransistors)) {
        // Production doubles every 14 months → cumulative grows similarly
        // Solve: last.transistors * 2^((y - last.year) * 12/14) = totalTransistors
        const ratio = total.div(lastTransistors);
        const extraYears = ratio.log10() / Math.log10(2) * 14 / 12;
        return Math.floor(last.year + extraYears);
    }

    for (let i = thresholds.length - 2; i >= 0; i--) {
        const currentThresh = new Decimal(thresholds[i].transistors);
        if (total.gte(currentThresh)) {
            const nextThresh = new Decimal(thresholds[i + 1].transistors);
            const progress = total.sub(currentThresh).div(nextThresh.sub(currentThresh));
            const yearProgress = Decimal.min(progress, 1).toNumber() * (thresholds[i + 1].year - thresholds[i].year);
            return Math.floor(thresholds[i].year + yearProgress);
        }
    }
    return CONFIG.START_YEAR;
}

/**
 * Get the progress toward the next year (0 to 1) and the next year's threshold
 */
function getYearProgress(totalTransistors) {
    const thresholds = CONFIG.YEAR_THRESHOLDS;
    const total = new Decimal(totalTransistors);
    const currentYear = computeYear(total);

    // Find which two thresholds we're between
    for (let i = 0; i < thresholds.length - 1; i++) {
        const current = thresholds[i];
        const next = thresholds[i + 1];
        const currentThresh = new Decimal(current.transistors);
        const nextThresh = new Decimal(next.transistors);

        if (total.gte(currentThresh) && total.lt(nextThresh)) {
            const yearSpan = next.year - current.year;
            const transistorSpan = nextThresh.sub(currentThresh);
            const transistorsPerYear = transistorSpan.div(yearSpan);

            const transistorsIntoSegment = total.sub(currentThresh);
            const currentYearInSegment = currentYear - current.year;
            const transistorsAtCurrentYear = transistorsPerYear.mul(currentYearInSegment);
            const transistorsAtNextYear = transistorsPerYear.mul(currentYearInSegment + 1);

            const progressInYear = transistorsIntoSegment.sub(transistorsAtCurrentYear).div(
                transistorsAtNextYear.sub(transistorsAtCurrentYear)
            );

            return {
                progress: Math.max(0, Math.min(1, progressInYear.toNumber())),
                nextYear: currentYear + 1,
                needed: currentThresh.add(transistorsAtNextYear).ceil(),
            };
        }
    }

    // Beyond last threshold: extrapolate using doubling curve
    const last = thresholds[thresholds.length - 1];
    const lastTransistors = new Decimal(last.transistors);
    if (total.gte(lastTransistors)) {
        // Threshold for year Y after last: last.transistors * 2^((Y-last.year)*12/14)
        const yearsFromLast = currentYear - last.year;
        const thresholdCurrent = lastTransistors.mul(new Decimal(2).pow(yearsFromLast * 12 / 14));
        const thresholdNext = lastTransistors.mul(new Decimal(2).pow((yearsFromLast + 1) * 12 / 14));

        const progressInYear = total.sub(thresholdCurrent).div(thresholdNext.sub(thresholdCurrent));

        return {
            progress: Math.max(0, Math.min(1, progressInYear.toNumber())),
            nextYear: currentYear + 1,
            needed: thresholdNext.ceil(),
        };
    }

    return { progress: 0, nextYear: CONFIG.START_YEAR + 1, needed: new Decimal(0) };
}
