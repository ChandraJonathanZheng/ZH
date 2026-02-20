namespace FamilyApp.Server.Models;

public class Reminder
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime ReminderDate { get; set; }
    public bool IsRecurring { get; set; } = false;
    public ReminderRecurrence Recurrence { get; set; } = ReminderRecurrence.None;
    public bool SendEmail { get; set; } = true;
    public bool SendPush { get; set; } = true;
    public bool IsCompleted { get; set; } = false;
    public string CreatedByUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ReminderRecurrence
{
    None,
    Daily,
    Weekly,
    Monthly,
    Yearly
}
