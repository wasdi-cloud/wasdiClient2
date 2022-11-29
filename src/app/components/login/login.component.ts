import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit { 
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn: boolean = false;
  isLoginFailed: boolean = false;

  errorMessage: string = '';
  constructor(private oConstantsService: ConstantsService, private oAuthService: AuthService, private router: Router) {

  }

  ngOnInit(): void {
      
  }
  login(): void {
    const { username, password } = this.form;
    let oLoginInfo = {
      userId: this.form.username, 
      userPassword: this.form.password
    }
    this.oConstantsService.setUser({} as User);
    this.oAuthService.legacyLogin(oLoginInfo).subscribe(Response => {
      this.callbackLogin(Response, this)
    })
    console.log(username); 
  }

  callbackLogin(data: User, oController: this) {
    if(!oController) {
      oController = this; 
    }
    if('sessionId' in data) {
      let oUser = {} as User;
      oUser.userId = data.userId; 
      oUser.authProvider = 'wasdi'; 
      oUser.name = data.name;
      oUser.surname = data.surname; 
      oUser.sessionId = data.sessionId; 
      oUser.role = data.role; 
      oUser.type = data.type; 
      oUser.grantedAuthorities = data.grantedAuthorities; 
      
      this.oConstantsService.setUser(oUser); 

      this.router.navigate(['marketplace'])
      
      console.log(this.oConstantsService.getUser())
    }
  }
}
