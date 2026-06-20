import { Component, Input, OnInit } from '@angular/core';
import { IconUserModel } from '../icon-user.model';
import { NgFor, NgIf } from '@angular/common';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    imports: [NgFor, NgbTooltip, NgIf]
})
export class UserListComponent implements OnInit {
  @Input() users: Array<IconUserModel> = [];

  constructor() {}

  ngOnInit(): void {}
}
