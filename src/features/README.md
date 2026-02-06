# Features folder

This directory contains domain-specific feature modules.

## Structure

Each feature should follow this structure:

```
features/
└── workshops/
    ├── components/       # Feature-specific components
    ├── hooks/            # Feature-specific hooks
    ├── types.ts          # Feature types
    └── index.ts          # Public exports
```

## Guidelines

1. Features are self-contained domain modules
2. Use repositories for data access (never fetch directly)
3. Export only what's needed by pages
4. Keep feature-specific state local when possible
