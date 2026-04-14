
# WASDI Client 2.0

This is the WASDI client, an Angular 21 application for the WASDI platform.

## What is WASDI?
WASDI (Web Advanced Space Data Infrastructure) is an earth observation platform designed to create and run satellite-based applications in different programming languages. It enables users to process, analyze, and visualize satellite data efficiently.

- Main WASDI repository (server, launcher, scheduler, webserver, libraries): [https://github.com/fadeoutsoftware/WASDI](https://github.com/fadeoutsoftware/WASDI)
- Official documentation: [https://wasdi.readthedocs.io/en/latest/](https://wasdi.readthedocs.io/en/latest/)


## About this Client
This is the WASDI Client 2.0, built with Angular version 21. The client interacts with the WASDI web server to provide a user-friendly interface for:

- **Marketplace**: Browse and launch available satellite data processing applications, each with its own user interface.
- **Workspaces**: Manage and explore your workspaces, where you can organize and access your data, results, and processing history.
- **Plan**: Find new satellite acquisitions for your area of interest and time window.
- **Search**: Search satellite catalogues for available data.
- **Edit**: When you open a workspace, you enter the editor where you can view files, run apps, execute SNAP workflows, publish files, and more.
- **Setting**: Manage your account and application settings.

## Technical Details

WASDI Client uses:
- **Leaflet** for 2D map visualization
- **Cesium** for 3D globe visualization
- **RabbitMQ/STOMP** for asynchronous communication with the server
- **Keycloak** for authentication by default (can also use an internal users table or have authentication disabled; see [WASDI config docs](https://wasdi.readthedocs.io/en/latest/))

### Configuration
Configuration is managed in `src/assets/environment.js`. This file can be initialized with a script during Docker image build, or set with hardcoded values for local development or non-container deployments.

Example configuration variables:

```
window.__env.url = 'http://127.0.0.1:8080/wasdiwebserver/'; // API BASE URL
window.__env.webstompUrl = 'wss://127.0.0.1:8080/rabbit-stomp/ws'; // RABBIT
window.__env.wmsUrl = 'https://127.0.0.1:8080/geoserver/ows?'; // WMS SERVER (Geoserver)
window.__env.authUrl = 'https://127.0.0.1:8080/auth/realms/wasdi'; // KEYCLOAK
window.__env.keycloakJs = 'https://127.0.0.1:8080/auth/js/keycloak.js'; // KEYCLOAK JS
window.__env.baseurl = 'https://127.0.0.1:8080/'; // BASE URL
window.__env.RABBIT_USER = "";
window.__env.RABBIT_PASSWORD = "";
window.__env.CESIUM_BASE_URL = "https://127.0.0.1:8080/assets/cesium/";
window.__env.cesiumToken = "";
```

## API Services
In `src/app/services/api/` you will find an Angular service for each WASDI endpoint. The `services` folder also contains services for the globe, map, Ace editor, and other utilities.

## Development

### Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Further help
To get more help on the Angular CLI use `ng help` or check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
