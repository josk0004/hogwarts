import pool from "../db/database.js";

const studentSelect = `
  SELECT s.id, s.name, s.house_id, s.birthday, s.school_year, h.name AS house
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

export async function createStudent(name, houseId, birthday, schoolYear) {
  const { rows } = await pool.query(
    "INSERT INTO students (name, house_id, birthday, school_year) VALUES ($1, $2, $3, $4) RETURNING id",
    [name, houseId, birthday, schoolYear],
  );
  return rows[0].id;
}

export async function updateStudent(id, name, houseId, birthday, schoolYear) {
  return pool.query(
    "UPDATE students SET name = $1, house_id = $2, birthday = $3, school_year = $4 WHERE id = $5",
    [
    name,
    houseId,
    birthday,
    schoolYear,
    id,
    ],
  );
}

export async function deleteStudent(id) {
  return pool.query("DELETE FROM students WHERE id = $1", [id]);
}
