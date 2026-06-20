import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeeniconComponent } from '../../../../shared/keenicon/keenicon.component';

@Component({
    selector: 'app-sidebar-footer',
    templateUrl: './sidebar-footer.component.html',
    styleUrls: ['./sidebar-footer.component.scss'],
    imports: [KeeniconComponent, CommonModule]
})
export class SidebarFooterComponent {
}
