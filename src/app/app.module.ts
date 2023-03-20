import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//Import Modules
import { AppRoutingModule } from './app-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
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
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ConfirmationDialogComponent } from './shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from './shared/dialogs/error-dialog/error-dialog.component';
import { ProductsListComponent } from './components/edit/products-list/products-list.component';
import { EditToolbarComponent } from './components/edit/edit-toolbar/edit-toolbar.component';
import { PlanMapComponent } from './components/plan/plan-map/plan-map.component';
import { EditMapComponent } from './components/edit/edit-map/edit-map.component';
import { ProcessesBarComponent, ProcessesBarContent, ProcessesDialog } from './components/edit/processes-bar/processes-bar.component';
import { UserSettingsDialogComponent } from './components/header/header-dialogs/user-settings-dialog/user-settings-dialog.component';
import { ProductPropertiesDialogComponent } from './components/edit/products-list/product-properties-dialog/product-properties-dialog.component';
import { NavLayersComponent } from './components/edit/nav-layers/nav-layers.component';
import { WorkspaceInfoDialogComponent } from './components/edit/workspace-info-dialog/workspace-info-dialog.component';
import { ShareDialogComponent } from './shared/dialogs/share-dialog/share-dialog.component';

//Angular Materials Imports 
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatTooltipModule } from '@angular/material/tooltip'

//Import FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

//Workspaces Page Components
import { WorkspaceListItemComponent } from './components/workspaces/workspace-list-item/workspace-list-item.component';

//Import Interceptor
import { SessionInjectorInterceptor } from './services/interceptors/session-injector.interceptor';

//Import Services
import { AuthService } from './services/auth/auth.service';
import { ConstantsService } from './services/constants.service';

import { WorkspacesMapComponent } from './components/workspaces/workspaces-map/workspaces-map.component';

import { WorkspacesWorldwindComponent } from './components/workspaces/workspaces-worldwind-map/workspaces-worldwind.component';

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
    WorkspacesWorldwindComponent,
    MarketplaceAppCardComponent,
    LanguageSwitchComponent,
    CourseDialogComponent,
    ConfirmationDialogComponent,
    ErrorDialogComponent,
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
    WapDisplayComponent,
    EditToolbarComponent,
    PlanMapComponent,
    EditMapComponent,
    ProcessesBarComponent,
    ProcessesBarContent,
    ProcessesDialog, 
    PageNotFoundComponent, 
    UserSettingsDialogComponent, 
    ProductPropertiesDialogComponent, 
    NavLayersComponent, 
    WorkspaceInfoDialogComponent, 
    ShareDialogComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    LeafletModule,
    LeafletDrawModule,
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
    MatSliderModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatBottomSheetModule,
    MatTooltipModule,
    FontAwesomeModule,
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
    JwtHelperService,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent, ProcessesBarContent],

})
export class AppModule { }
