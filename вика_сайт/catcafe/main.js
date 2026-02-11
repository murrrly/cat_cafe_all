// 🔥 Переменные экранов и кнопки
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
            const imgPath = p.ImageURL ? `/Images/${p.ImageURL}` : `/Images/default.png`;
            html += `
            <div class="product-card" data-category="${catId}">
                <img src="${imgPath}" class="product-image" alt="${p.Name}">
                <div class="product-content">
                    <h3 class="product-title">${p.Name}</h3>
                    <div class="product-ingredients">${p.Composition || ''}</div>
                    <div class="product-footer">
                        <div class="product-price">${p.Price} ₽</div>
                        <button class="add-to-cart-btn" onclick="addToCart('${p.Name.replace(/'/g, "\\'")}')">В корзину</button>
                    </div>
                </div>
            </div>`;
        });
    });

    container.innerHTML = html;
    setupFilters();
}

// 🎚 Фильтры по категориям
function setupFilters() {
    document.querySelectorAll(".categories button").forEach(btn => {
        btn.addEventListener("click", function () {
            const cat = this.dataset.category;
            document.querySelectorAll(".categories button").forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            document.querySelectorAll(".product-card").forEach(card => {
                card.style.display = (cat === "all" || card.dataset.category === cat) ? "block" : "none";
            });
        });
    });
}

// 🛒 Корзина
let cartCount = 0;
function addToCart(name) {
    cartCount++;
    const counter = document.querySelector(".cart-count");
    if (counter) counter.innerText = cartCount;
    console.log("🛒 Добавлено:", name);
}