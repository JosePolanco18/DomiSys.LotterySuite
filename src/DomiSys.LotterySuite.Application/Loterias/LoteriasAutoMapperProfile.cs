using AutoMapper;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Cuadres;
using DomiSys.LotterySuite.Terminales;
using DomiSys.LotterySuite.Ventas;

namespace DomiSys.LotterySuite.Loterias;

public class LoteriasAutoMapperProfile : Profile
{
    public LoteriasAutoMapperProfile()
    {
        CreateMap<Loteria, LoteriaDto>();
        CreateMap<CrearActualizarLoteriaDto, Loteria>();

        CreateMap<Sorteo, SorteoDto>()
            .ForMember(d => d.NombreLoteria, opt => opt.MapFrom(s => s.Loteria != null ? s.Loteria.Nombre : string.Empty))
            .ForMember(d => d.EstaAbierto, opt => opt.Ignore());
        CreateMap<CrearActualizarSorteoDto, Sorteo>();

        CreateMap<ResultadoSorteo, ResultadoSorteoDto>()
            .ForMember(d => d.NombreSorteo, opt => opt.MapFrom(s => s.Sorteo != null ? s.Sorteo.Nombre : string.Empty))
            .ForMember(d => d.NombreLoteria, opt => opt.MapFrom(s => s.Sorteo != null && s.Sorteo.Loteria != null ? s.Sorteo.Loteria.Nombre : string.Empty));

        CreateMap<ConfiguracionPago, ConfiguracionPagoDto>()
            .ForMember(d => d.NombreLoteria, opt => opt.MapFrom(s => s.Loteria != null ? s.Loteria.Nombre : string.Empty));
        CreateMap<CrearActualizarConfiguracionPagoDto, ConfiguracionPago>();

        CreateMap<ConfiguracionPagoSorteo, ConfiguracionPagoSorteoDto>()
            .ForMember(d => d.NombreSorteo, opt => opt.MapFrom(s => s.Sorteo != null ? s.Sorteo.Nombre : string.Empty))
            .ForMember(d => d.NombreLoteria, opt => opt.MapFrom(s => s.Sorteo != null && s.Sorteo.Loteria != null ? s.Sorteo.Loteria.Nombre : string.Empty));

        CreateMap<ConfiguracionMontoJugada, ConfiguracionMontoJugadaDto>();
        CreateMap<CrearActualizarConfiguracionMontoJugadaDto, ConfiguracionMontoJugada>();

        CreateMap<Terminal, TerminalDto>();
        CreateMap<CrearActualizarTerminalDto, Terminal>();

        CreateMap<LimiteNumero, LimiteNumeroDto>()
            .ForMember(d => d.NombreLoteria, opt => opt.MapFrom(s => s.Loteria != null ? s.Loteria.Nombre : string.Empty))
            .ForMember(d => d.NombreSorteo, opt => opt.MapFrom(s => s.Sorteo != null ? s.Sorteo.Nombre : string.Empty))
            .ForMember(d => d.MontoVendido, opt => opt.Ignore())
            .ForMember(d => d.Disponible, opt => opt.Ignore())
            .ForMember(d => d.ExcedenteAguante, opt => opt.Ignore());

        CreateMap<Ticket, TicketDto>()
            .ForMember(d => d.NombreTerminal, opt => opt.MapFrom(s => s.Terminal != null ? s.Terminal.Nombre : string.Empty))
            .ForMember(d => d.NombreVendedor, opt => opt.MapFrom(s => s.Terminal != null ? s.Terminal.NombreVendedor : string.Empty));

        CreateMap<DetalleTicket, DetalleTicketDto>()
            .ForMember(d => d.NombreSorteo, opt => opt.MapFrom(s => s.Sorteo != null ? s.Sorteo.Nombre : string.Empty))
            .ForMember(d => d.NombreLoteria, opt => opt.MapFrom(s => s.Sorteo != null && s.Sorteo.Loteria != null ? s.Sorteo.Loteria.Nombre : string.Empty))
            .ForMember(d => d.NombreSegundoSorteo, opt => opt.MapFrom(s => s.SegundoSorteo != null ? s.SegundoSorteo.Nombre : null));

        CreateMap<CuadreTerminal, CuadreTerminalDto>()
            .ForMember(d => d.NombreTerminal, opt => opt.MapFrom(s => s.Terminal != null ? s.Terminal.Nombre : string.Empty))
            .ForMember(d => d.NombreVendedor, opt => opt.MapFrom(s => s.Terminal != null ? s.Terminal.NombreVendedor : string.Empty));
    }
}
