import {Component, EventEmitter, Output} from '@angular/core';
import {ConstantsService} from "../../../services/constants.service";
import {TranslatePipe} from "@ngx-translate/core";
import {MenuButtonComponent} from "../../../shared/shared-components/menu-button/menu-button.component";

@Component({
  selector: 'app-labelling-menu',
  templateUrl: './labelling-menu.component.html',
  styleUrl: './labelling-menu.component.css',
  standalone: false,
})
export class LabellingMenuComponent {
  @Output() m_sSelectedTab: EventEmitter<string> = new EventEmitter<string>();


  m_aoMenuButtons = [
    {
      title: 'projects',
      label: 'LABELLING_MENU_PROJECTS',
      icon: 'person',
    },
    {
      title: 'templates',
      label: 'LABELLING_MENU_TEMPLATES',
      icon: 'supervisor_account',
    },
    {
      title: 'labels',
      label: 'LABELLING_MENU_LABELS',
      icon: 'rocket',
    },
  ];
  m_sActiveTab: string = 'projects';

  constructor(private m_oConstantsService: ConstantsService) {
  }

  setActiveTab(sInputTab: string) {
    this.m_sActiveTab = sInputTab;
    this.m_sSelectedTab.emit(this.m_sActiveTab);
  }
}
