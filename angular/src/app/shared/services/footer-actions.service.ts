// footer-actions.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FooterAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  outline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  callback: () => void;
  disabled?: boolean;
  visible?: boolean;
  order?: number;
  loading?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FooterActionsService {
  private actionsSubject = new BehaviorSubject<FooterAction[]>([]);
  private visibleSubject = new BehaviorSubject<boolean>(false);

  actions$ = this.actionsSubject.asObservable();
  visible$ = this.visibleSubject.asObservable();

  setActions(actions: FooterAction[]): void {
    const sortedActions = actions.sort((a, b) => (a.order || 0) - (b.order || 0));
    this.actionsSubject.next(sortedActions);
  }

  addAction(action: FooterAction): void {
    const currentActions = this.actionsSubject.value;
    const newActions = [...currentActions, action].sort((a, b) => (a.order || 0) - (b.order || 0));
    this.actionsSubject.next(newActions);
  }

  removeAction(id: string): void {
    const currentActions = this.actionsSubject.value;
    this.actionsSubject.next(currentActions.filter(a => a.id !== id));
  }

  clearActions(): void {
    this.actionsSubject.next([]);
  }

  show(): void {
    this.visibleSubject.next(true);
  }

  hide(): void {
    this.visibleSubject.next(false);
  }

  updateAction(id: string, updates: Partial<FooterAction>): void {
    const currentActions = this.actionsSubject.value;
    const index = currentActions.findIndex(a => a.id === id);
    if (index !== -1) {
      currentActions[index] = { ...currentActions[index], ...updates };
      this.actionsSubject.next([...currentActions]);
    }
  }

  setActionLoading(id: string, loading: boolean): void {
    this.updateAction(id, { loading, disabled: loading });
  }

  setActionDisabled(id: string, disabled: boolean): void {
    this.updateAction(id, { disabled });
  }
}