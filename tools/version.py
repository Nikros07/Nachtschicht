# -*- coding: utf-8 -*-
"""Setzt die Versionsnummer an allen Engine-Einbindungen neu.

Nach JEDER Aenderung in nacht/*.js, an einer Seite (*.html), am Stil oder an den
Icons ausfuehren:  python tools/version.py

Warum: Browser (und GitHub Pages mit max-age 600) halten die Engine-Dateien
im Cache. Kommt ein neues Level mit einer alten Engine zusammen, fehlen
Funktionen - beim Testen stuerzte update() mit "tempo2D is not defined" ab.
Die Nummer im Pfad zwingt den Browser, die passende Fassung zu holen.

Was gestempelt wird (eine Nummer fuer alles, Format JJJJMMTTHHMM):
  - in allen *.html im Wurzelordner: die <script src="nacht/NAME.js?v=...">-Tags
    und der Stil <link ... href="nacht/stil.css?v=...">
  - in sw.js: die Konstante BUILD (= Name des Offline-Speichers nachtschicht-<BUILD>),
    die Pruefsumme INHALT und die Liste PRECACHE zwischen den Markierungen
    // PRECACHE-START und // PRECACHE-ENDE
  - in nacht/geraet.js: GERAET.build

Aendert sich seit dem letzten Lauf nichts, bleibt die Nummer gleich; mit --neu wird sie
erzwungen (noetig nach einem Zurueckrollen, siehe LAUNCH.md).

Der Service Worker (sw.js) haelt eine Fassung fest, bis sich BUILD aendert. Eine Seite
oder Engine-Datei zu aendern, OHNE dieses Skript zu starten, hiesse also: wer das
Spiel schon besucht hat, sieht die Aenderung nie. Deshalb:

  python tools/version.py --pruefen

meldet (Exit 1), wenn sich Dateien seit dem letzten Stempeln geaendert haben, wenn
die PRECACHE-Liste nicht zu den vorhandenen Dateien passt oder ein Stempel von BUILD
abweicht. Aendert nichts.
"""
import glob, hashlib, io, os, re, sys, time

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(WURZEL)          # Pfade unten sind relativ zum Spielordner, egal von wo gestartet wird

# Das Aeltere: <script src="nacht/NAME.js?v=ZAHL"></script>
SKRIPT = re.compile(r'<script src="nacht/([a-z]+)\.js(\?v=[0-9]+)?"></script>')
# Neu: der Stil. Attributreihenfolge egal; nur die Zahl nach ?v= wird ersetzt.
STIL = re.compile(r'(href="nacht/stil\.css)(\?v=[0-9]+)?(")')
STEMPEL_IN_HTML = re.compile(r'(?:src|href)="nacht/[a-z]+\.(?:js|css)\?v=([0-9]+)"')
BUILD_IN_JS = re.compile(r'(GERAET\.build=")([^"]*)(")')
BUILD_IN_SW = re.compile(r"(const BUILD=')([^']*)(';)")
INHALT_IN_SW = re.compile(r"(const INHALT=')([^']*)(';)")
BLOCK_IN_SW = re.compile(r'(// PRECACHE-START\r?\n)(.*?)(// PRECACHE-ENDE)', re.S)


def lies(pfad):
    # newline='' : Zeilenenden bleiben, wie sie sind (manche Dateien CRLF, manche LF);
    # sonst erschiene jede Datei bei jedem Lauf als komplett geaendert.
    with io.open(pfad, encoding='utf-8', newline='') as f:
        return f.read()


def schreibe(pfad, text):
    with io.open(pfad, 'w', encoding='utf-8', newline='') as f:
        f.write(text)


def seiten():
    return sorted(glob.glob('*.html'))


def precache_liste():
    """Alle Dateien, die offline gebraucht werden: alphabetisch, ohne Doppelte, relativ."""
    d = set()
    for f in glob.glob('*.html'):
        if f != '404.html':          # die Fehlerseite des Servers gehoert nicht in den Speicher
            d.add(f)
    for f in glob.glob('nacht/*.js'):
        d.add(f.replace('\\', '/'))
    for f in ['nacht/stil.css', 'manifest.webmanifest', 'ueber.html']:
        if os.path.isfile(f):
            d.add(f)
    for f in glob.glob('icons/*'):
        if os.path.isfile(f):
            d.add(f.replace('\\', '/'))
    return sorted(d)


def pruefsumme(dateien):
    """Hash ueber den Inhalt aller Vorab-Dateien. Die Stempel selbst (?v=..., GERAET.build)
    zaehlen nicht mit, sonst aenderte jedes Stempeln die Summe; Zeilenenden auch nicht,
    damit Windows (CRLF) und Linux (LF) dieselbe Summe bekommen."""
    h = hashlib.sha1()
    for f in dateien:
        with open(f, 'rb') as fh:
            b = fh.read().replace(b'\r\n', b'\n')
        if f.endswith('.html'):
            b = re.sub(rb'\?v=[0-9]+', b'', b)
        elif f == 'nacht/geraet.js':
            b = re.sub(rb'(GERAET\.build=")[^"]*(")', rb'\1\2', b)
        h.update(f.encode('utf-8') + b'\0' + b + b'\0')
    return h.hexdigest()[:16]


def neue_nummer():
    """Die Nummer fuer diesen Lauf. Aendert sich seit dem letzten Stempeln nichts
    (gleiche Pruefsumme), bleibt die alte: sonst muessten alle Spieler bei jedem Lauf
    ohne Aenderung alles neu laden. Aendert sich etwas, muss die Nummer immer GROESSER
    werden als die alte - zwei Laeufe in derselben Minute gaeben sonst denselben
    Speichernamen nachtschicht-<BUILD> mit anderem Inhalt, und ein Browser, der die
    erste Fassung hat, bemerkte das Update nie richtig."""
    jetzt = time.strftime('%Y%m%d%H%M')
    if '--neu' in sys.argv and os.path.isfile('sw.js'):
        # Erzwungen (etwa nach einem Zurueckrollen mit git revert): immer eine frische, hoehere Nummer.
        b = BUILD_IN_SW.search(lies('sw.js'))
        alt = b.group(2) if b else ''
        return jetzt if not alt.isdigit() or int(jetzt) > int(alt) else str(int(alt) + 1)
    if not os.path.isfile('sw.js'):
        return jetzt
    sw = lies('sw.js')
    b, i = BUILD_IN_SW.search(sw), INHALT_IN_SW.search(sw)
    alt = b.group(2) if b else ''
    if not alt.isdigit():
        return jetzt
    if i and i.group(2) == pruefsumme(precache_liste()):
        return alt
    return jetzt if int(jetzt) > int(alt) else str(int(alt) + 1)


def stempeln():
    v = neue_nummer()
    for f in seiten():
        s = lies(f)
        neu = SKRIPT.sub(lambda m: '<script src="nacht/%s.js?v=%s"></script>' % (m.group(1), v), s)
        neu = STIL.sub(lambda m: m.group(1) + '?v=' + v + m.group(3), neu)
        if neu != s:
            schreibe(f, neu)

    if os.path.isfile('nacht/geraet.js'):
        s = lies('nacht/geraet.js')
        neu = BUILD_IN_JS.sub(lambda m: m.group(1) + v + m.group(3), s)
        if neu != s:
            schreibe('nacht/geraet.js', neu)
    else:
        print('!!  nacht/geraet.js fehlt - GERAET.build nicht gestempelt')

    dateien = precache_liste()
    if os.path.isfile('sw.js'):
        s = lies('sw.js')
        nl = '\r\n' if '\r\n' in s else '\n'
        zeilen = ''.join("  '%s',%s" % (f, nl) for f in dateien)
        block = 'const PRECACHE=[' + nl + zeilen + '];' + nl
        neu = BUILD_IN_SW.sub(lambda m: m.group(1) + v + m.group(3), s)
        neu = INHALT_IN_SW.sub(lambda m: m.group(1) + pruefsumme(dateien) + m.group(3), neu)
        neu, n = BLOCK_IN_SW.subn(lambda m: m.group(1) + block + m.group(3), neu)
        if n != 1 or not BUILD_IN_SW.search(neu) or not INHALT_IN_SW.search(neu):
            raise SystemExit('sw.js: BUILD, INHALT oder die Markierungen PRECACHE-START/-ENDE fehlen')
        if neu != s:
            schreibe('sw.js', neu)
    else:
        print('!!  sw.js fehlt - Offline-Liste nicht geschrieben')
    print('Engine-Version', v, '-', len(dateien), 'Dateien vorab im Offline-Speicher')


def pruefen():
    """Gibt die Probleme aus; Exit 1, wenn es welche gibt."""
    probleme = []
    if not os.path.isfile('sw.js'):
        raise SystemExit('sw.js fehlt')
    sw = lies('sw.js')
    b = BUILD_IN_SW.search(sw)
    build = b.group(2) if b else None
    if not build or build == 'STAND':
        probleme.append('sw.js: BUILD ist nicht gestempelt')
    # 1. Stempel in den Seiten und in geraet.js muessen zu BUILD passen
    for f in seiten():
        for z in set(STEMPEL_IN_HTML.findall(lies(f))):
            if z != build:
                probleme.append('%s: Stempel ?v=%s statt %s' % (f, z, build))
    g = BUILD_IN_JS.search(lies('nacht/geraet.js')) if os.path.isfile('nacht/geraet.js') else None
    if g and g.group(2) != build:
        probleme.append('nacht/geraet.js: GERAET.build=%s statt %s' % (g.group(2), build))
    # 2. Die Liste muss zu den vorhandenen Dateien passen
    m = BLOCK_IN_SW.search(sw)
    im_sw = re.findall(r"'([^']+)'", m.group(2)) if m else []
    soll = precache_liste()
    if im_sw != soll:
        fehlt = [f for f in soll if f not in im_sw]
        zuviel = [f for f in im_sw if f not in soll]
        probleme.append('PRECACHE passt nicht: fehlt %s, zuviel %s' % (fehlt, zuviel))
    # 3. Hat sich etwas geaendert, seit zuletzt gestempelt wurde?
    i = INHALT_IN_SW.search(sw)
    if not i or i.group(2) != pruefsumme(soll):
        probleme.append('Dateien haben sich seit dem letzten Stempeln geaendert - python tools/version.py')
    for p in probleme:
        print('!!  ' + p)
    if not probleme:
        print('OK  Stempel, Offline-Liste und Pruefsumme stimmen (BUILD %s)' % build)
    return 1 if probleme else 0


if __name__ == '__main__':
    if '--pruefen' in sys.argv:
        sys.exit(pruefen())
    stempeln()
