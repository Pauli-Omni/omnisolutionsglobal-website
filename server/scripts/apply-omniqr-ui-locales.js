'use strict';

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', '..', 'assets', 'locales');

/** Kurze OmniQR-UI-Texte (Knöpfe, Menü, AGB-Aktionen) — 18 Sprachen */
const OMNIQR_UI_TERMS = {
  de: {
    navLabel: 'AGBs lesen / Legal', navAria: 'AGB-Ansichtsseite öffnen',
    menuAria: 'App-Menü', menuHome: 'Start', menuDesc: 'Beschreibung', menuSupport: 'Kontakt / Support',
    pageBadge: 'Legal · Seite 3',
    readFullPage: 'Vollständige AGB-Seite öffnen', readFullPageAria: 'Gesamten Rechtstext auf der AGB-Seite lesen',
    pdfDownload: 'AGB als PDF', pdfDownloadAria: 'AGB-PDF auf Ihr Gerät speichern',
    pdfHint: 'PDF auf Gerät speichern — zum Ausdrucken.', pdfError: 'PDF-Download fehlgeschlagen.',
    readAloud: 'AGB vorlesen', readAloudAria: 'AGB von Anfang bis Ende vorlesen',
    welcomeTitle: 'Willkommen bei OmniQR-AI',
    welcomeLead: 'Lesen Sie die AGB auf dem Display. Zahlungsfunktionen setzen die Zustimmung voraus.',
    welcomeAgbBtn: 'AGBs lesen / Legal', welcomeAgbAria: 'Vollständige AGB-Seite öffnen',
    welcomeContinue: 'Zur App', welcomeContinueAria: 'Zum App-Start weiter'
  },
  en: {
    navLabel: 'Read Terms / Legal', navAria: 'Open terms and conditions page',
    menuAria: 'Application menu', menuHome: 'Home', menuDesc: 'Description', menuSupport: 'Contact / Support',
    pageBadge: 'Legal · Page 3',
    readFullPage: 'Open full terms page', readFullPageAria: 'Open the full terms page for reading',
    pdfDownload: 'Download PDF', pdfDownloadAria: 'Save terms PDF to your device',
    pdfHint: 'PDF saved on your device — ready to print.', pdfError: 'PDF download failed.',
    readAloud: 'Read terms aloud', readAloudAria: 'Read terms aloud from start to finish',
    welcomeTitle: 'Welcome to OmniQR-AI',
    welcomeLead: 'Review the terms on screen. Payment features require acceptance.',
    welcomeAgbBtn: 'Read Terms / Legal', welcomeAgbAria: 'Open the full terms page',
    welcomeContinue: 'Continue to app', welcomeContinueAria: 'Continue to the app home screen'
  },
  th: {
    navLabel: 'อ่านข้อกำหนด / กฎหมาย', navAria: 'เปิดหน้าข้อกำหนดและเงื่อนไข',
    menuAria: 'เมนูแอป', menuHome: 'หน้าแรก', menuDesc: 'คำอธิบาย', menuSupport: 'ติดต่อ / ซัพพอร์ต',
    pageBadge: 'กฎหมาย · หน้า 3',
    readFullPage: 'เปิดหน้าข้อกำหนดฉบับเต็ม', readFullPageAria: 'เปิดหน้าข้อกำหนดทั้งหมดเพื่ออ่าน',
    pdfDownload: 'ดาวน์โหลด PDF', pdfDownloadAria: 'บันทึก PDF ข้อกำหนดลงอุปกรณ์',
    pdfHint: 'บันทึก PDF ลงอุปกรณ์ — พร้อมพิมพ์', pdfError: 'ดาวน์โหลด PDF ไม่สำเร็จ',
    readAloud: 'อ่านข้อกำหนดออกเสียง', readAloudAria: 'อ่านข้อกำหนดตั้งแต่ต้นจนจบ',
    welcomeTitle: 'ยินดีต้อนรับสู่ OmniQR-AI',
    welcomeLead: 'อ่านข้อกำหนดบนหน้าจอ การชำระเงินต้องยอมรับข้อกำหนดปัจจุบัน',
    welcomeAgbBtn: 'อ่านข้อกำหนด / กฎหมาย', welcomeAgbAria: 'เปิดหน้าข้อกำหนดฉบับเต็ม',
    welcomeContinue: 'เข้าสู่แอป', welcomeContinueAria: 'ไปยังหน้าเริ่มต้นแอป'
  },
  pl: {
    navLabel: 'Regulamin / Prawo', navAria: 'Otwórz stronę regulaminu',
    menuAria: 'Menu aplikacji', menuHome: 'Start', menuDesc: 'Opis', menuSupport: 'Kontakt / Wsparcie',
    pageBadge: 'Prawo · Strona 3',
    readFullPage: 'Pełny regulamin', readFullPageAria: 'Otwórz pełny tekst regulaminu',
    pdfDownload: 'Pobierz PDF', pdfDownloadAria: 'Zapisz PDF regulaminu na urządzeniu',
    pdfHint: 'PDF zapisany na urządzeniu — do druku.', pdfError: 'Pobieranie PDF nie powiodło się.',
    readAloud: 'Czytaj regulamin', readAloudAria: 'Odczytaj regulamin od początku do końca',
    welcomeTitle: 'Witamy w OmniQR-AI',
    welcomeLead: 'Przeczytaj regulamin na ekranie. Płatności wymagają akceptacji.',
    welcomeAgbBtn: 'Regulamin / Prawo', welcomeAgbAria: 'Otwórz pełną stronę regulaminu',
    welcomeContinue: 'Do aplikacji', welcomeContinueAria: 'Przejdź do aplikacji'
  },
  ru: {
    navLabel: 'Условия / Право', navAria: 'Открыть страницу условий',
    menuAria: 'Меню приложения', menuHome: 'Главная', menuDesc: 'Описание', menuSupport: 'Контакт / Поддержка',
    pageBadge: 'Право · Стр. 3',
    readFullPage: 'Полные условия', readFullPageAria: 'Открыть полный текст условий',
    pdfDownload: 'Скачать PDF', pdfDownloadAria: 'Сохранить PDF условий на устройство',
    pdfHint: 'PDF сохранён на устройстве — для печати.', pdfError: 'Не удалось скачать PDF.',
    readAloud: 'Озвучить условия', readAloudAria: 'Озвучить условия от начала до конца',
    welcomeTitle: 'Добро пожаловать в OmniQR-AI',
    welcomeLead: 'Прочитайте условия на экране. Оплата требует принятия условий.',
    welcomeAgbBtn: 'Условия / Право', welcomeAgbAria: 'Открыть полную страницу условий',
    welcomeContinue: 'В приложение', welcomeContinueAria: 'Перейти в приложение'
  },
  zh: {
    navLabel: '阅读条款 / 法律', navAria: '打开条款与条件页面',
    menuAria: '应用菜单', menuHome: '首页', menuDesc: '说明', menuSupport: '联系 / 支持',
    pageBadge: '法律 · 第 3 页',
    readFullPage: '打开完整条款页', readFullPageAria: '打开完整条款页面阅读',
    pdfDownload: '下载 PDF', pdfDownloadAria: '将条款 PDF 保存到设备',
    pdfHint: 'PDF 已保存到设备 — 可打印。', pdfError: 'PDF 下载失败。',
    readAloud: '朗读条款', readAloudAria: '从头到尾朗读条款',
    welcomeTitle: '欢迎使用 OmniQR-AI',
    welcomeLead: '请在屏幕上阅读条款。支付功能须接受当前条款。',
    welcomeAgbBtn: '阅读条款 / 法律', welcomeAgbAria: '打开完整条款页面',
    welcomeContinue: '进入应用', welcomeContinueAria: '继续进入应用主页'
  },
  fr: {
    navLabel: 'CGU / Légal', navAria: 'Ouvrir la page des conditions',
    menuAria: 'Menu de l’app', menuHome: 'Accueil', menuDesc: 'Description', menuSupport: 'Contact / Support',
    pageBadge: 'Légal · Page 3',
    readFullPage: 'Page CGU complète', readFullPageAria: 'Ouvrir le texte intégral des CGU',
    pdfDownload: 'Télécharger PDF', pdfDownloadAria: 'Enregistrer le PDF des CGU',
    pdfHint: 'PDF enregistré sur l’appareil — prêt à imprimer.', pdfError: 'Échec du téléchargement PDF.',
    readAloud: 'Lire les CGU', readAloudAria: 'Lire les CGU du début à la fin',
    welcomeTitle: 'Bienvenue sur OmniQR-AI',
    welcomeLead: 'Lisez les conditions à l’écran. Le paiement exige leur acceptation.',
    welcomeAgbBtn: 'CGU / Légal', welcomeAgbAria: 'Ouvrir la page CGU complète',
    welcomeContinue: 'Continuer', welcomeContinueAria: 'Accéder à l’application'
  },
  es: {
    navLabel: 'Términos / Legal', navAria: 'Abrir página de términos',
    menuAria: 'Menú de la app', menuHome: 'Inicio', menuDesc: 'Descripción', menuSupport: 'Contacto / Soporte',
    pageBadge: 'Legal · Pág. 3',
    readFullPage: 'Términos completos', readFullPageAria: 'Abrir el texto legal completo',
    pdfDownload: 'Descargar PDF', pdfDownloadAria: 'Guardar PDF de términos',
    pdfHint: 'PDF guardado en el dispositivo — listo para imprimir.', pdfError: 'Error al descargar el PDF.',
    readAloud: 'Leer términos', readAloudAria: 'Leer los términos de principio a fin',
    welcomeTitle: 'Bienvenido a OmniQR-AI',
    welcomeLead: 'Lea los términos en pantalla. El pago requiere su aceptación.',
    welcomeAgbBtn: 'Términos / Legal', welcomeAgbAria: 'Abrir página de términos completa',
    welcomeContinue: 'Continuar', welcomeContinueAria: 'Ir a la aplicación'
  },
  it: {
    navLabel: 'Termini / Legale', navAria: 'Apri pagina termini e condizioni',
    menuAria: 'Menu app', menuHome: 'Home', menuDesc: 'Descrizione', menuSupport: 'Contatto / Supporto',
    pageBadge: 'Legale · Pag. 3',
    readFullPage: 'Termini completi', readFullPageAria: 'Apri il testo legale completo',
    pdfDownload: 'Scarica PDF', pdfDownloadAria: 'Salva PDF dei termini',
    pdfHint: 'PDF salvato sul dispositivo — pronto per la stampa.', pdfError: 'Download PDF non riuscito.',
    readAloud: 'Leggi termini', readAloudAria: 'Leggi i termini dall’inizio alla fine',
    welcomeTitle: 'Benvenuto in OmniQR-AI',
    welcomeLead: 'Leggi i termini sullo schermo. Il pagamento richiede l’accettazione.',
    welcomeAgbBtn: 'Termini / Legale', welcomeAgbAria: 'Apri pagina termini completa',
    welcomeContinue: 'Continua', welcomeContinueAria: 'Vai all’applicazione'
  },
  pt: {
    navLabel: 'Termos / Legal', navAria: 'Abrir página de termos',
    menuAria: 'Menu da app', menuHome: 'Início', menuDesc: 'Descrição', menuSupport: 'Contacto / Suporte',
    pageBadge: 'Legal · Pág. 3',
    readFullPage: 'Termos completos', readFullPageAria: 'Abrir texto legal completo',
    pdfDownload: 'Descarregar PDF', pdfDownloadAria: 'Guardar PDF dos termos',
    pdfHint: 'PDF guardado no dispositivo — pronto a imprimir.', pdfError: 'Falha ao descarregar PDF.',
    readAloud: 'Ler termos', readAloudAria: 'Ler termos do início ao fim',
    welcomeTitle: 'Bem-vindo ao OmniQR-AI',
    welcomeLead: 'Leia os termos no ecrã. O pagamento exige aceitação.',
    welcomeAgbBtn: 'Termos / Legal', welcomeAgbAria: 'Abrir página de termos completa',
    welcomeContinue: 'Continuar', welcomeContinueAria: 'Ir para a aplicação'
  },
  nl: {
    navLabel: 'Voorwaarden / Legal', navAria: 'Open voorwaardenpagina',
    menuAria: 'App-menu', menuHome: 'Start', menuDesc: 'Beschrijving', menuSupport: 'Contact / Support',
    pageBadge: 'Legal · Pag. 3',
    readFullPage: 'Volledige voorwaarden', readFullPageAria: 'Open volledige juridische tekst',
    pdfDownload: 'PDF downloaden', pdfDownloadAria: 'Voorwaarden-PDF opslaan',
    pdfHint: 'PDF opgeslagen op apparaat — klaar om te printen.', pdfError: 'PDF-download mislukt.',
    readAloud: 'Voorwaarden voorlezen', readAloudAria: 'Voorwaarden van begin tot eind voorlezen',
    welcomeTitle: 'Welkom bij OmniQR-AI',
    welcomeLead: 'Lees de voorwaarden op het scherm. Betalen vereist acceptatie.',
    welcomeAgbBtn: 'Voorwaarden / Legal', welcomeAgbAria: 'Open volledige voorwaardenpagina',
    welcomeContinue: 'Verder', welcomeContinueAria: 'Ga naar de app'
  },
  ar: {
    navLabel: 'الشروط / قانوني', navAria: 'فتح صفحة الشروط',
    menuAria: 'قائمة التطبيق', menuHome: 'الرئيسية', menuDesc: 'الوصف', menuSupport: 'اتصال / دعم',
    pageBadge: 'قانوني · ص ٣',
    readFullPage: 'الشروط كاملة', readFullPageAria: 'فتح نص الشروط الكامل',
    pdfDownload: 'تنزيل PDF', pdfDownloadAria: 'حفظ PDF الشروط على الجهاز',
    pdfHint: 'تم حفظ PDF على الجهاز — جاهز للطباعة.', pdfError: 'فشل تنزيل PDF.',
    readAloud: 'قراءة الشروط', readAloudAria: 'قراءة الشروط من البداية للنهاية',
    welcomeTitle: 'مرحبًا بك في OmniQR-AI',
    welcomeLead: 'اقرأ الشروط على الشاشة. الدفع يتطلب الموافقة.',
    welcomeAgbBtn: 'الشروط / قانوني', welcomeAgbAria: 'فتح صفحة الشروط الكاملة',
    welcomeContinue: 'متابعة', welcomeContinueAria: 'الانتقال إلى التطبيق'
  },
  ja: {
    navLabel: '規約 / 法務', navAria: '利用規約ページを開く',
    menuAria: 'アプリメニュー', menuHome: 'ホーム', menuDesc: '説明', menuSupport: 'お問い合わせ / サポート',
    pageBadge: '法務 · 3ページ',
    readFullPage: '規約全文', readFullPageAria: '規約の全文ページを開く',
    pdfDownload: 'PDFをダウンロード', pdfDownloadAria: '規約PDFを端末に保存',
    pdfHint: 'PDFを端末に保存 — 印刷可能。', pdfError: 'PDFのダウンロードに失敗しました。',
    readAloud: '規約を読み上げ', readAloudAria: '規約を最初から最後まで読み上げ',
    welcomeTitle: 'OmniQR-AIへようこそ',
    welcomeLead: '画面上で規約をご確認ください。決済には同意が必要です。',
    welcomeAgbBtn: '規約 / 法務', welcomeAgbAria: '規約全文ページを開く',
    welcomeContinue: '続ける', welcomeContinueAria: 'アプリへ進む'
  },
  ko: {
    navLabel: '약관 / 법적', navAria: '약관 페이지 열기',
    menuAria: '앱 메뉴', menuHome: '홈', menuDesc: '설명', menuSupport: '문의 / 지원',
    pageBadge: '법적 · 3페이지',
    readFullPage: '약관 전체', readFullPageAria: '약관 전문 페이지 열기',
    pdfDownload: 'PDF 다운로드', pdfDownloadAria: '약관 PDF를 기기에 저장',
    pdfHint: 'PDF가 기기에 저장됨 — 인쇄 가능.', pdfError: 'PDF 다운로드 실패.',
    readAloud: '약관 읽기', readAloudAria: '약관을 처음부터 끝까지 읽기',
    welcomeTitle: 'OmniQR-AI에 오신 것을 환영합니다',
    welcomeLead: '화면에서 약관을 확인하세요. 결제에는 동의가 필요합니다.',
    welcomeAgbBtn: '약관 / 법적', welcomeAgbAria: '약관 전체 페이지 열기',
    welcomeContinue: '계속', welcomeContinueAria: '앱으로 이동'
  },
  vi: {
    navLabel: 'Điều khoản / Pháp lý', navAria: 'Mở trang điều khoản',
    menuAria: 'Menu ứng dụng', menuHome: 'Trang chủ', menuDesc: 'Mô tả', menuSupport: 'Liên hệ / Hỗ trợ',
    pageBadge: 'Pháp lý · Tr. 3',
    readFullPage: 'Điều khoản đầy đủ', readFullPageAria: 'Mở trang văn bản pháp lý đầy đủ',
    pdfDownload: 'Tải PDF', pdfDownloadAria: 'Lưu PDF điều khoản vào thiết bị',
    pdfHint: 'PDF đã lưu trên thiết bị — sẵn sàng in.', pdfError: 'Tải PDF thất bại.',
    readAloud: 'Đọc điều khoản', readAloudAria: 'Đọc điều khoản từ đầu đến cuối',
    welcomeTitle: 'Chào mừng đến OmniQR-AI',
    welcomeLead: 'Đọc điều khoản trên màn hình. Thanh toán cần chấp nhận điều khoản.',
    welcomeAgbBtn: 'Điều khoản / Pháp lý', welcomeAgbAria: 'Mở trang điều khoản đầy đủ',
    welcomeContinue: 'Tiếp tục', welcomeContinueAria: 'Vào ứng dụng'
  },
  tr: {
    navLabel: 'Şartlar / Yasal', navAria: 'Şartlar sayfasını aç',
    menuAria: 'Uygulama menüsü', menuHome: 'Ana sayfa', menuDesc: 'Açıklama', menuSupport: 'İletişim / Destek',
    pageBadge: 'Yasal · S. 3',
    readFullPage: 'Tam şartlar', readFullPageAria: 'Tam yasal metni aç',
    pdfDownload: 'PDF indir', pdfDownloadAria: 'Şartlar PDF’ini kaydet',
    pdfHint: 'PDF cihaza kaydedildi — yazdırmaya hazır.', pdfError: 'PDF indirilemedi.',
    readAloud: 'Şartları oku', readAloudAria: 'Şartları baştan sona oku',
    welcomeTitle: 'OmniQR-AI’ye hoş geldiniz',
    welcomeLead: 'Şartları ekranda okuyun. Ödeme için kabul gerekir.',
    welcomeAgbBtn: 'Şartlar / Yasal', welcomeAgbAria: 'Tam şartlar sayfasını aç',
    welcomeContinue: 'Devam', welcomeContinueAria: 'Uygulamaya geç'
  },
  hi: {
    navLabel: 'नियम / कानूनी', navAria: 'नियम व शर्तें पृष्ठ खोलें',
    menuAria: 'ऐप मेनू', menuHome: 'होम', menuDesc: 'विवरण', menuSupport: 'संपर्क / सहायता',
    pageBadge: 'कानूनी · पृ. ३',
    readFullPage: 'पूर्ण नियम', readFullPageAria: 'पूरा कानूनी पाठ खोलें',
    pdfDownload: 'PDF डाउनलोड', pdfDownloadAria: 'नियम PDF डिवाइस पर सहेजें',
    pdfHint: 'PDF डिवाइस पर सहेजा — प्रिंट के लिए तैयार।', pdfError: 'PDF डाउनलोड विफल।',
    readAloud: 'नियम पढ़ें', readAloudAria: 'शुरू से अंत तक नियम पढ़ें',
    welcomeTitle: 'OmniQR-AI में आपका स्वागत है',
    welcomeLead: 'स्क्रीन पर नियम पढ़ें। भुगतान के लिए स्वीकृति आवश्यक है।',
    welcomeAgbBtn: 'नियम / कानूनी', welcomeAgbAria: 'पूर्ण नियम पृष्ठ खोलें',
    welcomeContinue: 'जारी रखें', welcomeContinueAria: 'ऐप पर जाएँ'
  },
  id: {
    navLabel: 'Syarat / Legal', navAria: 'Buka halaman syarat',
    menuAria: 'Menu aplikasi', menuHome: 'Beranda', menuDesc: 'Deskripsi', menuSupport: 'Kontak / Dukungan',
    pageBadge: 'Legal · Hal. 3',
    readFullPage: 'Syarat lengkap', readFullPageAria: 'Buka teks hukum lengkap',
    pdfDownload: 'Unduh PDF', pdfDownloadAria: 'Simpan PDF syarat ke perangkat',
    pdfHint: 'PDF disimpan di perangkat — siap cetak.', pdfError: 'Unduhan PDF gagal.',
    readAloud: 'Baca syarat', readAloudAria: 'Baca syarat dari awal hingga akhir',
    welcomeTitle: 'Selamat datang di OmniQR-AI',
    welcomeLead: 'Baca syarat di layar. Pembayaran memerlukan persetujuan.',
    welcomeAgbBtn: 'Syarat / Legal', welcomeAgbAria: 'Buka halaman syarat lengkap',
    welcomeContinue: 'Lanjutkan', welcomeContinueAria: 'Masuk ke aplikasi'
  }
};

const OMNIQR_UI_BUTTONS = {
  de: {
    btnScanLabel: 'QR laden', btnConfirmLabel: 'Zahlung bestätigen', btnSpeakLabel: 'Status vorlesen',
    fabLabel: 'Kontakt / Support', submitBtn: 'Anfrage senden', cancelBtn: 'Abbrechen', acceptBtn: 'Schließen',
    backHomeHub: 'Zurück zur Hauptseite'
  },
  en: {
    btnScanLabel: 'Load QR', btnConfirmLabel: 'Confirm payment', btnSpeakLabel: 'Read status',
    fabLabel: 'Contact / Support', submitBtn: 'Send request', cancelBtn: 'Cancel', acceptBtn: 'Close',
    backHomeHub: 'Back to Main Hub'
  },
  th: {
    btnScanLabel: 'โหลด QR', btnConfirmLabel: 'ยืนยันการชำระเงิน', btnSpeakLabel: 'อ่านสถานะ',
    fabLabel: 'ติดต่อ / ซัพพอร์ต', submitBtn: 'ส่งคำขอ', cancelBtn: 'ยกเลิก', acceptBtn: 'ปิด',
    backHomeHub: 'กลับสู่หน้าหลัก'
  },
  pl: {
    btnScanLabel: 'Załaduj QR', btnConfirmLabel: 'Potwierdź płatność', btnSpeakLabel: 'Odczytaj status',
    fabLabel: 'Kontakt / Wsparcie', submitBtn: 'Wyślij', cancelBtn: 'Anuluj', acceptBtn: 'Zamknij',
    backHomeHub: 'Powrót do strony głównej'
  },
  ru: {
    btnScanLabel: 'Загрузить QR', btnConfirmLabel: 'Подтвердить оплату', btnSpeakLabel: 'Озвучить статус',
    fabLabel: 'Контакт / Поддержка', submitBtn: 'Отправить', cancelBtn: 'Отмена', acceptBtn: 'Закрыть',
    backHomeHub: 'Вернуться на главную'
  },
  zh: {
    btnScanLabel: '加载二维码', btnConfirmLabel: '确认支付', btnSpeakLabel: '朗读状态',
    fabLabel: '联系 / 支持', submitBtn: '发送请求', cancelBtn: '取消', acceptBtn: '关闭',
    backHomeHub: '返回主页'
  },
  fr: {
    btnScanLabel: 'Charger QR', btnConfirmLabel: 'Confirmer paiement', btnSpeakLabel: 'Lire statut',
    fabLabel: 'Contact / Support', submitBtn: 'Envoyer', cancelBtn: 'Annuler', acceptBtn: 'Fermer',
    backHomeHub: 'Retour au hub'
  },
  es: {
    btnScanLabel: 'Cargar QR', btnConfirmLabel: 'Confirmar pago', btnSpeakLabel: 'Leer estado',
    fabLabel: 'Contacto / Soporte', submitBtn: 'Enviar', cancelBtn: 'Cancelar', acceptBtn: 'Cerrar',
    backHomeHub: 'Volver al hub'
  },
  it: {
    btnScanLabel: 'Carica QR', btnConfirmLabel: 'Conferma pagamento', btnSpeakLabel: 'Leggi stato',
    fabLabel: 'Contatto / Supporto', submitBtn: 'Invia', cancelBtn: 'Annulla', acceptBtn: 'Chiudi',
    backHomeHub: 'Torna al hub'
  },
  pt: {
    btnScanLabel: 'Carregar QR', btnConfirmLabel: 'Confirmar pagamento', btnSpeakLabel: 'Ler estado',
    fabLabel: 'Contacto / Suporte', submitBtn: 'Enviar', cancelBtn: 'Cancelar', acceptBtn: 'Fechar',
    backHomeHub: 'Voltar ao hub'
  },
  nl: {
    btnScanLabel: 'QR laden', btnConfirmLabel: 'Betaling bevestigen', btnSpeakLabel: 'Status voorlezen',
    fabLabel: 'Contact / Support', submitBtn: 'Verzenden', cancelBtn: 'Annuleren', acceptBtn: 'Sluiten',
    backHomeHub: 'Terug naar hub'
  },
  ar: {
    btnScanLabel: 'تحميل QR', btnConfirmLabel: 'تأكيد الدفع', btnSpeakLabel: 'قراءة الحالة',
    fabLabel: 'اتصال / دعم', submitBtn: 'إرسال', cancelBtn: 'إلغاء', acceptBtn: 'إغلاق',
    backHomeHub: 'العودة للرئيسية'
  },
  ja: {
    btnScanLabel: 'QRを読み込む', btnConfirmLabel: '支払いを確認', btnSpeakLabel: '状態を読み上げ',
    fabLabel: 'お問い合わせ / サポート', submitBtn: '送信', cancelBtn: 'キャンセル', acceptBtn: '閉じる',
    backHomeHub: 'ホームへ戻る'
  },
  ko: {
    btnScanLabel: 'QR 불러오기', btnConfirmLabel: '결제 확인', btnSpeakLabel: '상태 읽기',
    fabLabel: '문의 / 지원', submitBtn: '보내기', cancelBtn: '취소', acceptBtn: '닫기',
    backHomeHub: '홈으로'
  },
  vi: {
    btnScanLabel: 'Tải QR', btnConfirmLabel: 'Xác nhận thanh toán', btnSpeakLabel: 'Đọc trạng thái',
    fabLabel: 'Liên hệ / Hỗ trợ', submitBtn: 'Gửi', cancelBtn: 'Hủy', acceptBtn: 'Đóng',
    backHomeHub: 'Về trang chính'
  },
  tr: {
    btnScanLabel: 'QR yükle', btnConfirmLabel: 'Ödemeyi onayla', btnSpeakLabel: 'Durumu oku',
    fabLabel: 'İletişim / Destek', submitBtn: 'Gönder', cancelBtn: 'İptal', acceptBtn: 'Kapat',
    backHomeHub: 'Ana sayfaya dön'
  },
  hi: {
    btnScanLabel: 'QR लोड करें', btnConfirmLabel: 'भुगतान पुष्टि', btnSpeakLabel: 'स्थिति पढ़ें',
    fabLabel: 'संपर्क / सहायता', submitBtn: 'भेजें', cancelBtn: 'रद्द', acceptBtn: 'बंद',
    backHomeHub: 'होम पर वापस'
  },
  id: {
    btnScanLabel: 'Muat QR', btnConfirmLabel: 'Konfirmasi bayar', btnSpeakLabel: 'Baca status',
    fabLabel: 'Kontak / Dukungan', submitBtn: 'Kirim', cancelBtn: 'Batal', acceptBtn: 'Tutup',
    backHomeHub: 'Kembali ke hub'
  }
};

const OVERLAY_ONLY = ['fr', 'es', 'it', 'pt', 'nl', 'ar', 'ja', 'ko', 'vi', 'tr', 'hi', 'id'];

function deepMerge(base, overlay) {
  if (overlay == null) return base;
  if (base == null) return overlay;
  if (typeof base !== 'object' || typeof overlay !== 'object') return overlay;
  if (Array.isArray(base) || Array.isArray(overlay)) return overlay;
  const out = Object.assign({}, base);
  Object.keys(overlay).forEach(function (key) {
    out[key] = deepMerge(base[key], overlay[key]);
  });
  return out;
}

function patchLocale(locale) {
  const terms = OMNIQR_UI_TERMS[locale];
  const buttons = OMNIQR_UI_BUTTONS[locale];
  const filePath = path.join(LOCALES_DIR, locale + '.json');

  const patch = {
    common: { backHomeHub: buttons.backHomeHub },
    omniqr: {
      btnScanLabel: buttons.btnScanLabel,
      btnConfirmLabel: buttons.btnConfirmLabel,
      btnSpeakLabel: buttons.btnSpeakLabel,
      support: {
        fabLabel: buttons.fabLabel,
        submitBtn: buttons.submitBtn,
        cancelBtn: buttons.cancelBtn
      },
      terms: Object.assign({ acceptBtn: buttons.acceptBtn }, terms)
    }
  };

  if (OVERLAY_ONLY.includes(locale)) {
    fs.writeFileSync(filePath, JSON.stringify(patch, null, 2) + '\n', 'utf8');
    return;
  }

  const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const merged = deepMerge(existing, patch);
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
}

Object.keys(OMNIQR_UI_TERMS).forEach(patchLocale);
console.log('Patched OmniQR UI locales:', Object.keys(OMNIQR_UI_TERMS).join(', '));
