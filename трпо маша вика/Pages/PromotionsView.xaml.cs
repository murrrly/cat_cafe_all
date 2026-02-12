using System;
using System.Data;
using System.Windows;
using System.Windows.Controls;
using MySql.Data.MySqlClient;

namespace RPM.Pages
{
	public partial class PromotionsView : UserControl
	{
		DataTable promotionsTable = new DataTable();

		public PromotionsView()
		{
			InitializeComponent();
			LoadPromotions();
		}

		private void LoadPromotions()
		{
			try
			{
				using (var conn = DbConnectionFactory.GetConnection())
				{
					conn.Open();
					string query = "SELECT ID, Name, Description, StartDate, EndDate, DiscountPrice FROM Promotions ORDER BY StartDate DESC";
					MySqlDataAdapter adapter = new MySqlDataAdapter(query, conn);
					promotionsTable.Clear();
					adapter.Fill(promotionsTable);
					PromotionsDataGrid.ItemsSource = promotionsTable.DefaultView;
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при загрузке акций: " + ex.Message);
			}
		}

		private void CreateButton_Click(object sender, RoutedEventArgs e)
		{
			PromotionEditWindow win = new PromotionEditWindow();
			if (win.ShowDialog() == true)
			{
				LoadPromotions();
			}
		}
	}
}
