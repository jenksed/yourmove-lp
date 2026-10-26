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

const origin = 'https://www.yourmove.run';
const urlFor = slug => origin + '/blog/' + (slug ? slug + '/' : '');
const isoTime = date => date + 'T12:00:00Z';
const jsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c');
const pageHead = ({title, description, canonical, ogType='website', image='', schema=null}) =>
  '<!doctype html><html lang="en"><head>' +
  '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="theme-color" content="#f9f8f3">' +
  '<title>' + esc(title) + ' · YourMove</title>' +
  '<meta name="description" content="' + esc(description) + '">' +
  '<link rel="canonical" href="' + esc(canonical) + '">' +
  '<link rel="alternate" type="application/rss+xml" title="YourMove Journal" href="/feed.xml">' +
  '<meta property="og:type" content="' + esc(ogType) + '">' +
  '<meta property="og:site_name" content="YourMove">' +
  '<meta property="og:title" content="' + esc(title) + ' · YourMove">' +
  '<meta property="og:description" content="' + esc(description) + '">' +
  '<meta property="og:url" content="' + esc(canonical) + '">' +
  '<meta property="og:image" content="' + origin + esc(image || '/assets/og-platforms.webp') + '">' +
  '<meta name="twitter:card" content="summary_large_image">' +
  '<link rel="icon" type="image/x-icon" href="/favicon.ico?v=20261025">' +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">' +
  '<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/campaign.css">' +
  '<link rel="stylesheet" href="/focused.css"><link rel="stylesheet" href="/brand-refresh.css">' +
  '<link rel="stylesheet" href="/blog.css">' +
  '<script defer src="/app.js"></script><script defer src="/blog.js"></script>' +
  '<script defer src="/analytics-config.js"></script><script defer src="/analytics.js"></script>' +
  (schema ? '<script type="application/ld+json">' + jsonLd(schema) + '</script>' : '') +
  '</head><body data-page="blog">' +
  '<a class="skip" href="#main">Skip to content</a>' + announcement + header;
const pageEnd = '</main>' + footer + '</body></html>';
const posts = fs.readdirSync(contentDir).filter(f => f.endsWith('.md')).map(file => {
  const slug = file.slice(0,-3);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Unsafe blog filename: ' + file);
  const item = matter(fs.readFileSync(path.join(contentDir,file),'utf8'));
  const data = item.data;
  if (data.published !== true) return null;
  if (typeof data.title !== 'string' || !data.title.trim()) throw new Error('Missing title: ' + file);
  if (typeof data.description !== 'string' || !data.description.trim()) throw new Error('Missing description: ' + file);
  const date = dateISO(data.date);
  if (!date) throw new Error('Invalid publication date in ' + file);
  return {
    slug, date, title:data.title.trim(), seoTitle:typeof data.seo_title==='string' ? data.seo_title.trim() : '',
    description:data.description.trim(), image:imageURL(data.image),
    imageAlt:typeof data.image_alt==='string' ? data.image_alt.trim() : '', body:item.content
  };
}).filter(Boolean).sort((a,b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
const pubDate = post => '<time datetime="' + esc(post.date) + '">' + esc(dateDisplay(post.date)) + '</time>';
const visual = post => post.image
  ? '<div class="ym-feature-art"><img src="' + esc(post.image) + '" alt="' + esc(post.imageAlt) + '"></div>'
  : '<div class="ym-feature-art ym-feature-art--drawing" aria-hidden="true">' +
      '<div class="ym-paper ym-paper--back"></div><div class="ym-paper ym-paper--front">' +
      '<span class="ym-paper-head"></span>' +
      '<span class="ym-paper-line"></span><span class="ym-paper-line"></span>' +
      '<span class="ym-paper-line"></span><span class="ym-paper-line"></span>' +
      '<span class="ym-paper-line"></span><span class="ym-paper-check">✓</span></div></div>';
const feature = post =>
  '<a class="ym-feature" href="/blog/' + esc(post.slug) + '/">' +
  '<div class="ym-feature-copy"><span class="ym-feature-label">Featured story · ' + pubDate(post) + '</span>' +
  '<h2>' + esc(post.title) + '</h2><p class="ym-feature-summary">' + esc(post.description) + '</p>' +
  '<span class="ym-feature-link">Read the story <span aria-hidden="true">↗</span></span></div>' +
  visual(post) + '</a>';
const card = post =>
  '<a class="ym-post-card" href="/blog/' + esc(post.slug) + '/">' +
  (post.image
    ? '<span class="ym-post-media"><img src="' + esc(post.image) + '" alt="' + esc(post.imageAlt) + '" loading="lazy"></span>'
    : '<span class="ym-post-media ym-post-media--graphic" aria-hidden="true"></span>') +
  '<div class="ym-post-card-copy"><span class="ym-post-meta">' + pubDate(post) + '</span>' +
  '<h3>' + esc(post.title) + '</h3><p>' + esc(post.description) + '</p>' +
  '<span class="ym-post-link">Read article <span aria-hidden="true">↗</span></span></div></a>';
const note = '<section class="ym-journal-note" aria-labelledby="ym-journal-note-title"><div class="shell ym-journal-note-grid">' +
  '<div><span class="ym-journal-label">From the builder</span><h2 id="ym-journal-note-title">BUILDING IN THE OPEN.</h2></div>' +
  '<div class="ym-journal-note-copy"><p>I started YourMove while looking for work myself. Here I write about the problem, the decisions behind the software, and what happens when those decisions meet real applications.</p>' +
  '<p>I’m Joshua Jenks, and this is an independent, open-source project. You can <a href="/support/">read why I’m building it</a> or <a href="https://github.com/jenksed/yourmove-go" target="_blank" rel="noopener noreferrer">inspect the code</a>.</p></div></div></section>';
const closer = '<section class="ym-journal-end" aria-labelledby="ym-journal-end-title"><div class="shell ym-journal-end-grid">' +
  '<div><span class="ym-journal-label">Explore the project</span><h2 id="ym-journal-end-title">SEE WHAT WE’RE BUILDING.</h2></div>' +
  '<div><p>YourMove helps job seekers keep their work, prepare supported applications, and make the final call themselves.</p>' +
  '<div class="ym-journal-end-links"><a class="ym-primary" href="/how-it-works/" data-analytics-cta="see_how_it_works" data-analytics-placement="blog_end">See how YourMove works <span aria-hidden="true">↗</span></a>' +
  '<a class="ym-secondary" href="/get-started/" data-analytics-cta="get_started" data-analytics-placement="blog_end">Get started</a></div></div></div></section>';
const index = pageHead({
  title:'Job Search, Product & Engineering — The Journal',
  description:'Notes from behind YourMove: the job search, the engineering, product decisions, and what it takes to build a better application experience.',
  canonical:urlFor(''),
  schema:{"@context":"https://schema.org","@type":"Blog",name:"The YourMove Journal",url:urlFor(''),
    description:"Stories about building YourMove, an open-source job application tool."}
}) +
  '<main id="main" class="ym-blog">' +
  '<section class="ym-journal-hero" aria-labelledby="ym-journal-title"><div class="shell">' +
  '<div class="ym-journal-heading"><div><span class="ym-journal-label">The YourMove Journal</span>' +
  '<h1 id="ym-journal-title">THERE’S MORE<br>TO <em>THE STORY.</em></h1></div>' +
  '<div class="ym-journal-intro"><p>The job search. The software. The decisions, setbacks, and progress behind YourMove.</p>' +
  '<a href="#stories">Read the stories <span aria-hidden="true">↓</span></a></div></div>' +
  '<div class="ym-journal-hero-foot"><span>PRODUCT · ENGINEERING · JOB SEARCH</span>' +
  '<span>INDEPENDENTLY BUILT. OPEN SOURCE.</span></div></div></section>' +
  '<section id="stories" class="ym-feature-section" aria-labelledby="ym-feature-title"><div class="shell">' +
  '<div class="ym-section-heading"><h2 id="ym-feature-title">Start here</h2><span>Stories from the project</span></div>' +
  (posts.length ? feature(posts[0]) : '<p>No articles published yet. The first story is coming soon.</p>') +
  '</div></section>' +
  (posts.length > 1
    ? '<section class="ym-journal-latest" aria-labelledby="ym-latest-title"><div class="shell">' +
      '<div class="ym-section-heading"><h2 id="ym-latest-title">More from the journal</h2></div>' +
      '<div class="ym-post-grid">' + posts.slice(1).map(card).join('') + '</div></div></section>'
    : '') +
  note + closer + pageEnd;
fs.rmSync(outputDir,{recursive:true,force:true});
fs.mkdirSync(outputDir,{recursive:true});
fs.writeFileSync(path.join(outputDir,'index.html'),index);

for(const post of posts){
  const url=urlFor(post.slug);
  const schema={
    '@context':'https://schema.org','@type':'BlogPosting',
    headline:post.title,description:post.description,
    datePublished:isoTime(post.date),dateModified:isoTime(post.date),
    author:{'@type':'Person',name:'Joshua Jenks'},
    publisher:{'@type':'Organization',name:'YourMove',url:origin},
    mainEntityOfPage:{'@type':'WebPage','@id':url},
    ...(post.image ? {image:origin+post.image} : {})
  };
  const related=posts.filter(p=>p.slug!==post.slug).slice(0,3);
  const cover=post.image ? '<figure class="ym-article-cover"><img src="' + esc(post.image) + '" alt="' + esc(post.imageAlt) + '"></figure>' : '';
  const article=pageHead({
    title:post.seoTitle || post.title,description:post.description,canonical:url,ogType:'article',image:post.image,schema
  }) +
    '<main id="main" class="ym-blog"><header class="ym-blog-article-head"><div class="shell">' +
    '<a class="ym-blog-back" href="/blog/">← All articles</a>' +
    '<div class="ym-article-meta">The YourMove Journal · ' + pubDate(post) + '</div>' +
    '<h1>' + esc(post.title) + '</h1><p class="ym-blog-deck">' + esc(post.description) + '</p>' +
    '<div class="ym-author-row"><span class="ym-author-mark" aria-hidden="true">J.</span>' +
    '<div><strong>Joshua Jenks</strong><span>Creator of YourMove</span></div></div></div></header>' +
    cover +
    '<article class="ym-blog-article"><div class="ym-prose">' + md.render(post.body) + '</div>' +
    '<footer class="ym-article-end"><p>Found this useful? Share the article or explore the rest of the project.</p>' +
    '<div class="ym-article-actions"><button type="button" data-copy-article data-url="' + esc(url) + '">Copy article link</button>' +
    '<a href="/blog/">More articles <span aria-hidden="true">↗</span></a></div>' +
    '<p class="ym-copy-status" data-copy-status role="status" aria-live="polite"></p></footer>' +
    (related.length ? '<section class="ym-article-related" aria-labelledby="related-title">' +
      '<h2 id="related-title">Keep reading</h2>' + related.map(r=>'<a href="/blog/' + esc(r.slug) + '/">' + esc(r.title) + ' <span aria-hidden="true">↗</span></a>').join('') +
      '</section>' : '') +
    '</article>' + closer + pageEnd;
  const dest=path.join(outputDir,post.slug);
  fs.mkdirSync(dest,{recursive:true});
  fs.writeFileSync(path.join(dest,'index.html'),article);
}
const xmlEsc=value=>esc(value);
const feed='<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>' +
  '<title>YourMove Journal</title><link>' + origin + '/blog/</link>' +
  '<description>Stories, engineering notes, and project updates from building YourMove.</description>' +
  '<language>en-us</language>' +
  posts.map(p=>'<item><title>' + xmlEsc(p.title) + '</title><link>' + urlFor(p.slug) + '</link>' +
    '<guid isPermaLink="true">' + urlFor(p.slug) + '</guid>' +
    '<pubDate>' + new Date(isoTime(p.date)).toUTCString() + '</pubDate>' +
    '<description>' + xmlEsc(p.description) + '</description></item>').join('') +
  '</channel></rss>';
fs.writeFileSync(path.join(root,'public/feed.xml'),feed);
const staticPaths=['/','/blog/','/how-it-works/','/get-started/','/support/','/evidence/','/manifesto/','/review/','/docs/'];
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  [...staticPaths.map(p=>origin+p),...posts.map(p=>urlFor(p.slug))]
    .map(loc=>'<url><loc>'+xmlEsc(loc)+'</loc></url>').join('')+'</urlset>';
fs.writeFileSync(path.join(root,'public/sitemap.xml'),sitemap);
fs.writeFileSync(path.join(root,'public/robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
console.log('Blog built: ' + posts.length + ' published article(s), ' +
  fs.readdirSync(contentDir).filter(f => f.endsWith('.md')).length + ' total.');
