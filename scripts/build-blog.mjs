// Generate public HTML pages from Pages CMS Markdown content.
// Runs at Vercel build time. No runtime database or server is involved.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import {layout, syncStaticLayout} from './shared-layout.mjs';

const root = process.cwd();
const contentDir = path.join(root, 'content/blog');
const outputDir = path.join(root, 'public/blog');
// Both generated articles and static routes use the homepage's shared layout.
const {announcement, header, footer} = layout;
syncStaticLayout({check: process.argv.includes('--check')});
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
  // Keep editorial and approved identity images on the site's own asset paths.
  return /^\/assets\/(?:blog|identity)\/[a-zA-Z0-9_./%-]+\.(?:png|jpg|jpeg|webp|gif|avif)$/i.test(value) && !value.includes('..') ? value : '';
};

const origin = 'https://www.yourmove.run';
const urlFor = slug => origin + '/blog/' + (slug ? slug + '/' : '');
const isoTime = date => date + 'T12:00:00Z';
const jsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c');
const pageHead = ({title, description, canonical, ogType='website', image='', published='', schema=null}) =>
  '<!doctype html><html lang="en"><head>' +
  '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="theme-color" content="#f5f4f1">' +
  '<title>' + esc(title) + ' · YourMove</title>' +
  '<meta name="description" content="' + esc(description) + '">' +
  '<link rel="canonical" href="' + esc(canonical) + '">' +
  '<link rel="alternate" type="application/rss+xml" title="YourMove Journal" href="/feed.xml">' +
  '<meta property="og:type" content="' + esc(ogType) + '">' +
  (published ? '<meta property="article:published_time" content="' + esc(isoTime(published)) + '"><meta name="author" content="Joshua Jenks">' : '') +
  '<meta property="og:site_name" content="YourMove">' +
  '<meta property="og:title" content="' + esc(title) + ' · YourMove">' +
  '<meta property="og:description" content="' + esc(description) + '">' +
  '<meta property="og:url" content="' + esc(canonical) + '">' +
  '<meta property="og:image" content="' + origin + esc(image || '/assets/identity/yourmove-og-default.png') + '">' +
  '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png">' +
  '<meta property="og:image:alt" content="' + esc(ogType === 'article' ? title + ' · YourMove' : 'YourMove — Real experience is enough work.') + '">' +
  '<meta name="twitter:card" content="summary_large_image">' +
  '<meta name="twitter:image" content="' + origin + esc(image || '/assets/identity/yourmove-og-default.png') + '">' +
  '<meta name="twitter:image:alt" content="' + esc(ogType === 'article' ? title + ' · YourMove' : 'YourMove — Real experience is enough work.') + '">' +
  '<link rel="icon" type="image/x-icon" href="/favicon.ico?v=20261027b"><link rel="icon" type="image/png" sizes="16x16" href="/assets/identity/favicon-16.png"><link rel="icon" type="image/png" sizes="32x32" href="/assets/identity/favicon-32.png"><link rel="icon" type="image/svg+xml" href="/assets/identity/favicon.svg?v=20261027b"><link rel="apple-touch-icon" sizes="180x180" href="/assets/identity/apple-touch-icon.png">' +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500&display=swap" rel="stylesheet">' +
  '<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/campaign.css">' +
  '<link rel="stylesheet" href="/focused.css"><link rel="stylesheet" href="/brand-refresh.css">' +
  '<link rel="stylesheet" href="/blog.css"><link rel="stylesheet" href="/release-banner.css"><link rel="stylesheet" href="/site-layout.css">' +
  '<script defer src="/release-config.js"></script><script defer src="/release-banner.js"></script>' +
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
    description:data.description.trim(), image:imageURL(data.image), socialImage:imageURL(data.social_image),
    imageAlt:typeof data.image_alt==='string' ? data.image_alt.trim() : '',
    imageCaption:typeof data.image_caption==='string' ? data.image_caption.trim() : '',
    featured:data.featured === true,
    pullQuote:typeof data.pull_quote==='string' ? data.pull_quote.trim() : '', body:item.content
  };
}).filter(Boolean).sort((a,b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
const pubDate = post => '<time datetime="' + esc(post.date) + '">' + esc(dateDisplay(post.date)) + '</time>';
// An explicit editorial choice wins; new articles otherwise remain in date order.
const lead = posts.find(post => post.featured) || posts[0];
const byline = post => '<p class="ym-post-meta">Joshua Jenks <span aria-hidden="true">·</span> ' + pubDate(post) + '</p>';
const postLink = post => '/blog/' + esc(post.slug) + '/';
const story = post =>
  '<article class="ym-story">' +
  (post.image ? '<a class="ym-story-image" href="' + postLink(post) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(post.image) + '" alt="" loading="lazy"></a>' : '') +
  '<div class="ym-story-copy">' + byline(post) + '<h3><a href="' + postLink(post) + '">' + esc(post.title) + '</a></h3>' +
  '<p>' + esc(post.description) + '</p></div></article>';
const index = pageHead({
  title:'The Journal — Building YourMove',
  description:'Writing by Joshua Jenks about looking for work, building YourMove, and the engineering decisions behind an independent, open-source project.',
  canonical:urlFor(''),
  schema:{"@context":"https://schema.org","@type":"Blog",name:"The YourMove Journal",url:urlFor(''),
    description:"Stories about building YourMove, an open-source job application tool."}
}) +
  '<main id="main" class="ym-blog"><div class="ym-journal-shell">' +
  '<header class="ym-journal-masthead"><h1>The Journal.</h1><div><p>Looking for work.<br> Building something useful along the way.</p>' +
  '<p class="ym-journal-credit">Writing by Joshua Jenks <span aria-hidden="true">·</span> <a href="/feed.xml">RSS</a></p></div></header>' +
  (lead ? '<section id="stories" class="ym-lead-story" aria-labelledby="lead-story-title"><div>' +
    '<p class="ym-reading-note">' + (lead.featured ? 'A place to begin' : 'Latest story') + '</p>' +
    '<h2 id="lead-story-title"><a href="' + postLink(lead) + '">' + esc(lead.title) + '</a></h2>' +
    '<p class="ym-lead-summary">' + esc(lead.description) + '</p>' + byline(lead) +
    '<a class="ym-read-link" href="' + postLink(lead) + '">Read the story</a></div>' +
    (lead.image ? '<a class="ym-lead-image" href="' + postLink(lead) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(lead.image) + '" alt=""></a>' :
      lead.pullQuote ? '<blockquote><p>“' + esc(lead.pullQuote) + '”</p><cite>From “' + esc(lead.title) + '”</cite></blockquote>' : '') +
    '</section>' : '<p>No articles published yet.</p>') +
  (posts.length > 1 ? '<section class="ym-story-list" aria-labelledby="more-stories-title"><h2 id="more-stories-title">More from the Journal</h2>' +
    posts.filter(post => post !== lead).map(story).join('') + '</section>' : '') +
  '<aside class="ym-journal-companion" aria-labelledby="companion-title"><h2 id="companion-title">A small, reasonable objection.</h2>' +
  '<div><p>Upload your résumé. Now re-type your résumé. The Manifesto takes issue with the routine.</p>' +
  '<a href="/manifesto/">The form has amnesia</a></div></aside></div>' + pageEnd;
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
    image:origin+(post.socialImage || '/assets/identity/yourmove-og-default.png')
  };
  const related=posts.filter(p=>p.slug!==post.slug).slice(0,3);
  const cover=post.image ? '<figure class="ym-article-cover"><img src="' + esc(post.image) + '" alt="' + esc(post.imageAlt) + '">' +
    (post.imageCaption ? '<figcaption>' + esc(post.imageCaption) + '</figcaption>' : '') + '</figure>' : '';
  const article=pageHead({
    title:post.seoTitle || post.title,description:post.description,canonical:url,ogType:'article',image:post.socialImage,published:post.date,schema
  }) +
    '<main id="main" class="ym-blog"><article class="ym-article" aria-labelledby="article-title">' +
    '<header class="ym-blog-article-head"><a class="ym-blog-back" href="/blog/">Back to the Journal</a>' +
    '<h1 id="article-title">' + esc(post.title) + '</h1><p class="ym-blog-deck">' + esc(post.description) + '</p>' +
    '<div class="ym-article-meta"><span>By Joshua Jenks</span>' + pubDate(post) + '</div></header>' +
    cover + '<div class="ym-blog-article"><div class="ym-prose">' + md.render(post.body) + '</div>' +
    '<footer class="ym-article-end"><div class="ym-article-actions"><a href="/blog/">Back to the Journal</a>' +
    '<button type="button" hidden data-copy-article data-url="' + esc(url) + '">Copy article link</button></div>' +
    '<p class="ym-copy-status" data-copy-status role="status" aria-live="polite"></p></footer>' +
    (related.length ? '<nav class="ym-article-related" aria-labelledby="related-title">' +
      '<h2 id="related-title">Keep reading</h2>' + related.map(r=>'<a href="/blog/' + esc(r.slug) + '/">' + esc(r.title) + '</a>').join('') +
      '<a href="/manifesto/">The form has amnesia — the Manifesto</a></nav>' : '') +
    '</div></article>' + pageEnd;
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
