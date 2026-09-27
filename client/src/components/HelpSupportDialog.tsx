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
  ExternalLink,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  LifeBuoy,
  Phone,
  ShieldCheck,
} from "lucide-react";

interface HelpSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpSupportDialog({ open, onOpenChange }: HelpSupportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border border-border bg-card p-6">
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
                Institutional procurement governance, Procedure 5 manuals, and technical assistance.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-5 text-xs text-foreground">
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
              Mixed categories must be returned to the End-User for revision prior to PMR recording.
            </p>
          </div>

          {/* Procedure 5 Workflow Gates */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-slate-500">
              Procurement Officer Mandated Lifecycle Duties
            </h4>
            <div className="divide-y divide-border rounded-xl border border-border bg-muted/30 overflow-hidden text-[11px]">
              <div className="p-2.5 flex items-start gap-2">
                <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.1</span>
                <div>
                  <p className="font-semibold text-foreground">Receive and Verify PR &amp; PPMP</p>
                  <p className="text-muted-foreground text-[10px]">Administrative verification and clearance before handoff to Staff.</p>
                </div>
              </div>
              <div className="p-2.5 flex items-start gap-2">
                <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.3</span>
                <div>
                  <p className="font-semibold text-foreground">Distribute &amp; Retrieve RFQ / Transmit to BAC</p>
                  <p className="text-muted-foreground text-[10px]">Distribute canvass documents to suppliers and formally transmit to BAC Secretariat.</p>
                </div>
              </div>
              <div className="p-2.5 flex items-start gap-2">
                <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.4</span>
                <div>
                  <p className="font-semibold text-foreground">PhilGEPS Posting Verification</p>
                  <p className="text-muted-foreground text-[10px]">Document and log PhilGEPS reference numbers and posting milestones.</p>
                </div>
              </div>
              <div className="p-2.5 flex items-start gap-2">
                <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.7</span>
                <div>
                  <p className="font-semibold text-foreground">Serve Letter of Notice &amp; Release Purchase Orders</p>
                  <p className="text-muted-foreground text-[10px]">Formally serve notices and release approved POs to winning suppliers.</p>
                </div>
              </div>
              <div className="p-2.5 flex items-start gap-2">
                <span className="font-mono font-bold text-[#881337] dark:text-[#fda4af]">5.9</span>
                <div>
                  <p className="font-semibold text-foreground">Delivery &amp; Inspection Monitoring (IAR)</p>
                  <p className="text-muted-foreground text-[10px]">Track supplier delivery timelines and log Inspection &amp; Acceptance Report milestones.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Contact Points */}
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <h4 className="font-bold text-foreground text-xs">Technical &amp; Administrative Contacts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Procurement Management Office</p>
                <p>Batanes State College — Main Campus</p>
                <p>Email: procurement@bsc.edu.ph</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">BAC Secretariat</p>
                <p>Bids and Awards Committee Office</p>
                <p>Email: bac@bsc.edu.ph</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-5 flex items-center justify-between sm:justify-between">
          <span className="text-[10px] text-muted-foreground">ProcureWise v1.0 · Republic Act 9184 Compliant</span>
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
