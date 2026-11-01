import pool from "../db/database.js";

const teacherSelect = `
  SELECT t.id, t.name, t.house_id, h.name AS house
  FROM teachers t
  JOIN houses h ON h.id = t.house_id
`;

export async function findAllTeachers() {
  const { rows } = await pool.query(`${teacherSelect} ORDER BY t.id`);
  return rows;
}

export async function findTeacherById(id) {
  const { rows } = await pool.query(`${teacherSelect} WHERE t.id = $1`, [id]);
  return rows[0];
}

export async function createTeacher(name, houseId) {
  const { rows } = await pool.query(
    "INSERT INTO teachers (name, house_id) VALUES ($1, $2) RETURNING id",
    [name, houseId],
  );
  return rows[0].id;
}

export async function updateTeacher(id, name, houseId) {
  return pool.query("UPDATE teachers SET name = $1, house_id = $2 WHERE id = $3", [
    name,
    houseId,
    id,
  ]);
}

export async function deleteTeacher(id) {
  return pool.query("DELETE FROM teachers WHERE id = $1", [id]);
}
