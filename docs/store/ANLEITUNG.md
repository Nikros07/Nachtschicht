# NACHTSCHICHT als App bauen und einreichen

Stand: 2026-10-21. Grundlage ist `docs/gameplay/recherche-store.md` (Stand 2026-10-05). Was dort nicht steht oder nur als Erwartung markiert ist, steht hier mit **(prüfen)**. Kein Rechtsrat.

Die Store-Texte stehen in `docs/store/texte.md`.

---

## Vorab: Stand des Repos (heute geprüft)

Diese Punkte musst du kennen, bevor du anfängst:

- **Erledigt am 2026-10-21:** `package.json` steht auf Capacitor 8 (`^8.0.0`, wegen Android-Ziel 36, recherche-store.md §2.1), `capacitor.config.json` nutzt die Manifest-Farbe `#04030a`, und `.gitignore` sperrt Signier-Schlüssel (`*.jks`, `*.keystore`, `*.p12`, `*.p8`, `*.mobileprovision`, `keystore.properties`) und die Bau-Ordner von `android/` und `ios/`.
- **Datenschutz-Adresse.** Die fest vorgesehene Adresse zeigt auf einen Anker in `ueber.html`. Die Recherche empfiehlt eine eigene Seite `datenschutz.html` (recherche-store.md §9). Ob der Anker reicht, ist **(prüfen)**.

---

## 1. Was du brauchst

1. **Node.js LTS**, Version 22 oder neuer (recherche-store.md §2.1). Prüfen:

```bash
node -v
npm -v
```

2. **Android Studio**, Version Otter 2025.2.1 oder neuer (recherche-store.md §2.1). Es bringt das nötige JDK mit (recherche-store.md §10). Das Android SDK wird über Android Studio installiert **(prüfen: genaue Menüs)**.

3. **Für iOS:** einen Mac mit Xcode 26 (recherche-store.md §2.1, §4.4). Ohne Mac geht es über einen Cloud-Mac: GitHub Actions oder Codemagic (recherche-store.md §4.4). Seit 28.04.2026 nimmt Apple nur noch Uploads mit Xcode 26 / iOS-26-SDK an (recherche-store.md §4.4).

4. **Konten und Kosten** (recherche-store.md §4.4, §5):
   - **Google Play Console:** einmalig 25 USD, Identitätsprüfung Pflicht **(Betrag prüfen)**.
   - **Apple Developer Program:** 99 USD bzw. 99 € pro Jahr **(prüfen)**. Ohne laufende Mitgliedschaft verschwindet die App.

5. **Zeitbedarf** laut Recherche (recherche-store.md §1): Android-Hülle ungefähr 3 bis 5 Arbeitstage, iOS-Cloud-Build 1 bis 2 Tage, Store-Unterlagen 1 bis 2 Tage. Dazu kommen 14 Tage Testpflicht bei Google und Apples Prüfung (meist 1 bis 3 Tage, recherche-store.md §1).

---

## 2. Einmalig einrichten

### 2.1 App-ID festlegen

Die App-ID (`appId`) steht in `capacitor.config.json`. Heute steht dort der Platzhalter `de.nachtschicht.spiel`. **Die App-ID ist eine Entscheidung und kann nach dem ersten Upload nicht mehr geändert werden** (recherche-store.md §4.1, §9).

- Vorschlag der Recherche: `io.github.nikros07.nachtschicht` (recherche-store.md §9).
- Nicht `app.nachtschicht.app` verwenden. Diese Paket-ID gehört laut Recherche der App „Nachtschicht Kaiserslautern“ (recherche-store.md §7, Punkt 13).

Die Datei öffnen und `appId` setzen. Das ist die einzige Änderung, die vor dem ersten Build nötig ist.

### 2.2 Abhängigkeiten installieren

```bash
cd "C:/Users/spide/Desktop/Projekte/nachtschicht"
npm install
```

### 2.3 Spielkopie erzeugen

```bash
python tools/www.py
```

Das Skript prüft zuerst mit `tools/launchcheck.js` und kopiert danach die Spieldateien nach `www/`. Bei harten Fehlern bricht es ab (Exit-Code 1). Mit `--hilfe` zeigt es alle Optionen. `www/` steht in `.gitignore` und entsteht bei jedem Bau neu.

### 2.4 Android-Projekt anlegen (einmalig)

```bash
npx cap add android
```

Danach entsteht der Ordner `android/`.

### 2.5 Die Ordner `android/` und `ios/` nicht ins Web laden

GitHub Pages veröffentlicht den ganzen Ordner (`path: .`). Wenn `android/` oder `ios/` im Repo landen, sind sie für alle im Web sichtbar. Das ist harmlos, aber unnötig. Build-Ordner und Schlüssel gehören nie hinein (recherche-store.md §9). Die `.gitignore`-Ergänzung aus dem Vorab-Abschnitt ist hier wichtig.

---

## 3. Jede neue Version bauen

### 3.1 Versionsnummern erhöhen

Bei jeder neuen Version alle vier Stellen gleich setzen (recherche-store.md §8, Punkt 27; `LAUNCH.md`):

- `GERAET.version` in `nacht/geraet.js` (heute `"1.0.0"`, Zeile 44). `GERAET.build` stempelt `tools/version.py` selbst.
- `"version"` in `package.json` (heute `1.0.0`).
- Die oberste Versionsüberschrift in `CHANGELOG.md`. Die Startprüfung vergleicht sie mit `GERAET.version`.
- Android: `versionCode` (Zahl, bei jedem Upload größer) und `versionName` in `android/app/build.gradle` **(Pfad prüfen, Standard von Capacitor)**.
- iOS: `CFBundleVersion` (Build-Nummer) und `CFBundleShortVersionString` in Xcode **(prüfen)**.

### 3.2 Stempeln und prüfen

```bash
cd "C:/Users/spide/Desktop/Projekte/nachtschicht"
python tools/version.py
python tools/version.py --pruefen
node tools/launchcheck.js
```

`launchcheck.js` muss „BEREIT“ sagen (`LAUNCH.md`, `CLAUDE.md`). Warnungen nicht einfach übergehen.

### 3.3 Kopieren und synchronisieren

```bash
npm run sync
```

Das führt `python tools/www.py` und danach `npx cap sync` aus. Die Spieldateien landen dann in den Android- und iOS-Projekten.

### 3.4 Android Studio öffnen

```bash
npx cap open android
```

### 3.5 AAB bauen und signieren

1. **Schlüssel anlegen (nur einmal).** Der Upload-Schlüssel (`.jks`) entsteht mit `keytool` aus dem JDK (recherche-store.md §5). Der Befehl unten ist aus meinem Wissen, nicht aus den Quellen **(prüfen)**. Der Pfad liegt bewusst außerhalb des Projekts:

```bash
keytool -genkeypair -v -keystore "C:/Users/spide/Schluessel/nachtschicht-upload.jks" -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

2. **Schlüssel sicher aufbewahren.** Der Schlüssel und die Passwörter gehören **nie** ins Repo. Lege eine zweite Sicherung an einem anderen Ort an, zum Beispiel auf einem Datenträger, und merke dir die Passwörter in einem Passwortmanager. Ein verlorener Upload-Schlüssel erschwert die Updates. Was Google dann verlangt, ist **(prüfen)**.

3. **`.gitignore` ergänzen.** Vor dem ersten Schlüssel die Zeilen aus dem Vorab-Abschnitt eintragen. `*.jks` und `*.keystore` müssen ignoriert werden.

4. **AAB bauen.** In Android Studio das Menü für signierte Pakete öffnen (in etwa „Build“, dann „Generate Signed App Bundle“, Menüname **(prüfen)**). Format AAB wählen und den Upload-Schlüssel nehmen.

5. **Hochladen.** Die `.aab`-Datei geht zur Google Play Console. Google signiert die App über „Play App Signing“ neu (recherche-store.md §5).

### 3.6 iOS (nur auf einem Mac oder im Cloud-Mac)

```bash
npx cap add ios
npx cap sync
```

`cap add ios` gibt es nur auf einem Mac mit Xcode oder im Cloud-Mac (recherche-store.md §2.1). Signieren geht über Zertifikat und Profil oder über einen App-Store-Connect-API-Schlüssel. Beides kommt als verschlüsselte Secrets in den Cloud-Build, nie ins Repo (recherche-store.md §4.4).

---

## 4. Icons und Startbild

1. **Vorhanden im Ordner `icons/`:** `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `icon.svg`, `apple-touch-icon.png`, `favicon-32.png`, `favicon.ico`, `og.png`. Die größte Symboldatei ist 512 Pixel groß (recherche-store.md §7, Punkt 1).

2. **Benötigt:** eine Vorlage mit 1024 × 1024 Pixeln. Apple verlangt sie ohne Transparenz (recherche-store.md §2.3).

3. **Werkzeug:** `@capacitor/assets` erzeugt aus der 1024er-Vorlage alle Größen (recherche-store.md §2.3). Den genauen Befehl dafür nennt die Quelle nicht **(prüfen)**.

4. **`tools/icons.py`** kann die Vorlage liefern. Heute reicht es laut Recherche nur bis 512 Pixel **(prüfen)**. Das Skript braucht Pillow. Die Recherche nennt eine fremde Python-Umgebung (`hermes-agent`), besser eine eigene Installation **(prüfen)**.

5. **Startbild:** Vorlage 2732 Pixel, Hintergrund `#04030a` (recherche-store.md §9). Die Recherche empfiehlt ein kurzes Startbild, weil das Spiel ein eigenes Titelbild hat (§2.3).

6. **Play-Grafik:** 1024 × 500 Pixel (recherche-store.md §7, Punkt 1).

7. **Kontrolle:** Das Symbol auf dem Gerät öffnen und prüfen, ob es nicht abgeschnitten ist (`LAUNCH.md`).

---

## 5. Google Play

1. **Konto.** Play Console, einmalige Registrierung (25 USD **(prüfen)**), Identitätsprüfung Pflicht (recherche-store.md §5).

2. **Adresse.** Bei einem Privatkonto zeigt Google ohne Einnahmen nur die E-Mail. Wer Geld verdient (Kaufpreis, In-App-Käufe, Werbung), gilt als Händler, dann wird die volle Adresse öffentlich (recherche-store.md §5).

3. **Geschlossener Test (Pflicht für neue Privatkonten).** Mindestens 12 Tester, 14 Tage ununterbrochen eingetragen. Seit 2026 schaut Google auch, ob wirklich gespielt wurde (recherche-store.md §5). Ohne diese 14 Tage gibt es keine Veröffentlichung. Die Recherche nennt keine Abkürzung.

4. **Datenschutzerklärung.** Pflicht für jede App. Öffentliche Web-Adresse, nicht geo-gesperrt, kein PDF, plus Link in der App (recherche-store.md §5). Vorgesehen ist `https://nikros07.github.io/Nachtschicht/ueber.html#datenschutz`. Die Recherche empfiehlt eine eigene Seite `datenschutz.html` und eine App-Fassung ohne GitHub-Hinweise (recherche-store.md §2.4, §9). Ob der Anker reicht, ist **(prüfen)**.

5. **Altersfreigabe (IARC-Fragebogen).** Die Antworten stehen in `docs/store/texte.md`, Abschnitt 8. Erwartung laut Recherche: USK 16 / PEGI 16, Schätzung (recherche-store.md §5). Zielgruppe in der Play Console auf 18+ setzen (mindestens 16+) und nichts kindgerecht bewerben (recherche-store.md §5).

6. **Data Safety.** Das Formular ist Pflicht, auch ohne erhobene Daten. Antworten stehen in `docs/store/texte.md`, Abschnitt 9.

7. **App-Inhalte.** Pflichtformulare: Werbung (nein), App-Zugriff (ohne Anmeldung), Zielgruppe, Altersfreigabe, Datensicherheit, Datenschutzerklärung (recherche-store.md §5).

8. **Zielfrist Android-Version.** Laut Recherche musste ab 31.08.2026 Android 16 (API 36) angesteuert werden. Verlängerung bis 01.11.2026 auf Antrag (recherche-store.md §5). Heute ist die Hauptfrist vorbei. Ob du den Antrag brauchst, ist **(prüfen)**.

---

## 6. Apple App Store

1. **Konto.** Apple Developer Program, 99 USD bzw. 99 € pro Jahr **(prüfen)**. Ohne Mitgliedschaft verschwindet die App (recherche-store.md §4.4).

2. **Mac oder Cloud-Mac.** Ohne eigenen Mac nutzt du GitHub Actions (macOS-Läufer, für öffentliche Repos laut Recherche frei **(prüfen)**) oder Codemagic (500 macOS-Minuten im Monat frei laut Recherche, recherche-store.md §4.4). Die Signierung läuft über Secrets, nie im öffentlichen Repo.

3. **TestFlight.** Vor der Prüfung mit denselben Testern testen (recherche-store.md §4.4, §11).

4. **Pflichtangaben:**
   - **Datenschutzerklärung:** Link in App Store Connect und in der App (recherche-store.md §4.2, Punkt 5.1.1).
   - **EU-Händlerstatus (DSA):** Pflichtangabe. Seit 17.02.2025 fliegen Apps ohne Angabe aus den EU-Stores. Bist du Händler, müssen Name, Adresse, Telefon und E-Mail öffentlich stehen. Das ist eine **Entscheidung für Nick** (recherche-store.md §4.4).
   - **Altersfreigabe-Fragebogen:** Antworten in `docs/store/texte.md`, Abschnitt 8.1.
   - **Privacy Manifest:** `PrivacyInfo.xcprivacy`, sobald `@capacitor/preferences` eingebaut ist (recherche-store.md §4.2).

5. **Risiken bei der Prüfung** (recherche-store.md §4.1):
   - **4.2 Minimum Functionality:** Die App muss mehr sein als eine umverpackte Website. Dazu gehören Dateien im Paket, Offline-Betrieb, native Bausteine (Haptik, sauberes Pausieren).
   - **2.5.2:** kein nachgeladener Code. Der Service Worker bleibt in der App aus, Updates kommen nur über den Store.
   - **2.1 Vollständigkeit:** keine Platzhalter. `ueber.html` hat Platzhalter, die Zahl ist laut Recherche sieben, laut Stand heute vier (`[NAME]`, `[ANSCHRIFT]`, `[E-MAIL]`, `[WEITERE CREDITS]`) **(prüfen)**.
   - **1.4.3 Alkohol:** Apps, die zu übermäßigem Trinken ermuntern, werden abgelehnt. Die Alkohol-Stellen gehören zur Entscheidung (`docs/store/texte.md`, Abschnitt 11).
   - **2.3.3 Screenshots:** müssen das Spiel im Spiel zeigen.
   - **2.3.6 Fragebogen:** ehrlich beantworten.
   - **2.3.7 Name:** höchstens 30 Zeichen und einzigartig im Store.
   - **Prüfhinweis (App Review Notes):** Die Recherche empfiehlt ihn mit Einordnung zu Alkohol, Volljährigkeit und dem Hinweis „kein Login“ (recherche-store.md §9). Text noch offen.

---

## 7. Was in der App noch zu prüfen ist

Die Punkte unten kommen aus der Recherche (Stand 2026-10-05). Vor dem Upload einzeln abhaken, ob sie inzwischen erledigt sind.

**Aus dem Auftrag:**

- **Service Worker und Offline.** In der App sollen die Dateien im Paket liegen. Der Service Worker bleibt aus (`nacht/geraet.js` Zeile 496 ff.). Auf dem Gerät prüfen, ob das Spiel ohne Netz startet.
- **Ton nach Unterbrechung.** Nach Tab- oder App-Wechsel muss der Ton wieder funktionieren (`LAUNCH.md`).
- **Vollbild.** In der App ist das Spiel schon Vollbild. Der Vollbild-Versuch beim ersten Tippen (`nacht/kern.js` 85 f.) und der VOLLBILD-Knopf (`nacht/mobil.js` 512 ff.) sind dort überflüssig (recherche-store.md §2.4).
- **Notch und Randbereiche.** Safe-Area prüfen. Android liefert bei Edge-to-Edge in älteren WebViews falsche Werte (recherche-store.md §2.3).

**Aus der Recherche:**

- **Plattform-Weiche** (`nacht/app.js`, heute nicht vorhanden): Vollbild, Service Worker, Hinweise „Zum Home-Bildschirm“ und `?reset` in der App ausblenden (recherche-store.md §2.4, §8 Punkt 7).
- **Auto-Pause.** Beim Verlassen der App muss das Spiel pausieren. Heute läuft es nach der Rückkehr weiter, mitten im Kampf (`nacht/geraet.js` 244–258, recherche-store.md §2.3).
- **Android-Zurück-Taste.** Sie muss abgefangen werden, sonst springt die WebView zurück in die Seitengeschichte (recherche-store.md §2.3, Pflicht 9).
- **Gemeinsames Pausemenü** (Weiter, Neustart, Einstellungen, Steuerung, Hauptmenü). Heute nur ein Schalter, der „PAUSE“ zeigt (recherche-store.md §6, Pflicht 10).
- **Lautstärke** für Musik und Effekte getrennt (recherche-store.md §6, Pflicht 11).
- **Haptik** über ein Plugin statt `navigator.vibrate` (`nacht/mobil.js` 44–49). Auf dem iPhone wirkt `navigator.vibrate` nicht (recherche-store.md §2.3).
- **Spielstand-Spiegel** in Preferences. Der Speicher im App-WebView kann bei Platzmangel gelöscht werden (recherche-store.md §2.3, Pflicht 13).
- **Tablets und Hochformat.** Die Orientierung lässt sich ab Android 16 nicht mehr sperren. Das Spiel muss in allen Formaten laufen (recherche-store.md §2.3, Pflicht 15). Keine Ausrichtung festlegen.
- **Gamepad.** Heute 0 Treffer im Code. Auf Android möglich, auf iOS unzuverlässig (recherche-store.md §6).
- **Volljährigkeit** im Inhaltshinweis (`nacht/menue.js` 431) (recherche-store.md §6, Pflicht 17).
- **Datenschutzseite** als eigene App-Fassung ohne GitHub-Bezug (recherche-store.md §9, Pflicht 18).
- **Fehlerseite.** Der Knopf MELDEN öffnet heute ein GitHub-Issue. Viele Spieler haben kein GitHub-Konto. In der App eher eine E-Mail-Adresse, die es heute nicht gibt, Entscheidung (recherche-store.md §2.4 Punkt 4, `LAUNCH.md`).
- **Leistung** auf altem Android (7 bis 9, 3 GB RAM) und dem ältesten iPhone mit iOS 15. Nie gemessen (recherche-store.md §6, Pflicht 26).
- **Echtes Gerät.** Die Handy-Messungen stammen aus Emulation. Die Liste in `LAUNCH.md` („Am echten Handy“) je einmal auf Android Chrome und iPhone Safari abhaken.

---

## 8. Offene Entscheidungen

Vor dem Einreichen klären:

1. **Store-Texte** in `docs/store/texte.md`: alle Stellen mit **ENTSCHEIDUNG NÖTIG** (Name, Alkohol, Gewalt, Reife, Zielgruppe, Verbreitung, Impressum).
2. **Nick-Entscheidungen** laut `NACHT-TODO.md`, Abschnitt „Entscheidung nötig“ (ab Zeile 307, zum Beispiel Level 5 „Theke gratis“).
3. **Startprüfung**, Abschnitt „OFFENE ENTSCHEIDUNGEN FÜR NICK“ in `LAUNCH.md`: echte Namen, Impressum, Lizenz, Marvin-Spiegel, Balance des Finales, Handy-Test, Alterstext.
4. **Recherche-Entscheidungen** (`docs/gameplay/recherche-store.md`): Capacitor oder TWA (§3), Altersstufe (§4.3), Händlerstatus (§4.4), Alkohol-Stellen (§7, Punkt 12), Name (§7, Punkt 13).
5. **Datenschutz-Adresse:** reicht der Anker in `ueber.html`, oder braucht es eine eigene `datenschutz.html`?
