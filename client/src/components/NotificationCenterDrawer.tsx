import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { normalizeProcurementRole } from "../../../shared/procurementRules";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  FileSpreadsheet,
  Inbox,
  LoaderCircle,
  Send,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface NotificationCenterDrawerProps {
  className?: string;
  triggerVariant?: "default" | "minimal" | "topbar";
}

export function NotificationCenterDrawer({
  className = "",
  triggerVariant = "default",
}: NotificationCenterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const role = user ? normalizeProcurementRole(user.role) : "end_user";
  const isOfficer =
    role === "procurement_officer" ||
    role === "procurement_officer_i" ||
    role === "procurement_officer_ii" ||
    (user as any)?.role === "supply_officer";

  const utils = trpc.useUtils();

  // In-app notifications
  const notificationsQuery = trpc.procurement.notifications.list.useQuery(
    undefined,
    {
      retry: false,
      enabled: Boolean(user),
      refetchInterval: 15_000,
      refetchIntervalInBackground: true,
    }
  );

  const notifications = notificationsQuery.data ?? [];
  const unreadNotifications = notifications.filter((n) => !n.readAt);

  // Officer-specific action alerts
  const officerPrQuery = trpc.procurement.officer.prVerification.list.useQuery(
    undefined,
    { enabled: isOfficer, retry: false }
  );
  const officerRfqQuery = trpc.procurement.officer.rfqDistribution.list.useQuery(
    undefined,
    { enabled: isOfficer, retry: false }
  );
  const officerReleasingQuery = trpc.procurement.officer.releasing.list.useQuery(
    undefined,
    { enabled: isOfficer, retry: false }
  );
  const officerDeliveriesQuery = trpc.procurement.officer.delivery.list.useQuery(
    undefined,
    { enabled: isOfficer, retry: false }
  );

  const pendingPrs = isOfficer
    ? (officerPrQuery.data ?? []).filter(
        (v: any) => !v.isVerified && v.purchaseRequest?.status !== "returned"
      )
    : [];
  const mixedCategoryPrs = isOfficer
    ? pendingPrs.filter((v: any) => v.segregationAnalysis?.isMixed)
    : [];
  const unpostedPhilgeps = isOfficer
    ? (officerRfqQuery.data ?? []).filter((r: any) => !r.philgepsPosting)
    : [];
  const unreleasedOrders = isOfficer
    ? (officerReleasingQuery.data ?? []).filter((o: any) => !o.isReleased)
    : [];
  const awaitingInspection = isOfficer
    ? (officerDeliveriesQuery.data ?? []).filter((d: any) => !d.iar)
    : [];

  const officerAlertCount =
    (pendingPrs.length > 0 ? 1 : 0) +
    (unpostedPhilgeps.length > 0 ? 1 : 0) +
    (unreleasedOrders.length > 0 ? 1 : 0) +
    (awaitingInspection.length > 0 ? 1 : 0);

  const totalActionCount = unreadNotifications.length + officerAlertCount;

  // Mark single notification read
  const markRead = trpc.procurement.notifications.markRead.useMutation({
    onSuccess: () => {
      void utils.procurement.notifications.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to mark alert as read.");
    },
  });

  const handleOpenDestination = (entityType: string, notificationId?: number) => {
    if (notificationId) {
      markRead.mutate({ notificationId });
    }
    setOpen(false);

    switch (entityType) {
      case "purchase_request":
        if (isOfficer) setLocation("/officer/pr-verification");
        else setLocation("/purchase-requests");
        break;
      case "rfq":
        if (isOfficer) setLocation("/officer/rfq-distribution");
        else setLocation("/rfq-management");
        break;
      case "purchase_order":
        if (isOfficer) setLocation("/officer/releasing");
        else setLocation("/purchase-orders");
        break;
      case "delivery":
        if (isOfficer) setLocation("/officer/delivery-monitoring");
        else setLocation("/purchase-orders");
        break;
      default:
        setLocation("/notifications");
    }
  };

  const handleMarkAllRead = async () => {
    for (const item of unreadNotifications) {
      markRead.mutate({ notificationId: item.id });
    }
    toast.success("All workflow alerts marked as read.");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Notification Center (${totalActionCount} actionable updates)`}
          title={`Notification Center (${totalActionCount} actionable updates)`}
          className={
            triggerVariant === "topbar"
              ? "relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 shadow-2xs transition hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white"
              : triggerVariant === "minimal"
              ? "relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
              : `relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#121826] text-slate-600 dark:text-slate-300 shadow-2xs transition hover:border-[#881337]/40 hover:text-[#881337] dark:hover:text-[#fda4af] ${className}`
          }
        >
          <Bell className="h-4 w-4" />
          {totalActionCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#881337] px-1 text-[9px] font-bold text-white shadow-xs animate-in zoom-in-50">
              {totalActionCount > 9 ? "9+" : totalActionCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-md border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] shadow-2xl"
      >
        {/* Drawer Header */}
        <SheetHeader className="border-b border-slate-200 dark:border-slate-800/80 px-5 py-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#881337]/10 dark:bg-[#881337]/25 text-[#881337] dark:text-[#fda4af]">
                <BellRing className="h-4 w-4" />
              </div>
              <div>
                <SheetTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Notification Center
                </SheetTitle>
                <SheetDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                  Actionable workflow alerts &amp; pending handoffs
                </SheetDescription>
              </div>
            </div>
            {totalActionCount > 0 && (
              <Badge
                variant="outline"
                className="border-[#881337]/30 bg-[#881337]/10 text-[10px] font-semibold text-[#881337] dark:text-[#fda4af]"
              >
                {totalActionCount} pending
              </Badge>
            )}
          </div>

          {unreadNotifications.length > 0 && (
            <div className="mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-[#881337] dark:text-[#fda4af] hover:underline"
              >
                <CheckCheck className="h-3 w-3" /> Mark all as read
              </button>
            </div>
          )}
        </SheetHeader>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* SECTION: Role-Specific Actionable Task Pings (Officer Scope) */}
          {isOfficer && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Procurement Officer Action Queue
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Live Status
                </span>
              </div>

              {/* 1. Pending PR Verification */}
              {pendingPrs.length > 0 ? (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-3 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-rose-950 dark:text-rose-200">
                        {pendingPrs.length} PRs Awaiting Verification
                      </p>
                      <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-0.5 leading-snug">
                        {mixedCategoryPrs.length > 0
                          ? `⚠️ ${mixedCategoryPrs.length} request(s) flagged with mixed commodity categories (Section 5.1.1).`
                          : "Submitted packages awaiting administrative clearance before PMR handoff."}
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="w-full h-7 text-xs bg-rose-700 hover:bg-rose-800 text-white"
                    onClick={() => setOpen(false)}
                  >
                    <a href="/officer/pr-verification">
                      Review &amp; Verify PRs <ArrowRight className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    All PR packages verified
                  </span>
                  <span className="text-[10px] text-slate-500">Cleared</span>
                </div>
              )}

              {/* 2. PhilGEPS Posting Deadline Alert */}
              {unpostedPhilgeps.length > 0 && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/20 p-3 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <FileSpreadsheet className="h-4 w-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-blue-950 dark:text-blue-200">
                        PhilGEPS Posting Required ({unpostedPhilgeps.length})
                      </p>
                      <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-0.5 leading-snug">
                        Active RFQ packages require documented PhilGEPS posting reference numbers.
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs border-blue-300 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300"
                    onClick={() => setOpen(false)}
                  >
                    <a href="/officer/philgeps">
                      Log PhilGEPS Postings <ArrowRight className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}

              {/* 3. Releasing Alert */}
              {unreleasedOrders.length > 0 && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 p-3 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Send className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                        {unreleasedOrders.length} POs Ready for Release
                      </p>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-snug">
                        Approved Purchase Orders awaiting formal release to winning suppliers.
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-300"
                    onClick={() => setOpen(false)}
                  >
                    <a href="/officer/releasing">
                      Release Orders <ArrowRight className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}

              {/* 4. Delivery / Inspection Alert */}
              {awaitingInspection.length > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-3 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Truck className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-amber-950 dark:text-amber-200">
                        {awaitingInspection.length} Shipments Awaiting Inspection
                      </p>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-snug">
                        Active deliveries require Inspection &amp; Acceptance Report (IAR) logging.
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300"
                    onClick={() => setOpen(false)}
                  >
                    <a href="/officer/delivery-monitoring">
                      Record Inspection <ArrowRight className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* SECTION: Standard In-App Notification Feed */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recent Workflow Feed
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {notifications.length} total
              </span>
            </div>

            {notificationsQuery.isLoading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <LoaderCircle className="mx-auto h-5 w-5 animate-spin text-[#881337] mb-2" />
                Loading alerts...
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 py-8 text-center">
                <Inbox className="mx-auto h-6 w-6 text-slate-400 mb-1.5" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No notifications
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Workflow handoffs and decision updates will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] overflow-hidden">
                {notifications.slice(0, 8).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 space-y-1.5 transition-colors ${
                      notification.readAt
                        ? "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        : "bg-[#fffaf0]/80 dark:bg-[#1f1b13]/40 border-l-2 border-[#881337]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {notification.title}
                        </span>
                        {!notification.readAt && (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-[#881337] shrink-0"
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notification.createdAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                      {notification.body}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-[#8a6520] dark:text-[#f0c36a]">
                        {notification.kind.replaceAll("_", " ")}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenDestination(
                              notification.entityType,
                              notification.id
                            )
                          }
                          className="text-[11px] font-semibold text-[#881337] dark:text-[#fda4af] hover:underline flex items-center gap-0.5"
                        >
                          View <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                        {!notification.readAt && (
                          <button
                            type="button"
                            onClick={() =>
                              markRead.mutate({ notificationId: notification.id })
                            }
                            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2"
                            title="Mark as read"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 bg-slate-50/80 dark:bg-[#0c1322] flex items-center justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold"
            onClick={() => setOpen(false)}
          >
            <a href="/notifications" className="flex items-center justify-center gap-1.5">
              <span>View Full Notification Inbox</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
