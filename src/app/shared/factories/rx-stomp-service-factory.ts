import { myRxStompConfig } from "src/app/my-rx-stomp.config";
import { RxStompService } from "src/app/services/rx-stomp.service";

export function rxStompServiceFactory() {
    const rxStomp = new RxStompService();
    rxStomp.configure(myRxStompConfig);
    rxStomp.activate();
    return rxStomp;
}
