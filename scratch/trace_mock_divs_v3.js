const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

const lines = content.split('\n');
let balance = 0;

lines.forEach((line, i) => {
    // Skip before mock-test
    if (i < 927) return;

    const openDivs = (line.match(/<div(?:\s+[^>]*)?(?<!\/)>/g) || []).length;
    const closeDivs = (line.match(/<\/div>/g) || []).length;
    
    balance += openDivs - closeDivs;
    if (openDivs > 0 || closeDivs > 0) {
        console.log(`Line ${i + 1}: ${balance} (open: ${openDivs}, close: ${closeDivs})`);
    }
});

console.log('Final balance from line 928 onwards:', balance);
