import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { PermissionTreeNode, PermissionGroupDto, GetPermissionListResultDto } from '../../../models/permission-tree.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
@Component({
  selector: 'app-permission-tree',
  templateUrl: './permission-tree.component.html',
  styleUrls: ['./permission-tree.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TreeModule,
    CheckboxModule,
    InputTextModule,
    FormsModule,
    ProgressSpinnerModule
  ]
})
export class PermissionTreeComponent implements OnInit, OnChanges {
  @Input() permissionsData?: GetPermissionListResultDto;
  @Input() loading = false;
  @Output() permissionsChanged = new EventEmitter<string[]>();

  permissionTree: PermissionTreeNode[] = [];
  selectedNodes: PermissionTreeNode[] = [];
  searchText = '';
  filteredTree: PermissionTreeNode[] = [];
  grantAllPermissions = false;

  ngOnInit(): void {
    if (this.permissionsData) {
      this.buildPermissionTree();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['permissionsData'] && changes['permissionsData'].currentValue) {
      this.buildPermissionTree();
    }
  }
  buildPermissionTree(): void {
    if (!this.permissionsData?.groups) {
      this.permissionTree = [];
      this.filteredTree = [];
      return;
    }

    this.permissionTree = this.permissionsData.groups.map(group => ({
      key: group.name,
      label: group.displayName,
      data: {
        name: group.name,
        displayName: group.displayName,
        isGranted: this.areAllPermissionsGranted(group.permissions)
      },
      expanded: true,
      children: this.buildPermissionChildren(group)
    }));

    this.selectedNodes = this.getSelectedNodesFromTree(this.permissionTree);
    this.filteredTree = [...this.permissionTree];
    this.updateGrantAllState();
  }

  private buildPermissionChildren(group: PermissionGroupDto): PermissionTreeNode[] {
    const permissionMap = new Map<string, PermissionTreeNode>();
    const rootPermissions: PermissionTreeNode[] = [];

    group.permissions.forEach(perm => {
      permissionMap.set(perm.name, {
        key: perm.name,
        label: perm.displayName,
        data: {
          name: perm.name,
          displayName: perm.displayName,
          isGranted: perm.isGranted,
          parentName: perm.parentName
        },
        children: []
      });
    });

    group.permissions.forEach(perm => {
      const node = permissionMap.get(perm.name)!;

      if (perm.parentName && permissionMap.has(perm.parentName)) {
        const parent = permissionMap.get(perm.parentName)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        rootPermissions.push(node);
      }
    });

    return rootPermissions;
  }
  private areAllPermissionsGranted(permissions: any[]): boolean {
    return permissions.every(p => p.isGranted);
  }

  private getSelectedNodesFromTree(tree: PermissionTreeNode[]): PermissionTreeNode[] {
    const selected: PermissionTreeNode[] = [];

    const traverse = (nodes: PermissionTreeNode[]) => {
      nodes.forEach(node => {
        if (node.data?.isGranted) selected.push(node);
        if (node.children && node.children.length > 0) traverse(node.children);
      });
    };

    traverse(tree);
    return selected;
  }

  onNodeSelect(event: any): void {
    this.ensureParentPermissionsSelected();
    this.updatePermissionStates();
    this.emitChanges();
  }

  onNodeUnselect(event: any): void {
    this.ensureParentPermissionsSelected();
    this.updatePermissionStates();
    this.emitChanges();
  }

  /**
   * Asegura que los permisos padres estén seleccionados si al menos un hijo está seleccionado.
   * Esto es importante para permisos "Default" que deben estar activos cuando hay sub-permisos activos.
   */
  private ensureParentPermissionsSelected(): void {
    const selectedKeys = new Set(this.selectedNodes.map(n => n.key));
    const nodesToAdd: PermissionTreeNode[] = [];

    /**
     * Verifica recursivamente si un nodo tiene al menos un hijo seleccionado
     */
    const hasAnySelectedChild = (node: PermissionTreeNode): boolean => {
      if (!node.children || node.children.length === 0) {
        return false;
      }

      return node.children.some(child => {
        // Si el hijo está seleccionado, retornar true
        if (selectedKeys.has(child.key)) {
          return true;
        }
        // Si el hijo tiene hijos, verificar recursivamente
        if (child.children && child.children.length > 0) {
          return hasAnySelectedChild(child);
        }
        return false;
      });
    };

    /**
     * Recorre el árbol y agrega padres que deben estar seleccionados
     */
    const checkAndAddParents = (nodes: PermissionTreeNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          // Verificar recursivamente los hijos primero
          checkAndAddParents(node.children);

          // Si al menos un hijo (o descendiente) está seleccionado, el padre también debe estar seleccionado
          if (hasAnySelectedChild(node) && !selectedKeys.has(node.key)) {
            // El padre debe estar seleccionado
            nodesToAdd.push(node);
            selectedKeys.add(node.key);
          }
        }
      });
    };

    checkAndAddParents(this.permissionTree);

    // Agregar los nodos padres a selectedNodes si no están
    if (nodesToAdd.length > 0) {
      this.selectedNodes = [...this.selectedNodes, ...nodesToAdd];
    }
  }

  private updatePermissionStates(): void {
    const selectedKeys = new Set(this.selectedNodes.map(n => n.key));

    const updateTree = (nodes: PermissionTreeNode[]) => {
      nodes.forEach(node => {
        if (node.data) node.data.isGranted = selectedKeys.has(node.key);
        if (node.children && node.children.length > 0) updateTree(node.children);
      });
    };

    updateTree(this.permissionTree);
    this.updateGrantAllState();
  }

  private updateGrantAllState(): void {
    const allSelected = this.getAllPermissionNodes(this.permissionTree);
    this.grantAllPermissions = allSelected.length > 0 && allSelected.length === this.selectedNodes.length;
  }

  private getAllPermissionNodes(tree: PermissionTreeNode[]): PermissionTreeNode[] {
    const allNodes: PermissionTreeNode[] = [];

    const traverse = (nodes: PermissionTreeNode[]) => {
      nodes.forEach(node => {
        allNodes.push(node);
        if (node.children && node.children.length > 0) traverse(node.children);
      });
    };

    traverse(tree);
    return allNodes;
  }

  onGrantAllChange(): void {
    const allNodes = this.getAllPermissionNodes(this.permissionTree);

    if (this.grantAllPermissions) {
      this.selectedNodes = [...allNodes];
      this.markAllNodesAsGranted(this.permissionTree, true);
    } else {
      this.selectedNodes = [];
      this.markAllNodesAsGranted(this.permissionTree, false);
    }

    this.filteredTree = [...this.permissionTree];
    this.emitChanges();
  }

  private markAllNodesAsGranted(nodes: PermissionTreeNode[], isGranted: boolean): void {
    nodes.forEach(node => {
      if (node.data && node.data.name) node.data.isGranted = isGranted;
      if (node.children && node.children.length > 0) this.markAllNodesAsGranted(node.children, isGranted);
    });
  }

  filterTree(): void {
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredTree = [...this.permissionTree];
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredTree = this.permissionTree
      .map(node => this.filterNode(node, searchLower))
      .filter(node => node !== null) as PermissionTreeNode[];
  }

  private filterNode(node: PermissionTreeNode, searchText: string): PermissionTreeNode | null {
    const matches = node.label?.toLowerCase().includes(searchText) || false;

    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children
        .map(child => this.filterNode(child, searchText))
        .filter(child => child !== null) as PermissionTreeNode[];

      if (filteredChildren.length > 0 || matches) {
        return {
          ...node,
          children: filteredChildren,
          expanded: true
        };
      }
    }

    return matches ? { ...node } : null;
  }

  expandAll(): void {
    this.filteredTree = this.expandNodes(this.filteredTree);
  }

  collapseAll(): void {
    this.filteredTree = this.collapseNodes(this.filteredTree);
  }

  private expandNodes(nodes: PermissionTreeNode[]): PermissionTreeNode[] {
    return nodes.map(node => ({
      ...node,
      expanded: true,
      children: node.children ? this.expandNodes(node.children) : []
    }));
  }

  private collapseNodes(nodes: PermissionTreeNode[]): PermissionTreeNode[] {
    return nodes.map(node => ({
      ...node,
      expanded: false,
      children: node.children ? this.collapseNodes(node.children) : []
    }));
  }

  private emitChanges(): void {
    // Incluir TODOS los permisos seleccionados, incluyendo los padres (Default)
    // Esto es necesario para que los permisos "Default" se guarden correctamente
    const grantedPermissions = this.selectedNodes
      .filter(node => node.data?.name)
      .map(node => node.data!.name);

    this.permissionsChanged.emit(grantedPermissions);
  }

  getSelectedPermissions(): string[] {
    // Incluir TODOS los permisos seleccionados, incluyendo los padres (Default)
    // Esto es necesario para que los permisos "Default" se guarden correctamente
    return this.selectedNodes
      .filter(node => node.data?.name)
      .map(node => node.data!.name);
  }
}
