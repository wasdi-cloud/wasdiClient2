import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent {
  @Output() m_sSelectedTab: EventEmitter<string> = new EventEmitter<string>();

  m_aoMenuButtons = [
    {
      title: "account",
      label: "Account",
      icon: "person"
    },
    {
      title: "preferences",
      label: "Notification Preferences",
      icon: "notifications_active"
    },
    {
      title: "organisations",
      label: "Organisations",
      icon: "supervisor_account"
    },
    {
      title: "subscriptions",
      label: "Subscriptions",
      icon: "rocket"
    },
    {
      title: "billings",
      label: "Billings",
      icon: "paid"
    },

  ]

  m_aoAdminMenuItems = [
    {
      title: 'users',
      label: 'Manage Users',
      icon: 'passkey'
    },
    {
      title: 'resources',
      label: 'Manage Resources',
      icon: 'category'
    }
  ]
  m_sActiveTab: string = "account";


  setActiveTab(sInputTab: string) {
    this.m_sActiveTab = sInputTab;
    this.m_sSelectedTab.emit(this.m_sActiveTab);
  }
}
