using System.Windows;
using RPM.Pages;

namespace RPM
{
	public partial class AdminWindow : Window
	{
		public AdminWindow()
		{
			InitializeComponent();
		}

		private void Orders_Click(object sender, RoutedEventArgs e)
		{
			MainContent.Content = new OrdersView();
		}

		private void Menu_Click(object sender, RoutedEventArgs e)
		{
			MainContent.Content = new MenuView();
		}

		private void Users_Click(object sender, RoutedEventArgs e)
		{
			MainContent.Content = new UsersView();
		}

		private void Stats_Click(object sender, RoutedEventArgs e)
		{
			MainContent.Content = new StatisticsView();
		}

		private void Promo_Click(object sender, RoutedEventArgs e)
		{
			MainContent.Content = new PromotionsView();
		}

		private void Exit_Click(object sender, RoutedEventArgs e)
		{
			new LoginWindow().Show();
			this.Close();
		}
	}
}
