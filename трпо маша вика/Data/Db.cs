using System.Windows;
using MySql.Data.MySqlClient;
using RPM.Data;
namespace RPM.Data
{
	public static class Db
	{
		private static string connectionString =
		$"server=localhost;user=root;password={DbSecrets.Password};database=catcafe_db;";
		
		public static MySqlConnection GetConnection()
		{

			return new MySqlConnection(connectionString);
		}
	}
}
