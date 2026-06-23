using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace DomiSys.LotterySuite.Loterias;

public class LoteriaDto : AuditedEntityDto<Guid>
{
    public string Nombre { get; set; } = string.Empty;
    public string CodigoCorto { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool Activa { get; set; }
    public int Orden { get; set; }
    public List<SorteoDto> Sorteos { get; set; } = new();
    public List<ConfiguracionPagoDto> ConfiguracionesPago { get; set; } = new();
}

public class CrearActualizarLoteriaDto
{
    public string Nombre { get; set; } = string.Empty;
    public string CodigoCorto { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool Activa { get; set; } = true;
    public int Orden { get; set; }
}

public class SorteoDto : AuditedEntityDto<Guid>
{
    public Guid LoteriaId { get; set; }
    public string NombreLoteria { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string DiasActivos { get; set; } = string.Empty;
    public TimeSpan HoraAperturaVentas { get; set; }
    public TimeSpan HoraCierreVentas { get; set; }
    public TimeSpan HoraSorteo { get; set; }
    public int MinutosEsperaScraping { get; set; }
    public bool Activo { get; set; }
    public bool EstaAbierto { get; set; }
}

public class CrearActualizarSorteoDto
{
    public Guid LoteriaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string DiasActivos { get; set; } = string.Empty;
    public TimeSpan HoraAperturaVentas { get; set; }
    public TimeSpan HoraCierreVentas { get; set; }
    public TimeSpan HoraSorteo { get; set; }
    public int MinutosEsperaScraping { get; set; } = 15;
    public bool Activo { get; set; } = true;
}

public class ResultadoSorteoDto : AuditedEntityDto<Guid>
{
    public Guid SorteoId { get; set; }
    public string NombreSorteo { get; set; } = string.Empty;
    public string NombreLoteria { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public int Primera { get; set; }
    public int Segunda { get; set; }
    public int Tercera { get; set; }
    public FuenteResultado Fuente { get; set; }
    public bool Verificado { get; set; }
    public DateTime FechaRegistro { get; set; }
    public string? RegistradoPor { get; set; }
}

public class CrearResultadoSorteoDto
{
    public Guid SorteoId { get; set; }
    public DateTime Fecha { get; set; }
    public int Primera { get; set; }
    public int Segunda { get; set; }
    public int Tercera { get; set; }
}

public class ConfiguracionPagoDto : AuditedEntityDto<Guid>
{
    public Guid LoteriaId { get; set; }
    public string NombreLoteria { get; set; } = string.Empty;
    public TipoJugada TipoJugada { get; set; }
    public decimal MultiplicadorPago { get; set; }
    public bool Activo { get; set; }
}

public class CrearActualizarConfiguracionPagoDto
{
    public Guid LoteriaId { get; set; }
    public TipoJugada TipoJugada { get; set; }
    public decimal MultiplicadorPago { get; set; }
    public bool Activo { get; set; } = true;
}

public class ConfiguracionPagoSorteoDto : AuditedEntityDto<Guid>
{
    public Guid SorteoId { get; set; }
    public string NombreSorteo { get; set; } = string.Empty;
    public string NombreLoteria { get; set; } = string.Empty;
    public decimal QuinielaPrimera { get; set; }
    public decimal QuinielaSegunda { get; set; }
    public decimal QuinielaTercera { get; set; }
    public decimal PalePrimeraSegunda { get; set; }
    public decimal PalePrimeraTercera { get; set; }
    public decimal PaleSegundaTercera { get; set; }
    public decimal Tripleta { get; set; }
    public decimal SuperPale { get; set; }
}

public class CrearActualizarConfiguracionPagoSorteoDto
{
    public Guid SorteoId { get; set; }
    public decimal QuinielaPrimera { get; set; } = 60;
    public decimal QuinielaSegunda { get; set; } = 40;
    public decimal QuinielaTercera { get; set; } = 20;
    public decimal PalePrimeraSegunda { get; set; } = 1000;
    public decimal PalePrimeraTercera { get; set; } = 800;
    public decimal PaleSegundaTercera { get; set; } = 500;
    public decimal Tripleta { get; set; } = 100000;
    public decimal SuperPale { get; set; } = 1000;
}

public class ConfiguracionMontoJugadaDto : AuditedEntityDto<Guid>
{
    public TipoJugada TipoJugada { get; set; }
    public decimal MontoMinimo { get; set; }
    public decimal MontoMaximo { get; set; }
}

public class CrearActualizarConfiguracionMontoJugadaDto
{
    public TipoJugada TipoJugada { get; set; }
    public decimal MontoMinimo { get; set; }
    public decimal MontoMaximo { get; set; }
}
