using System;
using System.Data;
using System.Windows;
using MySql.Data.MySqlClient;
using RPM.Data;

namespace RPM
{
	public partial class UsersEditWindow : Window
	{
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
				using (var conn = Db.GetConnection())
				{
					conn.Open();
					string query = "SELECT ID, PositionName FROM Positions";
					MySqlDataAdapter adapter = new MySqlDataAdapter(query, conn);
					DataTable dt = new DataTable();
					adapter.Fill(dt);
					PositionCombo.ItemsSource = dt.DefaultView;
					PositionCombo.DisplayMemberPath = "PositionName";
					PositionCombo.SelectedValuePath = "ID";
					PositionCombo.SelectedIndex = 0;
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
				using (var conn = Db.GetConnection())
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

				using (var conn = Db.GetConnection())
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

				DialogResult = true;
				Close();
			}
			catch (Exception ex)
			{
				MessageBox.Show("Ошибка при сохранении: " + ex.Message);
			}
		}

		private void CancelButton_Click(object sender, RoutedEventArgs e)
		{
			Close();
		}
	}
}
