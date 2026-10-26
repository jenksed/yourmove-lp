/* YourMove docs: progressive enhancement only. No personal/job/search text is sent to analytics. */
(()=>{
  "use strict";
  const analytics=(event,props)=>{
    if(window.YourMoveAnalytics&&typeof window.YourMoveAnalytics.track==="function"){
      window.YourMoveAnalytics.track(event,props);
    }
  };
  const pages={"/docs/":"home","/docs/first-application/":"first_application","/docs/troubleshooting/":"troubleshooting","/docs/availability/":"availability"};
  const path="/"+location.pathname.split("/").filter(Boolean).join("/")+"/";
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
    const panel=document.querySelector("[data-doc-search-panel]");
    const list=panel.querySelector("[data-doc-search-results]");
    const status=panel.querySelector("[data-doc-search-status]");
    // Indexed answer destinations, not a search service. Query text stays in the browser.
    const answers=[
      {title:"My résumé didn't attach",kind:"Troubleshooting",href:"/docs/troubleshooting/#resume",tags:"resume cv attach attachment document upload pdf file missing failed"},
      {title:"A field is blank",kind:"Troubleshooting",href:"/docs/troubleshooting/#field",tags:"blank empty missing answer transfer form autofill fill fields"},
      {title:"My employer browser session closed",kind:"Troubleshooting",href:"/docs/troubleshooting/#session",tags:"session browser closed lost restart recover continue progress"},
      {title:"The job details are wrong or missing",kind:"Troubleshooting",href:"/docs/troubleshooting/#posting",tags:"job posting company title URL metadata import information wrong"},
      {title:"My contact details won't fill",kind:"Troubleshooting",href:"/docs/troubleshooting/#profile",tags:"profile approve candidate name email phone contact facts"},
      {title:"YourMove can't fill this employer form",kind:"Troubleshooting",href:"/docs/troubleshooting/#unsupported",tags:"unsupported ATS website application platform not working automate"},
      {title:"Did my application actually submit?",kind:"Troubleshooting",href:"/docs/troubleshooting/#confirmation",tags:"submitted confirmation accepted receipt email sent finished duplicate applied"},
      {title:"Walk through your first application",kind:"First application",href:"/docs/first-application/",tags:"start beginner getting started first steps tutorial learn"},
      {title:"Save or import job links",kind:"First application",href:"/docs/first-application/#job-links",tags:"import urls batch multiple 50 opportunity add job posting"},
      {title:"Choose the right résumé",kind:"First application",href:"/docs/first-application/#resume",tags:"document pdf docx choose select save resume upload"},
      {title:"Prepare your candidate profile and answers",kind:"First application",href:"/docs/first-application/#profile",tags:"profile answers experience approval facts cover letter"},
      {title:"Inspect and fill an employer application",kind:"First application",href:"/docs/first-application/#form",tags:"browser inspect fill prepare transfer review employer"},
      {title:"Submit the application yourself",kind:"First application",href:"/docs/first-application/#finish",tags:"submit finish employer final say confirmation review autosubmit automatically"},
      {title:"Record a completed application",kind:"First application",href:"/docs/first-application/#record",tags:"history completed outcome local record submitted status"},
      {title:"Find official releases and system requirements",kind:"Availability",href:"/docs/availability/",tags:"today ready now use supported download install mac macos windows linux arm64 releases compatibility availability"}
    ];
    const stop=new Set(["yourmove","app","a","an","and","are","at","can","cant","didnt","do","does","doesnt","for","how","i","im","in","is","isnt","it","me","my","not","of","on","or","the","to","was","what","where","why","will","wont","you"]);
    const normalize=value=>value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/\b(didn't|doesn't|can't|won't|isn't|don't)\b/g," ");
    const words=value=>normalize(value).replace(/[^a-z0-9]+/g," ").trim().split(/\s+/).filter(term=>term.length>1&&!stop.has(term));
    const searchable=answers.map(answer=>({...answer,titleWords:words(answer.title),hay:words(answer.title+" "+answer.kind+" "+answer.tags).join(" ")}));
    let current=[];
    function render(){
      const query=input.value.trim();
      const terms=words(query);
      current=query&&terms.length?searchable.map(answer=>{
        if(!terms.every(term=>answer.hay.includes(term)))return {answer,score:0};
        const score=terms.filter(term=>answer.titleWords.some(w=>w.includes(term))).length*3+1;
        return {answer,score};
      }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,6):[];
      panel.hidden=!query;
      input.setAttribute("aria-expanded",String(Boolean(query)));
      list.replaceChildren();
      if(!query){status.textContent="";return;}
      status.textContent=current.length?current.length+" suggested "+(current.length===1?"answer":"answers")+" · Choose one to go straight to the relevant step.":"No direct match. Try a shorter phrase or use troubleshooting below.";
      current.forEach(({answer})=>{
        const li=document.createElement("li"),a=document.createElement("a");
        a.href=answer.href;
        a.dataset.docSearchResult=answer.kind.toLowerCase().replaceAll(" ","_");
        const kind=document.createElement("span"),title=document.createElement("strong");
        kind.textContent=answer.kind;title.textContent=answer.title;
        a.append(kind,title);li.append(a);list.append(li);
      });
      if(!current.length){
        const li=document.createElement("li"),a=document.createElement("a");
        a.href="/docs/troubleshooting/#report";a.textContent="How to report a problem";
        li.append(a);list.append(li);
      }
    }
    input.addEventListener("input",render);
    input.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&!panel.hidden){input.value="";render();}
      else if(event.key==="ArrowDown"&&!panel.hidden){event.preventDefault();list.querySelector("a")?.focus();}
    });
    search.addEventListener("submit",event=>{
      event.preventDefault();render();
      const bucket=current.length===0?"zero":current.length===1?"one":current.length<=3?"two_three":"four_plus";
      analytics("ym_docs_search_used",{result_bucket:bucket,category:"all"});
      if(current.length)location.assign(current[0].answer.href);
      else if(!input.value.trim())document.querySelector("#doc-results")?.scrollIntoView({block:"start"});
      else list.querySelector("a")?.focus();
    });
  }
  // A deep link to a troubleshooting symptom should reveal the answer itself.
  function revealSymptom(){
    const id=decodeURIComponent(location.hash.slice(1));
    const target=id?document.getElementById(id):null;
    if(target&&target.matches(".doc-symptoms details")){
      target.open=true;
      target.scrollIntoView({block:"start"});
    }
  }
  window.addEventListener("hashchange",revealSymptom);
  if(location.hash)revealSymptom();
  document.addEventListener("click",event=>{
    const anchor=event.target.closest("a[href]");
    if(!anchor)return;
    const guide=anchor.closest("[data-doc-guide]");
    if(guide)analytics("ym_docs_task_next_clicked",{destination_kind:"guide",article_id:guide.getAttribute("href").split("/").filter(Boolean).pop()||"unknown"});
    if(anchor.matches("[data-doc-search-result]"))analytics("ym_docs_task_next_clicked",{destination_kind:"search_result",article_id:anchor.dataset.docSearchResult});
    if(anchor.href.startsWith("mailto:support@yourmove.run"))analytics("ym_docs_support_clicked",{issue_category:"general",article_id:page||"unknown"});
  });
})();
