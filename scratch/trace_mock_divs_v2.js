const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

const mockTestStart = content.indexOf('activeTab === \'mock-test\'');
const block = content.substring(mockTestStart);

let balance = 0;
const lines = block.split('\n');

lines.forEach((line, i) => {
    // Match <div ... but not <div ... />
    const openDivs = (line.match(/<div(?:\s+[^>]*)?(?<!\/)>/g) || []).length;
    const closeDivs = (line.match(/<\/div>/g) || []).length;
    
    balance += openDivs - closeDivs;
    if (openDivs > 0 || closeDivs > 0) {
        console.log(`Line ${i + 928}: ${balance} (open: ${openDivs}, close: ${closeDivs})`);
    }
});

console.log('Final balance in block:', balance);
