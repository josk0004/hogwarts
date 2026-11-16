import pool from "../db/database.js";

const teacherSelect = `
  SELECT t.id, t.name, t.house_id, t.employment_start, t.currently_active,
         t.deceased, h.name AS house
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

export async function createTeacher(name, houseId, employmentStart, currentlyActive, deceased) {
  const { rows } = await pool.query(
    "INSERT INTO teachers (name, house_id, employment_start, currently_active, deceased) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [name, houseId, employmentStart, currentlyActive, deceased],
  );
  return rows[0].id;
}

export async function updateTeacher(id, name, houseId, employmentStart, currentlyActive, deceased) {
  return pool.query(
    "UPDATE teachers SET name = $1, house_id = $2, employment_start = $3, currently_active = $4, deceased = $5 WHERE id = $6",
    [
    name,
    houseId,
    employmentStart,
    currentlyActive,
    deceased,
    id,
    ],
  );
}

export async function deleteTeacher(id) {
  return pool.query("DELETE FROM teachers WHERE id = $1", [id]);
}
