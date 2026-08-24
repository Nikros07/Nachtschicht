/* Gemeinsames Werkzeug fuer die Pruefskripte.

   Ein winziger Dateiserver auf dem Repo-Ordner und ein Browser dazu.
   Der Browser muss sein, weil das ganze Spiel im Browser lebt: es gibt
   keine Funktion, die man ohne Leinwand aufrufen koennte.

   Absichtlich ohne Test-Framework. Zwei Skripte, ein Helfer, fertig. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const WURZEL = path.join(__dirname, '..');
const TYP = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };

/* Playwright bringt normalerweise seinen eigenen Chromium mit. Steht in
   der Umgebung ein anderer Pfad, nehmen wir den - manche Container haben
   den Browser schon installiert. */
function browserPfad(){
  return process.env.CHROMIUM_PFAD || undefined;
}

function starteServer(){
  return new Promise(fertig=>{
    const s = http.createServer((anfrage,antwort)=>{
      const pfad = decodeURIComponent(anfrage.url.split('?')[0]);
      /* Das Favicon steckt als Daten-URL in den Seiten. Fuer Dokumente
         ohne Kopf - etwa die shell.css, die wir kurz aufrufen, um an den
         Speicher zu kommen - fragt der Browser trotzdem danach. Kein
         Fehler, also auch keine 404. */
      if(pfad==='/favicon.ico'){ antwort.writeHead(204); antwort.end(); return; }
      const p = path.join(WURZEL, pfad);
      if(!p.startsWith(WURZEL)){ antwort.writeHead(403); antwort.end(); return; }
      fs.readFile(p,(fehler,daten)=>{
        if(fehler){ antwort.writeHead(404); antwort.end(); return; }
        antwort.writeHead(200,{'content-type':TYP[path.extname(p)]||'application/octet-stream'});
        antwort.end(daten);
      });
    });
    s.listen(0,'127.0.0.1',()=>fertig({ server:s, port:s.address().port }));
  });
}

/* Fehler einsammeln. Das Favicon fehlt absichtlich - das ist kein Fehler. */
function sammleFehler(seite){
  const raus=[];
  seite.on('pageerror', e=>raus.push('JS: '+e.message));
  seite.on('console', m=>{ if(m.type()==='error' && !/favicon/.test(m.text())) raus.push('KONSOLE: '+m.text()); });
  seite.on('requestfailed', r=>{ if(!/favicon/.test(r.url())) raus.push('LADEFEHLER: '+r.url()); });
  return raus;
}

/* Winziger Pruefer. Kein Framework, nur eine Zeile pro Behauptung. */
function pruefer(){
  let schlecht=0;
  const ist=(name,a,b)=>{
    const ok=JSON.stringify(a)===JSON.stringify(b);
    if(!ok) schlecht++;
    console.log((ok?'  ok   ':'  FEHL ')+name+(ok?'':`   ${JSON.stringify(a)} != ${JSON.stringify(b)}`));
  };
  const wahr=(name,a)=>ist(name,!!a,true);
  return { ist, wahr, fehler:()=>schlecht };
}

module.exports = { WURZEL, starteServer, sammleFehler, pruefer, browserPfad };
