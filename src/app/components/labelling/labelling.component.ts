import {Component} from '@angular/core';
import {NotificationDisplayService} from "../../services/notification-display.service";

import {TranslateService} from "@ngx-translate/core";
import { ActivatedRoute } from '@angular/router';

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
    private m_oTranslate: TranslateService,
    private m_oRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    const sTab = this.m_oRoute.snapshot.queryParamMap.get('tab');
    if (sTab === 'labels') {
      this.m_sActiveTab = 'labels';
    }
  }

  getActiveTab(sEvent: string) {
    this.m_sActiveTab = sEvent;
  }

  onPublishBandMessage(oMessage: any): void {
    this.m_oPublishBandMessage = oMessage;
  }
}
