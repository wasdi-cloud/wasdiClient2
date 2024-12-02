import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root',
})
export class MissionsService {
  APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

  getUserPrivateMissions() {
    return this.m_oHttp.get<any>(this.APIURL + '/auth/privatemissions');
  }
}
