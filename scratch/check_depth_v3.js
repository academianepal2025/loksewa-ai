const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let depth = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openCount = (line.match(/<div/g) || []).length;
  const closeCount = (line.match(/<\/div/g) || []).length;
  
  depth += openCount - closeCount;
  
  if (i > 448 && i < 1100 && depth > 15) {
     // console.log(`LINE ${i+1} EXCEEDED DEPTH 15!`);
  }
}

console.log("FINAL DEPTH: " + depth);
