import React, { useEffect, useState } from "react";

export interface BacSignatory {
  name: string;
  designation: string;
  role: string;
}

export interface OfficialBacResolutionProps {
  resolutionNumber?: string;
  prNumber?: string;
  purposeOrItems?: string;
  approvedBudget?: number | string;
  modeOfProcurement?: string;
  evaluationMode?: "lot_basis" | "per_item";
  dateResolved?: string;
  entityName?: string;
  collegePresidentName?: string;
  collegePresidentDesignation?: string;
  bacMembers?: BacSignatory[];
  endUserName?: string;
  endUserDesignation?: string;
  editable?: boolean;
  onFieldChange?: (field: string, value: any) => void;
}

export const DEFAULT_BSC_BAC_MEMBERS: BacSignatory[] = [
  { name: "RHOUPHELINE AYA A. CADIZ", designation: "Instructor I", role: "BAC Member" },
  { name: "FORTUNATO PHILIP A. CABUGAO", designation: "Assistant Professor II", role: "BAC Member" },
  { name: "EMILYN D. ALUETA", designation: "Administrative Officer IV", role: "BAC Member" },
  { name: "MARIE FE E. PABLEO", designation: "End-User / Project In-Charge", role: "End-User/Provisional Member" },
  { name: "PHILIP ULYSSES T. CASTILLO", designation: "Associate Professor II", role: "BAC Vice Chairperson" },
  { name: "DOREEN C. CASTILLO", designation: "Chief Administrative Officer", role: "BAC Chairperson" },
];

export function OfficialBacResolutionCanvas({
  resolutionNumber = "2601-GAS2-009",
  prNumber = "2026-009",
  purposeOrItems = "AM snacks (Burger and Canned Juice/Soda), Packed Meals (Pork,Chicken,Veggie,Rice,Dessert,and Drinking Water),and PM Snacks (Special spaghetti and Canned Juice/ Soda)--Snacks and meals for the evaluation and interview of applicants for private sector representative (PSR).",
  approvedBudget = 53600,
  modeOfProcurement = "Small Value Procurement",
  evaluationMode = "lot_basis",
  dateResolved,
  entityName = "Batanes State College",
  collegePresidentName = "Dr. Djovi R. Durante",
  collegePresidentDesignation = "College President",
  bacMembers = DEFAULT_BSC_BAC_MEMBERS,
  endUserName,
  editable = true,
  onFieldChange,
}: OfficialBacResolutionProps) {
  // Local editable states initialized from props
  const [localEntityName, setLocalEntityName] = useState(entityName);
  const [localResolutionNumber, setLocalResolutionNumber] = useState(resolutionNumber);
  const [localPrNumber, setLocalPrNumber] = useState(prNumber);
  const [localPurposeOrItems, setLocalPurposeOrItems] = useState(purposeOrItems);
  const [localApprovedBudget, setLocalApprovedBudget] = useState(approvedBudget);
  const [localModeOfProcurement, setLocalModeOfProcurement] = useState(modeOfProcurement);
  const [localEvaluationMode, setLocalEvaluationMode] = useState(evaluationMode);
  const [localDateResolved, setLocalDateResolved] = useState(
    dateResolved || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  );
  const [localPresidentName, setLocalPresidentName] = useState(collegePresidentName);
  const [localPresidentDesignation, setLocalPresidentDesignation] = useState(collegePresidentDesignation);
  const [localMembers, setLocalMembers] = useState<BacSignatory[]>(bacMembers);

  // Sync props to state if props update from outside
  useEffect(() => { setLocalEntityName(entityName); }, [entityName]);
  useEffect(() => { setLocalResolutionNumber(resolutionNumber); }, [resolutionNumber]);
  useEffect(() => { setLocalPrNumber(prNumber); }, [prNumber]);
  useEffect(() => { setLocalPurposeOrItems(purposeOrItems); }, [purposeOrItems]);
  useEffect(() => { setLocalApprovedBudget(approvedBudget); }, [approvedBudget]);
  useEffect(() => { setLocalModeOfProcurement(modeOfProcurement); }, [modeOfProcurement]);
  useEffect(() => { setLocalEvaluationMode(evaluationMode); }, [evaluationMode]);
  useEffect(() => { setLocalPresidentName(collegePresidentName); }, [collegePresidentName]);
  useEffect(() => { setLocalPresidentDesignation(collegePresidentDesignation); }, [collegePresidentDesignation]);
  useEffect(() => {
    let updated = [...bacMembers];
    if (endUserName) {
      updated = updated.map((m) =>
        m.role.includes("End-User") ? { ...m, name: endUserName } : m
      );
    }
    setLocalMembers(updated);
  }, [bacMembers, endUserName]);

  const formattedBudget = typeof localApprovedBudget === "number"
    ? localApprovedBudget.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Number(localApprovedBudget || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const editableClass = editable
    ? "cursor-text hover:bg-amber-50/70 focus:bg-amber-50 focus:ring-1 focus:ring-[#7b1e1e] focus:outline-none rounded px-0.5 transition-colors print:bg-transparent print:ring-0 print:px-0"
    : "";

  const handleMemberChange = (index: number, field: keyof BacSignatory, val: string) => {
    const updated = [...localMembers];
    updated[index] = { ...updated[index], [field]: val };
    setLocalMembers(updated);
    onFieldChange?.("bacMembers", updated);
  };

  const row1 = localMembers.slice(0, 3);
  const row2 = localMembers.slice(3, 6);

  return (
    <article
      aria-label="Official BAC Resolution Recommending Alternative Mode of Procurement"
      className="official-bac-resolution bg-white text-black p-6 sm:p-10 font-serif leading-relaxed text-xs shadow-sm border border-[#d8d3c5] max-w-[850px] mx-auto print:border-0 print:shadow-none print:p-0 print:m-0 relative"
    >
      {/* Visual edit mode banner (Hidden during print) */}
      {editable && (
        <div className="no-print mb-4 flex items-center justify-between rounded bg-[#faf5ec] border border-[#ecdcc0] px-3 py-1.5 text-[11px] text-[#805719] select-none print:hidden">
          <span className="flex items-center gap-1.5 font-sans font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Editable Document Canvas: Click on any text, clause, ABC amount, or signatory to edit directly.
          </span>
          <span className="text-[10px] text-neutral-500 font-sans">Edits reflect on print</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-1 pb-4">
        <p
          className={`text-[11px] font-sans font-semibold tracking-wider uppercase text-neutral-600 ${editableClass}`}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => onFieldChange?.("country", e.currentTarget.innerText)}
        >
          Republic of the Philippines
        </p>
        <p
          className={`text-sm font-bold tracking-wide uppercase ${editableClass}`}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => {
            const val = e.currentTarget.innerText.trim();
            setLocalEntityName(val);
            onFieldChange?.("entityName", val);
          }}
        >
          {localEntityName}
        </p>
        <p
          className={`text-xs font-semibold uppercase tracking-wider text-[#7b1e1e] ${editableClass}`}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => onFieldChange?.("office", e.currentTarget.innerText)}
        >
          BIDS AND AWARDS COMMITTEE OFFICE
        </p>
        <div className="pt-3">
          <h2
            className={`text-sm sm:text-base font-bold uppercase underline tracking-tight ${editableClass}`}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => {
              const val = e.currentTarget.innerText.trim();
              onFieldChange?.("title", val);
            }}
          >
            BAC Resolution Recommending Alternative Mode of Procurement under {localModeOfProcurement}
          </h2>
          <p className="mt-1 text-xs font-bold font-mono">
            BAC Resolution No.{" "}
            <span
              className={`underline ml-1 font-bold ${editableClass}`}
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                setLocalResolutionNumber(val);
                onFieldChange?.("resolutionNumber", val);
              }}
            >
              {localResolutionNumber}
            </span>
          </p>
        </div>
      </div>

      {/* Recitals (WHEREAS clauses) */}
      <div className="mt-4 space-y-3.5 text-justify text-[11.5px] leading-[1.6]">
        <p
          className={editableClass}
          contentEditable={editable}
          suppressContentEditableWarning
        >
          <span className="font-bold tracking-wide">WHEREAS</span>, Section 48 Rule XVI of the Revised Implementing Rules and Regulations of RA 9184 allows Alternative Mode of Procurement subject to prior approval of the HOPE thru Annual Procurement Plan (APP) and only to promote economy and efficiency;
        </p>

        <p
          className={editableClass}
          contentEditable={editable}
          suppressContentEditableWarning
        >
          <span className="font-bold tracking-wide">WHEREAS</span>, Section 53.9 allows Small Value Procurement provided that the procurement does not fall under shopping in Section 52 of this IRR and the amount involved does not exceed the thresholds prescribed in Annex &ldquo;H&rdquo; of this IRR;
        </p>

        <p
          className={editableClass}
          contentEditable={editable}
          suppressContentEditableWarning
        >
          <span className="font-bold tracking-wide">WHEREAS</span>, Appendix 18, Section 3.e on the Guidelines for Shopping and Small Value Procurement provides an Abstract of Quotations shall be prepared setting forth the names of those who responded to the RFQ&rsquo;s right after the deadline for submission except for shopping under Section 52.1(b), where at least three (3) price quotations (RFQ) must be obtained;
        </p>

        <p
          className={editableClass}
          contentEditable={editable}
          suppressContentEditableWarning
        >
          <span className="font-bold tracking-wide">WHEREAS</span>, Annex &ldquo;H&rdquo; of the Consolidated Guidelines for the Alternative Methods of Procurement prescribed under Section V, Paragraph D.8.b.ii that the BAC shall prepare and send the RFQs/RFPs to at least three (3) suppliers, contractors or consultants of known qualifications where receipt of at least one (1) quotation is sufficient to proceed with the evaluation thereof;
        </p>

        <div className="pl-4 border-l-2 border-[#7b1e1e]/40 py-1 space-y-1.5 my-2">
          <p>
            <span className="font-bold tracking-wide">WHEREAS</span>, Purchase Request No.{" "}
            <span
              className={`font-bold font-mono underline ${editableClass}`}
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                setLocalPrNumber(val);
                onFieldChange?.("prNumber", val);
              }}
            >
              {localPrNumber}
            </span>{" "}
            involves the procurement of:
          </p>
          <p
            className={`italic font-sans text-[11px] bg-neutral-50 p-2 rounded border border-neutral-200 text-neutral-800 ${editableClass}`}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => {
              const val = e.currentTarget.innerText.trim();
              setLocalPurposeOrItems(val);
              onFieldChange?.("purposeOrItems", val);
            }}
          >
            &ldquo;{localPurposeOrItems}&rdquo;
          </p>
          <p>
            with the approved budget of{" "}
            <span className="font-bold underline">
              PhP{" "}
              <span
                className={editableClass}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const raw = e.currentTarget.innerText.replace(/[^0.0-9.]/g, "");
                  const num = Number(raw) || 0;
                  setLocalApprovedBudget(num);
                  onFieldChange?.("approvedBudget", num);
                }}
              >
                {formattedBudget}
              </span>
            </span>;
          </p>
        </div>

        <p
          className={editableClass}
          contentEditable={editable}
          suppressContentEditableWarning
        >
          <span className="font-bold tracking-wide">WHEREAS</span>, the default mode of evaluation shall be on a{" "}
          <span className="font-semibold underline">
            {localEvaluationMode === "lot_basis" ? "lot basis" : "per item basis"}
          </span>{" "}
          which means that the determination of the single/lowest calculated and responsive bid (S/LCRB) is the total amount of offered unit price multiplied by the required quantity;
        </p>

        <p
          className={`pt-1 ${editableClass}`}
          contentEditable={editable}
          suppressContentEditableWarning
        >
          <span className="font-bold tracking-wide">NOW THEREFORE</span>, we, the members of the Bids and Awards Committee hereby <span className="font-bold">RESOLVE</span> as it is hereby <span className="font-bold">RESOLVED</span> to recommend to the College President to adopt Alternative Mode of Procurement under <span className="font-bold underline">{localModeOfProcurement}</span> for the said transaction;
        </p>

        <p className="pt-1 font-semibold">
          RESOLVED FINALLY, at the {localEntityName}, this{" "}
          <span
            className={`underline ${editableClass}`}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={(e) => {
              const val = e.currentTarget.innerText.trim();
              setLocalDateResolved(val);
              onFieldChange?.("dateResolved", val);
            }}
          >
            {localDateResolved}
          </span>.
        </p>
      </div>

      {/* Signatories Section */}
      <div className="mt-8 pt-4 border-t border-neutral-300">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-6">
          Recommending Approval:
        </p>

        {/* Row 1: 3 BAC Members */}
        <div className="grid grid-cols-3 gap-6 text-center">
          {row1.map((member, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-full border-b border-black pb-1">
                <span
                  className={`font-bold text-[11px] uppercase tracking-tight block ${editableClass}`}
                  contentEditable={editable}
                  suppressContentEditableWarning
                  onBlur={(e) => handleMemberChange(i, "name", e.currentTarget.innerText.trim())}
                >
                  {member.name}
                </span>
              </div>
              <span
                className={`text-[10px] text-neutral-700 block mt-1 font-semibold ${editableClass}`}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={(e) => handleMemberChange(i, "role", e.currentTarget.innerText.trim())}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2: End-User, Vice Chair, Chair */}
        <div className="grid grid-cols-3 gap-6 text-center mt-8">
          {row2.map((member, i) => {
            const actualIndex = i + 3;
            return (
              <div key={actualIndex} className="flex flex-col items-center">
                <div className="w-full border-b border-black pb-1">
                  <span
                    className={`font-bold text-[11px] uppercase tracking-tight block ${editableClass}`}
                    contentEditable={editable}
                    suppressContentEditableWarning
                    onBlur={(e) => handleMemberChange(actualIndex, "name", e.currentTarget.innerText.trim())}
                  >
                    {member.name}
                  </span>
                </div>
                <span
                  className={`text-[10px] text-neutral-700 block mt-1 font-semibold ${editableClass}`}
                  contentEditable={editable}
                  suppressContentEditableWarning
                  onBlur={(e) => handleMemberChange(actualIndex, "role", e.currentTarget.innerText.trim())}
                >
                  {member.role}
                </span>
              </div>
            );
          })}
        </div>

        {/* Approved by Section (HoPE) */}
        <div className="mt-10 pt-4 flex flex-col items-center sm:items-start">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-6">
            Approved:
          </p>
          <div className="text-center min-w-[240px]">
            <div className="border-b border-black pb-1">
              <span
                className={`font-bold text-xs uppercase tracking-tight block ${editableClass}`}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.innerText.trim();
                  setLocalPresidentName(val);
                  onFieldChange?.("collegePresidentName", val);
                }}
              >
                {localPresidentName}
              </span>
            </div>
            <span
              className={`text-[10.5px] text-neutral-700 block mt-1 font-semibold ${editableClass}`}
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                setLocalPresidentDesignation(val);
                onFieldChange?.("collegePresidentDesignation", val);
              }}
            >
              {localPresidentDesignation}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
