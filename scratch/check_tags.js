const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let openDivs = 0;
let closeDivs = 0;
let lines = content.split('\n');

lines.forEach((line, i) => {
  const matchesOpen = line.match(/<div/g);
  const matchesClose = line.match(/<\/div/g);
  if (matchesOpen) openDivs += matchesOpen.length;
  if (matchesClose) closeDivs += matchesClose.length;
  
  if (openDivs !== closeDivs) {
    // console.log(`Line ${i+1}: Open=${openDivs}, Close=${closeDivs}`);
  }
});

console.log(`Total Open Divs: ${openDivs}`);
console.log(`Total Close Divs: ${closeDivs}`);

if (openDivs !== closeDivs) {
  console.log("TAG IMBALANCE DETECTED!");
}
