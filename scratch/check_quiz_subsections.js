const fs = require('fs');
const content = fs.readFileSync('d:/loksewa-ai/app/dashboard/practice/page.tsx', 'utf8');

let lines = content.split('\n');

// !quizFinished branch: 780 to 873
let open1 = 0, close1 = 0;
lines.slice(779, 873).forEach(l => {
  open1 += (l.match(/<div/g) || []).length;
  close1 += (l.match(/<\/div/g) || []).length;
});
console.log(`QUIZ ACTIVE: Open=${open1}, Close=${close1}, Diff=${open1-close1}`);

// quizFinished branch: 876 to 933
let open2 = 0, close2 = 0;
lines.slice(875, 933).forEach(l => {
  open2 += (l.match(/<div/g) || []).length;
  close2 += (l.match(/<\/div/g) || []).length;
});
console.log(`QUIZ RESULTS: Open=${open2}, Close=${close2}, Diff=${open2-close2}`);
