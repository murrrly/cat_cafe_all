using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using MySql.Data.MySqlClient;

namespace RPM.Pages
{
	public partial class MenuView : UserControl
	{
		string connectionString = "server=localhost;user=root;password=cat12345;database=catcafe_db;";
		DataTable menuTable = new DataTable();

		public MenuView()
		{
			InitializeComponent();
			LoadMenu();
		}

		private void LoadMenu()
		{
			try
			{
				using (MySqlConnection conn = new MySqlConnection(connectionString))
				{
					conn.Open();
					string query = "SELECT ID, Name, Composition, Description, Price, ImageURL FROM Menu";
					MySqlDataAdapter adapter = new MySqlDataAdapter(query, conn);
					menuTable.Clear();
					adapter.Fill(menuTable);

					var items = menuTable.AsEnumerable().Select(r => new MenuItem
					{
						ID = Convert.ToInt32(r["ID"]),
						Name = r["Name"].ToString(),
						Composition = r["Composition"].ToString(),
						Description = r["Description"].ToString(),
						Price = Convert.ToDecimal(r["Price"]),
						ImageURL = GetAbsolutePath(r["ImageURL"].ToString())
					}).ToList();

					ItemsControlMenu.ItemsSource = items;
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при загрузке меню: " + ex.Message);
			}
		}

		private string GetAbsolutePath(string path)
		{
			if (Path.IsPathRooted(path))
				return path;

			return Path.Combine(AppDomain.CurrentDomain.BaseDirectory, path);
		}

		private void AddButton_Click(object sender, RoutedEventArgs e)
		{
			MenuEditWindow win = new MenuEditWindow();
			if (win.ShowDialog() == true)
				LoadMenu();
		}

		private void EditItem_Click(object sender, RoutedEventArgs e)
		{
			if (sender is Button btn && btn.DataContext is MenuItem item)
			{
				MenuEditWindow win = new MenuEditWindow(item.ID);
				if (win.ShowDialog() == true)
					LoadMenu();
			}
		}

		private void DeleteItem_Click(object sender, RoutedEventArgs e)
		{
			if (sender is Button btn && btn.DataContext is MenuItem item)
			{
				if (MessageBox.Show("Удалить выбранное блюдо?", "Подтверждение", MessageBoxButton.YesNo) == MessageBoxResult.Yes)
				{
					try
					{
						using (MySqlConnection conn = new MySqlConnection(connectionString))
						{
							conn.Open();
							string query = "DELETE FROM Menu WHERE ID=@id";
							MySqlCommand cmd = new MySqlCommand(query, conn);
							cmd.Parameters.AddWithValue("@id", item.ID);
							cmd.ExecuteNonQuery();
							LoadMenu();
						}
					}
					catch (Exception ex)
					{
						MessageBox.Show("Ошибка при удалении: " + ex.Message);
					}
				}
			}
		}
	}

	public class MenuItem
	{
		public int ID { get; set; }
		public string Name { get; set; }
		public string Composition { get; set; }
		public string Description { get; set; }
		public decimal Price { get; set; }
		public string ImageURL { get; set; }
	}
}
