# ProcureWise: Ultra-Detailed Button-by-Button Process Flow
### Comprehensive Screen-by-Screen, Click-by-Click, and Decision-by-Decision Manual
#### Aligned with Republic Act No. 12009 (New Government Procurement Act - NGPA) & Institutional Procedure 5

---

## Overview of Actors & Credentials

| Role | Demo Email | Initial Route | Primary Duty |
| :--- | :--- | :--- | :--- |
| **1. End-User** | `enduser.demo@bsc.edu.ph` | `/workspace` | PR creation, custom PPMP upload, Section 5.1.1 check, pre-canvass quotes |
| **2. Procurement Officer** | `officer.demo@bsc.edu.ph` | `/officer/pr-verifications` | Administrative verification, Section 5.1.1 gatekeeping, PhilGEPS posting |
| **3. Procurement Staff** | `staff.demo@bsc.edu.ph` | `/staff/pmr-recording` | PMR logging, Annex D RFQ generation, vendor canvassing |
| **4. Commercial Supplier** | *External Bidder* | *Quotation Envelope* | Submits commercial quotation bids |
| **5. BAC Secretariat / Committee** | `bac.demo@bsc.edu.ph` | `/workflow` | Opening, Abstract of Canvass (Annex F), MCDM Best Value (MEARB) |
| **6. Head of Procuring Entity (HoPE)**| `hope.demo@bsc.edu.ph` | `/approvals` | Executive award review, administrative clearance, Notice of Award (NOA) |
| **7. Budget Officer** | `budget.demo@bsc.edu.ph` | `/budgets` | Allotment availability verification, fund commitment and obligation (ObR) |
| **8. Supply & Inspection / Officer** | `officer.demo@bsc.edu.ph` | `/officer/delivery-monitoring`| PO issuance, delivery receipt, IAR inspection, supplier performance ratings |

---

## 1. End-User Requisition Workflow (Step-by-Step)

```mermaid
flowchart TD
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
    B2 --> H1["Package Status: procurement_review (Handed off to Officer)"]
```

### Detailed Screen & Button Steps:
1. **Login:**
   - Navigate to `/login`.
   - Enter Email: `enduser.demo@bsc.edu.ph`, Password: `password`.
   - **Click Button:** `[Sign In]`.
2. **Landing Page:**
   - System redirects to `/workspace` (Employee Requisition Workspace).
3. **Initiating Request:**
   - **Click Button:** `[+ Create Purchase Request]` located in the top-right header.
   - The slide-over panel **"New Purchase Request"** opens.
4. **PPMP Linkage Decision:**
   - **Choice A (Existing):** Click radio button `[Select from Approved PPMP]` $\rightarrow$ select your department's item category from the dropdown (e.g., *Office Supplies PPMP 2026*).
   - **Choice B (Custom Upload):** Click radio button `[Upload / Register PPMP]` $\rightarrow$ Click `[Browse File]` (attach PDF, Excel, Word up to 14MB) $\rightarrow$ enter PPMP Title and Estimated Allotment.
5. **Item Specification & Section 5.1.1 Real-Time Check:**
   - Fill in: Requisition Purpose (e.g., *"Procurement of Office Supplies for 1st Quarter"*), Fund Cluster (*Regular Agency Fund*), Delivery Term (*15 Calendar Days*).
   - **Click Button:** `[+ Add Item Line]`.
   - Enter: Item Description, Quantity, Unit (e.g., *ream*), Estimated Unit Price (e.g., *₱285.00*).
   - **Automated Rule Trigger:** The real-time parser classifies each line item.
     - *If all items are Office Supplies:* Green status indicator displays *"Compliant with Section 5.1.1"*.
     - *If items are mixed (e.g., Bond paper + Desktop Computer):* Amber warning banner appears:
       > *"Section 5.1.1 Mandated Category Segregation Alert: Mixed Categories Detected."*
     - **Decision:** The user can either delete the incompatible item, or check the mandatory acknowledgement checkbox:
       `[x] "I acknowledge that this package has mixed categories and may be returned under Section 5.1.1"`.
6. **Pre-Canvass Canvassing Quotes:**
   - Scroll down to the **Pre-Canvass Supplier Quotations** section.
   - **Click Button:** `[+ Add Supplier Quotation]`.
   - Select Supplier 1 (e.g., *Universal Commercial Supplies*) $\rightarrow$ enter Quoted Total Price $\rightarrow$ enter Delivery Days $\rightarrow$ Click `[Save Quote]`.
   - Repeat for Supplier 2 (e.g., *Standard Goods Enterprise*).
   - Repeat for Supplier 3 (e.g., *Ivatan General Merchandise*).
   - Indicator turns green: *"3 of 3 Required Quotes Attached"*.
7. **Forwarding to Procurement:**
   - **Click Button:** `[Forward Package to Procurement]` at the bottom of the form.
   - A loading spinner displays while the package is sealed and audit-logged.
   - Success toast appears: *"Purchase Request PR-2026-XXXX submitted successfully."*
   - Status changes to `procurement_review`.
   - **Connector:** The package disappears from the End-User draft queue and is instantly transmitted to the Procurement Officer's verification desk.

---

## 2. Procurement Officer Administrative Verification (Step-by-Step)

```mermaid
flowchart TD
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
    B_VER --> H2["Status: verified -> Handed off to Procurement Staff"]
```

### Detailed Screen & Button Steps:
1. **Login:**
   - Sign in as `officer.demo@bsc.edu.ph`.
2. **Navigate to Queue:**
   - In the left sidebar, **Click:** `[PR Verifications]` (URL: `/officer/pr-verifications`).
   - The queue shows all pending submissions under *"Incoming PRs Awaiting Section 5.1.1 Verification"*.
3. **Open Inspection Modal:**
   - Locate the target PR row.
   - **Click Button:** `[Review & Verify]`.
   - The modal displays PR details, item list, calculated ABC, and category classifications.
   - If a custom PPMP was uploaded, an attachment badge appears: **Click Button:** `[View Uploaded PPMP]` to preview the file.
4. **Officer Decision Gate:**
   - **Path A: Return for Revision (Non-Compliant):**
     - If line items violate category segregation without justification:
     - **Click Button:** `[Return to End-User for Revision]`.
     - In the dropdown, select: `"Mixed item categories detected (Section 5.1.1 Non-compliant)"`.
     - **Click Button:** `[Confirm Return]`.
     - Toast: *"Purchase Request returned to End-User for revision."*
     - The PR status changes to `returned` and alerts the End-User.
   - **Path B: Verify & Clear (Compliant):**
     - If specifications and categories are strictly segregated:
     - Check the required verification box: `[x] "I have verified item specifications and category segregation under Section 5.1.1"`.
     - **Click Button:** `[Verify & Clear PR]`.
     - Toast: *"PR & PPMP package successfully verified under Section 5.1.1. Advanced to Procurement Staff for PMR recording."*
     - Status updates to `verified` / `procurement_review`.
     - **Connector:** The record unlocks in the Procurement Staff workbench.

---

## 3. Procurement Staff PMR Logging & RFQ Canvassing (Step-by-Step)

```mermaid
flowchart TD
    L3["3.1 Staff Login (/login)"] --> PMR["3.2 Open: /staff/pmr-recording"]
    PMR --> B_LOG["3.3 Click: 'Record to PMR' on Verified PR"]
    B_LOG --> CONF_PMR["3.4 Click: 'Confirm PMR Entry' (Auto-populates metadata)"]
    CONF_PMR --> B_RFQ["3.5 Click: 'Prepare RFQ' -> Opens Official Annex D Canvas"]
    B_RFQ --> RFQ_SET["3.6 Set Deadline & Terms (15 Days / Basco Supply Office)"]
    RFQ_SET --> B_GEN["3.7 Click: 'Generate Annex D RFQ'"]
    B_GEN --> B_DIST["3.8 Click: 'Distribute to Suppliers' -> Select 3+ Vendors"]
    B_DIST --> H3["RFQ Status: canvass -> Dispatched to Commercial Market"]
```

### Detailed Screen & Button Steps:
1. **Login:**
   - Sign in as `staff.demo@bsc.edu.ph`.
2. **Navigate to PMR Recording Workbench:**
   - In sidebar, **Click:** `[PMR Recording]` (URL: `/staff/pmr-recording`).
   - The table shows verified PRs ready for registry. Note: unverified PRs are blocked.
3. **Log to PMR:**
   - Locate the verified PR.
   - **Click Button:** `[Record to PMR]`.
   - The dialog automatically populates PR number, requisition date, requesting department, and ABC.
   - **Click Button:** `[Confirm PMR Entry]`.
   - System registers the tracking code and updates the PMR master spreadsheet.
4. **Generate Official Annex D Request for Quotation (RFQ):**
   - On the same row, **Click Button:** `[Prepare RFQ]`.
   - The system opens the **Official Annex D RFQ Canvas** (`OfficialRfqCanvas.tsx`).
   - System assigns official sequential code: `RFQ-2026-XXXX`.
   - Set Canvass Deadline: Select date (7 calendar days forward) and time (5:00 PM).
   - Set Delivery Terms: *"15 Calendar Days upon receipt of PO"*, Place of Delivery: *"BSC Supply Office"*.
   - **Click Button:** `[Generate Annex D RFQ]`.
   - Optional: **Click Button:** `[Print Official RFQ]` to download or preview the A4 PDF format.
5. **Dispatch RFQ to Commercial Suppliers:**
   - **Click Button:** `[Distribute RFQ to Suppliers]`.
   - Select at least three (3) accredited vendors from the registry checklist.
   - **Click Button:** `[Dispatch Invitations]`.
   - Toast: *"RFQ successfully dispatched. Market canvassing initiated."*
   - Status updates to `rfq` / `canvass`.
   - **Connector:** The procurement advances to quotation collection and electronic posting.

---

## 4. RFQ Retrieval & PhilGEPS Posting Guard (Procurement Officer)

```mermaid
flowchart TD
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
    TX_CONF --> H4["Status: Transmitted to BAC Secretariat"]
```

### Detailed Screen & Button Steps:
1. **Navigate to RFQ Workbench:**
   - Procurement Officer navigates to `/officer/rfqs` (RFQ Distribution & Retrieval).
2. **Log Supplier Quotations:**
   - As sealed vendor envelopes are opened, for each vendor:
   - **Click Button:** `[+ Record Supplier Quotation]`.
   - Select Supplier $\rightarrow$ enter Quoted Total Amount (e.g. *₱82,500.00*) $\rightarrow$ enter Delivery Days (e.g. *10 days*) $\rightarrow$ toggle Compliance Statement: `[Compliant]`.
   - **Click Button:** `[Save Quotation]`. Repeat until all 3 quotations are recorded.
3. **PhilGEPS Statutory Posting Guard (RA 12009 Article III):**
   - The system checks if the PR ABC exceeds **₱50,000.00**.
   - *If ABC > ₱50,000 and PhilGEPS is unrecorded:*
     - The transmittal button is blocked with an amber alert:
       > *"RA 12009 (NGPA) Article III / PhilGEPS Electronic Posting Compliance Guard"*
     - **Click Button:** `[Document PhilGEPS Posting Reference Now]`.
     - Dialog opens: Enter PhilGEPS Reference Number (e.g. `PHILGEPS-2026-88192`), Posting Date, and Closing Date.
     - **Click Button:** `[Save PhilGEPS Reference]`.
     - Toast: *"PhilGEPS electronic posting reference logged successfully."*
4. **Transmit to BAC Secretariat:**
   - Once all 3 quotes and PhilGEPS (if applicable) are complete:
   - **Click Button:** `[Transmit RFQ Package to BAC]`.
   - Dialog opens: Confirm recipient office (*"Bids and Awards Committee Secretariat"*).
   - **Click Button:** `[Confirm Transmittal]`.
   - System assigns sequential transmittal tracking slip: `BAC-T-2026-XXXXXXX`.
   - **Connector:** The complete quotation dossier is handed off to the BAC Secretariat.

---

## 5. BAC Abstract of Canvass & MEARB Best Value Evaluation (Step-by-Step)

```mermaid
flowchart TD
    L5["5.1 BAC Login (/login)"] --> WF["5.2 Open: /workflow (BAC Workspace)"]
    WF --> B_AOQ["5.3 Click: 'Generate Abstract of Canvass (AOQ)'"]
    B_AOQ --> CANV["5.4 View Multi-Bidder Matrix vs ABC (Annex F Canvas)"]
    CANV --> B_MCDM["5.5 Click: 'Calculate MCDM Best Value'"]
    B_MCDM --> SCOR["5.6 System executes MEARB Scorecard (60% Price + 20% Deliv + 20% Comp)"]
    SCOR --> RES["5.7 Click: 'Draft BAC Resolution Recommending Award'"]
    RES --> SIGN_BAC["5.8 BAC Chairperson & Members Apply Digital Signatures"]
    SIGN_BAC --> B_SUB_HOPE["5.9 Click: 'Submit Resolution to HoPE for Executive Approval'"]
    B_SUB_HOPE --> H5["Status: approval_review (Handed off to HoPE)"]
```

### Detailed Screen & Button Steps:
1. **Login:**
   - Sign in as `bac.demo@bsc.edu.ph` (BAC Secretariat / Member).
2. **Navigate to BAC Workspace:**
   - In sidebar, **Click:** `[Workflow / Canvassing]` (URL: `/workflow`).
   - Under *"Transmitted RFQ Packages"*, locate the transmitted package.
3. **Generate Official Abstract of Quotations (AOQ):**
   - **Click Button:** `[Generate Abstract of Canvass]`.
   - The screen opens the **Official Annex F Abstract of Canvass Canvas** (`OfficialAbstractOfCanvassCanvas.tsx`).
   - The canvas renders a multi-column comparative grid:
     - Supplier 1 vs. Supplier 2 vs. Supplier 3.
     - Evaluates each line item bid against ABC threshold.
     - Identifies the nominal Lowest Calculated Bidder (LCB).
   - **Click Button:** `[Save Official Abstract]`.
4. **Execute MEARB Best Value Recommendation Engine (RA 12009 Article V):**
   - In the decision support section, **Click Button:** `[Calculate MCDM Best Value]`.
   - The algorithm executes:
     $$\text{Price Score (60\%)} = \left(\frac{\text{Lowest Price}}{\text{Quote Price}}\right) \times 60$$
     $$\text{Delivery Score (20\%)} = \left(\frac{\text{Fastest Days}}{\text{Quote Days}}\right) \times 20$$
     $$\text{Compliance Score (20\%)} = 20$$
   - A scorecard leaderboard appears ranking bidders by composite score.
   - Highlights the **Lowest Calculated and Responsive Bidder (LCRB / MEARB)**.
5. **Draft & Sign BAC Resolution:**
   - **Click Button:** `[Draft BAC Resolution]`.
   - Resolution text auto-populates recommending award to the highest-scoring compliant vendor.
   - Participating BAC members check the approval box and apply digital sign-off.
6. **Submit to HoPE:**
   - **Click Button:** `[Submit Resolution to HoPE for Executive Approval]`.
   - Toast: *"BAC Resolution and Abstract submitted to Head of Procuring Entity."*
   - Status updates to `approval_review`.
   - **Connector:** The package advances to the College President / HoPE.

---

## 6. Head of Procuring Entity (HoPE) Executive Award Approval (Step-by-Step)

```mermaid
flowchart TD
    L6["6.1 HoPE Login (/login)"] --> APP_PG["6.2 Open: /approvals"]
    APP_PG --> B_REV["6.3 Click: 'Review Package' on Pending Award"]
    B_REV --> MOD_EXP["6.4 Inspect AOQ Matrix, MCDM Rationale & BAC Resolution"]
    MOD_EXP --> DEC3{"6.5 Executive Decision Gate"}
    DEC3 -- "Disapprove / Questions" --> B_RET_BAC["Click: 'Return to BAC with Remarks'"]
    B_RET_BAC --> H_BAC["Returns to BAC for Re-evaluation"]
    DEC3 -- "Approve Award" --> B_APP_HOPE["Click: 'Approve Award Recommendation'"]
    B_APP_HOPE --> REM_APP["Enter Approval Remarks & Conforme"]
    REM_APP --> CONF_APP["Click: 'Confirm Executive Approval'"]
    CONF_APP --> H6["Status: approved -> Notice of Award (NOA) Cleared"]
```

### Detailed Screen & Button Steps:
1. **Login:**
   - Sign in as `hope.demo@bsc.edu.ph` (College President / Head of Procuring Entity).
2. **Navigate to Approvals:**
   - In sidebar, **Click:** `[Approvals]` (URL: `/approvals`).
   - Under *"Pending Administrative Reviews"*, view the BAC Resolution item.
3. **Review Dossier:**
   - **Click Button:** `[Review Package]`.
   - HoPE inspects the Abstract of Canvass, supplier quotation breakdown, BAC Committee signatures, and MCDM Best Value score.
4. **Executive Decision:**
   - **Choice A: Return to BAC:**
     - **Click Button:** `[Return to BAC with Remarks]`.
     - Enter reason $\rightarrow$ Click `[Confirm Return]`.
   - **Choice B: Approve Award:**
     - **Click Button:** `[Approve Award Recommendation]`.
     - In the confirmation dialog, enter official remarks:
       `"Approved for contract issuance and PO generation per RA 12009 (NGPA)."`
     - **Click Button:** `[Confirm Executive Approval]`.
     - Toast: *"Executive Award Approval granted. Notice of Award (NOA) cleared."*
     - Status updates to `approved`.
     - **Connector:** Handed off to Budget Officer for fund obligation and Procurement Officer for PO issuance.

---

## 7. Budget Officer Allotment Obligation (Step-by-Step)

```mermaid
flowchart TD
    L7["7.1 Budget Officer Login (/login)"] --> BUD_PG["7.2 Open: /budgets"]
    BUD_PG --> B_OBR["7.3 Locate Approved PR in 'Pending Obligation' Queue"]
    B_OBR --> VER_BAL["7.4 Verify Remaining Budget Balance >= Awarded Contract Sum"]
    VER_BAL --> B_OBLIG["7.5 Click: 'Certify Budget Availability & Obligate'"]
    B_OBLIG --> OBR_IN["7.6 Enter Obligation Request (ObR) Number & Fund Cluster"]
    OBR_IN --> CONF_OBR["7.7 Click: 'Confirm Obligation'"]
    CONF_OBR --> H7["Funds Committed -> Unlocks Purchase Order Release"]
```

### Detailed Screen & Button Steps:
1. **Login:**
   - Sign in as `budget.demo@bsc.edu.ph`.
2. **Navigate to Budget Management:**
   - In sidebar, **Click:** `[Budgets & Allotments]` (URL: `/budgets`).
3. **Obligate Funds:**
   - Under *"Approved Contracts Awaiting Obligation"*, find the awarded PR.
   - The card displays Allotment vs. Committed vs. Net Balance.
   - **Click Button:** `[Certify Budget Availability & Obligate]`.
   - Modal opens: Enter ObR Number (e.g. `OBR-2026-04-0012`).
   - **Click Button:** `[Confirm Obligation]`.
   - Toast: *"Budget obligation certified. Funds encumbered for Purchase Order."*
   - **Connector:** Procurement Officer receives authorization to issue the Purchase Order.

---

## 8. Purchase Order Issuance, Delivery Inspection & Performance Close-Out

```mermaid
flowchart TD
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
    PMR_CLS --> H8["Status: closed -> Prices committed to Forecasting Engine"]
```

### Detailed Screen & Button Steps:
1. **Generate Purchase Order (Appendix 61):**
   - Procurement Officer navigates to `/purchase-orders`.
   - On the approved package row, **Click Button:** `[Create Purchase Order]`.
   - The system opens the **Appendix 61 Purchase Order Canvas** (`purchase_order`).
   - Auto-populates: Awarded Supplier name, Address, TIN, PhilGEPS number, Item Specifications, Contract Amount in Words, and Delivery/Payment Terms.
   - **Click Button:** `[Issue & Serve Purchase Order]`.
   - System assigns official PO number: `PO-2026-XXXX`.
   - Status updates to `po_issued`.
2. **Delivery Receipt & Inspection (IAR):**
   - When the supplier delivers goods to Batanes State College:
   - Navigate to `/officer/delivery-monitoring`.
   - **Click Button:** `[Record Delivery Receipt]`.
   - Modal opens:
     - Enter Delivery Receipt (DR) Number.
     - Select Delivery Status: `[Complete Delivery]`.
     - Check: `[x] "Inspection and Acceptance Report (IAR) Approved - All items conform to specifications"`.
   - **Click Button:** `[Confirm Delivery Record]`.
   - Toast: *"Delivery receipt logged. Turnaround cycle time calculated."*
   - Status updates to `delivered`.
3. **Supplier Performance Evaluation Scorecard:**
   - In sidebar, **Click:** `[Supplier Evaluations]` (URL: `/supplier-evaluations`).
   - **Click Button:** `[+ Rate Supplier Performance]`.
   - Select the completed PO and supplier.
   - Rate the 4 standard rubrics (1 to 5 scale):
     - Quality Score (1–5)
     - Timeliness Score (1–5)
     - Price Competitiveness Score (1–5)
     - Compliance & Communication Score (1–5)
   - **Click Button:** `[Submit Evaluation & Sign]`.
   - Toast: *"Supplier performance rating recorded. Registry scorecard updated."*
4. **PMR Close-Out & Forecasting Ingestion:**
   - Navigate to `/pmr` (PMR Registry).
   - Locate the delivered contract.
   - **Click Button:** `[Finalize & Close PMR Record]`.
   - System sets status to `closed` / `pmr_logged`.
   - **Automatic Forecasting Feed:** The final unit prices are automatically committed to the `historicalPrices` table.
   - Navigating to `/officer/forecast` immediately renders the updated historical price trajectory and linear regression forecast line chart.

---

## 9. Comprehensive Button & Action Master Table

| Role | Screen | Action Trigger (Button / Checkbox) | Mandatory Pre-Conditions | System Effect / Next State |
| :--- | :--- | :--- | :--- | :--- |
| **End-User** | `/workspace` | `[+ Create Purchase Request]` | Authenticated End-User | Opens PR creation drawer |
| **End-User** | Drawer | `[Upload / Register PPMP]` | File $\le 14$MB attached | Creates `appPpmpEntry` record |
| **End-User** | Drawer | `[x] "I acknowledge mixed categories..."`| Mixed categories detected | Unlocks package forwarding |
| **End-User** | Pre-Canvass | `[+ Add Supplier Quotation]` | Valid vendor & price $>0$ | Adds quote candidate to count |
| **End-User** | Drawer | `[Forward Package to Procurement]` | $\ge 3$ valid quotes attached | Status: `procurement_review` |
| **Officer** | `/officer/pr-verifications` | `[Review & Verify]` | Package in queue | Opens Officer verification modal |
| **Officer** | Modal | `[Return to End-User for Revision]` | Rejection remarks entered | Status: `returned` |
| **Officer** | Modal | `[Verify & Clear PR]` | Section 5.1.1 box checked | Status: `verified` |
| **Staff** | `/staff/pmr-recording` | `[Record to PMR]` | PR status is `verified` | Creates master PMR row |
| **Staff** | `/staff/pmr-recording` | `[Generate Annex D RFQ]` | PMR entry exists | Creates `rfq` record (Annex D) |
| **Staff** | Workbench | `[Distribute RFQ to Suppliers]` | $\ge 3$ vendors selected | Status: `rfq` / `canvass` |
| **Officer** | `/officer/rfqs` | `[Document PhilGEPS Reference]` | ABC $> \text{₱}50,000.00$ | Unlocks transmittal to BAC |
| **Officer** | `/officer/rfqs` | `[Transmit RFQ Package to BAC]` | PhilGEPS check passed | Generates `BAC-T-2026-XXXX` |
| **BAC** | `/workflow` | `[Generate Abstract of Canvass]` | $\ge 3$ quotes received | Generates Annex F AOQ matrix |
| **BAC** | Canvas | `[Calculate MCDM Best Value]` | AOQ generated | Computes MEARB balanced scores |
| **BAC** | Resolution | `[Submit Resolution to HoPE]` | BAC signatures applied | Status: `approval_review` |
| **HoPE** | `/approvals` | `[Approve Award Recommendation]` | BAC Resolution submitted | Status: `approved` (NOA Cleared) |
| **Budget** | `/budgets` | `[Certify Budget Availability]` | Status is `approved` | Encumbers allotment to ObR |
| **Officer** | `/purchase-orders` | `[Create Purchase Order]` | ObR & Award approved | Generates Appendix 61 PO |
| **Officer** | `/purchase-orders` | `[Issue & Serve Purchase Order]` | PO terms finalized | Status: `po_issued` |
| **Officer** | `/officer/delivery-monitoring`| `[Record Delivery Receipt]` | Physical delivery arrived | Status: `delivered` |
| **Officer** | `/supplier-evaluations` | `[Submit Evaluation & Sign]` | Delivery inspected | Updates vendor scorecard (1–5) |
| **Staff** | `/pmr` | `[Finalize & Close PMR Record]` | Delivery & eval complete | Status: `closed`; feeds forecast |
