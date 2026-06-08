import {Component} from '@angular/core';
import {NotificationDisplayService} from "../../services/notification-display.service";

import {TranslateService} from "@ngx-translate/core";
import {LabellingProjectsComponent} from "./labelling-projects/labelling-projects.component";
import {LabellingTemplatesComponent} from "./labelling-templates/labelling-templates.component";
import {LabellingLabelsComponent} from "./labelling-labels/labelling-labels.component";
import {LabellingMenuComponent} from "./labelling-menu/labelling-menu.component";

@Component({
  selector: 'app-labelling',
  imports: [
    LabellingProjectsComponent,
    LabellingTemplatesComponent,
    LabellingLabelsComponent,
    LabellingMenuComponent
  ],
  templateUrl: './labelling.component.html',
  styleUrl: './labelling.component.css',
})
export class LabellingComponent {
  m_sActiveTab: string = 'projects';

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService) {
  }

  ngOnInit(): void {
  }

  getActiveTab(sEvent: string) {
    this.m_sActiveTab = sEvent;
  }
}
