import { Component, OnInit } from '@angular/core';
import { RabbitStompService } from './services/rabbit-stomp.service';
import { ConstantsService } from './services/constants.service';
import { NavigationEnd, Router } from '@angular/router';
import { config } from 'ace-builds';
import { AuthService } from './auth/service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  m_bIsRabbitConnected: boolean = false;
  m_oRouterEvents: any;
  m_sLocation: string;
  m_oActiveWorkspace: any

  constructor(
    public m_oAuthService: AuthService,
    public m_oConstantsService: ConstantsService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oRouter: Router) {
  }

  ngOnInit() {
    this.m_oRabbitStompService.initWebStomp();
    this.updateConnectionState("");

    config.set('basePath', '../../../../node_modules/ace-builds/src-min-noconflict')

    this.m_oConstantsService.m_oActiveWorkspaceSubscription.subscribe(oResponse => {
      this.m_oActiveWorkspace = oResponse;
    });
    this.m_oRouterEvents = this.m_oRouter.events.subscribe((oEvent: any) => {
      if (oEvent instanceof NavigationEnd) {
        if (oEvent.url.includes('edit')) {
          this.setActiveLocation('edit');
        } else {
          this.setActiveLocation(oEvent.url.slice(1));
        }
      }
    });
  }

  setActiveLocation(sInputString) {
    this.m_sLocation = sInputString
  }

  updateConnectionState(forceNotification) {
    if (forceNotification === null || forceNotification === undefined) {
      forceNotification = false;
    }
    this.m_oRabbitStompService.getConnectionState().subscribe(iConnectionState => {
      if (iConnectionState == 1) {
        this.m_bIsRabbitConnected = true;
      }
      else {
        this.m_bIsRabbitConnected = false;
      }
    });
  }
}
