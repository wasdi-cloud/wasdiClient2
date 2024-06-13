import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Import Components
import { AdminComponent } from './components/admin/admin.component';
import { AppDetailsComponent } from './components/app-details/app-details/app-details.component';
import { AppUiComponent } from './components/app-ui/app-ui.component';
import { EditComponent } from './components/edit/edit.component';
import { LoginComponent } from './components/login/login.component';
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SearchOrbit } from './components/plan/search-orbit.component';
import { SearchComponent } from './components/search/search.component';
import { SubscriptionsPurchaseComponent } from './components/subscriptions-purchase/subscriptions-purchase.component';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';

//import auth guard
import { AuthGuard } from './auth/auth.guard';
import { IsSignedInGuard } from './auth/is-signed-in.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [IsSignedInGuard] },
  { path: 'login&iss', component: MarketplaceComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: AdminComponent },
  { path: 'edit/:workspaceId', component: EditComponent, canActivate: [AuthGuard] },
  { path: 'marketplace', component: MarketplaceComponent, canActivate: [AuthGuard] },
  { path: 'plan', component: SearchOrbit, canActivate: [AuthGuard] },
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
  { path: 'subscriptions', component: SubscriptionsPurchaseComponent, canActivate: [AuthGuard] },
  { path: 'workspaces', component: WorkspacesComponent, canActivate: [AuthGuard] },
  { path: ':processorName/appDetails', component: AppDetailsComponent, canActivate: [AuthGuard] },
  { path: ':processorName/appui', component: AppUiComponent, canActivate: [AuthGuard] },

  //wild card route for 404 request
  { path: '**', pathMatch: 'full', component: PageNotFoundComponent, canActivate: [AuthGuard] }
]
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
