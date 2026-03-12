import { createServer } from "node:http";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const port = Number(process.env.PORT || 10000);
const host = process.env.HOST || "0.0.0.0";
const dataDir = process.env.DATA_DIR || join(process.cwd(), "server-data");
const dataFile = join(dataDir, "state.json");
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? new pg.Pool({ connectionString: databaseUrl }) : null;
const defaultPassword = process.env.DEFAULT_LOGIN_PASSWORD || "1234";
const mainAccessCode = process.env.MAIN_ACCESS_CODE || "1234";

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
    admin: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: true },
    manager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: true },
    deputy: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
    chief: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
    assistant: { tabs: ["dashboard", "complaints", "assistantTracker"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
    departmentManager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
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
      slotCount: 3
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
      slotCount: 4
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
      slotCount: 2
    },
  ],
  alaCarteReservations: [
    { id: "res-1001", venueId: "vista-italian", guestName: "Muller Family", roomNumber: "4102", partySize: 4, reservationDate: "2026-03-12", slotTime: "19:00", status: "Booked", source: "Guest Relations", note: "Anniversary dessert request" },
    { id: "res-1002", venueId: "asia-flame", guestName: "Ivan Petrov", roomNumber: "3304", partySize: 2, reservationDate: "2026-03-12", slotTime: "20:00", status: "Confirmed", source: "App", note: "No peanuts" },
  ],
  alaCarteWaitlist: [
    { id: "wait-1001", venueId: "asia-flame", guestName: "Kaya Suite", roomNumber: "2201", partySize: 2, preferredDate: "2026-03-12", preferredWindow: "20:30-21:00", priority: "VIP", status: "Waiting" },
  ],
  alaCarteServiceSlots: [
    { id: "slot-1", venueId: "vista-italian", date: "2026-03-12", time: "19:00", maxCovers: 24, bookedCovers: 12, waitlistCount: 0 },
    { id: "slot-2", venueId: "asia-flame", date: "2026-03-12", time: "20:00", maxCovers: 20, bookedCovers: 18, waitlistCount: 1 },
  ],
  assistantMeetings: [
    { id: "meet-1", customerName: "Ayse Demir", date: "2026-03-12", time: "10:30", contact: "0555 123 45 67", topic: "Oda memnuniyeti gorusmesi", tagCode: "FTF", result: "Takip gerekli", notes: "Kahvalti alaniyla ilgili geri bildirim verdi. Yarin tekrar aranacak.", followUpDate: "2026-03-12", owner: "Merve", assignedAssistant: "Merve", isFTF: true, createdAt: "2026-03-12T10:30:00.000Z" },
    { id: "meet-2", customerName: "Murat Kaya", date: "2026-03-12", time: "15:00", contact: "", topic: "Erken cikis talebi", tagCode: "", result: "Olumlu", notes: "Talep onaylandi, tesekkur etti.", followUpDate: "", owner: "Seda", assignedAssistant: "Seda", isFTF: false, createdAt: "2026-03-12T15:00:00.000Z" },
  ],
  assistantReviews: [
    { id: "review-1", platform: "Google", rating: 2, author: "Cem Y.", date: "2026-03-12", branch: "Voyage Kundu", content: "Personel ilgiliydi ama giris islemi uzun surdu.", status: "In Review", owner: "Merve", createdAt: "2026-03-12T11:10:00.000Z" },
    { id: "review-2", platform: "Tripadvisor", rating: 5, author: "Elif K.", date: "2026-03-12", branch: "Voyage Kundu", content: "Konum ve ekip cok iyiydi, tekrar gelirim.", status: "Open", owner: "Seda", createdAt: "2026-03-12T16:20:00.000Z" },
  ],
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
  nextState.users = mergedUsers.map((user) => {
    if (user.passwordHash && user.salt) return user;
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
  nextState.notifications = Array.isArray(state.notifications) ? state.notifications : [];
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
    assistantMeetings: state.assistantMeetings ?? [],
    assistantReviews: state.assistantReviews ?? [],
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
    assistantMeetings: body.assistantMeetings ?? state.assistantMeetings,
    assistantReviews: body.assistantReviews ?? state.assistantReviews,
    notifications: state.notifications,
    agendaItems: capabilities.canEditAgenda ? body.agendaItems ?? state.agendaItems : state.agendaItems,
    activityLogs: state.activityLogs,
  });
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

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendJson(response, 500, {
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

server.listen(port, host, () => {
  console.log(`voyage-kundu-api listening on ${host}:${port}`);
});
