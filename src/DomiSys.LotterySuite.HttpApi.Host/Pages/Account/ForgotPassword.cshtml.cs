using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Account.Web.Pages.Account;

namespace DomiSys.LotterySuite.Pages.Account
{
    [AllowAnonymous]
    public class ForgotPasswordModel : AccountPageModel
    {
        [BindProperty]
        public ForgotPasswordInputModel ForgotPasswordInput { get; set; } = null!;

        public bool EmailSent { get; set; }

        public virtual Task<IActionResult> OnGetAsync()
        {
            ForgotPasswordInput = new ForgotPasswordInputModel();
            EmailSent = false;
            return Task.FromResult<IActionResult>(Page());
        }

        public virtual async Task<IActionResult> OnPostAsync()
        {
            try
            {
                ValidateModel();

                await AccountAppService.SendPasswordResetCodeAsync(
                    new Volo.Abp.Account.SendPasswordResetCodeDto
                    {
                        Email = ForgotPasswordInput.Email,
                        AppName = "MVC",
                        ReturnUrl = string.Empty,
                        ReturnUrlHash = string.Empty
                    }
                );

                EmailSent = true;
                return Page();
            }
            catch (Exception)
            {
                // Log the error but don't expose details to user for security
                Alerts.Danger("Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.");
                return Page();
            }
        }
    }

    public class ForgotPasswordInputModel
    {
        [Required(ErrorMessage = "Este campo es requerido")]
        [EmailAddress(ErrorMessage = "Ingrese un correo electrónico válido")]
        public string Email { get; set; } = string.Empty;
    }
}
