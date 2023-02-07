import { Component } from "@angular/core";
import { latLng, Map, tileLayer, featureGroup } from "leaflet";
import 'node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import * as L from "leaflet";

@Component({
  selector: 'app-workspaces-map',
  templateUrl: './workspaces-map.component.html',
  styleUrls: ['./workspaces-map.component.css']
})
export class WorkspacesMapComponent {
  map: Map;

  drawnItems: L.FeatureGroup = featureGroup();

  options = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ],
    zoom: 15,
    center: latLng(8.524139, 76.936638),
    edit: {
      featureGroup: this.drawnItems
    }
  };

  drawOptions: any = {
    position: 'topright',
    draw: {
      marker: {
        icon: L.icon({
          iconSize: [25, 41],
          iconAnchor: [13, 41],
          iconUrl: 'assets/marker-icon.png',
          shadowUrl: 'assets/marker-shadow.png'
        })
      },
      rectangle: { showArea: false },
      polygon: false,
      circlemarker: false
    }
  };

  onDrawCreated(e: any) {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const polygonCoordinates = layer._latlngs;
      console.log(polygonCoordinates);
    }
    console.log(layerType)
    this.drawnItems.addLayer(e.layer);
  }
}
