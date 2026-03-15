'use strict';

const PizzaRenderer = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs={}) {
    const el = document.createElementNS(NS, tag);
    for (const [k,v] of Object.entries(attrs)) el.setAttribute(k,v);
    return el;
  }

  function drawBase(size, added) {
    const cx=size/2, cy=size/2, r=size/2-5;
    const svg = svgEl('svg',{width:size,height:size,viewBox:`0 0 ${size} ${size}`});

    // Gradientes y textura para hacer la pizza más real
    const defs = svgEl('defs');
    const crustGrad = svgEl('radialGradient',{id:'crust-grad',cx:'50%',cy:'50%',r:'60%'});
    crustGrad.appendChild(svgEl('stop',{offset:'0%','stop-color':'#f7d5ab'}));
    crustGrad.appendChild(svgEl('stop',{offset:'45%','stop-color':'#d99b66'}));
    crustGrad.appendChild(svgEl('stop',{offset:'100%','stop-color':'#c17645'}));

    const sauceGrad = svgEl('radialGradient',{id:'sauce-grad',cx:'50%',cy:'50%',r:'75%'});
    sauceGrad.appendChild(svgEl('stop',{offset:'0%','stop-color':'#ff6f45'}));
    sauceGrad.appendChild(svgEl('stop',{offset:'65%','stop-color':'#c0392b'}));
    sauceGrad.appendChild(svgEl('stop',{offset:'100%','stop-color':'#90221c'}));

    const crustTexture = svgEl('filter',{id:'crust-texture',x:'-20%',y:'-20%','width':'140%','height':'140%'});
    crustTexture.appendChild(svgEl('feTurbulence',{type:'fractalNoise',baseFrequency:'0.04',numOctaves:'3',seed:'18'}));
    crustTexture.appendChild(svgEl('feColorMatrix',{type:'saturate',values:'0.85'}));
    crustTexture.appendChild(svgEl('feComposite',{in:'SourceGraphic',in2:'SourceGraphic',operator:'arithmetic',k1:'0',k2:'0.9',k3:'0',k4:'0.1'}));

    defs.appendChild(crustGrad);
    defs.appendChild(sauceGrad);
    defs.appendChild(crustTexture);
    svg.appendChild(defs);

    svg.appendChild(svgEl('ellipse',{cx,cy:size-7,rx:r*0.82,ry:10,fill:'rgba(0,0,0,0.14)'}));
    svg.appendChild(svgEl('circle',{cx,cy,r,fill:'url(#crust-grad)',filter:'url(#crust-texture)'}));
    svg.appendChild(svgEl('circle',{cx,cy,r:r-10,fill:'#C49060',opacity:0.96}));
    svg.appendChild(svgEl('circle',{cx,cy,r:r-13,fill:'#F5DEB3'}));
    svg.appendChild(svgEl('circle',{cx,cy,r:r-18,fill:'url(#sauce-grad)',opacity:0.84}));

    // Detalles de especias en la corteza
    for(let i=0;i<18;i++){
      const a=Math.random()*Math.PI*2;
      const rr=r-4 + Math.random()*3;
      const px=cx+Math.cos(a)*rr, py=cy+Math.sin(a)*rr;
      svg.appendChild(svgEl('circle',{cx:px,cy:py,r:1+Math.random()*1.3,fill:'#a65e2a',opacity:0.55}));
    }

    // Manchas de salsa para mayor realismo
    for(let i=0;i<20;i++){
      const a=Math.random()*Math.PI*2;
      const d=(r-30)*Math.sqrt(Math.random());
      const sx=cx+Math.cos(a)*d, sy=cy+Math.sin(a)*d;
      svg.appendChild(svgEl('circle',{cx:sx,cy:sy,r:1.5+Math.random()*1.8,fill:'#b82f24',opacity:0.5}));
    }

    for(let i=0;i<12;i++){
      const a=(i/12)*Math.PI*2;
      const bx=cx+Math.cos(a)*(r-4), by=cy+Math.sin(a)*(r-4);
      svg.appendChild(svgEl('ellipse',{cx:bx,cy:by,rx:7,ry:5,fill:'#C49060',opacity:0.5,
        transform:`rotate(${a*180/Math.PI},${bx},${by})`}));
    }

    if(added.some(i=>i.id==='tomato')){
      svg.appendChild(svgEl('circle',{cx,cy,r:r-16,fill:'#C0392B',opacity:0.75}));
      for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2+0.3, dr=(r-30)*0.55;
        svg.appendChild(svgEl('ellipse',{
          cx:cx+Math.cos(a)*dr, cy:cy+Math.sin(a)*dr,
          rx:14, ry:10, fill:'#E74C3C', opacity:0.4
        }));
      }
    }

    if(added.some(i=>i.id==='cheese')){
      svg.appendChild(svgEl('circle',{cx,cy,r:r-20,fill:'#F9C74F',opacity:0.82}));
      for(let j=0;j<7;j++){
        const a=(j/7)*Math.PI*2, dr=(r-38)*0.7;
        svg.appendChild(svgEl('ellipse',{
          cx:cx+Math.cos(a)*dr, cy:cy+Math.sin(a)*dr,
          rx:13, ry:10, fill:'#FFD166'
        }));
      }
    }

    if(added.some(i=>i.id==='cheese_grated')) drawCheeseGrated(svg,cx,cy,r);
    if(added.some(i=>i.id==='tomato_slice'))  drawTomatoSlices(svg,cx,cy,r);

    return svg;
  }

  function drawCheeseGrated(svg, cx, cy, r) {
    const innerR = r-22;
    svg.appendChild(svgEl('circle',{cx,cy,r:innerR,fill:'#FFFACD',opacity:0.6}));
    const rng = seededRng(42);
    for(let i=0;i<28;i++){
      const angle=rng()*Math.PI*2, dist=rng()*innerR*0.75;
      const sx=cx+Math.cos(angle)*dist, sy=cy+Math.sin(angle)*dist;
      const len=10+rng()*20, tang=angle+(rng()-0.5)*1.5;
      const ex=sx+Math.cos(tang)*len, ey=sy+Math.sin(tang)*len;
      const c1x=sx+Math.cos(tang+0.5)*len*0.4, c1y=sy+Math.sin(tang+0.5)*len*0.4;
      svg.appendChild(svgEl('path',{
        d:`M${sx},${sy} Q${c1x},${c1y} ${ex},${ey}`,
        stroke:'#F9C74F','stroke-width':1.5+rng()*2.5,
        fill:'none','stroke-linecap':'round',opacity:0.85
      }));
    }
    for(let i=0;i<12;i++){
      const a=rng()*Math.PI*2, d=rng()*innerR*0.6;
      svg.appendChild(svgEl('ellipse',{
        cx:cx+Math.cos(a)*d, cy:cy+Math.sin(a)*d,
        rx:2+rng()*4, ry:1+rng()*2,
        fill:'#FFD166',opacity:0.7,
        transform:`rotate(${rng()*180},${cx+Math.cos(a)*d},${cy+Math.sin(a)*d})`
      }));
    }
  }

  function drawTomatoSlices(svg, cx, cy, r) {
    const R=r-22;
    [
      {x:cx,        y:cy,         s:0.9},
      {x:cx-R*0.42, y:cy-R*0.38, s:0.7},
      {x:cx+R*0.40, y:cy-R*0.35, s:0.75},
      {x:cx-R*0.38, y:cy+R*0.40, s:0.72},
      {x:cx+R*0.38, y:cy+R*0.38, s:0.68},
    ].forEach(({x,y,s})=>drawSingleSlice(svg,x,y,22*s));
  }

  function drawSingleSlice(svg, cx, cy, r) {
    svg.appendChild(svgEl('circle',{cx,cy:cy+2,r,fill:'rgba(0,0,0,0.12)'}));
    svg.appendChild(svgEl('circle',{cx,cy,r,fill:'#E53E3E'}));
    svg.appendChild(svgEl('circle',{cx,cy,r:r*0.85,fill:'#FC8181',opacity:0.9}));
    svg.appendChild(svgEl('circle',{cx,cy,r:r*0.25,fill:'#F6E05E',opacity:0.85}));
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2-Math.PI/2;
      const lx=cx+Math.cos(a)*r*0.82, ly=cy+Math.sin(a)*r*0.82;
      svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:lx,y2:ly,stroke:'#E53E3E','stroke-width':0.8,opacity:0.5}));
      const sx=cx+Math.cos(a+Math.PI/6)*r*0.54, sy=cy+Math.sin(a+Math.PI/6)*r*0.54;
      svg.appendChild(svgEl('ellipse',{
        cx:sx,cy:sy,rx:r*0.1,ry:r*0.05,fill:'#FEFCBF',opacity:0.9,
        transform:`rotate(${a*180/Math.PI+90},${sx},${sy})`
      }));
    }
    for(let i=0;i<4;i++){
      const a=(i/4)*Math.PI*2+Math.random()*0.3;
      const d=r*0.45+Math.random()*r*0.15;
      const sx=cx+Math.cos(a)*d, sy=cy+Math.sin(a)*d;
      svg.appendChild(svgEl('ellipse',{cx:sx,cy:sy,rx:r*0.04,ry:r*0.02,fill:'#fff8d2',opacity:0.95}));
    }
    svg.appendChild(svgEl('ellipse',{cx:cx-r*0.2,cy:cy-r*0.25,rx:r*0.18,ry:r*0.1,fill:'white',opacity:0.35}));
  }

  function seededRng(seed) {
    let s=seed;
    return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };
  }

  function randomToppingPos(size) {
    const cx=size/2, cy=size/2;
    const r=8+Math.random()*(size/2-36);
    const a=Math.random()*Math.PI*2;
    return { x:Math.round(cx+Math.cos(a)*r-14), y:Math.round(cy+Math.sin(a)*r-14) };
  }

  function render(ws, added, positions, showCuts=false, cutLines=[]) {
    const size  = ws.offsetWidth || 220;
    const badge = ws.querySelector('#chef-badge');
    const cutter= ws.querySelector('#cut-canvas');
    ws.innerHTML='';
    if(badge)  ws.appendChild(badge);
    const svg = drawBase(size,added);
    if(showCuts && cutLines.length>0){
      cutLines.forEach(l=>{
        svg.appendChild(svgEl('line',{
          x1:l.x1,y1:l.y1,x2:l.x2,y2:l.y2,
          stroke:'rgba(255,255,255,0.88)','stroke-width':2.5,'stroke-linecap':'round'
        }));
      });
    } else if(showCuts){
      const c=size/2;
      [[c,5,c,size-5],[5,c,size-5,c],[20,20,size-20,size-20],[20,size-20,size-20,20]].forEach(([x1,y1,x2,y2])=>{
        svg.appendChild(svgEl('line',{x1,y1,x2,y2,stroke:'rgba(255,255,255,0.8)','stroke-width':2.5,'stroke-linecap':'round'}));
      });
    }
    ws.insertBefore(svg,ws.firstChild);
    positions.forEach(tp=>{
      const el=document.createElement('div');
      el.className='topping-on-pizza'; el.textContent=tp.emoji;
      el.style.cssText=`left:${tp.x}px;top:${tp.y}px;font-size:${Math.max(16,size*0.09)}px;`;
      ws.appendChild(el);
    });
    if(cutter) ws.appendChild(cutter);
  }

  return { render, randomToppingPos };
})();


const PizzaCutter = (() => {
  let canvas,ctx,ws,size,cx,cy,radius;
  let isDrawing=false, startX,startY;
  let cuts=[], onCutDone=null, knifeEl=null;
  const MIN_CUTS=2;

  function init(workspace, callback) {
    ws=workspace; size=ws.offsetWidth||220;
    cx=size/2; cy=size/2; radius=size/2-14;
    onCutDone=callback; cuts=[];

    canvas=document.createElement('canvas');
    canvas.id='cut-canvas'; canvas.width=size; canvas.height=size;
    canvas.style.cssText=`position:absolute;top:0;left:0;width:${size}px;height:${size}px;border-radius:50%;cursor:crosshair;z-index:10;`;
    ctx=canvas.getContext('2d');

    knifeEl=document.createElement('div');
    knifeEl.id='pizza-knife'; knifeEl.textContent='🔪';
    knifeEl.style.cssText='position:fixed;font-size:28px;pointer-events:none;z-index:999;transform:translate(-50%,-50%) rotate(-45deg);display:none;';
    document.body.appendChild(knifeEl);

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup',   onUp);
    canvas.addEventListener('mouseleave',onUp);
    canvas.addEventListener('touchstart',e=>{e.preventDefault();onDown(e.touches[0]);},{passive:false});
    canvas.addEventListener('touchmove', e=>{e.preventDefault();onMove(e.touches[0]);},{passive:false});
    canvas.addEventListener('touchend',  e=>{e.preventDefault();onUp(e.changedTouches[0]);},{passive:false});

    ws.appendChild(canvas);
    drawGuide();
  }

  function drawGuide() {
    ctx.clearRect(0,0,size,size);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,radius*0.95,0,Math.PI*2);
    ctx.setLineDash([8,6]); ctx.strokeStyle='rgba(255,200,50,0.5)';
    ctx.lineWidth=2; ctx.stroke(); ctx.restore();
    ctx.save();
    ctx.font=`bold ${Math.max(12,size*0.07)}px Fredoka One,cursive`;
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=6;
    ctx.fillText('¡Arrastra para',cx,cy-14);
    ctx.fillText('cortar! ✂️',cx,cy+14);
    ctx.restore();
  }

  function getPos(e) {
    const rect=canvas.getBoundingClientRect();
    return {
      x:(e.clientX-rect.left)*(size/rect.width),
      y:(e.clientY-rect.top)*(size/rect.height)
    };
  }

  function snapToBorder(x1,y1,x2,y2) {
    const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy);
    if(len<5) return {x1,y1,x2,y2};
    const nx=dx/len, ny=dy/len;
    return {
      x1:cx+nx*radius*1.05, y1:cy+ny*radius*1.05,
      x2:cx-nx*radius*1.05, y2:cy-ny*radius*1.05
    };
  }

  function onDown(e) {
    isDrawing=true; const p=getPos(e); startX=p.x; startY=p.y;
    if(knifeEl){knifeEl.style.display='block';knifeEl.style.left=e.clientX+'px';knifeEl.style.top=e.clientY+'px';}
  }

  function onMove(e) {
    if(knifeEl&&isDrawing){knifeEl.style.left=e.clientX+'px';knifeEl.style.top=e.clientY+'px';}
    if(!isDrawing) return;
    const p=getPos(e); redraw();
    drawCutLine(startX,startY,p.x,p.y,'rgba(255,255,255,0.7)',false);
  }

  function onUp(e) {
    if(!isDrawing) return;
    isDrawing=false;
    if(knifeEl) knifeEl.style.display='none';
    const p=getPos(e);
    const dx=p.x-startX, dy=p.y-startY;
    if(Math.sqrt(dx*dx+dy*dy)<size*0.15){redraw();return;}
    cuts.push(snapToBorder(startX,startY,p.x,p.y));
    redraw();
    const slices=countSlices();
    if(onCutDone) onCutDone(slices, cuts.length>=MIN_CUTS);
  }

  function redraw() {
    ctx.clearRect(0,0,size,size);
    if(cuts.length===0){drawGuide();return;}
    cuts.forEach(c=>drawCutLine(c.x1,c.y1,c.x2,c.y2,'rgba(255,255,255,0.92)',true));
  }

  function drawCutLine(x1,y1,x2,y2,color,glow) {
    ctx.save();
    if(glow){ctx.shadowColor='rgba(255,220,50,0.8)';ctx.shadowBlur=8;}
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
    ctx.strokeStyle=color; ctx.lineWidth=3; ctx.lineCap='round'; ctx.stroke();
    if(glow){
      ctx.beginPath(); ctx.arc(x1,y1,4,0,Math.PI*2); ctx.arc(x2,y2,4,0,Math.PI*2);
      ctx.fillStyle='rgba(255,240,100,0.9)'; ctx.fill();
    }
    ctx.restore();
  }

  function countSlices() { return Math.min(16, cuts.length*2); }

  function destroy() {
    if(canvas&&canvas.parentNode) canvas.parentNode.removeChild(canvas);
    if(knifeEl&&knifeEl.parentNode) knifeEl.parentNode.removeChild(knifeEl);
    canvas=null; ctx=null; knifeEl=null; cuts=[];
  }

  function getCuts() { return [...cuts]; }

  return { init, destroy, getCuts, countSlices };
})();