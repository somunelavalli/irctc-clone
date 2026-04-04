import { pool } from "../../config/db";
import { redis } from "../../config/redis";

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
  const cacheKey = `availability:${scheduleId}`;
  console.log(`Checking availability for schedule ${scheduleId}`);

  // 1️⃣ Check Redis
  const cached = await redis.get(cacheKey);

  if (cached) {
    console.log(`Cache hit for schedule ${scheduleId}`);
    return Number(cached);
  }

  // 2️⃣ Fetch from DB
  const res = await pool.query(
    `SELECT COUNT(*) FROM seats 
     WHERE schedule_id = $1 AND status = 'AVAILABLE'`,
    [scheduleId]
  );

  const count = Number(res.rows[0].count);

  // 3️⃣ Store in Redis (TTL 60 sec)
  await redis.set(cacheKey, count, "EX", 60);
  console.log(`Cache set for schedule ${scheduleId} with ${count} seats`);

  return count;
};