import { pool } from "../../config/db";

export const searchTrains = async (
  source: string,
  destination: string
) => {
  const res = await pool.query(
    `SELECT * FROM trains WHERE source = $1 AND destination = $2`,
    [source, destination]
  );

  return res.rows;
};

export const getAvailability = async (scheduleId: string) => {
  const res = await pool.query(
    `SELECT COUNT(*) FROM seats 
     WHERE schedule_id = $1 AND status = 'AVAILABLE'`,
    [scheduleId]
  );

  return Number(res.rows[0].count);
};