import { Component, OnInit } from '@angular/core';
import { KeeniconComponent } from '../../../../shared/keenicon/keenicon.component';

@Component({
    selector: 'app-activity-drawer',
    templateUrl: './activity-drawer.component.html',
    imports: [KeeniconComponent]
})
export class ActivityDrawerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
