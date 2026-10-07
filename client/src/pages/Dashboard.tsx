import { useAuth } from "@/_core/hooks/useAuth";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  getEmployeePrStatus,
  normalizeProcurementRole,
} from "../../../shared/procurementRules";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Award,
  Ban,
  BellRing,
  BookOpenCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileEdit,
  FileSpreadsheet,
  FileText,
  Info,
  PartyPopper,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Timer,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

function formatMoney(amount: number | string | null | undefined) {
  const numeric = typeof amount === "number" ? amount : Number(amount ?? 0);
  return `₱${numeric.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getEndUserProgress(status: string) {
  const progress: Record<string, { value: number; label: string; nextStep: string }> = {
    draft: { value: 10, label: "Preparing request", nextStep: "Complete and submit your request." },
    returned: { value: 20, label: "Needs your attention", nextStep: "Review the comments and update your request." },
    procurement_review: { value: 35, label: "Being checked", nextStep: "The Procurement Office is reviewing your request." },
    approval_review: { value: 55, label: "Waiting for approval", nextStep: "Your request is with the approver." },
    budget_review: { value: 55, label: "Waiting for approval", nextStep: "Your request is with the approver." },
    supply_review: { value: 55, label: "Waiting for approval", nextStep: "Your request is with the approver." },
    bac_review: { value: 55, label: "Waiting for approval", nextStep: "Your request is with the approver." },
    approved: { value: 65, label: "Approved", nextStep: "The Procurement Office is preparing the next step." },
    rfq: { value: 75, label: "Supplier quotes being reviewed", nextStep: "The Procurement Office is comparing supplier quotes." },
    po: { value: 82, label: "Purchase order being prepared", nextStep: "The Purchase Order is being prepared." },
    po_issued: { value: 88, label: "Purchase order issued", nextStep: "The supplier is preparing your items." },
    delivered: { value: 95, label: "Delivery recorded", nextStep: "The Procurement Office is completing the final record." },
    pmr_logged: { value: 100, label: "Complete", nextStep: "Your request is complete." },
    closed: { value: 100, label: "Complete", nextStep: "Your request is complete." },
    rejected: { value: 0, label: "Not approved", nextStep: "Open the request to read the reason and guidance." },
    cancelled: { value: 0, label: "Cancelled", nextStep: "Open the request for more information." },
  };
  return progress[status] ?? { value: 35, label: "In progress", nextStep: "The Procurement Office is processing your request." };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const dashboard = trpc.procurement.dashboard.useQuery(undefined, { retry: false });
  const data = dashboard.data;

  const procurementRole = user ? normalizeProcurementRole(user.role) : "end_user";
  const isEndUser = procurementRole === "end_user";
  const isStaff = procurementRole === "procurement_staff";
  const isOfficer = procurementRole === "procurement_officer";

  // Dedicated Procurement Staff Operational Workbench
  if (isStaff) {
    return <ProcurementStaffDashboard data={data} isLoading={dashboard.isLoading} />;
  }

  // Dedicated Procurement Officer Control Center Overview
  if (isOfficer) {
    return <ProcurementOfficerDashboard />;
  }

  // If not End-User, render the Admin Control Center Overview
  if (!isEndUser) {
    return <AdminDashboard data={data} isLoading={dashboard.isLoading} userRole={procurementRole} />;
  }

  // Simple end-user request overview
  return <EndUserPersonalDashboard data={data} isLoading={dashboard.isLoading} user={user} setLocation={setLocation} />;
}

// ============================================================================
// END-USER DEDICATED PERSONAL ANALYTICS & STATUS OVERVIEW
// ============================================================================
function EndUserPersonalDashboard({
  data,
  isLoading,
  user,
  setLocation,
}: {
  data: any;
  isLoading: boolean;
  user: any;
  setLocation: (path: string) => void;
}) {
  const [selectedPrForModal, setSelectedPrForModal] = useState<any | null>(null);
  const [dismissedBannerIds, setDismissedBannerIds] = useState<Record<number, boolean>>({});

  // All PRs returned by the backend for this End-User account
  const userPrs = useMemo(() => {
    return (data?.purchaseRequests ?? []) as Array<{
      id: number;
      prNumber: string;
      purpose: string;
      totalEstimate: string;
      status: string;
      createdAt: string | Date;
      updatedAt?: string | Date;
      rejectionCount?: number;
      latestRejectionReason?: string | null;
      returnCount?: number;
      latestReturnReason?: string | null;
      trackingToken?: string;
    }>;
  }, [data?.purchaseRequests]);

  // 1. Pursued / Active PRs: Total PRs currently ongoing in the procurement pipeline
  const activePrs = useMemo(() => {
    return userPrs.filter(
      (pr) => !["returned", "rejected", "cancelled", "pmr_logged", "closed"].includes(pr.status)
    );
  }, [userPrs]);

  // 2. Returned for Revision: Count of PRs returned needing user correction
  const returnedPrs = useMemo(() => {
    return userPrs.filter((pr) => pr.status === "returned");
  }, [userPrs]);

  // 3. Successful / Completed PRs: Count of fully awarded/completed PRs
  const successfulPrs = useMemo(() => {
    return userPrs.filter((pr) =>
      ["pmr_logged", "closed"].includes(pr.status)
    );
  }, [userPrs]);

  // 4. Rejected / Cancelled: Count of disapproved requests
  const rejectedPrs = useMemo(() => {
    return userPrs.filter((pr) => pr.status === "rejected" || pr.status === "cancelled");
  }, [userPrs]);

  // Find latest PRs in each category for contextual banners
  const sortByLatest = (list: typeof userPrs) => {
    return [...list].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
  };

  const latestReturned = sortByLatest(returnedPrs)[0];
  const latestRejected = sortByLatest(rejectedPrs)[0];
  const latestSuccessful = sortByLatest(successfulPrs)[0];

  // Active banner resolution
  const activeBannerCategory = useMemo<"returned" | "rejected" | "successful" | null>(() => {
    if (latestReturned && !dismissedBannerIds[latestReturned.id]) return "returned";
    if (latestRejected && !dismissedBannerIds[latestRejected.id]) return "rejected";
    if (latestSuccessful && !dismissedBannerIds[latestSuccessful.id]) return "successful";
    return null;
  }, [latestReturned, latestRejected, latestSuccessful, dismissedBannerIds]);

  const activeBannerPr =
    activeBannerCategory === "returned"
      ? latestReturned
      : activeBannerCategory === "rejected"
      ? latestRejected
      : activeBannerCategory === "successful"
      ? latestSuccessful
      : null;

  const sortedPrs = useMemo(() => sortByLatest(userPrs), [userPrs]);

  return (
    <div className="content-shell pb-12">
      {/* Page Header */}
      <PageHeader
        eyebrow="My workspace"
        title="My Purchase Requests"
        description="See where your requests are and whether anything needs your attention."
        action={{
          label: "New Purchase Request",
          onClick: () => setLocation("/purchase-requests?create=1"),
        }}
      />

      {/* Contextual Feedback Banner Section */}
      <section className="mt-6">
        {/* Dynamic Contextual Banner Rendering */}
        {activeBannerCategory === "returned" && activeBannerPr && (
          <div className="relative rounded-lg border border-[#f1d28c] bg-gradient-to-r from-[#fffaf0] via-[#fffbf4] to-[#fffdf9] p-4 shadow-sm dark:border-[#5a431c] dark:from-[#251b0f] dark:to-[#1a232c]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#faeed2] text-[#936418] dark:bg-[#3a2c16] dark:text-[#f4d081]">
                  <FileEdit className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#f9e7be] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#795010] dark:bg-[#493414] dark:text-[#ffd98e]">
                      ACTION REQUIRED
                    </span>
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#2a3442] dark:text-[#f1f5f8]">
                      <FileEdit className="h-4 w-4 shrink-0 text-[#9a6d19]" />
                      Minor adjustments needed: Your PR [{activeBannerPr.prNumber}] was returned for revision.
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-[#5e6a78] dark:text-[#d1dae2]">
                    Check the reviewer comments to update and resubmit.
                    {activeBannerPr.latestReturnReason && (
                      <span className="mt-1 block rounded border border-[#fae5b8] bg-[#fffcf5] p-2 text-xs font-medium text-[#7d5615] dark:border-[#523d1a] dark:bg-[#20180d] dark:text-[#f3cd82]">
                        Reviewer feedback: &ldquo;{activeBannerPr.latestReturnReason}&rdquo;
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <Button
                  size="sm"
                  onClick={() => setSelectedPrForModal(activeBannerPr)}
                  className="h-8 rounded-[4px] bg-[#9a6d19] px-3 text-xs font-semibold text-white hover:bg-[#7e5712] shadow-xs"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Review Comments &amp; Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDismissedBannerIds((prev) => ({ ...prev, [activeBannerPr.id]: true }))}
                  className="h-8 w-8 text-[#8b95a1] hover:text-[#2c3644] dark:text-[#aeb9c4]"
                  title="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeBannerCategory === "rejected" && activeBannerPr && (
          <div className="relative rounded-lg border border-[#f3c8c8] bg-gradient-to-r from-[#fef7f7] via-[#fff9f9] to-[#ffffff] p-4.5 shadow-sm dark:border-[#5e2727] dark:from-[#2a1414] dark:to-[#1a232c]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#fee8e8] text-[#a52a2a] dark:bg-[#431c1c] dark:text-[#fca5a5]">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#fedbdb] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8b1e1e] dark:bg-[#4d1f1f] dark:text-[#fca5a5]">
                      DISAPPROVED / CANCELLED
                    </span>
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#2a3442] dark:text-[#f1f5f8]">
                      <Info className="h-4 w-4 shrink-0 text-[#a52a2a]" />
                      Notice: Your PR [{activeBannerPr.prNumber}] could not proceed.
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-[#5e6a78] dark:text-[#d1dae2]">
                    Please check the BAC remarks for details or consult the Procurement Office before creating a new request.
                    {activeBannerPr.latestRejectionReason && (
                      <span className="mt-1 block rounded border border-[#fbd3d3] bg-[#fffaf9] p-2 text-xs font-medium text-[#932323] dark:border-[#522121] dark:bg-[#201010] dark:text-[#fca5a5]">
                        Committee remarks: &ldquo;{activeBannerPr.latestRejectionReason}&rdquo;
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <Button
                  size="sm"
                  onClick={() => setSelectedPrForModal(activeBannerPr)}
                  className="h-8 rounded-[4px] bg-[#7b1e1e] px-3 text-xs font-semibold text-white hover:bg-[#641818] shadow-xs"
                >
                  <Info className="mr-1.5 h-3.5 w-3.5" />
                  View BAC Remarks
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDismissedBannerIds((prev) => ({ ...prev, [activeBannerPr.id]: true }))}
                  className="h-8 w-8 text-[#8b95a1] hover:text-[#2c3644] dark:text-[#aeb9c4]"
                  title="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeBannerCategory === "successful" && activeBannerPr && (
          <div className="relative rounded-lg border border-[#b2e5cb] bg-gradient-to-r from-[#f0fbf5] via-[#f5fdf9] to-[#ffffff] p-4.5 shadow-sm dark:border-[#225838] dark:from-[#11291b] dark:to-[#1a232c]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#ddf7e8] text-[#136a43] dark:bg-[#1a442b] dark:text-[#86efac]">
                  <PartyPopper className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#c8eed9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0e5c38] dark:bg-[#205335] dark:text-[#86efac]">
                      AWARDED &amp; COMPLETED
                    </span>
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#2a3442] dark:text-[#f1f5f8]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#136a43]" />
                      Great news! Your Purchase Request [{activeBannerPr.prNumber}] has been successfully completed and approved!
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-[#5e6a78] dark:text-[#d1dae2]">
                    The procurement process is complete. Awarded contract estimate:{" "}
                    <span className="font-semibold font-mono text-[#136a43] dark:text-[#86efac]">
                      {formatMoney(activeBannerPr.totalEstimate)}
                    </span>
                    . You can inspect the approved package or follow delivery progress.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <Button
                  size="sm"
                  onClick={() => setSelectedPrForModal(activeBannerPr)}
                  className="h-8 rounded-[4px] bg-[#0f766e] px-3 text-xs font-semibold text-white hover:bg-[#0c5f59] shadow-xs"
                >
                  <Award className="mr-1.5 h-3.5 w-3.5" />
                  View Approval Details
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDismissedBannerIds((prev) => ({ ...prev, [activeBannerPr.id]: true }))}
                  className="h-8 w-8 text-[#8b95a1] hover:text-[#2c3644] dark:text-[#aeb9c4]"
                  title="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Purchase request overview">
        {[
          {
            label: "In Progress",
            value: activePrs.length,
            detail: "Requests being prepared or processed.",
            icon: Activity,
            tone: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
          },
          {
            label: "Needs Your Attention",
            value: returnedPrs.length,
            detail: "Requests returned for your updates.",
            icon: FileEdit,
            tone: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
          },
          {
            label: "Completed",
            value: successfulPrs.length,
            detail: "Requests with final records completed.",
            icon: CheckCircle2,
            tone: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
          },
          {
            label: "Not Approved",
            value: rejectedPrs.length,
            detail: "Requests that were rejected or cancelled.",
            icon: Ban,
            tone: "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40",
          },
        ].map((card) => (
          <div key={card.label} className="flat-panel p-4">
            <div className={`grid h-9 w-9 place-items-center rounded-md ${card.tone}`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-[#202833] dark:text-[#f1f5f8]">
              {isLoading ? "—" : card.value}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#3b4654] dark:text-[#f1f5f8]">{card.label}</p>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">{card.detail}</p>
          </div>
        ))}
      </section>

      {/* PR Register & Table Filter Section */}
      <section className="flat-panel mt-5">
        <div className="border-b border-[#ece8df] px-4 py-4 sm:px-6 dark:border-[#384554]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-[#2c3644] dark:text-[#f1f5f8]">
                  Your requests
                </h3>
              </div>
              <p className="mt-1 text-sm text-[#707c8a] dark:text-[#aeb9c4]">
                Check the progress and open a request for details.
              </p>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#77818d] dark:text-[#aeb9c4]">
            Loading your personal purchase requests...
          </div>
        ) : sortedPrs.length ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">PR Number &amp; Date</th>
                  <th className="px-4 py-3.5">Purpose</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5 text-right">Date</th>
                  <th className="px-4 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedPrs.map((pr) => {
                  const progress = getEndUserProgress(pr.status);
                  const isReturned = pr.status === "returned";
                  const isRejected = pr.status === "rejected" || pr.status === "cancelled";

                  return (
                    <tr
                      key={pr.id}
                      className="hover:bg-accent/40 transition-colors"
                    >
                      {/* Column 1: PR Number + creation date subtitle */}
                      <td className="px-5 py-3">
                        <p className="font-semibold text-primary">{pr.prNumber}</p>
                        {pr.trackingToken && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground" title={`Token: ${pr.trackingToken}`}>
                            {pr.trackingToken.slice(0, 8)}…
                          </p>
                        )}
                      </td>

                      {/* Column 2: Purpose */}
                      <td className="max-w-[320px] px-4 py-3 text-foreground">
                        <p className="line-clamp-2 break-words font-medium leading-snug" title={pr.purpose}>{pr.purpose}</p>
                      </td>

                      {/* Column 3: Plain-language progress and next step */}
                      <td className="min-w-[240px] px-4 py-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-foreground">{progress.label}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">{progress.value}%</span>
                          </div>
                          <Progress
                            value={progress.value}
                            aria-label={`${progress.label}: ${progress.value}% complete`}
                            className="h-2"
                          />
                          <p className="text-xs leading-snug text-muted-foreground">{progress.nextStep}</p>
                        </div>
                      </td>

                      {/* Column 4: Date */}
                      <td className="px-4 py-3 text-right text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(pr.createdAt).toLocaleDateString("en-PH")}
                      </td>

                      {/* Column 5: Action */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPrForModal(pr)}
                          className={`h-7 px-2.5 text-[11px] font-medium ${
                            isReturned
                              ? "border-[#d8a834] bg-[#fffaf0] text-[#8a6520] hover:bg-[#faeed2] dark:border-[#635028] dark:bg-[#251d10] dark:text-[#f0c36a]"
                              : isRejected
                              ? "border-[#e28c8c] bg-[#fff5f5] text-[#932323] hover:bg-[#fedcdc] dark:border-[#6b2525] dark:bg-[#251212] dark:text-[#fca5a5]"
                              : "border-border text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {isReturned ? (
                            <><FileEdit className="mr-1 h-3 w-3" />Revise</>
                          ) : isRejected ? (
                            <><Info className="mr-1 h-3 w-3" />Remarks</>
                          ) : (
                            <><Eye className="mr-1 h-3 w-3" />Details</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <EmptyWorkspace
              eyebrow="My requests"
              title="No Purchase Requests yet"
              description="Create your first request to track its progress here."
            />
          </div>
        )}
      </section>

      {/* 2. Contextual Feedback Modal (Dialog) */}
      {selectedPrForModal && (
        <Dialog open={Boolean(selectedPrForModal)} onOpenChange={(open) => !open && setSelectedPrForModal(null)}>
          <DialogContent className="max-w-xl border-[#dcd7cb] bg-white p-6 dark:border-[#384554] dark:bg-[#1b2229]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {selectedPrForModal.status === "returned" ? (
                  <span className="grid h-7 w-7 place-items-center rounded bg-[#faeed2] text-[#936418] dark:bg-[#3a2c16] dark:text-[#f4d081]">
                    <FileEdit className="h-4 w-4" />
                  </span>
                ) : selectedPrForModal.status === "rejected" || selectedPrForModal.status === "cancelled" ? (
                  <span className="grid h-7 w-7 place-items-center rounded bg-[#fee8e8] text-[#a52a2a] dark:bg-[#431c1c] dark:text-[#fca5a5]">
                    <Ban className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded bg-[#ddf7e8] text-[#136a43] dark:bg-[#1a442b] dark:text-[#86efac]">
                    <PartyPopper className="h-4 w-4" />
                  </span>
                )}
                <div>
                  <DialogTitle className="text-base font-bold text-[#202833] dark:text-[#f1f5f8]">
                    {selectedPrForModal.status === "returned"
                      ? `Revision Requested: ${selectedPrForModal.prNumber}`
                      : selectedPrForModal.status === "rejected" || selectedPrForModal.status === "cancelled"
                      ? `Notice on Disapproval: ${selectedPrForModal.prNumber}`
                      : `Purchase Request Status: ${selectedPrForModal.prNumber}`}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-[#707c8a] dark:text-[#aeb9c4]">
                    {selectedPrForModal.purpose}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-4 text-xs">
              {/* Key PR Metadata Summary — includes Estimated ABC (moved from table) */}
              <div className="grid grid-cols-2 gap-2.5 rounded border border-border bg-muted/30 p-3 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Current Stage:</span>
                  <div className="mt-0.5">
                    <StatusBadge
                      tone={
                        selectedPrForModal.status === "returned"
                          ? "pending"
                          : selectedPrForModal.status === "rejected"
                          ? "returned"
                          : ["approved", "po_issued", "delivered", "closed"].includes(selectedPrForModal.status)
                          ? "approved"
                          : "active"
                      }
                    >
                      {getEmployeePrStatus(selectedPrForModal.status).label.toUpperCase()}
                    </StatusBadge>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Estimated ABC:</span>
                  <p className="mt-0.5 font-mono font-bold text-sm text-foreground">
                    {formatMoney(selectedPrForModal.totalEstimate)}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Date Created:</span>
                  <p className="mt-0.5 font-medium text-foreground">
                    {new Date(selectedPrForModal.createdAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Tracking Token:</span>
                  <p className="mt-0.5 font-mono font-medium text-primary">
                    {selectedPrForModal.trackingToken || "Pending"}
                  </p>
                </div>
              </div>

              {/* Status Explanation from Procurement Rules */}
              <div className="rounded border border-[#e8e2d5] bg-white p-3 dark:border-[#384554] dark:bg-[#1a232c]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b95a1] dark:text-[#aeb9c4]">
                  Workflow Explanation
                </p>
                <p className="mt-1 text-xs leading-5 text-[#465261] dark:text-[#d1dae2]">
                  {getEmployeePrStatus(selectedPrForModal.status).meaning}
                </p>
              </div>

              {/* Contextual Feedback Callout Box */}
              {selectedPrForModal.status === "returned" ? (
                <div className="rounded-md border border-[#f1d28c] bg-[#fffaf0] p-4 text-[#795010] dark:border-[#5a431c] dark:bg-[#251d10] dark:text-[#f4d081]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <FileEdit className="h-4 w-4 text-[#9a6d19]" />
                    <span>Reviewer &amp; Procurement Officer Feedback</span>
                  </div>
                  <p className="mt-2 rounded border border-[#fae5b8] bg-white p-2.5 text-xs font-semibold italic text-[#63430f] dark:border-[#4d3615] dark:bg-[#1a140b] dark:text-[#fcd88b]">
                    &ldquo;{selectedPrForModal.latestReturnReason || "Please adjust the item specifications or provide the required three-supplier preliminary quotation package."}&rdquo;
                  </p>
                  <div className="mt-3 text-[11px] leading-4 text-[#795010] dark:text-[#f4d081]">
                    <p className="font-bold">Next steps for resubmission:</p>
                    <ol className="mt-1 list-decimal list-inside space-y-1">
                      <li>Open the Purchase Request in the PR workspace.</li>
                      <li>Update the requested items or attach the required quotes/justifications.</li>
                      <li>Click &ldquo;Resubmit Package&rdquo; for prioritized procurement review.</li>
                    </ol>
                  </div>
                </div>
              ) : selectedPrForModal.status === "rejected" || selectedPrForModal.status === "cancelled" ? (
                <div className="rounded-md border border-[#f3c8c8] bg-[#fef7f7] p-4 text-[#8b1e1e] dark:border-[#5e2727] dark:bg-[#281313] dark:text-[#fca5a5]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Ban className="h-4 w-4 text-[#a52a2a]" />
                    <span>Official BAC / Committee Remarks</span>
                  </div>
                  <p className="mt-2 rounded border border-[#fbd3d3] bg-white p-2.5 text-xs font-semibold italic text-[#771515] dark:border-[#522121] dark:bg-[#1a0c0c] dark:text-[#fca5a5]">
                    &ldquo;{selectedPrForModal.latestRejectionReason || "The request could not proceed due to budgetary or specification constraints under RA 12009 (NGPA) guidelines."}&rdquo;
                  </p>
                  <div className="mt-3 text-[11px] leading-4 text-[#8b1e1e] dark:text-[#fca5a5]">
                    <p className="font-bold">Guidance &amp; Next Steps:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Review whether your item specifications exceed available PPMP allotment.</li>
                      <li>Consult your department head or the BAC Secretariat for clarifying guidelines.</li>
                      <li>You may prepare a newly adjusted Purchase Request anytime.</li>
                    </ul>
                  </div>
                </div>
              ) : ["approved", "po_issued", "delivered", "closed"].includes(selectedPrForModal.status) ? (
                <div className="rounded-md border border-[#b2e5cb] bg-[#f0fbf5] p-4 text-[#0e5c38] dark:border-[#225838] dark:bg-[#11291b] dark:text-[#86efac]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Award className="h-4 w-4 text-[#136a43]" />
                    <span>Award &amp; Completion Notice</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#136a43] dark:text-[#86efac]">
                    🎉 Congratulations! This Purchase Request has satisfied all procurement governance requirements. The official Purchase Order is in progress or completed, and delivery coordinates with the Supply Office.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-[#cbe1f3] bg-[#f3f9fe] p-4 text-[#20517d] dark:border-[#1e3f5e] dark:bg-[#122436] dark:text-[#93c5fd]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock className="h-4 w-4 text-[#20517d]" />
                    <span>Active Pipeline Routing</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#2c5f8e] dark:text-[#93c5fd]">
                    Your package is actively undergoing verification by authorized signatories and the Procurement Office. You will receive an alert if any clarifications are needed.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-5 gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setSelectedPrForModal(null)} className="h-8 text-xs">
                Close
              </Button>
              {selectedPrForModal.status === "returned" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPrForModal(null);
                    setLocation("/purchase-requests");
                  }}
                  className="h-8 rounded-[4px] bg-[#9a6d19] px-4 text-xs font-semibold text-white hover:bg-[#7e5712]"
                >
                  <FileEdit className="mr-1.5 h-3.5 w-3.5" />
                  Edit &amp; Resubmit PR
                </Button>
              ) : selectedPrForModal.status === "rejected" || selectedPrForModal.status === "cancelled" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPrForModal(null);
                    setLocation("/purchase-requests?create=1");
                  }}
                  className="h-8 rounded-[4px] bg-[#7b1e1e] px-4 text-xs font-semibold text-white hover:bg-[#641818]"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Create New Purchase Request
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPrForModal(null);
                    setLocation("/purchase-requests");
                  }}
                  className="h-8 rounded-[4px] bg-[#7b1e1e] px-4 text-xs font-semibold text-white hover:bg-[#641818]"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View in PR Register
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ============================================================================
// ADMIN / OFFICER DASHBOARD (PRESERVED WORKSPACE CONTROL CENTER)
// ============================================================================
function AdminDashboard({
  data,
  isLoading,
  userRole,
}: {
  data: any;
  isLoading: boolean;
  userRole: string;
}) {
  const cards = [
    {
      label: "PMR Registry & Verified PRs",
      icon: BookOpenCheck,
      value: data?.purchaseRequests?.filter((pr: any) => pr.procurementReviewedById !== null || pr.pmrLogged).length ?? 0,
      detail: "Verified PR packages recorded or queued for PMR logging.",
      tone: "text-[#7b1e1e] bg-[#fff4f1] dark:text-[#ff837a] dark:bg-[#341f1f]",
      href: "/pmr-registry",
    },
    {
      label: "BAC Transmittals",
      icon: Send,
      value: data?.transmittals?.length ?? 0,
      detail: "Transmittal packages routed to and from the BAC Secretariat.",
      tone: "text-[#325d91] bg-[#f1f6fc] dark:text-[#79b8ff] dark:bg-[#1a2736]",
      href: "/officer/transmittals",
    },
    {
      label: "POs, delivery & PMR",
      icon: CircleDollarSign,
      value: data?.purchaseOrders?.length ?? 0,
      detail: "Purchase Orders progressing through delivery and PMR.",
      tone: "text-[#9a6d19] bg-[#fff8e8] dark:text-[#f0c36a] dark:bg-[#272118]",
      href: "/purchase-orders",
    },
    {
      label: "Audit events",
      icon: Timer,
      value: data?.auditEvents?.length ?? 0,
      detail: "Accountability records available to your role.",
      tone: "text-[#276a4e] bg-[#f1f9f4] dark:text-[#55c98a] dark:bg-[#162c20]",
      href: "/audit",
    },
  ];

  return (
    <div className="content-shell pb-12">
      <PageHeader
        eyebrow="Control center"
        title="Procurement overview"
        description="A role-sensitive view of procurement planning, officer verification, BAC transmittals, Purchase Orders, delivery, PMR, and accountability records across all offices."
      />

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flat-panel group p-4 transition-colors hover:border-[#d2bd92] dark:hover:border-[#64717d]"
          >
            <div className="flex items-start justify-between">
              <div className={`grid h-8 w-8 place-items-center rounded-[4px] ${card.tone}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#a1a7ae] dark:text-[#aeb9c4] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-[#202833] dark:text-[#f1f5f8]">
              {isLoading ? "—" : card.value ?? 0}
            </p>
            <p className="mt-2 text-xs font-semibold text-[#3b4654] dark:text-[#f1f5f8]">{card.label}</p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{card.detail}</p>
          </Link>
        ))}
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        {data?.purchaseRequests?.length ? (
          <div className="flat-panel">
            <div className="border-b border-[#ece8df] dark:border-[#46515c] px-5 py-4">
              <p className="text-sm font-semibold text-[#34404e] dark:text-[#f1f5f8]">
                Active Procurement Monitoring Queue
              </p>
              <p className="mt-1 text-[11px] text-[#7d8793] dark:text-[#aeb9c4]">
                Verified records routed through official administrative control.
              </p>
            </div>
            <div className="divide-y divide-[#f0ede6] dark:divide-[#46515c] px-5">
              {data.purchaseRequests.slice(0, 5).map((pr: any) => (
                <div key={pr.id} className="flex items-center justify-between gap-3 py-4">
                  <div>
                    <p className="text-xs font-semibold text-[#3e4855] dark:text-[#f1f5f8]">{pr.prNumber}</p>
                    <p className="mt-1 max-w-[600px] text-[11px] text-[#77818d] dark:text-[#d1dae2] line-clamp-2 break-words" title={pr.purpose}>
                      {pr.purpose}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      pr.status.includes("review")
                        ? "pending"
                        : pr.status === "approved"
                        ? "approved"
                        : pr.status === "returned"
                        ? "pending"
                        : pr.status === "rejected"
                        ? "returned"
                        : "draft"
                    }
                  >
                    {pr.status.replaceAll("_", " ").toUpperCase()}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyWorkspace
            eyebrow="Action queue"
            title="There are no workflow actions awaiting your role."
            description="Requests and approvals requiring your authority will appear here as transactions are submitted and routed."
            actionLabel="View PMR registry"
            actionHref="/pmr-registry"
          />
        )}

        <div className="flat-panel h-fit">
          <div className="flex items-center justify-between border-b border-[#ece8df] dark:border-[#46515c] px-5 py-4">
            <div>
              <p className="text-xs font-semibold text-[#34404e] dark:text-[#f1f5f8]">Process integrity</p>
              <p className="mt-1 text-[11px] text-[#7d8793] dark:text-[#aeb9c4]">
                Mandatory controls for every transaction
              </p>
            </div>
            <Activity className="h-4 w-4 text-[#7b1e1e] dark:text-[#ff837a]" />
          </div>
          <div className="divide-y divide-[#f0ede6] dark:divide-[#46515c] px-5 py-1">
            {[
              "End-Users submit complete PR packages for Procurement Officer verification and recording.",
              "Procurement Staff/BAC validate supplier quotations and prepare the official Abstract of Quotations for BAC/HoPE decision.",
              "Purchase Orders are issued after the official decision, then closed only after delivery and PMR logging.",
            ].map((item, index) => (
              <div key={item} className="flex gap-3 py-4">
                <StatusBadge tone={index === 1 ? "pending" : "approved"}>
                  {index === 1 ? "REVIEW" : "CONTROL"}
                </StatusBadge>
                <p className="text-[11px] leading-5 text-[#65707e] dark:text-[#d1dae2]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROCUREMENT STAFF DEDICATED OVERVIEW WORKBENCH (SECTION 5 STRICT SCOPE)
// ============================================================================
function ProcurementStaffDashboard({
  data,
  isLoading,
}: {
  data: any;
  isLoading: boolean;
}) {
  const prs = data?.purchaseRequests ?? [];
  const pendingPmrPrs = prs.filter((pr: any) => pr.procurementReviewedById !== null && !pr.pmrLogged && !pr.pmrReferenceNumber);
  const activeRfqs = data?.rfqs ?? [];
  const quotationAbstracts = data?.quotationAbstracts ?? [];
  const pendingPoAbstracts = quotationAbstracts.filter((a: any) => a.status === "approved");
  const purchaseOrders = data?.purchaseOrders ?? [];
  const transmittals = data?.transmittals ?? [];
  const notices = data?.lettersOfNotice ?? [];

  const cards = [
    {
      label: "Pending PMR Recordings",
      icon: BookOpenCheck,
      value: pendingPmrPrs.length,
      detail: "Officer-verified PRs ready for PMR registry recording.",
      tone: "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40",
      href: "/pmr-registry",
    },
    {
      label: "RFQ Drafts & Canvass",
      icon: FileSpreadsheet,
      value: activeRfqs.length,
      detail: "Active RFQ packages and supplier quotation records.",
      tone: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
      href: "/rfq-management",
    },
    {
      label: "BAC Transmittals (AOQ)",
      icon: Send,
      value: transmittals.length,
      detail: "Packages forwarded to BAC Secretariat for AOQ creation.",
      tone: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
      href: "/officer/transmittals",
    },
    {
      label: "Draft POs & Notices",
      icon: FileCheck2,
      value: purchaseOrders.length + notices.length,
      detail: "Draft Purchase Orders and Letters of Notice for awarded suppliers.",
      tone: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
      href: "/purchase-orders",
    },
  ];

  const duties = [
    {
      id: "1",
      number: "Duty 1",
      title: "Record PR to PMR",
      condition: "Permitted only after Procurement Officer verification of PR & PPMP.",
      href: "/pmr-registry",
      badge: `${pendingPmrPrs.length} ready`,
      badgeTone: pendingPmrPrs.length > 0 ? "approved" : "pending",
      buttonText: "Open PMR Registry",
    },
    {
      id: "2",
      number: "Duty 2",
      title: "Prepare RFQ & Recommend Approval",
      condition: "Draft quotation package and recommend approval to HoPE.",
      href: "/rfq-management",
      badge: `${activeRfqs.length} active`,
      badgeTone: "pending",
      buttonText: "Manage RFQs",
    },
    {
      id: "3",
      number: "Duty 3",
      title: "Forward to BAC for AOQ Preparation",
      condition: "Transmit quotation package to BAC Secretariat for AOQ creation.",
      href: "/rfq-management",
      badge: `${transmittals.length} transmittals`,
      badgeTone: "pending",
      buttonText: "Forward to BAC / AOQ",
    },
    {
      id: "4",
      number: "Duty 4",
      title: "Prepare Letter of Notice",
      condition: "Draft formal Letter of Notice for the awarded supplier.",
      href: "/officer/notices",
      badge: `${notices.length} notices`,
      badgeTone: "pending",
      buttonText: "Draft Notice",
    },
    {
      id: "5",
      number: "Duty 5",
      title: "Prepare Purchase Order (PO)",
      condition: "Generate and draft formal PO document from approved AOQ.",
      href: "/purchase-orders",
      badge: `${pendingPoAbstracts.length} POs ready`,
      badgeTone: pendingPoAbstracts.length > 0 ? "approved" : "pending",
      buttonText: "Draft Purchase Orders",
    },
  ];

  return (
    <div className="content-shell pb-12 space-y-7">
      <PageHeader
        eyebrow="Procurement Staff Workbench"
        title="Procurement Operations Overview"
        description="Assigned strictly to Procedure 5 duties: PMR recording, RFQ preparation, BAC forwarding for AOQ, Letter of Notice drafting, and Purchase Order preparation."
      />

      {/* Scoped KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flat-panel group p-4 transition-colors hover:border-[#d2bd92] dark:hover:border-[#64717d]"
          >
            <div className="flex items-start justify-between">
              <div className={`grid h-8 w-8 place-items-center rounded-[4px] ${card.tone}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#a1a7ae] dark:text-[#aeb9c4] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-[#202833] dark:text-[#f1f5f8]">
              {isLoading ? "—" : card.value}
            </p>
            <p className="mt-2 text-xs font-semibold text-[#3b4654] dark:text-[#f1f5f8]">{card.label}</p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{card.detail}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        {/* Left Column: Staff Action Queue */}
        <div className="space-y-6">
          <div className="flat-panel">
            <div className="border-b border-[#ece8df] dark:border-[#46515c] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#34404e] dark:text-[#f1f5f8]">
                  Verified PRs Awaiting PMR Recording
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  PRs verified by Procurement Officer ready for Procedure 5.2 PMR recording.
                </p>
              </div>
              <Link
                href="/pmr-registry"
                className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                Go to PMR Registry <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#f0ede6] dark:divide-[#46515c] px-5">
              {pendingPmrPrs.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-1" />
                  No pending PMR recordings. All verified PRs have been logged.
                </div>
              ) : (
                pendingPmrPrs.slice(0, 5).map((pr: any) => (
                  <div key={pr.id} className="flex items-center justify-between gap-3 py-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-rose-700 dark:text-rose-400">
                          {pr.prNumber}
                        </span>
                        <StatusBadge tone="approved">OFFICER VERIFIED</StatusBadge>
                      </div>
                      <p className="text-xs text-foreground mt-0.5 line-clamp-1">{pr.purpose}</p>
                    </div>
                    <Button asChild size="sm" className="h-7 text-xs bg-rose-700 hover:bg-rose-800 text-white">
                      <Link href="/pmr-registry">Record to PMR</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Notice & PO Ready Queue */}
          <div className="flat-panel">
            <div className="border-b border-[#ece8df] dark:border-[#46515c] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#34404e] dark:text-[#f1f5f8]">
                  Approved Quotation Abstracts Ready for PO Drafting
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  BAC approved abstracts ready for formal Purchase Order preparation.
                </p>
              </div>
              <Link
                href="/purchase-orders"
                className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                Go to PO Workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#f0ede6] dark:divide-[#46515c] px-5">
              {pendingPoAbstracts.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Clock className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                  No BAC approved abstracts awaiting PO drafting currently.
                </div>
              ) : (
                pendingPoAbstracts.slice(0, 4).map((abs: any) => (
                  <div key={abs.id} className="flex items-center justify-between gap-3 py-3.5">
                    <div>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        Abstract for RFQ #{abs.rfqId}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Supplier #{abs.recommendedSupplierId} · {formatMoney(abs.totalAmount || 0)}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                      <Link href="/purchase-orders">Draft PO</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 5 Assigned Duties Workbench */}
        <div className="flat-panel h-fit">
          <div className="border-b border-[#ece8df] dark:border-[#46515c] px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#34404e] dark:text-[#f1f5f8]">
                Assigned Duties Scope
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Strict operational boundary (Procedure 5 specification)
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="divide-y divide-[#f0ede6] dark:divide-[#46515c] px-5 py-2">
            {duties.map((duty) => (
              <div key={duty.id} className="py-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    {duty.number}
                  </span>
                  <StatusBadge tone={duty.badgeTone as any}>{duty.badge}</StatusBadge>
                </div>
                <h4 className="text-xs font-bold text-foreground">{duty.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{duty.condition}</p>
                <div className="pt-1">
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs w-full justify-between">
                    <Link href={duty.href}>
                      <span>{duty.buttonText}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROCUREMENT OFFICER DEDICATED CONTROL CENTER OVERVIEW (MANDATED 6 TASKS)
// ============================================================================
function ProcurementOfficerDashboard() {
  const prVerificationsQuery = trpc.procurement.officer.prVerification.list.useQuery();
  const rfqDistributionsQuery = trpc.procurement.officer.rfqDistribution.list.useQuery();
  const releasingQuery = trpc.procurement.officer.releasing.list.useQuery();
  const deliveriesQuery = trpc.procurement.officer.delivery.list.useQuery();
  const noticesQuery = trpc.procurement.officer.notices.list.useQuery();

  const isLoading =
    prVerificationsQuery.isLoading ||
    rfqDistributionsQuery.isLoading ||
    releasingQuery.isLoading ||
    deliveriesQuery.isLoading;

  const verifications = prVerificationsQuery.data ?? [];
  const pendingVerifications = verifications.filter(
    (v: any) => !v.isVerified && v.purchaseRequest.status !== "returned"
  );
  const mixedCategoryPrs = verifications.filter(
    (v: any) => !v.isVerified && v.segregationAnalysis?.isMixed
  );

  const rfqs = rfqDistributionsQuery.data ?? [];
  const unpostedPhilgeps = rfqs.filter((r: any) => !r.philgepsPosting);
  const pendingDistributionOrPosting = rfqs.filter(
    (r: any) => r.distributionStatus !== "transmitted_to_bac" || !r.philgepsPosting
  );

  const orders = releasingQuery.data ?? [];
  const unreleasedOrders = orders.filter((o: any) => !o.isReleased);

  const notices = noticesQuery.data ?? [];
  const unservedNotices = notices.filter((n: any) => n.status !== "served");

  const pendingReleasingTotal = unreleasedOrders.length + unservedNotices.length;

  const deliveries = deliveriesQuery.data ?? [];
  const awaitingInspection = deliveries.filter((d: any) => !d.iar);

  // 4 Scoped KPI Cards strictly reflecting the officer's mandated tasks
  const cards = [
    {
      label: "Pending PR & PPMP Verifications",
      icon: ShieldCheck,
      value: pendingVerifications.length,
      detail:
        mixedCategoryPrs.length > 0
          ? `${mixedCategoryPrs.length} PRs flagged with mixed commodity categories.`
          : "Initial administrative verification & Section 5.1.1 clearance.",
      tone: "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40",
      href: "/officer/pr-verification",
    },
    {
      label: "RFQ Distributions & PhilGEPS",
      icon: FileSpreadsheet,
      value: pendingDistributionOrPosting.length,
      detail: `${unpostedPhilgeps.length} packages awaiting PhilGEPS posting reference.`,
      tone: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
      href: "/officer/rfq-distribution",
    },
    {
      label: "Notices & POs to Release",
      icon: Send,
      value: pendingReleasingTotal,
      detail: `${unservedNotices.length} notices to serve · ${unreleasedOrders.length} POs to release.`,
      tone: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
      href: "/officer/releasing",
    },
    {
      label: "Deliveries Awaiting IAR",
      icon: Clock,
      value: awaitingInspection.length,
      detail: "Active purchase orders awaiting goods inspection & acceptance report.",
      tone: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
      href: "/officer/delivery-monitoring",
    },
  ];

  // 6 Mandated Lifecycle Duties strictly reflecting official Procedure 5
  const duties = [
    {
      id: "1",
      number: "Duty 1",
      title: "Receive & Verify PR & PPMP (Section 5.1.1)",
      description:
        "Initial administrative verification and category segregation check (Office Supplies, Hardware Supplies, ICT Supplies, Printing Services, Food Ingredients).",
      href: "/officer/pr-verification",
      badge: `${pendingVerifications.length} pending`,
      badgeTone: pendingVerifications.length > 0 ? "pending" : "approved",
      buttonText: "Review PR Packages",
    },
    {
      id: "2",
      number: "Duty 2",
      title: "Distribute & Retrieve RFQ & Transmit to BAC",
      description:
        "Manage outward distribution of RFQs to canvassers, log supplier retrievals, and formally transmit packages to the BAC Secretariat.",
      href: "/officer/rfq-distribution",
      badge: `${rfqs.length} active`,
      badgeTone: "pending",
      buttonText: "Manage Distributions",
    },
    {
      id: "3",
      number: "Duty 3",
      title: "PhilGEPS Posting Verification",
      description:
        "Document and verify required PhilGEPS reference numbers and posting dates for active RFQ procurement packages.",
      href: "/officer/rfq-distribution",
      badge: `${unpostedPhilgeps.length} unposted`,
      badgeTone: unpostedPhilgeps.length > 0 ? "rejected" : "approved",
      buttonText: "Log PhilGEPS",
    },
    {
      id: "4",
      number: "Duty 4",
      title: "Serve Letter of Notice",
      description:
        "Deliver and serve finalized Letters of Notice to winning suppliers with delivery mode and recipient acknowledgement logging.",
      href: "/officer/releasing",
      badge: `${unservedNotices.length} to serve`,
      badgeTone: unservedNotices.length > 0 ? "pending" : "approved",
      buttonText: "Serve Notices",
    },
    {
      id: "5",
      number: "Duty 5",
      title: "PO & Contract Releasing",
      description:
        "Formally release approved and signed Purchase Orders / contracts to awarded suppliers with acknowledgement tracking.",
      href: "/officer/releasing",
      badge: `${unreleasedOrders.length} to release`,
      badgeTone: unreleasedOrders.length > 0 ? "pending" : "approved",
      buttonText: "Release Orders",
    },
    {
      id: "6",
      number: "Duty 6",
      title: "Monitor Delivery & Inspection (IAR)",
      description:
        "Track supplier delivery timelines, log goods receipts, and record final inspection and acceptance milestones.",
      href: "/officer/delivery-monitoring",
      badge: `${awaitingInspection.length} monitoring`,
      badgeTone: awaitingInspection.length > 0 ? "pending" : "approved",
      buttonText: "Track Deliveries",
    },
  ];

  return (
    <div className="content-shell pb-12 space-y-7">
      <PageHeader
        eyebrow="Procurement Officer Control Center"
        title="Procurement Officer Overview"
        description="Assigned strictly to Procedure 5 officer duties: PR & PPMP verification (Section 5.1.1), RFQ distribution/retrieval & BAC transmittal, PhilGEPS posting, notice serving, PO releasing, and delivery inspection monitoring."
      />

      {/* Scoped KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flat-panel group p-4 transition-colors hover:border-[#d2bd92] dark:hover:border-[#64717d]"
          >
            <div className="flex items-start justify-between">
              <div className={`grid h-8 w-8 place-items-center rounded-[4px] ${card.tone}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#a1a7ae] dark:text-[#aeb9c4] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-[#202833] dark:text-[#f1f5f8]">
              {isLoading ? "—" : card.value}
            </p>
            <p className="mt-2 text-xs font-semibold text-[#3b4654] dark:text-[#f1f5f8]">{card.label}</p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{card.detail}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        {/* Left Column: Officer Action Queues */}
        <div className="space-y-6">
          {/* Section 5.1.1 Verification Queue */}
          <div className="flat-panel">
            <div className="border-b border-[#ece8df] dark:border-[#46515c] px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#34404e] dark:text-[#f1f5f8]">
                    Incoming PRs Awaiting Section 5.1.1 Verification
                  </p>
                  {mixedCategoryPrs.length > 0 && (
                    <Badge variant="outline" className="text-[10px] border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                      {mixedCategoryPrs.length} Mixed Categories Flagged
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Verify category segregation before clearing package for Staff PMR recording.
                </p>
              </div>
              <Link
                href="/officer/pr-verification"
                className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                Go to Verification Hub <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#f0ede6] dark:divide-[#46515c] px-5">
              {pendingVerifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-1" />
                  All submitted PR packages have been verified and cleared for PMR recording.
                </div>
              ) : (
                pendingVerifications.slice(0, 5).map((item: any) => {
                  const pr = item.purchaseRequest;
                  const isMixed = item.segregationAnalysis?.isMixed;
                  return (
                    <div key={pr.id} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-rose-700 dark:text-rose-400">
                            {pr.prNumber}
                          </span>
                          {isMixed ? (
                            <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 text-[10px] dark:bg-amber-950/40 dark:text-amber-300">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Mixed Categories Detected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] dark:bg-emerald-950/40 dark:text-emerald-300">
                              Ready for Clearance
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            ({item.items.length} items · {formatMoney(pr.totalEstimate)})
                          </span>
                        </div>
                        <p className="text-xs text-foreground mt-1 truncate">{pr.purpose}</p>
                      </div>
                      <Button asChild size="sm" className="h-7 text-xs bg-rose-700 hover:bg-rose-800 text-white shrink-0">
                        <Link href="/officer/pr-verification">Verify &amp; Clear</Link>
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Releasing & Delivery Queue */}
          <div className="flat-panel">
            <div className="border-b border-[#ece8df] dark:border-[#46515c] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#34404e] dark:text-[#f1f5f8]">
                  Notices &amp; Purchase Orders Awaiting Release
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Finalized documents ready for service and formal release to winning suppliers.
                </p>
              </div>
              <Link
                href="/officer/releasing"
                className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                Go to Releasing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#f0ede6] dark:divide-[#46515c] px-5">
              {pendingReleasingTotal === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-1" />
                  No pending notices or POs awaiting release.
                </div>
              ) : (
                <>
                  {unservedNotices.slice(0, 3).map((notice: any) => (
                    <div key={`notice-${notice.id}`} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">
                            Notice #{notice.id}
                          </span>
                          <StatusBadge tone="pending">UNSERVED NOTICE</StatusBadge>
                        </div>
                        <p className="text-xs text-foreground mt-0.5 truncate">{notice.subject}</p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs shrink-0">
                        <Link href="/officer/releasing">Serve Notice</Link>
                      </Button>
                    </div>
                  ))}
                  {unreleasedOrders.slice(0, 3).map((item: any) => (
                    <div key={`order-${item.order.id}`} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {item.order.poNumber}
                          </span>
                          <StatusBadge tone="approved">APPROVED PO</StatusBadge>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {item.supplier?.name || "Supplier"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Amount: {formatMoney(item.order.totalAmount)}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs shrink-0">
                        <Link href="/officer/releasing">Release PO</Link>
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 6 Mandated Lifecycle Duties Workbench */}
        <div className="flat-panel h-fit">
          <div className="border-b border-[#ece8df] dark:border-[#46515c] px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#34404e] dark:text-[#f1f5f8]">
                Mandated Duties Scope
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Official Procedure 5 Procurement Officer specification
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="divide-y divide-[#f0ede6] dark:divide-[#46515c] px-5 py-2">
            {duties.map((duty) => (
              <div key={duty.id} className="py-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    {duty.number}
                  </span>
                  <StatusBadge tone={duty.badgeTone as any}>{duty.badge}</StatusBadge>
                </div>
                <h4 className="text-xs font-bold text-foreground">{duty.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{duty.description}</p>
                <div className="pt-1">
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs w-full justify-between">
                    <Link href={duty.href}>
                      <span>{duty.buttonText}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
