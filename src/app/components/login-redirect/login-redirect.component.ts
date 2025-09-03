import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-redirect',
  template: ''
})
export class LoginRedirectComponent implements OnInit {

  constructor(private m_oRouter: Router) { }

  ngOnInit(): void {

    const sHost = window.location.hostname;
    if (sHost.startsWith('coplac') || sHost.startsWith('wasdi.cimh')) {
      this.m_oRouter.navigate(['/login-coplac']);
    } else {
      this.m_oRouter.navigate(['/login']);
    }
    
  }

}
