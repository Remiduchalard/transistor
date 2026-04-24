/**
 * machines.js — All machines/processes with historically-accurate costs
 *
 * Production model:
 *   1947–1970: exponential from ~1/yr to ~1 billion/yr
 *   1970+:     doubles every 14 months
 *
 * Cost model:
 *   baseCost = realistic cost of the machine/fab in USD at the year of release.
 *   rdCost = R&D investment needed to unlock the technology.
 *   ×1.15 per unit already owned (cookie clicker scaling).
 */

// Helper: world annual production at a given year
function _worldProd(year) {
    if (year <= 1947) return 1;
    if (year <= 1970) {
        return Math.pow(10, 9 * (year - 1947) / 23);
    }
    return 1e9 * Math.pow(2, (year - 1970) * 12 / 14);
}

const MACHINES = [
    {
        id: "hand_assembly",
                        icon: "🤲",
        unlockYear: 1947,
        baseCost: 100,
        rdCost: 0,                             // déjà débloqué
        baseProduction: 1,
        tier: 0,
                    },
    {
        id: "point_contact",
                        icon: "📌",
        unlockYear: 1948,
        baseCost: 500,
        rdCost: 200,                           // $200 — petit budget recherche labo
        baseProduction: 1,
        tier: 0,
                    },
    {
        id: "germanium_fab",
                        icon: "⚗️",
        unlockYear: 1950,
        baseCost: 5_000,
        rdCost: 2_000,                         // $2K — mise au point des procédés de purification
        baseProduction: 3,
        tier: 1,
                    },
    {
        id: "grown_junction",
                        icon: "🔬",
        unlockYear: 1952,
        baseCost: 25_000,
        rdCost: 10_000,                        // $10K — développement de la croissance cristalline
        baseProduction: 10,
        tier: 1,
                    },
    {
        id: "silicon_transition",
                        icon: "🪨",
        unlockYear: 1955,
        baseCost: 150_000,
        rdCost: 50_000,                        // $50K — R&D passage germanium → silicium
        baseProduction: 50,
        tier: 2,
                    },
    {
        id: "diffusion_process",
                        icon: "💨",
        unlockYear: 1957,
        baseCost: 500_000,
        rdCost: 150_000,                       // $150K — fours et procédés de diffusion
        baseProduction: 300,
        tier: 2,
                    },
    {
        id: "planar_process",
                        icon: "📐",
        unlockYear: 1959,
        baseCost: 2_000_000,
        rdCost: 500_000,                       // $500K — invention du procédé planaire
        baseProduction: 1_500,
        tier: 3,
                    },
    {
        id: "first_ic",
                        icon: "🔲",
        unlockYear: 1961,
        baseCost: 5_000_000,
        rdCost: 2_000_000,                     // $2M — R&D circuits intégrés
        baseProduction: 8_000,
        tier: 3,
                    },
    {
        id: "mos_transistor",
                        icon: "⚡",
        unlockYear: 1963,
        baseCost: 12_000_000,
        rdCost: 5_000_000,                     // $5M — R&D MOSFET
        baseProduction: 40_000,
        tier: 3,
                    },
    {
        id: "ssi_production",
                        icon: "🏭",
        unlockYear: 1965,
        baseCost: 40_000_000,
        rdCost: 10_000_000,                    // $10M — R&D intégration SSI
        baseProduction: 200_000,
        tier: 4,
                    },
    {
        id: "msi_fab",
                        icon: "🏗️",
        unlockYear: 1968,
        baseCost: 109200000,
        rdCost: 91000000,                    // $25M — R&D MSI + fondation d'Intel
        baseProduction: 2_000_000,
        tier: 4,
                    },
    {
        id: "intel_4004",
                        icon: "🖥️",
        unlockYear: 1971,
        baseCost: 260_000_000,
        rdCost: 65_000_000,                    // $50M — R&D premier microprocesseur
        baseProduction: 10_000_000,
        tier: 5,
                    },
    {
        id: "lsi_plant",
                        icon: "🔧",
        unlockYear: 1975,
        baseCost: 700000000,
        rdCost: 140000000,                   // $100M — R&D LSI
        baseProduction: 70_000_000,
        tier: 5,
                    },
    {
        id: "vlsi_fab",
                        icon: "🏢",
        unlockYear: 1980,
        baseCost: 686000000,
        rdCost: 350000000,                   // $250M — R&D VLSI
        baseProduction: 500000000,
        tier: 6,
                    },
    {
        id: "cmos_line",
                        icon: "💎",
        unlockYear: 1985,
        baseCost: 3136000000,
        rdCost: 1400000000,                   // $500M — R&D CMOS avancé
        baseProduction: 5000000000,
        tier: 6,
                    },
    {
        id: "deep_uv",
                        icon: "🔆",
        unlockYear: 1990,
        baseCost: 5600000000,
        rdCost: 2800000000,                 // $1B — R&D lithographie DUV
        baseProduction: 50_000_000_000,
        tier: 7,
                    },
    {
        id: "pentium_line",
                        icon: "🚀",
        unlockYear: 1993,
        baseCost: 8_000_000_000,
        rdCost: 4_000_000_000,                 // $2B — R&D architecture superscalaire
        baseProduction: 400_000_000_000,
        tier: 7,
                    },
    {
        id: "copper_process",
                        icon: "🟤",
        unlockYear: 1997,
        baseCost: 8_000_000_000,
        rdCost: 6_000_000_000,                 // $3B — R&D interconnexions cuivre
        baseProduction: 3_000_000_000_000,
        tier: 8,
                    },
    {
        id: "immersion_litho",
                        icon: "💧",
        unlockYear: 2003,
        baseCost: 15000000000,
        rdCost: 12000000000,                 // $4B — R&D lithographie immersion
        baseProduction: 16_000_000_000_000,
        tier: 8,
                    },
    {
        id: "hkmg",
                        icon: "🛡️",
        unlockYear: 2007,
        baseCost: 75000000000,
        rdCost: 15000000000,                 // $5B — R&D HKMG
        baseProduction: 300_000_000_000_000,
        tier: 9,
                    },
    {
        id: "finfet",
                        icon: "🦈",
        unlockYear: 2012,
        baseCost: 45000000000,
        rdCost: 24000000000,                 // $8B — R&D FinFET
        baseProduction: 600_000_000_000_000,
        tier: 9,
                    },
    {
        id: "euv_litho",
                        icon: "☀️",
        unlockYear: 2018,
        baseCost: 90000000000,
        rdCost: 45000000000,                // $15B — R&D EUV (~20 ans de développement)
        baseProduction: 6_200_000_000_000_000,
        tier: 10,
                    },
    {
        id: "gaafet",
                        icon: "🧬",
        unlockYear: 2022,
        baseCost: 120000000000,
        rdCost: 60000000000,                // $20B — R&D GAA nanosheet
        baseProduction: 24_000_000_000_000_000,
        tier: 10,
                    },
    {
        id: "high_na_euv",
                        icon: "🌟",
        unlockYear: 2025,
        baseCost: 225000000000,
        rdCost: 75000000000,                // $25B — R&D High-NA EUV
        baseProduction: 400_000_000_000_000_000,
        tier: 11,
                    },
    {
        id: "cfet_nodes",
                        icon: "🏢",
        unlockYear: 2029,
        baseCost: 1350000000000,
        rdCost: 120000000000,
        baseProduction: 12_500_000_000_000_000_000,
        tier: 11,
                    },
    {
        id: "silicon_photonics",
                        icon: "🌈",
        unlockYear: 2033,
        baseCost: 1200000000000,
        rdCost: 210000000000,
        baseProduction: 20_000_000_000_000_000_000,
        tier: 12,
                    },
    {
        id: "tmdc_2d",
                        icon: "🕸️",
        unlockYear: 2038,
        baseCost: 1800000000000,
        rdCost: 360000000000,
        baseProduction: 1.800000e+20,
        tier: 12,
                    },
    {
        id: "terrafab",
                        icon: "🌍",
        unlockYear: 2045,
        baseCost: 7500000000000,
        rdCost: 900000000000,
        baseProduction: 4.000000e+20,
        tier: 13,
                    },
    {
        id: "lunar_fab",
                        icon: "🌖",
        unlockYear: 2055,
        baseCost: 75000000000000,
        rdCost: 30000000000000,
        baseProduction: 1.000000e+22,
        tier: 14,
                    },
    {
        id: "mars_fab",
                        icon: "🔴",
        unlockYear: 2060,
        baseCost: 750000000000000,
        rdCost: 150000000000000,
        baseProduction: 5.000000e+23,
        tier: 14,
                    },
    {
        id: "kuiper_mining",
                        icon: "☄️",
        unlockYear: 2070,
        baseCost: 1.5e+16,
        rdCost: 7500000000000000,
        baseProduction: 2.500000e+25,
        tier: 15,
                    },
    {
        id: "jupiter_brain",
                        icon: "🪐",
        unlockYear: 2080,
        baseCost: 1.5e+18,
        rdCost: 7.5e+17,
        baseProduction: 1.000000e+27,
        tier: 15,
                    },
    {
        id: "dyson_swarm",
                        icon: "☀️",
        unlockYear: 2090,
        baseCost: 1.500000e+20,
        rdCost: 7.5e+19,
        baseProduction: 5.000000e+29,
        tier: 16,
                    },
    {
        id: "galactic_forge",
                        icon: "🌌",
        unlockYear: 2100,
        baseCost: 1.500000e+22,
        rdCost: 7.500000e+21,
        baseProduction: 2.000000e+32,
        tier: 17,
                    },
    {
        id: "universal_fabricator",
                        icon: "✨",
        unlockYear: 2120,
        baseCost: 1.500000e+24,
        rdCost: 7.500000e+23,
        baseProduction: 1.000000e+36,
        tier: 18,
                    }
];

/**
 * Calculate the R&D cost for a machine, potentially increased if before unlockYear
 */
function getDynamicRDCost(machine, currentYear) {
    let cost = new Decimal(machine.rdCost);
    if (currentYear >= machine.unlockYear) return cost;
    const yearsBefore = machine.unlockYear - currentYear;
    // Penalty: +100% per year (compounded)
    return cost.mul(Decimal.pow(2, yearsBefore)).floor();
}

/**
 * Calculate the cost of the next machine given how many are already owned
 */
function getMachineCost(machine, owned, currentYear) {
    let cost = new Decimal(machine.baseCost).mul(Decimal.pow(CONFIG.PRICE_SCALE, owned));
    
    // Penalty for early purchase: +100% per year (compounded)
    if (currentYear < machine.unlockYear) {
        const yearsBefore = machine.unlockYear - currentYear;
        cost = cost.mul(Decimal.pow(2, yearsBefore));
    }
    
    return cost.floor();
}

/**
 * Calculate the total cost to buy qty machines starting from owned count
 */
function getBulkMachineCost(machine, owned, qty, currentYear) {
    let total = new Decimal(0);
    for (let i = 0; i < qty; i++) {
        total = total.add(getMachineCost(machine, owned + i, currentYear));
    }
    return total;
}

/**
 * Get total production per year for a machine type given owned count
 */
function getMachineProduction(machine, owned) {
    return new Decimal(machine.baseProduction).mul(owned);
}
