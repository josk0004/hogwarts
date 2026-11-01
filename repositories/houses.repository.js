import pool from "../db/database.js";

export async function findAllHouses() {
  const { rows } = await pool.query("SELECT id, name FROM houses ORDER BY id");
  return rows;
}

export async function findHouseById(id) {
  const { rows } = await pool.query("SELECT id, name FROM houses WHERE id = $1", [id]);
  return rows[0];
}
