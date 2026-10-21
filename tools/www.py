# -*- coding: utf-8 -*-
"""Kopiert das Spiel in den Ordner www/ - dort holt Capacitor die Dateien fuer die App-Huellen.

  python tools/www.py                    Startpruefung, dann Kopie nach <projekt>/www
  python tools/www.py --trotzdem         harte Fehler der Startpruefung uebergehen (wie tools/paket.py)
  python tools/www.py --ziel <ordner>    in einen anderen Ordner kopieren (Pfad relativ zum Aufrufort)
  python tools/www.py --leise            nur Fehler und das Ergebnis, keine Schritte-Liste
  python tools/www.py --hilfe            diese Hilfe

Was hineinkommt - dieselbe Dateiliste wie das ZIP fuer itch.io (tools/paket.py, dateiliste()):
  alle *.html im Wurzelordner, nacht/*.js, nacht/stil.css, icons/*,
  manifest.webmanifest, sw.js, robots.txt
Nicht hinein: docs/, tools/, test/, routinen/, .github/, .git, alle Markdown- und Python-Dateien.

Warum eine Kopie: capacitor.config.json nennt webDir "www". Die Kopie entsteht bei jedem Bau
neu und steht in .gitignore. Geaendert wird im Spiel, nie in www/.

Sicherheit beim Leeren: Der Zielordner wird nur neu angelegt, wenn er nicht existiert, leer ist
oder die Markierungsdatei .aus-tools-www enthaelt. Sonst bricht das Skript mit Exit-Code 2 ab.
Fremde Dateien werden nie geloescht.

Die Startpruefung (tools/launchcheck.js) laeuft vorher wie beim Paket. Ohne --trotzdem bricht
sie bei harten Fehlern ab (Exit-Code 1), mit --trotzdem wird weitergebaut und gewarnt.
"""
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import paket  # noqa: E402 - liest --trotzdem/--leise beim Import; unten setzen wir sie ausdruecklich

ARGS = sys.argv[1:]
WURZEL = paket.WURZEL
MARKE = '.aus-tools-www'
MARKE_TEXT = ('Dieser Ordner wird von tools/www.py erzeugt und darf jederzeit ueberschrieben werden.\n')
BEKANNT = ('--trotzdem', '--leise', '--hilfe', '-h')

SCHRITTE = """
Naechste Schritte:
  1. npx cap sync      (kopiert www/ in die Android- und iOS-Projekte; npm run sync macht beides)
  2. Details zu Android, iOS und der Store-Einreichung: docs/store/ANLEITUNG.md
"""


def zielwert():
    """Der Wert hinter --ziel (als '--ziel X' oder '--ziel=X'). None, wenn nicht angegeben."""
    for i, a in enumerate(ARGS):
        if a == '--ziel':
            if i + 1 >= len(ARGS) or ARGS[i + 1].startswith('--'):
                paket.abbruch('--ziel braucht einen Ordner, z. B. --ziel C:\\Bau\\www')
            return ARGS[i + 1]
        if a.startswith('--ziel='):
            wert = a[len('--ziel='):]
            if not wert:
                paket.abbruch('--ziel= braucht einen Ordner.')
            return wert
    return None


def optionen_pruefen():
    """Unbekannte Optionen abweisen, statt sie stillschweigend zu uebergehen."""
    ueberspringen = False
    for a in ARGS:
        if ueberspringen:
            ueberspringen = False
            continue
        if a == '--ziel':
            ueberspringen = True
        elif a.startswith('--ziel=') or a in BEKANNT:
            continue
        else:
            paket.abbruch('Unbekannte Option "%s". Hilfe: python tools/www.py --hilfe' % a)


def ziel_bestimmen():
    wert = zielwert()
    if wert is None:
        return os.path.join(WURZEL, 'www')
    return os.path.abspath(wert)


def zielordner_pruefen(ziel):
    """Darf der Ordner geleert werden? Nur, wenn er fehlt, leer ist oder unsere Markierung hat."""
    norm = os.path.normcase
    if norm(ziel) == norm(WURZEL) or norm(WURZEL).startswith(norm(ziel).rstrip(os.sep) + os.sep):
        paket.abbruch('Der Zielordner %s enthaelt das Projekt (oder ist es). Nichts geloescht.' % ziel)
    if not os.path.exists(ziel):
        return
    if os.path.isfile(ziel):
        paket.abbruch('%s ist eine Datei, kein Ordner. Nichts geloescht.' % ziel)
    if not os.listdir(ziel):
        return
    if os.path.isfile(os.path.join(ziel, MARKE)):
        return
    paket.abbruch('Der Ordner %s ist nicht leer und hat keine Markierungsdatei %s - er gehoert '
                  'nicht zu tools/www.py. Nichts geloescht. Anderen Ordner mit --ziel angeben.' % (ziel, MARKE))


def leeren_und_anlegen(ziel):
    if os.path.exists(ziel):
        shutil.rmtree(ziel)
    os.makedirs(ziel)


def kopieren(ziel, liste):
    for f in liste:
        pfad = os.path.join(ziel, f.replace('/', os.sep))
        os.makedirs(os.path.dirname(pfad), exist_ok=True)
        shutil.copy2(os.path.join(WURZEL, f.replace('/', os.sep)), pfad)
    with open(os.path.join(ziel, MARKE), 'w', encoding='utf-8') as m:
        m.write(MARKE_TEXT)


def nachpruefen(ziel, liste):
    """Jede Datei der Liste liegt im Ziel, nichts Fremdes darin, index.html vorhanden.
    Gibt (Anzahl Dateien, Groesse in Byte) zurueck."""
    erlaubt = set(liste) | {MARKE}
    if 'index.html' not in liste or not os.path.isfile(os.path.join(ziel, 'index.html')):
        paket.abbruch('index.html fehlt im Ziel.')
    for f in liste:
        if not os.path.isfile(os.path.join(ziel, f.replace('/', os.sep))):
            paket.abbruch('"%s" fehlt im Ziel nach dem Kopieren.' % f)
    anzahl = 0
    groesse = 0
    for wurzel, _ordner, dateien in os.walk(ziel):
        for n in dateien:
            pfad = os.path.join(wurzel, n)
            rel = os.path.relpath(pfad, ziel).replace(os.sep, '/')
            if rel.startswith(paket.VERBOTEN_ANFANG) or rel.endswith(paket.VERBOTEN_ENDUNG):
                paket.abbruch('"%s" darf nicht ins Ziel (Entwickler-Datei).' % rel)
            if rel not in erlaubt:
                paket.abbruch('"%s" liegt im Ziel, gehoert aber nicht zur Liste.' % rel)
            anzahl += 1
            groesse += os.path.getsize(pfad)
    return anzahl, groesse


def main():
    if '--hilfe' in ARGS or '-h' in ARGS:
        print(__doc__)
        return
    optionen_pruefen()
    paket.TROTZDEM = '--trotzdem' in ARGS
    paket.LEISE = '--leise' in ARGS
    ziel = ziel_bestimmen()
    version = paket.spielversion()
    zielordner_pruefen(ziel)  # vor der Startpruefung: ein falsches Ziel faellt sofort auf
    if not paket.startpruefung():
        if not paket.TROTZDEM:
            print('')
            paket.abbruch('Die Startpruefung hat harte Fehler gemeldet - nichts kopiert. '
                          '(Mit --trotzdem trotzdem kopieren.)', 1)
        paket.sag('')
        paket.sag('ACHTUNG: harte Fehler uebergangen (--trotzdem). Diese Fassung nicht veroeffentlichen, '
                  'bevor sie behoben sind.')
    liste = paket.dateiliste()
    paket.pruefe_liste(liste)
    for f in ('sw.js', 'robots.txt', 'nacht/stil.css'):
        if f not in liste:
            paket.sag('Hinweis: %s fehlt und ist deshalb nicht im Ziel.' % f)
    leeren_und_anlegen(ziel)
    kopieren(ziel, liste)
    anzahl, groesse = nachpruefen(ziel, liste)
    paket.sag('')
    paket.sag('Kopie fertig: %s' % ziel)
    paket.sag('  Version:  %s' % version)
    paket.sag('  Dateien:  %d' % anzahl)
    paket.sag('  Groesse:  %s' % paket.kb(groesse))
    if not paket.LEISE:
        paket.sag(SCHRITTE)


if __name__ == '__main__':
    main()
