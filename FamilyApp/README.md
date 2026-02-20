# Family App

A full-featured family web application built with **.NET 9 Blazor**, **EF Core**, and **MSSQL**.

## Features

| Feature | Family Role | Guest Role |
|---|---|---|
| Login / Logout | ✅ | ✅ |
| Family Members | ✅ | ❌ |
| Nearby Restaurants | ✅ | ✅ |
| Reminders | ✅ | ❌ |
| Financial Report | ✅ | ❌ |
| Email Notifications | ✅ | ❌ |
| Browser Push Notifications | ✅ | ❌ |
| Real-time In-App Alerts | ✅ | ❌ |

## Tech Stack

- **Frontend:** Blazor Server (.NET 9)
- **Backend:** ASP.NET Core 9
- **Database:** MSSQL + EF Core
- **Auth:** ASP.NET Core Identity (Family / Guest roles)
- **Real-time:** SignalR
- **Email:** MailKit
- **Scheduled Jobs:** Hangfire
- **Push Notifications:** Web Push API + Service Worker

## Setup

### 1. Configure Database
Edit `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=FamilyAppDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### 2. Configure Email (Gmail)
```json
"Email": {
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": "587",
  "Username": "your-email@gmail.com",
  "Password": "your-app-password"
}
```
> Use Gmail App Password, not your main password.

### 3. Generate VAPID Keys for Web Push
```bash
# Install the WebPush CLI or use this .NET snippet
dotnet add package WebPush
```
Then add to `appsettings.json`:
```json
"WebPush": {
  "Subject": "mailto:your-email@gmail.com",
  "PublicKey": "YOUR_VAPID_PUBLIC_KEY",
  "PrivateKey": "YOUR_VAPID_PRIVATE_KEY"
}
```

### 4. Run Migrations
```bash
cd FamilyApp.Server
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 5. Run the App
```bash
dotnet run --project FamilyApp.Server
```

## Default Login
| Email | Password | Role |
|---|---|---|
| admin@family.com | Family@123 | Family |

## Project Structure
```
FamilyApp/
├── FamilyApp.Server/
│   ├── Components/         # Blazor pages & layout
│   │   ├── Pages/
│   │   │   ├── Home.razor
│   │   │   ├── Login.razor
│   │   │   ├── FamilyMembers.razor
│   │   │   ├── Restaurants.razor
│   │   │   ├── Reminders.razor
│   │   │   └── Financial.razor
│   │   └── Layout/
│   │       ├── MainLayout.razor
│   │       └── NotificationBell.razor
│   ├── Controllers/        # API endpoints
│   ├── Data/               # EF Core DbContext
│   ├── Hubs/               # SignalR
│   ├── Jobs/               # Hangfire scheduled jobs
│   ├── Models/             # Domain models
│   ├── Services/           # Email, Push, Notification
│   └── wwwroot/            # Static assets + SW
└── FamilyApp.sln
```

## Notification Flow
```
Reminder Due (Hangfire)
        ↓
   ┌────┴──────┐
   ↓           ↓
 Email      SignalR Hub
(MailKit)   (Real-time)
                ↓
           Web Push API
         (Browser/Mobile)
```
