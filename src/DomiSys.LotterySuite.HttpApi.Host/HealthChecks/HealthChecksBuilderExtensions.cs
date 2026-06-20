using System;
using System.Linq;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.AspNetCore.Mvc;

namespace DomiSys.LotterySuite.HealthChecks;

public static class HealthChecksBuilderExtensions
{
    public static void AddLotterySuiteHealthChecks(this IServiceCollection services)
    {
        var configuration = services.GetConfiguration();
        
        // Add your health checks here
        var healthChecksBuilder = services.AddHealthChecks();
        healthChecksBuilder.AddCheck<LotterySuiteDatabaseCheck>(
            "LotterySuite DbContext Check", 
            tags: new string[] { "database" }
        );

        services.ConfigureHealthCheckEndpoint("/health-status");

        // Obtener la URL completa del health check
        var selfUrl = configuration["App:SelfUrl"]?.TrimEnd('/') ?? "http://localhost:8085";
        var healthCheckPath = configuration["App:HealthCheckUrl"]?.TrimStart('/') ?? "health-status";
        var fullHealthCheckUrl = $"{selfUrl}/{healthCheckPath}";

        var healthChecksUiBuilder = services.AddHealthChecksUI(settings =>
        {
            settings.SetEvaluationTimeInSeconds(60); // Evaluar cada 60 segundos
            settings.SetMinimumSecondsBetweenFailureNotifications(60);
            
            settings.AddHealthCheckEndpoint(
                "LotterySuite Health Status", 
                fullHealthCheckUrl
            );
        });

        // Set your HealthCheck UI Storage here
        healthChecksUiBuilder.AddInMemoryStorage();

        services.MapHealthChecksUiEndpoints(options =>
        {
            options.UIPath = "/health-ui";
            options.ApiPath = "/health-api";
        });
    }

    private static IServiceCollection ConfigureHealthCheckEndpoint(this IServiceCollection services, string path)
    {
        services.Configure<AbpEndpointRouterOptions>(options =>
        {
            options.EndpointConfigureActions.Add(endpointContext =>
            {
                endpointContext.Endpoints.MapHealthChecks(
                    new PathString(path.EnsureStartsWith('/')),
                    new HealthCheckOptions
                    {
                        Predicate = _ => true,
                        ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
                        AllowCachingResponses = false,
                    });
            });
        });

        return services;
    }

    private static IServiceCollection MapHealthChecksUiEndpoints(
        this IServiceCollection services, 
        Action<global::HealthChecks.UI.Configuration.Options>? setupOption = null)
    {
        services.Configure<AbpEndpointRouterOptions>(routerOptions =>
        {
            routerOptions.EndpointConfigureActions.Add(endpointContext =>
            {
                endpointContext.Endpoints.MapHealthChecksUI(setupOption);
            });
        });

        return services;
    }
    
    private static IConfiguration GetConfiguration(this IServiceCollection services)
    {
        return services.GetSingletonInstance<IConfiguration>();
    }
    
    private static T GetSingletonInstance<T>(this IServiceCollection services)
    {
        var service = services.GetSingletonInstanceOrNull<T>();
        
        if (service == null)
        {
            throw new InvalidOperationException($"Could not find singleton service: {typeof(T).AssemblyQualifiedName}");
        }

        return service;
    }
    
    private static T? GetSingletonInstanceOrNull<T>(this IServiceCollection services)
    {
        var descriptor = services.FirstOrDefault(d => d.ServiceType == typeof(T));
        
        if (descriptor?.ImplementationInstance != null)
        {
            return (T)descriptor.ImplementationInstance;
        }

        if (descriptor?.ImplementationFactory != null)
        {
            return (T)descriptor.ImplementationFactory.Invoke(null!);
        }

        return default;
    }
}