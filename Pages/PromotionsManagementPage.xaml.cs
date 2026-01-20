using RPM;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using RPM.Models;

namespace RPM
{
    public partial class PromotionsManagementPage : Page
    {
        private List<Promotion> allPromotions = new List<Promotion>();

        public PromotionsManagementPage()
        {
            InitializeComponent();
            LoadPromotions();
        }

        private void LoadPromotions()
        {
            // Заглушка с тестовыми данными
            allPromotions = new List<Promotion>
            {
                new Promotion { Id = 1, Title = "Скидка на первый заказ", PromoCode = "WELCOME10",
                               Discount = 10, StartDate = DateTime.Now.AddDays(-10),
                               EndDate = DateTime.Now.AddDays(20), IsActive = true },
                new Promotion { Id = 2, Title = "Счастливые часы", PromoCode = "HAPPYHOUR",
                               Discount = 15, StartDate = DateTime.Now.AddDays(-5),
                               EndDate = DateTime.Now.AddDays(5), IsActive = true },
                new Promotion { Id = 3, Title = "Вечерняя скидка", PromoCode = "EVENING20",
                               Discount = 20, StartDate = DateTime.Now.AddDays(-15),
                               EndDate = DateTime.Now.AddDays(2), IsActive = true },
                new Promotion { Id = 4, Title = "Новогодняя акция", PromoCode = "NEWYEAR25",
                               Discount = 25, StartDate = DateTime.Now.AddDays(-30),
                               EndDate = DateTime.Now.AddDays(-1), IsActive = false }
            };

            ApplyPromotionFilters();
        }

        private void ApplyPromotionFilters()
        {
            var filteredPromotions = allPromotions.AsEnumerable();

            if (ActiveOnlyCheckBox.IsChecked == true)
            {
                filteredPromotions = filteredPromotions.Where(p => p.IsActive);
            }

            PromotionsGrid.ItemsSource = filteredPromotions.ToList();
        }

        private void ActiveOnlyCheckBox_Changed(object sender, RoutedEventArgs e)
        {
            ApplyPromotionFilters();
        }

        private void AddPromotion_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Создание новой акции", "Новая акция",
                MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void EditPromotion_Click(object sender, RoutedEventArgs e)
        {
            if (PromotionsGrid.SelectedItem is Promotion promotion)
            {
                MessageBox.Show($"Редактирование акции: {promotion.Title}", "Редактирование",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void DeletePromotion_Click(object sender, RoutedEventArgs e)
        {
            if (PromotionsGrid.SelectedItem is Promotion promotion)
            {
                var result = MessageBox.Show($"Удалить акцию '{promotion.Title}'?", "Подтверждение удаления",
                    MessageBoxButton.YesNo, MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    allPromotions.Remove(promotion);
                    ApplyPromotionFilters();
                    MessageBox.Show("Акция удалена", "Успех",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
        }
    }
}