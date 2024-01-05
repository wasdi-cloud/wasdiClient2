import { KeycloakOptions, KeycloakService } from "keycloak-angular"
import { environment } from "src/environments/environment";

export function initializeKeycloak(m_oKeycloak: KeycloakService): () => Promise<boolean> {
    const m_oOptions: KeycloakOptions = {
        config: environment.keycloakJs,
        loadUserProfileAtStartUp: true,
        initOptions: {
            onLoad: "check-sso",
            //onLoad:'login-required', 
            checkLoginIframe: false
        },
        bearerExcludedUrls: []
    };
    return () => m_oKeycloak.init(m_oOptions);
    // return () => {
    //     keycloak.init({
    //         config: {
    //             // url: environment.keycloakJs,
    //             realm: 'wasdi',
    //             clientId: 'wasdi_client',
    //         },
    //         initOptions: {
    //             checkLoginIframe: false
    //         }
    //     })
    // }
}
