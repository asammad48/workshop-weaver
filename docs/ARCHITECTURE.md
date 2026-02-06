# Workshop Management - Architecture

## Overview

This application follows a strict layered architecture to maintain separation of concerns and testability.

## Layers (Bottom to Top)

```
┌─────────────────────────────────────────────┐
│                   Pages                      │
│  (Route components, orchestrate features)    │
├─────────────────────────────────────────────┤
│                 Features                     │
│  (Domain-specific logic and components)      │
├─────────────────────────────────────────────┤
│            Shared Components                 │
│  (Reusable business components)              │
├─────────────────────────────────────────────┤
│              components/ui                   │
│  (Design system primitives)                  │
└─────────────────────────────────────────────┘
```

## Folder Structure

```
src/
├── app/                    # Application bootstrap
│   ├── queryClient.ts      # React Query configuration
│   ├── routes.tsx          # Route definitions
│   ├── AppShell.tsx        # Main app wrapper + hosts
│   └── security/           # Auth guards
│
├── pages/                  # Route page components
│   ├── auth/               # Authentication pages
│   └── DashboardPage.tsx   # Main dashboard
│
├── features/               # Domain features (future)
│   └── workshops/          # Example feature module
│
├── components/
│   ├── ui/                 # Design system primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx       # ModalHost
│   │   ├── ConfirmDialog.tsx
│   │   └── Toast.tsx       # ToastHost
│   ├── layout/             # Layout components
│   └── Table.tsx           # Shared table component
│
├── hooks/                  # Shared React hooks
│   ├── useAuth.ts
│   └── useApi.ts
│
├── api/                    # API layer
│   ├── config.ts           # API configuration
│   ├── http.ts             # HTTP utilities
│   ├── clientFactory.ts    # NSwag client factory
│   ├── generated/          # NSwag output (gitignored)
│   └── repositories/       # Data access layer
│       ├── _repoBase.ts
│       └── authRepo.ts
│
├── state/                  # Global state (Zustand)
│   ├── authStore.ts        # Authentication state
│   └── uiStore.tsx         # UI state (modals, toasts)
│
└── styles/
    └── global.css          # Global styles & utilities
```

## Key Principles

### 1. No Fetch in Pages

Pages must NEVER call `fetch` directly. All API calls go through repositories:

```typescript
// ❌ Wrong
const response = await fetch('/api/workshops');

// ✅ Correct
const workshops = await workshopRepo.getAll();
```

### 2. Global Popup Hosts

All modals, confirms, and toasts use centralized hosts:

```typescript
// Modal
import { openModal, closeModal } from '@/state/uiStore';
openModal('Edit Workshop', <WorkshopForm />);

// Confirm
import { confirm } from '@/components/ui/ConfirmDialog';
const ok = await confirm({ title: 'Delete?', message: 'Are you sure?' });

// Toast
import { toast } from '@/components/ui/Toast';
toast.success('Saved!');
```

### 3. Repository Pattern

Repositories are the ONLY layer that touches generated API clients:

```typescript
// src/api/repositories/workshopRepo.ts
import { WorkshopsClient } from '@/api/generated/apiClient';
import { createClient } from './_repoBase';

const client = createClient(WorkshopsClient);

export const workshopRepo = {
  getAll: () => client.getWorkshops(),
  getById: (id: string) => client.getWorkshop(id),
  create: (data: CreateWorkshopDto) => client.createWorkshop(data),
  // ...
};
```

### 4. State Management

- **Zustand** for global UI state (auth, modals, toasts)
- **React Query** for server state (caching, refetching)

## Adding a New Feature

1. Create feature folder: `src/features/workshops/`
2. Add components, hooks, types in the feature folder
3. Create repository: `src/api/repositories/workshopRepo.ts`
4. Add page: `src/pages/workshops/WorkshopListPage.tsx`
5. Add route in `src/app/routes.tsx`

## Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Server state
- **Zustand** - Client state
- **NSwag** - API client generation
