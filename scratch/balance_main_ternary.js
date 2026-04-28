const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

const lines = content.split('\n');
const block = lines.slice(488, 1073).join('\n'); // Line 489 to 1073

let balance = 0;
const stack = [];

// Simplified tag logic
const tagRegex = /<([a-zA-Z0-9.]+)|<\/([a-zA-Z0-9.]+)>|(\/>)/g;
let match;
while ((match = tagRegex.exec(block)) !== null) {
    if (match[1]) {
        const tag = match[1];
        if (!['input', 'img', 'br', 'hr', 'link', 'meta'].includes(tag.toLowerCase()) && !match[0].endsWith('/>')) {
            stack.push({ tag, index: match.index });
        }
    } else if (match[2]) {
        const tag = match[2];
        const last = stack.pop();
        if (!last || last.tag !== tag) {
            console.log(`Mismatch: found </${tag}>, expected </${last ? last.tag : 'none'}>`);
            const snippet = block.substring(match.index - 50, match.index + 50);
            console.log(`Snippet: ${snippet}`);
        }
    }
}

if (stack.length > 0) {
    console.log('Unclosed tags in main ternary:');
    stack.forEach(s => {
        console.log(`- <${s.tag}>`);
    });
} else {
    console.log('Main ternary tags balanced!');
}
