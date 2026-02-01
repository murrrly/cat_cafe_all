using System;
using System.Collections.Generic;
using System.Data;
using System.Windows;
using System.Windows.Controls;
using MySql.Data.MySqlClient;

namespace RPM.Pages
{
	public partial class NewOrderView : UserControl
	{
		string connectionString = "server=localhost;user=root;password=cat12345;database=catcafe_db;";
		DataTable menuTable = new DataTable();
		List<CartItem> cart = new List<CartItem>();
		int cashierId = 2; // Пример: ID текущего кассира. Нужно передавать реально после Login.

		public NewOrderView()
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
					string query = "SELECT ID, Name, Composition, Price FROM Menu";
					MySqlDataAdapter adapter = new MySqlDataAdapter(query, conn);
					menuTable.Clear();
					adapter.Fill(menuTable);
					MenuDataGrid.ItemsSource = menuTable.DefaultView;
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при загрузке меню: " + ex.Message);
			}
		}

		private void AddToCart_Click(object sender, RoutedEventArgs e)
		{
			if (MenuDataGrid.SelectedItem == null)
				return;

			DataRowView row = (DataRowView)MenuDataGrid.SelectedItem;
			int id = Convert.ToInt32(row["ID"]);
			string name = row["Name"].ToString();
			decimal price = Convert.ToDecimal(row["Price"]);

			var existing = cart.Find(x => x.MenuID == id);
			if (existing != null)
			{
				existing.Quantity++;
				existing.TotalPrice = existing.Quantity * existing.UnitPrice;
			}
			else
			{
				cart.Add(new CartItem
				{
					MenuID = id,
					Name = name,
					Quantity = 1,
					UnitPrice = price,
					TotalPrice = price
				});
			}

			RefreshCart();
		}

		private void RefreshCart()
		{
			CartDataGrid.ItemsSource = null;
			CartDataGrid.ItemsSource = cart;
			decimal total = 0;
			foreach (var item in cart)
				total += item.TotalPrice;
			TotalText.Text = "P Итого: {total:C2}";
		}

		private void PlaceOrder_Click(object sender, RoutedEventArgs e)
		{
			if (cart.Count == 0)
			{
				MessageBox.Show("Корзина пуста!");
				return;
			}

			string paymentType = ((ComboBoxItem)PaymentTypeCombo.SelectedItem).Content.ToString();
			string orderNumber = "ORD-" + DateTime.Now.ToString("yyyyMMddHHmmss");

			try
			{
				using (MySqlConnection conn = new MySqlConnection(connectionString))
				{
					conn.Open();
					MySqlTransaction transaction = conn.BeginTransaction();

					// 1️⃣ Вставляем заказ
					string insertOrder = @"
                        INSERT INTO Orders (OrderDate, TotalAmount, CashierUserID, OrderNumber)
                        VALUES (NOW(), @total, @cashierId, @orderNumber);
                        SELECT LAST_INSERT_ID();";

					MySqlCommand cmd = new MySqlCommand(insertOrder, conn, transaction);
					decimal totalAmount = 0;
					foreach (var item in cart)
						totalAmount += item.TotalPrice;

					cmd.Parameters.AddWithValue("@total", totalAmount);
					cmd.Parameters.AddWithValue("@cashierId", cashierId);
					cmd.Parameters.AddWithValue("@orderNumber", orderNumber);

					long orderId = Convert.ToInt64(cmd.ExecuteScalar());

					// 2️⃣ Вставляем позиции заказа
					foreach (var item in cart)
					{
						string insertItem = @"
                            INSERT INTO OrderMenu (OrderID, MenuID, BranchID, Quantity, UnitPrice)
                            VALUES (@orderId, @menuId, 1, @qty, @price)";

						MySqlCommand itemCmd = new MySqlCommand(insertItem, conn, transaction);
						itemCmd.Parameters.AddWithValue("@orderId", orderId);
						itemCmd.Parameters.AddWithValue("@menuId", item.MenuID);
						itemCmd.Parameters.AddWithValue("@qty", item.Quantity);
						itemCmd.Parameters.AddWithValue("@price", item.UnitPrice);
						itemCmd.ExecuteNonQuery();
					}

					transaction.Commit();
					MessageBox.Show("Заказ успешно оформлен!");
					cart.Clear();
					RefreshCart();
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при оформлении заказа: " + ex.Message);
			}
		}
	}

	public class CartItem
	{
		public int MenuID { get; set; }
		public string Name { get; set; }
		public int Quantity { get; set; }
		public decimal UnitPrice { get; set; }
		public decimal TotalPrice { get; set; }
	}
}
