import { Injectable } from '@angular/core';

//Service Imports
import { ConstantsService } from './constants.service';
import { NotificationDisplayService } from './notification-display.service';
import { ProcessWorkspaceService } from './api/process-workspace.service';

//Rabbit Connection State Model Import:
import { RabbitConnectionState } from '../shared/models/RabbitConnectionState';

//RxJS Import: 
import { BehaviorSubject } from 'rxjs';

//Utilities Import:
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';

// Declare SockJS and Stomp
declare var SockJS;
declare var Stomp;

@Injectable({
  providedIn: 'root'
})
export class RabbitStompService {

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService) { 
    }

  /**
   * Web Socket object
   */
  m_oWebSocket = null;

  /**
   * Flag to know if we are reconnecting to rabbit (!= null) or not (=null)
   */
  m_oReconnectTimerFlag = null;

  /**
   * Counter of the rabbit reconnection attemps
   */
  m_iRabbitReconnectAttemptCount = 0;

  /**
   * STOMP Client
   */
  m_oClient = null;

  /**
   *  Rabbit Connect Callback
   */
  m_oOn_Connected = null;
  
  /**
   * Rabbit Error Callback
   */
  m_oOn_Error = null;

  /**
   * Rabbit Reconnect Callback
   */
  m_oRabbitReconnect = null;

  /**
   * Subscription to the queue
   */
  m_oSubscription = null;

  /**
   * Actual WASDI User
   */
  m_oUser = null;

  /**
   * Callback for the received message event
   */
  m_fMessageCallBack = null;

  /**
   * Array of one-shots message hooks
   * Each hook is represented by an object that has
   * .A string representing the message type
   * .A callback to be executed once the message is received.
   * 
   * The hooks are "one-shot": once executed they are deleted from the list
   */
  m_afMessageHooks = [];

  /**
   * Key of the Code Member of a Message Hook
   */
  m_sHookMessageCode = "CODE";
  /**
   * Key of the Callback Member of a Message Hook
   */
  m_sHookFunction = "HOOK";
  /**
   * Key of the Controller Member of a Message Hook
   */
  m_sHookController = "CONTROLLER";
  /**
   * Key of the call once flag of a Message Hook
   */
  m_sCallOnce = "CALL_ONCE";

  /**
   * Reference to the controller active in this moment
   */
  m_oActiveController = null;

  /**
   * Actual Workspace Id
   */
  m_sWorkspaceId = "";

  /**
   * Connection state. Can be 
   * Init = 0,
   * Connected = 1,
   * Lost = 2
   * Used in the client to show the status of the asynch communication channel
   */
  m_iConnectionState = new BehaviorSubject<number>(RabbitConnectionState.Init);
  _m_iConnectionState$ = this.m_iConnectionState.asObservable();


  /**
   * Use defer/promise to keep trace when service is ready to perform any operation
   */
  m_oServiceReadyDeferred = null;
  m_oServiceReadyPromise = null;

  waitServiceIsReady() {
    if (this.m_oServiceReadyPromise == null) {
      this.m_oServiceReadyPromise = this.m_oServiceReadyDeferred;
    }
    return this.m_oServiceReadyPromise;
  }

  setMessageCallback(fCallback: any) {
    this.m_fMessageCallBack = fCallback;
  }

  setActiveController(oController) {
    this.m_oActiveController = oController;
  }

  /**
   * Adds a Message Hook to a message type.
   * The hook will be executed once when a message of the specified type is received.
   */
  addMessageHook(sMessageType: string, oController, fCallback, bCallOnce?: boolean) {
    let oHook = {};
    oHook[this.m_sHookMessageCode] = sMessageType;
    oHook[this.m_sHookController] = oController;
    oHook[this.m_sHookFunction] = fCallback;
    oHook[this.m_sCallOnce] = bCallOnce;

    this.m_afMessageHooks.push(oHook);

    // Return the index in the array where our hook has been stored
    return this.m_afMessageHooks.length - 1;
  }

  /**
   * Removes a Message Hook from the service list
   * @param {Integer} iHookIndex 
   */
  removeMessageHook = function (iHookIndex) {
    if (iHookIndex < this.m_afMessageHooks.length) {
      this.m_afMessageHooks.splice(iHookIndex, 1);
    }
  }

  isSubscrbed = function () {
    return !FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sWorkspaceId);
  }

  notifyConnectionStateChange(iConnectionState: number) {
    return this.m_iConnectionState.next(iConnectionState);
  }

  getConnectionState() {
    return this._m_iConnectionState$;
  }

  isReadyState() {
    return (((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oWebSocket) === false) && (this.m_oWebSocket.readyState === WebSocket.OPEN)) ? true : false);
  }

  /**
   * Subscribe the client to a queue in Rabbit.
   * Each workspace is a queue.
   * 
   * @param sWorkspaceId Workspace Id = Queue Id
   */
  subscribe(sWorkspaceId) {

    //this.unsubscribe();

    this.m_sWorkspaceId = sWorkspaceId;

    let sSubscriptionString = "/exchange/amq.topic/" + sWorkspaceId;
    console.log("RabbitStompService: subscribing to " + sSubscriptionString);
    let oThisService = this;

    try {
      this.m_oSubscription = this.m_oClient.subscribe(sSubscriptionString, function (oMessage) {

        // THIS IS the function executed when we receive a message

        // Check message Body
        if (oMessage.body) {
          console.log("RabbitStompService: got message with body " + oMessage.body)

          // Get The Message View Model
          let oMessageResult = JSON.parse(oMessage.body);

          // Check parsed object
          if (oMessageResult == null) {
            console.log("RabbitStompService: there was an error parsing result in JSON. Message lost")
          }

          // Get the Active Workspace Id
          let sActiveWorkspaceId = "";

          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oThisService.m_oConstantsService.getActiveWorkspace())) {
            sActiveWorkspaceId = oThisService.m_oConstantsService.getActiveWorkspace().workspaceId;
          }
          else {
            console.log("RabbitStompService: Active Workspace is null.")
          }

          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oThisService.m_afMessageHooks)) {
            if (oThisService.m_afMessageHooks.length > 0) {
              for (let iHooks = oThisService.m_afMessageHooks.length - 1; iHooks >= 0; iHooks--) {

                if (oThisService.m_afMessageHooks[iHooks][oThisService.m_sHookMessageCode] === oMessageResult.messageCode) {
                  let fCallbackFunction = oThisService.m_afMessageHooks[iHooks][oThisService.m_sHookFunction]
                  fCallbackFunction(oMessageResult, oThisService.m_afMessageHooks[iHooks][oThisService.m_sHookController]);

                  if (oThisService.m_afMessageHooks[iHooks][oThisService.m_sCallOnce]) {
                    oThisService.m_afMessageHooks.splice(iHooks, 1);
                  }
                }
              }
            }
          }

          //Reject the message if it is for another workspace
          if (oMessageResult.workspaceId != sActiveWorkspaceId) {
            return;
          }

          // Check if the callback is hooked
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oThisService.m_fMessageCallBack)) {
            // Call the Message Callback
            oThisService.m_fMessageCallBack(oMessageResult, oThisService.m_oActiveController);
          }

          // Update the process List
          oThisService.m_oProcessWorkspaceService.loadProcessesFromServer(sActiveWorkspaceId);
        }
      });
    }
    catch (e) {
      console.log("RabbitStompService: Exception subscribing to " + sWorkspaceId);
    }
  };

  unsubscribe() {
    if (this.m_oSubscription) {
      this.m_sWorkspaceId = "";
      this.m_oSubscription.unsubscribe();
    }
  };

  initWebStomp() {

    console.log("RabbitStompService: called initWebStomp");

    /**
     * Reference to the service class
     */
    let m_oThisReference = this;
    this.m_oServiceReadyDeferred = new Promise(() => { });

    // Web Socket to receive workspace messages
    let oWebSocket = new WebSocket(this.m_oConstantsService.getStompUrl());

    this.m_oClient = Stomp.over(oWebSocket);
    this.m_oClient.heartbeat.outgoing = 20000;
    this.m_oClient.heartbeat.incoming = 20000;
    this.m_oClient.debug = null;

    /**
     * Callback of the Rabbit On Connect event
     */
    let on_connected = function () {
      console.log('RabbitStompService.on_connect: Web Stomp connected');
      
      // We are connected to the server!!
      m_oThisReference.notifyConnectionStateChange(RabbitConnectionState.Connected);
      // For sure we can clean this counter (but will be cleaned also in case of "first" error)
      m_oThisReference.m_iRabbitReconnectAttemptCount = 0;

      //Check if the session is valid
      let oSessionId = m_oThisReference.m_oConstantsService.getSessionId();

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oSessionId)) {
        // Well no-user no-rabbit
        console.log("RabbitStompService.on_connect: Error session id Null in on_connect");
        return false;
      }

      // Is this callback called from re-connection or is the real first connection?
      if (m_oThisReference.m_oReconnectTimerFlag != null) {
        // It was a reconnection, because we have a value of m_oReconnectTimerPromise

        // Clear the timer flag
        m_oThisReference.m_oReconnectTimerFlag = null;

        // Do we have also an open workspace?
        if (m_oThisReference.m_sWorkspaceId !== "") {
          // Yes, so we need also to re-subscribe the queue of this workspace
          m_oThisReference.subscribe(m_oThisReference.m_sWorkspaceId);
        }
      }

      return true;
    };


    /**
     * Callback for the Rabbit On Error
     */
    let on_error = function (sMessage) {

      // Message can be a string or an object: here we get the string in a safe way
      if (!(typeof sMessage === 'string' || sMessage instanceof String)) {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(sMessage.body)) {
          sMessage = sMessage.body;
        }
        else {
          return;
        }
      }

      // Is this a lost connection Message?
      if (sMessage == "LOST_CONNECTION" || sMessage.includes("Whoops! Lost connection to")) {
        // Log
        console.log('RabbitStompService.on_error: Web Socket Connection Lost');
        // Change the status of the connection, so that we can change the icon for our users
        m_oThisReference.notifyConnectionStateChange(RabbitConnectionState.Lost);

        // Is this the first consecutive error we receive?
        if (m_oThisReference.m_oReconnectTimerFlag == null) {
          // Yes, it is
          // Restart our Reconnection counter to zero
          m_oThisReference.m_iRabbitReconnectAttemptCount = 0;
        }
          // P.Campanella 16/10/2023: call set Timeout to run rabbit_reconnect once in 5 secs. And keep the return code
          // That we will use to understand if this is the first attemp or not
          m_oThisReference.m_oReconnectTimerFlag = setTimeout(m_oThisReference.m_oRabbitReconnect, 5000);
      }
    };

    // Keep local reference to the callbacks to use it in the reconnection callback
    this.m_oOn_Connected = on_connected;
    this.m_oOn_Error = on_error;
    this.m_oWebSocket = oWebSocket;

    /**
     * Call back for rabbit reconnection
     */
    let rabbit_reconnect = function () {
      // Increase the count of attemps
      m_oThisReference.m_iRabbitReconnectAttemptCount++;
      console.log('RabbitStompService: Web Stomp Reconnection Attempt (' + m_oThisReference.m_iRabbitReconnectAttemptCount + ')');

      // Connect again
      m_oThisReference.m_oWebSocket = new WebSocket(m_oThisReference.m_oConstantsService.getStompUrl());
      //_this.oWebSocket = new SockJS(_this.m_oConstantsService.getStompUrl());
      m_oThisReference.m_oClient = Stomp.over(m_oThisReference.m_oWebSocket);
      m_oThisReference.m_oClient.heartbeat.outgoing = 20000;
      m_oThisReference.m_oClient.heartbeat.incoming = 20000;
      m_oThisReference.m_oClient.debug = null;

      // Call connect: one of m_oOn_Connected or m_oOn_Error function will be called
      m_oThisReference.m_oClient.connect(m_oThisReference.m_oConstantsService.getRabbitUser(), m_oThisReference.m_oConstantsService.getRabbitPassword(), m_oThisReference.m_oOn_Connected, m_oThisReference.m_oOn_Error, '/');
    };

    // Save the reference to the rabbit_reconnect callback, we will reuse it in case of errors
    this.m_oRabbitReconnect = rabbit_reconnect;

    // Connect to the rabbit server
    this.m_oClient.connect(m_oThisReference.m_oConstantsService.getRabbitUser(), m_oThisReference.m_oConstantsService.getRabbitPassword(), on_connected, on_error, '/');

    return true;
  };

  /**
   * Handler of the "Publish" message
   * @param oMessage 
   */
  receivedPublishMessage(oMessage: any) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMessage)) {
      return false;
    }

    if (oMessage.messageResult === "KO") {
      let sMessage = "ERROR PUBLISHING";
      return false;
    }
    return true;
  }

  /**
   * Handler of the "PUBLISHBAND" message
   * @param oMessage
   */
  receivedPublishBandMessage(oMessage) {
    let oPublishedBand = oMessage.payload;


    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oPublishedBand)) {
      console.log("EditorController.receivedPublishBandMessage: Error Published band is empty...");
      return false;
    }

    //OLD CODE: TREE NODE and Publish band -> Publish band exectued in "Product List Component"
    return true;
  }

}
