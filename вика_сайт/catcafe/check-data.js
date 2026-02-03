const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cat12345',
    database: 'catcafe_db'
});

console.log('🔍 Проверяем данные в базе...\n');

db.connect((err) => {
    if (err) {
        console.error('❌ Ошибка подключения:', err.message);
        return;
    }

    // 1. Проверяем категории
    db.query('SELECT * FROM Categories', (err, categories) => {
        if (err) {
            console.error('❌ Ошибка запроса категорий:', err.message);
            return;
        }
        
        console.log('📋 КАТЕГОРИИ:');
        if (categories.length === 0) {
            console.log('   ❌ Категорий нет!');
        } else {
            categories.forEach(cat => {
                console.log(`   ✅ ${cat.ID}. ${cat.Name} - ${cat.Description || 'нет описания'}`);
            });
        }
        console.log('');
        
        // 2. Проверяем товары
        db.query('SELECT COUNT(*) as count FROM Menu', (err, countResult) => {
            console.log(`🍱 ТОВАРОВ ВСЕГО: ${countResult[0].count}`);
            
            // 3. Показываем примеры товаров
            db.query(`
                SELECT m.*, c.Name as CategoryName 
                FROM Menu m 
                LEFT JOIN Categories c ON m.CategoryID = c.ID 
                LIMIT 10
            `, (err, products) => {
                console.log('\n📊 ПРИМЕРЫ ТОВАРОВ:');
                if (products.length === 0) {
                    console.log('   ❌ Товаров нет в базе!');
                    console.log('\n🚨 ПРОБЛЕМА: База данных пустая!');
                    console.log('   Нужно заполнить таблицу Menu данными.');
                } else {
                    products.forEach(product => {
                        console.log(`   ✅ ${product.ID}. ${product.Name} (${product.CategoryName})`);
                        console.log(`      Состав: ${product.Composition || 'нет'}`);
                        console.log(`      Цена: ${product.Price} ₽`);
                        console.log(`      Изображение: ${product.ImageURL || 'нет'}`);
                        console.log('');
                    });
                }
                
                // 4. Проверяем связь с филиалами
                db.query('SELECT COUNT(*) as count FROM MenuBranches', (err, mbResult) => {
                    console.log(`🏪 СВЯЗЕЙ С ФИЛИАЛАМИ: ${mbResult[0].count}`);
                    
                    if (mbResult[0].count === 0) {
                        console.log('\n⚠️  Внимание: Нет связи товаров с филиалами!');
                        console.log('   Товары не будут отображаться.');
                    }
                    
                    db.end();
                });
            });
        });
    });
});