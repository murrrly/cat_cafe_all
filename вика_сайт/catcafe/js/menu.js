class MenuManager {
    constructor() {
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.cart = this.loadCart();
        this.init();
    }

    // Инициализация
    async init() {
        this.setupEventListeners();
        await this.loadCategories();
        await this.loadMenu();
        this.updateCartCount();
    }

    // Загрузка категорий
    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const result = await response.json();
            
            if (result.success && result.data) {
                this.renderCategories(result.data);
            }
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    }

    // Загрузка меню
    async loadMenu() {
        const menuContainer = document.getElementById('menu-container');
        if (!menuContainer) return;

        // Показываем загрузку
        menuContainer.innerHTML = this.getLoadingHTML();

        try {
            const params = new URLSearchParams({
                category: this.currentCategory,
                search: this.currentSearch
            });

            const response = await fetch(`/api/products?${params}`);
            const result = await response.json();

            if (result.success) {
                this.renderMenu(result.data);
                this.updateCategoryCounts(result.data.length);
            } else {
                menuContainer.innerHTML = this.getErrorHTML(result.message);
            }
        } catch (error) {
            console.error('Ошибка загрузки меню:', error);
            menuContainer.innerHTML = this.getErrorHTML('Ошибка загрузки меню');
        }
    }

    // Рендеринг категорий
    renderCategories(categories) {
        const categoriesContainer = document.querySelector('.categories');
        if (!categoriesContainer) return;

        // Оставляем кнопку "Все"
        let html = '<button class="active" data-category="all">Все</button>';

        // Добавляем категории из БД
        categories.forEach(category => {
            const categoryName = this.translateCategory(category.Name);
            html += `
                <button data-category="${category.Name}" 
                        data-count="${category.item_count}">
                    ${categoryName} (${category.item_count})
                </button>`;
        });

        categoriesContainer.innerHTML = html;
        this.setupCategoryListeners();
    }

    // Рендеринг меню
    renderMenu(products) {
        const menuContainer = document.getElementById('menu-container');
        if (!menuContainer) return;

        if (products.length === 0) {
            menuContainer.innerHTML = this.getEmptyHTML();
            return;
        }

        // Группируем по категориям
        const grouped = this.groupByCategory(products);
        
        let html = '';
        
        for (const [categoryName, items] of Object.entries(grouped)) {
            const translatedCategory = this.translateCategory(categoryName);
            
            html += `
                <h2 class="category-title" id="${categoryName.toLowerCase()}">
                    ${translatedCategory}
                </h2>
            `;

            items.forEach(product => {
                html += this.getProductCardHTML(product);
            });
        }

        menuContainer.innerHTML = html;
        this.setupProductCardListeners();
    }

    // HTML для карточки товара
    getProductCardHTML(product) {
        const isOnSale = product.hasPromotion;
        const saleBadge = isOnSale ? 
            `<div class="sale-badge">-${Math.round((1 - product.finalPrice / product.price) * 100)}%</div>` : '';
        
        const newBadge = product.isNew ? '<div class="new-badge">New</div>' : '';
        
        const priceHTML = isOnSale ? 
            `<div class="product-price">
                <span class="old-price">${product.price} ₽</span>
                <span class="current-price">${product.finalPrice} ₽</span>
            </div>` :
            `<div class="product-price">${product.price} ₽</div>`;

        return `
            <div class="product-card" data-category="${product.category.name}" data-id="${product.id}">
                ${newBadge}
                ${saleBadge}
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='/img/default.jpg'">
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-ingredients">
                        <span>${product.composition || product.description || ''}</span>
                    </div>
                    <div class="product-footer">
                        ${priceHTML}
                        <button class="add-to-cart-btn" data-id="${product.id}">
                            <span>В корзину</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M5 1L1 5V17C1 17.5304 1.21071 18.0391 1.58579 18.4142C1.96086 18.7893 2.46957 19 3 19H17C17.5304 19 18.0391 18.7893 18.4142 18.4142C18.7893 18.0391 19 17.5304 19 17V5L15 1H5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M1 5H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M14 9C14 10.0609 13.5786 11.0783 12.8284 11.8284C12.0783 12.5786 11.0609 13 10 13C8.93913 13 7.92172 12.5786 7.17157 11.8284C6.42143 11.0783 6 10.0609 6 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>`;
    }

    // Настройка слушателей событий
    setupEventListeners() {
        // Поиск
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.currentSearch = searchInput.value;
                this.loadMenu();
            }, 300));
        }

        // Кнопка меню на главной
        const menuButton = document.getElementById('goToMenuBtn');
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                window.location.href = '/menu';
            });
        }
    }

    setupCategoryListeners() {
        document.querySelectorAll('.categories button').forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                
                // Обновляем активную кнопку
                document.querySelectorAll('.categories button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // Загружаем товары категории
                this.currentCategory = category;
                this.loadMenu();
                
                // Прокручиваем к категории
                if (category !== 'all') {
                    const sectionId = category.toLowerCase();
                    const section = document.getElementById(sectionId);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    setupProductCardListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.addToCart(productId);
            });
        });
    }

    // Работа с корзиной
    addToCart(productId) {
        // Находим товар
        const productElement = document.querySelector(`.product-card[data-id="${productId}"]`);
        const productName = productElement?.querySelector('.product-title')?.textContent || 'Товар';
        const priceText = productElement?.querySelector('.current-price, .product-price')?.textContent || '0';
        const price = parseFloat(priceText.replace('₽', '').trim());

        // Добавляем в корзину
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: productId,
                name: productName,
                price: price,
                quantity: 1,
                image: productElement?.querySelector('.product-image')?.src || '/img/default.jpg'
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddToCartAnimation(productId);
    }

    showAddToCartAnimation(productId) {
        const button = document.querySelector(`.add-to-cart-btn[data-id="${productId}"]`);
        if (!button) return;

        const originalText = button.innerHTML;
        button.innerHTML = '<span>Добавлено!</span>';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 1500);
    }

    // Вспомогательные методы
    groupByCategory(products) {
        const grouped = {};
        
        products.forEach(product => {
            const category = product.category.name;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(product);
        });
        
        return grouped;
    }

    translateCategory(categoryName) {
        const translations = {
            'rolls': 'Роллы',
            'drinks': 'Напитки',
            'desserts': 'Десерты',
            'Роллы': 'Роллы',
            'Напитки': 'Напитки',
            'Десерты': 'Десерты'
        };
        
        return translations[categoryName] || categoryName;
    }

    updateCategoryCounts(totalCount) {
        document.querySelectorAll('.categories button').forEach(button => {
            const category = button.dataset.category;
            if (category === 'all') {
                button.textContent = `Все (${totalCount})`;
            }
        });
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }

    loadCart() {
        const cartData = localStorage.getItem('catcafe_cart');
        return cartData ? JSON.parse(cartData) : [];
    }

    saveCart() {
        localStorage.setItem('catcafe_cart', JSON.stringify(this.cart));
    }

    // HTML-шаблоны
    getLoadingHTML() {
        return `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Загрузка меню...</p>
            </div>`;
    }

    getErrorHTML(message) {
        return `
            <div class="error-container">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                          stroke="#ff4757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3>Ошибка загрузки</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">Попробовать снова</button>
            </div>`;
    }

    getEmptyHTML() {
        return `
            <div class="empty-container">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" 
                          stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить параметры поиска</p>
            </div>`;
    }

    // Дебаунс для поиска
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, находимся ли мы на странице меню
    if (document.getElementById('app') && !document.getElementById('app').classList.contains('hidden')) {
        window.menuManager = new MenuManager();
    }
});