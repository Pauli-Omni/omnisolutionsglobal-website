# Änderungsprotokoll (laufend) — Omni Solutions Global Homepage

**Pflicht:** Nach jedem Arbeitspaket sofort eintragen — **oben** (neueste zuerst). Datei nie gesamtheitlich überschreiben.

**Zeitzone:** Asia/Bangkok · Format `YYYY-MM-DD HH:MM UTC+7`

**Kanon:** `docs/70_OSG_PROTOKOLL_UND_ARBEITSREGELN.md` · Registry `docs/72_OSG_MP_WP_REGISTRY.md`

**Status nur:** Implementiert und getestet | Implementiert, aber nicht getestet | Teilweise implementiert | Nicht implementiert | Blockiert (mit Begründung)

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
