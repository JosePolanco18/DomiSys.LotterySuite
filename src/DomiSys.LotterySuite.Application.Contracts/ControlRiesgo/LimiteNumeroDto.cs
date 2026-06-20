using System;
using DomiSys.LotterySuite.Loterias;
using Volo.Abp.Application.Dtos;

namespace DomiSys.LotterySuite.ControlRiesgo;

public class LimiteNumeroDto : AuditedEntityDto<Guid>
{
    public Guid LoteriaId { get; set; }
    public string NombreLoteria { get; set; } = string.Empty;
    public Guid SorteoId { get; set; }
    public string NombreSorteo { get; set; } = string.Empty;
    public int Numero { get; set; }
    public decimal LimiteVentaMaximo { get; set; }
    public decimal LimiteAguante { get; set; }
    public bool Bloqueado { get; set; }
    public string? Notas { get; set; }
    public decimal MontoVendido { get; set; }
    public decimal Disponible { get; set; }
    public decimal ExcedenteAguante { get; set; }
}

public class CrearActualizarLimiteNumeroDto
{
    public Guid LoteriaId { get; set; }
    public Guid SorteoId { get; set; }
    public int Numero { get; set; }
    public decimal LimiteVentaMaximo { get; set; }
    public decimal LimiteAguante { get; set; }
    public bool Bloqueado { get; set; }
    public string? Notas { get; set; }
}

public class AcumuladoVentaNumeroDto
{
    public Guid SorteoId { get; set; }
    public string NombreSorteo { get; set; } = string.Empty;
    public string NombreLoteria { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public int Numero { get; set; }
    public decimal MontoAcumulado { get; set; }
    public decimal LimiteVentaMaximo { get; set; }
    public decimal LimiteAguante { get; set; }
    public decimal Disponible { get; set; }
    public decimal ExcedenteAguante { get; set; }
}
