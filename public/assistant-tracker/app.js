const STORAGE_KEY = "assistant-tracker-state-v1";

const state = loadState();

const statsGrid = document.querySelector("#statsGrid");
const hallOfFame = document.querySelector("#hallOfFame");
const ftfList = document.querySelector("#ftfList");
const meetingList = document.querySelector("#meetingList");
const reviewList = document.querySelector("#reviewList");
const meetingForm = document.querySelector("#meetingForm");
const reviewForm = document.querySelector("#reviewForm");
const meetingSearch = document.querySelector("#meetingSearch");
const reviewSearch = document.querySelector("#reviewSearch");
const exportButton = document.querySelector("#exportButton");
const seedDataButton = document.querySelector("#seedDataButton");
const importButton = document.querySelector("#importButton");
const importInput = document.querySelector("#importInput");

render();

if (meetingForm && reviewForm) {
  setDefaultDates();

  meetingForm.elements.owner.addEventListener("input", () => {
    if (!meetingForm.elements.assignedAssistant.value.trim()) {
      meetingForm.elements.assignedAssistant.value = meetingForm.elements.owner.value.trim();
    }
  });

  meetingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(meetingForm);
    const entry = {
      id: crypto.randomUUID(),
      customerName: formData.get("customerName").trim(),
      date: formData.get("date"),
      time: formData.get("time"),
      contact: formData.get("contact").trim(),
      topic: formData.get("topic").trim(),
      tagCode: formData.get("tagCode").trim(),
      result: formData.get("result"),
      notes: formData.get("notes").trim(),
      followUpDate: formData.get("followUpDate"),
      owner: formData.get("owner").trim(),
      assignedAssistant: formData.get("assignedAssistant").trim(),
      isFTF: hasFTFCode(formData.get("tagCode"), formData.get("topic"), formData.get("notes")),
      createdAt: new Date().toISOString(),
    };

    if (entry.isFTF && !entry.followUpDate) {
      entry.followUpDate = entry.date;
    }

    if (entry.isFTF && entry.result === "Olumlu") {
      entry.result = "Takip gerekli";
    }

    state.meetings.unshift(entry);
    persist();
    meetingForm.reset();
    setDefaultDates();
    render();
  });

  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(reviewForm);
    const entry = {
      id: crypto.randomUUID(),
      platform: formData.get("platform"),
      rating: Number(formData.get("rating")),
      author: formData.get("author").trim(),
      date: formData.get("date"),
      branch: formData.get("branch").trim(),
      content: formData.get("content").trim(),
      status: formData.get("status"),
      owner: formData.get("owner").trim(),
      createdAt: new Date().toISOString(),
    };

    state.reviews.unshift(entry);
    persist();
    reviewForm.reset();
    setDefaultDates();
    render();
  });
}

if (meetingSearch) {
  meetingSearch.addEventListener("input", renderMeetings);
}

if (reviewSearch) {
  reviewSearch.addEventListener("input", renderReviews);
}

if (exportButton) {
  exportButton.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `asistan-paneli-${todayISO()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

if (seedDataButton) {
  seedDataButton.addEventListener("click", () => {
    state.meetings = sampleMeetings();
    state.reviews = sampleReviews();
    persist();
    render();
  });
}

if (importButton && importInput) {
  importButton.addEventListener("click", () => {
    importInput.click();
  });
}

if (importInput) {
  importInput.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      state.meetings = Array.isArray(parsed.meetings) ? parsed.meetings : [];
      state.reviews = Array.isArray(parsed.reviews) ? parsed.reviews : [];
      persist();
      render();
    } catch {
      alert("Dosya okunamadı. Geçerli bir JSON dosyası seçin.");
    } finally {
      importInput.value = "";
    }
  });
}

function render() {
  renderStats();
  renderHallOfFame();
  renderFTFList();
  renderMeetings();
  renderReviews();
}

function renderStats() {
  if (!statsGrid) return;

  const today = todayISO();
  const lowScoreCount = state.reviews.filter((review) => review.rating <= 2).length;
  const openReviewCount = state.reviews.filter((review) => review.status !== "Cevaplandı").length;
  const followUpCount = state.meetings.filter(
    (meeting) => meeting.followUpDate && meeting.followUpDate <= today
  ).length;
  const todayMeetings = state.meetings.filter((meeting) => meeting.date === today).length;
  const ftfCount = state.meetings.filter((meeting) => normalizeMeeting(meeting).isFTF).length;
  const topAssistant = buildAssistantLeaderboard()[0];

  const stats = [
    { label: "Bugünkü görüşme", value: todayMeetings, tone: "" },
    { label: "Takip bekleyen", value: followUpCount, tone: "warn" },
    { label: "Açık yorum", value: openReviewCount, tone: "" },
    { label: "Düşük puanlı yorum", value: lowScoreCount, tone: "bad" },
    { label: "FTF kaydı", value: ftfCount, tone: "warn" },
    { label: "Lider asistan", value: topAssistant ? topAssistant.name : "-", tone: "" },
  ];

  statsGrid.innerHTML = stats
    .map(
      (stat) => `
        <article class="stat-card">
          <span class="badge ${stat.tone ? `badge--${stat.tone}` : ""}">${stat.label}</span>
          <strong>${stat.value}</strong>
          <p>Paneldeki mevcut kayıtlara göre otomatik hesaplanır.</p>
        </article>
      `
    )
    .join("");
}

function renderHallOfFame() {
  if (!hallOfFame) return;

  const leaders = buildAssistantLeaderboard().slice(0, 6);

  renderList(
    hallOfFame,
    leaders,
    (assistant, index) => `
      <article class="leaderboard-card">
        <span class="leaderboard-card__rank">#${index + 1}</span>
        <h3>${escapeHtml(assistant.name)}</h3>
        <p>${assistant.reviewCount} yorum ekledi</p>
        <p>${assistant.ftfCount} FTF takip kaydı var</p>
      </article>
    `
  );
}

function renderFTFList() {
  if (!ftfList) return;

  const ftfItems = [...state.meetings]
    .map(normalizeMeeting)
    .filter((meeting) => meeting.isFTF)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  renderList(
    ftfList,
    ftfItems,
    (meeting) => `
      <article class="record-card">
        <div class="record-card__top">
          <div>
            <h3>${escapeHtml(meeting.customerName)}</h3>
            <p>${escapeHtml(meeting.topic)}</p>
          </div>
          <span class="badge badge--ftf">FTF Takip</span>
        </div>
        <div class="record-card__meta">
          <span>İlgili asistan: ${escapeHtml(meeting.assignedAssistant || meeting.owner)}</span>
          <span>Tarih: ${formatDate(meeting.date)} ${meeting.time || ""}</span>
          ${meeting.followUpDate ? `<span>Takip: ${formatDate(meeting.followUpDate)}</span>` : ""}
        </div>
        ${meeting.tagCode ? `<p>Kod: ${escapeHtml(meeting.tagCode)}</p>` : ""}
        ${meeting.notes ? `<p>${escapeHtml(meeting.notes)}</p>` : ""}
      </article>
    `
  );
}

function renderMeetings() {
  if (!meetingList || !meetingSearch) return;

  const query = meetingSearch.value.trim().toLowerCase();
  const items = [...state.meetings]
    .map(normalizeMeeting)
    .filter((meeting) =>
      [
        meeting.customerName,
        meeting.topic,
        meeting.owner,
        meeting.assignedAssistant,
        meeting.tagCode,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  renderList(
    meetingList,
    items,
    (meeting) => `
      <article class="record-card">
        <div class="record-card__top">
          <div>
            <h3>${escapeHtml(meeting.customerName)}</h3>
            <p>${escapeHtml(meeting.topic)}</p>
          </div>
          <div>
            <span class="badge ${meeting.result === "Olumsuz" ? "badge--bad" : meeting.result === "Takip gerekli" ? "badge--warn" : "badge--good"}">
              ${escapeHtml(meeting.result)}
            </span>
            ${meeting.isFTF ? '<span class="badge badge--ftf">FTF</span>' : ""}
          </div>
        </div>
        <div class="record-card__meta">
          <span>${formatDate(meeting.date)} ${meeting.time || ""}</span>
          <span>Ekleyen: ${escapeHtml(meeting.owner)}</span>
          <span>İlgili asistan: ${escapeHtml(meeting.assignedAssistant || meeting.owner)}</span>
          ${meeting.followUpDate ? `<span>Takip: ${formatDate(meeting.followUpDate)}</span>` : ""}
          ${meeting.contact ? `<span>İletişim: ${escapeHtml(meeting.contact)}</span>` : ""}
        </div>
        ${meeting.tagCode ? `<p>Kod: ${escapeHtml(meeting.tagCode)}</p>` : ""}
        ${meeting.notes ? `<p>${escapeHtml(meeting.notes)}</p>` : ""}
      </article>
    `
  );
}

function renderReviews() {
  if (!reviewList || !reviewSearch) return;

  const query = reviewSearch.value.trim().toLowerCase();
  const items = [...state.reviews]
    .filter((review) =>
      [review.platform, review.author, review.branch, review.owner]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  renderList(
    reviewList,
    items,
    (review) => `
      <article class="record-card">
        <div class="record-card__top">
          <div>
            <h3>${escapeHtml(review.author)} - ${escapeHtml(review.platform)}</h3>
            <p>${escapeHtml(review.branch)}</p>
          </div>
          <span class="badge ${review.rating <= 2 ? "badge--bad" : review.rating === 3 ? "badge--warn" : "badge--good"}">
            ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
          </span>
        </div>
        <p>${escapeHtml(review.content)}</p>
        <div class="record-card__meta">
          <span>${formatDate(review.date)}</span>
          <span>Durum: ${escapeHtml(review.status)}</span>
          <span>Ekleyen: ${escapeHtml(review.owner)}</span>
        </div>
      </article>
    `
  );
}

function renderList(container, items, renderer) {
  if (!items.length) {
    container.innerHTML = document.querySelector("#emptyStateTemplate").innerHTML;
    return;
  }

  container.innerHTML = items.map(renderer).join("");
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { meetings: [], reviews: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      meetings: Array.isArray(parsed.meetings) ? parsed.meetings.map(normalizeMeeting) : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    };
  } catch {
    return { meetings: [], reviews: [] };
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function setDefaultDates() {
  if (!meetingForm || !reviewForm) return;

  const today = todayISO();
  meetingForm.elements.date.value ||= today;
  reviewForm.elements.date.value ||= today;
  meetingForm.elements.assignedAssistant.value ||= meetingForm.elements.owner.value;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hasFTFCode(...values) {
  return values.some((value) => /\bftf\b/i.test(String(value || "")));
}

function normalizeMeeting(meeting) {
  const normalized = {
    ...meeting,
    tagCode: meeting.tagCode || "",
    assignedAssistant: meeting.assignedAssistant || meeting.owner || "",
  };

  normalized.isFTF =
    typeof meeting.isFTF === "boolean"
      ? meeting.isFTF
      : hasFTFCode(normalized.tagCode, normalized.topic, normalized.notes);

  if (normalized.isFTF && !normalized.followUpDate) {
    normalized.followUpDate = normalized.date;
  }

  return normalized;
}

function buildAssistantLeaderboard() {
  const map = new Map();

  for (const review of state.reviews) {
      const name = (review.owner || "Bilinmeyen").trim() || "Bilinmeyen";
    const entry = map.get(name) || { name, reviewCount: 0, ftfCount: 0 };
    entry.reviewCount += 1;
    map.set(name, entry);
  }

  for (const meeting of state.meetings.map(normalizeMeeting)) {
    const name = (meeting.assignedAssistant || meeting.owner || "Bilinmeyen").trim() || "Bilinmeyen";
    const entry = map.get(name) || { name, reviewCount: 0, ftfCount: 0 };
    if (meeting.isFTF) {
      entry.ftfCount += 1;
    }
    map.set(name, entry);
  }

  return [...map.values()].sort((a, b) => {
    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
    if (b.ftfCount !== a.ftfCount) return b.ftfCount - a.ftfCount;
    return a.name.localeCompare(b.name, "tr");
  });
}

function sampleMeetings() {
  return [
    {
      id: crypto.randomUUID(),
      customerName: "Ayşe Demir",
      date: todayISO(),
      time: "10:30",
      contact: "0555 123 45 67",
      topic: "Oda memnuniyeti görüşmesi",
      tagCode: "FTF",
      result: "Takip gerekli",
      notes: "Kahvaltı alanıyla ilgili geri bildirim verdi. Yarın tekrar aranacak.",
      followUpDate: todayISO(),
      owner: "Merve",
      assignedAssistant: "Merve",
      isFTF: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      customerName: "Murat Kaya",
      date: todayISO(),
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
      createdAt: new Date().toISOString(),
    },
  ];
}

function sampleReviews() {
  return [
    {
      id: crypto.randomUUID(),
      platform: "Google",
      rating: 2,
      author: "Cem Y.",
      date: todayISO(),
      branch: "Beşiktaş Şube",
      content: "Personel ilgiliydi ama giriş işlemi uzun sürdü.",
      status: "İnceleniyor",
      owner: "Merve",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      platform: "Tripadvisor",
      rating: 5,
      author: "Elif K.",
      date: todayISO(),
      branch: "Beşiktaş Şube",
      content: "Konum ve ekip çok iyiydi, tekrar gelirim.",
      status: "Yeni",
      owner: "Seda",
      createdAt: new Date().toISOString(),
    },
  ];
}
