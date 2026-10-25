/* YourMove docs: progressive enhancement only. No personal/job/search text is sent to analytics. */
(()=>{
  "use strict";
  const analytics=(event,props)=>{
    if(window.YourMoveAnalytics&&typeof window.YourMoveAnalytics.track==="function"){
      window.YourMoveAnalytics.track(event,props);
    }
  };
  const pages={"/docs/":"home","/docs/first-application/":"first_application","/docs/troubleshooting/":"troubleshooting","/docs/availability/":"availability"};
  const path="/"+location.pathname.replace(/^\\/+|\\/+$/g,"")+"/";
  const page=pages[path];
  if(page)analytics("ym_docs_article_viewed",{article_id:page,topic:page==="troubleshooting"?"recovery":page==="availability"?"distribution":"onboarding",version_scope:"preview"});
  const journey=document.querySelector("[data-doc-journey]");
  if(journey){
    const choices=[...journey.querySelectorAll("[data-doc-state]")];
    const scenarios={
      new:{step:"START / 01",visualHead:"OPPORTUNITY",visualPill:"READY TO SAVE",job:"Support Engineer",company:"Example employer · Job URL",check:"+",label:"FIRST ACTION",field:"Paste the posting URL",progress:"1",ordinal:"01 / SAVE THE JOB",title:"One job link. A place to begin.",copy:"Save the posting to your Opportunities list. You can check its details and prepare from there. Saving a link does not submit an application.",linkText:"Walk through your first application",href:"/docs/first-application/"},
      applying:{step:"PREPARE / 02",visualHead:"APPLICATION RECORD",visualPill:"READY TO REVIEW",job:"Taylor_Resume.pdf",company:"Selected résumé · Saved for job",check:"✓",label:"NEXT ACTION",field:"Inspect the employer form",progress:"2",ordinal:"02 / PREPARE YOUR INFORMATION",title:"The right work. In the right place.",copy:"Confirm the intended résumé and answers, then inspect the real employer form. Check what transferred before deciding to submit.",linkText:"See how filling and review work",href:"/docs/first-application/#form"},
      stuck:{step:"RECOVER / 03",visualHead:"EMPLOYER FORM",visualPill:"NEEDS ATTENTION",job:"Résumé attachment",company:"Not confirmed on employer form",check:"!",label:"FIRST CHECK",field:"Verify the selected résumé",progress:"3",ordinal:"03 / RECOVER SAFELY",title:"Don't start over blindly.",copy:"Find the exact problem, check your saved work, and finish unsupported fields or uploads directly on the employer site.",linkText:"Find the right recovery step",href:"/docs/troubleshooting/"}
    };
    function setField(selector,value){
      const el=journey.querySelector(selector);
      if(el)el.textContent=value;
    }
    function render(state,emit){
      const s=scenarios[state];if(!s)return;
      choices.forEach(c=>c.setAttribute("aria-pressed",String(c.dataset.docState===state)));
      for(const [sel,key] of [["[data-doc-stage-step]","step"],["[data-doc-stage-visual-head]","visualHead"],["[data-doc-stage-visual-pill]","visualPill"],["[data-doc-stage-job]","job"],["[data-doc-stage-company]","company"],["[data-doc-stage-check]","check"],["[data-doc-stage-label]","label"],["[data-doc-stage-field]","field"],["[data-doc-stage-ordinal]","ordinal"],["[data-doc-stage-title]","title"],["[data-doc-stage-copy]","copy"]])setField(sel,s[key]);
      const progress=journey.querySelector(".doc-mini-progress");
      if(progress)progress.dataset.progress=s.progress;
      const link=journey.querySelector("[data-doc-stage-link]");
      if(link){link.href=s.href;link.replaceChildren(document.createTextNode(s.linkText+" "),Object.assign(document.createElement("span"),{textContent:"↗"}));link.lastChild.setAttribute("aria-hidden","true");}
      if(emit)analytics("ym_docs_journey_selected",{step:state});
    }
    choices.forEach((choice,i)=>{
      choice.addEventListener("click",()=>render(choice.dataset.docState,true));
      choice.addEventListener("keydown",e=>{
        if(!["ArrowDown","ArrowUp","Home","End"].includes(e.key))return;
        e.preventDefault();
        const next=e.key==="Home"?0:e.key==="End"?choices.length-1:(i+(e.key==="ArrowDown"?1:-1)+choices.length)%choices.length;
        choices[next].focus();render(choices[next].dataset.docState,true);
      });
    });
    render("new",false);
  }
  const search=document.querySelector("[data-doc-search]");
  if(search){
    const input=search.querySelector("input[type=search]");
    const cards=[...document.querySelectorAll("[data-doc-guide]")];
    const none=document.querySelector("[data-doc-no-results]");
    const status=document.querySelector("[data-doc-result-status]");
    const tokens=(str)=>str.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().trim().split(/\\s+/).filter(Boolean);
    function filter(){
      const words=tokens(input.value);
      let count=0;
      cards.forEach(card=>{
        const hay=tokens(card.textContent+" "+(card.dataset.docTags||"")).join(" ");
        const show=words.every(w=>hay.includes(w));
        card.hidden=!show;if(show)count++;
      });
      if(none)none.hidden=count!==0;
      if(status)status.textContent=count+" "+(count===1?"guide":"guides");
      return count;
    }
    input.addEventListener("input",filter);
    input.addEventListener("change",()=>{
      const count=filter();
      const bucket=count===0?"zero":count===1?"one":count<=3?"two_three":"four_plus";
      analytics("ym_docs_search_used",{result_bucket:bucket,category:"all"});
    });
    search.addEventListener("submit",e=>{
      e.preventDefault();filter();
      const first=cards.find(card=>!card.hidden);
      if(first)first.focus();else if(none)none.scrollIntoView({block:"nearest"});
    });
  }
  document.addEventListener("click",event=>{
    const anchor=event.target.closest("a[href]");
    if(!anchor)return;
    const guide=anchor.closest("[data-doc-guide]");
    if(guide)analytics("ym_docs_task_next_clicked",{destination_kind:"guide",article_id:guide.getAttribute("href").split("/").filter(Boolean).pop()||"unknown"});
    if(anchor.href.startsWith("mailto:support@yourmove.run"))analytics("ym_docs_support_clicked",{issue_category:"general",article_id:page||"unknown"});
  });
})();
