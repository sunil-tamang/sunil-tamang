(() => {
 const button=document.querySelector('.casey-menu-button'),menu=document.getElementById('casey-menu');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function close(){if(!menu||menu.hidden)return;menu.hidden=true;menu.inert=true;button.setAttribute('aria-expanded','false');button.innerHTML='MENU <span aria-hidden="true">( + )</span>';document.body.classList.remove('casey-menu-open');button.focus();}
 function open(){menu.hidden=false;menu.inert=false;button.setAttribute('aria-expanded','true');button.innerHTML='CLOSE <span aria-hidden="true">( − )</span>';document.body.classList.add('casey-menu-open');menu.querySelector('a')?.focus();}
 button?.addEventListener('click',()=>menu.hidden?open():close());
 menu?.addEventListener('click',e=>{if(e.target.closest('a'))close()});
 document.addEventListener('keydown',e=>{
  if(!menu||menu.hidden)return;
  if(e.key==='Escape'){close();return;}
  if(e.key==='Tab'){const nodes=[button,...menu.querySelectorAll('a,button')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
 });
 document.querySelector('[data-back-top]')?.addEventListener('click',()=>scrollTo({top:0,behavior:reduce.matches?'instant':'smooth'}));
 const slides=[...document.querySelectorAll('[data-casey-slide]')],counter=document.querySelector('[data-casey-current]'),pause=document.querySelector('[data-casey-pause]'),controls=document.querySelector('.casey-player-controls');
 let current=0,paused=false;const visibleSlides=new Set();
 function updateVideo(slide,active){const video=slide.querySelector('video');if(!video)return;if(!active||paused||reduce.matches||navigator.connection?.saveData||document.hidden){video.pause();return;}const source=video.querySelector('[data-src]');if(source){source.src=source.dataset.src;source.removeAttribute('data-src');video.load()}video.muted=true;video.play().catch(()=>{});}
 slides.forEach(slide=>{const v=slide.querySelector('video');v?.addEventListener('playing',()=>v.classList.add('is-playing'));v?.addEventListener('error',()=>v.classList.remove('is-playing'))});
 if(slides.length){
  const stage=document.querySelector('.casey-films');
  document.body.classList.add('is-slideshow');
  let lockedUntil=0,wheelTotal=0,wheelReady=true,wheelTimer,touchStart=null;
  function showSlide(index,direction=1){
   const next=(index+slides.length)%slides.length;
   if(next===current&&visibleSlides.size)return;
   slides.forEach((slide,i)=>{
    const active=i===next;
    slide.style.setProperty('--slide-offset',`${i===current?-direction*40:direction*40}px`);
    slide.classList.toggle('is-active',active);
    slide.inert=!active;
    slide.setAttribute('aria-hidden',String(!active));
    if(active)visibleSlides.add(slide);else visibleSlides.delete(slide);
    updateVideo(slide,active);
   });
   current=next;
   if(counter)counter.textContent=String(current+1).padStart(2,'0');
  }
  function advance(direction){
   if(!menu.hidden||performance.now()<lockedUntil)return;
   lockedUntil=performance.now()+(reduce.matches?250:750);
   showSlide(current+direction,direction);
  }
  showSlide(Math.max(0,slides.findIndex(s=>`#${s.id}`===location.hash)));
  stage.setAttribute('aria-roledescription','carousel');
  stage.setAttribute('aria-label','Selected films. Scroll or swipe up and down to change film.');
  slides.forEach((s,i)=>{s.setAttribute('role','group');s.setAttribute('aria-roledescription','slide');s.setAttribute('aria-label',`${i+1} of ${slides.length}`)});
  if(counter){counter.setAttribute('aria-live','polite');counter.setAttribute('aria-atomic','true')}
  window.addEventListener('wheel',e=>{
   if(!menu.hidden||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
   e.preventDefault();
   clearTimeout(wheelTimer);
   wheelTimer=setTimeout(()=>{wheelTotal=0;wheelReady=true},180);
   if(!wheelReady||performance.now()<lockedUntil)return;
   wheelTotal+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
   if(Math.abs(wheelTotal)>=45){advance(Math.sign(wheelTotal));wheelReady=false;wheelTotal=0}
  },{passive:false});
  stage.addEventListener('touchstart',e=>{const t=e.touches[0];touchStart={x:t.clientX,y:t.clientY}},{passive:true});
  stage.addEventListener('touchend',e=>{
   if(!touchStart)return;
   const t=e.changedTouches[0],dy=touchStart.y-t.clientY,dx=touchStart.x-t.clientX;
   touchStart=null;
   if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx))advance(Math.sign(dy));
  },{passive:true});
  stage.addEventListener('touchcancel',()=>{touchStart=null},{passive:true});
  document.addEventListener('keydown',e=>{
   if(!menu.hidden||e.target.closest('input,textarea,select,button,a,[contenteditable]'))return;
   const direction=['ArrowDown','PageDown',' '].includes(e.key)?1:['ArrowUp','PageUp'].includes(e.key)?-1:0;
   if(direction){e.preventDefault();advance(e.shiftKey&&e.key===' '?-1:direction)}
   if(e.key==='Home'||e.key==='End'){e.preventDefault();showSlide(e.key==='Home'?0:slides.length-1)}
  });
  pause?.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'PLAY':'PAUSE';slides.forEach(s=>updateVideo(s,visibleSlides.has(s)))});
  document.querySelector('[data-casey-next]')?.addEventListener('click',()=>advance(1));
  const refresh=()=>slides.forEach(s=>updateVideo(s,visibleSlides.has(s)));document.addEventListener('visibilitychange',refresh);reduce.addEventListener('change',refresh);

 }
 const directory=document.querySelector('[data-project-directory]');
 if(directory){
  const links=[...directory.querySelectorAll('[data-project-name]')];
  const images=[...directory.querySelectorAll('[data-project-image]')];
  let request=0;
  async function preview(link){
   const token=++request;
   links.forEach(item=>item.classList.toggle('is-active',item===link));
   const image=images.find(item=>item.dataset.projectImage===link.dataset.projectName);
   if(!image)return;
   if(image.dataset.src){image.src=image.dataset.src;delete image.dataset.src}
   try{await image.decode()}catch{return}
   if(token!==request)return;
   images.forEach(item=>item.classList.toggle('is-active',item===image));
  }
  const filters=[...directory.querySelectorAll('[data-project-filter]')];
  const empty=directory.querySelector('.project-directory-empty');
  const status=directory.querySelector('[data-project-status]');
  filters.forEach(button=>button.addEventListener('click',()=>{
   const category=button.dataset.projectFilter;
   filters.forEach(filter=>filter.setAttribute('aria-pressed',String(filter===button)));
   const visible=links.filter(link=>category==='all'||link.dataset.projectCategory===category);
   links.forEach(link=>{link.hidden=!visible.includes(link)});
   empty.hidden=visible.length>0;
   if(status)status.textContent=`${visible.length} ${visible.length===1?'project':'projects'} shown`;
   directory.classList.toggle('is-empty',visible.length===0);
   if(visible.length)preview(visible[0]);
   else{request++;links.forEach(link=>link.classList.remove('is-active'))}
  }));
  links.forEach(link=>{
   link.addEventListener('pointerenter',()=>preview(link));
   link.addEventListener('focus',()=>preview(link));
   link.addEventListener('pointerdown',()=>preview(link));
  });
 }

 const player=document.getElementById('openVideo');if(player){player.setAttribute('role','button');player.tabIndex=0;player.setAttribute('aria-label','Play film');player.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();player.click()}})}
})();
