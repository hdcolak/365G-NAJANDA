import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Clock3,
  Filter,
  Globe,
  LogOut,
  MessageSquareWarning,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"],
    modules: ["guest", "settings", "assistant", "assistantTracker"],
    showAudit: true,
  },
  manager: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"],
    modules: ["guest", "settings", "assistant", "assistantTracker"],
    showAudit: true,
  },
  deputy: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"],
    modules: ["guest", "settings", "assistant", "assistantTracker"],
    showAudit: false,
  },
  chief: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"],
    modules: ["guest", "settings", "assistant", "assistantTracker"],
    showAudit: false,
  },
  assistant: {
    tabs: ["dashboard", "complaints", "assistantTracker"],
    modules: ["guest", "assistant", "assistantTracker"],
    showAudit: false,
  },
  departmentManager: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"],
    modules: ["guest", "assistant", "assistantTracker"],
    showAudit: false,
  },
};

const editableRoles = ["manager", "deputy", "chief", "assistant", "departmentManager"];
const permissionTabs = ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"];
const adminTabs = ["managerAgenda", "permissions", "managerOps"];

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
    id: "vista-italian",
    name: "Vista Italian",
    cuisine: "Italian",
    active: true,
    openingTime: "18:30",
    lastArrival: "21:30",
    coverPrice: 35,
    currency: "EUR",
    maxGuests: 6,
    mixedTable: false,
    areaPreference: true,
    childPolicy: "0-6 free, 7-12 half price",
    cancellationWindow: "2 hours",
    closeSaleWindow: "1 hour",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    roomNightLimit: 1,
    includeOtherRooms: false,
    tableSetup: "2, 4, 6 pax tables",
    note: "Quiet terrace focus, premium dinner flow.",
    demand: "High",
    occupancy: 82,
    slotCount: 3,
  },
  {
    id: "asia-flame",
    name: "Asia Flame",
    cuisine: "Pan Asian",
    active: true,
    openingTime: "19:00",
    lastArrival: "22:00",
    coverPrice: 40,
    currency: "EUR",
    maxGuests: 8,
    mixedTable: true,
    areaPreference: false,
    childPolicy: "Children accepted after 8 years",
    cancellationWindow: "3 hours",
    closeSaleWindow: "90 minutes",
    workingDays: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    roomNightLimit: 1,
    includeOtherRooms: true,
    tableSetup: "Shared chef counter + 4 pax tables",
    note: "Higher demand, suitable for assistant escalation alerts.",
    demand: "Critical",
    occupancy: 94,
    slotCount: 4,
  },
  {
    id: "anatolia-grill",
    name: "Anatolia Grill",
    cuisine: "Turkish Grill",
    active: false,
    openingTime: "19:30",
    lastArrival: "21:00",
    coverPrice: 28,
    currency: "EUR",
    maxGuests: 10,
    mixedTable: false,
    areaPreference: true,
    childPolicy: "All children accepted",
    cancellationWindow: "1 hour",
    closeSaleWindow: "30 minutes",
    workingDays: ["Wed", "Fri", "Sun"],
    roomNightLimit: 2,
    includeOtherRooms: true,
    tableSetup: "Family tables 4-10 pax",
    note: "Current sample marked inactive for seasonal planning.",
    demand: "Low",
    occupancy: 0,
    slotCount: 2,
  },
];

const initialAlaCarteReservations = [
  {
    id: "res-1001",
    venueId: "vista-italian",
    guestName: "Muller Family",
    roomNumber: "4102",
    partySize: 4,
    reservationDate: "2026-03-12",
    slotTime: "19:00",
    status: "Booked",
    source: "Guest Relations",
    note: "Anniversary dessert request",
  },
  {
    id: "res-1002",
    venueId: "asia-flame",
    guestName: "Ivan Petrov",
    roomNumber: "3304",
    partySize: 2,
    reservationDate: "2026-03-12",
    slotTime: "20:00",
    status: "Confirmed",
    source: "App",
    note: "No peanuts",
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
    venueId: "asia-flame",
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
    venueId: "vista-italian",
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
  { id: "slot-1", venueId: "vista-italian", date: "2026-03-12", time: "19:00", maxCovers: 24, bookedCovers: 12, waitlistCount: 1 },
  { id: "slot-2", venueId: "vista-italian", date: "2026-03-12", time: "20:30", maxCovers: 18, bookedCovers: 8, waitlistCount: 0 },
  { id: "slot-3", venueId: "asia-flame", date: "2026-03-12", time: "20:00", maxCovers: 20, bookedCovers: 18, waitlistCount: 1 },
  { id: "slot-4", venueId: "asia-flame", date: "2026-03-13", time: "19:30", maxCovers: 16, bookedCovers: 6, waitlistCount: 0 },
];

const initialAssistantMeetings = [
  {
    id: "meet-1",
    customerName: "Ayse Demir",
    date: "2026-03-12",
    time: "10:30",
    contact: "0555 123 45 67",
    topic: "Oda memnuniyeti gorusmesi",
    tagCode: "FTF",
    result: "Takip gerekli",
    notes: "Kahvalti alaniyla ilgili geri bildirim verdi. Yarin tekrar aranacak.",
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
    topic: "Erken cikis talebi",
    tagCode: "",
    result: "Olumlu",
    notes: "Talep onaylandi, tesekkur etti.",
    followUpDate: "",
    owner: "Seda",
    assignedAssistant: "Seda",
    isFTF: false,
    createdAt: "2026-03-12T15:00:00.000Z",
  },
];

const initialAssistantReviews = [
  {
    id: "review-1",
    platform: "Google",
    rating: 2,
    author: "Cem Y.",
    date: "2026-03-12",
    branch: "Voyage Kundu",
    content: "Personel ilgiliydi ama giris islemi uzun surdu.",
    status: "In Review",
    owner: "Merve",
    createdAt: "2026-03-12T11:10:00.000Z",
  },
  {
    id: "review-2",
    platform: "Tripadvisor",
    rating: 5,
    author: "Elif K.",
    date: "2026-03-12",
    branch: "Voyage Kundu",
    content: "Konum ve ekip cok iyiydi, tekrar gelirim.",
    status: "Open",
    owner: "Seda",
    createdAt: "2026-03-12T16:20:00.000Z",
  },
];

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
    booked: "Booked",
    confirmed: "Confirmed",
    arrived: "Arrived",
    seated: "Seated",
    completed: "Completed",
    cancelled: "Cancelled",
    noShow: "No-show",
    waiting: "Bekliyor",
    converted: "Dönüştürüldü",
    vip: "VIP",
    family: "Aile",
    regular: "Standart",
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
    booked: "Booked",
    confirmed: "Confirmed",
    arrived: "Arrived",
    seated: "Seated",
    completed: "Completed",
    cancelled: "Cancelled",
    noShow: "No-show",
    waiting: "Wartet",
    converted: "Umgewandelt",
    vip: "VIP",
    family: "Familie",
    regular: "Standard",
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
    booked: "Booked",
    confirmed: "Confirmed",
    arrived: "Arrived",
    seated: "Seated",
    completed: "Completed",
    cancelled: "Cancelled",
    noShow: "No-show",
    waiting: "Ожидает",
    converted: "Преобразовано",
    vip: "VIP",
    family: "Семья",
    regular: "Стандарт",
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
    addTask: "Görev ekle",
    complaintTracking: "Şikayet Takibi",
    searchComplaint: "Şikayet ara",
    allStatuses: "Tüm durumlar",
    addComplaint: "Şikayet ekle",
    guestOrCase: "Misafir / Vaka",
    category: "Kategori",
    severity: "Seviye",
    channel: "Kanal",
    date: "Tarih",
    summary: "Özet",
    complaintCategories: "Şikayet kategorileri",
    complaintStatusDistribution: "Şikayet durum dağılımı",
    totalComplaints: "Toplam şikayet",
    openRatio: "Açık oranı",
    resolutionRatio: "Çözüm oranı",
    voyageModules: "Voyage modülleri",
    voyageModulesText: "Rolünüze göre filtrelenmiş iç operasyon panelleri.",
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
    active: "Aktif",
    passive: "Pasif",
    yes: "Evet",
    no: "Hayır",
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
    ftfStatsTitle: "Asistan takip ozeti",
    ftfLeaderboardTitle: "Hall of Fame",
    ftfMeetingsTitle: "FTF takip listesi",
    ftfReviewsTitle: "Yorum listesi",
    addMeetingTitle: "Yuz yuze gorusme ekle",
    addReviewTitle: "Yorum ekle",
    followUpWaiting: "Takip bekleyen",
    lowReviewCount: "Dusuk puanli yorum",
    ftfCountLabel: "FTF kaydi",
    leaderAssistant: "Lider asistan",
    todayMeetingCount: "Bugunku gorusme",
    reviewOpenCount: "Acik yorum",
    customerNameLabel: "Musteri adi",
    contactLabel: "Telefon",
    topicLabel: "Gorusme konusu",
    tagCodeLabel: "Kod / etiket",
    resultLabel: "Sonuc",
    followUpDateLabel: "Takip tarihi",
    assignedAssistantLabel: "Ilgili asistan",
    saveMeeting: "Gorusmeyi kaydet",
    platformLabel: "Platform",
    ratingLabel: "Puan",
    authorLabel: "Yorum sahibi",
    branchLabel: "Sube veya isletme",
    contentLabel: "Yorum metni",
    saveReview: "Yorumu kaydet",
    searchMeeting: "Musteri ya da konu ara",
    searchReview: "Platform, sube veya kisi ara",
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
      housekeeping: "Kat Hizmetleri",
      foodBeverage: "Yiyecek ve İçecek",
      technical: "Teknik",
      noise: "Gürültü",
      frontOffice: "Ön Büro",
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
    addTask: "Add task",
    complaintTracking: "Complaint Tracking",
    searchComplaint: "Search complaint",
    allStatuses: "All statuses",
    addComplaint: "Add complaint",
    guestOrCase: "Guest / Case",
    category: "Category",
    severity: "Severity",
    channel: "Channel",
    date: "Date",
    summary: "Summary",
    complaintCategories: "Complaint categories",
    complaintStatusDistribution: "Complaint status distribution",
    totalComplaints: "Total complaints",
    openRatio: "Open ratio",
    resolutionRatio: "Resolution ratio",
    voyageModules: "Voyage modules",
    voyageModulesText: "Internal operation panels filtered by user role.",
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
    active: "Active",
    passive: "Passive",
    yes: "Yes",
    no: "No",
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
      housekeeping: "Housekeeping",
      foodBeverage: "Food & Beverage",
      technical: "Technical",
      noise: "Noise",
      frontOffice: "Front Office",
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
    addTask: "Aufgabe hinzufügen",
    complaintTracking: "Beschwerdeverfolgung",
    searchComplaint: "Beschwerde suchen",
    allStatuses: "Alle Status",
    addComplaint: "Beschwerde hinzufügen",
    guestOrCase: "Gast / Fall",
    category: "Kategorie",
    severity: "Schweregrad",
    channel: "Kanal",
    date: "Datum",
    summary: "Zusammenfassung",
    complaintCategories: "Beschwerdekategorien",
    complaintStatusDistribution: "Verteilung der Beschwerdestati",
    totalComplaints: "Beschwerden gesamt",
    openRatio: "Offen-Quote",
    resolutionRatio: "Lösungsquote",
    voyageModules: "Voyage-Module",
    voyageModulesText: "Interne Bedienpanels gefiltert nach Benutzerrolle.",
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
    active: "Aktiv",
    passive: "Passiv",
    yes: "Ja",
    no: "Nein",
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
    ftfStatsTitle: "Assistenten-Tracking-Ubersicht",
    ftfLeaderboardTitle: "Hall of Fame",
    ftfMeetingsTitle: "FTF-Nachverfolgung",
    ftfReviewsTitle: "Bewertungsliste",
    addMeetingTitle: "Face-to-Face-Gesprach hinzufugen",
    addReviewTitle: "Bewertung hinzufugen",
    followUpWaiting: "Offene Nachverfolgung",
    lowReviewCount: "Schwach bewertete Rezensionen",
    ftfCountLabel: "FTF-Eintrage",
    leaderAssistant: "Top-Assistent",
    todayMeetingCount: "Heutige Gesprache",
    reviewOpenCount: "Offene Bewertungen",
    customerNameLabel: "Kundenname",
    contactLabel: "Telefon",
    topicLabel: "Gesprachesthema",
    tagCodeLabel: "Code / Tag",
    resultLabel: "Ergebnis",
    followUpDateLabel: "Nachverfolgungsdatum",
    assignedAssistantLabel: "Zugewiesener Assistent",
    saveMeeting: "Gesprach speichern",
    platformLabel: "Plattform",
    ratingLabel: "Bewertung",
    authorLabel: "Verfasser",
    branchLabel: "Standort oder Betrieb",
    contentLabel: "Bewertungstext",
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
      housekeeping: "Housekeeping",
      foodBeverage: "Speisen & Getränke",
      technical: "Technik",
      noise: "Lärm",
      frontOffice: "Rezeption",
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
    addTask: "Добавить задачу",
    complaintTracking: "Отслеживание жалоб",
    searchComplaint: "Поиск жалобы",
    allStatuses: "Все статусы",
    addComplaint: "Добавить жалобу",
    guestOrCase: "Гость / Случай",
    category: "Категория",
    severity: "Уровень",
    channel: "Канал",
    date: "Дата",
    summary: "Краткое описание",
    complaintCategories: "Категории жалоб",
    complaintStatusDistribution: "Распределение статусов жалоб",
    totalComplaints: "Всего жалоб",
    openRatio: "Доля открытых",
    resolutionRatio: "Доля решенных",
    voyageModules: "Модули Voyage",
    voyageModulesText: "Внутренние операционные панели с фильтрацией по роли пользователя.",
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
    active: "Активен",
    passive: "Пассивен",
    yes: "Да",
    no: "Нет",
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
      housekeeping: "Хаускипинг",
      foodBeverage: "Питание и напитки",
      technical: "Техническая",
      noise: "Шум",
      frontOffice: "Ресепшен",
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
  { id: 1, guest: "Muller Family", category: "housekeeping", severity: "Medium", status: "Resolved", channel: "frontDesk", date: "2026-03-08", department: "housekeeping", summaryKey: "roomCleaningDelayed" },
  { id: 2, guest: "Ivan Petrov", category: "foodBeverage", severity: "High", status: "Open", channel: "whatsapp", date: "2026-03-09", department: "fb", summaryKey: "dinnerServiceComplaint" },
  { id: 3, guest: "Sarah Collins", category: "technical", severity: "Critical", status: "In Review", channel: "voyageAssistant", date: "2026-03-10", department: "technical", summaryKey: "acIssue" },
  { id: 4, guest: "Kaya Suite 2201", category: "noise", severity: "Low", status: "Resolved", channel: "callCenter", date: "2026-03-10", department: "security", summaryKey: "corridorNoise" },
];

const initialAgendaItems = [
  { id: 1, title: "VIP arrival briefing approval", date: "2026-03-11", owner: "Gizem", priority: "Critical", note: "Confirm welcome flow, suite readiness and guest relations handoff.", completed: false },
  { id: 2, title: "Housekeeping recovery backlog review", date: "2026-03-11", owner: "Selim", priority: "High", note: "Close delayed cleaning cases before evening report.", completed: false },
  { id: 3, title: "Tomorrow ala carte capacity lock", date: "2026-03-12", owner: "Ece", priority: "Critical", note: "Freeze tomorrow evening allocations and inform assistant routing.", completed: false },
  { id: 4, title: "Technical preventive check for suites", date: "2026-03-12", owner: "Maintenance", priority: "High", note: "Focus on AC and minibar controls for VIP floor.", completed: false },
  { id: 5, title: "Weekly executive summary draft", date: "2026-03-15", owner: "Gizem", priority: "Medium", note: "Prepare service quality and complaint resolution summary.", completed: false },
];

const chartColors = ["#0f172a", "#1d4ed8", "#0891b2", "#f59e0b", "#e11d48"];
const statusTone = { "Not Started": "tag tag-slate", Planned: "tag tag-blue", "In Progress": "tag tag-amber", Done: "tag tag-green", Open: "tag tag-rose", "In Review": "tag tag-orange", Resolved: "tag tag-green" };
const priorityTone = { Low: "tag tag-slate", Medium: "tag tag-yellow", High: "tag tag-red", Critical: "tag tag-red-strong" };
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";

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
  return payload ? { ...defaultRoleAccess, ...payload } : defaultRoleAccess;
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

function MetricCard({ title, value, icon, sub }) {
  const IconComponent = icon;
  return (
    <Panel>
      <div className="metric-card">
        <div>
          <p className="eyebrow">{title}</p>
          <p className="metric-value">{value}</p>
          <p className="muted">{sub}</p>
        </div>
        <div className="metric-icon">
          <IconComponent size={20} />
        </div>
      </div>
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
    return ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker", "managerAgenda", "permissions", "managerOps"].includes(view) ? view : "dashboard";
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
  const [alaCarteVenues, setAlaCarteVenues] = useState(initialAlaCarteVenues);
  const [alaCarteReservations, setAlaCarteReservations] = useState(initialAlaCarteReservations);
  const [alaCarteWaitlist, setAlaCarteWaitlist] = useState(initialAlaCarteWaitlist);
  const [alaCarteServiceSlots, setAlaCarteServiceSlots] = useState(initialAlaCarteServiceSlots);
  const [assistantMeetings, setAssistantMeetings] = useState(initialAssistantMeetings);
  const [assistantReviews, setAssistantReviews] = useState(initialAssistantReviews);
  const [notifications, setNotifications] = useState([]);
  const [taskSearch, setTaskSearch] = useState("");
  const [complaintSearch, setComplaintSearch] = useState("");
  const [meetingSearch, setMeetingSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [complaintFormError, setComplaintFormError] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState("all");
  const [newTask, setNewTask] = useState({ title: "", type: "daily", department: "guestRelations", owner: "", dueDate: "", priority: "Medium", status: "Planned", progress: 0, notes: "" });
  const [newComplaint, setNewComplaint] = useState({ guest: "", category: "housekeeping", severity: "Medium", status: "Open", channel: "frontDesk", date: "", department: "guestRelations", summary: "" });
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

  const copy = translations[language];
  const authText = authCopy[language] ?? authCopy.en;
  const diningCopy = alaCarteLabels[language] ?? alaCarteLabels.en;
  const titleCopy = titleLabels[language] ?? titleLabels.en;
  const canManageScopedPermissions = ["manager", "deputy", "chief", "departmentManager"].includes(currentUser?.role ?? "");
  const activeRole = currentUser ? mergePermissionAccess(permissions[currentUser.role], userPermissions[currentUser.username]) : null;
  const scopedDepartment = currentUser?.scopeDepartment ?? null;
  const isDepartmentManager = currentUser?.role === "departmentManager";
  const isAdminUser = currentUser?.role === "admin";
  const availableTabIds = useMemo(
    () => {
      const baseTabs = [
        ...(activeRole?.tabs ?? []),
        ...(activeRole?.modules?.includes("assistantTracker") ? ["assistantTracker"] : []),
        ...(isAdminUser ? adminTabs : []),
        ...(!isAdminUser && canManageScopedPermissions ? ["permissions"] : []),
      ].filter((value, index, array) => array.indexOf(value) === index);

      if (!isDepartmentManager) return baseTabs;

      return baseTabs.filter(
        (tabId) =>
          tabId !== "alacarte" || ["fb", "guestRelations", "frontOffice"].includes(scopedDepartment),
      );
    },
    [activeRole, canManageScopedPermissions, isAdminUser, isDepartmentManager, scopedDepartment],
  );
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
        setAssistantMeetings(payload.assistantMeetings?.length ? payload.assistantMeetings : initialAssistantMeetings);
        setAssistantReviews(payload.assistantReviews?.length ? payload.assistantReviews : initialAssistantReviews);
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
          assistantMeetings,
          assistantReviews,
          activityLogs,
        }),
      }).catch(() => {
        setSyncMode("local");
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [activityLogs, agendaItems, alaCarteReservations, alaCarteServiceSlots, alaCarteVenues, alaCarteWaitlist, assistantMeetings, assistantReviews, bootstrapReady, complaints, permissions, sessionToken, syncMode, tasks, userPermissions]);

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
  const formatDate = (value) => (value ? new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(value)) : "");
  const roleLabel = (role) => copy.roles[role] ?? role;
  const titleLabel = (titleKey) => titleCopy[titleKey] ?? titleKey;
  const userLabel = (user) => user.titleKey ? titleLabel(user.titleKey) : roleLabel(user.role);
  const loginOptionLabel = (user) => (user.role === "assistant" ? `${user.displayName} · ${roleLabel(user.role)}` : userLabel(user));
  const availableDepartmentOptions = isDepartmentManager && scopedDepartment
    ? [scopedDepartment]
    : Object.keys(copy.departments);
  const visibleTab = availableTabIds.includes(activeTab)
    ? activeTab
    : availableTabIds[0] ?? "dashboard";
  const agendaToday = "2026-03-11";
  const agendaTomorrow = "2026-03-12";

  const logAction = (actionKey, detail) => {
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
  };

  const tabs = availableTabIds.map((id) => ({
    id,
    label:
      id === "dashboard"
        ? copy.dashboard
        : id === "tasks"
          ? copy.tasksTab
          : id === "complaints"
            ? copy.complaintsTab
            : id === "alacarte"
              ? copy.alacarteTab
              : id === "assistantTracker"
                ? copy.assistantTrackerTab
              : id === "managerAgenda"
                ? copy.managerAgendaTab
              : id === "permissions"
                ? copy.permissionsTab
                : id === "managerOps"
                  ? copy.managerOpsTab
                  : copy.analysis,
  }));

  const visibleModules = internalModules.filter((module) => activeRole?.modules.includes(module.id));
  const selectedModule = visibleModules.find((module) => module.id === selectedModuleId) ?? visibleModules[0] ?? null;
  const moduleTargetTab =
    selectedModule?.id === "guest"
      ? "dashboard"
          : selectedModule?.id === "settings"
        ? (isAdminUser ? "permissions" : "analysis")
        : selectedModule?.id === "assistant"
          ? "complaints"
          : selectedModule?.id === "assistantTracker"
            ? "assistantTracker"
          : "dashboard";

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
    return matchesText && (taskTypeFilter === "all" || task.type === taskTypeFilter);
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
    return matchesText && (complaintStatusFilter === "all" || item.status === complaintStatusFilter);
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

  const complaintByCategory = Object.entries(
    complaints.reduce((acc, item) => {
      const name = localizeCategory(item.category);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const complaintByStatus = Object.entries(
    complaints.reduce((acc, item) => {
      const name = localizeStatus(item.status);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const overallProgress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round(tasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / tasks.length);
  }, [tasks]);

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

  const calendarMonths = useMemo(() => {
    const start = new Date(`${agendaToday}T00:00:00`);
    const agendaCounts = agendaItems.reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + 1;
      return acc;
    }, {});

    const days = Array.from({ length: 365 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dateKey = date.toISOString().slice(0, 10);
      return {
        dateKey,
        dayNumber: date.getDate(),
        monthKey: `${date.getFullYear()}-${date.getMonth()}`,
        monthLabel: date.toLocaleString(language, { month: "short", year: "numeric" }),
        itemCount: agendaCounts[dateKey] || 0,
      };
    });

    return days.reduce((groups, day) => {
      const lastGroup = groups.at(-1);
      if (!lastGroup || lastGroup.monthKey !== day.monthKey) {
        groups.push({ monthKey: day.monthKey, monthLabel: day.monthLabel, days: [day] });
      } else {
        lastGroup.days.push(day);
      }
      return groups;
    }, []);
  }, [agendaItems, agendaToday, language]);

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

  const reservationStatusCounts = useMemo(
    () =>
      reservationStatusOrder.map((status) => ({
        status,
        count: alaCarteReservations.filter((item) => item.status === status).length,
      })),
    [alaCarteReservations],
  );

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
      const name = (review.owner || "Unknown").trim() || "Unknown";
      const entry = map.get(name) || { name, reviewCount: 0, ftfCount: 0 };
      entry.reviewCount += 1;
      map.set(name, entry);
    });
    ftfMeetings.forEach((meeting) => {
      const name = (meeting.assignedAssistant || meeting.owner || "Unknown").trim() || "Unknown";
      const entry = map.get(name) || { name, reviewCount: 0, ftfCount: 0 };
      entry.ftfCount += 1;
      map.set(name, entry);
    });
    return [...map.values()].sort((left, right) => {
      if (right.reviewCount !== left.reviewCount) return right.reviewCount - left.reviewCount;
      if (right.ftfCount !== left.ftfCount) return right.ftfCount - left.ftfCount;
      return left.name.localeCompare(right.name);
    });
  }, [assistantReviews, ftfMeetings]);

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
          [item.platform, item.author, item.branch, item.owner]
            .join(" ")
            .toLowerCase()
            .includes(reviewSearch.toLowerCase()),
        )
        .sort((left, right) => right.date.localeCompare(left.date)),
    [assistantReviews, reviewSearch],
  );

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.readAt),
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
    setNewComplaint({ guest: "", category: "housekeeping", severity: "Medium", status: "Open", channel: "frontDesk", date: "", department: isDepartmentManager && scopedDepartment ? scopedDepartment : "guestRelations", summary: "" });
    setComplaintFormError("");
    logAction("actionComplaintAdded", newComplaint.guest);
    void createDepartmentNotification(scopedComplaint);
  };

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
    setAlaCarteStatusMessage(diningCopy.settingsSaved);
    logAction("actionAlaCartePriceUpdated", `${selectedVenue.name}:settings`);
  };

  const addServiceSlot = () => {
    if (!newServiceSlot.venueId || !newServiceSlot.date || !newServiceSlot.time) return;
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
    setAlaCarteStatusMessage(diningCopy.slotAdded);
    logAction("actionAlaCarteAdded", `${slot.venueId}:${slot.date}:${slot.time}`);
  };

  const addAlaCarteReservation = () => {
    if (!newReservation.guestName.trim() || !newReservation.roomNumber.trim()) return;
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
    const review = {
      id: `review-${Date.now()}`,
      ...newReview,
      rating: Number(newReview.rating),
      owner: newReview.owner.trim() || currentUser?.displayName || copy.unassigned,
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

  const toggleAgendaItem = (id) => {
    const item = agendaItems.find((entry) => entry.id === id);
    setAgendaItems((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, completed: !entry.completed } : entry)),
    );
    if (item) logAction("actionAgendaToggled", item.title);
  };

  const toggleAlaCarteVenue = (id) => {
    const venue = alaCarteVenues.find((item) => item.id === id);
    setAlaCarteVenues((current) =>
      current.map((item) =>
        item.id === id ? { ...item, active: !item.active, occupancy: item.active ? 0 : item.occupancy } : item,
      ),
    );
    if (venue) logAction("actionAlaCarteToggled", venue.name);
  };

  const bumpAlaCartePrice = (id) => {
    const venue = alaCarteVenues.find((item) => item.id === id);
    setAlaCarteVenues((current) =>
      current.map((item) =>
        item.id === id ? { ...item, coverPrice: item.coverPrice + 5 } : item,
      ),
    );
    if (venue) logAction("actionAlaCartePriceUpdated", venue.name);
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

  const inspectModule = (module) => {
    setSelectedModuleId(module.id);
    logAction("actionModuleOpened", module.id);
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
              <button type="button" className="button" onClick={() => void handleSignIn()}>
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
              <button type="button" className="button" onClick={() => void handlePasswordChange()}>
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
                <strong>{visibleModules.length}</strong>
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
          <MetricCard title={copy.totalTasks} value={taskStats.total} icon={CheckSquare} sub={copy.totalTasksSub} />
          <MetricCard title={copy.activeTasks} value={taskStats.active} icon={Clock3} sub={copy.activeTasksSub} />
          <MetricCard title={copy.resolvedComplaints} value={complaintStats.resolved} icon={CheckCircle2} sub={copy.resolvedComplaintsSub} />
          <MetricCard title={copy.criticalComplaints} value={complaintStats.critical} icon={AlertTriangle} sub={copy.criticalComplaintsSub} />
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
                          <strong>{item.title}</strong>
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

            <Panel className="span-2">
              <div className="panel-heading">
                <h2>
                  <CheckSquare size={18} /> {copy.voyageModules}
                </h2>
              </div>
              <p className="muted module-intro">{copy.voyageModulesText}</p>
              <div className="module-grid">
                {visibleModules.map((module) => {
                  const IconComponent = module.icon;
                  const moduleCopy = copy.modules[module.id];
                  return (
                    <article key={module.id} className="module-card">
                      <div className="module-card-top">
                        <div className="metric-icon"><IconComponent size={18} /></div>
                        <div className="module-meta">
                          <span className="tag tag-outline">{copy.internalPanel}</span>
                          <span className="tag tag-green">{copy.panelReady}</span>
                        </div>
                      </div>
                      <strong>{moduleCopy.title}</strong>
                      <p className="muted">{moduleCopy.text}</p>
                      <button type="button" className="ghost-link" onClick={() => inspectModule(module)}>
                        {copy.openPanel}
                      </button>
                    </article>
                  );
                })}
              </div>
              <div className="module-preview top-gap">
                <div className="panel-heading">
                  <h2>
                    <Filter size={18} /> {copy.modulePreviewTitle}
                  </h2>
                </div>
                {!selectedModule && <p className="muted">{copy.modulePreviewEmpty}</p>}
                {selectedModule && (
                  <div className="module-preview-card">
                    <div className="row space-between top">
                      <div className="stack compact">
                        <strong>{copy.modules[selectedModule.id].title}</strong>
                        <p className="muted">{copy.moduleTargets[selectedModule.id]}</p>
                      </div>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => {
                          setActiveTab(moduleTargetTab);
                          logAction("actionTab", copy.modules[selectedModule.id].title);
                        }}
                      >
                        {copy.moduleGoto}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "tasks" && (
          <section className="content-grid">
            <Panel className="span-2">
              <div className="panel-heading split">
                <h2>{copy.todoPlanningBoard}</h2>
                <div className="toolbar">
                  <label className="searchbox">
                    <Search size={16} />
                    <input value={taskSearch} onChange={(event) => setTaskSearch(event.target.value)} placeholder={copy.searchTask} />
                  </label>
                  <select value={taskTypeFilter} onChange={(event) => setTaskTypeFilter(event.target.value)}>
                    <option value="all">{copy.allTypes}</option>
                    <option value="daily">{copy.daily}</option>
                    <option value="periodic">{copy.periodic}</option>
                  </select>
                </div>
              </div>
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
                  <label><span>{copy.owner}</span><input value={newTask.owner} onChange={(event) => setNewTask({ ...newTask, owner: event.target.value })} /></label>
                </div>
                <label><span>{copy.dueDate}</span><input type="date" value={newTask.dueDate} onChange={(event) => setNewTask({ ...newTask, dueDate: event.target.value })} /></label>
                <label><span>{copy.notes}</span><textarea value={newTask.notes} onChange={(event) => setNewTask({ ...newTask, notes: event.target.value })} rows="5" /></label>
                <button type="button" className="button" onClick={addTask}>{copy.addTask}</button>
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
                </div>
              </div>
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
                <label><span>{copy.guestOrCase}</span><input aria-label={copy.guestOrCase} value={newComplaint.guest} onChange={(event) => { setNewComplaint({ ...newComplaint, guest: event.target.value }); setComplaintFormError(""); }} /></label>
                <div className="two-col">
                  <label><span>{copy.category}</span><select value={newComplaint.category} onChange={(event) => setNewComplaint({ ...newComplaint, category: event.target.value })}>{Object.keys(copy.categories).map((key) => <option key={key} value={key}>{localizeCategory(key)}</option>)}</select></label>
                  <label><span>{copy.severity}</span><select value={newComplaint.severity} onChange={(event) => setNewComplaint({ ...newComplaint, severity: event.target.value })}><option value="Low">{localizePriority("Low")}</option><option value="Medium">{localizePriority("Medium")}</option><option value="High">{localizePriority("High")}</option><option value="Critical">{localizePriority("Critical")}</option></select></label>
                </div>
                <div className="two-col">
                  <label><span>{copy.channel}</span><select value={newComplaint.channel} onChange={(event) => setNewComplaint({ ...newComplaint, channel: event.target.value })}>{Object.keys(copy.channels).map((key) => <option key={key} value={key}>{localizeChannel(key)}</option>)}</select></label>
                  <label><span>{copy.date}</span><input type="date" value={newComplaint.date} onChange={(event) => setNewComplaint({ ...newComplaint, date: event.target.value })} /></label>
                </div>
                <label><span>{copy.department}</span><select value={newComplaint.department} disabled={isDepartmentManager} onChange={(event) => setNewComplaint({ ...newComplaint, department: event.target.value })}>{availableDepartmentOptions.map((key) => <option key={key} value={key}>{localizeDepartment(key)}</option>)}</select></label>
                <label><span>{copy.summary}</span><textarea aria-label={copy.summary} rows="5" value={newComplaint.summary} onChange={(event) => { setNewComplaint({ ...newComplaint, summary: event.target.value }); setComplaintFormError(""); }} /></label>
                {complaintFormError && <p className="form-error">{complaintFormError}</p>}
                <button type="button" className="button" onClick={addComplaint}>{copy.addComplaint}</button>
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "alacarte" && (
          <section className="alacarte-layout">
            <Panel className="span-2 alacarte-table-panel">
              <div className="panel-heading">
                <h2>
                  <CalendarDays size={18} /> {copy.alaCarteTitle}
                </h2>
              </div>
              <p className="muted module-intro">{copy.alaCarteText}</p>
              <div className="data-table">
                <div className="data-row data-head">
                  <span>Restaurant</span>
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
                      <small>{restaurant.cuisine}</small>
                    </span>
                    <span>{restaurant.active ? copy.active : copy.passive}</span>
                    <span>{restaurant.openingTime}</span>
                    <span>{restaurant.lastArrival}</span>
                    <span>{restaurant.coverPrice} {restaurant.currency}</span>
                    <span>{restaurant.maxGuests}</span>
                    <span>{restaurant.workingDays.join(", ")}</span>
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
                          <span>{reservation.status}</span>
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
                            <span className="tag tag-outline">{entry.priority}</span>
                            <span className={entry.status === "Waiting" ? statusTone.Open : statusTone.Resolved}>{entry.status}</span>
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
                        <p className="muted">{copy.cuisine}: {restaurant.cuisine}</p>
                      </div>
                      <div className="spec-actions">
                        <button type="button" className="button secondary slim-button" onClick={() => toggleAlaCarteVenue(restaurant.id)}>
                          {restaurant.active ? copy.passive : copy.active}
                        </button>
                        <button type="button" className="button secondary slim-button" onClick={() => bumpAlaCartePrice(restaurant.id)}>
                          {copy.updatePrice}
                        </button>
                      </div>
                    </div>
                    <div className="spec-pairs">
                      <div><span className="eyebrow">{copy.childPolicy}</span><p>{restaurant.childPolicy}</p></div>
                      <div><span className="eyebrow">{copy.cancellationWindow}</span><p>{restaurant.cancellationWindow}</p></div>
                      <div><span className="eyebrow">{copy.closeSaleWindow}</span><p>{restaurant.closeSaleWindow}</p></div>
                      <div><span className="eyebrow">{copy.roomNightLimit}</span><p>{restaurant.roomNightLimit}</p></div>
                      <div><span className="eyebrow">{copy.areaPreference}</span><p>{restaurant.areaPreference ? copy.yes : copy.no}</p></div>
                      <div><span className="eyebrow">{copy.mixedTable}</span><p>{restaurant.mixedTable ? copy.yes : copy.no}</p></div>
                      <div><span className="eyebrow">{copy.includeOtherRooms}</span><p>{restaurant.includeOtherRooms ? copy.yes : copy.no}</p></div>
                      <div><span className="eyebrow">{copy.tableSetup}</span><p>{restaurant.tableSetup}</p></div>
                    </div>
                    <div className="spec-note">
                      <span className="eyebrow">{copy.operationalNote}</span>
                      <p>{restaurant.note}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
            <Panel className="alacarte-side-panel">
              <div className="panel-heading">
                <h2>
                  <BarChart3 size={18} /> {copy.alaCarteSystemTitle}
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
                <span className="eyebrow">Runtime</span>
                <p>Role-scoped internal operational model. No outbound dependency on live reservation pages.</p>
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
                  <label><span>{diningCopy.source}</span><select value={newReservation.source} onChange={(event) => setNewReservation({ ...newReservation, source: event.target.value })}><option>App</option><option>Guest Relations</option><option>Front Office</option><option>Manager</option></select></label>
                </div>
                <div className="two-col">
                  <label><span>{diningCopy.reservationDate}</span><input type="date" value={newReservation.reservationDate} onChange={(event) => setNewReservation({ ...newReservation, reservationDate: event.target.value })} /></label>
                  <label><span>{diningCopy.slotTime}</span><input type="time" value={newReservation.slotTime} onChange={(event) => setNewReservation({ ...newReservation, slotTime: event.target.value })} /></label>
                </div>
                <label><span>{copy.operationalNote}</span><textarea rows="3" value={newReservation.note} onChange={(event) => setNewReservation({ ...newReservation, note: event.target.value })} /></label>
                <button type="button" className="button" onClick={addAlaCarteReservation}>{diningCopy.addReservation}</button>
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
                <button type="button" className="button secondary" onClick={addWaitlistEntry}>{diningCopy.addWaitlist}</button>
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
                <label><span>{copy.operationalNote}</span><textarea rows="3" value={venueSettings.note} onChange={(event) => setVenueSettings({ ...venueSettings, note: event.target.value })} /></label>
                <button type="button" className="button secondary" onClick={saveAlaCarteSettings}>{diningCopy.saveSettings}</button>
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
                <button type="button" className="button secondary" onClick={addServiceSlot}>{diningCopy.addServiceSlot}</button>
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
                <label><span>{copy.operationalNote}</span><textarea rows="4" value={newVenue.note} onChange={(event) => setNewVenue({ ...newVenue, note: event.target.value })} /></label>
                <button type="button" className="button" onClick={addAlaCarteVenue}>{copy.addVenue}</button>
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "analysis" && (
          <section className="analysis-grid">
            <Panel className="chart-panel">
              <div className="panel-heading"><h2><BarChart3 size={18} /> {copy.complaintCategories}</h2></div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complaintByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#1d4ed8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel className="chart-panel">
              <div className="panel-heading"><h2><Filter size={18} /> {copy.complaintStatusDistribution}</h2></div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={complaintByStatus} dataKey="value" nameKey="name" outerRadius={104} innerRadius={58} paddingAngle={4}>
                      {complaintByStatus.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                {complaintByStatus.map((entry, index) => (
                  <div key={entry.name} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                    {entry.name}: {entry.value}
                  </div>
                ))}
              </div>
            </Panel>
            <Panel><p className="eyebrow">{copy.totalComplaints}</p><p className="hero-value">{complaintStats.total}</p></Panel>
            <Panel><p className="eyebrow">{copy.openRatio}</p><p className="hero-value">{complaintStats.total ? Math.round((complaintStats.open / complaintStats.total) * 100) : 0}%</p></Panel>
            <Panel><p className="eyebrow">{copy.resolutionRatio}</p><p className="hero-value">{complaintStats.total ? Math.round((complaintStats.resolved / complaintStats.total) * 100) : 0}%</p></Panel>
          </section>
        )}

        {visibleTab === "assistantTracker" && (
          <section className="content-grid">
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
                <label><span>{copy.notes}</span><textarea aria-label={copy.notes} rows="4" value={newMeeting.notes} onChange={(event) => setNewMeeting({ ...newMeeting, notes: event.target.value })} /></label>
                <button type="button" className="button" onClick={addAssistantMeeting}>{copy.saveMeeting}</button>
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
                        <p className="muted">{meeting.topic}</p>
                        <p className="muted">{meeting.contact || copy.notSet} | {meeting.assignedAssistant || meeting.owner}</p>
                        <p>{meeting.notes}</p>
                      </div>
                      <div className="stack compact">
                        <span className="tag tag-amber">{meeting.result}</span>
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
                <label><span>{copy.contentLabel}</span><textarea aria-label={copy.contentLabel} rows="4" value={newReview.content} onChange={(event) => setNewReview({ ...newReview, content: event.target.value })} /></label>
                <button type="button" className="button" onClick={addAssistantReview}>{copy.saveReview}</button>
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
                        </div>
                        <p className="muted">{review.branch} | {review.date} | {review.owner || copy.unassigned}</p>
                        <p>{review.content}</p>
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
              <div className="panel-heading top-gap">
                <h2>
                  <ClipboardList size={18} /> {copy.calendar365Title}
                </h2>
              </div>
              <div className="calendar-grid">
                {calendarMonths.map((month) => (
                  <article key={month.monthKey} className="month-card">
                    <div className="row space-between">
                      <strong>{month.monthLabel}</strong>
                      <span className="eyebrow">{copy.monthlyLoad}: {month.days.reduce((sum, day) => sum + day.itemCount, 0)}</span>
                    </div>
                    <div className="month-days">
                      {month.days.map((day) => (
                        <div
                          key={day.dateKey}
                          className={day.itemCount > 0 ? "day-chip day-chip-active" : "day-chip"}
                          title={`${formatDate(day.dateKey)} - ${day.itemCount}`}
                        >
                          {day.dayNumber}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
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
                <label><span>{copy.agendaTaskContext}</span><textarea rows="4" value={newAgendaItem.note} onChange={(event) => setNewAgendaItem({ ...newAgendaItem, note: event.target.value })} /></label>
                <button type="button" className="button" onClick={addAgendaItem}>{copy.addAgendaTask}</button>
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
                        <p>{item.note}</p>
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
                      <strong>{item.title}</strong>
                      <span className={priorityTone[item.priority]}>{localizePriority(item.priority)}</span>
                    </div>
                    <p className="muted">{item.owner} | {formatDate(item.date)}</p>
                    <p>{item.note}</p>
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
                    <span>{item.title}</span>
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
                              <span>
                                {tabId === "dashboard"
                                  ? copy.dashboard
                                  : tabId === "tasks"
                                    ? copy.tasksTab
                                    : tabId === "complaints"
                                      ? copy.complaintsTab
                                      : tabId === "alacarte"
                                        ? copy.alacarteTab
                                        : tabId === "assistantTracker"
                                          ? copy.assistantTrackerTab
                                          : copy.analysis}
                              </span>
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
                              <span>
                                {tabId === "dashboard"
                                  ? copy.dashboard
                                  : tabId === "tasks"
                                    ? copy.tasksTab
                                    : tabId === "complaints"
                                      ? copy.complaintsTab
                                      : tabId === "alacarte"
                                        ? copy.alacarteTab
                                        : tabId === "assistantTracker"
                                          ? copy.assistantTrackerTab
                                          : copy.analysis}
                              </span>
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
            <Panel>
              <div className="panel-heading">
                <h2>
                  <CheckSquare size={18} /> {copy.permissionTitle}
                </h2>
              </div>
              <div className="stack">
                {isAdminUser && editableRoles.map((role) => (
                  <div key={`${role}-summary`} className="control-line">
                    <span>{roleLabel(role)}</span>
                    <strong>{permissions[role].tabs.length} / {permissionTabs.length}</strong>
                  </div>
                ))}
                {!isAdminUser && (
                  <div className="control-line">
                    <span>{copy.departmentPermissionTitle}</span>
                    <strong>{scopedPermissionUsers.length}</strong>
                  </div>
                )}
                <div className="spec-note side-note">
                  <span className="eyebrow">{copy.voyageModules}</span>
                  <p>{copy.permissionScopeNote}</p>
                </div>
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
            <Panel>
              <div className="panel-heading">
                <h2>
                  <BarChart3 size={18} /> {copy.managerOpsTab}
                </h2>
              </div>
              <div className="stack">
                <div className="control-line">
                  <span>{copy.auditTitle}</span>
                  <strong>{activityLogs.length}</strong>
                </div>
                <div className="control-line">
                  <span>{copy.auditUser}</span>
                  <strong>{new Set(activityLogs.map((item) => item.username)).size}</strong>
                </div>
                <div className="control-line">
                  <span>{copy.auditAction}</span>
                  <strong>{activityLogs[0] ? (copy[activityLogs[0].actionKey] ?? activityLogs[0].actionKey) : "-"}</strong>
                </div>
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
                <button type="button" className="button" onClick={() => void handleUserUpdate()}>
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
