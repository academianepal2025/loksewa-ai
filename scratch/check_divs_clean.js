const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

// Remove comments and strings
let cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
cleanContent = cleanContent.replace(/`[\s\S]*?`|'[^']*'|"[^"]*"/g, '');

let divCount = 0;
let tagRegex = /<div|<\/div/g;
let match;

while ((match = tagRegex.exec(cleanContent)) !== null) {
    if (match[0] === '<div') divCount++;
    else divCount--;
}

console.log('Final clean div balance:', divCount);
