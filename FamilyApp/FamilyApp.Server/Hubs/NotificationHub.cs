using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FamilyApp.Server.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        var user = Context.User;

        if (user?.IsInRole("Family") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Family");
        }

        _logger.LogInformation("User {UserId} connected to NotificationHub", userId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("User {UserId} disconnected from NotificationHub", Context.UserIdentifier);
        await base.OnDisconnectedAsync(exception);
    }

    // Client can call this to mark notification as read
    public async Task MarkAsRead(int notificationId)
    {
        await Clients.Caller.SendAsync("NotificationRead", notificationId);
    }
}
