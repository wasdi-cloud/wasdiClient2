import { Injectable } from '@angular/core';
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  /**
   * Location (as per url) - default to marketplace
   */
  m_sLocation: string = "marketplace"
  m_oLocationSubscription: BehaviorSubject<string> = new BehaviorSubject<string>(this.m_sLocation);
  _m_oLocationSubscription$ = this.m_oLocationSubscription.asObservable();

  m_oSearchFilterSubscription: BehaviorSubject<string> = new BehaviorSubject<string>("");
  _m_oSearchFilterSubscription$ = this.m_oSearchFilterSubscription.asObservable();

  constructor() { }

  /**
   * Get the value of the location variable
   * @returns {string} m_sLocation
   */
  getLocation(): string {
    return this.m_sLocation
  }

  /**
   * Set the location variable
   * @param sNewLocation 
   */
  setLocation(sNewLocation: string): void {
    if (!FadeoutUtils.utilsIsStrNullOrEmpty(sNewLocation)) {
      this.m_sLocation = sNewLocation;
      //Emit new location to subscribed components
      this.m_oLocationSubscription.next(this.m_sLocation);
    }
  }

  /**
   * Get the search filter from the component and emit it from the subscription
   * @param sInput {string}
   */
  getSearchFilter(sInput: string): void {
    this.m_oSearchFilterSubscription.next(sInput);
  }
}
