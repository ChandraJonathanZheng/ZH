using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace FamilyApp.Server.Services;

public interface IEmailService
{
    Task SendAsync(string toEmail, string toName, string subject, string htmlBody);
    Task SendReminderEmailAsync(string toEmail, string toName, string reminderTitle, DateTime reminderDate);
    Task SendFinancialReportAsync(string toEmail, string toName, int month, int year);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(
                _config["Email:SenderName"] ?? "Family App",
                _config["Email:SenderEmail"] ?? "noreply@familyapp.com"
            ));
            email.To.Add(new MailboxAddress(toName, toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(
                _config["Email:SmtpHost"],
                int.Parse(_config["Email:SmtpPort"] ?? "587"),
                SecureSocketOptions.StartTls
            );
            await smtp.AuthenticateAsync(
                _config["Email:Username"],
                _config["Email:Password"]
            );
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Email sent to {Email} - Subject: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw;
        }
    }

    public async Task SendReminderEmailAsync(string toEmail, string toName, string reminderTitle, DateTime reminderDate)
    {
        var html = $"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #4CAF50;">Family App - Reminder</h2>
                <p>Hi <strong>{toName}</strong>,</p>
                <p>This is a reminder for:</p>
                <div style="background:#f4f4f4; padding:15px; border-radius:8px; margin:10px 0;">
                    <h3 style="margin:0; color:#333;">{reminderTitle}</h3>
                    <p style="margin:5px 0; color:#666;">Scheduled: {reminderDate:dddd, MMMM dd yyyy HH:mm}</p>
                </div>
                <p>Have a great day!</p>
                <hr/>
                <small style="color:#999;">Family App Notification System</small>
            </body>
            </html>
            """;

        await SendAsync(toEmail, toName, $"Reminder: {reminderTitle}", html);
    }

    public async Task SendFinancialReportAsync(string toEmail, string toName, int month, int year)
    {
        var monthName = new DateTime(year, month, 1).ToString("MMMM yyyy");
        var html = $"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2196F3;">Family App - Monthly Financial Report</h2>
                <p>Hi <strong>{toName}</strong>,</p>
                <p>Your financial report for <strong>{monthName}</strong> is ready.</p>
                <p>Please login to the Family App to view the full report including:</p>
                <ul>
                    <li>Total Income (Salary, Bonus)</li>
                    <li>Total Expenses</li>
                    <li>Tithe & Offering</li>
                    <li>Savings Summary</li>
                </ul>
                <a href="#" style="background:#2196F3; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
                    View Report
                </a>
                <hr/>
                <small style="color:#999;">Family App Notification System</small>
            </body>
            </html>
            """;

        await SendAsync(toEmail, toName, $"Financial Report - {monthName}", html);
    }
}
