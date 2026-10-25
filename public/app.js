(()=>{
  document.documentElement.classList.add('js');
  const menu=document.querySelector('.menu-button');
  const nav=document.querySelector('.site-nav');
  if(menu&&nav){
    const setOpen=(open)=>{
      menu.setAttribute('aria-expanded',String(open));
      nav.classList.toggle('is-open',open);
      menu.querySelector('.menu-icon').textContent=open?'×':'☰';
    };
    menu.addEventListener('click',()=>setOpen(menu.getAttribute('aria-expanded')!=='true'));
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){setOpen(false);menu.focus()}});
    document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target)&&!nav.contains(e.target))setOpen(false)});
    window.matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)setOpen(false)});
  }
  const path=window.location.pathname;
  document.querySelectorAll('.site-nav [data-path]').forEach(a=>{if(a.dataset.path===path)a.setAttribute('aria-current','page')});
  const stages=[
    {kicker:'OPPORTUNITY / 01',title:'One job. One place to begin.',body:'Start with a supported employer posting and its application requirements.',rows:[['Opportunity','Support Engineer'],['Source','Employer posting'],['Next','Prepare application']]},
    {kicker:'YOUR RECORDS / 02',title:'Your work comes with you.',body:'Choose the information, answers, and documents that belong in this application.',rows:[['Candidate profile','Saved information'],['Documents','Selected resume'],['Previous writing','Answer Library']]},
    {kicker:'APPLICATION / 03',title:'Less starting from zero.',body:'Prepare supported employer fields using information you can inspect and correct.',rows:[['Employer form','Supported fields'],['Prior answer','Available to review'],['Unresolved items','Still yours to finish']]},
    {kicker:'REVIEW / 04',title:'Your application. Your call.',body:'Review the employer form, submit it yourself, and confirm the application in your records.',rows:[['Review','Applicant controlled'],['Final submission','On employer site'],['Application record','Confirmed by you']]}
  ];
  function tabs(container, tabSelector, render, keys=['ArrowRight','ArrowLeft']) {
    const controls=[...container.querySelectorAll(tabSelector)];
    controls.forEach((button,i)=>{
      button.addEventListener('click',()=>render(i));
      button.addEventListener('keydown',e=>{
        let next=null;
        if(e.key==='Home')next=0;
        if(e.key==='End')next=controls.length-1;
        if(keys.includes(e.key)){
          const delta=(e.key==='ArrowDown'||e.key==='ArrowRight')?1:-1;
          next=(i+delta+controls.length)%controls.length;
        }
        if(next!==null){e.preventDefault();render(next);controls[next].focus()}
      });
    });
    return controls;
  }
  const comparison=document.querySelector('[data-compare]');
  if(comparison){
    const choices=[...comparison.querySelectorAll('[data-compare-state]')];
    const answer=comparison.querySelector('[data-answer-field]');
    const meta=comparison.querySelector('[data-answer-meta]');
    const caption=comparison.querySelector('[data-compare-caption]');
    const summary=comparison.querySelector('[data-compare-summary]');
    const saved='I investigated a slow-running service, used logs and query plans to isolate the bottleneck, coordinated the change, and checked that performance recovered.';
    function show(mode){
      comparison.dataset.mode=mode;
      choices.forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.compareState===mode)));
      const active=mode==='saved';
      answer.classList.toggle('is-filled',active);
      answer.replaceChildren();
      const p=document.createElement('p');p.textContent=active?saved:'Your answer goes here…';
      if(!active)p.className='ym-field-placeholder';
      answer.append(p);
      meta.textContent=active?'SAVED EXAMPLE · READY TO REVIEW':'NOTHING CARRIED OVER';
      caption.textContent=active?'WITH YOURMOVE:':'STARTING OVER:';
      summary.textContent=active?'A relevant saved answer is available to adapt and review.':'A familiar question begins with an empty box. Again.';
    }
    choices.forEach(c=>c.addEventListener('click',()=>show(c.dataset.compareState)));
    show('saved');
  }
  const flow=document.querySelector('[data-workflow]');
  if(flow){
    const content=flow.querySelector('[data-flow-content]');
    const panel=flow.querySelector('#flow-stage');
    const controls=[...flow.querySelectorAll('[data-flow]')];
    function render(i){
      const s=stages[i];
      controls.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1});
      panel.setAttribute('aria-labelledby',`flow-tab-${i}`);const num=flow.querySelector('.ym-screen-step');if(num)num.textContent=String(i+1);
      content.replaceChildren();
      const kicker=document.createElement('div');kicker.className='mock-kicker';kicker.textContent=s.kicker;
      const title=document.createElement('h3');title.textContent=s.title;
      const desc=document.createElement('p');desc.textContent=s.body;
      const rows=document.createElement('div');rows.className='mini-rows';
      s.rows.forEach(([key,val])=>{const row=document.createElement('div');const a=document.createElement('span');const b=document.createElement('strong');a.textContent=key;b.textContent=val;row.append(a,b);rows.append(row)});
      content.append(kicker,title,desc,rows);
    }
    tabs(flow,'[data-flow]',render,['ArrowRight','ArrowLeft','ArrowDown','ArrowUp']);render(0);
  }
  const evidence=document.querySelector('[data-evidence]');
  if(evidence){
    const controls=[...evidence.querySelectorAll('[data-evidence-stage]')];
    const panel=evidence.querySelector('[data-evidence-body]');
    const parts=[
      {meta:'EXAMPLE / EMPLOYER QUESTION',title:'Tell us about a difficult technical problem you solved.',text:'A familiar question. The answer you write now shouldn’t be buried in yesterday’s application.',footer:'ILLUSTRATIVE SCENARIO'},
      {meta:'EXAMPLE / APPLICANT-CURATED RECORD',title:'Keep the actual incident, not just the polished answer.',text:'Situation: production service issue. Actions: investigated logs and coordinated recovery. Outcome: not recorded. Applicant review is not external verification.',footer:'SELF-REVIEWED ≠ INDEPENDENTLY VERIFIED'},
      {meta:'EXAMPLE / A LATER APPLICATION',title:'Now you have a real place to start.',text:'Your past writing and evidence records can inform a new answer. You decide what is relevant, adjust the language, and verify every claim.',footer:'APPLICANT MAKES THE FINAL EDIT'}
    ];
    function render(i){
      controls.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=j===i?0:-1});
      const p=parts[i];panel.replaceChildren();
      const meta=document.createElement('div');meta.className='ev-stage-meta';meta.textContent=p.meta;
      const h=document.createElement('h3');h.textContent=p.title;
      const body=document.createElement('p');body.textContent=p.text;
      const footer=document.createElement('span');footer.className='ev-stage-bottom';footer.textContent=p.footer;
      panel.append(meta,h,body,footer);
    }
    tabs(evidence,'[data-evidence-stage]',render,['ArrowLeft','ArrowRight']);render(0);
  }
  document.querySelectorAll('[data-copy-text]').forEach(btn=>btn.addEventListener('click',async()=>{
    const original=btn.textContent;const value=btn.dataset.copyText;
    try{
      if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value)}
      else{
        const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.left='-9999px';document.body.appendChild(t);t.select();const success=document.execCommand('copy');t.remove();if(!success)throw Error('Copy denied');
      }
      btn.textContent='Copied ✓';
      document.dispatchEvent(new CustomEvent('ym:copy-command',{detail:{group:btn.closest('.gs-console')?'mac_build':'browser_run',result:'success'}}));
    }catch(_){btn.textContent='Select text manually';
      document.dispatchEvent(new CustomEvent('ym:copy-command',{detail:{group:btn.closest('.gs-console')?'mac_build':'browser_run',result:'failure'}}));}
    setTimeout(()=>btn.textContent=original,1800);
  }));
})();
