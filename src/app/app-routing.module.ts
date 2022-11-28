import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Import Components
import { AdminComponent } from './components/admin/admin.component';
import { EditComponent } from './components/edit/edit.component';
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { PlanComponent } from './components/plan/plan.component';
import { SearchComponent } from './components/search/search.component';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';

const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: 'edit', component: EditComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'plan', component: PlanComponent },
  { path: 'search', component: SearchComponent },
  { path: 'workspaces', component: WorkspacesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
