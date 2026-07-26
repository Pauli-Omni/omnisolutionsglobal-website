# Protokoll chronologisch — Omni Solutions Global Homepage

**Zweck:** Gemini / ChatGPT / jede KI kann den Verlauf mitlesen.  
**Zeitzone:** Asia/Bangkok (UTC+7)  
**Quelle Commits:** Git `Pauli-Omni/omnisolutionsglobal-website` (Arbeitskopie `OmniSolutionsGlobal WEBSEITE-kopie`)

---

## Phase Homepage-Rundumschlag WP-012 (2026-07-26 23:20 UTC+7)

| Punkt | Ergebnis |
|---|---|
| Referenzen zurück | kompakt, i18n |
| About / AI-Text | Sidebar + CTA + Lead |
| Eine Brand-Stimme | ElevenLabs-only |
| Play-Leiste | innere Silberleiste |
| Thai-Rest | Quota blockiert |

Build **2026.07.26.12**.

---

## Befund Protokoll-Lücke (2026-07-26 22:56 UTC+7)

| Ort | Letzter **vollständiger** Protokoll-Stand **vor** der Lücke | Was fehlte |
|-----|--------------------------------------------------------------|------------|
| `Docs Pauli BestPrice Global/GEMINI_INBOX.md` | **2026-07-22 13:25** (WP-016) | Alles Homepage-Arbeit ab 25.07. + Pauli WP-017/018 nicht in Inbox |
| `Docs Pauli BestPrice Global/10_…` | **2026-07-22 13:25** | WP-017/018 standen nur im Pauli-**Repo**-`docs/`, nicht im Gemini-Docs-Ordner |
| Homepage-Repo `docs/10_…` | existierte **nicht** bis **2026-07-26 22:47** | Alle Commits 25.07. 13:57 → 26.07. 22:09 ohne Protokoll; Abend 26.07. nur WP-001…006 nachgezogen |
| OSG-Master-Tresor `Omni_Solutions_Global_WEB` | **nie** Snapshot | Ordner in Manifest, Snapshot leer |

**Regelverstoß:** Composer arbeitete ohne Zeitstempel-Protokolle. Nachzug ab hier.

---

## Phase Homepage Affiliate + TTS (2026-07-25)

| Zeit UTC+7 | Commit | Was | Session-Zeit (Log) |
|---|---|---|---|
| 13:57 | `241a31a` | Affiliate-Readiness: Legal-Routen, TTS, Visuals, QR | 13:26–15:01 (95 min) |
| 14:07 | `168a560` | ElevenLabs-Auth-Fehler klarer melden | derselbe Block |
| 14:08 | `f2376e9` | SEO-Titel: statisch behalten wenn i18n-Titel leer | derselbe Block |
| 14:12 | `0a741ff` | Affiliate-Property-Checkliste + Live-Legal-URLs | derselbe Block |
| 15:16 | `74fd9d3` | TTS-Transportleiste seitenweit; Thai-Rate damals 1,2× | derselbe Block |

**Registry:** MP-2026-07-25-WEB-001 · WP-007 (Nachzug-Block A)

---

## Phase Sprachpicker + Narration Nacht (2026-07-25 22:06 → 2026-07-26 02:12)

| Zeit UTC+7 | Commit | Was | Session-Zeit (Log) |
|---|---|---|---|
| 01:17 | `cca8eda` | Language-Picker Endonyme; Pauli Thai/Polish Narration | 22:06–01:17 (191 min) |
| 02:12 | `2349897` | Labels fest: Thai Englisch Russisch Chinesisch Deutsch Polnisch | 02:11–02:12 (1 min) |

**Registry:** MP-2026-07-26-WEB-000 · WP-008 (Nachzug-Block B)

---

## Phase Hub Live / Logo / Werbe (2026-07-26 Vormittag)

| Zeit UTC+7 | Commit | Was | Session-Zeit (Log) |
|---|---|---|---|
| 08:05 | `a78548c` | Hub clean: Logo, Auto-Portal, Fit-Home (Build ~02) | 06:46–08:07 (81 min gesamt) |
| 08:14 | `d32dad5` | Pauli Thailand Promo-Video + Captions in Werbe-Ecke | danach |

**Registry:** WP-009 (Nachzug-Block C)

---

## Phase TTS Seek + Brand Voice + Portal (2026-07-26 Nachmittag/Abend)

| Zeit UTC+7 | Commit | Was | Session-Zeit (Log) |
|---|---|---|---|
| 15:14 | `0e8f87b` | TTS Seek ±10; Thai/DE Narration neu | 13:03–15:16 (132 min) |
| 15:42 | `2b40480` | Publisher-i18n, English default, Logo-Fog, Security-Badge, Brand TH/DE | 15:31–15:44 (13 min) |
| 21:54 | `c21566d` | PL Brand-Voice, Portal Sound-Timing, Welcome hidden, Lang-Row top | (Zeitlog lückenhaft; Commit-Zeit belegt) |
| 22:09 | `b71ee12` | Thai TTS auf 0,6× | vor Abend-Batch |

**Registry:** WP-010 (Nachzug-Block D)

---

## Phase Abend-Feinschliff (bereits WP-001…006 am 26.07. 22:21–22:47)

| WP | Zeit | Build | Kurz |
|---|---|---|---|
| WP-001 | 22:21 | 07 | Layout, Rail, OmniGate, DE-Switch, Thai 0,48× |
| WP-002 | 22:29 | 08 | Thai-Sprache (kein language_code th), Rate 0,24×, Narration |
| WP-003 | 22:32 | 09 | Play-Bar innere Silberleiste |
| WP-004 | 22:34 | 10 | Thai 0,312×; Bar 0,5 cm tiefer |
| WP-005 | 22:37 | 11 | Play vs Sprachbuttons getrennt |
| WP-006 | 22:46 | — | Docs-Ordner erst angelegt |

---

## Phase Protokoll-Nachzug komplett (2026-07-26 22:56 UTC+7)

| WP | Was |
|---|---|
| WP-007…010 | Chronologie Commits 25.07.–26.07. 22:09 (diese Datei + `10_`) |
| WP-011 | Gemini-Inbox + Desktop-Docs Sync + Master-Tresor WEB Snapshot |

**Status Nachzug:** Implementiert (Doku). Live-UI-Tests durch Paul ausstehend.
