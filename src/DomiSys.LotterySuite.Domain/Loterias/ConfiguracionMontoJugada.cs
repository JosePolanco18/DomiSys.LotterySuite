using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace DomiSys.LotterySuite.Loterias;

public class ConfiguracionMontoJugada : AuditedEntity<Guid>
{
    public TipoJugada TipoJugada { get; set; }
    public decimal MontoMinimo { get; set; }
    public decimal MontoMaximo { get; set; }

    protected ConfiguracionMontoJugada() { }

    public ConfiguracionMontoJugada(Guid id, TipoJugada tipoJugada, decimal montoMinimo, decimal montoMaximo) : base(id)
    {
        TipoJugada = tipoJugada;
        MontoMinimo = montoMinimo;
        MontoMaximo = montoMaximo;
    }
}
