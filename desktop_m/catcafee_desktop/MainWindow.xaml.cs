using System.Windows;
using System.Windows.Controls;

namespace RPM
{
    public partial class DashboardPage : Page
    {
        public DashboardPage()
        {
            InitializeComponent();
            LoadRecentOrders();
        }

        private void LoadRecentOrders()
        {
            // Заглушка - в реальном приложении данные из БД
            RecentOrdersGrid.ItemsSource = new[]
            {
                new { Id = "1001", CustomerName = "Попова Мария", Phone = "+7 (912) 345-67-89", TotalAmount = "850 ₽", Status = "В процессе", OrderTime = "14:30" },
                new { Id = "1002", CustomerName = "Тугашова Виктория", Phone = "+7 (923) 456-78-90", TotalAmount = "1,200 ₽", Status = "Готов", OrderTime = "14:25" },
                new { Id = "1003", CustomerName = "Губашева Дина", Phone = "+7 (934) 567-89-01", TotalAmount = "650 ₽", Status = "Новый", OrderTime = "14:20" },
                new { Id = "1004", CustomerName = "Хихматуллина Айгль", Phone = "+7 (945) 678-90-12", TotalAmount = "2,150 ₽", Status = "Доставляется", OrderTime = "14:15" },
                new { Id = "1005", CustomerName = "хихиххаххах", Phone = "+7 (956) 789-01-23", TotalAmount = "980 ₽", Status = "Выполнен", OrderTime = "14:10" }
            };
        }

        private void AddNewDish_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Переход к добавлению нового блюда", "Быстрое действие",
                MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void CreatePromotion_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Переход к созданию акции", "Быстрое действие",
                MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void ViewNewOrders_Click(object sender, RoutedEventArgs e)
        {
            NavigationService?.Navigate(new OrdersManagementPage());
        }

        private void AddEmployee_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Переход к добавлению сотрудника", "Быстрое действие",
                MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }
}