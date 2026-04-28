const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let count = 0;
let lines = content.split('\n');

let inReturn = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('return (') && i > 440) inReturn = true;
  
  if (inReturn) {
    for (let char of line) {
      if (char === '{') count++;
      if (char === '}') count--;
      
      if (count === 0 && inReturn) {
         console.log(`BRACE BALANCE HIT ZERO at line ${i+1}: ${line.trim()}`);
         // Reset for the next block if any, but in a component there should only be one main return block
      }
    }
  }
}
