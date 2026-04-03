import { Pool } from "pg";

export const pool = new Pool({
  user: "somunelavalli",
  host: "localhost",
  database: "irctc",
//   password: "password",
  port: 5432,
});