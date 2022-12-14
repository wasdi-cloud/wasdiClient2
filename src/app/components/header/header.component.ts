import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(public translate: TranslateService) {
    //Register translation languages:
    translate.addLangs(['en', 'fr', 'it', 'de', 'vi', 'id', 'ro'])

    translate.setDefaultLang('en')
  }


}
