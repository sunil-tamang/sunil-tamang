(() => {
 const button=document.querySelector('.casey-menu-button'),menu=document.getElementById('casey-menu');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let menuOpen=false;
 function close(){
  if(!menu||!menuOpen)return;
  menuOpen=false;menu.inert=true;button.setAttribute('aria-expanded','false');button.innerHTML='MENU <span aria-hidden="true">( + )</span>';button.focus();
  const finish=()=>{if(!menuOpen){menu.hidden=true;document.getElementById('main-content').inert=false;document.body.classList.remove('casey-menu-open');document.dispatchEvent(new CustomEvent('portfolio:menu-state',{detail:{open:false}}))}};
  if(window.PortfolioMotion)window.PortfolioMotion.menu(false,finish);else finish();
 }
 function open(){
  menuOpen=true;document.getElementById('main-content').inert=true;menu.hidden=false;menu.inert=false;button.setAttribute('aria-expanded','true');button.innerHTML='CLOSE <span aria-hidden="true">( − )</span>';document.body.classList.add('casey-menu-open');
  document.dispatchEvent(new CustomEvent('portfolio:menu-state',{detail:{open:true}}));window.PortfolioMotion?.menu(true);menu.querySelector('a')?.focus();
 }
 button?.addEventListener('click',()=>menuOpen?close():open());
 menu?.addEventListener('click',e=>{if(e.target.closest('a'))close()});
 document.addEventListener('keydown',e=>{
  if(!menu||!menuOpen)return;
  if(e.key==='Escape'){close();return;}
  if(e.key==='Tab'){const nodes=[button,...menu.querySelectorAll('a,button')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
 });
 document.querySelector('[data-back-top]')?.addEventListener('click',()=>scrollTo({top:0,behavior:reduce.matches?'instant':'smooth'}));
 const slides=[...document.querySelectorAll('[data-casey-slide]')];
 if(slides.length){
  const stage=document.querySelector('.casey-films'),counter=document.querySelector('[data-casey-current]'),progress=document.querySelector('[data-casey-progress]'),meter=document.querySelector('[data-casey-meter]');
  const videos=slides.map(slide=>slide.querySelector('video'));
  let current=-1,cursor=0,request=0,pending=false,abort,fadeTimer,frame=0,frameVideo=null,inView=true,touch=null,wheelTotal=0,lastWheel=0,lastNavigation=0,lastAria=0,lastWheelNavigation=-Infinity,lastTouchNavigation=-Infinity;
  document.body.classList.add('is-slideshow');
  const allowed=()=>inView&&!document.hidden&&!menuOpen;
  const autoplay=()=>allowed()&&!reduce.matches&&!navigator.connection?.saveData;
  function paint(){
   const video=videos[current],duration=video?.duration;
   const ratio=duration>0&&Number.isFinite(duration)?Math.min(1,Math.max(0,video.currentTime/duration)):0;
   if(progress)progress.style.transform=`scaleX(${ratio})`;
   if(meter&&performance.now()-lastAria>250){meter.setAttribute('aria-valuenow',String(Math.round(ratio*100)));lastAria=performance.now()}
  }
  function stopFrames(){if(frameVideo?.cancelVideoFrameCallback)frameVideo.cancelVideoFrameCallback(frame);else cancelAnimationFrame(frame);frame=0;frameVideo=null}
  function tick(){frame=0;paint();const video=videos[current];if(!video||video.paused||!allowed())return;frameVideo=video;frame=video.requestVideoFrameCallback?video.requestVideoFrameCallback(tick):requestAnimationFrame(tick)}
  function sync(){
   videos.forEach((video,i)=>{if(!video)return;video.autoplay=i===current&&autoplay();if(i!==current||!autoplay())video.pause();else{video.muted=true;video.playsInline=true;video.play().catch(()=>{})}});
   document.querySelector('.casey-player-controls')?.classList.toggle('is-away',!inView);
   stopFrames();paint();if(videos[current]&&!videos[current].paused)tick();
  }
  function prepare(video,signal){
   if(!video)return Promise.resolve(false);
   if(video.readyState>=2)return Promise.resolve(true);
   return new Promise(resolve=>{
    const finish=ready=>{video.removeEventListener('loadeddata',readyHandler);video.removeEventListener('error',errorHandler);signal.removeEventListener('abort',abortHandler);resolve(ready)};
    const readyHandler=()=>finish(true),errorHandler=()=>finish(false),abortHandler=()=>finish(false);
    video.addEventListener('loadeddata',readyHandler,{once:true});video.addEventListener('error',errorHandler,{once:true});signal.addEventListener('abort',abortHandler,{once:true});
    video.preload='auto';video.muted=true;video.playsInline=true;
    const source=video.querySelector('[data-src]');if(source){source.src=source.dataset.src;source.removeAttribute('data-src')}
    video.load();
   });
  }
  async function show(index,manual=false){
   cursor=(index+slides.length)%slides.length;
   const next=cursor,token=++request;abort?.abort();abort=new AbortController();pending=true;
   if(manual)lastNavigation=performance.now();
   const video=videos[next];
   if(!await prepare(video,abort.signal)||token!==request){if(token===request)pending=false;return}
   pending=false;const previous=current;clearTimeout(fadeTimer);stopFrames();
   videos.forEach(v=>v?.pause());
   try{video.currentTime=0}catch{}
   current=next;
   slides.forEach((slide,i)=>{const active=i===next;slide.classList.toggle('is-outgoing',i===previous&&i!==next);slide.classList.toggle('is-active',active);slide.inert=!active;slide.setAttribute('aria-hidden',String(!active))});
   video.classList.add('is-playing');
   if(counter)counter.textContent=String(next+1).padStart(2,'0');
   if(progress)progress.style.transform='scaleX(0)';if(meter)meter.setAttribute('aria-valuenow','0');
   fadeTimer=setTimeout(()=>slides.forEach(slide=>slide.classList.remove('is-outgoing')),reduce.matches?0:360);
   document.dispatchEvent(new CustomEvent('portfolio:slidechange',{detail:{slide:slides[next],index:next}}));sync();
  }
  slides.forEach((slide,i)=>{
   slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','slide');slide.setAttribute('aria-label',`${i+1} of ${slides.length}`);slide.inert=i!==0;
   const video=videos[i];if(!video)return;video.loop=false;
   video.addEventListener('playing',()=>{video.classList.add('is-playing');if(i===current){stopFrames();tick()}else video.pause()});
   video.addEventListener('timeupdate',()=>{if(i===current)paint()});
   video.addEventListener('seeked',()=>{if(i===current)paint()});
   video.addEventListener('ended',()=>{if(i===current&&!pending&&autoplay()&&performance.now()-lastNavigation>100)show(current+1)});
  });
  stage.setAttribute('aria-roledescription','carousel');stage.setAttribute('aria-label','Selected films. Swipe or scroll to browse; page scrolling remains available.');
  const navigate=direction=>{if(!allowed())return;show(cursor+direction,true)};
  stage.addEventListener('wheel',event=>{
   if(!allowed()||event.ctrlKey)return;
   const now=performance.now(),delta=(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
   if(!delta)return;if(now-lastWheel>180||Math.sign(wheelTotal)!==Math.sign(delta))wheelTotal=0;lastWheel=now;wheelTotal+=delta;
   if(now-lastWheelNavigation<240){wheelTotal=0;return}
   if(Math.abs(wheelTotal)>=110){navigate(Math.sign(wheelTotal));wheelTotal=0;lastWheelNavigation=now}
  },{passive:true});
  stage.addEventListener('touchstart',event=>{lastTouchNavigation=-Infinity;const p=event.touches[0];touch=event.touches.length===1?{x:p.clientX,y:p.clientY}:null},{passive:true});
  stage.addEventListener('touchmove',event=>{if(!touch||event.touches.length!==1){touch=null;return}const p=event.touches[0],dx=touch.x-p.clientX,dy=touch.y-p.clientY;if(Math.max(Math.abs(dx),Math.abs(dy))>=85&&performance.now()-lastTouchNavigation>=240){lastTouchNavigation=performance.now();navigate(Math.sign(Math.abs(dx)>Math.abs(dy)?dx:dy));touch={x:p.clientX,y:p.clientY}}},{passive:true});
  stage.addEventListener('touchend',()=>{touch=null},{passive:true});stage.addEventListener('touchcancel',()=>{touch=null},{passive:true});
  document.addEventListener('keydown',event=>{
   if(!allowed()||event.target.closest('input,textarea,select,button,a,[contenteditable]'))return;
   const direction=['ArrowDown','ArrowRight','PageDown',' '].includes(event.key)?1:['ArrowUp','ArrowLeft','PageUp'].includes(event.key)?-1:0;
   // Arrow/space events retain their normal page scrolling behavior.
   if(direction)navigate(event.shiftKey&&event.key===' '?-1:direction);
   if(event.key==='Home'||event.key==='End')show(event.key==='Home'?0:slides.length-1,true);
  });
  document.querySelector('[data-casey-next]')?.addEventListener('click',()=>navigate(1));
  document.addEventListener('visibilitychange',sync);document.addEventListener('portfolio:menu-state',sync);reduce.addEventListener('change',sync);
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting&&entries[0].intersectionRatio>=.15;sync()},{threshold:.15}).observe(stage);
  show(Math.max(0,slides.findIndex(slide=>`#${slide.id}`===location.hash)));
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
   if(image.dataset.srcset){image.srcset=image.dataset.srcset;delete image.dataset.srcset}
   if(image.dataset.src){image.src=image.dataset.src;delete image.dataset.src}
   if(!image.complete){
    await new Promise(resolve=>{
     const ready=()=>{image.removeEventListener('load',ready);image.removeEventListener('error',ready);resolve()};
     image.addEventListener('load',ready,{once:true});image.addEventListener('error',ready,{once:true});
    });
   }
   if(!image.naturalWidth||token!==request)return;
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
