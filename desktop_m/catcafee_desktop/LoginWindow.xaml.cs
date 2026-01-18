using RPM;
using System.Windows;
using System.Windows.Controls;

namespace RPM
{
    public partial class LoginWindow : Window
    {
        public LoginWindow()
        {
            InitializeComponent();
            UsernameTextBox.Focus();
        }

        private void LoginButton_Click(object sender, RoutedEventArgs e)
        {
            string username = UsernameTextBox.Text;
            string password = PasswordBox.Password;

            // Сброс placeholder текста если он остался
            if (username == "Введите логин...")
                username = "";

            // Простая проверка логина и пароля
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
                PasswordBox.Password = "";
                UsernameTextBox.Text = "Введите логин...";
                UsernameTextBox.Focus();
            }
        }

        private void UsernameTextBox_GotFocus(object sender, RoutedEventArgs e)
        {
            if (UsernameTextBox.Text == "Введите логин...")
            {
                UsernameTextBox.Text = "";
            }
        }

        private void UsernameTextBox_LostFocus(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(UsernameTextBox.Text))
            {
                UsernameTextBox.Text = "Введите логин...";
            }
        }
    }
}