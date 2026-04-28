const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

let braces = 0;
let parens = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    // Skip strings and comments (naive)
    if (char === '"' || char === "'" || char === '`') {
        const quote = char;
        i++;
        while (i < content.length && content[i] !== quote) {
            if (content[i] === '\\') i++;
            i++;
        }
    } else if (char === '/' && content[i+1] === '*') {
        i += 2;
        while (i < content.length && !(content[i] === '*' && content[i+1] === '/')) {
            i++;
        }
        i++;
    } else if (char === '/' && content[i+1] === '/') {
        while (i < content.length && content[i] !== '\n') {
            i++;
        }
    } else {
        if (char === '{') braces++;
        if (char === '}') braces--;
        if (char === '(') parens++;
        if (char === ')') parens--;
        
        if (braces < 0) console.log(`Negative braces at index ${i}`);
        if (parens < 0) console.log(`Negative parens at index ${i}`);
    }
}

console.log(`Final balance: braces ${braces}, parens ${parens}`);
