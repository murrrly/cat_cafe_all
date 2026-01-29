using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Windows.Controls;

namespace RPM.Pages
{
	public partial class DashboardPage : Page
	{
		string connStr = "server=localhost;user=root;database=catcafe_db;port=3306;password=cat12345;";

		public DashboardPage()
		{
			InitializeComponent();
			LoadStats();
			LoadRecentOrders();
		}

		private void LoadStats()
		{
			using var conn = new MySqlConnection(connStr);
			conn.Open();

			// Заказы сегодня
			var cmd1 = new MySqlCommand("SELECT COUNT(*) FROM Orders WHERE DATE(OrderDate)=CURDATE()", conn);
			TodayOrdersText.Text = cmd1.ExecuteScalar().ToString();

			// Выручка сегодня
			var cmd2 = new MySqlCommand("SELECT IFNULL(SUM(TotalAmount),0) FROM Orders WHERE DATE(OrderDate)=CURDATE()", conn);
			TodayRevenueText.Text = cmd2.ExecuteScalar() + " ₽";

			// Активные акции
			var cmd3 = new MySqlCommand("SELECT COUNT(*) FROM Promotions WHERE CURDATE() BETWEEN StartDate AND EndDate", conn);
			ActivePromotionsText.Text = cmd3.ExecuteScalar().ToString();

			// Количество блюд
			var cmd4 = new MySqlCommand("SELECT COUNT(*) FROM Menu", conn);
			MenuItemsText.Text = cmd4.ExecuteScalar().ToString();
		}

		private void LoadRecentOrders()
		{
			var orders = new List<OrderModel>();

			using var conn = new MySqlConnection(connStr);
			conn.Open();

			var cmd = new MySqlCommand("SELECT OrderNumber, OrderDate, TotalAmount, PaymentType FROM Orders ORDER BY OrderDate DESC LIMIT 10", conn);
			using var reader = cmd.ExecuteReader();

			while (reader.Read())
			{
				orders.Add(new OrderModel
				{
					OrderNumber = reader["OrderNumber"].ToString(),
					OrderDate = Convert.ToDateTime(reader["OrderDate"]).ToString("dd.MM HH:mm"),
					TotalAmount = reader["TotalAmount"].ToString() + " ₽",
					PaymentType = reader["PaymentType"].ToString()
				});
			}

			RecentOrdersGrid.ItemsSource = orders;
		}
	}

	public class OrderModel
	{
		public string OrderNumber { get; set; }
		public string OrderDate { get; set; }
		public string TotalAmount { get; set; }
		public string PaymentType { get; set; }
	}
}
