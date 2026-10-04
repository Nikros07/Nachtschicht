#!/usr/bin/env node
/* ============================================================================
   NACHTSCHICHT - tools/launchcheck.js
   Statische Startpruefung: ist das, was wir ausliefern wuerden, in Ordnung?

     node tools/launchcheck.js            volle Ausgabe
     node tools/launchcheck.js --leise    nur Probleme und die Zusammenfassung
     node tools/launchcheck.js --git      zusaetzlich: ausgelieferte Dateien, die nicht in Git sind
     node tools/launchcheck.js --wurzel=PFAD   anderen Projektordner pruefen (Tests)

   Exit 0 = bereit (Warnungen sind erlaubt), Exit 1 = mindestens ein harter Fehler.

   Warum es das gibt: auf GitHub Pages (Linux, Unterpfad /Nachtschicht/) gehen
   viele Fehler erst nach dem Hochladen auf, und zwar still: eine falsch
   geschriebene Gross-/Kleinschreibung, ein Pfad mit fuehrendem "/", ein
   Service Worker, der eine Datei vorlaedt, die es nicht gibt (dann schlaegt
   die ganze Installation fehl), oder ein Bild, das .gitignore verschluckt.
   Alles hier laeuft ohne Browser, ohne Netz, ohne Abhaengigkeiten, in
   einer Sekunde.

   Harte Fehler stoppen den Start. Warnungen sind Dinge, die ein Mensch
   ansehen soll, die aber nichts kaputtmachen.

   Fehlende Dateien (sw.js, ueber.html, 404.html ...) sind Fehler, kein
   Absturz - die Pruefung muss auch mitten im Umbau laufen.

   Erlaubte externe Adressen: siehe AUSNAHMEN_HOSTS direkt unten. Alles andere,
   was im Spielcode nach "http" aussieht und nicht in einem Kommentar steht,
   ist ein harter Fehler: das Spiel soll offline laufen und nichts an fremde
   Server schicken.

   Erwartete Form der Versionsnummer (damit sie dreifach verglichen werden kann):
     nacht/geraet.js   VERSION='1.0.0'     (auch GERAET.version='1.0.0' o. ae.)
     sw.js             VERSION='1.0.0'     oder ein Cache-Name wie 'nachtschicht-1.0.0'
     CHANGELOG.md      oberste Ueberschrift  "## 1.0.0 - 2026-10-03"
   Erwartete Form der Vorladeliste in sw.js:  const PRECACHE=[ 'index.html', ... ];

   Ausgabe ist absichtlich nur ASCII (keine Umlaute): so bleibt sie auch in
   alten Windows-Konsolen lesbar. Klassisches Node-Skript, keine Module.
   ========================================================================== */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');

const ARGV=process.argv.slice(2);
if(ARGV.includes('--hilfe')||ARGV.includes('-h')){
  console.log(fs.readFileSync(__filename,'utf8').split('*/')[0].replace(/^\/\*[= ]*\n?/,'')); process.exit(0);
}
const LEISE=ARGV.includes('--leise');
const MIT_GIT=ARGV.includes('--git');
const wurzelArg=ARGV.find(a=>a.startsWith('--wurzel='));
const WURZEL=wurzelArg?path.resolve(wurzelArg.slice(9)):path.resolve(__dirname,'..');

/* ---------------------------------------------------------------------------
   EINSTELLUNGEN - alles, woran man dreht, steht hier oben
   ------------------------------------------------------------------------- */
const EIGENE_ADRESSE='https://nikros07.github.io/Nachtschicht/';  // Live-Adresse (GitHub Pages, Projektseite)
const SPIELSEITEN=['index.html','level2.html','level3.html','level4.html','level5.html',
                   'level6.html','level7.html','level8.html','karte.html'];       // die Nacht: muss offline gehen
const SEITEN_ERWARTET=SPIELSEITEN.concat(['runner.html','ueber.html','404.html']);
const DATEIEN_ERWARTET=['manifest.webmanifest','sw.js','nacht/stil.css'];           // fehlt eine: harter Fehler
const DATEIEN_GEWUENSCHT=['robots.txt'];                                            // fehlt eine: Warnung
const SEITE_MAX_BYTES=3*1024*1024;                                                  // je HTML-Seite
const MANIFEST_ANZEIGE=['fullscreen','standalone','minimal-ui','browser'];

/* Externe Adressen, die im Projekt vorkommen duerfen. orte:
     'a'     Link (<a href>, window.open) - der Spieler klickt, es wird nichts geladen
     'meta'  <meta og:...>, <link rel=canonical> - nur Beschriftung fuer Link-Vorschauen
     'js'    Zeichenkette im Skript; faellt aber durch, wenn dieselbe Zeile etwas LAEDT
             (fetch, XMLHttpRequest, new Image, .src= ...)
     'html' / 'css'   als Namensraum-Kennung, wird nie geladen */
const AUSNAHMEN_HOSTS=[
  { host:'www.w3.org',         orte:['js','html','css'],   grund:'XML-Namensraum (xmlns / createElementNS) - eine Kennung, wird nie geladen' },
  { host:'github.com',         orte:['a','js'],            grund:'Verweis auf Quellcode und Fehlermeldungen (Link, kein Ladeziel)' },
  { host:'docs.github.com',    orte:['a'],                 grund:'Link zur GitHub-Datenschutzerklaerung in ueber.html (wird nur beim Anklicken geladen)' },
  { host:'nikros07.github.io', orte:['a','meta','js'],     grund:'die eigene Live-Adresse (og:url, og:image, canonical, Teilen-Link)' },
];
/* Seiten, in denen ein absoluter Pfad Absicht ist: 404.html wird unter beliebig tiefen Adressen
   ausgeliefert, ihr Ersatzpfad "/Nachtschicht/" gilt nur ohne Skript (das Skript setzt das richtige Ziel). */
const ABSOLUT_ERLAUBT=['404.html'];
/* Kopfzeilen, die in einer Seite fehlen duerfen (nur als Hinweis): die 404-Seite steht bewusst
   fuer sich, weil relative Verweise auf Symbole unter einer tiefen Adresse ins Leere laufen. */
const KOPF_LOCKER={ '404.html':['link rel=manifest','link rel=icon','link rel=apple-touch-icon'] };
const LADE_ZEILE=/\b(?:fetch|sendBeacon|importScripts|import)\s*\(|XMLHttpRequest|WebSocket|EventSource|new\s+Image\b|\.src\s*=/;

/* ---------------------------------------------------------------------------
   AUSGABE
   ------------------------------------------------------------------------- */
let harte=0, warnungen=0, hinweise=0;
const harteListe=[];
let kopfText='', kopfGedruckt=true;
function zeigeKopf(){ if(!kopfGedruckt){ console.log('\n== '+kopfText+' =='); kopfGedruckt=true; } }
function kopf(t){ kopfText=t; kopfGedruckt=false; if(!LEISE) zeigeKopf(); }
function ok(t){ if(!LEISE){ zeigeKopf(); console.log('  ok        '+t); } }
function hinweis(t){ hinweise++; if(!LEISE){ zeigeKopf(); console.log('  hinweis   '+t); } }
function fehler(t){ harte++; harteListe.push(t); zeigeKopf(); console.log('  FEHLER    '+t); }
function warn(t){ warnungen++; zeigeKopf(); console.log('  WARNUNG   '+t); }
const kurz=(s,n)=>{ s=String(s); n=n||80; return s.length>n?s.slice(0,n-3)+'...':s; };
const kb=b=>(b/1024).toFixed(1)+' KB';

/* ---------------------------------------------------------------------------
   DATEIEN
   ------------------------------------------------------------------------- */
const abs=rel=>path.join(WURZEL,rel);
const verzCache=new Map(), textCache=new Map();
function eintraege(relDir){
  if(verzCache.has(relDir)) return verzCache.get(relDir);
  let r=null; try{ r=fs.readdirSync(abs(relDir),{withFileTypes:true}); }catch(e){}
  verzCache.set(relDir,r); return r;
}
/* Gross-/Kleinschreibung wie auf Linux: Windows und macOS finden "Icons/x.png",
   GitHub Pages nicht. Darum Ordner fuer Ordner mit exakten Namen vergleichen. */
function pfadStatus(rel){
  const teile=rel.split('/').filter(s=>s&&s!=='.'); const gut=[];
  for(let i=0;i<teile.length;i++){
    const e=eintraege(gut.join('/')||'.');
    if(!e) return {s:'fehlt'};
    if(e.some(x=>x.name===teile[i])){ gut.push(teile[i]); continue; }
    const g=e.find(x=>x.name.toLowerCase()===teile[i].toLowerCase());
    return g?{s:'gross',echt:gut.concat([g.name],teile.slice(i+1)).join('/')}:{s:'fehlt'};
  }
  return {s:'ok'};
}
function lies(rel){
  if(textCache.has(rel)) return textCache.get(rel);
  let t=null; try{ t=fs.readFileSync(abs(rel),'utf8'); if(t.charCodeAt(0)===0xFEFF) t=t.slice(1); }catch(e){}
  textCache.set(rel,t); return t;
}
const groesse=rel=>{ try{ return fs.statSync(abs(rel)).size; }catch(e){ return 0; } };
function dateienIn(relDir,filter){
  const e=eintraege(relDir); if(!e) return [];
  return e.filter(x=>x.isFile()&&(!filter||filter(x.name))).map(x=>(relDir==='.'?'':relDir+'/')+x.name).sort();
}
/* Was wir ausliefern - dieselbe Regel wie tools/paket.py (dort mitaendern). */
function auszuliefern(){
  let l=dateienIn('.',n=>n.endsWith('.html'));
  l=l.concat(dateienIn('nacht',n=>n.endsWith('.js')));
  if(pfadStatus('nacht/stil.css').s==='ok') l.push('nacht/stil.css');
  l=l.concat(dateienIn('icons'));
  for(const f of ['manifest.webmanifest','sw.js','robots.txt']) if(pfadStatus(f).s==='ok') l.push(f);
  return l;
}

/* ---------------------------------------------------------------------------
   TEXT-WERKZEUGE
   ------------------------------------------------------------------------- */
/* Bereiche durch Leerzeichen ersetzen, aber Laenge und Zeilenumbrueche behalten:
   so stimmen Zeilennummern und Positionen weiter. */
const maskiere=(s,re)=>s.replace(re,m=>m.replace(/[^\n]/g,' '));
function zeilenAb(text){
  const st=[0]; for(let i=0;i<text.length;i++) if(text.charCodeAt(i)===10) st.push(i+1);
  return off=>{ let lo=0,hi=st.length-1; while(lo<hi){ const m=(lo+hi+1)>>1; if(st[m]<=off) lo=m; else hi=m-1; } return lo+1; };
}
function attribute(s){
  const o={}, re=/([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g; let m;
  while((m=re.exec(s))) o[m[1].toLowerCase()]=m[2]!==undefined?m[2]:m[3]!==undefined?m[3]:m[4]!==undefined?m[4]:'';
  return o;
}
function zerlegeHtml(html){
  let markup=maskiere(html,/<!--[\s\S]*?-->/g);
  const scripte=[], stile=[];
  markup=markup.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,(all,a,b,off)=>{
    const k=7+a.length+1; scripte.push({attrs:attribute(a),body:b,offset:off+k});
    return all.slice(0,k)+b.replace(/[^\n]/g,' ')+all.slice(k+b.length); });
  markup=markup.replace(/<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi,(all,a,b,off)=>{
    const k=6+a.length+1; stile.push({body:b,offset:off+k});
    return all.slice(0,k)+b.replace(/[^\n]/g,' ')+all.slice(k+b.length); });
  const tags=[], re=/<([a-zA-Z][\w:-]*)([^>]*)>/g; let m;
  while((m=re.exec(markup))) tags.push({name:m[1].toLowerCase(),attrs:attribute(m[2]),index:m.index});
  const sichtbar=maskiere(markup,/<[^>]*>/g);
  return {markup,scripte,stile,tags,sichtbar};
}

/* Zerlegt JavaScript in Code, Zeichenketten und Kommentare. Noetig, weil
   "http://..." im Kommentar harmlos ist und in einer Zeichenkette nicht.
   Kein vollstaendiger Parser: Regex-Literale werden an dem erkannt, was davor
   steht (Name oder ")" davor = Division). Fuer unseren Code reicht das; im
   Zweifel meldet das Werkzeug eine Zeile, die ein Mensch ansieht. */
const REGEX_VORHER=/^(?:return|typeof|case|in|of|delete|void|throw|new|else|do|instanceof|yield|await)$/;
function zerlegeJs(q){
  const out=[], n=q.length; let i=0, codeVon=0;
  const gib=(art,von,bis,quote)=>{ if(bis>von) out.push({art,von,bis,s:q.slice(von,bis),q:quote}); };
  function ueberspringeText(start,quote){
    let j=start;
    while(j<n){
      const c=q[j];
      if(c==='\\'){ j+=2; continue; }
      if(c===quote) return j+1;
      if(quote!=='`'&&c==='\n') return j;
      if(quote==='`'&&c==='$'&&q[j+1]==='{'){ j=ueberspringeAusdruck(j+2); continue; }
      j++;
    }
    return n;
  }
  function ueberspringeAusdruck(start){
    let tiefe=1, j=start;
    while(j<n&&tiefe>0){
      const c=q[j];
      if(c==='{') tiefe++;
      else if(c==='}') tiefe--;
      else if(c==="'"||c==='"'||c==='`'){ j=ueberspringeText(j+1,c); continue; }
      j++;
    }
    return j;
  }
  while(i<n){
    const c=q[i], d=q[i+1];
    if(c==='/'&&d==='/'){ gib('code',codeVon,i); let j=q.indexOf('\n',i); if(j<0) j=n; gib('komm',i,j); i=codeVon=j; continue; }
    if(c==='/'&&d==='*'){ gib('code',codeVon,i); let j=q.indexOf('*/',i+2); j=j<0?n:j+2; gib('komm',i,j); i=codeVon=j; continue; }
    if(c==="'"||c==='"'||c==='`'){ gib('code',codeVon,i); const j=ueberspringeText(i+1,c); gib('text',i,j,c); i=codeVon=j; continue; }
    if(c==='/'){
      let k=i-1; while(k>=0&&/\s/.test(q[k])) k--;
      const vz=k>=0?q[k]:''; let wort='';
      if(/[A-Za-z_$]/.test(vz)){ let s=k; while(s>0&&/[\w$]/.test(q[s-1])) s--; wort=q.slice(s,k+1); }
      const division=/[\w$)\]]/.test(vz)&&!REGEX_VORHER.test(wort);
      if(!division){
        let j=i+1, klasse=false;
        while(j<n&&q[j]!=='\n'){
          const e=q[j];
          if(e==='\\'){ j+=2; continue; }
          if(e==='[') klasse=true; else if(e===']') klasse=false; else if(e==='/'&&!klasse) break;
          j++;
        }
        if(j<n&&q[j]==='/'){ j++; while(j<n&&/[a-z]/i.test(q[j])) j++; i=j; continue; }
      }
    }
    i++;
  }
  gib('code',codeVon,n);
  return out;
}
const ohneKommentare=(q,tokens)=>(tokens||zerlegeJs(q)).map(t=>t.art==='komm'?t.s.replace(/[^\n]/g,' '):t.s).join('');
const textInhalt=t=>t.s.slice(1,t.s.length>1&&t.s.endsWith(t.q)?-1:undefined);

/* Verweise einordnen: lokal, extern, absolut ("/x" bricht unter /Nachtschicht/) ... */
function klassifiziere(wert,basisDir){
  const w=String(wert||'').trim();
  if(!w) return {art:'leer'};
  if(w[0]==='#') return {art:'anker',hash:w.slice(1)};
  if(/^(?:https?:)?\/\//i.test(w)||/^wss?:\/\//i.test(w)) return {art:'extern',url:w.startsWith('//')?'https:'+w:w};
  const sch=/^([a-z][a-z0-9+.-]*):/i.exec(w);
  if(sch) return {art:'sonder',schema:sch[1].toLowerCase()};
  if(w[0]==='/') return {art:'absolut'};
  const m=/^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(w);
  let p=m[1]; try{ p=decodeURIComponent(p); }catch(e){}
  p=path.posix.normalize(path.posix.join(basisDir||'.',p||'.'));
  if(p==='.'||p.endsWith('/')) p=(p==='.'?'':p)+'index.html';
  if(p.startsWith('..')) return {art:'draussen'};
  return {art:'lokal',pfad:p,query:m[2]||'',hash:(m[3]||'').slice(1)};
}

/* ---------------------------------------------------------------------------
   SAMMLER - die Pruefungen fuellen sie, spaeter wird abschnittsweise gemeldet
   ------------------------------------------------------------------------- */
const refs=new Map();         // lokale Datei -> {stellen:[], schwere:'fehler'|'warn'}
const externFunde=[];         // {url,ort,stelle,zeile}
const quellen=[];             // pruefbare Texte (Skript, Stil, sichtbarer Seitentext)
const seiten=new Map();       // Seitenname -> Infos
const ankerFunde=[];          // Verweise mit #id
const scriptVs=[];            // {seite,datei,v}
const cssVs=[];
const geladenGesamt=new Map();// lokale Datei -> {art, seiten:Set}   (was Seiten wirklich LADEN)
const absolutFunde=[];       // Stellen mit "/pfad" (bricht unter /Nachtschicht/)
function ref(pfad,stelle,schwere){
  let r=refs.get(pfad); if(!r){ r={stellen:[],schwere:'warn'}; refs.set(pfad,r); }
  if(r.stellen.length<50) r.stellen.push(stelle);
  if((schwere||'fehler')==='fehler') r.schwere='fehler';
}
function merkeGeladen(pfad,art,seite){
  let g=geladenGesamt.get(pfad); if(!g){ g={art,seiten:new Set()}; geladenGesamt.set(pfad,g); }
  g.seiten.add(seite);
}
function addQuelle(label,art,text,zeile0){
  const q={label,art,text,zeile0:zeile0||1,zl:null};
  if(art==='js') q.tokens=zerlegeJs(text);
  quellen.push(q); return q;
}
const stelleIn=(q,off)=>{ q.zl=q.zl||zeilenAb(q.text); return q.label+':'+(q.zeile0-1+q.zl(off)); };

/* ---------------------------------------------------------------------------
   1. ERWARTETE DATEIEN
   ------------------------------------------------------------------------- */
function pruefeErwartet(){
  kopf('Erwartete Dateien');
  let gut=0;
  for(const f of SEITEN_ERWARTET.concat(DATEIEN_ERWARTET)){
    const s=pfadStatus(f);
    if(s.s==='ok') gut++;
    else if(s.s==='gross') fehler(f+': Gross-/Kleinschreibung - die Datei heisst '+s.echt);
    else fehler(f+': fehlt');
  }
  for(const f of DATEIEN_GEWUENSCHT){
    if(pfadStatus(f).s==='ok') gut++; else warn(f+': fehlt (Suchmaschinen-Hinweis, kein Pflicht)');
  }
  if(pfadStatus('CHANGELOG.md').s!=='ok') fehler('CHANGELOG.md: fehlt');
  if(pfadStatus('nacht/geraet.js').s!=='ok') fehler('nacht/geraet.js: fehlt');
  if(!harteListe.length) ok(gut+' erwartete Dateien vorhanden');
  if(['LICENSE','LICENSE.md','LICENSE.txt','COPYING'].every(f=>pfadStatus(f).s!=='ok'))
    hinweis('keine Lizenzdatei - fuer den Quellcode ist noch keine Lizenz gewaehlt (Entscheidung steht in LAUNCH.md)');
}

/* ---------------------------------------------------------------------------
   2. SEITEN: Kopfzeilen und alles, was sie laden oder verlinken
   ------------------------------------------------------------------------- */
const KEIN_LADEN_REL=['canonical','alternate','author','license','help','next','prev','me','search','bookmark'];
const LADE_ATTR={script:['src'],img:['src','srcset'],source:['src','srcset'],audio:['src'],video:['src','poster'],
                 iframe:['src'],embed:['src'],object:['data'],input:['src'],track:['src'],frame:['src']};
function ladeVerweis(wert,art,stelle,seite,query){
  const k=klassifiziere(wert);
  if(k.art==='extern') externFunde.push({url:k.url,ort:'laden',stelle});
  else if(k.art==='absolut') absolutFunde.push(stelle+': '+kurz(wert,50));
  else if(k.art==='draussen') fehler(stelle+': '+wert+' liegt ausserhalb des Projektordners');
  else if(k.art==='lokal'){
    ref(k.pfad,stelle); merkeGeladen(k.pfad,art,seite);
    if(art==='script'&&/^nacht\//.test(k.pfad)){
      const m=/^\?v=(.*)$/.exec(k.query);
      scriptVs.push({seite,datei:k.pfad,v:m?m[1]:null,stelle});
    }
    if(art==='css'){ const m=/^\?v=(.*)$/.exec(k.query); cssVs.push({seite,datei:k.pfad,v:m?m[1]:null}); }
  }
}
function pruefeSeite(name,zaehler){
  const html=lies(name);
  if(html===null) return;            // fehlt: schon unter "Erwartete Dateien" gemeldet
  const z=zerlegeHtml(html), zl=zeilenAb(html);
  const info={name,html,ids:new Set(),thema:null};
  seiten.set(name,info);
  const finde=(n,f)=>z.tags.find(t=>t.name===n&&(!f||f(t.attrs)));
  const rel=a=>(a.rel||'').toLowerCase().split(/\s+/).filter(Boolean);
  const meta=n=>finde('meta',a=>(a.name||'').toLowerCase()===n&&String(a.content||'').trim());
  const luecken=[];
  const h=finde('html');
  if(!h||!/^de(?:-|$)/i.test(h.attrs.lang||'')) luecken.push('<html lang="de">');
  if(!finde('meta',a=>(a.name||'').toLowerCase()==='viewport'&&a.content)) luecken.push('meta viewport');
  const tm=/<title[^>]*>([\s\S]*?)<\/title>/i.exec(z.markup);
  if(!tm||!tm[1].trim()) luecken.push('<title>');
  if(!meta('description')) luecken.push('meta description');
  const th=meta('theme-color'); if(!th) luecken.push('meta theme-color'); else info.thema=th.attrs.content.trim().toLowerCase();
  if(!finde('link',a=>rel(a).includes('manifest')&&a.href)) luecken.push('link rel=manifest');
  if(!finde('link',a=>rel(a).includes('icon')&&a.href)) luecken.push('link rel=icon');
  if(!finde('link',a=>rel(a).includes('apple-touch-icon')&&a.href)) luecken.push('link rel=apple-touch-icon');
  const locker=(KOPF_LOCKER[name]||[]).filter(l=>luecken.includes(l));
  if(locker.length) hinweis(name+': '+locker.join(', ')+' fehlt - Absicht (die Seite steht bewusst fuer sich)');
  const hart=luecken.filter(l=>!locker.includes(l));
  if(hart.length) fehler(name+': Kopfzeile fehlt: '+hart.join(', ')); else zaehler.gut++;
  const m=finde('link',a=>rel(a).includes('manifest')&&a.href);
  if(m&&m.attrs.href.replace(/[?#].*$/,'').replace(/^\.\//,'')!=='manifest.webmanifest')
    warn(name+': rel=manifest zeigt auf '+m.attrs.href+' (erwartet manifest.webmanifest)');

  for(const t of z.tags){
    const a=t.attrs, stelle=name+':'+zl(t.index);
    if(a.id) info.ids.add(a.id);
    if(t.name==='a'&&a.name) info.ids.add(a.name);
    if(t.name==='link'&&a.href!==undefined){
      const r=rel(a);
      if(r.some(x=>KEIN_LADEN_REL.includes(x))){
        if(r.includes('canonical')) metaAdresse(a.href,'canonical',stelle,name);
        else{ const k=klassifiziere(a.href); if(k.art==='extern') externFunde.push({url:k.url,ort:'meta',stelle}); }
      }else{
        const art=r.includes('stylesheet')?'css':(r.includes('manifest')?'manifest':(r.some(x=>x.includes('icon'))?'icon':'sonst'));
        ladeVerweis(a.href,art,stelle,name);
      }
    }else if(t.name==='meta'&&a.content!==undefined){
      const eig=(a.property||a.name||'').toLowerCase();
      if(/^(?:og:(?:url|image(?::url|:secure_url)?|video|audio)|twitter:image(?::src)?)$/.test(eig)) metaAdresse(a.content,eig,stelle,name);
      if(eig==='og:image'||eig==='og:title'||eig==='og:description'||eig==='og:url') (info.og=info.og||new Set()).add(eig);
    }else if(t.name==='a'&&a.href!==undefined){
      const k=klassifiziere(a.href);
      if(k.art==='extern') externFunde.push({url:k.url,ort:'a',stelle});
      else if(k.art==='absolut') absolutFunde.push(stelle+': '+kurz(a.href,50));
      else if(k.art==='anker') ankerFunde.push({von:name,stelle,ziel:name,id:k.hash});
      else if(k.art==='lokal'){
        ref(k.pfad,stelle); (info.verweist=info.verweist||new Set()).add(k.pfad);
        if(k.hash) ankerFunde.push({von:name,stelle,ziel:k.pfad,id:k.hash});
      }else if(k.art==='sonder'&&!/^(?:mailto|tel|sms|data)$/.test(k.schema))
        warn(stelle+': Verweis mit ungewoehnlichem Schema '+k.schema+':');
    }else if(LADE_ATTR[t.name]){
      for(const at of LADE_ATTR[t.name]){
        if(a[at]===undefined) continue;
        const teile=at==='srcset'?a[at].split(',').map(s=>s.trim().split(/\s+/)[0]):[a[at]];
        for(const w of teile) ladeVerweis(w,t.name==='img'?'bild':(t.name==='script'?'script':'medium'),stelle,name);
      }
    }
    if(t.name==='form'&&a.action) ladeVerweis(a.action,'sonst',stelle,name);
    if(t.name==='img'&&a.alt===undefined) warn(stelle+': <img> ohne alt-Text');
  }
  /* inline-Skripte und -Stile; Skripte mit src zaehlen schon oben als geladen */
  for(const s of z.scripte) if(s.attrs.src===undefined&&s.body.trim()) addQuelle(name+' <script>','js',s.body,zl(s.offset));
  for(const s of z.stile) if(s.body.trim()) addQuelle(name+' <style>','css',s.body,zl(s.offset));
  addQuelle(name,'html',z.sichtbar,1);
}
/* og:image & Co.: eigene Adresse -> die Datei muss es lokal geben */
function metaAdresse(wert,eig,stelle,seite){
  const k=klassifiziere(wert);
  if(k.art==='extern'){
    if(wert.startsWith(EIGENE_ADRESSE)||wert===EIGENE_ADRESSE.replace(/\/$/,'')){
      if(/image|video|audio/.test(eig)){
        let rest=wert.slice(EIGENE_ADRESSE.length).replace(/[?#].*$/,'');
        if(!rest||rest.endsWith('/')) rest+='index.html';
        ref(rest,stelle+' ('+eig+')');
      }
    }else externFunde.push({url:k.url,ort:'meta',stelle});
  }else if(/image|video|audio/.test(eig)&&k.art!=='sonder')
    warn(stelle+': '+eig+' ist keine absolute Adresse - Link-Vorschauen brauchen https://...');
}

function pruefeAnker(){
  for(const a of ankerFunde){
    const z=seiten.get(a.ziel);
    if(!z||!a.id) continue;             // Zielseite fehlt: schon Verweisfehler
    if(!z.ids.has(a.id)) warn(a.stelle+': Anker #'+a.id+' gibt es in '+a.ziel+' nicht');
  }
}

/* ---------------------------------------------------------------------------
   3. SKRIPTE UND STILE: Fremdadressen, Dateiverweise, Reste
   ------------------------------------------------------------------------- */
function sammleSkripte(){
  const dateien=new Set();
  for(const [pfad,g] of geladenGesamt) if(g.art==='script'||g.art==='css') dateien.add(pfad);
  for(const f of dateienIn('nacht',n=>n.endsWith('.js')||n.endsWith('.css'))) dateien.add(f);
  if(pfadStatus('sw.js').s==='ok') dateien.add('sw.js');
  for(const f of dateien){
    const t=lies(f); if(t===null) continue;
    addQuelle(f,f.endsWith('.css')?'css':'js',t,1);
  }
}
const DATEI_ENDUNG=/^[\w\-\/.]+\.(html|png|jpe?g|gif|svg|webp|ico|mp3|ogg|wav|m4a|json|webmanifest|css|js|woff2?|ttf)(?:[?#][^'"`\s]*)?$/i;
function scanneQuellen(){
  for(const q of quellen){
    if(q.art==='js'){
      for(const t of q.tokens){
        if(t.art==='komm') continue;
        const zeilenAnfang=q.text.lastIndexOf('\n',t.von)+1;
        const zeilenEnde=(()=>{ const e=q.text.indexOf('\n',t.bis); return e<0?q.text.length:e; })();
        const zeile=q.text.slice(zeilenAnfang,zeilenEnde);
        const re=/(?:https?|wss?):\/\/([^\s\/'"`?#:\\)]+)[^\s'"`)\\]*/gi; let m;
        while((m=re.exec(t.s))) externFunde.push({url:m[0],ort:'js',stelle:stelleIn(q,t.von+m.index),zeile});
        if(t.art==='text'){
          const inh=textInhalt(t);
          if(/^\/\/[^\s\/'"`?#:\\]+\.[^\s\/'"`?#:\\]+/.test(inh))
            externFunde.push({url:'https:'+inh,ort:'js',stelle:stelleIn(q,t.von),zeile});
          if(DATEI_ENDUNG.test(inh)&&!/^(?:https?:)?\/\//i.test(inh)){
            const k=klassifiziere(inh);
            const st=stelleIn(q,t.von);
            if(k.art==='absolut') absolutFunde.push(st+': '+kurz(inh,50));
            else if(k.art==='lokal')
              ref(k.pfad,st,/\.html$/i.test(k.pfad)?'fehler':'warn');
          }
        }
      }
    }else if(q.art==='css'){
      const roh=maskiere(q.text,/\/\*[\s\S]*?\*\//g);
      const basis=/^[\w\-]+\//.test(q.label)&&!/\s/.test(q.label)?path.posix.dirname(q.label):'';
      const re=/url\(\s*(['"]?)([^)'"]*)\1\s*\)|@import\s+(['"])([^'"]+)\3/gi; let m;
      const zl=zeilenAb(q.text);
      while((m=re.exec(roh))){
        const w=m[2]!==undefined&&m[2]!==''?m[2]:m[4]; if(!w) continue;
        const st=q.label+':'+(q.zeile0-1+zl(m.index));
        const k=klassifiziere(w,basis);
        if(k.art==='extern') externFunde.push({url:k.url,ort:'css',stelle:st});
        else if(k.art==='absolut') absolutFunde.push(st+': '+kurz(w,50));
        else if(k.art==='lokal') ref(k.pfad,st);
      }
    }
  }
}

function pruefeExterne(){
  kopf('Externe Adressen');
  const gezaehlt=new Map(); let boes=0;
  const gesehen=new Set();
  for(const f of externFunde){
    let host=''; try{ host=new URL(f.url).hostname.toLowerCase(); }catch(e){ fehler(f.stelle+': ungueltige Adresse '+kurz(f.url)); boes++; continue; }
    const a=AUSNAHMEN_HOSTS.find(x=>x.host===host);
    const laedt=f.ort==='js'&&f.zeile&&LADE_ZEILE.test(f.zeile);
    if(a&&a.orte.includes(f.ort)&&!laedt){ gezaehlt.set(host,(gezaehlt.get(host)||0)+1); continue; }
    const schluessel=f.stelle+'|'+f.url; if(gesehen.has(schluessel)) continue; gesehen.add(schluessel);
    const txt=f.stelle+': '+kurz(f.url)+(a?' (Host ist erlaubt, aber '+(laedt?'nicht in einem Ladeaufruf':'nicht an dieser Stelle')+')':'');
    if(f.ort==='a'||f.ort==='meta') warn(txt+' - Absicht? Sonst in AUSNAHMEN_HOSTS eintragen');
    else{ fehler(txt+' - das Spiel darf nichts von fremden Servern laden'); }
    boes++;
  }
  if(!boes) ok('keine fremden Server im Spielcode');
  const liste=AUSNAHMEN_HOSTS.map(a=>a.host+' ('+(gezaehlt.get(a.host)||0)+'x, '+a.orte.join('/')+')').join('; ');
  hinweis('erlaubte Ausnahmen: '+liste);
  for(const a of AUSNAHMEN_HOSTS) hinweis('  '+a.host+' - '+a.grund);
  for(const s of absolutFunde){
    if(ABSOLUT_ERLAUBT.some(f=>s.startsWith(f+':'))) hinweis(s+' - absoluter Ersatzpfad, hier Absicht (nur ohne Skript)');
    else fehler(s+' - absoluter Pfad bricht unter /Nachtschicht/ (Projektseite): ohne fuehrenden "/" schreiben');
  }
}

function pruefeRefs(){
  kopf('Verweise auf lokale Dateien');
  const vorher=harte;
  for(const [pfad,r] of refs){
    const s=pfadStatus(pfad); if(s.s==='ok') continue;
    const wo=r.stellen.slice(0,3).join(', ')+(r.stellen.length>3?' (+'+(r.stellen.length-3)+' weitere)':'');
    if(s.s==='gross') fehler(pfad+': Gross-/Kleinschreibung stimmt nicht, die Datei heisst '+s.echt+' (Windows merkt es nicht, GitHub Pages liefert 404) - von '+wo);
    else (r.schwere==='fehler'?fehler:warn)(pfad+': Datei fehlt - verwiesen von '+wo);
  }
  if(harte===vorher) ok(refs.size+' verschiedene lokale Dateien, alle vorhanden');
}

/* Platzhalter und Debug-Reste */
function pruefeReste(){
  kopf('Reste und Platzhalter');
  const vorher=harte+warnungen;
  const NAME_PLATZ=/\[[A-ZÄÖÜ][A-ZÄÖÜ0-9 _.\/@-]{1,40}\]/g;
  for(const q of quellen){
    if(q.art==='html'){
      const sicht=q.text; const re=/\b(?:TODO|FIXME|XXX|TBD)\b|PLATZHALTER|LOREM IPSUM/gi; let m;
      const zl=zeilenAb(sicht);
      while((m=re.exec(sicht))){
        if(/^(?:todo|fixme|xxx|tbd)$/i.test(m[0])&&m[0]!==m[0].toUpperCase()) continue;
        warn(q.label+':'+zl(m.index)+': "'+m[0]+'" im sichtbaren Text');
      }
      while((m=NAME_PLATZ.exec(sicht))){
        warn(q.label+':'+zl(m.index)+': Platzhalter '+m[0]+' im Text'+(q.label==='ueber.html'?' - vor dem Launch ausfuellen':' - noch ausfuellen?'));
      }
    }else if(q.art==='js'){
      for(const t of q.tokens){
        if(t.art==='text'){
          const re=/\b(?:TODO|FIXME|XXX|TBD)\b|PLATZHALTER|LOREM IPSUM/g; const inh=textInhalt(t); let m;
          while((m=re.exec(inh))) warn(stelleIn(q,t.von+1+m.index)+': "'+m[0]+'" in einem Spieltext');
        }else if(t.art==='code'){
          const re=/\bconsole\s*\.\s*(?:log|debug|info|trace|table|dir)\s*\(|\bdebugger\b/g; let m;
          while((m=re.exec(t.s))) warn(stelleIn(q,t.von+m.index)+': Debug-Rest '+m[0].replace(/\s+/g,'')+(m[0].startsWith('c')?')':''));
        }
      }
    }
  }
  if(harte+warnungen===vorher) ok('keine TODO/FIXME/PLATZHALTER/console.log-Reste');
}

/* ---------------------------------------------------------------------------
   4. MANIFEST UND SYMBOLE
   ------------------------------------------------------------------------- */
function pngGroesse(rel){
  try{
    const fd=fs.openSync(abs(rel),'r'); const b=Buffer.alloc(24); const n=fs.readSync(fd,b,0,24,0); fs.closeSync(fd);
    if(n<24||b.toString('latin1',1,4)!=='PNG') return null;
    return {b:b.readUInt32BE(16),h:b.readUInt32BE(20)};
  }catch(e){ return null; }
}
let manifest=null;
function pruefeManifest(){
  kopf('Manifest und Symbole');
  const roh=lies('manifest.webmanifest');
  if(roh===null) return;                 // fehlt: schon gemeldet
  try{ manifest=JSON.parse(roh); }catch(e){ fehler('manifest.webmanifest: kein gueltiges JSON ('+e.message+')'); return; }
  const vorher=harte;
  for(const f of ['name','short_name','start_url','display','background_color','theme_color'])
    if(!manifest[f]||typeof manifest[f]!=='string') fehler('manifest.webmanifest: Pflichtfeld "'+f+'" fehlt');
  if(manifest.display&&!MANIFEST_ANZEIGE.includes(manifest.display)) fehler('manifest.webmanifest: display "'+manifest.display+'" ist kein gueltiger Wert');
  if(!manifest.scope) warn('manifest.webmanifest: scope fehlt');
  if(!manifest.id) warn('manifest.webmanifest: id fehlt (die App-Kennung haengt sonst an start_url)');
  if(manifest.short_name&&manifest.short_name.length>12) warn('manifest.webmanifest: short_name hat '+manifest.short_name.length+' Zeichen - unter dem Symbol werden etwa 12 angezeigt');
  if(manifest.start_url){
    const k=klassifiziere(manifest.start_url);
    if(k.art==='lokal') ref(k.pfad,'manifest.webmanifest start_url');
    else if(k.art!=='extern') fehler('manifest.webmanifest: start_url "'+manifest.start_url+'" ist keine lokale Seite (relativ schreiben, z. B. ./index.html)');
    else fehler('manifest.webmanifest: start_url zeigt auf eine feste Adresse - relativ lassen, sonst bricht ein Domainwechsel die App');
  }
  const icons=Array.isArray(manifest.icons)?manifest.icons:null;
  if(!icons||!icons.length){ fehler('manifest.webmanifest: icons fehlt oder ist leer'); return; }
  let hat192=false, hat512=false, maskable=false;
  icons.forEach((ic,i)=>{
    const st='manifest.webmanifest icons['+i+']';
    if(!ic.src){ fehler(st+': src fehlt'); return; }
    const k=klassifiziere(ic.src);
    if(k.art!=='lokal'){ fehler(st+': '+ic.src+' ist keine lokale Datei (relativ schreiben)'); return; }
    ref(k.pfad,st); merkeGeladen(k.pfad,'icon','manifest');
    if(pfadStatus(k.pfad).s!=='ok') return;       // fehlt: Verweisabschnitt meldet
    const purpose=(ic.purpose||'any').split(/\s+/);
    if(purpose.includes('maskable')) maskable=true;
    const gr=[...String(ic.sizes||'').matchAll(/(\d+)x(\d+)/g)].map(m=>[+m[1],+m[2]]);
    if(/\.png$/i.test(k.pfad)){
      const p=pngGroesse(k.pfad);
      if(!p) fehler(st+': '+k.pfad+' ist keine lesbare PNG-Datei');
      else{
        if(!gr.length) fehler(st+': sizes fehlt (Datei ist '+p.b+'x'+p.h+')');
        else if(!gr.some(g=>g[0]===p.b&&g[1]===p.h)) fehler(st+': '+k.pfad+' ist '+p.b+'x'+p.h+', das Manifest sagt '+ic.sizes);
        if(p.b===p.h&&purpose.includes('any')){ if(p.b===192) hat192=true; if(p.b===512) hat512=true; }
        if(p.b!==p.h) warn(st+': '+k.pfad+' ist nicht quadratisch ('+p.b+'x'+p.h+')');
        if(purpose.includes('maskable')&&p.b<192) fehler(st+': maskable-Symbol ist kleiner als 192 px');
      }
      if(ic.type&&ic.type!=='image/png') warn(st+': type '+ic.type+' passt nicht zu .png');
    }else if(/\.svg$/i.test(k.pfad)){
      const s=lies(k.pfad)||''; if(!/<svg\b/i.test(s)) fehler(st+': '+k.pfad+' enthaelt kein <svg>');
      if(ic.type&&ic.type!=='image/svg+xml') warn(st+': type '+ic.type+' passt nicht zu .svg');
    }
  });
  if(!hat192) fehler('manifest.webmanifest: kein 192x192-PNG-Symbol (purpose any)');
  if(!hat512) fehler('manifest.webmanifest: kein 512x512-PNG-Symbol (purpose any)');
  if(!maskable) fehler('manifest.webmanifest: kein Symbol mit purpose "maskable" (Android schneidet sonst weisse Raender)');
  /* Apple-/Tab-Symbole der Seiten stimmen mit der Erwartung der Systeme ueberein? */
  const pruefeGroesse=(rel,w,h,was)=>{ if(pfadStatus(rel).s!=='ok') return; const p=pngGroesse(rel);
    if(p&&(p.b!==w||p.h!==h)) warn(was+': '+rel+' ist '+p.b+'x'+p.h+', erwartet '+w+'x'+h); };
  pruefeGroesse('icons/apple-touch-icon.png',180,180,'apple-touch-icon');
  pruefeGroesse('icons/favicon-32.png',32,32,'favicon');
  /* theme_color im Manifest und in den Seiten */
  const abw=[...seiten.values()].filter(s=>s.thema&&manifest.theme_color&&s.thema!==manifest.theme_color.toLowerCase()).map(s=>s.name);
  if(abw.length) warn('theme-color der Seiten ('+abw.slice(0,3).join(', ')+(abw.length>3?', ...':'')+') weicht vom Manifest ('+manifest.theme_color+') ab');
  if(harte===vorher) ok('Manifest gueltig, '+icons.length+' Symbole stimmen mit den Dateien ueberein, maskable vorhanden');
}

/* ---------------------------------------------------------------------------
   5. SERVICE WORKER
   ------------------------------------------------------------------------- */
function pruefeSw(){
  kopf('Service Worker (sw.js)');
  const src=lies('sw.js');
  if(src===null) return;                  // fehlt: schon gemeldet
  const vorher=harte;
  try{ new vm.Script(src,{filename:'sw.js'}); }catch(e){ fehler('sw.js: Syntaxfehler - '+e.message); return; }
  const code=ohneKommentare(src);
  /* Die Vorladeliste: const PRECACHE=[...] (tools/version.py schreibt sie zwischen die
     Markierungen PRECACHE-START/-ENDE) oder, aelter, cache.addAll([...]). */
  const kandidaten=[];
  const re1=/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\[([\s\S]*?)\]/g; let m;
  while((m=re1.exec(code))) kandidaten.push({name:m[1],roh:m[2]});
  const re2=/\.addAll\(\s*\[([\s\S]*?)\]/g;
  while((m=re2.exec(code))) kandidaten.push({name:'addAll',roh:m[1]});
  const eintraegeVon=roh=>[...roh.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)].map(x=>x[2]);
  const mitEintraegen=kandidaten.map(k=>({name:k.name,roh:k.roh,e:eintraegeVon(k.roh)}));
  const pre=mitEintraegen.find(k=>k.name==='PRECACHE');
  if(pre&&!pre.e.length){
    fehler('sw.js: PRECACHE ist leer - es wuerde nichts vorgeladen (python tools/version.py schreibt die Liste)');
    return;
  }
  const liste=pre||mitEintraegen
    .filter(k=>k.e.filter(x=>/\.(?:js|html|css|png|svg|webmanifest|ico)(?:\?|$)|\/$/.test(x)).length>=3)
    .sort((a,b)=>b.e.length-a.e.length)[0];
  if(!liste){ fehler('sw.js: keine Vorladeliste gefunden (erwartet: const PRECACHE=[ \'index.html\', ... ])'); return; }
  if(/\.\.\.|\+|\.map\(/.test(liste.roh)) warn('sw.js: '+liste.name+' enthaelt berechnete Eintraege - die Abdeckung ist nur fuer die ausgeschriebenen pruefbar');
  const vorgeladen=new Map();             // Pfad -> Query aus dem Eintrag
  for(const e of liste.e){
    const k=klassifiziere(e);
    if(k.art==='absolut'){ fehler('sw.js: '+liste.name+' enthaelt den absoluten Pfad '+e+' - bricht unter /Nachtschicht/'); continue; }
    if(k.art==='extern'){ fehler('sw.js: '+liste.name+' enthaelt eine fremde Adresse '+kurz(e)); continue; }
    if(k.art!=='lokal') continue;
    vorgeladen.set(k.pfad,k.query);
    const s=pfadStatus(k.pfad);
    if(s.s==='fehlt') fehler('sw.js: '+liste.name+' enthaelt '+e+' - die Datei gibt es nicht (die Liste ist veraltet: python tools/version.py)');
    else if(s.s==='gross') fehler('sw.js: '+liste.name+' enthaelt '+e+' - Gross-/Kleinschreibung: die Datei heisst '+s.echt);
  }
  if(!vorgeladen.has('index.html')) fehler('sw.js: '+liste.name+' enthaelt index.html nicht - ohne den Kern installiert sich der Worker nie');
  /* Was die Seiten laden, muss vorgeladen sein. Symbole und Manifest sind nur Beiwerk: Warnung. */
  const luecken={fehler:[],warn:[]};
  const sollen=new Map(geladenGesamt);
  for(const s of SPIELSEITEN) if(!sollen.has(s)&&pfadStatus(s).s==='ok') sollen.set(s,{art:'seite',seiten:new Set(['Spielseite'])});
  for(const [p,g] of sollen){
    if(vorgeladen.has(p)) continue;
    const eintrag=p+' ('+g.art+', von '+[...g.seiten].slice(0,2).join(', ')+(g.seiten.size>2?' u. a.':'')+')';
    (g.art==='icon'||g.art==='manifest'?luecken.warn:luecken.fehler).push(eintrag);
  }
  for(const f of luecken.fehler) fehler('sw.js: '+liste.name+' deckt nicht ab: '+f+' - offline wuerde es fehlen');
  for(const f of luecken.warn) warn('sw.js: '+liste.name+' deckt nicht ab: '+f);
  for(const f of dateienIn('.',n=>n.endsWith('.html'))){
    if(!sollen.has(f)&&!vorgeladen.has(f)&&f!=='404.html') warn('sw.js: '+f+' ist nicht vorgeladen - offline nicht erreichbar');
  }
  /* ?v=-Nummern: der Worker schlaegt mit ignoreSearch nach (dann ist alles gut). Ohne das fand der
     Cache "nacht/kern.js?v=..." nie, und das Spiel startete offline nicht. */
  if(scriptVs.length){
    const ohneQuery=liste.e.some(e=>/nacht\/[a-z]+\.js(?!\?)/.test(e));
    if(ohneQuery&&!/ignoreSearch/.test(code)) warn('sw.js: die Seiten laden nacht/*.js mit ?v=..., die Vorladeliste ohne - ohne ignoreSearch:true beim Nachschlagen findet der Cache nichts (Offline-Start schlaegt fehl)');
    for(const [p,q] of vorgeladen){
      const mv=/^\?v=(\d+)$/.exec(q); if(!mv) continue;
      const seitenV=new Set(scriptVs.filter(s=>s.datei===p).map(s=>s.v));
      if(seitenV.size&&!seitenV.has(mv[1])) fehler('sw.js: '+p+'?v='+mv[1]+' stimmt nicht mit den Seiten ueberein ('+[...seitenV].join(', ')+') - python tools/version.py');
    }
  }
  if(!/addEventListener\(\s*['"]fetch['"]/.test(code)) warn('sw.js: kein fetch-Ereignis - ohne das laeuft nichts aus dem Cache');
  if(!/addEventListener\(\s*['"]install['"]/.test(code)) warn('sw.js: kein install-Ereignis');
  if(harte===vorher) ok(liste.name+': '+vorgeladen.size+' Dateien, alle vorhanden, alles von den Seiten Geladene abgedeckt');
}

/* ---------------------------------------------------------------------------
   6. VERSIONEN
   Zwei verschiedene Dinge, nicht verwechseln:
     Spielversion  1.0.0           GERAET.version in nacht/geraet.js  =  oberste Ueberschrift in CHANGELOG.md
     Build-Stempel 202610031200    GERAET.build (geraet.js)  =  BUILD (sw.js)  =  ?v= aller Skript-Tags
   Den Stempel setzt tools/version.py - "STAND" heisst: noch nie gestempelt.
   ------------------------------------------------------------------------- */
const SEMVER='(\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.]+)?)';
/* Spielversion: Zuweisung wie  GERAET.version="1.0.0",  VERSION='1.0.0'  oder version:'1.0.0' */
function versionAus(src){
  if(src===null) return null;
  const m=new RegExp('VERSION\\w*\\s*[:=]\\s*[\'"`]v?'+SEMVER+'[\'"`]','i').exec(ohneKommentare(src));
  return m?m[1]:null;
}
function buildAus(src,muster){
  if(src===null) return null;
  const m=muster.exec(ohneKommentare(src));
  return m?m[1]:null;
}
function pythonPruefen(){
  /* tools/version.py --pruefen kennt die Pruefsumme der Dateien (Aenderung ohne neuen Stempel)
     und die genaue PRECACHE-Liste - das kann dieses Skript nicht besser. */
  const vp=lies('tools/version.py');
  if(vp===null||!/--pruefen/.test(vp)){ return; }
  let r=null;
  for(const py of ['python','python3','py']){
    try{ const x=cp.spawnSync(py,['tools/version.py','--pruefen'],{cwd:WURZEL,encoding:'utf8',timeout:30000});
      if(!x.error&&x.status!==null){ r=x; break; } }catch(e){}
  }
  if(!r){ hinweis('Python nicht gefunden - "python tools/version.py --pruefen" nicht ausgefuehrt'); return; }
  const zeilen=(r.stdout+'\n'+r.stderr).split('\n').map(s=>s.trim()).filter(Boolean);
  if(r.status===0) ok('tools/version.py --pruefen: '+kurz((zeilen.find(z=>/^OK/.test(z))||zeilen[0]||'in Ordnung').replace(/^OK\s*/,''),110));
  else{
    const probleme=zeilen.filter(z=>/^!!/.test(z)).map(z=>z.replace(/^!!\s*/,''));
    for(const p of (probleme.length?probleme:zeilen).slice(0,6)) fehler('tools/version.py --pruefen: '+kurz(p,200));
  }
}
function pruefeVersionen(){
  kopf('Versionen');
  const vorher=harte;
  const geraet=lies('nacht/geraet.js'), sw=lies('sw.js');

  /* Build-Stempel */
  const ohneV=scriptVs.filter(s=>!s.v);
  for(const s of ohneV.slice(0,5)) fehler(s.stelle+': '+s.datei+' ohne ?v=Nummer - Browser halten sonst die alte Engine (python tools/version.py)');
  if(ohneV.length>5) fehler('... und '+(ohneV.length-5)+' weitere Skript-Tags ohne ?v=');
  const werte=new Map();
  for(const s of scriptVs) if(s.v){ if(!werte.has(s.v)) werte.set(s.v,[]); werte.get(s.v).push(s.seite); }
  if(werte.size>1){
    const teile=[...werte].map(([v,l])=>v+' ('+[...new Set(l)].slice(0,4).join(', ')+(new Set(l).size>4?', ...':'')+')');
    fehler('?v= der Skript-Tags ist nicht ueberall gleich: '+teile.join(' | ')+' - python tools/version.py');
  }
  const stempel=[];
  if(werte.size===1) stempel.push(['?v= der Seiten',[...werte.keys()][0]]);
  const bG=buildAus(geraet,/GERAET\s*\.\s*build\s*=\s*["']([^"']*)["']/);
  const bS=buildAus(sw,/\bconst\s+BUILD\s*=\s*["']([^"']*)["']/);
  if(geraet!==null){ if(bG===null) fehler('nacht/geraet.js: GERAET.build fehlt'); else stempel.push(['GERAET.build',bG]); }
  if(sw!==null){ if(bS===null) fehler('sw.js: const BUILD fehlt'); else stempel.push(['sw.js BUILD',bS]); }
  for(const [wo,v] of stempel) if(v==='STAND'||v==='') fehler(wo+' ist noch nicht gestempelt ("'+v+'") - python tools/version.py');
  const echte=stempel.filter(x=>x[1]&&x[1]!=='STAND');
  if(new Set(echte.map(x=>x[1])).size>1)
    fehler('Build-Stempel nicht einheitlich: '+echte.map(x=>x[0]+' '+x[1]).join(', ')+' - python tools/version.py');
  else if(echte.length===3&&!stempel.some(x=>x[1]==='STAND'||x[1]===''))
    ok('Build-Stempel '+echte[0][1]+' in den Seiten, geraet.js und sw.js');
  if(werte.size===1&&!/^\d{12}$/.test([...werte.keys()][0])) warn('?v='+[...werte.keys()][0]+' sieht nicht wie JJJJMMTTHHMM aus (tools/version.py setzt es so)');
  const cv=new Map(); for(const s of cssVs) if(s.v) cv.set(s.v,(cv.get(s.v)||0)+1);
  if(cv.size>1) warn('stil.css wird mit verschiedenen ?v= geladen: '+[...cv.keys()].join(', '));
  if(cssVs.some(s=>!s.v)) warn('stil.css wird auf mindestens einer Seite ohne ?v= geladen');
  pythonPruefen();

  /* Spielversion */
  const vG=versionAus(geraet), vS=versionAus(sw);
  const cl=lies('CHANGELOG.md'); let vC=null;
  if(cl!==null){ const m=new RegExp('^#{1,3}\\s*\\[?v?'+SEMVER,'m').exec(cl); vC=m?m[1]:null; }
  if(!vG&&geraet!==null) fehler('nacht/geraet.js: keine Spielversion gefunden (erwartet z. B. GERAET.version="1.0.0")');
  if(!vC&&cl!==null) fehler('CHANGELOG.md: keine Versionsueberschrift gefunden (erwartet z. B. "## 1.0.0 - 2026-10-03")');
  const alle=[['geraet.js',vG],['sw.js',vS],['CHANGELOG.md',vC]].filter(x=>x[1]);   // sw.js hat meist nur den Build-Stempel
  if(new Set(alle.map(x=>x[1])).size>1)
    fehler('Spielversion nicht einheitlich: '+alle.map(x=>x[0]+' '+x[1]).join(', ')+' - ueberall dieselbe Nummer');
  else if(vG&&vC) ok('Spielversion '+vG+' in geraet.js und CHANGELOG.md'+(vS?' und sw.js':''));
  return vG;
}

/* ---------------------------------------------------------------------------
   7. SKRIPTSYNTAX, GROESSEN
   ------------------------------------------------------------------------- */
function pruefeSyntax(){
  kopf('Skripte');
  const vorher=harte; let n=0;
  for(const f of dateienIn('nacht',x=>x.endsWith('.js'))){
    const t=lies(f); n++;
    try{ new vm.Script(t,{filename:f}); }catch(e){ fehler(f+': Syntaxfehler - '+e.message); }
  }
  /* nicht eingebundene Engine-Dateien: tote Last */
  for(const f of dateienIn('nacht',x=>x.endsWith('.js'))){
    const g=geladenGesamt.get(f);
    if(!g) warn(f+': wird von keiner Seite geladen');
  }
  if(harte===vorher) ok(n+' Dateien in nacht/ ohne Syntaxfehler');
}
function pruefeGroessen(){
  kopf('Groessen');
  const vorher=harte;
  const alle=auszuliefern(); let summe=0; const gross=[];
  for(const f of alle){ const b=groesse(f); summe+=b; gross.push([f,b]);
    if(/\.html$/.test(f)&&b>SEITE_MAX_BYTES) fehler(f+': '+kb(b)+' - mehr als '+(SEITE_MAX_BYTES/1024/1024)+' MB pro Seite'); }
  gross.sort((a,b)=>b[1]-a[1]);
  const grosseSeite=gross.find(x=>/\.html$/.test(x[0]));
  if(harte===vorher) ok('jede HTML-Seite unter '+(SEITE_MAX_BYTES/1024/1024)+' MB'+(grosseSeite?' (groesste: '+grosseSeite[0]+' '+kb(grosseSeite[1])+')':''));
  ok('Auslieferung: '+alle.length+' Dateien, zusammen '+kb(summe)+' ('+(summe/1024/1024).toFixed(2)+' MB)');
  if(!LEISE) console.log('  ... die groessten: '+gross.slice(0,5).map(x=>x[0]+' '+kb(x[1])).join(', '));
  /* Dateien, die ausgeliefert werden, aber nirgends vorkommen */
  const tot=alle.filter(f=>!refs.has(f)&&!geladenGesamt.has(f)&&!/^(?:index|404)\.html$/.test(f)&&f!=='sw.js'&&f!=='robots.txt'&&f!=='manifest.webmanifest'
    &&!(/\.html$/.test(f)));
  if(tot.length) hinweis('nirgends verwiesen, wird aber ausgeliefert: '+tot.join(', '));
  const ueber=seiten.get('index.html');
  if(seiten.has('ueber.html')&&!(ueber&&ueber.verweist&&ueber.verweist.has('ueber.html'))){
    const imJs=quellen.some(q=>q.art==='js'&&q.label!=='sw.js'&&q.tokens.some(t=>t.art==='text'&&/ueber\.html/.test(t.s)));   // sw.js nennt jede Seite, das ist kein Link
    if(!imJs) warn('ueber.html (Impressum/Namensangabe) wird weder von index.html noch von einem Skript verlinkt - der Spieler findet sie nicht');
  }
  return {anzahl:alle.length,summe};
}

/* ---------------------------------------------------------------------------
   8. GIT: was .gitignore verschluckt, kommt nie auf GitHub Pages an
   ------------------------------------------------------------------------- */
function git(args,input){
  try{ const r=cp.spawnSync('git',args,{cwd:WURZEL,input,encoding:'utf8',timeout:20000});
    return (r.error||r.status===null)?null:r; }catch(e){ return null; }
}
const gitDa=(()=>{ if(!fs.existsSync(abs('.git'))) return false; const r=git(['rev-parse','--is-inside-work-tree']); return !!r&&r.status===0; })();
function pruefeGit(){
  kopf('Git');
  if(!gitDa){ hinweis('kein Git-Ordner gefunden - Ignorier-Pruefung uebersprungen'); return; }
  const vorher=harte+warnungen;
  const alle=auszuliefern();
  const r=git(['check-ignore','--stdin'],alle.join('\n')+'\n');
  if(r&&r.status!==null&&r.status<=1){
    for(const f of r.stdout.split('\n').map(s=>s.trim()).filter(Boolean))
      fehler(f+': steht in .gitignore - die Datei kommt nie auf GitHub Pages an (.gitignore verschluckt *.png ausser in icons/ und docs/)');
  }
  /* auch ueber das hinaus, was ausgeliefert wird: Dateien, auf die verwiesen wird */
  const verw=[...refs.keys()].filter(f=>pfadStatus(f).s==='ok'&&!alle.includes(f));
  if(verw.length){
    const r2=git(['check-ignore','--stdin'],verw.join('\n')+'\n');
    if(r2&&r2.status<=1) for(const f of r2.stdout.split('\n').map(s=>s.trim()).filter(Boolean))
      fehler(f+': wird verlinkt, steht aber in .gitignore - fehlt auf GitHub Pages');
  }
  if(MIT_GIT){
    const l=git(['ls-files']);
    if(l&&l.status===0){
      const versioniert=new Set(l.stdout.split('\n').map(s=>s.trim()));
      for(const f of alle.concat(verw)) if(!versioniert.has(f)) warn(f+': noch nicht in Git (git add vergessen?)');
    }
  }
  if(harte+warnungen===vorher) ok('keine ausgelieferte Datei wird von .gitignore verschluckt');
}

/* ---------------------------------------------------------------------------
   ABLAUF
   ------------------------------------------------------------------------- */
function main(){
  pruefeErwartet();

  kopf('Seiten: Kopfzeilen');
  const zaehler={gut:0};
  const namen=[...new Set(SEITEN_ERWARTET.concat(dateienIn('.',n=>n.endsWith('.html'))))];
  for(const n of namen) pruefeSeite(n,zaehler);
  if(zaehler.gut===seiten.size&&seiten.size) ok(seiten.size+' Seiten: lang="de", viewport, title, description, theme-color, manifest, icon, apple-touch-icon');
  /* Hinweise zur Link-Vorschau - nur die Startseite braucht sie */
  const idx=seiten.get('index.html');
  if(idx){
    const fehl=['og:title','og:description','og:image','og:url'].filter(x=>!(idx.og&&idx.og.has(x)));
    if(fehl.length) warn('index.html: Link-Vorschau unvollstaendig, es fehlt '+fehl.join(', ')+' (so sieht der Link in Chats aus)');
    if(!/<link[^>]+rel=["']?canonical/i.test(idx.html)) warn('index.html: <link rel="canonical"> fehlt');
  }
  const k404=seiten.get('404.html');
  if(k404){
    const rel=[...(k404.html.matchAll(/\b(?:src|href)=["'](?!https?:|\/|#|data:|mailto:)([^"']+)["']/gi))].map(m=>m[1]);
    if(rel.length&&!/<base\b/i.test(k404.html))
      warn('404.html: relative Pfade ('+rel.slice(0,2).join(', ')+') brechen, weil GitHub Pages die Seite unter beliebig tiefen Adressen ausliefert - <base href> setzen oder selbststaendig halten');
  }

  sammleSkripte();
  scanneQuellen();
  pruefeAnker();

  pruefeRefs();
  pruefeManifest();
  pruefeSw();
  pruefeVersionen();
  pruefeExterne();
  pruefeReste();
  pruefeSyntax();
  const g=pruefeGroessen();
  pruefeGit();

  /* Zusammenfassung */
  console.log('\n'+'-'.repeat(64));
  if(harteListe.length){
    console.log('Harte Fehler im Ueberblick:');
    harteListe.slice(0,25).forEach((t,i)=>console.log('  '+(i+1)+'. '+kurz(t,150)));
    if(harteListe.length>25) console.log('  ... und '+(harteListe.length-25)+' weitere');
  }
  console.log('Auslieferung: '+g.anzahl+' Dateien, '+kb(g.summe));
  console.log('ERGEBNIS: '+(harte?'NICHT BEREIT':'BEREIT')+' - '+harte+' harte Fehler, '+warnungen+' Warnungen'+(hinweise&&LEISE?'':', '+hinweise+' Hinweise'));
  process.exit(harte?1:0);
}
try{ main(); }
catch(e){ console.log('\nFEHLER: die Pruefung selbst ist abgestuerzt: '+(e&&e.stack||e)); process.exit(2); }
