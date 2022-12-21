import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{

  sActiveWorkspaceId: string = "";
  constructor(public oConstantsService: ConstantsService, public oRouter: Router, public translate: TranslateService) {
    //Register translation languages:
    translate.addLangs(['en', 'fr', 'it', 'de', 'vi', 'id', 'ro'])

    translate.setDefaultLang('en')
  }

  

  ngOnInit(): void {
      this.sActiveWorkspaceId = this.oConstantsService.getActiveWorkspace().workspaceId; 
  }
  logout() {
    this.oConstantsService.logOut();
    this.oRouter.navigateByUrl("login")
    console.log(document.cookie);
  }

}
