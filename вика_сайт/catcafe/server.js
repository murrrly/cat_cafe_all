const express = require('express');
const path = require('path');
const db = require('./config/db');  // ← подключаем БД
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;  // ← используем порт из .env или 8080

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Маршруты для страниц (ВАШ СТАРЫЙ КОД)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cat.html'));
});

// Маршрут для API (НОВЫЙ КОД для БД)
app.get('/api/cats', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cats');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Можно добавить другие API маршруты
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM menu');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
    console.log(`Сервер работает на http://localhost:${PORT}`);
    console.log(`API доступно по адресу http://localhost:${PORT}/api/cats`);
});