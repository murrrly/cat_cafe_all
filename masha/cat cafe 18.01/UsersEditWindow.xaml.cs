using System;
using System.Data;
using System.Windows;
using MySql.Data.MySqlClient;

namespace RPM
{
	public partial class UsersEditWindow : Window
	{
		string connectionString = "server=localhost;user=root;password=cat12345;database=catcafe_db;";
		int userId = 0;
		bool changeRoleOnly = false;

		public UsersEditWindow(int id = 0, bool roleOnly = false)
		{
			InitializeComponent();
			userId = id;
			changeRoleOnly = roleOnly;
			LoadPositions();

			if (userId > 0)
				LoadUser();
			if (changeRoleOnly)
			{
				FullNameTextBox.IsEnabled = false;
				LoginTextBox.IsEnabled = false;
			}
		}

		private void LoadPositions()
		{
			try
			{
				using (MySqlConnection conn = new MySqlConnection(connectionString))
				{
					conn.Open();
					string query = "SELECT ID, PositionName FROM Positions";
					MySqlCommand cmd = new MySqlCommand(query, conn);

					var positions = new List<Position>();

					using (var reader = cmd.ExecuteReader())
					{
						while (reader.Read())
						{
							positions.Add(new Position
							{
								ID = Convert.ToInt32(reader["ID"]),
								PositionName = reader["PositionName"].ToString()
							});
						}
					}

					PositionCombo.ItemsSource = positions;
					PositionCombo.DisplayMemberPath = "PositionName";
					PositionCombo.SelectedValuePath = "ID";
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при загрузке ролей: " + ex.Message);
			}
		}


		private void LoadUser()
		{
			try
			{
				using (MySqlConnection conn = new MySqlConnection(connectionString))
				{
					conn.Open();
					string query = "SELECT FullName, Login, PositionID FROM Users WHERE ID=@id";
					MySqlCommand cmd = new MySqlCommand(query, conn);
					cmd.Parameters.AddWithValue("@id", userId);
					var reader = cmd.ExecuteReader();
					if (reader.Read())
					{
						FullNameTextBox.Text = reader["FullName"].ToString();
						LoginTextBox.Text = reader["Login"].ToString();
						PositionCombo.SelectedValue = Convert.ToInt32(reader["PositionID"]);
					}
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при загрузке пользователя: " + ex.Message);
			}
		}

		private void SaveButton_Click(object sender, RoutedEventArgs e)
		{
			int positionId = Convert.ToInt32(PositionCombo.SelectedValue);
			string fullName = FullNameTextBox.Text.Trim();
			string login = LoginTextBox.Text.Trim();

			try
			{

				using (MySqlConnection conn = new MySqlConnection(connectionString))
				{
					conn.Open();
					string query;
					if (userId == 0)
					{
						query = "INSERT INTO Users (FullName, Login, Password, PositionID) VALUES (@full,@login,'1234',@pos)";
					}
					else
					{
						query = "UPDATE Users SET PositionID=@pos";
						if (!changeRoleOnly)
							query += ", FullName=@full, Login=@login";
						query += " WHERE ID=@id";
					}
					if (PositionCombo.SelectedItem == null)
					{
						RoleErrorText.Visibility = Visibility.Visible;
						PositionCombo.Style = (Style)FindResource("ErrorComboStyle");
						return;
					}

					MySqlCommand cmd = new MySqlCommand(query, conn);
					cmd.Parameters.AddWithValue("@pos", positionId);
					if (!changeRoleOnly)
					{
						cmd.Parameters.AddWithValue("@full", fullName);
						cmd.Parameters.AddWithValue("@login", login);
					}
					if (userId > 0)
						cmd.Parameters.AddWithValue("@id", userId);

					cmd.ExecuteNonQuery();
				}
				RoleErrorText.Visibility = Visibility.Collapsed;
				PositionCombo.ClearValue(StyleProperty);

				DialogResult = true;
				Close();
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при сохранении: " + ex.Message);
			}
		}
		public class Position
		{
			public int ID { get; set; }
			public string PositionName { get; set; }

			public override string ToString()
			{
				return PositionName;
			}
		}


		private void CancelButton_Click(object sender, RoutedEventArgs e)
		{
			Close();
		}
	}
}
