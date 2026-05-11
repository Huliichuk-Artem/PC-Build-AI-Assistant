import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

export const findPartInDB = async (partName) => {
    try {
        const procQuery = 'SELECT *, \'processor\' as type FROM processors WHERE name ILIKE $1';
        const mbQuery = 'SELECT *, \'motherboard\' as type FROM motherboards WHERE name ILIKE $1';
        
        const procResult = await pool.query(procQuery, [`%${partName}%`]);
        if (procResult.rows.length > 0) return procResult.rows[0];

        const mbResult = await pool.query(mbQuery, [`%${partName}%`]);
        if (mbResult.rows.length > 0) return mbResult.rows[0];

        return { error: "Компонент не знайдено в базі даних" };
    } catch (err) {
        console.error("Помилка БД:", err);
        throw err;
    }
};