using FamilyApp.Server.Models;
using WebPush;

namespace FamilyApp.Server.Services;

public interface IWebPushService
{
    Task SendPushAsync(ApplicationUser user, string title, string body);
    Task<(string PublicKey, string PrivateKey)> GetVapidKeysAsync();
}

public class WebPushService : IWebPushService
{
    private readonly IConfiguration _config;
    private readonly ILogger<WebPushService> _logger;
    private readonly WebPushClient _client;

    public WebPushService(IConfiguration config, ILogger<WebPushService> logger)
    {
        _config = config;
        _logger = logger;
        _client = new WebPushClient();
    }

    public async Task SendPushAsync(ApplicationUser user, string title, string body)
    {
        if (user.PushEndpoint == null || user.PushP256DH == null || user.PushAuth == null)
            return;

        try
        {
            var subscription = new PushSubscription(
                user.PushEndpoint,
                user.PushP256DH,
                user.PushAuth
            );

            var vapidDetails = new VapidDetails(
                "mailto:" + _config["WebPush:Subject"],
                _config["WebPush:PublicKey"],
                _config["WebPush:PrivateKey"]
            );

            var payload = System.Text.Json.JsonSerializer.Serialize(new
            {
                title,
                body,
                icon = "/icons/icon-192x192.png",
                badge = "/icons/badge-72x72.png"
            });

            await _client.SendNotificationAsync(subscription, payload, vapidDetails);
            _logger.LogInformation("Web Push sent to user {UserId}", user.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Web Push to user {UserId}", user.Id);
        }
    }

    public Task<(string PublicKey, string PrivateKey)> GetVapidKeysAsync()
    {
        var publicKey = _config["WebPush:PublicKey"] ?? string.Empty;
        var privateKey = _config["WebPush:PrivateKey"] ?? string.Empty;
        return Task.FromResult((publicKey, privateKey));
    }
}
