const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Подключение к БД дддддддд
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'catcafe_db'
});

db.connect(err => {
    if (err) console.error('❌ Ошибка БД:', err.message);
    else console.log('✅ База данных подключена');
});

// Статика
app.use(express.static(__dirname));

// Парсинг JSON
app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cat.html'));
});

// API: меню
app.get('/api/menu', (req, res) => {
    const query = `
        SELECT m.ID, m.Name, m.Composition, m.Price, m.ImageURL, c.Name as CategoryName
        FROM Menu m
        LEFT JOIN Categories c ON m.CategoryID = c.ID
        ORDER BY c.Name, m.Name
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ========== АВТОРИЗАЦИЯ ==========

// Функция для определения названия таблицы пользователей
function getUsersTableName(callback) {
    // Пробуем разные варианты названий
    const possibleNames = ['Пользователи', 'Users', 'пользователи', 'users'];
    
    function tryNext(index) {
        if (index >= possibleNames.length) {
            // Ни одно название не подошло
            callback(null);
            return;
        }
        
        const tableName = possibleNames[index];
        db.query(`SELECT 1 FROM ${tableName} LIMIT 1`, (err) => {
            if (!err) {
                // Таблица существует
                callback(tableName);
            } else {
                // Пробуем следующее название
                tryNext(index + 1);
            }
        });
    }
    
    tryNext(0);
}

// Регистрация
app.post('/api/register', express.json(), (req, res) => {
    const { name, email, password } = req.body;
    
    // Сначала определяем название таблицы
    getUsersTableName((tableName) => {
        if (!tableName) {
            return res.status(500).json({ error: 'Не найдена таблица пользователей в базе данных' });
        }
        
        // Проверяем, есть ли уже такой пользователь
        db.query(`SELECT * FROM ${tableName} WHERE Login = ?`, [email], (err, results) => {
            if (err) {
                console.error('Ошибка при проверке пользователя:', err);
                return res.status(500).json({ error: 'Ошибка базы данных: ' + err.message });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }
            
            // Правильный формат даты для MySQL (YYYY-MM-DD HH:MM:SS)
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            const registrationDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            
            // 👇 ИСПРАВЛЕНО: PositionID = 6 (Гость), а не 3 (Повар)
            const positionId = 6;
            
            // Добавляем нового пользователя
            db.query(
                `INSERT INTO ${tableName} (PositionID, FullName, RegistrationDate, Login, Password, IsActive) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [positionId, name, registrationDate, email, password, true],
                (err, result) => {
                    if (err) {
                        console.error('Ошибка при добавлении пользователя:', err);
                        return res.status(500).json({ error: 'Ошибка базы данных: ' + err.message });
                    }
                    
                    res.json({ 
                        success: true, 
                        user: {
                            id: result.insertId,
                            name: name,
                            email: email
                        }
                    });
                }
            );
        });
    });
});

// Вход
app.post('/api/login', express.json(), (req, res) => {
    const { email, password } = req.body;
    
    getUsersTableName((tableName) => {
        if (!tableName) {
            return res.status(500).json({ error: 'Не найдена таблица пользователей в базе данных' });
        }
        
        db.query(
            `SELECT ID, FullName as Name, Login as Email 
             FROM ${tableName} 
             WHERE Login = ? AND Password = ? AND IsActive = true`,
            [email, password],
            (err, results) => {
                if (err) {
                    console.error('Ошибка при входе:', err);
                    return res.status(500).json({ error: 'Ошибка базы данных: ' + err.message });
                }
                
                if (results.length > 0) {
                    res.json({ 
                        success: true, 
                        user: {
                            id: results[0].ID,
                            name: results[0].Name,
                            email: results[0].Email
                        }
                    });
                } else {
                    res.status(400).json({ error: 'Неверный email или пароль' });
                }
            }
        );
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});