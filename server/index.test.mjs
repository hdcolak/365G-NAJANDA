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
