# -*- coding: utf-8 -*-
"""Baut das Spiel-Paket fuer itch.io (und jeden anderen Ort, der eine ZIP-Datei haben will).

  python tools/paket.py              Startpruefung, dann dist/nachtschicht-<version>.zip
  python tools/paket.py --trotzdem   die Startpruefung (tools/launchcheck.js) nicht abwarten
  python tools/paket.py --leise      nur Fehler und das Ergebnis, keine itch.io-Anleitung

Was hineinkommt - nur, was das Spiel zum Laufen braucht:
  alle *.html im Wurzelordner, nacht/*.js, nacht/stil.css, icons/*,
  manifest.webmanifest, sw.js, robots.txt
index.html liegt im Wurzelordner der ZIP-Datei (itch.io verlangt das).
Nicht hinein: docs/, tools/, test/, routinen/, .github/, .git, alle Markdown-Dateien
(Notizen, Plaene und Protokolle gehoeren nicht zum Spiel).

Warum die Startpruefung vorher laeuft: ein Paket mit fehlendem Symbol oder altem
Offline-Stempel merkt man erst, wenn es hochgeladen ist. launchcheck.js stoppt hier
bei harten Fehlern. Die Dateiliste oben ist dieselbe Regel wie in launchcheck.js
(Funktion auszuliefern) - bei einer Aenderung beide anpassen.

Die Versionsnummer steht in nacht/geraet.js (GERAET.version). Die ZIP-Datei heisst
danach, damit man mehrere Staende nebeneinander aufheben kann.
"""
import glob
import io
import os
import re
import subprocess
import sys
import tempfile
import zipfile

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARGS = sys.argv[1:]
TROTZDEM = '--trotzdem' in ARGS
LEISE = '--leise' in ARGS

# Diese Anfaenge/Endungen duerfen NIE in der ZIP landen (zweite Sicherung neben der Dateiliste:
# faengt ab, falls jemand eine Regel erweitert und dabei zu viel erwischt).
VERBOTEN_ANFANG = ('docs/', 'tools/', 'test/', 'routinen/', '.github/', '.git', '.claude/', 'dist/')
VERBOTEN_ENDUNG = ('.md', '.py')


def sag(text=''):
    print(text)


def abbruch(text, code=2):
    print('FEHLER: ' + text)
    sys.exit(code)


def lies(rel):
    with io.open(os.path.join(WURZEL, rel), encoding='utf-8') as f:
        return f.read()


def spielversion():
    """GERAET.version aus nacht/geraet.js - ohne Kommentare, damit "Version 0.9" im Text nicht zaehlt."""
    pfad = os.path.join('nacht', 'geraet.js')
    if not os.path.isfile(os.path.join(WURZEL, pfad)):
        abbruch('nacht/geraet.js fehlt - daraus kommt die Versionsnummer.')
    code = lies(pfad)
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.S)
    code = re.sub(r'(?m)^\s*//.*$', '', code)
    m = re.search(r'VERSION\w*\s*[:=]\s*["\']v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)["\']', code, re.I)
    if not m:
        abbruch('In nacht/geraet.js steht keine Spielversion (erwartet: GERAET.version="1.0.0").')
    return m.group(1)


def startpruefung():
    """Fuehrt tools/launchcheck.js aus. Gibt True zurueck, wenn es keine harten Fehler gibt."""
    skript = os.path.join(WURZEL, 'tools', 'launchcheck.js')
    if not os.path.isfile(skript):
        if TROTZDEM:
            sag('Hinweis: tools/launchcheck.js fehlt - ohne Startpruefung weiter (--trotzdem).')
            return True
        abbruch('tools/launchcheck.js fehlt. Mit --trotzdem trotzdem bauen.')
    sag('Startpruefung (tools/launchcheck.js) ...')
    try:
        r = subprocess.run(['node', skript, '--leise'], cwd=WURZEL)
    except FileNotFoundError:
        if TROTZDEM:
            sag('Hinweis: Node.js nicht gefunden - die Startpruefung faellt aus (--trotzdem).')
            return True
        abbruch('Node.js nicht gefunden - ohne es laeuft die Startpruefung nicht. '
                'Installieren (nodejs.org) oder mit --trotzdem bauen.')
    return r.returncode == 0


def dateiliste():
    """Die Laufzeitdateien in fester Reihenfolge, index.html zuerst. Dieselbe Regel wie
    auszuliefern() in tools/launchcheck.js."""
    def rel(pfade):
        return sorted(os.path.relpath(p, WURZEL).replace(os.sep, '/') for p in pfade if os.path.isfile(p))
    seiten = rel(glob.glob(os.path.join(WURZEL, '*.html')))
    seiten.sort(key=lambda f: (f != 'index.html', f))
    liste = list(seiten)
    liste += rel(glob.glob(os.path.join(WURZEL, 'nacht', '*.js')))
    liste += rel([os.path.join(WURZEL, 'nacht', 'stil.css')])
    liste += rel(glob.glob(os.path.join(WURZEL, 'icons', '*')))
    liste += rel([os.path.join(WURZEL, f) for f in ('manifest.webmanifest', 'sw.js', 'robots.txt')])
    return liste


def pruefe_liste(liste):
    if 'index.html' not in liste:
        abbruch('index.html fehlt - ohne sie ist das Paket nutzlos.')
    for f in liste:
        if f.startswith(VERBOTEN_ANFANG) or f.endswith(VERBOTEN_ENDUNG) or '/' in f and f.split('/')[0].startswith('.'):
            abbruch('"%s" darf nicht ins Paket (Entwickler-Datei).' % f)


def kb(b):
    return '%.1f KB' % (b / 1024.0)


def bauen(version, liste):
    ziel_ordner = os.path.join(WURZEL, 'dist')
    os.makedirs(ziel_ordner, exist_ok=True)
    ziel = os.path.join(ziel_ordner, 'nachtschicht-%s.zip' % version)
    # Erst in eine Nebendatei schreiben: bricht der Bau ab, bleibt das alte Paket ganz.
    fd, tmp = tempfile.mkstemp(suffix='.zip', dir=ziel_ordner)
    os.close(fd)
    try:
        with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
            for f in liste:
                z.write(os.path.join(WURZEL, f), f)
        os.replace(tmp, ziel)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
    return ziel


def nachpruefen(ziel, liste):
    """Das fertige Paket noch einmal oeffnen: ist es ganz, liegt index.html oben, stimmt die Zahl?"""
    with zipfile.ZipFile(ziel) as z:
        if z.testzip() is not None:
            abbruch('Das fertige Paket ist beschaedigt (%s).' % z.testzip())
        namen = z.namelist()
        entpackt = sum(i.file_size for i in z.infolist())
    if 'index.html' not in namen:
        abbruch('index.html liegt nicht im Wurzelordner der ZIP-Datei.')
    if sorted(namen) != sorted(liste):
        abbruch('Das Paket enthaelt andere Dateien als die Liste (%d statt %d).' % (len(namen), len(liste)))
    return len(namen), entpackt


ANLEITUNG = """
So geht es auf itch.io weiter:
  1. itch.io > Dashboard > "Create new project". "Kind of project": HTML.
  2. Die ZIP-Datei hochladen und bei ihr "This file will be played in the browser" anhaken.
  3. Embed options: Viewport dimensions 960 x 540 (das Spiel ist 16:9, 320x180 mal 3).
     "Fullscreen button" anhaken (das Spiel hat zusaetzlich seinen eigenen VOLLBILD-Knopf).
     "Mobile friendly" anhaken, Ausrichtung Quer. Scrollbalken aus.
  4. Cover (630x500) und Screenshots hochladen; Beschreibung und Tags siehe LAUNCH.md.

Handy-Haken, vorher wissen:
  - itch.io zeigt das Spiel in einem eingebetteten Rahmen. Die eingebaute Handy-Steuerung
    laeuft darin, aber iPhone-Safari kennt kein Vollbild fuer eingebettete Seiten: das
    Spiel bleibt dort ein kleines Fenster. Fuer iPhones auf die GitHub-Pages-Adresse
    verweisen (dort geht "Zum Home-Bildschirm").
  - Installieren und Offline-Spielen (Service Worker) sind auf itch.io nicht verlaesslich:
    das Spiel liegt dort auf einer fremden Adresse im Rahmen. Es laeuft trotzdem, nur eben
    als normales Browserspiel.
  - Ton startet erst nach der ersten Beruehrung oder Taste (Regel der Browser).
  - Der Speicher des Browsers (Spielstand, Einstellungen) kann im Rahmen gesperrt sein, etwa
    im privaten Fenster. Das Spiel merkt es und laeuft ohne dauerhaften Spielstand weiter.
  - ueber.html (Namensangabe, Datenschutz) liegt mit im Paket: die Platzhalter darin vorher
    ausfuellen (launchcheck warnt davor).
"""


def main():
    if '--hilfe' in ARGS or '-h' in ARGS:
        print(__doc__)
        return
    version = spielversion()
    if not startpruefung():
        if not TROTZDEM:
            print('')
            abbruch('Die Startpruefung hat harte Fehler gemeldet - kein Paket gebaut. '
                    '(Mit --trotzdem trotzdem bauen.)', 1)
        sag('')
        sag('ACHTUNG: harte Fehler uebergangen (--trotzdem). Dieses Paket nicht veroeffentlichen, '
            'bevor sie behoben sind.')
    liste = dateiliste()
    pruefe_liste(liste)
    for f in ('sw.js', 'robots.txt', 'nacht/stil.css'):
        if f not in liste:
            sag('Hinweis: %s fehlt und ist deshalb nicht im Paket.' % f)
    ziel = bauen(version, liste)
    anzahl, entpackt = nachpruefen(ziel, liste)
    sag('')
    sag('Paket fertig: %s' % os.path.relpath(ziel, WURZEL).replace(os.sep, '/'))
    sag('  Version:  %s' % version)
    sag('  Dateien:  %d' % anzahl)
    sag('  Groesse:  %s gepackt, %s entpackt' % (kb(os.path.getsize(ziel)), kb(entpackt)))
    if not LEISE:
        sag(ANLEITUNG)


if __name__ == '__main__':
    main()
