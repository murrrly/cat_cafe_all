const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Подключение к БД
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
    const possibleNames = ['Пользователи', 'Users', 'пользователи', 'users'];
    
    function tryNext(index) {
        if (index >= possibleNames.length) {
            callback(null);
            return;
        }
        
        const tableName = possibleNames[index];
        db.query(`SELECT 1 FROM ${tableName} LIMIT 1`, (err) => {
            if (!err) {
                callback(tableName);
            } else {
                tryNext(index + 1);
            }
        });
    }
    
    tryNext(0);
}

// Регистрация
app.post('/api/register', express.json(), (req, res) => {
    const { name, email, password } = req.body;
    
    getUsersTableName((tableName) => {
        if (!tableName) {
            return res.status(500).json({ error: 'Не найдена таблица пользователей в базе данных' });
        }
        
        db.query(`SELECT * FROM ${tableName} WHERE Login = ?`, [email], (err, results) => {
            if (err) {
                console.error('Ошибка при проверке пользователя:', err);
                return res.status(500).json({ error: 'Ошибка базы данных: ' + err.message });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }
            
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            const registrationDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            const positionId = 6; // Гость
            
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

// ========== ЗАКАЗЫ ==========

// Создание нового заказа
app.post('/api/create-order', express.json(), (req, res) => {
    const { userId, items, total, paymentType } = req.body;
    
    // Генерируем номер заказа
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const orderNumber = `ORD-${year}${month}${day}${hours}${minutes}${seconds}`;
    
    // Начинаем транзакцию
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Вставляем заказ
        db.query(
            `INSERT INTO Orders (
                OrderDate, TotalAmount, CustomerUserID, 
                PaymentType, OrderNumber, CashierUserId, StatusID, BranchID
            ) VALUES (NOW(), ?, ?, ?, ?, NULL, 1, 1)`,
            [total, userId, paymentType || 'Карта', orderNumber],
            (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Ошибка при создании заказа:', err);
                        res.status(500).json({ error: err.message });
                    });
                }
                
                const orderId = result.insertId;
                
                // Вставляем позиции заказа
                const orderItems = items.map(item => {
                    return new Promise((resolve, reject) => {
                        db.query(
                            `INSERT INTO OrderItems (OrderID, MenuID, Quantity) 
                             VALUES (?, ?, ?)`,
                            [orderId, item.id, item.quantity],
                            (err) => {
                                if (err) reject(err);
                                else resolve();
                            }
                        );
                    });
                });
                
                Promise.all(orderItems)
                    .then(() => {
                        db.commit(err => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({ error: err.message });
                                });
                            }
                            res.json({ 
                                success: true, 
                                orderId: orderId,
                                orderNumber: orderNumber
                            });
                        });
                    })
                    .catch(err => {
                        db.rollback(() => {
                            console.error('Ошибка при добавлении позиций:', err);
                            res.status(500).json({ error: err.message });
                        });
                    });
            }
        );
    });
});

// Получение истории заказов пользователя
app.get('/api/orders/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const query = `
        SELECT 
            o.ID, 
            o.OrderDate, 
            o.TotalAmount as Total,
            o.OrderNumber,
            o.PaymentType,
            os.Name as Status
        FROM Orders o
        LEFT JOIN orderstatuses os ON o.StatusID = os.ID
        WHERE o.CustomerUserID = ?
        ORDER BY o.OrderDate DESC
    `;
    
    db.query(query, [userId], (err, orders) => {
        if (err) {
            console.error('Ошибка при получении заказов:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (orders.length === 0) {
            return res.json([]);
        }
        
        // Для каждого заказа получаем позиции
        const ordersWithItems = orders.map(order => {
            return new Promise((resolve, reject) => {
                db.query(
                    `SELECT oi.Quantity, m.Name, m.Price 
                     FROM OrderItems oi
                     JOIN Menu m ON oi.MenuID = m.ID
                     WHERE oi.OrderID = ?`,
                    [order.ID],
                    (err, items) => {
                        if (err) reject(err);
                        resolve({
                            ...order,
                            items: items
                        });
                    }
                );
            });
        });
        
        Promise.all(ordersWithItems)
            .then(results => res.json(results))
            .catch(err => {
                console.error('Ошибка при получении позиций:', err);
                res.status(500).json({ error: err.message });
            });
    });
});

// Обновление профиля пользователя
app.post('/api/update-profile', express.json(), (req, res) => {
    const { userId, name } = req.body;
    
    getUsersTableName((tableName) => {
        if (!tableName) {
            return res.status(500).json({ error: 'Не найдена таблица пользователей' });
        }
        
        db.query(
            `UPDATE ${tableName} SET FullName = ? WHERE ID = ?`,
            [name, userId],
            (err, result) => {
                if (err) {
                    console.error('Ошибка при обновлении профиля:', err);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ success: true });
            }
        );
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});