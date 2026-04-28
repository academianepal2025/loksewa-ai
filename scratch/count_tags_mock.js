const fs = require('fs');
const content = fs.readFileSync('d:\\loksewa-ai\\app\\dashboard\\practice\\page.tsx', 'utf8');

const mockTestStart = content.indexOf('activeTab === \'mock-test\'');
const block = content.substring(mockTestStart);

const tags = ['div', 'p', 'h2', 'h3', 'h4', 'h5', 'span', 'section', 'button', 'input'];

tags.forEach(tag => {
    const openRegex = new RegExp(`<${tag}(?:\\s+[^>]*[^/])?>`, 'g');
    const closeRegex = new RegExp(`</${tag}>`, 'g');
    const selfCloseRegex = new RegExp(`<${tag}[^>]*/>`, 'g');

    const openCount = (block.match(openRegex) || []).length;
    const closeCount = (block.match(closeRegex) || []).length;
    
    if (openCount !== closeCount) {
        console.log(`Tag [${tag}] mismatch: ${openCount} open, ${closeCount} closed`);
    }
});
