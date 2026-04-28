const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let lines = content.split('\n');
let sectionLines = lines.slice(935, 1081); // 936 to 1081

let open = 0;
let close = 0;

sectionLines.forEach(l => {
  open += (l.match(/<div/g) || []).length;
  close += (l.match(/<\/div/g) || []).length;
});

console.log(`SECTION MOCK-TEST: Open=${open}, Close=${close}, Diff=${open-close}`);
