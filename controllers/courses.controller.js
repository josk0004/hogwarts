import {
  findAllCourses,
  findCourseById,
  createCourse as insertCourse,
  updateCourseName,
  updateCourseTeacher,
  addStudentToCourse as insertStudent,
  removeStudentFromCourse as deleteStudent,
  deleteCourse as removeCourse,
} from "../repositories/courses.repository.js";

function toInt(value) {
  if (typeof value === "string" && value.trim() !== "") value = Number(value);
  return Number.isInteger(value) ? value : null;
}

function parseId(value) {
  return toInt(value);
}

export async function getCourses(req, res) {
  try {
    res.json(await findAllCourses());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getCourse(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
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
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const teacherId = toInt(req.body?.teacher_id);
  if (!name) return res.status(400).json({ error: "name is required" });
  if (teacherId === null) return res.status(400).json({ error: "teacher_id must be an integer" });
  try {
    const id = await insertCourse(name, teacherId);
    res.status(201).json(await findCourseById(id));
  } catch (error) {
    if (error.code === "23503") return res.status(400).json({ error: "teacher_id does not exist" });
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateCourse(req, res) {
  const id = parseId(req.params.id);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  if (!name) return res.status(400).json({ error: "name is required" });
  try {
    const result = await updateCourseName(id, name);
    if (result.rowCount === 0) return res.status(404).json({ error: "Course not found" });
    res.json(await findCourseById(id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function changeCourseTeacher(req, res) {
  const id = parseId(req.params.id);
  const teacherId = toInt(req.body?.teacher_id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  if (teacherId === null) return res.status(400).json({ error: "teacher_id must be an integer" });
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
  const id = parseId(req.params.id);
  const studentId = toInt(req.body?.student_id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  if (studentId === null) return res.status(400).json({ error: "student_id must be an integer" });
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
  const id = parseId(req.params.id);
  const studentId = parseId(req.params.studentId);
  if (id === null || studentId === null) return res.status(400).json({ error: "Invalid id" });
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
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid id" });
  try {
    const result = await removeCourse(id);
    if (result.rowCount === 0) return res.status(404).json({ error: "Course not found" });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
