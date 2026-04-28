const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let depth = 0;
let lines = content.split('\n');

lines.forEach((line, i) => {
  const matchesOpen = (line.match(/<div/g) || []).length;
  const matchesClose = (line.match(/<\/div/g) || []).length;
  
  if (matchesOpen > 0 || matchesClose > 0) {
    depth += matchesOpen - matchesClose;
    console.log(`Line ${String(i + 1).padStart(4)}: Depth=${String(depth).padStart(2)} | +${matchesOpen} -${matchesClose} | ${line.trim().substring(0, 50)}`);
  }
});
