using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using RPM.Models;

namespace RPM

{
    public partial class OrdersManagementPage : Page
    {
        private List<Order> allOrders = new List<Order>();

        public OrdersManagementPage()
        {
            InitializeComponent();
            LoadOrders();
        }

        private void LoadOrders()
        {
            // Заглушка с тестовыми данными
            allOrders = new List<Order>
            {
                new Order { Id = 1001, CustomerName = "Попова Мария", Phone = "+7 (912) 345-67-89",
                           TotalAmount = 850, Status = "Новый", DeliveryType = "Доставка",
                           OrderTime = DateTime.Now.AddMinutes(-30) },
                new Order { Id = 1002, CustomerName = "Тугашова Виктория", Phone = "+7 (923) 456-78-90",
                           TotalAmount = 1200, Status = "В процессе", DeliveryType = "Самовывоз",
                           OrderTime = DateTime.Now.AddMinutes(-45) },
                new Order { Id = 1003, CustomerName = "Хисматуллина Айгуль", Phone = "+7 (934) 567-89-01",
                           TotalAmount = 650, Status = "Готов", DeliveryType = "Доставка",
                           OrderTime = DateTime.Now.AddMinutes(-60) },
                new Order { Id = 1004, CustomerName = "Губашева Дина", Phone = "+7 (945) 678-90-12",
                           TotalAmount = 2150, Status = "Доставляется", DeliveryType = "Доставка",
                           OrderTime = DateTime.Now.AddMinutes(-90) },
                new Order { Id = 1005, CustomerName = "Хихих хахах", Phone = "+7 (956) 789-01-23",
                           TotalAmount = 980, Status = "Выполнен", DeliveryType = "Самовывоз",
                           OrderTime = DateTime.Now.AddHours(-2) }
            };

            ApplyFilters();
        }

        private void ApplyFilters()
        {
            var filteredOrders = allOrders.AsEnumerable();

            // Фильтр по поиску
            if (!string.IsNullOrEmpty(SearchTextBox.Text))
            {
                var searchText = SearchTextBox.Text.ToLower();
                filteredOrders = filteredOrders.Where(o =>
                    o.CustomerName.ToLower().Contains(searchText) ||
                    o.Id.ToString().Contains(searchText));
            }

            // Фильтр по статусу
            if (StatusFilterComboBox.SelectedItem is ComboBoxItem statusItem && statusItem.Content.ToString() != "Все статусы")
            {
                filteredOrders = filteredOrders.Where(o => o.Status == statusItem.Content.ToString());
            }

            // Фильтр по дате
            if (DateFilterPicker.SelectedDate.HasValue)
            {
                filteredOrders = filteredOrders.Where(o => o.OrderTime.Date == DateFilterPicker.SelectedDate.Value.Date);
            }

            OrdersGrid.ItemsSource = filteredOrders.ToList();
            OrdersCountText.Text = $" ({filteredOrders.Count()} заказов)";
        }

        private void SearchTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            ApplyFilters();
        }

        private void StatusFilterComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            ApplyFilters();
        }

        private void DateFilterPicker_SelectedDateChanged(object sender, SelectionChangedEventArgs e)
        {
            ApplyFilters();
        }

        private void ResetFilters_Click(object sender, RoutedEventArgs e)
        {
            SearchTextBox.Text = "";
            StatusFilterComboBox.SelectedIndex = 0;
            DateFilterPicker.SelectedDate = null;
            ApplyFilters();
        }

        private void EditOrder_Click(object sender, RoutedEventArgs e)
        {
            if (OrdersGrid.SelectedItem is Order order)
            {
                MessageBox.Show($"Редактирование заказа #{order.Id}", "Редактирование",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void CompleteOrder_Click(object sender, RoutedEventArgs e)
        {
            if (OrdersGrid.SelectedItem is Order order)
            {
                order.Status = "Выполнен";
                ApplyFilters();
                MessageBox.Show($"Заказ #{order.Id} завершен", "Успех",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void CancelOrder_Click(object sender, RoutedEventArgs e)
        {
            if (OrdersGrid.SelectedItem is Order order)
            {
                order.Status = "Отменен";
                ApplyFilters();
                MessageBox.Show($"Заказ #{order.Id} отменен", "Успех",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void OrdersGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // Можно добавить детализацию заказа при выборе
        }
    }
}