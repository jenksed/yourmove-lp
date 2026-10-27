// The homepage owns the shared markup. Keep static pages useful without JavaScript.
import fs from 'node:fs';
import path from 'node:path';
const publicDir = path.join(process.cwd(), 'public');
const home = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const patterns = {
  announcement: /<div class="announcement">[\s\S]*?<\/div><\/div>/,
  header: /<header class="header(?: doc-site-header)?">[\s\S]*?<\/header>/,
  footer: /<footer class="(?:footer|doc-footer)">[\s\S]*?<\/footer>/
};
export const layout = Object.fromEntries(Object.entries(patterns).map(([name, re]) => {
  const match = home.match(re);
  if (!match) throw new Error('Missing homepage layout: ' + name);
  return [name, match[0]];
}));
export function syncStaticLayout({check = false} = {}) {
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'blog') visit(file);
      if (!entry.isFile() || entry.name !== 'index.html' || file === path.join(publicDir, 'index.html')) continue;
      const original = fs.readFileSync(file, 'utf8');
      let updated = original;
      for (const [name, re] of Object.entries(patterns)) {
        if (!re.test(updated)) throw new Error(`Missing ${name} in ${file}`);
        updated = updated.replace(re, () => layout[name]);
      }
      if (!updated.includes('href="/site-layout.css"')) updated = updated.replace('</head>', '<link rel="stylesheet" href="/site-layout.css"></head>');
      if (!updated.includes('src="/release-banner.js"')) updated = updated.replace('</head>', '<link rel="stylesheet" href="/release-banner.css"><script defer src="/release-config.js"></script><script defer src="/release-banner.js"></script></head>');
      // Keep the shared stylesheet last, including on documentation pages.
      updated = updated.replace('<link rel="stylesheet" href="/site-layout.css">', '').replace('</head>', '<link rel="stylesheet" href="/site-layout.css"></head>');
      if (check && updated !== original) throw new Error('Shared layout is stale: ' + file);
      if (!check && updated !== original) fs.writeFileSync(file, updated);
    }
  }
  visit(publicDir);
}
