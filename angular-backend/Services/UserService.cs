using Dotnet1.Models;
using Microsoft.EntityFrameworkCore;

namespace Dotnet1.Services
{
    public class UserService
    {
        private readonly TimeTrackingContext _dbContext;

        public UserService(TimeTrackingContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Get all users
        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _dbContext.Users.ToListAsync();
        }

        // Get user by ID
        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _dbContext.Users.FindAsync(id);
        }

        // Update user info
        public async Task<User?> UpdateUserAsync(int id, User updatedUser)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return null;

            // Optionally: avoid overwriting password here
            user.Username = updatedUser.Username;
            user.Email = updatedUser.Email;
            user.Role = updatedUser.Role;

            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();
            return user;
        }

        // Delete user
        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return false;

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        // Optional: check if user exists by email (for registration/login)
        public async Task<bool> UserExistsAsync(string email)
        {
            return await _dbContext.Users.AnyAsync(u => u.Email == email);
        }

        // Optional: get user's role by ID
        public async Task<string?> GetUserRoleAsync(int id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            return user?.Role;
        }
    }
}
