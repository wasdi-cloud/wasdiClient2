import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-plan-tree',
  templateUrl: './plan-tree.component.html',
  styleUrls: ['./plan-tree.component.css']
})
export class PlanTreeComponent {
  @Input() m_oSatellite: any = null;
  @Output() m_oProductSelection: EventEmitter<any> = new EventEmitter();

  m_bIsOpen: boolean = false;
  m_bIsOpenChild: boolean = false;
  m_bShowChildren: boolean = false;

  m_oOpenParent: any = null;

  openSatelliteSensors() {
    this.m_bIsOpen = !this.m_bIsOpen;
  }

  openSensorModes(oSensor) {
    this.m_bIsOpenChild = !this.m_bIsOpenChild
    this.m_oOpenParent = oSensor;
  }
}
