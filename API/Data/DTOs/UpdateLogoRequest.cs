using Microsoft.AspNetCore.Http;

namespace Data.DTOs
{
    public class UpdateLogoRequest
    {
        public IFormFile Logo { get; set; }
    }
}
