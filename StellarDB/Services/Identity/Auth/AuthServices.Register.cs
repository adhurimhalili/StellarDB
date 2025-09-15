using System.Net;
using System.Net.Mail;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Auth;

namespace StellarDB.Services.Identity.Auth
{
    internal partial class AuthServices
    {
        public async Task<(bool succeeded, string message)> RegisterAsync(RegisterRequest model)
        {
            var user = new ApplicationUser
            {
                UserName = model.UserName,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                DateOfBirth = model.DateOfBirth,
                Active = true,
                EmailConfirmed = true, // In a real application, you might want to send a confirmation email instead
                PhoneNumber = model.PhoneNumber
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded) return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var confirmationLink = $"{_config["App:ClientUrl"]}/confirm-email?userId={user.Id}&token={WebUtility.UrlEncode(token)}";

            await SendEmailAsync(user.Email, "Confirm your email", $"Please confirm your account by clicking this link: <a href='{confirmationLink}'>Confirm Email</a>");

            return (true, "Registration successful. Please check your email to confirm your account.");
        }

        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var smtpClient = new SmtpClient(_config["Email:SmtpServer"])
            {
                Port = int.Parse(_config["Email:Port"]),
                Credentials = new NetworkCredential(_config["Email:User"], _config["Email:Password"]),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_config["Email:From"]),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(email);

            return smtpClient.SendMailAsync(mailMessage);
        }
    }
}
