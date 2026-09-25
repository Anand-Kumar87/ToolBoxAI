import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(walk(full));
      }
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.json') ||
      file.endsWith('.md') ||
      file.endsWith('.mjs') ||
      file === '.env.example'
    ) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('.');
let totalReplacements = 0;
let modifiedFiles = 0;

const replacements = [
  { from: /Korevante\s+AI/g, to: "Korevante Studio" },
  { from: /Korevante\s+AI/g, to: "Korevante Studio" },
  { from: /KOREVANTE\s+AI/g, to: "KOREVANTE STUDIO" },
  { from: /korevante-studio/g, to: "korevante-studio" },
  { from: /toolverse\.ai/g, to: "korevante.com" },
  { from: /korevante_db/g, to: "korevante_db" },
  { from: /korevante-files/g, to: "korevante-files" },
  { from: /korevante-default-secret/g, to: "korevante-default-secret" },
  { from: /Korevante-Privacy-Scanner/g, to: "Korevante-Privacy-Scanner" },
  { from: /Korevante-Auditor/g, to: "Korevante-Auditor" },
  { from: /Korevante/g, to: "Korevante" },
  { from: /Korevante/g, to: "Korevante" },
  { from: /KOREVANTE/g, to: "KOREVANTE" },
];

files.forEach(file => {
  if (file.includes('scripts/rebrand-to-korevante.mjs')) return;
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  replacements.forEach(({ from, to }) => {
    newContent = newContent.replace(from, to);
  });

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    modifiedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`\nRebranding to Korevante Studio complete! Modified ${modifiedFiles} files.`);
