import {
  findAllStudents,
  findStudentById,
  createStudent as insertStudent,
  updateStudent as saveStudent,
  deleteStudent as removeStudent,
} from "../repositories/students.repository.js";
import { tryParseDto } from "../dtos/common.js";
import { IdDto } from "../dtos/id.dto.js";
import { StudentDto } from "../dtos/student.dto.js";

export async function getStudents(req, res) {
  try {
    res.json(await findAllStudents());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getStudent(req, res) {
  const parsed = tryParseDto(IdDto, { id: req.params.id });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const { id } = parsed.data;
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
  const parsed = tryParseDto(StudentDto, req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const value = parsed.data;
  try {
    const id = await insertStudent(value.name, value.houseId, value.birthday, value.schoolYear);
    res.status(201).json(await findStudentById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "house_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateStudent(req, res) {
  const idResult = tryParseDto(IdDto, { id: req.params.id });
  if (idResult.error) return res.status(400).json({ error: idResult.error });
  const valueResult = tryParseDto(StudentDto, req.body);
  if (valueResult.error) return res.status(400).json({ error: valueResult.error });
  const { id } = idResult.data;
  const value = valueResult.data;
  try {
    const result = await saveStudent(
      id,
      value.name,
      value.houseId,
      value.birthday,
      value.schoolYear,
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Student not found" });
    res.json(await findStudentById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "house_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteStudent(req, res) {
  const parsed = tryParseDto(IdDto, { id: req.params.id });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const { id } = parsed.data;
  try {
    const result = await removeStudent(id);
    if (result.rowCount === 0) return res.status(404).json({ error: "Student not found" });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
