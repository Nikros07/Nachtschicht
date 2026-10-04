# Tests

Kein Framework, kein Build - einfach ausfuehren:

```bash
node test/kampf.test.js
```

Die Kampflogik ist reine Zustandsmathematik und laesst sich deshalb ohne
Browser durchrechnen. Das ist gruendlicher als Klicken und faengt
Regressionen beim weiteren Ausbau.

Was im Browser geprueft werden muss (Rendern, Eingabe, Touch), steht nicht
hier - dafuer die Level einzeln aufmachen und die Konsole im Auge behalten.

## Gerät und Offline

```bash
node test/sw.test.js        # Service Worker (sw.js) in einer Attrappe: install, activate, fetch, Neuinstallation
node test/geraet.test.js    # nacht/geraet.js: Fehlerschutz, Fehlerseite, Toast, Ton im Hintergrund, Service-Worker-Anmeldung, ?reset
python tools/version.py --pruefen   # stimmen Stempel, Offline-Liste und Prüfsumme?
```

Beide Tests laufen ohne Browser gegen Attrappen. Nicht prüfbar: Aussehen der Fehlerseite,
Lage des Toasts neben der Touch-Bedienung, der echte Service-Worker-Lebenszyklus.
Mit `SW_DATEI=pfad` bzw. `GERAET_DATEI=pfad` lässt sich eine absichtlich beschädigte Fassung
prüfen, um zu sehen, dass der Test sie bemerkt.
