namespace DomiSys.LotterySuite.Permissions;

public static class LotterySuitePermissions
{
    public const string GroupName = "LotterySuite";

    public static class Loterias
    {
        public const string Default = GroupName + ".Loterias";

        public static class GestionLoterias
        {
            public const string Default = Loterias.Default + ".GestionLoterias";
            public const string Create = Default + ".Create";
            public const string Edit = Default + ".Edit";
            public const string Delete = Default + ".Delete";
        }

        public static class Sorteos
        {
            public const string Default = Loterias.Default + ".Sorteos";
            public const string Create = Default + ".Create";
            public const string Edit = Default + ".Edit";
            public const string Delete = Default + ".Delete";
        }

        public static class Resultados
        {
            public const string Default = Loterias.Default + ".Resultados";
            public const string Create = Default + ".Create";
            public const string Edit = Default + ".Edit";
        }

        public static class ConfiguracionPagos
        {
            public const string Default = Loterias.Default + ".ConfiguracionPagos";
            public const string Create = Default + ".Create";
            public const string Edit = Default + ".Edit";
        }
    }

    public static class Terminales
    {
        public const string Default = GroupName + ".Terminales";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
        public const string Suspender = Default + ".Suspender";
        public const string ViewDetails = Default + ".ViewDetails";
    }

    public static class ControlRiesgo
    {
        public const string Default = GroupName + ".ControlRiesgo";

        public static class LimitesNumero
        {
            public const string Default = ControlRiesgo.Default + ".LimitesNumero";
            public const string Create = Default + ".Create";
            public const string Edit = Default + ".Edit";
            public const string Delete = Default + ".Delete";
        }

        public static class MonitorLimites
        {
            public const string Default = ControlRiesgo.Default + ".MonitorLimites";
        }

        public static class ReporteExcedentes
        {
            public const string Default = ControlRiesgo.Default + ".ReporteExcedentes";
        }
    }

    public static class Ventas
    {
        public const string Default = GroupName + ".Ventas";

        public static class PuntoDeVenta
        {
            public const string Default = Ventas.Default + ".PuntoDeVenta";
        }

        public static class Tickets
        {
            public const string Default = Ventas.Default + ".Tickets";
            public const string ViewDetails = Default + ".ViewDetails";
            public const string Anular = Default + ".Anular";
            public const string PagarGanador = Default + ".PagarGanador";
        }
    }

    public static class Cuadres
    {
        public const string Default = GroupName + ".Cuadres";
        public const string Create = Default + ".Create";
        public const string ViewDetails = Default + ".ViewDetails";

        public static class ReporteComisiones
        {
            public const string Default = Cuadres.Default + ".ReporteComisiones";
        }
    }

    public static class Configuracion
    {
        public const string Default = GroupName + ".Configuracion";
        public const string Edit = Default + ".Edit";
    }
}
