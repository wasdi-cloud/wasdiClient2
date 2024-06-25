import { Component, EventEmitter, Output } from '@angular/core';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent {
  @Output() m_sSelectedTab: EventEmitter<string> = new EventEmitter<string>();

  m_bIsAdmin: boolean = false;

  m_aoMenuButtons = [
    {
      title: "account",
      label: "ADMIN_MENU_ACCOUNT",
      icon: "person"
    },
    // {
    //   title: "preferences",
    //   label: "ADMIN_MENU_PREF",
    //   icon: "notifications_active"
    // },
    {
      title: "organisations",
      label: "ADMIN_MENU_ORGANIZATIONS",
      icon: "supervisor_account"
    },
    {
      title: "subscriptions",
      label: "ADMIN_MENU_SUBSCRIPTIONS",
      icon: "rocket"
    },
    {
      title: "billings",
      label: "ADMIN_MENU_BILLINGS",
      icon: "paid"
    },

  ]

  m_aoAdminMenuItems = [
    {
      title: 'users',
      label: 'ADMIN_MENU_USERS',
      icon: 'passkey'
    },
    {
      title: 'resources',
      label: 'ADMIN_MENU_SUBSCRIPTIONS',
      icon: 'category'
    },
    {
      title: 'sharing',
      label: 'ADMIN_MENU_SHARINGS',
      icon: 'send'
    },
    {
      title: 'nodes',
      label: 'ADMIN_MENU_NODES',
      icon: 'network_node'
    }
  ]
  m_sActiveTab: string = "account";


  constructor(private m_oConstantsService: ConstantsService) {
    if (this.m_oConstantsService.getUser().role === 'ADMIN') {
      this.m_bIsAdmin = true;
    }
  }


  setActiveTab(sInputTab: string) {
    this.m_sActiveTab = sInputTab;
    this.m_sSelectedTab.emit(this.m_sActiveTab);
  }
}
