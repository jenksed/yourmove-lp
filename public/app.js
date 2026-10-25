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
    const answerCopy=comparison.querySelector('[data-answer-copy]');
    const answerBadge=comparison.querySelector('[data-answer-badge]');
    const name=comparison.querySelector('[data-demo-name]');
    const email=comparison.querySelector('[data-demo-email]');
    const resume=comparison.querySelector('[data-demo-resume]');
    const resumeMeta=comparison.querySelector('[data-demo-resume-meta]');
    const meta=comparison.querySelector('[data-answer-meta]');
    const title=comparison.querySelector('[data-context-title]');
    const description=comparison.querySelector('[data-context-description]');
    const caption=comparison.querySelector('[data-compare-caption]');
    const summary=comparison.querySelector('[data-compare-summary]');
    const sourceDetails=[...comparison.querySelectorAll('[data-demo-source-detail]')];
    const savedAnswer='At my previous company, a core service became increasingly slow. I used application logs and database query plans to identify the bottleneck, coordinated a fix with the team, and monitored the rollout to verify performance recovered.';
    const savedDetails=[
      'Relevant answer from your library.',
      'Your saved details and preferences.',
      'The résumé you chose for this application.'
    ];
    const blankDetails=[
      'Nothing carried into this form.',
      'Details must be entered again.',
      'No résumé has been selected.'
    ];
    function show(mode){
      const active=mode==='saved';
      comparison.dataset.mode=active?'saved':'blank';
      choices.forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.compareState===mode)));
      name.textContent=active?'Taylor Kim':'—';
      email.textContent=active?'taylor@example.com':'—';
      resume.textContent=active?'Taylor_Kim_Resume.pdf':'No résumé selected';
      resumeMeta.textContent=active?'Selected for this application':'Attachment needed';
      answer.classList.toggle('is-filled',active);
      answerCopy.textContent=active?savedAnswer:'Your answer goes here…';
      answerBadge.replaceChildren();
      const mark=document.createElement('span');
      mark.setAttribute('aria-hidden','true');
      mark.textContent=active?'✓':'–';
      answerBadge.append(mark,document.createTextNode(active?' From your saved work':' Nothing carried over'));
      meta.textContent=active?'SAVED EXAMPLE · READY TO REVIEW':'NOTHING CARRIED OVER';
      title.textContent=active?'You already have a place to begin.':'Another blank application.';
      description.textContent=active
        ?'A past answer and selected records can be reused, corrected, and reviewed before submission. YourMove helps carry your experience into another application.'
        :'Your details, résumé, and previous answers do not follow you into this form. You start with the same familiar questions and have to enter the information again.';
      sourceDetails.forEach((el,i)=>{el.textContent=(active?savedDetails:blankDetails)[i]});
      caption.textContent=active?'WITH YOURMOVE:':'STARTING OVER:';
      summary.textContent=active
        ?'A relevant saved answer and selected records are available to adapt and review.'
        :'A familiar question begins with an empty box. Again.';
    }
    choices.forEach((button,index)=>{
      button.addEventListener('click',()=>show(button.dataset.compareState));
      button.addEventListener('keydown',event=>{
        let next=null;
        if(event.key==='Home')next=0;
        if(event.key==='End')next=choices.length-1;
        if(event.key==='ArrowLeft')next=(index+choices.length-1)%choices.length;
        if(event.key==='ArrowRight')next=(index+1)%choices.length;
        if(next!==null){event.preventDefault();choices[next].focus();show(choices[next].dataset.compareState)}
      });
    });
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
