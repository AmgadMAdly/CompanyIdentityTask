using Microsoft.AspNetCore.Http;

namespace Services
{
    public interface IFileService
    {
        Task<string> SaveLogoAsync(IFormFile file, string companyId);
        bool IsValidLogo(IFormFile file);

    }
}
