# ProcureWise Database Data Dictionary
**System Name:** ProcureWise (Batanes State College Procurement Management System)  
**Database Engine:** PostgreSQL (Supabase)  
**Schema Namespace:** `procurewise`  
**ORM / Data Layer:** Drizzle ORM (`drizzle-orm`)  
**Statutory Framework:** Republic Act No. 12009 (New Government Procurement Act - NGPA)  

---

## Table of Contents
1. [User Management & Institutional Structure](#1-user-management--institutional-structure)
   - `users`
   - `offices`
   - `procurement_signatories`
2. [Budget & Financial Controls](#2-budget--financial-controls)
   - `objects_of_expenditure`
   - `budget_allotments`
3. [Vendor & Supplier Management](#3-vendor--supplier-management)
   - `suppliers`
   - `supplier_tags`
   - `supplier_tag_assignments`
4. [Catalog & Procurement Planning (PPMP)](#4-catalog--procurement-planning-ppmp)
   - `procurement_catalog_items`
   - `procurement_catalog_favorites`
   - `procurement_catalog_saved_items`
   - `app_ppmp_entries`
5. [Requisition Management (Purchase Requests)](#5-requisition-management-purchase-requests)
   - `purchase_requests`
   - `purchase_request_items`
   - `purchase_request_decisions`
6. [Canvassing & Supplier Bidding (RFQ)](#6-canvassing--supplier-bidding-rfq)
   - `rfqs`
   - `rfq_number_assignments`
   - `supplier_quotations`
   - `pre_canvasses`
   - `pre_canvass_quotes`
7. [Evaluation & Best-Value Engine (MEARB / MCDM)](#7-evaluation--best-value-engine-mearb--mcdm)
   - `abstracts_of_canvass`
   - `quotation_abstracts`
   - `best_value_policies`
   - `best_value_policy_criteria`
   - `mcdm_recommendations`
   - `historical_prices`
8. [Contracting, Delivery & Supplier Evaluation](#8-contracting-delivery--supplier-evaluation)
   - `purchase_orders`
   - `delivery_receipts`
   - `supplier_evaluations`
   - `supplier_evaluation_approvals`
9. [Statutory Monitoring, Audit & Governance](#9-statutory-monitoring-audit--governance)
   - `pmr_logs`
   - `pmr_historical_records`
   - `audit_trails`
   - `letters_of_notice`
   - `bac_transmittals`
   - `workflow_notifications`
   - `workflow_corrections`
   - `procurement_documents`
   - `procurement_settings`
   - `form_templates`

---

## 1. User Management & Institutional Structure

### 1.1 `users`
Stores user identity, role-based authorization tiers, and departmental assignments.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique internal surrogate identifier. |
| `openId` | `varchar(64)` | Unique, Not Null | Unique authentication subject ID / Supabase user UID. |
| `name` | `text` | Nullable | Full legal name of the user. |
| `email` | `varchar(320)` | Nullable | Institutional email address (`@bsc.edu.ph`). |
| `loginMethod` | `varchar(64)` | Nullable | Authentication provider (`email`, `oauth`, `session`). |
| `role` | `varchar(64)` | Not Null, Default: `'end_user'` | RBAC tier: `end_user`, `procurement_officer`, `procurement_staff`, `bac`, `hope`, `admin`. |
| `officeName` | `varchar(180)` | Nullable | Name of assigned college office or department. |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Timestamp when user record was provisioned. |
| `updatedAt` | `timestamp` | Not Null, Default: `now()` | Timestamp of last profile update. |
| `lastSignedIn` | `timestamp` | Not Null, Default: `now()` | Timestamp of the most recent authentication session. |

### 1.2 `offices`
Institutional college departments, academic institutes, and administrative units.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique office identifier. |
| `code` | `varchar(32)` | Unique, Not Null | Official departmental code (e.g., `CIT`, `BA`, `SAS`, `ADMIN`). |
| `name` | `varchar(160)` | Not Null | Complete official name of the office/division. |
| `isActive` | `integer` | Not Null, Default: `1` | Operational status flag (`1` = Active, `0` = Inactive). |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Creation timestamp. |

### 1.3 `procurement_signatories`
Official designated signers authorized to endorse requisitions, abstracts, and POs.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique signatory identifier. |
| `fullName` | `varchar(180)` | Not Null | Complete name with academic/professional titles. |
| `designation` | `varchar(160)` | Not Null | Official administrative or committee designation. |
| `mayRequest` | `integer` | Not Null, Default: `0` | Flag authorizing user as requesting signatory (`1` = Yes, `0` = No). |
| `mayApprove` | `integer` | Not Null, Default: `0` | Flag authorizing user as executive approver (`1` = Yes, `0` = No). |
| `isActive` | `integer` | Not Null, Default: `1` | Active status in college roster (`1` = Active). |
| `createdById` | `integer` | FK (`users.id`), Not Null | Administrator who registered the signatory. |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Creation timestamp. |

---

## 2. Budget & Financial Controls

### 2.1 `objects_of_expenditure`
COA-standard chart of accounts classifying supplies, equipment, and capital expenditures.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique expenditure object identifier. |
| `code` | `varchar(32)` | Unique, Not Null | COA object code (e.g., `5-02-03-010` for Office Supplies). |
| `name` | `varchar(180)` | Not Null | Descriptive title of expenditure category. |
| `isActive` | `integer` | Not Null, Default: `1` | Availability indicator (`1` = Active). |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Timestamp of registration. |

### 2.2 `budget_allotments`
Annual fiscal budget ceiling allocated per department and expenditure classification.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique allotment identifier. |
| `officeId` | `integer` | FK (`offices.id`), Not Null | Department assigned to the budget allocation. |
| `objectOfExpenditureId` | `integer` | FK (`objects_of_expenditure.id`), Not Null | Specific expenditure classification. |
| `fiscalYear` | `integer` | Not Null | Applicable budget year (e.g., `2026`). |
| `allottedAmount` | `decimal(14,2)`| Not Null | Total authorized budget appropriation ceiling (₱). |
| `committedAmount` | `decimal(14,2)`| Not Null, Default: `0.00` | Cumulative amount committed by approved PRs/POs (₱). |
| `createdById` | `integer` | FK (`users.id`), Not Null | Budget officer who established the allotment. |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Timestamp of allocation. |
| `updatedAt` | `timestamp` | Not Null, Default: `now()` | Timestamp of last balance modification. |

*Unique Index:* `(officeId, objectOfExpenditureId, fiscalYear)`

---

## 3. Vendor & Supplier Management

### 3.1 `suppliers`
Master registry of prospective and accredited commercial merchants.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique supplier identifier. |
| `supplierCode` | `varchar(40)` | Unique, Not Null | Institutional merchant identifier (e.g., `SUP-2026-001`). |
| `companyName` | `varchar(180)` | Not Null | Registered legal business/corporate name. |
| `contactPerson` | `varchar(140)` | Nullable | Authorized sales or executive representative. |
| `email` | `varchar(320)` | Nullable | Official corporate email address. |
| `phone` | `varchar(80)` | Nullable | Contact landline or mobile number. |
| `address` | `text` | Nullable | Physical business address. |
| `tin` | `varchar(80)` | Nullable | BIR Taxpayer Identification Number. |
| `philgepsRegistrationNumber`| `varchar(120)` | Nullable | PhilGEPS registration number (Red or Platinum). |
| `philgepsRegistrationDate` | `timestamp` | Nullable | Date of PhilGEPS certificate issuance. |
| `philgepsExpirationDate` | `timestamp` | Nullable | Date of PhilGEPS certificate expiration. |
| `offerings` | `text` | Nullable | Summary of product lines and service capabilities. |
| `accreditationStatus` | `varchar(64)` | Not Null, Default: `'pending'` | Status: `pending`, `accredited`, `blacklisted`, `suspended`. |
| `isActive` | `integer` | Not Null, Default: `1` | Active operational status (`1` = Active, `0` = Inactive). |
| `createdById` | `integer` | FK (`users.id`), Not Null | User who encoded the supplier profile. |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Registration timestamp. |

### 3.2 `supplier_tags` & `supplier_tag_assignments`
Classifies vendors into operational sectors (e.g., IT Hardware, Office Supplies, Catering, Construction).

| Table | Column Name | Data Type | Constraints | Description |
|---|---|---|---|---|
| `supplier_tags` | `id` | `integer` | PK, Identity, Not Null | Unique tag identifier. |
| `supplier_tags` | `name` | `varchar(120)` | Unique, Not Null | Category tag name. |
| `supplier_tags` | `description` | `varchar(320)` | Nullable | Scope description of the business tag. |
| `supplier_tag_assignments` | `supplierId` | `integer` | FK (`suppliers.id`), Not Null | Associated supplier reference. |
| `supplier_tag_assignments` | `supplierTagId`| `integer` | FK (`supplier_tags.id`), Not Null | Associated tag reference. |

---

## 4. Catalog & Procurement Planning (PPMP)

### 4.1 `procurement_catalog_items`
Standardized catalog of common-use and non-common supplies with benchmark reference costs.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique item identifier. |
| `source` | `varchar(80)` | Not Null | Catalog origin (e.g., `PS-DBM Common-use`, `Institutional`). |
| `productCode` | `varchar(80)` | Unique, Not Null | Institutional SKU or PS-DBM item code. |
| `description` | `text` | Not Null | Detailed specifications of the good or item. |
| `unit` | `varchar(40)` | Nullable | Standard unit of issue (e.g., `box`, `piece`, `ream`, `lot`). |
| `referencePrice` | `decimal(14,2)`| Not Null | Benchmark historical reference price (₱). |
| `remarks` | `text` | Nullable | Notes on technical parameters or minimum specifications. |
| `sourceAsOfDate` | `varchar(40)` | Not Null, Default: `'2026-08-17'` | Effective date of catalog pricing. |
| `isActive` | `integer` | Not Null, Default: `1` | Catalog availability (`1` = Available). |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Record creation timestamp. |

### 4.2 `app_ppmp_entries`
Project Procurement Management Plan entries detailing annual departmental procurement schedules.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique PPMP item identifier. |
| `fiscalYear` | `integer` | Not Null | Fiscal planning year (e.g., `2026`). |
| `officeId` | `integer` | FK (`offices.id`), Not Null | Requesting college department. |
| `objectOfExpenditureId` | `integer` | FK (`objects_of_expenditure.id`), Not Null | Budget chart of account. |
| `catalogItemId` | `integer` | FK (`procurement_catalog_items.id`), Nullable | Reference catalog item (if standardized). |
| `description` | `text` | Not Null | General description of project/materials. |
| `papCode` | `varchar(80)` | Nullable | Program/Activity/Project (PAP) classification. |
| `projectTitle` | `varchar(220)` | Nullable | Descriptive name of the procurement project. |
| `modeOfProcurement` | `varchar(120)` | Default: `'Small Value Procurement'` | RA 12009 modality (e.g., `SVP`, `Shopping`). |
| `fundSource` | `varchar(160)` | Nullable | Fund source (e.g., `GAA`, `Income`, `Fiducial`). |
| `plannedAmount` | `decimal(14,2)`| Not Null | Total estimated expenditure budgeted for item (₱). |
| `actualAmount` | `decimal(14,2)`| Not Null, Default: `0.00` | Actual disbursed or obligated amount (₱). |
| `status` | `varchar(64)` | Not Null, Default: `'draft'` | Lifecycle status (`draft`, `submitted`, `approved`, `consolidated`). |
| `preparedById` | `integer` | FK (`users.id`), Not Null | Faculty or staff who drafted the plan. |

---

## 5. Requisition Management (Purchase Requests)

### 5.1 `purchase_requests`
Primary electronic requisition document initiating procurement actions.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique internal requisition record ID. |
| `prNumber` | `varchar(40)` | Unique, Not Null | Official statutory PR tracking number (e.g., `PR-2026-09-0012`). |
| `purpose` | `text` | Not Null | Explicit administrative justification for requisition. |
| `fundSource` | `varchar(160)` | Nullable | Source of appropriation (GAA, STF, Trust Fund). |
| `entityName` | `varchar(180)` | Not Null, Default: `'Batanes State College'` | Procuring entity name. |
| `fundCluster` | `varchar(80)` | Not Null, Default: `'01101101'` | Regular Agency Fund Cluster code. |
| `responsibilityCenterCode`| `varchar(80)` | Nullable | Office organizational cost center code. |
| `officeId` | `integer` | FK (`offices.id`), Not Null | Requesting college division or department. |
| `objectOfExpenditureId` | `integer` | FK (`objects_of_expenditure.id`), Not Null | Classification of expense. |
| `totalEstimate` | `decimal(14,2)`| Not Null | Approved Budget for the Contract (ABC) ceiling (₱). |
| `status` | `varchar(64)` | Not Null, Default: `'draft'` | Current status in lifecycle state machine. |
| `trackingToken` | `varchar(48)` | Unique, Not Null | Secure tracking token for public/external progress queries. |
| `ppmpEntryId` | `integer` | FK (`app_ppmp_entries.id`), Nullable | Corresponding approved PPMP entry. |
| `requestedById` | `integer` | FK (`users.id`), Not Null | User account who submitted the requisition. |
| `assignedOfficerId` | `integer` | FK (`users.id`), Nullable | Procurement officer assigned to manage canvassing. |
| `submittedAt` | `timestamp` | Nullable | Timestamp when moved from draft to active submission. |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Record creation timestamp. |
| `updatedAt` | `timestamp` | Not Null, Default: `now()` | Record modification timestamp. |

### 5.2 `purchase_request_items`
Itemized line entries constituting a Purchase Request.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique line item identifier. |
| `purchaseRequestId` | `integer` | FK (`purchase_requests.id`), Not Null | Parent purchase request reference (Cascading delete). |
| `catalogItemId` | `integer` | FK (`procurement_catalog_items.id`), Nullable | Reference catalog product ID. |
| `description` | `text` | Not Null | Item technical specifications and description. |
| `stockPropertyNo` | `varchar(80)` | Nullable | Property ledger tracking number. |
| `specification` | `text` | Nullable | Detailed performance parameters or brand-free specifications. |
| `quantity` | `decimal(12,2)`| Not Null | Requisition volume/quantity required. |
| `unit` | `varchar(40)` | Not Null | Unit of measurement (`unit`, `pack`, `ream`, `set`). |
| `estimatedUnitCost` | `decimal(14,2)`| Not Null | Unit price ceiling based on market index (₱). |
| `totalCost` | `decimal(14,2)`| Not Null | Calculated line ceiling (`quantity * estimatedUnitCost`) (₱). |

### 5.3 `purchase_request_decisions`
Audit trail of milestone approval decisions across officer, budget, and BAC gates.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique decision record identifier. |
| `purchaseRequestId` | `integer` | FK (`purchase_requests.id`), Not Null | Associated purchase request. |
| `decisionType` | `varchar(64)` | Not Null | Action type: `verified`, `returned`, `rejected`, `recommended`. |
| `fromStatus` | `varchar(64)` | Not Null | Previous lifecycle status before decision. |
| `toStatus` | `varchar(64)` | Not Null | Resulting lifecycle status after decision. |
| `reason` | `text` | Not Null | Justification or legal reason for the decision. |
| `performedById` | `integer` | FK (`users.id`), Not Null | Official who made the decision. |
| `performedByRole` | `varchar(64)` | Not Null | Role acting during decision execution. |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Timestamp of action. |

---

## 6. Canvassing & Supplier Bidding (RFQ)

### 6.1 `rfqs`
Request for Quotation document package released to accredited merchants.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique RFQ identifier. |
| `rfqNumber` | `varchar(40)` | Unique, Not Null | Official statutory RFQ tracking number (e.g., `RFQ-2026-0042`). |
| `purchaseRequestId` | `integer` | FK (`purchase_requests.id`), Unique, Not Null | Associated purchase request. |
| `status` | `varchar(64)` | Not Null, Default: `'draft'` | Status: `draft`, `published`, `closed`, `evaluated`. |
| `createdById` | `integer` | FK (`users.id`), Not Null | Procurement staff who created the RFQ. |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Generation timestamp. |

### 6.2 `supplier_quotations` & `pre_canvass_quotes`
Formal bids and quotation values submitted by prospective vendors.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique quotation identifier. |
| `rfqId` / `preCanvassId` | `integer` | FK (`rfqs.id` / `pre_canvasses.id`), Not Null | Associated RFQ or Canvass package. |
| `supplierId` | `integer` | FK (`suppliers.id`), Not Null | Quoting merchant reference. |
| `totalPrice` | `decimal(14,2)`| Not Null | Total financial bid submitted by vendor (₱). |
| `deliveryDays` | `integer` | Not Null | Committed calendar delivery lead time (days). |
| `isCompliant` | `integer` | Not Null, Default: `1` | Technical and statutory document compliance (`1` = Compliant). |
| `notes` | `text` | Nullable | Vendor remarks or technical warranty deviations. |
| `submittedAt` | `timestamp` | Not Null, Default: `now()` | Date and time quotation was officially received. |

---

## 7. Evaluation & Best-Value Engine (MEARB / MCDM)

### 7.1 `best_value_policies` & `best_value_policy_criteria`
Configurable statutory weights for the Multi-Criteria Decision-Making (MCDM) evaluation engine.

| Table | Column Name | Data Type | Constraints | Description |
|---|---|---|---|---|
| `best_value_policies` | `id` | `integer` | PK, Identity, Not Null | Policy identifier. |
| `best_value_policies` | `policyCode` | `varchar(64)` | Not Null | Code (e.g., `RA_12009_GOODS_DEFAULT`). |
| `best_value_policies` | `totalWeight` | `decimal(7,2)`| Not Null | Total weight baseline (standard `100.00`). |
| `best_value_policy_criteria` | `criterionKey`| `varchar(80)` | Not Null | Evaluation metric: `price`, `delivery`, `compliance`. |
| `best_value_policy_criteria` | `weight` | `decimal(7,2)`| Not Null | Weight assigned (e.g., `60.00`, `20.00`, `20.00`). |

### 7.2 `mcdm_recommendations`
Stores mathematical scoring results generated by the MEARB recommendation algorithm.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique recommendation identifier. |
| `preCanvassId` | `integer` | FK (`pre_canvasses.id`), Unique, Not Null | Evaluated canvass session. |
| `recommendedSupplierId` | `integer` | FK (`suppliers.id`), Not Null | Winning merchant identified as MEARB. |
| `priceScore` | `decimal(7,2)` | Not Null | Computed price score out of 60 points. |
| `deliveryScore` | `decimal(7,2)` | Not Null | Computed delivery lead-time score out of 20 points. |
| `complianceScore` | `decimal(7,2)` | Not Null | Computed compliance/reliability score out of 20 points. |
| `totalScore` | `decimal(7,2)` | Not Null | Aggregate MEARB score out of 100 points. |
| `rationale` | `text` | Not Null | System-generated mathematical justification summary. |
| `createdById` | `integer` | FK (`users.id`), Not Null | System or evaluator executing the run. |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Execution timestamp. |

### 7.3 `abstracts_of_canvass`
Statutory Abstract of Quotations (AOQ) resolution presented to the BAC.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique abstract identifier. |
| `abstractNumber` | `varchar(40)` | Unique, Not Null | Statutory resolution number (e.g., `AOQ-2026-0038`). |
| `preCanvassId` | `integer` | FK (`pre_canvasses.id`), Unique, Not Null | Evaluated canvass reference. |
| `recommendedSupplierId`| `integer` | FK (`suppliers.id`), Not Null | Merchant awarded the contract. |
| `recommendationReason` | `text` | Not Null | Legal justification under RA 12009 Section 43 (MEARB). |
| `openingDate` | `timestamp` | Not Null, Default: `now()` | Date quotes were opened by BAC. |
| `openingLocation` | `varchar(160)` | Not Null, Default: `'Basco, Batanes'`| Physical/virtual opening venue. |
| `status` | `varchar(64)` | Not Null, Default: `'recommended'`| Status: `recommended`, `approved`, `disapproved`. |
| `decidedById` | `integer` | FK (`users.id`), Nullable | HoPE or BAC Chair approving the award. |
| `decisionRemarks` | `text` | Nullable | Final executive approval notes. |

---

## 8. Contracting, Delivery & Supplier Evaluation

### 8.1 `purchase_orders`
Official binding commercial contract issued to the winning supplier.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique PO identifier. |
| `poNumber` | `varchar(40)` | Unique, Not Null | Statutory contract identifier (e.g., `PO-2026-09-0015`). |
| `purchaseRequestId` | `integer` | FK (`purchase_requests.id`), Unique, Not Null | Source requisition. |
| `supplierId` | `integer` | FK (`suppliers.id`), Not Null | Awarded vendor. |
| `totalAmount` | `decimal(14,2)`| Not Null | Final contracted award value (₱). |
| `placeOfDelivery` | `varchar(220)` | Nullable | Designated delivery site (e.g., `BSC Supply Office, Basco`). |
| `scheduledDeliveryDate` | `timestamp` | Nullable | Contractual delivery deadline. |
| `deliveryTerm` | `varchar(120)` | Default: `'FOB Destination'` | Statutory shipping term. |
| `paymentTerm` | `varchar(160)` | Default: `'15 days upon complete delivery'` | Disbursement timeline. |
| `orsBursNumber` | `varchar(80)` | Nullable | Obligation Request and Status (ORS) tracking number. |
| `authorizedOfficialName`| `varchar(180)` | Nullable | College President (HoPE) signatory name. |
| `chiefAccountantName` | `varchar(180)` | Nullable | Chief Accountant verifying fund availability. |
| `status` | `varchar(64)` | Not Null, Default: `'draft'` | Status: `draft`, `approved`, `served`, `delivered`, `closed`. |
| `approvedById` | `integer` | FK (`users.id`), Nullable | HoPE who approved the contract. |

### 8.2 `delivery_receipts`
Physical inspection and acceptance records for delivered goods.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique delivery receipt ID. |
| `purchaseOrderId` | `integer` | FK (`purchase_orders.id`), Unique, Not Null | Corresponding purchase order. |
| `receiptNumber` | `varchar(40)` | Unique, Not Null | Inspection and Acceptance Report (IAR) number. |
| `deliveredAt` | `timestamp` | Not Null, Default: `now()` | Date goods were physically inspected. |
| `receivedById` | `integer` | FK (`users.id`), Not Null | Inspection/Supply Officer who received the delivery. |
| `deliveryStatus` | `varchar(64)` | Not Null, Default: `'complete'` | Status: `complete`, `partial`, `rejected`. |
| `signatureReference` | `text` | Nullable | Reference token for physical inspection signature. |
| `remarks` | `text` | Nullable | Notes on item condition, warranty seals, or missing quantities. |

---

## 9. Statutory Monitoring, Audit & Governance

### 9.1 `audit_trails`
Tamper-resistant cryptographic activity log tracking every data mutation.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique audit entry identifier. |
| `entityType` | `varchar(64)` | Not Null | Target table/entity (`purchase_request`, `rfq`, `po`, etc.). |
| `entityId` | `integer` | Not Null | ID of target entity record. |
| `action` | `varchar(100)` | Not Null | Action code (e.g., `CREATE_PR`, `SUBMIT_QUOTE`, `APPROVE_AWARD`). |
| `performedById` | `integer` | FK (`users.id`), Not Null | Actor performing the operation. |
| `performedByRole` | `varchar(64)` | Not Null | RBAC role active at time of execution. |
| `details` | `json` | Nullable | JSON payload containing old vs new values or state diff. |
| `createdAt` | `timestamp` | Not Null, Default: `now()` | Immutable timestamp of event. |

### 9.2 `pmr_logs` & `pmr_historical_records`
Statutory GPPB Procurement Monitoring Report data store.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `integer` | PK, Identity, Not Null | Unique PMR log record ID. |
| `purchaseOrderId` | `integer` | FK (`purchase_orders.id`), Unique, Not Null | Completed procurement transaction. |
| `pmrNumber` | `varchar(40)` | Unique, Not Null | GPPB PMR line reference code. |
| `remarks` | `text` | Nullable | Statutory compliance remarks. |
| `loggedById` | `integer` | FK (`users.id`), Not Null | Officer certifying the PMR entry. |
| `loggedAt` | `timestamp` | Not Null, Default: `now()` | Logging timestamp. |

---
*Generated directly from active Drizzle ORM schema specifications (`drizzle/schema.ts`).*
