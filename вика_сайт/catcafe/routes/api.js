const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Маршруты меню
router.get('/categories', menuController.getCategories);
router.get('/products', menuController.getProducts);
router.get('/products/:id', menuController.getProductById);
router.get('/promotions', menuController.getPromotions);

// Маршрут для проверки здоровья API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API работает корректно',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;