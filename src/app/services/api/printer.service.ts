import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ConstantsService} from "../constants.service";

@Injectable({
  providedIn: 'root'
})
export class PrinterService {
  // APIURL: string = this.m_oConstantsService.getAPIURL();
  APIURL: string = "https://test.wasdi.net/wasdiwebserver/rest/";
  constructor(
    private m_oHttp:HttpClient,
    private m_oConstantsService:ConstantsService,

  ) { }

  storeMap(oPrinterViewModel: any) {
    return this.m_oHttp.post(this.APIURL + 'print/storemap', oPrinterViewModel,{responseType:'text' as 'text'});
  }
  printMap(sUUID: any):Observable<Blob> {
    const sUrl=this.APIURL+`print?uuid=${encodeURIComponent(sUUID)}`;
    return this.m_oHttp.get(sUrl,{responseType:'blob' as 'blob'});
  }
}
