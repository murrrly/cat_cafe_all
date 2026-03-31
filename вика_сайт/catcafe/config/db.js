/* ===== db.js ===== */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'cat12345',
    database: process.env.DB_NAME || 'catcafe_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '+00:00'
});

// Функция для проверки соединения
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ База данных подключена успешно!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Ошибка подключения к базе данных:', error.message);
        return false;
    }
};

// Экспортируем пул и функцию проверки
module.exports = {
    pool,
    testConnection
};