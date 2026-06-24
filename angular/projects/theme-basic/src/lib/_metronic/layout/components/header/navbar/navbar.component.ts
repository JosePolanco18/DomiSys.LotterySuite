import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { KeeniconComponent } from '../../../../shared/keenicon/keenicon.component';
import { SearchResultInnerComponent } from '../../../../partials/layout/extras/dropdown-inner/search-result-inner/search-result-inner.component';
import { NotificationsInnerComponent } from '../../../../partials/layout/extras/dropdown-inner/notifications-inner/notifications-inner.component';
import { ThemeModeSwitcherComponent } from '../../../../partials/layout/theme-mode-switcher/theme-mode-switcher.component';
import { menuReinitialization } from '../../../../kt/kt-helpers';
import { UserInnerComponent } from '../../../../partials/layout/extras/dropdown-inner/user-inner/user-inner.component';
import { ConfigStateService, CurrentUserDto } from '@abp/ng.core';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    imports: [NgClass, KeeniconComponent, ThemeModeSwitcherComponent, UserInnerComponent, NgIf, AsyncPipe]
})
export class NavbarComponent implements OnInit, AfterViewInit {
	@Input() appHeaderDefaulMenuDisplay: boolean;
	@Input() isRtl: boolean;

	itemClass: string = 'ms-1 ms-lg-3';
	btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
	userAvatarClass: string = 'symbol-35px symbol-md-40px';
	btnIconClass: string = 'fs-2 fs-md-1';

	currentUser$: Observable<CurrentUserDto>;
	tenantName: string = '';

	constructor(private configState: ConfigStateService) {
		this.currentUser$ = this.configState.getOne$('currentUser');
		this.configState.getOne$('currentTenant').subscribe((tenant: any) => {
			this.tenantName = tenant?.name || '';
		});
	}

	ngAfterViewInit(): void {
		menuReinitialization();
	}

	ngOnInit(): void { }

}
