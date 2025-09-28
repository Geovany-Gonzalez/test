-- SCHEMA PORTABLE (sirve en Render y local)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | in_progress | done
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_tasks (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  role    VARCHAR(20) NOT NULL DEFAULT 'owner', -- owner | collab
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, task_id)
);
