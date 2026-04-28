const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx');

const slice = content.slice(content.length - 200);
console.log(slice.toString('hex'));
console.log(slice.toString('utf8'));
