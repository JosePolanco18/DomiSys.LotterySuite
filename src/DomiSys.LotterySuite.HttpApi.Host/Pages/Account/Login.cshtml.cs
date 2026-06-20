using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Volo.Abp.Account.Settings;
using Volo.Abp.Account.Web;
using Volo.Abp.Account.Web.Pages.Account;
using Volo.Abp.Identity;
using Volo.Abp.Settings;
using Volo.Abp.Validation;
using IdentityUser = Volo.Abp.Identity.IdentityUser;

namespace DomiSys.LotterySuite.Pages.Account
{
    public class LoginModel : AccountPageModel
    {
        [BindProperty(SupportsGet = true)]
        public string? ReturnUrl { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? ReturnUrlHash { get; set; }

        [BindProperty]
        public LoginInputModel LoginInput { get; set; } = new LoginInputModel();

        public bool EnableLocalLogin { get; set; }

        public IEnumerable<ExternalProviderModel>? ExternalProviders { get; set; }

        public string? ErrorMessage { get; set; }

        public string? WarningMessage { get; set; }

        public string CompanyName { get; set; } = string.Empty;
        public string Slogan { get; set; } = string.Empty;
        public string? LogoPath { get; set; }

        protected IAuthenticationSchemeProvider SchemeProvider { get; }
        protected AbpAccountOptions AccountOptions { get; }
        protected IConfiguration Configuration { get; }
        protected IWebHostEnvironment WebHostEnvironment { get; }

        public LoginModel(
            IAuthenticationSchemeProvider schemeProvider,
            IOptions<AbpAccountOptions> accountOptions,
            IConfiguration configuration,
            IWebHostEnvironment webHostEnvironment
        )
        {
            SchemeProvider = schemeProvider;
            AccountOptions = accountOptions.Value;
            Configuration = configuration;
            WebHostEnvironment = webHostEnvironment;
        }

        public virtual async Task<IActionResult> OnGetAsync()
        {
            LoginInput = new LoginInputModel();
            EnableLocalLogin = await SettingProvider.GetAsync<bool>(AccountSettingNames.EnableLocalLogin);
            await InitializeExternalProvidersAsync();
            InitializeCompanyBranding();

            return Page();
        }

        protected virtual async Task InitializeExternalProvidersAsync()
        {
            var schemes = await SchemeProvider.GetAllSchemesAsync();

            ExternalProviders = schemes
                .Where(x => x.DisplayName != null)
                .Select(x => new ExternalProviderModel
                {
                    AuthenticationScheme = x.Name,
                    DisplayName = x.DisplayName ?? x.Name
                })
                .ToList();
        }

        public virtual async Task<IActionResult> OnPostAsync(string? action = null)
        {
            // Inicializar propiedades para la vista en caso de error
            EnableLocalLogin = true;
            await InitializeExternalProvidersAsync();
            InitializeCompanyBranding();

            // Validación manual de campos requeridos
            if (string.IsNullOrWhiteSpace(LoginInput?.UserNameOrEmailAddress))
            {
                ErrorMessage = "Por favor ingrese su usuario o correo electrónico";
                return Page();
            }

            if (string.IsNullOrWhiteSpace(LoginInput?.Password))
            {
                ErrorMessage = "Por favor ingrese su contraseña";
                return Page();
            }

            try
            {
                await ReplaceEmailToUsernameOfInputIfNeeds();

                var result = await SignInManager.PasswordSignInAsync(
                    LoginInput.UserNameOrEmailAddress,
                    LoginInput.Password,
                    LoginInput.RememberMe,
                    lockoutOnFailure: true
                );

                if (result.IsNotAllowed)
                {
                    ErrorMessage = "Su cuenta no está activa o requiere confirmación de email";
                    return Page();
                }

                if (result.IsLockedOut)
                {
                    WarningMessage = "Su cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos";
                    return Page();
                }

                if (!result.Succeeded)
                {
                    ErrorMessage = "Usuario o contraseña incorrectos";
                    return Page();
                }

                // Login exitoso - redirigir
                if (!string.IsNullOrWhiteSpace(ReturnUrl))
                {
                    return LocalRedirect(ReturnUrl);
                }

                return Redirect("~/");
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error during login");
                ErrorMessage = "Ocurrió un error al procesar su solicitud. Por favor, intente nuevamente.";
                return Page();
            }
        }

        protected virtual async Task ReplaceEmailToUsernameOfInputIfNeeds()
        {
            if (!ValidationHelper.IsValidEmailAddress(LoginInput.UserNameOrEmailAddress))
            {
                return;
            }

            var userByUsername = await UserManager.FindByNameAsync(LoginInput.UserNameOrEmailAddress);
            if (userByUsername != null)
            {
                return;
            }

            var userByEmail = await UserManager.FindByEmailAsync(LoginInput.UserNameOrEmailAddress);
            if (userByEmail == null)
            {
                return;
            }

            LoginInput.UserNameOrEmailAddress = userByEmail.UserName;
        }

        protected virtual void InitializeCompanyBranding()
        {
            // Leer configuración de branding
            CompanyName = Configuration["CompanyBranding:CompanyName"] ?? "DOMISYS SRL";
            Slogan = Configuration["CompanyBranding:Slogan"] ?? "Sistema integral para cooperativas";

            // Validar si el logo existe
            var logoPath = Configuration["CompanyBranding:LogoPath"];
            if (!string.IsNullOrWhiteSpace(logoPath))
            {
                var wwwrootPath = WebHostEnvironment.WebRootPath;
                var fullLogoPath = Path.Combine(wwwrootPath, logoPath.TrimStart('/'));

                if (System.IO.File.Exists(fullLogoPath))
                {
                    LogoPath = logoPath;
                }
            }
        }
    }

    public class LoginInputModel
    {
        [Required]
        public string UserNameOrEmailAddress { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        public bool RememberMe { get; set; }
    }

    public class ExternalProviderModel
    {
        public string AuthenticationScheme { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
    }
}