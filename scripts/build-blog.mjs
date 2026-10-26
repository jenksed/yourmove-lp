// Generate public HTML pages from Pages CMS Markdown content.
// Runs at Vercel build time. No runtime database or server is involved.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const root = process.cwd();
const contentDir = path.join(root, 'content/blog');
const outputDir = path.join(root, 'public/blog');
const home = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const find = (re, label) => {
  const result = home.match(re);
  if (!result) throw new Error('Missing site layout: ' + label);
  return result[0];
};
const announcement = find(/<div class="announcement">[\s\S]*?<\/div><\/div>/, 'announcement');
const header = find(/<header class="header">[\s\S]*?<\/header>/, 'header');
const footer = find(/<footer class="footer">[\s\S]*?<\/footer>/, 'footer');
const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);
const md = new MarkdownIt({ html: false, linkify: true, typographer: true, breaks: false });
const dateISO = input => {
  const value = input instanceof Date ? input.toISOString().slice(0, 10) : String(input ?? '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? value : null;
};
const dateDisplay = iso => new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
}).format(new Date(iso + 'T12:00:00Z'));
const imageURL = value => {
  if (typeof value !== 'string' || !value.trim()) return '';
  // Keep featured images on the site's own asset path.
  return /^\/assets\/blog\/[a-zA-Z0-9_./%-]+\.(?:png|jpg|jpeg|webp|gif|avif)$/i.test(value) && !value.includes('..') ? value : '';
};
const base = (title, description, canonical, ogType, image, publishedDate = '') => '<!doctype html><html lang="en"><head>' +
  '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="theme-color" content="#f5f6f2">' +
  '<title>' + esc(title) + ' · YourMove</title>' +
  '<meta name="description" content="' + esc(description) + '">' +
  '<link rel="canonical" href="' + esc(canonical) + '">' +
  '<meta property="og:type" content="' + esc(ogType) + '">' +
  '<meta property="og:site_name" content="YourMove">' +
  '<meta property="og:title" content="' + esc(title) + ' · YourMove">' +
  '<meta property="og:description" content="' + esc(description) + '">' +
  '<meta property="og:url" content="' + esc(canonical) + '">' +
  (publishedDate ? '<meta property="article:published_time" content="' + esc(publishedDate) + '">' : '') +
  '<meta property="og:image" content="https://yourmove.run' + esc(image || '/assets/og-platforms.webp') + '">' +
  '<meta name="twitter:card" content="summary_large_image">' +
  '<meta name="twitter:title" content="' + esc(title) + ' · YourMove">' +
  '<meta name="twitter:description" content="' + esc(description) + '">' +
  '<meta name="twitter:image" content="https://yourmove.run' + esc(image || '/assets/og-platforms.webp') + '">' +
  '<link rel="icon" type="image/x-icon" href="/favicon.ico?v=20261025">' +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">' +
  '<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/campaign.css">' +
  '<link rel="stylesheet" href="/focused.css"><link rel="stylesheet" href="/brand-refresh.css">' +
  '<link rel="stylesheet" href="/blog.css">' +
  '<script defer src="/app.js"></script><script defer src="/analytics-config.js"></script>' +
  '<script defer src="/analytics.js"></script></head><body data-page="blog">' +
  '<a class="skip" href="#main">Skip to content</a>' + announcement + header;
const end = '</main>' + footer + '</body></html>';
const posts = fs.readdirSync(contentDir).filter(f => f.endsWith('.md')).map(file => {
  const slug = file.slice(0, -3);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Unsafe blog filename: ' + file);
  const item = matter(fs.readFileSync(path.join(contentDir, file), 'utf8'));
  const data = item.data;
  if (data.published !== true) return null;
  if (typeof data.title !== 'string' || !data.title.trim()) throw new Error('Missing title: ' + file);
  if (typeof data.description !== 'string' || !data.description.trim()) throw new Error('Missing description: ' + file);
  const date = dateISO(data.date);
  if (!date) throw new Error('Invalid publication date in ' + file);
  return { slug, title: data.title.trim(), seoTitle: typeof data.seo_title === 'string' && data.seo_title.trim() ? data.seo_title.trim() : data.title.trim(), description: data.description.trim(), date,
    image: imageURL(data.image), imageAlt: typeof data.image_alt === 'string' ? data.image_alt.trim() : '', body: item.content };
}).filter(Boolean).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
const cards = posts.map(p => {
  const media = p.image
    ? '<img class="ym-post-cover" src="' + esc(p.image) + '" alt="" loading="lazy">'
    : '<div class="ym-post-no-cover" aria-hidden="true">YOURMOVE.</div>';
  return '<a class="ym-post-card" href="/blog/' + esc(p.slug) + '/">' + media +
    '<div class="ym-post-card-copy"><span class="ym-post-date">' + esc(dateDisplay(p.date)) + '</span>' +
    '<h2>' + esc(p.title) + '</h2><p>' + esc(p.description) + '</p>' +
    '<span class="ym-read-link">Read article →</span></div></a>';
}).join('');
const index = base('The blog', 'Stories, product updates, and engineering notes from building YourMove.',
  'https://yourmove.run/blog/', 'website', '') +
  '<main id="main" class="ym-blog"><section class="ym-blog-hero"><div class="shell">' +
  '<h1>Building something<br>worth <em>talking about.</em></h1>' +
  '<p>Notes from behind YourMove. The job search, the engineering, what we are learning, and what comes next.</p>' +
  '</div></section><section class="ym-blog-body"><div class="shell"><div class="ym-blog-feature">' +
  (posts.length ? '<div class="ym-blog-list">' + cards + '</div>' :
    '<p class="ym-blog-empty">First articles are on the way.</p>') +
  '</div></div></section>' + end;
fs.writeFileSync(path.join(outputDir, 'index.html'), index);
for (const p of posts) {
  const url = 'https://yourmove.run/blog/' + p.slug + '/';
  const cover = p.image ? '<img class="ym-blog-cover" src="' + esc(p.image) + '" alt="' + esc(p.imageAlt) + '">' : '';
  const schema = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: p.title, description: p.description,
    datePublished: p.date,
    author: { '@type': 'Person', name: 'Joshua Jenks' },
    publisher: { '@type': 'Organization', name: 'YourMove', url: 'https://yourmove.run/' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(p.image ? {image: 'https://yourmove.run' + p.image} : {})
  };
  const structuredData = '<script type="application/ld+json">' + JSON.stringify(schema).replace(/</g, '\\u003c') + '</script>';
  const article = base(p.seoTitle, p.description, url, 'article', p.image, p.date).replace('</head>', structuredData + '</head>') +
    '<main id="main" class="ym-blog"><section class="ym-blog-article-head"><div class="shell">' +
    '<a class="ym-blog-back" href="/blog/">← All articles</a>' +
    '<div class="ym-post-date"><time datetime="' + esc(p.date) + '">' + esc(dateDisplay(p.date)) + '</time> · Joshua Jenks</div>' +
    '<h1>' + esc(p.title) + '</h1><p class="ym-blog-deck">' + esc(p.description) + '</p>' +
    '</div></section><article class="ym-blog-article">' + cover +
    '<div class="ym-prose">' + md.render(p.body) + '</div>' +
    '<div class="ym-blog-article-foot"><a href="/blog/">← Back to the blog</a></div>' +
    '</article>' + end;
  const target = path.join(outputDir, p.slug);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'index.html'), article);
}
console.log('Blog built: ' + posts.length + ' published article(s), ' +
  fs.readdirSync(contentDir).filter(f => f.endsWith('.md')).length + ' total.');

// Crawlable sitemap for the static marketing pages and all published posts.
const staticPaths = ['/', '/get-started/', '/how-it-works/', '/evidence/', '/manifesto/', '/review/', '/docs/', '/docs/first-application/', '/docs/troubleshooting/', '/docs/availability/', '/support/', '/blog/'];
const urls = [...staticPaths.map(urlPath => ({ urlPath })), ...posts.map(p => ({ urlPath: '/blog/' + p.slug + '/', lastmod: p.date }))];
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(({urlPath,lastmod}) => '  <url><loc>https://yourmove.run' + urlPath + '</loc>' + (lastmod ? '<lastmod>' + lastmod + '</lastmod>' : '') + '</url>').join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(root, 'public/sitemap.xml'), sitemap);
fs.writeFileSync(path.join(root, 'public/robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://yourmove.run/sitemap.xml\n');
