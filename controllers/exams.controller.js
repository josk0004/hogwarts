import {
  findAllExams,
  findExamById,
  createExam as insertExam,
  updateExam as saveExam,
  deleteExam as removeExam,
} from "../repositories/exams.repository.js";
import { tryParseDto } from "../dtos/common.js";
import { ExamDto } from "../dtos/exam.dto.js";
import { IdDto } from "../dtos/id.dto.js";

function handleExamConstraint(error, res) {
  if (error.code === "23503") {
    return res.status(400).json({
      error: "course_id, student_id, and grade must exist, and the student must be enrolled",
    });
  }
  if (error.code === "23505") {
    return res.status(409).json({ error: "This student already has an exam for this course" });
  }
  return null;
}

export async function getExams(req, res) {
  try {
    res.json(await findAllExams());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getExam(req, res) {
  const parsed = tryParseDto(IdDto, { id: req.params.id });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const { id } = parsed.data;
  try {
    const exam = await findExamById(id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function createExam(req, res) {
  const parsed = tryParseDto(ExamDto, req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const value = parsed.data;
  try {
    const id = await insertExam(value.courseId, value.studentId, value.grade);
    res.status(201).json(await findExamById(id));
  } catch (error) {
    if (handleExamConstraint(error, res)) return;
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateExam(req, res) {
  const idResult = tryParseDto(IdDto, { id: req.params.id });
  if (idResult.error) return res.status(400).json({ error: idResult.error });
  const valueResult = tryParseDto(ExamDto, req.body);
  if (valueResult.error) return res.status(400).json({ error: valueResult.error });
  const { id } = idResult.data;
  const value = valueResult.data;
  try {
    const result = await saveExam(id, value.courseId, value.studentId, value.grade);
    if (result.rowCount === 0) return res.status(404).json({ error: "Exam not found" });
    res.json(await findExamById(id));
  } catch (error) {
    if (handleExamConstraint(error, res)) return;
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteExam(req, res) {
  const parsed = tryParseDto(IdDto, { id: req.params.id });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const { id } = parsed.data;
  try {
    const result = await removeExam(id);
    if (result.rowCount === 0) return res.status(404).json({ error: "Exam not found" });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
