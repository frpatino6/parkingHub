# ParkingHub

**Smart Parking Management System**

## Tech Stack

| Layer      | Technology         |
|------------|--------------------|
| Frontend   | Angular 19+        |
| Backend    | Node.js + Express  |
| Database   | MongoDB + Mongoose |
| Architecture | Clean Architecture |

## Comandos para ejecutar

**Backend** (Node 20, puerto 3000):
```cmd
cd backend
..\scripts\use-node20.cmd npm run dev
```

**Frontend** (Angular, puerto 4200):
```cmd
cd frontend
..\scripts\use-node20.cmd npm start
```

> Requiere Node 20. Si tu default es Node 12, usa `scripts\use-node20.cmd` antes de `npm`.

---

## Project Structure

```
ParkingHub/
├── frontend/                 # Angular application
├── backend/                  # Node.js API
├── .agent-skills/            # AI reference manuals (Single Source of Truth)
│   ├── angular-expert.md
│   ├── node-best-practices.md
│   ├── mongodb-optimization.md
│   ├── clean-architecture-patterns.md
│   └── professional-web-design.md
├── .cursorrules              # AI agent coding rules + context routing
├── agent-settings.json       # IDE-agnostic AI agent configuration
└── README.md
```

## AI-Assisted Development

This project uses a curated set of reference manuals in `.agent-skills/` as the **Single Source of Truth** for coding standards.

- **`.cursorrules`** forces AI agents (Cursor, Claude Code, Antigravity) to consult the relevant manuals before writing code.
- **Context routing** automatically activates the right skill sets based on which directory you're editing.

| Directory    | Activated Skills                                         |
|--------------|----------------------------------------------------------|
| `frontend/`  | Angular Expert · Professional Web Design · Clean Arch    |
| `backend/`   | Node Best Practices · MongoDB Optimization · Clean Arch  |
