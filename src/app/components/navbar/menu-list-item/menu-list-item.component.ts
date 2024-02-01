import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

declare const bootstrap: any;

@Component({
  selector: 'app-menu-list-item',
  templateUrl: './menu-list-item.component.html',
  styleUrls: ['./menu-list-item.component.css']
})
export class MenuListItemComponent implements OnInit {
  @Input() m_bIsNavbarOpen: boolean = false;

  @Input() m_oMenuItemInfo: any = {};

  @Input() m_sSelectedTab: string = "";

  @Input() m_bEditIsActive: boolean = false;

  /**
   * Input from Menu Item Info - Tooltip, Aria Label, and Inner Text
   */
  m_sMenuItemLabel: string = "";

  /**
   * Input from Menu Item Info - router link
   */
  m_sRouterLink: string = "";

  m_sMaterialIconText: string = "";

  m_sName: string = "";

  m_bIsActive: boolean = false;

  constructor(
    private m_oRouter: Router,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.m_sRouterLink = this.m_oMenuItemInfo.routerLink;
    this.m_sMaterialIconText = this.m_oMenuItemInfo.materialIcon;
    this.m_oTranslate.get(this.m_oMenuItemInfo.label).subscribe(oResponse => {
      this.m_sMenuItemLabel = oResponse
    })

    this.m_sName = this.m_oMenuItemInfo.name;
    // Bootstrap tooltip initialization
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    });
  }

  openDocs(sUrl) {
    window.open(sUrl, "_blank");
  }
}
