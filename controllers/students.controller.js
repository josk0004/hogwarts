import {
  findAllStudents,
  findStudentById,
  createStudent as insertStudent,
  updateStudent as saveStudent,
  deleteStudent as removeStudent,
} from "../repositories/students.repository.js";

function validateStudent(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const raw = body?.house_id;
  const houseId = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
  if (!name) return { error: "name is required" };
  if (!Number.isInteger(houseId)) return { error: "house_id must be an integer" };
  return { name, houseId };
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export async function getStudents(req, res) {
  try {
    res.json(await findAllStudents());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getStudent(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  try {
    const student = await findStudentById(id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function createStudent(req, res) {
  const value = validateStudent(req.body);
  if (value.error) return res.status(400).json({ error: value.error });
  try {
    const id = await insertStudent(value.name, value.houseId);
    res.status(201).json(await findStudentById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "house_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateStudent(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  const value = validateStudent(req.body);
  if (value.error) return res.status(400).json({ error: value.error });
  try {
    const result = await saveStudent(id, value.name, value.houseId);
    if (result.rowCount === 0) return res.status(404).json({ error: "Student not found" });
    res.json(await findStudentById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "house_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteStudent(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  try {
    const result = await removeStudent(id);
    if (result.rowCount === 0) return res.status(404).json({ error: "Student not found" });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
