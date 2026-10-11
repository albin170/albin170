'use strict';
(() => {
  const canvas = document.getElementById('hyperfield');
  const ctx = canvas.getContext('2d', { alpha: true });
  const imageLayer = document.getElementById('imageLayer');
  const motionButton = document.getElementById('motionButton');
  const cursor = document.getElementById('cursor');
  const cards = [...document.querySelectorAll('.character')];
  const reactor = window.Codeverse3D?.mount(document.getElementById('reactorCanvas')) || null;
  const reactorBurst = document.getElementById('reactorBurst');
  const reactorMode = document.getElementById('reactorMode');
  const reactorStatus = document.getElementById('reactorStatus');
  let dimension = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motion = !reduceMotion.matches, warpUntil = 0, t = 0, raf = null;
  let stars = [], width = 0, height = 0, pixelRatio = 1;
  function size() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    stars = Array.from({length: Math.min(220,Math.floor(width*height/5000))},()=>({
      x:Math.random()*width, y:Math.random()*height, z:.3+Math.random()*1.8,
      c:Math.random()<.25?'#ba82ff':'#94f4ff',r:.4+Math.random()*1.3
    }));
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if(!motion) { ctx.clearRect(0,0,width,height); return; }
    t = now;
    ctx.clearRect(0,0,width,height);
    const warp = now < warpUntil;
    const vel = warp ? 22 : .38;
    for(const s of stars){
      s.y += vel*s.z;
      s.x += (warp ? 2.5 : .03)*s.z;
      if(s.y>height+30){ s.y=-10;s.x=Math.random()*width; }
      if(s.x>width+30) s.x=-10;
      ctx.globalAlpha = .25 + s.z*.25;
      ctx.strokeStyle = s.c; ctx.lineWidth=s.r;
      ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-(warp?12:0)*s.z,s.y-(warp?55:2)*s.z);ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function setMotion(yes){
    motion = yes;
    document.body.classList.toggle('no-motion', !yes);
    motionButton.textContent = yes ? '◉ MOTION: ON' : '◎ MOTION: OFF';
    motionButton.setAttribute('aria-pressed', String(yes));
    reactor?.setMotion(yes);
    if(!yes) ctx.clearRect(0,0,width,height);
  }
  function warp(){
    if(!motion) return;
    warpUntil = performance.now()+1150;
    reactor?.burst();
    document.body.classList.remove('warp');
    void document.body.offsetWidth;
    document.body.classList.add('warp');
    window.setTimeout(()=>document.body.classList.remove('warp'),1220);
  }
  function selectCard(card){
    cards.forEach(c=>c.classList.toggle('selected',c===card));
    if(card) reactor?.setTheme(cards.indexOf(card)===0?1:cards.indexOf(card)===2?2:0);
    if(card && motion) warp();
  }
  cards.forEach((c,i)=>{
    c.addEventListener('click',()=>selectCard(c));
    c.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();selectCard(c);}});
    c.addEventListener('pointermove',e=>{
      if(!motion || matchMedia('(hover:none)').matches) return;
      const box=c.getBoundingClientRect();
      const nx=(e.clientX-box.left)/box.width-.5,ny=(e.clientY-box.top)/box.height-.5;
      c.style.transform=`rotateY(${nx*12}deg) rotateX(${-ny*12}deg) translateY(-7px)`;
    });
    c.addEventListener('pointerleave',()=>{c.style.transform='';});
  });
  let scrollY=0,mouseX=0,mouseY=0, pending=false;
  function parallax(){
    pending=false;
    if(!motion) return;
    const mx=(mouseX-.5)*15,my=(mouseY-.5)*12;
    imageLayer.style.transform=`translate3d(${mx}px,${my+Math.min(scrollY*.17,90)}px,0) scale(1.08)`;
  }
  function scheduleParallax(){if(!pending){pending=true;requestAnimationFrame(parallax);}}
  window.addEventListener('pointermove',e=>{
    mouseX=e.clientX/window.innerWidth;mouseY=e.clientY/window.innerHeight;
    if(e.pointerType==='mouse') {
      cursor.style.opacity=motion?'1':'0';
      cursor.style.transform=`translate3d(${e.clientX-18}px,${e.clientY-18}px,0)`;
    }
    reactor?.setPointer((mouseX-.5)*2,(mouseY-.5)*2);
    scheduleParallax();
  },{passive:true});
  window.addEventListener('scroll',()=>{scrollY=window.scrollY;scheduleParallax();},{passive:true});
  reactorBurst?.addEventListener('click',()=>{warp();reactorStatus.textContent = 'OVERDRIVE ACTIVATED // WARP FIELD ENGAGED';});
  reactorMode?.addEventListener('click',()=>{dimension=(dimension+1)%3;reactor?.setTheme(dimension);reactorStatus.textContent=['CYAN SENTINEL REALITY','ORANGE VELOCITY REALITY','VIOLET ARCHITECT REALITY'][dimension];});
  motionButton.addEventListener('click',()=>{setMotion(!motion);if(!motion)cursor.style.opacity='0';});
  window.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey || ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if(['1','2','3'].includes(e.key)){selectCard(cards[Number(e.key)-1]);}
    if(e.code==='Space' && (e.target===document.body||e.target===document.documentElement)){e.preventDefault();warp();}
    if(e.key.toLowerCase()==='r'){e.preventDefault();warp();}
    if(e.key==='Escape'){warpUntil=0;document.body.classList.remove('warp');}
  });
  if(reduceMotion.addEventListener)reduceMotion.addEventListener('change',e=>setMotion(!e.matches));
  window.addEventListener('resize',size,{passive:true});
  size();setMotion(motion);raf=requestAnimationFrame(frame);
  if(!reactor){reactorStatus.textContent = 'CSS 3D FALLBACK ACTIVE // WEBGL NOT AVAILABLE';}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)ctx.clearRect(0,0,width,height)});
})();
