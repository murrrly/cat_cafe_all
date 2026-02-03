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

db.connect((err) => {
    if (err) {
        console.error('❌ Ошибка БД:', err.message);
    } else {
        console.log('✅ База данных подключена');
    }
});

// Статические файлы
app.use(express.static(__dirname));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cat.html'));
});

// API: Все товары
app.get('/api/menu', (req, res) => {
    console.log('📥 Запрос меню');
    
    const query = `
        SELECT m.Name, m.Composition, m.Price, c.Name as CategoryName 
        FROM Menu m 
        LEFT JOIN Categories c ON m.CategoryID = c.ID 
        ORDER BY c.Name, m.Name
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Ошибка запроса:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        console.log(`📊 Отправлено товаров: ${results.length}`);
        res.json(results);
    });
});

// Запуск
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/menu`);
});