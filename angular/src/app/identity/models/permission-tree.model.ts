import { TreeNode } from 'primeng/api';

/**
 * Modelo para representar un permiso en el árbol
 */
export interface PermissionTreeNode extends TreeNode {
  /**
   * Nombre del permiso (ej: "AbpIdentity.Users")
   */
  key?: string;

  /**
   * Nombre para mostrar del permiso
   */
  label?: string;

  /**
   * Datos adicionales del permiso
   */
  data?: PermissionData;

  /**
   * Nodos hijos (sub-permisos)
   */
  children?: PermissionTreeNode[];

  /**
   * Si está expandido por defecto
   */
  expanded?: boolean;

  /**
   * Si está seleccionado
   */
  partialSelected?: boolean;
}

/**
 * Datos adicionales de un permiso
 */
export interface PermissionData {
  /**
   * Nombre del permiso completo
   */
  name: string;

  /**
   * Nombre del grupo al que pertenece
   */
  parentName?: string;

  /**
   * Nombre para mostrar
   */
  displayName: string;

  /**
   * Si es un permiso otorgado
   */
  isGranted: boolean;

  /**
   * Si el permiso está deshabilitado
   */
  disabled?: boolean;
}

/**
 * Respuesta del servicio de permisos de ABP
 */
export interface GetPermissionListResultDto {
  entityDisplayName: string;
  groups: PermissionGroupDto[];
}

/**
 * Grupo de permisos
 */
export interface PermissionGroupDto {
  name: string;
  displayName: string;
  permissions: PermissionGrantInfoDto[];
}

/**
 * Información de un permiso individual
 */
export interface PermissionGrantInfoDto {
  name: string;
  displayName: string;
  parentName?: string;
  isGranted: boolean;
  allowedProviders?: string[];
}

/**
 * Request para actualizar permisos
 */
export interface UpdatePermissionsDto {
  permissions: UpdatePermissionDto[];
}

/**
 * DTO para actualizar un permiso individual
 */
export interface UpdatePermissionDto {
  name: string;
  isGranted: boolean;
}
