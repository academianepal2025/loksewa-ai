const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let count = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let char of line) {
    if (char === '{') count++;
    if (char === '}') count--;
  }
  
  if (i >= 498 && i < 1070) {
     if (count < 1) {
        console.log(`BRACE BALANCE DROPPED BELOW 1 at line ${i+1}: ${line.trim()}`);
        process.exit();
     }
  }
}
