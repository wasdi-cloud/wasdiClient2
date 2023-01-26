import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//Import Modules
import { AppRoutingModule } from './app-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

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
import { ConfirmationDialogComponent } from './shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ProductsListComponent } from './components/edit/products-list/products-list.component';

//Angular Materials Imports 
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from '@angular/material/input';

//Workspaces Page Components
import { WorkspaceListItemComponent } from './components/workspaces/workspace-list-item/workspace-list-item.component';

//Import Interceptor
import { SessionInjectorInterceptor } from './services/interceptors/session-injector.interceptor';

//Import Services
import { AuthService } from './services/auth/auth.service';
import { ConstantsService } from './services/constants.service';

import { WorkspacesMapComponent } from './components/workspaces/workspaces-map/workspaces-map.component';
import { LanguageSwitchComponent } from './components/header/language-switch/language-switch.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CourseDialogComponent } from './shared/course-dialog/course-dialog.component';

import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { AppDetailsComponent } from './components/app-details/app-details/app-details.component';
import { AppReviewsComponent } from './components/app-details/app-reviews/app-reviews.component';
import { AppUiComponent } from './components/app-ui/app-ui.component';

//Import custom pipes
import { MarkdownPipe } from './shared/pipes/markdown.pipe';
import { FilterPipe } from './shared/pipes/filter.pipe';

//Import Wap Components
import { WapDateTimePickerComponent } from './components/WAP-components/wap-date-time-picker/wap-date-time-picker.component';
import { WapDirective } from './directives/wap.directive';
import { WapCheckBoxComponent } from './components/WAP-components/wap-check-box/wap-check-box.component';
import { WapDropdownComponent } from './components/WAP-components/wap-dropdown/wap-dropdown.component';
import { WapListBoxComponent } from './components/WAP-components/wap-list-box/wap-list-box.component';
import { WapNumericBoxComponent } from './components/WAP-components/wap-numeric-box/wap-numeric-box.component';
import { WapProductListComponent } from './components/WAP-components/wap-product-list/wap-product-list.component';
import { WapProductsComboComponent } from './components/WAP-components/wap-products-combo/wap-products-combo.component';
import { WapSearchEoImageComponent } from './components/WAP-components/wap-search-eo-image/wap-search-eo-image.component';
import { WapSelectAreaComponent } from './components/WAP-components/wap-select-area/wap-select-area.component';
import { WapSliderComponent } from './components/WAP-components/wap-slider/wap-slider.component';
import { WapTableComponent } from './components/WAP-components/wap-table/wap-table.component';
import { WapTextboxComponent } from './components/WAP-components/wap-textbox/wap-textbox.component';
import { WapTooltipComponent } from './components/WAP-components/wap-tooltip/wap-tooltip.component';
import { WapDisplayComponent } from './components/app-ui/wap-display/wap-display.component';

export function httpTranslateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
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
    MarketplaceAppCardComponent,
    LanguageSwitchComponent,
    CourseDialogComponent,
    ConfirmationDialogComponent,
    ProductsListComponent,
    AppDetailsComponent,
    AppReviewsComponent,
    AppUiComponent,
    MarkdownPipe,
    FilterPipe,
    WapDateTimePickerComponent,
    WapDirective,
    WapCheckBoxComponent,
    WapDropdownComponent,
    WapListBoxComponent,
    WapNumericBoxComponent,
    WapProductListComponent,
    WapProductsComboComponent,
    WapSearchEoImageComponent,
    WapSelectAreaComponent,
    WapSliderComponent,
    WapTableComponent,
    WapTextboxComponent,
    WapTooltipComponent,
    WapDisplayComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    LeafletModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoaderFactory,
        deps: [HttpClient]
      },
    }),
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatTreeModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    CdkTreeModule,
    MatSliderModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  providers: [
    AuthService,
    ConstantsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SessionInjectorInterceptor,
      multi: true
    },
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent],

})
export class AppModule { }
