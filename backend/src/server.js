import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import users from "./users.js";
import tasks from "./tasks.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (_, res) => res.send("Student Tasks API OK"));
app.use("/users", users);
app.use("/tasks", tasks);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
