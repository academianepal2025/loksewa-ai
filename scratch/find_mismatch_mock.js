const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

const mockTestStart = content.indexOf('activeTab === \'mock-test\'');
const block = content.substring(mockTestStart);

let pos = 0;
const stack = [];

function nextTag() {
    const start = block.indexOf('<', pos);
    if (start === -1) return null;
    
    let end = block.indexOf('>', start);
    if (end === -1) return null;
    
    const tagContent = block.substring(start + 1, end).trim();
    pos = end + 1;
    
    if (tagContent.startsWith('!--')) return nextTag();
    
    const match = tagContent.match(/^\/?([a-zA-Z0-9.]+)/);
    if (!match) return nextTag();
    
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
            const line = content.substring(0, tag.start + mockTestStart).split('\n').length;
            console.log(`Mismatch at line ${line}: found </${tag.name}>, expected </${last ? last.name : 'none'}>`);
            // Snippet
            console.log(`Snippet: ${block.substring(tag.start - 20, tag.end + 20)}`);
        }
    } else {
        stack.push(tag);
    }
}

if (stack.length > 0) {
    console.log('Unclosed tags:');
    stack.forEach(s => {
        const line = content.substring(0, s.start + mockTestStart).split('\n').length;
        console.log(`- <${s.name}> at line ${line}`);
    });
}
