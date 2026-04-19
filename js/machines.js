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
        name: "Assemblage à la main",
        desc: "Soudure point par point de transistors au germanium.",
        icon: "🤲",
        unlockYear: 1947,
        baseCost: 100,
        rdCost: 0,                             // déjà débloqué
        baseProduction: 1,
        tier: 0,
        realInfo: "1947 — Bell Labs, Bardeen, Brattain & Shockley inventent le transistor à pointe de contact.",
        rdInfo: "Pas de R&D nécessaire — vous êtes le premier inventeur !"
    },
    {
        id: "point_contact",
        name: "Transistor à pointe de contact",
        desc: "Premier type de transistor commercial, fabrication artisanale.",
        icon: "📌",
        unlockYear: 1948,
        baseCost: 500,
        rdCost: 200,                           // $200 — petit budget recherche labo
        baseProduction: 1,
        tier: 0,
        realInfo: "1948 — Le transistor à pointe de contact est le premier à être produit commercialement.",
        rdInfo: "R&D : $200 — Quelques mois d'expérimentation au labo Bell pour stabiliser le contact pointe-germanium et obtenir une amplification reproductible."
    },
    {
        id: "germanium_fab",
        name: "Atelier Germanium",
        desc: "Petit atelier de fabrication de transistors au germanium.",
        icon: "⚗️",
        unlockYear: 1950,
        baseCost: 5_000,
        rdCost: 2_000,                         // $2K — mise au point des procédés de purification
        baseProduction: 3,
        tier: 1,
        realInfo: "1950 — Les transistors au germanium sont produits en petites séries pour l'industrie militaire.",
        rdInfo: "R&D : $2K — Recherche sur la purification du germanium par zone fondue et mise au point de procédés de fabrication fiables pour les contrats militaires (Signal Corps, US Army)."
    },
    {
        id: "grown_junction",
        name: "Transistor à jonction",
        desc: "Technique de croissance cristalline pour transistors bipolaires.",
        icon: "🔬",
        unlockYear: 1952,
        baseCost: 25_000,
        rdCost: 10_000,                        // $10K — développement de la croissance cristalline
        baseProduction: 10,
        tier: 1,
        realInfo: "1952 — William Shockley développe le transistor à jonction, plus fiable que la pointe de contact.",
        rdInfo: "R&D : $10K — Shockley théorise puis fabrique le transistor bipolaire à jonction (BJT). Nécessite la maîtrise de la croissance de monocristaux de germanium dopés avec des impuretés contrôlées."
    },
    {
        id: "silicon_transition",
        name: "Fonderie Silicium",
        desc: "Transition vers le silicium, matériau supérieur au germanium.",
        icon: "🪨",
        unlockYear: 1955,
        baseCost: 150_000,
        rdCost: 50_000,                        // $50K — R&D passage germanium → silicium
        baseProduction: 50,
        tier: 2,
        realInfo: "1955 — Texas Instruments fabrique le premier transistor au silicium commercial.",
        rdInfo: "R&D : $50K — Morris Tanenbaum (Bell Labs) puis Gordon Teal (TI) développent les procédés de croissance et de dopage du silicium. Le Si est plus abondant et résiste mieux à la chaleur que le Ge."
    },
    {
        id: "diffusion_process",
        name: "Procédé de diffusion",
        desc: "Technique de diffusion pour doper le silicium avec précision.",
        icon: "💨",
        unlockYear: 1957,
        baseCost: 500_000,
        rdCost: 150_000,                       // $150K — fours et procédés de diffusion
        baseProduction: 300,
        tier: 2,
        realInfo: "1957 — Bell Labs perfectionne le procédé de diffusion pour la fabrication en masse.",
        rdInfo: "R&D : $150K — Développement de fours de diffusion haute température pour introduire des dopants (bore, phosphore) dans le silicium avec une précision nanométrique. Ouvre la voie à la fabrication en masse."
    },
    {
        id: "planar_process",
        name: "Procédé planaire",
        desc: "Jean Hoerni invente le procédé planaire chez Fairchild.",
        icon: "📐",
        unlockYear: 1959,
        baseCost: 2_000_000,
        rdCost: 500_000,                       // $500K — invention du procédé planaire
        baseProduction: 1_500,
        tier: 3,
        realInfo: "1959 — Jean Hoerni (Fairchild) invente le procédé planaire, base de toute la micro-électronique.",
        rdInfo: "R&D : $500K — Jean Hoerni chez Fairchild Semiconductor invente l'oxydation thermique + photolithographie pour protéger les jonctions. Brevet révolutionnaire qui rend possible toute l'industrie des semi-conducteurs."
    },
    {
        id: "first_ic",
        name: "Chaîne Circuits Intégrés",
        desc: "Production des premiers circuits intégrés monolithiques.",
        icon: "🔲",
        unlockYear: 1961,
        baseCost: 5_000_000,
        rdCost: 2_000_000,                     // $2M — R&D circuits intégrés
        baseProduction: 8_000,
        tier: 3,
        realInfo: "1961 — Fairchild et TI produisent les premiers circuits intégrés commerciaux.",
        rdInfo: "R&D : $2M — Jack Kilby (TI, 1958) et Robert Noyce (Fairchild, 1959) inventent indépendamment le circuit intégré. Kilby recevra le prix Nobel en 2000. Noyce combine le procédé planaire avec l'interconnexion aluminium."
    },
    {
        id: "mos_transistor",
        name: "Ligne MOS",
        desc: "Fabrication de transistors MOS (Métal-Oxyde-Semi-conducteur).",
        icon: "⚡",
        unlockYear: 1963,
        baseCost: 12_000_000,
        rdCost: 5_000_000,                     // $5M — R&D MOSFET
        baseProduction: 40_000,
        tier: 3,
        realInfo: "1963 — Le MOSFET de Fairchild ouvre la voie à l'intégration à grande échelle.",
        rdInfo: "R&D : $5M — Dawon Kahng et Martin Atalla (Bell Labs, 1959) inventent le MOSFET. Fairchild le rend industrialisable. Le MOS consomme moins et se miniaturise mieux que le bipolaire — il dominera 99% de la production mondiale."
    },
    {
        id: "ssi_production",
        name: "Production SSI",
        desc: "Intégration à petite échelle : jusqu'à 100 transistors par puce.",
        icon: "🏭",
        unlockYear: 1965,
        baseCost: 40_000_000,
        rdCost: 10_000_000,                    // $10M — R&D intégration SSI
        baseProduction: 200_000,
        tier: 4,
        realInfo: "1965 — Gordon Moore prédit le doublement des transistors tous les 2 ans (loi de Moore).",
        rdInfo: "R&D : $10M — Miniaturisation des motifs de photolithographie et développement de procédés multi-couches. En 1965, Gordon Moore publie sa célèbre observation dans Electronics Magazine, prédisant le doublement de la densité tous les 2 ans."
    },
    {
        id: "msi_fab",
        name: "Usine MSI",
        desc: "Intégration à moyenne échelle : des centaines de transistors par puce.",
        icon: "🏗️",
        unlockYear: 1968,
        baseCost: 60_000_000,
        rdCost: 50_000_000,                    // $25M — R&D MSI + fondation d'Intel
        baseProduction: 2_000_000,
        tier: 4,
        realInfo: "1968 — Fondation d'Intel par Noyce et Moore. Les puces MSI équipent les premiers calculateurs.",
        rdInfo: "R&D : $25M — Noyce et Moore quittent Fairchild et fondent Intel avec $2.5M de capital. Développement des premières mémoires SRAM et DRAM en silicium. La MSI permet les premières calculatrices électroniques portables."
    },
    {
        id: "intel_4004",
        name: "Ligne Microprocesseur",
        desc: "Production du type Intel 4004 — le premier microprocesseur.",
        icon: "🖥️",
        unlockYear: 1971,
        baseCost: 200_000_000,
        rdCost: 50_000_000,                    // $50M — R&D premier microprocesseur
        baseProduction: 10_000_000,
        tier: 5,
        realInfo: "1971 — Intel 4004 : 2 300 transistors, gravure 10 µm. Premier CPU sur une puce.",
        rdInfo: "R&D : $50M — Federico Faggin, Ted Hoff et Stan Mazor conçoivent le 4004 pour Busicom (calculatrices). 2 300 transistors en 10µm. Intel rachète les droits et lance l'ère du microprocesseur. Le 8080 suivra en 1974."
    },
    {
        id: "lsi_plant",
        name: "Méga-usine LSI",
        desc: "Intégration à grande échelle : des milliers de transistors par puce.",
        icon: "🔧",
        unlockYear: 1975,
        baseCost: 500_000_000,
        rdCost: 100_000_000,                   // $100M — R&D LSI
        baseProduction: 70_000_000,
        tier: 5,
        realInfo: "1975 — Le MOS 6502 (Apple I) et le Zilog Z80 démocratisent l'informatique personnelle.",
        rdInfo: "R&D : $100M — Course à la miniaturisation : passage de 10µm à 3µm. Chuck Peddle conçoit le 6502 à $25 (vs $300 pour le 8080). Le Z80 de Zilog équipera le CP/M puis les premiers PC."
    },
    {
        id: "vlsi_fab",
        name: "Fonderie VLSI",
        desc: "Very Large Scale Integration : des dizaines de milliers de transistors.",
        icon: "🏢",
        unlockYear: 1980,
        baseCost: 700_000_000,
        rdCost: 250_000_000,                   // $250M — R&D VLSI
        baseProduction: 1_000_000_000,
        tier: 6,
        realInfo: "1980 — Les premiers processeurs VLSI. Le 68000 de Motorola contient 68 000 transistors.",
        rdInfo: "R&D : $250M — Développement des procédés 1.5µm, aligneurs de masques par projection. Le programme VLSI japonais (1976-1980, $300M) terrifie l'industrie US. Lynn Conway et Carver Mead publient 'Introduction to VLSI Systems'."
    },
    {
        id: "cmos_line",
        name: "Ligne CMOS avancée",
        desc: "Technologie CMOS basse consommation pour l'ère du PC.",
        icon: "💎",
        unlockYear: 1985,
        baseCost: 3_200_000_000,
        rdCost: 1_000_000_000,                   // $500M — R&D CMOS avancé
        baseProduction: 10_000_000_000,
        tier: 6,
        realInfo: "1985 — Intel 386 : 275 000 transistors en 1.5 µm. Le CMOS domine la production.",
        rdInfo: "R&D : $500M — Le CMOS (paires NMOS+PMOS) réduit la consommation de 100x vs NMOS seul. Intel investit massivement pour le 386 (32 bits). SEMATECH est créé en 1987 ($200M/an) pour que les US rattrapent le Japon."
    },
    {
        id: "deep_uv",
        name: "Lithographie Deep UV",
        desc: "Gravure par ultraviolets profonds sous le micron.",
        icon: "🔆",
        unlockYear: 1990,
        baseCost: 4_000_000_000,
        rdCost: 2_000_000_000,                 // $1B — R&D lithographie DUV
        baseProduction: 50_000_000_000,
        tier: 7,
        realInfo: "1990 — Passage sous le micron (0.8 µm). Intel 486 : 1.2 million de transistors.",
        rdInfo: "R&D : $1B — Passage des lampes à mercure (g-line 436nm) aux excimères KrF (248nm). IBM, Nikon et ASML développent les steppers DUV. Le 486 intègre le cache L1 et le FPU sur la puce pour la première fois."
    },
    {
        id: "pentium_line",
        name: "Fab Pentium",
        desc: "Production de masse des processeurs de type Pentium.",
        icon: "🚀",
        unlockYear: 1993,
        baseCost: 8_000_000_000,
        rdCost: 4_000_000_000,                 // $2B — R&D architecture superscalaire
        baseProduction: 400_000_000_000,
        tier: 7,
        realInfo: "1993 — Intel Pentium : 3.1 millions de transistors en 0.8 µm.",
        rdInfo: "R&D : $2B — Architecture superscalaire (2 pipelines), prédiction de branchement, bus 64 bits. Intel dépense $1B juste en marketing ('Intel Inside'). Le bug FDIV du Pentium en 1994 coûtera $475M en rappel."
    },
    {
        id: "copper_process",
        name: "Procédé au cuivre",
        desc: "Interconnexions en cuivre remplaçant l'aluminium.",
        icon: "🟤",
        unlockYear: 1997,
        baseCost: 8_000_000_000,
        rdCost: 6_000_000_000,                 // $3B — R&D interconnexions cuivre
        baseProduction: 3_000_000_000_000,
        tier: 8,
        realInfo: "1997 — IBM introduit les interconnexions en cuivre, réduisant la résistance de 40%.",
        rdInfo: "R&D : $3B — IBM résout le problème de la diffusion du cuivre dans le silicium grâce au damascène (dépôt dans des tranchées + CMP). Réduit la résistance de 40% et l'électromigration. Adopté par toute l'industrie au nœud 130nm."
    },
    {
        id: "immersion_litho",
        name: "Lithographie immersion 193nm",
        desc: "Lentilles immergées pour graver à 193 nanomètres.",
        icon: "💧",
        unlockYear: 2003,
        baseCost: 10_000_000_000,
        rdCost: 8_000_000_000,                 // $4B — R&D lithographie immersion
        baseProduction: 16_000_000_000_000,
        tier: 8,
        realInfo: "2003 — TSMC et ASML développent la lithographie par immersion. Nœud 90nm.",
        rdInfo: "R&D : $4B — Lin Burn-Jeng (TSMC) propose de placer de l'eau entre la lentille et le wafer pour augmenter l'ouverture numérique. ASML développe le Twinscan XT:1700i. Repousse la lithographie 193nm du nœud 90nm jusqu'au 7nm (avec multi-patterning)."
    },
    {
        id: "hkmg",
        name: "High-K / Metal Gate",
        desc: "Diélectrique high-k et grille métallique pour réduire les fuites.",
        icon: "🛡️",
        unlockYear: 2007,
        baseCost: 32_000_000_000,
        rdCost: 10_000_000_000,                 // $5B — R&D HKMG
        baseProduction: 160_000_000_000_000,
        tier: 9,
        realInfo: "2007 — Intel introduit le High-K Metal Gate au nœud 45nm (Core 2).",
        rdInfo: "R&D : $5B — Le SiO₂ à 1.2nm d'épaisseur fuit par effet tunnel. Intel remplace par du hafnium (HfO₂, constante k=25 vs 3.9) et une grille métal. 15 ans de recherche depuis les premières publications. Réduit les fuites de 100x."
    },
    {
        id: "finfet",
        name: "Fonderie FinFET",
        desc: "Transistors 3D FinFET pour les nœuds sub-22nm.",
        icon: "🦈",
        unlockYear: 2012,
        baseCost: 20_000_000_000,
        rdCost: 16_000_000_000,                 // $8B — R&D FinFET
        baseProduction: 400_000_000_000_000,
        tier: 9,
        realInfo: "2012 — Intel produit les premiers FinFET commerciaux au nœud 22nm (Ivy Bridge).",
        rdInfo: "R&D : $8B — Chenming Hu (UC Berkeley) invente le FinFET en 1999 : le canal devient une ailette 3D entourée par la grille sur 3 côtés. Intel met 13 ans à l'industrialiser. Gain de 37% en performance et 50% en consommation vs planaire."
    },
    {
        id: "euv_litho",
        name: "Lithographie EUV",
        desc: "Extreme Ultraviolet : gravure à 13.5nm de longueur d'onde.",
        icon: "☀️",
        unlockYear: 2018,
        baseCost: 40_000_000_000,
        rdCost: 30_000_000_000,                // $15B — R&D EUV (~20 ans de développement)
        baseProduction: 3_200_000_000_000_000,
        tier: 10,
        realInfo: "2018 — ASML livre les premières machines EUV à Samsung et TSMC. Nœud 7nm.",
        rdInfo: "R&D : $15B — Démarrée en 1997 par le consortium EUV LLC (Intel, AMD, Motorola, DOE). ASML développe la source plasma d'étain (50 000 gouttelettes/sec frappées par laser CO₂). Chaque machine NXE:3400 coûte $150M et pèse 180 tonnes."
    },
    {
        id: "gaafet",
        name: "Ligne GAA-FET",
        desc: "Gate-All-Around FET : la prochaine révolution après FinFET.",
        icon: "🧬",
        unlockYear: 2022,
        baseCost: 50_000_000_000,
        rdCost: 40_000_000_000,                // $20B — R&D GAA nanosheet
        baseProduction: 12_000_000_000_000_000,
        tier: 10,
        realInfo: "2022 — Samsung lance la production GAA-FET (nanosheet) au nœud 3nm.",
        rdInfo: "R&D : $20B — Évolution du FinFET : le canal devient un empilement de nanofeuilles (nanosheets) entourées par la grille sur 4 côtés. Samsung produit en premier (2022), TSMC et Intel suivent au nœud 2nm (2025). Gain de 35% en densité."
    },
    {
        id: "high_na_euv",
        name: "EUV Haute Ouverture",
        desc: "High-NA EUV : la lithographie ultime pour le nœud 2nm et au-delà.",
        icon: "🌟",
        unlockYear: 2025,
        baseCost: 80_000_000_000,
        rdCost: 50_000_000_000,                // $25B — R&D High-NA EUV
        baseProduction: 160_000_000_000_000_000,
        tier: 11,
        realInfo: "2025 — ASML Twinscan EXE:5000, première machine High-NA EUV. Intel et TSMC au nœud 2nm.",
        rdInfo: "R&D : $25B — ASML Twinscan EXE:5000 : ouverture numérique de 0.55 (vs 0.33). Miroirs anamorphiques, wafer tilt. Chaque machine coûte $350M+. Intel est le premier client. Permet la gravure sub-2nm sans multi-patterning extrême."
    },
    {
        id: "cfet_nodes",
        name: "Fonderie CFET",
        desc: "Complementary FET : empilement 3D des transistors nMOS et pMOS.",
        icon: "🏢",
        unlockYear: 2029,
        baseCost: 500_000_000_000,
        rdCost: 80_000_000_000,
        baseProduction: 5_500_000_000_000_000_000,
        tier: 11,
        realInfo: "2029 (Estimé) — Le CFET (Complementary FET) empile littéralement les transistors N et P les uns sur les autres pour diviser la surface de la cellule par deux.",
        rdInfo: "R&D : $40B — Le défi ultime du routage et de la dissipation thermique. Intel (Intel 10A) et l'IMEC préparent cette architecture pour succéder au GAA-FET. Nécessite une précision d'alignement inter-couches atomique."
    },
    {
        id: "silicon_photonics",
        name: "Photonique sur Silicium",
        desc: "Transmission de données par la lumière directement sur la puce.",
        icon: "🌈",
        unlockYear: 2033,
        baseCost: 800_000_000_000,
        rdCost: 140_000_000_000,
        baseProduction: 20_000_000_000_000_000_000,
        tier: 12,
        realInfo: "2033 (Estimé) — Remplacement des bus en cuivre par des guides d'ondes optiques pour résoudre le goulot d'étranglement de la bande passante et la chaleur.",
        rdInfo: "R&D : $70B — Intégration monolithique de lasers, modulateurs et photodétecteurs sur le même substrat CMOS. Réduit drastiquement la consommation énergétique des interconnexions (I/O) dans les datacenters d'IA."
    },
    {
        id: "tmdc_2d",
        name: "Fonderie Matériaux 2D",
        desc: "Transistors ultra-fins à base de métaux de transition dichalcogénures (TMD).",
        icon: "🕸️",
        unlockYear: 2038,
        baseCost: 1_200_000_000_000,
        rdCost: 240_000_000_000,
        baseProduction: 180_000_000_000_000_000_000,
        tier: 12,
        realInfo: "2038 (Estimé) — Le silicium atteint ses limites physiques. Remplacement par des matériaux 2D (MoS2, WSe2) de l'épaisseur d'un à trois atomes.",
        rdInfo: "R&D : $120B — Le silicium en deçà de 1nm subit un effet tunnel incontrôlable. Les TMD offrent un contrôle parfait du canal même à l'échelle de la monocouche atomique. Nécessite de réinventer 70 ans de chimie des procédés."
    },
    {
        id: "terrafab",
        name: "Terrafab",
        desc: "L'usine ultime : auto-assemblage moléculaire à l'échelle planétaire.",
        icon: "🌍",
        unlockYear: 2045,
        baseCost: 1_000_000_000_000,
        rdCost: 600_000_000_000,
        baseProduction: 400_000_000_000_000_000_000,
        tier: 13,
        realInfo: "2045 (Estimé) — La Terrafab représente la fusion totale de la nanotechnologie et de l'automatisation globale. Les transistors ne sont plus 'gravés' mais s'auto-assemblent molécule par molécule.",
        rdInfo: "R&D : $300B — Maîtrise de l'auto-assemblage dirigé (DSA) à l'échelle macroscopique. Permet une densité de transistors approchant les limites thermodynamiques de l'informatique. C'est le sommet de l'ère industrielle du transistor."
    }
];

/**
 * Calculate the R&D cost for a machine, potentially increased if before unlockYear
 */
function getDynamicRDCost(machine, currentYear) {
    let cost = new Decimal(machine.rdCost);
    if (currentYear >= machine.unlockYear) return cost;
    const yearsBefore = machine.unlockYear - currentYear;
    // Penalty: +60% per year (compounded)
    return cost.mul(Decimal.pow(1.6, yearsBefore)).floor();
}

/**
 * Calculate the cost of the next machine given how many are already owned
 */
function getMachineCost(machine, owned, currentYear) {
    let cost = new Decimal(machine.baseCost).mul(Decimal.pow(CONFIG.PRICE_SCALE, owned));
    
    // Penalty for early purchase: +60% per year (compounded)
    if (currentYear < machine.unlockYear) {
        const yearsBefore = machine.unlockYear - currentYear;
        cost = cost.mul(Decimal.pow(1.6, yearsBefore));
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
