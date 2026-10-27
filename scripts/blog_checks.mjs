// Exercise the actual Markdown generator in an isolated tree; never publish fixtures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'yourmove-journal-'));
const generator=path.resolve('scripts/build-blog.mjs');
try {
  fs.mkdirSync(path.join(root,'public'),{recursive:true});
  fs.mkdirSync(path.join(root,'content/blog'),{recursive:true});
  fs.copyFileSync('public/index.html',path.join(root,'public/index.html'));
  const build=()=>execFileSync(process.execPath,[generator],{cwd:root,stdio:'pipe'});
  const read=name=>fs.readFileSync(path.join(root,'public',name),'utf8');
  const write=(slug,data,body='A paragraph.\n\n## A heading\n\nA second paragraph.')=>fs.writeFileSync(path.join(root,'content/blog',slug+'.md'),'---\n'+Object.entries({title:'A story',description:'A summary',date:'2026-10-26',published:true,...data}).map(([key,value])=>key+': '+JSON.stringify(value)).join('\n')+'\n---\n'+body);
  build();assert.match(read('blog/index.html'),/No articles published yet/);
  write('first',{featured:true,pull_quote:'An exact excerpt.'});build();
  assert.match(read('blog/index.html'),/An exact excerpt/);
  assert.doesNotMatch(read('blog/index.html'),/More from the Journal/);
  // More stories, including a newer story with no image, inherit the list structure.
  write('newer',{date:'2026-10-27'});write('draft',{published:false,title:'DRAFT_SENTINEL'});
  write('escaped',{title:'<script>alert("title")</script>',description:'Text & "quotes" <tag>',image:'/assets/blog/fixture.webp',image_caption:'<img src=x onerror=alert(1)>',pull_quote:'<script>quote</script>'},'<script>alert("body")</script>\n\n[unsafe](javascript:alert(1))\n\n> A quotation\n\n- One\n- Two');
  build();const index=read('blog/index.html'),article=read('blog/escaped/index.html');
  assert.ok(index.indexOf('id="lead-story-title"><a href="/blog/first/"')>0);
  assert.match(index,/ym-story-list/);assert.match(index,/href="\/blog\/newer\/"/);
  assert.doesNotMatch(index,/DRAFT_SENTINEL/);
  assert.ok(!fs.existsSync(path.join(root,'public/blog/draft')));
  assert.match(article,/&lt;script&gt;/);assert.match(article,/&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(article,/<script>alert|<img src=x|href="javascript:/);
  assert.match(article,/\\u003cscript>/);assert.match(article,/<blockquote>/);assert.match(article,/<ul>/);
  write('bad-image',{image:'/assets/blog/../private.png'});build();
  assert.doesNotMatch(read('blog/bad-image/index.html'),/<figure class="ym-article-cover">/);
  // Unpublishing removes the old output, feed item and sitemap entry.
  write('newer',{published:false});build();
  assert.ok(!fs.existsSync(path.join(root,'public/blog/newer')));
  for(const file of ['feed.xml','sitemap.xml'])assert.doesNotMatch(read(file),/\/blog\/(draft|newer)\//);
  assert.match(read('feed.xml'),/Text &amp; &quot;quotes&quot; &lt;tag&gt;/);
  assert.match(read('sitemap.xml'),/https:\/\/www.yourmove.run\/blog\/first\//);
  write('invalid',{date:'not-a-date'});assert.throws(build);fs.unlinkSync(path.join(root,'content/blog/invalid.md'));
  write('unsafe.name',{});assert.throws(build);
  console.log('PASS empty, one/many posts, featured selection, optional images/captions, publication controls, RSS/sitemap, escaping, raw HTML and unsafe URL/filename/date boundaries. Isolated fixtures only.');
} finally {fs.rmSync(root,{recursive:true,force:true});}
