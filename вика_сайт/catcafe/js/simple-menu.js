// Самый простой способ - отображаем сразу при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 Страница загружена');
    
    // Проверяем, находимся ли на странице меню
    const appElement = document.getElementById('app');
    if (!appElement || appElement.classList.contains('hidden')) {
        console.log('Не на странице меню');
        return;
    }
    
    console.log('📍 На странице меню, загружаем...');
    
    const container = document.getElementById('menu-container');
    if (!container) {
        console.error('Контейнер не найден');
        return;
    }
    
    // Показываем загрузку
    container.innerHTML = '<div style="padding:50px;text-align:center;">⏳ Загрузка...</div>';
    
    try {
        // Запрашиваем данные
        const response = await fetch('/api/menu');
        const products = await response.json();
        
        console.log('✅ Данные получены:', products.length, 'товаров');
        
        if (!products || products.length === 0) {
            container.innerHTML = '<div style="padding:50px;text-align:center;color:#ff6b6b;">😿 Товаров нет</div>';
            return;
        }
        
        // Отображаем данные
        displayProducts(products, container);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        container.innerHTML = '<div style="padding:50px;text-align:center;color:#ff4757;">❌ Ошибка загрузки</div>';
    }
});

function displayProducts(products, container) {
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Группируем по категориям
    const categories = {};
    products.forEach(product => {
        const cat = product.CategoryName || 'Без категории';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(product);
    });
    
    console.log('Категории:', Object.keys(categories));
    
    // Создаем HTML
    let html = '';
    
    // Порядок отображения категорий
    const categoryOrder = ['Роллы', 'Напитки', 'Десерты', 'Сеты', 'Суши'];
    
    categoryOrder.forEach(categoryName => {
        if (categories[categoryName]) {
            // Заголовок категории
            html += `<h2 class="category-title">${categoryName}</h2>`;
            
            // Товары в категории
            categories[categoryName].forEach(product => {
                html += `
                <div class="product-card">
                    <img src="/Images/logo.png" alt="${product.Name}" class="product-image">
                    <div class="product-content">
                        <h3 class="product-title">${product.Name}</h3>
                        <div class="product-ingredients">
                            <span>${product.Composition || 'Состав не указан'}</span>
                        </div>
                        <div class="product-footer">
                            <div class="product-price">${product.Price} ₽</div>
                            <button class="add-to-cart-btn" onclick="alert('Добавлено: ${product.Name}')">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>`;
            });
        }
    });
    
    // Вставляем HTML
    container.innerHTML = html;
    
    console.log('✅ Товары отображены');
    
    // Настраиваем кнопки категорий
    setupCategoryButtons();
}

function setupCategoryButtons() {
    const buttons = document.querySelectorAll('.categories button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Убираем active у всех
            buttons.forEach(btn => btn.classList.remove('active'));
            // Добавляем active текущей
            this.classList.add('active');
            
            // Показываем/скрываем товары
            const allCards = document.querySelectorAll('.product-card');
            
            if (category === 'all') {
                allCards.forEach(card => card.style.display = 'block');
            } else {
                // Определяем ID категории
                const categoryId = getCategoryId(category);
                allCards.forEach(card => {
                    const cardCategory = card.parentElement.previousElementSibling;
                    if (cardCategory && cardCategory.textContent.includes(categoryId)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    });
    
    console.log('Кнопки настроены');
}

function getCategoryId(category) {
    const map = {
        'rolls': 'Роллы',
        'drinks': 'Напитки',
        'dessert': 'Десерты',
        'sets': 'Сеты',
        'sushi': 'Суши'
    };
    return map[category] || category;
}

// Глобальная функция для тестирования
window.testMenu = function() {
    console.log('Тест меню');
    fetch('/api/menu')
        .then(r => r.json())
        .then(data => console.log('Данные:', data));
};