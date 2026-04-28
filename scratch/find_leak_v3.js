const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let count = 0;
let lines = content.split('\n');

for (let i = 497; i < lines.length; i++) { // Start at 498
  const line = lines[i];
  for (let char of line) {
    if (char === '{') count++;
    if (char === '}') count--;
    
    if (count === 0 && i < 1070) {
       console.log(`ZERO HIT at line ${i+1}: ${line.trim()}`);
       process.exit();
    }
  }
}
