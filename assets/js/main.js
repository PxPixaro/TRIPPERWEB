
(() => {
  'use strict';
  const qs=(s,p=document)=>p.querySelector(s), qsa=(s,p=document)=>[...p.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page=document.body.dataset.page||'';
  qsa('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===page));

  const menu=qs('.menu-btn'), nav=qs('.main-nav');
  menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  qsa('.main-nav a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));

  const slides=qsa('.hero-slide'), dots=qsa('.hero-dot'); let slide=0, timer;
  const setSlide=i=>{if(!slides.length)return; slide=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('active',n===slide));dots.forEach((d,n)=>d.classList.toggle('active',n===slide));};
  const start=()=>{if(reduced||slides.length<2||document.hidden)return;clearInterval(timer);timer=setInterval(()=>setSlide(slide+1),6200)};
  qsa('[data-hero-dir]').forEach(b=>b.addEventListener('click',()=>{setSlide(slide+(b.dataset.heroDir==='next'?1:-1));start()}));
  dots.forEach((d,i)=>d.addEventListener('click',()=>{setSlide(i);start()}));
  document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):start()); start();

  qsa('[data-carousel]').forEach(w=>{const track=qs('.carousel-track',w);qsa('[data-dir]',w).forEach(b=>b.addEventListener('click',()=>track.scrollBy({left:(b.dataset.dir==='next'?1:-1)*track.clientWidth*.88,behavior:reduced?'auto':'smooth'})))});

  const reveals=qsa('.reveal');
  if(reduced||!('IntersectionObserver'in window))reveals.forEach(x=>x.classList.add('visible'));
  else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.07,rootMargin:'0px 0px 80px'});reveals.forEach(x=>io.observe(x));}

  qsa('.trip-search').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const p=new URLSearchParams();new FormData(f).forEach((v,k)=>v&&p.set(k,v));location.href=`tour.html?${p}`;}));
  const params=new URLSearchParams(location.search), search=(params.get('search')||'').toLowerCase();
  if(search){let visible=0;qsa('.filterable-trip').forEach(c=>{const show=c.textContent.toLowerCase().includes(search);c.hidden=!show;if(show)visible++});const empty=qs('.empty-state');if(empty)empty.style.display=visible?'none':'block';}

  qsa('.demo-form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const msg=qs('.form-message',f);f.reset();if(msg){msg.style.display='block';setTimeout(()=>msg.style.display='none',3500)}showToast('Thank you! Demo enquiry received.');}));

  const modal=qs('#bookingModal');
  qsa('[data-book]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();if(!modal)return;modal.classList.add('open');const field=qs('[name="trip"]',modal);if(field)field.value=b.dataset.book||'Selected trip';}));
  qsa('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>modal?.classList.remove('open')));
  modal?.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')modal?.classList.remove('open')});
  qsa('.accordion-btn').forEach(b=>b.addEventListener('click',()=>b.parentElement.classList.toggle('open')));

  function showToast(text){let t=qs('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800)}
})();
