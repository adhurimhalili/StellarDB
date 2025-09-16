using Azure.Core;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Auth;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

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
                EmailConfirmed = false,
                PhoneNumber = model.PhoneNumber
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded) return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var confirmationLink = $"http://localhost:5292/api/Auth?userId={user.Id}&token={WebUtility.UrlEncode(token)}";

            await SendEmailAsync(
                user.Email,
                "Confirm your email",
                emailBody.Replace("{0}", user.FirstName).Replace("{1}", confirmationLink).Replace("{2}", DateTime.UtcNow.Year.ToString())
            );

            return (true, "Registration successful. Please check your email to confirm your account.");
        }

        public async Task SendEmailAsync(string emailTo, string subject, string htmlMessage) // ["Email:User"]
        {
            var smtpConfig = _config.GetSection("SmtpGmail");

            using var client = new SmtpClient(smtpConfig["Host"], int.Parse(smtpConfig["Port"]))
            {
                Credentials = new NetworkCredential(_config["Email:User"], _config["Email:Password"]),
                EnableSsl = bool.Parse(smtpConfig["EnableSsl"])
            };

            var mail = new MailMessage
            {
                From = new MailAddress(_config["Email:User"], "StellarDB App"),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true
            };

            mail.To.Add(emailTo);

            await client.SendMailAsync(mail);
        }

        public async Task ConfirmEmailAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null) throw new Exception($"User with ID: [{userId}] not found.");

            await _userManager.ConfirmEmailAsync(user, token);
        }

        private static string emailBody = @"
                    <html>
                        <body style='font-family:Arial,sans-serif; background-color:#f9f9f9; padding:30px;'>
                            <div style='max-width:600px; margin:auto; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:30px;'>
                                <h2 style='color:#2d7ff9;'>Welcome to StellarDB, {0}!</h2>
                                <p>Thank you for registering. Please confirm your account by clicking the button below:</p>
                                <p style='text-align:center; margin:30px 0;'>
                                    <a href='{1}' style='background:#2d7ff9; color:#fff; text-decoration:none; padding:12px 24px; border-radius:5px; font-size:16px; display:inline-block;'>Confirm Email</a>
                                </p>
                                <p>If you did not create this account, please ignore this email.</p>
                                <hr style='margin:30px 0; border:none; border-top:1px solid #eee;'/>
                                <p style='font-size:12px; color:#888;'>StellarDB App &copy; {2}</p>
                            </div>
                        </body>
                    </html>
                ";
    }
}
