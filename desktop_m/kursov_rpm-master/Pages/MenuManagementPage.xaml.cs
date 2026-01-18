using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using RPM.Models;
using Dish = RPM.Models.Dish;

namespace RPM.Pages
{
    public partial class MenuManagementPage : Page
    {
        private List<Dish> allDishes = new List<Dish>();

        public MenuManagementPage()
        {
            InitializeComponent(); // ← ВАЖНО: должен быть первым!
            LoadDishes();
            InitializeFilters();
        }

        private void InitializeFilters()
        {
            // Инициализация комбобокса если он есть в XAML
            if (CategoryFilterComboBox != null)
            {
                CategoryFilterComboBox.SelectedIndex = 0;
            }
        }

        private void LoadDishes()
        {
            // Заглушка с тестовыми данными
            allDishes = new List<Dish>
            {
                new Dish { Id = 1, Name = "Чизбургер", Category = "Бургеры", Price = 199,
                          Description = "Сочный бургер с сыром", IsAvailable = true },
                new Dish { Id = 2, Name = "Пепперони", Category = "Пицца", Price = 449,
                          Description = "Пицца с пепперони и сыром", IsAvailable = true },
                new Dish { Id = 3, Name = "Кола", Category = "Напитки", Price = 99,
                          Description = "Газированный напиток", IsAvailable = true },
                new Dish { Id = 4, Name = "Чизкейк", Category = "Десерты", Price = 179,
                          Description = "Классический чизкейк", IsAvailable = false },
                new Dish { Id = 5, Name = "Цезарь", Category = "Салаты", Price = 299,
                          Description = "Салат Цезарь с курицей", IsAvailable = true }
            };

            ApplyMenuFilters();
        }

        private void ApplyMenuFilters()
        {
            if (allDishes == null) return;

            var filteredItems = allDishes.AsEnumerable();

            // Фильтр по поиску
            if (SearchMenuTextBox != null && !string.IsNullOrEmpty(SearchMenuTextBox.Text))
            {
                var searchText = SearchMenuTextBox.Text.ToLower();
                filteredItems = filteredItems.Where(item =>
                    item.Name.ToLower().Contains(searchText) ||
                    item.Description.ToLower().Contains(searchText));
            }

            // Фильтр по категории
            if (CategoryFilterComboBox != null &&
                CategoryFilterComboBox.SelectedItem is ComboBoxItem categoryItem &&
                categoryItem.Content.ToString() != "Все категории")
            {
                filteredItems = filteredItems.Where(item => item.Category == categoryItem.Content.ToString());
            }

            // Фильтр по доступности
            if (AvailableOnlyCheckBox != null && AvailableOnlyCheckBox.IsChecked == true)
            {
                filteredItems = filteredItems.Where(item => item.IsAvailable);
            }

            if (MenuGrid != null)
            {
                MenuGrid.ItemsSource = filteredItems.ToList();
            }
        }

        private void SearchMenuTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            ApplyMenuFilters();
        }

        private void CategoryFilterComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            ApplyMenuFilters();
        }

        private void AvailableOnlyCheckBox_Changed(object sender, RoutedEventArgs e)
        {
            ApplyMenuFilters();
        }

        private void AddDish_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Добавление нового блюда", "Новое блюдо",
                MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void EditDish_Click(object sender, RoutedEventArgs e)
        {
            if (MenuGrid?.SelectedItem is Dish dish)
            {
                MessageBox.Show($"Редактирование блюда: {dish.Name}", "Редактирование",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void DeleteDish_Click(object sender, RoutedEventArgs e)
        {
            if (MenuGrid?.SelectedItem is Dish dish)
            {
                var result = MessageBox.Show($"Удалить блюдо '{dish.Name}'?", "Подтверждение удаления",
                    MessageBoxButton.YesNo, MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    allDishes.Remove(dish);
                    ApplyMenuFilters();
                    MessageBox.Show("Блюдо удалено", "Успех",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
        }
    }
}