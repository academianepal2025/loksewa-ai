const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let depth = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openCount = (line.match(/<div/g) || []).length;
  const closeCount = (line.match(/<\/div/g) || []).length;
  
  const oldDepth = depth;
  depth += openCount - closeCount;
  
  if (depth !== oldDepth) {
    console.log(`${String(i + 1).padStart(4)}: ${String(oldDepth).padStart(2)} -> ${String(depth).padStart(2)} | ${line.trim()}`);
  }
}
