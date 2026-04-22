using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;




public class AdminService
{
    
    private readonly string _adminPassword = "89f281d2f35646ab02094fbcf020a9d0304da1c996f8ebcb";
    
    
    private static ConcurrentDictionary<string, AdminData> _adminUsers = new();
    
    
    private static ConcurrentDictionary<string, BanData> _bannedIPs = new();
    
    
    private static ConcurrentDictionary<string, SuspendedAccountData> _suspendedAccounts = new();
    
    
    private static ConcurrentDictionary<string, MutedUserData> _mutedUsers = new();

    
    
    
    public bool ValidarPasswordAdmin(string password)
    {
        
        return password == _adminPassword;
    }

    
    
    
    public void RegistrarAdmin(string connectionId, string adminName)
    {
        var adminData = new AdminData
        {
            ConnectionId = connectionId,
            AdminName = adminName,
            FechaLogin = DateTime.Now
        };
        
        _adminUsers[connectionId] = adminData;
        Console.WriteLine($"✅ Admin '{adminName}' registrado en sesión {connectionId}");
    }

    
    
    
    public bool EsAdmin(string connectionId)
    {
        return _adminUsers.ContainsKey(connectionId);
    }

    
    
    
    public AdminData? ObtenerDatosAdmin(string connectionId)
    {
        _adminUsers.TryGetValue(connectionId, out var admin);
        return admin;
    }

    
    
    
    public void EliminarAdmin(string connectionId)
    {
        _adminUsers.TryRemove(connectionId, out _);
    }

    
    
    
    public void BanearIP(string ip, string razon, string adminName)
    {
        var banData = new BanData
        {
            IP = ip,
            Razon = razon,
            FechaBan = DateTime.Now,
            AdminBan = adminName
        };
        
        _bannedIPs[ip] = banData;
        Console.WriteLine($"⛔ IP {ip} baneada por {adminName}. Razón: {razon}");
    }

    
    
    
    public bool DeBanearIP(string ip)
    {
        return _bannedIPs.TryRemove(ip, out _);
    }

    
    
    
    public bool EstaIPBaneada(string ip)
    {
        return _bannedIPs.ContainsKey(ip);
    }

    
    
    
    public BanData? ObtenerDatosBan(string ip)
    {
        _bannedIPs.TryGetValue(ip, out var ban);
        return ban;
    }

    
    
    
    public List<BanData> ObtenerIPsBaneadas()
    {
        return _bannedIPs.Values.ToList();
    }

    
    
    
    public void SuspenderCuenta(string nombreUsuario, string razon, string adminName)
    {
        var suspendData = new SuspendedAccountData
        {
            NombreUsuario = nombreUsuario,
            Razon = razon,
            FechaSuspension = DateTime.Now,
            AdminResponsable = adminName,
            Estado = "Suspendida"
        };
        
        _suspendedAccounts[nombreUsuario] = suspendData;
        Console.WriteLine($"🔒 Cuenta '{nombreUsuario}' suspendida por {adminName}. Razón: {razon}");
    }

    
    
    
    public void EliminarCuenta(string nombreUsuario, string razon, string adminName)
    {
        var eliminaData = new SuspendedAccountData
        {
            NombreUsuario = nombreUsuario,
            Razon = razon,
            FechaSuspension = DateTime.Now,
            AdminResponsable = adminName,
            Estado = "Eliminada"
        };
        
        _suspendedAccounts[nombreUsuario] = eliminaData;
        Console.WriteLine($"🗑️ Cuenta '{nombreUsuario}' eliminada por {adminName}. Razón: {razon}");
    }

    
    
    
    public bool EstaCuentaSuspendida(string nombreUsuario)
    {
        if (!_suspendedAccounts.TryGetValue(nombreUsuario, out var account))
            return false;
        
        return account.Estado == "Suspendida" || account.Estado == "Eliminada";
    }

    
    
    
    public SuspendedAccountData? ObtenerDatosSuspension(string nombreUsuario)
    {
        _suspendedAccounts.TryGetValue(nombreUsuario, out var account);
        return account;
    }

    
    
    
    public List<SuspendedAccountData> ObtenerCuentasSuspendidas()
    {
        return _suspendedAccounts.Values.ToList();
    }

    
    
    
    public void MutearUsuario(string connectionId, string duracionMinutos, string razon, string adminName)
    {
        var mutedData = new MutedUserData
        {
            ConnectionId = connectionId,
            FechaMute = DateTime.Now,
            DuracionMinutos = int.Parse(duracionMinutos),
            Razon = razon,
            AdminMute = adminName
        };
        
        _mutedUsers[connectionId] = mutedData;
        Console.WriteLine($"🔇 Usuario {connectionId} muteado por {adminName} por {duracionMinutos} minutos");
    }

    
    
    
    public bool DesmutearUsuario(string connectionId)
    {
        return _mutedUsers.TryRemove(connectionId, out _);
    }

    
    
    
    public bool EstaUsuarioMuteado(string connectionId)
    {
        if (!_mutedUsers.TryGetValue(connectionId, out var muted))
            return false;

        
        var tiempoTranscurrido = DateTime.Now - muted.FechaMute;
        if (tiempoTranscurrido.TotalMinutes >= muted.DuracionMinutos)
        {
            DesmutearUsuario(connectionId);
            return false;
        }

        return true;
    }

    
    
    
    public MutedUserData? ObtenerDatosMute(string connectionId)
    {
        _mutedUsers.TryGetValue(connectionId, out var muted);
        return muted;
    }

    
    
    
    public List<MutedUserData> ObtenerUsuariosMuteados()
    {
        return _mutedUsers.Values.ToList();
    }

    
    
    
    public List<AdminData> ObtenerAdminsActivos()
    {
        return _adminUsers.Values.ToList();
    }
}




public class AdminData
{
    public required string ConnectionId { get; set; }
    public required string AdminName { get; set; }
    public DateTime FechaLogin { get; set; }
}




public class BanData
{
    public required string IP { get; set; }
    public required string Razon { get; set; }
    public DateTime FechaBan { get; set; }
    public required string AdminBan { get; set; }
}




public class SuspendedAccountData
{
    public required string NombreUsuario { get; set; }
    public required string Razon { get; set; }
    public DateTime FechaSuspension { get; set; }
    public required string AdminResponsable { get; set; }
    public required string Estado { get; set; } 
}




public class MutedUserData
{
    public required string ConnectionId { get; set; }
    public DateTime FechaMute { get; set; }
    public int DuracionMinutos { get; set; }
    public required string Razon { get; set; }
    public required string AdminMute { get; set; }
}
