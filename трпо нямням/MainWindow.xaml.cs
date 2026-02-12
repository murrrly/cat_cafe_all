using System.Configuration;
using System.Windows;
using System.Windows.Controls;
using RPM.Pages;

namespace RPM
{
	public partial class MainWindow : Window
	{
		public MainWindow()
		{
			InitializeComponent();
			MainFrame.Navigate(new DashboardPage()); // стартовая страница
		}

		private void DashboardBtn_Click(object sender, RoutedEventArgs e)
		{
			MainFrame.Navigate(new DashboardPage());
		}

		private void OrdersBtn_Click(object sender, RoutedEventArgs e)
		{
			MainFrame.Navigate(new OrdersManagementPage());
		}

		private void MenuBtn_Click(object sender, RoutedEventArgs e)
		{
			MainFrame.Navigate(new MenuManagementPage());
		}

		private void PromotionsBtn_Click(object sender, RoutedEventArgs e)
		{
			MainFrame.Navigate(new PromotionsManagementPage());
		}

		private void StatisticsBtn_Click(object sender, RoutedEventArgs e)
		{
			MainFrame.Navigate(new StatisticsPage());
		}

		private void UsersBtn_Click(object sender, RoutedEventArgs e)
		{
			//MainFrame.Navigate(new EmployeesPage());
		}

		private void SettingsBtn_Click(object sender, RoutedEventArgs e)
		{
			//MainFrame.Navigate(new SettingsPage());
		}

		private void LogoutBtn_Click(object sender, RoutedEventArgs e)
		{
			MessageBox.Show("Выход из системы");
		}
	}
}
