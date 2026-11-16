import pool from "../db/database.js";

const examSelect = `
  SELECT e.id, e.course_id, e.student_id, e.grade,
         c.name AS course,
         s.name AS student,
         g.name AS grade_name,
         g.description AS grade_description,
         g.result AS grade_result
  FROM exams e
  JOIN courses c ON c.id = e.course_id
  JOIN students s ON s.id = e.student_id
  JOIN grades g ON g.letter = e.grade
`;

export async function findAllExams() {
  const { rows } = await pool.query(`${examSelect} ORDER BY e.id`);
  return rows;
}

export async function findExamById(id) {
  const { rows } = await pool.query(`${examSelect} WHERE e.id = $1`, [id]);
  return rows[0];
}

export async function createExam(courseId, studentId, grade) {
  const { rows } = await pool.query(
    "INSERT INTO exams (course_id, student_id, grade) VALUES ($1, $2, $3) RETURNING id",
    [courseId, studentId, grade],
  );
  return rows[0].id;
}

export async function updateExam(id, courseId, studentId, grade) {
  return pool.query(
    "UPDATE exams SET course_id = $1, student_id = $2, grade = $3 WHERE id = $4",
    [courseId, studentId, grade, id],
  );
}

export async function deleteExam(id) {
  return pool.query("DELETE FROM exams WHERE id = $1", [id]);
}
