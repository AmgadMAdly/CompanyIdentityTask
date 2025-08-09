using Data.DTOs;
using Data.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Services.Helpers;

namespace Services.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<Company> _userManager;
        private readonly IValidator<RegisterCompanyRequest> _validator;
        private readonly EmailService _emailService;
        private readonly JwtTokenGenerator _jwtGenerator;

        public AuthService(
            UserManager<Company> userManager,
            JwtTokenGenerator jwtGenerator,
            IValidator<RegisterCompanyRequest> validator,
            EmailService emailService)

        {
            _userManager = userManager;
            _jwtGenerator = jwtGenerator;
            _validator = validator;
            _emailService = emailService;
        }

        public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !user.IsVerified)
                throw new BusinessExeption("Invalid email or account not verified.");
            if (user.PasswordHash == null)
                throw new BusinessExeption("Password not set. Please set your password.");
            var passwordValid = await _userManager.CheckPasswordAsync(user, model.Password);
            if (!passwordValid)
                throw new BusinessExeption("Invalid password.");


            var token = _jwtGenerator.GenerateToken(user);

            var response = new LoginResponse
            {
                Token = token,
                CompanyName = user.NameEn,
                LogoPath = user.LogoPath
            };

            return ApiResponse<LoginResponse>.SuccessResponse(response, "Login successful.");

        }

        public async Task<ApiResponse<string>> RegisterCompanyAsync(RegisterCompanyRequest model)
        {
            var validationResult = await _validator.ValidateAsync(model);

            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);

            }

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {

                throw new BusinessExeption(
                  "Email already registered.");
            }

            var otp = GenerateOtp();
            var otpExpiry = DateTime.UtcNow.AddMinutes(10);
            var user = new Company
            {
                UserName = model.Email,
                Email = model.Email,
                NameAr = model.NameAr,
                NameEn = model.NameEn,
                PhoneNumber = model.PhoneNumber,
                WebsiteUrl = model.WebsiteUrl,
                IsVerified = false,
                OTP = otp,
                OtpExpiry = otpExpiry
            };

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToArray();
                throw new BusinessExeption(
                    errors);

            }

            // send OTP via email
            string subject = "Verify your email OTP ";
            string body = GenerateOtpEmailBody(user.NameEn, otp);

            try
            {
                await _emailService.SendOtpEmailAsync(model.Email, subject, body);
            }
            catch
            {
                throw new BusinessExeption("Failed to send OTP email. Please try again.");
            }

            return ApiResponse<string>.SuccessResponse(
                    model.Email,
                    "Registered successfully. Please check your email for the OTP."
            );
        }


        public async Task<ApiResponse<object>> SetPasswordAsync(SetPasswordRequest model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !user.IsVerified)
                throw new BusinessExeption("User not verified.");


            var result = await _userManager.AddPasswordAsync(user, model.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToArray();
                throw new BusinessExeption(errors);
            }
            return ApiResponse<object>.SuccessResponse(null, "Password set successfully. You can now log in.");

        }


        public async Task<ApiResponse<object>> VerifyOtpAsync(string email, string otp)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                throw new BusinessExeption("InvalidEmail.");

            }


            if (user.OTP != otp || user.OtpExpiry < DateTime.UtcNow)
            {

                throw new BusinessExeption("OTP is invalid or expired.");
            }
            user.IsVerified = true;
            user.OTP = null;
            user.OtpExpiry = null;
            await _userManager.UpdateAsync(user);

            return
                ApiResponse<object>.SuccessResponse(null, "OTP verified successfully.");

        }

        #region Helpers
        private string GenerateOtp()
        {
            return new Random().Next(100000, 999999).ToString();
        }
        private string GenerateOtpEmailBody(string name, string otp)
        {
            return $@"
    <html>
    <body style='font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;'>
        <div style='max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);'>
            <h2 style='color: #2c3e50;'>👋 Hello {name},</h2>
            <p style='font-size: 16px; color: #333;'>Thank you for registering with us.</p>
            <p style='font-size: 16px;'>Your OTP code is:</p>
            <h1 style='text-align: center; background: #f1f1f1; padding: 10px 20px; border-radius: 8px; color: #e74c3c;'>{otp}</h1>
            <p style='font-size: 14px; color: #555;'>This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
            <hr />
            <p style='font-size: 13px; color: #999;'>If you didn’t request this code, please ignore this email.</p>
            <p style='font-size: 13px; color: #999;'>Regards,<br/><strong>Company Portal Team</strong></p>
        </div>
    </body>
    </html>";
        }

        #endregion
    }
}
