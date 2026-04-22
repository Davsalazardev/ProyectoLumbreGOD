using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;




[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;

    public AuthController()
    {
        try
        {
            _userService = new UserService();
            Console.WriteLine("✅ AuthController instantiated successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error initializing AuthController: {ex.Message}");
            Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    
    
    
    
    [HttpPost("register")]
    public IActionResult Register([FromBody] LoginRequest request)
    {
        try
        {
            Console.WriteLine("🔵 Register endpoint called");
            
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                Console.WriteLine("❌ Missing username or password");
                return BadRequest(new { success = false, message = "Usuario y contraseña requeridos" });
            }

            Console.WriteLine($"📝 Attempting to register user: {request.Username}");
            var (success, message) = _userService.RegisterUser(request.Username, request.Password);
            Console.WriteLine($"📋 Registration result: Success={success}, Message={message}");
            
            return Ok(new { success, message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Register error: {ex.Message}");
            Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = $"Error interno del servidor: {ex.Message}" });
        }
    }

    
    
    
    
    
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        try
        {
            Console.WriteLine("🔵 Login endpoint called");
            
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                Console.WriteLine("❌ Missing username or password in login");
                return BadRequest(new { success = false, message = "Usuario y contraseña requeridos" });
            }

            
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Desconocida";
            Console.WriteLine($"📝 Attempting login for user: {request.Username} from IP: {ipAddress}");
            
            var (success, message) = _userService.AuthenticateUser(request.Username, request.Password, ipAddress);

            if (success)
            {
                
                int coins = _userService.GetUserCoins(request.Username);
                Console.WriteLine($"✅ Login successful for: {request.Username} (Coins: {coins})");
                return Ok(new { success, message, username = request.Username, coins });
            }
            else
            {
                Console.WriteLine($"❌ Login failed: {message}");
                return Unauthorized(new { success, message });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Login error: {ex.Message}");
            return StatusCode(500, new { success = false, message = $"Error interno: {ex.Message}" });
        }
    }

    
    
    
    
    [HttpGet("exists/{username}")]
    public IActionResult UserExists(string username)
    {
        var exists = _userService.UserExists(username);
        return Ok(new { exists, username });
    }

    
    
    
    
    [HttpGet("total-users")]
    public IActionResult GetTotalUsers()
    {
        var totalUsers = _userService.GetTotalUsers();
        return Ok(new { totalUsers });
    }
}




public class LoginRequest
{
    public string? Username { get; set; }
    public string? Password { get; set; }
}
