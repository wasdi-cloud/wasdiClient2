import { Injectable } from '@angular/core';

declare const window: {
  __env: any;
};

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  private _env: any;

  constructor() { 
    // Initialize _env. We check if window is defined (for SSR compatibility, though not strictly needed here)
    // and if window.__env exists. If not, default to an empty object to prevent errors.
    this._env = typeof window !== 'undefined' && window.__env ? window.__env : {};
  }

  get production(): boolean {
    return this._env.production === 'false' ? false : true;
  }

  get url(): string {
    return this._env.url || 'https://www.wasdi.net/wasdiwebserver/';
  }

  get webstompUrl(): string { 
    return this._env.webstompUrl || 'wss://main01.wasdi.net/rabbit-stomp/ws';
  } 

  get wmsUrl(): string {
    return this._env.wmsUrl || 'https://www.wasdi.net/geoserver/ows?';
  }

  get authUrl(): string {
    return this._env.authUrl || 'https://www.wasdi.net/auth/realms/wasdi';
  }

  get keycloakJs(): string {
    return this._env.keycloakJs || 'https://www.wasdi.net/auth/js/keycloak.js';
  }

  get baseurl(): string {
    return this._env.baseurl || 'https://www.wasdi.net/';
  }

  get CESIUM_BASE_URL(): string {
    return this._env.CESIUM_BASE_URL || 'https://www.wasdi.net/assets/cesium/';
  }

  get cesiumToken(): string {
    return this._env.cesiumToken || "";
  }

  get rabbitUser(): string {
    return this._env.RABBIT_USER || "wasdi";
  }

  get rabbitPassword(): string {
    return this._env.RABBIT_PASSWORD || "wasdi";
  }   
}
