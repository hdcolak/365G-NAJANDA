import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";

const demoUsers = [
  { username: "admin.voyage", role: "admin", displayName: "Admin", department: "management", requirePasswordChange: false },
  { username: "gizem.yonetici", role: "manager", displayName: "Gizem", department: "management", requirePasswordChange: false },
  { username: "selim.muduryrd", role: "deputy", displayName: "Selim", department: "management", requirePasswordChange: false },
  { username: "ece.sef", role: "chief", displayName: "Ece", department: "operations", requirePasswordChange: false },
  { username: "deniz.asistan", role: "assistant", displayName: "Deniz", department: "guestRelations", requirePasswordChange: false },
  { username: "ayse.resepsiyonmdr", role: "departmentManager", titleKey: "frontOfficeManager", displayName: "Ayse", department: "frontOffice", scopeDepartment: "frontOffice", requirePasswordChange: false },
  { username: "zeynep.housekeepingmdr", role: "departmentManager", titleKey: "executiveHousekeeper", displayName: "Zeynep", department: "housekeeping", scopeDepartment: "housekeeping", requirePasswordChange: false },
  { username: "emir.animasyonmdr", role: "departmentManager", titleKey: "entertainmentManager", displayName: "Emir", department: "entertainment", scopeDepartment: "entertainment", requirePasswordChange: false },
  { username: "emre.teknikmdr", role: "departmentManager", titleKey: "chiefEngineer", displayName: "Emre", department: "technical", scopeDepartment: "technical", requirePasswordChange: false },
  { username: "burak.fbmdr", role: "departmentManager", titleKey: "foodBeverageManager", displayName: "Burak", department: "fb", scopeDepartment: "fb", requirePasswordChange: false },
  { username: "mina.misafirmdr", role: "departmentManager", titleKey: "guestRelationsManager", displayName: "Mina", department: "guestRelations", scopeDepartment: "guestRelations", requirePasswordChange: false },
  { username: "hakan.guvenlikmdr", role: "departmentManager", titleKey: "securityManager", displayName: "Hakan", department: "security", scopeDepartment: "security", requirePasswordChange: false },
  { username: "sevgi.spamdr", role: "departmentManager", titleKey: "spaManager", displayName: "Sevgi", department: "spa", scopeDepartment: "spa", requirePasswordChange: false },
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

async function signInAs(username, password = "Voyage365!") {
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
    "VoyageKundu365",
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

    const seededUsers = demoUsers.map((user) => ({ ...user, requirePasswordChange: false }));
    let serverState = {
      users: seededUsers,
      permissions: {
        admin: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: true },
        manager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: true },
        deputy: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
        chief: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "settings", "assistant", "assistantTracker"], showAudit: false },
        assistant: { tabs: ["dashboard", "complaints", "assistantTracker"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
        departmentManager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis", "assistantTracker"], modules: ["guest", "assistant", "assistantTracker"], showAudit: false },
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
          id: "vista-italian",
          name: "Vista Italian",
          cuisine: "Italian",
          active: true,
          openingTime: "18:30",
          lastArrival: "21:30",
          coverPrice: 35,
          currency: "EUR",
          maxGuests: 6,
          childPolicy: "0-6 free, 7-12 half price",
          cancellationWindow: "2 hours",
          closeSaleWindow: "1 hour",
          workingDays: ["Mon", "Tue", "Wed"],
          roomNightLimit: 1,
          includeOtherRooms: false,
          tableSetup: "2, 4, 6 pax tables",
          areaPreference: true,
          mixedTable: false,
          note: "Quiet terrace focus.",
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
          childPolicy: "Children accepted after 8 years",
          cancellationWindow: "3 hours",
          closeSaleWindow: "90 minutes",
          workingDays: ["Thu", "Fri", "Sat"],
          roomNightLimit: 1,
          includeOtherRooms: true,
          tableSetup: "Shared chef counter + 4 pax tables",
          areaPreference: false,
          mixedTable: true,
          note: "Higher demand.",
          demand: "Critical",
          occupancy: 94,
          slotCount: 4,
        },
      ],
      alaCarteReservations: [
        { id: "res-1", venueId: "vista-italian", guestName: "Muller Family", roomNumber: "4102", partySize: 4, reservationDate: "2026-03-12", slotTime: "19:00", status: "Booked", source: "App", note: "" },
      ],
      alaCarteWaitlist: [
        { id: "wait-1", venueId: "asia-flame", guestName: "Kaya Suite", roomNumber: "2201", partySize: 2, preferredDate: "2026-03-12", preferredWindow: "20:30-21:00", priority: "VIP", status: "Waiting" },
      ],
      alaCarteServiceSlots: [
        { id: "slot-1", venueId: "vista-italian", date: "2026-03-12", time: "19:00", maxCovers: 24, bookedCovers: 12, waitlistCount: 0 },
        { id: "slot-2", venueId: "asia-flame", date: "2026-03-12", time: "20:00", maxCovers: 20, bookedCovers: 18, waitlistCount: 1 },
      ],
      assistantMeetings: [
        { id: "meet-1", customerName: "Ayse Demir", date: "2026-03-12", time: "10:30", contact: "0555 123 45 67", topic: "Oda memnuniyeti gorusmesi", tagCode: "FTF", result: "Takip gerekli", notes: "Kahvalti alaniyla ilgili geri bildirim verdi.", followUpDate: "2026-03-12", owner: "Merve", assignedAssistant: "Merve", isFTF: true, createdAt: "2026-03-12T10:30:00.000Z" },
      ],
      assistantReviews: [
        { id: "review-1", platform: "Google", rating: 2, author: "Cem Y.", date: "2026-03-12", branch: "Voyage Kundu", content: "Personel ilgiliydi ama giris islemi uzun surdu.", status: "In Review", owner: "Merve", createdAt: "2026-03-12T11:10:00.000Z" },
      ],
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
        if (!user || body.accessCode !== "VoyageKundu365" || body.password !== "Voyage365!") {
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
        const isAdminUser = ["admin", "manager"].includes(authedUser.role);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ...serverState,
            users: isAdminUser ? serverState.users.map(sanitizeUser) : [sanitizeUser(authedUser)],
            tasks: isDepartmentManager
              ? serverState.tasks.filter((item) => item.department === scopeDepartment)
              : serverState.tasks,
            complaints: isDepartmentManager
              ? serverState.complaints.filter((item) => item.department === scopeDepartment)
              : serverState.complaints,
            agendaItems: isAdminUser ? serverState.agendaItems : [],
            alaCarteVenues:
              authedUser.role === "departmentManager" && !["fb", "guestRelations", "frontOffice"].includes(scopeDepartment)
                ? []
                : serverState.alaCarteVenues,
            alaCarteReservations:
              authedUser.role === "departmentManager" && !["fb", "guestRelations", "frontOffice"].includes(scopeDepartment)
                ? []
                : serverState.alaCarteReservations,
            alaCarteWaitlist:
              authedUser.role === "departmentManager" && !["fb", "guestRelations", "frontOffice"].includes(scopeDepartment)
                ? []
                : serverState.alaCarteWaitlist,
            alaCarteServiceSlots:
              authedUser.role === "departmentManager" && !["fb", "guestRelations", "frontOffice"].includes(scopeDepartment)
                ? []
                : serverState.alaCarteServiceSlots,
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
        const isAdminUser = ["admin", "manager"].includes(authedUser.role);
        const body = JSON.parse(init.body);
        serverState = {
          ...serverState,
          ...body,
          users: serverState.users,
          sessions: serverState.sessions,
          permissions: isAdminUser ? body.permissions ?? serverState.permissions : serverState.permissions,
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

      if (parsedUrl.pathname === "/api/notifications" && method === "GET") {
        if (!authedUser) {
          return { ok: false, status: 401, json: async () => ({ error: "Unauthorized" }) };
        }
        const isAdminUser = ["admin", "manager"].includes(authedUser.role);
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
        if (!authedUser || !["admin", "manager"].includes(authedUser.role)) {
          return { ok: false, status: 403, json: async () => ({ error: "Forbidden" }) };
        }
        const body = JSON.parse(init.body);
        serverState.users = serverState.users.map((item) =>
          item.username === body.username
            ? { ...item, displayName: body.displayName || item.displayName }
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

    expect(screen.getByText("Asistan takip ozeti")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Musteri adi"), "Nina Berg");
    await userEvent.type(screen.getByLabelText("Gorusme konusu"), "FTF memnuniyet gorusmesi");
    await userEvent.click(screen.getByRole("button", { name: "Gorusmeyi kaydet" }));

    expect(screen.getByText("Nina Berg")).toBeInTheDocument();
    expect(screen.getAllByText("FTF").length).toBeGreaterThan(0);
  });

  it("shows ala carte tab for chief by default", async () => {
    render(<App />);

    await signInAs("ece.sef");

    const alaCarteButton = screen.getByRole("button", { name: "A'la Carte" });
    expect(alaCarteButton).toBeInTheDocument();

    await userEvent.click(alaCarteButton);

    expect(screen.getAllByText("Vista Italian").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Asia Flame").length).toBeGreaterThan(0);
    expect(screen.getByText("Rezervasyon durum panosu")).toBeInTheDocument();
    expect(screen.getAllByText("Bekleme listesi").length).toBeGreaterThan(0);
  });

  it("lets chief add an ala carte reservation", async () => {
    render(<App />);

    await signInAs("ece.sef");
    await userEvent.click(screen.getByRole("button", { name: "A'la Carte" }));

    await userEvent.type(screen.getAllByLabelText("Misafir adı")[0], "Nina Berg");
    await userEvent.type(screen.getAllByLabelText("Oda numarası")[0], "4407");
    await userEvent.clear(screen.getAllByLabelText("Kişi sayısı")[0]);
    await userEvent.type(screen.getAllByLabelText("Kişi sayısı")[0], "3");
    await userEvent.click(screen.getByRole("button", { name: "Rezervasyon ekle" }));

    expect(screen.getByText("Nina Berg")).toBeInTheDocument();
    expect(screen.getByText("4407")).toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: "Yetki Yönetimi" })).not.toBeInTheDocument();
  });

  it("allows manager to grant ala carte tab to assistant", async () => {
    render(<App />);

    await signInAs("gizem.yonetici");
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

    await signInAs("gizem.yonetici");
    await userEvent.click(screen.getByRole("button", { name: "Yetki Yönetimi" }));

    expect(screen.getAllByText("Departman Müdürü").length).toBeGreaterThan(0);
    expect(screen.getByText("Asistan sistemi dışındaki tüm sekme ve panel erişimleri yalnızca admin tarafından açılıp kapatılır.")).toBeInTheDocument();
  });

  it("lets chief add a task", async () => {
    render(<App />);

    await signInAs("ece.sef");
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
    expect(screen.getByText("SPA | 12 Mar 2026")).toBeInTheDocument();
    expect(screen.getByText("SPA Cabin 2: Masaj seansi gec basladi.")).toBeInTheDocument();
  });

  it("records internal module inspection actions for manager audit", async () => {
    render(<App />);

    await signInAs("gizem.yonetici");
    await userEvent.click(screen.getAllByRole("button", { name: "Paneli aç" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "Müdür İşlemleri" }));

    expect(screen.getAllByText("İç modül inceledi").length).toBeGreaterThan(0);
  });

  it("lets manager add a new agenda item", async () => {
    render(<App />);

    await signInAs("gizem.yonetici");
    await userEvent.click(screen.getByRole("button", { name: "365 Gün Ajanda" }));

    await userEvent.type(screen.getByLabelText("İş başlığı"), "Yarın sabah operasyon açılış kontrolü");
    await userEvent.type(screen.getByLabelText("Takip sorumlusu"), "Gizem");
    await userEvent.type(screen.getByLabelText("Operasyon notu"), "Lobby, kahvaltı ve gece raporu devir kontrolü.");
    await userEvent.click(screen.getByRole("button", { name: "Ajanda işini ekle" }));

    expect(screen.getAllByText("Yarın sabah operasyon açılış kontrolü").length).toBeGreaterThan(0);
  });

  it("lets manager update assistant display name from admin panel", async () => {
    render(<App />);

    await signInAs("gizem.yonetici");
    await userEvent.click(screen.getByRole("button", { name: "Müdür İşlemleri" }));

    await userEvent.selectOptions(screen.getByLabelText("Hesap"), "deniz.asistan");
    const displayNameInput = screen.getByLabelText("Görünen ad");
    await userEvent.clear(displayNameInput);
    await userEvent.type(displayNameInput, "Deniz Operasyon");
    await userEvent.click(screen.getByRole("button", { name: "Kullanıcıyı güncelle" }));

    expect(screen.getByText("Kullanıcı bilgileri güncellendi.")).toBeInTheDocument();
  });
});
