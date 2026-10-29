/* Prueft nacht/hilfe.js (Erst-Tipps, WAS JETZT?, LOCKER-Angebot) und die Literal-Aufrufe in den Seiten.
   Ohne Browser. Aus dem Projektordner starten:  node test/hilfe.test.js */
const fs=require('fs');
const quelle=fs.readFileSync('nacht/hilfe.js','utf8');

const speicher=(o)=>{ o=o||{}; const m=new Map(); return {
  getItem:k=>{ if(o.wirftLesen) throw new Error('lesen'); return m.has(k)?m.get(k):null; },
  setItem:(k,v)=>{ if(o.wirftSchreiben) throw new Error('schreiben'); m.set(k,String(v)); },
  removeItem:k=>m.delete(k) }; };

// Testuhr in Sekunden (performance.now liefert Millisekunden)
let zeit=0;
const uhr={now:()=>zeit*1000};
let gez=[];
const sch=s=>gez.push(String(s));
const ctxStub=new Proxy({},{get:(t,k)=>k in t?t[k]:()=>{}, set:(t,k,v)=>{ t[k]=v; return true; }});
let tastenFn=null;
let stufe='normal', gesetzt=null;
const LEKTIONEN={'level4.html':{schritte:[{taste:'E',touch:'KNOPF',btn:'KONTER',was:'KONTERN'}]}};

// Frische Instanz von hilfe.js. Was nicht uebergeben wird, existiert nicht (typeof undefined).
function baue(o){
  o=o||{};
  const f=new Function('window','localStorage','location','performance','S','IS_TOUCH','ctx','W','H',
    'text','textC','textGlowC','textW','schwierigkeit','setzeSchwierigkeit','LEKTIONEN','addEventListener',
    quelle+'\nreturn {HILFE, hilfeTipp, hilfeSag};');
  return f(o.window||{}, o.localStorage, {search:o.search||'', pathname:'/level4.html'}, uhr, o.S, o.touch,
    ctxStub, 320, 180, sch, sch, sch, s=>String(s).length*4, ()=>stufe, k=>{ gesetzt=k; }, LEKTIONEN,
    (art,fn)=>{ if(art==='keydown') tastenFn=fn; });
}

const frischS=(extra)=>Object.assign({modus:'spiel',hinweis:'',hinweisT:0,gewonnen:false},extra||{});
const wirftNicht=f=>{ try{ f(); return true; }catch(e){ return false; } };
const taste=(code)=>({code:code,repeat:false,preventDefault(){},stopImmediatePropagation(){}});

// Eine Runde mit Niederlage: Spiel, dann Wechsel auf 'ende' ohne Sieg.
function niederlageRunde(S,h){
  S.modus='spiel'; h.takt(0.016);
  S.gewonnen=false; S.modus='ende'; h.takt(0.016);
}

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i!==undefined?'   -> '+i:'')); } };

console.log('\n--- ERST-TIPP ---');
{
  const S=frischS(); const h=baue({S,localStorage:speicher()}).HILFE;
  pruefe('a) frei: tipp true', h.tipp('a','PC A','HANDY A')===true);
  pruefe('a) S.hinweis ist PC A', S.hinweis==='PC A', S.hinweis);
  pruefe('a) S.hinweisT ist 2.5', S.hinweisT===2.5, S.hinweisT);
  pruefe('b) dieselbe id nochmal: false', h.tipp('a','PC A','HANDY A')===false);
}
console.log('\n--- WARTESCHLANGE ---');
{
  const S=frischS(); const h=baue({S,localStorage:speicher()}).HILFE;
  h.tipp('a','PC A','HANDY A');
  S.hinweisT=3;
  pruefe('c) zweiter Tipp wird eingereiht: true', h.tipp('b','PC B','HB')===true);
  pruefe('c) S.hinweis bleibt PC A', S.hinweis==='PC A', S.hinweis);
  S.hinweisT=0;
  h.takt(0.2);
  pruefe('c) nach 0.2 s noch PC A', S.hinweis==='PC A', S.hinweis);
  h.takt(0.3);
  pruefe('c) nach 0.5 s PC B', S.hinweis==='PC B', S.hinweis);
}
console.log('\n--- GERAET (Handy-Text) ---');
{
  const S=frischS(); const h=baue({S,touch:true,localStorage:speicher()}).HILFE;
  pruefe('d) IS_TOUCH: Handy-Text gezeigt', h.tipp('t','PC T','HANDY T')===true && S.hinweis==='HANDY T', S.hinweis);
  pruefe('d) leerer Handy-Text: false', h.tipp('t2','PC T2','')===false);
}
console.log('\n--- STUMM-SCHALTER ---');
{
  const S=frischS(); const h=baue({S,search:'?lektion=0',localStorage:speicher()}).HILFE;
  pruefe('e) ?lektion=0: tipp false', h.tipp('e','PC E','HE')===false);
  pruefe('e) ?lektion=0: S unveraendert', S.hinweis==='' && S.hinweisT===0);
  const S2=frischS(); const h2=baue({S:S2,search:'?lektion=0&hilfe=1',localStorage:speicher()}).HILFE;
  pruefe('e) ?lektion=0&hilfe=1: true', h2.tipp('e','PC E','HE')===true);
  const S3=frischS(); const h3=baue({S:S3,search:'?hilfe=0',localStorage:speicher()}).HILFE;
  pruefe('e) ?hilfe=0: false', h3.tipp('e','PC E','HE')===false);
}
console.log('\n--- AUS-SCHALTER ---');
{
  const S=frischS(); const h=baue({S,localStorage:speicher()}).HILFE;
  h.setze(false);
  pruefe('f) aus: tipp false', h.tipp('f','PC F','HF')===false);
  pruefe('f) aus: lernt false', h.lernt('x')===false);
  pruefe('f) aus: eingeschaltet false', h.eingeschaltet()===false);
  h.setze(true);
  pruefe('f) wieder an: tipp true', h.eingeschaltet()===true && h.tipp('f','PC F','HF')===true);
}
console.log('\n--- ZAEHLER ---');
{
  const h=baue({S:frischS(),localStorage:speicher()}).HILFE;
  pruefe('g) lernt k: true', h.lernt('k')===true);
  h.zaehle('k');
  pruefe('g) nach 1x lernt k: false', h.lernt('k')===false);
  pruefe('g) lernt k mit n=3: true', h.lernt('k',3)===true);
}
console.log('\n--- MERKER ---');
{
  const st=speicher();
  const S=frischS(); const h=baue({S,localStorage:st}).HILFE;
  h.tipp('a','PC A','HA');
  const S2=frischS(); const h2=baue({S:S2,localStorage:st}).HILFE;
  pruefe('h) neue Instanz, gleicher Speicher: a bleibt gesehen', h2.tipp('a','PC A','HA')===false);
  h2.vergiss();
  pruefe('h) vergiss(): a wieder true', h2.tipp('a','PC A','HA')===true);
}
console.log('\n--- LOCKER-ANGEBOT ---');
{
  stufe='normal'; gesetzt=null; zeit=0;
  const S=frischS(); const h=baue({S,localStorage:speicher()}).HILFE; const drueck=tastenFn;
  niederlageRunde(S,h);
  pruefe('i) 1. Niederlage: kein Angebot', h.angebotAktiv()===false);
  niederlageRunde(S,h);
  pruefe('i) 2. Niederlage: Angebot aktiv', h.angebotAktiv()===true);
  pruefe('i) kontext LOCKER', h.kontext()!==null && h.kontext().aktion==='LOCKER');
  drueck(taste('KeyE'));
  pruefe('i) Taste in der Sperre wird ignoriert', gesetzt===null && h.angebotAktiv()===true);
  zeit+=1;
  drueck(taste('KeyE'));
  pruefe('i) nach Sperre E: auf locker', gesetzt==='locker', gesetzt);
  pruefe('i) Angebot danach aus', h.angebotAktiv()===false);
  niederlageRunde(S,h);
  pruefe('i) 3. Niederlage: kein neues Angebot', h.angebotAktiv()===false);
}
console.log('\n--- GEWONNEN ZAEHLT NICHT ---');
{
  const S=frischS(); const h=baue({S,localStorage:speicher()}).HILFE;
  for(let i=0;i<3;i++){ S.modus='spiel'; h.takt(0.016); S.gewonnen=true; S.modus='ende'; h.takt(0.016); }
  pruefe('j) gewonnene Enden zaehlen nicht', h.angebotAktiv()===false);
}
console.log('\n--- LOCKER-STUFE ---');
{
  stufe='locker';
  const S=frischS(); const h=baue({S,localStorage:speicher()}).HILFE;
  for(let i=0;i<3;i++) niederlageRunde(S,h);
  pruefe('k) locker: nie ein Angebot', h.angebotAktiv()===false && h.kontext()===null);
  stufe='normal';
}
console.log('\n--- SPEICHER WIRFT ---');
{
  const S=frischS(); const sp=speicher({wirftLesen:true,wirftSchreiben:true}); let h=null;
  pruefe('l) baue() wirft nicht', wirftNicht(()=>{ h=baue({S,localStorage:sp}); }));
  pruefe('l) tipp funktioniert fuer die Sitzung', !!h && h.HILFE.tipp('l','PC L','HL')===true);
  pruefe('l) gleiche id in der Sitzung: false', !!h && h.HILFE.tipp('l','PC L','HL')===false);
}
console.log('\n--- WAS JETZT? ---');
{
  const S=frischS(); const h=baue({S,localStorage:speicher()}).HILFE; const drueck=tastenFn;
  pruefe('m) im Spiel: wasJetzt true', h.wasJetzt()===true);
  pruefe('m) laeuft true', h.laeuft()===true);
  gez=[];
  let f=true; try{ h.zeichne(); }catch(e){ f=false; }
  pruefe('m) zeichne wirft nicht', f);
  pruefe('m) WAS JETZT? gezeichnet', gez.some(t=>t.includes('WAS JETZT?')));
  pruefe('m) KONTERN gezeichnet', gez.some(t=>t.includes('KONTERN')));
  pruefe('m) kontext WEITER', h.kontext()!==null && h.kontext().aktion==='WEITER');
  drueck(taste('Escape'));
  pruefe('m) Escape schliesst', h.laeuft()===false);
  S.modus='titel';
  pruefe('m) im Titel: wasJetzt false', h.wasJetzt()===false);
}
console.log('\n--- JETZT-MARKE ---');
{
  stufe='normal';
  const h=baue({S:frischS(),localStorage:speicher()}).HILFE;
  pruefe('n) normal, frisch: true', h.jetztMarke()===true);
  h.zaehle('konter-jetzt'); h.zaehle('konter-jetzt'); h.zaehle('konter-jetzt');
  pruefe('n) nach 3x false', h.jetztMarke()===false);
  stufe='locker';
  const h2=baue({S:frischS(),localStorage:speicher()}).HILFE;
  pruefe('n) locker: true', h2.jetztMarke()===true);
  stufe='normal';
  const h3=baue({S:frischS(),search:'?lektion=0',localStorage:speicher()}).HILFE;
  pruefe('n) ?lektion=0: false', h3.jetztMarke()===false);
}
console.log('\n--- GLOBALE WRAPPER ---');
{
  const h=baue({S:frischS(),localStorage:speicher()});
  pruefe('Wrapper hilfeTipp und hilfeSag vorhanden', typeof h.hilfeTipp==='function' && typeof h.hilfeSag==='function');
}

console.log('\n--- SEITEN-SCAN (Literal-Aufrufe in *.html) ---');
{
  const probleme=[];
  const seiten=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
  const reTipp=/hilfeTipp\(\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'/g;
  const reSag=/hilfeSag\(\s*'([^']*)'\s*,\s*'([^']*)'/g;
  const zeichenOk=/^[A-Z0-9 .:\-!?\/+,<>*%()'"]*$/;
  const handyVerboten=/(^|[^A-Z])(E|LEER|LEERTASTE|SHIFT|UMSCHALT|ENTER|TAB|ESC|P|Q|R|H|W|S|A D|WASD)(?=$|[^A-Z])/;
  const idTexte={};
  let treffer=0, aufrufe=0;
  seiten.forEach(datei=>{
    const inhalt=fs.readFileSync(datei,'utf8');
    aufrufe+=inhalt.split('hilfeTipp(').length-1;
    let m; reTipp.lastIndex=0;
    while((m=reTipp.exec(inhalt))){
      treffer++;
      const id=m[1], pc=m[2], handy=m[3];
      const ort=datei+' id '+id;
      if(pc.length>44) probleme.push(ort+': PC-Text zu lang: '+pc);
      if(handy.length>44) probleme.push(ort+': Handy-Text zu lang: '+handy);
      if(!zeichenOk.test(pc)) probleme.push(ort+': PC-Text mit ungueltigen Zeichen: '+pc);
      if(!zeichenOk.test(handy)) probleme.push(ort+': Handy-Text mit ungueltigen Zeichen: '+handy);
      if(handyVerboten.test(handy)) probleme.push(ort+': Handy-Text nennt eine Taste: '+handy);
      if(idTexte[id]&&(idTexte[id].pc!==pc||idTexte[id].handy!==handy))
        probleme.push(ort+': gleiche id mit anderen Texten (sonst '+idTexte[id].datei+')');
      idTexte[id]=idTexte[id]||{pc:pc,handy:handy,datei:datei};
    }
    let s; reSag.lastIndex=0;
    while((s=reSag.exec(inhalt))){
      const pc=s[1], handy=s[2];
      if(pc.length>44||handy.length>44) probleme.push(datei+': hilfeSag-Text zu lang: '+pc+' / '+handy);
      if(!zeichenOk.test(pc)||!zeichenOk.test(handy)) probleme.push(datei+': hilfeSag-Text mit ungueltigen Zeichen: '+pc+' / '+handy);
    }
  });
  if(aufrufe!==treffer) probleme.push('hilfeTipp( kommt '+aufrufe+'x vor, nur '+treffer+' als Literal - Aufruf nicht als Text geschrieben');
  pruefe('Seiten-Scan: '+treffer+' Literal-Aufrufe, alle gueltig', probleme.length===0, probleme.join(' | '));
}

console.log('\nhilfe: '+ok+' ok, '+fail+' fehlgeschlagen');
process.exit(fail?1:0);
