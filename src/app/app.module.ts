import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//Import Modules
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

//Import Main Components
import { AppComponent } from './app.component';
import { AdminComponent } from './components/admin/admin.component';
import { EditComponent } from './components/edit/edit.component';
import { HeaderComponent } from './components/header/header.component';
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { PlanComponent } from './components/plan/plan.component';
import { SearchComponent } from './components/search/search.component';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';
import { LoginComponent } from './components/login/login.component';

//Workspaces Page Components
import { WorkspaceListItemComponent } from './components/workspaces/workspace-list-item/workspace-list-item.component';

//Import Interceptor
//mport { SessionInjectorInterceptor } from './services/interceptors/session-injector.interceptor';

//Import Services
import { AuthService } from './services/auth.service';
import { ConstantsService } from './services/constants.service';
import { WorkspacesMapComponent } from './components/workspaces/workspaces-map/workspaces-map.component';
import { WorkspacesWorldwindComponent } from './components/workspaces/workspaces-worldwind-map/workspaces-worldwind.component';
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
    WorkspacesMapComponent,
    WorkspacesWorldwindComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule, 
    LeafletModule
  ],
  providers: [
    AuthService,
    ConstantsService
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: SessionInjectorInterceptor,
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
