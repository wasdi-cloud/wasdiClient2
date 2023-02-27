import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConstantsService } from 'src/app/services/constants.service';
import { Workspace } from 'src/app/shared/models/workspace.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  sActiveWorkspaceId: string | null = null;
  sActiveRoute: string;
  m_bEditIsActive: boolean; 
  m_oActiveWorkspace: Workspace
  constructor(private oActivatedRoute: ActivatedRoute, public oConstantsService: ConstantsService, public oRouter: Router, public translate: TranslateService) {
    //Register translation languages:
    translate.addLangs(['en', 'es', 'fr', 'it', 'de', 'vi', 'id', 'ro']);
    translate.setDefaultLang('en');
    this.sActiveWorkspaceId = this.oConstantsService.getActiveWorkspace().workspaceId;
    this.m_oActiveWorkspace = this.oConstantsService.getActiveWorkspace()
  }

  ngOnInit(): void {
    if (this.oActivatedRoute.snapshot.url[0].path === 'edit') {
      this.m_bEditIsActive = true; 
    } else {
      this.m_bEditIsActive = false;
    }

  }

  logout() {
    this.oConstantsService.logOut();
    this.oRouter.navigateByUrl("login");
  }

}
