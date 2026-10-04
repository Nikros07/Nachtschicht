# -*- coding: utf-8 -*-
"""Haengt eine neue Engine-Datei in die Seiten ein - ohne dass man zehn HTML-Dateien
von Hand anfassen muss.

  python tools/engine_einbinden.py plausch --nach dialog
  python tools/engine_einbinden.py plausch --nach dialog --seiten level5,level6
  python tools/engine_einbinden.py plausch --nach dialog --pruefen     (nur anzeigen)

Fuegt   <script src="nacht/plausch.js?v=...">   hinter dem Tag der Datei ein, die
hinter --nach steht. Seiten, in denen diese Datei fehlt, bekommen den Tag hinter
dem letzten Engine-Tag. Wer schon eingebunden ist, bleibt unberuehrt (laeuft
beliebig oft). Die Versionsnummer uebernimmt das Skript vom Nachbarn;
python tools/version.py setzt sie danach einheitlich.

Reihenfolge ist Ladereihenfolge: die neue Datei darf nur benutzen, was vor ihr
geladen wurde (siehe ARCHITEKTUR.md). kern.js muss zuerst kommen.
"""
import io, re, sys

ALLE = ['index.html', 'karte.html', 'runner.html'] + ['level%d.html' % i for i in range(2, 9)]


def main():
    arg = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not arg:
        raise SystemExit(__doc__)
    name = arg[0]
    nach = None
    seiten = ALLE
    nur_pruefen = '--pruefen' in sys.argv
    for i, a in enumerate(sys.argv):
        if a == '--nach' and i + 1 < len(sys.argv):
            nach = sys.argv[i + 1]
        if a == '--seiten' and i + 1 < len(sys.argv):
            ws = [w.strip() for w in sys.argv[i + 1].split(',') if w.strip()]
            seiten = [w if w.endswith('.html') else (w + '.html') for w in ws]
            seiten = ['index.html' if w == 'level1.html' else w for w in seiten]
    for f in seiten:
        s = io.open(f, encoding='utf-8').read()
        if 'nacht/%s.js' % name in s:
            print('--  %-12s schon eingebunden' % f)
            continue
        m = None
        if nach:
            m = re.search(r'<script src="nacht/%s\.js\?v=([0-9]+)"></script>\n' % re.escape(nach), s)
        if not m:
            alle = list(re.finditer(r'<script src="nacht/[a-z]+\.js\?v=([0-9]+)"></script>\n', s))
            m = alle[-1] if alle else None
        if not m:
            print('!!  %-12s keine Engine-Tags gefunden' % f)
            continue
        tag = '<script src="nacht/%s.js?v=%s"></script>\n' % (name, m.group(1))
        if nur_pruefen:
            print('..  %-12s wuerde einfuegen hinter %s' % (f, re.search(r'nacht/([a-z]+)\.js', m.group(0)).group(1)))
            continue
        s = s[:m.end()] + tag + s[m.end():]
        io.open(f, 'w', encoding='utf-8', newline='').write(s)
        print('ok  %-12s eingebunden' % f)


if __name__ == '__main__':
    main()
