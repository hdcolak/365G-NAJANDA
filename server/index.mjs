import { createServer } from "node:http";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import pg from "pg";

const port = Number(process.env.PORT || 10000);
const host = process.env.HOST || "0.0.0.0";
const dataDir = process.env.DATA_DIR || join(process.cwd(), "server-data");
const dataFile = join(dataDir, "state.json");
const distDir = join(process.cwd(), "dist");
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? new pg.Pool({ connectionString: databaseUrl }) : null;
const isTestEnv = process.env.NODE_ENV === "test";
const defaultPassword = process.env.DEFAULT_LOGIN_PASSWORD || "1234";
const mainAccessCode = process.env.MAIN_ACCESS_CODE || "1234";
const adminResetKey = process.env.ADMIN_RESET_KEY || "1234-admin-reset";
const reviewScheduleTimeZone = "Europe/Istanbul";
const staticContentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const seedUsers = [
  { username: "admin.voyage", role: "admin", displayName: "Admin", department: "management", requirePasswordChange: true },
  { username: "gizem.yonetici", role: "manager", titleKey: "generalManager", displayName: "Gizem", department: "management", requirePasswordChange: true },
  { username: "selim.muduryrd", role: "deputy", titleKey: "generalManagerAssistant", displayName: "Selim", department: "management", requirePasswordChange: true },
  { username: "ece.operasyonmdr", role: "chief", titleKey: "operationsManager", displayName: "Ece", department: "operations", requirePasswordChange: true },
  { username: "deniz.asistan", role: "assistant", displayName: "Deniz", department: "guestRelations", requirePasswordChange: true },
  { username: "ayse.resepsiyonmdr", role: "departmentManager", titleKey: "frontOfficeManager", displayName: "Ayse", department: "frontOffice", scopeDepartment: "frontOffice", requirePasswordChange: true },
  { username: "zeynep.housekeepingmdr", role: "departmentManager", titleKey: "executiveHousekeeper", displayName: "Zeynep", department: "housekeeping", scopeDepartment: "housekeeping", requirePasswordChange: true },
  { username: "emir.animasyonmdr", role: "departmentManager", titleKey: "entertainmentManager", displayName: "Emir", department: "entertainment", scopeDepartment: "entertainment", requirePasswordChange: true },
  { username: "emre.teknikmdr", role: "departmentManager", titleKey: "chiefEngineer", displayName: "Emre", department: "technical", scopeDepartment: "technical", requirePasswordChange: true },
  { username: "burak.fbmdr", role: "departmentManager", titleKey: "foodBeverageManager", displayName: "Burak", department: "fb", scopeDepartment: "fb", requirePasswordChange: true },
  { username: "mina.misafirmdr", role: "departmentManager", titleKey: "guestRelationsManager", displayName: "Mina", department: "guestRelations", scopeDepartment: "guestRelations", requirePasswordChange: true },
  { username: "pelin.misafirmdryrd", role: "departmentManager", titleKey: "guestRelationsDeputyManager", displayName: "Pelin", department: "guestRelations", scopeDepartment: "guestRelations", requirePasswordChange: true },
  { username: "omer.misafirsefi", role: "departmentManager", titleKey: "guestRelationsChief", displayName: "Omer", department: "guestRelations", scopeDepartment: "guestRelations", requirePasswordChange: true },
  { username: "hakan.guvenlikmdr", role: "departmentManager", titleKey: "securityManager", displayName: "Hakan", department: "security", scopeDepartment: "security", requirePasswordChange: true },
  { username: "sevgi.spamdr", role: "departmentManager", titleKey: "spaManager", displayName: "Sevgi", department: "spa", scopeDepartment: "spa", requirePasswordChange: true },
  { username: "ceren.satismdr", role: "departmentManager", titleKey: "salesManager", displayName: "Ceren", department: "sales", scopeDepartment: "sales", requirePasswordChange: true },
  { username: "onur.ikmdr", role: "departmentManager", titleKey: "hrManager", displayName: "Onur", department: "humanResources", scopeDepartment: "humanResources", requirePasswordChange: true },
  { username: "asli.finansmdr", role: "departmentManager", titleKey: "financeManager", displayName: "Asli", department: "finance", scopeDepartment: "finance", requirePasswordChange: true },
  { username: "tolga.satinalmamdr", role: "departmentManager", titleKey: "purchasingManager", displayName: "Tolga", department: "purchasing", scopeDepartment: "purchasing", requirePasswordChange: true },
  { username: "derya.kalitemdr", role: "departmentManager", titleKey: "qualityManager", displayName: "Derya", department: "quality", scopeDepartment: "quality", requirePasswordChange: true },
];

const initialState = {
  meta: {
    hotel: "Voyage Kundu",
    updatedAt: new Date().toISOString(),
  },
  users: seedUsers,
  userPermissions: {},
  sessions: [],
  permissions: {
    admin: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: true },
    manager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: true },
    deputy: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
    chief: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
    assistant: { tabs: ["dashboard", "complaints", "orders", "assistantTracker"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
    departmentManager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
  },
  tasks: [
    { id: 1, titleKey: "vipArrivalPreparation", type: "daily", department: "guestRelations", owner: "Denizcan", dueDate: "2026-03-10", priority: "High", status: "In Progress", progress: 60, notesKey: "vipArrivalPreparation" },
    { id: 2, titleKey: "weeklyTeamBriefingPlan", type: "periodic", department: "operations", owner: "Shift Leader", dueDate: "2026-03-14", priority: "Medium", status: "Planned", progress: 25, notesKey: "weeklyTeamBriefingPlan" },
    { id: 3, titleKey: "complaintFollowUpBacklogCleanup", type: "periodic", department: "guestRelations", owner: "Jiska Team", dueDate: "2026-03-16", priority: "High", status: "Not Started", progress: 0, notesKey: "complaintFollowUpBacklogCleanup" },
  ],
  complaints: [
    { id: 1, guest: "Muller Family", category: "housekeeping", severity: "Medium", status: "Resolved", channel: "frontDesk", date: "2026-03-08", department: "housekeeping", summaryKey: "roomCleaningDelayed" },
    { id: 2, guest: "Ivan Petrov", category: "foodBeverage", severity: "High", status: "Open", channel: "whatsapp", date: "2026-03-09", department: "fb", summaryKey: "dinnerServiceComplaint" },
    { id: 3, guest: "Sarah Collins", category: "technical", severity: "Critical", status: "In Review", channel: "voyageAssistant", date: "2026-03-10", department: "technical", summaryKey: "acIssue" },
    { id: 4, guest: "Kaya Suite 2201", category: "noise", severity: "Low", status: "Resolved", channel: "callCenter", date: "2026-03-10", department: "security", summaryKey: "corridorNoise" },
  ],
  agendaItems: [
    { id: 1, title: "VIP arrival briefing approval", date: "2026-03-11", owner: "Gizem", priority: "Critical", note: "Confirm welcome flow, suite readiness and guest relations handoff.", completed: false },
    { id: 2, title: "Housekeeping recovery backlog review", date: "2026-03-11", owner: "Selim", priority: "High", note: "Close delayed cleaning cases before evening report.", completed: false },
    { id: 3, title: "Tomorrow ala carte capacity lock", date: "2026-03-12", owner: "Ece", priority: "Critical", note: "Freeze tomorrow evening allocations and inform assistant routing.", completed: false },
    { id: 4, title: "Technical preventive check for suites", date: "2026-03-12", owner: "Maintenance", priority: "High", note: "Focus on AC and minibar controls for VIP floor.", completed: false },
    { id: 5, title: "Weekly executive summary draft", date: "2026-03-15", owner: "Gizem", priority: "Medium", note: "Prepare service quality and complaint resolution summary.", completed: false },
  ],
  alaCarteVenues: [
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
      childPolicy: "0-11 yas cocuklar ucretsiz",
      cancellationWindow: "2 hours",
      closeSaleWindow: "1 hour",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      roomNightLimit: 1,
      includeOtherRooms: false,
      tableSetup: "2, 4, 6 pax tables",
      note: "Turk mutfagi odakli, klasik aile rezervasyon akisi.",
      demand: "High",
      occupancy: 78,
      slotCount: 3
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
      childPolicy: "0-11 yas cocuklar ucretsiz",
      cancellationWindow: "3 hours",
      closeSaleWindow: "90 minutes",
      workingDays: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      roomNightLimit: 1,
      includeOtherRooms: false,
      tableSetup: "2, 4, 6 pax tables",
      note: "Italyan konseptli aksam servisi.",
      demand: "High",
      occupancy: 74,
      slotCount: 4
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
      childPolicy: "0-11 yas cocuklar ucretsiz",
      cancellationWindow: "2 hours",
      closeSaleWindow: "1 hour",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      roomNightLimit: 1,
      includeOtherRooms: false,
      tableSetup: "2, 4, 6 pax tables",
      note: "Yunan mutfagi, deniz urunu ve meze agirlikli servis.",
      demand: "Medium",
      occupancy: 66,
      slotCount: 3
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
      childPolicy: "0-11 yas cocuklar ucretsiz",
      cancellationWindow: "2 hours",
      closeSaleWindow: "1 hour",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      roomNightLimit: 1,
      includeOtherRooms: false,
      tableSetup: "2, 4, 6 pax tables",
      note: "Uzak dogu servis akisi, kapali alan agirlikli.",
      demand: "High",
      occupancy: 81,
      slotCount: 3
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
      childPolicy: "0-11 yas cocuklar ucretsiz",
      cancellationWindow: "3 hours",
      closeSaleWindow: "90 minutes",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      roomNightLimit: 1,
      includeOtherRooms: false,
      tableSetup: "2, 4, 6 pax tables",
      note: "Premium et restorani, yuksek gelir segmenti.",
      demand: "Critical",
      occupancy: 88,
      slotCount: 2
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
      childPolicy: "Teppanyaki restoraninda 0-11 yas ucretsiz degil",
      cancellationWindow: "3 hours",
      closeSaleWindow: "90 minutes",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      roomNightLimit: 1,
      includeOtherRooms: false,
      tableSetup: "Shared chef counter + 4 pax tables",
      note: "Show mutfagi akisi, cocuk ucretsiz politikasi uygulanmaz.",
      demand: "Critical",
      occupancy: 91,
      slotCount: 2
    },
  ],
  alaCarteReservations: [
    { id: "res-1001", venueId: "kebappa-turkish-restaurant", guestName: "Muller Family", roomNumber: "4102", partySize: 4, reservationDate: "2026-03-12", slotTime: "19:00", status: "Booked", source: "Guest Relations", note: "Aile masasi talebi" },
    { id: "res-1002", venueId: "teppanyaki-japanese-restaurant", guestName: "Ivan Petrov", roomNumber: "3304", partySize: 2, reservationDate: "2026-03-12", slotTime: "20:00", status: "Confirmed", source: "App", note: "Show counter talebi" },
  ],
  alaCarteWaitlist: [
    { id: "wait-1001", venueId: "carino-steakhouse-restaurant", guestName: "Kaya Suite", roomNumber: "2201", partySize: 2, preferredDate: "2026-03-12", preferredWindow: "20:30-21:00", priority: "VIP", status: "Waiting" },
  ],
  alaCarteServiceSlots: [
    { id: "slot-1", venueId: "kebappa-turkish-restaurant", date: "2026-03-12", time: "19:00", maxCovers: 24, bookedCovers: 12, waitlistCount: 0 },
    { id: "slot-2", venueId: "vista-italian", date: "2026-03-12", time: "20:00", maxCovers: 20, bookedCovers: 10, waitlistCount: 0 },
    { id: "slot-3", venueId: "buzuki-greek-restaurant", date: "2026-03-12", time: "19:30", maxCovers: 18, bookedCovers: 8, waitlistCount: 0 },
    { id: "slot-4", venueId: "wen-chinese-restaurant", date: "2026-03-12", time: "20:00", maxCovers: 18, bookedCovers: 9, waitlistCount: 0 },
    { id: "slot-5", venueId: "carino-steakhouse-restaurant", date: "2026-03-12", time: "20:30", maxCovers: 14, bookedCovers: 10, waitlistCount: 1 },
    { id: "slot-6", venueId: "teppanyaki-japanese-restaurant", date: "2026-03-12", time: "20:00", maxCovers: 12, bookedCovers: 10, waitlistCount: 0 },
  ],
  orders: [
    { id: "order-fruit-1", type: "fruitWine", roomNumber: "4102", note: "Kırmızı şarap ile hazırlanacak", createdAt: "2026-03-12T11:00:00.000Z" },
    { id: "order-cake-1", type: "cake", roomNumber: "3304", note: "Doğum günü pastası saat 20:00", createdAt: "2026-03-12T12:00:00.000Z" },
    { id: "order-room-1", type: "roomDecoration", roomNumber: "5101", note: "Balon ve gul yapraklari ile hazirlansin", createdAt: "2026-03-12T12:30:00.000Z" },
    { id: "order-special-1", type: "specialRequest", roomNumber: "2201", note: "Glutensiz ikram talebi", createdAt: "2026-03-12T13:00:00.000Z" },
  ],
  assistantMeetings: [
    { id: "meet-1", customerName: "Ayse Demir", date: "2026-03-12", time: "10:30", contact: "0555 123 45 67", topic: "Oda memnuniyeti gorusmesi", tagCode: "FTF", result: "Takip gerekli", notes: "Kahvalti alaniyla ilgili geri bildirim verdi. Yarin tekrar aranacak.", followUpDate: "2026-03-12", owner: "Merve", assignedAssistant: "Merve", isFTF: true, createdAt: "2026-03-12T10:30:00.000Z" },
    { id: "meet-2", customerName: "Murat Kaya", date: "2026-03-12", time: "15:00", contact: "", topic: "Erken cikis talebi", tagCode: "", result: "Olumlu", notes: "Talep onaylandi, tesekkur etti.", followUpDate: "", owner: "Seda", assignedAssistant: "Seda", isFTF: false, createdAt: "2026-03-12T15:00:00.000Z" },
  ],
  assistantReviews: [],
  reviewSources: [
    { id: "google", platform: "Google", label: "Google Reviews", enabled: true, branch: "Voyage Kundu", url: "https://www.google.com/travel/search?gsas=1&ts=EggKAggDCgIIAxocEhoSFAoHCOoPEAQYARIHCOoPEAQYBBgDMgIIAg&qs=MhNDZ29JN29leXFQX280YzhRRUFFOAI&ap=ugEHcmV2aWV3cw&ictx=111&client=safari&hs=1AB&biw=1729&bih=980&hl=tr-TR&ved=0CAAQ5JsGahcKEwjwvvnrxJyTAxUAAAAAHQAAAAAQDA", lastSyncAt: null },
    { id: "tripadvisor", platform: "Tripadvisor", label: "Tripadvisor Reviews", enabled: true, branch: "Voyage Kundu", url: "https://www.tripadvisor.com.tr/Hotel_Review-g17951017-d33456834-Reviews-Voyage_Kundu_Hotel-Aksu_Antalya_Turkish_Mediterranean_Coast.html", lastSyncAt: null },
    { id: "yandex", platform: "Yandex", label: "Yandex Reviews", enabled: true, branch: "Voyage Kundu", url: "https://yandex.com.tr/maps/org/voyage_kundu/178944177497/?ll=30.912637%2C36.862367&z=15", lastSyncAt: null },
    { id: "holidaycheck", platform: "HolidayCheck", label: "HolidayCheck Reviews", enabled: true, branch: "Voyage Kundu", url: "https://www.holidaycheck.de/hi/voyage-kundu/d115b6e7-60d3-442b-8bee-a223c206ab7f", lastSyncAt: null },
  ],
  reviewScanLogs: [],
  reviewSchedule: {
    enabled: true,
    dailyTimes: ["00:00", "08:00", "16:00"],
    lowRatingIntervalMinutes: 15,
    lowRatingThreshold: 4,
    timeZone: reviewScheduleTimeZone,
    lastDailyScanAt: null,
    lastLowRatingScanAt: null,
  },
  reviewAlertHistory: [],
  notifications: [],
  activityLogs: [],
};

const roleCapabilities = {
  admin: {
    canEditTasks: true,
    canEditComplaints: true,
    canEditAlaCarte: true,
    canEditAgenda: true,
    canEditPermissions: true,
  },
  manager: {
    canEditTasks: true,
    canEditComplaints: true,
    canEditAlaCarte: true,
    canEditAgenda: true,
    canEditPermissions: true,
  },
  deputy: {
    canEditTasks: true,
    canEditComplaints: true,
    canEditAlaCarte: true,
    canEditAgenda: false,
    canEditPermissions: false,
  },
  chief: {
    canEditTasks: true,
    canEditComplaints: true,
    canEditAlaCarte: true,
    canEditAgenda: false,
    canEditPermissions: false,
  },
  assistant: {
    canEditTasks: false,
    canEditComplaints: true,
    canEditAlaCarte: false,
    canEditAgenda: false,
    canEditPermissions: false,
  },
  departmentManager: {
    canEditTasks: true,
    canEditComplaints: true,
    canEditAlaCarte: false,
    canEditAgenda: false,
    canEditPermissions: false,
  },
};

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return {
    salt,
    passwordHash: scryptSync(password, salt, 64).toString("hex"),
  };
}

function verifyPassword(password, salt, passwordHash) {
  const expected = Buffer.from(passwordHash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function sanitizeUser(user) {
  return {
    username: user.username,
    role: user.role,
    titleKey: user.titleKey ?? null,
    displayName: user.displayName,
    department: user.department,
    scopeDepartment: user.scopeDepartment ?? null,
    requirePasswordChange: Boolean(user.requirePasswordChange),
  };
}

function getScopeDepartment(user) {
  return user.scopeDepartment ?? (user.role === "departmentManager" ? user.department : null);
}

function isGlobalManager(user) {
  return ["admin", "manager", "deputy", "chief"].includes(user.role);
}

function isAdminUser(user) {
  return user.role === "admin";
}

function canManageScopedPermissions(user) {
  return ["manager", "deputy", "chief", "departmentManager"].includes(user.role);
}

function canAccessAlaCarte(user) {
  if (isGlobalManager(user)) return true;
  return ["fb", "guestRelations", "frontOffice"].includes(getScopeDepartment(user));
}

function filterDepartmentScopedCollection(items, user) {
  if (isGlobalManager(user) || user.role !== "departmentManager") return items;
  const scopeDepartment = getScopeDepartment(user);
  return items.filter((item) => item.department === scopeDepartment);
}

function mergeScopedCollection(currentItems, incomingItems, predicate) {
  if (!Array.isArray(incomingItems)) return currentItems;
  return [
    ...currentItems.filter((item) => !predicate(item)),
    ...incomingItems,
  ];
}

function notificationsForUser(notifications, user) {
  if (isAdminUser(user)) return notifications;
  return notifications.filter((item) => item.recipientUsername === user.username);
}

function manageableUsersForUser(users, user) {
  if (isAdminUser(user)) return users;
  if (!canManageScopedPermissions(user)) return [user];

  const scopeDepartment = getScopeDepartment(user) ?? user.department;
  return users.filter((item) => {
    if (item.username === user.username) return true;
    if (item.role === "admin") return false;
    return (getScopeDepartment(item) ?? item.department) === scopeDepartment;
  });
}

function ensureAuthShape(state) {
  const nextState = { ...state };
  const currentUsers = state.users?.length ? state.users : [];
  const mergedUsers = [
    ...currentUsers,
    ...seedUsers.filter((seedUser) => !currentUsers.some((user) => user.username === seedUser.username)),
  ];
  const shouldResetSeedPasswords = !databaseUrl;
  nextState.users = mergedUsers.map((user) => {
    const seedUser = seedUsers.find((item) => item.username === user.username);
    if (user.passwordHash && user.salt) {
      if (shouldResetSeedPasswords && seedUser) {
        const auth = hashPassword(defaultPassword);
        return {
          ...user,
          ...auth,
          requirePasswordChange: true,
        };
      }
      if (user.requirePasswordChange && !verifyPassword(defaultPassword, user.salt, user.passwordHash)) {
        const auth = hashPassword(defaultPassword);
        return { ...user, ...auth };
      }
      return user;
    }
    const auth = hashPassword(defaultPassword);
    return { ...user, ...auth };
  });
  nextState.sessions = Array.isArray(state.sessions) ? state.sessions : [];
  nextState.permissions = {
    ...initialState.permissions,
    ...(state.permissions ?? {}),
  };
  nextState.userPermissions = {
    ...(state.userPermissions ?? {}),
  };
  const legacyVenueIds = new Set(["asia-flame", "anatolia-grill"]);
  const currentVenueIds = new Set(initialState.alaCarteVenues.map((venue) => venue.id));
  const hasLegacyVenueData = Array.isArray(state.alaCarteVenues)
    && state.alaCarteVenues.some((venue) => legacyVenueIds.has(venue.id));
  nextState.alaCarteVenues = hasLegacyVenueData || !Array.isArray(state.alaCarteVenues) || !state.alaCarteVenues.length
    ? initialState.alaCarteVenues
    : state.alaCarteVenues.filter((venue) => currentVenueIds.has(venue.id));
  nextState.alaCarteReservations = hasLegacyVenueData || !Array.isArray(state.alaCarteReservations)
    ? initialState.alaCarteReservations
    : state.alaCarteReservations.filter((entry) => currentVenueIds.has(entry.venueId));
  nextState.alaCarteWaitlist = hasLegacyVenueData || !Array.isArray(state.alaCarteWaitlist)
    ? initialState.alaCarteWaitlist
    : state.alaCarteWaitlist.filter((entry) => currentVenueIds.has(entry.venueId));
  nextState.alaCarteServiceSlots = hasLegacyVenueData || !Array.isArray(state.alaCarteServiceSlots)
    ? initialState.alaCarteServiceSlots
    : state.alaCarteServiceSlots.filter((entry) => currentVenueIds.has(entry.venueId));
  nextState.reviewSources = Array.isArray(state.reviewSources) && state.reviewSources.length
    ? state.reviewSources
    : initialState.reviewSources;
  nextState.reviewScanLogs = Array.isArray(state.reviewScanLogs) ? state.reviewScanLogs : [];
  nextState.reviewSchedule = {
    ...initialState.reviewSchedule,
    ...(state.reviewSchedule ?? {}),
  };
  nextState.reviewAlertHistory = Array.isArray(state.reviewAlertHistory) ? state.reviewAlertHistory : [];
  nextState.notifications = Array.isArray(state.notifications) ? state.notifications : [];
  nextState.orders = Array.isArray(state.orders) ? state.orders : initialState.orders;
  return nextState;
}

function sanitizeStateForUser(state, user) {
  const scopedTasks = filterDepartmentScopedCollection(state.tasks ?? [], user);
  const scopedComplaints = filterDepartmentScopedCollection(state.complaints ?? [], user);
  const manageableUsers = manageableUsersForUser(state.users ?? [], user);
  const allowedUsernames = new Set(manageableUsers.map((item) => item.username));
  const scopedUserPermissions = Object.fromEntries(
    Object.entries(state.userPermissions ?? {}).filter(([username]) => allowedUsernames.has(username)),
  );

  return {
    ...state,
    users: manageableUsers.map(sanitizeUser),
    userPermissions: scopedUserPermissions,
    tasks: scopedTasks,
    complaints: scopedComplaints,
    agendaItems: isAdminUser(user) ? state.agendaItems ?? [] : [],
    alaCarteVenues: canAccessAlaCarte(user) ? state.alaCarteVenues ?? [] : [],
    alaCarteReservations: canAccessAlaCarte(user) ? state.alaCarteReservations ?? [] : [],
    alaCarteWaitlist: canAccessAlaCarte(user) ? state.alaCarteWaitlist ?? [] : [],
    alaCarteServiceSlots: canAccessAlaCarte(user) ? state.alaCarteServiceSlots ?? [] : [],
    orders: state.orders ?? [],
    assistantMeetings: state.assistantMeetings ?? [],
    assistantReviews: state.assistantReviews ?? [],
    reviewSources: state.reviewSources ?? [],
    reviewScanLogs: state.reviewScanLogs ?? [],
    reviewSchedule: state.reviewSchedule ?? initialState.reviewSchedule,
    notifications: notificationsForUser(state.notifications ?? [], user),
    sessions: undefined,
    activityLogs: isAdminUser(user) ? state.activityLogs ?? [] : [],
  };
}

function getBearerToken(request) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

function findSession(state, token) {
  if (!token) return null;
  return state.sessions?.find((session) => session.token === token) ?? null;
}

function mergeStateForRole(state, body, authUser) {
  const capabilities = {
    ...(roleCapabilities[authUser.role] ?? roleCapabilities.assistant),
    canEditAlaCarte:
      (roleCapabilities[authUser.role] ?? roleCapabilities.assistant).canEditAlaCarte ||
      (authUser.role === "departmentManager" && canAccessAlaCarte(authUser)),
  };

  const scopeDepartment = getScopeDepartment(authUser);
  const scopedTaskPredicate = (item) => item.department === scopeDepartment;
  const scopedComplaintPredicate = (item) => item.department === scopeDepartment;
  const manageableUsernames = new Set(manageableUsersForUser(state.users ?? [], authUser).map((item) => item.username));
  const scopedUserPermissions = Object.fromEntries(
    Object.entries(body.userPermissions ?? {}).filter(([username]) => manageableUsernames.has(username)),
  );

  return ensureAuthShape({
    ...state,
    ...body,
    users: state.users,
    sessions: state.sessions,
    permissions: capabilities.canEditPermissions ? body.permissions ?? state.permissions : state.permissions,
    userPermissions:
      isAdminUser(authUser)
        ? body.userPermissions ?? state.userPermissions
        : canManageScopedPermissions(authUser)
          ? {
              ...(state.userPermissions ?? {}),
              ...scopedUserPermissions,
            }
          : state.userPermissions,
    tasks:
      capabilities.canEditTasks
        ? authUser.role === "departmentManager"
          ? mergeScopedCollection(state.tasks ?? [], body.tasks, scopedTaskPredicate)
          : body.tasks ?? state.tasks
        : state.tasks,
    complaints:
      capabilities.canEditComplaints
        ? authUser.role === "departmentManager"
          ? mergeScopedCollection(state.complaints ?? [], body.complaints, scopedComplaintPredicate)
          : body.complaints ?? state.complaints
        : state.complaints,
    alaCarteVenues: capabilities.canEditAlaCarte ? body.alaCarteVenues ?? state.alaCarteVenues : state.alaCarteVenues,
    alaCarteReservations: capabilities.canEditAlaCarte ? body.alaCarteReservations ?? state.alaCarteReservations : state.alaCarteReservations,
    alaCarteWaitlist: capabilities.canEditAlaCarte ? body.alaCarteWaitlist ?? state.alaCarteWaitlist : state.alaCarteWaitlist,
    alaCarteServiceSlots: capabilities.canEditAlaCarte ? body.alaCarteServiceSlots ?? state.alaCarteServiceSlots : state.alaCarteServiceSlots,
    orders: body.orders ?? state.orders,
    assistantMeetings: body.assistantMeetings ?? state.assistantMeetings,
    assistantReviews: body.assistantReviews ?? state.assistantReviews,
    reviewSources: body.reviewSources ?? state.reviewSources,
    reviewScanLogs: body.reviewScanLogs ?? state.reviewScanLogs,
    reviewSchedule: body.reviewSchedule ?? state.reviewSchedule,
    reviewAlertHistory: state.reviewAlertHistory,
    notifications: state.notifications,
    agendaItems: capabilities.canEditAgenda ? body.agendaItems ?? state.agendaItems : state.agendaItems,
    activityLogs: state.activityLogs,
  });
}

function inferAssistantName(text, assistantNames, fallback = "") {
  const value = String(text || "").trim();
  if (!value) return fallback;
  const matched = assistantNames.find((name) => value.toLowerCase().includes(name.toLowerCase()));
  return matched ?? fallback;
}

function reviewIdentity(review) {
  return [review.platform, review.sourceId, review.sourceItemId, review.date, review.author].join("::");
}

function mergeImportedReviews(currentReviews, importedReviews) {
  const seen = new Set((currentReviews ?? []).map((review) => reviewIdentity(review)));
  const uniqueImports = importedReviews.filter((review) => {
    const key = reviewIdentity(review);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...uniqueImports, ...(currentReviews ?? [])].slice(0, 500);
}

function getLowRatingAlertRecipients(users) {
  const allowedTitleKeys = new Set([
    "guestRelationsManager",
    "guestRelationsDeputyManager",
    "guestRelationsChief",
  ]);
  return (users ?? []).filter((user) => allowedTitleKeys.has(user.titleKey));
}

function buildLowRatingNotifications(state, reviews, scannedAt, scheduleMode) {
  const threshold = state.reviewSchedule?.lowRatingThreshold ?? 4;
  const lowReviews = reviews.filter((review) => Number(review.rating) <= threshold);
  if (!lowReviews.length) return { notifications: [], reviewAlertHistory: state.reviewAlertHistory ?? [] };

  const recipients = getLowRatingAlertRecipients(state.users);
  const history = new Set(state.reviewAlertHistory ?? []);
  const notifications = [];

  lowReviews.forEach((review) => {
    recipients.forEach((recipient) => {
      const historyKey = `${reviewIdentity(review)}::${recipient.username}`;
      if (history.has(historyKey)) return;
      history.add(historyKey);
      notifications.push({
        id: randomUUID(),
        recipientUsername: recipient.username,
        department: getScopeDepartment(recipient) ?? recipient.department,
        title: "Kritik platform yorumu",
        message: `${review.platform} ${review.rating}/5 - ${review.author}: ${review.content}`,
        createdAt: scannedAt,
        createdBy: "review-monitor",
        readAt: null,
        meta: {
          scheduleMode,
          platform: review.platform,
          rating: review.rating,
          matchedAssistant: review.matchedAssistant ?? review.owner ?? null,
        },
      });
    });
  });

  return {
    notifications,
    reviewAlertHistory: [...history].slice(-2000),
  };
}

function getScheduleParts(date, timeZone = reviewScheduleTimeZone) {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date(0);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || reviewScheduleTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(safeDate).map((part) => [part.type, part.value]),
  );
  return parts;
}

function getScheduledClock(date, timeZone = reviewScheduleTimeZone) {
  const parts = getScheduleParts(date, timeZone);
  return `${parts.hour}:${parts.minute}`;
}

function getScheduledMinute(date, timeZone = reviewScheduleTimeZone) {
  return getScheduleParts(date, timeZone).minute;
}

function getScheduledDateKey(date, timeZone = reviewScheduleTimeZone) {
  const parts = getScheduleParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getScheduledDateTimeKey(date, timeZone = reviewScheduleTimeZone) {
  return `${getScheduledDateKey(date, timeZone)} ${getScheduledClock(date, timeZone)}`;
}

function shouldRunDailyReviewScan(schedule, now = new Date()) {
  if (!schedule?.enabled) return false;
  const slot = getScheduledClock(now, schedule?.timeZone);
  if (!(schedule.dailyTimes ?? []).includes(slot)) return false;
  return slot !== getScheduledClock(new Date(schedule.lastDailyScanAt), schedule?.timeZone)
    || getScheduledDateKey(now, schedule?.timeZone) !== getScheduledDateKey(new Date(schedule.lastDailyScanAt), schedule?.timeZone);
}

function shouldRunLowRatingReviewScan(schedule, now = new Date()) {
  if (!schedule?.enabled) return false;
  const minute = Number(getScheduledMinute(now, schedule?.timeZone));
  if (minute % (schedule.lowRatingIntervalMinutes ?? 15) !== 0) return false;
  return getScheduledDateTimeKey(now, schedule?.timeZone) !== getScheduledDateTimeKey(new Date(schedule.lastLowRatingScanAt), schedule?.timeZone);
}

function normalizeScrapedReview(platform, branch, rawReview, assistantPool, sourceId) {
  const content = String(rawReview.content ?? rawReview.reviewBody ?? rawReview.description ?? "").trim();
  const author = String(rawReview.author ?? rawReview.name ?? "Guest").trim();
  const ratingCandidate = rawReview.rating ?? rawReview.reviewRating?.ratingValue ?? rawReview.reviewRating ?? 5;
  const rating = Math.max(1, Math.min(5, Number(ratingCandidate) || 5));
  const date = String(rawReview.date ?? rawReview.datePublished ?? new Date().toISOString().slice(0, 10)).slice(0, 10);
  const matchedAssistant = inferAssistantName([author, content].join(" "), assistantPool, assistantPool[0] ?? "Unassigned");

  return {
    id: randomUUID(),
    sourceId,
    sourceItemId: String(rawReview.id ?? `${sourceId}-${author}-${date}`).trim(),
    platform,
    branch,
    author,
    rating,
    date,
    content,
    status: rating <= 2 ? "In Review" : rating >= 4 ? "Resolved" : "Open",
    owner: matchedAssistant,
    matchedAssistant,
    imported: true,
    createdAt: new Date().toISOString(),
  };
}

function extractJsonLdReviews(html) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .filter(Boolean);
  const reviews = [];

  blocks.forEach((block) => {
    try {
      const parsed = JSON.parse(block.trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach((item) => {
        const queue = [item];
        while (queue.length) {
          const current = queue.shift();
          if (!current || typeof current !== "object") continue;
          if (Array.isArray(current.review)) reviews.push(...current.review);
          if (current["@type"] === "Review") reviews.push(current);
          Object.values(current).forEach((value) => {
            if (value && typeof value === "object") queue.push(value);
          });
        }
      });
    } catch {
      return;
    }
  });

  return reviews;
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractVisibleFallbackReviews(html, platform) {
  const text = stripHtml(html);
  if (!text) return [];

  if (platform === "Yandex") {
    const starMatch = text.match(/([1-5])\s*(?:yildiz|yıldız|star|★)/i) ?? text.match(/([1-5])\s*(?:Ocak|Şubat|Subat|Mart|Nisan|Mayıs|Mayis|Haziran|Temmuz|Ağustos|Agustos|Eylül|Eylul|Ekim|Kasım|Kasim|Aralık|Aralik)/i);
    const authorMatch = text.match(/([A-ZА-ЯЁ][\p{L}\-']+(?:\s+[A-ZА-ЯЁ][\p{L}\-']+){0,2})/u);
    if (!starMatch || !authorMatch) return [];
    const content = text
      .replace(authorMatch[1], "")
      .replace(/([1-5])\s*(?:yildiz|yıldız|star|★)/i, "")
      .replace(/\b\d{1,2}\s+(Ocak|Şubat|Subat|Mart|Nisan|Mayıs|Mayis|Haziran|Temmuz|Ağustos|Agustos|Eylül|Eylul|Ekim|Kasım|Kasim|Aralık|Aralik)\b/i, "")
      .trim();
    if (!content) return [];
    return [{
      author: authorMatch[1].trim(),
      rating: Number(starMatch[1]),
      content,
      date: new Date().toISOString().slice(0, 10),
    }];
  }

  if (platform === "Google") {
    const match = text.match(/([A-ZА-ЯЁ][\p{L}\-']+(?:\s+[A-ZА-ЯЁ][\p{L}\-']+){0,3}).{0,120}?([1-5])\/5.{0,240}?([A-ZА-ЯЁ][\p{L}\p{N}\s.,!?"'()-]{6,220})/u);
    if (!match) return [];
    return [{
      author: match[1].trim(),
      rating: Number(match[2]),
      content: match[3].trim(),
      date: new Date().toISOString().slice(0, 10),
    }];
  }

  if (platform === "Tripadvisor") {
    const authorMatch = text.match(/^([^\d,]{2,40})[, ]+\s*(?:Şub|Sub|Mar|Nis|May|Haz|Tem|Ağu|Agu|Eyl|Eki|Kas|Ara|\d{4})/iu)
      ?? text.match(/^([A-ZА-ЯЁİŞĞÜÇÖ][\p{L}\-']+(?:\s+[A-ZА-ЯЁİŞĞÜÇÖ][\p{L}\-']+){0,2})/u);
    const ratingMatch = text.match(/\b([1-5])\s*(?:\/\s*5|baloncuk|circle|dot)\b/i);
    const titleMatch = text.match(/(?:\b[1-5]\b.*?)([A-ZА-ЯЁİŞĞÜÇÖ][\p{L}\p{N}\s.,!?"'():;/-]{5,120})/u);
    if (!authorMatch || !titleMatch) return [];
    const content = text.slice(text.indexOf(titleMatch[1]) + titleMatch[1].length).trim().slice(0, 320);
    return [{
      author: authorMatch[1].trim(),
      rating: Number(ratingMatch?.[1] ?? 5),
      title: titleMatch[1].trim(),
      content: `${titleMatch[1].trim()} ${content}`.trim(),
      date: new Date().toISOString().slice(0, 10),
    }];
  }

  if (platform === "HolidayCheck") {
    const ratingMatch = text.match(/([1-6](?:[.,]\d)?)\s*\/\s*6/i);
    if (!ratingMatch) return [];
    const author = text.split(/\bAus\b/i)[0]?.trim() ?? "";
    const titleMatch = text.match(/\b(?:20\d{2})\s+(.+?)\s+([1-6](?:[.,]\d)?)\s*\/\s*6/u);
    const title = titleMatch?.[1]?.trim() ?? "";
    if (!author || !title) return [];
    const numericRating = Math.max(1, Math.min(5, Math.round((Number(ratingMatch[1].replace(",", ".")) / 6) * 5)));
    const content = text.slice(text.indexOf(ratingMatch[0]) + ratingMatch[0].length).trim().slice(0, 320);
    return [{
      author,
      rating: numericRating,
      title,
      content: `${title} ${content}`.trim(),
      date: new Date().toISOString().slice(0, 10),
    }];
  }

  return [];
}

async function scrapeSource(source, assistantPool) {
  const scannedAt = new Date().toISOString();
  const fallbackLog = {
    id: randomUUID(),
    sourceId: source.id,
    platform: source.platform,
    scannedAt,
    status: "no_data",
    foundCount: 0,
    note: "Visible public review data could not be verified.",
  };

  if (!source.url) {
    return { importedReviews: [], log: { ...fallbackLog, status: "skipped", note: "Source URL missing." } };
  }

  try {
    const response = await fetch(source.url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; VoyageKunduBot/1.0; +https://voyagekundu.local)",
        "accept-language": "tr-TR,tr;q=0.9,en;q=0.8",
      },
    });
    if (!response.ok) {
      return { importedReviews: [], log: { ...fallbackLog, note: `HTTP ${response.status}` } };
    }

    const html = await response.text();
    const rawReviews = [...extractJsonLdReviews(html), ...extractVisibleFallbackReviews(html, source.platform)].slice(0, 5);
    if (!rawReviews.length) {
      return { importedReviews: [], log: { ...fallbackLog, note: "No review blocks found in HTML." } };
    }

    const importedReviews = rawReviews
      .map((review) => normalizeScrapedReview(source.platform, source.branch, review, assistantPool, source.id))
      .filter((review) => review.content);

    if (!importedReviews.length) {
      return { importedReviews: [], log: { ...fallbackLog, note: "Review blocks found but parsing returned no content." } };
    }

    return {
      importedReviews,
      log: {
        id: randomUUID(),
        sourceId: source.id,
        platform: source.platform,
        scannedAt,
        status: "success",
        foundCount: importedReviews.length,
        note: "HTML scan completed.",
      },
    };
  } catch (error) {
    return {
      importedReviews: [],
      log: { ...fallbackLog, note: error instanceof Error ? error.message : "Unknown scraping error" },
    };
  }
}

async function buildReviewImports(state, assistantNames = [], incomingSources = null) {
  const configuredSources = Array.isArray(incomingSources) && incomingSources.length
    ? incomingSources
    : state.reviewSources ?? [];
  const sources = configuredSources.filter((source) => source.enabled);
  const assistantPool = assistantNames.length
    ? assistantNames
    : ["Merve", "Seda", "Deniz"];
  const syncedAt = new Date().toISOString();
  const scanResults = await Promise.all(sources.map((source) => scrapeSource(source, assistantPool)));
  const importedReviews = scanResults.flatMap((result) => result.importedReviews);
  const reviewScanLogs = scanResults.map((result) => result.log);

  const reviewSources = configuredSources.map((source) =>
    source.enabled
      ? { ...source, lastSyncAt: syncedAt, importedCount: (source.importedCount ?? 0) + (reviewScanLogs.find((item) => item.sourceId === source.id)?.foundCount ?? 0) }
      : source,
  );

  return { importedReviews, reviewSources, reviewScanLogs };
}

async function runReviewMonitoringCycle(mode, providedState = null, now = new Date()) {
  const state = providedState ?? await readState();
  const assistantNames = (state.users ?? [])
    .filter((user) => user.role === "assistant")
    .map((user) => user.displayName)
    .filter(Boolean);
  const syncPayload = await buildReviewImports(state, assistantNames, state.reviewSources);
  const importedReviews =
    mode === "lowRating"
      ? syncPayload.importedReviews.filter((review) => Number(review.rating) <= (state.reviewSchedule?.lowRatingThreshold ?? 4))
      : syncPayload.importedReviews;
  const mergedReviews = mergeImportedReviews(state.assistantReviews ?? [], importedReviews);
  const actuallyAddedReviews = mergedReviews.slice(0, Math.max(0, mergedReviews.length - (state.assistantReviews ?? []).length));
  const lowRatingPayload = buildLowRatingNotifications(state, actuallyAddedReviews, now.toISOString(), mode);

  const nextState = {
    ...state,
    assistantReviews: mergedReviews,
    reviewSources: syncPayload.reviewSources,
    reviewScanLogs: [...(syncPayload.reviewScanLogs ?? []), ...(state.reviewScanLogs ?? [])].slice(0, 100),
    notifications: [...lowRatingPayload.notifications, ...(state.notifications ?? [])].slice(0, 500),
    reviewAlertHistory: lowRatingPayload.reviewAlertHistory,
    reviewSchedule: {
      ...(state.reviewSchedule ?? initialState.reviewSchedule),
      lastDailyScanAt: mode === "daily" ? now.toISOString() : state.reviewSchedule?.lastDailyScanAt ?? null,
      lastLowRatingScanAt: mode === "lowRating" ? now.toISOString() : state.reviewSchedule?.lastLowRatingScanAt ?? null,
    },
  };

  if (!providedState) {
    await writeState(nextState);
  }

  return {
    nextState,
    importedReviews: actuallyAddedReviews,
    notifications: lowRatingPayload.notifications,
    reviewScanLogs: syncPayload.reviewScanLogs ?? [],
  };
}

async function ensureStore() {
  if (pool) {
    await pool.query(`
      create table if not exists app_state (
        id integer primary key,
        data jsonb not null,
        updated_at timestamptz not null default now()
      )
    `);
    return;
  }

  await mkdir(dataDir, { recursive: true });
  if (!existsSync(dataFile)) {
    await writeFile(dataFile, JSON.stringify(initialState, null, 2), "utf8");
  }
}

async function readState() {
  await ensureStore();
  if (pool) {
    const result = await pool.query("select data from app_state where id = 1");
    if (result.rowCount === 0) {
      const seeded = ensureAuthShape(initialState);
      await writeState(seeded);
      return seeded;
    }
    const normalized = ensureAuthShape(result.rows[0].data);
    if (JSON.stringify(normalized) !== JSON.stringify(result.rows[0].data)) {
      await writeState(normalized);
    }
    return normalized;
  }

  const raw = await readFile(dataFile, "utf8");
  const normalized = ensureAuthShape(JSON.parse(raw));
  return normalized;
}

async function writeState(nextState) {
  await ensureStore();
  const payload = {
    ...nextState,
    meta: {
      ...(nextState.meta || {}),
      updatedAt: new Date().toISOString(),
    },
  };
  if (pool) {
    await pool.query(
      `
        insert into app_state (id, data, updated_at)
        values (1, $1::jsonb, now())
        on conflict (id)
        do update set data = excluded.data, updated_at = now()
      `,
      [JSON.stringify(payload)],
    );
    return payload;
  }

  await writeFile(dataFile, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function sendStaticFile(response, pathname, method = "GET") {
  if (!existsSync(distDir)) {
    return false;
  }

  const decodedPath = decodeURIComponent(pathname);
  const requestedPath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const absoluteDistDir = resolve(distDir);
  const absoluteFilePath = resolve(distDir, requestedPath);

  if (absoluteFilePath !== absoluteDistDir && !absoluteFilePath.startsWith(`${absoluteDistDir}${sep}`)) {
    return false;
  }

  if (!existsSync(absoluteFilePath)) {
    return false;
  }

  const body = await readFile(absoluteFilePath);
  const contentType = staticContentTypes[extname(absoluteFilePath)] || "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": String(body.byteLength),
  });

  if (method !== "HEAD") {
    response.end(body);
    return true;
  }

  response.end();
  return true;
}

function unauthorized(response) {
  sendJson(response, 401, { error: "Unauthorized" });
}

function forbidden(response) {
  sendJson(response, 403, { error: "Forbidden" });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (url.pathname === "/health") {
      sendJson(response, 200, { ok: true, service: "voyage-kundu-api", time: new Date().toISOString() });
      return;
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const body = await readBody(request);
      const state = await readState();
      const user = state.users.find((item) => item.username === body.username);
      if (
        body.accessCode !== mainAccessCode ||
        !user ||
        !body.password ||
        !verifyPassword(body.password, user.salt, user.passwordHash)
      ) {
        sendJson(response, 401, { error: "Invalid username or password" });
        return;
      }

      const token = randomUUID();
      state.sessions = [
        { token, username: user.username, createdAt: new Date().toISOString() },
        ...(state.sessions || []).filter((session) => session.username !== user.username),
      ];
      await writeState(state);
      sendJson(response, 200, { token, user: sanitizeUser(user) });
      return;
    }

    if (url.pathname === "/api/auth/catalog" && request.method === "GET") {
      const state = await readState();
      sendJson(response, 200, { users: state.users.map(sanitizeUser) });
      return;
    }

    if (url.pathname === "/api/admin/reset-password" && request.method === "POST") {
      const body = await readBody(request);
      const resetKey = typeof body.resetKey === "string" ? body.resetKey.trim() : "";
      const username = typeof body.username === "string" ? body.username.trim() : "admin.voyage";
      const password = typeof body.password === "string" ? body.password.trim() : defaultPassword;

      if (resetKey !== adminResetKey) {
        forbidden(response);
        return;
      }

      const state = await readState();
      const targetIndex = state.users.findIndex((item) => item.username === username);

      if (targetIndex === -1) {
        sendJson(response, 404, { error: "User not found" });
        return;
      }

      const authShape = hashPassword(password);
      const updatedUser = {
        ...state.users[targetIndex],
        ...authShape,
        requirePasswordChange: true,
      };

      state.users = state.users.map((item, index) => (index === targetIndex ? updatedUser : item));
      await writeState(state);
      sendJson(response, 200, {
        ok: true,
        username,
        requirePasswordChange: true,
      });
      return;
    }

    if (url.pathname === "/api/auth/session" && request.method === "GET") {
      const state = await readState();
      const session = findSession(state, getBearerToken(request));
      if (!session) {
        unauthorized(response);
        return;
      }
      const user = state.users.find((item) => item.username === session.username);
      if (!user) {
        unauthorized(response);
        return;
      }
      sendJson(response, 200, { user: sanitizeUser(user) });
      return;
    }

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      const state = await readState();
      const token = getBearerToken(request);
      state.sessions = (state.sessions || []).filter((session) => session.token !== token);
      await writeState(state);
      sendJson(response, 200, { ok: true });
      return;
    }

    const state = await readState();
    const session = findSession(state, getBearerToken(request));
    const authUser = session
      ? state.users.find((item) => item.username === session.username)
      : null;

    if (url.pathname === "/api/bootstrap" && request.method === "GET") {
      if (!authUser) {
        unauthorized(response);
        return;
      }
      sendJson(response, 200, sanitizeStateForUser(state, authUser));
      return;
    }

    if (url.pathname === "/api/state" && request.method === "PUT") {
      if (!authUser) {
        unauthorized(response);
        return;
      }
      const body = await readBody(request);
      const mergedState = mergeStateForRole(state, body, authUser);
      const savedState = await writeState(mergedState);
      sendJson(response, 200, sanitizeStateForUser(savedState, authUser));
      return;
    }

    if ((url.pathname === "/api/reviews/sync" || url.pathname === "/api/reviews/scan") && request.method === "POST") {
      if (!authUser) {
        unauthorized(response);
        return;
      }
      const body = await readBody(request);
      const assistantNames = Array.isArray(body.assistantNames)
        ? body.assistantNames.map((item) => String(item || "").trim()).filter(Boolean)
        : [];
      if (Array.isArray(body.sources) && body.sources.length) {
        state.reviewSources = body.sources;
      }
      const result = await runReviewMonitoringCycle("daily", state, new Date());
      await writeState(result.nextState);
      sendJson(response, 200, {
        importedReviews: result.importedReviews,
        reviewSources: result.nextState.reviewSources,
        reviewScanLogs: result.reviewScanLogs,
        notifications: result.notifications,
        reviewSchedule: result.nextState.reviewSchedule,
      });
      return;
    }

    if (url.pathname === "/api/logs" && request.method === "POST") {
      if (!authUser) {
        unauthorized(response);
        return;
      }
      const body = await readBody(request);
      const nextLog = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...body,
      };
      state.activityLogs = [nextLog, ...(state.activityLogs || [])].slice(0, 500);
      const saved = await writeState(state);
      sendJson(response, 201, { log: nextLog, count: saved.activityLogs.length });
      return;
    }

    if (url.pathname === "/api/users" && request.method === "PUT") {
      if (!authUser) {
        unauthorized(response);
        return;
      }
      if (!isAdminUser(authUser)) {
        forbidden(response);
        return;
      }

      const body = await readBody(request);
      const username = typeof body.username === "string" ? body.username : "";
      const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
      const password = typeof body.password === "string" ? body.password.trim() : "";
      const nextRole = typeof body.role === "string" ? body.role : "";
      const targetIndex = state.users.findIndex((item) => item.username === username);

      if (targetIndex === -1) {
        sendJson(response, 404, { error: "User not found" });
        return;
      }

      const allowedRoles = ["admin", "manager", "deputy", "chief", "assistant", "departmentManager"];
      const currentTarget = state.users[targetIndex];
      const role = allowedRoles.includes(nextRole) ? nextRole : currentTarget.role;
      const nextDepartment =
        role === "admin"
          ? "management"
          : currentTarget.department;
      const nextScopeDepartment =
        role === "departmentManager"
          ? currentTarget.scopeDepartment ?? currentTarget.department
          : null;

      const authShape = password ? hashPassword(password) : null;
      const updatedUser = {
        ...currentTarget,
        role,
        department: nextDepartment,
        scopeDepartment: nextScopeDepartment,
        displayName: displayName || currentTarget.displayName,
        requirePasswordChange: password ? true : currentTarget.requirePasswordChange,
        ...(authShape ?? {}),
      };

      state.users = state.users.map((item, index) => (index === targetIndex ? updatedUser : item));
      const saved = await writeState(state);
      const currentSessionUser = saved.users.find((item) => item.username === authUser.username) ?? authUser;

      sendJson(response, 200, {
        users: saved.users.map(sanitizeUser),
        currentUser: sanitizeUser(currentSessionUser),
        updatedUser: sanitizeUser(updatedUser),
      });
      return;
    }

    if (url.pathname === "/api/notifications" && request.method === "GET") {
      if (!authUser) {
        unauthorized(response);
        return;
      }
      sendJson(response, 200, { notifications: notificationsForUser(state.notifications ?? [], authUser) });
      return;
    }

    if (url.pathname === "/api/notifications" && request.method === "POST") {
      if (!authUser) {
        unauthorized(response);
        return;
      }

      const body = await readBody(request);
      const department = typeof body.department === "string" ? body.department.trim() : "";
      const title = typeof body.title === "string" ? body.title.trim() : "Department notification";
      const message = typeof body.message === "string" ? body.message.trim() : "";

      if (!department || !message) {
        sendJson(response, 400, { error: "Department and message are required" });
        return;
      }

      const recipients = state.users.filter(
        (item) => item.role === "departmentManager" && getScopeDepartment(item) === department,
      );

      const createdAt = new Date().toISOString();
      const nextNotifications = recipients.map((recipient) => ({
        id: randomUUID(),
        recipientUsername: recipient.username,
        department,
        title,
        message,
        createdAt,
        createdBy: authUser.username,
        readAt: null,
      }));

      state.notifications = [...nextNotifications, ...(state.notifications ?? [])].slice(0, 500);
      await writeState(state);
      sendJson(response, 201, { notifications: nextNotifications });
      return;
    }

    if (url.pathname === "/api/notifications/read" && request.method === "PUT") {
      if (!authUser) {
        unauthorized(response);
        return;
      }

      const body = await readBody(request);
      const id = typeof body.id === "string" ? body.id : "";
      const now = new Date().toISOString();

      state.notifications = (state.notifications ?? []).map((item) =>
        item.id === id && (isAdminUser(authUser) || item.recipientUsername === authUser.username)
          ? { ...item, readAt: item.readAt ?? now }
          : item,
      );
      await writeState(state);
      sendJson(response, 200, { notifications: notificationsForUser(state.notifications ?? [], authUser) });
      return;
    }

    if (url.pathname === "/api/users/self-password" && request.method === "PUT") {
      if (!authUser) {
        unauthorized(response);
        return;
      }

      const body = await readBody(request);
      const password = typeof body.password === "string" ? body.password.trim() : "";

      if (password.length < 8) {
        sendJson(response, 400, { error: "Password must be at least 8 characters" });
        return;
      }

      const targetIndex = state.users.findIndex((item) => item.username === authUser.username);
      const authShape = hashPassword(password);
      const updatedUser = {
        ...state.users[targetIndex],
        ...authShape,
        requirePasswordChange: false,
      };

      state.users = state.users.map((item, index) => (index === targetIndex ? updatedUser : item));
      const saved = await writeState(state);

      sendJson(response, 200, {
        user: sanitizeUser(saved.users.find((item) => item.username === authUser.username) ?? updatedUser),
      });
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      if (await sendStaticFile(response, url.pathname, request.method)) {
        return;
      }

      if (!url.pathname.startsWith("/api/")) {
        const servedIndex = await sendStaticFile(response, "/", request.method);
        if (servedIndex) {
          return;
        }
      }
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendJson(response, 500, {
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

let reviewMonitorBusy = false;

async function tickReviewMonitoring(now = new Date()) {
  if (reviewMonitorBusy) return;
  reviewMonitorBusy = true;
  try {
    const state = await readState();
    if (shouldRunDailyReviewScan(state.reviewSchedule, now)) {
      const result = await runReviewMonitoringCycle("daily", state, now);
      await writeState(result.nextState);
      return;
    }
    if (shouldRunLowRatingReviewScan(state.reviewSchedule, now)) {
      const result = await runReviewMonitoringCycle("lowRating", state, now);
      await writeState(result.nextState);
    }
  } catch {
    return;
  } finally {
    reviewMonitorBusy = false;
  }
}

if (!isTestEnv) {
  setInterval(() => {
    void tickReviewMonitoring(new Date());
  }, 60_000);

  server.listen(port, host, () => {
    console.log(`voyage-kundu-api listening on ${host}:${port}`);
  });
}

export {
  extractJsonLdReviews,
  getScheduledClock,
  getScheduledDateKey,
  getScheduledDateTimeKey,
  normalizeScrapedReview,
  scrapeSource,
  shouldRunDailyReviewScan,
  shouldRunLowRatingReviewScan,
};
