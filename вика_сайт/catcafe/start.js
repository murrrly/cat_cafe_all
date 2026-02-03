const { testConnection } = require('./config/db');

async function startApp() {
    console.log('🚀 Запуск Cat Cafe...');
    
    // Проверяем подключение к БД
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.error('❌ Не удалось подключиться к базе данных');
        process.exit(1);
    }
    
    // Запускаем сервер
    require('./server.js');
}

startApp();