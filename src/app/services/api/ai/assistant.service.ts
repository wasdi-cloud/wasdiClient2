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
   * Returns the explicit WASDI session header value used by the assistant backend.
   * This is required because the assistant service is served by a separate backend
   * that authenticates legacy WASDI sessions through x-session-token.
   */
  private getSessionHeaderValue(): string | undefined {
    const sToken = this.m_oConstantsService.getSessionId();
    const oCookie = this.m_oConstantsService.getCookie('oUser');

    return !FadeoutUtils.utilsIsStrNullOrEmpty(sToken)
      ? sToken
      : (oCookie && oCookie.sessionId) ? oCookie.sessionId : undefined;
  }

  /**
   * Build headers for the assistant backend including the explicit session token.
   */
  private getAssistantHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      ...extraHeaders
    };

    const sSessionHeader = this.getSessionHeaderValue();
    if (sSessionHeader) {
      headers['x-session-token'] = sSessionHeader;
    }

    return headers;
  }


  /**
   * Chat with the assistant - streams the response chunk by chunk
   * @param sChatId
   * @param sPrompt
   * @param sModel
   * @returns  Observable that emits text chunks as they stream in real-time
   */
  chat(sChatId: string, sPrompt: string, sModel: string = "mistral-small-latest"): Observable<string> {
    return new Observable(observer => {
      const streamChat = async () => {
        let sUrl = this.APIURL + '/chat?chatId=' + sChatId;

        if (sModel) {
          sUrl += '&model=' + encodeURIComponent(sModel);
        }

        try {
          // MCP/LLM server uses x-session-token (not OAuth/JWT)
          // fetch bypasses Angular interceptors, so we add the header explicitly here
          const headers = this.getAssistantHeaders({
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
          });

          const oResponse = await fetch(sUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(sPrompt)
          });

          if (!oResponse.ok) {
            throw new Error(`HTTP error! status: ${oResponse.status}`);
          }

          const oReader = oResponse.body?.getReader();
          if (!oReader) {
            throw new Error('Response body is not readable');
          }

          const oDecoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await oReader.read();
              if (done) break;
              
              const chunk = oDecoder.decode(value, { stream: true });
              // Debug log chunk size and preview
              try { console.debug('[AssistantService] chunk', { len: chunk.length, preview: chunk.slice(0,100) }); } catch (e) {}
              observer.next(chunk);
            }
            try { console.debug('[AssistantService] stream complete'); } catch (e) {}
            observer.complete();
          } finally {
            oReader.releaseLock();
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
    return this.m_oHttp.get(sUrl, {
      headers: this.getAssistantHeaders()
    });
  }

   /**
   * List the chat of a user
   * @returns
   */
  listChat() {
    let sUrl = this.APIURL + '/listChat';
    return this.m_oHttp.get(sUrl, {
      headers: this.getAssistantHeaders()
    });
  }
  
   /**
   * Get a chat by ID
   * @param sChatId The ID of the chat to retrieve
   * @returns
   */
  getChat(sChatId: string) {
    let sUrl = this.APIURL + '/getChat?chatId=' + sChatId;
    return this.m_oHttp.get(sUrl, {
      headers: this.getAssistantHeaders()
    });
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
    return this.m_oHttp.get(this.APIURL + '/hello', {
      headers: this.getAssistantHeaders(),
      responseType: "text"
    });
  }

  /**
   * Wrap legacy WASDI session token with "wasdi-" prefix.
   * Used for Authorization header format: "Bearer wasdi-<sessionId>"
   * 
   * @param sToken Session token
   * @returns Wrapped token or original if already wrapped
   */
  private wrapLegacyToken(sToken: string): string {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sToken)) {
      return sToken;
    }

    // If already wrapped with "wasdi-", return as-is
    if (sToken.startsWith('wasdi-')) {
      return sToken;
    }

    // If it looks like a JWT (has 2 dots), return as-is (Phase 2)
    const iDotCount = (sToken.match(/\./g) || []).length;
    if (iDotCount === 2) {
      return sToken;
    }

    // Otherwise, it's a legacy token - wrap it
    return 'wasdi-' + sToken;
  }

}
