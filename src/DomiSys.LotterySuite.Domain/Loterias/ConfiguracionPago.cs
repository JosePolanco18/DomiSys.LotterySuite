using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace DomiSys.LotterySuite.Loterias;

public class ConfiguracionPago : AuditedEntity<Guid>
{
    public Guid LoteriaId { get; set; }
    public TipoJugada TipoJugada { get; set; }
    public decimal MultiplicadorPago { get; set; }
    public bool Activo { get; set; } = true;

    public virtual Loteria Loteria { get; set; } = null!;

    protected ConfiguracionPago() { }

    public ConfiguracionPago(Guid id, Guid loteriaId, TipoJugada tipoJugada, decimal multiplicadorPago) : base(id)
    {
        LoteriaId = loteriaId;
        TipoJugada = tipoJugada;
        MultiplicadorPago = multiplicadorPago;
    }
}
