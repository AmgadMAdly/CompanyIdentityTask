using Data.DTOs;
using Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
namespace Services
{
    public class CompanyService : ICompanyService
    {
        private readonly UserManager<Company> _userManager;
        private readonly IFileService _fileService;

        public CompanyService(UserManager<Company> userManager, IFileService fileService)
        {
            _userManager = userManager;
            _fileService = fileService;
        }

        public async Task<CompanyProfileDto?> GetByEmailAsync(string email)
        {
            var company = await _userManager.FindByEmailAsync(email);
            if (company == null) return null;
            return new CompanyProfileDto
            {
                Email = company?.Email,
                LogoPath = company?.LogoPath,
                NameAr = company?.NameAr,
                NameEn = company?.NameEn
            };
        }

        public async Task<ApiResponse<string>> UploadLogoAsync(string email, IFormFile logo)
        {
            if (logo is null || logo.Length == 0)
                throw new BusinessExeption("Logo file is required.");

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                throw new BusinessExeption("User not found.");



            if (!_fileService.IsValidLogo(logo))
                throw new BusinessExeption("Invalid logo file. Allowed formats: .jpg, .jpeg, .png. Max size: 2MB");


            var logoPath = await _fileService.SaveLogoAsync(logo, user.Id);
            user.LogoPath = logoPath;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(" | ", result.Errors.Select(e => e.Description));
                throw new BusinessExeption($"Failed to update logo: {errors}");
            }

            return ApiResponse<string>.SuccessResponse(logoPath, "Logo updated successfully.");
        }

    }
}
