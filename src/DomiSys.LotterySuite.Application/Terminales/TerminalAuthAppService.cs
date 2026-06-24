using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Loterias;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;

namespace DomiSys.LotterySuite.Terminales;

[AllowAnonymous]
public class TerminalAuthAppService : ApplicationService
{
    private readonly IRepository<Terminal, Guid> _terminalRepository;
    private readonly IConfiguration _configuration;
    private readonly ITenantStore _tenantStore;

    public TerminalAuthAppService(
        IRepository<Terminal, Guid> terminalRepository,
        IConfiguration configuration,
        ITenantStore tenantStore)
    {
        _terminalRepository = terminalRepository;
        _configuration = configuration;
        _tenantStore = tenantStore;
    }

    public async Task<TerminalLoginResultDto> LoginAsync(TerminalLoginDto input)
    {
        if (string.IsNullOrWhiteSpace(input.TenantName))
            throw new UserFriendlyException("Nombre de tenant requerido.");

        var tenantId = await ResolverTenantPorCodigoAsync(input.TenantName);

        using (CurrentTenant.Change(tenantId))
        {
            var queryable = await _terminalRepository.GetQueryableAsync();
            var terminal = await AsyncExecuter.FirstOrDefaultAsync(
                queryable.Where(t => t.Codigo == input.Codigo));

            if (terminal == null)
                throw new UserFriendlyException("Terminal no encontrada.");

            if (terminal.PinVendedor != input.Pin)
                throw new UserFriendlyException("PIN incorrecto.");

            if (!terminal.EstaActiva())
                throw new UserFriendlyException("La terminal está suspendida o bloqueada.");

            terminal.RegistrarActividad();
            await _terminalRepository.UpdateAsync(terminal, autoSave: true);

            var token = GenerateJwt(terminal, tenantId);

            return new TerminalLoginResultDto
            {
                Token = token,
                TerminalId = terminal.Id,
                Codigo = terminal.Codigo,
                Nombre = terminal.Nombre,
                NombreVendedor = terminal.NombreVendedor
            };
        }
    }

    private async Task<Guid> ResolverTenantPorCodigoAsync(string codigoBanca)
    {
        // ponytail: tenant Name IS the código de banca (e.g. "BK1")
        var tenant = await _tenantStore.FindAsync(codigoBanca);
        if (tenant == null)
            throw new UserFriendlyException($"Banca '{codigoBanca}' no encontrada.");
        return tenant.Id;
    }

    private string GenerateJwt(Terminal terminal, Guid tenantId)
    {
        var key = _configuration["TerminalAuth:SecretKey"] ?? "LotterySuiteTerminalSecretKey2026!@#$%";
        var issuer = _configuration["TerminalAuth:Issuer"] ?? "LotterySuite";
        var expHours = int.Parse(_configuration["TerminalAuth:ExpirationHours"] ?? "24");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, terminal.Id.ToString()),
            new("terminal_id", terminal.Id.ToString()),
            new("tenant_id", tenantId.ToString()),
            new("terminal_code", terminal.Codigo),
            new("terminal_name", terminal.Nombre),
            new("vendor_name", terminal.NombreVendedor),
            new(ClaimTypes.Role, "Terminal")
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: issuer,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
