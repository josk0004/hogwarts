const express = require("express");
const multer = require("multer");
const upload = multer();
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "hogwarts",
  password: "GLcqu4PZxI1Tzh",
  port: 5432,
});

// ------------------------------------------------Houses------------------------------------------------

// GET /houses
app.get("/houses", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name FROM houses ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /houses/:id
app.get("/houses/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const { rows } = await pool.query("SELECT id, name FROM houses WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "House not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------------------------------------Teachers------------------------------------------------

// GET /teachers: list all teachers with their house name
app.get("/teachers", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.id, t.name, t.house_id, h.name AS house
      FROM teachers t
      JOIN houses h ON h.id = t.house_id
      ORDER BY t.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /teachers/:id: get a single teacher
app.get("/teachers/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.name, t.house_id, h.name AS house
       FROM teachers t
       JOIN houses h ON h.id = t.house_id
       WHERE t.id = $1`,
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Helper: fetch one teacher with their house name
async function findTeacher(id) {
  const { rows } = await pool.query(
    `SELECT t.id, t.name, t.house_id, h.name AS house
     FROM teachers t
     JOIN houses h ON h.id = t.house_id
     WHERE t.id = $1`,
    [id],
  );
  return rows[0];
}

// Helper: validate the body for POST and PUT
function validateTeacher(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const raw = body?.house_id;
  const houseId = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
  if (!name) return { error: "name is required" };
  if (!Number.isInteger(houseId)) return { error: "house_id must be an integer" };
  return { name, houseId };
}

// POST /teachers: create a teacher
app.post("/teachers", upload.none(), async (req, res) => {
  const v = validateTeacher(req.body);
  if (v.error) return res.status(400).json({ error: v.error });

  try {
    const { rows } = await pool.query(
      "INSERT INTO teachers (name, house_id) VALUES ($1, $2) RETURNING id",
      [v.name, v.houseId],
    );
    const teacher = await findTeacher(rows[0].id);
    res.status(201).json(teacher);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "house_id does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /teachers/:id: replace a teacher's name and house
app.put("/teachers/:id", upload.none(), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const v = validateTeacher(req.body);
  if (v.error) return res.status(400).json({ error: v.error });

  try {
    const result = await pool.query("UPDATE teachers SET name = $1, house_id = $2 WHERE id = $3", [
      v.name,
      v.houseId,
      id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    const teacher = await findTeacher(id);
    res.json(teacher);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "house_id does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /teachers/:id: delete a teacher
app.delete("/teachers/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const result = await pool.query("DELETE FROM teachers WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.status(204).send();
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ error: "Teacher still has courses" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------------------------Students------------------------------------------------

// Helper: fetch one student with their house name
async function findStudent(id) {
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.house_id, h.name AS house
     FROM students s
     JOIN houses h ON h.id = s.house_id
     WHERE s.id = $1`,
    [id],
  );
  return rows[0];
}

// Helper: validate the body for POST and PUT
function validateStudent(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const raw = body?.house_id;
  const houseId = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;

  if (!name) return { error: "name is required" };
  if (!Number.isInteger(houseId)) return { error: "house_id must be an integer" };
  return { name, houseId };
}

// GET /students: list all students
app.get("/students", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.name, s.house_id, h.name AS house
      FROM students s
      JOIN houses h ON h.id = s.house_id
      ORDER BY s.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /students/:id: get a single student
app.get("/students/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const student = await findStudent(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /students: create a student
app.post("/students", upload.none(), async (req, res) => {
  const v = validateStudent(req.body);
  if (v.error) return res.status(400).json({ error: v.error });

  try {
    const { rows } = await pool.query(
      "INSERT INTO students (name, house_id) VALUES ($1, $2) RETURNING id",
      [v.name, v.houseId],
    );
    const student = await findStudent(rows[0].id);
    res.status(201).json(student);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "house_id does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /students/:id: replace a student's name and house
app.put("/students/:id", upload.none(), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const v = validateStudent(req.body);
  if (v.error) return res.status(400).json({ error: v.error });

  try {
    const result = await pool.query("UPDATE students SET name = $1, house_id = $2 WHERE id = $3", [
      v.name,
      v.houseId,
      id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    const student = await findStudent(id);
    res.json(student);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "house_id does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /students/:id: delete a student
app.delete("/students/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const result = await pool.query("DELETE FROM students WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------------------------Courses------------------------------------------------

// Parses a number or numeric string into an integer, or returns null
function toInt(v) {
  if (typeof v === "string" && v.trim() !== "") v = Number(v);
  return Number.isInteger(v) ? v : null;
}

// Base query: a course with its teacher and students as JSON
const COURSE_SELECT = `
  SELECT c.id, c.name, c.teacher_id,
         json_build_object('id', t.id, 'name', t.name) AS teacher,
         COALESCE(
           json_agg(json_build_object('id', s.id, 'name', s.name) ORDER BY s.id)
             FILTER (WHERE s.id IS NOT NULL),
           '[]'
         ) AS students
  FROM courses c
  JOIN teachers t ON t.id = c.teacher_id
  LEFT JOIN course_students cs ON cs.course_id = c.id
  LEFT JOIN students s ON s.id = cs.student_id
`;

async function findCourse(id) {
  const { rows } = await pool.query(`${COURSE_SELECT} WHERE c.id = $1 GROUP BY c.id, t.id`, [id]);
  return rows[0];
}

// POST /courses: create a course (name + teacher_id)
app.post("/courses", upload.none(), async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const teacherId = toInt(req.body?.teacher_id);
  if (!name) return res.status(400).json({ error: "name is required" });
  if (teacherId === null) {
    return res.status(400).json({ error: "teacher_id must be an integer" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO courses (name, teacher_id) VALUES ($1, $2) RETURNING id",
      [name, teacherId],
    );
    res.status(201).json(await findCourse(rows[0].id));
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "teacher_id does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /courses: list all courses
app.get("/courses", async (req, res) => {
  try {
    const { rows } = await pool.query(`${COURSE_SELECT} GROUP BY c.id, t.id ORDER BY c.id`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /courses/:id: get a single course
app.get("/courses/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const course = await findCourse(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /courses/:id: update an existing course's name
app.put("/courses/:id", upload.none(), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) return res.status(400).json({ error: "name is required" });

  try {
    const result = await pool.query("UPDATE courses SET name = $1 WHERE id = $2", [name, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(await findCourse(id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /courses/:id/teacher: change the course's teacher
app.put("/courses/:id/teacher", upload.none(), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const teacherId = toInt(req.body?.teacher_id);
  if (teacherId === null) {
    return res.status(400).json({ error: "teacher_id must be an integer" });
  }

  try {
    const result = await pool.query("UPDATE courses SET teacher_id = $1 WHERE id = $2", [
      teacherId,
      id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(await findCourse(id));
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "teacher_id does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /courses/:id/students: add a student to the course
app.post("/courses/:id/students", upload.none(), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const studentId = toInt(req.body?.student_id);
  if (studentId === null) {
    return res.status(400).json({ error: "student_id must be an integer" });
  }

  try {
    if (!(await findCourse(id))) {
      return res.status(404).json({ error: "Course not found" });
    }
    await pool.query("INSERT INTO course_students (course_id, student_id) VALUES ($1, $2)", [
      id,
      studentId,
    ]);
    res.status(201).json(await findCourse(id));
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "student_id does not exist" });
    }
    if (err.code === "23505") {
      return res.status(409).json({ error: "Student is already in this course" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /courses/:id/students/:studentId: remove a student from the course
app.delete("/courses/:id/students/:studentId", async (req, res) => {
  const id = Number(req.params.id);
  const studentId = Number(req.params.studentId);
  if (!Number.isInteger(id) || !Number.isInteger(studentId)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    if (!(await findCourse(id))) {
      return res.status(404).json({ error: "Course not found" });
    }
    const result = await pool.query(
      "DELETE FROM course_students WHERE course_id = $1 AND student_id = $2",
      [id, studentId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student is not in this course" });
    }
    res.json(await findCourse(id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /courses/:id: delete a course
app.delete("/courses/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const result = await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------------------------Start Server------------------------------------------------

app.listen(3001, () => {
  console.log(`Server is running on http://localhost:3001`);
});
