"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookSeat = void 0;
const db_1 = require("../../config/db");
const bookSeat = async (userId, scheduleId) => {
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        const seatRes = await client.query(`SELECT * FROM seats 
       WHERE schedule_id = $1 AND status = 'AVAILABLE'
       LIMIT 1
       FOR UPDATE`, [scheduleId]);
        if (seatRes.rows.length === 0) {
            throw new Error("No seats available");
        }
        const seat = seatRes.rows[0];
        await client.query(`UPDATE seats SET status = 'BOOKED' WHERE id = $1`, [seat.id]);
        const bookingRes = await client.query(`INSERT INTO bookings (user_id, schedule_id, seat_id, status)
       VALUES ($1, $2, $3, 'CONFIRMED')
       RETURNING *`, [userId, scheduleId, seat.id]);
        await client.query("COMMIT");
        return bookingRes.rows[0];
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
};
exports.bookSeat = bookSeat;
