namespace FamilyApp.Server.Models;

public class FinancialRecord
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public FinancialType Type { get; set; } // Income or Expense
    public FinancialCategory Category { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum FinancialType
{
    Income,
    Expense
}

public enum FinancialCategory
{
    // Income
    Salary,
    Bonus,
    OtherIncome,

    // Expense
    Tithe,        // Persepuluhan
    Offering,     // Persembahan
    Food,
    Transport,
    Utilities,
    Education,
    Health,
    Entertainment,
    Savings,
    OtherExpense
}
