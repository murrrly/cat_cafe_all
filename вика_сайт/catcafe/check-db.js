const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'catcafe_db'
});

console.log('🔍 Проверка базы данных...');

db.connect((err) => {
    if (err) {
        console.error('❌ Ошибка подключения:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Подключено к БД');
    
    // Проверяем таблицы
    const queries = [
        'SELECT COUNT(*) as count FROM Categories',
        'SELECT COUNT(*) as count FROM Menu',
        'SELECT m.Name, m.Price, m.ImageURL, c.Name as Category FROM Menu m LEFT JOIN Categories c ON m.CategoryID = c.ID LIMIT 5'
    ];
    
    let completed = 0;
    
    queries.forEach((query, index) => {
        db.query(query, (err, results) => {
            completed++;
            
            if (err) {
                console.error(`❌ Ошибка запроса ${index + 1}:`, err.message);
            } else {
                switch(index) {
                    case 0:
                        console.log(`📋 Категорий: ${results[0].count}`);
                        break;
                    case 1:
                        console.log(`🍱 Товаров: ${results[0].count}`);
                        break;
                    case 2:
                        console.log('📊 Примеры товаров:');
                        results.forEach(item => {
                            console.log(`   - ${item.Name} (${item.Category}): ${item.Price}₽ -> ${item.ImageURL}`);
                        });
                        break;
                }
            }
            
            if (completed === queries.length) {
                console.log('\n✅ Проверка завершена');
                db.end();
                process.exit(0);
            }
        });
    });
});