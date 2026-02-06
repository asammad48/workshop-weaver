# NSwag API Client Generation

## Overview

This project uses NSwag to generate TypeScript API clients from OpenAPI/Swagger specifications.

## Prerequisites

1. A running backend with OpenAPI/Swagger JSON endpoint
2. The endpoint URL configured in `.env`

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Set the OpenAPI URL in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   VITE_OPENAPI_URL=http://localhost:5000/swagger/v1/swagger.json
   ```

## Generating the Client

Run the generation script:

```bash
npm run api:gen
```

This will:
1. Fetch the OpenAPI spec from `VITE_OPENAPI_URL`
2. Generate TypeScript client at `src/api/generated/apiClient.ts`

## Output

The generated file contains:
- Client classes for each API controller
- TypeScript interfaces for all DTOs
- `ApiException` class for error handling

## Using Generated Clients

**Important:** Never use generated clients directly in pages or components. Always go through repositories.

### Creating a Repository

```typescript
// src/api/repositories/workshopRepo.ts
import { WorkshopsClient, CreateWorkshopCommand } from '@/api/generated/apiClient';
import { createClient } from './_repoBase';

const client = createClient(WorkshopsClient);

export const workshopRepo = {
  getAll: () => client.getWorkshops(),
  getById: (id: string) => client.getWorkshop(id),
  create: (data: CreateWorkshopCommand) => client.createWorkshop(data),
  update: (id: string, data: UpdateWorkshopCommand) => client.updateWorkshop(id, data),
  delete: (id: string) => client.deleteWorkshop(id),
};
```

### Using in Components

```typescript
// In a page or feature component
import { workshopRepo } from '@/api/repositories/workshopRepo';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';

function WorkshopList() {
  const { data, isLoading } = useApiQuery(
    ['workshops'],
    () => workshopRepo.getAll()
  );
  
  const deleteMutation = useApiMutation(
    (id: string) => workshopRepo.delete(id)
  );
  
  // ...
}
```

## Troubleshooting

### Common Issues

1. **"VITE_OPENAPI_URL is not set"**
   - Make sure `.env` file exists and contains the URL

2. **"Failed to fetch OpenAPI document"**
   - Ensure your backend is running
   - Check if the URL is correct
   - Try opening the URL in browser

3. **"NSwag command not found"**
   - Run `npm install` to ensure nswag is installed

4. **Generated types are incorrect**
   - Check your backend OpenAPI configuration
   - Ensure all DTOs have proper decorators

### Regenerating

If your backend API changes, simply run `npm run api:gen` again.

## Configuration

The NSwag configuration is in `scripts/generate-api-client.mjs`. Key settings:

- `template: 'Fetch'` - Uses Fetch API
- `useAbortSignal: true` - Supports request cancellation
- `exportTypes: true` - Exports all interfaces
- `useTransformOptionsMethod/useTransformResultMethod` - Allows customization in `clientFactory.ts`
