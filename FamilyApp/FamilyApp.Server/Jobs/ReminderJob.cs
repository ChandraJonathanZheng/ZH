using FamilyApp.Server.Data;
using FamilyApp.Server.Models;
using FamilyApp.Server.Services;
using Microsoft.EntityFrameworkCore;

namespace FamilyApp.Server.Jobs;

public class ReminderJob
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly INotificationService _notification;
    private readonly ILogger<ReminderJob> _logger;

    public ReminderJob(
        AppDbContext db,
        IEmailService email,
        INotificationService notification,
        ILogger<ReminderJob> logger)
    {
        _db = db;
        _email = email;
        _notification = notification;
        _logger = logger;
    }

    // Runs every minute via Hangfire
    public async Task ProcessDueRemindersAsync()
    {
        var now = DateTime.UtcNow;
        var windowEnd = now.AddMinutes(1);

        var dueReminders = await _db.Reminders
            .Where(r => !r.IsCompleted && r.ReminderDate >= now && r.ReminderDate < windowEnd)
            .ToListAsync();

        foreach (var reminder in dueReminders)
        {
            _logger.LogInformation("Processing reminder: {Title}", reminder.Title);

            // Send in-app + push notification
            if (reminder.SendPush)
            {
                await _notification.SendToAllFamilyAsync(
                    $"Reminder: {reminder.Title}",
                    reminder.Description ?? reminder.Title,
                    NotificationType.Reminder
                );
            }

            // Send email to reminder creator
            if (reminder.SendEmail)
            {
                var user = await _db.Users.FindAsync(reminder.CreatedByUserId);
                if (user?.Email != null)
                {
                    await _email.SendReminderEmailAsync(
                        user.Email,
                        user.FullName,
                        reminder.Title,
                        reminder.ReminderDate
                    );
                }
            }

            // Handle recurrence or mark complete
            if (reminder.IsRecurring)
            {
                reminder.ReminderDate = reminder.Recurrence switch
                {
                    ReminderRecurrence.Daily => reminder.ReminderDate.AddDays(1),
                    ReminderRecurrence.Weekly => reminder.ReminderDate.AddDays(7),
                    ReminderRecurrence.Monthly => reminder.ReminderDate.AddMonths(1),
                    ReminderRecurrence.Yearly => reminder.ReminderDate.AddYears(1),
                    _ => reminder.ReminderDate
                };
            }
            else
            {
                reminder.IsCompleted = true;
            }
        }

        if (dueReminders.Any())
            await _db.SaveChangesAsync();
    }

    // Runs on 1st of every month via Hangfire
    public async Task SendMonthlyFinancialReportAsync()
    {
        var now = DateTime.UtcNow;
        var lastMonth = now.AddMonths(-1);

        var familyUsers = await _db.Users
            .Where(u => u.Role == "Family" && u.Email != null)
            .ToListAsync();

        foreach (var user in familyUsers)
        {
            await _email.SendFinancialReportAsync(
                user.Email!,
                user.FullName,
                lastMonth.Month,
                lastMonth.Year
            );
        }

        _logger.LogInformation("Monthly financial report sent to {Count} family members", familyUsers.Count);
    }
}
