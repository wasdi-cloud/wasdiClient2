import { Injectable } from '@angular/core';
import {ConstantsService} from "../../constants.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
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
   * Chat with the assistant - streams the response chunk by chunk
   * @param sChatId
   * @param sPrompt
   * @returns Observable that emits text chunks as they stream in real-time
   */
  chat(sChatId: string, sPrompt: string): Observable<string> {
    return new Observable(observer => {
      const streamChat = async () => {
        const sUrl = this.APIURL + '/chat?chatId=' + sChatId;
        try {
          // Include session token header (fetch bypasses Angular interceptors)
          const sToken = this.m_oConstantsService.getSessionId();
          const oCookie = this.m_oConstantsService.getCookie('oUser');
          const sessionHeader = !FadeoutUtils.utilsIsStrNullOrEmpty(sToken)
            ? sToken
            : (oCookie && oCookie.sessionId) ? oCookie.sessionId : undefined;

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
          };
          if (sessionHeader) {
            headers['x-session-token'] = sessionHeader;
          }

          const response = await fetch(sUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(sPrompt)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Response body is not readable');
          }

          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = decoder.decode(value, { stream: true });
              // Debug log chunk size and preview
              try { console.debug('[AssistantService] chunk', { len: chunk.length, preview: chunk.slice(0,100) }); } catch (e) {}
              observer.next(chunk);
            }
            try { console.debug('[AssistantService] stream complete'); } catch (e) {}
            observer.complete();
          } finally {
            reader.releaseLock();
          }
        } catch (error) {
          try { console.error('[AssistantService] stream error', error); } catch (e) {}
          observer.error(error);
        }
      };

      streamChat();
    });
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
   * List the chat of a user  chat(sChatId: string, sPrompt: string) {
    let sUrl = this.APIURL + '/chat?chatId=' + sChatId;
    
    // Return an Observable that streams the response as text chunks
    return this.m_oHttp.post(sUrl, sPrompt, { 
      responseType: 'text',
      reportProgress: true
    });
  }
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
