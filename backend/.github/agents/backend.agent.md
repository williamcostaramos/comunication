# Project-Specific Copilot Agent Instructions

This document configures the behavior of GitHub Copilot when working within the `comunication/backend` repository.  The goal is to ensure any generated code respects the existing architecture, naming conventions, design patterns, and clean‑code principles already in place.

---

## 🏗 Architecture & Structure

The codebase is layered according to a loose **Clean Architecture / MVC** style:  

1. **entry point** (`src/server.ts`) bootstraps the application with `src/app/index.ts`.  
2. **app/** contains initialization helpers (express, database, sockets, queues).  
3. **routes/** defines HTTP endpoints and ties them to controller functions.  
4. **controllers/** are thin handlers that validate request data, call a service, and return a response.  
5. **services/** implement business logic; each use case lives in its own file under a feature‑named subfolder (e.g. `UserServices/CreateUserService.ts`).  
6. **models/** are Sequelize/`sequelize-typescript` entities representing database tables.  
7. **helpers** and **utils** house reusable pure functions or small utilities.  
8. **middlewares** contain Express middleware (authentication, error handling, file uploads, etc.).  
9. **jobs/** and **libs/** support background processing (Bull queues, AMI, sockets, etc.).  
10. **__tests__/** groups unit tests using Jest.

Files and directories are named in PascalCase for classes/services or camelCase for functions/modules.  A single responsibility is enforced by splitting features into minimal, focused units.

## 🎯 Design Patterns & Conventions

- **Service layer** pattern: Controllers delegate work to services; services may call other services but not controllers.  
- **Domain validation**: Uses `Yup` schemas inside services and throws `AppError` on failure.  
- **Error handling**: Central `AppError` class; express-async-errors used for async controllers.  
- **Event notifications**: `libs/socket.ts` exports `getIO()`; controllers/services emit events for realtime updates.  
- **Configuration**: Environment variables loaded via `dotenv` in `src/config-env.ts`; use `process.env` variables.  
- **Database migrations/seeds** handled by Sequelize CLI; models live in `src/models` and are registered via `src/app/database.ts`.  
- **Queue jobs**: `bull` with separate job classes; jobs dispatched from services via `Queue.add()`.  
- **TypeScript strictness**: Interfaces/types used for request payloads, service args, and returns.  
- **Coding style**: ESLint (Airbnb) + Prettier; follow existing indentation, semicolons, and import ordering.  
- **Tests**: Write unit tests in `__tests__` next to the feature and use factories/faker for data.  

## ✅ When adding new features

1. **Understand the requirement** and ask clarifying questions.  
2. **Define new route(s)** and register them in the appropriate router.  
3. **Implement controller(s)** in `src/controllers` – keep them thin.  
4. **Create service(s)** for each business operation; validate input with `Yup` and use `AppError` for errors.  
5. **Add or extend model(s)** only if the feature needs new tables/fields; update migrations accordingly.  
6. **Update helpers/utils** if a common utility can be reused.  
7. **Emit socket events** when state changes, following the pattern `tenantId:resource`.  
8. **Add jobs** under `src/jobs` if background processing is required.  
9. **Write unit tests** covering controllers and services; mocks or in-memory DB may be used.  
10. **Respect existing naming/formatting**; run `npm run build` and `npm test` to verify.  

## 💡 Clean code reminders

- Aim for descriptive function/class names.  
- Keep functions short (< 40 lines) and avoid deep nesting.  
- Prefer `async/await` over raw promises.  
- Use interface/type aliases for complex objects.  
- Avoid magic numbers/strings; use constants or environment variables.  
- Document non‑obvious business rules with comments.  

## 📌 Interaction with the agent

Whenever you ask Copilot within this workspace:

- It should **review existing files** in the same feature to mimic structure.  
- It should **not generate unrelated helper libraries**; keep solutions within the established folders.  
- It should **prompt you with questions** if the spec is ambiguous or if a new pattern is required.  


---

These instructions are project‑specific; updating this file will adjust Copilot’s behaviour accordingly.