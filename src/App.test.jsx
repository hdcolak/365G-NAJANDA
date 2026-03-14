import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";

const demoUsers = [
  { username: "admin.voyage", role: "admin", displayName: "Admin", department: "management", requirePasswordChange: false },
  { username: "gizem.yonetici", role: "manager", titleKey: "generalManager", displayName: "Gizem", department: "management", requirePasswordChange: false },
  { username: "selim.muduryrd", role: "deputy", titleKey: "generalManagerAssistant", displayName: "Selim", department: "management", requirePasswordChange: false },
  { username: "ece.operasyonmdr", role: "chief", titleKey: "operationsManager", displayName: "Ece", department: "operations", requirePasswordChange: false },
  { username: "deniz.asistan", role: "assistant", displayName: "Deniz", department: "guestRelations", requirePasswordChange: false },
  { username: "ayse.resepsiyonmdr", role: "departmentManager", titleKey: "frontOfficeManager", displayName: "Ayse", department: "frontOffice", scopeDepartment: "frontOffice", requirePasswordChange: false },
  { username: "zeynep.housekeepingmdr", role: "departmentManager", titleKey: "executiveHousekeeper", displayName: "Zeynep", department: "housekeeping", scopeDepartment: "housekeeping", requirePasswordChange: false },
  { username: "emir.animasyonmdr", role: "departmentManager", titleKey: "entertainmentManager", displayName: "Emir", department: "entertainment", scopeDepartment: "entertainment", requirePasswordChange: false },
  { username: "emre.teknikmdr", role: "departmentManager", titleKey: "chiefEngineer", displayName: "Emre", department: "technical", scopeDepartment: "technical", requirePasswordChange: false },
  { username: "burak.fbmdr", role: "departmentManager", titleKey: "foodBeverageManager", displayName: "Burak", department: "fb", scopeDepartment: "fb", requirePasswordChange: false },
  { username: "mina.misafirmdr", role: "departmentManager", titleKey: "guestRelationsManager", displayName: "Mina", department: "guestRelations", scopeDepartment: "guestRelations", requirePasswordChange: false },
  { username: "pelin.misafirmdryrd", role: "departmentManager", titleKey: "guestRelationsDeputyManager", displayName: "Pelin", department: "guestRelations", scopeDepartment: "guestRelations", requirePasswordChange: false },
  { username: "omer.misafirsefi", role: "departmentManager", titleKey: "guestRelationsChief", displayName: "Omer", department: "guestRelations", scopeDepartment: "guestRelations", requirePasswordChange: false },
  { username: "hakan.guvenlikmdr", role: "departmentManager", titleKey: "securityManager", displayName: "Hakan", department: "security", scopeDepartment: "security", requirePasswordChange: false },
  { username: "sevgi.spamdr", role: "departmentManager", titleKey: "spaManager", displayName: "Sevgi", department: "spa", scopeDepartment: "spa", requirePasswordChange: false },
  { username: "ceren.satismdr", role: "departmentManager", titleKey: "salesManager", displayName: "Ceren", department: "sales", scopeDepartment: "sales", requirePasswordChange: false },
  { username: "onur.ikmdr", role: "departmentManager", titleKey: "hrManager", displayName: "Onur", department: "humanResources", scopeDepartment: "humanResources", requirePasswordChange: false },
  { username: "asli.finansmdr", role: "departmentManager", titleKey: "financeManager", displayName: "Asli", department: "finance", scopeDepartment: "finance", requirePasswordChange: false },
  { username: "tolga.satinalmamdr", role: "departmentManager", titleKey: "purchasingManager", displayName: "Tolga", department: "purchasing", scopeDepartment: "purchasing", requirePasswordChange: false },
  { username: "derya.kalitemdr", role: "departmentManager", titleKey: "qualityManager", displayName: "Derya", department: "quality", scopeDepartment: "quality", requirePasswordChange: false },
];

function sanitizeUser(user) {
  return {
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    department: user.department,
    scopeDepartment: user.scopeDepartment ?? null,
    titleKey: user.titleKey ?? null,
    requirePasswordChange: Boolean(user.requirePasswordChange),
  };
}

function loginRoleKeyForUser(user) {
  return user.titleKey ?? user.role;
}

function canAccessAlaCarte(user) {
  return user.role !== "departmentManager" || ["fb", "guestRelations", "frontOffice"].includes(user.scopeDepartment ?? user.department);
}

function manageableUsersForUser(users, user) {
  if (user.role === "admin") return users;
  if (!["manager", "deputy", "chief", "departmentManager"].includes(user.role)) return [user];

  const scopeDepartment = user.scopeDepartment ?? user.department;
  return users.filter((item) => {
    if (item.username === user.username) return true;
    if (item.role === "admin") return false;
    return (item.scopeDepartment ?? item.department) === scopeDepartment;
  });
}

async function signInAs(username, password = "1234") {
  const account = demoUsers.find((item) => item.username === username);
  const user = userEvent.setup();
  if (account) {
    await user.selectOptions(
      screen.getByRole("combobox", { name: /Rol seç|Select role|Rolle wählen|Выберите роль/ }),
      loginRoleKeyForUser(account),
    );
  }
  const select = screen.getByRole("combobox", { name: /Giriş hesabı|Kullanıcı seç|Select user|Benutzer wählen|Выберите пользователя/ });
  await user.selectOptions(select, username);
  await user.type(
    screen.getByLabelText(/Ana giriş şifresi|Main access code|Hauptzugangscode|Главный код входа/),
    "1234",
  );
  await user.type(
    screen.getByLabelText(/Şifre|Password|Passwort|Пароль/),
    password,
  );
  await user.click(
    screen.getByRole("button", {
      name: /Giriş yap|Sign in|Anmelden|Войти/,
    }),
  );
}

describe("Voyage Kundu control panel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    let reviewSyncCounter = 0;

    const seededUsers = demoUsers.map((user) => ({ ...user, requirePasswordChange: false }));
    let serverState = {
      users: seededUsers,
      userPermissions: {},
      permissions: {
        admin: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: true },
        manager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: true },
        deputy: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
        chief: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
        assistant: { tabs: ["dashboard", "complaints", "orders", "assistantTracker"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
        departmentManager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "orders", "assistantTracker"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
      },
      tasks: [
        { id: 1, title: "Kat kontrol turu", type: "daily", department: "housekeeping", owner: "Ayse", dueDate: "2026-03-12", priority: "High", status: "Planned", progress: 20, notes: "VIP kat odalari" },
        { id: 2, title: "Bar envanter takibi", type: "daily", department: "fb", owner: "Burak", dueDate: "2026-03-12", priority: "Medium", status: "Planned", progress: 10, notes: "Aksam servis once" },
      ],
      complaints: [
        { id: 1, guest: "Suite 1104", category: "housekeeping", severity: "Medium", status: "Open", channel: "frontDesk", date: "2026-03-12", department: "housekeeping", summary: "Havlu yenileme gecikti." },
        { id: 2, guest: "Suite 2208", category: "foodBeverage", severity: "High", status: "Open", channel: "whatsapp", date: "2026-03-12", department: "fb", summary: "Aksam yemegi gecikti." },
      ],
      agendaItems: [],
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
          childPolicy: "0-11 yas cocuklar ucretsiz",
          cancellationWindow: "2 hours",
          closeSaleWindow: "1 hour",
          workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          roomNightLimit: 1,
          includeOtherRooms: false,
          tableSetup: "2, 4, 6 pax tables",
          areaPreference: true,
          mixedTable: false,
          note: "Turk mutfagi odakli.",
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
          childPolicy: "0-11 yas cocuklar ucretsiz",
          cancellationWindow: "3 hours",
          closeSaleWindow: "90 minutes",
          workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          roomNightLimit: 1,
          includeOtherRooms: false,
          tableSetup: "2, 4, 6 pax tables",
          areaPreference: true,
          mixedTable: false,
          note: "Italyan servis.",
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
          childPolicy: "0-11 yas cocuklar ucretsiz",
          cancellationWindow: "2 hours",
          closeSaleWindow: "1 hour",
          workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          roomNightLimit: 1,
          includeOtherRooms: false,
          tableSetup: "2, 4, 6 pax tables",
          areaPreference: true,
          mixedTable: false,
          note: "Yunan mutfagi.",
          demand: "Medium",
          occupancy: 66,
          slotCount: 3,
        },
      ],
      alaCarteReservations: [
        { id: "res-1", venueId: "kebappa-turkish-restaurant", guestName: "Muller Family", roomNumber: "4102", partySize: 4, reservationDate: "2026-03-12", slotTime: "19:00", status: "Booked", source: "App", note: "" },
      ],
      alaCarteWaitlist: [
        { id: "wait-1", venueId: "vista-italian", guestName: "Kaya Suite", roomNumber: "2201", partySize: 2, preferredDate: "2026-03-12", preferredWindow: "20:30-21:00", priority: "VIP", status: "Waiting" },
      ],
      alaCarteServiceSlots: [
        { id: "slot-1", venueId: "kebappa-turkish-restaurant", date: "2026-03-12", time: "19:00", maxCovers: 24, bookedCovers: 12, waitlistCount: 0 },
        { id: "slot-2", venueId: "vista-italian", date: "2026-03-12", time: "20:00", maxCovers: 20, bookedCovers: 18, waitlistCount: 1 },
      ],
      orders: [
        { id: "order-fruit-1", type: "fruitWine", roomNumber: "4102", note: "Kırmızı şarap", createdAt: "2026-03-12T11:00:00.000Z" },
        { id: "order-room-1", type: "roomDecoration", roomNumber: "5101", note: "Balon ve gül yaprakları", createdAt: "2026-03-12T12:30:00.000Z" },
      ],
      assistantMeetings: [
        { id: "meet-1", customerName: "Ayse Demir", date: "2026-03-12", time: "10:30", contact: "0555 123 45 67", topic: "Oda memnuniyeti gorusmesi", tagCode: "FTF", result: "Takip gerekli", notes: "Kahvalti alaniyla ilgili geri bildirim verdi.", followUpDate: "2026-03-12", owner: "Merve", assignedAssistant: "Merve", isFTF: true, createdAt: "2026-03-12T10:30:00.000Z" },
      ],
      assistantReviews: [
        { id: "review-1", platform: "Google", rating: 2, author: "Cem Y.", date: "2026-03-12", branch: "Voyage Kundu", content: "Personel ilgiliydi ama giris islemi uzun surdu.", status: "In Review", owner: "Merve", createdAt: "2026-03-12T11:10:00.000Z" },
      ],
      reviewSources: [
        { id: "google", platform: "Google", label: "Google Reviews", enabled: true, branch: "Voyage Kundu", url: "https://google.test/reviews", lastSyncAt: null },
        { id: "tripadvisor", platform: "Tripadvisor", label: "Tripadvisor Reviews", enabled: true, branch: "Voyage Kundu", url: "https://tripadvisor.test/reviews", lastSyncAt: null },
        { id: "yandex", platform: "Yandex", label: "Yandex Reviews", enabled: true, branch: "Voyage Kundu", url: "https://yandex.test/reviews", lastSyncAt: null },
        { id: "holidaycheck", platform: "HolidayCheck", label: "HolidayCheck Reviews", enabled: true, branch: "Voyage Kundu", url: "https://holidaycheck.test/reviews", lastSyncAt: null },
      ],
      reviewScanLogs: [],
      reviewSchedule: {
        enabled: true,
        dailyTimes: ["00:00", "08:00", "16:00"],
        lowRatingIntervalMinutes: 15,
        lowRatingThreshold: 4,
        lastDailyScanAt: null,
        lastLowRatingScanAt: null,
      },
      reviewAlertHistory: [],
      notifications: [],
      activityLogs: [],
      sessions: [],
    };

    const tokens = new Map();

    globalThis.fetch = vi.fn(async (input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      const method = init.method || "GET";
      const parsedUrl = new URL(url, "http://localhost");
      const authHeader = init.headers?.Authorization ?? init.headers?.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
      const session = token ? tokens.get(token) : null;
      const authedUser = session
        ? serverState.users.find((item) => item.username === session.username)
        : null;

      if (parsedUrl.pathname === "/api/auth/login" && method === "POST") {
        const body = JSON.parse(init.body);
        const user = serverState.users.find((item) => item.username === body.username);
        if (!user || body.accessCode !== "1234" || body.password !== "1234") {
          return {
            ok: false,
            status: 401,
            json: async () => ({ error: "Invalid username or password" }),
          };
        }

        const nextToken = `token-${user.username}`;
        tokens.set(nextToken, { username: user.username });
        return {
          ok: true,
          status: 200,
          json: async () => ({ token: nextToken, user: sanitizeUser(user) }),
        };
      }

      if (parsedUrl.pathname === "/api/auth/catalog" && method === "GET") {
        return {
          ok: true,
          status: 200,
          json: async () => ({ users: serverState.users.map(sanitizeUser) }),
        };
      }

      if (parsedUrl.pathname === "/api/auth/session" && method === "GET") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ user: sanitizeUser(authedUser) }),
        };
      }

      if (parsedUrl.pathname === "/api/auth/logout" && method === "POST") {
        if (token) tokens.delete(token);
        return { ok: true, status: 200, json: async () => ({ ok: true }) };
      }

      if (parsedUrl.pathname === "/api/bootstrap" && method === "GET") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        const isDepartmentManager = authedUser.role === "departmentManager";
        const scopeDepartment = authedUser.scopeDepartment ?? authedUser.department;
        const isAdminUser = authedUser.role === "admin";
        const manageableUsers = manageableUsersForUser(serverState.users, authedUser);
        const allowedUsernames = new Set(manageableUsers.map((item) => item.username));
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ...serverState,
            users: manageableUsers.map(sanitizeUser),
            userPermissions: Object.fromEntries(
              Object.entries(serverState.userPermissions).filter(([username]) => allowedUsernames.has(username)),
            ),
            tasks: isDepartmentManager
              ? serverState.tasks.filter((item) => item.department === scopeDepartment)
              : serverState.tasks,
            complaints: isDepartmentManager
              ? serverState.complaints.filter((item) => item.department === scopeDepartment)
              : serverState.complaints,
            agendaItems: isAdminUser ? serverState.agendaItems : [],
            alaCarteVenues: canAccessAlaCarte(authedUser) ? serverState.alaCarteVenues : [],
            alaCarteReservations: canAccessAlaCarte(authedUser) ? serverState.alaCarteReservations : [],
            alaCarteWaitlist: canAccessAlaCarte(authedUser) ? serverState.alaCarteWaitlist : [],
            alaCarteServiceSlots: canAccessAlaCarte(authedUser) ? serverState.alaCarteServiceSlots : [],
            assistantMeetings: serverState.assistantMeetings,
            assistantReviews: serverState.assistantReviews,
            notifications: isAdminUser
              ? serverState.notifications
              : serverState.notifications.filter((item) => item.recipientUsername === authedUser.username),
            sessions: undefined,
            activityLogs: isAdminUser ? serverState.activityLogs : [],
          }),
        };
      }

      if (parsedUrl.pathname === "/api/state" && method === "PUT") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        const isAdminUser = authedUser.role === "admin";
        const body = JSON.parse(init.body);
        const manageableUsernames = new Set(manageableUsersForUser(serverState.users, authedUser).map((item) => item.username));
        const scopedUserPermissions = Object.fromEntries(
          Object.entries(body.userPermissions ?? {}).filter(([username]) => manageableUsernames.has(username)),
        );
        serverState = {
          ...serverState,
          ...body,
          users: serverState.users,
          sessions: serverState.sessions,
          permissions: isAdminUser ? body.permissions ?? serverState.permissions : serverState.permissions,
          userPermissions: isAdminUser
            ? body.userPermissions ?? serverState.userPermissions
            : {
                ...serverState.userPermissions,
                ...scopedUserPermissions,
              },
          notifications: serverState.notifications,
        };
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ...serverState,
            users: serverState.users.map(sanitizeUser),
            sessions: undefined,
            activityLogs: isAdminUser ? serverState.activityLogs : [],
          }),
        };
      }

      if ((parsedUrl.pathname === "/api/reviews/sync" || parsedUrl.pathname === "/api/reviews/scan") && method === "POST") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        reviewSyncCounter += 1;
        const syncedAt = "2026-03-13T08:00:00.000Z";
        const importedReviews = (serverState.reviewSources ?? [])
          .filter((source) => source.enabled)
          .map((source, index) => ({
            id: `review-sync-${reviewSyncCounter}-${index}`,
            sourceId: source.id,
            sourceItemId: `${source.id}-seed-${reviewSyncCounter}-${index}`,
            platform: source.platform,
            rating: index === 0 ? 5 : 4,
            author: `Guest ${index + 1}`,
            date: "2026-03-13",
            branch: source.branch,
            content: `${index === 0 ? "Deniz" : "Merve"} hizmet boyunca cok yardimci oldu.`,
            status: index === 0 ? "Resolved" : "Open",
            owner: index === 0 ? "Deniz" : "Merve",
            matchedAssistant: index === 0 ? "Deniz" : "Merve",
            imported: true,
            createdAt: syncedAt,
          }));
        serverState.assistantReviews = [...importedReviews, ...serverState.assistantReviews];
        serverState.reviewSources = serverState.reviewSources.map((source) => ({ ...source, lastSyncAt: syncedAt }));
        const reviewScanLogs = serverState.reviewSources.map((source, index) => ({
          id: `log-${reviewSyncCounter}-${source.id}`,
          sourceId: source.id,
          platform: source.platform,
          scannedAt: syncedAt,
          status: "success",
          foundCount: index === 0 ? 1 : 1,
          note: "HTML scan completed.",
        }));
        serverState.reviewScanLogs = [...reviewScanLogs, ...(serverState.reviewScanLogs ?? [])];
        const recipients = serverState.users.filter((user) =>
          ["guestRelationsManager", "guestRelationsDeputyManager", "guestRelationsChief"].includes(user.titleKey),
        );
        const lowReviews = importedReviews.filter((review) => Number(review.rating) <= 4);
        const notifications = lowReviews.flatMap((review) =>
          recipients.map((recipient) => ({
            id: `notif-${recipient.username}-${review.id}`,
            recipientUsername: recipient.username,
            department: recipient.scopeDepartment ?? recipient.department,
            title: "Kritik platform yorumu",
            message: `${review.platform} ${review.rating}/5 - ${review.author}: ${review.content}`,
            createdAt: syncedAt,
            createdBy: "review-monitor",
            readAt: null,
            meta: {
              scheduleMode: "daily",
              platform: review.platform,
              rating: review.rating,
              matchedAssistant: review.matchedAssistant,
            },
          })),
        );
        serverState.notifications = [...notifications, ...(serverState.notifications ?? [])];
        serverState.reviewSchedule = {
          ...serverState.reviewSchedule,
          lastDailyScanAt: syncedAt,
        };
        return {
          ok: true,
          status: 200,
          json: async () => ({
            importedReviews,
            reviewSources: serverState.reviewSources,
            reviewScanLogs,
            notifications,
            reviewSchedule: serverState.reviewSchedule,
          }),
        };
      }

      if (parsedUrl.pathname === "/api/notifications" && method === "GET") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        const isAdminUser = authedUser.role === "admin";
        return {
          ok: true,
          status: 200,
          json: async () => ({
            notifications: isAdminUser
              ? serverState.notifications
              : serverState.notifications.filter((item) => item.recipientUsername === authedUser.username),
          }),
        };
      }

      if (parsedUrl.pathname === "/api/notifications" && method === "POST") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        const body = JSON.parse(init.body);
        const recipients = serverState.users.filter(
          (item) => item.role === "departmentManager" && (item.scopeDepartment ?? item.department) === body.department,
        );
        const created = recipients.map((recipient, index) => ({
          id: `notif-${Date.now()}-${index}`,
          recipientUsername: recipient.username,
          department: body.department,
          title: body.title,
          message: body.message,
          createdAt: "2026-03-12T11:30:00.000Z",
          createdBy: authedUser.username,
          readAt: null,
        }));
        serverState.notifications = [...created, ...serverState.notifications];
        return { ok: true, status: 201, json: async () => ({ notifications: created }) };
      }

      if (parsedUrl.pathname === "/api/notifications/read" && method === "PUT") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        const body = JSON.parse(init.body);
        serverState.notifications = serverState.notifications.map((item) =>
          item.id === body.id ? { ...item, readAt: "2026-03-12T11:31:00.000Z" } : item,
        );
        return { ok: true, status: 200, json: async () => ({ notifications: serverState.notifications }) };
      }

      if (parsedUrl.pathname === "/api/logs" && method === "POST") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        const body = JSON.parse(init.body);
        const nextLog = {
          id: Date.now(),
          createdAt: new Date().toISOString(),
          ...body,
        };
        serverState.activityLogs = [nextLog, ...serverState.activityLogs];
        return {
          ok: true,
          status: 201,
          json: async () => ({ log: nextLog, count: serverState.activityLogs.length }),
        };
      }

      if (parsedUrl.pathname === "/api/users" && method === "PUT") {
        if (!authedUser || authedUser.role !== "admin") {
          return { ok: false, status: 403, json: async () => ({ error: "Forbidden" }) };
        }
        const body = JSON.parse(init.body);
        serverState.users = serverState.users.map((item) =>
          item.username === body.username
            ? {
                ...item,
                displayName: body.displayName || item.displayName,
                role: body.role || item.role,
              }
            : item,
        );
        const currentManager = serverState.users.find((item) => item.username === authedUser.username);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            users: serverState.users.map(sanitizeUser),
            currentUser: sanitizeUser(currentManager),
          }),
        };
      }

      if (parsedUrl.pathname === "/api/users/self-password" && method === "PUT") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        const body = JSON.parse(init.body);
        serverState.users = serverState.users.map((item) =>
          item.username === authedUser.username
            ? { ...item, requirePasswordChange: false, password: body.password }
            : item,
        );
        const updatedUser = serverState.users.find((item) => item.username === authedUser.username);
        return {
          ok: true,
          status: 200,
          json: async () => ({ user: sanitizeUser(updatedUser) }),
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => serverState,
      };
    });

    globalThis.__testServerState = serverState;

    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn(() => "blob:shift-plan");
    } else {
      vi.spyOn(window.URL, "createObjectURL").mockReturnValue("blob:shift-plan");
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => {});
    }

    window.localStorage.clear();
    window.localStorage.setItem("app-language", "tr");
    window.history.replaceState({}, "", "/");
  });

  it("limits assistant access by default", async () => {
    render(<App />);

    await signInAs("deniz.asistan");

    expect(screen.getByRole("button", { name: "Panel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Şikayetler" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FTF ve Hall of Fame" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Yapılacaklar ve Planlama" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "A'la Carte" })).not.toBeInTheDocument();
    expect(screen.queryByText("Müdür işlem paneli")).not.toBeInTheDocument();
  });

  it("shows assistant tracker inside the main app and lets assistant add a meeting", async () => {
    render(<App />);

    await signInAs("deniz.asistan");
    await userEvent.click(screen.getByRole("button", { name: "FTF ve Hall of Fame" }));

    expect(screen.getByText("Asistan takip özeti")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Müşteri adı"), "Nina Berg");
    await userEvent.type(screen.getByLabelText("Görüşme konusu"), "FTF memnuniyet görüşmesi");
    await userEvent.click(screen.getByRole("button", { name: "Görüşmeyi kaydet" }));

    expect(screen.getByText("Nina Berg")).toBeInTheDocument();
    expect(screen.getAllByText("FTF").length).toBeGreaterThan(0);
  });

  it("shows ala carte tab for chief by default", async () => {
    render(<App />);

    await signInAs("ece.operasyonmdr");

    const alaCarteButton = screen.getByRole("button", { name: "A'la Carte" });
    expect(alaCarteButton).toBeInTheDocument();

    await userEvent.click(alaCarteButton);

    expect(screen.getAllByText("Kebappa Turkish Restaurant").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Vista Italian Restaurant").length).toBeGreaterThan(0);
    expect(screen.getByText("Rezervasyon durum panosu")).toBeInTheDocument();
    expect(screen.getAllByText("Bekleme listesi").length).toBeGreaterThan(0);
  });

  it("lets chief add an ala carte reservation", async () => {
    render(<App />);

    await signInAs("ece.operasyonmdr");
    await userEvent.click(screen.getByRole("button", { name: "A'la Carte" }));

    await userEvent.type(screen.getAllByLabelText("Misafir adı")[0], "Nina Berg");
    await userEvent.type(screen.getAllByLabelText("Oda numarası")[0], "4407");
    await userEvent.clear(screen.getAllByLabelText("Kişi sayısı")[0]);
    await userEvent.type(screen.getAllByLabelText("Kişi sayısı")[0], "3");
    await userEvent.click(screen.getByRole("button", { name: "Rezervasyon ekle" }));

    expect(screen.getByText("Nina Berg")).toBeInTheDocument();
    expect(screen.getByText("4407")).toBeInTheDocument();
  });

  it("lets chief update ala carte venue settings", async () => {
    render(<App />);

    await signInAs("ece.operasyonmdr");
    await userEvent.click(screen.getByRole("button", { name: "A'la Carte" }));

    await userEvent.clear(screen.getByDisplayValue("0-11 yas cocuklar ucretsiz"));
    await userEvent.type(screen.getByLabelText("Çocuk politikası"), "0-12 ucretsiz");
    await userEvent.click(screen.getByRole("button", { name: "Ayarları kaydet" }));

    expect(screen.getByText("A'la Carte ayarları güncellendi")).toBeInTheDocument();
    expect(screen.getByText("0-12 ucretsiz")).toBeInTheDocument();
  });

  it("lets chief add a new service slot", async () => {
    render(<App />);

    await signInAs("ece.operasyonmdr");
    await userEvent.click(screen.getByRole("button", { name: "A'la Carte" }));

    const slotDateInput = screen.getByLabelText("Slot tarihi");
    const slotCapacityInput = screen.getByLabelText("Slot kapasitesi");
    await userEvent.clear(slotDateInput);
    await userEvent.type(slotDateInput, "2026-03-14");
    await userEvent.clear(slotCapacityInput);
    await userEvent.type(slotCapacityInput, "26");
    await userEvent.click(screen.getByRole("button", { name: "Servis slotu ekle" }));

    expect(screen.getByText(/Kebappa Turkish Restaurant \| 14 Mar 2026 \| 19:00/)).toBeInTheDocument();
    expect(screen.getByText("0/26")).toBeInTheDocument();
  });

  it("runs remaining ala carte action buttons without breaking state", async () => {
    render(<App />);

    await signInAs("ece.operasyonmdr");
    await userEvent.click(screen.getByRole("button", { name: "A'la Carte" }));

    await userEvent.click(screen.getAllByRole("button", { name: "Rezervasyon akışı" })[0]);
    expect(screen.getAllByText("Onaylandı").length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: "Rezervasyona çevir" }));
    expect(screen.getByText("Dönüştürüldü")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Durum" }), "passive");
    const coverPriceInput = screen.getAllByRole("spinbutton", { name: "Kişi başı ücret" })[0];
    await userEvent.clear(coverPriceInput);
    await userEvent.type(coverPriceInput, "15");
    await userEvent.click(screen.getByRole("button", { name: "Ayarları kaydet" }));
    expect(screen.getByText("A'la Carte ayarları güncellendi")).toBeInTheDocument();
    expect(screen.getAllByText("15 EUR").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pasif").length).toBeGreaterThan(0);

    await userEvent.click(screen.getAllByRole("button", { name: "Kapasite artır" })[0]);
    expect(screen.getByText("12/26")).toBeInTheDocument();
  });

  it("shows an error for invalid credentials", async () => {
    render(<App />);

    await signInAs("deniz.asistan", "yanlis-sifre");

    expect(screen.getByText("Ana giriş şifresi veya kullanıcı şifresi hatalı.")).toBeInTheDocument();
  });

  it("forces password change on first sign-in", async () => {
    globalThis.__testServerState.users = globalThis.__testServerState.users.map((item) =>
      item.username === "deniz.asistan"
        ? { ...item, requirePasswordChange: true }
        : item,
    );
    render(<App />);

    await signInAs("deniz.asistan");

    expect(screen.getByText("Yeni şifre belirleyin")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Yeni şifre"), "YeniSifre123");
    await userEvent.type(screen.getByLabelText("Yeni şifre tekrar"), "YeniSifre123");
    await userEvent.click(screen.getByRole("button", { name: "Şifreyi kaydet" }));

    expect(screen.queryByText("Yeni şifre belirleyin")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Panel" })).toBeInTheDocument();
  });

  it("limits department managers to their own department data", async () => {
    render(<App />);

    await signInAs("zeynep.housekeepingmdr");

    await userEvent.click(screen.getByRole("button", { name: "Yapılacaklar ve Planlama" }));
    expect(screen.getByText("Kat kontrol turu")).toBeInTheDocument();
    expect(screen.queryByText("Bar envanter takibi")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Şikayetler" }));
    expect(screen.getByText("Suite 1104")).toBeInTheDocument();
    expect(screen.queryByText("Suite 2208")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "A'la Carte" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yetki Yönetimi" })).toBeInTheDocument();
  });

  it("allows manager to grant ala carte tab to assistant", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "Yetki Yönetimi" }));

    const assistantCard = screen
      .getAllByText("Asistan")
      .find((element) => element.closest(".permission-card"))
      ?.closest(".permission-card");
    expect(assistantCard).not.toBeNull();

    const alaCarteToggle = within(assistantCard).getByLabelText("A'la Carte");
    await userEvent.click(alaCarteToggle);
    await new Promise((resolve) => window.setTimeout(resolve, 350));

    await userEvent.click(screen.getByRole("button", { name: "Çıkış yap" }));

    await signInAs("deniz.asistan");

    expect(screen.getByRole("button", { name: "A'la Carte" })).toBeInTheDocument();
  });

  it("shows department manager inside admin-only access control", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "Yetki Yönetimi" }));

    expect(screen.getAllByText("Departman Müdürü").length).toBeGreaterThan(0);
    expect(screen.getByText("Asistan sistemi dışındaki tüm sekme ve panel erişimleri yalnızca admin tarafından açılıp kapatılır.")).toBeInTheDocument();
  });

  it("lets chief add a task", async () => {
    render(<App />);

    await signInAs("ece.operasyonmdr");
    await userEvent.click(screen.getByRole("button", { name: "Yapılacaklar ve Planlama" }));

    await userEvent.type(
      screen.getByPlaceholderText("Örnek: Misafir şikayet kayıtlarını kontrol et"),
      "Teknik ekip koordinasyonu",
    );
    await userEvent.click(screen.getByRole("button", { name: "Görev ekle" }));

    expect(screen.getByText("Teknik ekip koordinasyonu")).toBeInTheDocument();
  });

  it("requires complaint fields before submission", async () => {
    render(<App />);

    await signInAs("deniz.asistan");
    await userEvent.click(screen.getByRole("button", { name: "Şikayetler" }));
    await userEvent.click(screen.getByRole("button", { name: "Şikayet ekle" }));

    expect(
      screen.getByText("Şikayet eklemek için misafir/vaka ve özet alanlarını doldurmalısınız."),
    ).toBeInTheDocument();
  });

  it("lets assistant add a complaint", async () => {
    render(<App />);

    await signInAs("deniz.asistan");
    await userEvent.click(screen.getByRole("button", { name: "Şikayetler" }));

    await userEvent.type(screen.getByLabelText("Misafir / Vaka"), "Suite 3304");
    await userEvent.type(screen.getByLabelText("Özet"), "Gece servis dönüş süresi uzundu.");
    await userEvent.click(screen.getByRole("button", { name: "Şikayet ekle" }));

    expect(screen.getByText("Suite 3304")).toBeInTheDocument();
    expect(screen.getByText("Gece servis dönüş süresi uzundu.")).toBeInTheDocument();
  });

  it("routes a department complaint notification only to the related department manager", async () => {
    render(<App />);

    await signInAs("deniz.asistan");
    await userEvent.click(screen.getByRole("button", { name: "Şikayetler" }));
    await userEvent.type(screen.getByLabelText("Misafir / Vaka"), "SPA Cabin 2");
    await userEvent.selectOptions(screen.getByLabelText("Departman"), "spa");
    await userEvent.type(screen.getByLabelText("Özet"), "Masaj seansi gec basladi.");
    await userEvent.click(screen.getByRole("button", { name: "Şikayet ekle" }));
    await userEvent.click(screen.getByRole("button", { name: "Çıkış yap" }));

    await signInAs("sevgi.spamdr");

    expect(screen.getByText("Departman bildirimleri")).toBeInTheDocument();
    expect(screen.getByText(/Okunmamış bildirim/)).toBeInTheDocument();
  });

  it("records admin tab changes in the audit list", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "Müdür İşlemleri" }));

    expect(screen.getAllByText("Sekme açtı").length).toBeGreaterThan(0);
  });

  it("opens the related section when dashboard metric cards are clicked", async () => {
    globalThis.__testServerState.tasks = [
      { id: 1, title: "Kat kontrol turu", type: "daily", department: "housekeeping", owner: "Ayse", dueDate: "2026-03-12", priority: "High", status: "In Progress", progress: 45, notes: "VIP kat odalari" },
      { id: 2, title: "Bar envanter takibi", type: "daily", department: "fb", owner: "Burak", dueDate: "2026-03-12", priority: "Medium", status: "Planned", progress: 10, notes: "Aksam servis once" },
    ];
    globalThis.__testServerState.complaints = [
      { id: 1, guest: "Suite 1104", category: "housekeeping", severity: "Critical", status: "Open", channel: "frontDesk", date: "2026-03-12", department: "housekeeping", summary: "Havlu yenileme gecikti." },
      { id: 2, guest: "Suite 2208", category: "foodBeverage", severity: "Medium", status: "Resolved", channel: "whatsapp", date: "2026-03-12", department: "fb", summary: "Aksam yemegi gecikti." },
    ];
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: /Aktif görevler/i }));
    expect(screen.getByRole("button", { name: "Yapılacaklar ve Planlama" })).toHaveClass("tab active");
    expect(screen.getByText("Kat kontrol turu")).toBeInTheDocument();
    expect(screen.queryByText("Bar envanter takibi")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Kritik şikayetler/i }));
    expect(screen.getByRole("button", { name: "Şikayetler" })).toHaveClass("tab active");
    expect(screen.getByText("Suite 1104")).toBeInTheDocument();
    expect(screen.queryByText("Suite 2208")).not.toBeInTheDocument();
  });

  it("updates active tab content when the language changes", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "A'la Carte" }));
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Dil" }), "en");

    expect(screen.getByRole("button", { name: "Ala Carte" })).toHaveClass("tab active");
    expect(screen.getAllByText("Venue name").length).toBeGreaterThan(0);
    expect(screen.getByText("Runtime")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "To-Do & Planning" }));
    expect(screen.getByText("To-Do List and Planning Board")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Complaints" }));
    expect(screen.getByText("Complaint Tracking")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Shift Planner" }));
    expect(screen.getByText("Automatic shift planning")).toBeInTheDocument();
  });

  it("lets admin update dashboard notifications and move to permissions", async () => {
    globalThis.Notification = {
      permission: "default",
      requestPermission: vi.fn(async () => "granted"),
    };

    globalThis.__testServerState.notifications = [
      {
        id: "notif-1",
        recipientUsername: "admin.voyage",
        department: "management",
        title: "Test bildirim",
        message: "Deneme",
        createdAt: "2026-03-12T11:30:00.000Z",
        createdBy: "admin.voyage",
        readAt: null,
      },
    ];

    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "Bildirim izni ver" }));
    expect(globalThis.Notification.requestPermission).toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Okundu yap" }));
    expect(screen.queryByRole("button", { name: "Okundu yap" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Yetki Yönetimi" }));
    expect(screen.getByRole("button", { name: "Yetki Yönetimi" })).toHaveClass("tab active");
  });

  it("lets admin add a new agenda item", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "365 Gün Ajanda" }));

    await userEvent.type(screen.getByLabelText("İş başlığı"), "Yarın sabah operasyon açılış kontrolü");
    await userEvent.type(screen.getByLabelText("Takip sorumlusu"), "Gizem");
    await userEvent.type(screen.getByLabelText("Operasyon notu"), "Lobby, kahvaltı ve gece raporu devir kontrolü.");
    await userEvent.click(screen.getByRole("button", { name: "Ajanda işini ekle" }));

    expect(screen.getAllByText("Yarın sabah operasyon açılış kontrolü").length).toBeGreaterThan(0);
  });

  it("lets admin update assistant display name from admin panel", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "Müdür İşlemleri" }));

    await userEvent.selectOptions(screen.getByLabelText("Hesap"), "deniz.asistan");
    const displayNameInput = screen.getByLabelText("Görünen ad");
    await userEvent.clear(displayNameInput);
    await userEvent.type(displayNameInput, "Deniz Operasyon");
    await userEvent.click(screen.getByRole("button", { name: "Kullanıcıyı güncelle" }));

    expect(screen.getByText("Kullanıcı bilgileri güncellendi.")).toBeInTheDocument();
  });

  it("lets assistant add a review from the integrated tracker", async () => {
    render(<App />);

    await signInAs("deniz.asistan");
    await userEvent.click(screen.getByRole("button", { name: "FTF ve Hall of Fame" }));

    await userEvent.type(screen.getByLabelText("Platform"), "HolidayCheck");
    await userEvent.type(screen.getByLabelText("Yorum sahibi"), "Lina S.");
    await userEvent.type(screen.getByLabelText("Yorum metni"), "Spa ve restoran deneyimi başarılıydı.");
    await userEvent.click(screen.getByRole("button", { name: "Yorumu kaydet" }));

    expect(screen.getByText("Lina S.")).toBeInTheDocument();
  });

  it("starts hall of fame scan automatically when the tracker tab opens", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "FTF ve Hall of Fame" }));

    expect(await screen.findByText("4 yorum içe aktarıldı.")).toBeInTheDocument();
    expect(screen.getAllByText("HTML scan completed.").length).toBeGreaterThan(0);
  });

  it("syncs review sources and assigns imported reviews to the matched assistant", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "FTF ve Hall of Fame" }));

    expect(await screen.findByText("4 yorum içe aktarıldı.")).toBeInTheDocument();
    expect(screen.getAllByText(/Eşleşen asistan: Deniz|Eşleşen asistan: Merve/).length).toBeGreaterThan(0);
    expect(screen.getByText(/^#1 /)).toBeInTheDocument();
    expect(screen.getByText("Tarama kayıtları")).toBeInTheDocument();
    expect(screen.getAllByText("HTML scan completed.").length).toBeGreaterThan(0);
    expect(globalThis.__testServerState.notifications.some((item) => item.recipientUsername === "mina.misafirmdr")).toBe(true);
    expect(globalThis.__testServerState.notifications.some((item) => item.recipientUsername === "pelin.misafirmdryrd")).toBe(true);
    expect(globalThis.__testServerState.notifications.some((item) => item.recipientUsername === "omer.misafirsefi")).toBe(true);
    expect(globalThis.__testServerState.notifications.some((item) => item.recipientUsername === "gizem.yonetici")).toBe(false);
    expect(globalThis.__testServerState.notifications.some((item) => item.recipientUsername === "selim.muduryrd")).toBe(false);
    expect(globalThis.__testServerState.notifications.some((item) => item.recipientUsername === "ece.operasyonmdr")).toBe(false);
  });

  it("keeps review source panel multilingual when the language changes", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "FTF ve Hall of Fame" }));
    expect(screen.getByText("Yorum kaynakları")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Dil|Language|Sprache|Язык/ }), "en");

    expect(screen.getByText("Review sources")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sync reviews" })).toBeInTheDocument();
  });

  it("lets admin update review source URLs and save them", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "FTF ve Hall of Fame" }));

    const sourceInputs = screen.getAllByDisplayValue(/https:\/\//);
    await userEvent.clear(sourceInputs[0]);
    await userEvent.type(sourceInputs[0], "https://google.test/updated");
    await userEvent.click(screen.getByRole("button", { name: "Kaynakları kaydet" }));

    expect(screen.getByText("Yorum kaynakları kaydedildi.")).toBeInTheDocument();
  });

  it("shows critical review ops tab for guest relations leadership and lets them create a task", async () => {
    render(<App />);

    await signInAs("mina.misafirmdr");
    await userEvent.click(screen.getByRole("button", { name: "Kritik Yorum Operasyonu" }));

    expect(screen.getByText("Kritik yorum operasyon paneli")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Görev aç" })[0]);
    expect(screen.getByText("Kritik yorum için görev açıldı.")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText(/Guest 1 Atanan kişi|Cem Y. Atanan kişi|Guest 1 Assigned to/), "Deniz");
    await userEvent.selectOptions(screen.getByLabelText(/Guest 1 Operasyon durumu|Cem Y. Operasyon durumu|Guest 1 Operation status/), "closed");
    await userEvent.type(screen.getByLabelText(/Guest 1 Cevap verilen kişi|Cem Y. Cevap verilen kişi|Guest 1 Replied to/), "Cem Y.");
    await userEvent.type(screen.getByLabelText(/Guest 1 Termin|Cem Y. Termin|Guest 1 Deadline/), "2026-03-15");
    await userEvent.type(screen.getByLabelText(/Guest 1 İç not|Cem Y. İç not|Guest 1 Internal note/), "Misafir arandı ve kayıt açıldı.");
    await userEvent.type(screen.getByLabelText(/Guest 1 Çözüm özeti|Cem Y. Çözüm özeti|Guest 1 Resolution summary/), "Transfer telafisi planlandı.");
    expect(screen.getAllByText(/Atanan kişi: Deniz|Assigned to: Deniz/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cevap verilen kişi: Cem Y.|Replied to: Cem Y./).length).toBeGreaterThan(0);
  });

  it("lets a department manager manage permissions only for users in the same department", async () => {
    render(<App />);

    await signInAs("mina.misafirmdr");
    await userEvent.click(screen.getByRole("button", { name: "Yetki Yönetimi" }));

    expect(screen.getByText("Deniz · Asistan")).toBeInTheDocument();
    expect(screen.queryByText("Spa Müdürü")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Müdür İşlemleri" })).not.toBeInTheDocument();
  });

  it("builds a shift plan from manually created teams", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "Shift Planlayıcı" }));

    expect(screen.getAllByText("Plan üretmek için en az 1 ekip ekleyin.").length).toBeGreaterThan(0);
    await userEvent.type(screen.getByLabelText("Ekip adı"), "Lobi Ekibi");
    await userEvent.type(screen.getByLabelText("Asistan 1"), "Merve");
    await userEvent.type(screen.getByLabelText("Asistan 2"), "Can");
    await userEvent.type(screen.getByLabelText("Asistan 3"), "Seda");
    await userEvent.selectOptions(screen.getByLabelText("Pazartesi İzinli kişi"), "2");
    await userEvent.click(screen.getByRole("button", { name: "Ekibi ekle" }));

    expect(screen.getAllByText("Lobi Ekibi").length).toBeGreaterThan(0);
    expect(screen.getByText(/İzin dağılımı: Pazartesi: Seda/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Pazartesi/ })).toBeInTheDocument();
    expect(screen.getAllByText("Lobi Ekibi").length).toBeGreaterThan(0);
  });

  it("prevents assigning the same assistant as off-duty twice in one week", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "Shift Planlayıcı" }));

    await userEvent.type(screen.getByLabelText("Ekip adı"), "Spa Ekibi");
    await userEvent.type(screen.getByLabelText("Asistan 1"), "Aylin");
    await userEvent.type(screen.getByLabelText("Asistan 2"), "Bora");
    await userEvent.type(screen.getByLabelText("Asistan 3"), "Cem");
    await userEvent.selectOptions(screen.getByLabelText("Pazartesi İzinli kişi"), "0");
    await userEvent.selectOptions(screen.getByLabelText("Salı İzinli kişi"), "0");
    await userEvent.click(screen.getByRole("button", { name: "Ekibi ekle" }));

    expect(screen.getByText("Aynı asistan haftada yalnızca 1 kez izinli olabilir.")).toBeInTheDocument();
    expect(screen.queryByText("Spa Ekibi")).not.toBeInTheDocument();
  });

  it("saves shift teams and exports weekly/monthly csv output", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "Shift Planlayıcı" }));

    await userEvent.type(screen.getByLabelText("Ekip adı"), "Gece Operasyon");
    await userEvent.type(screen.getByLabelText("Asistan 1"), "Ada");
    await userEvent.type(screen.getByLabelText("Asistan 2"), "Bora");
    await userEvent.type(screen.getByLabelText("Asistan 3"), "Cem");
    await userEvent.click(screen.getByRole("button", { name: "Ekibi ekle" }));

    await userEvent.click(screen.getByRole("button", { name: "Ekipleri kaydet" }));
    expect(window.localStorage.getItem("shift-planner-teams")).toContain("Gece Operasyon");
    expect(screen.getByText("Ekip planı kaydedildi.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Haftalık çıktı al" }));
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(screen.getByText("Haftalık çıktı indirildi.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Aylık çıktı al" }));
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Aylık çıktı indirildi.")).toBeInTheDocument();
  });

  it("saves and exports tasks, complaints and ala carte lists", async () => {
    render(<App />);

    await signInAs("admin.voyage");

    await userEvent.click(screen.getByRole("button", { name: "Yapılacaklar ve Planlama" }));
    await userEvent.click(screen.getByRole("button", { name: "Listeyi kaydet" }));
    expect(window.localStorage.getItem("task-list-snapshot")).toContain("Kat kontrol turu");
    expect(screen.getByText("Görev listesi kaydedildi.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Çıktı al" }));
    expect(screen.getByText("Görev listesi indirildi.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Şikayetler" }));
    await userEvent.click(screen.getByRole("button", { name: "Listeyi kaydet" }));
    expect(window.localStorage.getItem("complaint-list-snapshot")).toContain("Suite 1104");
    expect(screen.getByText("Şikayet listesi kaydedildi.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Çıktı al" }));
    expect(screen.getByText("Şikayet listesi indirildi.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "A'la Carte" }));
    await userEvent.click(screen.getByRole("button", { name: "Listeyi kaydet" }));
    expect(window.localStorage.getItem("alacarte-list-snapshot")).toContain("kebappa-turkish-restaurant");
    expect(screen.getByText("A'la Carte listeleri kaydedildi.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Çıktı al" }));
    expect(screen.getByText("A'la Carte listeleri indirildi.")).toBeInTheDocument();
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it("lets admin add, save and export orders", async () => {
    render(<App />);

    await signInAs("admin.voyage");
    await userEvent.click(screen.getByRole("button", { name: "Siparişler" }));

    expect(screen.getAllByText("Meyve Sepeti & Şarap").length).toBeGreaterThan(0);
    const fruitWineInput = screen.getByLabelText("Oda No fruitWine");
    const fruitWineCard = fruitWineInput.closest(".orders-card");
    await userEvent.type(fruitWineInput, "5501");
    await userEvent.type(screen.getByLabelText("fruitWine note"), "Beyaz şarap ile hazırlanacak");
    await userEvent.click(within(fruitWineCard).getByRole("button", { name: "Sipariş ekle" }));

    expect(screen.getByText("5501")).toBeInTheDocument();
    expect(screen.getByText("Beyaz şarap ile hazırlanacak")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Siparişleri kaydet" }));
    expect(window.localStorage.getItem("orders-list-snapshot")).toContain("5501");
    expect(screen.getByText("Sipariş listesi kaydedildi.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Sipariş çıktısı al" }));
    expect(screen.getByText("Sipariş listesi indirildi.")).toBeInTheDocument();
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it("lets assistant access orders and add a new order", async () => {
    render(<App />);

    await signInAs("deniz.asistan");
    await userEvent.click(screen.getByRole("button", { name: "Siparişler" }));

    const fruitWineInput = screen.getByLabelText("Oda No fruitWine");
    const fruitWineCard = fruitWineInput.closest(".orders-card");
    await userEvent.type(fruitWineInput, "6602");
    await userEvent.type(screen.getByLabelText("fruitWine note"), "Kontrol icin ikinci kayit");
    await userEvent.click(within(fruitWineCard).getByRole("button", { name: "Sipariş ekle" }));

    expect(screen.getByText("6602")).toBeInTheDocument();
    expect(screen.getByText("Kontrol icin ikinci kayit")).toBeInTheDocument();
  });
});
