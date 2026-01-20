using RPM;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using RPM.Models;

namespace RPM
{
    public partial class UserManagementPage : Page
    {
        private List<Employee> allEmployees = new List<Employee>();

        public UserManagementPage()
        {
            InitializeComponent();
            LoadEmployees();
        }

        private void LoadEmployees()
        {
            // Заглушка с тестовыми данными
            allEmployees = new List<Employee>
            {
                new Employee { Id = 1, FullName = "Попова МАрия Алексеевна", Position = "Менеджер",
                              Phone = "+7 (912) 345-67-89", Email = "a.ivanov@fastfood.ru",
                              HireDate = DateTime.Now.AddYears(-1), IsActive = true },
                new Employee { Id = 2, FullName = "Тугашова Виктория Романовна", Position = "Повар",
                              Phone = "+7 (923) 456-78-90", Email = "m.petrova@fastfood.ru",
                              HireDate = DateTime.Now.AddMonths(-6), IsActive = true },
                new Employee { Id = 3, FullName = "Губашева Дина Ленаровна", Position = "Кассир",
                              Phone = "+7 (934) 567-89-01", Email = "d.sidorov@fastfood.ru",
                              HireDate = DateTime.Now.AddMonths(-3), IsActive = true },
                new Employee { Id = 4, FullName = "Хисматуллина Айгуль Маратовна", Position = "Курьер",
                              Phone = "+7 (945) 678-90-12", Email = "e.kozlova@fastfood.ru",
                              HireDate = DateTime.Now.AddMonths(-8), IsActive = false }
            };

            ApplyEmployeeFilters();
        }

        private void ApplyEmployeeFilters()
        {
            var filteredEmployees = allEmployees.AsEnumerable();

            if (ActiveOnlyCheckBox.IsChecked == true)
            {
                filteredEmployees = filteredEmployees.Where(e => e.IsActive);
            }

            EmployeesGrid.ItemsSource = filteredEmployees.ToList();
        }

        private void ActiveOnlyCheckBox_Changed(object sender, RoutedEventArgs e)
        {
            ApplyEmployeeFilters();
        }

        private void AddEmployee_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Добавление нового сотрудника", "Новый сотрудник",
                MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void EditEmployee_Click(object sender, RoutedEventArgs e)
        {
            if (EmployeesGrid.SelectedItem is Employee employee)
            {
                MessageBox.Show($"Редактирование сотрудника: {employee.FullName}", "Редактирование",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void DeleteEmployee_Click(object sender, RoutedEventArgs e)
        {
            if (EmployeesGrid.SelectedItem is Employee employee)
            {
                var result = MessageBox.Show($"Удалить сотрудника '{employee.FullName}'?", "Подтверждение удаления",
                    MessageBoxButton.YesNo, MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    allEmployees.Remove(employee);
                    ApplyEmployeeFilters();
                    MessageBox.Show("Сотрудник удален", "Успех",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
        }
    }
}