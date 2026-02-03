class MenuDisplay {
    constructor() {
        console.log('🍽️ MenuDisplay запущен');
        
        // Проверяем, находимся ли на странице меню
        const menuPage = document.getElementById('app');
        if (menuPage && !menuPage.classList.contains('hidden')) {
            console.log('📍 На странице меню');
            this.loadAndDisplayMenu();
        }
    }
    
    async loadAndDisplayMenu() {
        const container = document.getElementById('menu-container');
        if (!container) {
            console.error('❌ Контейнер меню не найден');
            return;
        }
        
        // Показываем загрузку
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Загружаем меню из базы данных...</p>
            </div>
        `;
        
        try {
            console.log('🔄 Запрос к API...');
            const response = await fetch('/api/menu');
            const result = await response.json();
            
            console.log('✅ Данные получены:', result);
            
            if (!result.success || !result.data) {
                throw new Error('Некорректный ответ от сервера');
            }
            
            this.displayMenu(result.data, container);
            
        } catch (error) {
            console.error('❌ Ошибка:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>Ошибка загрузки</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Попробовать снова</button>
                </div>
            `;
        }
    }
    
    displayMenu(products, container) {
        console.log(`🎨 Отображаем ${products.length} товаров`);
        
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Группируем товары по категориям
        const categories = {};
        
        products.forEach(product => {
            const category = product.category;
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(product);
        });
        
        console.log('📂 Категории:', Object.keys(categories));
        
        // Отображаем каждую категорию
        Object.keys(categories).forEach(categoryName => {
            // Заголовок категории
            const categoryId = this.getCategoryId(categoryName);
            const title = document.createElement('h2');
            title.className = 'category-title';
            title.id = categoryId;
            title.textContent = categoryName;
            container.appendChild(title);
            
            // Товары в категории
            categories[categoryName].forEach(product => {
                const card = this.createProductCard(product);
                container.appendChild(card);
            });
        });
        
        // Настраиваем кнопки категорий
        this.setupCategoryButtons();
        
        console.log('✅ Меню отображено успешно!');
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);
        card.setAttribute('data-category', this.getCategoryId(product.category));
        
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='/Images/logo.png'">
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-composition">${product.composition}</p>
                <div class="product-footer">
                    <div class="product-price">${product.price} ₽</div>
                    <button class="add-to-cart-btn" onclick="alert('Добавлено: ${product.name} за ${product.price}₽')">
                        В корзину
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    setupCategoryButtons() {
        // Находим кнопки категорий
        const categoryButtons = document.querySelectorAll('.categories button');
        
        categoryButtons.forEach(button => {
            const category = button.getAttribute('data-category');
            
            button.addEventListener('click', () => {
                // Убираем активный класс у всех кнопок
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                // Добавляем активный класс нажатой кнопке
                button.classList.add('active');
                
                if (category === 'all') {
                    // Показываем все товары
                    document.querySelectorAll('.product-card').forEach(card => {
                        card.style.display = 'block';
                    });
                } else {
                    // Показываем только товары выбранной категории
                    document.querySelectorAll('.product-card').forEach(card => {
                        const cardCategory = card.getAttribute('data-category');
                        card.style.display = cardCategory === category ? 'block' : 'none';
                    });
                    
                    // Прокручиваем к категории
                    const section = document.getElementById(category);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }
    
    getCategoryId(categoryName) {
        const map = {
            'Роллы': 'rolls',
            'Напитки': 'drinks',
            'Десерты': 'dessert',
            'Сеты': 'sets',
            'Суши': 'sushi'
        };
        return map[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-');
    }
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Страница загружена');
    window.menuDisplay = new MenuDisplay();
});