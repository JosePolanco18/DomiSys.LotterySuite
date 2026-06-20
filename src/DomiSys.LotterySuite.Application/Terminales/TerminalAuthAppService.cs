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

namespace DomiSys.LotterySuite.Terminales;

[AllowAnonymous]
public class TerminalAuthAppService : ApplicationService
{
    private readonly IRepository<Terminal, Guid> _terminalRepository;
    private readonly IConfiguration _configuration;

    public TerminalAuthAppService(
        IRepository<Terminal, Guid> terminalRepository,
        IConfiguration configuration)
    {
        _terminalRepository = terminalRepository;
        _configuration = configuration;
    }

    // ponytail: no [Authorize] — this is the login endpoint
    public async Task<TerminalLoginResultDto> LoginAsync(TerminalLoginDto input)
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

        var token = GenerateJwt(terminal);

        return new TerminalLoginResultDto
        {
            Token = token,
            TerminalId = terminal.Id,
            Codigo = terminal.Codigo,
            Nombre = terminal.Nombre,
            NombreVendedor = terminal.NombreVendedor
        };
    }

    private string GenerateJwt(Terminal terminal)
    {
        // ponytail: simple HMAC JWT, upgrade to RSA if security matters more
        var key = _configuration["TerminalAuth:SecretKey"] ?? "LotterySuiteTerminalSecretKey2026!@#$%";
        var issuer = _configuration["TerminalAuth:Issuer"] ?? "LotterySuite";
        var expHours = int.Parse(_configuration["TerminalAuth:ExpirationHours"] ?? "24");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, terminal.Id.ToString()),
            new("terminal_id", terminal.Id.ToString()),
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
