import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, ConfigStateService, CurrentUserDto } from '@abp/ng.core';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
    selector: 'app-user-inner',
    templateUrl: './user-inner.component.html',
    imports: [RouterLink, AsyncPipe, NgIf]
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  currentUser$: Observable<CurrentUserDto>;
  private unsubscribe: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private configState: ConfigStateService
  ) {
    this.currentUser$ = this.configState.getOne$('currentUser');
  }

  ngOnInit(): void {
  }

  logout() {
    this.authService.logout().subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
