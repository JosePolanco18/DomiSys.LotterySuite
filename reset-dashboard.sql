-- Script para resetear las configuraciones de dashboard existentes
-- Esto eliminará todas las configuraciones guardadas y forzará a los usuarios
-- a obtener la nueva configuración por defecto

-- Opción 1: Eliminar todas las configuraciones (usuarios obtendrán la nueva configuración al cargar)
DELETE FROM "UserDashboards";

-- Opción 2: Actualizar solo tu usuario (reemplaza 'TU_USER_ID' con tu ID de usuario)
-- DELETE FROM "UserDashboards" WHERE "UserId" = 'TU_USER_ID';

-- Opción 3: Ver las configuraciones actuales antes de eliminar
-- SELECT "Id", "UserId", "Configuration" FROM "UserDashboards";
