const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

// Remove comments and strings but keep newlines for line counting
let cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, (m) => m.replace(/[^\n]/g, ' '));
cleanContent = cleanContent.replace(/`[\s\S]*?`|'[^']*'|"[^"]*"/g, (m) => m.replace(/[^\n]/g, ' '));

let divCount = 0;
let lines = cleanContent.split('\n');
lines.forEach((line, idx) => {
    let opening = (line.match(/<div/g) || []).length;
    let closing = (line.match(/<\/div/g) || []).length;
    divCount += opening;
    divCount -= closing;
    
    // Check if we are inside a ternary block that might have its own balance
    // This is hard to do perfectly without a parser, but let's see the balance at each line
    // console.log(`Line ${idx + 1}: balance ${divCount}`);
});

console.log('Final div balance:', divCount);

// Find blocks with high positive balance
let currentBalance = 0;
lines.forEach((line, idx) => {
    let opening = (line.match(/<div/g) || []).length;
    let closing = (line.match(/<\/div/g) || []).length;
    currentBalance += opening;
    currentBalance -= closing;
    if (opening > 0 || closing > 0) {
        if (idx > 1000) console.log(`Line ${idx + 1}: ${currentBalance} (open: ${opening}, close: ${closing})`);
    }
});
