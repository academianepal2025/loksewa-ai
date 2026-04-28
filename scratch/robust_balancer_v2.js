const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

let pos = 0;
const stack = [];

function nextTag() {
    const start = content.indexOf('<', pos);
    if (start === -1) return null;
    
    let end = content.indexOf('>', start);
    if (end === -1) return null;
    
    const tagContent = content.substring(start + 1, end).trim();
    pos = end + 1;
    
    if (tagContent.startsWith('!--')) return nextTag();
    
    const match = tagContent.match(/^\/?([a-zA-Z0-9.]+)/);
    if (!match) return nextTag(); // Probably a comparison operator
    
    const tagName = match[1];
    const isClosing = tagContent.startsWith('/');
    const isSelfClosing = tagContent.endsWith('/') || ['input', 'img', 'br', 'hr', 'link', 'meta'].includes(tagName.toLowerCase());
    
    return { name: tagName, isClosing, isSelfClosing, start, end };
}

let tag;
while ((tag = nextTag())) {
    if (tag.isSelfClosing) continue;
    
    if (tag.isClosing) {
        const last = stack.pop();
        if (!last || last.name !== tag.name) {
            console.log(`Mismatch at line ${content.substring(0, tag.start).split('\n').length}: found </${tag.name}>, expected </${last ? last.name : 'none'}>`);
        }
    } else {
        stack.push(tag);
    }
}

if (stack.length > 0) {
    console.log('Unclosed tags:');
    stack.forEach(s => {
        console.log(`- <${s.name}> at line ${content.substring(0, s.start).split('\n').length}`);
    });
} else {
    console.log('All tags balanced!');
}
