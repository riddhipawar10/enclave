# Enclave

**A multi-tenant project management system with role-based access control, real-time collaboration, and AI-powered task assistance.**


## Features

- **Multi-tenant architecture** — every organization operates in a fully isolated workspace; data never leaks between tenants
- **Role-Based Access Control (RBAC)** — Admin, Manager, and Team Member roles, each with distinct permissions enforced at the API level
- **Real-time collaboration** — task and board updates sync instantly across all connected users via WebSockets
- **Kanban-style task board** — drag-and-drop task management with status tracking
- **Audit logging** — every significant action is recorded with who did it and when
- **AI-powered assistance** — auto-generated task descriptions and priority suggestions
- **Analytics dashboard** — task completion rates, overdue tasks, and workload distribution

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.x, Spring Security, Spring Data JPA |
| Authentication | JWT (JSON Web Tokens) |
| Real-time | Spring WebSocket (STOMP protocol) |
| Database | PostgreSQL |
| Caching / Pub-Sub | Redis |
| Frontend | React (Vite), Tailwind CSS |
| AI Integration | Gemini / OpenAI API |
| Containerization | Docker & Docker Compose |
| Version Control | Git & GitHub |

---

## Project Structure

```
Enclave/
├── backend/          # Spring Boot application
├── frontend/         # React application
├── docs/             # Synopsis, diagrams, and documentation
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
Make sure you have the following installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Java 17 (JDK)](https://adoptium.net/)
- [Node.js (LTS recommended)](https://nodejs.org/)
- [Git](https://git-scm.com/)

### 1. Clone the repository
```bash
git clone https://github.com/riddhipawar10/enclave.git
cd enclave
```

### 2. Start PostgreSQL and Redis
```bash
docker-compose up -d
```

### 3. Run the backend
```bash
cd backend
./mvnw spring-boot:run
```
The backend will start on `http://localhost:8080`

### 4. Run the frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`

---

## License

This project was developed as part of an academic mini-project and is not licensed for commercial use.
