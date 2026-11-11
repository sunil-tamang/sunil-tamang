(() => {
 'use strict';
 const slider=document.querySelector('[data-summit-slider]');
 if(!slider)return;
 const slides=[...slider.querySelectorAll('[data-summit-slide]')],backgrounds=[...document.querySelectorAll('.about-summit-backdrops img')];
 const counter=slider.querySelector('[data-summit-current]'),stage=slider.querySelector('[data-summit-stage]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),gsap=window.gsap;
 let current=0,request=0,timeline,touch=null;
 async function background(index,direction){
  const token=++request,image=document.querySelector(`[data-summit-background="${index}"]`);
  if(!image)return;
  if(image.dataset.srcset){image.srcset=image.dataset.srcset;delete image.dataset.srcset}
   if(image.dataset.src){image.src=image.dataset.src;delete image.dataset.src}
  try{await image.decode()}catch{return}
  if(token!==request)return;
  backgrounds.forEach(item=>item.classList.toggle('is-active',item===image));
  if(gsap&&!reduced.matches){gsap.killTweensOf(image);gsap.fromTo(image,{scale:1.045,xPercent:direction*1.2},{scale:1.015,xPercent:0,duration:1.3,ease:'power2.out',clearProps:'transform'})}
 }
 function show(index,direction=1){
  const next=(index+slides.length)%slides.length;
  if(next===current)return;
  timeline?.kill();
  const previous=slides[current],incoming=slides[next];
  if(gsap)gsap.set(slides.flatMap(slide=>[slide,...slide.querySelectorAll('.about-summit-reveal>*')]),{clearProps:'transform,opacity,visibility'});
  slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===next);slide.inert=i!==next;slide.setAttribute('aria-hidden',String(i!==next))});
  current=next;counter.value=`${String(next+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  if(gsap&&!reduced.matches){
   gsap.set(previous,{visibility:'visible'});
   timeline=gsap.timeline({onComplete:()=>gsap.set(previous,{clearProps:'transform,opacity,visibility'})});
   timeline.to(previous,{xPercent:-direction*8,opacity:0,duration:.32,ease:'power2.in'},0)
    .fromTo(incoming.querySelectorAll('.about-summit-reveal>*'),{xPercent:direction*10,opacity:0},{xPercent:0,opacity:1,duration:.7,stagger:.08,ease:'power3.out',clearProps:'transform,opacity'},.12);
  }
  background(next,direction);
 }
 slider.querySelector('[data-summit-prev]').addEventListener('click',()=>show(current-1,-1));
 slider.querySelector('[data-summit-next]').addEventListener('click',()=>show(current+1,1));
 slider.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  const direction=['ArrowRight','ArrowDown','PageDown'].includes(event.key)?1:['ArrowLeft','ArrowUp','PageUp'].includes(event.key)?-1:0;
  if(direction){event.preventDefault();show(current+direction,direction)}
  if(event.key==='Home'||event.key==='End'){event.preventDefault();show(event.key==='Home'?0:slides.length-1,event.key==='Home'?-1:1)}
 });
 stage.addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null},{passive:true});
 stage.addEventListener('touchmove',event=>{if(event.touches.length!==1)touch=null},{passive:true});
 stage.addEventListener('touchend',event=>{if(!touch)return;const dx=touch.x-event.changedTouches[0].clientX,dy=touch.y-event.changedTouches[0].clientY;touch=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))show(current+Math.sign(dx),Math.sign(dx))},{passive:true});
 stage.addEventListener('touchcancel',()=>{touch=null},{passive:true});
 reduced.addEventListener('change',()=>{if(!reduced.matches)return;timeline?.kill();if(gsap)gsap.set([...slides,...slides.flatMap(s=>[...s.querySelectorAll('.about-summit-reveal>*')]),...backgrounds],{clearProps:'transform,opacity,visibility'})});
 background(0,1);
})();
