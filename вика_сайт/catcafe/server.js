const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Подключение к БД
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cat12345',
    database: 'catcafe_db'
});

db.connect(err => {
    if (err) console.error('❌ Ошибка БД:', err.message);
    else console.log('✅ База данных подключена');
});

// Статика
app.use(express.static(__dirname));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cat.html'));
});

// API: меню
app.get('/api/menu', (req, res) => {
    const query = `
        SELECT m.Name, m.Composition, m.Price, m.ImageURL, c.Name as CategoryName
        FROM Menu m
        LEFT JOIN Categories c ON m.CategoryID = c.ID
        ORDER BY c.Name, m.Name
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});
