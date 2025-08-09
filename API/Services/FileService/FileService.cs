using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<FileService> _logger;
        private readonly long _maxSizeInBytes = 2 * 1024 * 1024; // 2MB
        private readonly string[] _allowedExtensions = [".jpg", ".jpeg", ".png"];
        public FileService(IWebHostEnvironment env, ILogger<FileService> logger)
        {
            _env = env;
            _logger = logger;
        }
        public bool IsValidLogo(IFormFile file)
        {
            if (file == null || file.Length == 0 || file.Length > _maxSizeInBytes)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLower();
            return _allowedExtensions.Contains(extension);
        }

        public async Task<string> SaveLogoAsync(IFormFile file, string companyId)
        {
            var safeCompanyId = Path.GetFileName(companyId);
            var folderPath = Path.Combine(_env.WebRootPath, "Logos", safeCompanyId);
            try
            {
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }
                var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
                var fileName = $"logo_{Guid.NewGuid().ToString()}_{timestamp}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                return $"/Logos/{companyId}/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while saving logo ");
                throw new ApplicationException("An error occurred while saving the logo.", ex);
            }

        }


    }
}
