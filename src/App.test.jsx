import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";

function signInAs(username) {
  const select = screen.getAllByRole("combobox").at(-1);
  return userEvent.selectOptions(select, username).then(() =>
    userEvent.click(
      screen.getByRole("button", {
        name: /Giriş yap|Sign in|Anmelden|Войти/,
      }),
    ),
  );
}

describe("Voyage Kundu control panel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    let serverState = {
      permissions: {
        manager: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "settings", "assistant"], showAudit: true },
        deputy: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "settings", "assistant"], showAudit: false },
        chief: { tabs: ["dashboard", "tasks", "complaints", "alacarte", "analysis"], modules: ["guest", "settings", "assistant"], showAudit: false },
        assistant: { tabs: ["dashboard", "complaints"], modules: ["guest", "assistant"], showAudit: false },
      },
      tasks: [],
      complaints: [],
      agendaItems: [],
      alaCarteVenues: [],
      activityLogs: [],
    };

    globalThis.fetch = vi.fn(async (_input, init) => {
      const method = init?.method || "GET";
      if (method === "PUT") {
        serverState = JSON.parse(init.body);
      }

      return {
        ok: true,
        json: async () => serverState,
      };
    });

    window.localStorage.clear();
    window.localStorage.setItem("app-language", "tr");
    window.history.replaceState({}, "", "/");
  });

  it("limits assistant access by default", async () => {
    render(<App />);

    await signInAs("deniz.asistan");

    expect(screen.getByRole("button", { name: "Panel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Şikayetler" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Yapılacaklar ve Planlama" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "A'la Carte" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Müdür işlem paneli"),
    ).not.toBeInTheDocument();
  });

  it("shows ala carte tab for chief by default", async () => {
    render(<App />);

    await signInAs("ece.sef");

    const alaCarteButton = screen.getByRole("button", { name: "A'la Carte" });
    expect(alaCarteButton).toBeInTheDocument();

    await userEvent.click(alaCarteButton);

    expect(screen.getAllByText("Vista Italian").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Asia Flame").length).toBeGreaterThan(0);
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

    await userEvent.click(screen.getByRole("button", { name: "Çıkış yap" }));

    await signInAs("deniz.asistan");

    expect(
      screen.getByRole("button", { name: "A'la Carte" }),
    ).toBeInTheDocument();
  });

  it("lets chief add a task", async () => {
    render(<App />);

    await signInAs("ece.sef");
    await userEvent.click(
      screen.getByRole("button", { name: "Yapılacaklar ve Planlama" }),
    );

    await userEvent.type(
      screen.getByPlaceholderText("Örnek: Misafir şikayet kayıtlarını kontrol et"),
      "Teknik ekip koordinasyonu",
    );
    await userEvent.click(screen.getByRole("button", { name: "Görev ekle" }));

    expect(screen.getByText("Teknik ekip koordinasyonu")).toBeInTheDocument();
  });

  it("lets assistant add a complaint", async () => {
    render(<App />);

    await signInAs("deniz.asistan");
    await userEvent.click(screen.getByRole("button", { name: "Şikayetler" }));

    await userEvent.type(screen.getByLabelText("Misafir / Vaka"), "Suite 3304");
    await userEvent.type(screen.getByLabelText("Özet"), "Gece servis dönüş süresi uzundu.");
    await userEvent.click(screen.getByRole("button", { name: "Şikayet ekle" }));

    expect(screen.getByText("Suite 3304")).toBeInTheDocument();
    expect(
      screen.getByText("Gece servis dönüş süresi uzundu."),
    ).toBeInTheDocument();
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
});
