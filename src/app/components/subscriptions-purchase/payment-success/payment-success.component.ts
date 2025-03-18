import { Component } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
  host: { 'class': 'flex-fill' }
})
export class PaymentSuccessComponent {


  constructor(
    private m_oRouter:Router
  ) {
  }

  marketplaceRedirect() {
    this.m_oRouter.navigateByUrl('/marketplace');
  }
}
