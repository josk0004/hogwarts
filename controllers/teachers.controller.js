import {
  findAllTeachers,
  findTeacherById,
  createTeacher as insertTeacher,
  updateTeacher as saveTeacher,
  deleteTeacher as removeTeacher,
} from "../repositories/teachers.repository.js";

function validateTeacher(body) {
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

export async function getTeachers(req, res) {
  try {
    res.json(await findAllTeachers());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getTeacher(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  try {
    const teacher = await findTeacherById(id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(teacher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function createTeacher(req, res) {
  const value = validateTeacher(req.body);
  if (value.error) return res.status(400).json({ error: value.error });
  try {
    const id = await insertTeacher(value.name, value.houseId);
    res.status(201).json(await findTeacherById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "house_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateTeacher(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  const value = validateTeacher(req.body);
  if (value.error) return res.status(400).json({ error: value.error });
  try {
    const result = await saveTeacher(id, value.name, value.houseId);
    if (result.rowCount === 0) return res.status(404).json({ error: "Teacher not found" });
    res.json(await findTeacherById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "house_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteTeacher(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  try {
    const result = await removeTeacher(id);
    if (result.rowCount === 0) return res.status(404).json({ error: "Teacher not found" });
    res.status(204).send();
  } catch (error) {
    if (error.code === "23503") return res.status(409).json({ error: "Teacher still has courses" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
