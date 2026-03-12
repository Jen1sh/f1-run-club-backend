---
trigger: always_on
---

# 📜 Coding Conventions | Project Antigravity

> **Core Principle:** Clean, Modular, and Performance-First Development with NestJS & Mongoose.

---

## 📁 1. Directory & File Standards

To prevent cognitive overload, we follow a strict "Feature-First" folder structure.

### 📂 Folder Organization

- **Modules:** Every feature has its own folder (e.g., `src/modules/users/`).
- **Kebab-Case:** All filenames and directories use kebab-case.
- **Naming Pattern:** `[name].[type].ts`
  - `auth.controller.ts`
  - `create-user.dto.ts`
  - `user.schema.ts`

### 🏷️ Naming Conventions

| Entity         | Convention                | Example           |
| :------------- | :------------------------ | :---------------- |
| **Classes**    | `PascalCase`              | `PaymentService`  |
| **Interfaces** | `PascalCase` + `I` Prefix | `IUserMetadata`   |
| **Variables**  | `camelCase`               | `isActiveUser`    |
| **Constants**  | `UPPER_SNAKE_CASE`        | `MAX_RETRY_LIMIT` |
| **DB Fields**  | `camelCase`               | `lastLoginAt`     |

---

## 🏗️ 2. Architectural Rules

NestJS is the skeleton; these rules are the muscles.

- **Logic Isolation:** Services contain **all** business logic. Controllers only handle `@Body()`, `@Param()`, and returning the final response.
- **DTO Enforcement:** Use `class-validator` for every request. Never use `any` or raw Mongoose documents as input.
- **Dependency Injection:** Never instantiate classes with `new`. Use the NestJS constructor injection:
  ```typescript
  constructor(private readonly usersService: UsersService) {}
  ```

---

## 🍃 3. Mongoose & Database Excellence

Since **Antigravity** relies on MongoDB, efficiency is non-negotiable.

### ✅ The Performance Checklist

1.  **The `.lean()` Rule:** Use `.lean()` for all `GET` operations.
2.  **Explicit Execution:** Always end queries with `.exec()` to ensure a proper Promise return.
3.  **Timestamping:** Every schema must have `{ timestamps: true }`.
4.  **No `__v`:** Set `versionKey: false` in schema options unless versioning is required.

### 🛠️ Schema Decorator Standard

```typescript
@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    }
  }
})
```
