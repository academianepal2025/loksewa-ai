const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let lines = content.split('\n');
let sectionLines = lines.slice(776, 935); // 777 to 935

let open = 0;
let close = 0;

sectionLines.forEach(l => {
  open += (l.match(/<div/g) || []).length;
  close += (l.match(/<\/div/g) || []).length;
});

console.log(`SECTION QUIZ: Open=${open}, Close=${close}, Diff=${open-close}`);
