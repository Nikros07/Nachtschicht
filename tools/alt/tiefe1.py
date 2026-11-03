# -*- coding: utf-8 -*-
"""Level 1 bekommt Tiefe: aus dem Flur wird ein Raum.

Der Kern der Aenderung: Lehrer sehen jetzt in einem Kegel in der FLAECHE,
nicht mehr auf einer Linie. Wer weit genug vorne durchgeht, kommt vorbei -
ohne Spind, ohne Wurf, nur durch Laufweg. Tueren und Spinde liegen dafuer
an der Rueckwand, man muss also nach hinten, um sie zu benutzen.

Steuerung: W/S sind kontextabhaengig. An der Treppe wechseln sie die Etage
wie bisher, ueberall sonst gehen sie nach hinten und vorne.
"""
import io

p = 'index.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(src, alt, neu):
    assert alt in src, 'nicht gefunden: ' + alt[:70]
    return src.replace(alt, neu, 1)


# ---------- Engine ----------
s = ersetze(s, '<script src="nacht/stand.js"></script>',
    '<script src="nacht/stand.js"></script>\n'
    '<script src="nacht/welt.js"></script>')

# ---------- TUNE ----------
s = ersetze(s,
    "  /* (6) OPTIK */",
    "  /* (5b) TIEFE - der Flur ist jetzt eine Flaeche, kein Strich.\n"
    "     tiefeBand ist die Hoehe des Laufbandes in Pixeln, tiefeWelt das\n"
    "     Mass, mit dem der Sichtkegel rechnet: je groesser, desto mehr\n"
    "     bringt ein Schritt nach hinten. */\n"
    "  tiefeBand:       13,\n"
    "  tiefeWelt:       52,\n"
    "  tiefeTempo:     1.0,\n"
    "  tuerTiefe:     0.42,   // so weit hinten muss man fuer Tuer und Spind\n"
    "\n"
    "  /* (6) OPTIK */")

# ---------- Zustand ----------
s = ersetze(s, "  S.kamX=S.x-W/2; S.kamY=S.y-H*0.62;",
    "  S.tiefe=0.55; S.vt=0;\n"
    "  /* Lehrer verteilen sich ueber die Tiefe, sonst stehen alle auf einer\n"
    "     Linie und der Flur fuehlt sich wieder flach an. */\n"
    "  S.lehrer.forEach((L,i)=>{ L.t=0.3+((i*0.37)%0.5); });\n"
    "  setzeTiefenband(0,0,TUNE.tiefeWelt);\n"
    "  S.kamX=S.x-W/2; S.kamY=S.y-H*0.62;")

# ---------- Bewegung: W/S kontextabhaengig ----------
s = ersetze(s,
    "  const treppe = S.amBoden && anTreppe(S.x);\n"
    "  const runterAn = !!(keys['ArrowDown'] || keys['KeyS']) || touchRunterAn;\n"
    "  if(treppe && hochAn && S.etage < BODEN.length-1){",

    "  const treppe = S.amBoden && anTreppe(S.x);\n"
    "  const runterAn = !!(keys['ArrowDown'] || keys['KeyS']) || touchRunterAn;\n"
    "\n"
    "  /* Tiefe. W und S sind kontextabhaengig: an der Treppe wechseln sie die\n"
    "     Etage wie frueher, ueberall sonst gehen sie nach hinten und vorne.\n"
    "     Das spart zwei zusaetzliche Knoepfe am Handy. */\n"
    "  if(!treppe){\n"
    "    const rt=(runterAn?1:0)-(hochAn?1:0);\n"
    "    const langsam=S.schleicht?0.55:1;\n"
    "    bewegeTiefe(S,rt,dt,TUNE.tiefeTempo*langsam);\n"
    "  }\n"
    "\n"
    "  if(treppe && hochAn && S.etage < BODEN.length-1){")

# ---------- Sicht: echter Kegel in der Flaeche ----------
s = ersetze(s,
    "    const sichtbar = S.modus==='spiel' && S.imSpind<0 && L.e===S.etage\n"
    "      && Math.sign(S.x-L.x)===Math.sign(L.v)\n"
    "      && Math.abs(S.x-L.x)<reichweite;",

    "    /* Sichtkegel in der Flaeche statt auf der Linie. Wer weit genug\n"
    "       vorne oder hinten laeuft, ist ausserhalb - das ist der eigentliche\n"
    "       Gewinn der Tiefe. Die seitliche Grenze steckt in welt.js. */\n"
    "    const wache={x:L.x,t:L.t,blick:Math.sign(L.v)||1};\n"
    "    const sichtbar = S.modus==='spiel' && S.imSpind<0 && L.e===S.etage\n"
    "      && imSichtkegel(wache,{x:S.x,t:S.tiefe},reichweite,TUNE.kegelOeffnung||0.5);")

s = ersetze(s, "  tiefeTempo:     1.0,",
    "  tiefeTempo:     1.0,\n"
    "  kegelOeffnung: 0.5,    // wie weit sich der Blick mit der Entfernung oeffnet")

# ---------- Tuer und Spind nur von hinten ----------
s = ersetze(s,
    "    } else if(ri>=0){ betreteRaum(ri); }\n"
    "    else if(si>=0){",

    "    } else if(ri>=0){\n"
    "      /* Tueren liegen an der Rueckwand - man muss hin. */\n"
    "      if(S.tiefe>TUNE.tuerTiefe){ meldung('ZU WEIT VORNE - NACH HINTEN'); SFX.nichts(); }\n"
    "      else betreteRaum(ri);\n"
    "    }\n"
    "    else if(si>=0){\n"
    "      if(S.tiefe>TUNE.tuerTiefe){ meldung('ZU WEIT VORNE - NACH HINTEN'); SFX.nichts(); }\n"
    "      else")

# ---------- Zeichnen: Laufband, Tiefenversatz, Kegel als Trapez ----------
s = ersetze(s,
    "    /* Wand */\n"
    "    ctx.fillStyle = fern?'#12141f':P.wand;\n"
    "    ctx.fillRect(0,deckeY,LEVEL_B,56);",

    "    /* Wand - endet jetzt oberhalb des Laufbandes */\n"
    "    ctx.fillStyle = fern?'#12141f':P.wand;\n"
    "    ctx.fillRect(0,deckeY,LEVEL_B,56-TUNE.tiefeBand);\n"
    "    /* Laufband: die Flaeche, auf der man nach hinten und vorne geht.\n"
    "       Ohne sichtbares Band wirkt die Tiefe wie ein Schwebefehler. */\n"
    "    ctx.fillStyle = fern?'#0e1018':'#171a29';\n"
    "    ctx.fillRect(0,by-TUNE.tiefeBand,LEVEL_B,TUNE.tiefeBand);\n"
    "    ctx.fillStyle = fern?'#141622':'#1f2334';\n"
    "    ctx.fillRect(0,by-TUNE.tiefeBand,LEVEL_B,1);")

io.open(p, 'w', encoding='utf-8').write(s)
print('Teil 1: Engine, TUNE, Zustand, Bewegung, Sicht, Tueren, Laufband')
