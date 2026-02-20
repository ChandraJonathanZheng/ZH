namespace FamilyApp.Server.Models;

public class Notification
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? TargetUserId { get; set; } // null = broadcast to all Family
    public bool IsRead { get; set; } = false;
    public NotificationType Type { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum NotificationType
{
    Reminder,
    Financial,
    General
}
