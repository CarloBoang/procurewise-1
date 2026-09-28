import { describe, expect, it } from "vitest";
import { z } from "zod";
import { DEFAULT_BSC_BAC_MEMBERS } from "../client/src/components/OfficialBacResolutionCanvas";

describe("BAC Resolution & Endorsement Workflow", () => {
  const endorseResolutionSchema = z.object({
    purchaseRequestId: z.number().int().positive().optional(),
    resolutionNumber: z.string().min(3).max(120),
    modeOfProcurement: z.string().min(3).max(120),
    approvedBudget: z.number().positive(),
    evaluationMode: z.enum(["lot_basis", "per_item"]).default("lot_basis"),
    purposeOrItems: z.string().min(3).max(4000),
    endUserName: z.string().max(180).optional(),
    remarks: z.string().max(3000).optional(),
  });

  it("validates a compliant BAC Resolution endorsement payload", () => {
    const payload = {
      purchaseRequestId: 9,
      resolutionNumber: "2601-GAS2-009",
      modeOfProcurement: "Small Value Procurement",
      approvedBudget: 53600.0,
      evaluationMode: "lot_basis" as const,
      purposeOrItems:
        "AM snacks (Burger and Canned Juice/Soda), Packed Meals (Pork,Chicken,Veggie,Rice,Dessert,and Drinking Water),and PM Snacks (Special spaghetti and Canned Juice/ Soda)--Snacks and meals for the evaluation and interview of applicants for private sector representative (PSR).",
      endUserName: "MARIE FE E. PABLEO",
      remarks: "Endorsed for review and signature pursuant to RA 9184 Alternative Mode of Procurement.",
    };

    const parsed = endorseResolutionSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.approvedBudget).toBe(53600);
      expect(parsed.data.modeOfProcurement).toBe("Small Value Procurement");
      expect(parsed.data.evaluationMode).toBe("lot_basis");
    }
  });

  it("verifies the official BSC BAC Committee composition and signatories", () => {
    expect(DEFAULT_BSC_BAC_MEMBERS.length).toBe(6);

    const names = DEFAULT_BSC_BAC_MEMBERS.map((m) => m.name);
    expect(names).toContain("RHOUPHELINE AYA A. CADIZ");
    expect(names).toContain("FORTUNATO PHILIP A. CABUGAO");
    expect(names).toContain("EMILYN D. ALUETA");
    expect(names).toContain("MARIE FE E. PABLEO");
    expect(names).toContain("PHILIP ULYSSES T. CASTILLO");
    expect(names).toContain("DOREEN C. CASTILLO");

    const chair = DEFAULT_BSC_BAC_MEMBERS.find((m) => m.role === "BAC Chairperson");
    expect(chair?.name).toBe("DOREEN C. CASTILLO");

    const viceChair = DEFAULT_BSC_BAC_MEMBERS.find((m) => m.role === "BAC Vice Chairperson");
    expect(viceChair?.name).toBe("PHILIP ULYSSES T. CASTILLO");
  });

  it("rejects invalid approved budget or missing resolution number", () => {
    const invalidPayload = {
      resolutionNumber: "",
      modeOfProcurement: "Small Value Procurement",
      approvedBudget: -100, // invalid negative ABC!
      purposeOrItems: "Test purpose",
    };

    const result = endorseResolutionSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
