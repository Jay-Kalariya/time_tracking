using Dotnet1.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
// using DModels;   


namespace Dotnet1
{
    public class TimeTrackingContext : DbContext
    {

      public DbSet<User> Users => Set<User>();
    public DbSet<Dotnet1.Models.Task> Tasks => Set<Dotnet1.Models.Task>();
    public DbSet<Dotnet1.Models.TaskSession> TaskSessions => Set<TaskSession>();
    public DbSet<UserToken> UserTokens => Set<UserToken>();

    public TimeTrackingContext(DbContextOptions<TimeTrackingContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Dotnet1.Models.Task>().HasData(
            new Dotnet1.Models.Task { Id = 1, Name = "Coding" },
            new Dotnet1.Models.Task { Id = 2, Name = "Meeting" },
            new Dotnet1.Models.Task { Id = 3, Name = "Break" },
            new Dotnet1.Models.Task { Id = 4, Name = "Lunch" },
            new Dotnet1.Models.Task { Id = 5, Name = "Day Off" }
        );
    }
}
}