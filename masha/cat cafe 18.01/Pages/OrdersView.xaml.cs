using System;
using System.Data;
using System.Windows;
using System.Windows.Controls;
using MySql.Data.MySqlClient;

namespace RPM.Pages
{
	public partial class OrdersView : UserControl
	{
		string connectionString = "server=localhost;user=root;password=cat12345;database=catcafe_db;";

		public OrdersView()
		{
			InitializeComponent();
			LoadOrders();
		}

		private void LoadOrders()
		{
			try
			{
				using (MySqlConnection conn = new MySqlConnection(connectionString))
				{
					conn.Open();

					string query = @"
                        SELECT o.OrderNumber, o.OrderDate, o.TotalAmount, u.FullName AS CashierName
                        FROM Orders o
                        LEFT JOIN Users u ON o.CashierUserID = u.ID
                        ORDER BY o.OrderDate DESC";

					MySqlDataAdapter adapter = new MySqlDataAdapter(query, conn);
					DataTable dt = new DataTable();
					adapter.Fill(dt);

					OrdersDataGrid.ItemsSource = dt.DefaultView;
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при загрузке заказов: " + ex.Message);
			}
		}

		private void RefreshButton_Click(object sender, RoutedEventArgs e)
		{
			LoadOrders();
		}
	}
}
