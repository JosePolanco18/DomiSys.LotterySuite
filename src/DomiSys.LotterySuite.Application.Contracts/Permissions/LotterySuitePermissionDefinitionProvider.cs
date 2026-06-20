using DomiSys.LotterySuite.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace DomiSys.LotterySuite.Permissions;

public class LotterySuitePermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var group = context.AddGroup(LotterySuitePermissions.GroupName, L("Sistema de Loterías"));

        // ========== LOTERIAS ==========
        var loteriasPermission = group.AddPermission(
            LotterySuitePermissions.Loterias.Default, L("Loterías"));

        var gestionLoteriasPermission = loteriasPermission.AddChild(
            LotterySuitePermissions.Loterias.GestionLoterias.Default, L("Gestión de Loterías"));
        gestionLoteriasPermission.AddChild(LotterySuitePermissions.Loterias.GestionLoterias.Create, L("Crear Loterías"));
        gestionLoteriasPermission.AddChild(LotterySuitePermissions.Loterias.GestionLoterias.Edit, L("Editar Loterías"));
        gestionLoteriasPermission.AddChild(LotterySuitePermissions.Loterias.GestionLoterias.Delete, L("Eliminar Loterías"));

        var sorteosPermission = loteriasPermission.AddChild(
            LotterySuitePermissions.Loterias.Sorteos.Default, L("Sorteos"));
        sorteosPermission.AddChild(LotterySuitePermissions.Loterias.Sorteos.Create, L("Crear Sorteos"));
        sorteosPermission.AddChild(LotterySuitePermissions.Loterias.Sorteos.Edit, L("Editar Sorteos"));
        sorteosPermission.AddChild(LotterySuitePermissions.Loterias.Sorteos.Delete, L("Eliminar Sorteos"));

        var resultadosPermission = loteriasPermission.AddChild(
            LotterySuitePermissions.Loterias.Resultados.Default, L("Resultados"));
        resultadosPermission.AddChild(LotterySuitePermissions.Loterias.Resultados.Create, L("Registrar Resultados"));
        resultadosPermission.AddChild(LotterySuitePermissions.Loterias.Resultados.Edit, L("Editar Resultados"));

        var configPagosPermission = loteriasPermission.AddChild(
            LotterySuitePermissions.Loterias.ConfiguracionPagos.Default, L("Configuración de Pagos"));
        configPagosPermission.AddChild(LotterySuitePermissions.Loterias.ConfiguracionPagos.Create, L("Crear Configuración de Pagos"));
        configPagosPermission.AddChild(LotterySuitePermissions.Loterias.ConfiguracionPagos.Edit, L("Editar Configuración de Pagos"));

        // ========== TERMINALES ==========
        var terminalesPermission = group.AddPermission(
            LotterySuitePermissions.Terminales.Default, L("Terminales"));
        terminalesPermission.AddChild(LotterySuitePermissions.Terminales.Create, L("Crear Terminales"));
        terminalesPermission.AddChild(LotterySuitePermissions.Terminales.Edit, L("Editar Terminales"));
        terminalesPermission.AddChild(LotterySuitePermissions.Terminales.Delete, L("Eliminar Terminales"));
        terminalesPermission.AddChild(LotterySuitePermissions.Terminales.Suspender, L("Suspender Terminales"));
        terminalesPermission.AddChild(LotterySuitePermissions.Terminales.ViewDetails, L("Ver Detalles de Terminales"));

        // ========== CONTROL DE RIESGO ==========
        var controlRiesgoPermission = group.AddPermission(
            LotterySuitePermissions.ControlRiesgo.Default, L("Control de Riesgo"));

        var limitesPermission = controlRiesgoPermission.AddChild(
            LotterySuitePermissions.ControlRiesgo.LimitesNumero.Default, L("Límites por Número"));
        limitesPermission.AddChild(LotterySuitePermissions.ControlRiesgo.LimitesNumero.Create, L("Crear Límites"));
        limitesPermission.AddChild(LotterySuitePermissions.ControlRiesgo.LimitesNumero.Edit, L("Editar Límites"));
        limitesPermission.AddChild(LotterySuitePermissions.ControlRiesgo.LimitesNumero.Delete, L("Eliminar Límites"));

        controlRiesgoPermission.AddChild(
            LotterySuitePermissions.ControlRiesgo.MonitorLimites.Default, L("Monitor de Límites"));
        controlRiesgoPermission.AddChild(
            LotterySuitePermissions.ControlRiesgo.ReporteExcedentes.Default, L("Reporte de Excedentes"));

        // ========== VENTAS ==========
        var ventasPermission = group.AddPermission(
            LotterySuitePermissions.Ventas.Default, L("Ventas"));

        ventasPermission.AddChild(
            LotterySuitePermissions.Ventas.PuntoDeVenta.Default, L("Punto de Venta"));

        var ticketsPermission = ventasPermission.AddChild(
            LotterySuitePermissions.Ventas.Tickets.Default, L("Tickets"));
        ticketsPermission.AddChild(LotterySuitePermissions.Ventas.Tickets.ViewDetails, L("Ver Detalles de Tickets"));
        ticketsPermission.AddChild(LotterySuitePermissions.Ventas.Tickets.Anular, L("Anular Tickets"));
        ticketsPermission.AddChild(LotterySuitePermissions.Ventas.Tickets.PagarGanador, L("Pagar Tickets Ganadores"));

        // ========== CUADRES ==========
        var cuadresPermission = group.AddPermission(
            LotterySuitePermissions.Cuadres.Default, L("Cuadres"));
        cuadresPermission.AddChild(LotterySuitePermissions.Cuadres.Create, L("Generar Cuadre"));
        cuadresPermission.AddChild(LotterySuitePermissions.Cuadres.ViewDetails, L("Ver Detalles de Cuadre"));
        cuadresPermission.AddChild(
            LotterySuitePermissions.Cuadres.ReporteComisiones.Default, L("Reporte de Comisiones"));

        // ========== CONFIGURACIÓN ==========
        var configuracionPermission = group.AddPermission(
            LotterySuitePermissions.Configuracion.Default, L("Configuración General"));
        configuracionPermission.AddChild(LotterySuitePermissions.Configuracion.Edit, L("Editar Configuración General"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<LotterySuiteResource>(name);
    }
}
