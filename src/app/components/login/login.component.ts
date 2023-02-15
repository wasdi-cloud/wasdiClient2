import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/models/user.model';

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
    this.oAuthService.legacyLogin(oLoginInfo).subscribe((response => {
      this.callbackLogin(response, this)
      console.log(this.oConstantsService.getSessionId())
    }))
  }

  callbackLogin(data: User, oController: this) {
    if (!oController) {
      oController = this;
    }
    if (data.hasOwnProperty("sessionId") && data.sessionId == null) {
      //REPLACE THIS WITH DIALOG 
      console.log("Login Error");
      return
    }
    if (data.hasOwnProperty("sessionId")) {
      let oUser = {} as User;
      oUser.userId = data.userId;
      oUser.authProvider = 'wasdi';
      oUser.name = data.name;
      oUser.surname = data.surname;
      oUser.sessionId = data.sessionId;
      oUser.role = data.role;
      oUser.type = data.type;
      oUser.grantedAuthorities = data.grantedAuthorities;

      //set user and cookie
      this.oConstantsService.setUser(oUser);
      this.router.navigateByUrl('/marketplace');
      this.oAuthService.saveToken(data.sessionId);
    }
  }
}
