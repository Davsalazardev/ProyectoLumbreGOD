using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);


builder.WebHost.UseUrls("http://0.0.0.0:5000");


builder.Services.AddSignalR(options =>
{
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
}); 

builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();


app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLower() ?? "";
    if (path.EndsWith(".js") || path.EndsWith(".html") || path.EndsWith(".css"))
    {
        context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        context.Response.Headers["Pragma"] = "no-cache";
        context.Response.Headers["Expires"] = "0";
    }
    await next();
});


app.UseCors("AllowAll"); 
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseWebSockets(new WebSocketOptions 
{
    KeepAliveInterval = TimeSpan.FromSeconds(15)
});


app.MapControllers();


app.MapHub<GameHub>("/gameHub");
app.MapGet("/", () => Results.Redirect("/index.html"));

app.Run();