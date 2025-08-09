using Data.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.AuthService;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterCompany([FromBody] RegisterCompanyRequest model)
        {
            return Ok(await _authService.RegisterCompanyAsync(model));
        }


        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromQuery] string email, [FromQuery] string otp)
        {
            return Ok(await _authService.VerifyOtpAsync(email, otp));
        }

        [HttpPost("set-password")]
        public async Task<IActionResult> SetPassword([FromBody] SetPasswordRequest model)
        {
            return Ok(await _authService.SetPasswordAsync(model));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            return Ok(await _authService.LoginAsync(model));
        }
    }
}
