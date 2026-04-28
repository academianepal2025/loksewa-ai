const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let lines = content.split('\n');
let sectionLines = lines.slice(497, 656); // 498 to 656

let open = 0;
let close = 0;

sectionLines.forEach(l => {
  open += (l.match(/<div/g) || []).length;
  close += (l.match(/<\/div/g) || []).length;
});

console.log(`SECTION HUB: Open=${open}, Close=${close}, Diff=${open-close}`);
