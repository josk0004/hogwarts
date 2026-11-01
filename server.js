import express from "express";

import housesRouter from "./routes/houses.routes.js";
import teachersRouter from "./routes/teachers.routes.js";
import studentsRouter from "./routes/students.routes.js";
import coursesRouter from "./routes/courses.routes.js";

const app = express();
app.use(express.json());

app.use("/houses", housesRouter);
app.use("/teachers", teachersRouter);
app.use("/students", studentsRouter);
app.use("/courses", coursesRouter);

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
