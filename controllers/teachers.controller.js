import {
  findAllTeachers,
  findTeacherById,
  createTeacher as insertTeacher,
  updateTeacher as saveTeacher,
  deleteTeacher as removeTeacher,
} from "../repositories/teachers.repository.js";
import { tryParseDto } from "../dtos/common.js";
import { IdDto } from "../dtos/id.dto.js";
import { TeacherDto } from "../dtos/teacher.dto.js";

export async function getTeachers(req, res) {
  try {
    res.json(await findAllTeachers());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getTeacher(req, res) {
  const parsed = tryParseDto(IdDto, { id: req.params.id });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const { id } = parsed.data;
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
  const parsed = tryParseDto(TeacherDto, req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const value = parsed.data;
  try {
    const id = await insertTeacher(
      value.name,
      value.houseId,
      value.employmentStart,
      value.currentlyActive,
      value.deceased,
    );
    res.status(201).json(await findTeacherById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "house_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateTeacher(req, res) {
  const idResult = tryParseDto(IdDto, { id: req.params.id });
  if (idResult.error) return res.status(400).json({ error: idResult.error });
  const valueResult = tryParseDto(TeacherDto, req.body);
  if (valueResult.error) return res.status(400).json({ error: valueResult.error });
  const { id } = idResult.data;
  const value = valueResult.data;
  try {
    const result = await saveTeacher(
      id,
      value.name,
      value.houseId,
      value.employmentStart,
      value.currentlyActive,
      value.deceased,
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Teacher not found" });
    res.json(await findTeacherById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "house_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteTeacher(req, res) {
  const parsed = tryParseDto(IdDto, { id: req.params.id });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const { id } = parsed.data;
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
