import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { take, filter, switchMap, finalize, catchError } from 'rxjs/operators';
import { ConfigStateService } from '@abp/ng.core';

@Injectable({
  providedIn: 'root'
})
export class AppInitializationService {

  private isInitializing = false;
  private isInitializingSubject = new BehaviorSubject<boolean>(false);
  private initializationPromise: Observable<any> | null = null;

  public isInitializing$ = this.isInitializingSubject.asObservable();

  constructor(private configState: ConfigStateService) {}

  public initializeApp(): Observable<any> {
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.startInitialization();

    this.initializationPromise = this.configState.getOne$('currentUser').pipe(
      take(1),
      switchMap(() => of(null)),
      finalize(() => this.completeInitialization()),
      catchError(() => {
        this.completeInitialization();
        return of(null);
      })
    );

    return this.initializationPromise;
  }

  private startInitialization(): void {
    this.isInitializing = true;
    this.isInitializingSubject.next(true);
  }

  private completeInitialization(): void {
    this.isInitializing = false;
    this.isInitializingSubject.next(false);
    this.initializationPromise = null;
  }

  public waitForInitializationCompletion(): Observable<boolean> {
    if (!this.isInitializing) {
      return of(true);
    }
    return this.isInitializingSubject.pipe(
      filter(isInit => !isInit),
      take(1),
      switchMap(() => of(true))
    );
  }
}
