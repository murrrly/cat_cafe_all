const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Раздаём статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cat.html'));
});

app.listen(PORT, () => {
    console.log(`Сайт работает на http://localhost:${PORT}`);
});
