using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;




public class TelegramService
{
    private readonly string _token = "7683031383:AAFDz4c8asRkuE5Ob8aZQF42hj2d5gb5zHQ";
    private readonly string _chatId = "7419508833";
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public TelegramService(IHttpContextAccessor? httpContextAccessor = null)
    {
        _httpClient = new HttpClient();
        _httpContextAccessor = httpContextAccessor;
    }

    
    
    
    private string ObtenerIP()
    {
        try
        {
            var httpContext = _httpContextAccessor?.HttpContext;
            if (httpContext == null)
                return "IP no disponible";

            
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
            return !string.IsNullOrEmpty(remoteIp) ? remoteIp : "IP no disponible";
        }
        catch
        {
            return "IP no disponible";
        }
    }

    
    
    
    private (string navegador, string so) ObtenerInfoNavegador(string userAgent)
    {
        if (string.IsNullOrEmpty(userAgent))
            return ("Desconocido", "Desconocido");

        string navegador = "Desconocido";
        string so = "Desconocido";

        
        if (userAgent.Contains("iPhone") || userAgent.Contains("iPad") || userAgent.Contains("iPod"))
            so = "iOS 📱";
        else if (userAgent.Contains("Android"))
            so = "Android 📱";
        else if (userAgent.Contains("Windows NT"))
        {
            if (userAgent.Contains("Windows NT 10.0"))
                so = "Windows 10/11 💻";
            else if (userAgent.Contains("Windows NT 6.3"))
                so = "Windows 8.1 💻";
            else
                so = "Windows 💻";
        }
        else if (userAgent.Contains("Macintosh") || userAgent.Contains("Mac OS X"))
            so = "macOS 🍎";
        else if (userAgent.Contains("Linux"))
            so = "Linux 🐧";

        
        if (userAgent.Contains("Chrome") && !userAgent.Contains("Chromium"))
            navegador = "Google Chrome";
        else if (userAgent.Contains("Safari") && !userAgent.Contains("Chrome"))
            navegador = "Safari";
        else if (userAgent.Contains("Firefox"))
            navegador = "Mozilla Firefox";
        else if (userAgent.Contains("Edge"))
            navegador = "Microsoft Edge";
        else if (userAgent.Contains("Opera"))
            navegador = "Opera";
        else if (userAgent.Contains("Trident"))
            navegador = "Internet Explorer";
        else if (userAgent.Contains("Chromium"))
            navegador = "Chromium";

        return (navegador, so);
    }

    
    
    
    public async Task EnviarMensaje(string mensaje)
    {
        try
        {
            string url = $"https://api.telegram.org/bot{_token}/sendMessage";
            
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "chat_id", _chatId },
                { "text", mensaje },
                { "parse_mode", "HTML" }
            });

            HttpResponseMessage response = await _httpClient.PostAsync(url, content);
            
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine($"✅ Notificación de Telegram enviada exitosamente");
            }
            else
            {
                Console.WriteLine($"❌ Error al enviar notificación a Telegram: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Excepción al enviar a Telegram: {ex.Message}");
        }
    }

    
    
    
    public async Task NotificarJugadorEntra(string nombreJugador, string penguinType, string userAgent)
    {
        var ip = ObtenerIP();
        var (navegador, so) = ObtenerInfoNavegador(userAgent);

        string mensaje = $"<b>🐧 Jugador entró al juego</b>\n" +
                        $"<b>Nombre:</b> {nombreJugador}\n" +
                        $"<b>Pingüino:</b> {penguinType}\n" +
                        $"<b>🌐 Navegador:</b> {navegador}\n" +
                        $"<b>💻 Sistema:</b> {so}\n" +
                        $"<b>📡 IP:</b> {ip}\n" +
                        $"<b>🕐 Hora:</b> {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
        
        await EnviarMensaje(mensaje);
    }

    
    
    
    public async Task NotificarJugadorSale(string nombreJugador, string userAgent)
    {
        var ip = ObtenerIP();
        var (navegador, so) = ObtenerInfoNavegador(userAgent);

        string mensaje = $"<b>👋 Jugador salió del juego</b>\n" +
                        $"<b>Nombre:</b> {nombreJugador}\n" +
                        $"<b>🌐 Navegador:</b> {navegador}\n" +
                        $"<b>💻 Sistema:</b> {so}\n" +
                        $"<b>📡 IP:</b> {ip}\n" +
                        $"<b>🕐 Hora:</b> {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
        
        await EnviarMensaje(mensaje);
    }
}
