import { Component, OnInit } from '@angular/core';
import { RabbitStompService } from './services/rabbit-stomp.service';
import { ConstantsService } from './services/constants.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'client';
  m_bIsRabbitConnected;

  constructor(
    public m_oConstantsService: ConstantsService,
    private m_oRabbitStompService: RabbitStompService) {
  }

  ngOnInit() {
    this.m_oRabbitStompService.initWebStomp();
    this.updateConnectionState("");
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
