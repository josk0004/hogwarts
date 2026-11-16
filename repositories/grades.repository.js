import pool from "../db/database.js";

const gradeSelect = `
  SELECT letter, name, description, result
  FROM grades
`;

export async function findAllGrades() {
  const { rows } = await pool.query(`${gradeSelect} ORDER BY letter`);
  return rows;
}

export async function findGradeByLetter(letter) {
  const { rows } = await pool.query(`${gradeSelect} WHERE letter = $1`, [letter]);
  return rows[0];
}
