-- Aplicar migración AddInvestmentInterestDestinations manualmente
-- Base de datos: CoopLamjeDb

BEGIN;

-- 1. Crear la tabla investment_interest_destinations
CREATE TABLE investment_interest_destinations (
    "Id" uuid NOT NULL,
    "InvestmentAccountId" uuid NOT NULL,
    "DestinationType" text NOT NULL,
    "DestinationAccountId" uuid NULL,
    "DistributionPercentage" numeric NOT NULL,
    "CreationTime" timestamp without time zone NOT NULL,
    "CreatorId" uuid NULL,
    "LastModificationTime" timestamp without time zone NULL,
    "LastModifierId" uuid NULL,
    CONSTRAINT "PK_investment_interest_destinations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_investment_interest_destinations_investment_accounts_Invest~"
        FOREIGN KEY ("InvestmentAccountId")
        REFERENCES investment_accounts ("Id")
        ON DELETE CASCADE
);

-- 2. Crear índice
CREATE INDEX "IX_investment_interest_destinations_InvestmentAccountId"
    ON investment_interest_destinations ("InvestmentAccountId");

-- 3. Migrar datos existentes - ReinvestmentPercentage a destinos Investment
INSERT INTO investment_interest_destinations
    ("Id", "InvestmentAccountId", "DestinationType", "DestinationAccountId", "DistributionPercentage", "CreationTime")
SELECT
    gen_random_uuid(),
    "Id",
    'Investment',
    NULL,
    "ReinvestmentPercentage",
    NOW()
FROM investment_accounts
WHERE "ReinvestmentPercentage" > 0;

-- 4. Migrar datos existentes - InterestPaymentSavingAccountId a destinos Savings
INSERT INTO investment_interest_destinations
    ("Id", "InvestmentAccountId", "DestinationType", "DestinationAccountId", "DistributionPercentage", "CreationTime")
SELECT
    gen_random_uuid(),
    "Id",
    'Savings',
    "InterestPaymentSavingAccountId",
    100.00 - COALESCE("ReinvestmentPercentage", 0),
    NOW()
FROM investment_accounts
WHERE "InterestPaymentSavingAccountId" IS NOT NULL
  AND (100.00 - COALESCE("ReinvestmentPercentage", 0)) > 0;

-- 5. Registrar la migración como aplicada
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260302161452_AddInvestmentInterestDestinations', '9.0.4');

COMMIT;
