import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Import Components
import { AdminComponent } from './components/admin/admin.component';
import { EditComponent } from './components/edit/edit.component';
import { LoginComponent } from './components/login/login.component';
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { PlanComponent } from './components/plan/plan.component';
import { SearchComponent } from './components/search/search.component';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';

//import auth guard
import { AuthGuard } from './services/auth/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: 'marketplace', pathMatch: 'full'},
  { path: 'login', component: LoginComponent},
  { path: 'admin', component: AdminComponent },
  { path: 'edit/:workspaceId', component: EditComponent, canActivate: [AuthGuard] },
  { path: 'marketplace', component: MarketplaceComponent, canActivate: [AuthGuard] },
  { path: 'plan', component: PlanComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
  { path: 'workspaces', component: WorkspacesComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
