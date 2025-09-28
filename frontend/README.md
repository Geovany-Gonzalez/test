# Student Tasks (Node + PostgreSQL + HTML/CSS/JS)

Relación **N:M** entre usuarios y tareas mediante `user_tasks` con roles (`owner|collab`).

## Estructura
- `backend/` API Node (Express, pg).
- `frontend/` HTML/CSS/JS puro.
- `backend/sql/schema.sql` crea `users`, `tasks`, `user_tasks`.

## Correr local
1) Crea la DB y tablas:
   ```bash
   psql -U postgres -h localhost -p 5432 -f backend/sql/schema.sql
