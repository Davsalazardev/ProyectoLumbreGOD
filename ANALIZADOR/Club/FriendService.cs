using System;
using System.Collections.Generic;
using MySqlConnector;




public class FriendService
{
    private readonly string _connectionString = "Server=localhost;Database=fnaf_game;Uid=root;Pwd=;Port=3306;";
    private static bool _isInitialized = false;

    public FriendService()
    {
        EnsureInitialized();
    }

    private void EnsureInitialized()
    {
        if (_isInitialized) return;

        try
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                
                
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        CREATE TABLE IF NOT EXISTS Friends (
                            Id INT PRIMARY KEY AUTO_INCREMENT,
                            UserId INT NOT NULL,
                            FriendId INT NOT NULL,
                            Status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                            CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                            UNIQUE KEY unique_friendship (UserId, FriendId)
                        )";
                    command.ExecuteNonQuery();
                }
                
                
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        CREATE TABLE IF NOT EXISTS PrivateMessages (
                            Id INT PRIMARY KEY AUTO_INCREMENT,
                            SenderId INT NOT NULL,
                            ReceiverId INT NOT NULL,
                            Message TEXT NOT NULL,
                            IsRead BOOLEAN DEFAULT FALSE,
                            CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                        )";
                    command.ExecuteNonQuery();
                }
                
                Console.WriteLine("FriendService: Tablas de amigos inicializadas");
                _isInitialized = true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FriendService Error: {ex.Message}");
        }
    }

    
    
    
    public int GetUserIdByName(string username)
    {
        try
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SELECT Id FROM Users WHERE Username = @username";
                    command.Parameters.AddWithValue("@username", username);
                    var result = command.ExecuteScalar();
                    return result != null ? Convert.ToInt32(result) : -1;
                }
            }
        }
        catch
        {
            return -1;
        }
    }

    
    
    
    public bool SendFriendRequest(string fromUsername, string toUsername)
    {
        try
        {
            int fromId = GetUserIdByName(fromUsername);
            int toId = GetUserIdByName(toUsername);
            
            if (fromId == -1 || toId == -1 || fromId == toId) return false;

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                
                
                using (var checkCmd = connection.CreateCommand())
                {
                    checkCmd.CommandText = @"
                        SELECT COUNT(*) FROM Friends 
                        WHERE (UserId = @fromId AND FriendId = @toId) 
                           OR (UserId = @toId AND FriendId = @fromId)";
                    checkCmd.Parameters.AddWithValue("@fromId", fromId);
                    checkCmd.Parameters.AddWithValue("@toId", toId);
                    var count = Convert.ToInt32(checkCmd.ExecuteScalar());
                    if (count > 0) return false;
                }
                
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        INSERT INTO Friends (UserId, FriendId, Status) 
                        VALUES (@fromId, @toId, 'pending')";
                    command.Parameters.AddWithValue("@fromId", fromId);
                    command.Parameters.AddWithValue("@toId", toId);
                    command.ExecuteNonQuery();
                    return true;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"SendFriendRequest Error: {ex.Message}");
            return false;
        }
    }

    
    
    
    public bool AcceptFriendRequest(string username, string fromUsername)
    {
        try
        {
            int userId = GetUserIdByName(username);
            int fromId = GetUserIdByName(fromUsername);
            
            if (userId == -1 || fromId == -1) return false;

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        UPDATE Friends SET Status = 'accepted' 
                        WHERE UserId = @fromId AND FriendId = @userId AND Status = 'pending'";
                    command.Parameters.AddWithValue("@fromId", fromId);
                    command.Parameters.AddWithValue("@userId", userId);
                    int rows = command.ExecuteNonQuery();
                    return rows > 0;
                }
            }
        }
        catch
        {
            return false;
        }
    }

    
    
    
    public bool RejectFriendRequest(string username, string fromUsername)
    {
        try
        {
            int userId = GetUserIdByName(username);
            int fromId = GetUserIdByName(fromUsername);
            
            if (userId == -1 || fromId == -1) return false;

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        DELETE FROM Friends 
                        WHERE UserId = @fromId AND FriendId = @userId AND Status = 'pending'";
                    command.Parameters.AddWithValue("@fromId", fromId);
                    command.Parameters.AddWithValue("@userId", userId);
                    command.ExecuteNonQuery();
                    return true;
                }
            }
        }
        catch
        {
            return false;
        }
    }

    
    
    
    public bool RemoveFriend(string username, string friendUsername)
    {
        try
        {
            int userId = GetUserIdByName(username);
            int friendId = GetUserIdByName(friendUsername);
            
            if (userId == -1 || friendId == -1) return false;

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        DELETE FROM Friends 
                        WHERE (UserId = @userId AND FriendId = @friendId)
                           OR (UserId = @friendId AND FriendId = @userId)";
                    command.Parameters.AddWithValue("@userId", userId);
                    command.Parameters.AddWithValue("@friendId", friendId);
                    command.ExecuteNonQuery();
                    return true;
                }
            }
        }
        catch
        {
            return false;
        }
    }

    
    
    
    public List<FriendInfo> GetFriends(string username)
    {
        var friends = new List<FriendInfo>();
        try
        {
            int userId = GetUserIdByName(username);
            if (userId == -1) return friends;

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        SELECT u.Username 
                        FROM Friends f
                        JOIN Users u ON (
                            (f.UserId = @userId AND u.Id = f.FriendId) OR
                            (f.FriendId = @userId AND u.Id = f.UserId)
                        )
                        WHERE (f.UserId = @userId OR f.FriendId = @userId) 
                          AND f.Status = 'accepted'";
                    command.Parameters.AddWithValue("@userId", userId);
                    
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            friends.Add(new FriendInfo
                            {
                                Username = reader.GetString("Username"),
                                IsOnline = false 
                            });
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetFriends Error: {ex.Message}");
        }
        return friends;
    }

    
    
    
    public List<string> GetPendingRequests(string username)
    {
        var requests = new List<string>();
        try
        {
            int userId = GetUserIdByName(username);
            if (userId == -1) return requests;

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        SELECT u.Username 
                        FROM Friends f
                        JOIN Users u ON f.UserId = u.Id
                        WHERE f.FriendId = @userId AND f.Status = 'pending'";
                    command.Parameters.AddWithValue("@userId", userId);
                    
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            requests.Add(reader.GetString("Username"));
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetPendingRequests Error: {ex.Message}");
        }
        return requests;
    }

    
    
    
    public bool SavePrivateMessage(string fromUsername, string toUsername, string message)
    {
        try
        {
            int fromId = GetUserIdByName(fromUsername);
            int toId = GetUserIdByName(toUsername);
            
            if (fromId == -1 || toId == -1) return false;

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        INSERT INTO PrivateMessages (SenderId, ReceiverId, Message) 
                        VALUES (@fromId, @toId, @message)";
                    command.Parameters.AddWithValue("@fromId", fromId);
                    command.Parameters.AddWithValue("@toId", toId);
                    command.Parameters.AddWithValue("@message", message);
                    command.ExecuteNonQuery();
                    return true;
                }
            }
        }
        catch
        {
            return false;
        }
    }

    
    
    
    public List<PrivateMessageInfo> GetPrivateMessages(string user1, string user2, int limit = 50)
    {
        var messages = new List<PrivateMessageInfo>();
        try
        {
            int id1 = GetUserIdByName(user1);
            int id2 = GetUserIdByName(user2);
            
            if (id1 == -1 || id2 == -1) return messages;

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        SELECT pm.*, u.Username as SenderName
                        FROM PrivateMessages pm
                        JOIN Users u ON pm.SenderId = u.Id
                        WHERE (pm.SenderId = @id1 AND pm.ReceiverId = @id2)
                           OR (pm.SenderId = @id2 AND pm.ReceiverId = @id1)
                        ORDER BY pm.CreatedAt DESC
                        LIMIT @limit";
                    command.Parameters.AddWithValue("@id1", id1);
                    command.Parameters.AddWithValue("@id2", id2);
                    command.Parameters.AddWithValue("@limit", limit);
                    
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            messages.Add(new PrivateMessageInfo
                            {
                                SenderName = reader.GetString("SenderName"),
                                Message = reader.GetString("Message"),
                                CreatedAt = reader.GetDateTime("CreatedAt")
                            });
                        }
                    }
                }
                
                
                using (var updateCmd = connection.CreateCommand())
                {
                    updateCmd.CommandText = @"
                        UPDATE PrivateMessages SET IsRead = TRUE 
                        WHERE SenderId = @id2 AND ReceiverId = @id1 AND IsRead = FALSE";
                    updateCmd.Parameters.AddWithValue("@id1", id1);
                    updateCmd.Parameters.AddWithValue("@id2", id2);
                    updateCmd.ExecuteNonQuery();
                }
            }
            
            messages.Reverse(); 
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetPrivateMessages Error: {ex.Message}");
        }
        return messages;
    }

    
    
    
    public bool AreFriends(string user1, string user2)
    {
        try
        {
            int id1 = GetUserIdByName(user1);
            int id2 = GetUserIdByName(user2);
            
            if (id1 == -1 || id2 == -1) return false;

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        SELECT COUNT(*) FROM Friends 
                        WHERE ((UserId = @id1 AND FriendId = @id2) OR (UserId = @id2 AND FriendId = @id1))
                          AND Status = 'accepted'";
                    command.Parameters.AddWithValue("@id1", id1);
                    command.Parameters.AddWithValue("@id2", id2);
                    return Convert.ToInt32(command.ExecuteScalar()) > 0;
                }
            }
        }
        catch
        {
            return false;
        }
    }
}

public class FriendInfo
{
    public string Username { get; set; } = "";
    public bool IsOnline { get; set; }
}

public class PrivateMessageInfo
{
    public string SenderName { get; set; } = "";
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
