/* Der Nachttest: spielt jede Seite ohne Browser durch.
   node tools/nachttest.js            alles
   node tools/nachttest.js level5     nur Seiten, deren Name das enthaelt
   node tools/nachttest.js --kurz     nur 20 statt 60 Sekunden Spiel, 60 statt 300 Nichtstun

   Warum es das gibt: die Nachtroutine laeuft in der Cloud, und dort gibt es
   keinen Browser. Engine und Level-Script werden hier in einer Funktion
   zusammengesetzt, die Browser-Dinge (document, Canvas, Speicher) sind
   Attrappen. Es wird nicht gezeichnet, aber update() und draw() laufen
   wirklich - Ausnahmen, Softlocks und NaN fallen auf.

   Was NICHT geht: Ton, echtes Layout, echte Geraete.
   Pixel misst der Software-Canvas unten (leinwand/leereProzent) - naeherungsweise,
   nicht browsergetreu (keine Textur-Glaettung, Kreise/Pfade grob gerastert).

   Harte Fehler (Exit 1): Ausnahme, NaN in der Position, toter Gespraechs-
   verweis, Zeichen ausserhalb der Schrift, Konter-Test von Level 2. */
const fs=require('fs');
const argv=process.argv.slice(2);
const KURZ=argv.includes('--kurz');
const filter=argv.filter(a=>!a.startsWith('--'));
const SEITEN=['index.html','level2.html','level3.html','level4.html','level5.html',
  'level6.html','level7.html','level8.html','karte.html'];   // runner.html hat eine eigene Schleife
const SPIEL_SEK=KURZ?20:60, NICHTS_SEK=KURZ?60:300;

/* ---- Attrappen ------------------------------------------------------- */
function stumm(){
  const f=function(){ return stumm(); };
  return new Proxy(f,{
    get(t,k){ if(k===Symbol.toPrimitive) return ()=>0; if(k==='then') return undefined;
      if(k==='length') return 0; return stumm(); },
    set(){ return true; }, apply(){ return stumm(); },
  });
}

/* ---- Software-Canvas: echter Pixelpuffer statt Attrappe ----------------
   Deckt genau das ab, was Engine und Level wirklich aufrufen (geprueft per
   grep): fillRect/clearRect, drawImage (2/4/9 Argumente), einfache Pfade
   (moveTo/lineTo/arc/fill/stroke), lineare/radiale Verlaeufe, Transforma-
   tionen (translate/scale/rotate). Kein Weichzeichnen, keine Bildskalierung
   mit Interpolation - fuer Zeilen-Statistik reicht das. */
function parseColor(s){
  if(typeof s!=='string') return [0,0,0,1];
  if(s[0]==='#'){
    let h=s.slice(1);
    if(h.length===3||h.length===4) h=h.split('').map(c=>c+c).join('');
    const r=parseInt(h.slice(0,2),16)||0, g=parseInt(h.slice(2,4),16)||0, b=parseInt(h.slice(4,6),16)||0;
    const a=h.length>=8?parseInt(h.slice(6,8),16)/255:1;
    return [r,g,b,a];
  }
  const m=s.match(/rgba?\(([^)]+)\)/);
  if(m){ const p=m[1].split(',').map(x=>parseFloat(x));
    return [p[0]||0,p[1]||0,p[2]||0,p.length>3?p[3]:1]; }
  return [0,0,0,1];
}
const matI=()=>({a:1,b:0,c:0,d:1,e:0,f:0});
const matMul=(A,B)=>({
  a:A.a*B.a+A.c*B.b, b:A.b*B.a+A.d*B.b,
  c:A.a*B.c+A.c*B.d, d:A.b*B.c+A.d*B.d,
  e:A.a*B.e+A.c*B.f+A.e, f:A.b*B.e+A.d*B.f+A.f });

class Grad{
  constructor(kind,co){ this.kind=kind; this.co=co; this.stops=[]; }
  addColorStop(o,c){ this.stops.push([o,parseColor(c)]); }
  sample(lx,ly){
    if(!this.stops.length) return [0,0,0,0];
    let t;
    if(this.kind==='linear'){
      const [x0,y0,x1,y1]=this.co, dx=x1-x0, dy=y1-y0, len2=dx*dx+dy*dy||1e-9;
      t=((lx-x0)*dx+(ly-y0)*dy)/len2;
    } else {
      const [,,r0,x1,y1,r1]=this.co;
      t=(Math.hypot(lx-x1,ly-y1)-r0)/((r1-r0)||1e-9);
    }
    t=Math.max(0,Math.min(1,t));
    const st=this.stops; let s0=st[0], s1=st[st.length-1];
    for(let i=0;i<st.length-1;i++) if(t>=st[i][0]&&t<=st[i+1][0]){ s0=st[i]; s1=st[i+1]; break; }
    const span=(s1[0]-s0[0])||1e-9, lt=Math.max(0,Math.min(1,(t-s0[0])/span));
    const c0=s0[1], c1=s1[1];
    return [c0[0]+(c1[0]-c0[0])*lt, c0[1]+(c1[1]-c0[1])*lt, c0[2]+(c1[2]-c0[2])*lt, c0[3]+(c1[3]-c0[3])*lt];
  }
}

function blendPx(buf,i,r,g,b,a){
  if(a<=0) return;
  if(a>=1){ buf[i]=r; buf[i+1]=g; buf[i+2]=b; buf[i+3]=255; return; }
  const da=buf[i+3]/255, outA=a+da*(1-a);
  if(outA<=0){ buf[i+3]=0; return; }
  buf[i]=(r*a+buf[i]*da*(1-a))/outA;
  buf[i+1]=(g*a+buf[i+1]*da*(1-a))/outA;
  buf[i+2]=(b*a+buf[i+2]*da*(1-a))/outA;
  buf[i+3]=outA*255;
}

function leinwand(w0,h0){
  let w=Math.max(1,Math.round(w0||320)), h=Math.max(1,Math.round(h0||180));
  let buf=new Uint8ClampedArray(w*h*4);
  let fillStyle='#000', strokeStyle='#000', globalAlpha=1, lineWidth=1, m=matI();
  let path=[], cur=null, stack=[];
  const putDevice=(lx,ly,r,g,b,a)=>{
    const dx=m.a*(lx+0.5)+m.c*(ly+0.5)+m.e, dy=m.b*(lx+0.5)+m.d*(ly+0.5)+m.f;
    const px=Math.floor(dx), py=Math.floor(dy);
    if(px<0||py<0||px>=w||py>=h) return;
    blendPx(buf,(py*w+px)*4,r,g,b,a*globalAlpha);
  };
  function fillPoly(poly,style){
    if(poly.length<3) return;
    const pts=poly.map(([x,y])=>[m.a*x+m.c*y+m.e, m.b*x+m.d*y+m.f]);
    let minY=Infinity,maxY=-Infinity;
    for(const [,py] of pts){ if(py<minY) minY=py; if(py>maxY) maxY=py; }
    minY=Math.max(0,Math.floor(minY)); maxY=Math.min(h-1,Math.ceil(maxY));
    const [r,g,b,a0]=parseColor(style);
    for(let py=minY;py<=maxY;py++){
      const xs=[];
      for(let i=0;i<pts.length;i++){ const [x1,y1]=pts[i], [x2,y2]=pts[(i+1)%pts.length];
        if((y1<=py&&y2>py)||(y2<=py&&y1>py)) xs.push(x1+(py-y1)/(y2-y1)*(x2-x1)); }
      xs.sort((a,b)=>a-b);
      for(let i=0;i+1<xs.length;i+=2){
        const xa=Math.max(0,Math.round(xs[i])), xb=Math.min(w-1,Math.round(xs[i+1]));
        for(let px=xa;px<=xb;px++) blendPx(buf,(py*w+px)*4,r,g,b,a0*globalAlpha);
      }
    }
  }
  function strokePoly(poly,style,lw){
    const [r,g,b,a0]=parseColor(style);
    const pts=poly.map(([x,y])=>[m.a*x+m.c*y+m.e, m.b*x+m.d*y+m.f]);
    const hw=Math.max(1,Math.round(lw));
    for(let i=0;i+1<pts.length;i++){
      let x1=Math.round(pts[i][0]), y1=Math.round(pts[i][1]);
      const x2=Math.round(pts[i+1][0]), y2=Math.round(pts[i+1][1]);
      const dx=Math.abs(x2-x1), dy=-Math.abs(y2-y1), sx2=x1<x2?1:-1, sy2=y1<y2?1:-1;
      let err=dx+dy, x=x1, y=y1;
      for(;;){
        for(let oy=-hw+1;oy<hw;oy++) for(let ox=-hw+1;ox<hw;ox++){
          const px=x+ox, py=y+oy; if(px<0||py<0||px>=w||py>=h) continue;
          blendPx(buf,(py*w+px)*4,r,g,b,a0*globalAlpha); }
        if(x===x2&&y===y2) break;
        const e2=2*err; if(e2>=dy){ err+=dy; x+=sx2; } if(e2<=dx){ err+=dx; y+=sy2; }
      }
    }
  }
  const ctx={
    get canvas(){ return cv; },
    set fillStyle(v){ fillStyle=v; }, get fillStyle(){ return fillStyle; },
    set strokeStyle(v){ strokeStyle=v; }, get strokeStyle(){ return strokeStyle; },
    set globalAlpha(v){ globalAlpha=v; }, get globalAlpha(){ return globalAlpha; },
    set lineWidth(v){ lineWidth=v; }, get lineWidth(){ return lineWidth; },
    set imageSmoothingEnabled(v){}, get imageSmoothingEnabled(){ return false; },
    save(){ stack.push({fillStyle,strokeStyle,globalAlpha,lineWidth,m}); },
    restore(){ const s=stack.pop(); if(s){ fillStyle=s.fillStyle; strokeStyle=s.strokeStyle;
      globalAlpha=s.globalAlpha; lineWidth=s.lineWidth; m=s.m; } },
    translate(x,y){ m=matMul(m,{a:1,b:0,c:0,d:1,e:x,f:y}); },
    scale(x,y){ m=matMul(m,{a:x,b:0,c:0,d:y,e:0,f:0}); },
    rotate(r){ const c=Math.cos(r),s=Math.sin(r); m=matMul(m,{a:c,b:s,c:-s,d:c,e:0,f:0}); },
    setLineDash(){}, clip(){},
    beginPath(){ path=[]; cur=null; },
    moveTo(x,y){ cur=[[x,y]]; path.push(cur); },
    lineTo(x,y){ if(!cur){ cur=[]; path.push(cur); } cur.push([x,y]); },
    closePath(){ if(cur&&cur.length) cur.push(cur[0]); },
    rect(x,y,w2,h2){ ctx.moveTo(x,y); ctx.lineTo(x+w2,y); ctx.lineTo(x+w2,y+h2); ctx.lineTo(x,y+h2); ctx.closePath(); },
    arc(cx,cy,r,a0,a1){ const n=24, pts=[];
      for(let i=0;i<=n;i++){ const t=a0+(a1-a0)*i/n; pts.push([cx+Math.cos(t)*r,cy+Math.sin(t)*r]); }
      cur=pts; path.push(pts); },
    fill(){ for(const poly of path) fillPoly(poly,fillStyle); },
    stroke(){ for(const poly of path) strokePoly(poly,strokeStyle,lineWidth); },
    fillRect(x,y,w2,h2){
      x=Math.round(x); y=Math.round(y); w2=Math.round(w2); h2=Math.round(h2);
      if(w2<=0||h2<=0) return;
      const isGrad=fillStyle instanceof Grad, solid=isGrad?null:parseColor(fillStyle);
      for(let ly=0;ly<h2;ly++) for(let lx=0;lx<w2;lx++){
        const col=isGrad?fillStyle.sample(x+lx,y+ly):solid;
        putDevice(x+lx,y+ly,col[0],col[1],col[2],col[3]);
      }
    },
    clearRect(x,y,w2,h2){
      x=Math.round(x); y=Math.round(y); w2=Math.round(w2); h2=Math.round(h2);
      for(let ly=0;ly<h2;ly++) for(let lx=0;lx<w2;lx++){
        const dx=m.a*(x+lx+0.5)+m.c*(y+ly+0.5)+m.e, dy=m.b*(x+lx+0.5)+m.d*(y+ly+0.5)+m.f;
        const px=Math.floor(dx), py=Math.floor(dy);
        if(px<0||py<0||px>=w||py>=h) continue;
        const i=(py*w+px)*4; buf[i]=0; buf[i+1]=0; buf[i+2]=0; buf[i+3]=0;
      }
    },
    strokeRect(x,y,w2,h2){ ctx.beginPath(); ctx.rect(x,y,w2,h2); ctx.stroke(); },
    drawImage(img,...a){
      const sw0=img.width, sh0=img.height;
      let sx=0,sy=0,sw=sw0,sh=sh0,dx,dy,dw,dh;
      if(a.length>=8){ [sx,sy,sw,sh,dx,dy,dw,dh]=a; }
      else if(a.length>=4){ [dx,dy,dw,dh]=a; }
      else { [dx,dy]=a; dw=sw; dh=sh; }
      const sbuf=img._buf; if(!sbuf||dw<=0||dh<=0) return;
      const stepX=sw/dw, stepY=sh/dh;
      for(let yy=0;yy<dh;yy++){ const srcY=Math.min(sh0-1,sy+Math.floor(yy*stepY));
        for(let xx=0;xx<dw;xx++){ const srcX=Math.min(sw0-1,sx+Math.floor(xx*stepX));
          const si=(srcY*sw0+srcX)*4, a3=sbuf[si+3]/255;
          if(a3<=0) continue;
          putDevice(dx+xx,dy+yy, sbuf[si],sbuf[si+1],sbuf[si+2], a3);
        }
      }
    },
    createLinearGradient(x0,y0,x1,y1){ return new Grad('linear',[x0,y0,x1,y1]); },
    createRadialGradient(x0,y0,r0,x1,y1,r1){ return new Grad('radial',[x0,y0,r0,x1,y1,r1]); },
    measureText(){ return {width:0}; },
    getImageData(x,y,w2,h2){ const out=new Uint8ClampedArray(Math.max(4,w2*h2*4));
      for(let yy=0;yy<h2;yy++) for(let xx=0;xx<w2;xx++){
        const sx2=x+xx, sy2=y+yy; if(sx2<0||sy2<0||sx2>=w||sy2>=h) continue;
        const si=(sy2*w+sx2)*4, di=(yy*w2+xx)*4;
        out[di]=buf[si]; out[di+1]=buf[si+1]; out[di+2]=buf[si+2]; out[di+3]=buf[si+3]; }
      return {data:out,width:w2,height:h2}; },
  };
  const cv={ style:{}, getContext:()=>ctx,
    getBoundingClientRect:()=>({left:0,top:0,width:w,height:h}),
    addEventListener(){}, removeEventListener(){}, classList:stumm() };
  Object.defineProperty(cv,'width',{ get:()=>w, set(v){ w=Math.max(1,Math.round(v));
    buf=new Uint8ClampedArray(w*h*4); fillStyle='#000'; strokeStyle='#000'; globalAlpha=1; m=matI(); } });
  Object.defineProperty(cv,'height',{ get:()=>h, set(v){ h=Math.max(1,Math.round(v));
    buf=new Uint8ClampedArray(w*h*4); fillStyle='#000'; strokeStyle='#000'; globalAlpha=1; m=matI(); } });
  Object.defineProperty(cv,'_buf',{ get:()=>buf });
  return cv;
}

/* leere Bildzeilen: eine Zeile zaehlt als Inhalt, wenn benachbarte Pixel
   harte Kanten bilden (ein Farbverlauf allein zaehlt nicht - PLAYTEST.md).
   kmax=5 ist gegen die Browser-Referenz von PLAYTEST.md kalibriert (Club 73 %,
   Wohnung 66 %, Afterhour 72 %, Spaeti 77 %, Heimweg 77 %): eine Zeile mit
   nur einer duennen Linie (z.B. einer der "fuenf senkrechten Striche" im
   Club: zwei Kanten) zaehlt dort noch nicht als Inhalt. */
function leereProzent(cv,thresh=24,kmax=5){
  const w=cv.width, h=cv.height, buf=cv._buf;
  let leer=0;
  for(let y=0;y<h;y++){
    let kanten=0, pr=buf[(y*w)*4], pg=buf[(y*w)*4+1], pb=buf[(y*w)*4+2];
    for(let x=1;x<w;x++){
      const i=(y*w+x)*4, r=buf[i], g=buf[i+1], b=buf[i+2];
      if(Math.abs(r-pr)+Math.abs(g-pg)+Math.abs(b-pb)>thresh) kanten++;
      pr=r; pg=g; pb=b;
    }
    if(kanten<=kmax) leer++;
  }
  return leer/h*100;
}
function speicher(){ const m=new Map(); return {
  getItem:k=>m.has(k)?m.get(k):null, setItem:(k,v)=>m.set(k,String(v)),
  removeItem:k=>m.delete(k), clear:()=>m.clear() }; }
function zufall(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }

/* ---- Eine Seite laden --------------------------------------------------- */
function lade(seite,abfrage){
  const h=fs.readFileSync(seite,'utf8');
  const module=[...h.matchAll(/<script src="nacht\/([a-z]+)\.js/g)].map(m=>m[1])
    .filter(n=>n!=='mobil');                       // reine Oberflaeche
  const m=h.match(/<script>([\s\S]*?)<\/script>/);
  if(!m) throw new Error('kein Level-Script');
  const quelle=module.map(n=>fs.readFileSync('nacht/'+n+'.js','utf8')).join('\n')+'\n'+m[1];

  const handler={keydown:[],keyup:[],andere:[]};
  const reg=(art,fn)=>{ (handler[art]||handler.andere).push(fn); };
  const cv=leinwand();
  const doc=new Proxy({},{ get(t,k){
    if(k==='getElementById') return id=>id==='c'?cv:stumm();
    if(k==='createElement') return tag=>tag==='canvas'?leinwand():stumm();
    if(k==='addEventListener') return reg;
    if(k==='documentElement'||k==='body') return stumm();
    if(k==='fullscreenElement'||k==='webkitFullscreenElement') return null;
    if(k==='title') return seite;
    return t[k]!==undefined?t[k]:stumm(); }, set(t,k,v){ t[k]=v; return true; } });
  const win={ addEventListener:reg, removeEventListener(){}, innerWidth:800, innerHeight:450,
    HANDY:null, MOBIL:null };
  const nav={ maxTouchPoints:0, userAgent:'node', wakeLock:undefined };
  const ort={ search:abfrage||'?lektion=0', pathname:'/'+seite, href:'http://localhost/'+seite };
  const zeit={ jetzt:0 };
  const perf={ now:()=>zeit.jetzt };
  const rng=zufall(12345);
  const MathX=Object.create(Math); MathX.random=rng;

  const fn=new Function('document','window','navigator','localStorage','location','screen',
    'performance','requestAnimationFrame','setTimeout','setInterval','clearTimeout','clearInterval',
    'innerWidth','innerHeight','addEventListener','removeEventListener','AudioContext','Math',
    /* with(window): im Browser ist jede window-Eigenschaft ein globaler Name -
       die Engine liest HANDY und MOBIL ohne window. davor. */
    'with(window){\n'+quelle+'\n;return {ev:c=>eval(c)};\n}');
  const api=fn(doc,win,nav,speicher(),ort,{width:800,height:450},perf,()=>0,()=>0,()=>0,()=>0,()=>0,
    800,450,reg,()=>{},undefined,MathX);
  const taste=(code,runter)=>{
    const e={code,key:code,repeat:false,_stop:false,
      preventDefault(){},stopPropagation(){},stopImmediatePropagation(){ this._stop=true; }};
    for(const fnh of handler[runter?'keydown':'keyup']){ fnh(e); if(e._stop) break; }
  };
  return {api,taste,zeit,rng,handler,cv};
}

/* ---- Gespraechsbaeume pruefen ---------------------------------------------- */
function baeume(L,seite){
  const h=fs.readFileSync(seite,'utf8'), m=h.match(/<script>([\s\S]*?)<\/script>/)[1];
  const glyph=new Set(L.api.ev('Object.keys(GLYPH)'));
  const fehler=[]; let zahl=0, knoten=0;
  for(const n of new Set([...m.matchAll(/^const ([A-Z][A-Z_0-9]+)\s*=\s*\{/gm)].map(x=>x[1]))){
    let b; try{ b=L.api.ev(n); }catch(e){ continue; }
    if(!b||typeof b!=='object'||Array.isArray(b)||!('start' in b)) continue;
    /* Ein Baum besteht nur aus Knoten (Objekte mit text/wahl/geh) oder null -
       sonst ist es eine andere Tabelle, die zufaellig 'start' heisst. */
    const knotenOk=v=>v===null||(typeof v==='object'&&!Array.isArray(v)&&('text' in v||'wahl' in v||'geh' in v));
    if(!Object.values(b).every(knotenOk)) continue;
    zahl++;
    const gesehen=new Set(), rand=['start'];
    const pt=(t,wo)=>{ if(typeof t!=='string') return;
      for(const c of t.toUpperCase()) if(!glyph.has(c)) fehler.push(n+'.'+wo+': Zeichen "'+c+'" fehlt in der Schrift'); };
    for(const k of Object.keys(b)){ const o=b[k]; knoten++; if(!o) continue;
      pt(o.text,k); pt(o.wer,k);
      for(const w of o.wahl||[]){ pt(w.txt,k);
        if(w.geh&&!(w.geh in b)&&!w.geh.startsWith('@')) fehler.push(n+'.'+k+': geh "'+w.geh+'" existiert nicht'); }
      if(o.geh&&!(o.geh in b)&&!o.geh.startsWith('@')) fehler.push(n+'.'+k+': geh "'+o.geh+'" existiert nicht'); }
    while(rand.length){ const k=rand.pop(); if(gesehen.has(k)||!(k in b)||!b[k]) continue; gesehen.add(k);
      if(b[k].geh) rand.push(b[k].geh); for(const w of b[k].wahl||[]) if(w.geh) rand.push(w.geh); }
    const tot=Object.keys(b).filter(k=>b[k]&&!gesehen.has(k));
    /* tanzGut/tanzSchlecht/startAbfuhr werden von aussen betreten - das ist gewollt. */
    const fremd=tot.filter(k=>!/^(tanzGut|tanzSchlecht|startAbfuhr)$/.test(k));
    if(fremd.length) fehler.push(n+': unerreichbar ab start: '+fremd.join(', '));
  }
  return {zahl,knoten,fehler};
}

/* ---- Den ersten Kampf von Level 2 gegenpruefen ------------------------------- */
function konterLevel2(){
  const L=lade('level2.html'), E=c=>L.api.ev(c);
  const ergebnis={};
  for(const taktik of ['richtig','dauernd','zu_frueh']){
    E(`S.hp=TUNE.leben; S.modus='kampf'; S.x=400;
       S.gegner={x:330,t:0,zustand:'komm',hp:3,getroffen:0,verpasst:false}; aktionPuffer.length=0;`);
    let i=0, aus=null;
    while(i<60*40&&!aus){
      const g=E('S.gegner');
      if(taktik==='dauernd') E('aktionPuffer.push(S.t)');
      else if(taktik==='zu_frueh'&&g.zustand==='komm') E('aktionPuffer.push(S.t)');
      else if(taktik==='richtig'&&g.zustand==='wind'&&
              g.t>=E('TUNE.gegnerWindup*(1-TUNE.konterFenster)')+0.02) E('aktionPuffer.push(S.t)');
      E('kampf(1/60); S.t+=1/60');
      i++;
      if(E('S.gegner.hp')<=0) aus='gewinnt';
      if(E('S.hp')<=0||E('S.modus')!=='kampf') aus='verliert';
    }
    ergebnis[taktik]=aus||'offen';
  }
  const ok=ergebnis.richtig==='gewinnt'&&ergebnis.dauernd==='verliert'&&ergebnis.zu_frueh==='verliert';
  return {ok,ergebnis};
}

/* ---- Lauf ----------------------------------------------------------------- */
let hart=0;
const zeile=(s,t)=>console.log(s.padEnd(14)+t);
const meld=(s,t)=>{ hart++; console.log(s.padEnd(14)+'FEHLER  '+t); };

for(const seite of SEITEN){
  if(filter.length&&!filter.some(f=>seite.includes(f))) continue;
  let L;
  try{ L=lade(seite); }catch(e){ meld(seite,'Laden: '+String(e.message).split('\n')[0]); continue; }
  const E=c=>L.api.ev(c);
  const hat=n=>E('typeof '+n)==='function';
  if(!hat('update')||!hat('draw')){ zeile(seite,'ohne update/draw - nur geladen'); continue; }
  const bericht=[];

  /* 1) Baeume */
  try{ const b=baeume(L,seite);
    if(b.fehler.length){ b.fehler.slice(0,6).forEach(f=>meld(seite,'Baum: '+f)); }
    if(b.zahl) bericht.push(b.zahl+' Baeume/'+b.knoten+' Knoten');
  }catch(e){ meld(seite,'Baumpruefung: '+e.message); }

  /* 2) Spielen: Titel -> Intro -> 60 s mit zufaelligen Tasten */
  try{
    L.taste('Space',true); L.taste('Space',false);
    for(let i=0;i<4000&&E('S.modus')==='intro';i++){ E('S.szeneT+=99'); E('update(1/60)'); }
    const tasten=['KeyD','KeyD','KeyD','KeyD','KeyD','KeyD','KeyD','KeyD','KeyD','KeyA','KeyE','Space','ShiftLeft','KeyW','KeyS','KeyR','KeyQ'];
    let gedrueckt=null;
    const modi=new Set([E('S.modus')]);
    let leerSumme=0, leerN=0;
    for(let i=0;i<SPIEL_SEK*60;i++){
      if(i%20===0){ if(gedrueckt) L.taste(gedrueckt,false);
        gedrueckt=tasten[Math.floor(L.rng()*tasten.length)]; L.taste(gedrueckt,true); }
      E('update(1/60)');
      if(i%6===0){ E('draw(1/60)'); leerSumme+=leereProzent(L.cv); leerN++; }
      modi.add(E('S.modus'));
      const x=E('S.x'); if(typeof x==='number'&&!isFinite(x)){ meld(seite,'S.x ist '+x+' nach '+(i/60).toFixed(1)+' s'); break; }
    }
    if(gedrueckt) L.taste(gedrueckt,false);
    bericht.push(SPIEL_SEK+' s gespielt, Modi: '+[...modi].join('/'));
    /* Mittelwert ueber den ganzen Lauf - einzelne Bildschirme (Dialoge,
       Ladebilder) sollen den Wert nicht verzerren. Naeherung, kein Browser-Pixel. */
    if(leerN) bericht.push('leere Bildzeilen: '+Math.round(leerSumme/leerN)+' % (Naeherung)');
  }catch(e){
    meld(seite,'Spiellauf: '+String(e.message)+'  ('+String(e.stack).split('\n').slice(1,3).join(' | ').replace(/\s+/g,' ').slice(0,160)+')');
  }

  /* 3) Nichtstun: frische Seite, nach dem Intro nichts druecken */
  try{
    const N=lade(seite), EN=c=>N.api.ev(c);
    N.taste('Space',true); N.taste('Space',false);
    for(let i=0;i<4000&&EN('S.modus')==='intro';i++){ EN('S.szeneT+=99'); EN('update(1/60)'); }
    const ereig=[]; let lm=EN('S.meldung')||'', lmod=EN('S.modus');
    for(let i=0;i<NICHTS_SEK*60;i++){ EN('update(1/60)');
      const me=EN('S.meldung'), mo=EN('S.modus');
      if(mo!==lmod){ ereig.push(Math.round(i/60)+'s '+lmod+'>'+mo); lmod=mo; }
      if(me&&me!==lm&&EN('S.meldungT')>0){ lm=me; ereig.push(Math.round(i/60)+'s '+me); } }
    const letzte=ereig.length?parseInt(ereig[ereig.length-1],10):0;
    bericht.push('Nichtstun '+NICHTS_SEK+' s: '+ereig.length+' Ereignisse, letztes bei '+letzte+' s'
      +(ereig.length&&ereig.length<=6?' ['+ereig.join('; ')+']':''));
  }catch(e){ meld(seite,'Nichtstun-Lauf: '+e.message); }

  /* 4) Lektion: zeichnet sie ohne Fehler, und sind die Pflichtschritte machbar? */
  try{
    const Q=lade(seite,'?lektion=1'), EQ=c=>Q.api.ev(c);
    if(EQ('typeof LEKTIONEN!=="undefined"&&!!LEKTIONEN["'+seite+'"]')){
      Q.taste('Space',true); Q.taste('Space',false);
      EQ('S.modus="intro"');
      if(!EQ('LEHRE.pruefe()')) meld(seite,'Lektion startet nicht im Intro');
      for(let i=0;i<3;i++){ EQ('LEHRE.takt(1/60)'); EQ('LEHRE.zeichne()'); }
      const gr=EQ('LEKTIONEN["'+seite+'"].schritte.map(s=>s.gr.map(g=>g[0]))');
      for(const grp of gr) for(const code of grp){ Q.taste(code,true); Q.taste(code,false); }
      EQ('LEHRE.zeichne()');
      if(!EQ('LEHRE.alleErledigt()')) meld(seite,'Lektion: nicht alle Schritte lassen sich erledigen');
      const mk=EQ('LEHRE.mobilKontext()');
      if(!mk.aktion) meld(seite,'Lektion: kein Handy-Knopf zum Weitermachen');
      Q.taste('Enter',true);
      if(EQ('LEHRE.aktiv')) meld(seite,'Lektion endet nicht mit ENTER');
      bericht.push('Lektion ok ('+gr.length+' Schritte)');
    }
  }catch(e){ meld(seite,'Lektion: '+String(e.message).slice(0,140)); }

  zeile(seite,bericht.join(' | '));
}

/* ---- Konter-Test, nur wenn Level 2 mitlaeuft ------------------------------------ */
if(!filter.length||filter.some(f=>'level2.html'.includes(f))){
  try{ const k=konterLevel2();
    if(k.ok) zeile('Konter L2','richtig gewinnt, Dauerdruecken und zu fruehes Druecken verlieren');
    else meld('Konter L2','erwartet richtig=gewinnt, dauernd=verliert, zu_frueh=verliert - war '+JSON.stringify(k.ergebnis));
  }catch(e){ meld('Konter L2',e.message); }
}

console.log('\n'+(hart?hart+' harte Fehler':'alles gruen')+'  (nicht geprueft: Pixel, Ton, Layout, runner.html)');
process.exit(hart?1:0);
