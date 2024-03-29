import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpResponse as DefaultResponse } from 'src/app/shared/models/http-response.model';
@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  APIURL: string = this.oConstantsService.getAPIURL();

  //previously m_oOptions - not used anywhere here? 
  m_oHeaders = {
    'Content-Type': undefined
  }

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  sendFeedback(oFeedback: object) {
    return this.oHttp.post<DefaultResponse>(this.APIURL + '/wasdi/feedback', oFeedback);
  }
}
