import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NotificationsQueueService {
  m_aoNotifications: Array<any> = [];
  m_aoNotificationsSubscription: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.m_aoNotifications);
  m_aoNotificationSubscription$ = this.m_aoNotificationsSubscription.asObservable();
  m_bHasNotifications: boolean = false;

  constructor() { }

  getNotifications() {
   
  }

  setNotifications(oNotification) {
    this.m_aoNotifications.push(oNotification);
    console.log(this.m_aoNotifications);
    this.m_bHasNotifications = true;

    this.m_aoNotificationsSubscription.next(this.m_aoNotifications);
  }


}
