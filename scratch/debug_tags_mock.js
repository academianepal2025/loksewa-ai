const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

// Simple regex to find JSX tags
const tagRegex = /<([a-zA-Z0-9.]+)|<\/([a-zA-Z0-9.]+)>|(\/>)/g;
let match;
const stack = [];

// Focus on the mock-test block
const mockTestStart = content.indexOf('activeTab === \'mock-test\'');
if (mockTestStart === -1) {
    console.log('Could not find mock-test block');
    process.exit(1);
}

const block = content.substring(mockTestStart);

let i = 0;
while ((match = tagRegex.exec(block)) !== null) {
    const [full, open, close, selfClose] = match;
    
    if (open) {
        // Check if it's a self-closing tag like <input ... > (non-standard but happens)
        // or a known void element
        const isVoid = ['input', 'img', 'br', 'hr', 'link', 'meta'].includes(open.toLowerCase());
        const isActuallySelfClosing = full.endsWith('/>');
        
        if (!isVoid && !isActuallySelfClosing) {
            stack.push({ tag: open, index: match.index + mockTestStart });
        }
    } else if (close) {
        const last = stack.pop();
        if (!last || last.tag !== close) {
            console.log(`Mismatch! Found </${close}> but expected </${last ? last.tag : 'nothing'}>`);
            const snippet = content.substring(match.index + mockTestStart - 50, match.index + mockTestStart + 50);
            console.log(`Snippet: ${snippet}`);
            // Find line number
            const lines = content.substring(0, match.index + mockTestStart).split('\n');
            console.log(`Line: ${lines.length}`);
            process.exit(1);
        }
    } else if (selfClose) {
        // Handled by 'open' logic mostly, but if we see '/>' alone? 
        // Not standard. Usually open logic handles <Tag />
    }
}

if (stack.length > 0) {
    console.log('Unclosed tags found:');
    stack.forEach(s => {
        const lines = content.substring(0, s.index).split('\n');
        console.log(`- <${s.tag}> at line ${lines.length}`);
    });
} else {
    console.log('All tags in mock-test block appear balanced.');
}
