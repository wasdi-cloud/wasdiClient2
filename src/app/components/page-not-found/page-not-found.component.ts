import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css'],
  host: { 'class': 'flex-fill' }
})
export class PageNotFoundComponent {

  constructor(private m_oRouter: Router) {}

  marketplaceRedirect() {
    this.m_oRouter.navigateByUrl('/marketplace'); 
  }
}
