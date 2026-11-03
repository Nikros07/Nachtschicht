/* n3 - Karte: Beschriftungen der Stationen ueberlappen? Umweg-Kosten insgesamt.
   node docs/gameplay/messung/n3-karte.js */
const path=require('path'); const N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('karte.html','?nach=7');
const r=JSON.parse(L.api.ev(`JSON.stringify(STATIONEN.map(s=>{const t=s.name,w=textW(t);
 const tx=Math.max(2,Math.min(W-w-2,px(s)-w/2));return {n:s.n,x:tx,x2:tx+w,y:py(s)+6,zw:textW(s.zeit)}}))`));
for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++){const a=r[i],b=r[j];
 if(Math.abs(a.y-b.y)<7&&a.x<b.x2&&b.x<a.x2)console.log('Ueberlappung',a.n,b.n);}
console.log(r.map(s=>s.n+':'+s.x+'-'+s.x2+'@'+s.y).join(' '));
console.log('Sonne max', 7*4, 'von Level-8-Zeit; lichtProUmweg=4');
console.log('W,H =',L.api.ev('W+","+H'),' textW(HEIMWEG)=',L.api.ev('textW("HEIMWEG")'));
