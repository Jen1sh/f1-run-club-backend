---
trigger: always_on
---

# Project Structure: Antigravity / NestJS

## 📁 Layout

.
├── src/
│ ├── common/ # Global helpers, filters, and decorators
│ │ ├── decorators/ # Custom TS decorators (e.g., @CurrentUser)
│ │ ├── filters/ # Global Exception Filters (Mongo errors)
│ │ ├── guards/ # JWT and Role-based guards
│ │ └── middleware/ # Logging or Request tracing
│ ├── config/ # Configuration (Env, Database, JWT)
│ ├── modules/ # Feature-based modular logic
│ │ ├── auth/ # Authentication (JWT, Bcrypt)
│ │ ├── users/ # User management
│ │ │ ├── dto/ # Validation objects (input)
│ │ │ ├── entities/ # Response objects (output)
│ │ │ ├── schemas/ # Mongoose models/schemas
│ │ │ ├── users.controller.ts
│ │ │ ├── users.service.ts
│ │ │ └── users.module.ts
│ │ └── [feature]/ # Other business modules
│ ├── app.module.ts # Root module (imports all others)
│ └── main.ts # Entry point (App bootstrap)
├── test/ # E2E and Unit tests
└── .env # Environment variables (Gitignored)
