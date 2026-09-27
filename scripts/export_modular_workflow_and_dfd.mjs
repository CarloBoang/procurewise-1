import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "docs", "flowcharts");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const diagrams = [
  {
    id: "part1_entry_auth_flow",
    title: "Part 1: Entry, Identity & Authentication Flow",
    description: "Start node, End-User self-registration with @bsc.edu.ph validation vs. pre-provisioned institutional login, role dispatcher, and routing to Connectors [A] through [F].",
    code: `graph TD
    classDef startNode fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#ffffff;
    classDef decisionNode fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef actionNode fill:#f1f5f9,stroke:#64748b,stroke-width:1px,color:#0f172a;
    classDef dbNode fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#5b21b6;
    classDef connectorNode fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b,font-weight:bold;

    START(["[START] System Entry (Landing Page)"]):::startNode
    DEC_ROLE{"User Role Type?"}:::decisionNode

    START --> DEC_ROLE
    DEC_ROLE -- "End-User (Requesting Unit)" --> REG_PAGE["Navigate to Sign Up Page (/signup)"]:::actionNode
    REG_PAGE --> REG_INPUT["Input Full Name, Institutional Email (@bsc.edu.ph), Department & Password"]:::actionNode
    REG_INPUT --> VAL_DOM{"Validation Check:<br/>1. Domain = @bsc.edu.ph?<br/>2. Email unique in DB?"}:::decisionNode
    
    VAL_DOM -- "Invalid Domain or Duplicate" --> REG_ERR["Display Validation Error Toast & Retain Form Data"]:::actionNode
    REG_ERR --> REG_INPUT
    
    VAL_DOM -- "Valid Institutional Account" --> DB_USER_INS[("DB: Insert Record into 'users' table<br/>status: 'active', role: 'end_user'")]:::dbNode
    DB_USER_INS --> REDIR_LOGIN["Redirect to Sign In Page (/login)"]:::actionNode

    DEC_ROLE -- "Institutional Personnel<br/>(Officer, Staff, BAC, HoPE, Budget)" --> PRE_PROV["Institutional Accounts Pre-provisioned<br/>via Seed / System Admin"]:::actionNode
    PRE_PROV --> LOGIN_PAGE["Navigate to Sign In Page (/login)"]:::actionNode
    REDIR_LOGIN --> LOGIN_PAGE

    LOGIN_PAGE --> LOGIN_INPUT["User Enters Email & Password"]:::actionNode
    LOGIN_INPUT --> AUTH_CHK{"Verify Credentials against 'users' table"}:::decisionNode
    
    AUTH_CHK -- "Invalid Credentials" --> LOGIN_ERR["Show Auth Error Alert & Increment Failed Count"]:::actionNode
    LOGIN_ERR --> LOGIN_INPUT
    
    AUTH_CHK -- "Authenticated" --> SESS_INIT["Initialize JWT Session & Load Role Permissions"]:::actionNode
    SESS_INIT --> DISPATCH{"System Role Dispatcher"}:::decisionNode

    DISPATCH -- "role: 'end_user'" --> CONN_A(["Connector [A]<br/>End-User Workspace"]):::connectorNode
    DISPATCH -- "role: 'procurement_officer'" --> CONN_B(["Connector [B]<br/>Officer Management Hub"]):::connectorNode
    DISPATCH -- "role: 'procurement_staff'" --> CONN_C(["Connector [C]<br/>Staff Operations Desk"]):::connectorNode
    DISPATCH -- "role: 'bac' / 'bac_secretariat'" --> CONN_D(["Connector [D]<br/>BAC Committee Center"]):::connectorNode
    DISPATCH -- "role: 'hope'" --> CONN_E(["Connector [E]<br/>Executive Approval Desk"]):::connectorNode
    DISPATCH -- "role: 'budget_officer'" --> CONN_F(["Connector [F]<br/>Budget Allotment Desk"]):::connectorNode`
  },
  {
    id: "part2_end_user_requisition_flow",
    title: "Part 2: End-User Requisition & Pre-Canvass Flow (Connector [A])",
    description: "Requisition form, custom PPMP upload, Section 5.1.1 real-time classification, minimum 3 quotes gate, and package forwarding to Connector [B1].",
    code: `graph TD
    classDef connectorNode fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b,font-weight:bold;
    classDef decisionNode fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef actionNode fill:#f1f5f9,stroke:#64748b,stroke-width:1px,color:#0f172a;
    classDef dbNode fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#5b21b6;
    classDef alertNode fill:#fef2f2,stroke:#ef4444,stroke-width:2px,color:#b91c1c;

    CONN_A(["Connector [A]<br/>Incoming from Sign In"]):::connectorNode
    CONN_A_RET(["Connector [A]<br/>Incoming Return from PO"]):::connectorNode

    DASH_EU["End-User Dashboard (/workspace)"]:::actionNode
    CONN_A --> DASH_EU
    CONN_A_RET --> DASH_EU

    DASH_EU --> CLK_NEW_PR["Click: '+ Create Purchase Request'"]:::actionNode
    CLK_NEW_PR --> OPEN_PR_MOD["Open Purchase Request Drawer Form"]:::actionNode

    OPEN_PR_MOD --> PPMP_DEC{"PPMP Source Decision"}:::decisionNode
    PPMP_DEC -- "Select Existing" --> PPMP_LIST["Select Registered PPMP from Dropdown"]:::actionNode
    PPMP_DEC -- "Upload Custom" --> PPMP_UPLOAD["Upload Document (PDF/Excel/Word) & Set Allocated Budget"]:::actionNode
    PPMP_UPLOAD --> DB_PPMP[("DB: Create 'appPpmpEntry' Record & Attach Document")]:::dbNode
    
    PPMP_LIST --> PR_DETAILS["Fill PR Header: Purpose, Fund Cluster, Delivery Term"]:::actionNode
    DB_PPMP --> PR_DETAILS

    PR_DETAILS --> ADD_ITEMS["Click '+ Add Item Line': Input Description, Qty, Unit, Unit Cost"]:::actionNode
    ADD_ITEMS --> SEC_511_CHK{"Real-time Section 5.1.1 Category Parser"}:::decisionNode
    
    SEC_511_CHK -- "Mixed Categories Detected<br/>(Office + Hardware + ICT + etc.)" --> SEC_WARN["Display Amber Section 5.1.1 Banner:<br/>Separate items or check mandatory acknowledgement"]:::alertNode
    SEC_WARN --> ACK_BOX{"User Action?"}:::decisionNode
    ACK_BOX -- "Split Request" --> ADD_ITEMS
    ACK_BOX -- "Acknowledge" --> CHK_ACK["Check: [x] Acknowledge package contains mixed categories"]:::actionNode

    SEC_511_CHK -- "Single Category" --> OPEN_CANVASS["Open Pre-Canvass Quotation Section"]:::actionNode
    CHK_ACK --> OPEN_CANVASS

    OPEN_CANVASS --> ATTACH_QUOTES["Upload Supplier Quotations (Price, Delivery Days, Conforme)"]:::actionNode
    ATTACH_QUOTES --> QUOTE_COUNT{"Validation Gate:<br/>quotes.length >= 3?"}:::decisionNode

    QUOTE_COUNT -- "quotes < 3" --> BLK_SUBMIT["Block Submission: Display 'Minimum 3 Quotations Required'"]:::alertNode
    BLK_SUBMIT --> ATTACH_QUOTES

    QUOTE_COUNT -- "quotes >= 3" --> EN_FWD["Enable 'Forward Package' Button"]:::actionNode
    EN_FWD --> CLK_FWD["User Clicks: 'Forward Package to Procurement'"]:::actionNode
    
    CLK_FWD --> DB_PR_SAVE[("DB: Insert/Update 'purchase_requests'<br/>state: 'FOR_PO_VERIFICATION'<br/>status: 'procurement_review'")]:::dbNode
    DB_PR_SAVE --> DB_AUDIT_1[("DB: Write 'audit_trails' record<br/>action: 'pr_forwarded_to_officer'")]:::dbNode
    
    DB_AUDIT_1 --> CONN_B1(["Connector [B1]<br/>Handshake to Procurement Officer"]):::connectorNode`
  },
  {
    id: "part3_officer_verification_flow",
    title: "Part 3: Procurement Officer Verification & Compliance Flow (Connector [B1])",
    description: "Inspection of PR package, category segregation under Section 5.1.1, Return loop to [A] vs. Verify and Forward to Connector [C1].",
    code: `graph TD
    classDef connectorNode fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b,font-weight:bold;
    classDef decisionNode fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef actionNode fill:#f1f5f9,stroke:#64748b,stroke-width:1px,color:#0f172a;
    classDef dbNode fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#5b21b6;
    classDef alertNode fill:#fef2f2,stroke:#ef4444,stroke-width:2px,color:#b91c1c;

    CONN_B1(["Connector [B1]<br/>Incoming Forwarded PR"]):::connectorNode
    PO_QUEUE["Officer Verification Workbench (/officer/pr-verifications)"]:::actionNode
    CONN_B1 --> PO_QUEUE

    PO_QUEUE --> CLK_REV["PO Clicks: 'Review & Verify' on Pending PR Row"]:::actionNode
    CLK_REV --> OPEN_VER_MOD["Load Verification Modal: PR Metadata, Line Items & Attached PPMP"]:::actionNode
    
    OPEN_VER_MOD --> COMPL_EVAL{"Section 5.1.1 Compliance Check:<br/>Are items strictly segregated into single category<br/>(Office, Hardware, ICT, Printing, or Food)?"}:::decisionNode

    COMPL_EVAL -- "No (Mixed Categories / Insufficient Specs)" --> CLK_RETURN["PO Clicks: 'Return to End-User for Revision'"]:::actionNode
    CLK_RETURN --> INPUT_REMARKS["Input Mandatory Revision Remarks (Select preset or enter details)"]:::actionNode
    INPUT_REMARKS --> DB_PR_RET[("DB: Update 'purchase_requests'<br/>state: 'RETURNED_FOR_REVISION'<br/>status: 'returned'")]:::dbNode
    DB_PR_RET --> DB_AUDIT_RET[("DB: Write 'audit_trails'<br/>action: 'pr_returned_for_revision'")]:::dbNode
    DB_AUDIT_RET --> NOTIF_EU["Emit High-Priority Notification to End-User"]:::actionNode
    NOTIF_EU --> CONN_A_LOOP(["Connector [A]<br/>Route Back to End-User for Correction"]):::connectorNode

    COMPL_EVAL -- "Yes (Segregated & Valid)" --> CHK_VER_TOGGLE["PO Checks: [x] Confirm Section 5.1.1 Category Segregation"]:::actionNode
    CHK_VER_TOGGLE --> CLK_VER_FWD["PO Clicks: 'Verify & Clear PR'"]:::actionNode
    
    CLK_VER_FWD --> DB_PR_VER[("DB: Update 'purchase_requests'<br/>state: 'VERIFIED_FOR_PMR'<br/>status: 'procurement_review'")]:::dbNode
    DB_PR_VER --> DB_AUDIT_VER[("DB: Write 'audit_trails'<br/>action: 'pr_verified_under_section_511'")]:::dbNode
    
    DB_AUDIT_VER --> CONN_C1(["Connector [C1]<br/>Handshake to Procurement Staff"]):::connectorNode`
  },
  {
    id: "part4_staff_pmr_rfq_flow",
    title: "Part 4: Staff Recording, RFQ & BAC Endorsement Flow (Connector [C1])",
    description: "PMR logging, Annex D RFQ preparation, commercial vendor distribution, PhilGEPS posting guard (>= ₱50k ABC), and transmittal to Connector [D1].",
    code: `graph TD
    classDef connectorNode fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b,font-weight:bold;
    classDef decisionNode fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef actionNode fill:#f1f5f9,stroke:#64748b,stroke-width:1px,color:#0f172a;
    classDef dbNode fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#5b21b6;
    classDef alertNode fill:#fef2f2,stroke:#ef4444,stroke-width:2px,color:#b91c1c;

    CONN_C1(["Connector [C1]<br/>Incoming Verified PR"]):::connectorNode
    STAFF_BENCH["Procurement Staff PMR Desk (/staff/pmr-recording)"]:::actionNode
    CONN_C1 --> STAFF_BENCH

    STAFF_BENCH --> CLK_REC_PMR["Staff Clicks: 'Record to PMR' on Verified PR"]:::actionNode
    CLK_REC_PMR --> DB_PMR_INS[("DB: Insert into 'pmr_entries'<br/>Auto-populate PR No., Requesting Office, ABC, Code")]:::dbNode
    
    DB_PMR_INS --> CLK_PREP_RFQ["Staff Clicks: 'Prepare RFQ'"]:::actionNode
    CLK_PREP_RFQ --> LOAD_RFQ_CANVAS["Render Annex D RFQ Canvas: Set Deadline, Delivery & Terms"]:::actionNode
    LOAD_RFQ_CANVAS --> DB_RFQ_INS[("DB: Insert 'rfqs' record<br/>rfqNumber: RFQ-YYYY-XXXX, status: 'canvass'")]:::dbNode

    DB_RFQ_INS --> DIST_RFQ["Staff Clicks: 'Distribute RFQ to Suppliers'<br/>Select Minimum 3 Accredited Merchants"]:::actionNode
    DIST_RFQ --> VEND_CANVASS["Commercial Market Canvass: Prospective Suppliers Receive RFQs"]:::actionNode

    VEND_CANVASS --> RET_QUOTES["PO Retrieves Responding Sealed Quotation Envelopes"]:::actionNode
    RET_QUOTES --> DB_QUOTES[("DB: Insert records into 'supplier_quotations'<br/>(Price, Delivery Days, Compliance)")]:::dbNode

    DB_QUOTES --> PHILGEPS_GATE{"Statutory Check (RA 12009 Art. III):<br/>ABC >= ₱50,000.00?"}:::decisionNode
    
    PHILGEPS_GATE -- "ABC >= ₱50,000 & Unposted" --> BLK_TX["Block Transmittal to BAC:<br/>Trigger 'PhilGEPS Electronic Posting Guard'"]:::alertNode
    BLK_TX --> LOG_PHILGEPS["PO Clicks: 'Document PhilGEPS Reference Now'<br/>Input Reference No. & 3-Day Posting Dates"]:::actionNode
    LOG_PHILGEPS --> DB_PHILGEPS[("DB: Write 'audit_trails'<br/>action: 'philgeps_posted'")]:::dbNode
    DB_PHILGEPS --> EN_TX["Unlock Transmittal to BAC"]:::actionNode

    PHILGEPS_GATE -- "ABC < ₱50,000" --> EN_TX
    
    EN_TX --> CLK_TX_BAC["PO Clicks: 'Transmit RFQ Package to BAC'"]:::actionNode
    CLK_TX_BAC --> DB_BAC_TX[("DB: Insert 'bac_transmittals' record<br/>transmittalNumber: BAC-T-YYYY-XXXXXXX")]:::dbNode
    
    DB_BAC_TX --> CONN_D1(["Connector [D1]<br/>Handshake to BAC Secretariat"]):::connectorNode`
  },
  {
    id: "part5_bac_aoq_mearb_flow",
    title: "Part 5: BAC Evaluation, AOQ & Award Endorsement Flow (Connector [D1])",
    description: "Compilation of received quotes, Annex F AOQ, 3+ bids verification, RA 12009 Section 43 MEARB algorithm, BAC Resolution, and endorsement to Connector [E1].",
    code: `graph TD
    classDef connectorNode fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b,font-weight:bold;
    classDef decisionNode fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef actionNode fill:#f1f5f9,stroke:#64748b,stroke-width:1px,color:#0f172a;
    classDef dbNode fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#5b21b6;
    classDef alertNode fill:#fef2f2,stroke:#ef4444,stroke-width:2px,color:#b91c1c;

    CONN_D1(["Connector [D1]<br/>Incoming Transmitted Package"]):::connectorNode
    BAC_BENCH["BAC Evaluation Workspace (/workflow)"]:::actionNode
    CONN_D1 --> BAC_BENCH

    BAC_BENCH --> CLK_OPEN_AOQ["BAC Clicks: 'Generate Abstract of Canvass (AOQ)'"]:::actionNode
    CLK_OPEN_AOQ --> RENDER_AOQ["Render Annex F Abstract of Canvass Canvas<br/>Comparative Multi-Column Grid vs ABC"]:::actionNode
    
    RENDER_AOQ --> BID_COUNT_CHK{"Validation Gate:<br/>receivedBids.length >= 3?"}:::decisionNode
    BID_COUNT_CHK -- "Bids < 3" --> BLK_AOQ["Flag Insufficient Quotations under SVP rules"]:::alertNode
    BLK_AOQ --> RENDER_AOQ

    BID_COUNT_CHK -- "Bids >= 3" --> CALC_LCB["System Compares Offers & Calculates Lowest Calculated Bid (LCB)"]:::actionNode
    CALC_LCB --> CLK_MCDM["BAC Clicks: 'Calculate MCDM Best Value Engine'"]:::actionNode
    
    CLK_MCDM --> RUN_MEARB["Execute RA 12009 Section 43 MEARB Algorithm:<br/>Price (60%) + Delivery (20%) + Compliance (20%)"]:::actionNode
    RUN_MEARB --> DB_MCDM[("DB: Insert/Update 'mcdm_recommendations'<br/>Ranked scoring ledger & LCRB recommendation")]:::dbNode

    DB_MCDM --> CLK_DRAFT_RES["BAC Clicks: 'Draft BAC Resolution Recommending Award'"]:::actionNode
    CLK_DRAFT_RES --> SIGN_RES["BAC Chairperson & Members Apply Digital Sign-off"]:::actionNode
    SIGN_RES --> DB_RES[("DB: Insert 'bac_resolutions' record<br/>status: 'recommended'")]:::dbNode

    DB_RES --> CLK_SUB_HOPE["BAC Clicks: 'Endorse to HoPE for Executive Approval'"]:::actionNode
    CLK_SUB_HOPE --> DB_PR_HOPE[("DB: Update 'purchase_requests'<br/>state: 'FOR_HOPE_APPROVAL'<br/>status: 'approval_review'")]:::dbNode
    
    DB_PR_HOPE --> CONN_E1(["Connector [E1]<br/>Handshake to Head of Procuring Entity"]):::connectorNode`
  },
  {
    id: "part6_hope_budget_obligation_flow",
    title: "Part 6: HoPE Approval & Budget Obligation Flow (Connectors [E1], [C2], [F1])",
    description: "Presidential review, rejection loop vs approval, parallel handoff to Staff PO drafting [C2] and Budget Officer CAF execution [F1], leading to Connector [B2].",
    code: `graph TD
    classDef connectorNode fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b,font-weight:bold;
    classDef decisionNode fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef actionNode fill:#f1f5f9,stroke:#64748b,stroke-width:1px,color:#0f172a;
    classDef dbNode fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#5b21b6;
    classDef alertNode fill:#fef2f2,stroke:#ef4444,stroke-width:2px,color:#b91c1c;

    CONN_E1(["Connector [E1]<br/>Incoming BAC Endorsement"]):::connectorNode
    HOPE_BENCH["HoPE Executive Dashboard (/approvals)"]:::actionNode
    CONN_E1 --> HOPE_BENCH

    HOPE_BENCH --> CLK_REV_HOPE["HoPE Clicks: 'Review Award Package'"]:::actionNode
    CLK_REV_HOPE --> INSP_DOSSIER["Inspect BAC Resolution, AOQ Matrix & MEARB Scoring Breakdown"]:::actionNode
    
    INSP_DOSSIER --> HOPE_DEC{"HoPE Executive Award Decision"}:::decisionNode

    HOPE_DEC -- "Disapproved / Clarifications" --> CLK_HOPE_REJ["HoPE Clicks: 'Return to BAC with Revision Directive'"]:::actionNode
    CLK_HOPE_REJ --> DB_REJ_HOPE[("DB: Update 'bac_resolutions'<br/>status: 'returned', remarks: directive")]:::dbNode
    DB_REJ_HOPE --> CONN_D1_LOOP(["Connector [D1]<br/>Route Back to BAC for Re-evaluation"]):::connectorNode

    HOPE_DEC -- "Approved" --> CLK_HOPE_APP["HoPE Clicks: 'Approve Award Recommendation'"]:::actionNode
    CLK_HOPE_APP --> INPUT_APP_NOTES["Input Approval Remarks per RA 12009"]:::actionNode
    INPUT_APP_NOTES --> DB_APP_HOPE[("DB: Update 'purchase_requests'<br/>state: 'AWARD_APPROVED', status: 'approved'")]:::dbNode
    DB_APP_HOPE --> DB_NOA_GEN[("DB: Authorize Notice of Award (NOA) clearance")]:::dbNode

    DB_NOA_GEN --> FORK_APP{"Parallel Dispatch"}:::decisionNode
    FORK_APP --> CONN_C2(["Connector [C2]<br/>Staff PO Drafting"]):::connectorNode
    FORK_APP --> CONN_F1(["Connector [F1]<br/>Budget Allotment Obligation"]):::connectorNode

    CONN_F1 --> BUD_BENCH["Budget Officer Allotment Desk (/budgets)"]:::actionNode
    BUD_BENCH --> VER_FUNDS{"Budget Verification:<br/>Appropriation Balance >= Awarded Contract Amount?"}:::decisionNode
    
    VER_FUNDS -- "Insufficient Allotment" --> BLK_BUD["Halt: Budgetary Deficit Notification to HoPE"]:::alertNode
    
    VER_FUNDS -- "Sufficient Balance" --> CLK_CAF["Budget Officer Clicks: 'Certify Budget Availability & Obligate'"]:::actionNode
    CLK_CAF --> EXEC_CAF["Execute Box B Certificate of Availability of Funds (CAF) & Input ObR No."]:::actionNode
    EXEC_CAF --> DB_OBLIG[("DB: Insert 'budget_obligations' record<br/>Commit funds from Allotment to Obligated")]:::dbNode
    
    CONN_C2 --> STAFF_PO["Staff Opens Appendix 61 PO Canvas"]:::actionNode
    STAFF_PO --> DRAFT_PO["Compile PO Terms, FOB Basco, Delivery Period & Supplier Conforme"]:::actionNode
    
    DB_OBLIG --> SYNC_PO{"CAF & PO Synchronized"}:::decisionNode
    DRAFT_PO --> SYNC_PO
    
    SYNC_PO --> DB_PO_APPROVED[("DB: Update 'purchase_orders'<br/>state: 'PO_APPROVED'")]:::dbNode
    DB_PO_APPROVED --> CONN_B2(["Connector [B2]<br/>Handshake to Procurement Officer Releasing"]):::connectorNode`
  },
  {
    id: "part7_po_delivery_archiving_flow",
    title: "Part 7: PO Releasing, Delivery & Archiving Flow (Connector [B2])",
    description: "PO contract issuance, shipping, goods receipt & inspection (IAR), End-User supplier scorecard rating, PMR close-out, and forecasting sync to Terminal Node [END].",
    code: `graph TD
    classDef connectorNode fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b,font-weight:bold;
    classDef decisionNode fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef actionNode fill:#f1f5f9,stroke:#64748b,stroke-width:1px,color:#0f172a;
    classDef dbNode fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#5b21b6;
    classDef endNode fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#ffffff;

    CONN_B2(["Connector [B2]<br/>Incoming Approved PO"]):::connectorNode
    PO_BENCH["Officer Releasing Desk (/purchase-orders)"]:::actionNode
    CONN_B2 --> PO_BENCH

    PO_BENCH --> CLK_SERVE_PO["PO Clicks: 'Issue & Serve Purchase Order'"]:::actionNode
    CLK_SERVE_PO --> SERVE_SUP["Formally Transmit PO & Notice of Award to Winning Contractor"]:::actionNode
    SERVE_SUP --> DB_PO_REL[("DB: Update 'purchase_orders'<br/>state: 'PO_ISSUED', status: 'po_issued'")]:::dbNode

    DB_PO_REL --> SUP_FULFILL["Contractor Manufactures, Packs & Ships Goods to Batanes State College"]:::actionNode
    SUP_FULFILL --> DELIV_ARRIVE["Shipment Arrives at BSC Supply & Property Office"]:::actionNode

    DELIV_ARRIVE --> CLK_REC_DELIV["PO Clicks: 'Record Delivery Receipt' (/officer/delivery-monitoring)"]:::actionNode
    CLK_REC_DELIV --> INPUT_DR["Input Delivery Receipt (DR) No. & Log Delivery Progress (Complete / Partial)"]:::actionNode
    INPUT_DR --> INSP_GOODS["Technical Inspection: Check delivered quantities against PR specs"]:::actionNode
    
    INSP_GOODS --> CHK_IAR{"Goods Acceptable?"}:::decisionNode
    CHK_IAR -- "Rejected / Defective" --> LOG_DEFECT["Log Rejection Notice: Instruct Supplier Replacement"]:::actionNode
    LOG_DEFECT --> SUP_FULFILL

    CHK_IAR -- "Accepted" --> SIGN_IAR["Execute Inspection and Acceptance Report (IAR)"]:::actionNode
    SIGN_IAR --> DB_DELIV[("DB: Insert 'delivery_receipts' record<br/>state: 'DELIVERED', status: 'delivered'")]:::dbNode

    DB_DELIV --> EU_EVAL_NOTIF["Trigger Evaluation Request to End-User Requisitioner"]:::actionNode
    EU_EVAL_NOTIF --> CLK_RATE_SUP["End-User / Officer Opens Supplier Goods Evaluation (/supplier-evaluations)"]:::actionNode
    CLK_RATE_SUP --> RATE_RUBRIC["Complete Standard Evaluation Rubric:<br/>1. Quality (1–5)<br/>2. Timeliness (1–5)<br/>3. Price Competitiveness (1–5)<br/>4. Statutory Compliance (1–5)"]:::actionNode
    
    RATE_RUBRIC --> DB_EVAL[("DB: Insert 'supplier_evaluations' record<br/>Update Supplier Accreditation Scorecard")]:::dbNode
    
    DB_EVAL --> CLK_CLOSE_PMR["Staff Clicks: 'Finalize & Close PMR Entry' (/pmr)"]:::actionNode
    CLK_CLOSE_PMR --> DB_PMR_CLOSE[("DB: Update 'pmr_entries' state: 'COMPLETED'<br/>Commit unit prices to 'historicalPrices' table")]:::dbNode
    
    DB_PMR_CLOSE --> RECHARTS_SYNC["Auto-trigger Linear Regression Forecasting Recalculation"]:::actionNode
    RECHARTS_SYNC --> ARCHIVE_PKG["Archive All Digital Artifacts (PR, PPMP, RFQ, AOQ, PO, IAR, ObR)"]:::actionNode
    
    ARCHIVE_PKG --> END_NODE(["[END] Procurement Transaction Closed"]):::endNode`
  },
  {
    id: "dfd_level_1_macro_processes",
    title: "DFD Level 1: System Macro-Processes",
    description: "High-level data flow diagram showing external entities (End-User, Officer, Staff, BAC, HoPE, Budget Officer, Suppliers), 7 macro-processes, and 15 persistent data stores.",
    code: `graph TD
    classDef entity fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#ffffff;
    classDef process fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1;
    classDef datastore fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;

    E_USER["External Entity:<br/>End-User (Requisitioner)"]:::entity
    E_PO["External Entity:<br/>Procurement Officer"]:::entity
    E_STAFF["External Entity:<br/>Procurement Staff"]:::entity
    E_SUP["External Entity:<br/>Commercial Suppliers"]:::entity
    E_BAC["External Entity:<br/>BAC Secretariat / Committee"]:::entity
    E_HOPE["External Entity:<br/>Head of Procuring Entity (HoPE)"]:::entity
    E_BUD["External Entity:<br/>Budget Officer"]:::entity

    P1["1.0<br/>Authentication &<br/>Role Dispatch"]:::process
    P2["2.0<br/>Requisition &<br/>Pre-Canvass Package"]:::process
    P3["3.0<br/>Compliance Verification<br/>(Section 5.1.1)"]:::process
    P4["4.0<br/>RFQ Canvassing &<br/>PhilGEPS Tracking"]:::process
    P5["5.0<br/>AOQ Evaluation &<br/>MEARB Best Value"]:::process
    P6["6.0<br/>Executive Award &<br/>Budget Obligation"]:::process
    P7["7.0<br/>Contract Execution,<br/>Delivery & Closeout"]:::process

    D_USERS[("D1: users")]:::datastore
    D_PPMP[("D2: ppmp_records")]:::datastore
    D_PR[("D3: purchase_requests")]:::datastore
    D_QUOTES[("D4: canvass_quotes")]:::datastore
    D_PMR[("D5: pmr_registry")]:::datastore
    D_RFQ[("D6: rfq_registry")]:::datastore
    D_AOQ[("D7: aoq_evaluations")]:::datastore
    D_MCDM[("D8: mcdm_recommendations")]:::datastore
    D_BAC[("D9: bac_resolutions")]:::datastore
    D_BUD[("D10: budget_obligations")]:::datastore
    D_PO[("D11: purchase_orders")]:::datastore
    D_DELIV[("D12: delivery_receipts")]:::datastore
    D_EVAL[("D13: supplier_evaluations")]:::datastore
    D_PRICES[("D14: historical_prices")]:::datastore
    D_AUDIT[("D15: audit_trail")]:::datastore

    E_USER -- "1. Registration / Login Data" --> P1
    E_PO -- "1. Login Credentials" --> P1
    E_STAFF -- "1. Login Credentials" --> P1
    E_BAC -- "1. Login Credentials" --> P1
    E_HOPE -- "1. Login Credentials" --> P1
    E_BUD -- "1. Login Credentials" --> P1
    P1 <--> D_USERS
    P1 -- "Audit Login" --> D_AUDIT

    E_USER -- "2. Item Specs, PPMP File, 3 Quotes" --> P2
    P2 <--> D_PPMP
    P2 --> D_PR
    P2 --> D_QUOTES
    P2 --> D_AUDIT

    P2 -- "Package for Verification" --> P3
    E_PO -- "3. Section 5.1.1 Clearance / Return" --> P3
    P3 <--> D_PR
    P3 -- "Revision Alert" --> E_USER
    P3 --> D_AUDIT

    P3 -- "Verified PR" --> P4
    E_STAFF -- "4. PMR Record & RFQ Setup" --> P4
    P4 --> D_PMR
    P4 --> D_RFQ
    P4 -- "Annex D RFQs" --> E_SUP
    E_SUP -- "Completed Bids" --> P4
    E_PO -- "PhilGEPS Post Reference" --> P4
    P4 --> D_QUOTES
    P4 --> D_AUDIT

    P4 -- "Transmitted Canvass" --> P5
    E_BAC -- "5. Canvass Opening & Signatures" --> P5
    P5 <--> D_QUOTES
    P5 --> D_AOQ
    P5 --> D_MCDM
    P5 --> D_BAC
    P5 --> D_AUDIT

    P5 -- "Endorsed Resolution" --> P6
    E_HOPE -- "6. Award Approval Decision" --> P6
    P6 <--> D_BAC
    P6 --> D_PR
    P6 -- "Notice of Award" --> E_BUD
    E_BUD -- "6. CAF Sign-off & ObR" --> P6
    P6 --> D_BUD
    P6 --> D_PO
    P6 --> D_AUDIT

    P6 -- "Obligated PO" --> P7
    E_PO -- "7. Issue PO & Log Delivery" --> P7
    P7 --> D_PO
    P7 -- "PO Document" --> E_SUP
    E_SUP -- "Physical Goods & Invoices" --> P7
    P7 --> D_DELIV
    E_USER -- "7. Supplier Scorecard" --> P7
    P7 --> D_EVAL
    E_STAFF -- "PMR Closeout" --> P7
    P7 --> D_PMR
    P7 --> D_PRICES
    P7 --> D_AUDIT`
  },
  {
    id: "dfd_level_2_process_2_requisition",
    title: "DFD Level 2: Sub-Process 2.0 (PR & Pre-Canvass Creation)",
    description: "Detailed decomposition of Process 2.0: PPMP selection/upload, line item parsing, 3-quote validation, and package assembly.",
    code: `graph LR
    classDef entity fill:#1e293b,stroke:#0f172a,color:#ffffff;
    classDef subproc fill:#e0f2fe,stroke:#0284c7,color:#0369a1;
    classDef ds fill:#fef3c7,stroke:#d97706,color:#92400e;

    EU["End-User"]:::entity
    P21["2.1 Select/Upload PPMP"]:::subproc
    P22["2.2 Parse Line Items (Sec 5.1.1)"]:::subproc
    P23["2.3 Attach Minimum 3 Quotations"]:::subproc
    P24["2.4 Assemble & Seal Package"]:::subproc

    D_PPMP[("D2: ppmp_records")]:::ds
    D_PR[("D3: purchase_requests")]:::ds
    D_QUOTES[("D4: canvass_quotes")]:::ds
    D_AUDIT[("D15: audit_trail")]:::ds

    EU --> P21
    P21 --> D_PPMP
    P21 --> P22
    EU --> P22
    P22 --> P23
    EU --> P23
    P23 --> D_QUOTES
    P23 --> P24
    P24 --> D_PR
    P24 --> D_AUDIT`
  },
  {
    id: "dfd_level_2_process_5_mearb",
    title: "DFD Level 2: Sub-Process 5.0 (AOQ Evaluation & MEARB Scoring)",
    description: "Detailed decomposition of Process 5.0: quote threshold validation, AOQ generation, RA 12009 Section 43 MEARB score calculation, and resolution drafting.",
    code: `graph LR
    classDef entity fill:#1e293b,stroke:#0f172a,color:#ffffff;
    classDef subproc fill:#e0f2fe,stroke:#0284c7,color:#0369a1;
    classDef ds fill:#fef3c7,stroke:#d97706,color:#92400e;

    BAC["BAC Committee"]:::entity
    P51["5.1 Verify 3+ Valid Quotes"]:::subproc
    P52["5.2 Generate Annex F AOQ Matrix"]:::subproc
    P53["5.3 Calculate MEARB Multi-Criteria"]:::subproc
    P54["5.4 Formulate BAC Award Resolution"]:::subproc

    D_QUOTES[("D4: canvass_quotes")]:::ds
    D_AOQ[("D7: aoq_evaluations")]:::ds
    D_MCDM[("D8: mcdm_recommendations")]:::ds
    D_BAC[("D9: bac_resolutions")]:::ds

    D_QUOTES --> P51
    P51 --> P52
    BAC --> P52
    P52 --> D_AOQ
    P52 --> P53
    P53 --> D_MCDM
    P53 --> P54
    BAC --> P54
    P54 --> D_BAC`
  }
];

console.log("Rendering all 10 modular diagrams to high-res PNG & vector SVG...");

for (const diag of diagrams) {
  const mmdPath = path.join(outputDir, `${diag.id}.mmd`);
  const svgPath = path.join(outputDir, `${diag.id}.svg`);
  const pngPath = path.join(outputDir, `${diag.id}.png`);

  fs.writeFileSync(mmdPath, diag.code, "utf8");
  console.log(`Saved: ${mmdPath}`);

  try {
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${svgPath}" -p puppeteer-config.json -b white`, { stdio: "inherit" });
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${pngPath}" -p puppeteer-config.json -b white -s 2`, { stdio: "inherit" });
    console.log(`Generated: ${diag.id}.svg and ${diag.id}.png`);
  } catch (err) {
    console.error(`Failed to render ${diag.id}:`, err.message);
  }
}

// Re-generate master index.html with all diagrams
const allFiles = fs.readdirSync(outputDir).filter(f => f.endsWith(".mmd"));
const cardsHtml = diagrams.map(d => `
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
`).join("\n");

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Batanes State College: ProcureWise Workflow & DFD Gallery</title>
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
      max-width: 750px;
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
    <div class="badge">RA 12009 (NGPA) Official Architecture</div>
    <h1>ProcureWise: System Workflow & DFD Image Gallery</h1>
    <p class="subtitle">Complete, modular workflow sub-diagrams connected via standard connectors ([A] to [F]) and Data Flow Diagrams (Level 1 & Level 2), rendered in high-resolution PNG (300 DPI) and scalable vector SVG.</p>
  </div>

  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outputDir, "index.html"), htmlContent, "utf8");

// Re-zip
try {
  execSync(`cd "${outputDir}" && zip -r procurewise_flowcharts_png_svg.zip *.png *.svg index.html`, { stdio: "inherit" });
  console.log("Updated ZIP package: docs/flowcharts/procurewise_flowcharts_png_svg.zip");
} catch (err) {
  console.error("ZIP update failed:", err.message);
}
