import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//Import Modules
import { AppRoutingModule } from './app-routing.module';

//Import Components
import { AppComponent } from './app.component';
import { AdminComponent } from './components/admin/admin.component';
import { EditComponent } from './components/edit/edit.component';
import { HeaderComponent } from './components/header/header.component';
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { PlanComponent } from './components/plan/plan.component';
import { SearchComponent } from './components/search/search.component';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    EditComponent,
    HeaderComponent,
    MarketplaceComponent,
    PlanComponent,
    SearchComponent,
    WorkspacesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
