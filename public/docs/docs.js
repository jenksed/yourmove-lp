/* YourMove docs: progressive enhancement only. No personal/job/search text is sent to analytics. */
(()=>{
  "use strict";
  const analytics=(event,props)=>{
    if(window.YourMoveAnalytics&&typeof window.YourMoveAnalytics.track==="function"){
      window.YourMoveAnalytics.track(event,props);
    }
  };
  const reducedMotion=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pages={"/docs/":"home","/docs/first-application/":"first_application","/docs/troubleshooting/":"troubleshooting","/docs/availability/":"availability","/docs/releases/":"releases"};
  const path="/"+location.pathname.split("/").filter(Boolean).join("/")+"/";
  const page=pages[path];
  if(page)analytics("ym_docs_article_viewed",{article_id:page,topic:page==="troubleshooting"?"recovery":page==="availability"?"distribution":"onboarding",version_scope:"v0.3.0"});
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
        if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
        e.preventDefault();
        let next;
        if(e.key==="Home")next=0;
        else if(e.key==="End")next=choices.length-1;
        else next=(i+(e.key==="ArrowDown"||e.key==="ArrowRight"?1:-1)+choices.length)%choices.length;
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
    const guideList=document.querySelector("[data-doc-guide-list]");
    const guides=guideList?[...guideList.querySelectorAll("[data-doc-guide]")]:[];
    const guideStatus=document.querySelector("[data-doc-result-status]");
    const guideEmpty=document.querySelector("[data-doc-no-results]");
    const guideBaseCount=guides.length;
    // Indexed answer destinations, not a search service. Query text stays in the browser.
    const answers=[
      {title:"My résumé didn't attach",kind:"Troubleshooting",href:"/docs/troubleshooting/#resume",tags:"resume cv attach attachment document upload pdf file missing failed manual employer control"},
      {title:"A field is blank",kind:"Troubleshooting",href:"/docs/troubleshooting/#field",tags:"blank empty missing answer transfer form autofill fill fields manual employer control"},
      {title:"My employer browser session closed",kind:"Troubleshooting",href:"/docs/troubleshooting/#session",tags:"session browser closed lost restart recover continue progress reopen safe new employer chromium chrome"},
      {title:"The job details are wrong or missing",kind:"Troubleshooting",href:"/docs/troubleshooting/#posting",tags:"job posting company title URL metadata import information wrong check details open"},
      {title:"My contact details won't fill",kind:"Troubleshooting",href:"/docs/troubleshooting/#profile",tags:"profile approve candidate name email phone contact facts approval draft"},
      {title:"YourMove can't fill this employer form",kind:"Troubleshooting",href:"/docs/troubleshooting/#unsupported",tags:"unsupported ATS website application platform not working automate manual workday lever ashby greenhouse capture fill supported"},
      {title:"Did my application actually submit?",kind:"Troubleshooting",href:"/docs/troubleshooting/#confirmation",tags:"submit submitted submission confirmation accepted receipt email sent finished duplicate applied yourself manual employer decide"},
      {title:"Walk through your first application",kind:"First application",href:"/docs/first-application/",tags:"start beginner getting started first steps tutorial learn v030 save opportunity review submit yourself"},
      {title:"Save or import job links",kind:"First application",href:"/docs/first-application/#job-links",tags:"import urls batch multiple 50 opportunity add job posting save details check"},
      {title:"Choose the right résumé",kind:"First application",href:"/docs/first-application/#resume",tags:"document pdf docx choose select save resume upload attach 10mb wrong file"},
      {title:"Prepare your candidate profile and answers",kind:"First application",href:"/docs/first-application/#profile",tags:"profile answers experience approval facts cover letter approve draft contact"},
      {title:"Inspect and fill an employer application",kind:"First application",href:"/docs/first-application/#form",tags:"browser inspect fill prepare transfer review employer chrome chromium supported manual authorize field"},
      {title:"Submit the application yourself",kind:"First application",href:"/docs/first-application/#finish",tags:"job submit finish employer final say confirmation review autosubmit automatically yourself manual decide never auto"},
      {title:"Record a completed application",kind:"First application",href:"/docs/first-application/#record",tags:"history completed outcome local record submitted status confirm employer receipt"},
      {title:"YourMove v0.3.0 release notes",kind:"Release notes",href:"/docs/releases/",tags:"release notes change changelog version v030 v0.3.0 latest new changes improvements november upgrade manual update migration alpha mac technical install"},
      {title:"What changed in v0.3.0",kind:"Release notes",href:"/docs/releases/#improvements",tags:"change improvements opportunities questions fill cover letter v030 new focus history upgrade mac"},
      {title:"Install YourMove on Mac",kind:"Availability",href:"/docs/availability/",tags:"install download mac macos apple silicon arm64 requirement system gatekeeper checksum zip notarized unnotarized v030 official release availability get started alpha 26"},
      {title:"Upgrade manually to v0.3.0",kind:"Availability",href:"/docs/availability/#upgrade",tags:"upgrade update manual manually in-app up to date v020 v030 replace backup workspace jobs resumes migrate install"}
    ];
    const stop=new Set(["yourmove","app","need","needs","needed","want","wants","please","help","helps","with","using","use","uses","used","trying","try","tries","tried","a","an","and","are","at","can","cant","didnt","do","does","doesnt","dont","for","how","i","im","in","is","isnt","it","its","me","my","not","of","on","or","the","to","was","were","what","where","which","who","whom","whose","why","when","will","wont","would","could","should","must","shall","you","your","yours","we","our","this","that","these","those","there","here","get","got","just","like","know","really","still","also","even"]);
    const synonyms=new Map([
      ["installation","install"],["installing","install"],["installed","install"],["installer","install"],
      ["requirements","requirement"],["prerequisite","requirement"],["prerequisites","requirement"],["systems","requirement"],["system","requirement"],["compatible","requirement"],["compatibility","requirement"],["spec","requirement"],["specs","requirement"],
      ["downloads","download"],["downloaded","download"],["downloading","download"],
      ["updates","upgrade"],["update","upgrade"],["updating","upgrade"],["upgraded","upgrade"],["upgrades","upgrade"],["migration","upgrade"],["migrate","upgrade"],
      ["manually","manual"],
      ["submitted","submit"],["submits","submit"],["submitting","submit"],["submission","submit"],["submissions","submit"],
      ["attached","attach"],["attaches","attach"],["attaching","attach"],["attachment","attach"],["attachments","attach"],["uploads","attach"],["uploaded","attach"],["uploading","attach"],["upload","attach"],
      ["resumes","resume"],["cvs","resume"],["cv","resume"],
      ["fields","field"],
      ["fills","fill"],["filled","fill"],["filling","fill"],["autofill","fill"],
      ["empty","blank"],["missing","blank"],
      ["changes","change"],["changed","change"],["changelog","change"],
      ["macos","mac"],["macbook","mac"],["silicon","mac"],["arm64","mac"],["apple","mac"],
      ["gatekeepers","gatekeeper"],["notarization","notarized"],["notarised","notarized"],
      ["checksums","checksum"],["shasum","checksum"],["sha256","checksum"],["verify","checksum"],["verification","checksum"],
      ["browsers","browser"],["chromes","browser"],["chrome","browser"],["chromium","browser"],
      ["sessions","session"],["crashes","session"],["crashed","session"],["restarts","session"],["restart","session"],
      ["notes","release"],["releases","release"],["versions","release"],["version","release"]
    ]);
    const canonical=term=>synonyms.get(term)||term;
    const normalize=value=>value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[’‘‛]/g,"'").replace(/\bv0[.\-]?3[.\-]?0\b/g," v030 ").replace(/\bv0[.\-]?2[.\-]?0\b/g," v020 ").replace(/\bv03\b/g," v030 ").replace(/\bv02\b/g," v020 ").replace(/\b(didn't|doesn't|can't|won't|isn't|don't|wasn't|weren't|haven't|hasn't)\b/g," ");
    const words=value=>normalize(value).replace(/[^a-z0-9]+/g," ").trim().split(/\s+/).filter(term=>term.length>1&&!stop.has(term)).map(canonical);
    const searchable=answers.map(answer=>({...answer,titleWords:words(answer.title),hay:new Set(words(answer.title+" "+answer.kind+" "+answer.tags))}));
    const guideSearchable=guides.map(el=>{
      const title=el.querySelector("h3")?.textContent||"";
      const desc=el.querySelector("p")?.textContent||"";
      const tags=el.getAttribute("data-doc-tags")||"";
      return {el,hay:new Set(words(title+" "+desc+" "+tags))};
    });
    let current=[];
    function scoreAnswer(answer,terms){
      let matched=0;
      for(const term of terms){if([...answer.hay].some(h=>h===term||h.includes(term)||term.includes(h)))matched++;}
      const titleHits=terms.filter(term=>answer.titleWords.some(w=>w===term||w.includes(term)||term.includes(w))).length;
      return {matched,titleHits};
    }
    function render(){
      const query=input.value.trim();
      const terms=words(query);
      if(query&&terms.length){
        const strict=searchable.map(answer=>{
          const {matched,titleHits}=scoreAnswer(answer,terms);
          if(matched<terms.length)return {answer,score:0,matched};
          return {answer,score:titleHits*3+matched+1,matched};
        }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||b.matched-a.matched);
        current=strict.length?strict.slice(0,6):searchable.map(answer=>{
          const {matched,titleHits}=scoreAnswer(answer,terms);
          if(!matched)return {answer,score:0,matched};
          return {answer,score:matched*2+titleHits*3,matched};
        }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||b.matched-a.matched).slice(0,6);
      } else current=[];
      panel.hidden=!query;
      input.setAttribute("aria-expanded",String(Boolean(query)));
      list.replaceChildren();
      if(!query){
        status.textContent="";
        if(guideList){
          guides.forEach(g=>{g.hidden=false;});
          if(guideStatus)guideStatus.textContent=guideBaseCount+" guides";
          if(guideEmpty)guideEmpty.hidden=true;
        }
        return;
      }
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
      if(guideList){
        let visible=0;
        guideSearchable.forEach(({el,hay})=>{
          const matched=terms.filter(term=>[...hay].some(h=>h===term||h.includes(term)||term.includes(h))).length;
          const show=!terms.length||matched>0||(terms.length>1&&matched>=Math.max(1,Math.floor(terms.length/2)));
          el.hidden=!show;
          if(show)visible++;
        });
        if(guideStatus)guideStatus.textContent=visible+" of "+guideBaseCount+" guides";
        if(guideEmpty)guideEmpty.hidden=visible>0;
      }
    }
    function focusResult(delta){
      const links=[...list.querySelectorAll("a")];
      if(!links.length)return;
      const active=document.activeElement;
      const idx=links.indexOf(active);
      const next=idx<0?(delta>0?0:links.length-1):(idx+delta+links.length)%links.length;
      links[next].focus();
    }
    input.addEventListener("input",render);
    input.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&!panel.hidden){event.preventDefault();input.value="";render();input.focus();}
      else if((event.key==="ArrowDown"||event.key==="ArrowUp")&&!panel.hidden){event.preventDefault();focusResult(event.key==="ArrowDown"?1:-1);}
    });
    list.addEventListener("keydown",event=>{
      if(event.key==="Escape"){event.preventDefault();input.focus();input.value="";render();}
      else if(event.key==="ArrowDown"){event.preventDefault();focusResult(1);}
      else if(event.key==="ArrowUp"){event.preventDefault();const links=[...list.querySelectorAll("a")];if(document.activeElement===links[0])input.focus();else focusResult(-1);}
    });
    document.addEventListener("pointerdown",event=>{
      if(panel.hidden)return;
      if(!event.target.closest("[data-doc-search]")&&!event.target.closest("[data-doc-search-panel]")){
        panel.hidden=true;
        input.setAttribute("aria-expanded","false");
      }
    });
    input.addEventListener("focus",()=>{
      if(input.value.trim()){
        panel.hidden=false;
        input.setAttribute("aria-expanded","true");
      }
    });
    search.addEventListener("submit",event=>{
      event.preventDefault();render();
      const bucket=current.length===0?"zero":current.length===1?"one":current.length<=3?"two_three":"four_plus";
      analytics("ym_docs_search_used",{result_bucket:bucket,category:"all"});
      if(current.length)location.assign(current[0].answer.href);
      else if(!input.value.trim())document.querySelector("#doc-results")?.scrollIntoView({block:"start",behavior:reducedMotion()?"auto":"smooth"});
      else list.querySelector("a")?.focus();
    });
  }
  // A deep link to a troubleshooting symptom should reveal the answer itself.
  function revealSymptom(){
    const id=decodeURIComponent(location.hash.slice(1));
    const target=id?document.getElementById(id):null;
    if(target&&target.matches(".doc-symptoms details")){
      target.open=true;
      const summary=target.querySelector("summary");
      if(summary){
        summary.setAttribute("tabindex","-1");
        summary.focus({preventScroll:true});
      }
      target.scrollIntoView({block:"start",behavior:reducedMotion()?"auto":"smooth"});
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
