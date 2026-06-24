using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Volo.Abp.Account.Web;
using Volo.Abp.Identity;
using AbpLoginModel = Volo.Abp.Account.Web.Pages.Account.LoginModel;

namespace DomiSys.LotterySuite.Pages.Account
{
    public class LoginModel : AbpLoginModel
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public string CompanyName { get; set; } = string.Empty;
        public string Slogan { get; set; } = string.Empty;
        public string? LogoPath { get; set; }

        public LoginModel(
            IAuthenticationSchemeProvider schemeProvider,
            IOptions<AbpAccountOptions> accountOptions,
            IOptions<IdentityOptions> identityOptions,
            IdentityDynamicClaimsPrincipalContributorCache identityDynamicClaimsPrincipalContributorCache,
            IWebHostEnvironment webHostEnvironment,
            IConfiguration configuration)
            : base(schemeProvider, accountOptions, identityOptions, identityDynamicClaimsPrincipalContributorCache, webHostEnvironment)
        {
            _configuration = configuration;
            _webHostEnvironment = webHostEnvironment;
        }

        public override async Task<IActionResult> OnGetAsync()
        {
            InitializeCompanyBranding();
            return await base.OnGetAsync();
        }

        public override async Task<IActionResult> OnPostAsync(string action)
        {
            InitializeCompanyBranding();
            // Limpiar ModelState para evitar validación de campos extra del cshtml custom
            ModelState.Clear();
            return await base.OnPostAsync(action);
        }

        private void InitializeCompanyBranding()
        {
            CompanyName = _configuration["CompanyBranding:CompanyName"] ?? "DOMISYS SRL";
            Slogan = _configuration["CompanyBranding:Slogan"] ?? "Sistema integral para cooperativas";

            var logoPath = _configuration["CompanyBranding:LogoPath"];
            if (!string.IsNullOrWhiteSpace(logoPath))
            {
                var fullLogoPath = Path.Combine(_webHostEnvironment.WebRootPath, logoPath.TrimStart('/'));
                if (System.IO.File.Exists(fullLogoPath))
                {
                    LogoPath = logoPath;
                }
            }
        }
    }
}