import { afterEach, describe, expect, it, vi } from "vitest";
import {
  scrapeSource,
  shouldRunDailyReviewScan,
  shouldRunLowRatingReviewScan,
} from "./index.mjs";

describe("review monitoring backend", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not create pseudo reviews from page metadata", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `
        <html>
          <head>
            <meta name="description" content="Voyage Kundu hotel overview page." />
          </head>
          <body><h1>Voyage Kundu</h1></body>
        </html>
      `,
    }));

    const result = await scrapeSource(
      { id: "tripadvisor", platform: "Tripadvisor", url: "https://example.com/reviews" },
      ["Deniz", "Merve"],
    );

    expect(result.importedReviews).toEqual([]);
    expect(result.log.status).toBe("no_data");
    expect(result.log.note).toBe("No review blocks found in HTML.");
  });

  it("extracts visible yandex review cards when json-ld is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `
        <html>
          <body>
            <div class="review-card">
              <div>Георгий Свирко</div>
              <div>5 yıldız 6 Ocak</div>
              <div>Süper</div>
            </div>
          </body>
        </html>
      `,
    }));

    const result = await scrapeSource(
      { id: "yandex", platform: "Yandex", url: "https://example.com/yandex" },
      ["Deniz", "Merve"],
    );

    expect(result.importedReviews).toHaveLength(1);
    expect(result.importedReviews[0].author).toBe("Георгий Свирко");
    expect(result.importedReviews[0].rating).toBe(5);
    expect(result.importedReviews[0].content).toContain("Süper");
  });

  it("extracts visible tripadvisor review cards when json-ld is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `
        <html>
          <body>
            <div class="review-card">
              <div>Eren G, Şub 2026 yorumunu yazdı</div>
              <div>5/5</div>
              <div>İlk yorum tabi ki benden :)</div>
              <div>Bu oteli şimdiden heyecanla bekliyoruz.</div>
            </div>
          </body>
        </html>
      `,
    }));

    const result = await scrapeSource(
      { id: "tripadvisor", platform: "Tripadvisor", url: "https://example.com/tripadvisor" },
      ["Deniz", "Merve"],
    );

    expect(result.importedReviews).toHaveLength(1);
    expect(result.importedReviews[0].author).toBe("Eren G");
    expect(result.importedReviews[0].rating).toBe(5);
    expect(result.importedReviews[0].content).toContain("İlk yorum tabi ki benden");
  });

  it("extracts visible holidaycheck review cards when json-ld is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `
        <html>
          <body>
            <div class="review-card">
              <div>Prof Dr Herrmann</div>
              <div>Aus Deutschland</div>
              <div>Alleinreisend November 2025</div>
              <div>Modern-luxuriöses 5-Sterne-Resort an der Türkischen Riviera 6,0 / 6</div>
              <div>Das zur Seaden Hotel-Gruppe gehörende Sea Planet Resort & Spa wurde im Frühjahr 2013 neu eröffnet.</div>
            </div>
          </body>
        </html>
      `,
    }));

    const result = await scrapeSource(
      { id: "holidaycheck", platform: "HolidayCheck", url: "https://example.com/holidaycheck" },
      ["Deniz", "Merve"],
    );

    expect(result.importedReviews).toHaveLength(1);
    expect(result.importedReviews[0].author).toBe("Prof Dr Herrmann");
    expect(result.importedReviews[0].rating).toBe(5);
    expect(result.importedReviews[0].content).toContain("Modern-luxuriöses 5-Sterne-Resort");
  });

  it("runs daily scans on Istanbul schedule slots instead of server-local clock", () => {
    const schedule = {
      enabled: true,
      dailyTimes: ["08:00", "16:00", "00:00"],
      timeZone: "Europe/Istanbul",
      lastDailyScanAt: null,
    };

    expect(shouldRunDailyReviewScan(schedule, new Date("2026-03-16T05:00:00.000Z"))).toBe(true);
    expect(
      shouldRunDailyReviewScan(
        { ...schedule, lastDailyScanAt: "2026-03-16T05:00:00.000Z" },
        new Date("2026-03-16T05:00:00.000Z"),
      ),
    ).toBe(false);
    expect(shouldRunDailyReviewScan(schedule, new Date("2026-03-16T05:01:00.000Z"))).toBe(false);
  });

  it("runs low-rating scans every 15 minutes in Istanbul time", () => {
    const schedule = {
      enabled: true,
      lowRatingIntervalMinutes: 15,
      timeZone: "Europe/Istanbul",
      lastLowRatingScanAt: null,
    };

    expect(shouldRunLowRatingReviewScan(schedule, new Date("2026-03-16T05:15:00.000Z"))).toBe(true);
    expect(
      shouldRunLowRatingReviewScan(
        { ...schedule, lastLowRatingScanAt: "2026-03-16T05:15:00.000Z" },
        new Date("2026-03-16T05:15:00.000Z"),
      ),
    ).toBe(false);
    expect(shouldRunLowRatingReviewScan(schedule, new Date("2026-03-16T05:14:00.000Z"))).toBe(false);
  });
});
