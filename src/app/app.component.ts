import { Component, OnInit } from '@angular/core';
import { RabbitStompService } from './services/rabbit-stomp.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'client';
  m_bIsRabbitConnected
  constructor(private m_oRabbitStompService: RabbitStompService) {

  }

  ngOnInit() {
    this.m_oRabbitStompService.initWebStomp();
    this.updateConnectionState("meow");
  }

  updateConnectionState(forceNotification) {
    if(forceNotification === null || forceNotification === undefined) {
      forceNotification = false; 
    }
    let connectionState = this.m_oRabbitStompService.getConnectionState();
    // if(connectionState == 1) {
    //     this.m_bIsRabbitConnected = true;
    // }
    // else
    // {
    //     this.m_bIsRabbitConnected = false;
    // }
  }
}
