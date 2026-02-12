using System;
using System.Data;
using System.Windows;
using System.Windows.Controls;
using MySql.Data.MySqlClient;

namespace RPM.Pages
{
	public partial class StatisticsView : UserControl
	{
		string connectionString = "server=localhost;user=root;password=cat12345;database=catcafe_db;";

		public StatisticsView()
		{
			InitializeComponent();
			LoadStatistics();
		}

		private void LoadStatistics()
		{
			try
			{
				using (MySqlConnection conn = new MySqlConnection(connectionString))
				{
					conn.Open();

					// Выручка за день
					string queryDay = "SELECT IFNULL(SUM(TotalAmount),0) FROM Orders WHERE DATE(OrderDate) = CURDATE()";
					MySqlCommand cmdDay = new MySqlCommand(queryDay, conn);
					RevenueDayText.Text = cmdDay.ExecuteScalar().ToString() + " ₽";

					// Выручка за месяц
					string queryMonth = "SELECT IFNULL(SUM(TotalAmount),0) FROM Orders WHERE MONTH(OrderDate)=MONTH(CURDATE()) AND YEAR(OrderDate)=YEAR(CURDATE())";
					MySqlCommand cmdMonth = new MySqlCommand(queryMonth, conn);
					RevenueMonthText.Text = cmdMonth.ExecuteScalar().ToString() + " ₽";

					// Количество заказов
					string queryOrders = "SELECT COUNT(*) FROM Orders WHERE MONTH(OrderDate)=MONTH(CURDATE()) AND YEAR(OrderDate)=YEAR(CURDATE())";
					MySqlCommand cmdOrders = new MySqlCommand(queryOrders, conn);
					OrdersCountText.Text = cmdOrders.ExecuteScalar().ToString();

					// Топ блюд
					string queryTop = @"
                        SELECT m.Name, SUM(om.Quantity) AS Quantity
                        FROM OrderMenu om
                        JOIN Menu m ON om.MenuID = m.ID
                        GROUP BY om.MenuID
                        ORDER BY Quantity DESC
                        LIMIT 10";
					MySqlDataAdapter adapter = new MySqlDataAdapter(queryTop, conn);
					DataTable dt = new DataTable();
					adapter.Fill(dt);
					TopMenuDataGrid.ItemsSource = dt.DefaultView;
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при загрузке статистики: " + ex.Message);
			}
		}

		private void RefreshButton_Click(object sender, RoutedEventArgs e)
		{
			LoadStatistics();
		}
	}
}
