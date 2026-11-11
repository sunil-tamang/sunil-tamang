(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const viewer=document.querySelector('[data-still-slideshow]');
 if(viewer){
  const photos=[...viewer.querySelectorAll('[data-still-photo]')];
  const stage=viewer.querySelector('[data-still-photo-stage]'),counter=viewer.querySelector('[data-still-current]');
  let current=0,token=0,lockedUntil=0,wheelTotal=0,wheelReady=true,wheelTimer,touch=null,fadeTimer;
  function load(index){
   const image=photos[index].querySelector('img');
   if(image.dataset.srcset){image.srcset=image.dataset.srcset;delete image.dataset.srcset}
   if(image.dataset.src){image.src=image.dataset.src;delete image.dataset.src}
   return image.decode();
  }
  async function show(index){
   const next=(index+photos.length)%photos.length,request=++token;
   try{await load(next)}catch{return}
   if(request!==token)return;
   const previous=current;
   clearTimeout(fadeTimer);
   photos.forEach((photo,i)=>{photo.classList.toggle('is-outgoing',i===previous&&i!==next);photo.classList.toggle('is-active',i===next);photo.inert=i!==next;photo.setAttribute('aria-hidden',String(i!==next))});
   fadeTimer=setTimeout(()=>photos.forEach(photo=>photo.classList.remove('is-outgoing')),reduced.matches?0:700);
   current=next;counter.value=String(current+1).padStart(3,'0');
   document.dispatchEvent(new CustomEvent('portfolio:photochange',{detail:{photo:photos[current],index:current}}));
   if(!navigator.connection?.saveData)load((next+1)%photos.length).catch(()=>{});
  }
  function menuOpen(){return document.body.classList.contains('casey-menu-open')}
  function advance(direction){if(menuOpen()||performance.now()<lockedUntil)return;lockedUntil=performance.now()+(reduced.matches?200:700);show(current+direction)}
  photos.forEach((photo,i)=>{photo.setAttribute('role','group');photo.setAttribute('aria-roledescription','slide');photo.setAttribute('aria-label',`${i+1} of ${photos.length}`)});
  viewer.querySelector('[data-still-prev]').addEventListener('click',()=>advance(-1));
  viewer.querySelector('[data-still-next]').addEventListener('click',()=>advance(1));
  addEventListener('wheel',e=>{
   if(menuOpen()||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
   e.preventDefault();clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{wheelReady=true;wheelTotal=0},180);
   if(!wheelReady||performance.now()<lockedUntil)return;
   wheelTotal+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
   if(Math.abs(wheelTotal)>45){advance(Math.sign(wheelTotal));wheelReady=false;wheelTotal=0}
  },{passive:false});
  stage.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
  stage.addEventListener('touchmove',e=>{if(e.touches.length>1)touch=null},{passive:true});
  stage.addEventListener('touchend',e=>{if(!touch)return;const dx=touch.x-e.changedTouches[0].clientX,dy=touch.y-e.changedTouches[0].clientY;touch=null;if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx))advance(Math.sign(dy))},{passive:true});
  stage.addEventListener('touchcancel',()=>{touch=null},{passive:true});
  document.addEventListener('keydown',e=>{
   if(menuOpen()||e.target.closest('input,textarea,select,button,a,[contenteditable]'))return;
   if(['ArrowDown','ArrowRight','PageDown',' ','ArrowUp','ArrowLeft','PageUp'].includes(e.key)){
    e.preventDefault();advance(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)||e.shiftKey&&e.key===' '?-1:1);
   }
   if(e.key==='Home'||e.key==='End'){e.preventDefault();show(e.key==='Home'?0:photos.length-1)}
  });
  show(0);
 }
})();
