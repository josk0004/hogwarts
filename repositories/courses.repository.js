import pool from "../db/database.js";

const courseSelect = `
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

export async function findAllCourses() {
  const { rows } = await pool.query(`${courseSelect} GROUP BY c.id, t.id ORDER BY c.id`);
  return rows;
}

export async function findCourseById(id) {
  const { rows } = await pool.query(`${courseSelect} WHERE c.id = $1 GROUP BY c.id, t.id`, [id]);
  return rows[0];
}

export async function createCourse(name, teacherId) {
  const { rows } = await pool.query(
    "INSERT INTO courses (name, teacher_id) VALUES ($1, $2) RETURNING id",
    [name, teacherId],
  );
  return rows[0].id;
}

export async function updateCourseName(id, name) {
  return pool.query("UPDATE courses SET name = $1 WHERE id = $2", [name, id]);
}

export async function updateCourseTeacher(id, teacherId) {
  return pool.query("UPDATE courses SET teacher_id = $1 WHERE id = $2", [teacherId, id]);
}

export async function addStudentToCourse(courseId, studentId) {
  return pool.query("INSERT INTO course_students (course_id, student_id) VALUES ($1, $2)", [
    courseId,
    studentId,
  ]);
}

export async function removeStudentFromCourse(courseId, studentId) {
  return pool.query(
    "DELETE FROM course_students WHERE course_id = $1 AND student_id = $2",
    [courseId, studentId],
  );
}

export async function deleteCourse(id) {
  return pool.query("DELETE FROM courses WHERE id = $1", [id]);
}
