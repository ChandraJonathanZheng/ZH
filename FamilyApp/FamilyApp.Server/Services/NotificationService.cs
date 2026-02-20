using FamilyApp.Server.Data;
using FamilyApp.Server.Hubs;
using FamilyApp.Server.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace FamilyApp.Server.Services;

public interface INotificationService
{
    Task SendToAllFamilyAsync(string title, string message, NotificationType type);
    Task SendToUserAsync(string userId, string title, string message, NotificationType type);
    Task<List<Notification>> GetUserNotificationsAsync(string userId);
    Task MarkAsReadAsync(int notificationId);
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IWebPushService _webPush;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        AppDbContext db,
        IHubContext<NotificationHub> hubContext,
        IWebPushService webPush,
        ILogger<NotificationService> logger)
    {
        _db = db;
        _hubContext = hubContext;
        _webPush = webPush;
        _logger = logger;
    }

    public async Task SendToAllFamilyAsync(string title, string message, NotificationType type)
    {
        // Save to DB
        var notification = new Notification
        {
            Title = title,
            Message = message,
            Type = type,
            TargetUserId = null // null = all family
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        // Send via SignalR to Family group
        await _hubContext.Clients.Group("Family").SendAsync("ReceiveNotification", new
        {
            notification.Id,
            notification.Title,
            notification.Message,
            notification.Type,
            notification.CreatedAt
        });

        // Send Web Push to all family members
        var familyUsers = await _db.Users
            .Where(u => u.Role == "Family" && u.PushEndpoint != null)
            .ToListAsync();

        foreach (var user in familyUsers)
        {
            await _webPush.SendPushAsync(user, title, message);
        }

        _logger.LogInformation("Notification sent to all Family: {Title}", title);
    }

    public async Task SendToUserAsync(string userId, string title, string message, NotificationType type)
    {
        var notification = new Notification
        {
            Title = title,
            Message = message,
            Type = type,
            TargetUserId = userId
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        // Send via SignalR to specific user
        await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", new
        {
            notification.Id,
            notification.Title,
            notification.Message,
            notification.Type,
            notification.CreatedAt
        });

        // Send Web Push to that user
        var user = await _db.Users.FindAsync(userId);
        if (user?.PushEndpoint != null)
        {
            await _webPush.SendPushAsync(user, title, message);
        }
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(string userId)
    {
        return await _db.Notifications
            .Where(n => n.TargetUserId == null || n.TargetUserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task MarkAsReadAsync(int notificationId)
    {
        var notification = await _db.Notifications.FindAsync(notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
            await _db.SaveChangesAsync();
        }
    }
}
