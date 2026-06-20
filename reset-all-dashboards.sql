-- Script para resetear todos los dashboards y forzar el layout correcto
-- Esto eliminará todas las configuraciones de dashboard personalizadas
-- y forzará que el sistema cree nuevas con el layout horizontal correcto

-- Eliminar todas las configuraciones de dashboard existentes
DELETE FROM user_dashboards;

-- Ahora cuando los usuarios accedan, el sistema creará automáticamente
-- la configuración por defecto con las posiciones correctas

SELECT 'Dashboard configurations reset. Users will get default layout on next login.' as message;
