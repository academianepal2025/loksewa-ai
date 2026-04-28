const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx');

const start = content.indexOf(Buffer.from('        </div>\r\n      )}', 'utf8'));
if (start === -1) {
    console.log('Could not find end sequence');
    process.exit(1);
}

const slice = content.slice(start, start + 50);
console.log(slice.toString('hex'));
console.log(slice.toString('utf8'));
