import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  m_oSearchConfiguration: any = null;

  constructor(
    private m_oHttp: HttpClient,
    private m_oAuthService: AuthService
  ) { }

  loadConfiguration() {

    if (this.m_oSearchConfiguration!=null) return;

    this.m_oAuthService.getClientConfig().subscribe(oResponse => {
      if (oResponse) {
        this.m_oSearchConfiguration = oResponse;
      }
      else {
        console.log("ERROR GETTING APP CONFFIG");
      }
    });  
  }
  
  getConfiguration() {
    return this.m_oSearchConfiguration;
  }
}