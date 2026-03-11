import { createServer } from "node:http";
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

const initialState = {
  meta: {
    hotel: "Voyage Kundu",
    updatedAt: new Date().toISOString(),
  },
  users: [
    { username: "gizem.yonetici", role: "manager", displayName: "Gizem", department: "management" },
    { username: "selim.muduryrd", role: "deputy", displayName: "Selim", department: "management" },
    { username: "ece.sef", role: "chief", displayName: "Ece", department: "operations" },
    { username: "deniz.asistan", role: "assistant", displayName: "Deniz", department: "guestRelations" },
  ],
  permissions: {
    manager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "settings", "assistant"], showAudit: true },
    deputy: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "settings", "assistant"], showAudit: false },
    chief: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "settings", "assistant"], showAudit: false },
    assistant: { tabs: ["dashboard", "complaints"], modules: ["guest", "assistant"], showAudit: false },
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
  activityLogs: [],
};

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
      await writeState(initialState);
      return initialState;
    }
    return result.rows[0].data;
  }

  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw);
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
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
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

    if (url.pathname === "/api/bootstrap" && request.method === "GET") {
      const state = await readState();
      sendJson(response, 200, state);
      return;
    }

    if (url.pathname === "/api/state" && request.method === "PUT") {
      const body = await readBody(request);
      const state = await writeState(body);
      sendJson(response, 200, state);
      return;
    }

    if (url.pathname === "/api/logs" && request.method === "POST") {
      const body = await readBody(request);
      const state = await readState();
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
