FROM quay.io/keycloak/keycloak:22.0.5 as builder

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Configure a database vendor
ENV KC_DB=postgres

WORKDIR /opt/keycloak

RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 -dname "CN=keycloak" -alias server -ext "SAN:c=DNS:keycloak,IP:127.0.0.1" -keystore conf/server.keystore
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:22.0.5
COPY --from=builder /opt/keycloak/ /opt/keycloak/
# Copy KC Themes 
# COPY ./themes/ /opt/keycloak/themes
# install custom certificate 
ENV KC_DB_URL=jdbc:postgresql://postgreswasdiclient:5432/keycloak
ENV KC_DB_USERNAME=postgres
ENV KC_DB_PASSWORD=multipass
ENV KC_HOSTNAME=localhost
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=multipass
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

