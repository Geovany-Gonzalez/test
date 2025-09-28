import { Router } from "express";
import { pool } from "./db.js";

const router = Router();

/** POST /tasks  body: { userId, title, description } */
router.post("/", async (req, res) => {
  try {
    const { userId, title, description } = req.body ?? {};
    if (!userId || !title) return res.status(400).json({ error: "Missing fields" });

    const t = await pool.query(
      "INSERT INTO tasks(title, description) VALUES($1,$2) RETURNING *",
      [title, description ?? null]
    );
    const task = t.rows[0];

    await pool.query(
      "INSERT INTO user_tasks(user_id, task_id, role) VALUES($1,$2,'owner') ON CONFLICT DO NOTHING",
      [userId, task.id]
    );

    res.status(201).json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** GET /tasks/:userId  -> tareas del usuario (owner|collab) */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await pool.query(
      `SELECT t.*
         FROM tasks t
         JOIN user_tasks ut ON ut.task_id = t.id
        WHERE ut.user_id = $1
        ORDER BY t.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** PUT /tasks/:id/status  -> pending -> in_progress -> done */
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const cur = await pool.query("SELECT status FROM tasks WHERE id=$1", [id]);
    if (!cur.rowCount) return res.status(404).json({ error: "Task not found" });

    const flow = ["pending", "in_progress", "done"];
    const next = flow[Math.min(flow.indexOf(cur.rows[0].status) + 1, 2)];
    const upd = await pool.query("UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *", [next, id]);
    res.json(upd.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
