import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') results = results.concat(walk(full));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.mjs')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('src');
console.log('Total source files:', files.length);

const patterns = [
  { name: 'dangerouslySetInnerHTML', regex: /dangerouslySetInnerHTML/g },
  { name: 'eval()', regex: /\beval\s*\(/g },
  { name: 'new Function()', regex: /new\s+Function\s*\(/g },
  { name: 'queryRawUnsafe', regex: /queryRawUnsafe/g },
  { name: 'child_process exec/spawn', regex: /\b(exec|spawn|execSync|spawnSync)\s*\(/g },
  { name: 'process.env secret exposure to client', regex: /NEXT_PUBLIC_.*(SECRET|KEY|PASSWORD|TOKEN)/gi },
  { name: 'hardcoded API key or password', regex: /(api_key|apiKey|secret|password)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/gi }
];

let findings = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  patterns.forEach(p => {
    let match;
    p.regex.lastIndex = 0;
    while ((match = p.regex.exec(content)) !== null) {
      console.log(`[ALERT: ${p.name}] at ${f} (pos ${match.index})`);
      findings++;
    }
  });
});

console.log(`\nAudit complete. Total findings: ${findings}`);
