import { KeycloakService } from "keycloak-angular"
import { environment } from "src/environments/environment";
import { AuthService } from "../services/auth/auth.service";


export function initializeKeycloak(keycloak: KeycloakService, m_oAuthService: AuthService) {
    let bKeycloakInitialized = false;
    return () => {
        keycloak.init({
            config: {
                url: environment.keycloakJs,
                realm: 'wasdi',
                clientId: 'wasdi_client',
            },
            initOptions: {
                checkLoginIframe: false
            }
        }).then(() => {
            bKeycloakInitialized = true;
        }).catch(() => {
            bKeycloakInitialized = true;
        });
    }
}
