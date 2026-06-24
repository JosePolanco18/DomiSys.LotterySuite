using System;

namespace DomiSys.LotterySuite.Terminales;

public class TerminalLoginDto
{
    public string TenantName { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty;
}

public class TerminalLoginResultDto
{
    public string Token { get; set; } = string.Empty;
    public Guid TerminalId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string NombreVendedor { get; set; } = string.Empty;
}
