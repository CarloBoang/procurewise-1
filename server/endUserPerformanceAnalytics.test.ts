import "dotenv/config";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: AuthenticatedUser["role"]): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: `analytics-${role}`,
    email: "analytics@example.com",
    name: "Analytics Test User",
    loginMethod: "test",
    role,
    officeName: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as unknown as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

describe("procurement.analytics.endUserPerformance authorization and structure", () => {
  it("allows all authenticated users including end_user, staff, officer, and admin to access performance analytics for transparency", async () => {
    const endUserCaller = appRouter.createCaller(createContext("end_user"));
    const endUserResult = await endUserCaller.procurement.analytics.endUserPerformance({ source: "all" });
    expect(endUserResult).toBeDefined();
    expect(endUserResult.kpiSummary).toHaveProperty("failedCount");

    const staffCaller = appRouter.createCaller(createContext("procurement_staff"));
    const staffResult = await staffCaller.procurement.analytics.endUserPerformance({ source: "all" });
    expect(staffResult).toBeDefined();
    expect(staffResult.officePerformance).toBeInstanceOf(Array);
  });

  it("allows procurement_officer and admin to access end-user performance analytics", async () => {
    const officerCaller = appRouter.createCaller(createContext("procurement_officer"));
    const adminCaller = appRouter.createCaller(createContext("admin"));

    const officerResult = await officerCaller.procurement.analytics.endUserPerformance({ source: "all" });
    expect(officerResult).toBeDefined();
    expect(officerResult.kpiSummary).toHaveProperty("failedCount");
    expect(officerResult.kpiSummary).toHaveProperty("partialDeliveryCount");
    expect(officerResult.kpiSummary).toHaveProperty("cancelledCount");
    expect(officerResult.officePerformance).toEqual(expect.any(Array));

    const adminResult = await adminCaller.procurement.analytics.endUserPerformance({ source: "all" });
    expect(adminResult).toBeDefined();
    expect(adminResult.totals).toHaveProperty("prCount");
    expect(adminResult.totals).toHaveProperty("totalAbc");
    expect(adminResult.totals).toHaveProperty("totalContract");
    expect(adminResult.totals).toHaveProperty("savings");
  }, 20000);

  it("allows procurement officer variations via normalizeProcurementRole", async () => {
    const officerCaller = appRouter.createCaller(createContext("procurement_officer_i"));
    const result = await officerCaller.procurement.analytics.endUserPerformance({ source: "all" });
    expect(result).toBeDefined();
    expect(result.officePerformance).toBeInstanceOf(Array);
  }, 20000);

  it("verifies mathematical consistency: savings = totalAbc - totalContract", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.procurement.analytics.endUserPerformance({ source: "all" });

    for (const record of result.officePerformance) {
      expect(record).toHaveProperty("endUser");
      expect(record).toHaveProperty("prCount");
      expect(record).toHaveProperty("totalAbc");
      expect(record).toHaveProperty("totalContract");
      expect(record).toHaveProperty("savings");
      expect(record).toHaveProperty("delayedPrs");

      const expectedSavings = Math.round((record.totalAbc - record.totalContract) * 100) / 100;
      expect(record.savings).toBeCloseTo(expectedSavings, 2);
    }

    const expectedTotalSavings = Math.round((result.totals.totalAbc - result.totals.totalContract) * 100) / 100;
    expect(result.totals.savings).toBeCloseTo(expectedTotalSavings, 2);
  }, 20000);
});
