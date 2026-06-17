import {Component, EventEmitter, Output} from '@angular/core';
import {ConstantsService} from "../../../services/constants.service";
import {TranslatePipe} from "@ngx-translate/core";
import {MenuButtonComponent} from "../../../shared/shared-components/menu-button/menu-button.component";

@Component({
  selector: 'app-chat-item',
  imports: [MenuButtonComponent, TranslatePipe],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.css',
})
export class ChatItemComponent {

  @Output() m_sSelectedTab: EventEmitter<string> = new EventEmitter<string>();


  m_aoMenuButtons = [
    {
      title: 'new',
      label: 'WASDAI_NEW_CHAT',
      icon: 'chat_add_on'
    }
  ];
  m_sActiveTab: string = 'projects';

  constructor(private m_oConstantsService: ConstantsService) {
  }

  setActiveTab(sInputTab: string) {
    this.m_sActiveTab = sInputTab;
    this.m_sSelectedTab.emit(this.m_sActiveTab);
  }
}
