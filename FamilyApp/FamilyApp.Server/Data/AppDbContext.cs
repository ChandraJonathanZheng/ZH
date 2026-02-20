using FamilyApp.Server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FamilyApp.Server.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Reminder> Reminders => Set<Reminder>();
    public DbSet<FinancialRecord> FinancialRecords => Set<FinancialRecord>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<FinancialRecord>()
            .Property(f => f.Amount)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Restaurant>()
            .Property(r => r.Rating)
            .HasColumnType("decimal(3,1)");

        // Seed default roles data
        builder.Entity<FamilyMember>().HasData(
            new FamilyMember
            {
                Id = 1,
                FullName = "Admin Family",
                Relationship = "Father",
                DateOfBirth = new DateTime(1980, 1, 1),
                Email = "admin@family.com",
                CreatedAt = new DateTime(2024, 1, 1)
            }
        );
    }
}
