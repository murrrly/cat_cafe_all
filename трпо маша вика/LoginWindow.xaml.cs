using MySql.Data.MySqlClient;
using RPM.Data;
using System;
using System.Windows;

namespace RPM
{
	public partial class LoginWindow : Window
	{

		public LoginWindow()
		{
			InitializeComponent();
			LoadLastLogin(); // автозаполнение при запуске
		}

		private void LoadLastLogin()
		{
			var (username, password) = SimpleLoginManager.Load();
			if (!string.IsNullOrEmpty(username))
			{
				UsernameTextBox.Text = username;
				PasswordBox.Password = password;
			}
		}

		private void LoginButton_Click(object sender, RoutedEventArgs e)
		{
			string login = UsernameTextBox.Text.Trim();
			string password = PasswordBox.Password.Trim();

			if (login == "" || password == "")
			{
				ShowError("Введите логин и пароль");
				return;
			}

			try
			{

				using (var conn = Db.GetConnection())
				{
					conn.Open();
					string query = @"SELECT ID, PositionID
                                     FROM Users 
                                     WHERE Login=@login 
                                     AND Password=@password 
                                     AND IsActive=1";

					MySqlCommand cmd = new MySqlCommand(query, conn);
					cmd.Parameters.AddWithValue("@login", login);
					cmd.Parameters.AddWithValue("@password", password);

					MySqlDataReader reader = cmd.ExecuteReader();

					if (reader.Read())
					{
						// Сохраняем логин и пароль
						SimpleLoginManager.Save(login, password);

						int positionId = Convert.ToInt32(reader["PositionID"]);

						if (positionId == 1)
						{
							AdminWindow admin = new AdminWindow();
							admin.Show();
						}
						else
						{
							// Передаем BranchID в кассирское окно
							CashierWindow cashier = new CashierWindow();
							cashier.Show();
						}

						this.Close();
					}
					else
					{
						ShowError("Неверный логин или пароль");
						SimpleLoginManager.Delete(); // удаляем старые данные
					}
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show(ex.ToString());
				ShowError("Ошибка подключения к БД");
			}
		}

		private void ExitButton_Click(object sender, RoutedEventArgs e)
		{
			Application.Current.Shutdown();
		}

		private void ShowError(string message)
		{
			ErrorText.Text = message;
			ErrorText.Visibility = Visibility.Visible;
		}

		private void UsernameTextBox_GotFocus(object sender, RoutedEventArgs e)
		{
			ErrorText.Visibility = Visibility.Collapsed;
		}

		private void UsernameTextBox_LostFocus(object sender, RoutedEventArgs e) { }

		private void PasswordBox_GotFocus(object sender, RoutedEventArgs e)
		{
			ErrorText.Visibility = Visibility.Collapsed;
		}

		private void PasswordBox_LostFocus(object sender, RoutedEventArgs e) { }
	}
}
