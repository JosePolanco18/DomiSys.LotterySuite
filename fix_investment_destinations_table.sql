-- Script para corregir el nombre de la tabla InvestmentInterestDestination
-- Ejecutar en la base de datos FinancialSuite

-- 1. Eliminar la tabla con nombre incorrecto (si existe)
DROP TABLE IF EXISTS "InvestmentInterestDestination";

-- 2. Eliminar el registro de migración para poder re-aplicarla
DELETE FROM "__EFMigrationsHistory"
WHERE "MigrationId" = '20260302161452_AddInvestmentInterestDestinations';

-- Después de ejecutar este script, ejecuta desde la terminal:
-- cd src/DomiSys.FinancialSuite.EntityFrameworkCore
-- dotnet ef database update
