import { Component, OnInit } from '@angular/core';

//Service Imports:
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { OpportunitySearchService } from 'src/app/services/api/opportunity-search.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProductService } from 'src/app/services/api/product.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';



@Component({
  selector: 'app-search-orbit',
  templateUrl: './search-orbit.component.html',
  styleUrls: ['./search-orbit.component.css']
})
export class SearchOrbit implements OnInit {

  m_aoSatelliteResources: Array<any> = [];
  treeControl: NestedTreeControl<any>;
  dataSource: MatTreeNestedDataSource<any>;

  constructor(
    private m_oAlertDialog: AlertDialogTopService,
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    // private m_oConfigurationService: ConfigurationService,
    private m_oOpportunitySearchService: OpportunitySearchService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oProductService: ProductService,
    private m_oRabbitService: RabbitStompService,
    private m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService
  ) { }

  ngOnInit(): void {
    this.getSatellitesResources();
   
  }

  getSatellitesResources() {
    let sMessage = this.m_oTranslate.instant("MSG_ORBIT_ERROR2");

    this.m_oOpportunitySearchService.getSatellitesResources().subscribe({
      next: oResponse => {
        console.log(oResponse)
        if (oResponse.length > 0) {
          this.m_aoSatelliteResources = oResponse;
        } else {
          this.m_oAlertDialog.openDialog(4000, sMessage);
        }
      },
      error: oError => { 
        this.m_oAlertDialog.openDialog(4000, sMessage);
      }
    });
  }
}
