-- Script para agregar la columna ContributionTransactionId si no existe

DO $$
BEGIN
    -- Verificar si la columna ya existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'investment_interest_payment_details'
        AND column_name = 'ContributionTransactionId'
    ) THEN
        -- Agregar la columna
        ALTER TABLE investment_interest_payment_details
        ADD "ContributionTransactionId" uuid;

        -- Crear el índice
        CREATE INDEX "IX_investment_interest_payment_details_ContributionTransaction~"
        ON investment_interest_payment_details ("ContributionTransactionId");

        -- Agregar la foreign key
        ALTER TABLE investment_interest_payment_details
        ADD CONSTRAINT "FK_investment_interest_payment_details_contribution_transactio~"
        FOREIGN KEY ("ContributionTransactionId")
        REFERENCES contribution_transactions ("Id");

        RAISE NOTICE 'Columna ContributionTransactionId agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna ContributionTransactionId ya existe';
    END IF;
END $$;

-- Verificar que la migración esté registrada en el historial
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260304160859_AddContributionTransactionIdToInvestmentInterestPaymentDetail', '9.0.4'
WHERE NOT EXISTS (
    SELECT 1 FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20260304160859_AddContributionTransactionIdToInvestmentInterestPaymentDetail'
);
