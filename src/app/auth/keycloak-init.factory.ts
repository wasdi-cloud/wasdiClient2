import { KeycloakOptions, KeycloakService } from "keycloak-angular"
import { EnvService } from "../services/env.service";

export function initializeKeycloak(m_oKeycloak: KeycloakService, oEnvService: EnvService): () => Promise<boolean> {
    const m_oOptions: KeycloakOptions = {
        config: {
            url: oEnvService.authUrl.replace('realms/wasdi',''),
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
