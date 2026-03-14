import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Clock3,
  Globe,
  LogOut,
  MessageSquareWarning,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import "./App.css";

const languages = ["tr", "en", "de", "ru"];

const users = [
  { username: "admin.voyage", role: "admin", displayName: "Admin", department: "management" },
  { username: "gizem.yonetici", role: "manager", titleKey: "generalManager", displayName: "Gizem", department: "management" },
  { username: "selim.muduryrd", role: "deputy", titleKey: "generalManagerAssistant", displayName: "Selim", department: "management" },
  { username: "ece.operasyonmdr", role: "chief", titleKey: "operationsManager", displayName: "Ece", department: "operations" },
  { username: "deniz.asistan", role: "assistant", displayName: "Deniz", department: "guestRelations" },
  { username: "ayse.resepsiyonmdr", role: "departmentManager", titleKey: "frontOfficeManager", displayName: "Ayse", department: "frontOffice", scopeDepartment: "frontOffice" },
  { username: "zeynep.housekeepingmdr", role: "departmentManager", titleKey: "executiveHousekeeper", displayName: "Zeynep", department: "housekeeping", scopeDepartment: "housekeeping" },
  { username: "emir.animasyonmdr", role: "departmentManager", titleKey: "entertainmentManager", displayName: "Emir", department: "entertainment", scopeDepartment: "entertainment" },
  { username: "emre.teknikmdr", role: "departmentManager", titleKey: "chiefEngineer", displayName: "Emre", department: "technical", scopeDepartment: "technical" },
  { username: "burak.fbmdr", role: "departmentManager", titleKey: "foodBeverageManager", displayName: "Burak", department: "fb", scopeDepartment: "fb" },
  { username: "mina.misafirmdr", role: "departmentManager", titleKey: "guestRelationsManager", displayName: "Mina", department: "guestRelations", scopeDepartment: "guestRelations" },
  { username: "pelin.misafirmdryrd", role: "departmentManager", titleKey: "guestRelationsDeputyManager", displayName: "Pelin", department: "guestRelations", scopeDepartment: "guestRelations" },
  { username: "omer.misafirsefi", role: "departmentManager", titleKey: "guestRelationsChief", displayName: "Omer", department: "guestRelations", scopeDepartment: "guestRelations" },
  { username: "hakan.guvenlikmdr", role: "departmentManager", titleKey: "securityManager", displayName: "Hakan", department: "security", scopeDepartment: "security" },
  { username: "sevgi.spamdr", role: "departmentManager", titleKey: "spaManager", displayName: "Sevgi", department: "spa", scopeDepartment: "spa" },
  { username: "ceren.satismdr", role: "departmentManager", titleKey: "salesManager", displayName: "Ceren", department: "sales", scopeDepartment: "sales" },
  { username: "onur.ikmdr", role: "departmentManager", titleKey: "hrManager", displayName: "Onur", department: "humanResources", scopeDepartment: "humanResources" },
  { username: "asli.finansmdr", role: "departmentManager", titleKey: "financeManager", displayName: "Asli", department: "finance", scopeDepartment: "finance" },
  { username: "tolga.satinalmamdr", role: "departmentManager", titleKey: "purchasingManager", displayName: "Tolga", department: "purchasing", scopeDepartment: "purchasing" },
  { username: "derya.kalitemdr", role: "departmentManager", titleKey: "qualityManager", displayName: "Derya", department: "quality", scopeDepartment: "quality" },
];

const defaultRoleAccess = {
  admin: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker", "shiftPlanner"],
    modules: ["guest", "settings", "assistant", "assistantTracker"],
    showAudit: true,
  },
  manager: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker", "shiftPlanner"],
    modules: ["guest", "settings", "assistant", "assistantTracker"],
    showAudit: true,
  },
  deputy: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker", "shiftPlanner"],
    modules: ["guest", "settings", "assistant", "assistantTracker"],
    showAudit: false,
  },
  chief: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker", "shiftPlanner"],
    modules: ["guest", "settings", "assistant", "assistantTracker"],
    showAudit: false,
  },
  assistant: {
    tabs: ["dashboard", "complaints", "orders", "assistantTracker", "shiftPlanner"],
    modules: ["guest", "assistant", "assistantTracker"],
    showAudit: false,
  },
  departmentManager: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker", "shiftPlanner"],
    modules: ["guest", "assistant", "assistantTracker"],
    showAudit: false,
  },
};

const editableRoles = ["manager", "deputy", "chief", "assistant", "departmentManager"];
const permissionTabs = ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker", "shiftPlanner"];
const adminTabs = ["managerAgenda", "permissions", "managerOps"];
const allowedTabs = [...permissionTabs, ...adminTabs, "criticalReviewOps"];
const criticalReviewOpsTitleKeys = new Set(["guestRelationsManager", "guestRelationsDeputyManager", "guestRelationsChief"]);
const defaultReviewSources = [
  { id: "google", platform: "Google", label: "Google Reviews", enabled: true, branch: "Voyage Kundu", url: "https://www.google.com/travel/search?gsas=1&ts=EggKAggDCgIIAxocEhoSFAoHCOoPEAQYARIHCOoPEAQYBBgDMgIIAg&qs=MhNDZ29JN29leXFQX280YzhRRUFFOAI&ap=ugEHcmV2aWV3cw&ictx=111&client=safari&hs=1AB&biw=1729&bih=980&hl=tr-TR&ved=0CAAQ5JsGahcKEwjwvvnrxJyTAxUAAAAAHQAAAAAQDA", lastSyncAt: null },
  { id: "tripadvisor", platform: "Tripadvisor", label: "Tripadvisor Reviews", enabled: true, branch: "Voyage Kundu", url: "https://www.tripadvisor.com.tr/Hotel_Review-g17951017-d33456834-Reviews-Voyage_Kundu_Hotel-Aksu_Antalya_Turkish_Mediterranean_Coast.html", lastSyncAt: null },
  { id: "yandex", platform: "Yandex", label: "Yandex Reviews", enabled: true, branch: "Voyage Kundu", url: "https://yandex.com.tr/maps/org/voyage_kundu/178944177497/?ll=30.912637%2C36.862367&z=15", lastSyncAt: null },
  { id: "holidaycheck", platform: "HolidayCheck", label: "HolidayCheck Reviews", enabled: true, branch: "Voyage Kundu", url: "https://www.holidaycheck.de/hi/voyage-kundu/d115b6e7-60d3-442b-8bee-a223c206ab7f", lastSyncAt: null },
];

const localizedSeedContent = {
  cuisine: {
    Turkish: { tr: "Türk", en: "Turkish", de: "Türkisch", ru: "Турецкая" },
    Italian: { tr: "İtalyan", en: "Italian", de: "Italienisch", ru: "Итальянская" },
    Greek: { tr: "Yunan", en: "Greek", de: "Griechisch", ru: "Греческая" },
    Chinese: { tr: "Çin", en: "Chinese", de: "Chinesisch", ru: "Китайская" },
    Steakhouse: { tr: "Steakhouse", en: "Steakhouse", de: "Steakhouse", ru: "Стейкхаус" },
    Japanese: { tr: "Japon", en: "Japanese", de: "Japanisch", ru: "Японская" },
    Mediterranean: { tr: "Akdeniz", en: "Mediterranean", de: "Mediterran", ru: "Средиземноморская" },
  },
  duration: {
    "2 hours": { tr: "2 saat", en: "2 hours", de: "2 Stunden", ru: "2 часа" },
    "3 hours": { tr: "3 saat", en: "3 hours", de: "3 Stunden", ru: "3 часа" },
    "1 hour": { tr: "1 saat", en: "1 hour", de: "1 Stunde", ru: "1 час" },
    "90 minutes": { tr: "90 dakika", en: "90 minutes", de: "90 Minuten", ru: "90 минут" },
  },
  childPolicy: {
    "0-11 yaş çocuklar ücretsiz": {
      tr: "0-11 yaş çocuklar ücretsiz",
      en: "Children aged 0-11 are free",
      de: "Kinder von 0 bis 11 Jahren sind kostenlos",
      ru: "Для детей 0-11 лет бесплатно",
    },
    "Teppanyaki restoranında 0-11 yaş ücretsiz değildir": {
      tr: "Teppanyaki restoranında 0-11 yaş ücretsiz değildir",
      en: "At Teppanyaki, ages 0-11 are not free",
      de: "Im Teppanyaki sind Kinder von 0 bis 11 Jahren nicht kostenlos",
      ru: "В Teppanyaki для детей 0-11 лет бесплатное посещение не действует",
    },
    "Custom policy": {
      tr: "Özel politika",
      en: "Custom policy",
      de: "Individuelle Regel",
      ru: "Индивидуальная политика",
    },
  },
  tableSetup: {
    "2, 4, 6 pax tables": {
      tr: "2, 4, 6 kişilik masalar",
      en: "2, 4 and 6 pax tables",
      de: "Tische für 2, 4 und 6 Personen",
      ru: "Столы на 2, 4 и 6 гостей",
    },
    "Shared chef counter + 4 pax tables": {
      tr: "Ortak şef bankosu + 4 kişilik masalar",
      en: "Shared chef counter + 4 pax tables",
      de: "Gemeinsamer Chef-Tresen + 4er-Tische",
      ru: "Общий шеф-стол + столы на 4 гостей",
    },
    "Flexible setup": {
      tr: "Esnek masa düzeni",
      en: "Flexible setup",
      de: "Flexible Tischanordnung",
      ru: "Гибкая рассадка",
    },
  },
  venueNote: {
    "Türk mutfağı odaklı, klasik aile rezervasyon akışı.": {
      tr: "Türk mutfağı odaklı, klasik aile rezervasyon akışı.",
      en: "Focused on Turkish cuisine with a classic family reservation flow.",
      de: "Fokus auf türkischer Küche mit klassischem Familien-Reservierungsfluss.",
      ru: "Акцент на турецкой кухне и классическом семейном сценарии бронирования.",
    },
    "Italyan konseptli aksam servisi.": {
      tr: "İtalyan konseptli akşam servisi.",
      en: "Italian concept dinner service.",
      de: "Abendservice mit italienischem Konzept.",
      ru: "Вечерний сервис в итальянской концепции.",
    },
    "Yunan mutfağı, deniz ürünü ve meze ağırlıklı servis.": {
      tr: "Yunan mutfağı, deniz ürünü ve meze ağırlıklı servis.",
      en: "Greek cuisine with a seafood and meze-focused service flow.",
      de: "Griechische Küche mit Fokus auf Meeresfrüchte und Meze.",
      ru: "Греческая кухня с акцентом на морепродукты и мезе.",
    },
    "Uzak doğu servis akışı, kapalı alan ağırlıklı.": {
      tr: "Uzak doğu servis akışı, kapalı alan ağırlıklı.",
      en: "Far East service flow with a mainly indoor setup.",
      de: "Fernost-Serviceablauf mit Schwerpunkt auf Innenbereich.",
      ru: "Сервис в дальневосточной концепции с акцентом на внутренний зал.",
    },
    "Premium et restoranı, yüksek gelir segmenti.": {
      tr: "Premium et restoranı, yüksek gelir segmenti.",
      en: "Premium steak restaurant targeting the high-spend segment.",
      de: "Premium-Steakrestaurant für das gehobene Gästesegment.",
      ru: "Премиальный мясной ресторан для высокого ценового сегмента.",
    },
    "Show mutfağı akışı, çocuk ücretsiz politikası uygulanmaz.": {
      tr: "Show mutfağı akışı, çocuk ücretsiz politikası uygulanmaz.",
      en: "Show kitchen format where the free-child policy does not apply.",
      de: "Showküchen-Konzept, bei dem die Gratis-Kinderregel nicht gilt.",
      ru: "Формат шоу-кухни, где не действует политика бесплатного посещения для детей.",
    },
    "Turk mutfagi odakli.": {
      tr: "Türk mutfağı odaklı.",
      en: "Focused on Turkish cuisine.",
      de: "Mit Fokus auf türkische Küche.",
      ru: "С акцентом на турецкую кухню.",
    },
  },
  agendaTitle: {
    "VIP arrival briefing approval": {
      tr: "VIP varış brifing onayı",
      en: "VIP arrival briefing approval",
      de: "Freigabe des VIP-Anreisebriefings",
      ru: "Подтверждение брифинга по VIP-заезду",
    },
    "Housekeeping recovery backlog review": {
      tr: "Kat hizmetleri toparlama birikimi incelemesi",
      en: "Housekeeping recovery backlog review",
      de: "Prüfung des Housekeeping-Nachbearbeitungsrückstands",
      ru: "Проверка накопившихся задач по восстановлению Housekeeping",
    },
    "Tomorrow ala carte capacity lock": {
      tr: "Yarın için A'la Carte kapasite kilidi",
      en: "Tomorrow ala carte capacity lock",
      de: "Kapazitätssperre für Ala Carte morgen",
      ru: "Фиксация мощности Ala Carte на завтра",
    },
    "Technical preventive check for suites": {
      tr: "Suit odalar için teknik önleyici kontrol",
      en: "Technical preventive check for suites",
      de: "Technischer Präventivcheck für Suiten",
      ru: "Профилактическая техническая проверка сьютов",
    },
    "Weekly executive summary draft": {
      tr: "Haftalık yönetici özeti taslağı",
      en: "Weekly executive summary draft",
      de: "Entwurf der wöchentlichen Management-Zusammenfassung",
      ru: "Черновик еженедельной управленческой сводки",
    },
  },
  agendaNote: {
    "Confirm welcome flow, suite readiness and guest relations handoff.": {
      tr: "Karşılama akışı, suit hazırlığı ve misafir ilişkileri teslimini teyit et.",
      en: "Confirm welcome flow, suite readiness and guest relations handoff.",
      de: "Begrüßungsablauf, Suitenbereitschaft und Übergabe an Guest Relations bestätigen.",
      ru: "Подтвердить сценарий встречи, готовность сьюта и передачу в guest relations.",
    },
    "Close delayed cleaning cases before evening report.": {
      tr: "Akşam raporundan önce geciken temizlik vakalarını kapat.",
      en: "Close delayed cleaning cases before evening report.",
      de: "Verspätete Reinigungsfälle vor dem Abendbericht abschließen.",
      ru: "Закрыть задержанные случаи уборки до вечернего отчета.",
    },
    "Freeze tomorrow evening allocations and inform assistant routing.": {
      tr: "Yarın akşam tahsislerini sabitle ve asistan yönlendirmesini bilgilendir.",
      en: "Freeze tomorrow evening allocations and inform assistant routing.",
      de: "Morgige Abendkontingente sperren und die Assistenzsteuerung informieren.",
      ru: "Зафиксировать завтрашние вечерние квоты и уведомить ассистентов о маршрутизации.",
    },
    "Focus on AC and minibar controls for VIP floor.": {
      tr: "VIP katı için klima ve minibar kontrollerine odaklan.",
      en: "Focus on AC and minibar controls for VIP floor.",
      de: "Schwerpunkt auf Klima- und Minibar-Kontrollen auf der VIP-Etage.",
      ru: "Сфокусироваться на кондиционерах и минибарах на VIP-этаже.",
    },
    "Prepare service quality and complaint resolution summary.": {
      tr: "Servis kalitesi ve şikayet çözüm özetini hazırla.",
      en: "Prepare service quality and complaint resolution summary.",
      de: "Zusammenfassung zu Servicequalität und Beschwerdelösung vorbereiten.",
      ru: "Подготовить сводку по качеству сервиса и решению жалоб.",
    },
  },
  meetingTopic: {
    "Oda memnuniyeti gorusmesi": {
      tr: "Oda memnuniyeti görüşmesi",
      en: "Room satisfaction meeting",
      de: "Gespräch zur Zimmerzufriedenheit",
      ru: "Встреча по удовлетворенности номером",
    },
    "Erken cikis talebi": {
      tr: "Erken çıkış talebi",
      en: "Early check-out request",
      de: "Anfrage auf frühen Check-out",
      ru: "Запрос на ранний выезд",
    },
  },
  meetingResult: {
    "Takip gerekli": { tr: "Takip gerekli", en: "Follow-up required", de: "Nachverfolgung erforderlich", ru: "Требуется сопровождение" },
    "Olumlu": { tr: "Olumlu", en: "Positive", de: "Positiv", ru: "Положительно" },
  },
  meetingNote: {
    "Kahvalti alaniyla ilgili geri bildirim verdi. Yarin tekrar aranacak.": {
      tr: "Kahvaltı alanıyla ilgili geri bildirim verdi. Yarın tekrar aranacak.",
      en: "Shared feedback about the breakfast area. Will be called again tomorrow.",
      de: "Gab Feedback zum Frühstücksbereich. Wird morgen erneut angerufen.",
      ru: "Оставил отзыв о зоне завтрака. Завтра будет повторный звонок.",
    },
    "Talep onaylandi, tesekkur etti.": {
      tr: "Talep onaylandı, teşekkür etti.",
      en: "The request was approved and the guest thanked the team.",
      de: "Anfrage genehmigt, der Gast bedankte sich.",
      ru: "Запрос подтвержден, гость поблагодарил команду.",
    },
  },
  reviewContent: {
    "Personel ilgiliydi ama giris islemi uzun surdu.": {
      tr: "Personel ilgiliydi ama giriş işlemi uzun sürdü.",
      en: "The staff were attentive, but check-in took too long.",
      de: "Das Personal war aufmerksam, aber der Check-in dauerte zu lange.",
      ru: "Персонал был внимательным, но заселение заняло слишком много времени.",
    },
    "Konum ve ekip cok iyiydi, tekrar gelirim.": {
      tr: "Konum ve ekip çok iyiydi, tekrar gelirim.",
      en: "The location and team were excellent, I would return again.",
      de: "Lage und Team waren sehr gut, ich würde wiederkommen.",
      ru: "Расположение и команда были отличными, я бы вернулся снова.",
    },
  },
};

const internalModules = [
  { id: "guest", icon: Building2 },
  { id: "settings", icon: CheckSquare },
  { id: "assistant", icon: MessageSquareWarning },
  { id: "assistantTracker", icon: ClipboardList },
];

const controllableModules = internalModules.filter(
  (module) => !["assistant", "assistantTracker"].includes(module.id),
);

const initialAlaCarteVenues = [
  {
    id: "kebappa-turkish-restaurant",
    name: "Kebappa Turkish Restaurant",
    cuisine: "Turkish",
    active: true,
    openingTime: "18:30",
    lastArrival: "21:30",
    coverPrice: 10,
    currency: "EUR",
    maxGuests: 6,
    mixedTable: false,
    areaPreference: true,
    childPolicy: "0-11 yaş çocuklar ücretsiz",
    cancellationWindow: "2 hours",
    closeSaleWindow: "1 hour",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    roomNightLimit: 1,
    includeOtherRooms: false,
    tableSetup: "2, 4, 6 pax tables",
    note: "Türk mutfağı odaklı, klasik aile rezervasyon akışı.",
    demand: "High",
    occupancy: 78,
    slotCount: 3,
  },
  {
    id: "vista-italian",
    name: "Vista Italian Restaurant",
    cuisine: "Italian",
    active: true,
    openingTime: "19:00",
    lastArrival: "22:00",
    coverPrice: 10,
    currency: "EUR",
    maxGuests: 8,
    mixedTable: false,
    areaPreference: true,
    childPolicy: "0-11 yaş çocuklar ücretsiz",
    cancellationWindow: "3 hours",
    closeSaleWindow: "90 minutes",
    workingDays: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    roomNightLimit: 1,
    includeOtherRooms: false,
    tableSetup: "2, 4, 6 pax tables",
    note: "Italyan konseptli aksam servisi.",
    demand: "High",
    occupancy: 74,
    slotCount: 4,
  },
  {
    id: "buzuki-greek-restaurant",
    name: "Buzuki Greek Restaurant",
    cuisine: "Greek",
    active: true,
    openingTime: "19:00",
    lastArrival: "21:00",
    coverPrice: 15,
    currency: "EUR",
    maxGuests: 8,
    mixedTable: false,
    areaPreference: true,
    childPolicy: "0-11 yaş çocuklar ücretsiz",
    cancellationWindow: "2 hours",
    closeSaleWindow: "1 hour",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    roomNightLimit: 1,
    includeOtherRooms: false,
    tableSetup: "2, 4, 6 pax tables",
    note: "Yunan mutfağı, deniz ürünü ve meze ağırlıklı servis.",
    demand: "Medium",
    occupancy: 66,
    slotCount: 3,
  },
  {
    id: "wen-chinese-restaurant",
    name: "Wen Chinese Restaurant",
    cuisine: "Chinese",
    active: true,
    openingTime: "19:00",
    lastArrival: "21:30",
    coverPrice: 15,
    currency: "EUR",
    maxGuests: 8,
    mixedTable: false,
    areaPreference: false,
    childPolicy: "0-11 yaş çocuklar ücretsiz",
    cancellationWindow: "2 hours",
    closeSaleWindow: "1 hour",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    roomNightLimit: 1,
    includeOtherRooms: false,
    tableSetup: "2, 4, 6 pax tables",
    note: "Uzak dogu servis akisi, kapali alan agirlikli.",
    demand: "High",
    occupancy: 81,
    slotCount: 3,
  },
  {
    id: "carino-steakhouse-restaurant",
    name: "Cariño Steakhouse Restaurant",
    cuisine: "Steakhouse",
    active: true,
    openingTime: "19:00",
    lastArrival: "21:30",
    coverPrice: 30,
    currency: "EUR",
    maxGuests: 6,
    mixedTable: false,
    areaPreference: true,
    childPolicy: "0-11 yaş çocuklar ücretsiz",
    cancellationWindow: "3 hours",
    closeSaleWindow: "90 minutes",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    roomNightLimit: 1,
    includeOtherRooms: false,
    tableSetup: "2, 4, 6 pax tables",
    note: "Premium et restorani, yuksek gelir segmenti.",
    demand: "Critical",
    occupancy: 88,
    slotCount: 2,
  },
  {
    id: "teppanyaki-japanese-restaurant",
    name: "Teppanyaki Japanese Restaurant",
    cuisine: "Japanese",
    active: true,
    openingTime: "19:30",
    lastArrival: "21:30",
    coverPrice: 30,
    currency: "EUR",
    maxGuests: 6,
    mixedTable: true,
    areaPreference: false,
    childPolicy: "Teppanyaki restoranında 0-11 yaş ücretsiz değildir",
    cancellationWindow: "3 hours",
    closeSaleWindow: "90 minutes",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    roomNightLimit: 1,
    includeOtherRooms: false,
    tableSetup: "Shared chef counter + 4 pax tables",
    note: "Show mutfağı akışı, çocuk ücretsiz politikası uygulanmaz.",
    demand: "Critical",
    occupancy: 91,
    slotCount: 2,
  },
];

const initialAlaCarteReservations = [
  {
    id: "res-1001",
    venueId: "kebappa-turkish-restaurant",
    guestName: "Müller Family",
    roomNumber: "4102",
    partySize: 4,
    reservationDate: "2026-03-12",
    slotTime: "19:00",
    status: "Booked",
    source: "Guest Relations",
    note: "Aile masasi talebi",
  },
  {
    id: "res-1002",
    venueId: "teppanyaki-japanese-restaurant",
    guestName: "Ivan Petrov",
    roomNumber: "3304",
    partySize: 2,
    reservationDate: "2026-03-12",
    slotTime: "20:00",
    status: "Confirmed",
    source: "App",
    note: "Show counter talebi",
  },
  {
    id: "res-1003",
    venueId: "vista-italian",
    guestName: "Sarah Collins",
    roomNumber: "5201",
    partySize: 3,
    reservationDate: "2026-03-13",
    slotTime: "19:30",
    status: "Arrived",
    source: "Front Office",
    note: "Terrace requested",
  },
];

const initialAlaCarteWaitlist = [
  {
    id: "wait-1001",
    venueId: "carino-steakhouse-restaurant",
    guestName: "Kaya Suite",
    roomNumber: "2201",
    partySize: 2,
    preferredDate: "2026-03-12",
    preferredWindow: "20:30-21:00",
    priority: "VIP",
    status: "Waiting",
  },
  {
    id: "wait-1002",
    venueId: "buzuki-greek-restaurant",
    guestName: "Lena Hoffmann",
    roomNumber: "1408",
    partySize: 5,
    preferredDate: "2026-03-13",
    preferredWindow: "19:00-20:00",
    priority: "Family",
    status: "Waiting",
  },
];

const initialAlaCarteServiceSlots = [
  { id: "slot-1", venueId: "kebappa-turkish-restaurant", date: "2026-03-12", time: "19:00", maxCovers: 24, bookedCovers: 12, waitlistCount: 0 },
  { id: "slot-2", venueId: "vista-italian", date: "2026-03-12", time: "20:00", maxCovers: 20, bookedCovers: 10, waitlistCount: 0 },
  { id: "slot-3", venueId: "buzuki-greek-restaurant", date: "2026-03-12", time: "19:30", maxCovers: 18, bookedCovers: 8, waitlistCount: 0 },
  { id: "slot-4", venueId: "wen-chinese-restaurant", date: "2026-03-12", time: "20:00", maxCovers: 18, bookedCovers: 9, waitlistCount: 0 },
  { id: "slot-5", venueId: "carino-steakhouse-restaurant", date: "2026-03-12", time: "20:30", maxCovers: 14, bookedCovers: 10, waitlistCount: 1 },
  { id: "slot-6", venueId: "teppanyaki-japanese-restaurant", date: "2026-03-12", time: "20:00", maxCovers: 12, bookedCovers: 10, waitlistCount: 0 },
];

const initialAssistantMeetings = [
  {
    id: "meet-1",
    customerName: "Ayse Demir",
    date: "2026-03-12",
    time: "10:30",
    contact: "0555 123 45 67",
    topic: "Oda memnuniyeti görüşmesi",
    tagCode: "FTF",
    result: "Takip gerekli",
    notes: "Kahvaltı alanıyla ilgili geri bildirim verdi. Yarın tekrar aranacak.",
    followUpDate: "2026-03-12",
    owner: "Merve",
    assignedAssistant: "Merve",
    isFTF: true,
    createdAt: "2026-03-12T10:30:00.000Z",
  },
  {
    id: "meet-2",
    customerName: "Murat Kaya",
    date: "2026-03-12",
    time: "15:00",
    contact: "",
    topic: "Erken çıkış talebi",
    tagCode: "",
    result: "Olumlu",
    notes: "Talep onaylandı, teşekkür etti.",
    followUpDate: "",
    owner: "Seda",
    assignedAssistant: "Seda",
    isFTF: false,
    createdAt: "2026-03-12T15:00:00.000Z",
  },
];

const initialAssistantReviews = [];

const alaCarteLabels = {
  tr: {
    reservations: "Rezervasyonlar",
    waitlist: "Bekleme listesi",
    serviceSlots: "Servis slotları",
    reservationStatusBoard: "Rezervasyon durum panosu",
    addReservation: "Rezervasyon ekle",
    addWaitlist: "Bekleme listesine ekle",
    guestName: "Misafir adı",
    roomNumber: "Oda numarası",
    partySize: "Kişi sayısı",
    reservationDate: "Rezervasyon tarihi",
    slotTime: "Slot saati",
    source: "Kanal",
    reservationStatus: "Rezervasyon durumu",
    waitlistWindow: "Tercih penceresi",
    waitlistPriority: "Öncelik",
    moveToReservation: "Rezervasyona çevir",
    increaseCapacity: "Kapasite artır",
    availableSeats: "Boş kapasite",
    noShowRisk: "No-show riski",
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
    reservationFlow: "Rezervasyon akışı",
    booked: "Rezerve edildi",
    confirmed: "Onaylandı",
    arrived: "Geldi",
    seated: "Masaya alındı",
    completed: "Tamamlandı",
    cancelled: "İptal edildi",
    noShow: "No-show",
    waiting: "Bekliyor",
    converted: "Dönüştürüldü",
    vip: "VIP",
    family: "Aile",
    regular: "Standart",
    sources: {
      app: "Uygulama",
      guestRelations: "Misafir İlişkileri",
      frontOffice: "Ön Büro",
      manager: "Yönetici",
    },
    settingsTitle: "A'la Carte ayarları",
    settingsText: "Seçilen restoranın kurallarını, masa düzenini ve satış limitlerini güncelleyin.",
    selectVenue: "Restoran seç",
    saveSettings: "Ayarları kaydet",
    addServiceSlot: "Servis slotu ekle",
    slotDate: "Slot tarihi",
    slotCapacity: "Slot kapasitesi",
    slotWaitlist: "Bekleme kapasitesi",
    settingsSaved: "A'la Carte ayarları güncellendi",
    slotAdded: "Yeni servis slotu eklendi",
  },
  en: {
    reservations: "Reservations",
    waitlist: "Waitlist",
    serviceSlots: "Service slots",
    reservationStatusBoard: "Reservation status board",
    addReservation: "Add reservation",
    addWaitlist: "Add to waitlist",
    guestName: "Guest name",
    roomNumber: "Room number",
    partySize: "Party size",
    reservationDate: "Reservation date",
    slotTime: "Slot time",
    source: "Source",
    reservationStatus: "Reservation status",
    waitlistWindow: "Preferred window",
    waitlistPriority: "Priority",
    moveToReservation: "Convert to reservation",
    increaseCapacity: "Increase capacity",
    availableSeats: "Available seats",
    noShowRisk: "No-show risk",
    low: "Low",
    medium: "Medium",
    high: "High",
    reservationFlow: "Reservation flow",
    booked: "Booked",
    confirmed: "Confirmed",
    arrived: "Arrived",
    seated: "Seated",
    completed: "Completed",
    cancelled: "Cancelled",
    noShow: "No-show",
    waiting: "Waiting",
    converted: "Converted",
    vip: "VIP",
    family: "Family",
    regular: "Regular",
    sources: {
      app: "App",
      guestRelations: "Guest Relations",
      frontOffice: "Front Office",
      manager: "Manager",
    },
    settingsTitle: "Ala carte settings",
    settingsText: "Update the rules, table setup and sales limits of the selected venue.",
    selectVenue: "Select venue",
    saveSettings: "Save settings",
    addServiceSlot: "Add service slot",
    slotDate: "Slot date",
    slotCapacity: "Slot capacity",
    slotWaitlist: "Waitlist capacity",
    settingsSaved: "Ala carte settings updated",
    slotAdded: "New service slot added",
  },
  de: {
    reservations: "Reservierungen",
    waitlist: "Warteliste",
    serviceSlots: "Service-Slots",
    reservationStatusBoard: "Reservierungsstatus",
    addReservation: "Reservierung hinzufügen",
    addWaitlist: "Zur Warteliste hinzufügen",
    guestName: "Gastname",
    roomNumber: "Zimmernummer",
    partySize: "Personenzahl",
    reservationDate: "Reservierungsdatum",
    slotTime: "Slot-Zeit",
    source: "Quelle",
    reservationStatus: "Reservierungsstatus",
    waitlistWindow: "Zeitfenster",
    waitlistPriority: "Priorität",
    moveToReservation: "In Reservierung umwandeln",
    increaseCapacity: "Kapazität erhöhen",
    availableSeats: "Freie Plätze",
    noShowRisk: "No-Show-Risiko",
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    reservationFlow: "Reservierungsfluss",
    booked: "Gebucht",
    confirmed: "Bestätigt",
    arrived: "Angekommen",
    seated: "Platziert",
    completed: "Abgeschlossen",
    cancelled: "Storniert",
    noShow: "No-show",
    waiting: "Wartet",
    converted: "Umgewandelt",
    vip: "VIP",
    family: "Familie",
    regular: "Standard",
    sources: {
      app: "App",
      guestRelations: "Gästebetreuung",
      frontOffice: "Rezeption",
      manager: "Manager",
    },
    settingsTitle: "Ala-Carte-Einstellungen",
    settingsText: "Aktualisieren Sie Regeln, Tischaufbau und Verkaufslimits des ausgewählten Standorts.",
    selectVenue: "Standort wählen",
    saveSettings: "Einstellungen speichern",
    addServiceSlot: "Service-Slot hinzufügen",
    slotDate: "Slot-Datum",
    slotCapacity: "Slot-Kapazität",
    slotWaitlist: "Wartelistenkapazität",
    settingsSaved: "Ala-Carte-Einstellungen aktualisiert",
    slotAdded: "Neuer Service-Slot hinzugefügt",
  },
  ru: {
    reservations: "Бронирования",
    waitlist: "Лист ожидания",
    serviceSlots: "Сервисные слоты",
    reservationStatusBoard: "Статусы бронирований",
    addReservation: "Добавить бронирование",
    addWaitlist: "Добавить в лист ожидания",
    guestName: "Имя гостя",
    roomNumber: "Номер комнаты",
    partySize: "Количество гостей",
    reservationDate: "Дата бронирования",
    slotTime: "Время слота",
    source: "Источник",
    reservationStatus: "Статус бронирования",
    waitlistWindow: "Желаемое окно",
    waitlistPriority: "Приоритет",
    moveToReservation: "Преобразовать в бронь",
    increaseCapacity: "Увеличить вместимость",
    availableSeats: "Свободные места",
    noShowRisk: "Риск неявки",
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    reservationFlow: "Поток бронирований",
    booked: "Забронировано",
    confirmed: "Подтверждено",
    arrived: "Прибыл",
    seated: "Усажен",
    completed: "Завершено",
    cancelled: "Отменено",
    noShow: "No-show",
    waiting: "Ожидает",
    converted: "Преобразовано",
    vip: "VIP",
    family: "Семья",
    regular: "Стандарт",
    sources: {
      app: "Приложение",
      guestRelations: "Гостевые отношения",
      frontOffice: "Ресепшен",
      manager: "Менеджер",
    },
    settingsTitle: "Настройки Ala Carte",
    settingsText: "Обновите правила, схему столов и лимиты продаж для выбранной площадки.",
    selectVenue: "Выбрать площадку",
    saveSettings: "Сохранить настройки",
    addServiceSlot: "Добавить сервисный слот",
    slotDate: "Дата слота",
    slotCapacity: "Вместимость слота",
    slotWaitlist: "Лимит листа ожидания",
    settingsSaved: "Настройки Ala Carte обновлены",
    slotAdded: "Новый сервисный слот добавлен",
  },
};

const reservationStatusOrder = ["Booked", "Confirmed", "Arrived", "Seated", "Completed", "Cancelled", "No Show"];

const authCopy = {
  tr: {
    selectRole: "Rol seç",
    passwordStrategyTitle: "Giriş yöntemi",
    passwordStrategyText: "Ortak giriş şifresiyle içeri girin. Yönetici, kullanıcıya geçici şifre verebilir; ilk girişte yeni şifre belirlenir.",
  },
  en: {
    selectRole: "Select role",
    passwordStrategyTitle: "Sign-in method",
    passwordStrategyText: "Use the shared access code to enter. The manager can assign a temporary password, and the user sets a new one at first sign-in.",
  },
  de: {
    selectRole: "Rolle wählen",
    passwordStrategyTitle: "Anmeldemethode",
    passwordStrategyText: "Der Zugang erfolgt über den gemeinsamen Zugangscode. Der Manager kann ein temporäres Passwort vergeben; beim ersten Login wird ein neues Passwort festgelegt.",
  },
  ru: {
    selectRole: "Выберите роль",
    passwordStrategyTitle: "Способ входа",
    passwordStrategyText: "Вход выполняется по общему коду доступа. Менеджер может выдать временный пароль, а при первом входе пользователь задает новый пароль.",
  },
};

const titleLabels = {
  tr: {
    generalManager: "Genel Müdür",
    generalManagerAssistant: "Genel Müdür Yardımcısı",
    operationsManager: "Operasyon Müdürü",
    frontOfficeManager: "Resepsiyon Müdürü",
    executiveHousekeeper: "Housekeeping Müdürü",
    entertainmentManager: "Animasyon Müdürü",
    chiefEngineer: "Teknik Müdürü",
    foodBeverageManager: "Yiyecek ve İçecek Müdürü",
    guestRelationsManager: "Misafir İlişkileri Müdürü",
    guestRelationsDeputyManager: "Misafir İlişkileri Müdür Yardımcısı",
    guestRelationsChief: "Misafir İlişkileri Şefi",
    securityManager: "Güvenlik Müdürü",
    spaManager: "SPA Müdürü",
    salesManager: "Satış Müdürü",
    hrManager: "İnsan Kaynakları Müdürü",
    financeManager: "Finans Müdürü",
    purchasingManager: "Satın Alma Müdürü",
    qualityManager: "Kalite Müdürü",
  },
  en: {
    generalManager: "General Manager",
    generalManagerAssistant: "Assistant General Manager",
    operationsManager: "Operations Manager",
    frontOfficeManager: "Front Office Manager",
    executiveHousekeeper: "Executive Housekeeper",
    entertainmentManager: "Entertainment Manager",
    chiefEngineer: "Chief Engineer",
    foodBeverageManager: "Food and Beverage Manager",
    guestRelationsManager: "Guest Relations Manager",
    guestRelationsDeputyManager: "Guest Relations Deputy Manager",
    guestRelationsChief: "Guest Relations Chief",
    securityManager: "Security Manager",
    spaManager: "SPA Manager",
    salesManager: "Sales Manager",
    hrManager: "Human Resources Manager",
    financeManager: "Finance Manager",
    purchasingManager: "Purchasing Manager",
    qualityManager: "Quality Manager",
  },
  de: {
    generalManager: "Generaldirektor",
    generalManagerAssistant: "Stellv. Generaldirektor",
    operationsManager: "Betriebsleiter",
    frontOfficeManager: "Front-Office-Manager",
    executiveHousekeeper: "Leitung Housekeeping",
    entertainmentManager: "Entertainment-Manager",
    chiefEngineer: "Technischer Leiter",
    foodBeverageManager: "F&B-Manager",
    guestRelationsManager: "Leitung Gästebetreuung",
    guestRelationsDeputyManager: "Stv. Leitung Gästebetreuung",
    guestRelationsChief: "Gästebetreuungschef",
    securityManager: "Sicherheitsleiter",
    spaManager: "SPA-Manager",
    salesManager: "Verkaufsleiter",
    hrManager: "Personalmanager",
    financeManager: "Finanzleiter",
    purchasingManager: "Einkaufsleiter",
    qualityManager: "Qualitätsleiter",
  },
  ru: {
    generalManager: "Генеральный менеджер",
    generalManagerAssistant: "Заместитель генерального менеджера",
    operationsManager: "Операционный менеджер",
    frontOfficeManager: "Менеджер ресепшен",
    executiveHousekeeper: "Руководитель housekeeping",
    entertainmentManager: "Менеджер анимации",
    chiefEngineer: "Технический директор",
    foodBeverageManager: "Менеджер F&B",
    guestRelationsManager: "Менеджер по работе с гостями",
    guestRelationsDeputyManager: "Заместитель менеджера по работе с гостями",
    guestRelationsChief: "Шеф по работе с гостями",
    securityManager: "Менеджер службы безопасности",
    spaManager: "SPA-менеджер",
    salesManager: "Менеджер по продажам",
    hrManager: "HR-менеджер",
    financeManager: "Финансовый менеджер",
    purchasingManager: "Менеджер по закупкам",
    qualityManager: "Менеджер по качеству",
  },
};

const translations = {
  tr: {
    appTitle: "365 Gün Ajanda",
    languageLabel: "Dil",
    hotelOperationsPwa: "Voyage Kundu operasyon PWA",
    heroTitle: "Görev, Planlama ve Şikayet Yönetimi",
    heroDescription:
      "Tek linkten giriş, rol bazlı erişim, şikayet takibi ve Voyage Kundu operasyon modüllerine hızlı erişim.",
    overallProgress: "Genel ilerleme",
    openComplaints: "Açık şikayetler",
    totalTasks: "Toplam görev",
    totalTasksSub: "Tüm iş kalemleri",
    activeTasks: "Aktif görevler",
    activeTasksSub: "Şu anda devam edenler",
    resolvedComplaints: "Çözülen şikayetler",
    resolvedComplaintsSub: "Başarıyla kapatılanlar",
    criticalComplaints: "Kritik şikayetler",
    criticalComplaintsSub: "Acil aksiyon gerekli",
    sections: "Bölümler",
    dashboard: "Panel",
    tasksTab: "Yapılacaklar ve Planlama",
    complaintsTab: "Şikayetler",
    analysis: "Analiz",
    alacarteTab: "A'la Carte",
    assistantTrackerTab: "FTF ve Hall of Fame",
    criticalReviewOpsTab: "Kritik Yorum Operasyonu",
    ordersTab: "Siparişler",
    managerAgendaTab: "365 Gün Ajanda",
    permissionsTab: "Yetki Yönetimi",
    managerOpsTab: "Müdür İşlemleri",
    todayFocus: "Bugün ve dönem odağı",
    toggleDone: "Durumu değiştir",
    unassigned: "Atanmadı",
    noDate: "Tarih yok",
    planningSummary: "Planlama özeti",
    dailyTasks: "Günlük görevler",
    completedTasks: "Tamamlanan görevler",
    todoPlanningBoard: "Yapılacaklar ve Planlama Panosu",
    searchTask: "Görev ara",
    allTypes: "Tüm tipler",
    allTaskStatuses: "Tüm görev durumları",
    taskStatusFilter: "Görev durumu",
    daily: "Günlük",
    periodic: "Dönemsel",
    duePrefix: "Termin",
    notSet: "Belirlenmedi",
    done: "Tamamlandı",
    progress: "İlerleme",
    addNewTask: "Yeni görev ekle",
    taskTitle: "Görev başlığı",
    taskTitlePlaceholder: "Örnek: Misafir şikayet kayıtlarını kontrol et",
    type: "Tür",
    priority: "Öncelik",
    department: "Departman",
    owner: "Sorumlu",
    dueDate: "Termin tarihi",
    notes: "Notlar",
    notesPlaceholder: "Yapılacak işin detayını, arka planını veya ek notları yazın.",
    addTask: "Görev ekle",
    ordersTitle: "Siparişler",
    ordersText: "Meyve sepeti, pasta ve özel istek siparişlerini oda bazlı yönetin.",
    fruitWine: "Meyve Sepeti & Şarap",
    cake: "Pasta",
    roomDecoration: "Oda Süsleme",
    specialRequest: "Özel İstek",
    roomNumberFixed: "Oda No",
    addOrder: "Sipariş ekle",
    saveOrders: "Siparişleri kaydet",
    exportOrders: "Sipariş çıktısı al",
    printOrders: "Yazdır",
    ordersSaved: "Sipariş listesi kaydedildi.",
    ordersExported: "Sipariş listesi indirildi.",
    ordersPrinted: "Sipariş listesi yazdırmaya hazırlandı.",
    saveList: "Listeyi kaydet",
    exportList: "Çıktı al",
    tasksSaved: "Görev listesi kaydedildi.",
    tasksExported: "Görev listesi indirildi.",
    complaintsSaved: "Şikayet listesi kaydedildi.",
    complaintsExported: "Şikayet listesi indirildi.",
    alaCarteSaved: "A'la Carte listeleri kaydedildi.",
    alaCarteExported: "A'la Carte listeleri indirildi.",
    complaintTracking: "Şikayet Takibi",
    searchComplaint: "Şikayet ara",
    allStatuses: "Tüm durumlar",
    allSeverities: "Tüm seviyeler",
    allDepartments: "Tüm departmanlar",
    allComplaintCategories: "Tüm kategoriler",
    allChannels: "Tüm kanallar",
    complaintDepartmentFilter: "Şikayet departmanı",
    complaintSeverityFilter: "Şikayet seviyesi",
    complaintChannelFilter: "Şikayet kanalı",
    addComplaint: "Şikayet ekle",
    guestOrCase: "Misafir / Vaka",
    category: "Kategori",
    severity: "Seviye",
    channel: "Kanal",
    date: "Tarih",
    summary: "Özet",
    summaryPlaceholder: "Şikayetin kısa özetini ve beklenen aksiyonu yazın.",
    complaintCategories: "Şikayet kategorileri",
    complaintStatusDistribution: "Şikayet durum dağılımı",
    totalComplaints: "Toplam şikayet",
    openRatio: "Açık oranı",
    resolutionRatio: "Çözüm oranı",
    voyageModules: "Voyage modülleri",
    voyageModulesText: "Rolünüze göre filtrelenmiş iç operasyon panelleri.",
    runtimeLabel: "Çalışma modu",
    runtimeText: "Rol bazlı iç operasyon modeli. Canlı rezervasyon sayfalarına dış bağımlılık yok.",
    internalPanel: "İç panel",
    panelReady: "Hazır",
    openPanel: "Paneli aç",
    modulePreviewTitle: "Modül özeti",
    modulePreviewEmpty: "Bir modül seçildiğinde burada ilgili operasyon özeti görünür.",
    moduleGoto: "İlgili bölüme git",
    moduleTargets: {
      guest: "Panel özeti, görev akışı ve misafir operasyonu görünümü",
      settings: "Yetki ve yönetim ayarları görünümü",
      assistant: "Şikayet ve misafir yönlendirme görünümü",
      assistantTracker: "Yüz yüze görüşme, manuel yorum ve Hall of Fame ekranı",
    },
    modules: {
      guest: { title: "Misafir paneli", text: "Misafir akışları, programlar ve rezervasyon kural motoru için iç sistem alanı." },
      settings: { title: "Ayarlar paneli", text: "İçerik, ekip, eşleştirme ve operasyon kuralları için iç yönetim modülü." },
      assistant: { title: "Asistan paneli", text: "Oda seçimi, görev yönlendirme ve misafir chat akışı için iç servis alanı." },
      assistantTracker: { title: "Asistan takip modülü", text: "Yüz yüze görüşmeler, manuel platform yorumları, FTF takibi ve Hall of Fame artık uygulama içinde çalışır." },
    },
    roles: {
      admin: "Admin",
      manager: "Genel Müdür",
      deputy: "Genel Müdür Yardımcısı",
      chief: "Operasyon Müdürü",
      assistant: "Asistan",
      departmentManager: "Departman Müdürü",
    },
    loginTitle: "Admin giriş paneli",
    loginText:
      "Ortak giriş şifresi ve kullanıcı şifresiyle oturum açın. Yönetici girişinde yalnızca title görünür; isimler sadece asistan hesaplarında listelenir.",
    selectUser: "Giriş hesabı",
    accessCodeLabel: "Ana giriş şifresi",
    accessCodePlaceholder: "Ortak giriş şifresini girin",
    passwordLabel: "Şifre",
    passwordPlaceholder: "Şifrenizi girin",
    signIn: "Giriş yap",
    authFailed: "Ana giriş şifresi veya kullanıcı şifresi hatalı.",
    signedInAs: "Giriş yapan",
    signOut: "Çıkış yap",
    limitedAccess: "Sınırlı erişim",
    fullAccess: "Tam erişim",
    auditTitle: "Müdür işlem paneli",
    auditText: "Hangi kullanıcının ne yaptığını sadece müdür görür.",
    auditEmpty: "Henüz kayıt yok.",
    auditUser: "Kullanıcı",
    auditAction: "İşlem",
    auditTime: "Zaman",
    actionLogin: "Giriş yaptı",
    actionLogout: "Çıkış yaptı",
    actionTab: "Sekme açtı",
    actionTaskAdded: "Görev ekledi",
    actionComplaintAdded: "Şikayet ekledi",
    actionTaskToggled: "Görev durumunu değiştirdi",
    actionModuleOpened: "İç modül inceledi",
    actionPermissionUpdated: "Yetki güncelledi",
    actionAlaCarteAdded: "A'la Carte lokasyonu ekledi",
    actionAlaCarteToggled: "A'la Carte durumunu değiştirdi",
    actionAlaCartePriceUpdated: "A'la Carte fiyatını güncelledi",
    actionAgendaAdded: "Ajanda kaydı ekledi",
    actionAgendaToggled: "Ajanda durumunu değiştirdi",
    agendaTitle: "365 gün müdür ajandası",
    agendaText: "Günlük operasyon, iş takibi ve ertesi gün kritik işleri tek sekmede yönetin.",
    calendar365Title: "365 günlük takvim görünümü",
    dailyAgendaTitle: "Bugünün iş takibi",
    nextDayAgendaTitle: "Bir sonraki gün kritik işler",
    allUpcomingTitle: "Yaklaşan kayıtlar",
    agendaAddTitle: "Ajandaya iş ekle",
    agendaTaskTitle: "İş başlığı",
    agendaTaskDate: "İş tarihi",
    agendaTaskOwner: "Takip sorumlusu",
    agendaTaskPriority: "Önem seviyesi",
    agendaTaskContext: "Operasyon notu",
    agendaTaskContextPlaceholder: "Bu işin neden önemli olduğunu ve takip notunu yazın.",
    addAgendaTask: "Ajanda işini ekle",
    noAgendaToday: "Bugün için kayıt yok.",
    noAgendaTomorrow: "Yarın için kritik iş tanımlı değil.",
    noAgendaUpcoming: "Yaklaşan ajanda kaydı yok.",
    trackedItems: "Takip kaydı",
    monthlyLoad: "Aylık yük",
    criticalFocus: "Kritik odak",
    nextSevenDays: "7 günlük görünüm",
    complaintValidation: "Şikayet eklemek için misafir/vaka ve özet alanlarını doldurmalısınız.",
    alaCarteTitle: "A'la Carte paneli",
    alaCarteText:
      "Dış link kullanmayan, içeride yönetilen rezervasyon ve servis operasyon sistemi.",
    alaCarteSystemTitle: "A'la Carte sistemi",
    alaCarteSystemText:
      "Lokasyon, servis slotu, fiyat, doluluk ve kural yönetimi tek panelde tutulur.",
    addVenue: "Lokasyon ekle",
    venueName: "Lokasyon adı",
    serviceDemand: "Talep",
    occupancy: "Doluluk",
    slotCount: "Servis slotu",
    updatePrice: "Fiyat güncelle",
    quickRules: "Hızlı kurallar",
    activeVenues: "Aktif lokasyonlar",
    alaCarteRestaurants: "A'la Carte restoranlar",
    cuisine: "Mutfak",
    activeStatus: "Durum",
    openTime: "Açılış",
    lastArrival: "Son geliş",
    coverPrice: "Kişi başı ücret",
    maxGuests: "Maks. kişi",
    childPolicy: "Çocuk politikası",
    cancellationWindow: "İptal süresi",
    closeSaleWindow: "Satış kapanışı",
    workingDays: "Çalışma günleri",
    roomNightLimit: "Oda/gece limiti",
    includeOtherRooms: "Diğer odalar dahil",
    tableSetup: "Masa düzeni",
    areaPreference: "Alan tercihi",
    mixedTable: "Karışık masa",
    operationalNote: "Operasyon notu",
    operationalNotePlaceholder: "Operasyon ekibinin görmesi gereken kısa notu yazın.",
    active: "Aktif",
    passive: "Pasif",
    yes: "Evet",
    no: "Hayır",
    weekdaysShort: { Mon: "Pzt", Tue: "Sal", Wed: "Çar", Thu: "Per", Fri: "Cum", Sat: "Cmt", Sun: "Paz" },
    reservationClosedDayError: "Secilen restoran bu gunde kapali. Rezervasyon kaydi olusturulamaz.",
    slotClosedDayError: "Secilen restoran bu gunde calismiyor. Servis slotu eklenemez.",
    permissionTitle: "Yetki yönetimi",
    permissionText:
      "Asistan sistemi dışındaki tüm sekme ve panel erişimleri yalnızca admin tarafından açılıp kapatılır.",
    permissionScopeNote: "Asistan ve FTF sistemi sabit kalır; diğer tüm erişim yetkilerini yalnızca admin günceller.",
    departmentPermissionTitle: "Departman bazlı kullanıcı yetkileri",
    departmentPermissionText: "Admin tüm kullanıcıları yönetebilir. Diğer müdürler yalnızca kendi departmanlarındaki kullanıcılar için yetki açıp kapatabilir.",
    noDepartmentPermissionUsers: "Bu kapsamda yönetebileceğiniz kullanıcı yok.",
    accountRoleLabel: "Hesap rolü",
    userAdminTitle: "Admin kullanıcı yönetimi",
    userAdminText: "Admin, tüm kullanıcıların görünen adını güncelleyebilir ve yeni şifre atayabilir. Admin panel içinde ek doğrulama gerekmez.",
    accountTitle: "Hesap",
    displayNameLabel: "Görünen ad",
    newPasswordLabel: "Yeni şifre",
    newPasswordPlaceholder: "Boş bırakırsanız değişmez",
    saveUserSettings: "Kullanıcıyı güncelle",
    userUpdateSuccess: "Kullanıcı bilgileri güncellendi.",
    userUpdateError: "Kullanıcı bilgileri güncellenemedi.",
    notificationsTitle: "Departman bildirimleri",
    notificationsText: "Yalnızca size atanan departman bildirimleri burada görünür. İzin verirseniz telefonunuzda anlık web bildirimi de alırsınız.",
    noNotifications: "Şu anda size atanmış bildirim yok.",
    unreadNotifications: "Okunmamış bildirim",
    allowNotifications: "Bildirim izni ver",
    markAsRead: "Okundu yap",
    notificationComplaintTitle: "Yeni departman yorumu",
    ftfStatsTitle: "Asistan takip özeti",
    ftfLeaderboardTitle: "Hall of Fame",
    ftfMeetingsTitle: "FTF takip listesi",
    ftfReviewsTitle: "Yorum listesi",
    reviewSourcesTitle: "Yorum kaynakları",
    reviewSourcesText: "Google, Tripadvisor, Yandex ve HolidayCheck yorumlarını tek ekranda toplayın.",
    reviewScheduleTitle: "Tarama takvimi",
    reviewScheduleDaily: "Standart tarama: 00:00, 08:00, 16:00",
    reviewScheduleLow: "1-4 puan izleme: 15 dakikada bir",
    reviewAlertRecipients: "Bildirim alıcıları: Misafir ilişkileri müdürü, misafir ilişkileri müdür yardımcısı ve misafir ilişkileri şefi",
    reviewSourceUrl: "Kaynak URL",
    reviewSourceSave: "Kaynakları kaydet",
    reviewSourceSaved: "Yorum kaynakları kaydedildi.",
    reviewSyncButton: "Yorumları senkronize et",
    reviewSyncing: "Kaynaklar taranıyor...",
    reviewSyncDone: "{count} yorum içe aktarıldı.",
    reviewSourceLastSync: "Son senkron",
    reviewScanLogTitle: "Tarama kayıtları",
    reviewScanStatus: "Tarama durumu",
    reviewScanCount: "Bulunan yorum",
    reviewMatchedAssistant: "Eşleşen asistan",
    reviewImported: "Otomatik",
    criticalReviewOpsTitle: "Kritik yorum operasyon paneli",
    criticalReviewOpsText: "1-4 puan arası yorumları, otomatik alarmları ve açılan aksiyonları tek yerden yönetin.",
    criticalReviewAlerts: "Aktif alarm",
    criticalReviewTasks: "Açılan görev",
    criticalReviewCreateTask: "Görev aç",
    criticalReviewTaskCreated: "Kritik yorum için görev açıldı.",
    criticalReviewAssign: "Atanan kişi",
    criticalReviewState: "Operasyon durumu",
    criticalReviewStates: {
      alerted: "Alarm oluştu",
      assigned: "Atandı",
      inProgress: "İşlemde",
      replied: "Yanıtlandı",
      closed: "Kapatıldı",
    },
    criticalReviewNote: "İç not",
    criticalReviewReplyTo: "Cevap verilen kişi",
    criticalReviewDeadline: "Termin",
    criticalReviewResolution: "Çözüm özeti",
    criticalReviewScheduledScan: "Planlı tarama",
    criticalReviewRapidScan: "15 dk izleme",
    addMeetingTitle: "Yüz yüze görüşme ekle",
    addReviewTitle: "Yorum ekle",
    followUpWaiting: "Takip bekleyen",
    lowReviewCount: "Düşük puanlı yorum",
    ftfCountLabel: "FTF kaydı",
    leaderAssistant: "Lider asistan",
    todayMeetingCount: "Bugünkü görüşme",
    reviewOpenCount: "Açık yorum",
    customerNameLabel: "Müşteri adı",
    contactLabel: "Telefon",
    topicLabel: "Görüşme konusu",
    tagCodeLabel: "Kod / etiket",
    resultLabel: "Sonuç",
    followUpDateLabel: "Takip tarihi",
    assignedAssistantLabel: "İlgili asistan",
    saveMeeting: "Görüşmeyi kaydet",
    platformLabel: "Platform",
    ratingLabel: "Puan",
    authorLabel: "Yorum sahibi",
    branchLabel: "Şube veya işletme",
    contentLabel: "Yorum metni",
    reviewContentPlaceholder: "Yorum içeriğini veya misafir geri bildirimini buraya girin.",
    saveReview: "Yorumu kaydet",
    searchMeeting: "Müşteri ya da konu ara",
    searchReview: "Platform, şube veya kişi ara",
    passwordChangeTitle: "Yeni şifre belirleyin",
    passwordChangeText: "İlk girişte güvenlik için kişisel şifrenizi güncellemeniz gerekir.",
    newPasswordRequiredLabel: "Yeni şifre",
    confirmPasswordLabel: "Yeni şifre tekrar",
    saveNewPassword: "Şifreyi kaydet",
    passwordChangeMismatch: "Yeni şifre alanları aynı olmalıdır.",
    passwordChangeLength: "Yeni şifre en az 8 karakter olmalıdır.",
    passwordChangeError: "Şifre güncellenemedi.",
    passwordChangeSuccess: "Şifreniz güncellendi.",
    accessNoteAssistant:
      "Asistan hesabı yalnızca panel özeti, şikayetler ve izin verilen dış modüllere erişebilir.",
    accessNoteDepartmentManager:
      "Departman müdürü yalnızca kendi departman verilerini görür ve sadece kendi departman kayıtlarını yönetir.",
    accessNoteFull:
      "Bu rol tüm sekmelere ve tüm canlı modüllere erişebilir.",
    statuses: {
      "Not Started": "Başlamadı",
      Planned: "Planlandı",
      "In Progress": "Devam ediyor",
      Done: "Tamamlandı",
      Open: "Açık",
      "In Review": "İnceleniyor",
      Resolved: "Çözüldü",
    },
    priorities: { Low: "Düşük", Medium: "Orta", High: "Yüksek", Critical: "Kritik" },
    taskTypes: { daily: "Günlük", periodic: "Dönemsel" },
    departments: {
      guestRelations: "Misafir İlişkileri",
      operations: "Operasyon",
      housekeeping: "Kat Hizmetleri",
      fb: "Yiyecek ve İçecek",
      technical: "Teknik",
      security: "Güvenlik",
      entertainment: "Animasyon",
      frontOffice: "Ön Büro",
      sales: "Satış",
      humanResources: "İnsan Kaynakları",
      finance: "Finans",
      purchasing: "Satın Alma",
      quality: "Kalite",
      spa: "SPA",
      management: "Yönetim",
    },
    channels: {
      frontDesk: "Resepsiyon",
      whatsapp: "WhatsApp",
      voyageAssistant: "Voyage Assistant",
      callCenter: "Çağrı Merkezi",
    },
    categories: {
      roomCleanliness: "Oda temizliği",
      housekeepingDelay: "Temizlik gecikmesi",
      amenitiesMissing: "Eksik buklet malzemesi",
      laundryIssue: "Çamaşır / tekstil sorunu",
      minibarMissing: "Eksik minibar dolumu",
      balconyCleaning: "Balkon temizliği",
      dinnerService: "Akşam servisi",
      breakfastService: "Kahvaltı servisi",
      barService: "Bar servisi",
      allergyRequest: "Alerjen / özel menü talebi",
      serviceTemperature: "Yemek sıcaklığı",
      hostDelay: "Karşılama / rezervasyon desk gecikmesi",
      acIssue: "Klima arızası",
      plumbingIssue: "Tesisat sorunu",
      wifiIssue: "Wi-Fi sorunu",
      lightingIssue: "Aydınlatma sorunu",
      tvIssue: "TV / yayın sorunu",
      hotWaterIssue: "Sıcak su sorunu",
      noiseCorridor: "Koridor gürültüsü",
      noiseEntertainment: "Eğlence gürültüsü",
      securityIncident: "Güvenlik olayı",
      lostItem: "Kayıp eşya süreci",
      poolSafety: "Havuz güvenliği",
      unauthorizedAccess: "Yetkisiz erişim",
      checkInDelay: "Check-in gecikmesi",
      billingIssue: "Fatura sorunu",
      roomAllocation: "Oda atama sorunu",
      lateCheckout: "Geç çıkış talebi",
      keyCardIssue: "Kartlı geçiş sorunu",
      luggageDelay: "Bagaj gecikmesi",
      guestRelationsFollowUp: "Misafir geri dönüşü",
      vipHandling: "VIP karşılama süreci",
      feedbackResponse: "Geri bildirim yanıtı",
      transferRequest: "Transfer organizasyonu",
      compensationRequest: "Telafi / jest talebi",
      loyaltyIssue: "Sadakat programı talebi",
      spaService: "SPA hizmeti",
      appointmentDelay: "Randevu gecikmesi",
      cleanlinessSpa: "SPA hijyeni",
      therapistRequest: "Terapist talebi",
      therapistAvailability: "Terapist müsaitliği",
      treatmentQuality: "Bakım kalitesi",
      showQuality: "Şov kalitesi",
      activityPlanning: "Aktivite planlaması",
      musicVolume: "Müzik ses seviyesi",
      kidsClubIssue: "Mini kulüp / çocuk aktivitesi",
      stageSoundIssue: "Sahne ses sistemi",
      activityCapacity: "Aktivite kapasitesi",
    },
    taskTitles: {
      vipArrivalPreparation: "VIP varış hazırlığı",
      weeklyTeamBriefingPlan: "Haftalık ekip brifing planı",
      complaintFollowUpBacklogCleanup: "Şikayet takip birikimini temizleme",
    },
    taskNotes: {
      vipArrivalPreparation: "Karşılama kartı, oda kontrolü ve ikram teyidi.",
      weeklyTeamBriefingPlan:
        "Servis akışı, misafir memnuniyetsizliği yönetimi ve upsell hatırlatmalarını ekle.",
      complaintFollowUpBacklogCleanup: "48 saati aşan çözümsüz kayıtları incele.",
    },
    complaintSummaries: {
      roomCleaningDelayed: "Oda temizliği gecikti.",
      dinnerServiceComplaint: "Akşam yemeği hizmet kalitesi şikayeti.",
      acIssue: "Klima düzgün çalışmıyor.",
      corridorNoise: "Geç saatlerde koridorda gürültü oluştu.",
    },
  },
  en: {
    appTitle: "365 Day Agenda",
    languageLabel: "Language",
    hotelOperationsPwa: "Voyage Kundu operations PWA",
    heroTitle: "Task, Planning and Complaint Management",
    heroDescription:
      "Single-link sign-in, role-based access, complaint tracking and quick access to Voyage Kundu operation modules.",
    overallProgress: "Overall progress",
    openComplaints: "Open complaints",
    totalTasks: "Total tasks",
    totalTasksSub: "All work items",
    activeTasks: "Active tasks",
    activeTasksSub: "Currently in progress",
    resolvedComplaints: "Resolved complaints",
    resolvedComplaintsSub: "Closed successfully",
    criticalComplaints: "Critical complaints",
    criticalComplaintsSub: "Immediate attention",
    sections: "Sections",
    dashboard: "Dashboard",
    tasksTab: "To-Do & Planning",
    complaintsTab: "Complaints",
    analysis: "Analysis",
    alacarteTab: "Ala Carte",
    assistantTrackerTab: "FTF and Hall of Fame",
    criticalReviewOpsTab: "Critical Review Ops",
    ordersTab: "Orders",
    managerAgendaTab: "365 Day Agenda",
    permissionsTab: "Permissions",
    managerOpsTab: "Manager Activity",
    todayFocus: "Today and period focus",
    toggleDone: "Toggle status",
    unassigned: "Unassigned",
    noDate: "No date",
    planningSummary: "Planning summary",
    dailyTasks: "Daily tasks",
    completedTasks: "Completed tasks",
    todoPlanningBoard: "To-Do List and Planning Board",
    searchTask: "Search task",
    allTypes: "All types",
    allTaskStatuses: "All task statuses",
    taskStatusFilter: "Task status",
    daily: "Daily",
    periodic: "Periodic",
    duePrefix: "Due",
    notSet: "Not set",
    done: "Done",
    progress: "Progress",
    addNewTask: "Add new task",
    taskTitle: "Task title",
    taskTitlePlaceholder: "Example: Check guest complaint log",
    type: "Type",
    priority: "Priority",
    department: "Department",
    owner: "Owner",
    dueDate: "Due date",
    notes: "Notes",
    notesPlaceholder: "Write the task details, context, or any follow-up notes.",
    addTask: "Add task",
    ordersTitle: "Orders",
    ordersText: "Manage fruit basket, cake and special request orders by room.",
    fruitWine: "Fruit Basket & Wine",
    cake: "Cake",
    roomDecoration: "Room Decoration",
    specialRequest: "Special Request",
    roomNumberFixed: "Room No",
    addOrder: "Add order",
    saveOrders: "Save orders",
    exportOrders: "Export orders",
    printOrders: "Print",
    ordersSaved: "Order list saved.",
    ordersExported: "Order list downloaded.",
    ordersPrinted: "Order sheet prepared for printing.",
    saveList: "Save list",
    exportList: "Export",
    tasksSaved: "Task list saved.",
    tasksExported: "Task list downloaded.",
    complaintsSaved: "Complaint list saved.",
    complaintsExported: "Complaint list downloaded.",
    alaCarteSaved: "Ala carte lists saved.",
    alaCarteExported: "Ala carte lists downloaded.",
    complaintTracking: "Complaint Tracking",
    searchComplaint: "Search complaint",
    allStatuses: "All statuses",
    allSeverities: "All severities",
    allDepartments: "All departments",
    allComplaintCategories: "All categories",
    allChannels: "All channels",
    complaintDepartmentFilter: "Complaint department",
    complaintSeverityFilter: "Complaint severity",
    complaintChannelFilter: "Complaint channel",
    addComplaint: "Add complaint",
    guestOrCase: "Guest / Case",
    category: "Category",
    severity: "Severity",
    channel: "Channel",
    date: "Date",
    summary: "Summary",
    summaryPlaceholder: "Write a short complaint summary and the expected action.",
    complaintCategories: "Complaint categories",
    complaintStatusDistribution: "Complaint status distribution",
    totalComplaints: "Total complaints",
    openRatio: "Open ratio",
    resolutionRatio: "Resolution ratio",
    voyageModules: "Voyage modules",
    voyageModulesText: "Internal operation panels filtered by user role.",
    runtimeLabel: "Runtime",
    runtimeText: "Role-scoped internal operational model. No outbound dependency on live reservation pages.",
    internalPanel: "Internal panel",
    panelReady: "Ready",
    openPanel: "Open panel",
    modulePreviewTitle: "Module summary",
    modulePreviewEmpty: "The related operation summary will appear here when a module is selected.",
    moduleGoto: "Go to related section",
    moduleTargets: {
      guest: "Dashboard summary, task flow and guest operation view",
      settings: "Permission and management settings view",
      assistant: "Complaint and guest routing view",
      assistantTracker: "Face-to-face logs, manual reviews and hall of fame screen",
    },
    modules: {
      guest: { title: "Guest panel", text: "Internal system area for guest flows, schedules and reservation rules." },
      settings: { title: "Settings panel", text: "Internal admin module for content, teams, mappings and operation rules." },
      assistant: { title: "Assistant panel", text: "Internal service area for room selection, routing and guest chat flow." },
      assistantTracker: { title: "Assistant tracker module", text: "Face-to-face meetings, manual platform reviews, FTF follow-up and hall of fame now run inside the app." },
    },
    roles: { admin: "Admin", manager: "General Manager", deputy: "Assistant General Manager", chief: "Operations Manager", assistant: "Assistant", departmentManager: "Department Manager" },
    loginTitle: "Single-link sign-in panel",
    loginText:
      "Sign in with the shared access code and the user password. For admin accounts, only the title is shown; names remain visible only for assistants.",
    selectUser: "Select user",
    accessCodeLabel: "Main access code",
    accessCodePlaceholder: "Enter the shared access code",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    signIn: "Sign in",
    authFailed: "Invalid access code or user password.",
    signedInAs: "Signed in as",
    signOut: "Sign out",
    limitedAccess: "Limited access",
    fullAccess: "Full access",
    auditTitle: "Manager activity panel",
    auditText: "Only the manager can see what each user did.",
    auditEmpty: "No records yet.",
    auditUser: "User",
    auditAction: "Action",
    auditTime: "Time",
    actionLogin: "Signed in",
    actionLogout: "Signed out",
    actionTab: "Opened tab",
    actionTaskAdded: "Added task",
    actionComplaintAdded: "Added complaint",
    actionTaskToggled: "Changed task status",
    actionModuleOpened: "Reviewed internal module",
    actionPermissionUpdated: "Updated permissions",
    actionAlaCarteAdded: "Added ala carte venue",
    actionAlaCarteToggled: "Changed ala carte status",
    actionAlaCartePriceUpdated: "Updated ala carte price",
    actionAgendaAdded: "Added agenda item",
    actionAgendaToggled: "Changed agenda status",
    agendaTitle: "365 day manager agenda",
    agendaText: "Manage daily operations, task follow-up and next-day critical work in one tab.",
    calendar365Title: "365-day calendar view",
    dailyAgendaTitle: "Today's work tracking",
    nextDayAgendaTitle: "Next day critical work",
    allUpcomingTitle: "Upcoming records",
    agendaAddTitle: "Add agenda item",
    agendaTaskTitle: "Task title",
    agendaTaskDate: "Task date",
    agendaTaskOwner: "Follow-up owner",
    agendaTaskPriority: "Priority level",
    agendaTaskContext: "Operational note",
    agendaTaskContextPlaceholder: "Explain why this item matters and what should be followed up.",
    addAgendaTask: "Add agenda task",
    noAgendaToday: "No records for today.",
    noAgendaTomorrow: "No critical work set for tomorrow.",
    noAgendaUpcoming: "No upcoming agenda entries.",
    trackedItems: "Tracked items",
    monthlyLoad: "Monthly load",
    criticalFocus: "Critical focus",
    nextSevenDays: "7-day view",
    complaintValidation: "To add a complaint, you must fill in the guest/case and summary fields.",
    alaCarteTitle: "Ala carte panel",
    alaCarteText:
      "An internal reservation and service operations system without relying on external links.",
    alaCarteSystemTitle: "Ala carte system",
    alaCarteSystemText:
      "Venue, service slot, price, occupancy and rule management in a single panel.",
    addVenue: "Add venue",
    venueName: "Venue name",
    serviceDemand: "Demand",
    occupancy: "Occupancy",
    slotCount: "Service slots",
    updatePrice: "Update price",
    quickRules: "Quick rules",
    activeVenues: "Active venues",
    alaCarteRestaurants: "Ala carte restaurants",
    cuisine: "Cuisine",
    activeStatus: "Status",
    openTime: "Opening",
    lastArrival: "Last arrival",
    coverPrice: "Cover price",
    maxGuests: "Max guests",
    childPolicy: "Child policy",
    cancellationWindow: "Cancellation window",
    closeSaleWindow: "Close sale window",
    workingDays: "Working days",
    roomNightLimit: "Room/night limit",
    includeOtherRooms: "Include other rooms",
    tableSetup: "Table setup",
    areaPreference: "Area preference",
    mixedTable: "Mixed table",
    operationalNote: "Operational note",
    operationalNotePlaceholder: "Write the short note that the operations team needs to see.",
    active: "Active",
    passive: "Passive",
    yes: "Yes",
    no: "No",
    weekdaysShort: { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" },
    reservationClosedDayError: "The selected restaurant is closed on this day. A reservation cannot be created.",
    slotClosedDayError: "The selected restaurant does not operate on this day. A service slot cannot be added.",
    permissionTitle: "Permission management",
    permissionText:
      "All tab and panel access outside the assistant system can only be opened or closed by the admin here.",
    permissionScopeNote: "Assistant and FTF system access stays fixed; the admin controls every other permission.",
    departmentPermissionTitle: "Department-scoped user permissions",
    departmentPermissionText: "The admin can manage every user. Other managers can only open or close permissions for users inside their own department.",
    noDepartmentPermissionUsers: "There are no users you can manage in this scope.",
    accountRoleLabel: "Account role",
    userAdminTitle: "Admin user management",
    userAdminText: "The admin can update each account's display name and assign a new password. No extra password is required inside the admin panel.",
    accountTitle: "Account",
    displayNameLabel: "Display name",
    newPasswordLabel: "New password",
    newPasswordPlaceholder: "Leave blank to keep current password",
    saveUserSettings: "Update user",
    userUpdateSuccess: "User details updated.",
    userUpdateError: "User details could not be updated.",
    notificationsTitle: "Department notifications",
    notificationsText: "Only notifications assigned to your department appear here. If you allow it, you will also receive instant web notifications on your phone.",
    noNotifications: "There are no notifications assigned to you right now.",
    unreadNotifications: "Unread notifications",
    allowNotifications: "Allow notifications",
    markAsRead: "Mark as read",
    notificationComplaintTitle: "New department feedback",
    ftfStatsTitle: "Assistant tracking overview",
    ftfLeaderboardTitle: "Hall of Fame",
    ftfMeetingsTitle: "FTF follow-up list",
    ftfReviewsTitle: "Review list",
    reviewSourcesTitle: "Review sources",
    reviewSourcesText: "Collect Google, Tripadvisor, Yandex and HolidayCheck reviews in one screen.",
    reviewScheduleTitle: "Scan schedule",
    reviewScheduleDaily: "Standard scan: 00:00, 08:00, 16:00",
    reviewScheduleLow: "1-4 rating watch: every 15 minutes",
    reviewAlertRecipients: "Alert recipients: Guest relations manager, guest relations deputy manager and guest relations chief",
    reviewSourceUrl: "Source URL",
    reviewSourceSave: "Save sources",
    reviewSourceSaved: "Review sources saved.",
    reviewSyncButton: "Sync reviews",
    reviewSyncing: "Scanning sources...",
    reviewSyncDone: "{count} reviews imported.",
    reviewSourceLastSync: "Last sync",
    reviewScanLogTitle: "Scan logs",
    reviewScanStatus: "Scan status",
    reviewScanCount: "Reviews found",
    reviewMatchedAssistant: "Matched assistant",
    reviewImported: "Automatic",
    criticalReviewOpsTitle: "Critical review operations panel",
    criticalReviewOpsText: "Manage 1-4 rating reviews, automatic alerts and opened actions in one place.",
    criticalReviewAlerts: "Active alert",
    criticalReviewTasks: "Opened task",
    criticalReviewCreateTask: "Create task",
    criticalReviewTaskCreated: "Task created for the critical review.",
    criticalReviewAssign: "Assigned to",
    criticalReviewState: "Operation status",
    criticalReviewStates: {
      alerted: "Alerted",
      assigned: "Assigned",
      inProgress: "In progress",
      replied: "Replied",
      closed: "Closed",
    },
    criticalReviewNote: "Internal note",
    criticalReviewReplyTo: "Replied to",
    criticalReviewDeadline: "Deadline",
    criticalReviewResolution: "Resolution summary",
    criticalReviewScheduledScan: "Scheduled scan",
    criticalReviewRapidScan: "15 min watch",
    addMeetingTitle: "Add face-to-face meeting",
    addReviewTitle: "Add review",
    followUpWaiting: "Waiting follow-ups",
    lowReviewCount: "Low-rated reviews",
    ftfCountLabel: "FTF records",
    leaderAssistant: "Top assistant",
    todayMeetingCount: "Today's meetings",
    reviewOpenCount: "Open reviews",
    customerNameLabel: "Customer name",
    contactLabel: "Phone",
    topicLabel: "Meeting topic",
    tagCodeLabel: "Code / tag",
    resultLabel: "Result",
    followUpDateLabel: "Follow-up date",
    assignedAssistantLabel: "Assigned assistant",
    saveMeeting: "Save meeting",
    platformLabel: "Platform",
    ratingLabel: "Rating",
    authorLabel: "Review author",
    branchLabel: "Branch or venue",
    contentLabel: "Review content",
    reviewContentPlaceholder: "Enter the review text or guest feedback here.",
    saveReview: "Save review",
    searchMeeting: "Search customer or topic",
    searchReview: "Search platform, branch or person",
    passwordChangeTitle: "Set a new password",
    passwordChangeText: "For security, you must update your personal password at first sign-in.",
    newPasswordRequiredLabel: "New password",
    confirmPasswordLabel: "Confirm new password",
    saveNewPassword: "Save password",
    passwordChangeMismatch: "The new password fields must match.",
    passwordChangeLength: "The new password must be at least 8 characters.",
    passwordChangeError: "The password could not be updated.",
    passwordChangeSuccess: "Your password has been updated.",
    accessNoteAssistant:
      "Assistant accounts can access only the dashboard summary, complaints and allowed external modules.",
    accessNoteDepartmentManager:
      "Department managers can see only their own department data and manage only department-scoped records.",
    accessNoteFull: "This role can access all tabs and all live modules.",
    statuses: {
      "Not Started": "Not Started",
      Planned: "Planned",
      "In Progress": "In Progress",
      Done: "Done",
      Open: "Open",
      "In Review": "In Review",
      Resolved: "Resolved",
    },
    priorities: { Low: "Low", Medium: "Medium", High: "High", Critical: "Critical" },
    taskTypes: { daily: "Daily", periodic: "Periodic" },
    departments: {
      guestRelations: "Guest Relations",
      operations: "Operations",
      housekeeping: "Housekeeping",
      fb: "F&B",
      technical: "Technical",
      security: "Security",
      entertainment: "Entertainment",
      frontOffice: "Front Office",
      sales: "Sales",
      humanResources: "Human Resources",
      finance: "Finance",
      purchasing: "Purchasing",
      quality: "Quality",
      spa: "SPA",
      management: "Management",
    },
    channels: {
      frontDesk: "Front Desk",
      whatsapp: "WhatsApp",
      voyageAssistant: "Voyage Assistant",
      callCenter: "Call Center",
    },
    categories: {
      roomCleanliness: "Room cleanliness",
      housekeepingDelay: "Cleaning delay",
      amenitiesMissing: "Missing amenities",
      laundryIssue: "Laundry / linen issue",
      minibarMissing: "Minibar replenishment issue",
      balconyCleaning: "Balcony cleaning",
      dinnerService: "Dinner service",
      breakfastService: "Breakfast service",
      barService: "Bar service",
      allergyRequest: "Allergy / special menu request",
      serviceTemperature: "Food temperature",
      hostDelay: "Host / reservation desk delay",
      acIssue: "Air conditioning issue",
      plumbingIssue: "Plumbing issue",
      wifiIssue: "Wi-Fi issue",
      lightingIssue: "Lighting issue",
      tvIssue: "TV / broadcast issue",
      hotWaterIssue: "Hot water issue",
      noiseCorridor: "Corridor noise",
      noiseEntertainment: "Entertainment noise",
      securityIncident: "Security incident",
      lostItem: "Lost item process",
      poolSafety: "Pool safety issue",
      unauthorizedAccess: "Unauthorized access",
      checkInDelay: "Check-in delay",
      billingIssue: "Billing issue",
      roomAllocation: "Room allocation issue",
      lateCheckout: "Late check-out request",
      keyCardIssue: "Key card issue",
      luggageDelay: "Luggage delay",
      guestRelationsFollowUp: "Guest follow-up",
      vipHandling: "VIP handling",
      feedbackResponse: "Feedback response",
      transferRequest: "Transfer request",
      compensationRequest: "Compensation request",
      loyaltyIssue: "Loyalty program request",
      spaService: "SPA service",
      appointmentDelay: "Appointment delay",
      cleanlinessSpa: "SPA cleanliness",
      therapistRequest: "Therapist request",
      therapistAvailability: "Therapist availability",
      treatmentQuality: "Treatment quality",
      showQuality: "Show quality",
      activityPlanning: "Activity planning",
      musicVolume: "Music volume",
      kidsClubIssue: "Kids club activity issue",
      stageSoundIssue: "Stage sound issue",
      activityCapacity: "Activity capacity issue",
    },
    taskTitles: {
      vipArrivalPreparation: "VIP arrival preparation",
      weeklyTeamBriefingPlan: "Weekly team briefing plan",
      complaintFollowUpBacklogCleanup: "Complaint follow-up backlog cleanup",
    },
    taskNotes: {
      vipArrivalPreparation: "Welcome card, room check, amenities confirmation.",
      weeklyTeamBriefingPlan: "Include service flow, guest recovery, upsell reminders.",
      complaintFollowUpBacklogCleanup: "Review unresolved issues older than 48 hours.",
    },
    complaintSummaries: {
      roomCleaningDelayed: "Room cleaning was delayed.",
      dinnerServiceComplaint: "Dinner service quality complaint.",
      acIssue: "Air conditioning not working properly.",
      corridorNoise: "Noise in corridor during late hours.",
    },
  },
  de: {
    appTitle: "365 Tage Agenda",
    languageLabel: "Sprache",
    hotelOperationsPwa: "Voyage Kundu Betriebs-PWA",
    heroTitle: "Aufgaben-, Planungs- und Beschwerdemanagement",
    heroDescription:
      "Einzellink-Anmeldung, rollenbasierter Zugriff, Beschwerdeverfolgung und schneller Zugriff auf Voyage Kundu Betriebsmodule.",
    overallProgress: "Gesamtfortschritt",
    openComplaints: "Offene Beschwerden",
    totalTasks: "Aufgaben gesamt",
    totalTasksSub: "Alle Arbeitspunkte",
    activeTasks: "Aktive Aufgaben",
    activeTasksSub: "Derzeit in Bearbeitung",
    resolvedComplaints: "Gelöste Beschwerden",
    resolvedComplaintsSub: "Erfolgreich abgeschlossen",
    criticalComplaints: "Kritische Beschwerden",
    criticalComplaintsSub: "Sofortige Aufmerksamkeit",
    sections: "Bereiche",
    dashboard: "Dashboard",
    tasksTab: "Aufgaben & Planung",
    complaintsTab: "Beschwerden",
    analysis: "Analyse",
    alacarteTab: "Ala Carte",
    assistantTrackerTab: "FTF und Hall of Fame",
    criticalReviewOpsTab: "Kritische Bewertungszentrale",
    ordersTab: "Bestellungen",
    managerAgendaTab: "365-Tage-Agenda",
    permissionsTab: "Rechte",
    managerOpsTab: "Manager-Aktionen",
    todayFocus: "Heutiger und periodischer Fokus",
    toggleDone: "Status wechseln",
    unassigned: "Nicht zugewiesen",
    noDate: "Kein Datum",
    planningSummary: "Planungsübersicht",
    dailyTasks: "Tägliche Aufgaben",
    completedTasks: "Abgeschlossene Aufgaben",
    todoPlanningBoard: "Aufgaben- und Planungsboard",
    searchTask: "Aufgabe suchen",
    allTypes: "Alle Typen",
    allTaskStatuses: "Alle Aufgabenstatus",
    taskStatusFilter: "Aufgabenstatus",
    daily: "Täglich",
    periodic: "Periodisch",
    duePrefix: "Fällig",
    notSet: "Nicht festgelegt",
    done: "Erledigt",
    progress: "Fortschritt",
    addNewTask: "Neue Aufgabe hinzufügen",
    taskTitle: "Aufgabentitel",
    taskTitlePlaceholder: "Beispiel: Beschwerdeprotokoll prüfen",
    type: "Typ",
    priority: "Priorität",
    department: "Abteilung",
    owner: "Verantwortlich",
    dueDate: "Fälligkeitsdatum",
    notes: "Notizen",
    notesPlaceholder: "Geben Sie Details, Kontext oder zusätzliche Notizen zur Aufgabe ein.",
    addTask: "Aufgabe hinzufügen",
    ordersTitle: "Bestellungen",
    ordersText: "Verwalten Sie Obstkorb-, Kuchen- und Sonderwunschbestellungen nach Zimmer.",
    fruitWine: "Obstkorb & Wein",
    cake: "Kuchen",
    roomDecoration: "Zimmerdekoration",
    specialRequest: "Sonderwunsch",
    roomNumberFixed: "Zimmernr.",
    addOrder: "Bestellung hinzufügen",
    saveOrders: "Bestellungen speichern",
    exportOrders: "Bestellungen exportieren",
    printOrders: "Drucken",
    ordersSaved: "Bestellliste gespeichert.",
    ordersExported: "Bestellliste heruntergeladen.",
    ordersPrinted: "Bestellblatt zum Drucken vorbereitet.",
    saveList: "Liste speichern",
    exportList: "Exportieren",
    tasksSaved: "Aufgabenliste wurde gespeichert.",
    tasksExported: "Aufgabenliste wurde heruntergeladen.",
    complaintsSaved: "Beschwerdeliste wurde gespeichert.",
    complaintsExported: "Beschwerdeliste wurde heruntergeladen.",
    alaCarteSaved: "Ala-Carte-Listen wurden gespeichert.",
    alaCarteExported: "Ala-Carte-Listen wurden heruntergeladen.",
    complaintTracking: "Beschwerdeverfolgung",
    searchComplaint: "Beschwerde suchen",
    allStatuses: "Alle Status",
    allSeverities: "Alle Stufen",
    allDepartments: "Alle Abteilungen",
    allComplaintCategories: "Alle Kategorien",
    allChannels: "Alle Kanäle",
    complaintDepartmentFilter: "Beschwerdeabteilung",
    complaintSeverityFilter: "Beschwerdestufe",
    complaintChannelFilter: "Beschwerdekanal",
    addComplaint: "Beschwerde hinzufügen",
    guestOrCase: "Gast / Fall",
    category: "Kategorie",
    severity: "Schweregrad",
    channel: "Kanal",
    date: "Datum",
    summary: "Zusammenfassung",
    summaryPlaceholder: "Geben Sie eine kurze Beschwerde-Zusammenfassung und die erwartete Aktion ein.",
    complaintCategories: "Beschwerdekategorien",
    complaintStatusDistribution: "Verteilung der Beschwerdestati",
    totalComplaints: "Beschwerden gesamt",
    openRatio: "Offen-Quote",
    resolutionRatio: "Lösungsquote",
    voyageModules: "Voyage-Module",
    voyageModulesText: "Interne Bedienpanels gefiltert nach Benutzerrolle.",
    runtimeLabel: "Laufzeit",
    runtimeText: "Rollenbasiertes internes Betriebsmodell. Keine Abhängigkeit zu Live-Reservierungsseiten.",
    internalPanel: "Internes Panel",
    panelReady: "Bereit",
    openPanel: "Panel öffnen",
    modulePreviewTitle: "Modulübersicht",
    modulePreviewEmpty: "Hier erscheint die passende Betriebsübersicht, sobald ein Modul gewählt wird.",
    moduleGoto: "Zum Bereich gehen",
    moduleTargets: {
      guest: "Dashboard-Übersicht, Aufgabenfluss und Gastbetriebsansicht",
      settings: "Ansicht für Rechte und Verwaltungseinstellungen",
      assistant: "Ansicht für Beschwerden und Gast-Routing",
      assistantTracker: "Face-to-Face-Protokolle, manuelle Bewertungen und Hall-of-Fame-Bildschirm",
    },
    modules: {
      guest: { title: "Gasterlebnis", text: "Interner Systembereich für Gastabläufe, Zeitpläne und Reservierungsregeln." },
      settings: { title: "Management-Einstellungen", text: "Internes Admin-Modul für Inhalte, Teams, Zuordnungen und Regeln." },
      assistant: { title: "Assistentenbetrieb", text: "Interner Servicebereich für Zimmerauswahl, Routing und Gast-Chat." },
      assistantTracker: { title: "Assistenten-Tracking", text: "Face-to-Face-Gespräche, manuelle Bewertungen, FTF-Nachverfolgung und Hall of Fame laufen jetzt direkt in der App." },
    },
    roles: { admin: "Admin", manager: "Generaldirektor", deputy: "Stellv. Generaldirektor", chief: "Betriebsleiter", assistant: "Assistent", departmentManager: "Abteilungsleiter" },
    loginTitle: "Einzel-Link-Anmeldung",
    loginText:
      "Melden Sie sich mit dem gemeinsamen Zugangscode und dem Benutzerpasswort an. Bei Admin-Zugängen wird nur der Titel angezeigt; Namen bleiben nur bei Assistenten sichtbar.",
    selectUser: "Benutzer wählen",
    accessCodeLabel: "Hauptzugangscode",
    accessCodePlaceholder: "Gemeinsamen Zugangscode eingeben",
    passwordLabel: "Passwort",
    passwordPlaceholder: "Passwort eingeben",
    signIn: "Anmelden",
    authFailed: "Zugangscode oder Benutzerpasswort ist ungültig.",
    signedInAs: "Angemeldet als",
    signOut: "Abmelden",
    limitedAccess: "Eingeschränkter Zugriff",
    fullAccess: "Voller Zugriff",
    auditTitle: "Manager-Aktivitätspanel",
    auditText: "Nur der Manager kann sehen, was jeder Benutzer getan hat.",
    auditEmpty: "Noch keine Einträge.",
    auditUser: "Benutzer",
    auditAction: "Aktion",
    auditTime: "Zeit",
    actionLogin: "Angemeldet",
    actionLogout: "Abgemeldet",
    actionTab: "Register geöffnet",
    actionTaskAdded: "Aufgabe hinzugefügt",
    actionComplaintAdded: "Beschwerde hinzugefügt",
    actionTaskToggled: "Aufgabenstatus geändert",
    actionModuleOpened: "Internes Modul geprüft",
    actionPermissionUpdated: "Berechtigung aktualisiert",
    actionAlaCarteAdded: "Ala-Carte-Standort hinzugefügt",
    actionAlaCarteToggled: "Ala-Carte-Status geändert",
    actionAlaCartePriceUpdated: "Ala-Carte-Preis aktualisiert",
    actionAgendaAdded: "Agenda-Eintrag hinzugefügt",
    actionAgendaToggled: "Agenda-Status geändert",
    agendaTitle: "365-Tage-Manageragenda",
    agendaText: "Tägliche Abläufe, Aufgabenverfolgung und kritische Themen für den nächsten Tag in einem Tab.",
    calendar365Title: "365-Tage-Kalenderansicht",
    dailyAgendaTitle: "Heutige Arbeitsverfolgung",
    nextDayAgendaTitle: "Kritische Aufgaben für den nächsten Tag",
    allUpcomingTitle: "Bevorstehende Einträge",
    agendaAddTitle: "Agenda-Eintrag hinzufügen",
    agendaTaskTitle: "Aufgabentitel",
    agendaTaskDate: "Aufgabendatum",
    agendaTaskOwner: "Verantwortlich",
    agendaTaskPriority: "Prioritätsstufe",
    agendaTaskContext: "Betriebshinweis",
    agendaTaskContextPlaceholder: "Beschreiben Sie, warum diese Aufgabe wichtig ist und was verfolgt werden soll.",
    addAgendaTask: "Agenda-Eintrag hinzufügen",
    noAgendaToday: "Keine Einträge für heute.",
    noAgendaTomorrow: "Für morgen ist nichts Kritisches definiert.",
    noAgendaUpcoming: "Keine bevorstehenden Agenda-Einträge.",
    trackedItems: "Verfolgte Einträge",
    monthlyLoad: "Monatslast",
    criticalFocus: "Kritischer Fokus",
    nextSevenDays: "7-Tage-Ansicht",
    complaintValidation: "Um eine Beschwerde hinzuzufügen, müssen Gast/Fall und Zusammenfassung ausgefüllt werden.",
    alaCarteTitle: "Ala-Carte-Panel",
    alaCarteText:
      "Internes Reservierungs- und Servicebetriebssystem ohne Abhängigkeit von externen Links.",
    alaCarteSystemTitle: "Ala-Carte-System",
    alaCarteSystemText:
      "Standort-, Slot-, Preis-, Auslastungs- und Regelverwaltung in einem Panel.",
    addVenue: "Standort hinzufügen",
    venueName: "Standortname",
    serviceDemand: "Nachfrage",
    occupancy: "Auslastung",
    slotCount: "Service-Slots",
    updatePrice: "Preis aktualisieren",
    quickRules: "Schnellregeln",
    activeVenues: "Aktive Standorte",
    alaCarteRestaurants: "Ala-Carte-Restaurants",
    cuisine: "Küche",
    activeStatus: "Status",
    openTime: "Öffnung",
    lastArrival: "Letzte Ankunft",
    coverPrice: "Preis pro Person",
    maxGuests: "Max. Gäste",
    childPolicy: "Kinderregel",
    cancellationWindow: "Stornofenster",
    closeSaleWindow: "Verkaufsende",
    workingDays: "Arbeitstage",
    roomNightLimit: "Zimmer/Nacht-Limit",
    includeOtherRooms: "Andere Zimmer einschließen",
    tableSetup: "Tischaufbau",
    areaPreference: "Bereichspräferenz",
    mixedTable: "Gemischter Tisch",
    operationalNote: "Betriebshinweis",
    operationalNotePlaceholder: "Geben Sie die kurze Notiz ein, die das Operationsteam sehen soll.",
    active: "Aktiv",
    passive: "Passiv",
    yes: "Ja",
    no: "Nein",
    weekdaysShort: { Mon: "Mo", Tue: "Di", Wed: "Mi", Thu: "Do", Fri: "Fr", Sat: "Sa", Sun: "So" },
    reservationClosedDayError: "Das ausgewählte Restaurant ist an diesem Tag geschlossen. Es kann keine Reservierung erstellt werden.",
    slotClosedDayError: "Das ausgewählte Restaurant arbeitet an diesem Tag nicht. Es kann kein Service-Slot hinzugefügt werden.",
    permissionTitle: "Rechteverwaltung",
    permissionText:
      "Alle Register- und Panelzugriffe außerhalb des Assistentensystems können hier nur vom Admin geöffnet oder geschlossen werden.",
    permissionScopeNote: "Assistenten- und FTF-System bleiben fest; alle übrigen Rechte steuert nur der Admin.",
    departmentPermissionTitle: "Abteilungsbezogene Benutzerrechte",
    departmentPermissionText: "Der Admin kann alle Benutzer verwalten. Andere Manager dürfen Rechte nur für Benutzer ihrer eigenen Abteilung anpassen.",
    noDepartmentPermissionUsers: "In diesem Bereich gibt es keine Benutzer, die Sie verwalten können.",
    accountRoleLabel: "Kontorolle",
    userAdminTitle: "Admin-Benutzerverwaltung",
    userAdminText: "Der Admin kann den sichtbaren Namen aller Benutzer aktualisieren und neue Passwörter vergeben. Im Admin-Bereich ist keine zusätzliche Bestätigung nötig.",
    accountTitle: "Konto",
    displayNameLabel: "Anzeigename",
    newPasswordLabel: "Neues Passwort",
    newPasswordPlaceholder: "Leer lassen, um das aktuelle Passwort zu behalten",
    saveUserSettings: "Benutzer aktualisieren",
    userUpdateSuccess: "Benutzerdaten wurden aktualisiert.",
    userUpdateError: "Benutzerdaten konnten nicht aktualisiert werden.",
    notificationsTitle: "Abteilungsbenachrichtigungen",
    notificationsText: "Hier erscheinen nur Benachrichtigungen für Ihre Abteilung. Wenn Sie es erlauben, erhalten Sie auch sofortige Web-Benachrichtigungen auf Ihrem Telefon.",
    noNotifications: "Derzeit sind Ihnen keine Benachrichtigungen zugewiesen.",
    unreadNotifications: "Ungelesene Benachrichtigungen",
    allowNotifications: "Benachrichtigungen erlauben",
    markAsRead: "Als gelesen markieren",
    notificationComplaintTitle: "Neues Abteilungsfeedback",
    ftfStatsTitle: "Assistenten-Tracking-Übersicht",
    ftfLeaderboardTitle: "Hall of Fame",
    ftfMeetingsTitle: "FTF-Nachverfolgung",
    ftfReviewsTitle: "Bewertungsliste",
    reviewSourcesTitle: "Bewertungsquellen",
    reviewSourcesText: "Google-, Tripadvisor-, Yandex- und HolidayCheck-Bewertungen in einer Ansicht sammeln.",
    reviewScheduleTitle: "Scan-Zeitplan",
    reviewScheduleDaily: "Standard-Scan: 00:00, 08:00, 16:00",
    reviewScheduleLow: "1-4 Sterne Überwachung: alle 15 Minuten",
    reviewAlertRecipients: "Empfänger: Guest-Relations-Manager, stv. Guest-Relations-Manager und Guest-Relations-Chef",
    reviewSourceUrl: "Quell-URL",
    reviewSourceSave: "Quellen speichern",
    reviewSourceSaved: "Bewertungsquellen gespeichert.",
    reviewSyncButton: "Bewertungen synchronisieren",
    reviewSyncing: "Quellen werden geprüft...",
    reviewSyncDone: "{count} Bewertungen importiert.",
    reviewSourceLastSync: "Letzte Synchronisierung",
    reviewScanLogTitle: "Scan-Protokolle",
    reviewScanStatus: "Scan-Status",
    reviewScanCount: "Gefundene Bewertungen",
    reviewMatchedAssistant: "Zugeordnete Assistenz",
    reviewImported: "Automatisch",
    criticalReviewOpsTitle: "Kritische Bewertungszentrale",
    criticalReviewOpsText: "Bewertungen mit 1-4 Punkten, automatische Alarme und Aktionen an einem Ort steuern.",
    criticalReviewAlerts: "Aktiver Alarm",
    criticalReviewTasks: "Erstellte Aufgabe",
    criticalReviewCreateTask: "Aufgabe erstellen",
    criticalReviewTaskCreated: "Aufgabe fuer kritische Bewertung erstellt.",
    criticalReviewAssign: "Zugewiesen an",
    criticalReviewState: "Operationsstatus",
    criticalReviewStates: {
      alerted: "Alarmiert",
      assigned: "Zugewiesen",
      inProgress: "In Bearbeitung",
      replied: "Beantwortet",
      closed: "Geschlossen",
    },
    criticalReviewNote: "Interne Notiz",
    criticalReviewReplyTo: "Beantwortet an",
    criticalReviewDeadline: "Frist",
    criticalReviewResolution: "Loesungszusammenfassung",
    criticalReviewScheduledScan: "Geplanter Scan",
    criticalReviewRapidScan: "15-Minuten-Ueberwachung",
    addMeetingTitle: "Face-to-Face-Gespräch hinzufügen",
    addReviewTitle: "Bewertung hinzufügen",
    followUpWaiting: "Offene Nachverfolgung",
    lowReviewCount: "Schwach bewertete Rezensionen",
    ftfCountLabel: "FTF-Einträge",
    leaderAssistant: "Top-Assistent",
    todayMeetingCount: "Heutige Gespräche",
    reviewOpenCount: "Offene Bewertungen",
    customerNameLabel: "Kundenname",
    contactLabel: "Telefon",
    topicLabel: "Gesprächsthema",
    tagCodeLabel: "Code / Tag",
    resultLabel: "Ergebnis",
    followUpDateLabel: "Nachverfolgungsdatum",
    assignedAssistantLabel: "Zugewiesener Assistent",
    saveMeeting: "Gespräch speichern",
    platformLabel: "Plattform",
    ratingLabel: "Bewertung",
    authorLabel: "Verfasser",
    branchLabel: "Standort oder Betrieb",
    contentLabel: "Bewertungstext",
    reviewContentPlaceholder: "Geben Sie hier den Bewertungstext oder das Gästefeedback ein.",
    saveReview: "Bewertung speichern",
    searchMeeting: "Kunde oder Thema suchen",
    searchReview: "Plattform, Standort oder Person suchen",
    passwordChangeTitle: "Neues Passwort festlegen",
    passwordChangeText: "Aus Sicherheitsgründen müssen Sie Ihr persönliches Passwort beim ersten Login aktualisieren.",
    newPasswordRequiredLabel: "Neues Passwort",
    confirmPasswordLabel: "Neues Passwort bestätigen",
    saveNewPassword: "Passwort speichern",
    passwordChangeMismatch: "Die neuen Passwortfelder müssen übereinstimmen.",
    passwordChangeLength: "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
    passwordChangeError: "Das Passwort konnte nicht aktualisiert werden.",
    passwordChangeSuccess: "Ihr Passwort wurde aktualisiert.",
    accessNoteAssistant:
      "Assistentenkonten können nur auf Dashboard, Beschwerden und erlaubte externe Module zugreifen.",
    accessNoteDepartmentManager:
      "Abteilungsleiter sehen nur Daten ihrer eigenen Abteilung und verwalten nur abteilungsbezogene Einträge.",
    accessNoteFull: "Diese Rolle kann auf alle Register und alle Live-Module zugreifen.",
    statuses: {
      "Not Started": "Nicht begonnen",
      Planned: "Geplant",
      "In Progress": "In Bearbeitung",
      Done: "Erledigt",
      Open: "Offen",
      "In Review": "In Prüfung",
      Resolved: "Gelöst",
    },
    priorities: { Low: "Niedrig", Medium: "Mittel", High: "Hoch", Critical: "Kritisch" },
    taskTypes: { daily: "Täglich", periodic: "Periodisch" },
    departments: {
      guestRelations: "Gästebetreuung",
      operations: "Betrieb",
      housekeeping: "Housekeeping",
      fb: "F&B",
      technical: "Technik",
      security: "Sicherheit",
      entertainment: "Entertainment",
      frontOffice: "Rezeption",
      sales: "Vertrieb",
      humanResources: "Personal",
      finance: "Finanzen",
      purchasing: "Einkauf",
      quality: "Qualität",
      spa: "SPA",
      management: "Management",
    },
    channels: {
      frontDesk: "Rezeption",
      whatsapp: "WhatsApp",
      voyageAssistant: "Voyage Assistant",
      callCenter: "Callcenter",
    },
    categories: {
      roomCleanliness: "Zimmerreinigung",
      housekeepingDelay: "Reinigungsverzögerung",
      amenitiesMissing: "Fehlende Amenities",
      laundryIssue: "Wäscherei- / Wäscheproblem",
      minibarMissing: "Minibar-Nachfüllung",
      balconyCleaning: "Balkonreinigung",
      dinnerService: "Abendservice",
      breakfastService: "Frühstücksservice",
      barService: "Barservice",
      allergyRequest: "Allergie- / Sondermenüanfrage",
      serviceTemperature: "Speisetemperatur",
      hostDelay: "Empfangs- / Reservierungsdesk-Verzögerung",
      acIssue: "Klimaanlagenproblem",
      plumbingIssue: "Sanitärproblem",
      wifiIssue: "WLAN-Problem",
      lightingIssue: "Beleuchtungsproblem",
      tvIssue: "TV- / Signalproblem",
      hotWaterIssue: "Warmwasserproblem",
      noiseCorridor: "Flurlärm",
      noiseEntertainment: "Unterhaltungslärm",
      securityIncident: "Sicherheitsvorfall",
      lostItem: "Fund- / Verlustsache",
      poolSafety: "Poolsicherheitsproblem",
      unauthorizedAccess: "Unbefugter Zugang",
      checkInDelay: "Check-in-Verzögerung",
      billingIssue: "Rechnungsproblem",
      roomAllocation: "Zimmerzuteilungsproblem",
      lateCheckout: "Late-Check-out-Anfrage",
      keyCardIssue: "Schlüsselkarte funktioniert nicht",
      luggageDelay: "Gepäckverzögerung",
      guestRelationsFollowUp: "Gästerückmeldung",
      vipHandling: "VIP-Betreuung",
      feedbackResponse: "Feedback-Antwort",
      transferRequest: "Transferanfrage",
      compensationRequest: "Kulanz- / Entschädigungsanfrage",
      loyaltyIssue: "Treueprogramm-Anfrage",
      spaService: "SPA-Service",
      appointmentDelay: "Terminverzögerung",
      cleanlinessSpa: "SPA-Sauberkeit",
      therapistRequest: "Therapeutenanfrage",
      therapistAvailability: "Therapeutenverfügbarkeit",
      treatmentQuality: "Behandlungsqualität",
      showQuality: "Showqualität",
      activityPlanning: "Aktivitätsplanung",
      musicVolume: "Musiklautstärke",
      kidsClubIssue: "Kinderclub-Aktivität",
      stageSoundIssue: "Bühnensound",
      activityCapacity: "Kapazitätsproblem bei Aktivität",
    },
    taskTitles: {
      vipArrivalPreparation: "Vorbereitung auf VIP-Ankunft",
      weeklyTeamBriefingPlan: "Plan für das wöchentliche Teambriefing",
      complaintFollowUpBacklogCleanup: "Bereinigung des Beschwerde-Rückstands",
    },
    taskNotes: {
      vipArrivalPreparation:
        "Willkommenskarte, Zimmerprüfung und Bestätigung der Annehmlichkeiten.",
      weeklyTeamBriefingPlan:
        "Serviceablauf, Beschwerdemanagement und Upsell-Erinnerungen aufnehmen.",
      complaintFollowUpBacklogCleanup:
        "Ungelöste Fälle prüfen, die älter als 48 Stunden sind.",
    },
    complaintSummaries: {
      roomCleaningDelayed: "Die Zimmerreinigung hat sich verspätet.",
      dinnerServiceComplaint: "Beschwerde über die Qualität des Abendservices.",
      acIssue: "Die Klimaanlage funktioniert nicht richtig.",
      corridorNoise: "Spätabends Lärm auf dem Flur.",
    },
  },
  ru: {
    appTitle: "365 Дневник",
    languageLabel: "Язык",
    hotelOperationsPwa: "PWA Voyage Kundu для операций",
    heroTitle: "Управление задачами, планированием и жалобами",
    heroDescription:
      "Единая ссылка входа, ролевой доступ, отслеживание жалоб и быстрый доступ к операционным модулям Voyage Kundu.",
    overallProgress: "Общий прогресс",
    openComplaints: "Открытые жалобы",
    totalTasks: "Всего задач",
    totalTasksSub: "Все рабочие элементы",
    activeTasks: "Активные задачи",
    activeTasksSub: "Сейчас в работе",
    resolvedComplaints: "Решенные жалобы",
    resolvedComplaintsSub: "Успешно закрыты",
    criticalComplaints: "Критические жалобы",
    criticalComplaintsSub: "Требуют немедленного внимания",
    sections: "Разделы",
    dashboard: "Панель",
    tasksTab: "Задачи и планирование",
    complaintsTab: "Жалобы",
    analysis: "Аналитика",
    alacarteTab: "Ala Carte",
    assistantTrackerTab: "FTF и Hall of Fame",
    criticalReviewOpsTab: "Критические отзывы",
    ordersTab: "Заказы",
    managerAgendaTab: "365-дневная повестка",
    permissionsTab: "Права",
    managerOpsTab: "Действия менеджера",
    todayFocus: "Фокус на сегодня и период",
    toggleDone: "Сменить статус",
    unassigned: "Не назначено",
    noDate: "Нет даты",
    planningSummary: "Сводка планирования",
    dailyTasks: "Ежедневные задачи",
    completedTasks: "Выполненные задачи",
    todoPlanningBoard: "Доска задач и планирования",
    searchTask: "Поиск задачи",
    allTypes: "Все типы",
    allTaskStatuses: "Все статусы задач",
    taskStatusFilter: "Статус задачи",
    daily: "Ежедневно",
    periodic: "Периодически",
    duePrefix: "Срок",
    notSet: "Не задан",
    done: "Выполнено",
    progress: "Прогресс",
    addNewTask: "Добавить новую задачу",
    taskTitle: "Название задачи",
    taskTitlePlaceholder: "Например: проверить журнал жалоб гостей",
    type: "Тип",
    priority: "Приоритет",
    department: "Отдел",
    owner: "Ответственный",
    dueDate: "Срок",
    notes: "Заметки",
    notesPlaceholder: "Укажите детали задачи, контекст или дополнительные заметки.",
    addTask: "Добавить задачу",
    ordersTitle: "Заказы",
    ordersText: "Управляйте заказами фруктовой корзины, торта и особыми запросами по номеру комнаты.",
    fruitWine: "Фруктовая корзина и вино",
    cake: "Торт",
    roomDecoration: "Украшение номера",
    specialRequest: "Особый запрос",
    roomNumberFixed: "Номер комнаты",
    addOrder: "Добавить заказ",
    saveOrders: "Сохранить заказы",
    exportOrders: "Выгрузить заказы",
    printOrders: "Печать",
    ordersSaved: "Список заказов сохранен.",
    ordersExported: "Список заказов выгружен.",
    ordersPrinted: "Лист заказов подготовлен к печати.",
    saveList: "Сохранить список",
    exportList: "Выгрузить",
    tasksSaved: "Список задач сохранен.",
    tasksExported: "Список задач выгружен.",
    complaintsSaved: "Список жалоб сохранен.",
    complaintsExported: "Список жалоб выгружен.",
    alaCarteSaved: "Списки Ala Carte сохранены.",
    alaCarteExported: "Списки Ala Carte выгружены.",
    complaintTracking: "Отслеживание жалоб",
    searchComplaint: "Поиск жалобы",
    allStatuses: "Все статусы",
    allSeverities: "Все уровни",
    allDepartments: "Все отделы",
    allComplaintCategories: "Все категории",
    allChannels: "Все каналы",
    complaintDepartmentFilter: "Отдел жалобы",
    complaintSeverityFilter: "Уровень жалобы",
    complaintChannelFilter: "Канал жалобы",
    addComplaint: "Добавить жалобу",
    guestOrCase: "Гость / Случай",
    category: "Категория",
    severity: "Уровень",
    channel: "Канал",
    date: "Дата",
    summary: "Краткое описание",
    summaryPlaceholder: "Кратко опишите жалобу и ожидаемое действие.",
    complaintCategories: "Категории жалоб",
    complaintStatusDistribution: "Распределение статусов жалоб",
    totalComplaints: "Всего жалоб",
    openRatio: "Доля открытых",
    resolutionRatio: "Доля решенных",
    voyageModules: "Модули Voyage",
    voyageModulesText: "Внутренние операционные панели с фильтрацией по роли пользователя.",
    runtimeLabel: "Режим работы",
    runtimeText: "Внутренняя операционная модель с разграничением по ролям. Нет внешней зависимости от живых страниц бронирования.",
    internalPanel: "Внутренняя панель",
    panelReady: "Готово",
    openPanel: "Открыть панель",
    modulePreviewTitle: "Сводка модуля",
    modulePreviewEmpty: "Здесь появится нужная операционная сводка после выбора модуля.",
    moduleGoto: "Перейти в раздел",
    moduleTargets: {
      guest: "Сводка панели, поток задач и гостевые операции",
      settings: "Экран прав доступа и управленческих настроек",
      assistant: "Экран жалоб и маршрутизации гостей",
      assistantTracker: "Очные встречи, ручные отзывы и экран Hall of Fame",
    },
    modules: {
      guest: { title: "Гостевой опыт", text: "Внутренний системный блок для потоков гостя, расписаний и правил бронирования." },
      settings: { title: "Управленческие настройки", text: "Внутренний админ-модуль для контента, команд, связок и операционных правил." },
      assistant: { title: "Операции ассистента", text: "Внутренний сервисный блок для выбора номера, маршрутизации и гостевого чата." },
      assistantTracker: { title: "Модуль трекинга ассистентов", text: "Очные встречи, ручные отзывы, FTF-отслеживание и Hall of Fame теперь работают внутри приложения." },
    },
    roles: { admin: "Админ", manager: "Генеральный менеджер", deputy: "Заместитель генерального менеджера", chief: "Операционный менеджер", assistant: "Ассистент", departmentManager: "Руководитель отдела" },
    loginTitle: "Единая панель входа",
    loginText:
      "Вход выполняется по общему коду доступа и паролю пользователя. Для админ-доступа отображается только должность; имена остаются видимыми только у ассистентов.",
    selectUser: "Выберите пользователя",
    accessCodeLabel: "Главный код входа",
    accessCodePlaceholder: "Введите общий код входа",
    passwordLabel: "Пароль",
    passwordPlaceholder: "Введите пароль",
    signIn: "Войти",
    authFailed: "Неверный код входа или пароль пользователя.",
    signedInAs: "Вошел как",
    signOut: "Выйти",
    limitedAccess: "Ограниченный доступ",
    fullAccess: "Полный доступ",
    auditTitle: "Панель действий менеджера",
    auditText: "Только менеджер видит, кто и что сделал.",
    auditEmpty: "Записей пока нет.",
    auditUser: "Пользователь",
    auditAction: "Действие",
    auditTime: "Время",
    actionLogin: "Вошел",
    actionLogout: "Вышел",
    actionTab: "Открыл вкладку",
    actionTaskAdded: "Добавил задачу",
    actionComplaintAdded: "Добавил жалобу",
    actionTaskToggled: "Изменил статус задачи",
    actionModuleOpened: "Проверил внутренний модуль",
    actionPermissionUpdated: "Обновил права",
    actionAlaCarteAdded: "Добавил площадку ala carte",
    actionAlaCarteToggled: "Изменил статус ala carte",
    actionAlaCartePriceUpdated: "Обновил цену ala carte",
    actionAgendaAdded: "Добавил запись в повестку",
    actionAgendaToggled: "Изменил статус повестки",
    agendaTitle: "365-дневная повестка менеджера",
    agendaText: "Ежедневные операции, контроль задач и критичные дела на следующий день в одной вкладке.",
    calendar365Title: "Календарь на 365 дней",
    dailyAgendaTitle: "Контроль задач на сегодня",
    nextDayAgendaTitle: "Критичные задачи на следующий день",
    allUpcomingTitle: "Предстоящие записи",
    agendaAddTitle: "Добавить задачу в повестку",
    agendaTaskTitle: "Название задачи",
    agendaTaskDate: "Дата задачи",
    agendaTaskOwner: "Ответственный",
    agendaTaskPriority: "Уровень важности",
    agendaTaskContext: "Операционная заметка",
    agendaTaskContextPlaceholder: "Опишите, почему эта задача важна и что нужно проконтролировать.",
    addAgendaTask: "Добавить задачу",
    noAgendaToday: "На сегодня записей нет.",
    noAgendaTomorrow: "На завтра критичных задач не задано.",
    noAgendaUpcoming: "Нет предстоящих записей.",
    trackedItems: "Записи под контролем",
    monthlyLoad: "Нагрузка месяца",
    criticalFocus: "Критический фокус",
    nextSevenDays: "Вид на 7 дней",
    complaintValidation: "Чтобы добавить жалобу, заполните поля гость/случай и краткое описание.",
    alaCarteTitle: "Панель Ala Carte",
    alaCarteText:
      "Внутренняя система бронирования и сервиса без зависимости от внешних ссылок.",
    alaCarteSystemTitle: "Система Ala Carte",
    alaCarteSystemText:
      "Управление площадками, слотами сервиса, ценой, загрузкой и правилами в одной панели.",
    addVenue: "Добавить площадку",
    venueName: "Название площадки",
    serviceDemand: "Спрос",
    occupancy: "Заполняемость",
    slotCount: "Сервисные слоты",
    updatePrice: "Обновить цену",
    quickRules: "Быстрые правила",
    activeVenues: "Активные площадки",
    alaCarteRestaurants: "Рестораны A'la Carte",
    cuisine: "Кухня",
    activeStatus: "Статус",
    openTime: "Открытие",
    lastArrival: "Последний приход",
    coverPrice: "Цена на гостя",
    maxGuests: "Макс. гостей",
    childPolicy: "Детская политика",
    cancellationWindow: "Окно отмены",
    closeSaleWindow: "Закрытие продаж",
    workingDays: "Рабочие дни",
    roomNightLimit: "Лимит номер/ночь",
    includeOtherRooms: "Включать другие номера",
    tableSetup: "Конфигурация столов",
    areaPreference: "Предпочтение зоны",
    mixedTable: "Смешанная посадка",
    operationalNote: "Операционная заметка",
    operationalNotePlaceholder: "Введите короткую заметку, которую должна увидеть операционная команда.",
    active: "Активен",
    passive: "Пассивен",
    yes: "Да",
    no: "Нет",
    weekdaysShort: { Mon: "Пн", Tue: "Вт", Wed: "Ср", Thu: "Чт", Fri: "Пт", Sat: "Сб", Sun: "Вс" },
    reservationClosedDayError: "Выбранный ресторан закрыт в этот день. Бронирование создать нельзя.",
    slotClosedDayError: "Выбранный ресторан не работает в этот день. Сервисный слот добавить нельзя.",
    permissionTitle: "Управление правами",
    permissionText:
      "Все доступы к вкладкам и панелям вне системы ассистента здесь может открывать или закрывать только администратор.",
    permissionScopeNote: "Система ассистента и FTF остаются фиксированными; все остальные права управляются только администратором.",
    departmentPermissionTitle: "Права пользователей по отделам",
    departmentPermissionText: "Администратор управляет всеми пользователями. Остальные менеджеры могут менять права только пользователям своего отдела.",
    noDepartmentPermissionUsers: "В этой области нет пользователей, которыми вы можете управлять.",
    accountRoleLabel: "Роль аккаунта",
    userAdminTitle: "Управление пользователями администратора",
    userAdminText: "Администратор может менять отображаемое имя любого пользователя и назначать новый пароль. Внутри админ-панели дополнительный пароль не требуется.",
    accountTitle: "Аккаунт",
    displayNameLabel: "Отображаемое имя",
    newPasswordLabel: "Новый пароль",
    newPasswordPlaceholder: "Оставьте пустым, чтобы не менять пароль",
    saveUserSettings: "Обновить пользователя",
    userUpdateSuccess: "Данные пользователя обновлены.",
    userUpdateError: "Не удалось обновить данные пользователя.",
    notificationsTitle: "Уведомления отдела",
    notificationsText: "Здесь отображаются только уведомления, назначенные вашему отделу. Если разрешить доступ, вы также будете получать мгновенные веб-уведомления на телефоне.",
    noNotifications: "Сейчас для вас нет назначенных уведомлений.",
    unreadNotifications: "Непрочитанные уведомления",
    allowNotifications: "Разрешить уведомления",
    markAsRead: "Отметить как прочитанное",
    notificationComplaintTitle: "Новый отзыв для отдела",
    ftfStatsTitle: "Сводка трекинга ассистентов",
    ftfLeaderboardTitle: "Hall of Fame",
    ftfMeetingsTitle: "Список FTF",
    ftfReviewsTitle: "Список отзывов",
    reviewSourcesTitle: "Источники отзывов",
    reviewSourcesText: "Собирайте отзывы из Google, Tripadvisor, Yandex и HolidayCheck на одном экране.",
    reviewScheduleTitle: "Расписание сканирования",
    reviewScheduleDaily: "Стандартное сканирование: 00:00, 08:00, 16:00",
    reviewScheduleLow: "Контроль отзывов 1-4 балла: каждые 15 минут",
    reviewAlertRecipients: "Получатели: менеджер guest relations, заместитель менеджера guest relations и шеф guest relations",
    reviewSourceUrl: "URL источника",
    reviewSourceSave: "Сохранить источники",
    reviewSourceSaved: "Источники отзывов сохранены.",
    reviewSyncButton: "Синхронизировать отзывы",
    reviewSyncing: "Проверяем источники...",
    reviewSyncDone: "Импортировано отзывов: {count}.",
    reviewSourceLastSync: "Последняя синхронизация",
    reviewScanLogTitle: "Логи сканирования",
    reviewScanStatus: "Статус сканирования",
    reviewScanCount: "Найдено отзывов",
    reviewMatchedAssistant: "Назначенный ассистент",
    reviewImported: "Авто",
    criticalReviewOpsTitle: "Панель критических отзывов",
    criticalReviewOpsText: "Управляйте отзывами с оценкой 1-4, автоматическими алертами и созданными действиями в одном месте.",
    criticalReviewAlerts: "Активный алерт",
    criticalReviewTasks: "Созданная задача",
    criticalReviewCreateTask: "Создать задачу",
    criticalReviewTaskCreated: "Задача по критическому отзыву создана.",
    criticalReviewAssign: "Назначено",
    criticalReviewState: "Статус операции",
    criticalReviewStates: {
      alerted: "Алерт создан",
      assigned: "Назначено",
      inProgress: "В работе",
      replied: "Ответ дан",
      closed: "Закрыто",
    },
    criticalReviewNote: "Внутренняя заметка",
    criticalReviewReplyTo: "Ответ дан кому",
    criticalReviewDeadline: "Срок",
    criticalReviewResolution: "Итог решения",
    criticalReviewScheduledScan: "Плановое сканирование",
    criticalReviewRapidScan: "Контроль каждые 15 минут",
    addMeetingTitle: "Добавить очную встречу",
    addReviewTitle: "Добавить отзыв",
    followUpWaiting: "Ожидают сопровождения",
    lowReviewCount: "Низкие оценки",
    ftfCountLabel: "FTF записи",
    leaderAssistant: "Лидер среди ассистентов",
    todayMeetingCount: "Встречи сегодня",
    reviewOpenCount: "Открытые отзывы",
    customerNameLabel: "Имя клиента",
    contactLabel: "Телефон",
    topicLabel: "Тема встречи",
    tagCodeLabel: "Код / тег",
    resultLabel: "Результат",
    followUpDateLabel: "Дата сопровождения",
    assignedAssistantLabel: "Назначенный ассистент",
    saveMeeting: "Сохранить встречу",
    platformLabel: "Платформа",
    ratingLabel: "Оценка",
    authorLabel: "Автор отзыва",
    branchLabel: "Филиал или площадка",
    contentLabel: "Текст отзыва",
    reviewContentPlaceholder: "Введите текст отзыва или обратную связь гостя.",
    saveReview: "Сохранить отзыв",
    searchMeeting: "Поиск по клиенту или теме",
    searchReview: "Поиск по платформе, филиалу или человеку",
    passwordChangeTitle: "Задайте новый пароль",
    passwordChangeText: "Для безопасности при первом входе нужно обновить личный пароль.",
    newPasswordRequiredLabel: "Новый пароль",
    confirmPasswordLabel: "Повторите новый пароль",
    saveNewPassword: "Сохранить пароль",
    passwordChangeMismatch: "Поля нового пароля должны совпадать.",
    passwordChangeLength: "Новый пароль должен содержать не менее 8 символов.",
    passwordChangeError: "Не удалось обновить пароль.",
    passwordChangeSuccess: "Пароль обновлен.",
    accessNoteAssistant:
      "Аккаунт ассистента может работать только с панелью, жалобами и разрешенными внешними модулями.",
    accessNoteDepartmentManager:
      "Руководитель отдела видит только данные своего отдела и управляет только записями своего отдела.",
    accessNoteFull: "Эта роль может использовать все вкладки и все живые модули.",
    statuses: {
      "Not Started": "Не начато",
      Planned: "Запланировано",
      "In Progress": "В процессе",
      Done: "Выполнено",
      Open: "Открыто",
      "In Review": "На рассмотрении",
      Resolved: "Решено",
    },
    priorities: { Low: "Низкий", Medium: "Средний", High: "Высокий", Critical: "Критический" },
    taskTypes: { daily: "Ежедневно", periodic: "Периодически" },
    departments: {
      guestRelations: "Работа с гостями",
      operations: "Операции",
      housekeeping: "Хаускипинг",
      fb: "Питание и напитки",
      technical: "Технический отдел",
      security: "Безопасность",
      entertainment: "Анимация",
      frontOffice: "Ресепшен",
      sales: "Продажи",
      humanResources: "Кадры",
      finance: "Финансы",
      purchasing: "Закупки",
      quality: "Качество",
      spa: "SPA",
      management: "Менеджмент",
    },
    channels: {
      frontDesk: "Стойка регистрации",
      whatsapp: "WhatsApp",
      voyageAssistant: "Voyage Assistant",
      callCenter: "Колл-центр",
    },
    categories: {
      roomCleanliness: "Чистота номера",
      housekeepingDelay: "Задержка уборки",
      amenitiesMissing: "Отсутствуют принадлежности",
      laundryIssue: "Проблема с бельем",
      minibarMissing: "Проблема с пополнением мини-бара",
      balconyCleaning: "Уборка балкона",
      dinnerService: "Ужин",
      breakfastService: "Завтрак",
      barService: "Бар",
      allergyRequest: "Аллерген / спецменю",
      serviceTemperature: "Температура блюда",
      hostDelay: "Задержка на стойке резерваций",
      acIssue: "Проблема с кондиционером",
      plumbingIssue: "Проблема с сантехникой",
      wifiIssue: "Проблема с Wi‑Fi",
      lightingIssue: "Проблема с освещением",
      tvIssue: "Проблема с ТВ / сигналом",
      hotWaterIssue: "Проблема с горячей водой",
      noiseCorridor: "Шум в коридоре",
      noiseEntertainment: "Шум от развлечений",
      securityIncident: "Инцидент безопасности",
      lostItem: "Потерянная вещь",
      poolSafety: "Проблема безопасности бассейна",
      unauthorizedAccess: "Несанкционированный доступ",
      checkInDelay: "Задержка check-in",
      billingIssue: "Проблема со счетом",
      roomAllocation: "Проблема с размещением",
      lateCheckout: "Запрос на поздний выезд",
      keyCardIssue: "Проблема с ключ-картой",
      luggageDelay: "Задержка багажа",
      guestRelationsFollowUp: "Обратная связь от гостей",
      vipHandling: "Обслуживание VIP",
      feedbackResponse: "Ответ на отзыв",
      transferRequest: "Трансферный запрос",
      compensationRequest: "Запрос на компенсацию",
      loyaltyIssue: "Запрос по программе лояльности",
      spaService: "SPA-услуга",
      appointmentDelay: "Задержка записи",
      cleanlinessSpa: "Чистота SPA",
      therapistRequest: "Запрос на терапевта",
      therapistAvailability: "Доступность терапевта",
      treatmentQuality: "Качество процедуры",
      showQuality: "Качество шоу",
      activityPlanning: "Планирование активностей",
      musicVolume: "Громкость музыки",
      kidsClubIssue: "Детский клуб / активность",
      stageSoundIssue: "Проблема со звуком сцены",
      activityCapacity: "Переполненность активности",
    },
    taskTitles: {
      vipArrivalPreparation: "Подготовка к прибытию VIP-гостя",
      weeklyTeamBriefingPlan: "План еженедельного командного брифинга",
      complaintFollowUpBacklogCleanup: "Очистка накопившихся жалоб на контроле",
    },
    taskNotes: {
      vipArrivalPreparation:
        "Приветственная карточка, проверка номера и подтверждение комплиментов.",
      weeklyTeamBriefingPlan:
        "Добавить сервисный поток, работу с недовольством гостей и напоминания об upsell.",
      complaintFollowUpBacklogCleanup: "Проверить нерешенные обращения старше 48 часов.",
    },
    complaintSummaries: {
      roomCleaningDelayed: "Уборка номера была задержана.",
      dinnerServiceComplaint: "Жалоба на качество обслуживания на ужине.",
      acIssue: "Кондиционер работает некорректно.",
      corridorNoise: "Шум в коридоре поздно вечером.",
    },
  },
};

const initialTasks = [
  { id: 1, titleKey: "vipArrivalPreparation", type: "daily", department: "guestRelations", owner: "Denizcan", dueDate: "2026-03-10", priority: "High", status: "In Progress", progress: 60, notesKey: "vipArrivalPreparation" },
  { id: 2, titleKey: "weeklyTeamBriefingPlan", type: "periodic", department: "operations", owner: "Shift Leader", dueDate: "2026-03-14", priority: "Medium", status: "Planned", progress: 25, notesKey: "weeklyTeamBriefingPlan" },
  { id: 3, titleKey: "complaintFollowUpBacklogCleanup", type: "periodic", department: "guestRelations", owner: "Jiska Team", dueDate: "2026-03-16", priority: "High", status: "Not Started", progress: 0, notesKey: "complaintFollowUpBacklogCleanup" },
];

const initialComplaints = [
  { id: 1, guest: "Müller Family", category: "roomCleanliness", severity: "Medium", status: "Resolved", channel: "frontDesk", date: "2026-03-08", department: "housekeeping", summaryKey: "roomCleaningDelayed" },
  { id: 2, guest: "Ivan Petrov", category: "dinnerService", severity: "High", status: "Open", channel: "whatsapp", date: "2026-03-09", department: "fb", summaryKey: "dinnerServiceComplaint" },
  { id: 3, guest: "Sarah Collins", category: "acIssue", severity: "Critical", status: "In Review", channel: "voyageAssistant", date: "2026-03-10", department: "technical", summaryKey: "acIssue" },
  { id: 4, guest: "Kaya Suite 2201", category: "noiseCorridor", severity: "Low", status: "Resolved", channel: "callCenter", date: "2026-03-10", department: "security", summaryKey: "corridorNoise" },
  { id: 5, guest: "Maria Hoffmann", category: "keyCardIssue", severity: "Medium", status: "Open", channel: "frontDesk", date: "2026-03-11", department: "frontOffice", summary: "Oda kartı gün içinde iki kez devre dışı kaldı." },
  { id: 6, guest: "Omar Haddad", category: "compensationRequest", severity: "High", status: "In Review", channel: "whatsapp", date: "2026-03-11", department: "guestRelations", summary: "Geciken transfer sonrası jest beklentisini iletti." },
  { id: 7, guest: "Lina Becker", category: "therapistAvailability", severity: "Medium", status: "Open", channel: "callCenter", date: "2026-03-12", department: "spa", summary: "Tercih edilen terapist için uygun slot bulunamadı." },
  { id: 8, guest: "Acar Family", category: "kidsClubIssue", severity: "High", status: "Open", channel: "voyageAssistant", date: "2026-03-12", department: "entertainment", summary: "Mini kulüp etkinlik kapasitesi dolu olduğu için kayıt yapılamadı." },
];

const complaintCategoriesByDepartment = {
  housekeeping: ["roomCleanliness", "housekeepingDelay", "amenitiesMissing", "laundryIssue", "minibarMissing", "balconyCleaning"],
  fb: ["dinnerService", "breakfastService", "barService", "allergyRequest", "serviceTemperature", "hostDelay"],
  technical: ["acIssue", "plumbingIssue", "wifiIssue", "lightingIssue", "tvIssue", "hotWaterIssue"],
  security: ["noiseCorridor", "noiseEntertainment", "securityIncident", "lostItem", "poolSafety", "unauthorizedAccess"],
  frontOffice: ["checkInDelay", "billingIssue", "roomAllocation", "lateCheckout", "keyCardIssue", "luggageDelay"],
  guestRelations: ["guestRelationsFollowUp", "vipHandling", "feedbackResponse", "transferRequest", "compensationRequest", "loyaltyIssue"],
  spa: ["spaService", "appointmentDelay", "cleanlinessSpa", "therapistRequest", "therapistAvailability", "treatmentQuality"],
  entertainment: ["showQuality", "activityPlanning", "musicVolume", "kidsClubIssue", "stageSoundIssue", "activityCapacity"],
};

const initialAgendaItems = [
  { id: 1, title: "VIP arrival briefing approval", date: "2026-03-11", owner: "Gizem", priority: "Critical", note: "Confirm welcome flow, suite readiness and guest relations handoff.", completed: false },
  { id: 2, title: "Housekeeping recovery backlog review", date: "2026-03-11", owner: "Selim", priority: "High", note: "Close delayed cleaning cases before evening report.", completed: false },
  { id: 3, title: "Tomorrow ala carte capacity lock", date: "2026-03-12", owner: "Ece", priority: "Critical", note: "Freeze tomorrow evening allocations and inform assistant routing.", completed: false },
  { id: 4, title: "Technical preventive check for suites", date: "2026-03-12", owner: "Maintenance", priority: "High", note: "Focus on AC and minibar controls for VIP floor.", completed: false },
  { id: 5, title: "Weekly executive summary draft", date: "2026-03-15", owner: "Gizem", priority: "Medium", note: "Prepare service quality and complaint resolution summary.", completed: false },
];

const orderExportSections = ["roomDecoration", "fruitWine", "specialRequest"];

function groupOrdersForDisplay(orders) {
  return {
    roomDecoration: orders.filter((item) => item.type === "roomDecoration"),
    fruitWine: orders.filter((item) => item.type === "fruitWine"),
    specialRequest: orders.filter((item) => item.type === "specialRequest" || item.type === "cake"),
  };
}

const initialOrders = [
  { id: "ord-1", type: "fruitWine", roomNumber: "4102", note: "Kirmizi sarap ve meyve sepeti 18:00 oncesi birakilsin." },
  { id: "ord-2", type: "cake", roomNumber: "2201", note: "Dogum gunu pastasi 20:30 servise hazir olsun." },
  { id: "ord-3", type: "roomDecoration", roomNumber: "5101", note: "Balon ve yatak uzerinde gul yapraklari hazirlansin." },
  { id: "ord-4", type: "specialRequest", roomNumber: "3304", note: "Glutensiz atistirmalik ve ekstra su talebi." },
];

const statusTone = { "Not Started": "tag tag-slate", Planned: "tag tag-blue", "In Progress": "tag tag-amber", Done: "tag tag-green", Open: "tag tag-rose", "In Review": "tag tag-orange", Resolved: "tag tag-green" };
const priorityTone = { Low: "tag tag-slate", Medium: "tag tag-yellow", High: "tag tag-red", Critical: "tag tag-red-strong" };
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
const shiftPlannerLabels = {
  tr: {
    tab: "Shift Planlayıcı",
    title: "Otomatik vardiya planı",
    intro:
      "Ekipleri manuel girin; sistem her ekip için haftalık izin takvimine göre vardiyayı oluştursun ve aynı gün ekipten yalnızca 1 kişi izinli olsun.",
    rulesTitle: "Kural özeti",
    staffingTitle: "Günlük kadro özeti",
    leadershipTitle: "Yönetim vardiyası",
    teamsTitle: "Ekip vardiyaları",
    supportTitle: "Sabit C ve destek",
    teamSetupTitle: "Ekip tanımı",
    teamListTitle: "Kaydedilen ekipler",
    addTeam: "Ekibi ekle",
    editTeam: "Ekibi düzenle",
    doneEditing: "Düzenlemeyi bitir",
    removeTeam: "Ekibi sil",
    saveTeams: "Ekipleri kaydet",
    exportWeek: "Haftalık çıktı al",
    exportMonth: "Aylık çıktı al",
    savedStatus: "Ekip planı kaydedildi.",
    exportStatusWeek: "Haftalık çıktı indirildi.",
    exportStatusMonth: "Aylık çıktı indirildi.",
    teamName: "Ekip adı",
    memberOne: "Asistan 1",
    memberTwo: "Asistan 2",
    memberThree: "Asistan 3",
    leadershipSetupTitle: "Yönetim tanımı",
    fixedOffDay: "Haftalık izin takvimi",
    offPlannerTitle: "Haftalık izin planı",
    offPlannerText: "Her gün için izinli kişi seçin veya izin yok bırakın. Aynı asistan haftada yalnızca 1 kez izinli olabilir.",
    offMemberLabel: "İzinli kişi",
    noOffOption: "İzin yok",
    weeklyCalendarTitle: "Haftalık ekip takvimi",
    offScheduleSummary: "İzin dağılımı",
    compactSummaryTitle: "Haftalık özet",
    teamCount: "Tanımlı ekip",
    emptyState: "Plan üretmek için en az 1 ekip ekleyin.",
    teamValidation: "Ekip adı, 3 asistan ve haftalık izin planı zorunludur.",
    duplicateOffValidation: "Aynı asistan haftada yalnızca 1 kez izinli olabilir.",
    morning: "Sabah",
    evening: "Akşam",
    off: "İzin",
    fixedC: "Sabit C",
    support: "Destek",
    manager: "Müdür",
    deputy: "Müdür Yardımcısı",
    chiefs: "Şefler",
    offTeams: "İzinli ekipler",
    morningCount: "Sabah çalışan asistan",
    eveningCount: "Akşam çalışan asistan",
    offCount: "İzinli asistan",
    fixedOffNote: "Haftalık sabit izin günü",
    eveningCoverNote: "Akşam vardiyası sabah ekibinden kaydırıldı",
    reserveNote: "İzinli ekipler için yedek personel",
    openSupportNote: "İzin olmayan günlerde genel operasyon desteği",
    dayLabels: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
    rules: [
      "30 asistan, 10 ekip x 3 kişi olarak dağıtıldı.",
      "Her ekipte günlük en fazla 1 kişi izinli olabilir.",
      "Her asistan haftada yalnızca 1 kez izinli seçilebilir.",
      "İzinli olmayan ekip üyeleri sabah ve akşam vardiyasına otomatik dağıtılır.",
    ],
  },
  en: {
    tab: "Shift Planner",
    title: "Automatic shift planning",
    intro:
      "Enter teams manually and let the system build shifts from a weekly leave calendar where only 1 person per team is off each day.",
    rulesTitle: "Rules",
    staffingTitle: "Daily staffing snapshot",
    leadershipTitle: "Leadership shift",
    teamsTitle: "Team shifts",
    supportTitle: "Fixed C and support",
    teamSetupTitle: "Team setup",
    teamListTitle: "Saved teams",
    addTeam: "Add team",
    editTeam: "Edit team",
    doneEditing: "Done editing",
    removeTeam: "Delete team",
    saveTeams: "Save teams",
    exportWeek: "Export weekly",
    exportMonth: "Export monthly",
    savedStatus: "Shift teams saved.",
    exportStatusWeek: "Weekly export downloaded.",
    exportStatusMonth: "Monthly export downloaded.",
    teamName: "Team name",
    memberOne: "Assistant 1",
    memberTwo: "Assistant 2",
    memberThree: "Assistant 3",
    leadershipSetupTitle: "Leadership setup",
    fixedOffDay: "Weekly leave calendar",
    offPlannerTitle: "Weekly leave plan",
    offPlannerText: "Choose an off-duty person for each day or leave the day without time off. The same assistant can be off only once per week.",
    offMemberLabel: "Off-duty person",
    noOffOption: "No leave",
    weeklyCalendarTitle: "Weekly team calendar",
    offScheduleSummary: "Leave distribution",
    compactSummaryTitle: "Weekly summary",
    teamCount: "Teams defined",
    emptyState: "Add at least one team to generate the plan.",
    teamValidation: "Team name, 3 assistants and a weekly leave plan are required.",
    duplicateOffValidation: "The same assistant can be off only once per week.",
    morning: "Morning",
    evening: "Evening",
    off: "Off",
    fixedC: "Fixed C",
    support: "Support",
    manager: "Manager",
    deputy: "Deputy Manager",
    chiefs: "Chiefs",
    offTeams: "Teams with off duty",
    morningCount: "Morning assistants",
    eveningCount: "Evening assistants",
    offCount: "Assistants off",
    fixedOffNote: "Fixed weekly off day",
    eveningCoverNote: "Evening assignment was backfilled from morning staff",
    reserveNote: "Reserve coverage for teams on off duty",
    openSupportNote: "General operations support when there is no off duty",
    dayLabels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    rules: [
      "30 assistants are grouped into 10 teams of 3.",
      "Each team can have at most 1 off-duty person per day.",
      "The same assistant can be marked off only once per week.",
      "Available assistants are assigned automatically to morning and evening shifts.",
    ],
  },
  de: {
    tab: "Schichtplaner",
    title: "Automatische Schichtplanung",
    intro:
      "Teams werden manuell erfasst; das System erstellt daraus einen Wochenplan mit einem Wochen-Freikalender, in dem pro Team und Tag nur 1 Person frei sein kann.",
    rulesTitle: "Regeln",
    staffingTitle: "Tägliche Personalübersicht",
    leadershipTitle: "Management-Schicht",
    teamsTitle: "Team-Schichten",
    supportTitle: "Feste C-Kraft und Reserve",
    teamSetupTitle: "Teamdefinition",
    teamListTitle: "Gespeicherte Teams",
    addTeam: "Team hinzufügen",
    editTeam: "Team bearbeiten",
    doneEditing: "Bearbeitung beenden",
    removeTeam: "Team löschen",
    saveTeams: "Teams speichern",
    exportWeek: "Wöchentlich exportieren",
    exportMonth: "Monatlich exportieren",
    savedStatus: "Schichtteams wurden gespeichert.",
    exportStatusWeek: "Wöchentlicher Export wurde heruntergeladen.",
    exportStatusMonth: "Monatlicher Export wurde heruntergeladen.",
    teamName: "Teamname",
    memberOne: "Assistent 1",
    memberTwo: "Assistent 2",
    memberThree: "Assistent 3",
    leadershipSetupTitle: "Management-Team",
    fixedOffDay: "Wöchentlicher Freiplan",
    offPlannerTitle: "Wöchentlicher Freiplan",
    offPlannerText: "Wählen Sie pro Tag eine freie Person oder lassen Sie den Tag ohne Freistellung. Dieselbe Assistenz darf pro Woche nur einmal frei sein.",
    offMemberLabel: "Freie Person",
    noOffOption: "Kein Frei",
    weeklyCalendarTitle: "Wöchentlicher Teamkalender",
    offScheduleSummary: "Verteilung der freien Tage",
    compactSummaryTitle: "Wochenübersicht",
    teamCount: "Definierte Teams",
    emptyState: "Mindestens 1 Team hinzufügen, um den Plan zu erzeugen.",
    teamValidation: "Teamname, 3 Assistenten und ein Wochen-Freiplan sind erforderlich.",
    duplicateOffValidation: "Dieselbe Assistenz darf pro Woche nur einmal frei sein.",
    morning: "Morgen",
    evening: "Abend",
    off: "Frei",
    fixedC: "Feste C-Kraft",
    support: "Reserve",
    manager: "Manager",
    deputy: "Stv. Manager",
    chiefs: "Schichtleiter",
    offTeams: "Teams mit freiem Tag",
    morningCount: "Assistenten morgens",
    eveningCount: "Assistenten abends",
    offCount: "Freie Assistenten",
    fixedOffNote: "Fester freier Tag",
    eveningCoverNote: "Abendschicht wurde aus der Morgenschicht ersetzt",
    reserveNote: "Reserve für Teams mit freiem Tag",
    openSupportNote: "Allgemeine Operations-Unterstützung ohne freien Tag",
    dayLabels: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    rules: [
      "30 Assistenten sind in 10 Teams zu je 3 Personen aufgeteilt.",
      "Pro Team darf täglich höchstens 1 Person frei sein.",
      "Dieselbe Assistenz darf pro Woche nur einmal frei sein.",
      "Verfügbare Assistenten werden automatisch auf Morgen und Abend verteilt.",
    ],
  },
  ru: {
    tab: "План смен",
    title: "Автоматическое планирование смен",
    intro:
      "Введите команды вручную, и система построит недельный график по календарю выходных, где в каждой команде в день может отдыхать только 1 человек.",
    rulesTitle: "Правила",
    staffingTitle: "Ежедневная сводка",
    leadershipTitle: "Смена руководства",
    teamsTitle: "Смены команд",
    supportTitle: "Фиксированный C и резерв",
    teamSetupTitle: "Настройка команд",
    teamListTitle: "Сохраненные команды",
    addTeam: "Добавить команду",
    editTeam: "Редактировать команду",
    doneEditing: "Завершить редактирование",
    removeTeam: "Удалить команду",
    saveTeams: "Сохранить команды",
    exportWeek: "Выгрузить неделю",
    exportMonth: "Выгрузить месяц",
    savedStatus: "Команды смен сохранены.",
    exportStatusWeek: "Недельный файл выгружен.",
    exportStatusMonth: "Месячный файл выгружен.",
    teamName: "Название команды",
    memberOne: "Ассистент 1",
    memberTwo: "Ассистент 2",
    memberThree: "Ассистент 3",
    leadershipSetupTitle: "Настройка руководства",
    fixedOffDay: "Недельный календарь выходных",
    offPlannerTitle: "Недельный план выходных",
    offPlannerText: "Для каждого дня выберите выходного сотрудника или оставьте день без выходного. Один и тот же ассистент может быть выходным только 1 раз в неделю.",
    offMemberLabel: "Выходной сотрудник",
    noOffOption: "Без выходного",
    weeklyCalendarTitle: "Недельный календарь команды",
    offScheduleSummary: "Распределение выходных",
    compactSummaryTitle: "Недельная сводка",
    teamCount: "Команд задано",
    emptyState: "Добавьте хотя бы 1 команду, чтобы построить график.",
    teamValidation: "Нужны название команды, 3 ассистента и недельный план выходных.",
    duplicateOffValidation: "Один и тот же ассистент может быть выходным только 1 раз в неделю.",
    morning: "Утро",
    evening: "Вечер",
    off: "Выходной",
    fixedC: "Фиксированный C",
    support: "Резерв",
    manager: "Менеджер",
    deputy: "Зам. менеджера",
    chiefs: "Шефы",
    offTeams: "Команды с выходным",
    morningCount: "Ассистенты утром",
    eveningCount: "Ассистенты вечером",
    offCount: "Ассистенты на выходном",
    fixedOffNote: "Фиксированный выходной день",
    eveningCoverNote: "Вечерняя смена закрыта сотрудником из утренней смены",
    reserveNote: "Резерв для команд с выходным",
    openSupportNote: "Общая поддержка операций без выходных",
    dayLabels: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
    rules: [
      "30 ассистентов распределены по 10 командам по 3 человека.",
      "В каждой команде в день может быть максимум 1 выходной сотрудник.",
      "Один и тот же ассистент может быть выходным только 1 раз в неделю.",
      "Доступные ассистенты автоматически распределяются на утреннюю и вечернюю смены.",
    ],
  },
};
const shiftWeekStart = "2026-03-16";
const shiftTeamsStorageKey = "shift-planner-teams";
const shiftLeadershipStorageKey = "shift-planner-leadership";
const tasksStorageKey = "task-list-snapshot";
const complaintsStorageKey = "complaint-list-snapshot";
const alaCarteStorageKey = "alacarte-list-snapshot";
const defaultShiftLeadership = {
  manager: {
    name: "Gizem",
    shift: "09:00-17:00",
    weeklyOffDayIndex: 6,
  },
  deputy: {
    name: "Selim",
    shift: "16:00-00:00",
    weeklyOffDayIndex: 5,
  },
  chiefs: [
    { id: "chief-1", name: "Şef 1", shift: "08:00-16:00", weeklyOffDayIndex: 0 },
    { id: "chief-2", name: "Şef 2", shift: "08:00-16:00", weeklyOffDayIndex: 1 },
    { id: "chief-3", name: "Şef 3", shift: "16:00-00:00", weeklyOffDayIndex: 2 },
    { id: "chief-4", name: "Şef 4", shift: "16:00-00:00", weeklyOffDayIndex: 3 },
  ],
};
const defaultShiftTeamForm = {
  name: "",
  offSchedule: ["", "", "", "", "", "", ""],
  members: ["", "", ""],
};

function localizeSeedValue(language, group, value) {
  if (!value) return value;
  return localizedSeedContent[group]?.[value]?.[language] ?? localizedSeedContent[group]?.[value]?.en ?? value;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferAssistantNameFromText(text, assistantNames, fallback = "") {
  const haystack = String(text || "").trim();
  if (!haystack) return fallback;
  const matched = assistantNames.find((name) => new RegExp(`(^|[^\\p{L}])${escapeRegExp(name)}([^\\p{L}]|$)`, "iu").test(haystack));
  return matched ?? fallback;
}

function normalizeOffSchedule(schedule) {
  return Array.isArray(schedule)
    ? schedule.map((value) => (value === "" || value === null || value === undefined ? "" : String(value)))
    : [...defaultShiftTeamForm.offSchedule];
}

function parseOffMemberIndex(value, memberCount) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed >= memberCount) return null;
  return parsed;
}

function hasDuplicateWeeklyOffAssignments(schedule) {
  const counts = new Map();
  normalizeOffSchedule(schedule).forEach((value) => {
    if (value === "") return;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.values()].some((count) => count > 1);
}

function createLeadershipPlanForDay(leadershipConfig, weekDayIndex) {
  return {
    manager: {
      ...leadershipConfig.manager,
      isOff: leadershipConfig.manager.weeklyOffDayIndex === weekDayIndex,
    },
    deputy: {
      ...leadershipConfig.deputy,
      isOff: leadershipConfig.deputy.weeklyOffDayIndex === weekDayIndex,
    },
    chiefs: leadershipConfig.chiefs.map((chief) => ({
      ...chief,
      isOff: chief.weeklyOffDayIndex === weekDayIndex,
    })),
    fixedC: "12:00-20:00",
  };
}

function createShiftPlanForRange(inputTeams, leadershipConfig, startDateString, dayCount) {
  const baseDate = new Date(`${startDateString}T00:00:00`);
  const teams = inputTeams.map((team) => ({
    ...team,
    offSchedule: normalizeOffSchedule(team.offSchedule),
  }));

  const days = Array.from({ length: dayCount }, (_, dayIndex) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + dayIndex);
    const weekDayIndex = (date.getDay() + 6) % 7;

    const teamPlans = teams.map((team, teamIndex) => {
      const offMemberIndex = parseOffMemberIndex(team.offSchedule[weekDayIndex], team.members.length);
      const availableIndices = team.members
        .map((_, memberIndex) => memberIndex)
        .filter((memberIndex) => memberIndex !== offMemberIndex);
      const eveningIndex = availableIndices[(teamIndex + dayIndex) % availableIndices.length];
      const morningMembers = team.members.filter(
        (_, memberIndex) => memberIndex !== offMemberIndex && memberIndex !== eveningIndex,
      );
      const offMember = team.members[offMemberIndex] ?? null;

      return {
        teamId: team.id,
        teamName: team.name,
        morningMembers,
        eveningMember: team.members[eveningIndex],
        offMember,
        offSchedule: team.offSchedule,
      };
    });

    const offTeams = teamPlans.filter((plan) => plan.offMember).map((plan) => plan.teamName);
    const morningCount = teamPlans.reduce((total, plan) => total + plan.morningMembers.length, 0);
    const eveningCount = teamPlans.length;
    const offCount = teamPlans.filter((plan) => plan.offMember).length;

    return {
      dayIndex,
      date: date.toISOString().slice(0, 10),
      teamPlans,
      offTeams,
      stats: {
        morningCount,
        eveningCount,
        offCount,
      },
      leadership: {
        ...createLeadershipPlanForDay(leadershipConfig, weekDayIndex),
        supportTeams: offTeams,
      },
    };
  });

  return { days, teams };
}

function formatShiftOffSummary(team, shiftCopy) {
  const schedule = Array.isArray(team.offSchedule)
    ? team.offSchedule
    : defaultShiftTeamForm.offSchedule;

  const assignedDays = shiftCopy.dayLabels
    .map((dayLabel, dayIndex) => {
      const memberIndex = parseOffMemberIndex(schedule[dayIndex], team.members.length);
      if (memberIndex === null) return null;
      return `${dayLabel}: ${team.members[memberIndex] ?? "-"}`;
    })
    .filter(Boolean);

  return assignedDays.length ? assignedDays.join(" | ") : shiftCopy.noOffOption;
}

function getWeekdayKeyForDate(value) {
  if (!value) return "";
  const dayIndex = new Date(`${value}T00:00:00`).getDay();
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex] ?? "";
}

function createWeeklyShiftPlan(inputTeams, leadershipConfig) {
  return createShiftPlanForRange(inputTeams, leadershipConfig, shiftWeekStart, 7);
}

function createMonthlyShiftPlan(inputTeams, leadershipConfig) {
  const monthStart = `${shiftWeekStart.slice(0, 7)}-01`;
  const [year, month] = shiftWeekStart.split("-").map(Number);
  const dayCount = new Date(year, month, 0).getDate();
  return createShiftPlanForRange(inputTeams, leadershipConfig, monthStart, dayCount);
}

function buildShiftExportRows(plan, shiftCopy) {
  return plan.days.flatMap((day) => {
    const leadershipRows = [
      [
        `${shiftCopy.manager} - ${day.leadership.manager.name}`,
        day.leadership.manager.isOff ? shiftCopy.off : day.leadership.manager.shift,
        `${shiftCopy.fixedOffNote}: ${shiftCopy.dayLabels[day.leadership.manager.weeklyOffDayIndex]}`,
      ],
      [
        `${shiftCopy.deputy} - ${day.leadership.deputy.name}`,
        day.leadership.deputy.isOff ? shiftCopy.off : day.leadership.deputy.shift,
        `${shiftCopy.fixedOffNote}: ${shiftCopy.dayLabels[day.leadership.deputy.weeklyOffDayIndex]}`,
      ],
      ...day.leadership.chiefs.map((chief, chiefIndex) => [
        `${shiftCopy.chiefs} ${chiefIndex + 1} - ${chief.name}`,
        chief.isOff ? shiftCopy.off : chief.shift,
        `${shiftCopy.fixedOffNote}: ${shiftCopy.dayLabels[chief.weeklyOffDayIndex]}`,
      ]),
      [
        shiftCopy.fixedC,
        day.leadership.fixedC,
        day.leadership.supportTeams.length ? `${shiftCopy.support}: ${day.leadership.supportTeams.join(", ")}` : shiftCopy.openSupportNote,
      ],
    ];

    const teamRows = day.teamPlans.map((team) => [
      team.teamName,
      `${shiftCopy.morning}: ${team.morningMembers.join(" / ") || "-"}`,
      `${shiftCopy.evening}: ${team.eveningMember} | ${shiftCopy.off}: ${team.offMember ?? shiftCopy.noOffOption}`,
    ]);

    return [
      [`${shiftCopy.dayLabels[day.dayIndex]} - ${day.date}`, "", ""],
      [shiftCopy.leadershipTitle, "Shift", "Note"],
      ...leadershipRows,
      [shiftCopy.teamsTitle, "", ""],
      ...teamRows,
      ["", "", ""],
    ];
  });
}

function getStoredShiftTeams() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(shiftTeamsStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStoredShiftLeadership() {
  if (typeof window === "undefined") return defaultShiftLeadership;
  try {
    const raw = window.localStorage.getItem(shiftLeadershipStorageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return defaultShiftLeadership;
    return {
      manager: {
        ...defaultShiftLeadership.manager,
        ...(parsed.manager ?? {}),
      },
      deputy: {
        ...defaultShiftLeadership.deputy,
        ...(parsed.deputy ?? {}),
      },
      chiefs: defaultShiftLeadership.chiefs.map((chief, index) => ({
        ...chief,
        ...(Array.isArray(parsed.chiefs) ? parsed.chiefs[index] : null),
      })),
    };
  } catch {
    return defaultShiftLeadership;
  }
}

function getInitialLanguage() {
  const stored = typeof window !== "undefined" ? window.localStorage.getItem("app-language") : null;
  if (stored && languages.includes(stored)) return stored;
  if (typeof navigator === "undefined") return "tr";
  const browserLanguage = navigator.language.slice(0, 2).toLowerCase();
  return languages.includes(browserLanguage) ? browserLanguage : "tr";
}

function getStoredUser() {
  return null;
}

function getStoredLogs() {
  return [];
}

function getStoredPermissions() {
  return defaultRoleAccess;
}

function normalizePermissions(payload) {
  if (!payload) return defaultRoleAccess;
  return Object.fromEntries(
    Object.entries(defaultRoleAccess).map(([role, access]) => {
      const override = payload[role];
      return [role, {
        tabs: Array.isArray(override?.tabs) ? [...new Set([...access.tabs, ...override.tabs])] : access.tabs,
        modules: Array.isArray(override?.modules) ? [...new Set([...access.modules, ...override.modules])] : access.modules,
        showAudit: typeof override?.showAudit === "boolean" ? override.showAudit : access.showAudit,
      }];
    }),
  );
}

function getStoredUserPermissions() {
  return {};
}

function normalizeUserPermissions(payload) {
  return payload ?? {};
}

function mergePermissionAccess(base, override) {
  if (!override) return base;
  return {
    tabs: Array.isArray(override.tabs) ? override.tabs : base.tabs,
    modules: Array.isArray(override.modules) ? override.modules : base.modules,
    showAudit: typeof override.showAudit === "boolean" ? override.showAudit : base.showAudit,
  };
}

function Panel({ children, className = "" }) {
  return <section className={`panel ${className}`.trim()}>{children}</section>;
}

function MetricCard({ title, value, icon, sub, onClick }) {
  const IconComponent = icon;
  return (
    <Panel className={onClick ? "panel-button-wrap" : ""}>
      <button
        type="button"
        className={onClick ? "metric-card metric-card-button" : "metric-card"}
        onClick={onClick}
      >
        <div>
          <p className="eyebrow">{title}</p>
          <p className="metric-value">{value}</p>
          <p className="muted">{sub}</p>
        </div>
        <div className="metric-icon">
          <IconComponent size={20} />
        </div>
      </button>
    </Panel>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

function App() {
  const [userDirectory, setUserDirectory] = useState(users);
  const [language, setLanguage] = useState(getInitialLanguage);
  const [activeTab, setActiveTab] = useState(() => {
    const view = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("view") : null;
    return allowedTabs.includes(view) ? view : "dashboard";
  });
  const loginRoleKey = (user) => user.titleKey ?? user.role;
  const [selectedLoginRole, setSelectedLoginRole] = useState(loginRoleKey(users[0]));
  const [selectedUsername, setSelectedUsername] = useState(users[0].username);
  const [accessCode, setAccessCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");
  const [sessionToken, setSessionToken] = useState(() =>
    (typeof window !== "undefined" ? window.localStorage.getItem("session-token") : "") || "",
  );
  const [authError, setAuthError] = useState("");
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [activityLogs, setActivityLogs] = useState(getStoredLogs);
  const [permissions, setPermissions] = useState(getStoredPermissions);
  const [userPermissions, setUserPermissions] = useState(getStoredUserPermissions);
  const [syncMode, setSyncMode] = useState("connecting");
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [agendaItems, setAgendaItems] = useState(initialAgendaItems);
  const [orders, setOrders] = useState(initialOrders);
  const [alaCarteVenues, setAlaCarteVenues] = useState(initialAlaCarteVenues);
  const [alaCarteReservations, setAlaCarteReservations] = useState(initialAlaCarteReservations);
  const [alaCarteWaitlist, setAlaCarteWaitlist] = useState(initialAlaCarteWaitlist);
  const [alaCarteServiceSlots, setAlaCarteServiceSlots] = useState(initialAlaCarteServiceSlots);
  const [assistantMeetings, setAssistantMeetings] = useState(initialAssistantMeetings);
  const [assistantReviews, setAssistantReviews] = useState(initialAssistantReviews);
  const [reviewSources, setReviewSources] = useState(defaultReviewSources);
  const [reviewScanLogs, setReviewScanLogs] = useState([]);
  const [reviewSchedule, setReviewSchedule] = useState({
    enabled: true,
    dailyTimes: ["00:00", "08:00", "16:00"],
    lowRatingIntervalMinutes: 15,
    lowRatingThreshold: 4,
  });
  const [notifications, setNotifications] = useState([]);
  const [taskSearch, setTaskSearch] = useState("");
  const [complaintSearch, setComplaintSearch] = useState("");
  const [meetingSearch, setMeetingSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [shiftTeams, setShiftTeams] = useState(getStoredShiftTeams);
  const [shiftLeadership, setShiftLeadership] = useState(getStoredShiftLeadership);
  const [shiftTeamForm, setShiftTeamForm] = useState(() => ({ ...defaultShiftTeamForm, members: [...defaultShiftTeamForm.members] }));
  const [editingShiftTeamId, setEditingShiftTeamId] = useState("");
  const [selectedShiftDayIndex, setSelectedShiftDayIndex] = useState(0);
  const [shiftPlannerError, setShiftPlannerError] = useState("");
  const [shiftPlannerStatus, setShiftPlannerStatus] = useState("");
  const [taskListStatus, setTaskListStatus] = useState("");
  const [complaintListStatus, setComplaintListStatus] = useState("");
  const [alaCarteListStatus, setAlaCarteListStatus] = useState("");
  const [ordersStatus, setOrdersStatus] = useState("");
  const [alaCarteFormError, setAlaCarteFormError] = useState("");
  const [reviewSyncStatus, setReviewSyncStatus] = useState("");
  const [isReviewSyncing, setIsReviewSyncing] = useState(false);
  const [reviewSourceStatus, setReviewSourceStatus] = useState("");
  const [criticalReviewOpsStatus, setCriticalReviewOpsStatus] = useState("");
  const [complaintFormError, setComplaintFormError] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState("all");
  const [complaintDepartmentFilter, setComplaintDepartmentFilter] = useState("all");
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState("all");
  const [complaintSeverityFilter, setComplaintSeverityFilter] = useState("all");
  const [complaintChannelFilter, setComplaintChannelFilter] = useState("all");
  const [newTask, setNewTask] = useState({ title: "", type: "daily", department: "guestRelations", owner: "", dueDate: "", priority: "Medium", status: "Planned", progress: 0, notes: "" });
  const [newComplaint, setNewComplaint] = useState({ guest: "", category: "guestRelationsFollowUp", severity: "Medium", status: "Open", channel: "frontDesk", date: "", department: "guestRelations", summary: "" });
  const [newVenue, setNewVenue] = useState({
    name: "",
    cuisine: "Mediterranean",
    openingTime: "19:00",
    lastArrival: "21:30",
    coverPrice: 30,
    maxGuests: 6,
    workingDays: "Mon,Tue,Wed,Thu,Fri,Sat",
    note: "",
  });
  const [selectedVenueId, setSelectedVenueId] = useState(initialAlaCarteVenues[0].id);
  const [venueSettings, setVenueSettings] = useState({
    active: initialAlaCarteVenues[0].active,
    openingTime: initialAlaCarteVenues[0].openingTime,
    lastArrival: initialAlaCarteVenues[0].lastArrival,
    coverPrice: initialAlaCarteVenues[0].coverPrice,
    workingDays: initialAlaCarteVenues[0].workingDays,
    childPolicy: initialAlaCarteVenues[0].childPolicy,
    cancellationWindow: initialAlaCarteVenues[0].cancellationWindow,
    closeSaleWindow: initialAlaCarteVenues[0].closeSaleWindow,
    roomNightLimit: initialAlaCarteVenues[0].roomNightLimit,
    includeOtherRooms: initialAlaCarteVenues[0].includeOtherRooms,
    areaPreference: initialAlaCarteVenues[0].areaPreference,
    mixedTable: initialAlaCarteVenues[0].mixedTable,
    tableSetup: initialAlaCarteVenues[0].tableSetup,
    note: initialAlaCarteVenues[0].note,
  });
  const [newServiceSlot, setNewServiceSlot] = useState({
    venueId: initialAlaCarteVenues[0].id,
    date: "2026-03-12",
    time: "19:00",
    maxCovers: 20,
    waitlistCount: 0,
  });
  const [alaCarteStatusMessage, setAlaCarteStatusMessage] = useState("");
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: "",
    date: "2026-03-11",
    owner: "",
    priority: "High",
    note: "",
  });
  const [newReservation, setNewReservation] = useState({
    venueId: initialAlaCarteVenues[0].id,
    guestName: "",
    roomNumber: "",
    partySize: 2,
    reservationDate: "2026-03-12",
    slotTime: "19:00",
    source: "App",
    status: "Booked",
    note: "",
  });
  const [newWaitlistEntry, setNewWaitlistEntry] = useState({
    venueId: initialAlaCarteVenues[0].id,
    guestName: "",
    roomNumber: "",
    partySize: 2,
    preferredDate: "2026-03-12",
    preferredWindow: "20:00-21:00",
    priority: "Regular",
  });
  const [newOrders, setNewOrders] = useState({
    fruitWine: { roomNumber: "", note: "" },
    cake: { roomNumber: "", note: "" },
    roomDecoration: { roomNumber: "", note: "" },
    specialRequest: { roomNumber: "", note: "" },
  });
  const [newMeeting, setNewMeeting] = useState({
    customerName: "",
    date: "2026-03-12",
    time: "10:00",
    contact: "",
    topic: "",
    tagCode: "FTF",
    result: "Takip gerekli",
    notes: "",
    followUpDate: "2026-03-12",
    owner: "",
    assignedAssistant: "",
  });
  const [newReview, setNewReview] = useState({
    platform: "Google",
    rating: 5,
    author: "",
    date: "2026-03-12",
    branch: "Voyage Kundu",
    content: "",
    status: "Open",
    owner: "",
  });
  const [managedUsername, setManagedUsername] = useState(users[0].username);
  const [managedDisplayName, setManagedDisplayName] = useState(users[0].displayName);
  const [managedPassword, setManagedPassword] = useState("");
  const [managedRole, setManagedRole] = useState(users[0].role);
  const [userAdminStatus, setUserAdminStatus] = useState("");
  const [userAdminError, setUserAdminError] = useState("");
  const notifiedIdsRef = useRef(new Set());
  const hallOfFameAutoScanRef = useRef(false);

  const copy = translations[language];
  const shiftCopy = shiftPlannerLabels[language] ?? shiftPlannerLabels.en;
  const authText = authCopy[language] ?? authCopy.en;
  const diningCopy = alaCarteLabels[language] ?? alaCarteLabels.en;
  const titleCopy = titleLabels[language] ?? titleLabels.en;
  const canManageScopedPermissions = ["manager", "deputy", "chief", "departmentManager"].includes(currentUser?.role ?? "");
  const activeRole = currentUser ? mergePermissionAccess(permissions[currentUser.role], userPermissions[currentUser.username]) : null;
  const scopedDepartment = currentUser?.scopeDepartment ?? null;
  const isDepartmentManager = currentUser?.role === "departmentManager";
  const isAdminUser = currentUser?.role === "admin";
  const canAccessCriticalReviewOps = Boolean(isAdminUser || criticalReviewOpsTitleKeys.has(currentUser?.titleKey ?? ""));
  const availableTabIds = useMemo(
    () => {
      const baseTabs = [
        ...(activeRole?.tabs ?? []),
        ...(activeRole?.modules?.includes("assistantTracker") ? ["assistantTracker"] : []),
        ...(canAccessCriticalReviewOps ? ["criticalReviewOps"] : []),
        ...(isAdminUser ? adminTabs : []),
        ...(!isAdminUser && canManageScopedPermissions ? ["permissions"] : []),
      ]
        .filter((value, index, array) => array.indexOf(value) === index)
        .filter((tabId) => allowedTabs.includes(tabId));

      if (!isDepartmentManager) return baseTabs;

      return baseTabs.filter(
        (tabId) =>
          tabId !== "alacarte" || ["fb", "guestRelations", "frontOffice"].includes(scopedDepartment),
      );
    },
    [activeRole, canAccessCriticalReviewOps, canManageScopedPermissions, isAdminUser, isDepartmentManager, scopedDepartment],
  );
  const tabLabel = (id) =>
    id === "dashboard"
      ? copy.dashboard
      : id === "tasks"
        ? copy.tasksTab
        : id === "complaints"
          ? copy.complaintsTab
          : id === "alacarte"
            ? copy.alacarteTab
            : id === "orders"
              ? copy.ordersTab
            : id === "assistantTracker"
              ? copy.assistantTrackerTab
              : id === "criticalReviewOps"
                ? copy.criticalReviewOpsTab
                : id === "shiftPlanner"
                ? shiftCopy.tab
                : id === "managerAgenda"
                  ? copy.managerAgendaTab
                  : id === "permissions"
                    ? copy.permissionsTab
                    : id === "managerOps"
                      ? copy.managerOpsTab
                      : copy.dashboard;
  const loginRoleOptions = useMemo(
    () =>
      userDirectory.reduce((options, user) => {
        const key = loginRoleKey(user);
        if (options.some((item) => item.key === key)) return options;
        options.push({ key, label: titleCopy[key] ?? copy.roles[key] ?? key });
        return options;
      }, []),
    [copy.roles, titleCopy, userDirectory],
  );
  const filteredLoginUsers = useMemo(
    () => userDirectory.filter((user) => loginRoleKey(user) === selectedLoginRole),
    [selectedLoginRole, userDirectory],
  );
  const managedUsers = useMemo(() => userDirectory, [userDirectory]);
  const managedUser = managedUsers.find((user) => user.username === managedUsername) ?? managedUsers[0] ?? null;
  const scopedPermissionUsers = useMemo(() => {
    if (!currentUser) return [];
    if (isAdminUser) {
      return userDirectory.filter((user) => user.username !== currentUser.username);
    }
    if (!canManageScopedPermissions) return [];
    const ownDepartment = currentUser.scopeDepartment ?? currentUser.department;
    return userDirectory.filter(
      (user) =>
        user.username !== currentUser.username &&
        user.role !== "admin" &&
        (user.scopeDepartment ?? user.department) === ownDepartment,
    );
  }, [canManageScopedPermissions, currentUser, isAdminUser, userDirectory]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.appTitle;
    window.localStorage.setItem("app-language", language);
  }, [copy.appTitle, language]);

  useEffect(() => {
    if (sessionToken) return undefined;
    let ignore = false;

    async function loadLoginCatalog() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/catalog`);
        if (!response.ok) return;
        const payload = await response.json();
        if (!ignore && Array.isArray(payload.users) && payload.users.length) {
          setUserDirectory(payload.users);
        }
      } catch {
        if (!ignore) setUserDirectory(users);
      }
    }

    void loadLoginCatalog();
    return () => {
      ignore = true;
    };
  }, [sessionToken]);

  useEffect(() => {
    if (filteredLoginUsers.some((user) => user.username === selectedUsername)) return;
    if (filteredLoginUsers[0]) setSelectedUsername(filteredLoginUsers[0].username);
  }, [filteredLoginUsers, selectedUsername]);

  useEffect(() => {
    if (!managedUsers.length) return;
    const nextManagedUser = managedUsers.find((user) => user.username === managedUsername) ?? managedUsers[0];
    setManagedUsername(nextManagedUser.username);
    setManagedDisplayName(nextManagedUser.displayName);
    setManagedRole(nextManagedUser.role);
  }, [managedUsername, managedUsers]);

  useEffect(() => {
    if (!alaCarteVenues.length) return;
    const nextVenue = alaCarteVenues.find((item) => item.id === selectedVenueId) ?? alaCarteVenues[0];
    setSelectedVenueId(nextVenue.id);
    setVenueSettings({
      active: nextVenue.active,
      openingTime: nextVenue.openingTime,
      lastArrival: nextVenue.lastArrival,
      coverPrice: nextVenue.coverPrice,
      workingDays: nextVenue.workingDays,
      childPolicy: nextVenue.childPolicy,
      cancellationWindow: nextVenue.cancellationWindow,
      closeSaleWindow: nextVenue.closeSaleWindow,
      roomNightLimit: nextVenue.roomNightLimit,
      includeOtherRooms: nextVenue.includeOtherRooms,
      areaPreference: nextVenue.areaPreference,
      mixedTable: nextVenue.mixedTable,
      tableSetup: nextVenue.tableSetup,
      note: nextVenue.note,
    });
    setNewServiceSlot((current) => ({ ...current, venueId: nextVenue.id }));
  }, [alaCarteVenues, selectedVenueId]);

  useEffect(() => {
    if (!isDepartmentManager || !scopedDepartment) return;
    setNewTask((current) => ({ ...current, department: scopedDepartment }));
    setNewComplaint((current) => ({ ...current, department: scopedDepartment }));
  }, [isDepartmentManager, scopedDepartment]);

  useEffect(() => {
    if (sessionToken) window.localStorage.setItem("session-token", sessionToken);
    else window.localStorage.removeItem("session-token");
  }, [sessionToken]);

  useEffect(() => {
    if (!sessionToken) {
      hallOfFameAutoScanRef.current = false;
    }
  }, [sessionToken]);

  useEffect(() => {
    setShiftPlannerStatus("");
    setTaskListStatus("");
    setComplaintListStatus("");
    setAlaCarteListStatus("");
    setReviewSourceStatus("");
  }, [language]);

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      if (!sessionToken) {
        setBootstrapReady(true);
        setSyncMode("api");
        return;
      }
      try {
        const sessionResponse = await fetch(`${apiBaseUrl}/api/auth/session`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!sessionResponse.ok) throw new Error("session failed");
        const sessionPayload = await sessionResponse.json();
        const response = await fetch(`${apiBaseUrl}/api/bootstrap`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!response.ok) throw new Error("bootstrap failed");
        const payload = await response.json();
        if (ignore) return;
        setCurrentUser(sessionPayload.user);
        if (payload.users?.length) {
          setUserDirectory(payload.users);
        }
        setTasks(payload.tasks?.length ? payload.tasks : initialTasks);
        setComplaints(payload.complaints?.length ? payload.complaints : initialComplaints);
        setAgendaItems(payload.agendaItems?.length ? payload.agendaItems : initialAgendaItems);
        setAlaCarteVenues(payload.alaCarteVenues?.length ? payload.alaCarteVenues : initialAlaCarteVenues);
        setAlaCarteReservations(payload.alaCarteReservations?.length ? payload.alaCarteReservations : initialAlaCarteReservations);
        setAlaCarteWaitlist(payload.alaCarteWaitlist?.length ? payload.alaCarteWaitlist : initialAlaCarteWaitlist);
        setAlaCarteServiceSlots(payload.alaCarteServiceSlots?.length ? payload.alaCarteServiceSlots : initialAlaCarteServiceSlots);
        setOrders(payload.orders?.length ? payload.orders : initialOrders);
        setAssistantMeetings(payload.assistantMeetings?.length ? payload.assistantMeetings : initialAssistantMeetings);
        setAssistantReviews(payload.assistantReviews?.length ? payload.assistantReviews : initialAssistantReviews);
        setReviewSources(payload.reviewSources?.length ? payload.reviewSources : defaultReviewSources);
        setReviewScanLogs(payload.reviewScanLogs ?? []);
        setReviewSchedule(payload.reviewSchedule ?? {
          enabled: true,
          dailyTimes: ["00:00", "08:00", "16:00"],
          lowRatingIntervalMinutes: 15,
          lowRatingThreshold: 4,
        });
        setNotifications(payload.notifications ?? []);
        setActivityLogs(payload.activityLogs ?? []);
        setPermissions(normalizePermissions(payload.permissions));
        setUserPermissions(normalizeUserPermissions(payload.userPermissions));
        setSyncMode("api");
      } catch {
        if (ignore) return;
        setSyncMode("local");
        setSessionToken("");
        setCurrentUser(null);
      } finally {
        if (!ignore) setBootstrapReady(true);
      }
    }

    bootstrap();
    return () => {
      ignore = true;
    };
  }, [sessionToken]);

  useEffect(() => {
    if (!bootstrapReady) return;
    if (syncMode === "local") {
      window.localStorage.setItem("activity-logs", JSON.stringify(activityLogs));
      window.localStorage.setItem("role-permissions", JSON.stringify(permissions));
      return;
    }

    const timer = window.setTimeout(() => {
      fetch(`${apiBaseUrl}/api/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({
          users,
          permissions,
          userPermissions,
          tasks,
          complaints,
          agendaItems,
          alaCarteVenues,
          alaCarteReservations,
          alaCarteWaitlist,
          alaCarteServiceSlots,
          orders,
          assistantMeetings,
          assistantReviews,
          reviewSources,
          reviewScanLogs,
          reviewSchedule,
          activityLogs,
        }),
      }).catch(() => {
        setSyncMode("local");
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [activityLogs, agendaItems, alaCarteReservations, alaCarteServiceSlots, alaCarteVenues, alaCarteWaitlist, assistantMeetings, assistantReviews, bootstrapReady, complaints, orders, permissions, reviewScanLogs, reviewSchedule, reviewSources, sessionToken, syncMode, tasks, userPermissions]);

  useEffect(() => {
    if (!sessionToken) return undefined;

    const pollNotifications = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/notifications`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!response.ok) return;
        const payload = await response.json();
        const nextNotifications = payload.notifications ?? [];
        setNotifications(nextNotifications);

        if (!("Notification" in window) || Notification.permission !== "granted") return;
        nextNotifications
          .filter((item) => !item.readAt && !notifiedIdsRef.current.has(item.id))
          .forEach((item) => {
            notifiedIdsRef.current.add(item.id);
            new Notification(item.title, { body: item.message });
          });
      } catch {
        return;
      }
    };

    void pollNotifications();
    const timer = window.setInterval(pollNotifications, 15000);
    return () => window.clearInterval(timer);
  }, [sessionToken]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const visibleTab = availableTabIds.includes(activeTab)
      ? activeTab
      : availableTabIds[0] ?? "dashboard";
    if (visibleTab === "dashboard") url.searchParams.delete("view");
    else url.searchParams.set("view", visibleTab);
    window.history.replaceState({}, "", url);
  }, [activeTab, availableTabIds]);

  const localizeTaskTitle = (task) => task.title ?? copy.taskTitles[task.titleKey] ?? task.titleKey;
  const localizeTaskNotes = (task) => task.notes ?? copy.taskNotes[task.notesKey] ?? task.notesKey;
  const localizeDepartment = (key) => copy.departments[key] ?? key;
  const localizeCategory = (key) => copy.categories[key] ?? key;
  const localizeChannel = (key) => copy.channels[key] ?? key;
  const localizeStatus = (key) => copy.statuses[key] ?? key;
  const localizePriority = (key) => copy.priorities[key] ?? key;
  const localizeTaskType = (key) => copy.taskTypes[key] ?? key;
  const localizeSummary = (item) => item.summary ?? copy.complaintSummaries[item.summaryKey] ?? item.summaryKey;
  const localizeVenueCuisine = (value) => localizeSeedValue(language, "cuisine", value);
  const localizeVenueDuration = (value) => localizeSeedValue(language, "duration", value);
  const localizeVenueChildPolicy = (value) => localizeSeedValue(language, "childPolicy", value);
  const localizeVenueTableSetup = (value) => localizeSeedValue(language, "tableSetup", value);
  const localizeVenueNote = (value) => localizeSeedValue(language, "venueNote", value);
  const localizeAgendaTitle = (value) => localizeSeedValue(language, "agendaTitle", value);
  const localizeAgendaNote = (value) => localizeSeedValue(language, "agendaNote", value);
  const localizeMeetingTopic = (value) => localizeSeedValue(language, "meetingTopic", value);
  const localizeMeetingResult = (value) => localizeSeedValue(language, "meetingResult", value);
  const localizeMeetingNote = (value) => localizeSeedValue(language, "meetingNote", value);
  const localizeReviewContent = (value) => localizeSeedValue(language, "reviewContent", value);
  const complaintCategoriesForDepartment = (department) =>
    complaintCategoriesByDepartment[department] ?? Object.keys(copy.categories);
  const visibleComplaintCategoryOptions = complaintDepartmentFilter === "all"
    ? Object.keys(copy.categories)
    : complaintCategoriesForDepartment(complaintDepartmentFilter);
  const formComplaintCategoryOptions = complaintCategoriesForDepartment(newComplaint.department);
  const localizeWeekdayShort = (key) => copy.weekdaysShort?.[key] ?? key;
  const localizeReservationStatus = (key) => {
    const normalizedKey = key === "No Show" ? "noShow" : key.toLowerCase();
    return diningCopy[normalizedKey] ?? key;
  };
  const localizeWaitlistStatus = (key) => {
    const normalizedKey = key.toLowerCase();
    return diningCopy[normalizedKey] ?? key;
  };
  const localizeWaitlistPriority = (key) => {
    const normalizedKey = key.toLowerCase();
    return diningCopy[normalizedKey] ?? key;
  };
  const localizeReservationSource = (key) => {
    const mapping = {
      App: diningCopy.sources.app,
      "Guest Relations": diningCopy.sources.guestRelations,
      "Front Office": diningCopy.sources.frontOffice,
      Manager: diningCopy.sources.manager,
    };
    return mapping[key] ?? key;
  };
  const formatDate = (value) => (value ? new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(value)) : "");
  const roleLabel = (role) => copy.roles[role] ?? role;
  const titleLabel = (titleKey) => titleCopy[titleKey] ?? titleKey;
  const userLabel = (user) => user.titleKey ? titleLabel(user.titleKey) : roleLabel(user.role);
  const loginOptionLabel = (user) => (user.role === "assistant" ? `${user.displayName} · ${roleLabel(user.role)}` : userLabel(user));
  const availableDepartmentOptions = isDepartmentManager && scopedDepartment
    ? [scopedDepartment]
    : Object.keys(copy.departments);
  const complaintDepartmentOptions = availableDepartmentOptions.filter((key) => complaintCategoriesByDepartment[key]);
  const visibleTab = availableTabIds.includes(activeTab)
    ? activeTab
    : availableTabIds[0] ?? "dashboard";
  const agendaToday = "2026-03-11";
  const agendaTomorrow = "2026-03-12";
  const knownAssistantNames = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...userDirectory.filter((user) => user.role === "assistant").map((user) => user.displayName),
            ...shiftTeams.flatMap((team) => team.members),
            ...assistantMeetings.map((item) => item.assignedAssistant || item.owner || ""),
            ...assistantReviews.map((item) => item.matchedAssistant || item.owner || ""),
          ]
            .map((item) => String(item || "").trim())
            .filter(Boolean),
        ),
      ),
    [assistantMeetings, assistantReviews, shiftTeams, userDirectory],
  );
  const attributedAssistantForReview = useCallback((review) =>
    review.matchedAssistant
    || inferAssistantNameFromText([review.author, review.content, review.owner].join(" "), knownAssistantNames, review.owner || ""),
  [knownAssistantNames]);

  const logAction = useCallback((actionKey, detail) => {
    if (!currentUser) return;
    setActivityLogs((current) => [
      {
        id: Date.now(),
        username: currentUser.username,
        displayName: currentUser.displayName,
        role: currentUser.role,
        actionKey,
        detail,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, [currentUser]);

  const tabs = availableTabIds.map((id) => ({
    id,
    label: tabLabel(id),
  }));

  const groupedOrders = useMemo(() => groupOrdersForDisplay(orders), [orders]);
  const isSignInReady = Boolean(selectedUsername && accessCode.trim() && loginPassword.trim());
  const isPasswordChangeReady = Boolean(
    newPassword.trim() && confirmNewPassword.trim() && newPassword === confirmNewPassword,
  );
  const isTaskReady = Boolean(newTask.title.trim() && newTask.notes.trim());
  const isComplaintReady = Boolean(newComplaint.guest.trim() && newComplaint.summary.trim());
  const isOrderReady = (type) =>
    Boolean(newOrders[type]?.roomNumber.trim() && newOrders[type]?.note.trim());
  const isReservationReady = Boolean(
    newReservation.venueId
    && newReservation.guestName.trim()
    && newReservation.roomNumber.trim()
    && newReservation.reservationDate
    && newReservation.slotTime
    && newReservation.note.trim(),
  );
  const isWaitlistReady = Boolean(
    newWaitlistEntry.venueId
    && newWaitlistEntry.guestName.trim()
    && newWaitlistEntry.roomNumber.trim()
    && newWaitlistEntry.preferredDate,
  );
  const isVenueSettingsReady = Boolean(
    selectedVenueId
    && venueSettings.openingTime
    && venueSettings.lastArrival
    && venueSettings.workingDays.length > 0,
  );
  const isServiceSlotReady = Boolean(
    newServiceSlot.venueId
    && newServiceSlot.date
    && newServiceSlot.time
    && Number(newServiceSlot.maxCovers) > 0,
  );
  const isVenueReady = Boolean(
    newVenue.name.trim()
    && newVenue.cuisine.trim()
    && newVenue.openingTime
    && newVenue.lastArrival
    && newVenue.note.trim(),
  );
  const isShiftTeamReady = Boolean(
    shiftTeamForm.name.trim()
    && shiftTeamForm.members.every((member) => member.trim()),
  );
  const isMeetingReady = Boolean(
    newMeeting.customerName.trim()
    && newMeeting.topic.trim()
    && newMeeting.notes.trim(),
  );
  const isReviewReady = Boolean(
    newReview.platform.trim()
    && newReview.author.trim()
    && newReview.content.trim(),
  );
  const isAgendaReady = Boolean(
    newAgendaItem.title.trim()
    && newAgendaItem.owner.trim()
    && newAgendaItem.note.trim(),
  );
  const isUserUpdateReady = Boolean(managedUsername && (managedDisplayName.trim() || managedPassword.trim()));

  const updateRolePermission = (role, type, value) => {
    if (!isAdminUser) return;
    setPermissions((current) => {
      const roleConfig = current[role];
      const candidateValues = roleConfig[type].includes(value)
        ? roleConfig[type].filter((item) => item !== value)
        : [...roleConfig[type], value];
      const nextValues =
        type === "tabs" && candidateValues.length === 0
          ? ["dashboard"]
          : candidateValues;

      const next = {
        ...current,
        [role]: {
          ...roleConfig,
          [type]: nextValues,
        },
      };

      return next;
    });
    logAction("actionPermissionUpdated", `${role}:${type}:${value}`);
  };

  const updateUserPermission = (username, type, value) => {
    setUserPermissions((current) => {
      const baseAccess = mergePermissionAccess(permissions[userDirectory.find((user) => user.username === username)?.role ?? "assistant"], current[username]);
      const currentAccess = current[username] ?? baseAccess;
      const nextValues = currentAccess[type].includes(value)
        ? currentAccess[type].filter((item) => item !== value)
        : [...currentAccess[type], value];
      const normalizedValues = type === "tabs" && nextValues.length === 0 ? ["dashboard"] : nextValues;

      return {
        ...current,
        [username]: {
          tabs: type === "tabs" ? normalizedValues : currentAccess.tabs,
          modules: type === "modules" ? normalizedValues : currentAccess.modules,
          showAudit: currentAccess.showAudit,
        },
      };
    });
    logAction("actionPermissionUpdated", `${username}:${type}:${value}`);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesText = [
      localizeTaskTitle(task),
      localizeDepartment(task.department),
      task.owner,
      localizeTaskNotes(task),
      localizeStatus(task.status),
      localizePriority(task.priority),
      localizeTaskType(task.type),
    ].join(" ").toLowerCase().includes(taskSearch.toLowerCase());
    return matchesText
      && (taskTypeFilter === "all" || task.type === taskTypeFilter)
      && (taskStatusFilter === "all" || task.status === taskStatusFilter);
  });

  const filteredComplaints = complaints.filter((item) => {
    const matchesText = [
      item.guest,
      localizeCategory(item.category),
      localizeDepartment(item.department),
      localizeSummary(item),
      localizeChannel(item.channel),
      localizeStatus(item.status),
      localizePriority(item.severity),
    ].join(" ").toLowerCase().includes(complaintSearch.toLowerCase());
    return matchesText
      && (complaintStatusFilter === "all" || item.status === complaintStatusFilter)
      && (complaintDepartmentFilter === "all" || item.department === complaintDepartmentFilter)
      && (complaintCategoryFilter === "all" || item.category === complaintCategoryFilter)
      && (complaintChannelFilter === "all" || item.channel === complaintChannelFilter)
      && (complaintSeverityFilter === "all" || item.severity === complaintSeverityFilter);
  });

  const taskStats = useMemo(() => {
    const total = tasks.length;
    return {
      total,
      done: tasks.filter((task) => task.status === "Done").length,
      active: tasks.filter((task) => task.status === "In Progress").length,
      daily: tasks.filter((task) => task.type === "daily").length,
    };
  }, [tasks]);

  const complaintStats = useMemo(() => {
    const total = complaints.length;
    return {
      total,
      open: complaints.filter((item) => item.status === "Open").length,
      resolved: complaints.filter((item) => item.status === "Resolved").length,
      critical: complaints.filter((item) => item.severity === "Critical").length,
    };
  }, [complaints]);

  const overallProgress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round(tasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / tasks.length);
  }, [tasks]);

  const openTaskView = ({ type = "all", status = "all", search = "" } = {}) => {
    setTaskTypeFilter(type);
    setTaskStatusFilter(status);
    setTaskSearch(search);
    setActiveTab("tasks");
    logAction("actionTab", copy.tasksTab);
  };

  const openComplaintView = ({ status = "all", severity = "all", search = "" } = {}) => {
    setComplaintStatusFilter(status);
    setComplaintSeverityFilter(severity);
    setComplaintDepartmentFilter("all");
    setComplaintCategoryFilter("all");
    setComplaintChannelFilter("all");
    setComplaintSearch(search);
    setActiveTab("complaints");
    logAction("actionTab", copy.complaintsTab);
  };

  const sortedAgendaItems = useMemo(
    () => [...agendaItems].sort((left, right) => new Date(left.date) - new Date(right.date)),
    [agendaItems],
  );

  const todayAgenda = useMemo(
    () => sortedAgendaItems.filter((item) => item.date === agendaToday),
    [agendaToday, sortedAgendaItems],
  );

  const tomorrowAgenda = useMemo(
    () => sortedAgendaItems.filter((item) => item.date === agendaTomorrow),
    [agendaTomorrow, sortedAgendaItems],
  );

  const upcomingAgenda = useMemo(
    () => sortedAgendaItems.filter((item) => item.date > agendaTomorrow).slice(0, 6),
    [agendaTomorrow, sortedAgendaItems],
  );

  const alaCarteStats = useMemo(() => {
    const active = alaCarteVenues.filter((item) => item.active);
    return {
      activeCount: active.length,
      averagePrice: alaCarteVenues.length
        ? Math.round(
            alaCarteVenues.reduce((sum, item) => sum + Number(item.coverPrice), 0) /
              alaCarteVenues.length,
          )
        : 0,
      maxGuests: alaCarteVenues.length
        ? Math.max(...alaCarteVenues.map((item) => item.maxGuests))
        : 0,
      averageOccupancy: active.length
        ? Math.round(
            active.reduce((sum, item) => sum + Number(item.occupancy), 0) /
              active.length,
          )
        : 0,
      reservationCount: alaCarteReservations.length,
      waitlistCount: alaCarteWaitlist.filter((item) => item.status === "Waiting").length,
      noShowRiskCount: alaCarteReservations.filter((item) => item.status === "Booked").length,
    };
  }, [alaCarteReservations, alaCarteVenues, alaCarteWaitlist]);

  const reservationStatusCounts = reservationStatusOrder.map((status) => ({
    status: localizeReservationStatus(status),
    count: alaCarteReservations.filter((item) => item.status === status).length,
  }));

  const upcomingReservations = useMemo(
    () =>
      [...alaCarteReservations].sort(
        (left, right) =>
          new Date(`${left.reservationDate}T${left.slotTime}:00`) -
          new Date(`${right.reservationDate}T${right.slotTime}:00`),
      ),
    [alaCarteReservations],
  );

  const selectedVenue = useMemo(
    () => alaCarteVenues.find((item) => item.id === selectedVenueId) ?? alaCarteVenues[0] ?? null,
    [alaCarteVenues, selectedVenueId],
  );

  const ftfMeetings = useMemo(
    () =>
      [...assistantMeetings]
        .filter((item) => /(^|\b)ftf(\b|$)/i.test([item.tagCode, item.topic, item.notes].join(" ")))
        .sort((left, right) => `${right.date}${right.time}`.localeCompare(`${left.date}${left.time}`)),
    [assistantMeetings],
  );

  const assistantLeaderboard = useMemo(() => {
    const map = new Map();
    assistantReviews.forEach((review) => {
      const name = attributedAssistantForReview(review).trim() || "Unknown";
      const entry = map.get(name) || { name, reviewCount: 0, ftfCount: 0 };
      entry.reviewCount += 1;
      map.set(name, entry);
    });
    ftfMeetings.forEach((meeting) => {
      const name = inferAssistantNameFromText(
        [meeting.assignedAssistant, meeting.owner, meeting.topic, meeting.notes].join(" "),
        knownAssistantNames,
        meeting.assignedAssistant || meeting.owner || "Unknown",
      ).trim() || "Unknown";
      const entry = map.get(name) || { name, reviewCount: 0, ftfCount: 0 };
      entry.ftfCount += 1;
      map.set(name, entry);
    });
    return [...map.values()].sort((left, right) => {
      if (right.reviewCount !== left.reviewCount) return right.reviewCount - left.reviewCount;
      if (right.ftfCount !== left.ftfCount) return right.ftfCount - left.ftfCount;
      return left.name.localeCompare(right.name);
    });
  }, [assistantReviews, attributedAssistantForReview, ftfMeetings, knownAssistantNames]);

  const assistantTrackerStats = useMemo(() => {
    const today = "2026-03-12";
    return {
      todayMeetings: assistantMeetings.filter((item) => item.date === today).length,
      waitingFollowUp: assistantMeetings.filter((item) => item.followUpDate && item.followUpDate <= today).length,
      openReviews: assistantReviews.filter((item) => item.status !== "Resolved").length,
      lowReviews: assistantReviews.filter((item) => Number(item.rating) <= 2).length,
      ftfCount: ftfMeetings.length,
      topAssistant: assistantLeaderboard[0]?.name ?? "-",
    };
  }, [assistantLeaderboard, assistantMeetings, assistantReviews, ftfMeetings]);

  const shiftPlan = useMemo(() => createWeeklyShiftPlan(shiftTeams, shiftLeadership), [shiftLeadership, shiftTeams]);
  const monthlyShiftPlan = useMemo(() => createMonthlyShiftPlan(shiftTeams, shiftLeadership), [shiftLeadership, shiftTeams]);
  const selectedShiftDay = shiftPlan.days[selectedShiftDayIndex] ?? shiftPlan.days[0] ?? null;

  const filteredAssistantMeetings = useMemo(
    () =>
      [...assistantMeetings]
        .filter((item) =>
          [item.customerName, item.topic, item.owner, item.assignedAssistant, item.tagCode]
            .join(" ")
            .toLowerCase()
            .includes(meetingSearch.toLowerCase()),
        )
        .sort((left, right) => `${right.date}${right.time}`.localeCompare(`${left.date}${left.time}`)),
    [assistantMeetings, meetingSearch],
  );

  const filteredAssistantReviews = useMemo(
    () =>
      [...assistantReviews]
        .filter((item) =>
          [item.platform, item.author, item.branch, item.owner, attributedAssistantForReview(item), item.content]
            .join(" ")
            .toLowerCase()
            .includes(reviewSearch.toLowerCase()),
        )
        .sort((left, right) => right.date.localeCompare(left.date)),
    [assistantReviews, attributedAssistantForReview, reviewSearch],
  );

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.readAt),
    [notifications],
  );
  const criticalReviews = useMemo(
    () => [...assistantReviews].filter((item) => Number(item.rating) <= 4).sort((left, right) => right.date.localeCompare(left.date)),
    [assistantReviews],
  );
  const criticalReviewAlerts = useMemo(
    () => notifications.filter((item) => item.createdBy === "review-monitor"),
    [notifications],
  );

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const scopedTask = isDepartmentManager && scopedDepartment ? { ...newTask, department: scopedDepartment } : newTask;
    setTasks((current) => [{ ...scopedTask, id: Date.now(), notes: scopedTask.notes }, ...current]);
    setNewTask({ title: "", type: "daily", department: isDepartmentManager && scopedDepartment ? scopedDepartment : "guestRelations", owner: "", dueDate: "", priority: "Medium", status: "Planned", progress: 0, notes: "" });
    logAction("actionTaskAdded", newTask.title);
  };

  const addComplaint = () => {
    if (!newComplaint.guest.trim() || !newComplaint.summary.trim()) {
      setComplaintFormError(copy.complaintValidation);
      return;
    }
    const scopedComplaint = isDepartmentManager && scopedDepartment ? { ...newComplaint, department: scopedDepartment } : newComplaint;
    setComplaints((current) => [{ ...scopedComplaint, id: Date.now(), summary: scopedComplaint.summary }, ...current]);
    const resetDepartment = isDepartmentManager && scopedDepartment ? scopedDepartment : "guestRelations";
    setNewComplaint({
      guest: "",
      category: complaintCategoriesByDepartment[resetDepartment]?.[0] ?? "guestRelationsFollowUp",
      severity: "Medium",
      status: "Open",
      channel: "frontDesk",
      date: "",
      department: resetDepartment,
      summary: "",
    });
    setComplaintFormError("");
    logAction("actionComplaintAdded", newComplaint.guest);
    void createDepartmentNotification(scopedComplaint);
  };

  const addShiftTeam = () => {
    const trimmedMembers = shiftTeamForm.members.map((member) => member.trim());
    if (
      !shiftTeamForm.name.trim()
      || trimmedMembers.some((member) => !member)
      || !Array.isArray(shiftTeamForm.offSchedule)
      || shiftTeamForm.offSchedule.length !== 7
    ) {
      setShiftPlannerError(shiftCopy.teamValidation);
      return;
    }

    if (hasDuplicateWeeklyOffAssignments(shiftTeamForm.offSchedule)) {
      setShiftPlannerError(shiftCopy.duplicateOffValidation);
      return;
    }

    const team = {
      id: `shift-team-${Date.now()}`,
      name: shiftTeamForm.name.trim(),
      offSchedule: normalizeOffSchedule(shiftTeamForm.offSchedule),
      members: trimmedMembers,
    };

    setShiftTeams((current) => [...current, team]);
    setShiftTeamForm({ ...defaultShiftTeamForm, members: [...defaultShiftTeamForm.members] });
    setShiftPlannerError("");
    logAction("actionTaskAdded", `shift:${team.name}`);
  };

  const removeShiftTeam = (id) => {
    const team = shiftTeams.find((item) => item.id === id);
    setShiftTeams((current) => current.filter((item) => item.id !== id));
    setEditingShiftTeamId((current) => (current === id ? "" : current));
    if (team) logAction("actionTaskToggled", `shift:${team.name}`);
  };

  const updateShiftTeamOffMember = (teamId, dayIndex, memberIndex) => {
    let updated = false;
    setShiftTeams((current) =>
      current.map((team) => {
        if (team.id !== teamId) return team;
        const nextSchedule = normalizeOffSchedule(team.offSchedule).map((value, index) =>
          index === dayIndex ? String(memberIndex) : value,
        );
        if (hasDuplicateWeeklyOffAssignments(nextSchedule)) {
          setShiftPlannerError(shiftCopy.duplicateOffValidation);
          return team;
        }
        updated = true;
        return {
          ...team,
          offSchedule: nextSchedule,
        };
      }),
    );
    if (!updated) return;
    setShiftPlannerError("");
    logAction("actionPermissionUpdated", `shift:${teamId}:day:${dayIndex}`);
  };

  const saveShiftTeams = () => {
    window.localStorage.setItem(shiftTeamsStorageKey, JSON.stringify(shiftTeams));
    window.localStorage.setItem(shiftLeadershipStorageKey, JSON.stringify(shiftLeadership));
    setShiftPlannerStatus(shiftCopy.savedStatus);
    logAction("actionPermissionUpdated", "shift:save");
  };

  const downloadCsvFile = (filename, rows) => {
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  };

  const exportShiftPlan = (plan, period) => {
    if (!plan.days.length) return;

    const rows = [
      [shiftCopy.title, period === "weekly" ? shiftCopy.exportWeek : shiftCopy.exportMonth, shiftWeekStart],
      ["", "", ""],
      ...buildShiftExportRows(plan, shiftCopy),
    ];

    downloadCsvFile(`shift-plan-${period}-${shiftWeekStart}.csv`, rows);
    setShiftPlannerStatus(period === "weekly" ? shiftCopy.exportStatusWeek : shiftCopy.exportStatusMonth);
    logAction("actionModuleOpened", `shift:${period}`);
  };

  const saveTaskList = () => {
    window.localStorage.setItem(tasksStorageKey, JSON.stringify(tasks));
    setTaskListStatus(copy.tasksSaved);
    logAction("actionTaskAdded", "tasks:save");
  };

  const exportTaskList = () => {
    const rows = [
      ["Title", "Type", "Department", "Owner", "Due Date", "Priority", "Status", "Progress", "Notes"],
      ...tasks.map((task) => [
        localizeTaskTitle(task),
        localizeTaskType(task.type),
        localizeDepartment(task.department),
        task.owner || copy.unassigned,
        task.dueDate || "",
        localizePriority(task.priority),
        localizeStatus(task.status),
        `${task.progress}%`,
        localizeTaskNotes(task),
      ]),
    ];
    downloadCsvFile(`tasks-${shiftWeekStart}.csv`, rows);
    setTaskListStatus(copy.tasksExported);
    logAction("actionModuleOpened", "tasks:export");
  };

  const saveComplaintList = () => {
    window.localStorage.setItem(complaintsStorageKey, JSON.stringify(complaints));
    setComplaintListStatus(copy.complaintsSaved);
    logAction("actionComplaintAdded", "complaints:save");
  };

  const exportComplaintList = () => {
    const rows = [
      ["Guest", "Category", "Severity", "Status", "Channel", "Date", "Department", "Summary"],
      ...complaints.map((item) => [
        item.guest,
        localizeCategory(item.category),
        localizePriority(item.severity),
        localizeStatus(item.status),
        localizeChannel(item.channel),
        item.date || "",
        localizeDepartment(item.department),
        localizeSummary(item),
      ]),
    ];
    downloadCsvFile(`complaints-${shiftWeekStart}.csv`, rows);
    setComplaintListStatus(copy.complaintsExported);
    logAction("actionModuleOpened", "complaints:export");
  };

  const saveAlaCarteLists = () => {
    window.localStorage.setItem(alaCarteStorageKey, JSON.stringify({
      venues: alaCarteVenues,
      reservations: alaCarteReservations,
      waitlist: alaCarteWaitlist,
      serviceSlots: alaCarteServiceSlots,
    }));
    setAlaCarteListStatus(copy.alaCarteSaved);
    logAction("actionAlaCarteAdded", "alacarte:save");
  };

  const addOrder = (type) => {
    const nextOrder = newOrders[type];
    if (!nextOrder?.roomNumber.trim()) return;

    setOrders((current) => [
      {
        id: `order-${type}-${Date.now()}`,
        type,
        roomNumber: nextOrder.roomNumber.trim(),
        note: nextOrder.note.trim(),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setNewOrders((current) => ({
      ...current,
      [type]: { roomNumber: "", note: "" },
    }));
    setOrdersStatus("");
    logAction("actionModuleOpened", `orders:${type}:add`);
  };

  const saveOrders = () => {
    window.localStorage.setItem("orders-list-snapshot", JSON.stringify(orders));
    setOrdersStatus(copy.ordersSaved);
    logAction("actionModuleOpened", "orders:save");
  };

  const exportOrders = () => {
    const typeLabels = {
      fruitWine: copy.fruitWine,
      roomDecoration: copy.roomDecoration,
      specialRequest: copy.specialRequest,
    };
    const rows = orderExportSections.flatMap((type, index) => {
      const sectionRows = groupedOrders[type].length
        ? groupedOrders[type].map((item) => [item.roomNumber, item.note || ""])
        : [[copy.notSet, ""]];
      return [
        [typeLabels[type], ""],
        [copy.roomNumberFixed, copy.notes],
        ...sectionRows,
        ...(index === orderExportSections.length - 1 ? [] : [["", ""]]),
      ];
    });
    downloadCsvFile(`orders-${shiftWeekStart}.csv`, rows);
    setOrdersStatus(copy.ordersExported);
    logAction("actionModuleOpened", "orders:export");
  };

  const printOrders = () => {
    const typeLabels = {
      fruitWine: copy.fruitWine,
      roomDecoration: copy.roomDecoration,
      specialRequest: copy.specialRequest,
    };
    const printWindow = window.open("", "_blank", "width=960,height=720");
    if (!printWindow) return;

    const sectionsHtml = orderExportSections
      .map((type) => {
        const rows = groupedOrders[type]
          .map(
            (item) => `
              <tr>
                <td>${item.roomNumber}</td>
                <td>${item.note || "&nbsp;"}</td>
              </tr>
            `,
          )
          .join("");
        return `
          <section class="print-section">
            <h2>${typeLabels[type] ?? type}</h2>
            <table>
              <thead>
                <tr>
                  <th>${copy.roomNumberFixed}</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                ${rows || `<tr><td colspan="2">-</td></tr>`}
              </tbody>
            </table>
          </section>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!doctype html>
      <html lang="${language}">
        <head>
          <meta charset="utf-8" />
          <title>${copy.ordersTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 16px; font-size: 28px; }
            .print-section { margin-bottom: 28px; }
            .print-section h2 { margin: 0 0 12px; font-size: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; vertical-align: top; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>${copy.ordersTitle}</h1>
          ${sectionsHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setOrdersStatus(copy.ordersPrinted);
    logAction("actionModuleOpened", "orders:print");
  };

  const exportAlaCarteLists = () => {
    const rows = [
      ["Section", "Name", "Date", "Time", "Status", "Detail 1", "Detail 2", "Detail 3"],
      ...alaCarteVenues.map((venue) => [
        "Venue",
        venue.name,
        "",
        venue.openingTime,
        venue.active ? copy.active : copy.passive,
        venue.cuisine,
        `${venue.coverPrice} ${venue.currency}`,
        venue.workingDays.join(" / "),
      ]),
      ...alaCarteReservations.map((reservation) => [
        "Reservation",
        reservation.guestName,
        reservation.reservationDate,
        reservation.slotTime,
        localizeReservationStatus(reservation.status),
        reservation.roomNumber,
        `${reservation.partySize} | ${localizeReservationSource(reservation.source)}`,
        alaCarteVenues.find((venue) => venue.id === reservation.venueId)?.name ?? reservation.venueId,
      ]),
      ...alaCarteWaitlist.map((entry) => [
        "Waitlist",
        entry.guestName,
        entry.preferredDate,
        entry.preferredWindow,
        entry.status,
        entry.roomNumber,
        entry.partySize,
        alaCarteVenues.find((venue) => venue.id === entry.venueId)?.name ?? entry.venueId,
      ]),
      ...alaCarteServiceSlots.map((slot) => [
        "Service Slot",
        alaCarteVenues.find((venue) => venue.id === slot.venueId)?.name ?? slot.venueId,
        slot.date,
        slot.time,
        `${slot.bookedCovers}/${slot.maxCovers}`,
        `waitlist:${slot.waitlistCount}`,
        "",
        "",
      ]),
    ];
    downloadCsvFile(`alacarte-${shiftWeekStart}.csv`, rows);
    setAlaCarteListStatus(copy.alaCarteExported);
    logAction("actionModuleOpened", "alacarte:export");
  };

  const createLocalReviewImports = useCallback(() => {
    const enabledSources = reviewSources.filter((item) => item.enabled);
    const syncedAt = new Date().toISOString();
    const nextSources = reviewSources.map((source) =>
      source.enabled
        ? { ...source, lastSyncAt: syncedAt, importedCount: (source.importedCount ?? 0) + 1 }
        : source,
    );
    const reviewScanLogs = enabledSources.map((source, index) => ({
      id: `scan-log-${source.id}-${Date.now()}-${index}`,
      sourceId: source.id,
      platform: source.platform,
      scannedAt: syncedAt,
      status: "no_data",
      foundCount: 0,
      note: "Visible public review data could not be verified in local mode.",
    }));
    return { importedReviews: [], reviewSources: nextSources, reviewScanLogs };
  }, [reviewSources]);

  const saveReviewSources = () => {
    setReviewSourceStatus(copy.reviewSourceSaved);
    logAction("actionPermissionUpdated", "reviews:sources");
  };

  const syncReviewSources = useCallback(async () => {
    setIsReviewSyncing(true);
    setReviewSyncStatus(copy.reviewSyncing);

    try {
      let payload = null;
      if (syncMode === "api" && sessionToken) {
        const response = await fetch(`${apiBaseUrl}/api/reviews/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ assistantNames: knownAssistantNames, sources: reviewSources }),
        });
        if (!response.ok) throw new Error("review sync failed");
        payload = await response.json();
      } else {
        payload = createLocalReviewImports();
      }

      const importedReviews = (payload.importedReviews ?? []).map((review) => ({
        ...review,
        matchedAssistant: review.matchedAssistant
          || inferAssistantNameFromText([review.author, review.content, review.owner].join(" "), knownAssistantNames, review.owner || ""),
      }));
      setAssistantReviews((current) => [...importedReviews, ...current]);
      if (payload.reviewSources?.length) setReviewSources(payload.reviewSources);
      if (payload.reviewScanLogs?.length) setReviewScanLogs((current) => [...payload.reviewScanLogs, ...current].slice(0, 20));
      if (payload.notifications?.length) setNotifications((current) => [...payload.notifications, ...current].slice(0, 100));
      if (payload.reviewSchedule) setReviewSchedule(payload.reviewSchedule);
      setReviewSyncStatus(copy.reviewSyncDone.replace("{count}", String(importedReviews.length)));
      logAction("actionModuleOpened", `reviews:sync:${importedReviews.length}`);
    } catch {
      const fallback = createLocalReviewImports();
      setAssistantReviews((current) => [...fallback.importedReviews, ...current]);
      setReviewSources(fallback.reviewSources);
      setReviewScanLogs((current) => [...fallback.reviewScanLogs, ...current].slice(0, 20));
      setReviewSyncStatus(copy.reviewSyncDone.replace("{count}", String(fallback.importedReviews.length)));
    } finally {
      setIsReviewSyncing(false);
    }
  }, [copy.reviewSyncDone, copy.reviewSyncing, createLocalReviewImports, knownAssistantNames, logAction, reviewSources, sessionToken, syncMode]);

  useEffect(() => {
    if (
      visibleTab !== "assistantTracker"
      || !sessionToken
      || !bootstrapReady
      || isReviewSyncing
      || hallOfFameAutoScanRef.current
    ) {
      return;
    }

    hallOfFameAutoScanRef.current = true;
    void syncReviewSources();
  }, [bootstrapReady, isReviewSyncing, sessionToken, syncReviewSources, visibleTab]);

  const createDepartmentNotification = async (complaint) => {
    if (syncMode !== "api" || !sessionToken) return;
    try {
      await fetch(`${apiBaseUrl}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          department: complaint.department,
          title: copy.notificationComplaintTitle,
          message: `${complaint.guest}: ${complaint.summary}`,
        }),
      });
    } catch {
      return;
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    try {
      await Notification.requestPermission();
    } catch {
      return;
    }
  };

  const markNotificationRead = async (id) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item)),
    );
    if (syncMode !== "api" || !sessionToken) return;
    try {
      await fetch(`${apiBaseUrl}/api/notifications/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ id }),
      });
    } catch {
      return;
    }
  };

  const addAlaCarteVenue = () => {
    if (!newVenue.name.trim()) return;
    const venue = {
      id: `${newVenue.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: newVenue.name,
      cuisine: newVenue.cuisine,
      active: true,
      openingTime: newVenue.openingTime,
      lastArrival: newVenue.lastArrival,
      coverPrice: Number(newVenue.coverPrice),
      currency: "EUR",
      maxGuests: Number(newVenue.maxGuests),
      mixedTable: false,
      areaPreference: true,
      childPolicy: "Custom policy",
      cancellationWindow: "2 hours",
      closeSaleWindow: "1 hour",
      workingDays: newVenue.workingDays.split(",").map((item) => item.trim()).filter(Boolean),
      roomNightLimit: 1,
      includeOtherRooms: false,
      tableSetup: "Flexible setup",
      note: newVenue.note || "Newly created internal venue.",
      demand: "Medium",
      occupancy: 0,
      slotCount: 3,
    };
    setAlaCarteVenues((current) => [venue, ...current]);
    setSelectedVenueId(venue.id);
    setNewVenue({
      name: "",
      cuisine: "Mediterranean",
      openingTime: "19:00",
      lastArrival: "21:30",
      coverPrice: 30,
      maxGuests: 6,
      workingDays: "Mon,Tue,Wed,Thu,Fri,Sat",
      note: "",
    });
    setAlaCarteStatusMessage(copy.addVenue);
    logAction("actionAlaCarteAdded", venue.name);
  };

  const saveAlaCarteSettings = () => {
    if (!selectedVenue) return;
    setAlaCarteVenues((current) =>
      current.map((item) =>
        item.id === selectedVenue.id
          ? {
              ...item,
              active: venueSettings.active,
              openingTime: venueSettings.openingTime,
              lastArrival: venueSettings.lastArrival,
              coverPrice: Number(venueSettings.coverPrice),
              workingDays: venueSettings.workingDays,
              childPolicy: venueSettings.childPolicy,
              cancellationWindow: venueSettings.cancellationWindow,
              closeSaleWindow: venueSettings.closeSaleWindow,
              roomNightLimit: Number(venueSettings.roomNightLimit),
              includeOtherRooms: venueSettings.includeOtherRooms,
              areaPreference: venueSettings.areaPreference,
              mixedTable: venueSettings.mixedTable,
              tableSetup: venueSettings.tableSetup,
              note: venueSettings.note,
            }
          : item,
      ),
    );
    setAlaCarteFormError("");
    setAlaCarteStatusMessage(diningCopy.settingsSaved);
    logAction("actionAlaCartePriceUpdated", `${selectedVenue.name}:settings`);
  };

  const addServiceSlot = () => {
    if (!newServiceSlot.venueId || !newServiceSlot.date || !newServiceSlot.time) return;
    const venue = alaCarteVenues.find((item) => item.id === newServiceSlot.venueId);
    const weekdayKey = getWeekdayKeyForDate(newServiceSlot.date);
    if (venue && !venue.workingDays.includes(weekdayKey)) {
      setAlaCarteFormError(copy.slotClosedDayError);
      return;
    }
    const slot = {
      id: `slot-${Date.now()}`,
      venueId: newServiceSlot.venueId,
      date: newServiceSlot.date,
      time: newServiceSlot.time,
      maxCovers: Number(newServiceSlot.maxCovers),
      bookedCovers: 0,
      waitlistCount: Number(newServiceSlot.waitlistCount),
    };
    setAlaCarteServiceSlots((current) => [slot, ...current]);
    setAlaCarteFormError("");
    setAlaCarteStatusMessage(diningCopy.slotAdded);
    logAction("actionAlaCarteAdded", `${slot.venueId}:${slot.date}:${slot.time}`);
  };

  const addAlaCarteReservation = () => {
    if (!newReservation.guestName.trim() || !newReservation.roomNumber.trim()) return;
    const venue = alaCarteVenues.find((item) => item.id === newReservation.venueId);
    const weekdayKey = getWeekdayKeyForDate(newReservation.reservationDate);
    if (venue && !venue.workingDays.includes(weekdayKey)) {
      setAlaCarteFormError(copy.reservationClosedDayError);
      return;
    }
    const reservation = {
      id: `res-${Date.now()}`,
      ...newReservation,
      partySize: Number(newReservation.partySize),
    };
    setAlaCarteReservations((current) => [reservation, ...current]);
    setAlaCarteServiceSlots((current) =>
      current.map((slot) =>
        slot.venueId === reservation.venueId &&
        slot.date === reservation.reservationDate &&
        slot.time === reservation.slotTime
          ? { ...slot, bookedCovers: slot.bookedCovers + reservation.partySize }
          : slot,
      ),
    );
    setNewReservation({
      venueId: reservation.venueId,
      guestName: "",
      roomNumber: "",
      partySize: 2,
      reservationDate: reservation.reservationDate,
      slotTime: reservation.slotTime,
      source: "App",
      status: "Booked",
      note: "",
    });
    setAlaCarteFormError("");
    logAction("actionAlaCarteAdded", reservation.guestName);
  };

  const addWaitlistEntry = () => {
    if (!newWaitlistEntry.guestName.trim() || !newWaitlistEntry.roomNumber.trim()) return;
    const entry = {
      id: `wait-${Date.now()}`,
      ...newWaitlistEntry,
      partySize: Number(newWaitlistEntry.partySize),
      status: "Waiting",
    };
    setAlaCarteWaitlist((current) => [entry, ...current]);
    setNewWaitlistEntry({
      venueId: entry.venueId,
      guestName: "",
      roomNumber: "",
      partySize: 2,
      preferredDate: entry.preferredDate,
      preferredWindow: "20:00-21:00",
      priority: "Regular",
    });
    logAction("actionAlaCarteAdded", `${entry.guestName} waitlist`);
  };

  const cycleReservationStatus = (id) => {
    const reservation = alaCarteReservations.find((item) => item.id === id);
    if (!reservation) return;
    const currentIndex = reservationStatusOrder.indexOf(reservation.status);
    const nextStatus = reservationStatusOrder[(currentIndex + 1) % reservationStatusOrder.length];
    setAlaCarteReservations((current) =>
      current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)),
    );
    logAction("actionAlaCarteToggled", `${reservation.guestName}:${nextStatus}`);
  };

  const convertWaitlistToReservation = (id) => {
    const entry = alaCarteWaitlist.find((item) => item.id === id);
    if (!entry) return;
    const slot = alaCarteServiceSlots.find(
      (item) => item.venueId === entry.venueId && item.date === entry.preferredDate,
    );
    const reservation = {
      id: `res-${Date.now()}`,
      venueId: entry.venueId,
      guestName: entry.guestName,
      roomNumber: entry.roomNumber,
      partySize: entry.partySize,
      reservationDate: entry.preferredDate,
      slotTime: slot?.time ?? "20:00",
      status: "Booked",
      source: "Waitlist",
      note: `Converted from waitlist (${entry.preferredWindow})`,
    };
    setAlaCarteReservations((current) => [reservation, ...current]);
    setAlaCarteWaitlist((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "Converted" } : item)),
    );
    setAlaCarteServiceSlots((current) =>
      current.map((item) =>
        item.venueId === reservation.venueId &&
        item.date === reservation.reservationDate &&
        item.time === reservation.slotTime
          ? {
              ...item,
              bookedCovers: item.bookedCovers + reservation.partySize,
              waitlistCount: Math.max(0, item.waitlistCount - 1),
            }
          : item,
      ),
    );
    logAction("actionAlaCarteAdded", `${entry.guestName} reservation`);
  };

  const increaseSlotCapacity = (id) => {
    const slot = alaCarteServiceSlots.find((item) => item.id === id);
    setAlaCarteServiceSlots((current) =>
      current.map((item) => (item.id === id ? { ...item, maxCovers: item.maxCovers + 2 } : item)),
    );
    if (slot) logAction("actionAlaCartePriceUpdated", `${slot.time} capacity`);
  };

  const addAgendaItem = () => {
    if (!newAgendaItem.title.trim()) return;
    const item = {
      id: Date.now(),
      title: newAgendaItem.title,
      date: newAgendaItem.date,
      owner: newAgendaItem.owner || currentUser?.displayName || "Manager",
      priority: newAgendaItem.priority,
      note: newAgendaItem.note,
      completed: false,
    };
    setAgendaItems((current) => [item, ...current]);
    setNewAgendaItem({
      title: "",
      date: agendaToday,
      owner: "",
      priority: "High",
      note: "",
    });
    logAction("actionAgendaAdded", item.title);
  };

  const addAssistantMeeting = () => {
    if (!newMeeting.customerName.trim() || !newMeeting.topic.trim()) return;
    const meeting = {
      id: `meet-${Date.now()}`,
      ...newMeeting,
      owner: newMeeting.owner.trim() || currentUser?.displayName || copy.unassigned,
      assignedAssistant: newMeeting.assignedAssistant.trim() || currentUser?.displayName || copy.unassigned,
      isFTF: /(^|\\b)ftf(\\b|$)/i.test([newMeeting.tagCode, newMeeting.topic, newMeeting.notes].join(" ")),
      createdAt: new Date().toISOString(),
    };
    setAssistantMeetings((current) => [meeting, ...current]);
    setNewMeeting({
      customerName: "",
      date: meeting.date,
      time: "10:00",
      contact: "",
      topic: "",
      tagCode: "FTF",
      result: "Takip gerekli",
      notes: "",
      followUpDate: meeting.followUpDate,
      owner: "",
      assignedAssistant: "",
    });
    logAction("actionComplaintAdded", `ftf:${meeting.customerName}`);
  };

  const addAssistantReview = () => {
    if (!newReview.author.trim() || !newReview.content.trim()) return;
    const resolvedOwner = newReview.owner.trim() || currentUser?.displayName || copy.unassigned;
    const review = {
      id: `review-${Date.now()}`,
      ...newReview,
      rating: Number(newReview.rating),
      owner: resolvedOwner,
      matchedAssistant: inferAssistantNameFromText(
        [newReview.author, newReview.content, resolvedOwner].join(" "),
        knownAssistantNames,
        resolvedOwner,
      ),
      createdAt: new Date().toISOString(),
    };
    setAssistantReviews((current) => [review, ...current]);
    setNewReview({
      platform: review.platform,
      rating: 5,
      author: "",
      date: review.date,
      branch: review.branch,
      content: "",
      status: "Open",
      owner: "",
    });
    logAction("actionComplaintAdded", `review:${review.author}`);
  };

  const createTaskFromCriticalReview = (review) => {
    const matchedAssistant = attributedAssistantForReview(review) || copy.unassigned;
    const title = `${review.platform} ${review.rating}/5 - ${review.author}`;
    setTasks((current) => [
      {
        id: Date.now(),
        title,
        type: "daily",
        department: "guestRelations",
        owner: matchedAssistant,
        dueDate: review.date || "2026-03-12",
        priority: Number(review.rating) <= 2 ? "Critical" : "High",
        status: "Planned",
        progress: 0,
        notes: review.content,
      },
      ...current,
    ]);
    setCriticalReviewOpsStatus(copy.criticalReviewTaskCreated);
    logAction("actionTaskAdded", `critical-review:${review.id}`);
  };

  const updateCriticalReview = (reviewId, updates) => {
    setAssistantReviews((current) =>
      current.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              opsStatus: updates.opsStatus ?? review.opsStatus ?? "alerted",
              assignedTo: updates.assignedTo ?? review.assignedTo ?? "",
              internalNote: updates.internalNote ?? review.internalNote ?? "",
              repliedTo: updates.repliedTo ?? review.repliedTo ?? "",
              deadline: updates.deadline ?? review.deadline ?? "",
              resolutionSummary: updates.resolutionSummary ?? review.resolutionSummary ?? "",
              status:
                updates.opsStatus === "closed"
                  ? "Resolved"
                  : updates.opsStatus === "replied"
                    ? "In Review"
                    : review.status,
            }
          : review,
      ),
    );
  };

  const toggleAgendaItem = (id) => {
    const item = agendaItems.find((entry) => entry.id === id);
    setAgendaItems((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, completed: !entry.completed } : entry)),
    );
    if (item) logAction("actionAgendaToggled", item.title);
  };

  const toggleTaskDone = (id) => {
    const task = tasks.find((item) => item.id === id);
    setTasks((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: item.status === "Done" ? "In Progress" : "Done", progress: item.status === "Done" ? 70 : 100 } : item,
      ),
    );
    if (task) logAction("actionTaskToggled", localizeTaskTitle(task));
  };

  const handleSignIn = async () => {
    setAuthError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selectedUsername, password: loginPassword, accessCode }),
      });
      if (!response.ok) {
        setAuthError(copy.authFailed);
        return;
      }
      const payload = await response.json();
      setSessionToken(payload.token);
      setCurrentUser(payload.user);
      setAccessCode("");
      setLoginPassword("");
      setPasswordChangeError("");
      setPasswordChangeSuccess("");
      const firstAllowedTab = permissions[payload.user.role]?.tabs?.[0] ?? "dashboard";
      setActiveTab(firstAllowedTab);
    } catch {
      setAuthError(copy.authFailed);
    }
  };

  const handleSignOut = async () => {
    if (sessionToken) {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
      }).catch(() => {});
    }
    setUserDirectory(users);
    setSessionToken("");
    setCurrentUser(null);
  };

  const handleUserUpdate = async () => {
    if (!isAdminUser || !managedUser) return;
    setUserAdminStatus("");
    setUserAdminError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          username: managedUser.username,
          displayName: managedDisplayName,
          role: managedRole,
          password: managedPassword,
        }),
      });
      if (!response.ok) {
        setUserAdminError(copy.userUpdateError);
        return;
      }
      const payload = await response.json();
      if (Array.isArray(payload.users) && payload.users.length) {
        setUserDirectory(payload.users);
      }
      if (payload.currentUser) {
        setCurrentUser(payload.currentUser);
      }
      setManagedPassword("");
      setUserAdminStatus(copy.userUpdateSuccess);
      logAction("actionPermissionUpdated", `${managedUser.username}:profile`);
    } catch {
      setUserAdminError(copy.userUpdateError);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordChangeError("");
    setPasswordChangeSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError(copy.passwordChangeMismatch);
      return;
    }

    if (newPassword.trim().length < 8) {
      setPasswordChangeError(copy.passwordChangeLength);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/self-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        setPasswordChangeError(copy.passwordChangeError);
        return;
      }

      const payload = await response.json();
      if (payload.user) {
        setCurrentUser(payload.user);
      }
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordChangeSuccess(copy.passwordChangeSuccess);
    } catch {
      setPasswordChangeError(copy.passwordChangeError);
    }
  };

  if (!currentUser) {
    return (
      <div className="app-shell">
        <div className="page-glow page-glow-one" />
        <div className="page-glow page-glow-two" />
        <main className="layout auth-layout">
          <Panel className="auth-panel">
            <div className="auth-heading">
              <div className="hero-badge">
                <ShieldCheck size={14} />
                {copy.hotelOperationsPwa}
              </div>
              <label className="language-switcher">
                <span>
                  <Globe size={14} />
                  {copy.languageLabel}
                </span>
                <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={copy.languageLabel}>
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="ru">Русский</option>
                </select>
              </label>
            </div>
            <h1>{copy.loginTitle}</h1>
            <p className="muted">{copy.loginText}</p>
            <div className="form-grid">
              <label>
                <span>{authText.selectRole}</span>
                <select aria-label={authText.selectRole} value={selectedLoginRole} onChange={(event) => setSelectedLoginRole(event.target.value)}>
                  {loginRoleOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{copy.selectUser}</span>
                <select aria-label={copy.selectUser} value={selectedUsername} onChange={(event) => setSelectedUsername(event.target.value)}>
                  {filteredLoginUsers.map((user) => (
                    <option key={user.username} value={user.username}>
                      {loginOptionLabel(user)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{copy.accessCodeLabel}</span>
                <input
                  aria-label={copy.accessCodeLabel}
                  type="password"
                  value={accessCode}
                  placeholder={copy.accessCodePlaceholder}
                  onChange={(event) => setAccessCode(event.target.value)}
                />
              </label>
              <label>
                <span>{copy.passwordLabel}</span>
                <input
                  aria-label={copy.passwordLabel}
                  type="password"
                  value={loginPassword}
                  placeholder={copy.passwordPlaceholder}
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </label>
              {authError && <p className="form-error">{authError}</p>}
              <div className="spec-note side-note">
                <span className="eyebrow">{authText.passwordStrategyTitle}</span>
                <p>{authText.passwordStrategyText}</p>
              </div>
              <button type="button" className={`button ${isSignInReady ? "button-ready" : ""}`.trim()} onClick={() => void handleSignIn()}>
                {copy.signIn}
              </button>
            </div>
          </Panel>
        </main>
      </div>
    );
  }

  if (currentUser.requirePasswordChange) {
    return (
      <div className="app-shell">
        <div className="page-glow page-glow-one" />
        <div className="page-glow page-glow-two" />
        <main className="layout auth-layout">
          <Panel className="auth-panel">
            <div className="auth-heading">
              <div className="hero-badge">
                <ShieldCheck size={14} />
                {copy.hotelOperationsPwa}
              </div>
              <label className="language-switcher">
                <span>
                  <Globe size={14} />
                  {copy.languageLabel}
                </span>
                <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={copy.languageLabel}>
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="ru">Русский</option>
                </select>
              </label>
            </div>
            <h1>{copy.passwordChangeTitle}</h1>
            <p className="muted">{copy.passwordChangeText}</p>
            <div className="form-grid">
              <label>
                <span>{copy.newPasswordRequiredLabel}</span>
                <input
                  aria-label={copy.newPasswordRequiredLabel}
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>
              <label>
                <span>{copy.confirmPasswordLabel}</span>
                <input
                  aria-label={copy.confirmPasswordLabel}
                  type="password"
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                />
              </label>
              {passwordChangeError && <p className="form-error">{passwordChangeError}</p>}
              {passwordChangeSuccess && <p className="muted">{passwordChangeSuccess}</p>}
              <button type="button" className={`button ${isPasswordChangeReady ? "button-ready" : ""}`.trim()} onClick={() => void handlePasswordChange()}>
                {copy.saveNewPassword}
              </button>
            </div>
          </Panel>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-glow page-glow-one" />
      <div className="page-glow page-glow-two" />
      <main className="layout">
        <header className="hero">
          <div className="hero-main">
            <div className="hero-topline">
              <div className="hero-badge">
                <Building2 size={14} />
                {copy.hotelOperationsPwa}
              </div>
              <div className="session-strip">
                <div className="user-chip">
                  <UserRound size={14} />
                  <span>{copy.signedInAs}</span>
                  <strong>{currentUser.role === "assistant" ? currentUser.displayName : (currentUser.titleKey ? titleLabel(currentUser.titleKey) : roleLabel(currentUser.role))}</strong>
                </div>
                <label className="language-switcher">
                  <span>
                    <Globe size={14} />
                    {copy.languageLabel}
                  </span>
                  <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={copy.languageLabel}>
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="ru">Русский</option>
                  </select>
                </label>
                <button type="button" className="button secondary signout-button" onClick={handleSignOut}>
                  <LogOut size={16} />
                  {copy.signOut}
                </button>
              </div>
            </div>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroDescription}</p>
            <p className="access-note">
              {currentUser.role === "assistant"
                ? copy.accessNoteAssistant
                : currentUser.role === "departmentManager"
                  ? copy.accessNoteDepartmentManager
                  : copy.accessNoteFull}
            </p>
          </div>
          <Panel className="control-panel">
            <div className="control-panel-grid">
              <div className="control-metric">
                <span className="eyebrow">{copy.overallProgress}</span>
                <strong>{overallProgress}%</strong>
              </div>
              <div className="control-metric">
                <span className="eyebrow">{copy.openComplaints}</span>
                <strong>{complaintStats.open}</strong>
              </div>
              <div className="control-metric">
                <span className="eyebrow">{copy.totalTasks}</span>
                <strong>{taskStats.total}</strong>
              </div>
              <div className="control-metric">
                <span className="eyebrow">{copy.criticalComplaints}</span>
                <strong>{complaintStats.critical}</strong>
              </div>
            </div>
            <div className="control-divider" />
            <div className="control-list">
              <div className="control-line">
                <span>{copy.voyageModules}</span>
                <strong>{activeRole?.modules?.length ?? 0}</strong>
              </div>
              <div className="control-line">
                <span>{copy.sections}</span>
                <strong>{tabs.length}</strong>
              </div>
              <div className="control-line">
                <span>{copy.roles[currentUser.role]}</span>
                <strong>{activeRole.showAudit ? copy.fullAccess : copy.limitedAccess}</strong>
              </div>
            </div>
          </Panel>
        </header>

        <section className="metrics-grid compact">
          <MetricCard
            title={copy.totalTasks}
            value={taskStats.total}
            icon={CheckSquare}
            sub={copy.totalTasksSub}
            onClick={() => openTaskView({ type: "all", status: "all", search: "" })}
          />
          <MetricCard
            title={copy.activeTasks}
            value={taskStats.active}
            icon={Clock3}
            sub={copy.activeTasksSub}
            onClick={() => openTaskView({ type: "all", status: "In Progress", search: "" })}
          />
          <MetricCard
            title={copy.resolvedComplaints}
            value={complaintStats.resolved}
            icon={CheckCircle2}
            sub={copy.resolvedComplaintsSub}
            onClick={() => openComplaintView({ status: "Resolved", severity: "all", search: "" })}
          />
          <MetricCard
            title={copy.criticalComplaints}
            value={complaintStats.critical}
            icon={AlertTriangle}
            sub={copy.criticalComplaintsSub}
            onClick={() => openComplaintView({ status: "all", severity: "Critical", search: "" })}
          />
        </section>

        <nav className="tabbar command-tabs" aria-label={copy.sections}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === visibleTab ? "tab active" : "tab"}
              onClick={() => {
                setActiveTab(tab.id);
                logAction("actionTab", tab.label);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {visibleTab === "dashboard" && (
          <section className="content-grid">
            <Panel className="span-2">
              <div className="panel-heading">
                <h2>
                  <ClipboardList size={18} /> {copy.todayFocus}
                </h2>
              </div>
              <div className="stack">
                {filteredTasks.slice(0, 5).map((task) => (
                  <article key={task.id} className="item-card">
                    <div className="row space-between top">
                      <div>
                        <div className="badge-row">
                          <strong>{localizeTaskTitle(task)}</strong>
                          <span className={statusTone[task.status]}>{localizeStatus(task.status)}</span>
                          <span className={priorityTone[task.priority]}>{localizePriority(task.priority)}</span>
                        </div>
                        <p className="muted">
                          {localizeDepartment(task.department)} | {task.owner || copy.unassigned} | {task.dueDate ? formatDate(task.dueDate) : copy.noDate}
                        </p>
                      </div>
                      {activeRole.tabs.includes("tasks") && (
                        <button type="button" className="button secondary" onClick={() => toggleTaskDone(task.id)}>
                          {copy.toggleDone}
                        </button>
                      )}
                    </div>
                    <div className="stack compact">
                      <ProgressBar value={task.progress} />
                      <p className="muted">{localizeTaskNotes(task)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="panel-heading">
                <h2>
                  <CalendarDays size={18} /> {copy.planningSummary}
                </h2>
              </div>
              <div className="stack">
                <div className="stat-block"><p className="eyebrow">{copy.dailyTasks}</p><p className="hero-value">{taskStats.daily}</p></div>
                <div className="stat-block"><p className="eyebrow">{copy.completedTasks}</p><p className="hero-value">{taskStats.done}</p></div>
                <div className="stat-block"><p className="eyebrow">{copy.openComplaints}</p><p className="hero-value">{complaintStats.open}</p></div>
              </div>
            </Panel>

            {(isDepartmentManager || isAdminUser) && (
              <Panel>
                <div className="panel-heading">
                  <h2>
                    <AlertTriangle size={18} /> {copy.notificationsTitle}
                  </h2>
                </div>
                <p className="muted module-intro">{copy.notificationsText}</p>
                <div className="stack">
                  <div className="control-line">
                    <span>{copy.unreadNotifications}</span>
                    <strong>{unreadNotifications.length}</strong>
                  </div>
                  {"Notification" in window && Notification.permission !== "granted" && (
                    <button type="button" className="button secondary" onClick={() => void requestNotificationPermission()}>
                      {copy.allowNotifications}
                    </button>
                  )}
                  {notifications.length === 0 && <p className="muted">{copy.noNotifications}</p>}
                  {notifications.slice(0, 4).map((item) => (
                    <article key={item.id} className="item-card">
                      <div className="row space-between top">
                        <div className="stack compact">
                          <strong>{localizeAgendaTitle(item.title)}</strong>
                          <p className="muted">{localizeDepartment(item.department)} | {formatDate(item.createdAt)}</p>
                          <p>{item.message}</p>
                        </div>
                        {!item.readAt && (
                          <button type="button" className="button secondary slim-button" onClick={() => void markNotificationRead(item.id)}>
                            {copy.markAsRead}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>
            )}

          </section>
        )}

        {visibleTab === "tasks" && (
          <section className="content-grid">
            <Panel className="span-2">
              <div className="panel-heading split">
                <h2>{copy.todoPlanningBoard}</h2>
                <div className="toolbar">
                  <button type="button" className="button secondary slim-button" onClick={saveTaskList}>
                    {copy.saveList}
                  </button>
                  <button type="button" className="button secondary slim-button" onClick={exportTaskList}>
                    {copy.exportList}
                  </button>
                  <label className="searchbox">
                    <Search size={16} />
                    <input value={taskSearch} onChange={(event) => setTaskSearch(event.target.value)} placeholder={copy.searchTask} />
                  </label>
                  <select value={taskTypeFilter} onChange={(event) => setTaskTypeFilter(event.target.value)}>
                    <option value="all">{copy.allTypes}</option>
                    <option value="daily">{copy.daily}</option>
                    <option value="periodic">{copy.periodic}</option>
                  </select>
                  <select aria-label={copy.taskStatusFilter} value={taskStatusFilter} onChange={(event) => setTaskStatusFilter(event.target.value)}>
                    <option value="all">{copy.allTaskStatuses}</option>
                    <option value="Not Started">{localizeStatus("Not Started")}</option>
                    <option value="Planned">{localizeStatus("Planned")}</option>
                    <option value="In Progress">{localizeStatus("In Progress")}</option>
                    <option value="Done">{localizeStatus("Done")}</option>
                  </select>
                </div>
              </div>
              {taskListStatus && <p className="muted top-gap">{taskListStatus}</p>}
              <div className="stack">
                {filteredTasks.map((task) => (
                  <article key={task.id} className="item-card">
                    <div className="row space-between top">
                      <div className="stack compact">
                        <div className="badge-row">
                          <strong>{localizeTaskTitle(task)}</strong>
                          <span className="tag tag-outline">{localizeTaskType(task.type)}</span>
                          <span className={statusTone[task.status]}>{localizeStatus(task.status)}</span>
                          <span className={priorityTone[task.priority]}>{localizePriority(task.priority)}</span>
                        </div>
                        <p className="muted">{localizeDepartment(task.department)} | {task.owner || copy.unassigned} | {copy.duePrefix}: {task.dueDate ? formatDate(task.dueDate) : copy.notSet}</p>
                        <p>{localizeTaskNotes(task)}</p>
                      </div>
                      <label className="check-toggle">
                        <input type="checkbox" checked={task.status === "Done"} onChange={() => toggleTaskDone(task.id)} />
                        <span>{copy.done}</span>
                      </label>
                    </div>
                    <div className="stack compact">
                      <div className="row space-between"><span className="eyebrow">{copy.progress}</span><span className="eyebrow">{task.progress}%</span></div>
                      <ProgressBar value={task.progress} />
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="panel-heading">
                <h2><Plus size={18} /> {copy.addNewTask}</h2>
              </div>
              <div className="form-grid">
                <label><span>{copy.taskTitle}</span><input aria-label={copy.taskTitle} value={newTask.title} onChange={(event) => setNewTask({ ...newTask, title: event.target.value })} placeholder={copy.taskTitlePlaceholder} /></label>
                <div className="two-col">
                  <label><span>{copy.type}</span><select value={newTask.type} onChange={(event) => setNewTask({ ...newTask, type: event.target.value })}><option value="daily">{copy.daily}</option><option value="periodic">{copy.periodic}</option></select></label>
                  <label><span>{copy.priority}</span><select value={newTask.priority} onChange={(event) => setNewTask({ ...newTask, priority: event.target.value })}><option value="Low">{localizePriority("Low")}</option><option value="Medium">{localizePriority("Medium")}</option><option value="High">{localizePriority("High")}</option></select></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.department}</span><select value={newTask.department} disabled={isDepartmentManager} onChange={(event) => setNewTask({ ...newTask, department: event.target.value })}>{availableDepartmentOptions.map((key) => <option key={key} value={key}>{localizeDepartment(key)}</option>)}</select></label>
                <label><span>{copy.owner}</span><input value={newTask.owner} onChange={(event) => setNewTask({ ...newTask, owner: event.target.value })} placeholder={copy.owner} /></label>
                </div>
                <label><span>{copy.dueDate}</span><input type="date" value={newTask.dueDate} onChange={(event) => setNewTask({ ...newTask, dueDate: event.target.value })} /></label>
                <label><span>{copy.notes}</span><textarea value={newTask.notes} onChange={(event) => setNewTask({ ...newTask, notes: event.target.value })} rows="5" placeholder={copy.notesPlaceholder} /></label>
                <button type="button" className={`button ${isTaskReady ? "button-ready" : ""}`.trim()} onClick={addTask}>{copy.addTask}</button>
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "complaints" && (
          <section className="content-grid">
            <Panel className="span-2">
              <div className="panel-heading split">
                <h2>{copy.complaintTracking}</h2>
                <div className="toolbar">
                  <button type="button" className="button secondary slim-button" onClick={saveComplaintList}>
                    {copy.saveList}
                  </button>
                  <button type="button" className="button secondary slim-button" onClick={exportComplaintList}>
                    {copy.exportList}
                  </button>
                  <label className="searchbox">
                    <Search size={16} />
                    <input value={complaintSearch} onChange={(event) => setComplaintSearch(event.target.value)} placeholder={copy.searchComplaint} />
                  </label>
                  <select value={complaintStatusFilter} onChange={(event) => setComplaintStatusFilter(event.target.value)}>
                    <option value="all">{copy.allStatuses}</option>
                    <option value="Open">{localizeStatus("Open")}</option>
                    <option value="In Review">{localizeStatus("In Review")}</option>
                    <option value="Resolved">{localizeStatus("Resolved")}</option>
                  </select>
                  <select aria-label={copy.complaintDepartmentFilter} value={complaintDepartmentFilter} onChange={(event) => {
                    const nextDepartment = event.target.value;
                    setComplaintDepartmentFilter(nextDepartment);
                    if (nextDepartment === "all") {
                      setComplaintCategoryFilter("all");
                      return;
                    }
                    const nextCategories = complaintCategoriesForDepartment(nextDepartment);
                    if (!nextCategories.includes(complaintCategoryFilter)) {
                      setComplaintCategoryFilter("all");
                    }
                  }}>
                    <option value="all">{copy.allDepartments}</option>
                    {complaintDepartmentOptions.map((key) => <option key={key} value={key}>{localizeDepartment(key)}</option>)}
                  </select>
                  <select aria-label={copy.category} value={complaintCategoryFilter} onChange={(event) => setComplaintCategoryFilter(event.target.value)}>
                    <option value="all">{copy.allComplaintCategories}</option>
                    {visibleComplaintCategoryOptions.map((key) => <option key={key} value={key}>{localizeCategory(key)}</option>)}
                  </select>
                  <select aria-label={copy.complaintChannelFilter} value={complaintChannelFilter} onChange={(event) => setComplaintChannelFilter(event.target.value)}>
                    <option value="all">{copy.allChannels}</option>
                    {Object.keys(copy.channels).map((key) => <option key={key} value={key}>{localizeChannel(key)}</option>)}
                  </select>
                  <select aria-label={copy.complaintSeverityFilter} value={complaintSeverityFilter} onChange={(event) => setComplaintSeverityFilter(event.target.value)}>
                    <option value="all">{copy.allSeverities}</option>
                    <option value="Low">{localizePriority("Low")}</option>
                    <option value="Medium">{localizePriority("Medium")}</option>
                    <option value="High">{localizePriority("High")}</option>
                    <option value="Critical">{localizePriority("Critical")}</option>
                  </select>
                </div>
              </div>
              {complaintListStatus && <p className="muted top-gap">{complaintListStatus}</p>}
              <div className="stack">
                {filteredComplaints.map((item) => (
                  <article key={item.id} className="item-card">
                    <div className="stack compact">
                      <div className="badge-row">
                        <strong>{item.guest}</strong>
                        <span className={statusTone[item.status]}>{localizeStatus(item.status)}</span>
                        <span className={priorityTone[item.severity]}>{localizePriority(item.severity)}</span>
                        <span className="tag tag-outline">{localizeCategory(item.category)}</span>
                      </div>
                      <p className="muted">{localizeDepartment(item.department)} | {localizeChannel(item.channel)} | {formatDate(item.date)}</p>
                      <p>{localizeSummary(item)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
            <Panel>
              <div className="panel-heading">
                <h2><MessageSquareWarning size={18} /> {copy.addComplaint}</h2>
              </div>
              <div className="form-grid">
                <label><span>{copy.guestOrCase}</span><input aria-label={copy.guestOrCase} value={newComplaint.guest} onChange={(event) => { setNewComplaint({ ...newComplaint, guest: event.target.value }); setComplaintFormError(""); }} placeholder={copy.guestOrCase} /></label>
                <div className="two-col">
                  <label><span>{copy.category}</span><select value={newComplaint.category} onChange={(event) => setNewComplaint({ ...newComplaint, category: event.target.value })}>{formComplaintCategoryOptions.map((key) => <option key={key} value={key}>{localizeCategory(key)}</option>)}</select></label>
                  <label><span>{copy.severity}</span><select value={newComplaint.severity} onChange={(event) => setNewComplaint({ ...newComplaint, severity: event.target.value })}><option value="Low">{localizePriority("Low")}</option><option value="Medium">{localizePriority("Medium")}</option><option value="High">{localizePriority("High")}</option><option value="Critical">{localizePriority("Critical")}</option></select></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.channel}</span><select value={newComplaint.channel} onChange={(event) => setNewComplaint({ ...newComplaint, channel: event.target.value })}>{Object.keys(copy.channels).map((key) => <option key={key} value={key}>{localizeChannel(key)}</option>)}</select></label>
                  <label><span>{copy.date}</span><input type="date" value={newComplaint.date} onChange={(event) => setNewComplaint({ ...newComplaint, date: event.target.value })} /></label>
                </div>
                <label><span>{copy.department}</span><select value={newComplaint.department} disabled={isDepartmentManager} onChange={(event) => {
                  const nextDepartment = event.target.value;
                  setNewComplaint({
                    ...newComplaint,
                    department: nextDepartment,
                    category: complaintCategoriesByDepartment[nextDepartment]?.[0] ?? newComplaint.category,
                  });
                }}>{complaintDepartmentOptions.map((key) => <option key={key} value={key}>{localizeDepartment(key)}</option>)}</select></label>
                <label><span>{copy.summary}</span><textarea aria-label={copy.summary} rows="5" value={newComplaint.summary} onChange={(event) => { setNewComplaint({ ...newComplaint, summary: event.target.value }); setComplaintFormError(""); }} placeholder={copy.summaryPlaceholder} /></label>
                {complaintFormError && <p className="form-error">{complaintFormError}</p>}
                <button type="button" className={`button ${isComplaintReady ? "button-ready" : ""}`.trim()} onClick={addComplaint}>{copy.addComplaint}</button>
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "orders" && (
          <section className="content-grid">
            <Panel className="span-2">
              <div className="panel-heading split">
                <h2>
                  <ClipboardList size={18} /> {copy.ordersTitle}
                </h2>
                <div className="toolbar">
                  <button type="button" className="button secondary slim-button" onClick={saveOrders}>
                    {copy.saveOrders}
                  </button>
                  <button type="button" className="button secondary slim-button" onClick={printOrders}>
                    {copy.printOrders}
                  </button>
                  <button type="button" className="button secondary slim-button" onClick={exportOrders}>
                    {copy.exportOrders}
                  </button>
                </div>
              </div>
              <p className="muted module-intro">{copy.ordersText}</p>
              {ordersStatus && <p className="muted top-gap">{ordersStatus}</p>}
              <div className="orders-overview top-gap">
                {orderExportSections.map((type) => (
                  <article key={`${type}-overview`} className="orders-overview-card">
                    <span className="eyebrow">
                      {type === "fruitWine"
                        ? copy.fruitWine
                        : type === "roomDecoration"
                            ? copy.roomDecoration
                          : copy.specialRequest}
                    </span>
                    <strong>{groupedOrders[type].length}</strong>
                  </article>
                ))}
              </div>
              <div className="spec-grid top-gap orders-grid">
                {orderExportSections.map((type) => (
                  <article key={type} className="spec-card orders-card">
                    <div className="orders-card-header">
                      <div className="orders-card-title">
                        <span className="orders-card-kicker">{copy.ordersTab}</span>
                        <h2>
                          {type === "fruitWine"
                            ? copy.fruitWine
                            : type === "roomDecoration"
                                ? copy.roomDecoration
                              : copy.specialRequest}
                        </h2>
                      </div>
                      <span className="tag tag-outline">
                        {groupedOrders[type].length}
                      </span>
                    </div>
                    <div className="orders-form-shell orders-form-shell-highlight">
                      <p className="eyebrow orders-form-eyebrow">{copy.addOrder}</p>
                      <div className="form-grid">
                        <label>
                          <span>{copy.roomNumberFixed}</span>
                          <input
                            aria-label={`${copy.roomNumberFixed} ${type}`}
                            value={newOrders[type].roomNumber}
                            onChange={(event) => setNewOrders((current) => ({
                              ...current,
                              [type]: { ...current[type], roomNumber: event.target.value },
                            }))}
                            placeholder={copy.roomNumberFixed}
                          />
                        </label>
                        <textarea
                          aria-label={`${type} note`}
                          rows="4"
                          value={newOrders[type].note}
                          onChange={(event) => setNewOrders((current) => ({
                            ...current,
                            [type]: { ...current[type], note: event.target.value },
                          }))}
                          placeholder={copy.notesPlaceholder}
                        />
                        <button
                          type="button"
                          className={`button secondary ${isOrderReady(type) ? "button-ready" : ""}`.trim()}
                          onClick={() => addOrder(type)}
                        >
                          {copy.addOrder}
                        </button>
                      </div>
                    </div>
                    <div className="orders-list-header">
                      <span>{copy.roomNumberFixed}</span>
                      <span>{copy.notes}</span>
                    </div>
                    <div className="stack compact orders-list">
                      {groupedOrders[type].length === 0 && <p className="muted">{copy.notSet}</p>}
                      {groupedOrders[type].map((item) => (
                        <article key={item.id} className="item-card orders-item">
                          <strong>{item.roomNumber}</strong>
                          <span>{item.note || "-"}</span>
                        </article>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "alacarte" && (
          <section className="alacarte-layout">
            <Panel className="span-2 alacarte-table-panel">
              <div className="panel-heading split">
                <h2>
                  <CalendarDays size={18} /> {copy.alaCarteTitle}
                </h2>
                <div className="toolbar">
                  <button type="button" className="button secondary slim-button" onClick={saveAlaCarteLists}>
                    {copy.saveList}
                  </button>
                  <button type="button" className="button secondary slim-button" onClick={exportAlaCarteLists}>
                    {copy.exportList}
                  </button>
                </div>
              </div>
              <p className="muted module-intro">{copy.alaCarteText}</p>
              {alaCarteListStatus && <p className="muted top-gap">{alaCarteListStatus}</p>}
              <div className="data-table">
                <div className="data-row data-head">
                  <span>{copy.venueName}</span>
                  <span>{copy.activeStatus}</span>
                  <span>{copy.openTime}</span>
                  <span>{copy.lastArrival}</span>
                  <span>{copy.coverPrice}</span>
                  <span>{copy.maxGuests}</span>
                  <span>{copy.workingDays}</span>
                </div>
                {alaCarteVenues.map((restaurant) => (
                  <div key={restaurant.id} className="data-row">
                    <span>
                      <strong>{restaurant.name}</strong>
                      <small>{localizeVenueCuisine(restaurant.cuisine)}</small>
                    </span>
                    <span>{restaurant.active ? copy.active : copy.passive}</span>
                    <span>{restaurant.openingTime}</span>
                    <span>{restaurant.lastArrival}</span>
                    <span>{restaurant.coverPrice} {restaurant.currency}</span>
                    <span>{restaurant.maxGuests}</span>
                    <span>{restaurant.workingDays.map((day) => localizeWeekdayShort(day)).join(", ")}</span>
                  </div>
                ))}
              </div>
              <div className="alacarte-operational-grid">
                <article className="spec-card">
                  <div className="panel-heading">
                    <h2>{diningCopy.reservationStatusBoard}</h2>
                  </div>
                  <div className="status-board">
                    {reservationStatusCounts.map((item) => (
                      <div key={item.status} className="status-card">
                        <span className="eyebrow">{item.status}</span>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="data-table compact-table">
                    <div className="data-row data-head reservation-row">
                      <span>{diningCopy.guestName}</span>
                      <span>{copy.venueName}</span>
                      <span>{diningCopy.reservationDate}</span>
                      <span>{diningCopy.slotTime}</span>
                      <span>{diningCopy.reservationStatus}</span>
                      <span>{diningCopy.partySize}</span>
                    </div>
                    {upcomingReservations.map((reservation) => {
                      const venue = alaCarteVenues.find((item) => item.id === reservation.venueId);
                      return (
                        <div key={reservation.id} className="data-row reservation-row">
                          <span>
                            <strong>{reservation.guestName}</strong>
                            <small>{reservation.roomNumber}</small>
                          </span>
                          <span>{venue?.name ?? reservation.venueId}</span>
                          <span>{formatDate(reservation.reservationDate)}</span>
                          <span>{reservation.slotTime}</span>
                          <span>{localizeReservationStatus(reservation.status)}</span>
                          <span>{reservation.partySize}</span>
                          <button type="button" className="button secondary slim-button row-action" onClick={() => cycleReservationStatus(reservation.id)}>
                            {diningCopy.reservationFlow}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </article>
                <article className="spec-card">
                  <div className="panel-heading">
                    <h2>{diningCopy.waitlist}</h2>
                  </div>
                  <div className="waitlist-stack">
                    {alaCarteWaitlist.map((entry) => {
                      const venue = alaCarteVenues.find((item) => item.id === entry.venueId);
                      return (
                        <div key={entry.id} className="waitlist-card">
                          <div>
                            <strong>{entry.guestName}</strong>
                            <p className="muted">{venue?.name ?? entry.venueId} | {entry.preferredWindow} | {entry.partySize}</p>
                          </div>
                          <div className="spec-actions">
                            <span className="tag tag-outline">{localizeWaitlistPriority(entry.priority)}</span>
                            <span className={entry.status === "Waiting" ? statusTone.Open : statusTone.Resolved}>{localizeWaitlistStatus(entry.status)}</span>
                            {entry.status === "Waiting" && (
                              <button type="button" className="button secondary slim-button" onClick={() => convertWaitlistToReservation(entry.id)}>
                                {diningCopy.moveToReservation}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              </div>
              <div className="spec-grid">
                {alaCarteVenues.map((restaurant) => (
                  <article key={`${restaurant.id}-spec`} className="spec-card">
                    <div className="spec-header">
                      <div>
                        <strong>{restaurant.name}</strong>
                        <p className="muted">{copy.cuisine}: {localizeVenueCuisine(restaurant.cuisine)}</p>
                      </div>
                      <span className={restaurant.active ? "tag tag-green" : "tag tag-slate"}>
                        {restaurant.active ? copy.active : copy.passive}
                      </span>
                    </div>
                    <div className="spec-pairs">
                      <div><span className="eyebrow">{copy.openTime}</span><p>{restaurant.openingTime}</p></div>
                      <div><span className="eyebrow">{copy.lastArrival}</span><p>{restaurant.lastArrival}</p></div>
                      <div><span className="eyebrow">{copy.coverPrice}</span><p>{restaurant.coverPrice} {restaurant.currency}</p></div>
                      <div><span className="eyebrow">{copy.childPolicy}</span><p>{localizeVenueChildPolicy(restaurant.childPolicy)}</p></div>
                      <div><span className="eyebrow">{copy.cancellationWindow}</span><p>{localizeVenueDuration(restaurant.cancellationWindow)}</p></div>
                      <div><span className="eyebrow">{copy.closeSaleWindow}</span><p>{localizeVenueDuration(restaurant.closeSaleWindow)}</p></div>
                      <div><span className="eyebrow">{copy.roomNightLimit}</span><p>{restaurant.roomNightLimit}</p></div>
                      <div><span className="eyebrow">{copy.areaPreference}</span><p>{restaurant.areaPreference ? copy.yes : copy.no}</p></div>
                      <div><span className="eyebrow">{copy.mixedTable}</span><p>{restaurant.mixedTable ? copy.yes : copy.no}</p></div>
                      <div><span className="eyebrow">{copy.includeOtherRooms}</span><p>{restaurant.includeOtherRooms ? copy.yes : copy.no}</p></div>
                      <div><span className="eyebrow">{copy.tableSetup}</span><p>{localizeVenueTableSetup(restaurant.tableSetup)}</p></div>
                    </div>
                    <div className="spec-note">
                      <span className="eyebrow">{copy.operationalNote}</span>
                      <p>{localizeVenueNote(restaurant.note)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
            <Panel className="alacarte-side-panel">
              <div className="panel-heading">
                <h2>
                  <BarChart3 size={18} /> {copy.alaCarteRestaurants}
                </h2>
              </div>
              <p className="muted module-intro">{copy.alaCarteSystemText}</p>
              <div className="stack compact">
                <div className="control-line"><span>{copy.activeVenues}</span><strong>{alaCarteStats.activeCount} / {alaCarteVenues.length}</strong></div>
                <div className="control-line"><span>{copy.coverPrice}</span><strong>{alaCarteStats.averagePrice} EUR</strong></div>
                <div className="control-line"><span>{copy.maxGuests}</span><strong>{alaCarteStats.maxGuests}</strong></div>
                <div className="control-line"><span>{copy.occupancy}</span><strong>{alaCarteStats.averageOccupancy}%</strong></div>
                <div className="control-line"><span>{copy.quickRules}</span><strong>{alaCarteVenues.filter((item) => item.areaPreference || item.mixedTable).length}</strong></div>
                <div className="control-line"><span>{diningCopy.reservations}</span><strong>{alaCarteStats.reservationCount}</strong></div>
                <div className="control-line"><span>{diningCopy.waitlist}</span><strong>{alaCarteStats.waitlistCount}</strong></div>
                <div className="control-line"><span>{diningCopy.noShowRisk}</span><strong>{alaCarteStats.noShowRiskCount}</strong></div>
              </div>
              <div className="spec-note side-note">
                <span className="eyebrow">{copy.runtimeLabel}</span>
                <p>{copy.runtimeText}</p>
              </div>
              {alaCarteStatusMessage && <p className="muted top-gap">{alaCarteStatusMessage}</p>}
              <div className="form-grid top-gap">
                <h3>{diningCopy.addReservation}</h3>
                <label><span>{copy.venueName}</span><select aria-label={copy.venueName} value={newReservation.venueId} onChange={(event) => setNewReservation({ ...newReservation, venueId: event.target.value })}>{alaCarteVenues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></label>
                <div className="two-col">
                  <label><span>{diningCopy.guestName}</span><input aria-label={diningCopy.guestName} value={newReservation.guestName} onChange={(event) => setNewReservation({ ...newReservation, guestName: event.target.value })} /></label>
                  <label><span>{diningCopy.roomNumber}</span><input aria-label={diningCopy.roomNumber} value={newReservation.roomNumber} onChange={(event) => setNewReservation({ ...newReservation, roomNumber: event.target.value })} /></label>
                </div>
                <div className="two-col">
                  <label><span>{diningCopy.partySize}</span><input aria-label={diningCopy.partySize} type="number" value={newReservation.partySize} onChange={(event) => setNewReservation({ ...newReservation, partySize: Number(event.target.value) })} /></label>
                  <label><span>{diningCopy.source}</span><select value={newReservation.source} onChange={(event) => setNewReservation({ ...newReservation, source: event.target.value })}><option value="App">{diningCopy.sources.app}</option><option value="Guest Relations">{diningCopy.sources.guestRelations}</option><option value="Front Office">{diningCopy.sources.frontOffice}</option><option value="Manager">{diningCopy.sources.manager}</option></select></label>
                </div>
                <div className="two-col">
                  <label><span>{diningCopy.reservationDate}</span><input type="date" value={newReservation.reservationDate} onChange={(event) => setNewReservation({ ...newReservation, reservationDate: event.target.value })} /></label>
                  <label><span>{diningCopy.slotTime}</span><input type="time" value={newReservation.slotTime} onChange={(event) => setNewReservation({ ...newReservation, slotTime: event.target.value })} /></label>
                </div>
                <label><span>{copy.operationalNote}</span><textarea rows="3" value={newReservation.note} onChange={(event) => setNewReservation({ ...newReservation, note: event.target.value })} placeholder={copy.operationalNotePlaceholder} /></label>
                {alaCarteFormError && <p className="form-error">{alaCarteFormError}</p>}
                <button type="button" className={`button ${isReservationReady ? "button-ready" : ""}`.trim()} onClick={addAlaCarteReservation}>{diningCopy.addReservation}</button>
              </div>
              <div className="form-grid top-gap">
                <h3>{diningCopy.addWaitlist}</h3>
                <label><span>{copy.venueName}</span><select value={newWaitlistEntry.venueId} onChange={(event) => setNewWaitlistEntry({ ...newWaitlistEntry, venueId: event.target.value })}>{alaCarteVenues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></label>
                <div className="two-col">
                  <label><span>{diningCopy.guestName}</span><input aria-label={`${diningCopy.guestName} waitlist`} value={newWaitlistEntry.guestName} onChange={(event) => setNewWaitlistEntry({ ...newWaitlistEntry, guestName: event.target.value })} /></label>
                  <label><span>{diningCopy.roomNumber}</span><input value={newWaitlistEntry.roomNumber} onChange={(event) => setNewWaitlistEntry({ ...newWaitlistEntry, roomNumber: event.target.value })} /></label>
                </div>
                <div className="two-col">
                  <label><span>{diningCopy.partySize}</span><input type="number" value={newWaitlistEntry.partySize} onChange={(event) => setNewWaitlistEntry({ ...newWaitlistEntry, partySize: Number(event.target.value) })} /></label>
                  <label><span>{diningCopy.waitlistPriority}</span><select value={newWaitlistEntry.priority} onChange={(event) => setNewWaitlistEntry({ ...newWaitlistEntry, priority: event.target.value })}><option value="VIP">{diningCopy.vip}</option><option value="Family">{diningCopy.family}</option><option value="Regular">{diningCopy.regular}</option></select></label>
                </div>
                <div className="two-col">
                  <label><span>{diningCopy.reservationDate}</span><input type="date" value={newWaitlistEntry.preferredDate} onChange={(event) => setNewWaitlistEntry({ ...newWaitlistEntry, preferredDate: event.target.value })} /></label>
                  <label><span>{diningCopy.waitlistWindow}</span><input value={newWaitlistEntry.preferredWindow} onChange={(event) => setNewWaitlistEntry({ ...newWaitlistEntry, preferredWindow: event.target.value })} /></label>
                </div>
                <button type="button" className={`button secondary ${isWaitlistReady ? "button-ready" : ""}`.trim()} onClick={addWaitlistEntry}>{diningCopy.addWaitlist}</button>
              </div>
              <div className="form-grid top-gap">
                <h3>{diningCopy.settingsTitle}</h3>
                <p className="muted">{diningCopy.settingsText}</p>
                <label>
                  <span>{diningCopy.selectVenue}</span>
                  <select value={selectedVenueId} onChange={(event) => setSelectedVenueId(event.target.value)}>
                    {alaCarteVenues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
                  </select>
                </label>
                <div className="two-col">
                  <label><span>{copy.activeStatus}</span><select value={venueSettings.active ? "active" : "passive"} onChange={(event) => setVenueSettings({ ...venueSettings, active: event.target.value === "active" })}><option value="active">{copy.active}</option><option value="passive">{copy.passive}</option></select></label>
                  <label><span>{copy.coverPrice}</span><input type="number" value={venueSettings.coverPrice} onChange={(event) => setVenueSettings({ ...venueSettings, coverPrice: Number(event.target.value) })} /></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.openTime}</span><input type="time" value={venueSettings.openingTime} onChange={(event) => setVenueSettings({ ...venueSettings, openingTime: event.target.value })} /></label>
                  <label><span>{copy.lastArrival}</span><input type="time" value={venueSettings.lastArrival} onChange={(event) => setVenueSettings({ ...venueSettings, lastArrival: event.target.value })} /></label>
                </div>
                <div className="form-grid">
                  <span className="eyebrow">{copy.workingDays}</span>
                  <div className="shift-calendar-chip-list">
                    {Object.keys(copy.weekdaysShort).map((dayKey) => (
                      <label key={dayKey} className="permission-option">
                        <input
                          type="checkbox"
                          checked={venueSettings.workingDays.includes(dayKey)}
                          onChange={(event) => setVenueSettings((current) => ({
                            ...current,
                            workingDays: event.target.checked
                              ? [...current.workingDays, dayKey]
                              : current.workingDays.filter((item) => item !== dayKey),
                          }))}
                        />
                        <span>{localizeWeekdayShort(dayKey)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="two-col">
                  <label><span>{copy.childPolicy}</span><input value={venueSettings.childPolicy} onChange={(event) => setVenueSettings({ ...venueSettings, childPolicy: event.target.value })} /></label>
                  <label><span>{copy.tableSetup}</span><input value={venueSettings.tableSetup} onChange={(event) => setVenueSettings({ ...venueSettings, tableSetup: event.target.value })} /></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.cancellationWindow}</span><input value={venueSettings.cancellationWindow} onChange={(event) => setVenueSettings({ ...venueSettings, cancellationWindow: event.target.value })} /></label>
                  <label><span>{copy.closeSaleWindow}</span><input value={venueSettings.closeSaleWindow} onChange={(event) => setVenueSettings({ ...venueSettings, closeSaleWindow: event.target.value })} /></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.roomNightLimit}</span><input type="number" value={venueSettings.roomNightLimit} onChange={(event) => setVenueSettings({ ...venueSettings, roomNightLimit: Number(event.target.value) })} /></label>
                  <label><span>{copy.includeOtherRooms}</span><select value={venueSettings.includeOtherRooms ? "yes" : "no"} onChange={(event) => setVenueSettings({ ...venueSettings, includeOtherRooms: event.target.value === "yes" })}><option value="yes">{copy.yes}</option><option value="no">{copy.no}</option></select></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.areaPreference}</span><select value={venueSettings.areaPreference ? "yes" : "no"} onChange={(event) => setVenueSettings({ ...venueSettings, areaPreference: event.target.value === "yes" })}><option value="yes">{copy.yes}</option><option value="no">{copy.no}</option></select></label>
                  <label><span>{copy.mixedTable}</span><select value={venueSettings.mixedTable ? "yes" : "no"} onChange={(event) => setVenueSettings({ ...venueSettings, mixedTable: event.target.value === "yes" })}><option value="yes">{copy.yes}</option><option value="no">{copy.no}</option></select></label>
                </div>
                <label><span>{copy.operationalNote}</span><textarea rows="3" value={venueSettings.note} onChange={(event) => setVenueSettings({ ...venueSettings, note: event.target.value })} placeholder={copy.operationalNotePlaceholder} /></label>
                <button type="button" className={`button secondary ${isVenueSettingsReady ? "button-ready" : ""}`.trim()} onClick={saveAlaCarteSettings}>{diningCopy.saveSettings}</button>
              </div>
              <article className="spec-card top-gap">
                <div className="panel-heading">
                  <h2>{diningCopy.serviceSlots}</h2>
                </div>
                <div className="waitlist-stack">
                  {alaCarteServiceSlots.map((slot) => {
                    const venue = alaCarteVenues.find((item) => item.id === slot.venueId);
                    const availableSeats = Math.max(0, slot.maxCovers - slot.bookedCovers);
                    return (
                      <div key={slot.id} className="waitlist-card">
                        <div>
                          <strong>{venue?.name ?? slot.venueId} | {formatDate(slot.date)} | {slot.time}</strong>
                          <p className="muted">{diningCopy.availableSeats}: {availableSeats} | {diningCopy.waitlist}: {slot.waitlistCount}</p>
                        </div>
                        <div className="spec-actions">
                          <span className="tag tag-outline">{slot.bookedCovers}/{slot.maxCovers}</span>
                          <button type="button" className="button secondary slim-button" onClick={() => increaseSlotCapacity(slot.id)}>
                            {diningCopy.increaseCapacity}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
              <div className="form-grid top-gap">
                <h3>{diningCopy.addServiceSlot}</h3>
                <div className="two-col">
                  <label><span>{diningCopy.selectVenue}</span><select value={newServiceSlot.venueId} onChange={(event) => setNewServiceSlot({ ...newServiceSlot, venueId: event.target.value })}>{alaCarteVenues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></label>
                  <label><span>{diningCopy.slotDate}</span><input type="date" value={newServiceSlot.date} onChange={(event) => setNewServiceSlot({ ...newServiceSlot, date: event.target.value })} /></label>
                </div>
                <div className="two-col">
                  <label><span>{diningCopy.slotTime}</span><input type="time" value={newServiceSlot.time} onChange={(event) => setNewServiceSlot({ ...newServiceSlot, time: event.target.value })} /></label>
                  <label><span>{diningCopy.slotCapacity}</span><input type="number" value={newServiceSlot.maxCovers} onChange={(event) => setNewServiceSlot({ ...newServiceSlot, maxCovers: Number(event.target.value) })} /></label>
                </div>
                <label><span>{diningCopy.slotWaitlist}</span><input type="number" value={newServiceSlot.waitlistCount} onChange={(event) => setNewServiceSlot({ ...newServiceSlot, waitlistCount: Number(event.target.value) })} /></label>
                {alaCarteFormError && <p className="form-error">{alaCarteFormError}</p>}
                <button type="button" className={`button secondary ${isServiceSlotReady ? "button-ready" : ""}`.trim()} onClick={addServiceSlot}>{diningCopy.addServiceSlot}</button>
              </div>
              <div className="form-grid top-gap">
                <label><span>{copy.venueName}</span><input value={newVenue.name} onChange={(event) => setNewVenue({ ...newVenue, name: event.target.value })} /></label>
                <div className="two-col">
                  <label><span>{copy.cuisine}</span><input value={newVenue.cuisine} onChange={(event) => setNewVenue({ ...newVenue, cuisine: event.target.value })} /></label>
                  <label><span>{copy.coverPrice}</span><input type="number" value={newVenue.coverPrice} onChange={(event) => setNewVenue({ ...newVenue, coverPrice: Number(event.target.value) })} /></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.openTime}</span><input type="time" value={newVenue.openingTime} onChange={(event) => setNewVenue({ ...newVenue, openingTime: event.target.value })} /></label>
                  <label><span>{copy.lastArrival}</span><input type="time" value={newVenue.lastArrival} onChange={(event) => setNewVenue({ ...newVenue, lastArrival: event.target.value })} /></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.maxGuests}</span><input type="number" value={newVenue.maxGuests} onChange={(event) => setNewVenue({ ...newVenue, maxGuests: Number(event.target.value) })} /></label>
                  <label><span>{copy.workingDays}</span><input value={newVenue.workingDays} onChange={(event) => setNewVenue({ ...newVenue, workingDays: event.target.value })} /></label>
                </div>
                <label><span>{copy.operationalNote}</span><textarea rows="4" value={newVenue.note} onChange={(event) => setNewVenue({ ...newVenue, note: event.target.value })} placeholder={copy.operationalNotePlaceholder} /></label>
                <button type="button" className={`button ${isVenueReady ? "button-ready" : ""}`.trim()} onClick={addAlaCarteVenue}>{copy.addVenue}</button>
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "shiftPlanner" && (
          <section className="content-grid">
            <Panel>
              <div className="panel-heading">
                <h2>
                  <CalendarDays size={18} /> {shiftCopy.title}
                </h2>
              </div>
              <p className="muted module-intro">{shiftCopy.intro}</p>
              <div className="form-grid">
                <div className="panel-heading top-gap">
                  <h2>{shiftCopy.leadershipSetupTitle}</h2>
                </div>
                <div className="two-col">
                  <label>
                    <span>{shiftCopy.manager}</span>
                    <input
                      aria-label={shiftCopy.manager}
                      value={shiftLeadership.manager.name}
                      onChange={(event) => {
                        setShiftLeadership((current) => ({
                          ...current,
                          manager: { ...current.manager, name: event.target.value },
                        }));
                        setShiftPlannerError("");
                      }}
                    />
                  </label>
                  <label>
                    <span>{shiftCopy.deputy}</span>
                    <input
                      aria-label={shiftCopy.deputy}
                      value={shiftLeadership.deputy.name}
                      onChange={(event) => {
                        setShiftLeadership((current) => ({
                          ...current,
                          deputy: { ...current.deputy, name: event.target.value },
                        }));
                        setShiftPlannerError("");
                      }}
                    />
                  </label>
                </div>
                <div className="two-col">
                  {shiftLeadership.chiefs.slice(0, 2).map((chief, chiefIndex) => (
                    <label key={chief.id}>
                      <span>{shiftCopy.chiefs} {chiefIndex + 1}</span>
                      <input
                        aria-label={`${shiftCopy.chiefs} ${chiefIndex + 1}`}
                        value={chief.name}
                        onChange={(event) => {
                          setShiftLeadership((current) => ({
                            ...current,
                            chiefs: current.chiefs.map((item) => (
                              item.id === chief.id ? { ...item, name: event.target.value } : item
                            )),
                          }));
                          setShiftPlannerError("");
                        }}
                      />
                    </label>
                  ))}
                </div>
                <div className="two-col">
                  {shiftLeadership.chiefs.slice(2, 4).map((chief, chiefIndex) => (
                    <label key={chief.id}>
                      <span>{shiftCopy.chiefs} {chiefIndex + 3}</span>
                      <input
                        aria-label={`${shiftCopy.chiefs} ${chiefIndex + 3}`}
                        value={chief.name}
                        onChange={(event) => {
                          setShiftLeadership((current) => ({
                            ...current,
                            chiefs: current.chiefs.map((item) => (
                              item.id === chief.id ? { ...item, name: event.target.value } : item
                            )),
                          }));
                          setShiftPlannerError("");
                        }}
                      />
                    </label>
                  ))}
                </div>
                <label>
                  <span>{shiftCopy.teamName}</span>
                  <input
                    aria-label={shiftCopy.teamName}
                    value={shiftTeamForm.name}
                    onChange={(event) => {
                      setShiftTeamForm((current) => ({ ...current, name: event.target.value }));
                      setShiftPlannerError("");
                    }}
                  />
                </label>
                <div className="two-col">
                  <label>
                    <span>{shiftCopy.memberOne}</span>
                    <input
                      aria-label={shiftCopy.memberOne}
                      value={shiftTeamForm.members[0]}
                      onChange={(event) => {
                        const nextMembers = [...shiftTeamForm.members];
                        nextMembers[0] = event.target.value;
                        setShiftTeamForm((current) => ({ ...current, members: nextMembers }));
                        setShiftPlannerError("");
                      }}
                    />
                  </label>
                  <label>
                    <span>{shiftCopy.memberTwo}</span>
                    <input
                      aria-label={shiftCopy.memberTwo}
                      value={shiftTeamForm.members[1]}
                      onChange={(event) => {
                        const nextMembers = [...shiftTeamForm.members];
                        nextMembers[1] = event.target.value;
                        setShiftTeamForm((current) => ({ ...current, members: nextMembers }));
                        setShiftPlannerError("");
                      }}
                    />
                  </label>
                </div>
                <div className="two-col">
                  <label>
                    <span>{shiftCopy.memberThree}</span>
                    <input
                      aria-label={shiftCopy.memberThree}
                      value={shiftTeamForm.members[2]}
                      onChange={(event) => {
                        const nextMembers = [...shiftTeamForm.members];
                        nextMembers[2] = event.target.value;
                        setShiftTeamForm((current) => ({ ...current, members: nextMembers }));
                        setShiftPlannerError("");
                      }}
                    />
                  </label>
                </div>
                <div className="panel-heading top-gap">
                  <h2>{shiftCopy.offPlannerTitle}</h2>
                </div>
                <p className="muted">{shiftCopy.offPlannerText}</p>
                <div className="shift-off-grid">
                  {shiftCopy.dayLabels.map((dayLabel, dayIndex) => (
                    <label key={dayLabel}>
                      <span>{dayLabel}</span>
                      <select
                        aria-label={`${dayLabel} ${shiftCopy.offMemberLabel}`}
                        value={shiftTeamForm.offSchedule[dayIndex]}
                        onChange={(event) => {
                          const nextSchedule = [...shiftTeamForm.offSchedule];
                          nextSchedule[dayIndex] = event.target.value;
                          setShiftTeamForm((current) => ({ ...current, offSchedule: nextSchedule }));
                          setShiftPlannerError("");
                        }}
                      >
                        <option value="">{shiftCopy.noOffOption}</option>
                        {shiftTeamForm.members.map((member, memberIndex) => (
                          <option key={`${dayLabel}-${memberIndex}`} value={String(memberIndex)}>
                            {member || `${shiftCopy.offMemberLabel} ${memberIndex + 1}`}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
                {shiftPlannerError && <p className="form-error">{shiftPlannerError}</p>}
                <button type="button" className={`button ${isShiftTeamReady ? "button-ready" : ""}`.trim()} onClick={addShiftTeam}>{shiftCopy.addTeam}</button>
              </div>
            </Panel>

            <Panel>
              <div className="panel-heading">
                <h2>{shiftCopy.teamListTitle}</h2>
              </div>
              <div className="shift-action-row">
                <button type="button" className="button secondary" onClick={saveShiftTeams}>
                  {shiftCopy.saveTeams}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  disabled={shiftTeams.length === 0}
                  onClick={() => exportShiftPlan(shiftPlan, "weekly")}
                >
                  {shiftCopy.exportWeek}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  disabled={shiftTeams.length === 0}
                  onClick={() => exportShiftPlan(monthlyShiftPlan, "monthly")}
                >
                  {shiftCopy.exportMonth}
                </button>
              </div>
              {shiftPlannerStatus && <p className="muted top-gap">{shiftPlannerStatus}</p>}
              <div className="shift-saved-list top-gap">
                {shiftTeams.length === 0 && <p className="muted">{shiftCopy.emptyState}</p>}
                {shiftTeams.map((team) => (
                  <article key={team.id} className="item-card shift-saved-card">
                    <div className="row space-between top">
                      <div className="stack compact">
                        <strong>{team.name}</strong>
                        <p className="muted">{shiftCopy.offScheduleSummary}: {formatShiftOffSummary(team, shiftCopy)}</p>
                      </div>
                      <div className="shift-card-actions">
                        <button
                          type="button"
                          className="button secondary slim-button"
                          onClick={() => setEditingShiftTeamId((current) => (current === team.id ? "" : team.id))}
                        >
                          {editingShiftTeamId === team.id ? shiftCopy.doneEditing : shiftCopy.editTeam}
                        </button>
                        <button type="button" className="button secondary slim-button" onClick={() => removeShiftTeam(team.id)}>
                          {shiftCopy.removeTeam}
                        </button>
                      </div>
                    </div>
                    {editingShiftTeamId === team.id && (
                      <div className="shift-off-grid top-gap">
                        {shiftCopy.dayLabels.map((dayLabel, dayIndex) => (
                          <label key={`${team.id}-${dayLabel}`}>
                            <span>{dayLabel}</span>
                            <select
                              aria-label={`${team.name} ${dayLabel} ${shiftCopy.offMemberLabel}`}
                              value={team.offSchedule?.[dayIndex] ?? ""}
                              onChange={(event) => updateShiftTeamOffMember(team.id, dayIndex, event.target.value)}
                            >
                              <option value="">{shiftCopy.noOffOption}</option>
                              {team.members.map((member, memberIndex) => (
                                <option key={`${team.id}-${dayLabel}-${member}`} value={String(memberIndex)}>
                                  {member}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </Panel>

            {shiftTeams.length === 0 && (
              <Panel className="span-2">
                <p className="muted">{shiftCopy.emptyState}</p>
              </Panel>
            )}

            {shiftTeams.length > 0 && selectedShiftDay && (
              <Panel className="span-2">
                <div className="panel-heading split">
                  <h2>{shiftCopy.dayLabels[selectedShiftDay.dayIndex]} | {shiftCopy.staffingTitle}</h2>
                  <span className="tag tag-outline">
                    {shiftCopy.offTeams}: {selectedShiftDay.offTeams.length ? selectedShiftDay.offTeams.join(", ") : "-"}
                  </span>
                </div>

                <div className="shift-day-switcher">
                  {shiftPlan.days.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      className={`shift-day-button ${selectedShiftDayIndex === day.dayIndex ? "shift-day-button-active" : ""}`.trim()}
                      onClick={() => setSelectedShiftDayIndex(day.dayIndex)}
                    >
                      <span>{shiftCopy.dayLabels[day.dayIndex]}</span>
                      <strong>{formatDate(day.date)}</strong>
                    </button>
                  ))}
                </div>

                <div className="shift-summary-box top-gap">
                  <div className="control-line">
                    <span>{shiftCopy.teamCount}</span>
                    <strong>{shiftTeams.length}</strong>
                  </div>
                  <div className="control-line">
                    <span>{shiftCopy.morningCount}</span>
                    <strong>{selectedShiftDay.stats.morningCount}</strong>
                  </div>
                  <div className="control-line">
                    <span>{shiftCopy.eveningCount}</span>
                    <strong>{selectedShiftDay.stats.eveningCount}</strong>
                  </div>
                  <div className="control-line">
                    <span>{shiftCopy.offCount}</span>
                    <strong>{selectedShiftDay.stats.offCount}</strong>
                  </div>
                  <div className="control-line shift-chief-line">
                    <span>{shiftCopy.dayLabels[selectedShiftDay.dayIndex]}</span>
                    <strong>{formatDate(selectedShiftDay.date)}</strong>
                  </div>
                </div>

                <div className="shift-team-grid top-gap">
                  <article className="item-card shift-team-card">
                    <div className="row space-between top">
                      <strong>{shiftCopy.manager}</strong>
                      <span className={selectedShiftDay.leadership.manager.isOff ? "tag tag-yellow" : "tag tag-green"}>
                        {selectedShiftDay.leadership.manager.isOff ? shiftCopy.off : selectedShiftDay.leadership.manager.shift}
                      </span>
                    </div>
                    <div className="shift-line">
                      <span>{selectedShiftDay.leadership.manager.name}</span>
                      <strong>{shiftCopy.fixedOffNote}: {shiftCopy.dayLabels[selectedShiftDay.leadership.manager.weeklyOffDayIndex]}</strong>
                    </div>
                  </article>
                  <article className="item-card shift-team-card">
                    <div className="row space-between top">
                      <strong>{shiftCopy.deputy}</strong>
                      <span className={selectedShiftDay.leadership.deputy.isOff ? "tag tag-yellow" : "tag tag-green"}>
                        {selectedShiftDay.leadership.deputy.isOff ? shiftCopy.off : selectedShiftDay.leadership.deputy.shift}
                      </span>
                    </div>
                    <div className="shift-line">
                      <span>{selectedShiftDay.leadership.deputy.name}</span>
                      <strong>{shiftCopy.fixedOffNote}: {shiftCopy.dayLabels[selectedShiftDay.leadership.deputy.weeklyOffDayIndex]}</strong>
                    </div>
                  </article>
                  {selectedShiftDay.leadership.chiefs.map((chief, chiefIndex) => (
                    <article key={`${selectedShiftDay.date}-${chief.id}`} className="item-card shift-team-card">
                      <div className="row space-between top">
                        <strong>{shiftCopy.chiefs} {chiefIndex + 1}</strong>
                        <span className={chief.isOff ? "tag tag-yellow" : "tag tag-green"}>
                          {chief.isOff ? shiftCopy.off : chief.shift}
                        </span>
                      </div>
                      <div className="shift-line">
                        <span>{chief.name}</span>
                        <strong>{shiftCopy.fixedOffNote}: {shiftCopy.dayLabels[chief.weeklyOffDayIndex]}</strong>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="shift-team-grid top-gap">
                  {selectedShiftDay.teamPlans.map((team) => (
                    <article key={`${selectedShiftDay.date}-${team.teamId}`} className="item-card shift-team-card">
                      <div className="row space-between top">
                        <strong>{team.teamName}</strong>
                        <span className={team.offMember ? "tag tag-yellow" : "tag tag-green"}>
                          {team.offMember ? shiftCopy.off : shiftCopy.active}
                        </span>
                      </div>
                      <div className="shift-line">
                        <span>{shiftCopy.morning}</span>
                        <strong>{team.morningMembers.join(", ") || "-"}</strong>
                      </div>
                      <div className="shift-line">
                        <span>{shiftCopy.evening}</span>
                        <strong>{team.eveningMember}</strong>
                      </div>
                      <div className="shift-line">
                        <span>{shiftCopy.off}</span>
                        <strong>{team.offMember ?? shiftCopy.noOffOption}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>
            )}
          </section>
        )}

        {visibleTab === "assistantTracker" && (
          <section className="content-grid">
            <Panel className="span-2">
              <div className="panel-heading split">
                <h2>
                  <Globe size={18} /> {copy.reviewSourcesTitle}
                </h2>
                <div className="toolbar">
                  <button type="button" className="button secondary" onClick={saveReviewSources}>
                    {copy.reviewSourceSave}
                  </button>
                  <button type="button" className="button secondary" onClick={syncReviewSources} disabled={isReviewSyncing}>
                    {isReviewSyncing ? copy.reviewSyncing : copy.reviewSyncButton}
                  </button>
                </div>
              </div>
              <p className="muted module-intro">{copy.reviewSourcesText}</p>
              {reviewSourceStatus && <p className="muted top-gap">{reviewSourceStatus}</p>}
              {reviewSyncStatus && <p className="muted top-gap">{reviewSyncStatus}</p>}
              <article className="spec-card top-gap">
                <strong>{copy.reviewScheduleTitle}</strong>
                <p className="muted">{copy.reviewScheduleDaily}</p>
                <p className="muted">{copy.reviewScheduleLow}</p>
                <p className="muted">{copy.reviewAlertRecipients}</p>
                <p className="muted">
                  {copy.reviewSourceLastSync}: {reviewSchedule.lastDailyScanAt ? formatDate(reviewSchedule.lastDailyScanAt.slice(0, 10)) : copy.notSet}
                </p>
              </article>
              <div className="spec-grid top-gap">
                {reviewSources.map((source) => (
                  <article key={source.id} className="spec-card">
                    <div className="row space-between">
                      <strong>{source.label}</strong>
                      <span className={source.enabled ? "tag tag-green" : "tag tag-slate"}>
                        {source.enabled ? copy.active : copy.passive}
                      </span>
                    </div>
                    <div className="control-line top-gap">
                      <span>{copy.branchLabel}</span>
                      <strong>{source.branch}</strong>
                    </div>
                    <label className="top-gap">
                      <span className="eyebrow">{copy.reviewSourceUrl}</span>
                      <input
                        value={source.url || ""}
                        onChange={(event) =>
                          setReviewSources((current) =>
                            current.map((item) => (item.id === source.id ? { ...item, url: event.target.value } : item)),
                          )
                        }
                      />
                    </label>
                    <div className="control-line">
                      <span>{copy.reviewSourceLastSync}</span>
                      <strong>{source.lastSyncAt ? formatDate(source.lastSyncAt.slice(0, 10)) : copy.notSet}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="panel-heading">
                <h2>{copy.reviewScanLogTitle}</h2>
              </div>
              <div className="stack">
                {reviewScanLogs.length === 0 && <p className="muted">{copy.auditEmpty}</p>}
                {reviewScanLogs.map((log) => (
                  <article key={log.id} className="item-card">
                    <div className="row space-between">
                      <strong>{log.platform}</strong>
                      <span className="tag tag-outline">{log.status}</span>
                    </div>
                    <div className="control-line top-gap">
                      <span>{copy.reviewScanCount}</span>
                      <strong>{log.foundCount ?? 0}</strong>
                    </div>
                    <div className="control-line">
                      <span>{copy.reviewScanStatus}</span>
                      <strong>{log.note || log.status}</strong>
                    </div>
                    <p className="muted">{log.scannedAt ? formatDate(log.scannedAt.slice(0, 10)) : copy.notSet}</p>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel className="span-2">
              <div className="panel-heading">
                <h2>
                  <ClipboardList size={18} /> {copy.ftfStatsTitle}
                </h2>
              </div>
              <div className="metrics-grid compact">
                <Panel>
                  <p className="eyebrow">{copy.todayMeetingCount}</p>
                  <p className="hero-value">{assistantTrackerStats.todayMeetings}</p>
                </Panel>
                <Panel>
                  <p className="eyebrow">{copy.followUpWaiting}</p>
                  <p className="hero-value">{assistantTrackerStats.waitingFollowUp}</p>
                </Panel>
                <Panel>
                  <p className="eyebrow">{copy.reviewOpenCount}</p>
                  <p className="hero-value">{assistantTrackerStats.openReviews}</p>
                </Panel>
                <Panel>
                  <p className="eyebrow">{copy.lowReviewCount}</p>
                  <p className="hero-value">{assistantTrackerStats.lowReviews}</p>
                </Panel>
              </div>
              <div className="manager-grid">
                <div className="stack">
                  <article className="item-card">
                    <p className="eyebrow">{copy.ftfCountLabel}</p>
                    <p className="hero-value">{assistantTrackerStats.ftfCount}</p>
                  </article>
                  <article className="item-card">
                    <p className="eyebrow">{copy.leaderAssistant}</p>
                    <p className="hero-value">{assistantTrackerStats.topAssistant}</p>
                  </article>
                </div>
                <div className="stack">
                  <div className="panel-heading">
                    <h2>{copy.ftfLeaderboardTitle}</h2>
                  </div>
                  {assistantLeaderboard.slice(0, 5).map((entry, index) => (
                    <article key={entry.name} className="item-card">
                      <div className="row space-between">
                        <strong>#{index + 1} {entry.name}</strong>
                        <span className="tag tag-green">{entry.reviewCount + entry.ftfCount}</span>
                      </div>
                      <div className="control-line">
                        <span>{copy.reviewOpenCount}</span>
                        <strong>{entry.reviewCount}</strong>
                      </div>
                      <div className="control-line">
                        <span>{copy.ftfCountLabel}</span>
                        <strong>{entry.ftfCount}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="panel-heading">
                <h2><Plus size={18} /> {copy.addMeetingTitle}</h2>
              </div>
              <div className="form-grid">
                <label><span>{copy.customerNameLabel}</span><input aria-label={copy.customerNameLabel} value={newMeeting.customerName} onChange={(event) => setNewMeeting({ ...newMeeting, customerName: event.target.value })} /></label>
                <div className="two-col">
                  <label><span>{copy.date}</span><input aria-label={copy.date} type="date" value={newMeeting.date} onChange={(event) => setNewMeeting({ ...newMeeting, date: event.target.value })} /></label>
                  <label><span>{copy.time}</span><input aria-label={copy.time} type="time" value={newMeeting.time} onChange={(event) => setNewMeeting({ ...newMeeting, time: event.target.value })} /></label>
                </div>
                <label><span>{copy.contactLabel}</span><input aria-label={copy.contactLabel} value={newMeeting.contact} onChange={(event) => setNewMeeting({ ...newMeeting, contact: event.target.value })} /></label>
                <label><span>{copy.topicLabel}</span><input aria-label={copy.topicLabel} value={newMeeting.topic} onChange={(event) => setNewMeeting({ ...newMeeting, topic: event.target.value })} /></label>
                <div className="two-col">
                  <label><span>{copy.tagCodeLabel}</span><input aria-label={copy.tagCodeLabel} value={newMeeting.tagCode} onChange={(event) => setNewMeeting({ ...newMeeting, tagCode: event.target.value })} /></label>
                  <label><span>{copy.resultLabel}</span><input aria-label={copy.resultLabel} value={newMeeting.result} onChange={(event) => setNewMeeting({ ...newMeeting, result: event.target.value })} /></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.followUpDateLabel}</span><input aria-label={copy.followUpDateLabel} type="date" value={newMeeting.followUpDate} onChange={(event) => setNewMeeting({ ...newMeeting, followUpDate: event.target.value })} /></label>
                  <label><span>{copy.assignedAssistantLabel}</span><input aria-label={copy.assignedAssistantLabel} value={newMeeting.assignedAssistant} onChange={(event) => setNewMeeting({ ...newMeeting, assignedAssistant: event.target.value })} placeholder={currentUser?.displayName || ""} /></label>
                </div>
                <label><span>{copy.notes}</span><textarea aria-label={copy.notes} rows="4" value={newMeeting.notes} onChange={(event) => setNewMeeting({ ...newMeeting, notes: event.target.value })} placeholder={copy.notesPlaceholder} /></label>
                <button type="button" className={`button ${isMeetingReady ? "button-ready" : ""}`.trim()} onClick={addAssistantMeeting}>{copy.saveMeeting}</button>
              </div>
            </Panel>

            <Panel className="span-2">
              <div className="panel-heading split">
                <h2>{copy.ftfMeetingsTitle}</h2>
                <label className="searchbox">
                  <Search size={16} />
                  <input value={meetingSearch} onChange={(event) => setMeetingSearch(event.target.value)} placeholder={copy.searchMeeting} />
                </label>
              </div>
              <div className="stack">
                {filteredAssistantMeetings.map((meeting) => (
                  <article key={meeting.id} className="item-card">
                    <div className="row space-between top">
                      <div className="stack compact">
                        <div className="badge-row">
                          <strong>{meeting.customerName}</strong>
                          <span className="tag tag-blue">{meeting.date}</span>
                          <span className="tag tag-slate">{meeting.time}</span>
                          {meeting.isFTF && <span className="tag tag-green">FTF</span>}
                        </div>
                        <p className="muted">{localizeMeetingTopic(meeting.topic)}</p>
                        <p className="muted">{meeting.contact || copy.notSet} | {meeting.assignedAssistant || meeting.owner}</p>
                        <p>{localizeMeetingNote(meeting.notes)}</p>
                      </div>
                      <div className="stack compact">
                        <span className="tag tag-amber">{localizeMeetingResult(meeting.result)}</span>
                        <span className="tag tag-slate">{meeting.followUpDate || copy.noDate}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="panel-heading">
                <h2><Plus size={18} /> {copy.addReviewTitle}</h2>
              </div>
              <div className="form-grid">
                <div className="two-col">
                  <label><span>{copy.platformLabel}</span><input aria-label={copy.platformLabel} value={newReview.platform} onChange={(event) => setNewReview({ ...newReview, platform: event.target.value })} /></label>
                  <label><span>{copy.ratingLabel}</span><input aria-label={copy.ratingLabel} type="number" min="1" max="5" value={newReview.rating} onChange={(event) => setNewReview({ ...newReview, rating: Number(event.target.value) })} /></label>
                </div>
                <label><span>{copy.authorLabel}</span><input aria-label={copy.authorLabel} value={newReview.author} onChange={(event) => setNewReview({ ...newReview, author: event.target.value })} /></label>
                <div className="two-col">
                  <label><span>{copy.date}</span><input aria-label={copy.date} type="date" value={newReview.date} onChange={(event) => setNewReview({ ...newReview, date: event.target.value })} /></label>
                  <label><span>{copy.branchLabel}</span><input aria-label={copy.branchLabel} value={newReview.branch} onChange={(event) => setNewReview({ ...newReview, branch: event.target.value })} /></label>
                </div>
                <label><span>{copy.status}</span><select aria-label={copy.status} value={newReview.status} onChange={(event) => setNewReview({ ...newReview, status: event.target.value })}><option value="Open">{localizeStatus("Open")}</option><option value="In Review">{localizeStatus("In Review")}</option><option value="Resolved">{localizeStatus("Resolved")}</option></select></label>
                <label><span>{copy.contentLabel}</span><textarea aria-label={copy.contentLabel} rows="4" value={newReview.content} onChange={(event) => setNewReview({ ...newReview, content: event.target.value })} placeholder={copy.reviewContentPlaceholder} /></label>
                <button type="button" className={`button ${isReviewReady ? "button-ready" : ""}`.trim()} onClick={addAssistantReview}>{copy.saveReview}</button>
              </div>
            </Panel>

            <Panel className="span-2">
              <div className="panel-heading split">
                <h2>{copy.ftfReviewsTitle}</h2>
                <label className="searchbox">
                  <Search size={16} />
                  <input value={reviewSearch} onChange={(event) => setReviewSearch(event.target.value)} placeholder={copy.searchReview} />
                </label>
              </div>
              <div className="stack">
                {filteredAssistantReviews.map((review) => (
                  <article key={review.id} className="item-card">
                    <div className="row space-between top">
                      <div className="stack compact">
                        <div className="badge-row">
                          <strong>{review.author}</strong>
                          <span className="tag tag-outline">{review.platform}</span>
                          <span className={statusTone[review.status] || "tag tag-slate"}>{localizeStatus(review.status)}</span>
                          {review.imported && <span className="tag tag-blue">{copy.reviewImported}</span>}
                        </div>
                        <p className="muted">{review.branch} | {review.date} | {attributedAssistantForReview(review) || copy.unassigned}</p>
                        <p className="muted">{copy.reviewMatchedAssistant}: {attributedAssistantForReview(review) || copy.unassigned}</p>
                        <p>{localizeReviewContent(review.content)}</p>
                      </div>
                      <span className={Number(review.rating) <= 2 ? "tag tag-red" : Number(review.rating) === 3 ? "tag tag-amber" : "tag tag-green"}>
                        {review.rating}/5
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "criticalReviewOps" && canAccessCriticalReviewOps && (
          <section className="content-grid">
            <Panel className="span-2">
              <div className="panel-heading">
                <h2>
                  <AlertTriangle size={18} /> {copy.criticalReviewOpsTitle}
                </h2>
              </div>
              <p className="muted module-intro">{copy.criticalReviewOpsText}</p>
              {criticalReviewOpsStatus && <p className="muted top-gap">{criticalReviewOpsStatus}</p>}
              <div className="metrics-grid compact">
                <Panel>
                  <p className="eyebrow">{copy.criticalComplaints}</p>
                  <p className="hero-value">{criticalReviews.length}</p>
                </Panel>
                <Panel>
                  <p className="eyebrow">{copy.criticalReviewAlerts}</p>
                  <p className="hero-value">{criticalReviewAlerts.length}</p>
                </Panel>
                <Panel>
                  <p className="eyebrow">{copy.criticalReviewTasks}</p>
                  <p className="hero-value">{tasks.filter((task) => task.department === "guestRelations" && /\/5 - /.test(localizeTaskTitle(task))).length}</p>
                </Panel>
              </div>
            </Panel>

            <Panel className="span-2 critical-alerts-panel">
              <div className="panel-heading">
                <h2>{copy.criticalReviewAlerts}</h2>
              </div>
              <div className="critical-alerts-grid">
                {criticalReviewAlerts.length === 0 && <p className="muted">{copy.noNotifications}</p>}
                {criticalReviewAlerts.map((item) => (
                  <article key={item.id} className="item-card critical-alert-card">
                    <div className="row space-between">
                      <strong>{item.title}</strong>
                      <span className="tag tag-red">{item.meta?.platform ?? "-"}</span>
                    </div>
                    <p className="muted top-gap">{item.message}</p>
                    <div className="control-line top-gap">
                      <span>{copy.criticalReviewState}</span>
                      <strong>{item.meta?.scheduleMode === "lowRating" ? copy.criticalReviewRapidScan : copy.criticalReviewScheduledScan}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel className="span-2">
              <div className="panel-heading">
                <h2>{copy.ftfReviewsTitle}</h2>
              </div>
              <div className="stack">
                {criticalReviews.map((review) => (
                  <article key={review.id} className="item-card">
                    <div className="row space-between top">
                      <div className="stack compact">
                        <div className="badge-row">
                          <strong>{review.author}</strong>
                          <span className="tag tag-outline">{review.platform}</span>
                          <span className="tag tag-red">{review.rating}/5</span>
                        </div>
                        <p className="muted">{copy.reviewMatchedAssistant}: {attributedAssistantForReview(review) || copy.unassigned}</p>
                        <p className="muted">{copy.criticalReviewAssign}: {review.assignedTo || copy.unassigned}</p>
                        <p className="muted">{copy.criticalReviewState}: {copy.criticalReviewStates[review.opsStatus || "alerted"]}</p>
                        <p className="muted">{copy.criticalReviewReplyTo}: {review.repliedTo || copy.unassigned}</p>
                        <p className="muted">{copy.criticalReviewDeadline}: {review.deadline || copy.noDate}</p>
                        {review.internalNote && <p className="muted">{copy.criticalReviewNote}: {review.internalNote}</p>}
                        {review.resolutionSummary && <p className="muted">{copy.criticalReviewResolution}: {review.resolutionSummary}</p>}
                        <p>{localizeReviewContent(review.content)}</p>
                      </div>
                      <div className="stack compact">
                        <button type="button" className="button secondary slim-button" onClick={() => createTaskFromCriticalReview(review)}>
                          {copy.criticalReviewCreateTask}
                        </button>
                        <select
                          aria-label={`${review.author} ${copy.criticalReviewAssign}`}
                          value={review.assignedTo || ""}
                          onChange={(event) => updateCriticalReview(review.id, { assignedTo: event.target.value, opsStatus: event.target.value ? "assigned" : "alerted" })}
                        >
                          <option value="">{copy.unassigned}</option>
                          {knownAssistantNames.map((name) => (
                            <option key={`${review.id}-${name}`} value={name}>{name}</option>
                          ))}
                        </select>
                        <select
                          aria-label={`${review.author} ${copy.criticalReviewState}`}
                          value={review.opsStatus || "alerted"}
                          onChange={(event) => updateCriticalReview(review.id, { opsStatus: event.target.value })}
                        >
                          {Object.entries(copy.criticalReviewStates).map(([value, label]) => (
                            <option key={`${review.id}-${value}`} value={value}>{label}</option>
                          ))}
                        </select>
                        <input
                          aria-label={`${review.author} ${copy.criticalReviewReplyTo}`}
                          value={review.repliedTo || ""}
                          onChange={(event) => updateCriticalReview(review.id, { repliedTo: event.target.value })}
                          placeholder={copy.authorLabel}
                        />
                        <input
                          aria-label={`${review.author} ${copy.criticalReviewDeadline}`}
                          type="date"
                          value={review.deadline || ""}
                          onChange={(event) => updateCriticalReview(review.id, { deadline: event.target.value })}
                        />
                        <textarea
                          aria-label={`${review.author} ${copy.criticalReviewNote}`}
                          rows="2"
                          value={review.internalNote || ""}
                          onChange={(event) => updateCriticalReview(review.id, { internalNote: event.target.value })}
                        />
                        <textarea
                          aria-label={`${review.author} ${copy.criticalReviewResolution}`}
                          rows="2"
                          value={review.resolutionSummary || ""}
                          onChange={(event) => updateCriticalReview(review.id, { resolutionSummary: event.target.value })}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "managerAgenda" && isAdminUser && (
          <section className="content-grid">
            <Panel className="span-2">
              <div className="panel-heading">
                <h2>
                  <CalendarDays size={18} /> {copy.agendaTitle}
                </h2>
              </div>
              <p className="muted module-intro">{copy.agendaText}</p>
              <div className="stack">
                <div className="control-line">
                  <span>{copy.trackedItems}</span>
                  <strong>{agendaItems.length}</strong>
                </div>
                <div className="control-line">
                  <span>{copy.criticalFocus}</span>
                  <strong>{agendaItems.filter((item) => item.priority === "Critical" && !item.completed).length}</strong>
                </div>
                <div className="control-line">
                  <span>{copy.nextSevenDays}</span>
                  <strong>{agendaItems.filter((item) => item.date >= agendaToday && item.date <= "2026-03-18").length}</strong>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="panel-heading">
                <h2>
                  <Plus size={18} /> {copy.agendaAddTitle}
                </h2>
              </div>
              <div className="form-grid">
                <label><span>{copy.agendaTaskTitle}</span><input value={newAgendaItem.title} onChange={(event) => setNewAgendaItem({ ...newAgendaItem, title: event.target.value })} /></label>
                <label><span>{copy.agendaTaskDate}</span><input type="date" value={newAgendaItem.date} onChange={(event) => setNewAgendaItem({ ...newAgendaItem, date: event.target.value })} /></label>
                <label><span>{copy.agendaTaskOwner}</span><input value={newAgendaItem.owner} onChange={(event) => setNewAgendaItem({ ...newAgendaItem, owner: event.target.value })} /></label>
                <label><span>{copy.agendaTaskPriority}</span><select value={newAgendaItem.priority} onChange={(event) => setNewAgendaItem({ ...newAgendaItem, priority: event.target.value })}><option value="Medium">{localizePriority("Medium")}</option><option value="High">{localizePriority("High")}</option><option value="Critical">{localizePriority("Critical")}</option></select></label>
                <label><span>{copy.agendaTaskContext}</span><textarea rows="4" value={newAgendaItem.note} onChange={(event) => setNewAgendaItem({ ...newAgendaItem, note: event.target.value })} placeholder={copy.agendaTaskContextPlaceholder} /></label>
                <button type="button" className={`button ${isAgendaReady ? "button-ready" : ""}`.trim()} onClick={addAgendaItem}>{copy.addAgendaTask}</button>
              </div>
            </Panel>

            <Panel>
              <div className="panel-heading">
                <h2>
                  <Clock3 size={18} /> {copy.dailyAgendaTitle}
                </h2>
              </div>
              <div className="stack">
                {todayAgenda.length === 0 && <p className="muted">{copy.noAgendaToday}</p>}
                {todayAgenda.map((item) => (
                  <article key={item.id} className="item-card">
                    <div className="row space-between top">
                      <div className="stack compact">
                        <div className="badge-row">
                          <strong>{item.title}</strong>
                          <span className={priorityTone[item.priority]}>{localizePriority(item.priority)}</span>
                        </div>
                        <p className="muted">{item.owner} | {formatDate(item.date)}</p>
                        <p>{localizeAgendaNote(item.note)}</p>
                      </div>
                      <label className="check-toggle">
                        <input type="checkbox" checked={item.completed} onChange={() => toggleAgendaItem(item.id)} />
                        <span>{copy.done}</span>
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="panel-heading">
                <h2>
                  <AlertTriangle size={18} /> {copy.nextDayAgendaTitle}
                </h2>
              </div>
              <div className="stack">
                {tomorrowAgenda.length === 0 && <p className="muted">{copy.noAgendaTomorrow}</p>}
                {tomorrowAgenda.map((item) => (
                  <article key={item.id} className="item-card">
                    <div className="badge-row">
                      <strong>{localizeAgendaTitle(item.title)}</strong>
                      <span className={priorityTone[item.priority]}>{localizePriority(item.priority)}</span>
                    </div>
                    <p className="muted">{item.owner} | {formatDate(item.date)}</p>
                    <p>{localizeAgendaNote(item.note)}</p>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel className="span-2">
              <div className="panel-heading">
                <h2>
                  <BarChart3 size={18} /> {copy.allUpcomingTitle}
                </h2>
              </div>
              <div className="stack">
                {upcomingAgenda.length === 0 && <p className="muted">{copy.noAgendaUpcoming}</p>}
                {upcomingAgenda.map((item) => (
                  <div key={item.id} className="control-line">
                    <span>{localizeAgendaTitle(item.title)}</span>
                    <strong>{formatDate(item.date)} | {item.owner}</strong>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "permissions" && (isAdminUser || canManageScopedPermissions) && (
          <section className="content-grid">
            {isAdminUser && (
              <Panel className="span-2 permission-panel">
                <div className="panel-heading">
                  <h2>
                    <ShieldCheck size={18} /> {copy.permissionTitle}
                  </h2>
                </div>
                <p className="muted module-intro">{copy.permissionText}</p>
                <div className="permission-groups">
                  {editableRoles.map((role) => (
                    <div key={role} className="permission-card">
                      <strong>{roleLabel(role)}</strong>
                      <div className="permission-section">
                        <span className="eyebrow">{copy.sections}</span>
                        <div className="permission-options">
                          {permissionTabs.map((tabId) => (
                            <label key={tabId} className="permission-option">
                              <input
                                type="checkbox"
                                checked={permissions[role].tabs.includes(tabId)}
                                onChange={() => updateRolePermission(role, "tabs", tabId)}
                              />
                              <span>{tabLabel(tabId)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="permission-section">
                        <span className="eyebrow">{copy.voyageModules}</span>
                        <div className="permission-options">
                          {controllableModules.map((module) => (
                            <label key={module.id} className="permission-option">
                              <input
                                type="checkbox"
                                checked={permissions[role].modules.includes(module.id)}
                                onChange={() => updateRolePermission(role, "modules", module.id)}
                              />
                              <span>{copy.modules[module.id].title}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            <Panel className="span-2 permission-panel">
              <div className="panel-heading">
                <h2>
                  <UserRound size={18} /> {copy.departmentPermissionTitle}
                </h2>
              </div>
              <p className="muted module-intro">{copy.departmentPermissionText}</p>
              <div className="permission-groups">
                {scopedPermissionUsers.length === 0 && <p className="muted">{copy.noDepartmentPermissionUsers}</p>}
                {scopedPermissionUsers.map((user) => {
                  const userAccess = mergePermissionAccess(permissions[user.role], userPermissions[user.username]);
                  return (
                    <div key={user.username} className="permission-card">
                      <div className="row space-between top">
                        <div className="stack compact">
                          <strong>{user.role === "assistant" ? `${user.displayName} · ${roleLabel(user.role)}` : userLabel(user)}</strong>
                          <span className="muted">{localizeDepartment(user.scopeDepartment ?? user.department)}</span>
                        </div>
                      </div>
                      <div className="permission-section">
                        <span className="eyebrow">{copy.sections}</span>
                        <div className="permission-options">
                          {permissionTabs.map((tabId) => (
                            <label key={`${user.username}-${tabId}`} className="permission-option">
                              <input
                                type="checkbox"
                                checked={userAccess.tabs.includes(tabId)}
                                onChange={() => updateUserPermission(user.username, "tabs", tabId)}
                              />
                              <span>{tabLabel(tabId)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="permission-section">
                        <span className="eyebrow">{copy.voyageModules}</span>
                        <div className="permission-options">
                          {controllableModules.map((module) => (
                            <label key={`${user.username}-${module.id}`} className="permission-option">
                              <input
                                type="checkbox"
                                checked={userAccess.modules.includes(module.id)}
                                onChange={() => updateUserPermission(user.username, "modules", module.id)}
                              />
                              <span>{copy.modules[module.id].title}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "managerOps" && isAdminUser && (
          <section className="content-grid">
            <Panel className="span-2 audit-panel">
              <div className="panel-heading">
                <h2>
                  <ShieldCheck size={18} /> {copy.auditTitle}
                </h2>
              </div>
              <p className="muted module-intro">{copy.auditText}</p>
              <div className="audit-list">
                {activityLogs.length === 0 && <p className="muted">{copy.auditEmpty}</p>}
                {activityLogs.slice(0, 24).map((item) => (
                  <div key={item.id} className="audit-item">
                    <strong>{item.displayName} · {roleLabel(item.role)}</strong>
                    <span>{copy[item.actionKey] ?? item.actionKey}</span>
                    <span>{item.detail}</span>
                    <span>{new Intl.DateTimeFormat(language, { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}</span>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel className="span-2">
              <div className="panel-heading">
                <h2>
                  <UserRound size={18} /> {copy.userAdminTitle}
                </h2>
              </div>
              <p className="muted module-intro">{copy.userAdminText}</p>
              <div className="form-grid">
                <label>
                  <span>{copy.accountTitle}</span>
                  <select aria-label={copy.accountTitle} value={managedUsername} onChange={(event) => { setManagedUsername(event.target.value); setUserAdminStatus(""); setUserAdminError(""); }}>
                    {managedUsers.map((user) => (
                      <option key={user.username} value={user.username}>
                        {user.role === "assistant" ? `${user.displayName} · ${roleLabel(user.role)}` : userLabel(user)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{copy.displayNameLabel}</span>
                  <input aria-label={copy.displayNameLabel} value={managedDisplayName} onChange={(event) => setManagedDisplayName(event.target.value)} />
                </label>
                <label>
                  <span>{copy.accountRoleLabel}</span>
                  <select aria-label={copy.accountRoleLabel} value={managedRole} onChange={(event) => setManagedRole(event.target.value)} disabled={!isAdminUser}>
                    <option value="admin">{roleLabel("admin")}</option>
                    <option value="manager">{roleLabel("manager")}</option>
                    <option value="deputy">{roleLabel("deputy")}</option>
                    <option value="chief">{roleLabel("chief")}</option>
                    <option value="assistant">{roleLabel("assistant")}</option>
                    <option value="departmentManager">{roleLabel("departmentManager")}</option>
                  </select>
                </label>
                <label>
                  <span>{copy.newPasswordLabel}</span>
                  <input
                    aria-label={copy.newPasswordLabel}
                    type="password"
                    value={managedPassword}
                    placeholder={copy.newPasswordPlaceholder}
                    onChange={(event) => setManagedPassword(event.target.value)}
                  />
                </label>
                {userAdminStatus && <p className="muted">{userAdminStatus}</p>}
                {userAdminError && <p className="form-error">{userAdminError}</p>}
                <button type="button" className={`button ${isUserUpdateReady ? "button-ready" : ""}`.trim()} onClick={() => void handleUserUpdate()}>
                  {copy.saveUserSettings}
                </button>
              </div>
            </Panel>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
