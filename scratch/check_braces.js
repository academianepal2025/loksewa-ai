const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let count = 0;
for (let char of content) {
  if (char === '{') count++;
  if (char === '}') count--;
}

console.log("FINAL BRACE BALANCE: " + count);
