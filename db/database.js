import "dotenv/config";

import { Pool, types } from "pg";

// parse date as string instead of Date object
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "hogwarts",
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,
});

export default pool;
