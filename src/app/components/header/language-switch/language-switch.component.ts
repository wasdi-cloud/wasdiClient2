import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-language-switch',
  templateUrl: './language-switch.component.html',
  styleUrls: ['./language-switch.component.css']
})
export class LanguageSwitchComponent {
  faFlag = faFlag
  constructor(public translate: TranslateService) { }

  translateLanguageTo(lang: string) {
    this.translate.use(lang)
  }


}
