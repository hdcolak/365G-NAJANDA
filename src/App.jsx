import { useEffect, useMemo, useState } from "react";
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
  { username: "gizem.yonetici", role: "manager", displayName: "Gizem", department: "management" },
  { username: "selim.muduryrd", role: "deputy", displayName: "Selim", department: "management" },
  { username: "ece.sef", role: "chief", displayName: "Ece", department: "operations" },
  { username: "deniz.asistan", role: "assistant", displayName: "Deniz", department: "guestRelations" },
];

const defaultRoleAccess = {
  manager: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"],
    modules: ["guest", "settings", "assistant"],
    showAudit: true,
  },
  deputy: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"],
    modules: ["guest", "settings", "assistant"],
    showAudit: false,
  },
  chief: {
    tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"],
    modules: ["guest", "settings", "assistant"],
    showAudit: false,
  },
  assistant: {
    tabs: ["dashboard", "complaints"],
    modules: ["guest", "assistant"],
    showAudit: false,
  },
};

const editableRoles = ["deputy", "chief", "assistant"];
const permissionTabs = ["dashboard", "tasks", "complaints", "alacarte", "analysis"];
const managerTabs = ["managerAgenda", "permissions", "managerOps"];

const internalModules = [
  { id: "guest", icon: Building2 },
  { id: "settings", icon: CheckSquare },
  { id: "assistant", icon: MessageSquareWarning },
];

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
    },
    modules: {
      guest: { title: "Misafir paneli", text: "Misafir akışları, programlar ve rezervasyon kural motoru için iç sistem alanı." },
      settings: { title: "Ayarlar paneli", text: "İçerik, ekip, eşleştirme ve operasyon kuralları için iç yönetim modülü." },
      assistant: { title: "Asistan paneli", text: "Oda seçimi, görev yönlendirme ve misafir chat akışı için iç servis alanı." },
    },
    roles: {
      manager: "Müdür",
      deputy: "Müdür Yardımcısı",
      chief: "Şef",
      assistant: "Asistan",
    },
    loginTitle: "Tek link giriş paneli",
    loginText:
      "Kullanıcı adına göre giriş yapın. Müdür tüm işlem kayıtlarını görür, diğer roller yalnızca kendi yetkili alanlarını kullanır.",
    selectUser: "Kullanıcı seç",
    signIn: "Giriş yap",
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
      "Müdür yardımcısı, şef ve asistan rollerinin sekme ve modül erişimini buradan düzenleyin.",
    permissionScopeNote: "Rol bazlı sekme ve panel yetkileri sadece müdür tarafından güncellenir.",
    accessNoteAssistant:
      "Asistan hesabı yalnızca panel özeti, şikayetler ve izin verilen dış modüllere erişebilir.",
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
      frontOffice: "Ön Büro",
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
    },
    modules: {
      guest: { title: "Guest panel", text: "Internal system area for guest flows, schedules and reservation rules." },
      settings: { title: "Settings panel", text: "Internal admin module for content, teams, mappings and operation rules." },
      assistant: { title: "Assistant panel", text: "Internal service area for room selection, routing and guest chat flow." },
    },
    roles: { manager: "Manager", deputy: "Deputy Manager", chief: "Chief", assistant: "Assistant" },
    loginTitle: "Single-link sign-in panel",
    loginText:
      "Sign in by username. The manager sees all activity logs, while other roles use only their authorized areas.",
    selectUser: "Select user",
    signIn: "Sign in",
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
      "Adjust tab and module access for deputy manager, chief and assistant roles here.",
    permissionScopeNote: "Role-based tab and panel permissions can only be updated by the manager.",
    accessNoteAssistant:
      "Assistant accounts can access only the dashboard summary, complaints and allowed external modules.",
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
      frontOffice: "Front Office",
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
    },
    modules: {
      guest: { title: "Gasterlebnis", text: "Interner Systembereich für Gastabläufe, Zeitpläne und Reservierungsregeln." },
      settings: { title: "Management-Einstellungen", text: "Internes Admin-Modul für Inhalte, Teams, Zuordnungen und Regeln." },
      assistant: { title: "Assistentenbetrieb", text: "Interner Servicebereich für Zimmerauswahl, Routing und Gast-Chat." },
    },
    roles: { manager: "Manager", deputy: "Stellv. Manager", chief: "Chef", assistant: "Assistent" },
    loginTitle: "Einzel-Link-Anmeldung",
    loginText:
      "Anmeldung per Benutzername. Nur der Manager sieht alle Aktivitätsprotokolle, andere Rollen nur ihre freigegebenen Bereiche.",
    selectUser: "Benutzer wählen",
    signIn: "Anmelden",
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
      "Register- und Modulzugriff für stellv. Manager, Chef und Assistent hier anpassen.",
    permissionScopeNote: "Rollenbasierte Register- und Panelrechte können nur vom Manager geändert werden.",
    accessNoteAssistant:
      "Assistentenkonten können nur auf Dashboard, Beschwerden und erlaubte externe Module zugreifen.",
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
      frontOffice: "Rezeption",
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
    },
    modules: {
      guest: { title: "Гостевой опыт", text: "Внутренний системный блок для потоков гостя, расписаний и правил бронирования." },
      settings: { title: "Управленческие настройки", text: "Внутренний админ-модуль для контента, команд, связок и операционных правил." },
      assistant: { title: "Операции ассистента", text: "Внутренний сервисный блок для выбора номера, маршрутизации и гостевого чата." },
    },
    roles: { manager: "Менеджер", deputy: "Зам. менеджера", chief: "Шеф", assistant: "Ассистент" },
    loginTitle: "Единая панель входа",
    loginText:
      "Вход по имени пользователя. Только менеджер видит все журналы действий, остальные роли работают в своих разрешенных зонах.",
    selectUser: "Выберите пользователя",
    signIn: "Войти",
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
      "Настраивайте доступ к вкладкам и модулям для заместителя, шефа и ассистента.",
    permissionScopeNote: "Ролевые права на вкладки и панели может менять только менеджер.",
    accessNoteAssistant:
      "Аккаунт ассистента может работать только с панелью, жалобами и разрешенными внешними модулями.",
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
      frontOffice: "Ресепшен",
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
  if (typeof window === "undefined") return null;
  const username = window.localStorage.getItem("active-user");
  return users.find((item) => item.username === username) ?? null;
}

function getStoredLogs() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("activity-logs") ?? "[]");
  } catch {
    return [];
  }
}

function getStoredPermissions() {
  if (typeof window === "undefined") return defaultRoleAccess;
  try {
    const parsed = JSON.parse(window.localStorage.getItem("role-permissions") ?? "null");
    return parsed ? { ...defaultRoleAccess, ...parsed } : defaultRoleAccess;
  } catch {
    return defaultRoleAccess;
  }
}

function normalizePermissions(payload) {
  return payload ? { ...defaultRoleAccess, ...payload } : defaultRoleAccess;
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
  const [language, setLanguage] = useState(getInitialLanguage);
  const [activeTab, setActiveTab] = useState(() => {
    const view = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("view") : null;
    return ["dashboard", "tasks", "complaints", "alacarte", "analysis", "managerAgenda", "permissions", "managerOps"].includes(view) ? view : "dashboard";
  });
  const [selectedUsername, setSelectedUsername] = useState(users[0].username);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [activityLogs, setActivityLogs] = useState(getStoredLogs);
  const [permissions, setPermissions] = useState(getStoredPermissions);
  const [syncMode, setSyncMode] = useState("connecting");
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [agendaItems, setAgendaItems] = useState(initialAgendaItems);
  const [alaCarteVenues, setAlaCarteVenues] = useState(initialAlaCarteVenues);
  const [taskSearch, setTaskSearch] = useState("");
  const [complaintSearch, setComplaintSearch] = useState("");
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
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: "",
    date: "2026-03-11",
    owner: "",
    priority: "High",
    note: "",
  });

  const copy = translations[language];
  const activeRole = currentUser ? permissions[currentUser.role] : null;
  const availableTabIds = useMemo(
    () =>
      [
        ...(activeRole?.tabs ?? []),
        ...(currentUser?.role === "manager" ? managerTabs : []),
      ].filter((value, index, array) => array.indexOf(value) === index),
    [activeRole, currentUser],
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.appTitle;
    window.localStorage.setItem("app-language", language);
  }, [copy.appTitle, language]);

  useEffect(() => {
    if (!currentUser) return;
    window.localStorage.setItem("active-user", currentUser.username);
  }, [currentUser]);

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/bootstrap`);
        if (!response.ok) throw new Error("bootstrap failed");
        const payload = await response.json();
        if (ignore) return;
        setTasks(payload.tasks?.length ? payload.tasks : initialTasks);
        setComplaints(payload.complaints?.length ? payload.complaints : initialComplaints);
        setAgendaItems(payload.agendaItems?.length ? payload.agendaItems : initialAgendaItems);
        setAlaCarteVenues(payload.alaCarteVenues?.length ? payload.alaCarteVenues : initialAlaCarteVenues);
        setActivityLogs(payload.activityLogs ?? []);
        setPermissions(normalizePermissions(payload.permissions));
        setSyncMode("api");
      } catch {
        if (ignore) return;
        setSyncMode("local");
      } finally {
        if (!ignore) setBootstrapReady(true);
      }
    }

    bootstrap();
    return () => {
      ignore = true;
    };
  }, []);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users,
          permissions,
          tasks,
          complaints,
          agendaItems,
          alaCarteVenues,
          activityLogs,
        }),
      }).catch(() => {
        setSyncMode("local");
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [activityLogs, agendaItems, alaCarteVenues, bootstrapReady, complaints, permissions, syncMode, tasks]);

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
        ? (currentUser?.role === "manager" ? "permissions" : "analysis")
        : selectedModule?.id === "assistant"
          ? "complaints"
          : "dashboard";

  const updateRolePermission = (role, type, value) => {
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
    };
  }, [alaCarteVenues]);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks((current) => [{ ...newTask, id: Date.now(), notes: newTask.notes }, ...current]);
    setNewTask({ title: "", type: "daily", department: "guestRelations", owner: "", dueDate: "", priority: "Medium", status: "Planned", progress: 0, notes: "" });
    logAction("actionTaskAdded", newTask.title);
  };

  const addComplaint = () => {
    if (!newComplaint.guest.trim() || !newComplaint.summary.trim()) {
      setComplaintFormError(copy.complaintValidation);
      return;
    }
    setComplaints((current) => [{ ...newComplaint, id: Date.now(), summary: newComplaint.summary }, ...current]);
    setNewComplaint({ guest: "", category: "housekeeping", severity: "Medium", status: "Open", channel: "frontDesk", date: "", department: "guestRelations", summary: "" });
    setComplaintFormError("");
    logAction("actionComplaintAdded", newComplaint.guest);
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
    logAction("actionAlaCarteAdded", venue.name);
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

  const handleSignIn = () => {
    const selected = users.find((item) => item.username === selectedUsername);
    if (!selected) return;
    setCurrentUser(selected);
    setActivityLogs((current) => [
      {
        id: Date.now(),
        username: selected.username,
        displayName: selected.displayName,
        role: selected.role,
        actionKey: "actionLogin",
        detail: selected.username,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    const firstAllowedTab = permissions[selected.role].tabs[0] ?? "dashboard";
    setActiveTab(firstAllowedTab);
  };

  const handleSignOut = () => {
    if (currentUser) {
      setActivityLogs((current) => [
        {
          id: Date.now(),
          username: currentUser.username,
          displayName: currentUser.displayName,
          role: currentUser.role,
          actionKey: "actionLogout",
          detail: currentUser.username,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
    }
    window.localStorage.removeItem("active-user");
    setCurrentUser(null);
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
                <span>{copy.selectUser}</span>
                <select aria-label={copy.selectUser} value={selectedUsername} onChange={(event) => setSelectedUsername(event.target.value)}>
                  {users.map((user) => (
                    <option key={user.username} value={user.username}>
                      {user.displayName} · {roleLabel(user.role)} · {user.username}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="button" onClick={handleSignIn}>
                {copy.signIn}
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
                  <span>{copy.signedInAs}: {currentUser.displayName}</span>
                  <strong>{roleLabel(currentUser.role)}</strong>
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
            <p className="access-note">{currentUser.role === "assistant" ? copy.accessNoteAssistant : copy.accessNoteFull}</p>
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
                  <label><span>{copy.department}</span><select value={newTask.department} onChange={(event) => setNewTask({ ...newTask, department: event.target.value })}>{Object.keys(copy.departments).map((key) => <option key={key} value={key}>{localizeDepartment(key)}</option>)}</select></label>
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
                <label><span>{copy.department}</span><select value={newComplaint.department} onChange={(event) => setNewComplaint({ ...newComplaint, department: event.target.value })}>{Object.keys(copy.departments).map((key) => <option key={key} value={key}>{localizeDepartment(key)}</option>)}</select></label>
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
              </div>
              <div className="spec-note side-note">
                <span className="eyebrow">Runtime</span>
                <p>Role-scoped internal operational model. No outbound dependency on live reservation pages.</p>
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

        {visibleTab === "managerAgenda" && currentUser?.role === "manager" && (
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

        {visibleTab === "permissions" && currentUser?.role === "manager" && (
          <section className="content-grid">
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
                                      : copy.analysis}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="permission-section">
                      <span className="eyebrow">{copy.voyageModules}</span>
                      <div className="permission-options">
                        {internalModules.map((module) => (
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
            <Panel>
              <div className="panel-heading">
                <h2>
                  <CheckSquare size={18} /> {copy.permissionTitle}
                </h2>
              </div>
              <div className="stack">
                {editableRoles.map((role) => (
                  <div key={`${role}-summary`} className="control-line">
                    <span>{roleLabel(role)}</span>
                    <strong>{permissions[role].tabs.length} / {permissionTabs.length}</strong>
                  </div>
                ))}
                <div className="spec-note side-note">
                  <span className="eyebrow">{copy.voyageModules}</span>
                  <p>{copy.permissionScopeNote}</p>
                </div>
              </div>
            </Panel>
          </section>
        )}

        {visibleTab === "managerOps" && currentUser?.role === "manager" && (
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
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
