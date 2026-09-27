import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  LifeBuoy,
  Mail,
  Phone,
  Scale,
  Send,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

interface HelpSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "manuals" | "guidelines" | "ticket";

export function HelpSupportDialog({ open, onOpenChange }: HelpSupportDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>("manuals");

  // Support ticket form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("system");
  const [ticketPriority, setTicketPriority] = useState("normal");
  const [ticketDescription, setTicketDescription] = useState("");
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Please fill in both the subject and inquiry description.");
      return;
    }

    const ticketId = `PW-TICK-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTicketId(ticketId);
    toast.success(`Support ticket ${ticketId} created successfully! Our PMO team will respond within 24 hours.`);
  };

  const handleResetTicketForm = () => {
    setSubmittedTicketId(null);
    setTicketSubject("");
    setTicketDescription("");
    setTicketCategory("system");
    setTicketPriority("normal");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto border border-border bg-card p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#881337]/10 dark:bg-[#881337]/25 text-[#881337] dark:text-[#fda4af]">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                ProcureWise Help &amp; Support Center
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Procedure manuals, Republic Act 9184 guidelines, and institutional support tickets.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mt-2 space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab("manuals")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "manuals"
                ? "border-[#881337] text-[#881337] dark:border-[#fda4af] dark:text-[#fda4af]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>User Manuals</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guidelines")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "guidelines"
                ? "border-[#881337] text-[#881337] dark:border-[#fda4af] dark:text-[#fda4af]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>RA 9184 Guidelines</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ticket")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "ticket"
                ? "border-[#881337] text-[#881337] dark:border-[#fda4af] dark:text-[#fda4af]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Support Tickets</span>
          </button>
        </div>

        {/* TAB 1: USER MANUALS */}
        {activeTab === "manuals" && (
          <div className="mt-4 space-y-4 text-xs text-foreground">
            {/* Section 5.1.1 Quick Reference */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <h4 className="font-bold text-amber-950 dark:text-amber-200 text-xs">
                  Section 5.1.1 Category Segregation Rule
                </h4>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                The Procurement Officer verifies specifications to ensure items are strictly segregated into distinct requests across the 5 mandated commodity groups:
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 pt-1 text-[11px]">
                <span className="rounded bg-amber-100/80 dark:bg-amber-900/40 px-2 py-1 font-medium text-amber-900 dark:text-amber-300">
                  1. Office Supplies
                </span>
                <span className="rounded bg-amber-100/80 dark:bg-amber-900/40 px-2 py-1 font-medium text-amber-900 dark:text-amber-300">
                  2. Hardware Supplies
                </span>
                <span className="rounded bg-amber-100/80 dark:bg-amber-900/40 px-2 py-1 font-medium text-amber-900 dark:text-amber-300">
                  3. ICT Supplies
                </span>
                <span className="rounded bg-amber-100/80 dark:bg-amber-900/40 px-2 py-1 font-medium text-amber-900 dark:text-amber-300">
                  4. Printing Services
                </span>
                <span className="rounded bg-amber-100/80 dark:bg-amber-900/40 px-2 py-1 font-medium text-amber-900 dark:text-amber-300">
                  5. Food Ingredients
                </span>
              </div>
              <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 italic pt-1">
                Mixed categories must be returned to the End-User for Section 5.1.1 revision prior to PMR recording.
              </p>
            </div>

            {/* Procedure 5 Workflow Duties */}
            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-slate-500">
                Official Procedure 5 Workflow Stages
              </h4>
              <div className="divide-y divide-border rounded-xl border border-border bg-muted/30 overflow-hidden text-[11px]">
                <div className="p-2.5 flex items-start gap-2">
                  <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.1</span>
                  <div>
                    <p className="font-semibold text-foreground">End-User PR Preparation &amp; Officer Verification</p>
                    <p className="text-muted-foreground text-[10px]">End-User prepares PR from approved PPMP. Procurement Officer verifies items and category segregation.</p>
                  </div>
                </div>
                <div className="p-2.5 flex items-start gap-2">
                  <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.2</span>
                  <div>
                    <p className="font-semibold text-foreground">Procurement Staff PMR Recording</p>
                    <p className="text-muted-foreground text-[10px]">Staff logs verified PRs into the Procurement Monitoring Report registry with official tracking numbers.</p>
                  </div>
                </div>
                <div className="p-2.5 flex items-start gap-2">
                  <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.3</span>
                  <div>
                    <p className="font-semibold text-foreground">RFQ Preparation &amp; Distribution</p>
                    <p className="text-muted-foreground text-[10px]">Staff drafts RFQs; Officer distributes to canvassers/suppliers and transmits quotation packages to BAC.</p>
                  </div>
                </div>
                <div className="p-2.5 flex items-start gap-2">
                  <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.4</span>
                  <div>
                    <p className="font-semibold text-foreground">PhilGEPS Posting Verification</p>
                    <p className="text-muted-foreground text-[10px]">Officer logs PhilGEPS reference numbers and compliance certificates for mandatory posting periods.</p>
                  </div>
                </div>
                <div className="p-2.5 flex items-start gap-2">
                  <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.6</span>
                  <div>
                    <p className="font-semibold text-foreground">BAC Abstract of Quotations (AOQ) &amp; Resolution</p>
                    <p className="text-muted-foreground text-[10px]">BAC reviews canvass quotations, identifies lowest calculated compliant bidder, and recommends award to HoPE.</p>
                  </div>
                </div>
                <div className="p-2.5 flex items-start gap-2">
                  <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.7</span>
                  <div>
                    <p className="font-semibold text-foreground">Purchase Order Drafting, Allotment &amp; Releasing</p>
                    <p className="text-muted-foreground text-[10px]">Staff drafts PO, Budget Officer certifies funds availability, HoPE approves, and Officer serves Notice &amp; releases PO.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RA 9184 GUIDELINES */}
        {activeTab === "guidelines" && (
          <div className="mt-4 space-y-4 text-xs text-foreground">
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                <h4 className="font-bold text-blue-950 dark:text-blue-200 text-xs">
                  R.A. 9184 Revised Implementing Rules and Regulations (IRR)
                </h4>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-900/90 dark:text-blue-200/90">
                All procurement activities of Batanes State College must strictly adhere to the provisions of Republic Act No. 9184 (Government Procurement Reform Act) and its 2016 Revised IRR.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-border p-3.5 space-y-1.5 bg-card">
                <p className="font-semibold text-foreground">Section 48: Alternative Methods of Procurement</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Resort to alternative methods (e.g. Shopping, Small Value Procurement, Direct Contracting) is permitted only in highly exceptional cases provided under Rule XVI to promote economy and efficiency. Splitting of contracts to evade public bidding thresholds is strictly prohibited.
                </p>
              </div>

              <div className="rounded-xl border border-border p-3.5 space-y-1.5 bg-card">
                <p className="font-semibold text-foreground">Section 53.9: Small Value Procurement (SVP)</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  For State Universities and Colleges (SUCs), the threshold for Small Value Procurement is up to Php 1,000,000.00. Quotations from at least three (3) suppliers of known qualifications must be validated, and RFQs with ABC exceeding Php 50,000.00 must be posted on PhilGEPS for at least three (3) calendar days.
                </p>
              </div>

              <div className="rounded-xl border border-border p-3.5 space-y-1.5 bg-card">
                <p className="font-semibold text-foreground">Section 52: Shopping</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Applicable when there is an unforeseen contingency requiring immediate purchase (Sec. 52.1.a, threshold Php 200,000.00) or for procurement of readily available off-the-shelf goods not available in the DBM-PS (Sec. 52.1.b, threshold Php 1,000,000.00).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUPPORT TICKETS */}
        {activeTab === "ticket" && (
          <div className="mt-4 space-y-4 text-xs text-foreground">
            {submittedTicketId ? (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/20 p-5 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Support Ticket Logged Successfully
                  </h4>
                  <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    Your request reference code is{" "}
                    <span className="font-mono font-bold">{submittedTicketId}</span>.
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Our Procurement Management Office and technical helpdesk have received your request. A status update will be sent to your institutional email.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetTicketForm}
                    className="text-xs"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#881337]"
                    >
                      <option value="system">Technical Issue / Bug</option>
                      <option value="section_5_1_1">Section 5.1.1 Category Rule</option>
                      <option value="ra_9184">RA 9184 Compliance Question</option>
                      <option value="access_role">Role Permissions &amp; Office</option>
                      <option value="form_template">Form Template Assistance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#881337]"
                    >
                      <option value="normal">Normal (Routine inquiry)</option>
                      <option value="high">High (Procurement deadline pending)</option>
                      <option value="urgent">Urgent (Workflow blocked)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Subject / Summary
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g., Question regarding PPMP item threshold or PR revision"
                    className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#881337]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Describe your issue, affected PR/RFQ reference numbers, or guidance needed..."
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#881337]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 bg-[#881337] hover:bg-[#70102b] text-white text-xs font-semibold px-4"
                  >
                    <Send className="h-3 w-3 mr-1.5" />
                    Submit Support Ticket
                  </Button>
                </div>
              </form>
            )}

            {/* Institutional Helpdesk Contacts */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5 mt-3">
              <h5 className="font-semibold text-foreground text-[11px]">Direct Support Channels</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#881337] dark:text-[#fda4af]" />
                  <span>procurement@bsc.edu.ph</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#881337] dark:text-[#fda4af]" />
                  <span>BSC PMO Office Local 104</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-5 flex items-center justify-between sm:justify-between border-t border-border pt-3">
          <span className="text-[10px] text-muted-foreground">
            ProcureWise · Help &amp; Support strictly decoupled from notification alerts
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close Guide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
