import { KeycloakOptions, KeycloakService } from "keycloak-angular"
import { environment } from "src/environments/environment";

export function initializeKeycloak(m_oKeycloak: KeycloakService): () => Promise<boolean> {
    const m_oOptions: KeycloakOptions = {
        config: {
            url: environment.authUrl.replace('realms/wasdi',''),
            realm: 'wasdi',
            clientId: 'wasdi_client',
        },
        loadUserProfileAtStartUp: true,
        initOptions: {
            //onLoad: "check-sso",
            //onLoad:'login-required', 
            checkLoginIframe: false
        },
        bearerExcludedUrls: []
    };
    return () => m_oKeycloak.init(m_oOptions);
}
