// ===== script.js =====
// Трёхэтапная анимация: Загрузчик → Главный экран → Меню

window.addEventListener("load", () => {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = '100%';
    }
    
    setTimeout(() => {
        const loader = document.getElementById("loader");
        const home = document.getElementById("home");
        const app = document.getElementById("app");
        
        loader.style.opacity = "0";
        loader.style.transition = "opacity 1.8s ease";
        
        setTimeout(() => {
            loader.style.display = "none";
            home.classList.remove("hidden");
            home.style.opacity = "0";
            home.style.transition = "opacity 1.8s ease";
            
            setTimeout(() => {
                home.style.opacity = "1";
                const goToMenuBtn = document.getElementById("goToMenuBtn");
                if (goToMenuBtn) {
                    goToMenuBtn.addEventListener("click", goToMenu);
                }
            }, 50);
        }, 800);
    }, 2500);
});

// Функция перехода к меню
function goToMenu() {
    const home = document.getElementById("home");
    const app = document.getElementById("app");
    
    if (!home || !app) return;
    
    home.style.opacity = "0";
    home.style.transition = "opacity 0.8s ease";
    
    setTimeout(() => {
        home.classList.add("hidden");
        app.classList.remove("hidden");
        app.style.opacity = "0";
        app.style.transition = "opacity 0.8s ease";
        
        setTimeout(() => {
            app.style.opacity = "1";
            document.body.style.overflowY = 'auto';
            initMenuFunctionality();
        }, 50);
    }, 800);
}

// Функция прокрутки к секциям меню
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const headerHeight = document.querySelector('.header').offsetHeight;
    const categoriesHeight = document.querySelector('.categories').offsetHeight;
    const offset = headerHeight + categoriesHeight + 20;
    
    window.scrollTo({
        top: section.offsetTop - offset,
        behavior: 'smooth'
    });
    
    const buttons = document.querySelectorAll('.categories button[data-category]');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === sectionId) {
            btn.classList.add('active');
        }
    });
}

// Объект корзины
const cart = {
    items: [],
    total: 0,
    
    // Загрузить корзину из localStorage
    load() {
        const saved = localStorage.getItem('sushiCart');
        if (saved) {
            const data = JSON.parse(saved);
            this.items = data.items || [];
            this.total = data.total || 0;
            this.updateCartCount();
        }
    },
    
    // Сохранить корзину в localStorage
    save() {
        const data = {
            items: this.items,
            total: this.total
        };
        localStorage.setItem('sushiCart', JSON.stringify(data));
        this.updateCartCount();
    },
    
    // Обновить счетчик корзины
    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            // Анимация счетчика
            cartCount.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartCount.style.transform = '';
            }, 300);
        }
    },
    
    // Добавить товар в корзину
    addItem(productName, productPrice, productImage) {
        const existingItem = this.items.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                name: productName,
                price: productPrice,
                quantity: 1,
                image: productImage
            });
        }
        
        this.calculateTotal();
        this.save();
        this.showAddedNotification(productName);
    },
    
    // Удалить товар из корзины
    removeItem(productName) {
        this.items = this.items.filter(item => item.name !== productName);
        this.calculateTotal();
        this.save();
        if (document.getElementById('cart').classList.contains('open')) {
            this.renderCart();
        }
    },
    
    // Изменить количество товара
    updateQuantity(productName, change) {
        const item = this.items.find(item => item.name === productName);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(productName);
            } else {
                this.calculateTotal();
                this.save();
                if (document.getElementById('cart').classList.contains('open')) {
                    this.renderCart();
                }
            }
        }
    },
    
    // Рассчитать общую сумму
    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    },
    
    // Показать уведомление о добавлении
    showAddedNotification(productName) {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #5a3921;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            ">
                ✓ Добавлено: ${productName}
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    },
    
    // Очистить корзину
    clear() {
        this.items = [];
        this.total = 0;
        this.save();
        if (document.getElementById('cart').classList.contains('open')) {
            this.renderCart();
        }
    },
    
    // Отобразить корзину
    renderCart() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');
        
        if (!cartItemsContainer) return;
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <p>Ваша корзина пуста</p>
                    <button class="continue-shopping" onclick="closeCart()">Продолжить покупки</button>
                </div>
            `;
            cartTotalElement.textContent = '0';
            return;
        }
        
        cartItemsContainer.innerHTML = '';
        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price} × ${item.quantity}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.name}', -1)">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.name}', 1)">+</button>
                    <button class="remove-item" onclick="cart.removeItem('${item.name}')">Удалить</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        
        cartTotalElement.textContent = `$${this.total}`;
    }
};

// Функции для работы с корзиной
function openCart() {
    const cartElement = document.getElementById('cart');
    cartElement.classList.add('open');
    cart.renderCart();
}

function closeCart() {
    document.getElementById('cart').classList.remove('open');
}

function checkout() {
    if (cart.items.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    alert(`Заказ оформлен! Сумма: $${cart.total}\nСпасибо за заказ!`);
    cart.clear();
    closeCart();
}

// Инициализация навигации
function initNavigation() {
    const categoryButtons = document.querySelectorAll('.categories button[data-category]');
    
    const sections = document.querySelectorAll('.category-title');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                categoryButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-category') === sectionId) {
                        btn.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.3 });
    
    sections.forEach(section => observer.observe(section));
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            if (category === 'all') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                scrollToSection(category);
            }
        });
    });
}

// Инициализация корзины и кнопок
function initCartFunctionality() {
    // Загружаем корзину
    cart.load();
    
    // Создаем модальное окно корзины
    const cartModal = document.createElement('div');
    cartModal.id = 'cart';
    cartModal.innerHTML = `
        <div class="cart-modal">
            <div class="cart-header">
                <h2>Корзина</h2>
                <button class="close-cart" onclick="closeCart()">×</button>
            </div>
            <div class="cart-items" id="cartItems">
                <!-- Сюда будут добавляться товары -->
            </div>
            <div class="cart-total">
                <span>Итого:</span>
                <span id="cartTotal">$0</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">Оформить заказ</button>
        </div>
    `;
    document.body.appendChild(cartModal);
    
    // Обработчики для кнопок "Добавить в корзину"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = parseInt(productCard.querySelector('.product-price').textContent);
            const productImage = productCard.querySelector('.product-image').src;
            
            // Анимация кнопки
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            // Добавляем в корзину
            cart.addItem(productName, productPrice, productImage);
        });
    });
    
    // Делаем кнопку корзины кликабельной
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
        // Удаляем старый обработчик, если есть
        cartButton.onclick = null;
        // Добавляем новый
        cartButton.addEventListener('click', openCart);
    }
}

// Инициализация функционала меню
function initMenuFunctionality() {
    document.body.style.overflowY = 'auto';
    
    // Инициализация навигации
    initNavigation();
    
    // Инициализация корзины
    initCartFunctionality();
    
    // Убедимся, что меню прокручивается
    const app = document.getElementById('app');
    if (app) {
        app.style.height = 'auto';
        app.style.minHeight = '100vh';
        app.style.overflowY = 'visible';
    }
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.overflowY = 'auto';
    
    const app = document.getElementById("app");
    if (app && !app.classList.contains('hidden')) {
        initMenuFunctionality();
    }
});

// Глобальные функции
window.scrollToSection = scrollToSection;
window.goToMenu = goToMenu;
window.openCart = openCart;
window.closeCart = closeCart;
window.checkout = checkout;
window.cart = cart;