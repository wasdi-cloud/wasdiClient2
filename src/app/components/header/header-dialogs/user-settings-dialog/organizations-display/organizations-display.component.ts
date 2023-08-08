import { Component, OnInit } from '@angular/core';
import { faInfoCircle, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { OrganizationsService } from 'src/app/services/api/organizations.service';

@Component({
  selector: 'app-organizations-display',
  templateUrl: './organizations-display.component.html',
  styleUrls: ['./organizations-display.component.css']
})
export class OrganizationsDisplayComponent implements OnInit {
  faPlus = faPlus;
  faInfo = faInfoCircle; 
  faX = faX;

  m_aoOrganizations: Array<any> = []; 

  constructor(private m_oOrganizationsService: OrganizationsService) { }

  ngOnInit(): void {
      this.getUserOrganizations();
  }

  openNewOrganizationDialog() { }

  getUserOrganizations() {
    this.m_oOrganizationsService.getOrganizationsListByUser().subscribe({
      next: oResponse => {
        console.log(oResponse);
        if(FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoOrganizations = oResponse;
        }
      }, 
      error: oError => {}
    })
  }
}
