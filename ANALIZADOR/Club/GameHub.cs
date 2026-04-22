using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Http;
using System.Collections.Concurrent;
using System.Threading.Tasks;





public class GameHub : Hub
{
    private readonly TelegramService _telegramService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private static readonly AdminService _adminService = new();
    private static readonly UserService _userService = new();

    public GameHub(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
        _telegramService = new TelegramService(httpContextAccessor);
    }

    
    
    
    public async Task TestSimple(string mensaje)
    {
        Console.WriteLine("🧪 TESTSIMPLE - EJECUTADO!");
        Console.WriteLine($"   Mensaje recibido: {mensaje}");
        await Clients.Caller.SendAsync("TestResponse", "El servidor respondió correctamente!");
    }

    
    
    private static ConcurrentDictionary<string, PlayerData> _players = new();

    
    private static DuelData? _activeDuel = null;
    
    
    private static ConcurrentDictionary<string, bool> _duelReadyPlayers = new();
    
    
    private static List<TreeData>? _worldTrees = null;

    
    
    
    
    public async Task JoinGame(string playerName, string penguinType, string deviceType, string adminPassword)
    {
        
        Console.WriteLine("========================================");
        Console.WriteLine("🎮 JOINGAME - INICIO");
        Console.WriteLine($"   playerName: {playerName ?? "NULL"}");
        Console.WriteLine($"   penguinType: {penguinType ?? "NULL"}");
        Console.WriteLine($"   deviceType: {deviceType ?? "NULL"}");
        Console.WriteLine($"   adminPassword: {(adminPassword != null ? "PROVIDED" : "NULL")}");
        Console.WriteLine("========================================");
        
        try
        {
            var connectionId = Context.ConnectionId;
            Console.WriteLine($"✅ ConnectionId: {connectionId}");
            
            var random = new Random();
            var clientIP = GetClientIP();
            Console.WriteLine($"✅ ClientIP: {clientIP}");
            
            
            bool isAdmin = !string.IsNullOrEmpty(adminPassword) && _adminService.ValidarPasswordAdmin(adminPassword);
            
            if (isAdmin)
            {
                Console.WriteLine("🔐 LOGIN ADMIN EXITOSO");
                _adminService.RegistrarAdmin(connectionId, playerName);
                
                var adminData = new
                {
                    ActivePlayers = _players.Values.Select(p => new { p.Name, IP = p.IP, p.ConnectionId }).ToList(),
                    BannedIPs = _adminService.ObtenerIPsBaneadas().Select(b => new { b.IP, b.Razon, b.AdminBan }).ToList(),
                    SuspendedAccounts = _adminService.ObtenerCuentasSuspendidas().Select(c => new { c.NombreUsuario, c.Razon, c.Estado }).ToList(),
                    MutedUsers = _adminService.ObtenerUsuariosMuteados().Select(m => new {
                        Usuario = _players.Values.FirstOrDefault(p => p.ConnectionId == m.ConnectionId)?.Name ?? "Desconocido",
                        m.ConnectionId,
                        TiempoRestante = DateTime.Now > m.FechaMute.AddMinutes(m.DuracionMinutos) ? "Expirado" : $"{(int)(m.FechaMute.AddMinutes(m.DuracionMinutos) - DateTime.Now).TotalMinutes} min",
                        m.Razon
                    }).ToList()
                };
                
                await Clients.Caller.SendAsync("AdminPanelData", adminData);
                await Clients.Caller.SendAsync("SetConnectionId", connectionId);
                await Clients.Caller.SendAsync("AdminModeEnabled", playerName);
                Console.WriteLine("✅ Admin panel enviado");
                return;
            }
            
            
            Console.WriteLine("👤 Creando jugador normal...");
            
            
            if (_worldTrees == null)
            {
                GenerateWorldTrees();
            }
            
            
            var spawnPoints = new List<(int X, int Y)> { (400, 300), (800, 500), (1200, 900), (1600, 700), (2000, 1200), (600, 1400) };
            var chosen = spawnPoints.FirstOrDefault(sp => !_players.Values.Any(p => Math.Sqrt(Math.Pow(p.X - sp.X, 2) + Math.Pow(p.Y - sp.Y, 2)) < 80));
            if (chosen == default) chosen = (random.Next(200, 2200), random.Next(100, 1700));
            
            var player = new PlayerData
            {
                ConnectionId = connectionId,
                Name = playerName,
                PenguinType = penguinType,
                X = chosen.X,
                Y = chosen.Y,
                Color = GetRandomColor(),
                DeviceType = deviceType,
                IP = clientIP
            };
            
            _players[connectionId] = player;
            Console.WriteLine($"✅ Jugador creado: {playerName} en ({chosen.X}, {chosen.Y})");
            
            
            var userAgent = Context.GetHttpContext()?.Request.Headers["User-Agent"].ToString() ?? "Desconocido";
            _ = Task.Run(() => _telegramService.NotificarJugadorEntra(playerName, penguinType, userAgent));
            
            
            await Clients.Caller.SendAsync("SetConnectionId", connectionId);
            Console.WriteLine("✅ SetConnectionId enviado");
            
            await Clients.Caller.SendAsync("InitializePlayers", _players.Values.ToList());
            Console.WriteLine($"✅ InitializePlayers enviado ({_players.Count} jugadores)");
            
            if (_worldTrees != null)
            {
                await Clients.Caller.SendAsync("InitializeTrees", _worldTrees);
                Console.WriteLine($"✅ InitializeTrees enviado ({_worldTrees.Count} árboles)");
            }
            
            await Clients.All.SendAsync("PlayerJoined", player);
            Console.WriteLine($"✅ PlayerJoined broadcast");
            
            Console.WriteLine($"🎮 JOINGAME COMPLETADO PARA: {playerName}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ ERROR EN JOINGAME: {ex.Message}");
            Console.WriteLine($"❌ STACK: {ex.StackTrace}");
            await Clients.Caller.SendAsync("GameError", $"Error: {ex.Message}");
        }
    }
    
    
    
    
    private void GenerateWorldTrees()
    {
        _worldTrees = new List<TreeData>();
        var random = new Random(12345); 
        const int numTrees = 50;
        const int duelArenaX = 1200;
        const int duelArenaY = 900;
        const int duelDetectionSize = 200;

        for (int i = 0; i < numTrees; i++)
        {
            bool isLarge = random.Next(2) == 0;
            int size = isLarge ? 80 : 50;

            var tree = new TreeData
            {
                X = random.Next(0, 2400),
                Y = random.Next(0, 1800),
                Size = size,
                IsLarge = isLarge
            };

            
            double distToDuel = Math.Sqrt(
                Math.Pow(tree.X - duelArenaX, 2) +
                Math.Pow(tree.Y - duelArenaY, 2)
            );

            if (distToDuel > duelDetectionSize + 100)
            {
                _worldTrees.Add(tree);
            }
        }

        Console.WriteLine($"✅ {_worldTrees.Count} árboles generados para el mundo");
    }

    
    
    
    
    
    public async Task Move(int x, int y)
    {
        var connectionId = Context.ConnectionId;

        
        if (_players.TryGetValue(connectionId, out var player))
        {
            
            if (_activeDuel != null && _activeDuel.IsActive)
            {
                bool isInDuel = (_activeDuel.Player1Id == connectionId || _activeDuel.Player2Id == connectionId);
                
                if (!isInDuel)
                {
                    
                    const int duelArenaX = 1200;
                    const int duelArenaY = 900;
                    const int duelArenaSize = 500;
                    
                    double distance = Math.Sqrt(Math.Pow(x - duelArenaX, 2) + Math.Pow(y - duelArenaY, 2));
                    
                    if (distance < duelArenaSize)
                    {
                        
                        return;
                    }
                }
            }
            
            player.X = x;
            player.Y = y;

            
            await Clients.All.SendAsync("PlayerMoved", connectionId, x, y);
        }
    }

    
    
    
    public async Task ChangeWorld(string worldName)
    {
        var connectionId = Context.ConnectionId;
        
        if (_players.TryGetValue(connectionId, out var player))
        {
            player.World = worldName;
            
            
            await Clients.All.SendAsync("PlayerChangedWorld", connectionId, worldName);
        }
    }

    
    
    
    public async Task ChangePenguinType(string penguinType)
    {
        var connectionId = Context.ConnectionId;
        
        if (_players.TryGetValue(connectionId, out var player))
        {
            player.PenguinType = penguinType;
            
            
            await Clients.All.SendAsync("PlayerChangedPenguin", connectionId, penguinType);
        }
    }

    
    
    
    private static readonly FriendService _friendService = new();
    private static ConcurrentDictionary<string, string> _houseInvites = new(); 

    
    
    
    private static CTFGameData _activeCTF = new();
    private static readonly object _ctfLock = new();

    
    
    
    public async Task SendFriendRequest(string toUsername)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        
        int toUserId = _friendService.GetUserIdByName(toUsername);
        if (toUserId == -1)
        {
            await Clients.Caller.SendAsync("FriendError", $"El usuario '{toUsername}' no existe");
            return;
        }
        
        
        if (player.Name.ToLower() == toUsername.ToLower())
        {
            await Clients.Caller.SendAsync("FriendError", "No puedes agregarte a ti mismo");
            return;
        }
        
        bool success = _friendService.SendFriendRequest(player.Name, toUsername);
        
        if (success)
        {
            
            await Clients.Caller.SendAsync("FriendRequestSent", toUsername);
            
            
            var targetPlayer = _players.Values.FirstOrDefault(p => p.Name.ToLower() == toUsername.ToLower());
            if (targetPlayer != null)
            {
                await Clients.Client(targetPlayer.ConnectionId).SendAsync("FriendRequestReceived", player.Name);
            }
        }
        else
        {
            await Clients.Caller.SendAsync("FriendError", "Ya existe una solicitud o ya son amigos");
        }
    }

    
    
    
    public async Task AcceptFriendRequest(string fromUsername)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        bool success = _friendService.AcceptFriendRequest(player.Name, fromUsername);
        
        if (success)
        {
            
            await Clients.Caller.SendAsync("FriendRequestAccepted", fromUsername);
            
            var fromPlayer = _players.Values.FirstOrDefault(p => p.Name == fromUsername);
            if (fromPlayer != null)
            {
                await Clients.Client(fromPlayer.ConnectionId).SendAsync("FriendAcceptedYou", player.Name);
            }
        }
    }

    
    
    
    public async Task RejectFriendRequest(string fromUsername)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        _friendService.RejectFriendRequest(player.Name, fromUsername);
        await Clients.Caller.SendAsync("FriendRequestRejected", fromUsername);
    }

    
    
    
    public async Task RemoveFriend(string friendUsername)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        bool success = _friendService.RemoveFriend(player.Name, friendUsername);
        if (success)
        {
            await Clients.Caller.SendAsync("FriendRemoved", friendUsername);
        }
    }

    
    
    
    public async Task GetFriendsList()
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        var friends = _friendService.GetFriends(player.Name);
        
        
        foreach (var friend in friends)
        {
            friend.IsOnline = _players.Values.Any(p => p.Name == friend.Username);
        }
        
        var pendingRequests = _friendService.GetPendingRequests(player.Name);
        
        await Clients.Caller.SendAsync("FriendsListData", friends, pendingRequests);
    }

    
    
    
    public async Task SendPrivateMessage(string toUsername, string message)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        
        if (!_friendService.AreFriends(player.Name, toUsername))
        {
            await Clients.Caller.SendAsync("PrivateMessageError", "Solo puedes enviar mensajes a amigos");
            return;
        }
        
        _friendService.SavePrivateMessage(player.Name, toUsername, message);
        
        
        await Clients.Caller.SendAsync("PrivateMessageSent", toUsername, message);
        
        
        var targetPlayer = _players.Values.FirstOrDefault(p => p.Name == toUsername);
        if (targetPlayer != null)
        {
            await Clients.Client(targetPlayer.ConnectionId).SendAsync("PrivateMessageReceived", player.Name, message);
        }
    }

    
    
    
    public async Task GetPrivateMessages(string friendUsername)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        var messages = _friendService.GetPrivateMessages(player.Name, friendUsername);
        await Clients.Caller.SendAsync("PrivateMessagesData", friendUsername, messages);
    }

    
    
    
    public async Task InviteToHouse(string friendUsername)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        
        if (!_friendService.AreFriends(player.Name, friendUsername))
        {
            await Clients.Caller.SendAsync("HouseInviteError", "Solo puedes invitar a amigos");
            return;
        }
        
        var targetPlayer = _players.Values.FirstOrDefault(p => p.Name == friendUsername);
        if (targetPlayer == null)
        {
            await Clients.Caller.SendAsync("HouseInviteError", "El jugador no esta conectado");
            return;
        }
        
        
        _houseInvites[targetPlayer.ConnectionId] = player.Name;
        
        
        await Clients.Client(targetPlayer.ConnectionId).SendAsync("HouseInviteReceived", player.Name);
        await Clients.Caller.SendAsync("HouseInviteSent", friendUsername);
    }

    
    
    
    public async Task AcceptHouseInvite(string hostUsername)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        
        if (!_houseInvites.TryGetValue(connectionId, out var inviter) || inviter != hostUsername)
        {
            await Clients.Caller.SendAsync("HouseInviteError", "La invitacion ya no es valida");
            return;
        }
        
        _houseInvites.TryRemove(connectionId, out _);
        
        
        string newWorld = $"casa_{hostUsername}";
        player.World = newWorld;
        
        
        player.X = 400;  
        player.Y = 300;  
        
        
        await Clients.Caller.SendAsync("EnteredFriendHouse", hostUsername, player.X, player.Y);
        
        
        await Clients.All.SendAsync("PlayerChangedWorld", connectionId, newWorld);
        await Clients.All.SendAsync("PlayerMoved", connectionId, player.X, player.Y);
        
        var hostPlayer = _players.Values.FirstOrDefault(p => p.Name == hostUsername);
        if (hostPlayer != null)
        {
            await Clients.Client(hostPlayer.ConnectionId).SendAsync("FriendEnteredYourHouse", player.Name);
        }
    }

    
    
    
    public async Task RejectHouseInvite(string hostUsername)
    {
        var connectionId = Context.ConnectionId;
        _houseInvites.TryRemove(connectionId, out _);
        
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        var hostPlayer = _players.Values.FirstOrDefault(p => p.Name == hostUsername);
        if (hostPlayer != null)
        {
            await Clients.Client(hostPlayer.ConnectionId).SendAsync("HouseInviteRejected", player.Name);
        }
    }

    
    
    
    public async Task LeaveFriendHouse()
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        
        string previousWorld = player.World;
        player.World = "principal";
        
        await Clients.Caller.SendAsync("LeftFriendHouse");
        
        
        if (previousWorld.StartsWith("casa_"))
        {
            string hostName = previousWorld.Replace("casa_", "");
            var hostPlayer = _players.Values.FirstOrDefault(p => p.Name == hostName);
            if (hostPlayer != null)
            {
                await Clients.Client(hostPlayer.ConnectionId).SendAsync("FriendLeftYourHouse", player.Name);
            }
        }
    }

    
    
    

    
    
    
    public async Task JoinCTFWorld()
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;

        List<string> redNames = new();
        List<string> blueNames = new();
        List<string> readyNames = new();
        
        lock (_ctfLock)
        {
            
            if (_activeCTF.IsActive)
            {
                return;
            }
            
            player.World = "ctf";
            
            player.X = 900;  
            player.Y = 450;
            
            
            foreach (var pid in _activeCTF.RedTeam)
            {
                if (_players.TryGetValue(pid, out var p))
                    redNames.Add(p.Name);
            }
            foreach (var pid in _activeCTF.BlueTeam)
            {
                if (_players.TryGetValue(pid, out var p))
                    blueNames.Add(p.Name);
            }
            foreach (var pid in _activeCTF.ReadyPlayers)
            {
                if (_players.TryGetValue(pid, out var p))
                    readyNames.Add(p.Name);
            }
        }

        
        await Clients.Caller.SendAsync("EnteredCTFLobby", redNames, blueNames, readyNames);
        await Clients.All.SendAsync("PlayerChangedWorld", connectionId, "ctf");
    }

    
    
    
    public async Task CTFSelectTeam(string team)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        if (player.World != "ctf") return;
        
        List<string> redNames = new();
        List<string> blueNames = new();
        List<string> readyNames = new();
        bool success = false;
        
        lock (_ctfLock)
        {
            if (_activeCTF.IsActive) return;
            
            
            _activeCTF.RedTeam.Remove(connectionId);
            _activeCTF.BlueTeam.Remove(connectionId);
            _activeCTF.ReadyPlayers.Remove(connectionId);
            
            if (team == "red" && _activeCTF.RedTeam.Count < 3)
            {
                _activeCTF.RedTeam.Add(connectionId);
                success = true;
            }
            else if (team == "blue" && _activeCTF.BlueTeam.Count < 3)
            {
                _activeCTF.BlueTeam.Add(connectionId);
                success = true;
            }
            
            
            foreach (var pid in _activeCTF.RedTeam)
            {
                if (_players.TryGetValue(pid, out var p))
                    redNames.Add(p.Name);
            }
            foreach (var pid in _activeCTF.BlueTeam)
            {
                if (_players.TryGetValue(pid, out var p))
                    blueNames.Add(p.Name);
            }
            foreach (var pid in _activeCTF.ReadyPlayers)
            {
                if (_players.TryGetValue(pid, out var p))
                    readyNames.Add(p.Name);
            }
        }
        
        if (success)
        {
            
            var allInLobby = _players.Values.Where(p => p.World == "ctf").ToList();
            foreach (var p in allInLobby)
            {
                var pid = _players.FirstOrDefault(x => x.Value == p).Key;
                await Clients.Client(pid).SendAsync("CTFTeamsUpdated", redNames, blueNames, readyNames);
            }
        }
    }

    
    
    
    public async Task CTFToggleReady(bool isReady)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        if (player.World != "ctf") return;
        
        List<string> redNames = new();
        List<string> blueNames = new();
        List<string> readyNames = new();
        bool allReady = false;
        
        lock (_ctfLock)
        {
            if (_activeCTF.IsActive) return;
            
            
            bool inTeam = _activeCTF.RedTeam.Contains(connectionId) || _activeCTF.BlueTeam.Contains(connectionId);
            if (!inTeam) return;
            
            if (isReady)
                _activeCTF.ReadyPlayers.Add(connectionId);
            else
                _activeCTF.ReadyPlayers.Remove(connectionId);
            
            
            foreach (var pid in _activeCTF.RedTeam)
            {
                if (_players.TryGetValue(pid, out var p))
                    redNames.Add(p.Name);
            }
            foreach (var pid in _activeCTF.BlueTeam)
            {
                if (_players.TryGetValue(pid, out var p))
                    blueNames.Add(p.Name);
            }
            foreach (var pid in _activeCTF.ReadyPlayers)
            {
                if (_players.TryGetValue(pid, out var p))
                    readyNames.Add(p.Name);
            }
            
            
            int totalPlayers = _activeCTF.RedTeam.Count + _activeCTF.BlueTeam.Count;
            allReady = _activeCTF.RedTeam.Count == 3 && 
                       _activeCTF.BlueTeam.Count == 3 && 
                       _activeCTF.ReadyPlayers.Count == totalPlayers &&
                       totalPlayers == 6;
        }
        
        
        var allInLobby = _players.Values.Where(p => p.World == "ctf").ToList();
        foreach (var p in allInLobby)
        {
            var pid = _players.FirstOrDefault(x => x.Value == p).Key;
            await Clients.Client(pid).SendAsync("CTFTeamsUpdated", redNames, blueNames, readyNames);
        }
        
        
        if (allReady)
        {
            await StartCTFGame();
        }
    }

    
    
    
    private async Task StartCTFGame()
    {
        lock (_ctfLock)
        {
            _activeCTF.IsActive = true;
            _activeCTF.InLobby = false;
            
            
            var redSpawns = new[] { (150, 400), (150, 500), (150, 600) };
            var blueSpawns = new[] { (1650, 400), (1650, 500), (1650, 600) };
            
            for (int i = 0; i < _activeCTF.RedTeam.Count; i++)
            {
                var pid = _activeCTF.RedTeam[i];
                if (_players.TryGetValue(pid, out var p))
                {
                    p.X = redSpawns[i].Item1;
                    p.Y = redSpawns[i].Item2;
                    _activeCTF.PlayerHealth[pid] = 2;
                }
            }
            
            for (int i = 0; i < _activeCTF.BlueTeam.Count; i++)
            {
                var pid = _activeCTF.BlueTeam[i];
                if (_players.TryGetValue(pid, out var p))
                {
                    p.X = blueSpawns[i].Item1;
                    p.Y = blueSpawns[i].Item2;
                    _activeCTF.PlayerHealth[pid] = 2;
                }
            }
        }
        
        
        var allPlayers = _activeCTF.RedTeam.Concat(_activeCTF.BlueTeam);
        foreach (var pid in allPlayers)
        {
            string team = _activeCTF.RedTeam.Contains(pid) ? "red" : "blue";
            await Clients.Client(pid).SendAsync("CTFGameStarted", team);
        }
    }

    
    
    
    public async Task CTFShoot(float x, float y, float vx, float vy)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        if (!_activeCTF.IsActive) return;
        
        string team = _activeCTF.RedTeam.Contains(connectionId) ? "red" : "blue";
        
        
        var allPlayers = _activeCTF.RedTeam.Concat(_activeCTF.BlueTeam);
        foreach (var pid in allPlayers)
        {
            await Clients.Client(pid).SendAsync("CTFBulletFired", connectionId, x, y, vx, vy, team);
        }
    }

    
    
    
    public async Task CTFPlayerHit(string targetId)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var shooter)) return;
        if (!_players.TryGetValue(targetId, out var target)) return;
        if (!_activeCTF.IsActive) return;
        
        string shooterTeam = _activeCTF.RedTeam.Contains(connectionId) ? "red" : "blue";
        string targetTeam = _activeCTF.RedTeam.Contains(targetId) ? "red" : "blue";
        
        if (shooterTeam == targetTeam) return;  
        
        lock (_ctfLock)
        {
            if (!_activeCTF.PlayerHealth.ContainsKey(targetId))
                _activeCTF.PlayerHealth[targetId] = 2;
            
            _activeCTF.PlayerHealth[targetId]--;
            
            
            if (_activeCTF.PlayerHealth[targetId] <= 0)
            {
                
                if (targetTeam == "red")
                    _activeCTF.RedDeaths++;
                else
                    _activeCTF.BlueDeaths++;
                
                
                bool droppedFlag = false;
                if (_activeCTF.RedFlagCarrier == targetId)
                {
                    _activeCTF.RedFlagCarrier = null;
                    droppedFlag = true;
                }
                else if (_activeCTF.BlueFlagCarrier == targetId)
                {
                    _activeCTF.BlueFlagCarrier = null;
                    droppedFlag = true;
                }
                
                
                var spawns = targetTeam == "red" ? 
                    new[] { (150, 400), (150, 500), (150, 600) } : 
                    new[] { (1650, 400), (1650, 500), (1650, 600) };
                var spawnIndex = new Random().Next(spawns.Length);
                target.X = spawns[spawnIndex].Item1;
                target.Y = spawns[spawnIndex].Item2;
                _activeCTF.PlayerHealth[targetId] = 2;  
                
                
                var allPlayers = _activeCTF.RedTeam.Concat(_activeCTF.BlueTeam).ToList();
                foreach (var pid in allPlayers)
                {
                    _ = Clients.Client(pid).SendAsync("CTFPlayerKilled", shooter.Name, target.Name, _activeCTF.RedDeaths, _activeCTF.BlueDeaths);
                    if (droppedFlag)
                    {
                        _ = Clients.Client(pid).SendAsync("CTFFlagReturned", targetTeam == "red" ? "blue" : "red");
                    }
                }
                _ = Clients.Client(targetId).SendAsync("CTFYouDied", target.X, target.Y);
                _ = Clients.All.SendAsync("PlayerMoved", targetId, target.X, target.Y);
                
                
                if (_activeCTF.RedDeaths >= _activeCTF.MaxDeaths || _activeCTF.BlueDeaths >= _activeCTF.MaxDeaths)
                {
                    string winner = _activeCTF.RedDeaths >= _activeCTF.MaxDeaths ? "blue" : "red";
                    foreach (var pid in allPlayers)
                    {
                        _ = Clients.Client(pid).SendAsync("CTFGameOver", winner, "deaths");
                    }
                    
                    _activeCTF = new CTFGameData();
                }
            }
            else
            {
                
                _ = Clients.Client(targetId).SendAsync("CTFYouWereHit", _activeCTF.PlayerHealth[targetId]);
            }
        }
    }

    
    
    
    public async Task CTFTakeFlag()
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        if (!_activeCTF.IsActive) return;

        string myTeam = _activeCTF.RedTeam.Contains(connectionId) ? "red" : "blue";
        string enemyTeam = myTeam == "red" ? "blue" : "red";

        lock (_ctfLock)
        {
            
            if (enemyTeam == "red" && _activeCTF.RedFlagCarrier != null) return;
            if (enemyTeam == "blue" && _activeCTF.BlueFlagCarrier != null) return;

            
            if (enemyTeam == "red")
                _activeCTF.RedFlagCarrier = connectionId;
            else
                _activeCTF.BlueFlagCarrier = connectionId;
        }

        var allPlayers = _activeCTF.RedTeam.Concat(_activeCTF.BlueTeam);
        foreach (var pid in allPlayers)
        {
            await Clients.Client(pid).SendAsync("CTFFlagTaken", enemyTeam, connectionId, player.Name);
        }
    }

    
    
    
    public async Task CTFCaptureFlag()
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;
        if (!_activeCTF.IsActive) return;

        string myTeam = _activeCTF.RedTeam.Contains(connectionId) ? "red" : "blue";
        string enemyTeam = myTeam == "red" ? "blue" : "red";

        
        bool hasFlag = (enemyTeam == "red" && _activeCTF.RedFlagCarrier == connectionId) ||
                       (enemyTeam == "blue" && _activeCTF.BlueFlagCarrier == connectionId);

        if (!hasFlag) return;

        lock (_ctfLock)
        {
            
            if (enemyTeam == "red")
            {
                _activeCTF.RedFlagCarrier = null;
                _activeCTF.BlueScore++;
            }
            else
            {
                _activeCTF.BlueFlagCarrier = null;
                _activeCTF.RedScore++;
            }
        }

        var allPlayers = _activeCTF.RedTeam.Concat(_activeCTF.BlueTeam);
        foreach (var pid in allPlayers)
        {
            await Clients.Client(pid).SendAsync("CTFFlagCaptured", enemyTeam, connectionId, player.Name);
            await Clients.Client(pid).SendAsync("CTFScoreUpdate", _activeCTF.RedScore, _activeCTF.BlueScore);
        }

        
        if (_activeCTF.RedScore >= _activeCTF.MaxScore || _activeCTF.BlueScore >= _activeCTF.MaxScore)
        {
            string winner = _activeCTF.RedScore >= _activeCTF.MaxScore ? "red" : "blue";
            foreach (var pid in allPlayers)
            {
                await Clients.Client(pid).SendAsync("CTFGameOver", winner, "captures");
            }

            
            lock (_ctfLock)
            {
                _activeCTF = new CTFGameData();
            }
        }
    }

    
    
    
    public async Task CTFTagPlayer(string targetId)
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var tagger)) return;
        if (!_players.TryGetValue(targetId, out var target)) return;
        if (!_activeCTF.IsActive) return;

        string myTeam = _activeCTF.RedTeam.Contains(connectionId) ? "red" : "blue";
        string targetTeam = _activeCTF.RedTeam.Contains(targetId) ? "red" : "blue";

        if (myTeam == targetTeam) return;  

        
        bool droppedFlag = false;
        lock (_ctfLock)
        {
            if (_activeCTF.RedFlagCarrier == targetId)
            {
                _activeCTF.RedFlagCarrier = null;
                droppedFlag = true;
            }
            else if (_activeCTF.BlueFlagCarrier == targetId)
            {
                _activeCTF.BlueFlagCarrier = null;
                droppedFlag = true;
            }
        }

        
        if (targetTeam == "red")
        {
            target.X = 200;
            target.Y = 500;
        }
        else
        {
            target.X = 1600;
            target.Y = 500;
        }

        var allPlayers = _activeCTF.RedTeam.Concat(_activeCTF.BlueTeam);
        foreach (var pid in allPlayers)
        {
            await Clients.Client(pid).SendAsync("CTFPlayerTagged", tagger.Name, target.Name);
            if (droppedFlag)
            {
                await Clients.Client(pid).SendAsync("CTFFlagReturned", targetTeam == "red" ? "blue" : "red");
            }
        }
        await Clients.Client(targetId).SendAsync("CTFYouWereTagged");
        await Clients.All.SendAsync("PlayerMoved", targetId, target.X, target.Y);
    }

    
    
    
    public async Task LeaveCTFWorld()
    {
        var connectionId = Context.ConnectionId;
        if (!_players.TryGetValue(connectionId, out var player)) return;

        List<string> redNames = new();
        List<string> blueNames = new();
        List<string> readyNames = new();
        
        lock (_ctfLock)
        {
            _activeCTF.RedTeam.Remove(connectionId);
            _activeCTF.BlueTeam.Remove(connectionId);
            _activeCTF.ReadyPlayers.Remove(connectionId);

            
            if (_activeCTF.RedFlagCarrier == connectionId)
                _activeCTF.RedFlagCarrier = null;
            if (_activeCTF.BlueFlagCarrier == connectionId)
                _activeCTF.BlueFlagCarrier = null;
            
            
            foreach (var pid in _activeCTF.RedTeam)
            {
                if (_players.TryGetValue(pid, out var p))
                    redNames.Add(p.Name);
            }
            foreach (var pid in _activeCTF.BlueTeam)
            {
                if (_players.TryGetValue(pid, out var p))
                    blueNames.Add(p.Name);
            }
            foreach (var pid in _activeCTF.ReadyPlayers)
            {
                if (_players.TryGetValue(pid, out var p))
                    readyNames.Add(p.Name);
            }
        }

        player.World = "principal";
        player.X = 2000;
        player.Y = 1300;

        await Clients.Caller.SendAsync("LeftCTFWorld");
        await Clients.All.SendAsync("PlayerChangedWorld", connectionId, "principal");
        
        
        var allInLobby = _players.Values.Where(p => p.World == "ctf").ToList();
        foreach (var p in allInLobby)
        {
            var pid = _players.FirstOrDefault(x => x.Value == p).Key;
            await Clients.Client(pid).SendAsync("CTFTeamsUpdated", redNames, blueNames, readyNames);
        }
    }

    
    
    
    
    public async Task SendMessage(string message)
    {
        var connectionId = Context.ConnectionId;

        
        if (_players.TryGetValue(connectionId, out var player))
        {
            player.FloatingMessage = message;
            
            await Clients.All.SendAsync("MessageReceived", player.Name, message, connectionId);
        }
    }

    
    
    
    public async Task StartGunGame()
    {
        var connectionId = Context.ConnectionId;
        
        
        var availablePlayers = _players.Where(p => p.Value.ConnectionId != connectionId).ToList();
        
        if (availablePlayers.Count < 1)
        {
            await Clients.Caller.SendAsync("GameError", "Necesitas al menos 2 jugadores para jugar");
            return;
        }

        var opponent = availablePlayers[new Random().Next(availablePlayers.Count)];
        var gameData = new GunGameData
        {
            IsActive = true,
            Player1Id = connectionId,
            Player2Id = opponent.Key
        };

        await Clients.Group("gunGame").SendAsync("StartGunGame", gameData);
    }

    
    
    
    public async Task InviteToGunGame(string invitedPlayerName)
    {
        var inviterId = Context.ConnectionId;
        var inviter = _players.TryGetValue(inviterId, out var inviterData) ? inviterData.Name : "Desconocido";
        
        
        var invitedPlayer = _players.FirstOrDefault(p => p.Value.Name == invitedPlayerName);
        
        if (invitedPlayer.Key == null)
        {
            await Clients.Caller.SendAsync("GameError", "Jugador no encontrado");
            return;
        }

        if (invitedPlayer.Key == inviterId)
        {
            await Clients.Caller.SendAsync("GameError", "No puedes invitarte a ti mismo");
            return;
        }

        
        await Clients.Client(invitedPlayer.Key).SendAsync("ReceiveGameInvitation", inviter, inviterId);
    }

    
    
    
    public async Task AcceptGameInvitation(string inviterId)
    {
        var acceptorId = Context.ConnectionId;
        
        
        if (!_players.TryGetValue(inviterId, out var inviterData) || !_players.TryGetValue(acceptorId, out var acceptorData))
        {
            await Clients.Caller.SendAsync("GameError", "El jugador no está disponible");
            return;
        }

        var duelData = new DuelData
        {
            IsActive = false, 
            Player1Id = inviterId,
            Player1Name = inviterData.Name,
            Player2Id = acceptorId,
            Player2Name = acceptorData.Name,
            Player1Health = 100,
            Player2Health = 100
        };

        
        _activeDuel = duelData;
        
        
        _duelReadyPlayers.Clear();

        
        await Clients.Client(inviterId).SendAsync("DuelWaitingForReady", duelData);
        await Clients.Client(acceptorId).SendAsync("DuelWaitingForReady", duelData);
    }

    
    
    
    public async Task RejectGameInvitation(string inviterId)
    {
        await Clients.Client(inviterId).SendAsync("GameInvitationRejected", _players.TryGetValue(Context.ConnectionId, out var p) ? p.Name : "Desconocido");
    }

    
    
    
    public async Task StartDuelGame()
    {
        var connectionId = Context.ConnectionId;
        
        Console.WriteLine($"🎮 StartDuelGame - Iniciando duelo de práctica para {connectionId}");

        
        var botId = "BOT_" + Guid.NewGuid().ToString().Substring(0, 8);
        var botPlayer = new PlayerData
        {
            ConnectionId = botId,
            Name = "🎯 Saco de Práctica",
            PenguinType = "basico",
            X = 1400,  
            Y = 800,
            Color = "#FF0000",
            DeviceType = "bot",
            IP = "127.0.0.1"
        };
        
        
        _players[botId] = botPlayer;
        Console.WriteLine($"🤖 Bot creado: {botId}");

        var duelData = new DuelData
        {
            IsActive = true, 
            Player1Id = connectionId,
            Player1Name = _players[connectionId].Name,
            Player2Id = botId,
            Player2Name = "🎯 Saco de Práctica",
            Player1Health = 100,
            Player2Health = 100
        };

        
        _activeDuel = duelData;
        
        
        _duelReadyPlayers.Clear();
        
        Console.WriteLine($"⚔️ Duelo de práctica iniciado: {_players[connectionId].Name} vs Bot");

        
        await Clients.Caller.SendAsync("DuelCountdownStart", duelData);
        
        
        await Clients.All.SendAsync("DuelStarted", duelData);
        
        
        await Clients.All.SendAsync("PlayerJoined", botPlayer);
    }
    
    
    
    
    public async Task ReadyForDuel()
    {
        var connectionId = Context.ConnectionId;
        
        if (_activeDuel == null)
        {
            return;
        }
        
        
        if (_activeDuel.Player1Id != connectionId && _activeDuel.Player2Id != connectionId)
        {
            return;
        }
        
        
        _duelReadyPlayers[connectionId] = true;
        
        
        await Clients.Client(_activeDuel.Player1Id!).SendAsync("DuelPlayerReady", connectionId);
        await Clients.Client(_activeDuel.Player2Id!).SendAsync("DuelPlayerReady", connectionId);
        
        
        bool player1Ready = _duelReadyPlayers.ContainsKey(_activeDuel.Player1Id!) && _duelReadyPlayers[_activeDuel.Player1Id!];
        bool player2Ready = _duelReadyPlayers.ContainsKey(_activeDuel.Player2Id!) && _duelReadyPlayers[_activeDuel.Player2Id!];
        
        if (player1Ready && player2Ready)
        {
            
            _activeDuel.IsActive = true;
            
            
            await Clients.Client(_activeDuel.Player1Id!).SendAsync("DuelCountdownStart", _activeDuel);
            await Clients.Client(_activeDuel.Player2Id!).SendAsync("DuelCountdownStart", _activeDuel);
            
            
            await Clients.All.SendAsync("DuelStarted", _activeDuel);
        }
    }

    
    
    
    
    public async Task FireInDuel(string targetId, double targetX, double targetY)
    {
        var shooterId = Context.ConnectionId;
        
        Console.WriteLine($"🔫 FireInDuel - Shooter: {shooterId}, Target: {targetId}, Pos: ({targetX}, {targetY})");

        
        if (_activeDuel == null || !_activeDuel.IsActive)
        {
            Console.WriteLine("❌ FireInDuel - No hay duelo activo");
            return;
        }

        
        if (!_players.ContainsKey(shooterId))
        {
            Console.WriteLine($"❌ FireInDuel - Shooter no encontrado: {shooterId}");
            return;
        }
        
        
        if (!_players.ContainsKey(targetId))
        {
            Console.WriteLine($"❌ FireInDuel - Target no encontrado: {targetId}");
            return;
        }
        
        if (_activeDuel.Player1Id != shooterId && _activeDuel.Player2Id != shooterId)
        {
            Console.WriteLine($"❌ FireInDuel - Shooter no es parte del duelo");
            return;
        }

        var shooter = _players[shooterId];

        
        var bulletData = new BulletData
        {
            ShooterId = shooterId,
            TargetId = targetId,
            StartX = shooter.X,
            StartY = shooter.Y,
            TargetX = (int)targetX,
            TargetY = (int)targetY
        };
        
        Console.WriteLine($"✅ Bala creada - De ({shooter.X}, {shooter.Y}) a ({(int)targetX}, {(int)targetY})");

        
        if (targetId.StartsWith("BOT_"))
        {
            await Clients.Caller.SendAsync("BulletFired", bulletData);
            Console.WriteLine($"✅ BulletFired enviado solo al jugador (oponente es bot)");
        }
        else
        {
            
            await Clients.Clients(new[] { _activeDuel.Player1Id!, _activeDuel.Player2Id! })
                .SendAsync("BulletFired", bulletData);
            Console.WriteLine($"✅ BulletFired enviado a ambos jugadores");
        }
    }
    
    
    
    
    public async Task BulletHit(string targetId, int damage)
    {
        var shooterId = Context.ConnectionId;
        
        Console.WriteLine($"💥 BulletHit - Shooter: {shooterId}, Target: {targetId}, Damage: {damage}");
        
        if (_activeDuel == null || !_activeDuel.IsActive)
        {
            Console.WriteLine("❌ BulletHit - No hay duelo activo");
            return;
        }
        
        
        bool targetIsBot = targetId.StartsWith("BOT_");
        
        
        if (!targetIsBot)
        {
            if ((_activeDuel.Player1Id != shooterId || _activeDuel.Player2Id != targetId) &&
                (_activeDuel.Player2Id != shooterId || _activeDuel.Player1Id != targetId))
            {
                Console.WriteLine("❌ BulletHit - Duelo inválido");
                return;
            }
        }

        
        if (_activeDuel.Player1Id == targetId)
        {
            _activeDuel.Player1Health -= damage;
            Console.WriteLine($"💔 Player1 ({targetId}) recibe {damage} daño. Vida restante: {_activeDuel.Player1Health}");
            
            
            await Clients.Caller.SendAsync("PlayerHit", targetId, damage, _activeDuel.Player1Health);
            if (!_activeDuel.Player2Id!.StartsWith("BOT_"))
            {
                await Clients.Client(_activeDuel.Player2Id!).SendAsync("PlayerHit", targetId, damage, _activeDuel.Player1Health);
            }
            
            
            if (_activeDuel.Player1Health <= 0)
            {
                Console.WriteLine($"☠️ Player1 murió. Player2 gana!");
                await Clients.All.SendAsync("DuelEnded", _activeDuel.Player2Id);
                
                
                if (_activeDuel.Player2Id!.StartsWith("BOT_"))
                {
                    _players.TryRemove(_activeDuel.Player2Id!, out _);
                }
                
                _activeDuel = null;
                _duelReadyPlayers.Clear();
            }
        }
        else if (_activeDuel.Player2Id == targetId)
        {
            _activeDuel.Player2Health -= damage;
            Console.WriteLine($"💔 Player2/Bot ({targetId}) recibe {damage} daño. Vida restante: {_activeDuel.Player2Health}");
            
            
            await Clients.Caller.SendAsync("PlayerHit", targetId, damage, _activeDuel.Player2Health);
            
            
            if (_activeDuel.Player2Health <= 0)
            {
                Console.WriteLine($"☠️ Player2/Bot murió. Player1 gana!");
                await Clients.All.SendAsync("DuelEnded", _activeDuel.Player1Id);
                
                
                if (targetIsBot)
                {
                    _players.TryRemove(targetId, out _);
                    await Clients.All.SendAsync("PlayerLeft", targetId);
                }
                
                _activeDuel = null;
                _duelReadyPlayers.Clear();
            }
        }
    }

    
    
    
    public async Task EndDuel()
    {
        var connectionId = Context.ConnectionId;

        
        _activeDuel = null;
        _duelReadyPlayers.Clear();

        
        await Clients.All.SendAsync("DuelEnded", connectionId);
    }

    
    
    
    public async Task UpdateCoins(string username, int amount)
    {
        Console.WriteLine($"💰 UpdateCoins - Usuario: {username}, Cantidad: {amount}");
        
        if (string.IsNullOrEmpty(username) || amount <= 0)
        {
            Console.WriteLine("❌ UpdateCoins - Parámetros inválidos");
            return;
        }
        
        var (success, newCoins) = _userService.UpdateUserCoins(username, amount);
        
        if (success)
        {
            Console.WriteLine($"✅ Monedas actualizadas: {username} ahora tiene {newCoins}");
            
            await Clients.Caller.SendAsync("CoinsUpdated", newCoins);
        }
        else
        {
            Console.WriteLine($"❌ Error al actualizar monedas para {username}");
        }
    }

    
    
    
    
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;

        
        if (_activeDuel != null && 
            (_activeDuel.Player1Id == connectionId || _activeDuel.Player2Id == connectionId))
        {
            Console.WriteLine($"🔌 Jugador {connectionId} se desconectó durante duelo - terminando duelo");
            
            
            var winnerId = _activeDuel.Player1Id == connectionId ? _activeDuel.Player2Id : _activeDuel.Player1Id;
            
            
            if (_activeDuel.Player2Id?.StartsWith("BOT_") == true)
            {
                _players.TryRemove(_activeDuel.Player2Id, out _);
            }
            
            
            await Clients.All.SendAsync("DuelEnded", winnerId);
            
            _activeDuel = null;
            _duelReadyPlayers.Clear();
        }

        
        if (_players.TryRemove(connectionId, out var removedPlayer))
        {
            
            var userAgent = Context.GetHttpContext()?.Request.Headers["User-Agent"].ToString() ?? "Desconocido";

            
            _ = _telegramService.NotificarJugadorSale(removedPlayer.Name, userAgent);

            
            await Clients.All.SendAsync("PlayerLeft", connectionId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    
    
    
    public async Task BanearIP(string ipTarget, string razon)
    {
        var connectionId = Context.ConnectionId;
        if (!_adminService.EsAdmin(connectionId))
        {
            await Clients.Caller.SendAsync("AdminError", "No tienes permisos de administrador");
            return;
        }

        var admin = _adminService.ObtenerDatosAdmin(connectionId);
        _adminService.BanearIP(ipTarget, razon, admin?.AdminName ?? "Admin Desconocido");
        
        
        await Clients.All.SendAsync("AdminNotification", $"IP {ipTarget} baneada por {admin?.AdminName}. Razón: {razon}");
    }

    
    
    
    public async Task DeBanearIP(string ipTarget)
    {
        var connectionId = Context.ConnectionId;
        if (!_adminService.EsAdmin(connectionId))
        {
            await Clients.Caller.SendAsync("AdminError", "No tienes permisos de administrador");
            return;
        }

        var result = _adminService.DeBanearIP(ipTarget);
        var admin = _adminService.ObtenerDatosAdmin(connectionId);
        
        if (result)
            await Clients.All.SendAsync("AdminNotification", $"IP {ipTarget} desbaneada por {admin?.AdminName}");
        else
            await Clients.Caller.SendAsync("AdminError", "IP no encontrada en la lista de baneos");
    }

    
    
    
    public async Task SuspenderCuenta(string nombreUsuario, string razon)
    {
        var connectionId = Context.ConnectionId;
        if (!_adminService.EsAdmin(connectionId))
        {
            await Clients.Caller.SendAsync("AdminError", "No tienes permisos de administrador");
            return;
        }

        var admin = _adminService.ObtenerDatosAdmin(connectionId);
        _adminService.SuspenderCuenta(nombreUsuario, razon, admin?.AdminName ?? "Admin Desconocido");
        
        await Clients.All.SendAsync("AdminNotification", $"Cuenta '{nombreUsuario}' suspendida por {admin?.AdminName}. Razón: {razon}");
    }

    
    
    
    public async Task EliminarCuenta(string nombreUsuario, string razon)
    {
        var connectionId = Context.ConnectionId;
        if (!_adminService.EsAdmin(connectionId))
        {
            await Clients.Caller.SendAsync("AdminError", "No tienes permisos de administrador");
            return;
        }

        var admin = _adminService.ObtenerDatosAdmin(connectionId);
        _adminService.EliminarCuenta(nombreUsuario, razon, admin?.AdminName ?? "Admin Desconocido");
        
        await Clients.All.SendAsync("AdminNotification", $"Cuenta '{nombreUsuario}' eliminada por {admin?.AdminName}. Razón: {razon}");
    }

    
    
    
    public async Task MutearUsuario(string connectionIdTarget, string duracionMinutos, string razon)
    {
        var connectionId = Context.ConnectionId;
        if (!_adminService.EsAdmin(connectionId))
        {
            await Clients.Caller.SendAsync("AdminError", "No tienes permisos de administrador");
            return;
        }

        var admin = _adminService.ObtenerDatosAdmin(connectionId);
        _adminService.MutearUsuario(connectionIdTarget, duracionMinutos, razon, admin?.AdminName ?? "Admin Desconocido");
        
        
        await Clients.Client(connectionIdTarget).SendAsync("UserMuted", razon, duracionMinutos);
        await Clients.All.SendAsync("AdminNotification", $"Usuario muteado por {admin?.AdminName} por {duracionMinutos} minutos");
    }

    
    
    
    public async Task DesmutearUsuario(string connectionIdTarget)
    {
        var connectionId = Context.ConnectionId;
        if (!_adminService.EsAdmin(connectionId))
        {
            await Clients.Caller.SendAsync("AdminError", "No tienes permisos de administrador");
            return;
        }

        var result = _adminService.DesmutearUsuario(connectionIdTarget);
        var admin = _adminService.ObtenerDatosAdmin(connectionId);
        
        if (result)
        {
            await Clients.Client(connectionIdTarget).SendAsync("UserUnmuted");
            await Clients.All.SendAsync("AdminNotification", $"Usuario desmuteado por {admin?.AdminName}");
        }
        else
            await Clients.Caller.SendAsync("AdminError", "Usuario no encontrado en la lista de muteados");
    }

    
    
    
    public async Task ObtenerDatosAdminActualizados()
    {
        var connectionId = Context.ConnectionId;
        if (!_adminService.EsAdmin(connectionId))
        {
            await Clients.Caller.SendAsync("AdminError", "No tienes permisos de administrador");
            return;
        }

        var jugadoresActivos = _players.Values.Select(p => new
        {
            p.Name,
            IP = GetClientIP(),
            p.ConnectionId
        }).ToList();

        var baneos = _adminService.ObtenerIPsBaneadas().Select(b => new
        {
            b.IP,
            b.Razon,
            b.AdminBan
        }).ToList();

        var cuentasSuspendidas = _adminService.ObtenerCuentasSuspendidas().Select(c => new
        {
            c.NombreUsuario,
            c.Razon,
            c.Estado
        }).ToList();

        var usuariosMuteados = _adminService.ObtenerUsuariosMuteados().Select(m => new
        {
            Usuario = _players.Values.FirstOrDefault(p => p.ConnectionId == m.ConnectionId)?.Name ?? "Desconocido",
            m.ConnectionId,
            TiempoRestante = DateTime.Now > m.FechaMute.AddMinutes(m.DuracionMinutos) ? "Expirado" : 
                $"{(int)(m.FechaMute.AddMinutes(m.DuracionMinutos) - DateTime.Now).TotalMinutes} min",
            m.Razon
        }).ToList();

        var adminData = new
        {
            ActivePlayers = jugadoresActivos,
            BannedIPs = baneos,
            SuspendedAccounts = cuentasSuspendidas,
            MutedUsers = usuariosMuteados
        };
        
        await Clients.Caller.SendAsync("AdminPanelData", adminData);
    }

    
    
    
    private string GetRandomColor()
    {
        var random = new Random();
        var colors = new[] { "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", 
                           "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52B788" };
        return colors[random.Next(colors.Length)];
    }

    
    
    
    private string GetClientIP()
    {
        var httpContext = Context.GetHttpContext();
        if (httpContext == null)
            return "IP desconocida";

        
        if (httpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedIp))
        {
            var ip = forwardedIp.ToString().Split(',')[0].Trim();
            if (!string.IsNullOrEmpty(ip))
                return ip;
        }

        
        if (httpContext.Request.Headers.TryGetValue("X-Real-IP", out var realIp))
        {
            if (!string.IsNullOrEmpty(realIp.ToString()))
                return realIp.ToString();
        }

        
        var remoteIp = httpContext.Connection.RemoteIpAddress?.ToString();
        return !string.IsNullOrEmpty(remoteIp) ? remoteIp : "IP desconocida";
    }
}




public class PlayerData
{
    public required string ConnectionId { get; set; }  
    public required string Name { get; set; }          
    public required string PenguinType { get; set; }   
    public int X { get; set; }                         
    public int Y { get; set; }                         
    public required string Color { get; set; }         
    public string DeviceType { get; set; } = "desktop";  
    public string? FloatingMessage { get; set; }       
    public string? IP { get; set; }                    
    public string World { get; set; } = "principal";   
}




public class DuelData
{
    public bool IsActive { get; set; } = false;
    public string? Player1Id { get; set; }
    public string? Player1Name { get; set; }
    public string? Player2Id { get; set; }
    public string? Player2Name { get; set; }
    public int Player1Health { get; set; } = 100;
    public int Player2Health { get; set; } = 100;
}




public class GunGameData
{
    public bool IsActive { get; set; } = false;
    public string? Player1Id { get; set; }
    public string? Player2Id { get; set; }
    public int Player1Score { get; set; } = 0;
    public int Player2Score { get; set; } = 0;
}




public class BulletData
{
    public required string ShooterId { get; set; }
    public required string TargetId { get; set; }
    public int StartX { get; set; }
    public int StartY { get; set; }
    public int TargetX { get; set; }
    public int TargetY { get; set; }
}




public class TreeData
{
    public int X { get; set; }
    public int Y { get; set; }
    public int Size { get; set; }
    public bool IsLarge { get; set; }
}




public class CTFGameData
{
    public bool IsActive { get; set; } = false;
    public bool InLobby { get; set; } = true;
    public List<string> RedTeam { get; set; } = new();
    public List<string> BlueTeam { get; set; } = new();
    public HashSet<string> ReadyPlayers { get; set; } = new();
    public int RedScore { get; set; } = 0;
    public int BlueScore { get; set; } = 0;
    public string? RedFlagCarrier { get; set; }  
    public string? BlueFlagCarrier { get; set; }  
    public int MaxScore { get; set; } = 3;
    public int RedDeaths { get; set; } = 0;  
    public int BlueDeaths { get; set; } = 0;  
    public int MaxDeaths { get; set; } = 200;  
    public Dictionary<string, int> PlayerHealth { get; set; } = new();  
}