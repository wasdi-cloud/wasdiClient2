import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  host: { 'class': 'flex-fill' }
})
export class AdminComponent {
  m_sActiveTab: string = 'account';

  getActiveTab(sEvent: string) {
    this.m_sActiveTab = sEvent;
  }
}
