# Website Localization Plan (i18n)

## Objective
Roll out internationalization (i18n) across the full React application with **complete UI coverage** (routes, reusable components, navigation, validation/error copy, and generated documents) while minimizing regressions.

## Success Criteria
- No user-facing English copy remains hardcoded in JSX/TSX for supported surfaces.
- Language can be switched at runtime and persisted across sessions.
- Navigation, page titles, table headers, empty states, dialogs, toasts, and form validation messages are localized.
- Date/number/currency formatting is locale-aware.
- The public receipt page and PDF/report surfaces are localized.
- CI enforces key health (missing/unused keys) and blocks regressions.

---

## Technical Approach

### 1) i18n Stack
Use `react-i18next` + `i18next` + `i18next-browser-languagedetector` for runtime language switching and namespace support.

Recommended packages:
- `i18next`
- `react-i18next`
- `i18next-browser-languagedetector`
- `i18next-http-backend` (optional if loading JSON via HTTP instead of bundling)

### 2) Translation File Structure
Create locale files by namespace:

```text
src/i18n/
  index.ts
  locales/
    en/
      common.json
      nav.json
      auth.json
      dashboard.json
      jobcards.json
      inventory.json
      finance.json
      reports.json
      attendance.json
      admin.json
      profile.json
      public.json
      validation.json
    ar/
      ...same namespaces...
```

Key naming convention:
- `page.section.element.state`
- examples:
  - `dashboard.kpi.revenueToday.label`
  - `jobcards.tabs.attachments.empty`
  - `validation.required.customerName`

### 3) App Wiring
- Initialize i18n in `src/main.tsx`.
- Add fallback language (`en`) and supported languages list.
- Persist selected language in localStorage.
- Add a `LanguageSwitcher` in app layout/header.
- Convert nav labels to translation keys (instead of plain strings).

### 4) Formatting Rules
- Use `Intl.DateTimeFormat` and `Intl.NumberFormat` with active locale.
- Currency should use locale + business currency config.
- Relative dates and timestamps should be translated/formatted consistently.

### 5) RTL/LTR Readiness
For languages like Arabic:
- Set `<html dir="rtl">` when locale is RTL.
- Validate layout in sidebar, table alignment, icon/text spacing, forms, and modals.

---

## Delivery Phases

### Phase 0 — Discovery & Inventory
1. Confirm supported languages and priority order (example: `en` then `ar`).
2. Freeze copy style guide and glossary (domain terms: job card, workstations, ledger, etc.).
3. Extract current hardcoded strings and map to namespaces.

### Phase 1 — Foundation Setup
1. Install i18n packages.
2. Add `src/i18n/index.ts` bootstrap.
3. Register providers in app root.
4. Add language switcher + persistence.
5. Define lint/test guardrails.

### Phase 2 — Shared Surfaces First
1. Localize `AppLayout`, nav groups, common button labels, dialog actions.
2. Localize shared UI components that contain default text.
3. Localize global toast and error mapping utilities.

### Phase 3 — Page-by-Page Migration (Full Coverage)
Migrate route pages and feature modules in the coverage matrix below.

### Phase 4 — QA, Accessibility, and Regression Control
1. Pseudo-locale test (length expansion).
2. RTL pass.
3. Missing-key test in CI.
4. Screenshot/regression checks for critical pages.

### Phase 5 — Rollout
1. Ship behind feature flag if needed.
2. Enable additional languages incrementally.
3. Monitor translation misses and UI overflows.

---

## Coverage Matrix (Pages & Components)

Use this checklist to ensure nothing is left.

Legend:
- [ ] Not started
- [~] In progress
- [x] Localized & reviewed

### A) App Shell / Routing / Navigation
- [ ] `src/main.tsx` (i18n bootstrap import)
- [ ] `src/App.tsx`
- [ ] `src/app/AppShell.tsx`
- [ ] `src/app/routes.tsx` (route metadata/title copy if any)
- [ ] `src/app/nav.ts` (group/item labels)
- [ ] `src/app/security/ProtectedRoute.tsx` (access-denied/loading text)

### B) Top-Level Route Pages
- [ ] `src/pages/auth/LoginPage.tsx`
- [ ] `src/pages/auth/MePage.tsx`
- [ ] `src/pages/DashboardPage.tsx`
- [ ] `src/pages/NotificationsPage.tsx`
- [ ] `src/pages/JobCardsPage.tsx`
- [ ] `src/pages/CustomersPage.tsx`
- [ ] `src/pages/DriversPage.tsx`
- [ ] `src/pages/VehiclesPage.tsx`
- [ ] `src/pages/inventory/InventoryPage.tsx`
- [ ] `src/pages/inventory/PurchaseOrdersPage.tsx`
- [ ] `src/pages/TransfersPage.tsx`
- [ ] `src/pages/FinancePage.tsx`
- [ ] `src/pages/ReportsPage.tsx`
- [ ] `src/pages/attendance/MyAttendancePage.tsx`
- [ ] `src/pages/attendance/AttendanceAdminPage.tsx`
- [ ] `src/pages/admin/UsersPage.tsx`
- [ ] `src/pages/admin/BranchesPage.tsx`
- [ ] `src/pages/admin/WorkstationsPage.tsx`
- [ ] `src/pages/admin/AuditPage.tsx`
- [ ] `src/pages/public/PublicJobCardReceiptPage.tsx`
- [ ] `src/pages/ThemePage.tsx`
- [ ] `src/pages/NotFoundPage.tsx`

### C) Inventory Subcomponents
- [ ] `src/pages/inventory/StockTab.tsx`
- [ ] `src/pages/inventory/LedgerTab.tsx`
- [ ] `src/pages/inventory/StockAdjustModal.tsx`

### D) Job Card Feature Components
- [ ] `src/features/jobcards/components/JobCardHeader.tsx`
- [ ] `src/features/jobcards/components/JobCardDetails.tsx`
- [ ] `src/features/jobcards/tabs/ApprovalsTab.tsx`
- [ ] `src/features/jobcards/tabs/AttachmentsTab.tsx`
- [ ] `src/features/jobcards/tabs/CommunicationsTab.tsx`
- [ ] `src/features/jobcards/tabs/DiagnosisTab.tsx`
- [ ] `src/features/jobcards/tabs/InvoiceTab.tsx`
- [ ] `src/features/jobcards/tabs/LineItemsTab.tsx`
- [ ] `src/features/jobcards/tabs/PartRequestsTab.tsx`
- [ ] `src/features/jobcards/tabs/RoadblockersTab.tsx`
- [ ] `src/features/jobcards/tabs/StationTab.tsx`
- [ ] `src/features/jobcards/tabs/TasksTab.tsx`

### E) Dashboard Feature Components
- [ ] `src/features/dashboard/HqAdminDashboard.tsx`
- [ ] `src/features/dashboard/ManagerDashboard.tsx`
- [ ] `src/features/dashboard/StoreDashboard.tsx`
- [ ] `src/features/dashboard/CashierDashboard.tsx`
- [ ] `src/features/dashboard/TechDashboard.tsx`
- [ ] `src/features/dashboard/components/KpiCard.tsx`
- [ ] `src/features/dashboard/components/DateRangePicker.tsx`
- [ ] `src/features/dashboard/components/AlertTable.tsx`
- [ ] `src/features/dashboard/components/ChartCard.tsx`
- [ ] `src/features/dashboard/jobCardReportPdf.ts` (PDF labels/captions)

### F) Shared Components
- [ ] `src/components/layout/AppLayout.tsx`
- [ ] `src/components/Table.tsx` (empty states/pagination labels)
- [ ] `src/components/forms/Select.tsx` (placeholder/default text)
- [ ] `src/components/ui/ConfirmDialog.tsx`
- [ ] `src/components/ui/Toast.tsx`
- [ ] `src/components/ui/Modal.tsx` (if default copy exists)
- [ ] `src/components/ui/Accordion.tsx` (if default copy exists)
- [ ] `src/components/ui/Button.tsx` (if default copy exists)
- [ ] `src/components/ui/Input.tsx` (if default copy exists)
- [ ] `src/components/ui/Card.tsx` / `Badge.tsx` (if default copy exists)

### G) Data/Domain Message Surfaces
- [ ] `src/api/repositories/_errors.ts` (error -> user message mapping)
- [ ] API-driven toasts and fallback messages in repository consumers
- [ ] Validation messages in forms (`react-hook-form`/`zod`)
- [ ] Empty/error/loading states across pages

---

## QA Checklist
- [ ] Language switch updates UI immediately without reload.
- [ ] Persisted language survives refresh/login.
- [ ] No visible raw translation keys in UI.
- [ ] No hardcoded text in route/page headers, buttons, tab labels, dialogs.
- [ ] Dates and currencies match locale conventions.
- [ ] RTL layout is usable and visually correct.
- [ ] Public receipt and PDF/report outputs translated.
- [ ] Accessibility labels/aria text translated.

---

## Automation & Guardrails
1. Add ESLint rule/process check to flag hardcoded strings in TSX (except allowlist).
2. Add CI script for:
   - missing keys per locale
   - unused keys
   - namespace shape parity (`en` vs others)
3. Add unit test for `i18n` initialization and fallback behavior.

---

## Suggested Execution Order (Practical)
1. Foundation (`main.tsx`, i18n config, language switcher).
2. Navigation + layout (`nav.ts`, `AppLayout.tsx`).
3. Auth + dashboard pages.
4. Job cards module.
5. Inventory + purchasing/transfers.
6. Finance + reports.
7. Attendance + admin.
8. Public receipt + PDF/report surfaces.
9. QA/RTL/CI enforcement.

---

## Risk Register
- **Risk:** Inconsistent domain terms across modules.
  - **Mitigation:** shared glossary in `common.json` and review sign-off.
- **Risk:** Dynamic API strings not localizable.
  - **Mitigation:** map API codes to i18n keys client-side where possible.
- **Risk:** Layout breakage in RTL or long strings.
  - **Mitigation:** pseudo-locale + RTL test pass before rollout.
- **Risk:** Missing keys silently falling back.
  - **Mitigation:** CI check + runtime logging in non-production.

---

## Definition of Done
Localization is complete when every checklist item is `[x]`, CI key checks pass, and QA sign-off confirms both LTR + RTL usability on critical paths.
