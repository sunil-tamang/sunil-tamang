(() => {
 'use strict';
 const dialog=document.getElementById('contact-modal');
 if(!dialog)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let opener=null,opening=false,closing=false,animations=[];
 function stop(){animations.forEach(animation=>animation.cancel());animations=[]}
 function state(open){document.body.classList.toggle('contact-modal-open',open);document.dispatchEvent(new CustomEvent('portfolio:menu-state',{detail:{open}}))}
 function open(){
  if(dialog.open||opening)return;
  opening=true;opener=document.activeElement;
  document.dispatchEvent(new CustomEvent('portfolio:close-menu',{detail:{done:()=>{
   opening=false;stop();dialog.showModal();dialog.scrollTop=0;state(true);
   if(!reduce.matches){
    animations=[dialog.animate([{opacity:0,transform:'translateY(calc(50vh + 50%))'},{opacity:1,transform:'translateY(0)'}],{duration:720,easing:'cubic-bezier(.16,1,.3,1)'})];
   }
  }}}));
 }
 async function close(){
  if(!dialog.open||closing)return;
  closing=true;stop();
  if(!reduce.matches){
   animations=[dialog.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(calc(50vh + 50%))'}],{duration:360,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'})];
   await Promise.all(animations.map(animation=>animation.finished.catch(()=>{})));
  }
  dialog.close();stop();closing=false;
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||url.pathname!==dialog.dataset.contactPath)return;
  event.preventDefault();event.stopImmediatePropagation();open();
 },true);
 dialog.querySelector('[data-contact-close]').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close()});
 let outside=false;
 dialog.addEventListener('pointerdown',event=>{outside=event.target===dialog});
 dialog.addEventListener('click',event=>{if(outside&&event.target===dialog)close();outside=false});
 dialog.addEventListener('close',()=>{
  state(false);
  const target=opener?.isConnected&&!opener.closest('[hidden],[inert]')?opener:document.querySelector('.casey-menu-button');target?.focus({preventScroll:true});
 });
 document.addEventListener('keydown',event=>{
  if(!dialog.open)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();return}
  if(event.key==='Tab'){
   const nodes=[...dialog.querySelectorAll('a[href],button:not([disabled])')],first=nodes[0],last=nodes.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
   else if(!dialog.contains(document.activeElement)){event.preventDefault();(event.shiftKey?last:first).focus()}
   return;
  }
  event.stopImmediatePropagation();
 },true);
 function hash(){if(location.hash==='#contact'){history.replaceState(history.state,'',location.pathname+location.search);open()}}
 addEventListener('hashchange',hash);hash();
 addEventListener('pagehide',()=>{stop();if(dialog.open)dialog.close()});
})();
