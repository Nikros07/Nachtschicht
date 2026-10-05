# LAUNCH — die Start-Checkliste

Für Nick. Zum Abhaken. Stand: 2026-10-05, Version 1.0.0 (`CHANGELOG.md`).

**Kein Rechtsrat.** Wo es um Namen, Impressum, Lizenzen oder Alter geht, steht hier eine
**Entscheidung**, die du triffst — keine Antwort. Wenn du unsicher bist, frag jemanden, der
sich damit auskennt (Verbraucherzentrale, Anwalt, Jugendschutz-Stelle).

---

## OFFENE ENTSCHEIDUNGEN FUER NICK

Alles, was nur du klären kannst. Nichts davon darf die Nachtroutine oder ein Werkzeug für dich
entscheiden; die Details stehen weiter unten bei „Vor dem Start“.

1. **Echte Namen der Freunde und ihr Einverständnis.** Die Crew im Spiel heißt MAX FERDI, MORITZ,
   JONAS, DENNIS, SEMIH, LEA, TOBI (dazu MARVIN, MIA, SOPHIE, KIRA, JULE, NELE, HEINZ, FINN, DAVID und
   Nebenfiguren). Wenn das echte Menschen sind: haben sie zugestimmt — Namen, Spitznamen,
   Eigenschaften, Streit- und Flirtszenen? Bei Minderjährigen die Eltern. Die heikelsten Stellen
   hat `docs/launch/story-ist.md` unter **6. PERSONEN-HINWEIS** gesammelt (zuerst: Moritz mit dem
   Fußballtrikot und dem Ausweis, Moritz als Kontakt-Abbruch im Abspann, Finn und David in Level 2,
   Tobi als Außenseiter, Jonas mit seiner Angst, Max Ferdi, der Betrunkenen-Witz über die ganze
   Crew in Level 7). Bis das geklärt ist: Namen tauschen (`python tools/umbenennen.py`) oder
   die Szenen entschärfen. Die Git-Historie behält die alten Namen. Fotos nur mit ausdrücklichem
   Einverständnis.
2. **Impressum-Platzhalter in `ueber.html`:** `[NAME]`, `[ANSCHRIFT]`, `[E-MAIL]` und
   `[WEITERE CREDITS]` ausfüllen — oder den Abschnitt samt Sprunglink streichen. Ob eine
   Anbieterangabe nötig ist, hängt davon ab, ob das Angebot rein privat bleibt; und ob eine
   Privatadresse öffentlich stehen soll, entscheidest du. (`launchcheck` warnt bis dahin: 4 Warnungen.)
3. **Lizenz:** für den Quellcode ist keine gewählt („alle Rechte vorbehalten“). MIT/Apache, GPL, eigene
   Regel oder bewusst keine? Dazu für Kunst, Texte und Töne: alle Rechte vorbehalten oder frei
   (CC BY, CC BY-NC)? Und bestätigen, dass nichts Fremdes drinsteckt.
4. **Marvin-Spiegel-Idee:** die Story-Bibel macht Marvin (und Max Ferdi) zum „Spiegel des Spielers“ — der,
   dem nie jemand Tschüss gesagt hat. Das ist der einzige Teil der Nacht, der nicht lustig sein darf,
   und er hängt an einem echten Menschen, falls MARVIN einer ist. Soll das so bleiben, entschärft
   oder gestrichen werden? (`docs/launch/STORY-BIBEL.md`, Abschnitt 1)
5. **Balance des Finales:** Level 8 (Wettlauf gegen die Sonne mit Abbiegungen, Kampf oder Frieden,
   SCHICHTWECHSEL) ist in den Unterlagen nur mit Skripten gemessen (kein Protokoll eines Menschen-Durchlaufs). Zu schwer,
   zu leicht, zu lang? Das entscheidet nur, wer es spielt (auch auf LOCKER und HART).
6. **Handy am echten Gerät testen:** alle Handy-Messungen (`docs/launch/handy-abnahme.md`) stammen aus
   der Emulation. Die Liste unter „Am echten Handy“ je einmal auf Android Chrome und iPhone Safari
   abhaken; besonders Daumenreichweite, Notch/Adressleiste, Lesbarkeit der Pixelschrift, Ton nach
   Unterbrechung, Installieren und Offline.
7. **Weitere Entscheidungen** (weiter unten): Alterstext ja/nein, Wortlaut und Sichtbarkeit des
   Inhaltshinweises, eigene Domain, zweiter Meldeweg für Fehler, Spieldauer „etwa 40 Minuten“
   (geschätzt, nicht gestoppt).

---

## STAND UND LINKS

| Was | Wo |
|:--|:--|
| Live-Adresse | https://nikros07.github.io/Nachtschicht/ |
| Quellcode | https://github.com/Nikros07/Nachtschicht |
| Veröffentlichen | `.github/workflows/pages.yml` läuft bei jedem **Push auf `main`** (oder von Hand: Actions → „Deploy to GitHub Pages" → Run workflow) und veröffentlicht den **ganzen Ordner** |
| Nachtroutine | arbeitet auf dem Branch `claude/nacht` und pusht **nie** nach `main` — veröffentlicht ist also erst, was du nach `main` mergst |
| Markierung | der Tag `vor-launch-ausbau` hält den Stand vor dem Launch-Ausbau fest |

Wichtig zu wissen:

- **Alles im Repo ist öffentlich** — auch `docs/`, `PLAN.md`, `NACHT-LOG.md`, `tools/`. GitHub
  Pages liefert den ganzen Ordner aus (`path: .`). Nichts Privates committen. Fotos der Jungs
  bleiben in `fotos/` (steht in `.gitignore`); es wurde bisher nie ein Foto committet
  (geprüft: `git log --all`, nur die Symbole in `icons/` sind Bilder).
- Fehlt die Seite nach dem ersten Push: Settings → Pages → Quelle auf **„GitHub Actions"**
  stellen, einmalig. Der Workflow versucht das selbst (`enablement: true`), das klappt aber nur
  mit den Workflow-Rechten „Read and write" (Settings → Actions → General).
- GitHub Pages liefert Seiten mit `max-age=600`: eine Änderung kann bis zu 10 Minuten nicht
  ankommen. Der Service Worker des Spiels umgeht das für `sw.js` selbst (siehe unten).

---

## VOR DEM START — Entscheidungen, die nur du treffen kannst

### Namen und Gesichter

- [ ] **Sind die Namen im Spiel echte Menschen?** Im Code stehen MAX FERDI, MORITZ, JONAS, DENNIS,
  SEMIH, LEA und TOBI als Crew (dazu FINN, DAVID, MARVIN, MIA, SOPHIE, KIRA, JULE, NELE, HEINZ und
  Nebenfiguren; Übersicht der heiklen Stellen: `docs/launch/story-ist.md`, Abschnitt 6). Wenn sie
  Freunden gehören: **haben sie zugestimmt** — Namen, Spitznamen, Eigenschaften, Streit- und
  Flirtszenen? Bei Minderjährigen gilt das erst recht für Eltern.
- [ ] **Fotos oder Pixel-Köpfe nach Fotos:** nur mit ausdrücklichem Einverständnis. Die
  `.gitignore` sagt, Originalfotos bleiben lokal und nur anonymisierte Sprites kommen in den Code.
- [ ] **Oder umbenennen** — ohne zehn Dateien von Hand anzufassen:

  ```bash
  python tools/umbenennen.py JONAS=BEN "MAX FERDI"=MAX FERDI=MAX     # nur Vorschau
  python tools/umbenennen.py JONAS=BEN "MAX FERDI"=MAX FERDI=MAX --ja
  python tools/umbenennen.py --zurueck                               # alles wieder rückgängig
  ```

  Was das Werkzeug **nicht** anfasst: `docs/`, `tools/`, `test/`, `routinen/` und alle `*.md`
  (README, PLAN, NACHT-LOG ...). Die Vorschau listet auf, wo die alten Namen dort noch stehen.
  **Auch die Git-Historie behält die alten Namen** — sie ist öffentlich. Ein Umbenennen im
  Spiel ändert daran nichts.
- [ ] Danach: `node tools/nachttest.js` und im Browser einmal durch jedes Level, auf dem Bild
  darf nichts abgeschnitten sein (neue Namen sind evtl. länger).

### Impressum und Namensangabe (`ueber.html`)

- [ ] Platzhalter in `ueber.html` ausfüllen: `[NAME]`, `[ANSCHRIFT]`, `[E-MAIL]` im Abschnitt
  IMPRESSUM und `[WEITERE CREDITS]` unter CREDITS — **oder** den Abschnitt samt Sprunglink streichen.
  `node tools/launchcheck.js` warnt, solange sie stehen.
- **Entscheidung:** Ob eine Anbieterangabe nötig ist und welche, hängt davon ab, ob das Angebot
  rein privat bleibt oder (durch Einnahmen, Werbung, Spenden, itch.io-Verkauf) darüber
  hinausgeht. Das kann ich nicht beurteilen. Auch: ob eine Privatadresse öffentlich stehen soll.
  Denk dir keine Angaben aus.
- [ ] Die Datenschutz-Aussagen in `ueber.html` stimmen mit dem Spiel überein (keine Cookies, kein
  Tracking, keine externen Anfragen, Speicher nur auf dem Gerät)? Die Startprüfung bestätigt
  „keine fremden Server im Spielcode"; **GitHub selbst** sieht beim Ausliefern die IP-Adressen,
  das steht dort auch. Bei itch.io gelten deren Regeln zusätzlich.

### Lizenzen

- [ ] **Quellcode:** es ist **keine Lizenz gewählt**. Ohne Lizenz gilt „alle Rechte vorbehalten":
  niemand darf den Code kopieren oder weiterverwenden, auch wenn er öffentlich einsehbar ist.
  Entscheidung: MIT / Apache-2.0 (frei verwendbar), GPL (Weitergabe nur wieder frei), eine
  eigene Regel — oder bewusst keine. Dann eine `LICENSE`-Datei anlegen und in README/`ueber.html`
  nennen. (`launchcheck` weist so lange hin.)
- [ ] **Eigene Kunst, Texte, Töne:** Pixel-Art, Geschichte, Dialoge, synthetisierter Ton und die
  3×5-Pixelschrift sind selbst gemacht (der Ton entsteht im Browser). Entscheidung: alle Rechte
  vorbehalten, oder frei unter CC BY 4.0 / CC BY-NC 4.0 o. ä.? Bestätigen, dass **nichts
  Fremdes** drinsteckt (Bild, Ton, Schrift, Zitate aus Liedern und Filmen).

### Inhaltshinweis und Alter

- [ ] **Wortlaut des Inhaltshinweises** prüfen: `ueber.html`, Abschnitt HINWEISE (Partynacht mit
  Alkohol, Streit und Prügeleien; Blitze und Flackern). Passt der Ton? Soll er zusätzlich vor dem
  Start sichtbar sein (nicht nur auf der Über-Seite)?
- [ ] **Alterstext ja/nein?** Das Spiel dreht sich um Alkohol, Prügeleien und Flirten im Club. Eine
  amtliche Altersfreigabe (USK, IARC ...) hat es nicht. Entscheidung: einen Hinweis wie „empfohlen ab
  X Jahren" hinschreiben — dann ist es deine Einschätzung, keine Einstufung — oder nicht. Auf
  itch.io gibt es eigene Felder für Inhaltshinweise.

### Eigene Domain?

- [ ] **Bleibt es bei `nikros07.github.io/Nachtschicht/`?** Dann ist nichts zu tun.
- Wenn du eine eigene Domain nimmst, diese Stellen anpassen:
  - `index.html`: `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` (alle mit
    vollem Pfad; der Kommentar BASISADRESSE oben nennt sie);
  - `404.html`: der Ersatzlink `href="/Nachtschicht/"` ohne Skript → `/` (das Skript erkennt
    github.io und eigene Domains selbst);
  - `robots.txt`: greift erst auf einer eigenen Domain — dort ggf. eine Sitemap-Zeile;
  - `tools/launchcheck.js`: `EIGENE_ADRESSE` und der Eintrag in `AUSNAHMEN_HOSTS`;
  - GitHub: Settings → Pages → Custom domain;
  - `README.md`: der Link „Jetzt spielen".
- Bleibt **relativ** und muss nicht angefasst werden: `manifest.webmanifest` (`start_url`,
  `scope`, `id`), `sw.js`, alle Verweise zwischen den Seiten.
- Danach `python tools/version.py`. **Spielstände wandern nicht mit:** der Browserspeicher gehört
  zur Adresse; wer von der alten zur neuen wechselt, fängt neu an.

---

## TECHNISCHE ABNAHME

### Am Rechner (alles ohne Browser)

```bash
python tools/version.py --pruefen   # Stempel, Offline-Liste, Prüfsumme (sonst: python tools/version.py)
node tools/launchcheck.js           # muss "BEREIT" sagen; Warnungen ansehen, nicht einfach ignorieren
node tools/pruefe.js                # alle 10 Seiten: Syntax, doppelte Namen
node tools/nachttest.js             # jede Seite ohne Browser durchspielen (~60 s, --kurz ~20 s)
node test/kampf.test.js             # 22 Prüfungen der Kampflogik
node test/erzaehl.test.js           # Kapitelkarte, Plausch, Momente
node test/epilog.test.js            # Knoten, Enden, Epilog, Galerie-Daten
node test/menue.test.js             # Startmenü
node test/geraet.test.js            # Fehlerschutz, Service-Worker-Anmeldung, ?reset
node test/sw.test.js                # Service Worker
node test/launch.test.js            # Tests der Startwerkzeuge
node tools/flagcheck.js             # nur lesen: Entscheidungen, die nie gelesen werden
```

`nachttest.js` kann **keine Pixel messen und nichts hören**. Alles Sichtbare und Hörbare prüft nur
ein Mensch mit Browser.

### Am echten Handy

```bash
python tools/server.py --lan      # zeigt die Adresse fürs WLAN, z. B. http://192.168.0.23:5173/
```

Handy und Rechner im selben WLAN, die Adresse im Handy-Browser öffnen. Windows fragt beim ersten
Start nach der Firewall: „Privat" erlauben. Am Rechner mit Touch-Bedienung: `?touch=1` anhängen.

**Wichtig:** Über diese Adresse (http, keine „sichere Verbindung") gibt es **keinen Service Worker**
— Offline und Installieren lassen sich damit **nicht** testen. Dafür die echte Live-Adresse
(https) nehmen, oder `localhost` mit `?sw=1` (am Android-Handy per USB-Weiterleitung aus
Chrome → `chrome://inspect`).

Was am Telefon zu prüfen ist — je einmal auf **Android Chrome** und **iPhone Safari**:

- [ ] Seite lädt, **Startmenü** sichtbar (beim ersten Mal erst der Inhaltshinweis), nichts abgeschnitten
  (Notch, Adressleiste); Einträge lassen sich antippen, die Liste wischen; WEITER erscheint erst
  nach Fortschritt; NEUE NACHT fragt bei vorhandenem Fortschritt nach; ENDEN öffnet die Galerie
  (der alte Titelbild-Weg: `?neu=1`)
- [ ] **Quer und Hoch:** im Hochformat kommt ein Hinweis zum Drehen, im Querformat passt das Bild
- [ ] Erste Berührung schaltet **Vollbild** ein (Android; auf dem iPhone gibt es keins im Browser)
- [ ] **Ton** startet nach der ersten Berührung; nach Tab-Wechsel und zurück stimmt er wieder
- [ ] **Lektion** vor Level 1: Stick, Knöpfe leuchten beim Ausprobieren; langes ENTER/Überspringen geht
- [ ] **Stick** (schwebend, sanft = schleichen, voll = gehen), **Hauptknopf**, **Tippfläche rechts**
- [ ] **Gespräch:** Antworten sind Flächen, lassen sich sicher treffen, kein versehentliches Antippen
- [ ] **Menü:** Weiter, Vollbild, Handy, Level wechseln, **Einstellungen** (Hand links/rechts,
  Größe, Stick frei/fest, Tippen rechts, Vibration) — und sie bleiben nach Neuladen erhalten
- [ ] **Flackerschutz** (Startmenü → EINSTELLUNGEN): an, dann Club (Level 5) — keine harten Blitze;
  Kapitelkarte, Plausch-Zeilen und Polaroids (Momente) sind lesbar und blockieren nichts
- [ ] **Zum Home-Bildschirm** (iPhone: Teilen → „Zum Home-Bildschirm"; Android: Menü → „App
  installieren"), Start vom Symbol: Vollbild, Querformat, Symbol sieht richtig aus (nicht abgeschnitten)
- [ ] **Offline:** einmal ganz laden (über https), Flugmodus, App/Seite neu starten — spielbar?
- [ ] **Neue Version:** nach einem zweiten Push erscheint „NEUE VERSION - TIPPEN ZUM LADEN"
- [ ] **Notausgang:** `?reset=cache` hängt nichts auf; die Fehlerseite lässt sich mit `?fehlertest=9`
  herbeiführen und zeigt NEU LADEN / ZUM MENÜ / SPIELSTAND LÖSCHEN / MELDEN
- [ ] Ein Level komplett durchspielen, auch eines mit Kampf (Level 2 oder 4)

---

## VERÖFFENTLICHEN

### GitHub Pages (der Hauptweg)

1. Nach **jeder** Änderung an Seiten, Engine, Stil oder Symbolen: `python tools/version.py`.
   Sonst sehen Besucher, die schon einmal da waren, die Änderung nie (der Service Worker hält
   die alte Fassung fest, bis sich der Stempel ändert).
2. `node tools/launchcheck.js` → **BEREIT**. Dazu die Tests oben.
3. Bei einer neuen Version: `GERAET.version` in `nacht/geraet.js` und die oberste Überschrift in
   `CHANGELOG.md` auf dieselbe Nummer. Die Startprüfung vergleicht beides.
4. Tag setzen, damit man später zurückfindet: `git tag -a v1.0.0 -m "Start" && git push --tags`.
5. Nach `main` bringen (mergen, pushen). Nach ein bis zwei Minuten läuft der Workflow durch.
6. **Kontrolle live:** die Adresse in einem privaten Fenster öffnen; in
   `…/nacht/geraet.js` steht `GERAET.version` und `GERAET.build` — der Build muss zu deinem Stand
   passen. Browser-Werkzeuge → Anwendung → Service Worker: „aktiviert", Speicher
   `nachtschicht-<Build>`.

### itch.io

```bash
python tools/paket.py            # prüft zuerst alles, baut dann dist/nachtschicht-1.0.0.zip
```

Die ZIP enthält nur, was zum Spielen nötig ist (alle Seiten, `nacht/`, Symbole, Manifest, `sw.js`,
`robots.txt`) und `index.html` im Wurzelordner. Hochladen:

1. itch.io → Dashboard → Create new project → Kind of project: **HTML**.
2. ZIP hochladen, **„This file will be played in the browser"** anhaken.
3. Embed options: Viewport **960 × 540**, **Fullscreen button** an (das Spiel hat zusätzlich seinen
   VOLLBILD-Knopf), **Mobile friendly** an (Querformat), Scrollbalken aus.
4. Cover (630 × 500) und Screenshots hochladen, Beschreibung und Tags eintragen.

**Handy-Haken auf itch.io:** das Spiel läuft dort in einem Rahmen. Auf dem **iPhone** gibt es dort
kein Vollbild — besser auf die Live-Adresse verweisen. **Installieren und Offline** sind im Rahmen
nicht verlässlich. Der **Speicher** kann gesperrt sein; das Spiel merkt es und meldet es.

**Beschreibung (Vorschlag):**

> **NACHTSCHICHT** — eine Nacht, die aus dem Ruder läuft.
> Freitag, letzter Schultag, 16:40. Du hast das Nachsitzen verpennt, die Türen sind zu — und heute
> Abend geht was. Acht Level von der Schule über den Nachtbus und die Schlange vor dem Club bis
> zum Heimweg im Morgengrauen: schleichen, reden, suchen, prügeln. Was du sagst und tust, merkt
> sich die Nacht — es gibt zehn Enden.
> Pixel-Art im Browser, Tastatur oder Handy-Steuerung, kein Download, kein Konto, kein Tracking.
> *(Hinweis: Alkohol, Streit und Prügeleien — nichts davon ist zum Nachmachen. Enthält Blitz- und
> Flackereffekte, abschaltbar.)*
> *English: A pixel-art browser game about one night that gets out of hand — stealth, dialogue and
> fistfights across eight levels. German text.*

**Tags (Vorschlag):** pixel-art, singleplayer, story-rich, stealth, beat-em-up, comedy, dialogue,
deutsch, party, mobile-friendly.

**Screenshots und GIFs** (jedes in Pixel-Größe 3× hochskaliert, ohne Rand):

- [ ] Startmenü (und Enden-Galerie)
- [ ] Level 1: Schulflur mit Sichtkegel der Lehrer
- [ ] Level 2: Wohnung (Pegel, Getränke)
- [ ] Level 3: Nachtbus mit Kontrolleuren
- [ ] Level 4 oder 5: Kampf mit goldenem Konter-Balken
- [ ] Level 5: Club (**ohne** Stroboskop-Blitze im GIF — dort Flackerschutz an oder einzelnes Bild)
- [ ] Level 6: Afterhour (Traum) und Level 8: Heimweg
- [ ] GIF 1: Schleichen und Verstecken (3–5 s) · GIF 2: ein Konter · GIF 3: Handy-Steuerung am Telefon

---

## NACH DEM START

- **Fehlermeldungen** kommen als **GitHub-Issues**: die Fehlerseite hat den Knopf MELDEN, der eine
  vorbereitete Meldung auf GitHub öffnet (nichts wird automatisch gesendet). Dafür braucht man
  ein GitHub-Konto — viele Spieler haben keins. **Entscheidung:** einen zweiten Weg nennen
  (E-Mail aus dem Impressum, Kommentare auf itch.io)?
- Zum Nachvollziehen: in der Browser-Konsole zeigt `GERAET.fehler` die letzten Fehler.
  Nachstellen mit `python tools/server.py` und `node tools/nachttest.js`.
- **Zahlen:** das Spiel misst nichts. GitHub zeigt unter Insights → Traffic Besucher der letzten
  Tage; itch.io hat eigene Statistik.
- `claude/…`-Branches auf GitHub, die niemand braucht, kannst du später löschen.

### Eine fehlerhafte Version zurückrollen

Das Spiel hat einen **Service Worker, der eine Fassung festhält** (Cache zuerst). Das ist gewollt
— und der Grund, warum man nicht einfach „die Datei zurücklegt". So geht es richtig:

1. **Rückgängig machen mit Git** — als **neuer Commit**, nie mit Löschen der Historie:

   ```bash
   git revert <commit>                 # eine fehlerhafte Änderung zurücknehmen
   git revert --no-commit <guter-stand>..HEAD && git commit   # alles seit einem guten Stand
   ```

   Bei Tag und Branch: `vor-launch-ausbau` ist der Stand **vor** dem Launch-Ausbau, `v1.0.0`
   (falls gesetzt) der Start.
2. **Immer neu stempeln, und zwar erzwungen:** `python tools/version.py --neu` (ohne `--neu` bliebe die
   Nummer erhalten, wenn der Inhalt nach dem Zurücknehmen wieder einem früheren Stand gleicht). Der neue Build-Stempel macht aus der
   zurückgenommenen Fassung für den Browser eine **neue** — er holt sie, baut einen frischen
   Speicher `nachtschicht-<neuer Stempel>` und wirft den fehlerhaften weg. Ohne neuen Stempel
   könnten Besucher, die den Fehler schon im Speicher haben, auf der kaputten Fassung sitzen
   bleiben. `python tools/version.py --pruefen` muss danach grün sein.
3. Push nach `main`. Der Browser holt `sw.js` immer am Cache vorbei (spätestens beim nächsten
   Laden einer Seite, bei offenem Spiel alle 30 Minuten).
4. **Das dauert:** ein neuer Worker übernimmt **nicht von allein** — mitten in der Nacht soll sich
   nichts ändern. Spieler sehen „NEUE VERSION - TIPPEN ZUM LADEN" und wechseln dann, oder beim
   nächsten Start nach dem Schließen aller Tabs. Wer feststeckt: `?reset=cache` an die Adresse
   (löscht nur den Offline-Speicher), oder NEU LADEN auf der Fehlerseite (beim zweiten Mal leert es den
   Speicher).
5. **`sw.js` niemals löschen oder umbenennen.** Jeder Besucher des Launches hat danach einen
   registrierten Worker; fehlt die Datei, bleibt der alte Worker mit seinem Speicher aktiv und
   niemand bekommt je wieder etwas Neues. Muss der Service Worker ganz weg, **ersetze** `sw.js`
   durch einen Notfall-Worker, der sich abmeldet:

   ```js
   self.addEventListener('install',()=>self.skipWaiting());
   self.addEventListener('activate',e=>e.waitUntil((async()=>{
     for(const k of await caches.keys()) if(k.indexOf('nachtschicht-')===0) await caches.delete(k);
     await self.registration.unregister();
     for(const c of await self.clients.matchAll({type:'window'})) c.navigate(c.url);
   })()));
   ```

---

## BEKANNTE GRENZEN

Ehrlich, was wir nicht wissen:

- **Am echten Handy ungetestet.** Die Handy-Steuerung, die Lektionen, das Menü und die
  Installation wurden ohne echtes Gerät gebaut und mit Skripten und Browser-Emulation geprüft.
  Ob der Daumen wirklich trifft, ob die Knöpfe auf kleinen Bildschirmen zu eng stehen und wie es
  auf älteren Geräten läuft, weiß erst die Abnahme oben.
- **Kein Rechtsrat.** Namen, Einverständnis, Impressum, Lizenz und Alterstext sind Entscheidungen
  von dir; hier steht nur, wo sie sich verstecken.
- **Browser sind verschieden.** iPhone-Safari hat kein Vollbild für Webseiten; der Ton startet
  überall erst nach der ersten Berührung; Querformat sperren geht nur im Vollbild oder in der
  installierten App; Safari kann den Speicher einer Website nach längerer Pause löschen
  (installierte Home-Bildschirm-Apps sind davon eher ausgenommen). Firefox und Samsung Internet
  sind nicht eigens geprüft.
- **Flackerschutz** begrenzt Blitze auf höchstens drei pro Sekunde (so verlangt es die
  Barrierefreiheits-Richtlinie WCAG 2.3.1). Gemessen am Bildschirm wurde es nicht.
- **Offline und Installieren** sind nur über https oder `localhost` mit `?sw=1` prüfbar, nicht
  über die WLAN-Adresse des Testservers.
- **`nachttest.js` sieht keine Pixel und hört keinen Ton.** Layout, Farben, Lesbarkeit und
  Lautstärke prüft nur ein Mensch.
- **Der Spielstand „WEITER“** merkt sich nur das nächste Level, nicht die Stelle im Level (`docs/launch/startmenue.md`).
- **Die Spieldauer** („etwa 40 Minuten" in `ueber.html`) ist geschätzt, nicht gestoppt.
- **Der Speicher ist je Gerät und Adresse.** Kein Spielstand-Abgleich, kein Konto; ein Adresswechsel
  setzt alle zurück.
- `robots.txt` im Unterordner (`/Nachtschicht/`) liest kein Suchroboter — sie wirkt erst auf einer
  eigenen Domain.
