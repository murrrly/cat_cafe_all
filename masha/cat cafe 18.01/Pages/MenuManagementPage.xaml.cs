using MySql.Data.MySqlClient;
using RPM.Data;
using RPM.Models;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

namespace RPM.Pages
{
	public partial class MenuManagementPage : Page
	{
		private List<Dish> allDishes = new();

		public MenuManagementPage()
		{
			InitializeComponent();
			LoadCategories();
			LoadMenu();
		}

		private void LoadMenu()
		{
			using var conn = Db.GetConnection();
			conn.Open();

			string query = @"SELECT m.ID, m.Name, m.Price, m.Description,
                             c.Name AS CategoryName
                             FROM Menu m
                             LEFT JOIN Categories c ON m.CategoryID = c.ID";

			var cmd = new MySqlCommand(query, conn);
			var reader = cmd.ExecuteReader();

			allDishes.Clear();

			while (reader.Read())
			{
				allDishes.Add(new Dish
				{
					Id = reader.GetInt32("ID"),
					Name = reader.GetString("Name"),
					Category = reader["CategoryName"]?.ToString(),
					Price = reader.GetDecimal("Price"),
					Description = reader["Description"]?.ToString(),
					IsAvailable = true
				});
			}

			MenuGrid.ItemsSource = allDishes;
		}

		private void LoadCategories()
		{
			using var conn = Db.GetConnection();
			conn.Open();

			var cmd = new MySqlCommand("SELECT Name FROM Categories", conn);
			var reader = cmd.ExecuteReader();

			CategoryBox.Items.Add("Все");

			while (reader.Read())
				CategoryBox.Items.Add(reader.GetString("Name"));

			CategoryBox.SelectedIndex = 0;
		}

		private void ApplyFilters()
		{
			var filtered = allDishes.AsEnumerable();

			if (!string.IsNullOrWhiteSpace(SearchBox.Text))
				filtered = filtered.Where(x => x.Name.ToLower().Contains(SearchBox.Text.ToLower()));

			if (CategoryBox.SelectedItem?.ToString() != "Все")
				filtered = filtered.Where(x => x.Category == CategoryBox.SelectedItem.ToString());

			MenuGrid.ItemsSource = filtered.ToList();
		}

		private void SearchBox_TextChanged(object sender, TextChangedEventArgs e) => ApplyFilters();
		private void CategoryBox_SelectionChanged(object sender, SelectionChangedEventArgs e) => ApplyFilters();
		private void AvailableCheck_Changed(object sender, RoutedEventArgs e) => ApplyFilters();

		private void AddDish_Click(object sender, RoutedEventArgs e)
		{
			MessageBox.Show("Окно добавления блюда будет здесь 😼");
		}

		private void Edit_Click(object sender, RoutedEventArgs e)
		{
			if (MenuGrid.SelectedItem is Dish dish)
				MessageBox.Show($"Редактирование {dish.Name}");
		}

		private void Delete_Click(object sender, RoutedEventArgs e)
		{
			if (MenuGrid.SelectedItem is Dish dish)
			{
				using var conn = Db.GetConnection();
				conn.Open();
				var cmd = new MySqlCommand("DELETE FROM Menu WHERE ID=@id", conn);
				cmd.Parameters.AddWithValue("@id", dish.Id);
				cmd.ExecuteNonQuery();

				LoadMenu();
			}
		}
	}
}
