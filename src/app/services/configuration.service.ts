import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  m_oSearchConfiguration: any = null;

  constructor(
    private m_oHttp: HttpClient
  ) { }

  loadConfiguration() {
    return firstValueFrom(this.m_oHttp.get('/assets/appconfig.json').pipe(map(config => { 
      this.m_oSearchConfiguration = config; 
    })));
  }

  getConfiguration() {
    return this.m_oSearchConfiguration;
  }
}