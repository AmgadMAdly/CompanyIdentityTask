using Data.DTOs;
using Microsoft.AspNetCore.Http;

namespace Services
{
    public interface ICompanyService
    {
        Task<CompanyProfileDto?> GetByEmailAsync(string email);
        //Task<bool> UploadLogoAsync(string email, IFormFile file);
        Task<ApiResponse<string>> UploadLogoAsync(string email, IFormFile file);
    }
}