import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import { ProcessWorkspaceService } from './api/process-workspace.service';
import { RabbitConnectionState } from '../shared/models/RabbitConnectionState';
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';
import { myRxStompConfig } from '../my-rx-stomp.config';
// Declare SockJS and Stomp
declare var SockJS;
declare var Stomp;
@Injectable({
  providedIn: 'root'
})
export class RabbitStompService {

  constructor(private m_oConstantsService: ConstantsService, private m_oProcessWorkspaceService: ProcessWorkspaceService) { }

  // Translate.m_oTranslate = oTranslate;

  m_oWebSocket = null;
  m_oReconnectTimerPromise = null;
  m_oRabbitReconnectAttemptCount = 0;

  // STOMP Client
  m_oClient = null;
  // Rabbit Connect Callback
  m_oOn_Connect = null;
  // Rabbit Error Callback
  m_oOn_Error = null;
  // Rabbit Reconnect Callback
  m_oRabbitReconnect = null;

  m_oSubscription = null;
  m_oUser = null;

  m_aoErrorsList = [];

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

  m_oActiveController = null;

  m_sWorkspaceId = "";


  // Use defer/promise to keep trace when service is ready to perform any operation
  m_oServiceReadyDeferred = null;
  m_oServiceReadyPromise = null;

  waitServiceIsReady() {
    if (this.m_oServiceReadyPromise == null) {
      this.m_oServiceReadyPromise = this.m_oServiceReadyDeferred;
    }
    return this.m_oServiceReadyPromise;
  }

  setMessageCallback(fCallback) {
    this.m_fMessageCallBack = fCallback;
  }

  setActiveController(oController) {
    this.m_oActiveController = oController;
  }

  // addMessageHook(sMessageType, oController, fCallback) {
  //   return this.addMessageHook(sMessageType, this.m_oConstantsService, fCallback, false);
  // }

  /**
   * Adds a Message Hook to a message type.
   * The hook will be executed once when a message of the specified type is received.
   */
  addMessageHook(sMessageType: string, oController, fCallback, bCallOnce: boolean) {
    let oHook = {};
    oHook[this.m_sHookMessageCode] = sMessageType;
    oHook[this.m_sHookController] = oController;
    oHook[this.m_sHookFunction] = fCallback;
    oHook[this.m_sCallOnce] = bCallOnce;

    this.m_afMessageHooks.push(oHook);

    console.log(this.m_afMessageHooks)

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

  notifyConnectionStateChange = function (connectionState) {
    this.m_iConnectionState = connectionState;
    //let msgHlp = MessageHelper.getInstance($rootScope);
    //msgHlp.notifyRabbitConnectionStateChange(connectionState);
  }

  isReadyState() {
    return (((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oWebSocket) === false) && (this.m_oWebSocket.readyState === WebSocket.OPEN)) ? true : false);
  }

  subscribe(workspaceId) {

    this.unsubscribe();

    this.m_sWorkspaceId = workspaceId;

    let subscriptionString = "/exchange/amq.topic/" + workspaceId;
    console.log("RabbitStompService: subscribing to " + subscriptionString);
    let oThisService = this;

    try {
      this.m_oSubscription = this.m_oClient.subscribe(subscriptionString, function (message) {

        // Check message Body
        if (message.body) {
          console.log("RabbitStompService: got message with body " + message.body)

          // Get The Message View Model
          let oMessageResult = JSON.parse(message.body);

          // Check parsed object
          if (oMessageResult == null) {
            console.log("RabbitStompService: there was an error parsing result in JSON. Message lost")
            //return;
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
          // if (oMessageResult.workspaceId != sActiveWorkspaceId) return false;

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
      console.log("RabbitStompService: Exception subscribing to " + workspaceId);
    }
  };

  unsubscribe() {
    if (this.m_oSubscription) {
      this.m_sWorkspaceId = "";
      this.m_oSubscription.unsubscribe();
    }
  };

  getConnectionState() {
    //return this.m_iConnectionState;
  }


  initWebStomp() {
    let _this = this;

    this.m_oServiceReadyDeferred = new Promise(() => {});

    // Web Socket to receive workspace messages
    let oWebSocket = new WebSocket(this.m_oConstantsService.getStompUrl());
    //let oWebSocket = new WebSocket(this.m_oConstantsService.getStompUrl());
    this.m_oClient = Stomp.over(oWebSocket);
    this.m_oClient.heartbeat.outgoing = 20000;
    this.m_oClient.heartbeat.incoming = 20000;
    this.m_oClient.debug = null;

    /**
     * Callback of the Rabbit On Connect
     */
    let on_connect = function () {
      console.log('RabbitStompService: Web Stomp connected');

      //_this.notifyConnectionStateChange(RabbitConnectionState.Connected);
      _this.m_oRabbitReconnectAttemptCount = 0;

      //CHECK IF the session is valid
      let oSessionId = _this.m_oConstantsService.getSessionId();

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oSessionId)) {
        console.log("RabbitStompService: Error session id Null in on_connect");
        return false;
      }

      //_this.m_oServiceReadyDeferred.resolve(true);

      // Is this a re-connection?
      if (_this.m_oReconnectTimerPromise != null) {

        // Yes it is: clear the timer
        //_this.m_oInterval.cancel(_this.m_oReconnectTimerPromise);
        _this.m_oReconnectTimerPromise = null;

        if (_this.m_sWorkspaceId !== "") {
          _this.subscribe(_this.m_sWorkspaceId);
        }
      }
      return true;
    };


    /**
     * Callback for the Rabbit On Error
     */
    let on_error = function (sMessage) {

      console.log('RabbitStompService: WEB STOMP ERROR, message:' + sMessage + ' [' + FadeoutUtils.utilsGetTimeStamp() + ']');

      if (!(typeof sMessage === 'string' || sMessage instanceof String)) {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(sMessage.body)) {
          sMessage = sMessage.body;
        }
        else {
          return;
        }
      }

      if (sMessage == "LOST_CONNECTION" || sMessage.includes("Whoops! Lost connection to")) {
        console.log('RabbitStompService: Web Socket Connection Lost');

        //_this.notifyConnectionStateChange(RabbitConnectionState.Lost);

        if (_this.m_oReconnectTimerPromise == null) {
          // Try to Reconnect
          _this.m_oRabbitReconnectAttemptCount = 0;
          //_this.m_oReconnectTimerPromise = _this.m_oInterval(_this.m_oRabbitReconnect, 5000);
        }
      }
    };

    // Keep local reference to the callbacks to use it in the reconnection callback
    this.m_oOn_Connect = on_connect;
    this.m_oOn_Error = on_error;
    this.m_oWebSocket = oWebSocket;
    //Call back for rabbit reconnection
    let rabbit_reconnect = function () {

      _this.m_oRabbitReconnectAttemptCount++;
      console.log('RabbitStompService: Web Stomp Reconnection Attempt (' + _this.m_oRabbitReconnectAttemptCount + ')');

      // Connect again
      _this.m_oWebSocket = new WebSocket(_this.m_oConstantsService.getStompUrl());
      // _this.oWebSocket = new SockJS(_this.m_oConstantsService.getStompUrl());
      _this.m_oClient = Stomp.over(_this.m_oWebSocket);
      _this.m_oClient.heartbeat.outgoing = 20000;
      _this.m_oClient.heartbeat.incoming = 20000;
      _this.m_oClient.debug = null;

      _this.m_oClient.connect(_this.m_oConstantsService.getRabbitUser(), _this.m_oConstantsService.getRabbitPassword(), _this.m_oOn_Connect, _this.m_oOn_Error, '/');
    };

    this.m_oRabbitReconnect = rabbit_reconnect;
    //connect to the queue
    this.m_oClient.connect(_this.m_oConstantsService.getRabbitUser(), _this.m_oConstantsService.getRabbitPassword(), on_connect, on_error, '/');

    return true;
  };


}
