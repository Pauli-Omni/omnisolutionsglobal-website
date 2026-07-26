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
