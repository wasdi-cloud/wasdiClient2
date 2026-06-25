import { Injectable } from '@angular/core';
import {ConstantsService} from "../../constants.service";
import { HttpClient } from "@angular/common/http";
import FadeoutUtils from "../../../lib/utils/FadeoutJSUtils";

@Injectable({
  providedIn: 'root'
})
export class AssistantService {

  private APIURL: string = this.m_oConstantsService.getAssistantURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient) 
  {

    // Check if the URL ends with a slash, and if so, slice it off
    if (this.APIURL && this.APIURL.endsWith('/')) {
      this.APIURL = this.APIURL.slice(0, -1);
    }
  }


  /**
   * Chat with the assistant
   * @param sChatId
   * @param sPrompt
   * @returns
   */
  chat(sChatId: string, sPrompt: string) {
    let sUrl = this.APIURL + '/chat?chatId=' + sChatId;
    return this.m_oHttp.post(sUrl, sPrompt);
  }


   /**
   * Create a new chat
   * @returns
   */
  newChat() {
    let sUrl = this.APIURL + '/newChat';
    return this.m_oHttp.get(sUrl);
  }

   /**
   * List the chat of a user
   * @returns
   */
  listChat() {
    let sUrl = this.APIURL + '/listChat';
    return this.m_oHttp.get(sUrl);
  }
  
   /**
   * Get a chat by ID
   * @param sChatId The ID of the chat to retrieve
   * @returns
   */
  getChat(sChatId: string) {
    let sUrl = this.APIURL + '/getChat?chatId=' + sChatId;
    return this.m_oHttp.get(sUrl);
  }  

  /**
   * Get an attachment file
   * @param sCollection
   * @param sFolder
   * @param sName
   * @param sToken
   * @returns
   */
  hello() {
    return this.m_oHttp.get(this.APIURL + '/hello' , { responseType: "text"});
  }

}
