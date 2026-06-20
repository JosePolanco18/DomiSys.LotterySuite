-- Script para renombrar la tabla a la convención correcta
-- Ejecutar en la base de datos FinancialSuite

-- Renombrar la tabla al nombre correcto
ALTER TABLE "InvestmentInterestDestination"
RENAME TO "investment_interest_destinations";

-- Renombrar la primary key constraint
ALTER TABLE "investment_interest_destinations"
RENAME CONSTRAINT "PK_InvestmentInterestDestination"
TO "PK_investment_interest_destinations";

-- Renombrar el foreign key constraint
ALTER TABLE "investment_interest_destinations"
RENAME CONSTRAINT "FK_InvestmentInterestDestination_investment_accounts_Investmen~"
TO "FK_investment_interest_destinations_investment_accounts_Invest~";

-- Renombrar el índice
ALTER INDEX "IX_InvestmentInterestDestination_InvestmentAccountId"
RENAME TO "IX_investment_interest_destinations_InvestmentAccountId";
