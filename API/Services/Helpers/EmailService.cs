using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace Services.Helpers
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendOtpEmailAsync(string toEmail, string subject, string body)
        {
            var emailSettings = _config.GetSection("EmailSettings");
            var fromEmail = emailSettings["From"];
            var password = emailSettings["Password"];
            var displayName = emailSettings["DisplayName"];
            var host = emailSettings["Host"];
            var port = int.Parse(emailSettings["Port"]);

            var smtp = new SmtpClient(host)
            {
                Port = port,
                Credentials = new NetworkCredential(fromEmail, password),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(fromEmail, displayName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);
            await smtp.SendMailAsync(mail);
        }
    }
}
