import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NotificationsQueueService {
  m_aoNotifications: Array<any> = [];
  m_aoNotificationsSubscription: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.m_aoNotifications);
  m_aoNotificationSubscription$ = this.m_aoNotificationsSubscription.asObservable();
  m_bHasNotifications: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }

  setNotifications(oNotification) {
    this.m_aoNotifications.push(oNotification);
    this.m_bHasNotifications.next(true);
    this.m_aoNotificationsSubscription.next(this.m_aoNotifications);
  }

}
