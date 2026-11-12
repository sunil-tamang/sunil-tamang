(() => {
 'use strict';
 const gsap=window.gsap;
 if(!gsap)return; // Ordinary navigation and all existing controllers remain usable.
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const nativeTransitions='onpagereveal' in window&&'onpageswap' in window;
 const root=document.documentElement,main=document.getElementById('main-content');
 root.classList.add('motion-ready');
 let slideTextTween,menuTimeline,leaving=false,navigationTimer,pendingNavigation;
 const key='portfolio-motion-project';
 let incoming;
 try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved&&saved.to===location.pathname&&Date.now()-saved.time<15000)incoming=saved}catch{}
 const sharedEntry=Boolean(incoming?.native&&nativeTransitions&&!reduced.matches);
 const release=nodes=>gsap.set(nodes,{clearProps:'transform,opacity,visibility,clipPath,filter,willChange'});
 function prepareSelection(link){
  document.querySelectorAll('[data-motion-selected],[data-motion-image]').forEach(el=>{el.removeAttribute('data-motion-selected');el.removeAttribute('data-motion-image')});
  link.setAttribute('data-motion-selected','');
  const directory=link.closest('[data-project-directory]'),slide=link.closest('[data-casey-slide]');
  const image=directory?[...directory.querySelectorAll('[data-project-image]')].find(img=>img.dataset.projectImage===link.dataset.projectName):slide?.querySelector('.casey-slide-video');
  if(image&&(image.naturalWidth||image.videoWidth))image.setAttribute('data-motion-image','');
 }
 function menu(open,done=()=>{}){
  const panel=document.getElementById('casey-menu');
  const links=[...panel.querySelectorAll('nav>a')],bottom=panel.querySelector('.casey-menu-bottom');
  const interrupted=Boolean(menuTimeline?.isActive());
  menuTimeline?.kill();gsap.killTweensOf([main,panel,...links,bottom]);
  if(reduced.matches){release([main,panel,...links,bottom]);done();return}
  gsap.set([panel,...links,bottom],{willChange:'transform,opacity,clip-path'});
  menuTimeline=gsap.timeline({onComplete:()=>{release([panel,...links,bottom]);if(!open)release(main);done()}});
  if(open){
   if(!interrupted){gsap.set(panel,{clipPath:'inset(0 0 100% 0)'});gsap.set(links,{y:22,opacity:0,clipPath:'inset(100% 0 0 0)'});gsap.set(bottom,{y:12,opacity:0})}
   menuTimeline.to(panel,{clipPath:'inset(0)',duration:.6,ease:'power4.inOut'},0)
    .to(links,{y:0,opacity:1,clipPath:'inset(0)',duration:.55,stagger:.055,ease:'power3.out'},.16)
    .to(bottom,{y:0,opacity:1,duration:.45,ease:'power2.out'},.38)
    .to(main,{filter:'blur(4px)',duration:.45,ease:'power2.out'},0);
  }else{
   if(!panel.style.clipPath)gsap.set(panel,{clipPath:'inset(0)'});
   menuTimeline.to([...links].reverse(),{y:-12,opacity:0,duration:.22,stagger:.02,ease:'power2.in'},0)
    .to(bottom,{opacity:0,duration:.18},0)
    .to(panel,{clipPath:'inset(0 0 100% 0)',duration:.45,ease:'power3.inOut'},.08)
    .to(main,{filter:'blur(0px)',duration:.35},.05);
  }
 }
 window.PortfolioMotion={menu};
 function reveal(nodes,{delay=0,stagger=.055}={}){
  const targets=[...nodes].filter(Boolean);
  if(!targets.length||reduced.matches)return;
  return gsap.fromTo(targets,{y:18,opacity:0,clipPath:'inset(100% 0 0 0)'},{y:0,opacity:1,clipPath:'inset(0)',duration:.75,delay,stagger,ease:'power3.out',clearProps:'transform,opacity,clipPath'});
 }
 function slideReveal(event){
  const slide=event.detail.slide;
  if(!slide||reduced.matches)return;
  const title=slide.querySelector('.casey-slide-title'),meta=slide.querySelectorAll('.casey-slide-top,.casey-slide-bottom');
  slideTextTween?.kill();gsap.killTweensOf([title,...meta]);slideTextTween=reveal([title,...meta],{delay:0,stagger:0});
  const image=slide.querySelector('.casey-slide-image'),video=slide.querySelector('.casey-slide-video');
  gsap.killTweensOf([image,video].filter(Boolean));
  gsap.fromTo([image,video].filter(Boolean),{scale:1.035},{scale:1,duration:1.15,ease:'power2.out',clearProps:'transform'});
 }
 document.addEventListener('portfolio:slidechange',slideReveal);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)slideTextTween?.progress(1)});
 addEventListener('pagehide',()=>slideTextTween?.progress(1));
 document.addEventListener('portfolio:photochange',event=>{
  if(reduced.matches||sharedEntry&&performance.now()<1000)return;
  const image=event.detail.photo.querySelector('img');gsap.killTweensOf(image);
  gsap.fromTo(image,{scale:1.035},{scale:1,duration:.9,ease:'power3.out',clearProps:'transform'});
 });
 function bootReveals(){
  if(reduced.matches)return;
  if(!sharedEntry)reveal(document.querySelectorAll('.project-directory-heading,.film-header h1,.film-meta,.still-photo-caption>*,.about-editorial-label,.about-editorial h1,.contact-hero>h1,.contact-label,.team-header,.content__title'),{delay:.06});
  if(!sharedEntry&&!reduced.matches){
   const titles=[...document.querySelectorAll('.project-directory-link')];
   if(titles.length)gsap.fromTo(titles,{y:18,clipPath:'inset(100% 0 0 0)'},{y:0,clipPath:'inset(0)',duration:.7,stagger:.04,ease:'power3.out',clearProps:'transform,clipPath'});
   const image=document.querySelector('.film-video-banner>img');
   if(image)gsap.fromTo(image,{scale:1.035},{scale:1,duration:1,ease:'power3.out',clearProps:'transform'});
  }
  if(window.ScrollTrigger){
   gsap.registerPlugin(ScrollTrigger);
   const match=gsap.matchMedia();
   match.add('(prefers-reduced-motion: no-preference)',()=>{
    const sections=document.querySelectorAll('.film-details,.about-editorial-bio>p,.contact-email,.contact-social,.summit-story-text,.summit-experience-header,.summit-timeline-item,.summit-value-item,.guide-service-stat,.guide-service-check,.guide-service-gallery-item,.summit-faq-item,.photo-item');
    sections.forEach(node=>gsap.fromTo(node,{y:18,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:node,start:'top 94%',once:true}}));
    if(matchMedia('(min-width: 801px)').matches&&!navigator.connection?.saveData){
     const image=document.querySelector('.summit-hero-image');
     if(image)gsap.fromTo(image,{yPercent:-2,scale:1.06},{yPercent:2,scale:1.06,ease:'none',scrollTrigger:{trigger:'.summit-hero',start:'top top',end:'bottom top',scrub:.8},});
    }
    const background=document.querySelector('.about-editorial-backdrop img');
    if(background&&matchMedia('(min-width: 801px)').matches&&!navigator.connection?.saveData){
     gsap.fromTo(background,{yPercent:-1,scale:1.04},{yPercent:1,scale:1.04,ease:'none',scrollTrigger:{trigger:'.about-editorial',start:'top top',end:'bottom top',scrub:.8}});
    }
    document.fonts.ready.then(()=>ScrollTrigger.refresh());
   });
  }
 }
 requestAnimationFrame(bootReveals);
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href]');
  if(!link||link.target&&link.target!=='_self'||link.hasAttribute('download'))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||url.pathname===location.pathname||!['http:','https:'].includes(url.protocol))return;
  const project=link.matches('[data-project-name],.casey-slide-title,.casey-project-link');
  if(project){
   prepareSelection(link);
   try{sessionStorage.setItem(key,JSON.stringify({from:location.pathname,to:url.pathname,time:Date.now(),native:nativeTransitions}))}catch{}
  }
  if(reduced.matches||nativeTransitions)return; // Normal document navigation drives native shared-element transitions.
  if(leaving){event.preventDefault();return}
  event.preventDefault();leaving=true;
  let committed=false;
  const go=()=>{if(committed)return;committed=true;clearTimeout(navigationTimer);location.assign(url.href)};
  pendingNavigation=go;
  navigationTimer=setTimeout(go,650); // Navigation must never depend on animation completion.
  gsap.to(main,{opacity:0,duration:.36,ease:'power2.in',onComplete:go});
 });
 addEventListener('pagereveal',event=>{
  if(!event.viewTransition||reduced.matches)return;
  let saved;try{saved=JSON.parse(sessionStorage.getItem(key)||'null')}catch{}
  if(saved?.from===location.pathname){
   const link=[...document.querySelectorAll('[data-project-name],.casey-slide-title')].find(a=>new URL(a.href).pathname===saved.to);
   if(link)prepareSelection(link);
  }
 });
 addEventListener('pageshow',event=>{
  if(!event.persisted)return;
  leaving=false;pendingNavigation=null;clearTimeout(navigationTimer);menuTimeline?.kill();release(main);main.inert=false;
  const panel=document.getElementById('casey-menu');
  if(panel){panel.hidden=true;panel.inert=true;release([panel,...panel.querySelectorAll('nav>a,.casey-menu-bottom')]);document.body.classList.remove('casey-menu-open');const toggle=document.querySelector('.casey-menu-button');toggle.setAttribute('aria-expanded','false');toggle.innerHTML='MENU <span aria-hidden="true">( + )</span>';document.dispatchEvent(new CustomEvent('portfolio:menu-state',{detail:{open:false}}))}
  window.ScrollTrigger?.refresh();
 });
 reduced.addEventListener('change',()=>{
  if(!reduced.matches)return;
  menuTimeline?.progress(1);
  gsap.globalTimeline.getChildren(true,true,true).forEach(tween=>tween.progress(1));
  document.querySelectorAll('#main-content [style],.casey-menu [style]').forEach(node=>{if(node.style.transform||node.style.opacity||node.style.clipPath||node.style.filter)release(node)});
  if(pendingNavigation)pendingNavigation();
 });
})();
