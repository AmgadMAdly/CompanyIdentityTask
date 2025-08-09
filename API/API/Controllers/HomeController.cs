using Data.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;
using System.Security.Claims;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly ICompanyService _companyService;

        public HomeController(ICompanyService companyService)
        {
            _companyService = companyService;
        }
        [HttpGet]
        public async Task<IActionResult> Home()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(email))
                return Unauthorized(ApiResponse<string>.FailResponse("Unauthorized!"));

            var companyDto = await _companyService.GetByEmailAsync(email);

            if (companyDto == null)
                return NotFound(ApiResponse<string>.FailResponse("Company not found."));



            return Ok(ApiResponse<object>.SuccessResponse(companyDto, "Company home data retrieved."));

        }

        [HttpPost("update-logo")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        public async Task<IActionResult> UpdateLogo([FromForm] UpdateLogoRequest request)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(email))
                return Unauthorized(ApiResponse<string>.FailResponse("Unauthorized"));

            if (request?.Logo is null || request.Logo.Length == 0)
                return BadRequest(ApiResponse<string>.FailResponse("Logo file is required."));


            var response = await _companyService.UploadLogoAsync(email, request.Logo);

            return Ok(response);

        }

    }
}
