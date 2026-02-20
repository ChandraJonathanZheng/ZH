using FamilyApp.Server.Data;
using FamilyApp.Server.Hubs;
using FamilyApp.Server.Jobs;
using FamilyApp.Server.Models;
using FamilyApp.Server.Services;
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ──────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── Identity + Roles ──────────────────────────────────────────────────────
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/login";
    options.LogoutPath = "/logout";
    options.AccessDeniedPath = "/access-denied";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
});

// ─── Blazor ────────────────────────────────────────────────────────────────
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// ─── SignalR ───────────────────────────────────────────────────────────────
builder.Services.AddSignalR();

// ─── Hangfire ──────────────────────────────────────────────────────────────
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection"),
        new SqlServerStorageOptions
        {
            CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
            SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
            QueuePollInterval = TimeSpan.Zero,
            UseRecommendedIsolationLevel = true,
            DisableGlobalLocks = true
        }));
builder.Services.AddHangfireServer();

// ─── App Services ──────────────────────────────────────────────────────────
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IWebPushService, WebPushService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ReminderJob>();
builder.Services.AddHttpClient();

// ─── Controllers (for API endpoints) ──────────────────────────────────────
builder.Services.AddControllers();

var app = builder.Build();

// ─── Middleware ────────────────────────────────────────────────────────────
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAntiforgery();

app.UseAuthentication();
app.UseAuthorization();

// ─── Blazor ────────────────────────────────────────────────────────────────
app.MapRazorComponents<FamilyApp.Server.Components.App>()
    .AddInteractiveServerRenderMode();

// ─── SignalR Hub ───────────────────────────────────────────────────────────
app.MapHub<NotificationHub>("/hubs/notifications");

// ─── API Controllers ───────────────────────────────────────────────────────
app.MapControllers();

// ─── Hangfire Dashboard (Family only) ─────────────────────────────────────
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = [new Hangfire.Dashboard.LocalRequestsOnlyAuthorizationFilter()]
});

// ─── Hangfire Recurring Jobs ───────────────────────────────────────────────
RecurringJob.AddOrUpdate<ReminderJob>(
    "check-reminders",
    job => job.ProcessDueRemindersAsync(),
    Cron.Minutely
);

RecurringJob.AddOrUpdate<ReminderJob>(
    "monthly-financial-report",
    job => job.SendMonthlyFinancialReportAsync(),
    Cron.Monthly(1, 8) // 1st of month at 8am
);

// ─── Seed Roles & Admin ───────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await db.Database.MigrateAsync();

    // Seed roles
    foreach (var role in new[] { "Family", "Guest" })
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }

    // Seed default admin (Family)
    const string adminEmail = "admin@family.com";
    if (await userManager.FindByEmailAsync(adminEmail) == null)
    {
        var admin = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FullName = "Family Admin",
            Role = "Family",
            EmailConfirmed = true
        };
        var result = await userManager.CreateAsync(admin, "Family@123");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "Family");
    }
}

app.Run();
