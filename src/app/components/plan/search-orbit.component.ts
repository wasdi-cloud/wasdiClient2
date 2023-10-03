import { Component, OnInit } from '@angular/core';

//Service Imports:
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProductService } from 'src/app/services/api/product.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

@Component({
  selector: 'app-search-orbit',
  templateUrl: './search-orbit.component.html',
  styleUrls: ['./search-orbit.component.css']
})
export class SearchOrbit implements OnInit {

  constructor(
    private m_oAuthService: AuthService, 
    private m_oConstantsService: ConstantsService, 
   // private m_oConfigurationService: ConfigurationService,
   // private m_oOpportunitySeachService: OpportunitySearchService,
   private m_oProcessWorkspaceService: ProcessWorkspaceService,
   private m_oProductService: ProductService,
   private m_oRabbitService: RabbitStompService,
   private m_oTranslate: TranslateService,
   private m_oWorkspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
      
  }
}
