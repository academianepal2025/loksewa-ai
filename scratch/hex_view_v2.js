const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx');

const search = Buffer.from('        </div>', 'utf8');
let pos = content.indexOf(search);
while (pos !== -1) {
    if (pos > content.length - 100) {
        console.log(`Found sequence at ${pos}`);
        const slice = content.slice(pos, pos + 100);
        console.log(slice.toString('hex'));
        console.log(slice.toString('utf8'));
    }
    pos = content.indexOf(search, pos + 1);
}
