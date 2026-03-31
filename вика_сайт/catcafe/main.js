// main.js

// ========== КОРЗИНА ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Открытие корзины
function openCart() {
    const cartModal = document.getElementById('cart');
    if (cartModal) {
        updateCartDisplay();
        cartModal.classList.add('open');
    }
}

// Закрытие корзины
function closeCart() {
    const cartModal = document.getElementById('cart');
    if (cartModal) {
        cartModal.classList.remove('open');
    }
}

// Обновление счетчика
function updateCartCounter() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counters = document.querySelectorAll('.cart-count');
    counters.forEach(counter => {
        if (counter) counter.innerText = totalItems;
    });
}

// Обновление отображения корзины
function updateCartDisplay() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalSpan = document.querySelector('.cart-total span:last-child');
    
    if (!cartItemsContainer || !cartTotalSpan) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <p>😿 Корзина пуста</p>
                <button class="continue-shopping" onclick="closeCart()">Продолжить покупки</button>
            </div>
        `;
        cartTotalSpan.innerText = '0 ₽';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price} ₽</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${index})">Удалить</button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
    cartTotalSpan.innerText = total + ' ₽';
}

// Изменение количества
function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
    }
}

// Удаление из корзины
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    updateCartDisplay();
}

const loader = document.getElementById("loader");
const heroSection = document.getElementById("hero-section");
const home = document.getElementById("home");
const app = document.getElementById("app");
const heroToMenuBtn = document.getElementById("heroToMenuBtn");
const goToMenuBtn = document.getElementById("goToMenuBtn");

// ⏳ Загрузка экранов
setTimeout(() => {
    loader.classList.add("hidden");
    heroSection.classList.remove("hidden");
}, 1200);

// 🍣 Переход из НОВОГО главного в меню
if (heroToMenuBtn) {
    heroToMenuBtn.addEventListener("click", () => {
        heroSection.classList.add("hidden");
        app.classList.remove("hidden");
        loadMenu();
    });
}

// 🍣 Переход из СТАРОГО главного в меню (если он остался)
if (goToMenuBtn) {
    goToMenuBtn.addEventListener("click", () => {
        home.classList.add("hidden");
        app.classList.remove("hidden");
        loadMenu();
    });
}

// 🔄 Загрузка меню из БД
async function loadMenu() {
    const container = document.getElementById("menu-container");
    container.innerHTML = "⏳ Загружаем вкусняшки...";

    try {
        const response = await fetch("/api/menu");
        const products = await response.json();

        if (!products.length) {
            container.innerHTML = "😿 В базе пусто";
            return;
        }

        showProducts(products);
    } catch (e) {
        container.innerHTML = "❌ Ошибка загрузки";
        console.error(e);
    }
}

// 🖼 Отображение продуктов
function showProducts(products) {
    const container = document.getElementById("menu-container");

    const categories = {
        rolls: "Роллы",
        drinks: "Напитки",
        dessert: "Дессерты",
        sets: "Сеты",
        sushi: "Суши"
    };

    let html = "";

    Object.keys(categories).forEach(catId => {
        const items = products.filter(p => p.CategoryName && p.CategoryName.toLowerCase() === categories[catId].toLowerCase());
        if (!items.length) return;

        html += `<h2 class="category-title" id="${catId}">${categories[catId]}</h2>`;

        items.forEach(p => {
            const imgPath = p.ImageURL ? `/menu_images/${p.ImageURL}` : `/menu_images/default.png`;
            html += `
            <div class="product-card" data-category="${catId}">
                <img src="${imgPath}" class="product-image" alt="${p.Name}">
                <div class="product-content">
                    <h3 class="product-title">${p.Name}</h3>
                    <div class="product-ingredients">${p.Composition || ''}</div>
                    <div class="product-footer">
                        <div class="product-price">${p.Price} ₽</div>
                        <button class="add-to-cart-btn" onclick="addToCart('${p.Name.replace(/'/g, "\\'")}', ${p.Price})">
                            <img src="Images/korzina.png" style="width: 20px; height: 20px;">
                        </button>
                    </div>
                </div>
            </div>`;
        });
    });

    container.innerHTML = html;
    setupFilters();
}

// 🎚 ФИЛЬТРЫ ПО КАТЕГОРИЯМ (ПРОКРУТКА)
function setupFilters() {
    document.querySelectorAll(".categories button").forEach(btn => {
        btn.addEventListener("click", function () {
            const cat = this.dataset.category;
            
            document.querySelectorAll(".categories button").forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            document.querySelectorAll(".product-card").forEach(card => {
                card.style.display = "block";
            });

            if (cat === "all") {
                document.querySelector('.menu').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                const categoryTitle = document.getElementById(cat);
                if (categoryTitle) {
                    const headerHeight = document.querySelector('.categories').offsetHeight;
                    const elementPosition = categoryTitle.getBoundingClientRect().top + window.pageYOffset;
                    
                    window.scrollTo({
                        top: elementPosition - headerHeight - 10,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// 🛒 Добавление в корзину
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const product = {
            id: Date.now(),
            name: name,
            price: price,
            quantity: 1
        };
        cart.push(product);
    }
    
    saveCart();
    
    const btn = event.target;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 200);
    
    console.log("🛒 Добавлено:", name);
}

// ========== АВТОРИЗАЦИЯ (ЧЕРЕЗ СЕРВЕР) ==========
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Открытие модалки
window.openAuthModal = function() {
    document.getElementById('auth-modal').classList.add('open');
}

// Закрытие модалки
window.closeAuthModal = function() {
    document.getElementById('auth-modal').classList.remove('open');
}

// Переключение вкладок
window.switchAuthTab = function(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
}

// Обработка входа (через сервер)
window.handleLogin = async function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Заполните все поля');
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            alert(`Добро пожаловать, ${data.user.name}!`);
            closeAuthModal();
            updateAuthButton();
        } else {
            alert(data.error || 'Ошибка входа');
        }
    } catch (err) {
        alert('Ошибка соединения с сервером');
        console.error(err);
    }
}

// Обработка регистрации (через сервер)
window.handleRegister = async function() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (!name || !email || !password || !confirm) {
        alert('Заполните все поля');
        return;
    }
    
    if (password !== confirm) {
        alert('Пароли не совпадают');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Регистрация успешна! Теперь войдите.');
            switchAuthTab('login');
            
            // Очищаем поля регистрации
            document.getElementById('register-name').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-confirm').value = '';
        } else {
            alert(data.error || 'Ошибка регистрации');
        }
    } catch (err) {
        alert('Ошибка соединения с сервером');
        console.error(err);
    }
}

// Обновление кнопки аккаунта
function updateAuthButton() {
    const accountBtn = document.querySelector('.nav__item:last-child');
    if (accountBtn) {
        const textSpan = accountBtn.querySelector('.nav__text');
        if (currentUser) {
            textSpan.innerText = currentUser.name;
            accountBtn.onclick = () => {
                if (confirm(`Выйти, ${currentUser.name}?`)) {
                    localStorage.removeItem('currentUser');
                    currentUser = null;
                    updateAuthButton();
                }
            };
        } else {
            textSpan.innerText = 'Аккаунт';
            accountBtn.onclick = openAuthModal;
        }
    }
}

// ========== ОБРАБОТЧИКИ ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', function() {
    // Клик по кнопке корзины
    const cartButtons = document.querySelectorAll('.cart-button');
    cartButtons.forEach(btn => {
        btn.addEventListener('click', openCart);
    });
    
    // Обновляем счетчик
    updateCartCounter();
    
    // Обновляем кнопку аккаунта
    updateAuthButton();
});






// Плавное перемещение круга-индикатора
function moveCategoryIndicator(button) {
    const indicator = document.getElementById('categoryIndicator');
    if (!indicator || !button) return;
    
    // Получаем все необходимые элементы
    const categories = document.querySelector('.categories');
    const buttonsContainer = document.querySelector('.categories-buttons');
    
    if (!categories || !buttonsContainer) return;
    
    // Получаем размеры и позиции
    const buttonRect = button.getBoundingClientRect();
    const containerRect = buttonsContainer.getBoundingClientRect();
    const categoriesRect = categories.getBoundingClientRect();
    
    // Вычисляем центр кнопки относительно контейнера кнопок
    const buttonCenter = buttonRect.left + buttonRect.width / 2;
    const containerLeft = containerRect.left;
    
    // Вычисляем позицию для круга (центр круга должен совпадать с центром кнопки)
    const indicatorWidth = indicator.offsetWidth;
    let newLeft = (buttonCenter - containerLeft - indicatorWidth / 2);
    
    // Получаем padding слева у родительского контейнера
    const categoriesStyle = window.getComputedStyle(categories);
    const paddingLeft = parseFloat(categoriesStyle.paddingLeft);
    
    // Добавляем padding к позиции
    newLeft += paddingLeft;
    
    // Применяем позицию
    indicator.style.left = newLeft + 'px';
    
    console.log('Круг позиционирован на:', newLeft); // Для отладки
}

// Добавляем обработчики на кнопки категорий
document.querySelectorAll('.categories button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.categories button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.classList.add('active');
        moveCategoryIndicator(this);
    });
});

// Инициализация - ставим круг на "Все" при загрузке
window.addEventListener('load', function() {
    // Даем время на полную загрузку стилей и рендеринг
    setTimeout(() => {
        // Находим кнопку "Все"
        const allButton = document.querySelector('.categories button[data-category="all"]');
        
        if (allButton) {
            // Убираем active со всех
            document.querySelectorAll('.categories button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Добавляем active на "Все"
            allButton.classList.add('active');
            
            // Ставим круг на "Все"
            moveCategoryIndicator(allButton);
            
            // Дополнительная проверка после полной загрузки
            setTimeout(() => {
                moveCategoryIndicator(allButton);
            }, 200);
        }
    }, 300);
});

// Обновляем позицию при ресайзе
window.addEventListener('resize', function() {
    const activeButton = document.querySelector('.categories button.active');
    if (activeButton) {
        moveCategoryIndicator(activeButton);
    }
});

// Также обновляем после любой прокрутки (на всякий случай)
window.addEventListener('scroll', function() {
    const activeButton = document.querySelector('.categories button.active');
    if (activeButton) {
        moveCategoryIndicator(activeButton);
    }
});