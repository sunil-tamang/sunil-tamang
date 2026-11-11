(() => {
 'use strict';
 const archive=document.querySelector('[data-mountain-archive]');if(!archive)return;
 const buttons=[...archive.querySelectorAll('[data-mountain]')],filters=[...archive.querySelectorAll('[data-mountain-filter]')],images=[...archive.querySelectorAll('[data-mountain-image]')];
 const dialog=archive.querySelector('dialog'),content=archive.querySelector('[data-mountain-detail-content]'),more=archive.querySelector('[data-mountain-more]'),status=archive.querySelector('[data-mountain-status]'),empty=archive.querySelector('[data-mountain-empty]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)'),gsap=window.gsap;
 let filter='all',expanded=false,selected=null,token=0,animation,entry;
 const matches=button=>button.dataset.tags.split(/\s+/).includes(filter);
 async function preview(button){
  const request=++token,image=images.find(item=>item.dataset.mountainImage===button.dataset.mountain);if(!image)return;
  if(image.dataset.srcset){image.srcset=image.dataset.srcset;delete image.dataset.srcset}
  if(image.dataset.src){image.src=image.dataset.src;delete image.dataset.src}
  try{await image.decode()}catch{return}if(request!==token)return;
  images.forEach(item=>item.classList.toggle('is-active',item===image));
  if(gsap&&!reduced.matches){gsap.killTweensOf(image);gsap.fromTo(image,{scale:1.035,xPercent:.6},{scale:1,xPercent:0,duration:1.2,ease:'power2.out',clearProps:'transform'})}
 }
 function close(){animation?.kill();dialog.close();archive.classList.remove('has-detail');buttons.forEach(button=>button.setAttribute('aria-expanded','false'));if(selected&&!selected.hidden)selected.focus({preventScroll:true})}
 function show(button){
  const template=archive.querySelector(`[data-mountain-record="${button.dataset.mountain}"]`);if(!template)return;
  animation?.kill();content.replaceChildren(template.content.cloneNode(true));selected=button;buttons.forEach(item=>item.setAttribute('aria-expanded',String(item===button)));
  archive.classList.add('has-detail');
  if(!dialog.open){if(mobile.matches)dialog.showModal();else dialog.show()}
  dialog.scrollTop=0;preview(button);
  if(gsap&&!reduced.matches)animation=gsap.fromTo(content,{x:20,opacity:0},{x:0,opacity:1,duration:.45,ease:'power3.out',clearProps:'transform,opacity'});
  dialog.querySelector('[data-mountain-close]').focus({preventScroll:true});
 }
 function render(){
  const visible=buttons.filter(matches);buttons.forEach(button=>button.hidden=!visible.includes(button)||!expanded&&visible.indexOf(button)>=6);
  more.hidden=visible.length<=6;more.textContent=expanded?'Show Less':`Show More ( ${visible.length-6} )`;more.setAttribute('aria-expanded',String(expanded));empty.hidden=visible.length>0;
  status.textContent=`${expanded?visible.length:Math.min(6,visible.length)} of ${visible.length} mountain records`;
  if(selected&&selected.hidden&&dialog.open)close();
 }
 filters.forEach(button=>{
  const tag=button.dataset.mountainFilter;button.querySelector('[data-filter-count]').textContent=`( ${buttons.filter(item=>item.dataset.tags.split(/\s+/).includes(tag)).length.toString().padStart(2,'0')} )`;
  button.addEventListener('click',()=>{filter=tag;expanded=false;filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));render()});
 });
 buttons.forEach(button=>{
  button.addEventListener('pointerenter',()=>preview(button));button.addEventListener('focus',()=>preview(button));button.addEventListener('click',()=>show(button));
  button.addEventListener('keydown',event=>{
   const visible=buttons.filter(item=>!item.hidden),index=visible.indexOf(button),columns=innerWidth>1100?3:innerWidth>700?2:1;
   const step={ArrowRight:1,ArrowLeft:-1,ArrowDown:columns,ArrowUp:-columns}[event.key];
   if(step){event.preventDefault();visible[(index+step+visible.length)%visible.length]?.focus()}
   if(event.key==='Home'||event.key==='End'){event.preventDefault();visible[event.key==='Home'?0:visible.length-1]?.focus()}
  });
 });
 more.addEventListener('click',()=>{expanded=!expanded;render()});dialog.querySelector('[data-mountain-close]').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.open){event.preventDefault();close()}});
 mobile.addEventListener('change',()=>{if(dialog.open){dialog.close();if(mobile.matches)dialog.showModal();else dialog.show()}});
 reduced.addEventListener('change',()=>{if(!reduced.matches||!gsap)return;animation?.kill();entry?.kill();gsap.killTweensOf(images);gsap.set([content,...images,archive.querySelector('h1'),...filters,...buttons],{clearProps:'transform,opacity'})});
 render();
 if(gsap&&!reduced.matches)entry=gsap.fromTo([archive.querySelector('h1'),...filters,...buttons.filter(b=>!b.hidden)],{y:14,opacity:0},{y:0,opacity:1,stagger:.025,duration:.65,ease:'power3.out',clearProps:'transform,opacity'});
})();
