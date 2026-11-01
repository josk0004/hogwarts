import pool from "../db/database.js";

const studentSelect = `
  SELECT s.id, s.name, s.house_id, h.name AS house
  FROM students s
  JOIN houses h ON h.id = s.house_id
`;

export async function findAllStudents() {
  const { rows } = await pool.query(`${studentSelect} ORDER BY s.id`);
  return rows;
}

export async function findStudentById(id) {
  const { rows } = await pool.query(`${studentSelect} WHERE s.id = $1`, [id]);
  return rows[0];
}

export async function createStudent(name, houseId) {
  const { rows } = await pool.query(
    "INSERT INTO students (name, house_id) VALUES ($1, $2) RETURNING id",
    [name, houseId],
  );
  return rows[0].id;
}

export async function updateStudent(id, name, houseId) {
  return pool.query("UPDATE students SET name = $1, house_id = $2 WHERE id = $3", [
    name,
    houseId,
    id,
  ]);
}

export async function deleteStudent(id) {
  return pool.query("DELETE FROM students WHERE id = $1", [id]);
}
