import {Component} from '@angular/core';
import {NotificationDisplayService} from "../../services/notification-display.service";

import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-labelling',
  templateUrl: './labelling.component.html',
  styleUrl: './labelling.component.css',
  host: { 'class': 'flex-fill' },
  standalone: false
})
export class LabellingComponent {
  m_sActiveTab: string = 'projects';
  m_oPublishBandMessage: any = null;

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService) {
  }

  ngOnInit(): void {
  }

  getActiveTab(sEvent: string) {
    console.log("PARENT RECEIVED EVENT:", sEvent);
    this.m_sActiveTab = sEvent;
  }

  onPublishBandMessage(oMessage: any): void {
    console.log("Parent received publish band message:", oMessage);
    this.m_oPublishBandMessage = oMessage;
  }
}
