using System;
using DomiSys.LotterySuite.Loterias;
using Volo.Abp.Domain.Entities.Auditing;

namespace DomiSys.LotterySuite.ControlRiesgo;

public class LimiteNumero : AuditedEntity<Guid>
{
    public Guid LoteriaId { get; set; }
    public Guid SorteoId { get; set; }
    public int Numero { get; set; }
    public decimal LimiteVentaMaximo { get; set; }
    public decimal LimiteAguante { get; set; }
    public bool Bloqueado { get; set; }
    public string? Notas { get; set; }

    public virtual Loteria Loteria { get; set; } = null!;
    public virtual Sorteo Sorteo { get; set; } = null!;

    protected LimiteNumero() { }

    public LimiteNumero(
        Guid id,
        Guid loteriaId,
        Guid sorteoId,
        int numero,
        decimal limiteVentaMaximo,
        decimal limiteAguante) : base(id)
    {
        LoteriaId = loteriaId;
        SorteoId = sorteoId;
        Numero = numero;
        LimiteVentaMaximo = limiteVentaMaximo;
        LimiteAguante = limiteAguante;
    }

    public decimal ExcedenteAguante(decimal montoVendido)
    {
        return montoVendido > LimiteAguante ? montoVendido - LimiteAguante : 0;
    }
}
