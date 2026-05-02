// Replace script entirely to parse upgrades.js and update lang files directly
const fs = require('fs');

function readFile(path) { return fs.readFileSync(path, 'utf8'); }
function writeFile(path, content) { fs.writeFileSync(path, content, 'utf8'); }

let enCode = readFile('js/lang/en.js');
let frCode = readFile('js/lang/fr.js');

const upgradesCode = readFile('js/upgrades.js');

// Parse upgrades to an array of objects
let upgradesMatch = [...upgradesCode.matchAll(/\{\s*id:\s*"([^"]+)",[\s\S]*?type:\s*"([^"]+)",[\s\S]*?value:\s*([\d.]+)/g)];

let enUpdates = [];
let frUpdates = [];

console.log(`Found ${upgradesMatch.length} upgrades in upgrades.js`);

upgradesMatch.forEach((match, index) => {
    let id = match[1];
    let type = match[2];
    let val = parseFloat(match[3]);
    
    let keyDesc = `"upg_${index}_desc"`;
    let keyName = `"upg_${index}_name"`;
    let enDesc = "";
    let frDesc = "";
    let enName = "";
    let frName = "";

    if (type === "click_multiplier") {
        enDesc = `"x${val} transistors per click"`;
        frDesc = `"x${val} transistors par clic"`;
    } else if (type === "offline_prod") {
        enDesc = `"+${val * 100}% offline production"`;
        frDesc = `"+${val * 100}% production hors-ligne"`;
        enName = `"Offline Cache"`;
        frName = `"Cache hors-ligne"`;
    } else if (type === "autosell") {
        return; // Auto-sell translations are usually complex/fine, let's skip overriding them unless needed
    } else {
        return;
    }

    if (enDesc) {
        enUpdates.push({ key: keyDesc, val: enDesc });
        frUpdates.push({ key: keyDesc, val: frDesc });
    }
    
    // Add names if newly generated (like for offline_prod additions)
    if (enName) {
        enUpdates.push({ key: keyName, val: enName });
        frUpdates.push({ key: keyName, val: frName });
    }
});

let enUpdatedCount = 0;
enUpdates.forEach(update => {
    let regex = new RegExp(update.key + "\\s*:\\s*\"[^\"]+\"");
    if (regex.test(enCode)) {
        enCode = enCode.replace(regex, update.key + ": " + update.val);
        enUpdatedCount++;
    } else {
        enCode = enCode.replace(/\n};/, `,\n    ${update.key}: ${update.val}\n};`);
        enUpdatedCount++;
    }
});

let frUpdatedCount = 0;
frUpdates.forEach(update => {
    let regex = new RegExp(update.key + "\\s*:\\s*\"[^\"]+\"");
    if (regex.test(frCode)) {
        frCode = frCode.replace(regex, update.key + ": " + update.val);
        frUpdatedCount++;
    } else {
        frCode = frCode.replace(/\n};/, `,\n    ${update.key}: ${update.val}\n};`);
        frUpdatedCount++;
    }
});

console.log(`Updated/Added ${enUpdatedCount} entries in en.js and ${frUpdatedCount} entries in fr.js`);

writeFile('js/lang/en.js', enCode);
writeFile('js/lang/fr.js', frCode);

console.log("Lang files updated with latest upgrade values.");
