'use strict';

/** Offizieller AGB-Kanon (Deutsch) — Basis für PDF & Thailand-Rechtssicherheit */
const AGB_DOCUMENT = {
  title: 'Allgemeine Geschäftsbedingungen',
  subtitle: 'OmniQR-AI for Tourist of Thailand — Omni Solutions Global',
  version: '2026',
  sections: [
    {
      heading: '§ 1 Geltungsbereich',
      paragraphs: [
        'Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der App „OmniQR-AI for Tourist of Thailand“ von Omni Solutions Global.',
        'Alle Verträge unterliegen ausschließlich dem Recht des Königreichs Thailand. Gerichtsstand ist das Königreich Thailand.'
      ]
    },
    {
      heading: '§ 2 App-Status',
      paragraphs: [
        'Der Download und die Installation der App sind für den Nutzer vollständig kostenlos.',
        'Die Nutzung setzt das Akzeptieren dieser AGB beim App-Start voraus.',
        'Lehnt der Nutzer aktualisierte AGB ab, werden die Zahlungsfunktionen automatisch gesperrt, bis eine erneute Bestätigung erfolgt.'
      ]
    },
    {
      heading: '§ 3 Abrechnung & Wechselkurs',
      paragraphs: [
        'Die Abrechnung erfolgt basierend auf dem tagesaktuellen Kurs der Frankfurter Börse zuzüglich eines kombinierten System- und Bearbeitungsaufschlags von maximal 4,5%.',
        'Omni Solutions Global fungiert als reiner technischer Zahlungsvermittler (Gateway) und schließt jede Haftung für fehlerhafte Preisanzeigen der Händler vor Ort, Wechselkursänderungen oder die Qualität der erworbenen Waren und Dienstleistungen vollständig aus.'
      ]
    },
    {
      heading: '§ 4 Support-Diagnose',
      paragraphs: [
        'Zur Gewährleistung der Systemintegrität und zur gezielten Fehlerbehebung werden bei Supportanfragen automatisiert und temporär das Telefonmodell, die OS-Version, die IP-Adresse und ein grober Standort des Nutzers erfasst.',
        'Omni Solutions Global gibt diese Daten nicht weiter und verkauft keine persönlichen Kundendaten außerhalb dieses technischen Zwecks.'
      ]
    }
  ]
};

const PDF_FILENAME = 'AGB_OmniQR_AI_Th_2026.pdf';

module.exports = { AGB_DOCUMENT, PDF_FILENAME };
