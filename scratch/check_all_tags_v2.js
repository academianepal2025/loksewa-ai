const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

const lines = content.split('\n');
const tags = ['p', 'h2', 'h3', 'h4', 'h5', 'span', 'button', 'input'];

tags.forEach(t => {
    let b = 0;
    lines.forEach((l, i) => {
        if (i < 927) return;
        
        // Count openings that are not self-closing
        const open = (l.match(new RegExp('<' + t + '(\\s+[^>]*)?>', 'g')) || []);
        const selfClose = (l.match(new RegExp('<' + t + '(\\s+[^>]*)?/>', 'g')) || []).length;
        const close = (l.match(new RegExp('</' + t + '>', 'g')) || []).length;
        
        b += (open.length - selfClose) - close;
    });
    if (b !== 0 && t !== 'input') {
        console.log(`Tag [${t}] has balance ${b}`);
    }
});
