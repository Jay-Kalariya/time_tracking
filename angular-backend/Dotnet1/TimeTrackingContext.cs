using Dotnet1.Models;
using Microsoft.EntityFrameworkCore;

namespace Dotnet1
{
    public class TimeTrackingContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Dotnet1.Models.Task> Tasks => Set<Dotnet1.Models.Task>();
        public DbSet<TaskSession> TaskSessions => Set<TaskSession>();
        public DbSet<UserToken> UserTokens => Set<UserToken>();

        public DbSet<TaskAssignment> TaskAssignments { get; set; }


        public TimeTrackingContext(DbContextOptions<TimeTrackingContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // modelBuilder.Entity<Dotnet1.Models.Task>().HasData(
            //     new Dotnet1.Models.Task { Id = 1, Name = "Task A" },
            //     new Dotnet1.Models.Task { Id = 2, Name = "Task B" },
            //     new Dotnet1.Models.Task { Id = 3, Name = "Break" },
            //     new Dotnet1.Models.Task { Id = 4, Name = "Lunch" },
            //     new Dotnet1.Models.Task { Id = 5, Name = "Day Off" }
            // );

            modelBuilder.Entity<Dotnet1.Models.Task>().HasData(
        new Dotnet1.Models.Task { Id = 1, Name = "Task A", IsProtected = false },
        new Dotnet1.Models.Task { Id = 2, Name = "Task B", IsProtected = false },
        new Dotnet1.Models.Task { Id = 3, Name = "Break", IsProtected = true },
        new Dotnet1.Models.Task { Id = 4, Name = "Lunch", IsProtected = true },
        new Dotnet1.Models.Task { Id = 5, Name = "Day Off", IsProtected = true }
    );

            modelBuilder.Entity<TaskSession>()
                .HasOne(ts => ts.Task)
                .WithMany()
                .HasForeignKey(ts => ts.TaskId);
        }
    }
}
