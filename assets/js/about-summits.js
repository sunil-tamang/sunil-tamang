(() => {
 'use strict';
 const video=document.querySelector('[data-about-video]');if(!video)return;
 const section=video.closest('section'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=true;
 const allowed=()=>visible&&!document.hidden&&!document.body.classList.contains('contact-modal-open')&&!reduced.matches&&!navigator.connection?.saveData;
 function sync(){
  const source=video.querySelector('[data-src]');
  if(source&&visible&&!document.hidden&&!navigator.connection?.saveData&&!document.body.classList.contains('contact-modal-open')){source.src=source.dataset.src;source.removeAttribute('data-src');video.preload='auto';video.load()}
  video.autoplay=allowed();
  if(!allowed()){video.pause();return}
  video.muted=true;video.playsInline=true;video.play().catch(()=>{});
 }
 video.addEventListener('playing',()=>{if(!allowed())video.pause()});
 document.addEventListener('visibilitychange',sync);document.addEventListener('portfolio:menu-state',sync);reduced.addEventListener('change',sync);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.15;sync()},{threshold:.15}).observe(video.closest('.about-video-backdrop'));
 const groups=[...section.querySelectorAll('[data-about-reveal]')];
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(window.gsap&&!reduced.matches)gsap.fromTo(entry.target,{y:12,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out',clearProps:'transform,opacity'})});
 },{threshold:.1});
 groups.forEach(group=>observer.observe(group));
 reduced.addEventListener('change',()=>{if(reduced.matches&&window.gsap){gsap.killTweensOf(groups);gsap.set(groups,{clearProps:'transform,opacity'})}});
 sync();
})();
