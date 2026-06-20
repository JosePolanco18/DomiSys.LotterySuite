import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogoStateService {
  private logoUpdatedSubject = new BehaviorSubject<boolean>(false);
  
  logoUpdated$: Observable<boolean> = this.logoUpdatedSubject.asObservable();
  
  constructor() {}

  notifyLogoUpdated(): void {
    this.logoUpdatedSubject.next(true);
  }
  
  resetLogoState(): void {
    this.logoUpdatedSubject.next(false);
  }
}