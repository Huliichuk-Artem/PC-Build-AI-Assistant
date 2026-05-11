import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const setupQuery = `
DROP TABLE IF EXISTS processors CASCADE;
DROP TABLE IF EXISTS motherboards CASCADE;

CREATE TABLE processors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    socket VARCHAR(50) NOT NULL,
    tdp INT,
    cores INT
);

CREATE TABLE motherboards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    socket VARCHAR(50) NOT NULL,
    form_factor VARCHAR(50) NOT NULL
);

-- Розширений каталог процесорів
INSERT INTO processors (name, socket, tdp, cores) VALUES
('Ryzen 5 7600', 'AM5', 65, 6),
('Ryzen 7 7800X3D', 'AM5', 120, 8),
('Ryzen 9 7950X', 'AM5', 170, 16),
('Ryzen 5 5600X', 'AM4', 65, 6),
('Ryzen 7 5800X3D', 'AM4', 105, 8),
('Intel Core i5-12400F', 'LGA1700', 65, 6),
('Intel Core i5-13600K', 'LGA1700', 125, 14),
('Intel Core i7-14700K', 'LGA1700', 125, 20),
('Intel Core i9-14900K', 'LGA1700', 125, 24);

-- Розширений каталог материнських плат
INSERT INTO motherboards (name, socket, form_factor) VALUES
('ASUS TUF GAMING B650-PLUS', 'AM5', 'ATX'),
('Gigabyte A620M S2H', 'AM5', 'Micro-ATX'),
('MSI MAG X670E TOMAHAWK WIFI', 'AM5', 'ATX'),
('ASUS ROG STRIX B550-F GAMING', 'AM4', 'ATX'),
('MSI B450 TOMAHAWK MAX', 'AM4', 'ATX'),
('MSI PRO H610M-G', 'LGA1700', 'Micro-ATX'),
('Gigabyte B760 GAMING X AX', 'LGA1700', 'ATX'),
('MSI MAG Z790 TOMAHAWK WIFI', 'LGA1700', 'ATX');
`;

async function runSetup() {
    try {
        console.log(`Підключаємось до бази: ${process.env.DB_NAME}...`);
        await pool.query(setupQuery);
        console.log("✅ Успіх! Таблиці створено і тестові деталі додано.");
    } catch (err) {
        console.error("❌ Помилка:", err);
    } finally {
        await pool.end();
    }
}

runSetup();