using MySql.Data.MySqlClient;
using System.Configuration;

public static class DbConnectionFactory
{
	public static MySqlConnection GetConnection()
	{
		string connectionString = ConfigurationManager
			.ConnectionStrings["MyDb"]
			.ConnectionString;

		return new MySqlConnection(connectionString);
	}
}
