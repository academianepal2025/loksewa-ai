const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

// A more robust tag balancer
let pos = 0;
const stack = [];

function nextTag() {
    const start = content.indexOf('<', pos);
    if (start === -1) return null;
    
    // Find the end of the tag
    let end = content.indexOf('>', start);
    // Handle comments or > inside strings (naive)
    // For simplicity, just find the next >
    
    const tagContent = content.substring(start + 1, end);
    pos = end + 1;
    
    if (tagContent.startsWith('!--')) {
        // Comment, skip
        return nextTag();
    }
    
    const isClosing = tagContent.startsWith('/');
    const isSelfClosing = tagContent.endsWith('/');
    
    const tagName = tagContent.match(/^\/?([a-zA-Z0-9.]+)/)[1];
    
    // Skip void elements (HTML)
    const isVoid = ['input', 'img', 'br', 'hr', 'link', 'meta'].includes(tagName.toLowerCase());
    
    return { name: tagName, isClosing, isSelfClosing: isSelfClosing || isVoid, start, end };
}

let tag;
while ((tag = nextTag())) {
    if (tag.isSelfClosing) continue;
    
    if (tag.isClosing) {
        const last = stack.pop();
        if (!last || last.name !== tag.name) {
            console.log(`Mismatch at line ${content.substring(0, tag.start).split('\n').length}: found </${tag.name}>, expected </${last ? last.name : 'none'}>`);
            // process.exit(1);
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
