using Data.DTOs;
namespace Services.AuthService
{
    public interface IAuthService
    {

        Task<ApiResponse<string>> RegisterCompanyAsync(RegisterCompanyRequest model);
        Task<ApiResponse<object>> VerifyOtpAsync(string email, string otp);
        Task<ApiResponse<object>> SetPasswordAsync(SetPasswordRequest model);
        Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest model);
    }
}
