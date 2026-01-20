using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;

namespace RPM
{
	public partial class LoginWindow : Window
	{
		private bool usernameHasText = false;
		private bool passwordHasText = false;

		public LoginWindow()
		{
			InitializeComponent();
			Loaded += LoginWindow_Loaded;
		}

		private void LoginWindow_Loaded(object sender, RoutedEventArgs e)
		{
			// Устанавливаем placeholder-тексты
			SetPlaceholder(UsernameTextBox, "Введите логин", false);
			SetPlaceholder(PasswordBox, "Введите пароль", false);
		}

		private void SetPlaceholder(Control control, string placeholder, bool hasText)
		{
			if (control is TextBox textBox)
			{
				if (!hasText)
				{
					textBox.Text = placeholder;
					textBox.Foreground = Brushes.Gray;
				}
			}
			else if (control is PasswordBox passwordBox)
			{
				if (!hasText)
				{
					// Для PasswordBox используем Tag для хранения placeholder
					passwordBox.Tag = placeholder;
					passwordBox.Foreground = Brushes.Gray;
				}
			}
		}

		private void UsernameTextBox_GotFocus(object sender, RoutedEventArgs e)
		{
			if (!usernameHasText)
			{
				UsernameTextBox.Text = "";
				UsernameTextBox.Foreground = Brushes.Black;
			}
		}

		private void UsernameTextBox_LostFocus(object sender, RoutedEventArgs e)
		{
			if (string.IsNullOrWhiteSpace(UsernameTextBox.Text))
			{
				usernameHasText = false;
				UsernameTextBox.Text = "Введите логин";
				UsernameTextBox.Foreground = Brushes.Gray;
			}
			else
			{
				usernameHasText = true;
				UsernameTextBox.Foreground = Brushes.Black;
			}
		}

		private void PasswordBox_GotFocus(object sender, RoutedEventArgs e)
		{
			if (!passwordHasText)
			{
				PasswordBox.Password = "";
				PasswordBox.Foreground = Brushes.Black;
			}
		}

		private void PasswordBox_LostFocus(object sender, RoutedEventArgs e)
		{
			if (string.IsNullOrEmpty(PasswordBox.Password))
			{
				passwordHasText = false;
				PasswordBox.Foreground = Brushes.Gray;
				// PasswordBox не может отображать текст, поэтому placeholder храним в Tag
			}
			else
			{
				passwordHasText = true;
				PasswordBox.Foreground = Brushes.Black;
			}
		}

		private void LoginButton_Click(object sender, RoutedEventArgs e)
		{
			string username = usernameHasText ? UsernameTextBox.Text : "";
			string password = passwordHasText ? PasswordBox.Password : "";

			// Убираем placeholder-тексты при проверке
			if (!usernameHasText || username == "Введите логин")
			{
				username = "";
			}

			// Проверка авторизации
			if (username == "admin" && password == "admin")
			{
				// Успешная авторизация
				MainWindow mainWindow = new MainWindow();
				mainWindow.Show();
				this.Close();
			}
			else
			{
				ErrorText.Text = "Неверный логин или пароль";
				ErrorText.Visibility = Visibility.Visible;
			}
		}

		// Обработчик нажатия клавиш (для удобства)
		private void Window_KeyDown(object sender, KeyEventArgs e)
		{
			if (e.Key == Key.Enter)
			{
				LoginButton_Click(sender, e);
			}
			else if (e.Key == Key.Escape)
			{
				this.Close();
			}
		}
	}
}