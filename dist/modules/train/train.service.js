"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailability = exports.searchTrains = void 0;
const db_1 = require("../../config/db");
const searchTrains = async (source, destination) => {
    const res = await db_1.pool.query(`SELECT * FROM trains WHERE source = $1 AND destination = $2`, [source, destination]);
    return res.rows;
};
exports.searchTrains = searchTrains;
const getAvailability = async (scheduleId) => {
    const res = await db_1.pool.query(`SELECT COUNT(*) FROM seats 
     WHERE schedule_id = $1 AND status = 'AVAILABLE'`, [scheduleId]);
    return Number(res.rows[0].count);
};
exports.getAvailability = getAvailability;
