import { Injectable } from '@angular/core';
import { Band } from '../shared/models/band.model';
import { ConstantsService } from './constants.service';

@Injectable({
  providedIn: 'root'
})
export class GlobeService {
  m_oWasdiGlobe: any = null;
  m_aoLayers: any[] = null;
  LONG_HOME: number = 0;
  LAT_HOME: number = 0;
  HEIGHT_HOME: number = 20000000; //zoom
  GLOBE_LAYER_ZOOM: number = 2000000;
  GLOBE_WORKSPACE_ZOOM: number = 4000000;

  constructor(private m_oConstantsService: ConstantsService) { }

}
