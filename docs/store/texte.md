# Store-Texte NACHTSCHICHT (Entwurf)

Stand: 2026-10-21. Quellen: `docs/gameplay/recherche-store.md` (Stand 2026-10-05, Hauptquelle), `README.md`, `ueber.html`, `nacht/texte.js`, `nacht/wertung.js`, `manifest.webmanifest`, `LAUNCH.md`.

**Legende**

- **ENTSCHEIDUNG NÖTIG**: Nick muss das festlegen. Ich schlage nur vor.
- **(prüfen)**: steht nicht in den Quellen oder ist dort nur als Erwartung/Schätzung markiert.
- Zeichenzahlen sind mit Python gezählt, Zeilenumbrüche inklusive.
- Kein Rechtsrat.

---

## 1. App-Name

```text
NACHTSCHICHT
```

12 Zeichen. Grenze Apple: höchstens 30 Zeichen und im Store eindeutig (recherche-store.md §4.1, Punkt 2.3.7).

**ENTSCHEIDUNG NÖTIG:** Im Google Play Store gibt es schon „Nachtschicht Kaiserslautern“ (recherche-store.md §7, Punkt 13). Vorschlag mit Zusatz:

```text
NACHTSCHICHT: Eine Nacht
```

24 Zeichen. Vorher Markenregister (DPMA/EUIPO) prüfen (recherche-store.md §7, Punkt 13).

---

## 2. Untertitel (iOS)

```text
Eine Nacht, acht Level
```

22 Zeichen. Grenze Apple: 30 (recherche-store.md §9). „Drunk“ bewusst weggelassen (recherche-store.md §7, Punkt 13).

---

## 3. Kurzbeschreibung (Google Play)

```text
Eine Nacht, die aus dem Ruder läuft: schleichen, reden, kämpfen, zehn Enden.
```

76 Zeichen. Grenze Google Play: 80 (recherche-store.md §9).

---

## 4. Langbeschreibung

```text
Freitag, letzter Schultag, 16:40. Du hast das Nachsitzen verpennt, die Türen sind zu, und heute Abend geht was. NACHTSCHICHT ist ein Pixel-Art-Spiel über eine Nacht, die aus dem Ruder läuft: von der Schule bis zum Heimweg, wenn die Sonne aufgeht.

Acht Level, acht Orte:
- Die Schule: schleichen, Zettel lesen, den Lehrern ausweichen
- Bei Moritz: vorglühen, Sachen suchen, den ersten Kampf bestehen
- Der letzte Bus: erst ein Sprint, dann ohne Ticket durch den Bus
- Vor dem Club: der Türsteher lässt euch nicht rein, ein Kampf auf Timing
- Der Club: Leute ansprechen, tanzen, und wenn es kippt, kämpfen
- Afterhour: tief in der Nacht kippt alles ins Surreale
- Der Späti: fünf Minuten Ruhe, Wasser, Snacks, Gespräche
- Dein Heimweg: der letzte Weg, gegen die aufgehende Sonne

Was du sagst und tust, merkt sich die Nacht: Mut, Ruf, Geld und wer dabei ist. Es gibt zehn Enden. Welches du bekommst, hängt davon ab, wie du die Nacht beendest, wie die Kämpfe ausgehen und wem du zugehört hast. In jedem Level versteckt sich ein Polaroid, acht davon ergeben die Momente. Am Levelende gibt es einen Rang von S bis C (prüfen: README sagt "kein Punktestand").

Gesteuert wird am Rechner mit der Tastatur, am Handy mit einem Stick links und einem großen Knopf rechts. Im Handy-Menü lassen sich Linkshänder-Modus und Knopfgröße einstellen.

Keine Werbung, kein Konto, kein Tracking. Dein Spielstand bleibt auf deinem Gerät. Eine Nacht dauert etwa 40 Minuten (geschätzt, prüfen).

Die Nacht dreht sich um Alkohol, Streit und Prügeleien. Es ist ein Spiel, und nichts davon ist zum Nachmachen.
```

Zeichen: 1582 (Grenze 4000, recherche-store.md §9).

Quellen der Aussagen: Level und Orte aus `nacht/texte.js` (Kapitelkarte) und README-Tabelle; Enden, Polaroids/Momente, Steuerung, Flackerschutz, „kein Konto/kein Tracking“ aus README; Rang S bis C aus `nacht/wertung.js` (in allen Level-Seiten eingebunden); Spieldauer laut `ueber.html` und README nur geschätzt.

Bewusst weggelassen: „Kein Download“ (im Store falsch, recherche-store.md §7, Punkt 9), Controller (Code hat 0 Treffer, recherche-store.md §6), getrennte Lautstärke (noch nicht umgesetzt, recherche-store.md §6).

---

## 5. Schlagworte (iOS)

```text
Pixel-Art,Abenteuer,Schleichen,Dialog,Komödie,Party,Schule,Story,Prügel,Deutsch
```

79 Zeichen. Grenze Apple: 100 (recherche-store.md §9). Der Name „Nachtschicht“ ist nicht wiederholt (Apple-Regel laut meinem Wissen, (prüfen)).

---

## 6. Kategorie-Vorschlag

- **Apple:** Hauptkategorie **Spiele** (`manifest.webmanifest`: `"games"`). Unterkategorie und Zweitkategorie: (prüfen), in den Quellen nicht festgelegt.
- **Google Play:** Kategorie **Spiele**. Unterkategorie: (prüfen). Die Quelle `manifest.webmanifest` nennt zusätzlich `"entertainment"`; ob das als Kategorie passt, ist (prüfen).

---

## 7. Screenshots (8 Stück)

Vorgabe (`LAUNCH.md`): jedes Bild in Pixel-Größe 3× hochskaliert, ohne Rand. Apple verlangt, dass Screenshots das Spiel im Spiel zeigen (recherche-store.md §4.1, Punkt 2.3.3). Handy-Screenshot-Größen für beide Stores: (prüfen).

1. Startmenü (mit Enden-Galerie)
2. Level 1, Die Schule: Flur mit Sichtkegel der Lehrer
3. Level 2, Bei Moritz: Pegel und Getränke
4. Level 3, Der letzte Bus: Kontrolleure
5. Level 4, Vor dem Club: Kampf mit goldenem Konter-Balken
6. Level 5, Der Club: mit Flackerschutz eingeschaltet, ohne harte Blitze
7. Level 6, Afterhour: Traumszene
8. Level 8, Dein Heimweg: Sonne

---

## 8. Altersfreigabe: Fragebogen-Vorschlag

Ziel: ehrliche Antworten. Die Zuordnung aus recherche-store.md §4.3 gilt für Apple. Das Ergebnis entsteht erst im Fragebogen (recherche-store.md §12).

### 8.1 Apple (neuer Fragebogen, Stufen 4+, 9+, 13+, 16+, 18+)

| Frage | Vorschlag | Begründung / Status |
|:--|:--|:--|
| Alkohol, Tabak, Drogen (Konsum oder Bezug) | **häufig**, dann **18+** | **ENTSCHEIDUNG NÖTIG.** Alkohol ist Spielmechanik: Pegel-Balken in Level 2, Shots in Level 5, Pegel über die Nacht, Kater im Epilog (recherche-store.md §4.3). „Selten“ (13+) wäre nur ehrlich, wenn Alkohol so weit zurückgenommen wird (recherche-store.md §4.3, §7 Punkt 12). |
| Realistische Gewalt | **selten** (Vorschlag), dann 13+ | **ENTSCHEIDUNG NÖTIG.** Pixel-Faustkämpfe im Comic-Stil. Ob „Cartoon“ oder „realistisch“, ist laut recherche-store.md §4.3 Auslegung. |
| Cartoon-/Fantasy-Gewalt | **häufig**, dann 13+ | Kämpfe kommen in mehreren Leveln vor. Einschätzung, (prüfen). |
| Reife/anzügliche Themen | **selten** (Vorschlag), dann 9+ | **ENTSCHEIDUNG NÖTIG.** Flirten im Club (`LAUNCH.md`). Bei „häufig“ wäre 16+ die Folge (recherche-store.md §4.3). |
| Derbe Sprache/Humor | (prüfen) | Die Quellen sagen nichts dazu. Dialogtexte selbst prüfen. |
| Alle weiteren Fragen des Fragebogens | (prüfen) | Nicht in recherche-store.md belegt. Im Fragebogen selbst beantworten. |

**Erwartung Apple:** 18+, solange Alkohol mit „häufig“ beantwortet wird (recherche-store.md §4.3).

**ENTSCHEIDUNG NÖTIG:** Verbreitung auf DE, AT und CH beschränken oder weltweit? Bei 18+ spart das Sonderregeln (recherche-store.md §4.3).

### 8.2 Google Play (IARC-Fragebogen, Ergebnis USK/PEGI/ESRB)

- **Erwartung:** USK 16 / PEGI 16 (Schätzung, recherche-store.md §5). PEGI nennt „Konsum von Tabak, Alkohol oder Drogen“ ausdrücklich als Grund für PEGI 16 (recherche-store.md §5). Bei Gewalt-Antworten kann es höher ausfallen.
- **ENTSCHEIDUNG NÖTIG:** Zielgruppe in der Play Console. Vorschlag: **18+**. Die Quelle nennt „18+ (mindestens 16+)“ und verbietet kindgerechtes Marketing (recherche-store.md §5).
- Antworten zu Gewalt, Alkohol, Sexualität und Sprache: entsprechend 8.1 ausfüllen. Das Ergebnis erzeugt erst das Formular (recherche-store.md §12).

---

## 9. Data Safety und App-Datenschutz

### 9.1 Google Play: Datensicherheit (Vorschlag)

- **Werden Nutzerdaten erhoben?** Nein. Keine Anmeldung, keine Analyse, keine Werbung (`README.md`, `ueber.html`). Die Quelle sagt: „keine Daten erhoben, keine geteilt“ ist eine gültige Antwort, auch ohne Daten (recherche-store.md §5).
- **Werden Daten geteilt?** Nein.
- **Speicherung nur auf dem Gerät:** Spielstand, Bestzeiten, Einstellungen (`ueber.html`, Abschnitt DATENSCHUTZ).
- **Löschen:** im Spiel über „SPIELSTAND LÖSCHEN“ (`ueber.html`) oder durch Deinstallieren der App (recherche-store.md §4.2).
- **Verschlüsselung bei der Übertragung und weitere Formularfragen:** (prüfen). Die Quellen beschreiben keine Übertragung von Nutzerdaten, das Formular fragt aber evtl. mehr.
- **Datenschutzerklärung:** Adresse siehe `docs/store/ANLEITUNG.md`, Schritt 5.4. Muss öffentlich und ohne Geo-Sperre erreichbar sein, kein PDF (recherche-store.md §5).
- **Werbung:** nein (recherche-store.md §5, „App-Inhalte“).

### 9.2 Apple: App-Datenschutz („Privacy Nutrition Label“)

- **Datentypen:** „Data Not Collected“ (Daten nicht erfasst). Voraussetzung laut recherche-store.md §4.2: weder Nick noch ein Drittanbieter holt Daten vom Gerät.
- **Tracking:** nein. `NSPrivacyTracking` ist false (recherche-store.md §9).
- **Privacy Manifest** (`PrivacyInfo.xcprivacy`): Pflicht, sobald `@capacitor/preferences` eingebaut ist. Dann Eintrag `NSPrivacyAccessedAPICategoryUserDefaults` mit Grund `CA92.1` (recherche-store.md §4.2). Das steht nicht im Store-Text, sondern in der Projektdatei.
- **Datenschutzerklärung:** Link in App Store Connect und in der App (recherche-store.md §4.2, Punkt 5.1.1).

---

## 10. Inhaltshinweis (kurz)

```text
Partynacht mit Alkohol, Streit und Prügeleien. Ein Spiel: nichts davon ist zum Nachmachen. Enthält Blitz- und Flackereffekte; der Flackerschutz lässt sich im Menü einschalten. Alle Figuren sind volljährig (prüfen).
```

214 Zeichen. Grenze: keine in recherche-store.md, daher „Grenze prüfen“.

Der Satz „Alle Figuren sind volljährig“ stammt aus der Story-Bibel (zitiert in recherche-store.md §6). Er steht bisher nirgends im Spiel. Erst aufnehmen, wenn der Hinweis im Spiel steht (recherche-store.md §6, Zeile „Volljährigkeit sichtbar“).

---

## 11. Offene Entscheidungen (Übersicht)

Alles mit **ENTSCHEIDUNG NÖTIG** oben, zusätzlich:

1. **Name mit Zusatz** und Markencheck (Abschnitt 1).
2. **Alkohol:** 18+ akzeptieren oder Alkohol zurücknehmen. Die Alkohol-Stellen (`level2.html` 663–664 und 726, `level5.html` 473/485/495) entschärfen oder im Prüfhinweis erklären (recherche-store.md §7, Punkt 12).
3. **Gewalt und Reife** als „realistisch“ oder „Cartoon“ einstufen (Abschnitt 8.1).
4. **Zielgruppe** in Google Play: 18+ oder 16+ (Abschnitt 8.2).
5. **Verbreitung** DE/AT/CH oder weltweit (Abschnitt 8.1).
6. **Händlerstatus (EU-DSA) und Impressum:** privat oder geschäftsmäßig? Bei Händler müssen Name, Adresse, Telefon und E-Mail öffentlich im Store stehen (recherche-store.md §4.4). Die Platzhalter in `ueber.html` füllen oder streichen (`LAUNCH.md`).
7. **Echte Namen der Crew** und Einverständnis (`LAUNCH.md`, Punkt 1). Im Store noch heikler als im Web (recherche-store.md §1).
8. **Hinweis „empfohlen ab X Jahren“** ja oder nein (`LAUNCH.md`).
9. **Zweiter Meldeweg** für Fehler statt GitHub-Issue (`LAUNCH.md`, „Nach dem Start“).
10. **Rang S bis C:** Der Code hat ein Rang-System (`nacht/wertung.js`), das README sagt aber „Es gibt keinen Punktestand“. Klären, was gilt, bevor der Store-Text erscheint.
11. **Spieldauer „etwa 40 Minuten“:** geschätzt, nicht gestoppt (`LAUNCH.md`). Nur mit Messung oder mit „geschätzt“ verwenden.
