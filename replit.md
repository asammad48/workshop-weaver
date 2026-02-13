# Workshop Management

## Overview
A Workshop Management application built with React, TypeScript, Vite, and Tailwind CSS. Imported from Lovable. The app includes authentication, dashboard, customers, vehicles, job cards, inventory, purchase orders, transfers, finance, reports, and admin pages.

## Recent Changes
- 2026-02-13: Completed migration to Replit environment. Installed npm packages, fixed missing `apiClient` export in generated API client.
- 2026-02-06: Imported from Lovable to Replit. Updated Vite config to use port 5000 and allow all hosts.

## Project Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + custom UI components
- **State Management**: Zustand + TanStack React Query
- **Routing**: React Router DOM v6
- **API**: Connects to external backend via `VITE_API_BASE_URL` env var

### Directory Structure
- `src/` - Main source code
  - `api/` - API client, HTTP utilities, repositories
  - `app/` - App shell, routes, query client, security
  - `components/` - Shared UI components (Table, layout, ui primitives)
  - `features/` - Feature modules
  - `hooks/` - Custom hooks (useApi, useAuth)
  - `pages/` - Page components (Dashboard, Customers, Vehicles, etc.)
  - `state/` - Zustand stores (auth, theme, ui)
  - `styles/` - Global CSS and theme
- `public/` - Static assets
- `docs/` - Documentation

### Key Configuration
- Vite dev server runs on port 5000 with all hosts allowed
- External API URL configured via `VITE_API_BASE_URL` environment variable

## User Preferences
- None recorded yet
