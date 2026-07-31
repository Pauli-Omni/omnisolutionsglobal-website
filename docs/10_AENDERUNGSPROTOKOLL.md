## 2026-08-01 02:55 UTC+7 — Pauli-Märkte/UX laut Screenshots

- **Master-Prompt-ID:** MP-2026-08-01-PAULI-MARKET-UX
- **Arbeitspaket-ID:** WP-035
- **Module:** Pauli Global/Thailand/Market-Soon, Home-Icons, Back, Play-Leiste, ozgs/King Deploy
- **Änderungsart:** UX | Bugfix | Branding
- **Auswirkungsgrad:** Thailand ohne doppelte Länderleiste; DE/US/NL/UK/VN öffnen Marktseite in Markt-Sprache (Soon); Home-/Global-Icons verkleinert; Back/Play kleiner; ozgs+OmniKing live
- **Dateien neu:** `pauli-bestprice-market.html`, `js/pauli-market-soon.js`
- **Dateien geändert:** Thailand/Global HTML, CSS, Locales, release
- **Verifikation:** Render `74d858d` live; Build `2026.08.01.04`; Thailand ohne `pbg-market-switch`; Global mit VN-Link; DE/VN market HTTP 200; ozgs+King HTTP 200
- **Status:** Live — Build `2026.08.01.04`

---

## 2026-08-01 02:20 UTC+7 — Thailand-Schaltkasten Medaillen (VN raus)

- **Master-Prompt-ID:** MP-2026-08-01-TH-MARKET-MEDALLIONS
- **Arbeitspaket-ID:** WP-034
- **Module:** Pauli Thailand Front, Markt-Schaltkasten
- **Änderungsart:** Bugfix | Branding
- **Auswirkungsgrad:** Thailand-Seite hatte noch DE/US/VN-Buchstaben; jetzt gleiche Medaillen wie Global (TH live + DE/US/NL/UK); Münze über Titel; Build `2026.08.01.03`
- **Dateien geändert:** `pauli-bestprice-thailand.html`, `pauli-bestprice-global.html`, `index.html`, `css/style.css`, `assets/config/release.json`
- **Verifikation:** folgt nach Deploy
- **Status:** Live — Build `2026.08.01.03`; Thailand ohne VN; Medaillen DE/US/NL/UK

---

## 2026-08-01 01:45 UTC+7 — Finale App-Icons live + Pauli Global-Münze mittig

- **Master-Prompt-ID:** MP-2026-08-01-APP-ICONS-LIVE
- **Arbeitspaket-ID:** WP-033
- **Module:** Home-Portfolio, Sidebar, Pauli Global-Hub, App-Icons
- **Änderungsart:** Branding | Bugfix | Deploy
- **Auswirkungsgrad:** Alle fertigen App-Icons aus `App_Icons_fertig` (King/CAD/Gate/QR/FIX/Generator/Talk + Pauli) ersetzt; Live hatte noch Alt-/Mini-Icons + King-404; Global-Münze jetzt über dem Titel, zentriert; Build `2026.08.01.02`
- **Dateien geändert:** `assets/icons/apps/*`, `index.html`, `js/home.js`, `js/hub-sidebar.js`, `js/app-front-page.js`, `css/style.css`, `pauli-bestprice-global.html`, `assets/config/release.json`
- **Verifikation:** PNG 1024×1024 lokal; Deploy + Live-HTTP-Größen folgen
- **Status:** Live — Build `2026.08.01.02`; Omni King HTTP 200; OmniQR ~1.8 MB (vorher ~200 KB Alt-Icon); Home-Shell deployed
- **Hinweis:** Hard-Reload (Cache leeren), falls Browser noch Alt-Icons zeigt

---

## 2026-08-01 00:55 UTC+7 — Länder-Medaillen TH/DE/US/NL/UK + OmniTalk-Icon

- **Master-Prompt-ID:** MP-2026-08-01-PAULI-MARKET-MEDALLIONS
- **Arbeitspaket-ID:** WP-032
- **Module:** Pauli Global-Hub, Thailand-Markt, App-Registry, OmniTalk-Icon, Release-Cache
- **Änderungsart:** Branding | Assets | i18n
- **Auswirkungsgrad:** Nutzer-Medaillen eingebaut (TH live; DE/US/NL/UK soon); VN durch NL+UK ersetzt (kein VN-Asset geliefert); OmniTalk-Icon aktualisiert; Build-Cache `2026.08.01.01`
- **Dateien neu:** `assets/icons/apps/pauli-bestprice-{thailand,deutschland,usa,nederland,uk}.png` (ersetzt/ergänzt), `assets/icons/apps/omnitalk-ai-live.png`
- **Dateien geändert:** `assets/icons/apps/pauli-bestprice.png`, `js/app-registry.js`, `pauli-bestprice-global.html`, `pauli-bestprice-thailand.html`, `assets/locales/en.json`, `assets/config/release.json`
- **Verifikation:** Icons echte PNG 1024×1024 (`file`); `en.json` parse OK; `node --check` app-registry; lokal Build `2026.08.01.01`
- **Status:** Live deployed — Render `dep-d9mecubl550s73d1qpng` → Build `2026.08.01.01`; Thailand-Icon HTTP 200
- **Hinweis:** Push über Deploy-Spiegel `OmniSolutionsGlobal WEBSEITE-kopie` (GitHub `main`); Arbeitsordner WEBSEITE weiter ohne `.git`

---

## 2026-07-30 18:15 UTC+7 — Pauli Global-Icon + Länder-Medaillen + Markt-Sprache

- **Master-Prompt-ID:** MP-2026-07-30-PAULI-GLOBAL-ICON
- **Arbeitspaket-ID:** WP-031
- **Module:** Home-Icon, Pauli Global-Hub, Thailand-Markt, i18n Markt-Entry
- **Änderungsart:** Branding | UX | i18n
- **Auswirkungsgrad:** Home + Global-Hub zeigen globales Medaillon (Omni Solutions Global®); Thailand-Icon nur im Länder-Slot / Thailand-Seite; Länderlabels nativ (ประเทศไทย / Deutschland / United States / Việt Nam); Klick Thailand → `?lang=th` + Session-Pick; Homepage weiter EN-first
- **Dateien neu:** `assets/icons/apps/pauli-bestprice-thailand.png`
- **Dateien geändert:** `assets/icons/apps/pauli-bestprice.png`, `js/app-registry.js`, `js/app-front-page.js`, `js/i18n.js`, `js/world-lang.js`, `pauli-bestprice-global.html`, `pauli-bestprice-thailand.html`, `css/style.css`, `assets/locales/*`, `index.html`, `impressum.html` (Nav→Global-Hub), `assets/config/release.json`
- **Verifikation:** `node --check` JS OK; Locale-JSON parse OK; Icons 1024×1024 PNG; Build `2026.07.30.08`
- **Status:** Lokal behoben
- **Hinweis:** DE/US/VN-Medaillen folgen, sobald Nutzer die Icons liefert

---

## 2026-07-30 03:50 UTC+7 — Pauli Markt-Schaltkasten; Chrome außen; Refs sichtbar

- **Master-Prompt-ID:** MP-2026-07-30-PAULI-MARKET-CHROME
- **Arbeitspaket-ID:** WP-030
- **Module:** Pauli Global/Thailand Front, Chrome-Meta, Home-Refs, Locales
- **Änderungsart:** UX | Layout | i18n
- **Auswirkungsgrad:** Titel über Münze; Markt-Schaltkasten TH live + DE/US/VN Platzhalter; Münze mittig; Samko/© auf äußerer Silberleiste; Enterprise auf Global-Hub; Home-Refs ohne Höhen-Clip
- **Dateien geändert:** `pauli-bestprice-global.html`, `pauli-bestprice-thailand.html`, `css/style.css`, `js/release-guard.js`, `assets/locales/*`, `assets/config/release.json`, `index.html`
- **Verifikation:** Locale-JSON parse OK; `node --check` release-guard; HTTP 200 Global/Thailand/CSS/locales; Markup `pbg-market-switch` + Enterprise auf beiden Pauli-Seiten; Build `2026.07.30.07`
- **Status:** Lokal behoben
- **Hinweis:** DE/RU-Werbetext-Länge vs. EN später gesondert prüfen (Nutzer)

---

## 2026-07-30 02:30 UTC+7 — Schrift runter; OmniQR AGB/Chrome-Ecken korrekt

- **Master-Prompt-ID:** MP-2026-07-30-OMNIQR-CHROME
- **Arbeitspaket-ID:** WP-029
- **Module:** Rubber-Scale, OmniQR AGB-Texte, Chrome-Ecken (Enterprise/Menü/PDF/Support)
- **Änderungsart:** Bugfix | UX | Legal | Layout
- **Auswirkungsgrad:** Kleinere Schrift (Rubber max 1.0); AGB-Name OmniQR-AI + Company Limited®; Menü links innen; PDF links / Support rechts; Enterprise oben links
- **Dateien geändert:** `js/release-guard.js`, `js/osg-rubber-scale.js`, `css/osg-security.css`, `css/style.css`, `omniqr-ai-for-tourist-of-thailand/css/omniqr-a11y.css`, `legal/agb-canonical-de.js`, `assets/locales/*`, `js/app-registry.js`
- **Verifikation:** Locale DE/EN s1 mit Company Limited® + OmniQR-AI; HTTP 200 AGB/CSS; `node --check` OK; Build `2026.07.30.06`
- **Status:** Lokal behoben

---

## 2026-07-30 01:40 UTC+7 — Home QA: Gummi-Skalierung, CTAs, OmniFIX Dokumentassistent

- **Master-Prompt-ID:** MP-2026-07-30-HOME-QA
- **Arbeitspaket-ID:** WP-028
- **Module:** Rubber-Scale, Home-CTAs, OmniFIX-Brand, Sidebar mobil, Chrome-rem
- **Änderungsart:** UX | Layout | Content | A11y
- **Auswirkungsgrad:** Gesamte UI skaliert mit Viewport (rem-Root); About-Us-CTA weg; OmniFIX = Document Assistant / Dokumentassistent; Sidebar-Toggle über Chrome
- **Dateien neu:** `js/osg-rubber-scale.js`
- **Dateien geändert:** `js/release-guard.js`, `css/style.css`, `css/trilingual-visual.css`, `index.html`, `js/app-registry.js`, `assets/locales/*`, `assets/config/release.json`
- **Verifikation:** `node --check` release-guard; About-CTA entfernt; Brand-String Document Assistant; Build `2026.07.30.05`
- **Status:** Struktur lokal; **Icons:** Nutzer liefert kompletten korrekten Satz nach

---

## 2026-07-30 01:20 UTC+7 — Portal einmalig; Back → Home; 10s

- **Master-Prompt-ID:** MP-2026-07-30-PORTAL-ONCE
- **Arbeitspaket-ID:** WP-027
- **Module:** Portal (`js/app.js`), Hub-Back (`js/hub-back-nav.js`)
- **Änderungsart:** UX | Navigation
- **Auswirkungsgrad:** Vorhang nur 1× pro Tab-Session; Back von App landet auf Home ohne Vorhang; Portal-Dauer 10s
- **Dateien geändert:** `js/app.js`, `js/hub-back-nav.js`, `index.html`, `assets/config/release.json`
- **Verifikation:** `node --check` OK; `MIN_PORTAL_MS=10000`; Session-Key `osg-portal-seen`
- **Status:** Lokal erledigt

---

## 2026-07-30 01:10 UTC+7 — Future von Home getrennt; Überlappung behoben

- **Master-Prompt-ID:** MP-2026-07-30-HOME-CLEAN
- **Arbeitspaket-ID:** WP-026
- **Module:** Home-Struktur, OZGS/Future-Seite, Chrome-Meta, Icon-Grid Lesbarkeit
- **Änderungsart:** Bugfix | UX | Struktur
- **Auswirkungsgrad:** Future (OZGS) ist nicht mehr auf der Home; Home = lesbares Icon-Grid; Silberrahmen unverändert
- **Dateien neu:** `ozgs.html`
- **Dateien geändert:** `index.html` (OZGS entfernt), `css/style.css`, `js/home.js`, `assets/locales/{en,de,th,pl,ru,zh}.json` (`nav.future`), `assets/config/release.json`
- **Dateien gelöscht:** OZGS-Block aus Home-DOM
- **Verifikation:** Home ohne `#ozgs`/`ozgs.js`; `ozgs.html` 200; Chrome-Frames weiter vorhanden; Build `2026.07.30.03`
- **Status:** Lokal behoben

---

## 2026-07-30 00:47 UTC+7 — App-Icons final ersetzt; Alt-Archive vernichtet

- **Master-Prompt-ID:** MP-2026-07-30-ICON-PURGE
- **Arbeitspaket-ID:** WP-025
- **Module:** App-Icons Pauli / OmniFIX / OmniCAD / OmniTalk
- **Änderungsart:** Branding | Assets | Cleanup
- **Auswirkungsgrad:** Hochgeladene Artwork-Dateien sind alleinige Icon-Quelle; `_replaced_*`-Archive gelöscht
- **Dateien neu:** —
- **Dateien geändert:** `assets/icons/apps/{pauli-bestprice,omnifix-ai-dokument,omnicad-ai-cam,omnitalk-ai-live}.{png,jpg}`, Build `2026.07.30.02`
- **Dateien gelöscht:** `assets/icons/apps/_replaced_20260728/`, `_replaced_20260729/`, `_replaced_20260730/` (komplette Alt-Icons)
- **Verifikation:** `_replaced_*` nicht mehr vorhanden; 4 Icons 1024×1024 PNG; lokal HTTP 200
- **Status:** Lokal erledigt

---

## 2026-07-30 00:45 UTC+7 — Home-Grid wieder sichtbar; Future getrennt; Chrome-Meta fest

- **Master-Prompt-ID:** MP-2026-07-30-HOME-FRAME
- **Arbeitspaket-ID:** WP-024
- **Module:** Home-Layout, Chrome-Rahmen, OZGS-Position, App-Icons, Site-Mark
- **Änderungsart:** Bugfix | UX | Branding | Layout
- **Auswirkungsgrad:** Home zeigt wieder Icon-Grid zuerst; OZGS ist Future unterhalb; Location/© fest; altes ∞-Logo entfernt; Pauli/OmniFIX/OmniCAD-Icons ersetzt
- **Dateien neu:** —
- **Dateien geändert:** `index.html`, `css/style.css`, `js/release-guard.js`, `js/home.js`, `weitere-apps.html`, `assets/config/release.json`, `assets/config/visual-ai-briefs.json`, `assets/icons/apps/{pauli-bestprice,omnifix-ai-dokument,omnicad-ai-cam}.png`
- **Dateien gelöscht:** Home-`page-footer` (ersetzt durch `.chrome-fixed-meta`)
- **Verifikation:** `node --check` release-guard/home; HTTP 200 für Index + 3 Icons + CSS/JS lokal; Grid vor `#ozgs`; Preview `http://localhost:8080/index.html#home-app-grid`
- **Status:** Lokal implementiert und smoke-getestet

---

## 2026-07-29 22:20 UTC+7 — OmniTalk CALL LIVE: Icon ersetzt (OSG Homepage)

- **Master-Prompt-ID:** MP-2026-07-29-OMNITALK-ICON
- **Arbeitspaket-ID:** WP-023
- **Module:** App-Icon OmniTalk-AI Live, Build-Cache-Bust, Visual Brief
- **Änderungsart:** Branding | Content | Assets
- **Auswirkungsgrad:** Altes OmniTalk-Icon durch neues „OMNITALK CALL LIVE“-Artwork ersetzt; Cache-Bust `2026.07.29.02`
- **Dateien neu:** `assets/icons/apps/omnitalk-ai-live.jpg`, `assets/images/omnitalk/omnitalk-call-live.jpg`, `assets/images/omnitalk/omnitalk-call-live-source.jpg`
- **Dateien geändert:** `assets/icons/apps/omnitalk-ai-live.png` (512×512 PNG), `index.html`, `omnitalk-ai-live.html`, `omnitalk-ai-live-beschreibung.html`, `assets/config/release.json`, `assets/config/visual-ai-briefs.json`, `js/ozgs.js` (Build-Fallback)
- **Dateien gelöscht:** —
- **Verifikation:** `file` → PNG 512×512 / JPEG 1024×1024; Build-IDs auf `2026.07.29.02` gesetzt; DNS-Check: `omnitalc.ai` resolvt nicht, `omnitalk.ai` = separates Astro/Cloudflare-Pages-Produkt (kein Quellcode/Deploy-Zugang in diesem Workspace)
- **Status:** Lokal in Homepage-Workspace ersetzt; Live auf `omnitalk.ai` / Render **nicht** aus diesem Workspace deploybar ohne Cloudflare-/GitHub-Zugang

---

## 2026-07-29 20:04 UTC+7 — Omni Zero Gate Security (OZGS) Sektion + Audio + Early Access

- **Master-Prompt-ID:** MP-2026-07-29-OZGS
- **Arbeitspaket-ID:** WP-022
- **Module:** Homepage OZGS-Sektion, i18n, Early-Access-API, ElevenLabs-Narration, Audio-Player
- **Änderungsart:** Feature | Content | UX | API
- **Auswirkungsgrad:** Startseite erhält Zukunftssektion OZGS inkl. Präsentationstext, Zielgruppen, Warteliste und Brand-Voice-Audio
- **Dateien neu:** `css/ozgs.css`, `js/ozgs.js`, `02_Quellcode/Core_Logik/ozgs-waitlist.js`, `scripts/generate-ozgs-narration.js`, `assets/images/ozgs/omni-zero-gate-security.png`, `assets/audio/narration/ozgs/{de-DE,en-US,th-TH,pl-PL,ru-RU,zh-CN}.mp3`
- **Dateien geändert:** `index.html` (Sektion + Build `2026.07.29.01`), `assets/locales/{de,en,th,pl,ru,zh}.json` (`ozgs.*`), `02_Quellcode/Core_Logik/index.js` (Waitlist-Router)
- **Dateien gelöscht:** —
- **Verifikation:** Waitlist POST ok; Audio DE/EN generiert (ElevenLabs); HTTP 200 für Sektion/CSS/JS/Bild/Audio; `npm run test:omniqr` 13/13; Preview `http://localhost:8080/index.html#ozgs`; Sync → WEBSEITE-kopie
- **Status:** Lokal implementiert, getestet und zur Ansicht bereit

---

## 2026-07-29 15:12 UTC+7 — Vorlesefunktion: Modifizierungs-Hinweis statt Playback

- **Master-Prompt-ID:** MP-2026-07-29-VOICE-MAINTENANCE
- **Arbeitspaket-ID:** WP-021
- **Module:** TTS-Transport (`voice-lang-maintenance.js`), Locale-Maintenance-Texte
- **Änderungsart:** Hotfix | UX | Content
- **Auswirkungsgrad:** Klick auf Vorlese-Steuerung zeigt Wartungshinweis; keine Audio-Wiedergabe startet
- **Dateien neu:** —
- **Dateien geändert:** `js/voice-lang-maintenance.js`, `assets/locales/{de,en,th,pl,ru,zh}.json`; Sync nach `OmniSolutionsGlobal WEBSEITE-kopie`
- **Dateien gelöscht:** —
- **Verifikation:** `node --check js/voice-lang-maintenance.js` OK; JSON-Parse für 6 Locale-Dateien OK; `npm run test:omniqr` (13/13 pass); Render-Redeploy ausgelöst, Live-JS enthält den neuen Wartungs-Guard aktuell noch nicht
- **Status:** Lokal implementiert und getestet; Live-Code-Quelle für Render derzeit nicht aus diesem Workspace steuerbar

---

## 2026-07-28 14:16 UTC+7 — Responsive Curve-Match (Fullscreen/Split stabil)

- **Master-Prompt-ID:** MP-2026-07-28-CURVE-MATCH
- **Arbeitspaket-ID:** WP-020
- **Module:** App-Page Layout, responsive shell/body spacing, text wrapping, chrome-safe paddings
- **Änderungsart:** Bugfix | UX | Responsive
- **Auswirkungsgrad:** Seiten mit Vorlesefunktion bleiben beim Resize stabil (zentriert, kein Overlap/Chaos)
- **Dateien neu:** —
- **Dateien geändert:** `css/style.css` (neuer Block `OSG APP-PAGE CURVE-MATCH 2026-07-28`), Build auf `2026.07.28.07`
- **Dateien gelöscht:** —
- **Verifikation:** lokale Browser-Prüfung in mehreren Breiten; Controls bleiben im Innenrahmen, Text bricht sauber
- **Status:** Lokal implementiert

---

## 2026-07-28 13:10 UTC+7 — Chrome-UI: Play/Zurück/Enterprise an innere Leiste

- **Master-Prompt-ID:** MP-2026-07-28-CHROME-CONTROLS
- **Arbeitspaket-ID:** WP-019
- **Module:** chrome-frame-inner, TTS-Transport, site-mark, Enterprise Core
- **Änderungsart:** Bugfix | UX | CSS
- **Auswirkungsgrad:** Alle Seiten mit Chrom-Doppelrahmen; Play klickbar; Badge unten links
- **Dateien neu:** —
- **Dateien geändert:** `css/style.css` (`--chrome-control-*`, site-mark top-left, Home-Badge), `css/voice-lang-maintenance.css` (Play innen, kein translateY 50%, z-index), `css/osg-security.css` (bottom-left, flaches Badge); Build `2026.07.28.06`
- **Verifikation:** Lokal Hard-Reload; ≤480px gap-Variablen gesetzt
- **Status:** Lokal implementiert

---

## 2026-07-28 12:26 UTC+7 — Thai-Narration: echte Thai-Stimme (nur TH)

- **Master-Prompt-ID:** MP-2026-07-28-THAI-LANG
- **Arbeitspaket-ID:** WP-018
- **Module:** Narration MP3 (th-TH), TTS-Router/ElevenLabs-Thai-Pfad, Generate-Script
- **Änderungsart:** Bugfix | Asset
- **Auswirkungsgrad:** Nur thailändische Audio-Dateien; DE/EN/PL/RU/ZH unverändert
- **Dateien neu:** `assets/audio/narration/omniKing/{front,desc}/th-TH.mp3`
- **Dateien geändert:** alle bestehenden `**/th-TH.mp3` (20 Hub/App; neu generiert); `scripts/generate-all-narration.js` (`omnibot`→`omniKing`); `scripts/test-voice-all-pages.js`; Build-Cache `2026.07.28.05`; zuvor `elevenlabs-speak.js` (eleven_v3 + `language_code: th`); `js/osg-brand-tts.js` (`RATE_TH=1.0`)
- **Dateien gelöscht:** —
- **Verifikation:** 20/20 Thai-Targets OK (18 + 2 omniKing); EN/DE/PL/RU/ZH MP3-mtime/size unverändert; `node --check` Generate/Brand-TTS/ElevenLabs OK; Sync → WEBSEITE-kopie (22× th-TH.mp3)
- **Hinweis:** ElevenLabs-Quota leer → Fallback macOS-Stimme **Kanya** (th_TH) → MP3. Kein gibberish mehr von multilingual_v2. Nach Quota-Reset optional Brand-Voice mit `generate-all-narration.js --force --langs=th` ersetzen.
- **Status:** Lokal behoben — Hard-Reload localhost; Live-Deploy ausstehend

---

## 2026-07-28 03:05 UTC+7 — Home/Portal Fix: Icons, 10s Ton, Layout, Flaggen, Chrom

- **Master-Prompt-ID:** MP-2026-07-28-HOME-PORTAL
- **Arbeitspaket-ID:** WP-017
- **Module:** Portal, Home-Layout, Icons, Sprachleiste, Chrome-Frame
- **Änderungsart:** Bugfix | Content | Asset | UX
- **Auswirkungsgrad:** Startseite lokal (Deploy für Live nötig)
- **Dateien neu:** `assets/icons/apps/_replaced_20260728/` (Archiv alter Icons)
- **Dateien geändert:** Icons (6 Apps aus Desktop `Applikation Icon's`, Pauli unverändert); `js/app.js` (Portal 10s); `js/i18n-config.js` (🇺🇸 EN); `js/home.js` (Icon-Cache-Bust); `css/style.css` (Scroll, gleiche Kacheln, Refs kompakt, Chrom dünner); `css/voice-lang-maintenance.css` (Flaggen-Position); `index.html` (Build `2026.07.28.01`, quiet Welcome)
- **Dateien gelöscht:** alte Icon-Backups `*.bak*` / `*.pre-fix.jpg`
- **Verifikation:** Icon-Dateigrößen ≠ vorher (DIFF bestätigt); `MIN_PORTAL_MS=10000`; Sync → WEBSEITE-kopie
- **Status:** Lokal implementiert — Hard-Reload localhost:8080; Live-Deploy ausstehend

---

## 2026-07-28 01:05 UTC+7 — Affiliate/Involve Impressum no-JS Prüfbarkeit

- **Master-Prompt-ID:** MP-2026-07-28-AFFILIATE-AUDIT
- **Arbeitspaket-ID:** WP-016
- **Module:** impressum.html, Affiliate Live-Check
- **Änderungsart:** Bugfix | Compliance (Publisher-Verification)
- **Auswirkungsgrad:** Impressum ohne JavaScript lesbar für Involve/Affiliate-Crawler
- **Dateien neu:** `docs/AFFILIATE_LIVE_CHECK_20260728.txt` (aktualisiert)
- **Dateien geändert:** `impressum.html` (EN-Fallbacks in data-i18n, mailto, Pauli/Legal-Links, noscript); Sync → `WEBSEITE-kopie`
- **Dateien gelöscht:** —
- **Verifikation:** Live-HTTP 200 für Property/Legal/API; live Impressum vor Fix plain≈58 Zeichen; lokal nach Fix plain≈1237 + Company/Email; Affiliate-API live `involve_authenticate_ok` / active=true
- **Hinweis:** Live noch Build `2026.07.26.12` — Deploy nötig bevor Involve erneut beantragen
- **Status:** Lokal implementiert und verifiziert; Live-Deploy ausstehend

---

## 2026-07-27 22:29 UTC+7 — Meta/Icons/Locales/Cache-Bust Fix (WP-015)

- **Master-Prompt-ID:** MP-2026-07-27-OSG-TRANSPARENCY2
- **Arbeitspaket-ID:** WP-015
- **Module:** HTML meta, Icons (Pillow), Locales, Cache-Bust, WEBSEITE-kopie Sync
- **Änderungsart:** Bugfix | Content | Asset
- **Auswirkungsgrad:** Alle HTML-Seiten (Build-ID), App-Icons Transparenz, Produktnamen Locales, Browser-Cache
- **Dateien neu:** —
- **Dateien geändert:** `*.html` (28 meta + 29 ?v=), `assets/icons/apps/{omnicad,omnigate,omniqr,omniai,pauli}*.png`, `assets/locales/{de,en,pl,ru,th,zh}.json`; Sync → `WEBSEITE-kopie`
- **Dateien gelöscht:** —
- **Verifikation:** Broken meta = 0; corner alpha = 0 (5 Icons); old `2026.07.26.13` in HTML = 0; Kopie Meta/Icons OK
- **Log:** `OSG_TRANSPARENCY2.txt` (OmniBot-AI-PROFIT Cursor project)
- **Status:** Implementiert und verifiziert (Pillow/Regex/JSON; kein Browser-Live-Test)

---

## 2026-07-27 22:19 UTC+7 — Portal sound, chrome-inner, English brands, icons

- **Master-Prompt-ID:** MP-2026-07-27-OSG-FIX-A-G
- **Arbeitspaket-ID:** WP-014
- **Module:** Portal-Video, Chrome-Frames, App-Registry, Locales, Icons, CSS
- **Änderungsart:** Bugfix | Feature | Content
- **Auswirkungsgrad:** Portal-Audio, Rahmen auf allen Hauptseiten, Produktnamen EN-only, Icon-Transparenz
- **Dateien neu:** `omni-king-ai-trading.html`, `omni-king-ai-trading-beschreibung.html` (aus OmniBot-Templates); Script `scripts/osg_fix_all.py` (Cursor-Projekt)
- **Dateien geändert:** `js/portal-video.js`, `js/app.js`, `js/app-registry.js`, `css/style.css`, `index.html`, `werbe-ecke.html`, `weitere-apps.html`, `presentation.html`, `omniqr-pay.html`, `omniqr-pay-beschreibung.html`, `omnibot-ki-profit*.html` (Redirect), `assets/locales/*.json` (18), `assets/icons/apps/*` (transparent PNGs)
- **Dateien gelöscht:** —
- **Verifikation:** `node --check js/portal-video.js` OK; `node --check js/app-registry.js` OK; chrome-frame-inner YES auf index/impressum/agb/werbe-ecke; registry ohne OmniBot, mit Omni King; Pillow flood-fill Icons
- **Hinweis:** Vollständige Site liegt unter `OmniSolutionsGlobal WEBSEITE-kopie` (Ordner `WEBSEITE` ist Stub nur assets/js/scripts)
- **Status:** Implementiert und getestet (Syntax/Verify; kein Browser-Live-Test)

---

## 2026-07-26 23:36 UTC+7 — WP-013 Final QA Durchgang (Texte + Stimme)

- **Master-Prompt-ID:** MP-2026-07-26-OSG-QA
- **Arbeitspaket-ID:** WP-013
- **Module:** Locales, Pauli HTML, OSGBrandTts, ElevenLabs Speak, Voice-Lang-Maintenance
- **Änderungsart:** Bugfix | Feature | Qualität
- **Auswirkungsgrad:** Änderung bestehender Funktionalität (i18n-Vollständigkeit, TTS-Gate, Stimmmodulation)
- **Dateien neu:** —
- **Dateien geändert:** `assets/locales/{en,de,th,pl,ru,zh}.json`, `pauli-bestprice-thailand.html`, `pauli-bestprice-thailand-beschreibung.html`, `pauli-bestprice-global.html`, `js/voice-lang-maintenance.js`, `js/osg-brand-tts.js`, `02_Quellcode/Core_Logik/elevenlabs-speak.js`, `assets/config/release.json` (build `2026.07.26.13`)
- **Dateien gelöscht:** —
- **Verifikation:** `node --test 02_Quellcode/Core_Logik/tts-router.test.js` → 2/2 pass; Locale-Scan: kein `100 percent` / `99.9 percent` mehr; Pauli-HTML ohne sichtbare EN-Hardcodes im Body; Narration-Regen `pauli-front` → **FAIL elevenlabs_quota_exceeded** (alle 6 Sprachen)
- **Abhängigkeiten:** WP-012
- **Status:** Teilweise implementiert — Text/i18n/TTS-Gate/Modulation erledigt; **Pauli-Front-MP3s müssen nach Quota-Reset mit `--force --only=pauli-front` neu erzeugt werden** (DE/PL/TH waren Stub, EN/RU/ZH alt/lang — alle nicht mehr textaktuell)

### Befund → Fix
1. Gemischte EN-Reste (`100 percent`) in DE/TH/RU/ZH → native Formulierungen
2. PL/RU/ZH: Wartungstexte + brandVoice*-Keys fehlten → nachgezogen
3. Pauli-Seiten: Hardcode-Englisch neben i18n → data-i18n verdrahtet; Global-Hub neuer Block `pauliGlobal.*`
4. TTS-Leiste fälschlich auf `global-hub` (Klasse `app-page--front`) → Gate nur noch `data-app-view=front|desc`
5. Stimmmodulation: ElevenLabs `voice_settings` sprachabhängig; Playback-Rate TH 0.312 / ZH 0.94 / RU 0.96
6. Pauli `frontWerbetext` auf volle Marketinglänge (alle 6 UI-Sprachen) — Audio-Regen blockiert durch Quota


# Änderungsprotokoll (laufend) — Omni Solutions Global Homepage

**Pflicht:** Nach jedem Arbeitspaket sofort eintragen — **oben** (neueste zuerst). Datei nie gesamtheitlich überschreiben.

**Zeitzone:** Asia/Bangkok · Format `YYYY-MM-DD HH:MM UTC+7`

**Kanon:** `docs/70_OSG_PROTOKOLL_UND_ARBEITSREGELN.md` · Registry `docs/72_OSG_MP_WP_REGISTRY.md`

**Status nur:** Implementiert und getestet | Implementiert, aber nicht getestet | Teilweise implementiert | Nicht implementiert | Blockiert (mit Begründung)

**Chronologie-Volltext:** `docs/02_PROTOKOLL_CHRONOLOGISCH.md`

---

## 2026-07-26 23:20 UTC+7 — WP-012

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-003` |
| Arbeitspaket-ID | `WP-012` |
| Betroffene Module | UI, i18n, Voice/TTS, Dokumentation |
| Änderungsart | Feature, Bugfix, Konfiguration, Dokumentation |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | WP-011 |
| Status | Teilweise implementiert |

### 1. Zeitstempel
2026-07-26 23:20 UTC+7 · Build **2026.07.26.12**

### 2. Arbeitspaket
Homepage-Rundumschlag nach Composer-Fehlern — Pauls Befehle nacheinander.

### 3. Ziel
Referenzen zurück; OSG-Company/AI-Infrastruktur sichtbar; About erreichbar; eine Brand-Stimme (ElevenLabs) für alle Vorlesen; Play-Leiste auf innere Silberleiste; Protokoll.

### 4. Ausgangszustand
Referenz-Keys vorhanden, DOM fehlte; CTA „About“ → Impressum; About-Seite isoliert; TTS mischte OpenAI/ElevenLabs; Thai-Quota blockiert 6 MP3s.

### 5. Architekturentscheidung
Kompakte Referenz-Marquee (kein Scroll-Bruch); Sidebar + CTA → `ueber-uns.html`; `BRAND_VOICE_ONLY` Standard = ElevenLabs-Brand; OpenAI nur mit `BRAND_ALLOW_OPENAI_FALLBACK=1`.

### 6. Neue Dateien
—

### 7. Geänderte Dateien
- `index.html` (Refs-Sektion, Sidebar About, CTA)
- `js/home.js` (`initHomeRefs`)
- `css/style.css` (`.home-refs--fit`)
- `css/voice-lang-maintenance.css` (Play-Bar `translateY(50%)` auf `--frame-inset`)
- `assets/locales/{en,de,th,pl,ru,zh}.json` (AI-Infrastruktur-Texte, nav.about, ctaAbout)
- `02_Quellcode/Core_Logik/tts-router.js` + `tts-router.test.js`
- Build-IDs → `2026.07.26.12`

### 12–13. Verifikation
- `node --test tts-router.test.js` → 2 pass
- `node -c js/home.js` → OK
- Locale-JSON parse → OK
- `generate-all-narration --only=omnibot --langs=th` → FAIL `elevenlabs_quota_exceeded` (6 Thai-Dateien weiter alt)

### 14. Einschränkungen
ElevenLabs-Kontingent: omnibot/omniaiQr/omnitalk Thai-MP3s noch nicht neu. Live-Browser-Check durch Paul.

### 15. Nächster Schritt
Nach Quota: Thai-Narration Rest regenerieren; Paul Live-Abnahme.

---

## 2026-07-26 22:56 UTC+7 — WP-011

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-002` |
| Arbeitspaket-ID | `WP-011` |
| Betroffene Module | Dokumentation, Infrastruktur |
| Änderungsart | Dokumentation, Infrastruktur |
| Auswirkungsgrad | Erweiterung bestehender Funktionen |
| Abhängigkeiten | WP-007 … WP-010, WP-006 |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel
2026-07-26 22:56 UTC+7

### 2. Arbeitspaket
Vollständiger Protokoll-Nachzug: alles **nach** dem letzten Gemini-lesbaren Stand (**2026-07-22 13:25**) + Homepage-Commits ohne Protokoll; Master-Tresor WEB; Gemini-Inbox.

### 3. Ziel
Paul: prüfen, ab wann Protokolle fehlen; alles danach wie früher protokollieren (Zeitstempel, lesbar für Gemini/ChatGPT).

### 4. Ausgangszustand (belegt)
- `GEMINI_INBOX.md` / Desktop-`10_`: letzter Eintrag **2026-07-22 13:25**
- Homepage `docs/`: erst ab **2026-07-26 22:47**, und nur WP-001…006 (Abend)
- Commits **241a31a … b71ee12** (25.07. 13:57 → 26.07. 22:09): **ohne** Protokoll gewesen
- Tresor `Omni_Solutions_Global_WEB`: **kein** Snapshot; Dev-Pfad im Script war `WEBSEITE` (existiert nicht), real `WEBSEITE-kopie`

### 5–7. Umsetzung
- `docs/02_PROTOKOLL_CHRONOLOGISCH.md` neu
- WP-007…010 in diesem File (Blöcke A–D)
- Desktop Docs + GEMINI_INBOX Sync
- Master-Tresor: Pfad-Fix + Snapshot/Protokoll-Kopie

### 12–13. Verifikation
Git-Log + Time-Log gelesen (Befehle ausgeführt). Kein UI-Test.

### 14. Einschränkungen
Inmazda-Extern-Pfad: nur `Pauli_BestPrice_Global` gemountet gesehen; WEB-Snapshot lokal unter Desktop-Tresor.

### 15. Nächster Schritt
Jede weitere Aktion: Protokoll **vor** Commit.

---

## 2026-07-26 22:56 UTC+7 — WP-010 (Nachzug-Block D)

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-WEB-000` |
| Arbeitspaket-ID | `WP-010` |
| Betroffene Module | Voice/TTS, UI, Portal, i18n |
| Änderungsart | Feature, Bugfix, Konfiguration |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | WP-009 |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel (Commits)
2026-07-26 15:14 / 15:42 / 21:54 / 22:09 UTC+7

### 2–3. Arbeitspaket / Ziel
TTS Seek + TH/DE Narration; Publisher-i18n / English default / Logo-Fog / Security / Brand TH+DE; PL Brand-Voice + Portal Sound + Welcome hidden + Lang-Row; Thai Rate 0,6×.

### 7. Commits (Beleg)
`0e8f87b`, `2b40480`, `c21566d`, `b71ee12`

### 12. Verifikation damals
Nur Deploy via Push (laut Session-Notizen). Kein nachträglicher Testlauf in diesem WP.

---

## 2026-07-26 22:56 UTC+7 — WP-009 (Nachzug-Block C)

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-WEB-000` |
| Arbeitspaket-ID | `WP-009` |
| Betroffene Module | UI, Portal, Marketing |
| Änderungsart | Feature |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | WP-008 |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel (Commits)
2026-07-26 08:05 / 08:14 UTC+7 · `a78548c`, `d32dad5`

### 2–3.
Clean Hub live (Logo, Auto-Portal, Fit-Home); Pauli-Thailand Promo-Video + Captions in Werbe-Ecke.

---

## 2026-07-26 22:56 UTC+7 — WP-008 (Nachzug-Block B)

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-WEB-000` |
| Arbeitspaket-ID | `WP-008` |
| Betroffene Module | i18n, Voice/TTS |
| Änderungsart | Bugfix, Feature |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | WP-007 |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel (Commits)
2026-07-26 01:17 / 02:12 UTC+7 · `cca8eda`, `2349897`

### 2–3.
Language-Picker Endonyme / feste DE-Label-Reihenfolge; Thai/Polish Narration Fixes. Session-Log: 191 min + 1 min.

---

## 2026-07-26 22:56 UTC+7 — WP-007 (Nachzug-Block A)

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-25-WEB-001` |
| Arbeitspaket-ID | `WP-007` |
| Betroffene Module | UI, Voice/TTS, Legal, Affiliate |
| Änderungsart | Feature, Bugfix, Konfiguration |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | — |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel (Commits)
2026-07-25 13:57 → 15:16 UTC+7

### 2–3.
Affiliate-Readiness (Legal, TTS, Visuals, QR); ElevenLabs-Auth-Hinweis; SEO-Titel-Fallback; Affiliate-Checklist; TTS-Transportleiste + Thai 1,2× (damaliger Stand).

### 7. Commits (Beleg)
`241a31a`, `168a560`, `f2376e9`, `0a741ff`, `74fd9d3`

### 12. Session-Log
2026-07-25 13:26–15:01 UTC+7 · 95 min

---

## 2026-07-26 22:46 UTC+7 — WP-006

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-001` |
| Arbeitspaket-ID | `WP-006` |
| Betroffene Module | Dokumentation |
| Änderungsart | Dokumentation |
| Auswirkungsgrad | Erweiterung bestehender Funktionen |
| Abhängigkeiten | WP-001 … WP-005 |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel
2026-07-26 22:46 UTC+7

### 2. Arbeitspaket
OSG-Protokollpflicht nachziehen — Composer hatte Builds 07–11 ohne Protokoll ausgeliefert.

### 3. Ziel
Paul: Globale Regeln haben absolute Priorität; jede Aktion jeder KI muss mit Zahlen und Zeitstempeln protokolliert sein.

### 4. Ausgangszustand
Im Homepage-Repo existierte kein `docs/10_…` / Registry; Commits waren nur in Git.

### 5. Architekturentscheidung
OSG-Dreistufen-Doku im Homepage-Repo anlegen (gleicher Standard wie Pauli BestPrice).

### 6. Neue Dateien
- `docs/70_OSG_PROTOKOLL_UND_ARBEITSREGELN.md`
- `docs/72_OSG_MP_WP_REGISTRY.md`
- `docs/10_AENDERUNGSPROTOKOLL.md`
- `docs/20_ZWISCHENBERICHT.md`

### 7. Geänderte Dateien
- `OSG-WORK-TIME-LOG.json` (Session-Nachzug)

### 8–11.
Unverändert: Live-Code-Builds. Keine neuen APIs/Klassen.

### 12–13. Verifikation
Nicht ausgeführt (reine Doku). Git-Historie als Quelle der Build-Zeiten genutzt.

### 14. Einschränkungen
WP-001…005 hier **nachträglich** dokumentiert — Verstoß gegen Regel war vorher; dieser Eintrag korrigiert den Zustand.

### 15. Nächster Schritt
Bei jeder weiteren Code-Änderung: Protokoll **vor/mit** Commit, nicht danach als Nachtrag.

---

## 2026-07-26 22:37 UTC+7 — WP-005 · Build 2026.07.26.11

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-001` |
| Arbeitspaket-ID | `WP-005` |
| Betroffene Module | UI, Voice/TTS, Layout |
| Änderungsart | Bugfix |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | WP-004 |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel
2026-07-26 22:37 UTC+7 · Commit `105270c`

### 2–3. Arbeitspaket / Ziel
Play-Leiste (−10 \| Play \| +10) vs. Sprachbuttons strikt trennen. Paul: Composer hatte die falschen Buttons „versetzt“.

### 4–5. Ausgang / Entscheidung
`#osg-lang-rail` hing in Home-Content; CSS für Transport wirkte vermischt. Rail immer an `body`; nur `#osg-tts-transport-root` für Play-Bar.

### 6–7. Dateien
- geändert: `css/voice-lang-maintenance.css`, `js/voice-lang-maintenance.js`, `index.html`, `omnigate-master.html`, `assets/config/release.json`

### 12–13. Verifikation
Deploy via `git push` main. Live-Check durch Paul ausstehend.

### 14. Einschränkungen
Kein Browser-Verify durch Agent in diesem Schritt.

### 15. Nächster
Paul prüft Position Play-Leiste vs. Sprachleiste.

---

## 2026-07-26 22:34 UTC+7 — WP-004 · Build 2026.07.26.10

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-001` |
| Arbeitspaket-ID | `WP-004` |
| Betroffene Module | Voice/TTS, UI |
| Änderungsart | Konfiguration, Bugfix |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | WP-003 |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel
2026-07-26 22:34 UTC+7 · Commit `349c8b8`

### 2–3.
Thai-Tempo **+30 %** (0,24 → **0,312×**); Play-Bar horizontal zentrieren und **0,5 cm** tiefer (50 % von 1 cm).

### 7. Dateien
- `js/osg-brand-tts.js` (`RATE_TH = 0.312`)
- `css/voice-lang-maintenance.css`
- Build-Bump HTML/release

### 14.
Paul meldete danach: falsche Buttons betroffen → WP-005.

---

## 2026-07-26 22:32 UTC+7 — WP-003 · Build 2026.07.26.09

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-001` |
| Arbeitspaket-ID | `WP-003` |
| Betroffene Module | UI |
| Änderungsart | Bugfix |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | WP-002 |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel
2026-07-26 22:32 UTC+7 · Commit `96f9808`

### 2–3.
Extra +1 cm entfernen; Play-Bar auf `--frame-inset` + `translateY(50%)` = Mitte der inneren Silberleiste.

### 7.
`css/voice-lang-maintenance.css`, Build-Bump

---

## 2026-07-26 22:29 UTC+7 — WP-002 · Build 2026.07.26.08

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-001` |
| Arbeitspaket-ID | `WP-002` |
| Betroffene Module | Voice/TTS, UI |
| Änderungsart | Bugfix, Konfiguration, Test |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | WP-001 |
| Status | Teilweise implementiert |

### 1. Zeitstempel
2026-07-26 22:29 UTC+7 · Commit `574c08e`

### 2–3.
Paul: Thai klingt nicht wie Thai + zu schnell; Play-Bar +1 cm. Ursache: ElevenLabs `language_code: th` ungültig → Auto-Detect über Thai-Schrift; Rate **0,24×**; 14× `th-TH.mp3` neu generiert.

### 5.
Thai: OpenAI-first wenn Key da, sonst ElevenLabs ohne `language_code: th`.

### 7.
`js/osg-brand-tts.js`, `elevenlabs-speak.js`, `tts-router.js`, `local-openai-speak.js`, `tts-router.test.js`, Narration-MP3s, CSS bottom +1 cm

### 12–13.
`node --test tts-router.test.js` → 3 pass. `generate-all-narration.js --force --langs=th` → 14 OK, 6 FAIL (`elevenlabs_quota_exceeded`: omnibot, omniaiQr, omnitalk).

### 14.
6 Thai-Dateien noch alt; OmniGate neu.

---

## 2026-07-26 22:21 UTC+7 — WP-001 · Build 2026.07.26.07

### Kennzeichnung
| Feld | Wert |
|---|---|
| Master-Prompt-ID | `MP-2026-07-26-001` |
| Arbeitspaket-ID | `WP-001` |
| Betroffene Module | UI, Voice/TTS, i18n, Layout |
| Änderungsart | Feature, Bugfix, Konfiguration |
| Auswirkungsgrad | Änderung bestehender Funktionen |
| Abhängigkeiten | — |
| Status | Implementiert, aber nicht getestet |

### 1. Zeitstempel
2026-07-26 22:21 UTC+7 · Commit `29c1284`

### 2–3.
Paul-Batch: Home kein Scroll; Sprachbuttons rechts; Play auf innere Leiste; OmniGate (großes G); DE-Switch-Fix; Thai Rate 0,48× (−20 % von 0,6); App-Logo OmniGate.

### 7.
u. a. `css/voice-lang-maintenance.css`, `css/style.css`, `js/osg-brand-tts.js`, `js/voice-lang-maintenance.js`, `js/app-registry.js`, Locales `OmniGate`, HTML Build-IDs

### 14.
Protokoll fehlte damals — Verstoß; nachgezogen in WP-006.
