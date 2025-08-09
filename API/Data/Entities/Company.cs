using Microsoft.AspNetCore.Identity;

namespace Data.Entities
{
    public class Company : IdentityUser
    {
        public string NameAr { get; set; }
        public string NameEn { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? LogoPath { get; set; }
        public bool IsVerified { get; set; } = false;
        public string? OTP { get; set; }
        public DateTime? OtpExpiry { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

    }
}
