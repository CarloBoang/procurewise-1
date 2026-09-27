import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import {
  detectItemCategory,
  detectMixedCategories,
  normalizeProcurementRole,
  roleCanAct,
  SECTION_5_1_1_CATEGORIES,
} from "../shared/procurementRules";
import type { TrpcContext } from "./_core/context";

describe("Procurement Officer RBAC & Section 5.1.1 Mandate Boundaries", () => {
  it("normalizes officer designations to procurement_officer capability role", () => {
    expect(normalizeProcurementRole("procurement_officer")).toBe("procurement_officer");
    expect(normalizeProcurementRole("procurement_officer_i")).toBe("procurement_officer");
    expect(normalizeProcurementRole("procurement_officer_ii")).toBe("procurement_officer");
    expect(normalizeProcurementRole("supply_officer")).toBe("procurement_officer");
  });

  it("strictly enforces Section 5.1.1 category detection and mixed commodity segregation", () => {
    // 1. Detects Office Supplies
    expect(detectItemCategory("A4 Bond Paper 80gsm 500 sheets")).toBe("office_supplies");
    expect(detectItemCategory("Ballpen 0.5 black ink")).toBe("office_supplies");

    // 2. Detects Hardware Supplies
    expect(detectItemCategory("Portland Cement 40kg bag")).toBe("hardware_supplies");
    expect(detectItemCategory("Plywood 1/4 inch 4x8")).toBe("hardware_supplies");

    // 3. Detects ICT Supplies
    expect(detectItemCategory("Desktop Computer Core i7 16GB RAM")).toBe("ict_supplies");
    expect(detectItemCategory("HP LaserJet Toner 85A")).toBe("ict_supplies");

    // 4. Detects Printing Service
    expect(detectItemCategory("Tarpaulin banner printing 4x8 ft")).toBe("printing_service");
    expect(detectItemCategory("Annual Report booklet publication and binding")).toBe("printing_service");

    // 5. Detects Food Ingredients
    expect(detectItemCategory("Sinandomeng Rice 50kg sack")).toBe("food_ingredients");
    expect(detectItemCategory("Fresh Chicken meat and cooking oil")).toBe("food_ingredients");

    // Segregation helper: single category PR is compliant (not mixed)
    const singleCategoryPR = [
      { description: "Ballpen black", specification: "0.5mm" },
      { description: "Bond Paper A4", specification: "80gsm ream" },
      { description: "Paper clips", specification: "box of 100" },
    ];
    const singleResult = detectMixedCategories(singleCategoryPR);
    expect(singleResult.isMixed).toBe(false);
    expect(singleResult.detectedCategories).toEqual(["office_supplies"]);

    // Segregation helper: mixed categories trigger warning
    const mixedCategoryPR = [
      { description: "Bond Paper A4", specification: "Office supplies" },
      { description: "Portland Cement", specification: "Construction hardware" },
      { description: "Fresh Chicken", specification: "Food ingredient" },
    ];
    const mixedResult = detectMixedCategories(mixedCategoryPR);
    expect(mixedResult.isMixed).toBe(true);
    expect(mixedResult.detectedCategories.length).toBeGreaterThan(1);
    expect(mixedResult.categoryLabels).toContain("Office Supplies");
    expect(mixedResult.categoryLabels).toContain("Hardware Supplies");
    expect(mixedResult.categoryLabels).toContain("Food Ingredients");
  });

  it("blocks Procurement Officer from duties reserved for Staff and BAC (no initial PMR, no RFQ drafting, no AOQ generation)", async () => {
    const officerCaller = appRouter.createCaller({
      user: {
        id: 77,
        openId: "officer-demo",
        name: "Procurement Officer",
        email: "officer.demo@bsc.edu.ph",
        loginMethod: "test",
        role: "procurement_officer",
        officeName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as unknown as TrpcContext["req"],
      res: {} as unknown as TrpcContext["res"],
    });

    // 1. CANNOT record initial PMR entry (reserved for Procurement Staff)
    await expect(
      officerCaller.procurement.purchaseRequests.recordPmr({ purchaseRequestId: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    // 2. CANNOT draft RFQs (reserved for Procurement Staff)
    await expect(
      officerCaller.procurement.rfqs.createFromPurchaseRequest({ purchaseRequestId: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    // 3. CANNOT generate AOQs (reserved for Procurement Staff / BAC)
    await expect(
      officerCaller.procurement.rfqs.generateAbstract({ rfqId: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    await expect(
      officerCaller.procurement.preCanvasses.createAbstract({ preCanvassId: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    // 4. CANNOT create Pre-Canvasses (reserved for End-Users)
    await expect(
      officerCaller.procurement.preCanvasses.create({ purchaseRequestId: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("verifies Procurement Officer navigation scope and decoupled notification center", async () => {
    const { readFileSync } = await import("node:fs");
    const dashboardLayout = readFileSync(
      new URL("../client/src/components/DashboardLayout.tsx", import.meta.url),
      "utf8"
    );

    // 1. Mandatory Retained & Mandated Modules in allowedOfficerPaths
    const requiredOfficerPaths = [
      "/dashboard",
      "/officer/pr-verification",
      "/officer/rfq-distribution",
      "/officer/philgeps",
      "/officer/notices-serving",
      "/officer/releasing",
      "/officer/delivery-monitoring",
      "/supplier-evaluation-form",
      "/budgets",
      "/analytics",
      "/officer/forecast",
      "/audit",
      "/pmr-history",
      "/best-value-policy",
      "/setup",
      "/form-templates",
    ];

    for (const path of requiredOfficerPaths) {
      expect(dashboardLayout).toContain(`"${path}"`);
    }

    // 2. Strictly Hidden Modules for Officer (End-User only)
    expect(dashboardLayout).not.toMatch(
      /allowedOfficerPaths\s*=\s*\[[^\]]*"\/catalog"[^\]]*\]/
    );
    expect(dashboardLayout).not.toMatch(
      /allowedOfficerPaths\s*=\s*\[[^\]]*"\/purchase-requests"[^\]]*\]/
    );
    expect(dashboardLayout).not.toMatch(
      /allowedOfficerPaths\s*=\s*\[[^\]]*"\/rfq"[^\]]*\]/
    );

    // 3. Notification Center is standalone and independent from Help & Support
    expect(dashboardLayout).toContain("NotificationCenterDrawer");
    expect(dashboardLayout).toContain("HelpSupportDialog");
    // Help & Support must NOT link to notifications
    expect(dashboardLayout).not.toMatch(/onClick=\{[^}]*setLocation\("\/notifications"\)[^}]*\}\s*className="[^"]*"\s*>\s*<span[^>]*>\s*<LifeBuoy/);
  });
});

