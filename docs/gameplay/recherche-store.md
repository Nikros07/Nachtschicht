# Recherche: Vom Browserspiel in App Store und Play Store

Stand: 2026-10-05. Reine Analyse – keine Spieldatei wurde geändert. Messskript:
`node docs/gameplay/messung/store-inventur.js` (aus der Projektwurzel, liest nur).

**Kein Rechtsrat.** Wo Regeln Auslegung brauchen (Alkohol, Alter, Impressum, Händlerstatus), steht
hier eine **Entscheidung für Nick**, keine Antwort. Quellen: Web-Recherche am 2026-10-05 (Liste am
Ende). Aussagen, die nur auf eigenem Wissen beruhen und nicht frisch nachgeschlagen wurden, sind mit
**[W]** markiert – die beim ersten echten Build prüfen.

---

## 1. Kurzfassung

- **Der Weg heißt Capacitor 8** (Ionic): die Spieldateien werden **in die App gepackt** (nicht die
  GitHub-Pages-Adresse geladen). Nur so besteht das Spiel Apples Regel 4.2 „mehr als eine
  verpackte Website“ mit guter Aussicht. Android kann von diesem Windows-Rechner aus gebaut werden,
  sobald Android Studio installiert ist; **iOS braucht einen Mac** – hier nur als Cloud-Mac
  (GitHub Actions oder Codemagic).
- **Die härtesten Hürden sind nicht technisch:**
  1. **Altersfreigabe.** Alkohol ist im Spiel zentral (Pegel-Anzeige, Shots, Kater-Ende). Bei Apple
     führt „häufig“ Alkohol direkt zu **18+**, „selten“ zu 13+. Bei Google/IARC ist **PEGI 16 /
     USK 16** wahrscheinlich (Schätzung, das Ergebnis rechnet der Fragebogen aus).
  2. **Alkohol-Regeln.** Apple 1.4.3 lehnt Apps ab, die zu *übermäßigem* Trinken ermuntern; Google
     verbietet, *exzessives Trinken positiv darzustellen*. Im Code gibt es Stellen, die ein Prüfer so
     lesen kann (Abschnitt 7, Punkt 12).
  3. **Platzhalter `[NAME]`, `[ANSCHRIFT]`, `[E-MAIL]`** in `ueber.html` = Ablehnung nach Apple 2.1
     (Vollständigkeit). Dazu Händlerstatus nach EU-DSA: wer „Händler“ ist, muss Adresse und Telefon
     **öffentlich** im Store zeigen.
  4. **Echte Namen der Freunde** (LAUNCH.md, Punkt 1) – im Store noch heikler als im Web.
  5. **Google Play, neues Privatkonto:** vor dem Start **12 Tester, 14 Tage am Stück** im
     geschlossenen Test.
- **Im Spiel fehlt** vor allem eine **Plattform-Weiche** (Vollbild, Service Worker, Back-Taste,
  Auto-Pause, Haptik, sicherer Speicher), ein **echtes Pausemenü** mit Einstellungen und „Zum
  Hauptmenü“, **Controller-Unterstützung**, getrennte **Lautstärke**, eine **Datenschutzerklärung
  unter fester Web-Adresse** und die Store-Unterlagen (Texte, Screenshots, Fragebögen).
- **Aufwand grob:** Plattform-Weiche + Pausemenü + Hülle Android ≈ 3–5 Arbeitstage; iOS-Cloud-Build
  mit Signieren ≈ 1–2 Tage; Store-Unterlagen ≈ 1–2 Tage; dazu 14 Tage Testpflicht bei Google und
  Apples Prüfung (meist 1–3 Tage).

---

## 2. Der Weg: Capacitor als Hülle

### 2.1 Warum Capacitor

Capacitor legt um einen Ordner mit Webdateien (`webDir`) ein natives Android- und iOS-Projekt. Die
Seiten laufen in der System-WebView (Android: Chromium-WebView, iOS: WKWebView – erfüllt Apple 2.5.6
„WebKit für Webinhalte“). Die Spieldateien liegen **im App-Paket**, also offline, ohne Browserleiste.
Aktuell ist **Capacitor 8**: Node ≥ 22 (hier: v24.13.1 vorhanden), Android Studio Otter 2025.2.1+,
`minSdk` 24, `compileSdk`/`targetSdk` **36** (das ist zugleich Googles Pflicht seit 31.08.2026),
Xcode 26, iOS 15+, für neue iOS-Projekte Swift Package Manager statt CocoaPods.

NACHTSCHICHT passt gut: ~280 KB gesamt (`dist/nachtschicht-1.0.0.zip`). Der Seitenwechsel
(`location.href='level3.html'`) geht, weil alle Seiten aus einem lokalen Ursprung kommen (Android
`https://localhost`, iOS `capacitor://localhost`); `?v=`-Stempel stören nicht [W].

### 2.2 „Kein Build“ bleibt möglich – mit einer Einschränkung

Capacitor selbst braucht Node und `npx cap sync`, das Spiel nicht. Ein kleines Kopierskript legt die
Laufzeitdateien nach `www/`. **Die einzige Liste dafür gibt es schon:** `PRECACHE` in `sw.js`
(zwischen `// PRECACHE-START` und `// PRECACHE-ENDE`, gepflegt von `tools/version.py`). Das Skript
liest genau diese Liste – keine zweite Liste, die veraltet.

Einschränkung: Capacitor unterstützt das Einbinden seiner JS-Schnittstelle per `<script>` offiziell
**nicht mehr** („bitte einen Bundler benutzen“). Zwei Wege ohne Bundler:

1. Die native Seite spritzt beim Laden jeder Seite `window.Capacitor` ein; installierte Plugins sind
   dann über `window.Capacitor.Plugins.Haptics` usw. erreichbar [W – beim ersten Android-Build mit
   einer Konsolenzeile prüfen].
2. Falls nicht: das Kopierskript legt die fertigen IIFE-Dateien der Pakete
   (`@capacitor/core/dist/capacitor.js`, `@capacitor/haptics/dist/plugin.js` …) mit nach `www/` [W].

So oder so: **eine neue Engine-Datei `nacht/app.js`**, die nur arbeitet, wenn
`window.Capacitor?.isNativePlatform?.()` wahr ist, und im Browser nichts tut. `file://` und
GitHub Pages bleiben unberührt.

### 2.3 Die Bausteine im Einzelnen

| Baustein | Lösung | Hinweis |
|:--|:--|:--|
| **Symbole** | `@capacitor/assets` erzeugt alle Größen aus einer 1024×1024-Vorlage | `tools/icons.py` kann die Vorlage liefern (heute max. 512 px). Apple: 1024 px **ohne Transparenz**. |
| **Startbild (Splash)** | `@capacitor/splash-screen`, Hintergrund `#04030a` | Android 12+ zeigt das System-Startbild (Symbol auf Farbe). Kurz halten, das Spiel hat ein eigenes Titelbild. |
| **Statusleiste ausblenden** | Kern-Plugin **SystemBars** (in `@capacitor/core` 8), Einstellung `hidden:true` | iOS braucht dafür `UIViewControllerBasedStatusBarAppearance=YES` in `Info.plist`. |
| **Safe Area / Notch** | `viewport-fit=cover` ist schon in allen Seiten; `env(safe-area-inset-*)` steht 19-mal im Code | Android: ältere WebViews liefern bei Edge-to-Edge falsche `env()`-Werte; SystemBars spritzt deshalb `--safe-area-inset-*`-Variablen ein. CSS also als `var(--safe-area-inset-left, env(safe-area-inset-left,0px))` schreiben (kern.js `sichereBreite()`, mobil.js). |
| **Quer sperren** | Android: `android:screenOrientation="sensorLandscape"` im Manifest; iOS: nur Landscape in `UISupportedInterfaceOrientations` | **Achtung:** Android 16 ignoriert die Sperre auf großen Bildschirmen (Tablets, Falt-Handys), sobald `targetSdk` 36 ist; iPadOS 26 hat `UIRequiresFullScreen` abgekündigt und erzwingt frei skalierbare Fenster. Das Spiel muss also auch hochkant und in krummen Seitenverhältnissen laufen – `mobil.js` hat dafür schon eine Hochformat-Fassung. Auf Tablets testen. |
| **Haptik** | `@capacitor/haptics` (`impact`, `notification`) | Ersetzt `navigator.vibrate` (mobil.js:44–49). iOS-WebViews kennen die Vibration-API nicht [W] – heute vibriert am iPhone also nichts. |
| **Lebenszyklus** | `@capacitor/app`: `pause` / `resume` / `appStateChange` | Heute hält `geraet.js:244–258` bei `visibilitychange` nur den **Ton** an. Das Spielbild steht zwar (requestAnimationFrame ruht), läuft aber beim Zurückkommen **sofort weiter** – mitten im Kampf. Store-Erwartung: automatisch **Pause**. |
| **Zurück-Taste Android** | `App.addListener('backButton', …)` | Ohne Listener geht die WebView **in ihrer Seitengeschichte zurück** – bei NACHTSCHICHT heißt das: von Level 3 zurück auf Karte oder Level 2. Muss abgefangen werden: im Level Pausemenü öffnen/schließen, im Startmenü eine Ebene zurück, auf der obersten Ebene mit Rückfrage `App.exitApp()`. |
| **Spielstand** | `@capacitor/preferences` als **Spiegel** | Capacitor schreibt selbst: localStorage und IndexedDB sind in der App „flüchtig“, das System darf sie bei Platzmangel löschen. Das Spiel greift an **57 Stellen** direkt auf `localStorage` zu (18 Schlüssel `nachtschicht.*`). Umbau aller Stellen lohnt nicht. Stattdessen in `nacht/app.js`: bei `pause` und `pagehide` alle `nachtschicht.*`-Schlüssel nach Preferences sichern; beim Start, wenn localStorage leer ist und Preferences etwas hat, zurückschreiben und einmal neu laden. |
| **Ursprung festhalten** | `server.hostname`/`androidScheme`/`iosScheme` und `appId` **nie ändern** | Der WebView-Speicher hängt am Ursprung; ein Wechsel löscht für alle Spieler den Stand [W]. |

### 2.4 Was im Spiel in der App anders sein muss (die Plattform-Weiche)

Befunde aus dem Code (Zeilen Stand heute):

1. **Vollbild beim ersten Tippen** – `kern.js:85–86` ruft `vollbild()` beim ersten `touchstart`.
   In der App sinnlos (die App *ist* Vollbild) und im Android-WebView unzuverlässig.
   → `GERAET.app` abfragen, dann nichts tun.
2. **Menüknopf VOLLBILD** – `mobil.js:512–516` erkennt „als App“ nur über `display-mode`; in
   Capacitor ist das `browser`, also erscheint der Knopf samt Safari-Text „TEILEN-KNOPF, DANN ZUM
   HOME-BILDSCHIRM“. In der App ausblenden.
3. **Service Worker** – `geraet.js:496–501`: auf Android ist die App-Adresse `https://localhost`,
   `istLokal()` ist wahr, der Worker bleibt aus; auf iOS ist das Schema `capacitor:`, die Prüfung
   `^https?:` schlägt fehl. Er bleibt also **zufällig richtig aus**. Trotzdem ausdrücklich über
   `GERAET.app` abschalten, damit eine spätere Änderung an `istLokal()` das nicht kippt. Updates
   kommen in der App nur über den Store (Apple 2.5.2 verbietet nachgeladenen Code, der Funktionen
   ändert).
4. **MELDEN auf der Fehlerseite** – `geraet.js:37` öffnet ein GitHub-Issue. Braucht ein
   GitHub-Konto; in der App eher `mailto:` an die Support-Adresse. Externe Links öffnet Capacitor im
   System-Browser [W].
5. **`ueber.html`** – der Absatz „Hosting bei GitHub“ (Zeile 200) und „Offline-Speicher / Service
   Worker“ stimmen in der App nicht; Impressum-Platzhalter (Zeilen 224–232). Braucht eine
   App-Fassung des Datenschutz-Abschnitts.
6. **Hinweise auf „Zum Home-Bildschirm“, `?reset=…`, Taste F** – in der App ausblenden
   (README/ueber.html/`#base`-Leiste).

---

## 3. Alternativen

| Weg | Was es ist | Für NACHTSCHICHT |
|:--|:--|:--|
| **TWA mit Bubblewrap** (nur Play) | Android-App, die die **Live-Seite** in Chrome ohne Leiste öffnet | Klein, Updates kommen sofort über GitHub Pages, Offline per vorhandenem `sw.js`. **Haken:** die Datei `/.well-known/assetlinks.json` muss an der **Wurzel des Ursprungs** liegen, also `nikros07.github.io/.well-known/…` – dafür braucht es ein **zweites Repo `Nikros07.github.io`** (mit `.nojekyll`), sonst bleibt die Adressleiste sichtbar. Keine native Haptik, kein sicherer Speicher, nur Android. Bubblewrap braucht ebenfalls JDK und Android-SDK (lädt es auf Wunsch selbst). |
| **PWABuilder** | Web-Werkzeug, erzeugt aus der Live-Adresse ein Android-Paket (TWA) und ein iOS-Projekt (Swift + WKWebView, lädt die **Live-Adresse**) | Android-Teil = TWA wie oben. Der iOS-Teil ist eine Website-Hülle – genau das, was Apple nach 4.2 ablehnt; außerdem braucht er trotzdem Xcode. |

**Empfehlung:** Capacitor für beide Stores. TWA nur, wenn Nick sehr schnell „irgendwas im Play
Store“ will und iOS egal ist – dann aber zwei Wege pflegen. **Entscheidung für Nick.**

---

## 4. Apple App Store

### 4.1 Prüfregeln, die hier zählen

- **4.2 Minimum Functionality:** Die App muss „mehr als eine umverpackte Website“ sein und
  dauerhaft unterhalten. Was ein Web-Spiel akzeptabel macht: **Dateien im Paket**, läuft
  **offline**, **keine Browser-Bedienelemente**, kein Link-Sammelsurium, eine vollständige
  Spielerfahrung (hier: acht Level, ~40 Minuten, zehn Enden) und spürbar native Bausteine (Haptik,
  sauberes Pausieren, optional Game Center). Eine Hülle um `nikros07.github.io` wäre hochriskant.
- **2.5.2 Self-Contained:** kein nachgeladener Code, der Funktionen ändert → Service Worker in der
  App aus, Updates nur per Store.
- **2.5.6:** Webinhalte über WebKit – Capacitor nutzt WKWebView, erfüllt.
- **4.7 (HTML5-Spiele, Mini-Apps):** gilt für Spiele, die **nicht** im Paket stecken (z. B.
  Spielportale). Für NACHTSCHICHT nur relevant, falls Level je aus dem Netz kämen – dann mit Index,
  Altersschranke, Meldeweg. Also: nicht tun.
- **2.1 Vollständigkeit:** keine Platzhalter, keine toten Links, auf echtem Gerät getestet. Die
  sieben Platzhalter in `ueber.html` führen sicher zur Ablehnung.
- **2.3 Metadaten:** Screenshots müssen das Spiel *im Spiel* zeigen (2.3.3); Name höchstens 30
  Zeichen und **einzigartig im Store** (2.3.7); Alters-Fragebogen ehrlich (2.3.6).
- **1.4.3:** Apps, die zu übermäßigem Alkoholkonsum ermuntern, werden abgelehnt; Apps, die
  **Minderjährige** zum Trinken ermuntern, ebenso.

### 4.2 Datenschutz

- **App-Datenschutzangaben („Privacy Nutrition Label“):** „**Data Not Collected**“ ist zulässig,
  wenn weder Nick noch ein Drittanbieter Daten vom Gerät holt. Das trifft heute zu (keine Analyse,
  kein Absturzbericht an einen eigenen Server, Speicher nur lokal). Sobald irgendein SDK für Werbung,
  Statistik oder Absturzberichte dazukommt, ändert sich das.
- **Datenschutzerklärung (5.1.1):** **Pflicht für jede App** – als Link in App Store Connect **und**
  leicht erreichbar in der App. Muss sagen, was erhoben wird (hier: nichts), wie lange gespeichert
  wird und wie man löscht (hier: „Spielstand löschen“ bzw. App löschen).
- **Privacy Manifest (`PrivacyInfo.xcprivacy`):** Pflicht, sobald App oder Plugins
  „Required Reason APIs“ benutzen (UserDefaults, Datei-Zeitstempel, Systemstartzeit, freier
  Speicher, aktive Tastaturen). `@capacitor/preferences` benutzt **UserDefaults** → Eintrag
  `NSPrivacyAccessedAPICategoryUserDefaults` mit Grund **CA92.1**. Der Capacitor-Kern unterstützt
  Privacy Manifests seit 6.0 (bzw. 5.7.4/4.8.2); das App-Ziel braucht trotzdem eine eigene
  `PrivacyInfo.xcprivacy` für die Plugins (die SPM-Vorlage legt keine an).
  **localStorage in der WKWebView** ist interne Sache von WebKit und steht nicht auf Apples Liste –
  dafür ist nichts zu erklären [W; Capacitors Doku erwähnt es nicht]. Tracking-Domains: keine.

### 4.3 Altersfreigabe (neue Stufen seit 2025)

Apple hat 12+ und 17+ abgeschafft; es gibt **4+, 9+, 13+, 16+, 18+**. Der neue Fragebogen war für
bestehende Apps bis 31.01.2026 Pflicht; neue Apps beantworten ihn ohnehin. Zuordnung laut Apple:

| Inhalt | selten | häufig |
|:--|:--|:--|
| Alkohol, Tabak, Drogen (Konsum oder Bezug) | **13+** | **18+** |
| Realistische Gewalt (z. B. „blutige Nase nach Faustschlag“) | 13+ | 18+ |
| Cartoon-/Fantasy-Gewalt | 9+ | 13+ |
| Reife/anzügliche Themen | 9+ | 16+ |
| Derbe Sprache/Humor | 9+ | 13+ |

Einschätzung NACHTSCHICHT: Alkohol ist Spielmechanik (Pegel-Balken in Level 2, Shots in Level 5,
Pegel über die ganze Nacht, Kater im Epilog) – ehrlich beantwortet ist das **„häufig“ → 18+**. Die
Prügeleien sind Pixel-Faustkämpfe zwischen Menschen im Alltag; ob „Cartoon“ (9+/13+) oder
„realistisch“ (13+/18+), ist Auslegung.
**Entscheidung für Nick:** 18+ akzeptieren (kleinere Reichweite, für ein Partyspiel stimmig) –
oder Alkohol so weit zurücknehmen, dass „selten“ ehrlich ist (widerspricht „Party Game drunk“).
Bei 18+ zusätzlich: Verbreitung auf **DE, AT, CH** beschränken (spart Sonderregeln wie Koreas
Prüfnummer für Spiele ab 18) – ebenfalls Entscheidung.

### 4.4 Konto, Werkzeuge, Pflichten

- **Apple Developer Program:** 99 USD bzw. 99 € pro Jahr [W]; ohne laufende Mitgliedschaft
  verschwindet die App.
- **EU-Händlerstatus (DSA):** Pflichtangabe; seit 17.02.2025 fliegen Apps ohne Angabe aus den
  EU-Stores. **Händler** → Name, Adresse (oder Postfach), Telefon, E-Mail **öffentlich** auf der
  Produktseite. **Kein Händler** → Hinweis an Kunden, dass Verbraucherschutz nicht greift.
  Hängt an derselben Frage wie das Impressum (privat oder mit Einnahmen). **Entscheidung für Nick.**
- **Werkzeuge:** Seit 28.04.2026 nur noch Uploads mit **Xcode 26 / iOS-26-SDK**. Auf diesem Rechner
  gibt es kein Xcode → Cloud-Mac: **GitHub Actions** (macOS-Läufer, für öffentliche Repos frei
  [W]) oder **Codemagic** (500 macOS-Minuten im Monat frei). Signieren über Zertifikat + Profil oder
  App-Store-Connect-API-Schlüssel als verschlüsselte Secrets – **nie** im (öffentlichen) Repo.
- **TestFlight** für den Test mit Freunden vor der Prüfung.
- **Optional:** Game Center (Erfolge für zehn Enden und acht Momente) stärkt 4.2; braucht ein
  Community-Plugin [W]. Verfügbarkeit auf Macs/Vision Pro abwählen, da ungetestet [W].

---

## 5. Google Play

- **Ziel-API:** Seit **31.08.2026** müssen neue Apps und Updates **Android 16 (API 36)**
  ansteuern (Verlängerung bis 01.11.2026 auf Antrag). Capacitor 8 setzt 36 – erfüllt. Ab
  `targetSdk` 35 erzwingt Android **Edge-to-Edge** → SystemBars + Safe-Area-Variablen (2.3).
- **Neues Privatkonto (nach 13.11.2023):** vor dem Antrag auf Veröffentlichung ein
  **geschlossener Test mit mindestens 12 Testern, 14 Tage ununterbrochen eingetragen**; seit 2026
  schaut Google auch, ob wirklich gespielt wurde. Plan: die Crew als Tester. Registrierung einmalig
  25 USD [W], Identitätsprüfung Pflicht.
- **Adresse:** Bei Privatkonten zeigt Google ohne Monetarisierung nur die E-Mail; wer Geld verdient
  (Kaufpreis, In-App-Käufe, Werbung), gilt als Händler, dann wird die **volle Adresse öffentlich**.
- **Datensicherheit (Data Safety):** Formular ist **Pflicht, auch ohne Daten** – „keine Daten
  erhoben, keine geteilt“ ist eine gültige Antwort. **Datenschutzerklärung ist für jede App
  Pflicht**: öffentliche, nicht geo-gesperrte Web-Adresse, **kein PDF**, plus Link in der App.
- **Altersfreigabe (IARC):** ein Fragebogen erzeugt automatisch USK, PEGI, ESRB usw. PEGI nennt
  „Konsum von Tabak, Alkohol oder Drogen“ ausdrücklich als Merkmal für **PEGI 16**. Erwartung:
  **USK 16 / PEGI 16**, je nach Antworten zu Gewalt auch höher (Schätzung).
- **Alkohol-Richtlinie:** nicht erlaubt ist, Alkohol **an Minderjährige** darzustellen oder zu
  bewerben und **exzessives, Wett- oder Kampftrinken positiv** darzustellen.
- **Zielgruppe / Familien:** Zielgruppe in der Play Console auf **18+** (mindestens 16+) setzen,
  nichts kindgerecht vermarkten → die Familienrichtlinien greifen dann nicht.
- **Weitere Pflichtformulare unter „App-Inhalte“:** Werbung (nein), App-Zugriff (ohne Anmeldung),
  Zielgruppe, Altersfreigabe, Datensicherheit, Datenschutzerklärung.
- **Paket:** Android App Bundle (`.aab`), Play App Signing; der Upload-Schlüssel (`.jks`) entsteht
  mit `keytool` aus dem JDK und gehört **nie** ins Repo.

---

## 6. Was Spieler im Store erwarten – und wo NACHTSCHICHT steht

| Erwartung | Stand heute | Lücke |
|:--|:--|:--|
| **Pausemenü** | Tastatur: `P` zeigt nur „PAUSE / P ZUM WEITERSPIELEN“ (z. B. `level4.html:897`). Handy: Menü-Leiste mit WEITER, TON, VOLLBILD, HANDY, ENDEN, LEVEL WECHSELN, EINSTELLUNGEN (nur Handy-Bedienung) | Ein gemeinsames Pausemenü für alle Eingaben: Weiter, Level neu starten, Einstellungen (inkl. Flackerschutz, Wackeln, Lautstärke), Steuerung, Zum Hauptmenü. Auf Esc, P, Android-Zurück und Controller-Start. |
| **Auto-Pause** beim Verlassen | nur der Ton stoppt | Pause bei `pause`/`visibilitychange`. |
| **Einstellungen** | Startmenü: Flackerschutz, Wackeln, Röhren-Look, Schwierigkeit; Handy: Hand, Größe, Stick, Tippen, Vibration | Musik- und Effekt-Lautstärke getrennt (heute nur Ton an/aus), ggf. Textgeschwindigkeit. |
| **Speicherstand** | WEITER merkt nur das nächste Level (`docs/launch/startmenue.md`); localStorage | Spiegel in Preferences (2.3). Kein Zwang zu Cloud-Save. |
| **Steuerung erklärt** | Lektionen vor jedem Level, `ueber.html` | Im Pausemenü abrufbar machen. |
| **Controller** | Gamepad-API: **0 Treffer** im Code | In `nacht/eingabe.js` Gamepad auf vorhandene Tasten abbilden. Android-WebView kann die Gamepad-API [W]; in **WKWebView ist sie unzuverlässig** (WebView muss „First Responder“ sein). Auf iOS erst nach Gerätetest bewerben. |
| **Leistung** | 320–432×180, Synth-Ton, sehr kleines Paket | **Nie auf echtem Gerät gemessen** (LAUNCH.md). Ziel: 60 fps auf altem Android (Android 7–9, 3 GB RAM) und dem ältesten iPhone mit iOS 15. Level 6 (Zwischenpuffer) und Level 5 (Stroboskop) zuerst. |
| **Offline** | Service Worker (Web) | In der App automatisch – Dateien im Paket. |
| **Keine toten Links** | 4 externe Adressen; GitHub-Datenschutz-Link und MELDEN → GitHub | App-Fassung ohne GitHub-Bezug; Datenschutz-URL fest. |
| **Kein Absturz** | `geraet.js`: Fehlerschutz, Fehlerseite statt weißer Fläche – gut | Fehlerseite in der App ohne „Browser“-Wortwahl; `?reset` gibt es dort nicht. |
| **Barrierefreiheit** | Flackerschutz (WCAG 2.3.1), Wackeln aus, alles als Text, Ton nur Zugabe | Optional: Textgröße/Lesemodus, Farbmodus. Apple bietet „Accessibility Nutrition Labels“ in App Store Connect an [W] – nur wahrheitsgemäß ausfüllen. |
| **Volljährigkeit sichtbar** | Story-Bibel: „alle 18 oder älter“ – **im Spiel steht das nirgends**; sichtbar sind Schule und „letzter Schultag“ | Eine Zeile im Inhaltshinweis (`menue.js:431`), z. B. `ALLE FIGUREN SIND VOLLJAEHRIG.` (Schrift kann das), und in der Store-Beschreibung. |

---

## 7. Was NACHTSCHICHT konkret fehlt – Befundliste

Gemessen mit `store-inventur.js` und gelesen in den genannten Dateien:

1. `manifest.webmanifest` – für die App bedeutungslos (Capacitor liest es nicht); Symbole nur bis
   512 px. Für die Stores: 1024×1024 (Apple, ohne Alpha), 512×512 (Play) und Play-Grafik 1024×500.
2. `sw.js` – in der App nicht nötig; bleibt fürs Web. **Nicht löschen** (LAUNCH.md).
3. `nacht/geraet.js` – `istLokal()` schaltet den Worker auf Android nur zufällig ab; MELDEN führt zu
   GitHub; Lebenszyklus nur für Ton.
4. `nacht/kern.js:85` – Vollbild beim ersten Tippen; `:70` Querformat-Sperre nur nach Vollbild.
5. `nacht/mobil.js:44–49` – `navigator.vibrate` (iOS: wirkungslos); `:512–516` VOLLBILD-Knopf mit
   Safari-Anleitung; `:688` Drehen über `orientationchange` (in Ordnung, bleibt nötig für Tablets).
6. `nacht/eingabe.js` – keine Gamepad-Abfrage, kein Esc als Pause, keine Zurück-Taste.
7. Alle Level – `pauseTaste()` existiert in 9 Seiten, aber nur als Umschalter ohne Menü.
8. `ueber.html` – sieben Platzhalter; Hosting-Absatz GitHub; Datenschutz beschreibt Browser-Cache.
9. `LAUNCH.md`/`README.md` – „Kein Download“ ist im Store falsch; Store-Texte separat schreiben.
10. 57 direkte `localStorage`-Zugriffe → Spiegel statt Umbau.
11. `menue.js:431` – Inhaltshinweis ohne Volljährigkeit.
12. **Alkohol-Stellen, die ein Prüfer als „ermunternd“ lesen könnte:**
    - `level2.html:663–664`: Trinken meldet zufällig `AUF EX`, `RUNTER DAMIT`, `NOCH EINEN`.
    - `level2.html:726`: im Zweig `gruppeGross` ist die Aufgabe „DAVID VOM TELEFON HOLEN“ **nur ab
      Pegel 35** lösbar – Trinken ist dort Pflicht für den Fortschritt; der Spiegel sagt ab Pegel 35
      `DU SIEHST GUT AUS` (`:679`).
    - `level5.html:473/485/495`: ein Shot mit Sophie bringt Sympathie (`mag:['SOPHIE',8/10]`), dazu
      „Auf ex! …Okay, du bist in Ordnung.“
    - **Dagegen spricht:** zu viel wird bestraft (Wackeln ab 55, langsamer ab 70, Blackout bei 100,
      Mia und Sophie weisen Betrunkene ab, Kater-Stufen im Epilog) und die Karte bietet Wasser zum
      Ausnüchtern (`karte.html:139–148`).
    - **Entscheidung für Nick:** so lassen und im Prüfhinweis (App Review Notes) erklären – oder
      entschärfen: alkoholfreier Weg zu „Mut“ in Level 2, neutrale Meldungen statt `AUF EX`/`NOCH
      EINEN`, Sophies Sympathie nicht an den Shot koppeln. Ich würde entschärfen; das senkt das
      Risiko bei beiden Stores, die 18+-Einstufung bleibt trotzdem.
13. **Name:** Bei Google Play gibt es schon eine App „Nachtschicht Kaiserslautern“ (Diskothek),
    dazu eine TV-Serie gleichen Namens. Apple verlangt einen eindeutigen Namen. **Entscheidung:**
    Name mit Zusatz (z. B. „NACHTSCHICHT: Eine Nacht“) und vorher Markenregister (DPMA/EUIPO) prüfen.
    „drunk“ im Untertitel würde ich in den Stores weglassen.

---

## 8. Pflicht-Liste mit Aufwand

Aufwand: **S** ≤ 2 h, **M** ≤ 1 Tag, **L** > 1 Tag. „Wer“: N = nur Nick, C = Code (Nachtschicht/Claude).

| # | Punkt | Wer | Aufw. | Für |
|:--|:--|:--|:--|:--|
| 1 | Echte Namen / Einverständnis klären oder umbenennen | N | M | beide |
| 2 | Impressum, Händlerstatus (DSA), Support-E-Mail entscheiden; Platzhalter füllen oder streichen | N | S | beide |
| 3 | Alterseinstufung entscheiden (18+ akzeptieren oder Alkohol zurücknehmen) | N | S | beide |
| 4 | Alkohol-Stellen (7.12) so lassen oder entschärfen | N→C | M | beide |
| 5 | App-Name, Bundle-ID (`appId`, nie mehr änderbar), Markencheck | N | S | beide |
| 6 | Konten: Apple Developer (jährlich), Google Play (einmalig), Identitätsprüfung | N | M | beide |
| 7 | `nacht/app.js`: Plattform-Weiche (Vollbild, Worker, VOLLBILD-Knopf, Hinweise aus) | C | M | beide |
| 8 | Auto-Pause bei `pause`/`visibilitychange` | C | S | beide |
| 9 | Android-Zurück-Taste abfangen | C | S | Play |
| 10 | Gemeinsames Pausemenü (Weiter, Neustart, Einstellungen, Steuerung, Hauptmenü) | C | L | beide |
| 11 | Lautstärke Musik/Effekte getrennt | C | M | beide (Erwartung) |
| 12 | Haptik über Plugin statt `navigator.vibrate` | C | S | beide |
| 13 | Spielstand-Spiegel in Preferences | C | M | beide |
| 14 | Safe-Area-CSS mit `--safe-area-inset-*`-Rückfall | C | S | Play |
| 15 | Tablets: Hochformat/krumme Formate testen (Orientierung nicht erzwingbar) | C+N | M | beide |
| 16 | Gamepad-Unterstützung | C | M | soll (Android), kann (iOS) |
| 17 | Volljährigkeit im Inhaltshinweis | C | S | beide |
| 18 | Datenschutzerklärung als eigene Seite unter fester URL, App-Fassung von `ueber.html` | C+N | M | beide |
| 19 | `package.json`, `capacitor.config.json`, `tools/www.js`, `.gitignore` | C | M | beide |
| 20 | Symbole 1024 px ohne Alpha, Startbild, Play-Grafik (über `tools/icons.py`) | C | S | beide |
| 21 | Android Studio + SDK installieren, erster Build, Gerätetest | N | M | Play |
| 22 | `PrivacyInfo.xcprivacy` (UserDefaults CA92.1) | C | S | iOS |
| 23 | iOS-Cloud-Build (GitHub Actions/Codemagic), Signieren, TestFlight | N+C | L | iOS |
| 24 | Store-Texte, Screenshots, Prüfhinweis, Fragebögen (Alter, Datensicherheit, App-Datenschutz) | C+N | M | beide |
| 25 | Geschlossener Test: 12 Tester × 14 Tage | N | L (Wartezeit) | Play |
| 26 | Leistungstest auf altem Android und ältestem iPhone (iOS 15) | N | M | beide |
| 27 | Versionsnummern koppeln: `GERAET.version` ↔ `versionName`/`versionCode` ↔ `CFBundleShortVersionString`/`CFBundleVersion` | C | S | beide |

---

## 9. Dateien, die neu entstehen müssten

| Datei | Inhalt |
|:--|:--|
| `package.json` | nur `devDependencies` (`@capacitor/cli`, `core`, `android`, `ios`, `app`, `haptics`, `preferences`, `splash-screen`, `@capacitor/assets`); Skripte `www` (Kopieren), `sync` (`www` + `npx cap sync`), `android` (`sync` + `npx cap open android`). Das Spiel selbst bleibt ohne Abhängigkeiten. |
| `capacitor.config.json` | siehe Skizze unten |
| `tools/www.js` | Node ohne Pakete: liest `PRECACHE` aus `sw.js`, leert `www/`, kopiert genau diese Dateien; bricht ab, wenn `python tools/version.py --pruefen` nicht grün ist. |
| `nacht/app.js` | neue Engine-Datei direkt nach `geraet.js` (`python tools/engine_einbinden.py app --nach geraet`): Plattform-Weiche, Zurück-Taste, Pause/Resume, Haptik, Speicher-Spiegel, SystemBars. Im Browser wirkungslos. |
| `android/`, `ios/` | von `npx cap add android/ios` erzeugt; ins Repo ja, aber ohne Build-Ordner und ohne Schlüssel. |
| `ios/App/App/PrivacyInfo.xcprivacy` | UserDefaults, Grund CA92.1; `NSPrivacyTracking` false; keine erhobenen Datentypen. |
| `assets/icon.png`, `assets/splash.png` | Vorlagen für `@capacitor/assets` (1024 px bzw. 2732 px), erzeugt von `tools/icons.py`. |
| `datenschutz.html` | eigene Seite, auf GitHub Pages als feste URL **und** im Paket; Web- und App-Fassung unterscheiden (kein GitHub-Hosting in der App). |
| `docs/store/store-texte.md` | Name (≤ 30), Untertitel/Kurzbeschreibung (Apple 30, Play 80), Beschreibung (≤ 4000), Stichwörter (Apple 100 Zeichen), Neuerungen, Prüfhinweis für Apple (Alkohol-Einordnung, Volljährigkeit, kein Login). |
| `docs/store/frageboegen.md` | Antworten Alters-Fragebogen Apple, IARC, Data Safety, App-Datenschutz – mit Begründung, damit Updates gleich beantwortet werden. |
| `.gitignore` (Ergänzung) | `www/`, `android/app/build/`, `android/.gradle/`, `ios/App/build/`, `*.jks`, `*.keystore`, `*.p12`, `*.mobileprovision`, `*.p8`. |
| `.github/workflows/ios.yml` (optional) | Cloud-Build auf macOS, Signieren aus Secrets, Upload zu TestFlight. |

Wichtig für dieses Repo: **GitHub Pages veröffentlicht den ganzen Ordner** (`path: .`). `www/`,
`android/` und `ios/` landeten damit auf der Website – harmlos, aber unnötig; sauberer wäre es, im
Pages-Workflow nur die Laufzeitdateien hochzuladen. Schlüssel dürfen nie in den Ordner.

Skizze `capacitor.config.json` (Werte = Vorschläge, `appId` ist Entscheidung):

```json
{
  "appId": "io.github.nikros07.nachtschicht",
  "appName": "NACHTSCHICHT",
  "webDir": "www",
  "android": { "backgroundColor": "#04030a" },
  "ios": { "backgroundColor": "#04030a", "contentInset": "never" },
  "plugins": {
    "SystemBars": { "hidden": true },
    "SplashScreen": { "launchShowDuration": 600, "backgroundColor": "#04030a", "showSpinner": false }
  }
}
```

`server.hostname`, `androidScheme` und `iosScheme` bewusst auf den Vorgaben lassen (`localhost`,
`https`, `capacitor`) und nie ändern.

---

## 10. Werkzeuge auf diesem Rechner (nur gelesen)

| Werkzeug | Befund |
|:--|:--|
| Node | **v24.13.1** – reicht für Capacitor 8 (≥ 22) |
| npm / npx | vorhanden |
| Python | vorhanden (aus einer fremden venv: `…\hermes-agent\venv\…`; für `tools/icons.py` muss dort Pillow liegen) |
| java / keytool | **fehlt**, `JAVA_HOME` leer |
| adb, sdkmanager, gradle | **fehlen**, `ANDROID_HOME`/`ANDROID_SDK_ROOT` leer, `%LOCALAPPDATA%\Android\Sdk` gibt es nicht |
| Android Studio | **nicht installiert** (bringt das passende JDK mit; Gradle kommt als Wrapper mit dem Projekt) |
| Xcode | gibt es unter Windows nicht → Cloud-Mac |

---

## 11. Reihenfolge

1. **Entscheidungen** (Punkte 1–6) – ohne sie ist jede Einreichung vergeblich.
2. **Im Browser umsetzbar, auch fürs Web gut:** Pausemenü, Auto-Pause, Lautstärke, Gamepad,
   Volljährigkeit, Datenschutzseite, ggf. Alkohol-Stellen – alles mit `tools/nachttest.js` prüfbar.
3. **Android:** Hülle bauen, echtes Gerät und Tablet, dann **sofort** den geschlossenen Test starten
   – die 14 Tage laufen, während iOS entsteht.
4. **iOS:** Cloud-Build, TestFlight mit denselben Testern; dann beide einreichen.

## 12. Offen geblieben

Ob `window.Capacitor.Plugins` ohne Bundler zuverlässig bereitsteht (2.2); wie Prüfer die
Alkohol-Stellen werten (Ermessen); die echte IARC-Einstufung (entsteht erst beim Ausfüllen); ob der
Synth-Ton dem iOS-Stummschalter folgt [W]; Leistung auf alten Geräten.

---

## Quellen

- Capacitor: [Konfiguration](https://capacitorjs.com/docs/config) ·
  [Update auf 8.0](https://capacitorjs.com/docs/updating/8-0) ·
  [SystemBars](https://capacitorjs.com/docs/apis/system-bars) ·
  [App-Plugin](https://capacitorjs.com/docs/apis/app) ·
  [Screen Orientation](https://capacitorjs.com/docs/apis/screen-orientation) ·
  [Speicher-Leitfaden](https://capacitorjs.com/docs/guides/storage) ·
  [Privacy Manifest](https://capacitorjs.com/docs/ios/privacy-manifest) ·
  [Web / Skript-Einbindung](https://capacitorjs.com/docs/web) ·
  [Forum: Capacitor ohne Build-System](https://forum.ionicframework.com/t/using-capacitor-without-a-js-build-system-or-module-loader/199920) ·
  [Preferences README](https://github.com/ionic-team/capacitor-plugins/blob/main/preferences/README.md)
- Apple: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) ·
  [Altersfreigaben – Werte und Definitionen](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions) ·
  [DSA-Händlerstatus](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/) ·
  [SDK-Mindestanforderungen](https://developer.apple.com/news/upcoming-requirements/) ·
  [UIRequiresFullScreen abgekündigt (Forum)](https://developer.apple.com/forums/thread/793406) ·
  [TechCrunch: Apps ohne Händlerangabe entfernt](https://techcrunch.com/2025/02/18/apple-purges-apps-without-contact-info-from-eu-app-store-as-dsa-deadline-hits)
- Google: [Ziel-API-Anforderungen](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en) ·
  [Testpflicht für neue Privatkonten](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) ·
  [Unangemessene Inhalte (Alkohol)](https://support.google.com/googleplay/android-developer/answer/9878810?hl=en) ·
  [Nutzerdaten / Datenschutzerklärung](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en) ·
  [Altersfreigaben](https://support.google.com/googleplay/android-developer/answer/9859655?hl=en) ·
  [Familienrichtlinien](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en) ·
  [Kontodaten aktuell halten](https://support.google.com/googleplay/android-developer/answer/13634888?hl=en) ·
  [TWA-Schnellstart](https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2)
- Altersfreigabe allgemein: [USK im IARC-System](https://usk.de/en/home/age-classification-for-games-and-apps/games-and-apps-in-the-iarc-system/) ·
  [PEGI (Wikipedia)](https://en.wikipedia.org/wiki/PEGI)
- Hüllen und Prüfung: [PWABuilder: iOS](https://blog.pwabuilder.com/posts/publish-your-pwa-to-the-ios-app-store/) ·
  [MobiLoud: WebView-Apps und 4.2](https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper/) ·
  [Cordova-iOS: Gamepad in WKWebView](https://github.com/apache/cordova-ios/issues/1397) ·
  [OpenRadar FB8887166](https://openradar.appspot.com/FB8887166) ·
  [Codemagic: iOS ohne Mac](https://blog.codemagic.io/how-to-build-and-distribute-ios-apps-without-mac-with-flutter-codemagic/)
- Namensgleichheit: [Nachtschicht Kaiserslautern (Google Play)](https://play.google.com/store/apps/details?id=app.nachtschicht.app&hl=en)
