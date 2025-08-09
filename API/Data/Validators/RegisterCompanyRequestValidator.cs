using Data.DTOs;
using FluentValidation;

namespace Data.Validators
{
    public class RegisterCompanyRequestValidator : AbstractValidator<RegisterCompanyRequest>
    {
        public RegisterCompanyRequestValidator()
        {
            RuleFor(x => x.NameAr)
                .NotEmpty().WithMessage("Arabic name is required.");

            RuleFor(x => x.NameEn)
                .NotEmpty().WithMessage("English name is required.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^(\+?\d{1,3}[- ]?)?\d{7,12}$")
                .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
                .WithMessage("Invalid phone number format. Use country code if needed.");

            RuleFor(x => x.WebsiteUrl)
                .Matches(@"^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$")
                .When(x => !string.IsNullOrWhiteSpace(x.WebsiteUrl))
                .WithMessage("Invalid website URL format.");
        }
    }
}
