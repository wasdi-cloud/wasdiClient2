import { Component, Input } from '@angular/core';
import { Workspace } from 'src/app/shared/models/workspace.model';

@Component({
  selector: 'app-workspace-list-item',
  templateUrl: './workspace-list-item.component.html',
  styleUrls: ['./workspace-list-item.component.css']
})
export class WorkspaceListItemComponent {
  @Input() workspace!: Workspace;

  getDate(sTimestamp: number) {
    if (sTimestamp) {
      let sDate: Date = new Date(sTimestamp)
      return sDate.toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 10)
    }
    return "N/A"
  }
}
