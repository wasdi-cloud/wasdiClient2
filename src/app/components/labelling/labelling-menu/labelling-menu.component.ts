import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ConstantsService} from "../../../services/constants.service";
import {TranslatePipe} from "@ngx-translate/core";
import {MenuButtonComponent} from "../../../shared/shared-components/menu-button/menu-button.component";
import {LabellingProjectsStateService} from "../../../services/api/labelling/labelling-projects-state.service";

@Component({
  selector: 'app-labelling-menu',
  templateUrl: './labelling-menu.component.html',
  styleUrl: './labelling-menu.component.css',
  standalone: false,
})
export class LabellingMenuComponent {
  @Output() m_sSelectedTab: EventEmitter<string> = new EventEmitter<string>();

  @Input() m_sActiveTab: string = 'projects';
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


  constructor(private m_oConstantsService: ConstantsService,public m_oProjectState: LabellingProjectsStateService) {
  }

  setActiveTab(sInputTab: string) {
    if (this.isDisabled(sInputTab)) {
      return;
    }
    this.m_sActiveTab = sInputTab;
    this.m_sSelectedTab.emit(this.m_sActiveTab);
  }

  // --- ADD THIS HELPER ---
  isDisabled(sTitle: string): boolean {
    return sTitle === 'labels' && !this.m_oProjectState.m_sActiveWorkspaceProjectId;
  }
}
