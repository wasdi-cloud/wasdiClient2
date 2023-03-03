import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { faLanguage } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-language-switch',
  templateUrl: './language-switch.component.html',
  styleUrls: ['./language-switch.component.css']
})
export class LanguageSwitchComponent {
  faLanguage = faLanguage
  constructor(public translate: TranslateService) { }

  translateLanguageTo(lang: string) {
    this.translate.use(lang)
  }


}
