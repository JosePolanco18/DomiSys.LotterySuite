import { Component, inject, OnInit, TrackByFunction } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RoutesService, ABP, eLayoutType, PermissionService } from '@abp/ng.core';
import { KeeniconComponent } from '../../../../shared/keenicon/keenicon.component';
import { LayoutService } from '../../../core/layout.service';

interface MenuRoute extends ABP.Route {
  children?: MenuRoute[];
  originalName?: string; // Agregamos esta propiedad para mantener el nombre original
}

@Component({
    selector: 'app-sidebar-menu',
    templateUrl: './sidebar-menu.component.html',
    styleUrls: ['./sidebar-menu.component.scss'],
    imports: [RouterLink, RouterLinkActive, KeeniconComponent, CommonModule]
})
export class SidebarMenuComponent implements OnInit {
  public readonly service = inject(LayoutService);
  private readonly routesService = inject(RoutesService);
  private readonly permissionService = inject(PermissionService);
  
  routes$: Observable<MenuRoute[]>;

  constructor() { }

  ngOnInit(): void {
    this.routes$ = this.routesService.flat$.pipe(
      switchMap(routes => {
        const filteredRoutes = routes.filter(route => {
          const hasName = route.name && route.name.trim() !== '';
          const isVisible = !route.invisible;
          const isApplicationLayout = route.layout === eLayoutType.application;
          const isHomePage = route.path === '/' || route.path === '';
          const isAccountRoute = route.path === '/account' || route.path?.startsWith('/account/');
          const isSettingManagementRoute = route.path?.includes('/setting-management');
          const isHomeMenu = route.name === '::Menu:Home';
          
          const isIdentityRoute = route.name?.startsWith('AbpIdentity::');
          const isAccountingRoute = route.name?.startsWith('AbpAccount::') || route.name?.startsWith('Accounting::');
          
          const passesLayoutCheck = (isIdentityRoute || isAccountingRoute) ? true : isApplicationLayout;
          
          return hasName && 
                 isVisible && 
                 passesLayoutCheck && 
                 !isHomePage && 
                 !isAccountRoute && 
                 !isSettingManagementRoute && 
                 !isHomeMenu;
        });
        
        return this.validateRoutesPermissions(filteredRoutes).pipe(
          map(routesWithPermissions => {
            const hierarchy = this.buildMenuHierarchy(routesWithPermissions);
            return hierarchy;
          })
        );
      })
    );
  }

  private cleanMenuName(name: string): string {
    if (!name) return '';
    
    let cleanedName = name;
    if (cleanedName.startsWith('::')) {
      cleanedName = cleanedName.substring(2);
    }

    // *** NUEVA LÓGICA: Remover contextos entre corchetes ***
    // Esto convertirá "Listado de cuentas[Ahorros]" → "Listado de cuentas"
    // También maneja espacios: "Listado de cuentas [Ahorros]" → "Listado de cuentas"
    const contextPattern = /\s*\[([^\]]+)\]\s*$/;
    if (contextPattern.test(cleanedName)) {
      cleanedName = cleanedName.replace(contextPattern, '').trim();
    }
    
    const nameMapping: { [key: string]: string } = {
      'RegistrosGenerales': 'Registros',
      'ProcesosGenerales': 'Procesos', 
      'ConsultasGenerales': 'Consultas',
      'ReportesGenerales': 'Reportes',
      'RegistrosContabilidad': 'Registros',
      'ProcesosContabilidad': 'Procesos',
      'ConsultasContabilidad': 'Consultas', 
      'ReportesContabilidad': 'Reportes',
      'RegistrosBancos': 'Registros',
      'ProcesosBancos': 'Procesos',
      'ConsultasBancos': 'Consultas',
      'ReportesBancos': 'Reportes',
      'RegistrosAhorros': 'Registros',
      'ProcesosAhorros': 'Procesos',
      'ConsultasAhorros': 'Consultas', 
      'ReportesAhorros': 'Reportes',
      'RegistrosAportaciones': 'Registros',
      'ProcesosAportaciones': 'Procesos',
      'ConsultasAportaciones': 'Consultas',
      'ReportesAportaciones': 'Reportes',
      'RegistrosCajas': 'Registros',
      'ProcesosCajas': 'Procesos',
      'ConsultasCajas': 'Consultas', 
      'ReportesCajas': 'Reportes',
      'RegistrosAdministracion': 'Registros',
      'ConfiguracionAdministracion': 'Configuración'
    };

    // Verificar mapeo directo primero
    if (nameMapping[cleanedName]) {
      return nameMapping[cleanedName];
    }

    // Aplicar patrones generales
    const patterns = [
      { regex: /^Registros(.+)$/, replacement: 'Registros' },
      { regex: /^Procesos(.+)$/, replacement: 'Procesos' },
      { regex: /^Consultas(.+)$/, replacement: 'Consultas' },
      { regex: /^Reportes(.+)$/, replacement: 'Reportes' },
      { regex: /^Configuracion(.+)$/, replacement: 'Configuración' }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(cleanedName)) {
        return pattern.replacement;
      }
    }

    return cleanedName;
  }

  private validateRoutesPermissions(routes: ABP.Route[]): Observable<ABP.Route[]> {
    if (!routes || routes.length === 0) {
      return of([]);
    }

    const permissionChecks = routes.map(route => {
      let policyToCheck = route.requiredPolicy;
      
      if (route.name?.startsWith('AbpIdentity::') && !policyToCheck) {
        if (route.name === 'AbpIdentity::Users') {
          policyToCheck = 'AbpIdentity.Users';
        } else if (route.name === 'AbpIdentity::Roles') {
          policyToCheck = 'AbpIdentity.Roles';
        } else if (route.name === 'AbpIdentity::Menu:IdentityManagement') {
          policyToCheck = 'AbpIdentity.Users || AbpIdentity.Roles';
        }
      }

      if (route.name?.startsWith('Accounting::') && !policyToCheck) {
        if (route.name === 'Accounting::Menu:AccountingManagement') {
          policyToCheck = 'Accounting.Management';
        } else if (route.name.includes('Accounts')) {
          policyToCheck = 'Accounting.Accounts';
        } else if (route.name.includes('Transactions')) {
          policyToCheck = 'Accounting.Transactions';
        }
      }

      if (!policyToCheck) {
        return of({ route, allowed: true });
      }

      if (policyToCheck.includes('||')) {
        const policies = policyToCheck.split('||').map(p => p.trim());
        const policyChecks = policies.map(policy => 
          this.permissionService.getGrantedPolicy$(policy)
        );
        
        return combineLatest(policyChecks).pipe(
          map(results => {
            const hasAnyPermission = results.some(granted => granted);
            return { route, allowed: hasAnyPermission };
          })
        );
      }

      return this.permissionService.getGrantedPolicy$(policyToCheck).pipe(
        map(granted => {
          return { route, allowed: granted };
        })
      );
    });

    return combineLatest(permissionChecks).pipe(
      map(results => {
        const allowedRoutes = results
          .filter(result => result.allowed)
          .map(result => result.route);
        return allowedRoutes;
      })
    );
  }

  private buildMenuHierarchy(routes: ABP.Route[]): MenuRoute[] {
    const rootRoutes: MenuRoute[] = [];
    
    const identityRoutes = routes.filter(r => r.name?.startsWith('AbpIdentity::'));
    const accountingRoutes = routes.filter(r => r.name?.startsWith('Accounting::'));
    const otherRoutes = routes.filter(r => 
      !r.name?.startsWith('AbpIdentity::') && 
      !r.name?.startsWith('Accounting::')
    );

    this.processIdentityRoutes(identityRoutes, rootRoutes);
    this.processAccountingRoutes(accountingRoutes, rootRoutes);
    
    const routeMap = new Map<string, MenuRoute>();
    
    // *** SOLUCIÓN: Usar NOMBRE ORIGINAL como clave única ***
    otherRoutes.forEach(route => {
      const menuRoute: MenuRoute = { 
        ...route, 
        children: [],
        originalName: route.name, // Guardar el nombre original
        name: this.cleanMenuName(route.name) // Usar el nombre limpio para mostrar
      };
      // CLAVE: Usar el nombre original completo como clave única
      routeMap.set(route.name, menuRoute);
    });

    // *** SOLUCIÓN: Usar parentName ORIGINAL para buscar el padre exacto ***
    otherRoutes.forEach(route => {
      const currentRoute = routeMap.get(route.name);
      if (!currentRoute) return;

      if (route.parentName) {
        // CLAVE: Buscar el padre usando el parentName ORIGINAL, no el nombre limpio
        const parentRoute = routeMap.get(route.parentName);
        if (parentRoute) {
          if (!parentRoute.children) parentRoute.children = [];
          parentRoute.children.push(currentRoute);
        } else {
          // Si no encuentra el padre, agregarlo como raíz
          rootRoutes.push(currentRoute);
        }
      } else {
        rootRoutes.push(currentRoute);
      }
    });

    this.sortRoutesByOrder(rootRoutes);
    this.sortChildrenRecursively(rootRoutes);

    const cleanedRoutes = this.removeEmptyGroups(rootRoutes);
    return cleanedRoutes;
  }

  private processIdentityRoutes(identityRoutes: ABP.Route[], rootRoutes: MenuRoute[]): void {
    if (identityRoutes.length === 0) return;
    
    const identityMain = identityRoutes.find(r => r.name === 'AbpIdentity::Menu:IdentityManagement');
    const identityChildren = identityRoutes.filter(r => r.name !== 'AbpIdentity::Menu:IdentityManagement');
    
    if (identityMain) {
      const identityGroup: MenuRoute = {
        ...identityMain,
        name: 'Seguridad',
        path: undefined, 
        children: [],
        order: 999
      };
      
      identityChildren.forEach(child => {
        const menuChild: MenuRoute = {
          ...child,
          children: []
        };
        
        if (child.name === 'AbpIdentity::Users') {
          menuChild.name = 'Usuarios';
        } else if (child.name === 'AbpIdentity::Roles') {
          menuChild.name = 'Roles';
        } else if (child.name === 'AbpIdentity::ClaimTypes') {
          menuChild.name = 'Tipos de Reclamación';
        }
        
        identityGroup.children!.push(menuChild);
      });
      
      if (identityGroup.children!.length > 0) {
        rootRoutes.push(identityGroup);
      }
    } else {
      identityChildren.forEach(route => {
        const menuRoute: MenuRoute = {
          ...route,
          children: []
        };
        
        if (route.name === 'AbpIdentity::Users') {
          menuRoute.name = 'Usuarios';
        } else if (route.name === 'AbpIdentity::Roles') {
          menuRoute.name = 'Roles';
        }
        
        rootRoutes.push(menuRoute);
      });
    }
  }

  private processAccountingRoutes(accountingRoutes: ABP.Route[], rootRoutes: MenuRoute[]): void {
    if (accountingRoutes.length === 0) return;
    
    const accountingMain = accountingRoutes.find(r => r.name === 'Accounting::Menu:AccountingManagement');
    const accountingChildren = accountingRoutes.filter(r => r.name !== 'Accounting::Menu:AccountingManagement');
    
    if (accountingMain) {
      const accountingGroup: MenuRoute = {
        ...accountingMain,
        name: 'Contabilidad',
        path: undefined, 
        children: [],
        order: 100
      };
      
      accountingChildren.forEach(child => {
        const menuChild: MenuRoute = {
          ...child,
          children: []
        };
        
        if (child.name?.includes('Accounts')) {
          menuChild.name = 'Cuentas';
        } else if (child.name?.includes('Transactions')) {
          menuChild.name = 'Transacciones';
        } else if (child.name?.includes('Reports')) {
          menuChild.name = 'Reportes';
        }
        
        accountingGroup.children!.push(menuChild);
      });
      
      if (accountingGroup.children!.length > 0) {
        rootRoutes.push(accountingGroup);
      }
    } else {
      accountingChildren.forEach(route => {
        const menuRoute: MenuRoute = {
          ...route,
          children: []
        };
        
        if (route.name?.includes('Accounts')) {
          menuRoute.name = 'Cuentas';
        } else if (route.name?.includes('Transactions')) {
          menuRoute.name = 'Transacciones';
        }
        
        rootRoutes.push(menuRoute);
      });
    }
  }

  private removeEmptyGroups(routes: MenuRoute[]): MenuRoute[] {
    return routes.filter(route => {
      if (route.path) {
        return true;
      }
      
      if (route.children && route.children.length > 0) {
        route.children = this.removeEmptyGroups(route.children);
        return route.children.length > 0;
      }
      
      return false;
    });
  }

  private sortRoutesByOrder(routes: MenuRoute[]): void {
    routes.sort((a, b) => {
      const orderA = a.order || 999;
      const orderB = b.order || 999;
      return orderA - orderB;
    });
  }

  private sortChildrenRecursively(routes: MenuRoute[]): void {
    routes.forEach(route => {
      if (route.children && route.children.length > 0) {
        this.sortRoutesByOrder(route.children);
        this.sortChildrenRecursively(route.children);
      }
    });
  }

  trackByFn: TrackByFunction<MenuRoute> = (index, item) => item.originalName || item.name || index;

  getIconName(route: MenuRoute): string {
    const path = route.path?.toLowerCase() || '';
    const name = route.name?.toLowerCase() || '';

    if (name === 'registros') return 'add-files';
    if (name === 'procesos') return 'setting-2';
    if (name === 'consultas') return 'search-list';
    if (name === 'reportes') return 'chart-line';
    if (name === 'configuración') return 'setting-3';
    if (path.includes('dashboard') || name.includes('dashboard') || name.includes('home')) return 'element-11';
    
    if (name.includes('seguridad') || name.includes('identity')) return 'key';
    if (name.includes('usuarios') || name.includes('users') || name.includes('user')) return 'profile-user';
    if (name.includes('roles') || name.includes('role')) return 'security-user';
    if (name.includes('tipos de reclamación') || name.includes('claim')) return 'key';
    
    if (name.includes('contabilidad') || name.includes('accounting')) return 'wallet';
    if (name.includes('cuentas') || name.includes('accounts')) return 'wallet';
    if (name.includes('transacciones') || name.includes('transactions')) return 'arrows-loop';
    if (name.includes('generales') || name.includes('generals')) return 'technology-4';
    if (name.includes('banking') || name.includes('bancos')) return 'bank';
    if (name.includes('ahorros') || name.includes('savings')) return 'save-deposit';
    if (name.includes('cajas') || name.includes('cashmanagement')) return 'dollar';
    if (name.includes('aportaciones') || name.includes('contributions')) return 'graph-up';
    if (name.includes('inversiones') || name.includes('investments')) return 'chart-line-star';
    if (name.includes('prestamos') || name.includes('loans')) return 'finance-calculator';

    // Lottery system
    if (name.includes('loterías') || name.includes('loterias')) return 'abstract-26';
    if (name.includes('gestión de loterías')) return 'setting-2';
    if (name.includes('resultados')) return 'chart-simple';
    if (name.includes('terminales')) return 'phone';
    if (name.includes('ventas')) return 'handcart';
    if (name.includes('punto de venta')) return 'basket';
    if (name.includes('tickets')) return 'document';
    if (name.includes('ganadores')) return 'crown';
    if (name.includes('cuadres')) return 'calculator';
    if (name.includes('control de riesgo')) return 'shield-tick';
    if (name.includes('límites por número') || name.includes('limites por numero')) return 'filter-edit';
    if (name.includes('monitor de ventas')) return 'graph-up';
    if (name.includes('configuración') || name.includes('configuracion')) return 'setting-3';

    if (path.includes('geography') || name.includes('geografía')) return 'geolocation';
    if (path.includes('countries') || name.includes('países')) return 'flag';
    if (path.includes('provinces') || name.includes('provincias')) return 'map';
    if (path.includes('municipalities') || name.includes('municipios')) return 'city';
    if (path.includes('sectors') || name.includes('sectores')) return 'map-marker';
    if (path.includes('administration') || name.includes('administración')) return 'setting-4';
    if (path.includes('academic') || name.includes('académicos')) return 'graduate';
    if (path.includes('branches') || name.includes('sucursales')) return 'home-2';
    if (path.includes('nationalities') || name.includes('nacionalidades')) return 'flag';
    if (path.includes('occupations') || name.includes('ocupaciones')) return 'briefcase';
    if (path.includes('members') || name.includes('socios')) return 'profile-user';
    if (path.includes('tenant') || name.includes('tenant')) return 'office-bag';
    if (path.includes('setting') || name.includes('setting')) return 'setting-2';
    
    return 'menu';
  }
}