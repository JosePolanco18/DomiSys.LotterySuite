import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../core/layout.service';
import { NgClass, NgIf } from '@angular/common';
import { KeeniconComponent } from '../../../shared/keenicon/keenicon.component';
import { SearchResultInnerComponent } from '../../../partials/layout/extras/dropdown-inner/search-result-inner/search-result-inner.component';
import { NotificationsInnerComponent } from '../../../partials/layout/extras/dropdown-inner/notifications-inner/notifications-inner.component';
import { QuickLinksInnerComponent } from '../../../partials/layout/extras/dropdown-inner/quick-links-inner/quick-links-inner.component';
import { ThemeModeSwitcherComponent } from '../../../partials/layout/theme-mode-switcher/theme-mode-switcher.component';
import { UserInnerComponent } from '../../../partials/layout/extras/dropdown-inner/user-inner/user-inner.component';

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss'],
    imports: [NgClass, KeeniconComponent, SearchResultInnerComponent, NotificationsInnerComponent, QuickLinksInnerComponent, ThemeModeSwitcherComponent, UserInnerComponent, NgIf]
})
export class TopbarComponent implements OnInit {
  toolbarButtonMarginClass = 'ms-1 ms-lg-3';
  toolbarButtonHeightClass = 'w-30px h-30px w-md-40px h-md-40px';
  toolbarUserAvatarHeightClass = 'symbol-30px symbol-md-40px';
  toolbarButtonIconSizeClass = 'svg-icon-1';
  headerLeft: string = 'menu';

  constructor(private layout: LayoutService) {}

  ngOnInit(): void {
    this.headerLeft = this.layout.getProp('header.left') as string;
  }
}
