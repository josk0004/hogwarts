import {
  findAllCourses,
  findCourseById,
  createCourse as insertCourse,
  updateCourse as updateCourseFields,
  updateCourseTeacher,
  addStudentToCourse as insertStudent,
  removeStudentFromCourse as deleteStudent,
  deleteCourse as removeCourse,
} from "../repositories/courses.repository.js";
import { CourseDetailsDto, CourseDto, StudentIdDto, TeacherIdDto } from "../dtos/course.dto.js";
import { IdDto } from "../dtos/id.dto.js";
import { tryParseDto } from "../dtos/common.js";

export async function getCourses(req, res) {
  try {
    res.json(await findAllCourses());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getCourse(req, res) {
  const parsed = tryParseDto(IdDto, { id: req.params.id });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const { id } = parsed.data;
  try {
    const course = await findCourseById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function createCourse(req, res) {
  const parsed = tryParseDto(CourseDto, req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const value = parsed.data;
  try {
    const id = await insertCourse(
      value.name,
      value.teacherId,
      value.type,
      value.level,
      value.schoolYear,
    );
    res.status(201).json(await findCourseById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "teacher_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateCourse(req, res) {
  const idResult = tryParseDto(IdDto, { id: req.params.id });
  if (idResult.error) return res.status(400).json({ error: idResult.error });
  const valueResult = tryParseDto(CourseDetailsDto, req.body);
  if (valueResult.error) return res.status(400).json({ error: valueResult.error });
  const { id } = idResult.data;
  const value = valueResult.data;
  try {
    const result = await updateCourseFields(
      id,
      value.name,
      value.type,
      value.level,
      value.schoolYear,
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Course not found" });
    res.json(await findCourseById(id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function changeCourseTeacher(req, res) {
  const idResult = tryParseDto(IdDto, { id: req.params.id });
  if (idResult.error) return res.status(400).json({ error: idResult.error });
  const teacherResult = tryParseDto(TeacherIdDto, req.body);
  if (teacherResult.error) return res.status(400).json({ error: teacherResult.error });
  const { id } = idResult.data;
  const { teacherId } = teacherResult.data;
  try {
    const result = await updateCourseTeacher(id, teacherId);
    if (result.rowCount === 0) return res.status(404).json({ error: "Course not found" });
    res.json(await findCourseById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "teacher_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function addStudentToCourse(req, res) {
  const idResult = tryParseDto(IdDto, { id: req.params.id });
  if (idResult.error) return res.status(400).json({ error: idResult.error });
  const studentResult = tryParseDto(StudentIdDto, req.body);
  if (studentResult.error) return res.status(400).json({ error: studentResult.error });
  const { id } = idResult.data;
  const { studentId } = studentResult.data;
  try {
    if (!(await findCourseById(id))) return res.status(404).json({ error: "Course not found" });
    await insertStudent(id, studentId);
    res.status(201).json(await findCourseById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "student_id does not exist" });
    if (error.code === "23505") return res.status(409).json({ error: "Student is already in this course" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function removeStudentFromCourse(req, res) {
  const idResult = tryParseDto(IdDto, { id: req.params.id });
  const studentResult = tryParseDto(IdDto, { id: req.params.studentId });
  if (idResult.error || studentResult.error) {
    return res.status(400).json({ error: idResult.error || studentResult.error });
  }
  const { id } = idResult.data;
  const { id: studentId } = studentResult.data;
  try {
    if (!(await findCourseById(id))) return res.status(404).json({ error: "Course not found" });
    const result = await deleteStudent(id, studentId);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student is not in this course" });
    }
    res.json(await findCourseById(id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteCourse(req, res) {
  const parsed = tryParseDto(IdDto, { id: req.params.id });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const { id } = parsed.data;
  try {
    const result = await removeCourse(id);
    if (result.rowCount === 0) return res.status(404).json({ error: "Course not found" });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
