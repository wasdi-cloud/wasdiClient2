import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConstantsService } from './constants.service';
import { latLng, Map, tileLayer, featureGroup } from "leaflet";
import 'node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import * as L from "leaflet";

@Injectable({
  providedIn: 'root'
})
export class MapService implements OnInit {

  constructor(private m_oRouter: Router, private m_oConstantsService: ConstantsService) { }

  APIURL = this.m_oConstantsService.getAPIURL();

  m_oDrawItems = null;

  m_oOSMBasic: any;
  m_oOpenTopoMap: any;
  m_oEsriWorldStreetMap: any;
  m_oEsriWorldImagery: any;
  m_oNASAGIBSViirsEarthAtNight2012: any;

  m_oLayersControl: any;

  m_oWasdiMap: any = null;
  //Actual Base Layer
  m_oActiveBaseLayer: any;

  ngOnInit() {
    //Initalize the tile layer
    this.initTilelayer();
    //Establish layers control 
    this.m_oLayersControl = L.control.layers(
      {
        "Standard": this.m_oOSMBasic,
        "OpenTopoMap": this.m_oOpenTopoMap,
        "EsriWorldStreetMap": this.m_oEsriWorldStreetMap,
        "EsriWorldImagery": this.m_oEsriWorldImagery,
        "NASAGIBSViirsEarthAtNight2012": this.m_oNASAGIBSViirsEarthAtNight2012
      },
      {},
      {
        'position': 'bottomright'
      }
    );
    //Establish actual base layer
    this.m_oActiveBaseLayer = this.m_oOSMBasic;
  }
  /**
   * Get the Map object
   * @returns {null | *}
   */
  getMap() {
    return this.m_oWasdiMap; 
  }

  /**
   * Initalize base layers
   */
  initTilelayer() {
    this.m_oOSMBasic = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18,
      // this map option disables world wrapping. by default, it is false.
      //continuousWorld: false,
      // this option disables loading tiles outside of the world bounds.
      noWrap: true
    });

    this.m_oOpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    this.m_oEsriWorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });

    this.m_oEsriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    this.m_oNASAGIBSViirsEarthAtNight2012 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
      attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
      bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
      minZoom: 1,
      maxZoom: 8,
      //format: 'jpg',
      //time: '',
      //tilematrixset: 'GoogleMapsCompatible_Level'
    });
  }
  /**
   * Initalize WASDI Map
   */
  initWasdiMap(sMapDiv) {
    if (this.m_oWasdiMap !== null) {
      this.initTilelayer();
    }
    this.m_oWasdiMap = this.initMap(sMapDiv);
  }

  /**
   * Init the Map
   * @param sMapDiv 
   */
  initMap(sMapDiv) {
    let oMap = L.map(sMapDiv, {
      keyboard: false,
      layers: [this.m_oOSMBasic],
      zoomControl: false
    })
    //L.control.mousePosition().addTo(oMap);

    //scale control
    L.control.scale({
      position: "bottomright",
      imperial: false
    }).addTo(oMap);

    //layers control
    this.m_oLayersControl.addTo(oMap);

    // center map
    let southWest = L.latLng(0, 0),
      northEast = L.latLng(0, 0),
      oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);

    // var oActiveBaseLayer = this.m_oActiveBaseLayer;

    //add event on base change
    oMap.on('baselayerchange', function (e) {
      // console.log(e);
      //e.layer.bringToBack();
      // oActiveBaseLayer = e;
    });

    return oMap;
  }

  initMapSingleton(sMapDiv) {
    let oOSMBasic = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18,
      // this map option disables world wrapping. by default, it is false.
      //continuousWorld: false,
      // this option disables loading tiles outside of the world bounds.
      //noWrap: true
    });

    let oMap = L.map(sMapDiv, {
      zoomControl: false,
      layers: [oOSMBasic],
      keyboard: false
    });

    // coordinates in map find this plugin in lib folder
    //L.control.mousePosition().addTo(oMap);

    //scale control
    L.control.scale({
      position: "bottomright",
      imperial: false
    }).addTo(oMap);

    //layers control
    let oLayersControl = L.control.layers(
      {
        "Standard": this.m_oOSMBasic,
        "OpenTopoMap": this.m_oOpenTopoMap,
        "EsriWorldStreetMap": this.m_oEsriWorldStreetMap,
        "EsriWorldImagery": this.m_oEsriWorldImagery,
        "NASAGIBSViirsEarthAtNight2012": this.m_oNASAGIBSViirsEarthAtNight2012
      },
      {},
      {
        'position': 'bottomright'
      }
    );
    oLayersControl.addTo(oMap);

    // center map
    var southWest = L.latLng(0, 0),
      northEast = L.latLng(0, 0),
      oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);

    // var oActiveBaseLayer = oOSMBasic;

    //add event on base change
    oMap.on('baselayerchange', function (e) {
      // console.log(e);
      //e.layer.bringToBack();
      // oActiveBaseLayer = e;
    });

    return oMap;
  }

}
