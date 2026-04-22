using System;
using System.Data;
using System.Security.Cryptography;
using System.Text;
using MySqlConnector;




public class UserService
{
    
    
    
    private readonly string _connectionString = "Server=localhost;Database=fnaf_game;Uid=root;Pwd=;Port=3306;";
    private static bool _isInitialized = false;

    public UserService()
    {
        
        Console.WriteLine("✅ UserService initialized");
    }

    
    
    
    
    private void EnsureInitialized()
    {
        if (_isInitialized) return;

        try
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                Console.WriteLine("✅ Conexión a MySQL exitosa");
                
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        CREATE TABLE IF NOT EXISTS Users (
                            Id INT PRIMARY KEY AUTO_INCREMENT,
                            Username VARCHAR(255) NOT NULL UNIQUE,
                            PasswordHash VARCHAR(255) NOT NULL,
                            Coins INT DEFAULT 0,
                            LastIP VARCHAR(45) NULL,
                            CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                            LastLogin DATETIME NULL
                        )";
                    command.ExecuteNonQuery();
                }
                Console.WriteLine("✅ Tabla de usuarios verificada/creada");
                
                
                using (var alterCommand = connection.CreateCommand())
                {
                    alterCommand.CommandText = @"
                        ALTER TABLE Users ADD COLUMN IF NOT EXISTS Coins INT DEFAULT 0";
                    try { alterCommand.ExecuteNonQuery(); } catch {  }
                }
                Console.WriteLine("✅ Columna Coins verificada");
                
                
                using (var alterCommand2 = connection.CreateCommand())
                {
                    alterCommand2.CommandText = @"
                        ALTER TABLE Users ADD COLUMN IF NOT EXISTS LastIP VARCHAR(45) NULL";
                    try { alterCommand2.ExecuteNonQuery(); } catch {  }
                }
                Console.WriteLine("✅ Columna LastIP verificada");
                _isInitialized = true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al inicializar la base de datos: {ex.Message}");
            Console.WriteLine($"❌ Detalles: {ex.InnerException?.Message}");
            throw;
        }
    }

    
    
    
    public (bool Success, string Message) RegisterUser(string username, string password)
    {
        
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            return (false, "El usuario y contraseña no pueden estar vacíos");
        }

        if (username.Length < 3)
        {
            return (false, "El usuario debe tener al menos 3 caracteres");
        }

        if (password.Length < 4)
        {
            return (false, "La contraseña debe tener al menos 4 caracteres");
        }

        try
        {
            EnsureInitialized();
            var passwordHash = HashPassword(password);

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        INSERT INTO Users (Username, PasswordHash)
                        VALUES (@username, @passwordHash)";
                    command.Parameters.AddWithValue("@username", username);
                    command.Parameters.AddWithValue("@passwordHash", passwordHash);

                    command.ExecuteNonQuery();
                }
            }

            Console.WriteLine($"✅ Usuario '{username}' registrado exitosamente");
            return (true, "Usuario registrado exitosamente");
        }
        catch (MySqlException ex) when (ex.Number == 1062) 
        {
            return (false, "El usuario ya existe");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al registrar usuario: {ex.Message}");
            return (false, $"Error al registrar: {ex.Message}");
        }
    }

    
    
    
    
    public (bool Success, string Message) AuthenticateUser(string username, string password, string? ipAddress = null)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            return (false, "El usuario y contraseña no pueden estar vacíos");
        }

        try
        {
            EnsureInitialized();
            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        SELECT PasswordHash 
                        FROM Users 
                        WHERE Username = @username";
                    command.Parameters.AddWithValue("@username", username);

                    var result = command.ExecuteScalar();
                    
                    
                    if (result == null)
                    {
                        Console.WriteLine($"❌ Login rechazado: Usuario '{username}' no existe");
                        return (false, "La cuenta no existe. Crea una cuenta primero.");
                    }

                    var storedHash = result.ToString() ?? "";
                    
                    
                    if (!string.IsNullOrEmpty(storedHash) && VerifyPassword(password, storedHash))
                    {
                        
                        using (var updateCommand = connection.CreateCommand())
                        {
                            updateCommand.CommandText = @"
                                UPDATE Users 
                                SET LastLogin = NOW(), LastIP = @ip 
                                WHERE Username = @username";
                            updateCommand.Parameters.AddWithValue("@username", username);
                            updateCommand.Parameters.AddWithValue("@ip", ipAddress ?? "Desconocida");
                            updateCommand.ExecuteNonQuery();
                        }

                        Console.WriteLine($"✅ Login exitoso para '{username}' desde IP: {ipAddress}");
                        return (true, "Login exitoso");
                    }
                    else
                    {
                        Console.WriteLine($"❌ Login rechazado: Contraseña incorrecta para '{username}'");
                        return (false, "Usuario o contraseña incorrectos");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al autenticar usuario: {ex.Message}");
            return (false, $"Error al autenticar: {ex.Message}");
        }
    }

    
    
    
    public bool UserExists(string username)
    {
        try
        {
            EnsureInitialized();
            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SELECT COUNT(*) FROM Users WHERE Username = @username";
                    command.Parameters.AddWithValue("@username", username);

                    var result = command.ExecuteScalar();
                    if (result != null && long.TryParse(result.ToString(), out long count))
                    {
                        return count > 0;
                    }
                    return false;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al verificar usuario: {ex.Message}");
            return false;
        }
    }

    
    
    
    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    
    
    
    private bool VerifyPassword(string password, string hash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput == hash;
    }

    
    
    
    public int GetUserCoins(string username)
    {
        try
        {
            EnsureInitialized();
            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SELECT Coins FROM Users WHERE Username = @username";
                    command.Parameters.AddWithValue("@username", username);

                    var result = command.ExecuteScalar();
                    if (result != null && int.TryParse(result.ToString(), out int coins))
                    {
                        return coins;
                    }
                    return 0;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al obtener monedas: {ex.Message}");
            return 0;
        }
    }

    
    
    
    public (bool Success, int NewCoins) UpdateUserCoins(string username, int amount)
    {
        try
        {
            EnsureInitialized();
            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        UPDATE Users 
                        SET Coins = Coins + @amount 
                        WHERE Username = @username";
                    command.Parameters.AddWithValue("@username", username);
                    command.Parameters.AddWithValue("@amount", amount);
                    command.ExecuteNonQuery();
                }
                
                
                int newCoins = GetUserCoins(username);
                Console.WriteLine($"💰 Monedas actualizadas para '{username}': +{amount} = {newCoins} total");
                return (true, newCoins);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al actualizar monedas: {ex.Message}");
            return (false, 0);
        }
    }

    
    
    
    public int GetTotalUsers()
    {
        try
        {
            EnsureInitialized();
            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SELECT COUNT(*) FROM Users";
                    var result = command.ExecuteScalar();
                    if (result != null && long.TryParse(result.ToString(), out long count))
                    {
                        return (int)count;
                    }
                    return 0;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al contar usuarios: {ex.Message}");
            return 0;
        }
    }
}
