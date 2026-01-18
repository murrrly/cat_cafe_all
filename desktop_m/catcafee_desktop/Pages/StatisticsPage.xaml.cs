using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;

namespace RPM
{
    public partial class StatisticsPage : Page
    {
        public StatisticsPage()
        {
            InitializeComponent();
            LoadStatistics();
        }

        private void LoadStatistics()
        {
            // Заглушка с тестовыми данными для статистики по дням
            var dailyStats = new[]
            {
                new { Date = DateTime.Now.AddDays(-6).ToString("dd.MM.yyyy"), Orders = 115, Revenue = 38950, AverageOrder = 339, NewCustomers = 18 },
                new { Date = DateTime.Now.AddDays(-5).ToString("dd.MM.yyyy"), Orders = 98, Revenue = 32420, AverageOrder = 331, NewCustomers = 15 },
                new { Date = DateTime.Now.AddDays(-4).ToString("dd.MM.yyyy"), Orders = 134, Revenue = 45230, AverageOrder = 337, NewCustomers = 22 },
                new { Date = DateTime.Now.AddDays(-3).ToString("dd.MM.yyyy"), Orders = 121, Revenue = 41200, AverageOrder = 340, NewCustomers = 19 },
                new { Date = DateTime.Now.AddDays(-2).ToString("dd.MM.yyyy"), Orders = 142, Revenue = 48900, AverageOrder = 344, NewCustomers = 25 },
                new { Date = DateTime.Now.AddDays(-1).ToString("dd.MM.yyyy"), Orders = 118, Revenue = 40100, AverageOrder = 340, NewCustomers = 20 },
                new { Date = DateTime.Now.ToString("dd.MM.yyyy"), Orders = 127, Revenue = 45230, AverageOrder = 356, NewCustomers = 23 }
            };

            DailyStatsGrid.ItemsSource = dailyStats;

            // Заглушка с тестовыми данными для популярных блюд
            var popularDishes = new[]
            {
                new { DishName = "Чизбургер", Category = "Бургеры", OrderCount = 89, TotalRevenue = 17711 },
                new { DishName = "Пепперони", Category = "Пицца", OrderCount = 67, TotalRevenue = 30083 },
                new { DishName = "Кола", Category = "Напитки", OrderCount = 145, TotalRevenue = 14355 },
                new { DishName = "Цезарь", Category = "Салаты", OrderCount = 45, TotalRevenue = 13455 },
                new { DishName = "Чизкейк", Category = "Десерты", OrderCount = 38, TotalRevenue = 6802 }
            };

            PopularDishesGrid.ItemsSource = popularDishes;
        }
    }
}