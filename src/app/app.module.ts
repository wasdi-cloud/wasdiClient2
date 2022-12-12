import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//Import Modules
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

//Import Main Components
import { AppComponent } from './app.component';
import { AdminComponent } from './components/admin/admin.component';
import { EditComponent } from './components/edit/edit.component';
import { HeaderComponent } from './components/header/header.component';
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { MarketplaceAppCardComponent } from './components/marketplace/marketplace-app-card/marketplace-app-card.component';
import { PlanComponent } from './components/plan/plan.component';
import { SearchComponent } from './components/search/search.component';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';
import { LoginComponent } from './components/login/login.component';

//Workspaces Page Components
import { WorkspaceListItemComponent } from './components/workspaces/workspace-list-item/workspace-list-item.component';

//Import Interceptor
import { SessionInjectorInterceptor } from './services/interceptors/session-injector.interceptor';

//Import Services
import { AuthService } from './services/auth.service';
import { ConstantsService } from './services/constants.service';
@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    EditComponent,
    HeaderComponent,
    MarketplaceComponent,
    PlanComponent,
    SearchComponent,
    WorkspacesComponent,
    LoginComponent,
    WorkspaceListItemComponent,
    MarketplaceAppCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    AuthService,
    ConstantsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SessionInjectorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
