class CatCafeMenu {
    constructor() {
        console.log('🍱 CatCafeMenu инициализация...');
        
        this.cart = JSON.parse(localStorage.getItem('catcafe_cart') || '[]');
        this.currentCategory = 'all';
        
        // Проверяем, находимся ли на странице меню
        const appElement = document.getElementById('app');
        if (appElement && !appElement.classList.contains('hidden')) {
            console.log('📍 На странице меню, начинаем загрузку...');
            this.initializeMenu();
        }
        
        // Инициализируем корзину везде
        this.updateCartCount();
    }

    async initializeMenu() {
        try {
            console.log('🔄 Начинаем загрузку меню...');
            
            // Сразу загружаем меню
            await this.loadMenu();
            
            // Настраиваем обработчики
            this.setupEventListeners();
            
            console.log('✅ Меню успешно загружено!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации меню:', error);
            this.showError('Не удалось загрузить меню: ' + error.message);
        }
    }

    async loadMenu(category = 'all') {
        const menuContainer = document.getElementById('menu-container');
        if (!menuContainer) {
            console.error('❌ Не найден контейнер меню');
            return;
        }

        this.currentCategory = category;
        
        // Показываем загрузку
        menuContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Загрузка меню...</p>
            </div>
        `;

        try {
            console.log(`🍱 Загрузка товаров, категория: ${category}`);
            const response = await fetch(`/api/menu?category=${category}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Ошибка загрузки меню');
            }
            
            console.log(`🍱 Получено товаров: ${result.data.length}`);
            console.log('📸 Пути к изображениям:');
            result.data.forEach(item => {
                console.log(`   ${item.name}: ${item.image}`);
            });
            
            if (result.data.length === 0) {
                menuContainer.innerHTML = `
                    <div class="empty-state">
                        <p>😿 Товары не найдены</p>
                        <p>Попробуйте выбрать другую категорию</p>
                    </div>
                `;
                return;
            }

            // Рендерим меню
            this.renderMenu(result.data, menuContainer);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки меню:', error);
            menuContainer.innerHTML = `
                <div class="error-state">
                    <p>❌ Ошибка загрузки меню</p>
                    <p><small>${error.message}</small></p>
                    <button class="retry-btn" onclick="window.menuDB.loadMenu('${category}')">
                        Попробовать снова
                    </button>
                </div>
            `;
        }
    }

    renderMenu(products, container) {
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Группируем по категориям
        const grouped = {};
        products.forEach(product => {
            const category = product.category || 'Другое';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(product);
        });
        
        console.log(`📂 Категории для отображения: ${Object.keys(grouped).join(', ')}`);
        
        // Рендерим каждую категорию
        Object.keys(grouped).forEach(categoryName => {
            // Заголовок категории
            const categoryId = this.getCategoryKey(categoryName);
            const title = document.createElement('h2');
            title.className = 'category-title';
            title.id = categoryId;
            title.textContent = this.translateCategory(categoryName);
            container.appendChild(title);
            
            console.log(`   📍 Категория: ${categoryName} (${grouped[categoryName].length} товаров)`);
            
            // Товары категории
            grouped[categoryName].forEach(product => {
                const card = this.createProductCard(product);
                container.appendChild(card);
            });
        });
        
        // Добавляем обработчики для кнопок
        this.setupAddToCartListeners();
        
        // Обновляем активную кнопку категории
        this.updateActiveCategoryButton();
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', this.getCategoryKey(product.category));
        card.setAttribute('data-id', product.id);
        
        // Определяем новинку (простая логика)
        const isNew = product.id % 3 === 0;
        
        // Логируем путь к изображению
        console.log(`   🖼️ Создание карточки: ${product.name}, изображение: ${product.image}`);
        
        card.innerHTML = `
            ${isNew ? '<div class="new-badge">New</div>' : ''}
            <img src="${product.image}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.onerror=null; this.src='/Images/logo.png'; console.log('Ошибка загрузки: ${product.image}')">
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-ingredients">
                    <span>${product.composition || product.description || ''}</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">${product.price} ₽</div>
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    setupAddToCartListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                this.addToCart(productId);
                
                // Анимация добавления
                const originalText = e.currentTarget.innerHTML;
                e.currentTarget.innerHTML = '<span>✓ Добавлено!</span>';
                e.currentTarget.disabled = true;
                
                setTimeout(() => {
                    e.currentTarget.innerHTML = originalText;
                    e.currentTarget.disabled = false;
                }, 1500);
            });
        });
        
        console.log(`✅ Добавлено обработчиков корзины: ${document.querySelectorAll('.add-to-cart-btn').length}`);
    }

    addToCart(productId) {
        // Находим карточку товара
        const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
        if (!productCard) {
            console.error('❌ Товар не найден для добавления в корзину');
            return;
        }

        const productName = productCard.querySelector('.product-title').textContent;
        const priceText = productCard.querySelector('.product-price').textContent;
        const price = parseInt(priceText);
        const image = productCard.querySelector('.product-image').src;

        // Проверяем есть ли уже в корзине
        const existingIndex = this.cart.findIndex(item => item.id == productId);
        
        if (existingIndex > -1) {
            // Увеличиваем количество
            this.cart[existingIndex].quantity += 1;
        } else {
            // Добавляем новый товар
            this.cart.push({
                id: productId,
                name: productName,
                price: price,
                image: image,
                quantity: 1
            });
        }

        // Сохраняем в localStorage
        localStorage.setItem('catcafe_cart', JSON.stringify(this.cart));
        
        // Обновляем счетчик
        this.updateCartCount();
        
        console.log(`🛒 Добавлено в корзину: ${productName}`);
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }

    updateActiveCategoryButton() {
        // Обновляем активную кнопку категории
        document.querySelectorAll('.categories button').forEach(btn => {
            const btnCategory = btn.getAttribute('data-category');
            btn.classList.toggle('active', btnCategory === this.currentCategory);
        });
    }

    setupEventListeners() {
        console.log('⚙️ Настройка обработчиков событий...');
        
        // Фильтрация по категориям
        document.querySelectorAll('.categories button').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                
                // Загружаем меню категории
                this.loadMenu(category);
                
                // Прокручиваем к категории
                if (category !== 'all') {
                    setTimeout(() => {
                        const sectionId = this.getCategoryKey(category);
                        const section = document.getElementById(sectionId);
                        if (section) {
                            section.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start' 
                            });
                        }
                    }, 300);
                }
            });
        });
        
        console.log(`✅ Обработчиков категорий: ${document.querySelectorAll('.categories button').length}`);
    }

    showError(message) {
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer) {
            menuContainer.innerHTML = `
                <div class="error-state">
                    <p>❌ ${message}</p>
                    <button class="retry-btn" onclick="window.location.reload()">
                        Обновить страницу
                    </button>
                </div>
            `;
        }
    }

    // Вспомогательные методы
    getCategoryKey(categoryName) {
        const map = {
            'Роллы': 'rolls',
            'rolls': 'rolls',
            'Напитки': 'drinks',
            'drinks': 'drinks',
            'Десерты': 'dessert',
            'dessert': 'dessert',
            'Дессерты': 'dessert'
        };
        return map[categoryName] || categoryName.toLowerCase();
    }

    translateCategory(categoryName) {
        const translations = {
            'Роллы': 'Роллы',
            'rolls': 'Роллы',
            'Напитки': 'Напитки',
            'drinks': 'Напитки',
            'Десерты': 'Десерты',
            'Дессерты': 'Десерты',
            'dessert': 'Десерты'
        };
        return translations[categoryName] || categoryName;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, инициализируем CatCafeMenu...');
    window.menuDB = new CatCafeMenu();
    
    // Проверка API
    fetch('/api/info')
        .then(r => r.json())
        .then(data => {
            console.log('✅ Информация о сервере:', data);
            console.log(`🖼️ Файлов в Images: ${data.paths.imagesCount}`);
        })
        .catch(err => console.error('❌ API ошибка:', err));
});

// Глобальная функция для отладки
window.debugMenu = function() {
    console.log('=== ДЕБАГ МЕНЮ ===');
    console.log('Текущая корзина:', window.menuDB.cart);
    console.log('Текущая категория:', window.menuDB.currentCategory);
    
    fetch('/api/menu')
        .then(r => r.json())
        .then(data => {
            console.log('Данные меню:', data);
            data.data.forEach(item => {
                console.log(`${item.name}: ${item.image}`);
            });
        });
};