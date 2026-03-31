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
                        <button class="add-to-cart-btn" onclick="addToCart(${p.ID}, '${p.Name.replace(/'/g, "\\'")}', ${p.Price})">В корзину</button>
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

// 🛒 Добавление в корзину (исправлено: теперь с ID)
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const product = {
            id: id,
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

// ========== ПОИСК ==========
function toggleSearch() {
    const searchDropdown = document.getElementById('searchDropdown');
    if (searchDropdown) {
        searchDropdown.classList.toggle('active');
        if (searchDropdown.classList.contains('active')) {
            document.getElementById('search-input').focus();
        } else {
            document.getElementById('search-input').value = '';
            filterProductsBySearch('');
        }
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.toLowerCase().trim();
            filterProductsBySearch(searchTerm);
        }, 300);
    });
}

function filterProductsBySearch(searchTerm) {
    const products = document.querySelectorAll('.product-card');
    const categoryTitles = document.querySelectorAll('.category-title');
    
    if (searchTerm === '') {
        products.forEach(card => card.style.display = 'block');
        categoryTitles.forEach(title => title.style.display = 'block');
        
        const noResults = document.querySelector('.no-results');
        if (noResults) noResults.remove();
        return;
    }
    
    let hasVisibleProducts = false;
    
    categoryTitles.forEach(title => {
        title.style.display = 'none';
    });
    
    products.forEach(card => {
        const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
        const ingredients = card.querySelector('.product-ingredients')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || ingredients.includes(searchTerm)) {
            card.style.display = 'block';
            hasVisibleProducts = true;
            
            const categoryId = card.dataset.category;
            const categoryTitle = document.getElementById(categoryId);
            if (categoryTitle) {
                categoryTitle.style.display = 'block';
            }
        } else {
            card.style.display = 'none';
        }
    });
    
    const noResults = document.querySelector('.no-results');
    if (!hasVisibleProducts) {
        if (!noResults) {
            const container = document.getElementById('menu-container');
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = '<p>😿 Ничего не найдено</p>';
            container.prepend(noResultsDiv);
        }
    } else {
        if (noResults) noResults.remove();
    }
}

// ========== АВТОРИЗАЦИЯ (ЧЕРЕЗ СЕРВЕР) ==========
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Открытие модалки авторизации
window.openAuthModal = function() {
    document.getElementById('auth-modal').classList.add('open');
}

// Закрытие модалки авторизации
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

// Обработка входа
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

// Обработка регистрации
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

// ========== ЛИЧНЫЙ КАБИНЕТ ==========
function openProfile() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    
    let profileModal = document.getElementById('profile-modal');
    
    if (!profileModal) {
        profileModal = document.createElement('div');
        profileModal.id = 'profile-modal';
        profileModal.className = 'profile-modal';
        profileModal.innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-header">
                    <h2>👤 Личный кабинет</h2>
                    <button class="close-profile" onclick="closeProfile()">✕</button>
                </div>
                
                <div class="profile-info">
                    <div class="profile-avatar">
                        <img src="Images/account.png" alt="avatar">
                    </div>
                    <div class="profile-details">
                        <h3 id="profile-name"></h3>
                        <p id="profile-email"></p>
                    </div>
                </div>
                
                <div class="profile-tabs">
                    <button class="profile-tab active" onclick="switchProfileTab('orders')">📋 Мои заказы</button>
                    <button class="profile-tab" onclick="switchProfileTab('settings')">⚙️ Настройки</button>
                </div>
                
                <div id="profile-orders" class="profile-orders active">
                    <div class="orders-list" id="orders-list">
                        ⏳ Загружаем историю заказов...
                    </div>
                </div>
                
                <div id="profile-settings" class="profile-settings">
                    <div class="form-group">
                        <label>Имя</label>
                        <input type="text" id="profile-edit-name" class="profile-input">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="profile-edit-email" class="profile-input" disabled>
                    </div>
                    <button class="profile-save-btn" onclick="saveProfileChanges()">Сохранить изменения</button>
                    <button class="profile-logout-btn" onclick="logout()">Выйти из аккаунта</button>
                </div>
            </div>
        `;
        document.body.appendChild(profileModal);
    }
    
    document.getElementById('profile-name').innerText = currentUser.name;
    document.getElementById('profile-email').innerText = currentUser.email;
    document.getElementById('profile-edit-name').value = currentUser.name;
    document.getElementById('profile-edit-email').value = currentUser.email;
    
    loadOrderHistory();
    
    profileModal.classList.add('open');
}

function closeProfile() {
    const profileModal = document.getElementById('profile-modal');
    if (profileModal) {
        profileModal.classList.remove('open');
    }
}

function switchProfileTab(tab) {
    const ordersTab = document.querySelector('.profile-tab:nth-child(1)');
    const settingsTab = document.querySelector('.profile-tab:nth-child(2)');
    const ordersSection = document.getElementById('profile-orders');
    const settingsSection = document.getElementById('profile-settings');
    
    if (tab === 'orders') {
        ordersTab.classList.add('active');
        settingsTab.classList.remove('active');
        ordersSection.classList.add('active');
        settingsSection.classList.remove('active');
    } else {
        settingsTab.classList.add('active');
        ordersTab.classList.remove('active');
        settingsSection.classList.add('active');
        ordersSection.classList.remove('active');
    }
}

async function loadOrderHistory() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;
    
    try {
        const response = await fetch(`/api/orders/${currentUser.id}`);
        const orders = await response.json();
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="no-orders">😿 У вас пока нет заказов</p>';
            return;
        }
        
        let html = '';
        orders.forEach(order => {
            const date = new Date(order.OrderDate).toLocaleString('ru-RU');
            const statusClass = order.Status === 'Новый' ? 'status-new' : 
                               order.Status === 'Готовится' ? 'status-cooking' : 'status-done';
            
            html += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">${order.OrderNumber}</span>
                        <span class="order-date">${date}</span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span>${item.Name} x${item.Quantity}</span>
                                <span>${item.Price * item.Quantity} ₽</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        Итого: ${order.Total} ₽
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="order-status ${statusClass}">${order.Status}</span>
                        <span class="payment-type">💳 ${order.PaymentType}</span>
                    </div>
                </div>
            `;
        });
        
        ordersList.innerHTML = html;
    } catch (err) {
        ordersList.innerHTML = '<p>❌ Ошибка загрузки истории</p>';
        console.error(err);
    }
}

function saveProfileChanges() {
    const newName = document.getElementById('profile-edit-name').value;
    
    if (newName && newName !== currentUser.name) {
        fetch('/api/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                name: newName
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                currentUser.name = newName;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                document.getElementById('profile-name').innerText = newName;
                updateAuthButton();
                alert('Имя успешно обновлено!');
            }
        })
        .catch(err => {
            alert('Ошибка при обновлении');
            console.error(err);
        });
    }
}

window.logout = function() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        updateAuthButton();
        closeProfile();
    }
}

// ========== ОФОРМЛЕНИЕ ЗАКАЗА ==========
async function checkout() {
    if (!currentUser) {
        alert('Пожалуйста, войдите в аккаунт');
        openAuthModal();
        return;
    }
    
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                items: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                })),
                total: total,
                paymentType: 'Карта'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            cart = [];
            saveCart();
            closeCart();
            
            alert(`✅ Заказ ${data.orderNumber} успешно создан!`);
            
            if (confirm('Хотите посмотреть историю заказов?')) {
                openProfile();
            }
        } else {
            alert('Ошибка при создании заказа: ' + (data.error || 'Неизвестная ошибка'));
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
        if (currentUser && currentUser.name) {
            textSpan.innerText = currentUser.name;
            accountBtn.onclick = openProfile;
        } else {
            textSpan.innerText = 'Аккаунт';
            accountBtn.onclick = openAuthModal;
        }
    }
}

// ========== ОБРАБОТЧИКИ ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', function() {
    const cartButtons = document.querySelectorAll('.cart-button');
    cartButtons.forEach(btn => {
        btn.addEventListener('click', openCart);
    });
    
    const topCartBtn = document.querySelector('.nav__item:nth-child(4)');
    if (topCartBtn) {
        topCartBtn.addEventListener('click', openCart);
    }
    
    const searchBtn = document.querySelector('.nav__item:nth-child(2)');
    if (searchBtn) {
        searchBtn.addEventListener('click', toggleSearch);
    }
    
    updateCartCounter();
    updateAuthButton();
    setupSearch();
});

// Делаем функцию checkout глобальной
window.checkout = checkout;