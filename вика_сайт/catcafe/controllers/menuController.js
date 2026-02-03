const { pool } = require('../config/db');

class MenuController {
    // Получить все категории
    async getCategories(req, res) {
        try {
            const [categories] = await pool.execute(`
                SELECT 
                    c.ID,
                    c.Name,
                    c.Description,
                    COUNT(m.ID) as item_count
                FROM Categories c
                LEFT JOIN Menu m ON c.ID = m.CategoryID
                GROUP BY c.ID, c.Name, c.Description
                ORDER BY c.Name
            `);
            
            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при загрузке категорий'
            });
        }
    }

    // Получить все товары с фильтрацией
    async getProducts(req, res) {
        try {
            const { 
                category = 'all', 
                branch = 1, 
                search = '',
                limit = 50,
                offset = 0 
            } = req.query;

            let query = `
                SELECT 
                    m.ID,
                    m.Name,
                    m.Composition,
                    m.Description,
                    m.Price,
                    m.ImageURL,
                    m.CategoryID,
                    c.Name as CategoryName,
                    mb.StatusID,
                    ms.Description as StatusDescription,
                    IFNULL(p.DiscountPrice, m.Price) as FinalPrice,
                    p.Name as PromotionName,
                    p.ID as PromotionID
                FROM Menu m
                LEFT JOIN Categories c ON m.CategoryID = c.ID
                LEFT JOIN MenuBranches mb ON m.ID = mb.MenuID AND mb.BranchID = ?
                LEFT JOIN MenuStatuses ms ON mb.StatusID = ms.ID
                LEFT JOIN PromotionMenu pm ON m.ID = pm.MenuID
                LEFT JOIN Promotions p ON pm.PromotionID = p.ID 
                    AND p.StartDate <= CURDATE() 
                    AND p.EndDate >= CURDATE()
                    AND p.BranchID = ?
                WHERE 1=1
            `;

            const params = [branch, branch];

            // Фильтр по категории
            if (category !== 'all') {
                query += " AND c.Name = ?";
                params.push(category);
            }

            // Поиск
            if (search) {
                query += " AND (m.Name LIKE ? OR m.Composition LIKE ? OR m.Description LIKE ?)";
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            // Только доступные товары
            query += " AND (mb.StatusID IS NULL OR ms.Description NOT LIKE '%недоступно%')";

            // Группировка и сортировка
            query += " GROUP BY m.ID";
            query += " ORDER BY c.Name, m.Name";
            query += " LIMIT ? OFFSET ?";
            params.push(parseInt(limit), parseInt(offset));

            const [products] = await pool.execute(query, params);

            // Форматирование данных
            const formattedProducts = products.map(product => ({
                id: product.ID,
                name: product.Name,
                composition: product.Composition,
                description: product.Description,
                price: parseFloat(product.Price),
                finalPrice: parseFloat(product.FinalPrice),
                image: product.ImageURL || '/img/default.jpg',
                category: {
                    id: product.CategoryID,
                    name: product.CategoryName
                },
                status: product.StatusDescription,
                hasPromotion: !!product.PromotionID,
                promotion: product.PromotionID ? {
                    id: product.PromotionID,
                    name: product.PromotionName,
                    discountPrice: parseFloat(product.FinalPrice)
                } : null,
                isNew: this.checkIfNew(product) // Можно добавить логику определения новинки
            }));

            // Получаем общее количество для пагинации
            const [countResult] = await pool.execute(`
                SELECT COUNT(DISTINCT m.ID) as total
                FROM Menu m
                LEFT JOIN Categories c ON m.CategoryID = c.ID
                LEFT JOIN MenuBranches mb ON m.ID = mb.MenuID AND mb.BranchID = ?
                LEFT JOIN MenuStatuses ms ON mb.StatusID = ms.ID
                WHERE 1=1
                ${category !== 'all' ? "AND c.Name = ?" : ""}
                ${search ? "AND (m.Name LIKE ? OR m.Composition LIKE ? OR m.Description LIKE ?)" : ""}
                AND (mb.StatusID IS NULL OR ms.Description NOT LIKE '%недоступно%')
            `, params.slice(0, -2)); // Убираем LIMIT и OFFSET

            res.json({
                success: true,
                data: formattedProducts,
                pagination: {
                    total: countResult[0]?.total || 0,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + parseInt(limit)) < countResult[0]?.total
                }
            });

        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при загрузке товаров'
            });
        }
    }

    // Получить акции
    async getPromotions(req, res) {
        try {
            const { branch = 1 } = req.query;
            
            const [promotions] = await pool.execute(`
                SELECT 
                    p.*,
                    GROUP_CONCAT(m.Name SEPARATOR ', ') as menu_items,
                    COUNT(pm.MenuID) as item_count
                FROM Promotions p
                LEFT JOIN PromotionMenu pm ON p.ID = pm.PromotionID
                LEFT JOIN Menu m ON pm.MenuID = m.ID
                WHERE p.BranchID = ?
                AND p.StartDate <= CURDATE()
                AND p.EndDate >= CURDATE()
                GROUP BY p.ID
                ORDER BY p.StartDate DESC
            `, [branch]);

            res.json({
                success: true,
                data: promotions
            });
        } catch (error) {
            console.error('Error fetching promotions:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при загрузке акций'
            });
        }
    }

    // Получить один товар по ID
    async getProductById(req, res) {
        try {
            const { id } = req.params;
            
            const [products] = await pool.execute(`
                SELECT 
                    m.*,
                    c.Name as CategoryName,
                    b.Address as BranchAddress
                FROM Menu m
                LEFT JOIN Categories c ON m.CategoryID = c.ID
                LEFT JOIN MenuBranches mb ON m.ID = mb.MenuID
                LEFT JOIN Branches b ON mb.BranchID = b.ID
                WHERE m.ID = ?
                LIMIT 1
            `, [id]);

            if (products.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Товар не найден'
                });
            }

            res.json({
                success: true,
                data: products[0]
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при загрузке товара'
            });
        }
    }

    // Проверка, является ли товар новинкой
    checkIfNew(product) {
        // Пример логики: если товар добавлен в последние 30 дней
        // Здесь можно добавить свою логику
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Предположим, что у нас есть поле created_at
        const productDate = product.created_at ? new Date(product.created_at) : null;
        
        return productDate && productDate > thirtyDaysAgo;
    }
}

module.exports = new MenuController();