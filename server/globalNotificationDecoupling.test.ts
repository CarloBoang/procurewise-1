import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Global Notification Architecture Decoupling across All Roles", () => {
  const dashboardLayoutPath = path.resolve(__dirname, "../client/src/components/DashboardLayout.tsx");
  const helpSupportDialogPath = path.resolve(__dirname, "../client/src/components/HelpSupportDialog.tsx");
  const notificationCenterDrawerPath = path.resolve(__dirname, "../client/src/components/NotificationCenterDrawer.tsx");

  const dashboardLayoutSource = fs.readFileSync(dashboardLayoutPath, "utf-8");
  const helpSupportDialogSource = fs.readFileSync(helpSupportDialogPath, "utf-8");
  const notificationCenterDrawerSource = fs.readFileSync(notificationCenterDrawerPath, "utf-8");

  describe("1. Complete Removal of Notifications from Help & Support", () => {
    it("HelpSupportDialog does not contain notification queries or notification badge counters", () => {
      expect(helpSupportDialogSource).not.toContain("notifications.list");
      expect(helpSupportDialogSource).not.toContain("unreadNotifications");
      expect(helpSupportDialogSource).not.toContain("unreadCount");
      expect(helpSupportDialogSource).not.toContain("NotificationCenterDrawer");
    });

    it("HelpSupportDialog is dedicated to user manuals, RA 9184 guidelines, and support tickets", () => {
      // User manuals
      expect(helpSupportDialogSource).toContain("User Manuals");
      expect(helpSupportDialogSource).toContain("Section 5.1.1 Category Segregation Rule");
      expect(helpSupportDialogSource).toContain("Official Procedure 5 Workflow Stages");

      // RA 9184 guidelines
      expect(helpSupportDialogSource).toContain("RA 9184 Guidelines");
      expect(helpSupportDialogSource).toContain("Alternative Methods of Procurement");
      expect(helpSupportDialogSource).toContain("Small Value Procurement (SVP)");
      expect(helpSupportDialogSource).toContain("Shopping");

      // Support tickets
      expect(helpSupportDialogSource).toContain("Support Tickets");
      expect(helpSupportDialogSource).toContain("PW-TICK-");
      expect(helpSupportDialogSource).toContain("Submit Support Ticket");
    });

    it("DashboardLayout sidebar footer Help & Support button does not render notification badges", () => {
      // The Help & Support button triggers setHelpOpen(true) without notification badges
      expect(dashboardLayoutSource).toContain("setHelpOpen(true)");
      // Verify help button does not contain unread badge
      const helpButtonIndex = dashboardLayoutSource.indexOf("setHelpOpen(true)");
      expect(helpButtonIndex).toBeGreaterThan(-1);
      const surroundingCode = dashboardLayoutSource.slice(helpButtonIndex - 100, helpButtonIndex + 300);
      expect(surroundingCode).not.toContain("unreadCount");
      expect(surroundingCode).not.toContain("Badge");
    });
  });

  describe("2. Unified Sidebar Controls & Redundant Top Header Removal", () => {
    it("removes Gov. Procurement subtitle from sidebar header and preserves clean ProcureWise brand", () => {
      expect(dashboardLayoutSource).not.toContain("Gov. Procurement");
      expect(dashboardLayoutSource).toContain("ProcureWise");
      expect(dashboardLayoutSource).toContain("/bsc-logo.jpg");
    });

    it("deletes the redundant top banner bar with repeated role badge and institution subtitle", () => {
      expect(dashboardLayoutSource).not.toContain("Batanes State College Procurement Management System");
      expect(dashboardLayoutSource).not.toContain("<NotificationCenterDrawer triggerVariant=\"topbar\" />");
    });

    it("deduplicates notification bell and theme toggle controls to unified spots", () => {
      // Bell and theme toggle are unified in sidebar header and mobile bar
      expect(dashboardLayoutSource).toContain("<NotificationCenterDrawer triggerVariant=\"minimal\" />");
      expect(dashboardLayoutSource).toContain("<ThemeToggle />");
    });

    it("NotificationCenterDrawer uses Lucide Bell icon and reactive badge indicator", () => {
      expect(notificationCenterDrawerSource).toContain("import {");
      expect(notificationCenterDrawerSource).toMatch(/Bell[ ,]/);
      expect(notificationCenterDrawerSource).toContain("totalActionCount > 0");
      expect(notificationCenterDrawerSource).toContain("rounded-full bg-[#881337]");
    });
  });

  describe("3. Role-Scoped Notification Drawer / Popover", () => {
    it("handles End-User role alerts (PR updates, Section 5.1.1 returned packages, supplier evaluations)", () => {
      expect(notificationCenterDrawerSource).toContain("isEndUser");
      expect(notificationCenterDrawerSource).toContain("returnedPrs");
      expect(notificationCenterDrawerSource).toContain("Section 5.1.1");
      expect(notificationCenterDrawerSource).toContain("/supplier-evaluation-form");
    });

    it("handles Procurement Officer role alerts (PR/PPMP verification, PhilGEPS posting, delivery monitoring, releasing)", () => {
      expect(notificationCenterDrawerSource).toContain("isOfficer");
      expect(notificationCenterDrawerSource).toContain("pendingOfficerPrs");
      expect(notificationCenterDrawerSource).toContain("/officer/pr-verification");
      expect(notificationCenterDrawerSource).toContain("/officer/philgeps");
      expect(notificationCenterDrawerSource).toContain("/officer/delivery-monitoring");
      expect(notificationCenterDrawerSource).toContain("/officer/releasing");
    });

    it("handles Procurement Staff role alerts (PMR recording, RFQ preparation, PO drafting)", () => {
      expect(notificationCenterDrawerSource).toContain("isStaff");
      expect(notificationCenterDrawerSource).toContain("staffVerifiedPrs");
      expect(notificationCenterDrawerSource).toContain("/pmr-registry");
      expect(notificationCenterDrawerSource).toContain("/rfq-management");
      expect(notificationCenterDrawerSource).toContain("/purchase-orders");
    });

    it("handles BAC role alerts (packages forwarded for AOQ preparation, pending award resolutions)", () => {
      expect(notificationCenterDrawerSource).toContain("isBac");
      expect(notificationCenterDrawerSource).toContain("Packages Forwarded for AOQ Preparation");
      expect(notificationCenterDrawerSource).toContain("Pending Award Resolutions");
    });

    it("handles HoPE role alerts (resolutions and contract/PO packages awaiting executive signature)", () => {
      expect(notificationCenterDrawerSource).toContain("isHope");
      expect(notificationCenterDrawerSource).toContain("Packages Awaiting Executive Signature");
      expect(notificationCenterDrawerSource).toContain("hopePendingPos");
    });

    it("handles Budget Officer role alerts (PO packages awaiting allotment and funds certification)", () => {
      expect(notificationCenterDrawerSource).toContain("isBudget");
      expect(notificationCenterDrawerSource).toContain("Funds Certification Queue");
      expect(notificationCenterDrawerSource).toContain("/budgets");
    });

    it("includes direct quick-links and Mark as read toggle for notification items", () => {
      expect(notificationCenterDrawerSource).toContain("markRead.mutate");
      expect(notificationCenterDrawerSource).toContain("handleMarkAllRead");
      expect(notificationCenterDrawerSource).toContain("handleOpenDestination");
    });
  });
});
