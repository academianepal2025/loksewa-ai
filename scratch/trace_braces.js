const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let count = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let char of line) {
    if (char === '{') count++;
    if (char === '}') count--;
    
    if (i > 448 && count === 0) {
      console.log(`PREMATURE BRACE CLOSURE at line ${i+1}`);
      // break;
    }
  }
}
