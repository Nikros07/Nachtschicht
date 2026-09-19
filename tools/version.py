# -*- coding: utf-8 -*-
"""Setzt die Versionsnummer an allen Engine-Einbindungen neu.

Nach JEDER Aenderung in nacht/*.js ausfuehren:  python tools/version.py

Warum: Browser (und GitHub Pages mit max-age 600) halten die Engine-Dateien
im Cache. Kommt ein neues Level mit einer alten Engine zusammen, fehlen
Funktionen - beim Testen stuerzte update() mit "tempo2D is not defined" ab.
Die Nummer im Pfad zwingt den Browser, die passende Fassung zu holen.
"""
import io, re, time
V = time.strftime('%Y%m%d%H%M')
for f in ['index.html', 'karte.html', 'runner.html'] + ['level%d.html' % i for i in range(2, 9)]:
    s = io.open(f, encoding='utf-8').read()
    s = re.sub(r'<script src="nacht/([a-z]+)\.js(\?v=[0-9]+)?"></script>',
               r'<script src="nacht/\1.js?v=' + V + '"></script>', s)
    io.open(f, 'w', encoding='utf-8').write(s)
print('Engine-Version', V)
