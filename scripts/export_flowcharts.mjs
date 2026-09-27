import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs");
const outputDir = path.join(docsDir, "flowcharts");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Definition of the diagrams
const diagrams = [
  {
    id: "01_cross_functional_lifecycle",
    title: "1. Cross-Functional Swimlane Lifecycle Flowchart (All Roles)",
    description: "End-to-End procurement workflow showing connectors between End-User, Officer, Staff, Suppliers, BAC, HoPE, and Budget Officer under RA 12009 (NGPA).",
    code: `flowchart TD
    classDef endUser fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef officer fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#3730a3;
    classDef staff fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1;
    classDef supplier fill:#f3f4f6,stroke:#4b5563,stroke-width:2px,color:#1f2937;
    classDef bac fill:#fef2f2,stroke:#dc2626,stroke-width:2px,color:#991b1b;
    classDef hope fill:#fdf4ff,stroke:#c026d3,stroke-width:2px,color:#86198f;
    classDef budget fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#065f46;

    subgraph S1 ["Stage 1: Requisition & Market Scoping (End-User)"]
        EU1["1.1 Market Scoping & PPMP Check<br/><i>(RA 12009 Art. II)</i>"]:::endUser
        EU2["1.2 Create Purchase Request (PR)<br/><i>Select or Upload Custom PPMP</i>"]:::endUser
        EU3{"1.3 Section 5.1.1<br/>Category Check"}:::endUser
        EU4["1.4 Collect & Attach 3 Supplier Quotes<br/><i>Pre-Canvass Envelope (SVP)</i>"]:::endUser
        EU5["1.5 Forward Complete Package<br/><i>Status: procurement_review</i>"]:::endUser
    end

    subgraph S2 ["Stage 2: Administrative Verification (Procurement Officer)"]
        PO1["2.1 Receive Package in Queue<br/><i>/officer/pr-verifications</i>"]:::endUser
        PO2{"2.2 Section 5.1.1<br/>Category Segregation &<br/>PPMP Verification"}:::officer
        PO3["2.3 Return for Revision<br/><i>Status: returned (with remarks)</i>"]:::officer
        PO4["2.4 Verify & Clear PR<br/><i>Status: verified</i>"]:::officer
    end

    subgraph S3 ["Stage 3: PMR Logging & RFQ Canvassing (Procurement Staff)"]
        PS1["3.1 Log Verified PR to PMR<br/><i>Auto-populate metadata</i>"]:::staff
        PS2["3.2 Generate Annex D RFQ<br/><i>Official statutory template</i>"]:::staff
        PS3["3.3 Distribute RFQs to Commercial Suppliers<br/><i>Target minimum 3 prospective bidders</i>"]:::staff
    end

    subgraph S4 ["Stage 4: Quotation Submission & Electronic Posting"]
        SUP1["4.1 Suppliers Prepare & Submit Bids<br/><i>Price, delivery terms, compliance</i>"]:::supplier
        PO_PG{"4.2 ABC > ₱50,000.00?<br/><i>RA 12009 Art. III Check</i>"}:::officer
        PO_PG_YES["4.3 Document PhilGEPS Posting Ref<br/><i>Mandatory 3-day posting guard</i>"]:::officer
        PO_TRANS["4.4 Retrieve & Transmit to BAC<br/><i>Generate Transmittal Slip</i>"]:::officer
    end

    subgraph S5 ["Stage 5: Abstract of Canvass & Best Value Scoring (BAC)"]
        BAC1["5.1 Open & Register Quotation Envelopes<br/><i>Verify min. 3 compliant quotes</i>"]:::bac
        BAC2["5.2 Generate Official Abstract (AOQ Annex F)<br/><i>Side-by-side price comparison vs ABC</i>"]:::bac
        BAC3["5.3 Execute MCDM Best Value Engine<br/><i>60% Price + 20% Delivery + 20% Compliance<br/>(RA 12009 Art. V / MEARB)</i>"]:::bac
        BAC4["5.4 Formulate BAC Resolution<br/><i>Recommend Award to LCRB / MEARB</i>"]:::bac
    end

    subgraph S6 ["Stage 6: Award Approval & Allotment Obligation"]
        HOPE1{"6.1 HoPE Award Review<br/><i>(Executive Approval)</i>"}:::hope
        HOPE_REJ["Return to BAC with Review Remarks"]:::hope
        HOPE_APP["6.2 Approve Resolution & Notice of Award (NOA)"]:::hope
        BUD1["6.3 Budget Availability & Obligation<br/><i>Commit Allotment (Budget Officer)</i>"]:::budget
    end

    subgraph S7 ["Stage 7: Contract Releasing, Inspection & Performance Rating"]
        PO_ISSUE["7.1 Generate Purchase Order (PO Appendix 61)<br/><i>Serve to Awarded Contractor</i>"]:::officer
        SUP_DELIV["7.2 Deliver Goods/Services per PO Terms"]:::supplier
        PO_INSPECT["7.3 Delivery Receipt & Inspection (IAR)<br/><i>Log Complete/Partial Delivery</i>"]:::officer
        PO_RATING["7.4 Rate Supplier Performance<br/><i>Quality, Timeliness, Price, Compliance (1–5)</i>"]:::officer
        PO_CLOSE["7.5 PMR Closeout & Price History Update<br/><i>Record to HistoricalPrices for Forecasting</i>"]:::staff
    end

    EU1 --> EU2
    EU2 --> EU3
    EU3 -- "Mixed Categories Warning" --> EU2
    EU3 -- "Compliant / Acknowledged" --> EU4
    EU4 --> EU5

    EU5 -- "Connector: PR Package Forwarded" --> PO1
    PO1 --> PO2
    PO2 -- "Non-compliant / Split items" --> PO3
    PO3 -- "Connector: Returned for Revision" --> EU2
    PO2 -- "Compliant" --> PO4

    PO4 -- "Connector: Verified PR Package" --> PS1
    PS1 --> PS2
    PS2 --> PS3

    PS3 -- "Connector: RFQ Transmission" --> SUP1
    SUP1 -- "Connector: Quotation Envelopes" --> PO_PG
    PO_PG -- "Yes (> ₱50k)" --> PO_PG_YES
    PO_PG -- "No (≤ ₱50k)" --> PO_TRANS
    PO_PG_YES --> PO_TRANS

    PO_TRANS -- "Connector: Transmittal of Retrieved RFQs" --> BAC1
    BAC1 --> BAC2
    BAC2 --> BAC3
    BAC3 --> BAC4

    BAC4 -- "Connector: BAC Resolution & AOQ" --> HOPE1
    HOPE1 -- "Declined" --> HOPE_REJ
    HOPE_REJ --> BAC1
    HOPE1 -- "Approved" --> HOPE_APP

    HOPE_APP -- "Connector: Approved Award" --> BUD1
    BUD1 -- "Connector: Certified Funds" --> PO_ISSUE

    PO_ISSUE -- "Connector: Issued PO" --> SUP_DELIV
    SUP_DELIV -- "Connector: Delivered Shipments" --> PO_INSPECT
    PO_INSPECT --> PO_RATING
    PO_RATING --> PO_CLOSE`
  },
  {
    id: "02_end_user_button_flow",
    title: "2. End-User Requisition Button-by-Button Flow",
    description: "Step-by-step clicks from Login to Workspace, custom PPMP upload, Section 5.1.1 alert, quote attachment, and package forwarding.",
    code: `flowchart TD
    L["1.1 Login (/login)"] --> W["1.2 Lands on /workspace"]
    W --> B1["1.3 Click: 'Create Purchase Request'"]
    B1 --> D1{"1.4 PPMP Selection Decision"}
    D1 -- "Select Existing" --> PPMP_SEL["Choose from Registered PPMP Dropdown"]
    D1 -- "Upload Custom" --> PPMP_UPL["Upload PDF/Excel/Word & Enter Budget"]
    PPMP_SEL --> ITM["1.5 Enter Line Items & Specs"]
    PPMP_UPL --> ITM
    ITM --> CLS{"1.6 Section 5.1.1 Category Check"}
    CLS -- "Mixed Categories" --> ACK["Alert: Check Acknowledge Box or Split Items"]
    CLS -- "Single Category" --> QUO["1.7 Click: 'Open Pre-Canvass Workspace'"]
    ACK --> QUO
    QUO --> Q3["Attach Minimum 3 Supplier Quotations"]
    Q3 --> B2["1.8 Click: 'Forward Package to Procurement'"]
    B2 --> H1["Package Status: procurement_review (Handed off to Officer)"]`
  },
  {
    id: "03_officer_verification_button_flow",
    title: "3. Procurement Officer Verification & Gatekeeping Flow",
    description: "Inspection of PR package, category segregation check, and decision branching (Return for Revision vs Verify & Clear).",
    code: `flowchart TD
    L2["2.1 Officer Login (/login)"] --> OV["2.2 Open: /officer/pr-verifications"]
    OV --> B3["2.3 Click: 'Review & Verify' on Incoming PR"]
    B3 --> VMOD["2.4 Review Modal: Inspect PPMP & Section 5.1.1 Categories"]
    VMOD --> DEC2{"2.5 Officer Compliance Decision"}
    DEC2 -- "Non-compliant / Mixed Items" --> B_RET["Click: 'Return to End-User for Revision'"]
    B_RET --> REM["Select Pre-defined Reason or Enter Remarks"]
    REM --> CONF_RET["Click: 'Confirm Return' -> Status: returned"]
    CONF_RET --> END_NOTIF["End-User receives notification alert to revise"]
    DEC2 -- "Compliant Package" --> CHK_CONF["Check: [x] Confirm Section 5.1.1 Segregation"]
    CHK_CONF --> B_VER["Click: 'Verify & Clear PR'"]
    B_VER --> H2["Status: verified -> Handed off to Procurement Staff"]`
  },
  {
    id: "04_staff_pmr_rfq_button_flow",
    title: "4. Procurement Staff PMR Logging & RFQ Canvassing Flow",
    description: "PMR recording, Annex D RFQ creation, setting terms, and dispatching invitations to commercial suppliers.",
    code: `flowchart TD
    L3["3.1 Staff Login (/login)"] --> PMR["3.2 Open: /staff/pmr-recording"]
    PMR --> B_LOG["3.3 Click: 'Record to PMR' on Verified PR"]
    B_LOG --> CONF_PMR["3.4 Click: 'Confirm PMR Entry' (Auto-populates metadata)"]
    CONF_PMR --> B_RFQ["3.5 Click: 'Prepare RFQ' -> Opens Official Annex D Canvas"]
    B_RFQ --> RFQ_SET["3.6 Set Deadline & Terms (15 Days / Basco Supply Office)"]
    RFQ_SET --> B_GEN["3.7 Click: 'Generate Annex D RFQ'"]
    B_GEN --> B_DIST["3.8 Click: 'Distribute to Suppliers' -> Select 3+ Vendors"]
    B_DIST --> H3["RFQ Status: canvass -> Dispatched to Commercial Market"]`
  },
  {
    id: "05_philgeps_transmittal_button_flow",
    title: "5. Quotation Retrieval & PhilGEPS Posting Guard Flow",
    description: "Officer records quotations, enforces RA 12009 Article III posting threshold (> ₱50k ABC), and transmits package to BAC.",
    code: `flowchart TD
    L4["4.1 Officer Opens /officer/rfqs"] --> RET["4.2 Retrieve Supplier Bids & Click: '+ Add Quotation'"]
    RET --> BID_IN["4.3 Enter Supplier Name, Bid Price, Days & Compliance"]
    BID_IN --> PG_CHK{"4.4 System Check: ABC > ₱50,000.00? (RA 12009 Art. III)"}
    PG_CHK -- "Yes (> ₱50k) & No PhilGEPS" --> BLK["Transmittal Blocked by PhilGEPS Guard Banner"]
    BLK --> B_PG["4.5 Click: 'Document PhilGEPS Posting Reference Now'"]
    B_PG --> PG_MOD["Enter PhilGEPS Reference No. & 3-Day Posting Dates"]
    PG_MOD --> PG_SAVE["Click: 'Save PhilGEPS Reference' -> Guard Cleared"]
    PG_SAVE --> B_TX["4.6 Click: 'Transmit RFQ Package to BAC'"]
    PG_CHK -- "No (≤ ₱50k) or Already Posted" --> B_TX
    B_TX --> TX_CONF["4.7 Click: 'Confirm Transmittal' -> Code: BAC-T-2026-XXXX"]
    TX_CONF --> H4["Status: Transmitted to BAC Secretariat"]`
  },
  {
    id: "06_bac_mcdm_best_value_button_flow",
    title: "6. BAC Abstract of Canvass & MEARB Best Value Flow",
    description: "Opening 3+ bids, generating Annex F Abstract, executing MCDM Best Value engine (60/20/20), and drafting BAC Resolution.",
    code: `flowchart TD
    L5["5.1 BAC Login (/login)"] --> WF["5.2 Open: /workflow (BAC Workspace)"]
    WF --> B_AOQ["5.3 Click: 'Generate Abstract of Canvass (AOQ)'"]
    B_AOQ --> CANV["5.4 View Multi-Bidder Matrix vs ABC (Annex F Canvas)"]
    CANV --> B_MCDM["5.5 Click: 'Calculate MCDM Best Value'"]
    B_MCDM --> SCOR["5.6 System executes MEARB Scorecard (60% Price + 20% Deliv + 20% Comp)"]
    SCOR --> RES["5.7 Click: 'Draft BAC Resolution Recommending Award'"]
    RES --> SIGN_BAC["5.8 BAC Chairperson & Members Apply Digital Signatures"]
    SIGN_BAC --> B_SUB_HOPE["5.9 Click: 'Submit Resolution to HoPE for Executive Approval'"]
    B_SUB_HOPE --> H5["Status: approval_review (Handed off to HoPE)"]`
  },
  {
    id: "07_hope_executive_approval_button_flow",
    title: "7. HoPE Executive Award Approval Flow",
    description: "College President / HoPE review of BAC Resolution, Abstract of Canvass, and approval clearance for Notice of Award (NOA).",
    code: `flowchart TD
    L6["6.1 HoPE Login (/login)"] --> APP_PG["6.2 Open: /approvals"]
    APP_PG --> B_REV["6.3 Click: 'Review Package' on Pending Award"]
    B_REV --> MOD_EXP["6.4 Inspect AOQ Matrix, MCDM Rationale & BAC Resolution"]
    MOD_EXP --> DEC3{"6.5 Executive Decision Gate"}
    DEC3 -- "Disapprove / Questions" --> B_RET_BAC["Click: 'Return to BAC with Remarks'"]
    B_RET_BAC --> H_BAC["Returns to BAC for Re-evaluation"]
    DEC3 -- "Approve Award" --> B_APP_HOPE["Click: 'Approve Award Recommendation'"]
    B_APP_HOPE --> REM_APP["Enter Approval Remarks & Conforme"]
    REM_APP --> CONF_APP["Click: 'Confirm Executive Approval'"]
    CONF_APP --> H6["Status: approved -> Notice of Award (NOA) Cleared"]`
  },
  {
    id: "08_budget_obligation_button_flow",
    title: "8. Budget Officer Allotment Obligation Flow",
    description: "Verifying allotment availability, encumbering funds, and recording Obligation Request (ObR) number.",
    code: `flowchart TD
    L7["7.1 Budget Officer Login (/login)"] --> BUD_PG["7.2 Open: /budgets"]
    BUD_PG --> B_OBR["7.3 Locate Approved PR in 'Pending Obligation' Queue"]
    B_OBR --> VER_BAL["7.4 Verify Remaining Budget Balance >= Awarded Contract Sum"]
    VER_BAL --> B_OBLIG["7.5 Click: 'Certify Budget Availability & Obligate'"]
    B_OBLIG --> OBR_IN["7.6 Enter Obligation Request (ObR) Number & Fund Cluster"]
    OBR_IN --> CONF_OBR["7.7 Click: 'Confirm Obligation'"]
    CONF_OBR --> H7["Funds Committed -> Unlocks Purchase Order Release"]`
  },
  {
    id: "09_po_delivery_rating_button_flow",
    title: "9. Purchase Order Releasing, Delivery & Supplier Rating Flow",
    description: "Appendix 61 PO release, logging complete delivery, IAR sign-off, supplier performance scorecard, and PMR close-out.",
    code: `flowchart TD
    L8["8.1 Procurement Officer Login"] --> PO_PG["8.2 Navigate to /purchase-orders"]
    PO_PG --> B_MPO["8.3 Click: 'Create Purchase Order' on Approved Package"]
    B_MPO --> PO_CANV["8.4 Appendix 61 PO Canvas opens (Terms & Conditions auto-filled)"]
    PO_CANV --> B_ISSUE_PO["8.5 Click: 'Issue & Serve Purchase Order' -> Status: po_issued"]
    B_ISSUE_PO --> SUP_SHIP["8.6 Winning Supplier ships goods to Basco Supply Office"]
    SUP_SHIP --> DELIV_PG["8.7 Navigate to /officer/delivery-monitoring"]
    DELIV_PG --> B_REC_DEL["8.8 Click: 'Record Delivery Receipt'"]
    B_REC_DEL --> IAR_CHK["8.9 Check: [x] Inspection & Acceptance (IAR) Approved -> Status: delivered"]
    IAR_CHK --> B_EVAL["8.10 Navigate to /supplier-evaluations -> Click: '+ Rate Supplier'"]
    B_EVAL --> SCORE_4["8.11 Score Quality, Timeliness, Price & Compliance (1–5 Scale)"]
    SCORE_4 --> B_SUB_EVAL["8.12 Click: 'Submit Evaluation' -> Updates Vendor Accreditation"]
    B_SUB_EVAL --> PMR_CLS["8.13 Click: 'Finalize & Close PMR Record' in /pmr"]
    PMR_CLS --> H8["Status: closed -> Prices committed to Forecasting Engine"]`
  },
  {
    id: "10_end_to_end_sequence",
    title: "10. Chronological Lifecycle Sequence Diagram",
    description: "Chronological multi-actor sequence diagram illustrating message and document handoffs across all phases.",
    code: `sequenceDiagram
    autonumber
    actor EU as End-User
    actor PO as Procurement Officer
    actor PS as Procurement Staff
    actor SUP as Commercial Supplier
    actor BAC as BAC Committee
    actor HOPE as Head of Procuring Entity (HoPE)
    actor BUD as Budget Officer

    Note over EU,PO: Phase 1: Requisition & Verification
    EU->>EU: Draft PR & Attach PPMP (Select / Upload)
    EU->>EU: Collect 3 Pre-Canvass Supplier Quotes
    EU->>PO: Submit PR Package (Status: procurement_review)
    PO->>PO: Verify Section 5.1.1 Category & PPMP Match
    alt Mixed Categories or Deficient PPMP
        PO-->>EU: Return to End-User (Remarks attached)
        EU->>EU: Revise Specifications / Resubmit
    else Compliant Package
        PO->>PS: Verify & Clear (Status: verified)
    end

    Note over PS,PO: Phase 2: PMR Logging & RFQ Canvassing
    PS->>PS: Auto-populate PR into PMR Log
    PS->>SUP: Dispatch Annex D RFQs (Minimum 3 vendors)
    SUP-->>PO: Return Quotation Bids (Price, Timeline, Compliance)
    PO->>PO: Check RA 12009 Art. III (PhilGEPS posting if ABC > ₱50k)
    PO->>BAC: Transmit Retrieved RFQs (Transmittal Slip BAC-T-...)

    Note over BAC,HOPE: Phase 3: Abstract, MEARB & Award Approval
    BAC->>BAC: Generate Annex F Abstract of Quotations (AOQ)
    BAC->>BAC: Execute MCDM Best Value Engine (60% Price, 20% Delivery, 20% Compliance)
    BAC->>HOPE: Submit BAC Resolution Recommending LCRB / MEARB
    HOPE->>HOPE: Review Resolution & Administrative Justification
    HOPE->>BUD: Executive Approval of Award
    BUD->>PO: Obligate Allotment Funds & Clear for PO Releasing

    Note over PO,PS: Phase 4: PO Releasing, Delivery & Performance Closeout
    PO->>SUP: Issue Appendix 61 Purchase Order (PO)
    SUP-->>PO: Deliver Supplies & Submit Invoices
    PO->>PO: Record Delivery Receipt & Inspection (IAR)
    PO->>PO: Rate Supplier Evaluation Scorecard (1–5 Scale)
    PO->>PS: Update Historical Prices & Close PMR Record`
  }
];

// Save individual .mmd files and render PNG and SVG
console.log("Saving Mermaid definition files and generating high-res PNG & SVG images...");

for (const diag of diagrams) {
  const mmdPath = path.join(outputDir, `${diag.id}.mmd`);
  const svgPath = path.join(outputDir, `${diag.id}.svg`);
  const pngPath = path.join(outputDir, `${diag.id}.png`);

  fs.writeFileSync(mmdPath, diag.code, "utf8");
  console.log(`Saved: ${mmdPath}`);

  try {
    // Generate SVG
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${svgPath}" -p puppeteer-config.json -b white`, { stdio: "inherit" });
    // Generate High-Res PNG (scale: 2 for 300dpi sharpness)
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${pngPath}" -p puppeteer-config.json -b white -s 2`, { stdio: "inherit" });
    console.log(`Generated: ${diag.id}.svg and ${diag.id}.png`);
  } catch (err) {
    console.error(`Failed to render ${diag.id}:`, err.message);
  }
}

// Generate interactive HTML gallery with direct download buttons
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProcureWise: Defense Flowcharts & Diagrams Gallery</title>
  <style>
    :root {
      --primary: #7b1e1e;
      --primary-dark: #611818;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 40px 20px;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 40px auto;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      color: var(--primary);
      margin: 0 0 10px 0;
    }
    p.subtitle {
      font-size: 15px;
      color: var(--text-muted);
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .grid {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    .card {
      background: var(--card-bg);
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      background: #fafaf9;
    }
    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .card-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin: 4px 0 0 0;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-png {
      background: var(--primary);
      color: white;
    }
    .btn-png:hover {
      background: var(--primary-dark);
    }
    .btn-svg {
      background: white;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-svg:hover {
      background: #f1f5f9;
    }
    .card-body {
      padding: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ffffff;
      overflow-x: auto;
    }
    .card-body img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">RA 12009 (NGPA) Defense Package</div>
    <h1>ProcureWise: High-Resolution Flowcharts Gallery</h1>
    <p class="subtitle">Complete visual flowcharts and sequence diagrams ready for instant high-res PNG and vector SVG download for thesis defense presentation slides and documentation.</p>
  </div>

  <div class="grid">
    ${diagrams.map(d => `
    <div class="card" id="${d.id}">
      <div class="card-header">
        <div>
          <h2 class="card-title">${d.title}</h2>
          <p class="card-desc">${d.description}</p>
        </div>
        <div class="actions">
          <a href="${d.id}.png" download="${d.id}.png" class="btn btn-png">⬇ Download PNG (300 DPI)</a>
          <a href="${d.id}.svg" download="${d.id}.svg" class="btn btn-svg">⬇ Download SVG (Vector)</a>
        </div>
      </div>
      <div class="card-body">
        <a href="${d.id}.png" target="_blank" title="Click to view full size">
          <img src="${d.id}.svg" alt="${d.title}" />
        </a>
      </div>
    </div>
    `).join("\n")}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outputDir, "index.html"), htmlContent, "utf8");
console.log("Generated interactive viewer gallery at: docs/flowcharts/index.html");
