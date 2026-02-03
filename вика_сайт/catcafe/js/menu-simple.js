class SimpleMenu {
    constructor() {
        console.log('🍱 SimpleMenu запущен');
        
        // Проверяем, на странице ли меню мы
        const menuPage = document.getElementById('app');
        if (menuPage && !menuPage.classList.contains('hidden')) {
            console.log('📍 На странице меню, загружаем...');
            this.loadMenu();
        } else {
            console.log('📍 На главной странице');
        }
    }
    
    async loadMenu() {
        const container = document.getElementById('menu-container');
        if (!container) {
            console.error('❌ Контейнер меню не найден!');
            return;
        }
        
        // Показываем загрузку
        container.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 50px;
                font-size: 18px;
                color: #666;
            ">
                ⏳ Загружаем меню...
            </div>
        `;
        
        try {
            console.log('🔄 Запрашиваем меню с сервера...');
            
            const response = await fetch('/api/menu');
            const result = await response.json();
            
            console.log('📦 Ответ от сервера:', result);
            
            if (!result.success || !result.data) {
                throw new Error(result.message || 'Некорректный ответ от сервера');
            }
            
            if (result.data.length === 0) {
                container.innerHTML = `
                    <div style="
                        grid-column: 1 / -1;
                        text-align: center;
                        padding: 50px;
                        color: #ff6b6b;
                    ">
                        😿 В меню пока нет товаров
                        <br>
                        <small>Добавьте товары в базу данных</small>
                    </div>
                `;
                return;
            }
            
            // Рендерим меню
            this.renderMenu(result.data, container);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки меню:', error);
            
            container.innerHTML = `
                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px;
                    color: #ff4757;
                ">
                    ❌ Ошибка загрузки меню
                    <br>
                    <small>${error.message}</small>
                    <br><br>
                    <button onclick="window.location.reload()" style="
                        background: #ff6b6b;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">
                        Обновить страницу
                    </button>
                </div>
            `;
        }
    }
    
    renderMenu(products, container) {
        console.log(`🎨 Рендерим ${products.length} товаров...`);
        
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Группируем по категориям
        const categories = {};
        
        products.forEach(product => {
            const category = product.category || 'Без категории';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(product);
        });
        
        console.log('📂 Найдены категории:', Object.keys(categories));
        
        // Рендерим каждую категорию
        Object.keys(categories).forEach(categoryName => {
            // Заголовок категории
            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = categoryName;
            container.appendChild(title);
            
            console.log(`   📍 Категория "${categoryName}": ${categories[categoryName].length} товаров`);
            
            // Товары в категории
            categories[categoryName].forEach(product => {
                const card = this.createProductCard(product);
                container.appendChild(card);
            });
        });
        
        console.log('✅ Меню отображено!');
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);
        
        // Формируем путь к изображению
        let imagePath = product.image;
        
        // Если путь не начинается с /, добавляем
        if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
            imagePath = '/' + imagePath;
        }
        
        // Если нет изображения, используем логотип
        if (!imagePath || imagePath === '/') {
            imagePath = '/Images/logo.png';
        }
        
        console.log(`   🖼️ "${product.name}": ${imagePath}`);
        
        card.innerHTML = `
            <img src="${imagePath}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='/Images/logo.png'">
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-ingredients">
                    <span>${product.composition || 'Состав не указан'}</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">${product.price} ₽</div>
                    <button class="add-to-cart-btn" onclick="alert('Добавлено: ${product.name}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Страница загружена');
    
    // Проверяем работу API
    fetch('/api/test')
        .then(r => r.json())
        .then(data => console.log('✅ API тест:', data))
        .catch(err => console.error('❌ API не доступен:', err));
    
    // Инициализируем меню
    window.simpleMenu = new SimpleMenu();
});