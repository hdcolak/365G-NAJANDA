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
const defaultPassword = process.env.DEFAULT_LOGIN_PASSWORD || "Voyage365!";

const seedUsers = [
  { username: "gizem.yonetici", role: "manager", displayName: "Gizem", department: "management" },
  { username: "selim.muduryrd", role: "deputy", displayName: "Selim", department: "management" },
  { username: "ece.sef", role: "chief", displayName: "Ece", department: "operations" },
  { username: "deniz.asistan", role: "assistant", displayName: "Deniz", department: "guestRelations" },
  { username: "ayse.resepsiyonmdr", role: "departmentManager", titleKey: "frontOfficeManager", displayName: "Ayse", department: "frontOffice", scopeDepartment: "frontOffice" },
  { username: "zeynep.housekeepingmdr", role: "departmentManager", titleKey: "executiveHousekeeper", displayName: "Zeynep", department: "housekeeping", scopeDepartment: "housekeeping" },
  { username: "emir.animasyonmdr", role: "departmentManager", titleKey: "entertainmentManager", displayName: "Emir", department: "entertainment", scopeDepartment: "entertainment" },
  { username: "emre.teknikmdr", role: "departmentManager", titleKey: "chiefEngineer", displayName: "Emre", department: "technical", scopeDepartment: "technical" },
  { username: "burak.fbmdr", role: "departmentManager", titleKey: "foodBeverageManager", displayName: "Burak", department: "fb", scopeDepartment: "fb" },
  { username: "mina.misafirmdr", role: "departmentManager", titleKey: "guestRelationsManager", displayName: "Mina", department: "guestRelations", scopeDepartment: "guestRelations" },
  { username: "hakan.guvenlikmdr", role: "departmentManager", titleKey: "securityManager", displayName: "Hakan", department: "security", scopeDepartment: "security" },
];

const initialState = {
  meta: {
    hotel: "Voyage Kundu",
    updatedAt: new Date().toISOString(),
  },
  users: seedUsers,
  sessions: [],
  permissions: {
    manager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: true },
    deputy: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
    chief: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
    assistant: { tabs: ["dashboard", "complaints"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
    departmentManager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
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
  activityLogs: [],
};

const roleCapabilities = {
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
  };
}

function getScopeDepartment(user) {
  return user.scopeDepartment ?? (user.role === "departmentManager" ? user.department : null);
}

function isGlobalManager(user) {
  return ["manager", "deputy", "chief"].includes(user.role);
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

function ensureAuthShape(state) {
  const nextState = { ...state };
  nextState.users = (state.users?.length ? state.users : seedUsers).map((user) => {
    if (user.passwordHash && user.salt) return user;
    const auth = hashPassword(defaultPassword);
    return { ...user, ...auth };
  });
  nextState.sessions = Array.isArray(state.sessions) ? state.sessions : [];
  return nextState;
}

function sanitizeStateForUser(state, user) {
  const scopedTasks = filterDepartmentScopedCollection(state.tasks ?? [], user);
  const scopedComplaints = filterDepartmentScopedCollection(state.complaints ?? [], user);

  return {
    ...state,
    users: user.role === "manager" ? state.users.map(sanitizeUser) : [sanitizeUser(user)],
    tasks: scopedTasks,
    complaints: scopedComplaints,
    agendaItems: user.role === "manager" ? state.agendaItems ?? [] : [],
    alaCarteVenues: canAccessAlaCarte(user) ? state.alaCarteVenues ?? [] : [],
    alaCarteReservations: canAccessAlaCarte(user) ? state.alaCarteReservations ?? [] : [],
    alaCarteWaitlist: canAccessAlaCarte(user) ? state.alaCarteWaitlist ?? [] : [],
    alaCarteServiceSlots: canAccessAlaCarte(user) ? state.alaCarteServiceSlots ?? [] : [],
    sessions: undefined,
    activityLogs: user.role === "manager" ? state.activityLogs ?? [] : [],
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

  return ensureAuthShape({
    ...state,
    ...body,
    users: state.users,
    sessions: state.sessions,
    permissions: capabilities.canEditPermissions ? body.permissions ?? state.permissions : state.permissions,
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
      if (!user || !body.password || !verifyPassword(body.password, user.salt, user.passwordHash)) {
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
