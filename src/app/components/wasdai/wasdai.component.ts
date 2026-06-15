import { Component } from '@angular/core';
import {NotificationDisplayService} from "../../services/notification-display.service";
import {TranslateService} from "@ngx-translate/core";
import {ChatItemComponent} from "./chat-item/chat-item.component";
import {AssistantChatComponent} from "./assistant-chat/assistant-chat.component";

@Component({
  selector: 'app-wasdai',
  imports: [ChatItemComponent, AssistantChatComponent],
  templateUrl: './wasdai.component.html',
  styleUrl: './wasdai.component.css',
  host: { 'class': 'flex-fill' },
})

export class WasdaiComponent {
  m_sActiveTab: string = 'projects';

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService) {
  }

  ngOnInit(): void {
  }

  getActiveTab(sEvent: string) {
    console.log("🚨 PARENT RECEIVED EVENT:", sEvent);
    this.m_sActiveTab = sEvent;
  }
}
