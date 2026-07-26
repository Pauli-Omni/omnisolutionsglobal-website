# OSG — Verbindliche Arbeits- und Protokollregeln (Global)

**Stand:** 2026-07-26 22:46 UTC+7  
**Quelle:** Paul — Dokumentationsstandard + Versions-/Änderungskennzeichnung  
**Geltung:** Omni Solutions Global® und alle zugehörigen Projekte/Apps (inkl. Homepage)  
**Gilt für:** Cursor (Composer / Auto / jedes Modell), ChatGPT, Gemini und andere KI-Systeme

## Priorität (absolut)

1. **Globale OSG-Regeln zuerst** — vor Code, vor Deploy, vor „schnell fertig“.
2. **Nach jeder Aktion / jedem Arbeitspaket:** Protokoll mit **Zeitstempel (UTC+7)** und Kennzeichnung.
3. Keine Ausnahme wegen Modellwahl (Composer, Auto, Claude, GPT).

## Arbeitsweise

1. Auftrag in **einem zusammenhängenden Arbeitsdurchlauf** abarbeiten.
2. **Keine** Unterbrechung nach jedem Teilabschnitt mit Zwischenbericht oder Rückfrage — außer objektiv fehlende Infos blockieren.
3. Bestehende funktionierende Komponenten **erweitern**, nicht unnötig neu bauen.

## Dreistufiger Dokumentationsstandard (nicht vermischen)

| Stufe | Datei | Zweck | Schreiben |
|-------|--------|--------|-----------|
| 1 | `docs/10_AENDERUNGSPROTOKOLL.md` | Technische Nachvollziehbarkeit je Arbeitspaket | Fortlaufend ergänzen, **nie** gesamtes File überschreiben |
| 2 | `docs/20_ZWISCHENBERICHT.md` | Momentaufnahme / Wiederaufnahmepunkt | Beliebig aktualisieren; **Datei überschreibbar**; beendet den Lauf **nicht** |
| 3 | `docs/90_ABSCHLUSSBERICHT.md` | Gesamtabschluss nach Master-Prompt | **Nur** wenn Master-Prompt **vollständig** erledigt |

Registry (IDs): `docs/72_OSG_MP_WP_REGISTRY.md` — Master-Prompt-IDs und Arbeitspaket-IDs, **niemals wiederverwendet**.

## Pflichtstruktur jedes Protokoll-Eintrags

### A. Kennzeichnung

| Feld | Inhalt |
|------|--------|
| Master-Prompt-ID | z. B. `MP-2026-07-26-001` |
| Arbeitspaket-ID | fortlaufend `WP-001`, `WP-002`, … (nie wiederverwendet) |
| Betroffene Module | UI, Voice/TTS, i18n, Portal, Layout, Dokumentation, … |
| Änderungsart | Feature \| Bugfix \| Refactoring \| Performance \| Sicherheit \| Architektur \| Dokumentation \| Test \| Infrastruktur \| Konfiguration |
| Auswirkungsgrad | Keine Auswirkungen · Erweiterung · Änderung · Breaking Change (mit Begründung) |
| Betroffene Dateien | neu / geändert / gelöscht |
| Verifikation | nur ausgeführte Tests/Befehle |
| Abhängigkeiten | andere WP-IDs |
| Status | nur: Implementiert und getestet \| Implementiert, aber nicht getestet \| Teilweise implementiert \| Nicht implementiert \| Blockiert (mit Begründung) |

### B. Technische 15 Felder (Pflicht)

1. Zeitstempel · 2. Arbeitspaket · 3. Ziel · 4. Ausgangszustand · 5. Architekturentscheidung · 6. Neue Dateien · 7. Geänderte Dateien · 8. Unveränderte Kernkomponenten · 9. Neue Klassen/Controller · 10. Neue APIs · 11. Wiederverwendung · 12. Tests · 13. Testergebnisse · 14. Einschränkungen · 15. Nächster Schritt
