using System;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Terminales;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace DomiSys.LotterySuite.GestionEfectivo;

public class GestionEfectivoManager : DomainService
{
    private readonly IRepository<MovimientoEfectivo, Guid> _movimientoRepository;

    public GestionEfectivoManager(IRepository<MovimientoEfectivo, Guid> movimientoRepository)
    {
        _movimientoRepository = movimientoRepository;
    }

    public async Task<MovimientoEfectivo> RegistrarMovimientoAsync(
        Terminal terminal,
        TipoMovimientoEfectivo tipo,
        decimal monto,
        Guid? referenciaId,
        string registradoPor,
        string? notas = null)
    {
        var saldoAnterior = terminal.SaldoEfectivo;
        terminal.ActualizarSaldo(monto);

        var movimiento = new MovimientoEfectivo(
            terminal.Id, tipo, Math.Abs(monto),
            saldoAnterior, terminal.SaldoEfectivo,
            registradoPor, referenciaId, notas);

        await _movimientoRepository.InsertAsync(movimiento);
        return movimiento;
    }
}
