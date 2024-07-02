import { NgModule, APP_INITIALIZER } from '@angular/core';
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
import { SearchOrbit } from './components/plan/search-orbit.component';
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
import { ProcessesBarComponent } from './components/edit/processes-bar/processes-bar.component';
import { ProductPropertiesDialogComponent } from './components/edit/products-list/product-properties-dialog/product-properties-dialog.component';
import { NavLayersComponent } from './components/edit/nav-layers/nav-layers.component';
import { WorkspaceInfoDialogComponent } from './components/edit/workspace-info-dialog/workspace-info-dialog.component';
import { ShareDialogComponent } from './shared/dialogs/share-dialog/share-dialog.component';

//Components
import { CardComponent } from './components/marketplace/card/card.component';

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
import { MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar'

//Import Interceptor
import { SessionInjectorInterceptor } from './services/interceptors/session-injector.interceptor';

//Import Services
import { AuthService } from './auth/service/auth.service';
import { ConstantsService } from './services/constants.service';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
import { WapProductsComboComponent } from './components/WAP-components/wap-products-combo/wap-products-combo.component';
import { WapSearchEoImageComponent } from './components/WAP-components/wap-search-eo-image/wap-search-eo-image.component';
import { WapSelectAreaComponent } from './components/WAP-components/wap-select-area/wap-select-area.component';
import { WapSliderComponent } from './components/WAP-components/wap-slider/wap-slider.component';
import { WapTableComponent } from './components/WAP-components/wap-table/wap-table.component';
import { WapTextboxComponent } from './components/WAP-components/wap-textbox/wap-textbox.component';
import { WapDisplayComponent } from './components/app-ui/wap-display/wap-display.component';
import { ShareUiComponent } from './shared/dialogs/share-dialog/share-ui/share-ui.component';
import { StylesDialogComponent } from './components/edit/edit-toolbar/toolbar-dialogs/styles-dialog/styles-dialog.component';
import { NewWorkspaceDialogComponent } from './components/workspaces/new-workspace-dialog/new-workspace-dialog.component';
import { PayloadDialogComponent } from './components/edit/payload-dialog/payload-dialog.component';
import { AppsDialogComponent } from './components/edit/edit-toolbar/toolbar-dialogs/apps-dialog/apps-dialog.component';
import { ParamsLibraryDialogComponent } from './components/edit/edit-toolbar/toolbar-dialogs/apps-dialog/params-library-dialog/params-library-dialog.component';
import { NewAppDialogComponent } from './components/edit/edit-toolbar/toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import { ProcessorTabContentComponent } from './components/edit/edit-toolbar/toolbar-dialogs/new-app-dialog/processor-tab-content/processor-tab-content.component';
import { WorkflowsDialogComponent } from './components/edit/edit-toolbar/toolbar-dialogs/workflows-dialog/workflows-dialog.component';



import { ClipboardModule } from '@angular/cdk/clipboard';
import { ProcessLogsDialogComponent } from './components/edit/process-logs-dialog/process-logs-dialog.component';
import { ImportDialogComponent } from './components/edit/edit-toolbar/toolbar-dialogs/import-dialog/import-dialog.component';
import { RabbitStompService } from './services/rabbit-stomp.service';
import { ProcessorTabUiComponent } from './components/edit/edit-toolbar/toolbar-dialogs/new-app-dialog/processor-tab-ui/processor-tab-ui.component';
import { ProcessorTabStoreComponent } from './components/edit/edit-toolbar/toolbar-dialogs/new-app-dialog/processor-tab-store/processor-tab-store.component';
import { SubscriptionsDisplayComponent } from './components/admin/subscriptions-display/subscriptions-display.component';
import { OrganizationsDisplayComponent } from './components/admin/organizations-display/organizations-display.component';
import { EmailPreferencesDisplayComponent } from './components/admin/email-preferences-display/email-preferences-display.component';
import { SubscriptionProjectsDialogComponent } from './dialogs/subscription-projects-dialog/subscription-projects-dialog.component';
import { EditSubscriptionDialogComponent } from './dialogs/edit-subscription-dialog/edit-subscription-dialog.component';
import { ProjectInfoDialogComponent } from './dialogs/project-info-dialog/project-info-dialog.component';
import { SubscriptionsPurchaseComponent } from './components/subscriptions-purchase/subscriptions-purchase.component';
import { PackageManagerComponent } from './dialogs/package-manager/package-manager.component';
import { SearchOrbitResourcesComponent } from './components/plan/search-orbit-resources/search-orbit-resources.component';
import { SearchMapComponent } from './components/search/search-map/search-map.component';
import { SearchFiltersComponent } from './components/search/search-filters/search-filters.component';
import { ConfigurationService } from './services/configuration.service';
import { ProductsTableComponent } from './components/search/products-table/products-table.component';
import { WorkspacesListDialogComponent } from './components/search/workspaces-list-dialog/workspaces-list-dialog.component';
import { ProductInfoComponent } from './components/search/product-info/product-info.component';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SearchOrbitResultsComponent } from './components/plan/search-orbit-results/search-orbit-results.component';
import { FTPDialogComponent } from './components/edit/ftp-dialog/ftp-dialog.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SearchBtnGrpComponent } from './shared/shared-components/search-btn-grp/search-btn-grp.component';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';
import { DragAndDropComponent } from './shared/drag-and-drop/drag-and-drop.component';
import { NotificationSnackbarComponent } from './shared/dialogs/notification-snackbar/notification-snackbar.component';
import { ConvertMsToTimePipe } from './shared/pipes/convert-ms-to-time.pipe';

import { initializeKeycloak } from './auth/keycloak-init.factory';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular'
import { ManualBoundingBoxComponent } from './shared/shared-components/manual-bounding-box/manual-bounding-box.component';
import { MarketplaceFiltersComponent } from './components/marketplace/marketplace-filters/marketplace-filters.component';
import { MenuListItemComponent } from './components/navbar/menu-list-item/menu-list-item.component';
import { ButtonComponent } from './shared/shared-components/button/button.component';
import { TableCellComponent } from './shared/shared-components/table-cell/table-cell.component';
import { ProgressBarComponent } from './shared/shared-components/progress-bar/progress-bar.component';
import { ProductListItemComponent } from './components/edit/products-list/product-list-item/product-list-item.component';
import { DropdownComponent } from './shared/shared-components/dropdown/dropdown.component';
import { InputFieldComponent } from './shared/shared-components/input-field/input-field.component';
import { ChipComponent } from './shared/shared-components/chip/chip.component';
import { ListItemComponent } from './shared/shared-components/list-item/list-item.component';
import { WorkspacesMenuComponent } from './components/workspaces/workspaces-menu/workspaces-menu.component';
import { TextareaComponent } from './shared/shared-components/textarea/textarea.component';
import { AppUiMenuComponent } from './components/app-ui/app-ui-menu/app-ui-menu.component';
import { SliderComponent } from './shared/shared-components/slider/slider.component';
import { InvaderComponent } from '../assets/invader/invader.component';
import { TabComponent } from './shared/shared-components/tab/tab.component';
import { AutocompleteComponent } from './shared/shared-components/autocomplete/autocomplete.component';
import { DurationPipe } from './shared/pipes/duration.pipe';
import { ReviewInputComponent } from './components/app-details/app-reviews/review-input/review-input.component';
import { ReviewComponent } from './components/app-details/app-reviews/review/review.component';
import { PlanTreeComponent } from './components/plan/plan-tree/plan-tree.component';
import { ProcessorTabPricingComponent } from './components/edit/edit-toolbar/toolbar-dialogs/new-app-dialog/processor-tab-pricing/processor-tab-pricing.component';
import { JsonEditorComponent } from './shared/json-editor/json-editor.component';
import { ProcessesBarTableComponent } from './components/edit/processes-bar/processes-bar-table/processes-bar-table.component';
import { AdminMenuComponent } from './components/admin/admin-menu/admin-menu.component';
import { MenuButtonComponent } from './shared/shared-components/menu-button/menu-button.component';
import { UserAccountComponent } from './components/admin/user-account/user-account.component';
import { ManageUsersComponent } from './components/admin/manage-users/manage-users.component';
import { ManageNodesComponent } from './components/admin/manage-nodes/manage-nodes.component';
import { ManageSubscriptionsComponent } from './components/admin/manage-subscriptions/manage-subscriptions.component';
import { ManageSharingComponent } from './components/admin/manage-sharing/manage-sharing.component';
import { FeedbackDialogComponent } from './components/header/feedback-dialog/feedback-dialog.component';
import { ConvertBytesToHigherUnitPipe } from './shared/pipes/convert-bytes-to-higher-unit.pipe';
import { CdkContextMenuTrigger, CdkMenuTrigger, CdkMenuItem, CdkMenu } from '@angular/cdk/menu';
import { PaginatorComponent } from './shared/shared-components/paginator/paginator.component';
import { SaveParamsDialogComponent } from './dialogs/save-params-dialog/save-params-dialog.component';
import { MetadataAttributesDialogComponent } from './components/edit/products-list/metadata-attributes-dialog/metadata-attributes-dialog.component';

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
    SearchOrbit,
    SearchComponent,
    WorkspacesComponent,
    LoginComponent,
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
    WapProductsComboComponent,
    WapSearchEoImageComponent,
    WapSelectAreaComponent,
    WapSliderComponent,
    WapTableComponent,
    WapTextboxComponent,
    WapDisplayComponent,
    EditToolbarComponent,
    PlanMapComponent,
    EditMapComponent,
    PageNotFoundComponent,
    ProductPropertiesDialogComponent,
    NavLayersComponent,
    WorkspaceInfoDialogComponent,
    ShareDialogComponent,
    ShareUiComponent,
    StylesDialogComponent,
    NewWorkspaceDialogComponent,
    PayloadDialogComponent,
    ProcessLogsDialogComponent,
    ImportDialogComponent,
    AppsDialogComponent,
    ParamsLibraryDialogComponent,
    NewAppDialogComponent,
    ProcessorTabContentComponent,
    ProcessorTabUiComponent,
    ProcessorTabStoreComponent,
    WorkflowsDialogComponent,
    SubscriptionsDisplayComponent,
    OrganizationsDisplayComponent,
    EmailPreferencesDisplayComponent,
    SubscriptionProjectsDialogComponent,
    EditSubscriptionDialogComponent,
    ProjectInfoDialogComponent,
    SubscriptionsPurchaseComponent,
    PackageManagerComponent,
    SearchOrbitResourcesComponent,
    SearchMapComponent,
    SearchFiltersComponent,
    ProductsTableComponent,
    WorkspacesListDialogComponent,
    ProductInfoComponent,
    SearchOrbitResultsComponent,
    FTPDialogComponent,
    NavbarComponent,
    SearchBtnGrpComponent,
    DragAndDropDirective,
    DragAndDropComponent,
    NotificationSnackbarComponent,
    ConvertMsToTimePipe,
    ManualBoundingBoxComponent,
    CardComponent,
    MarketplaceFiltersComponent,
    MenuListItemComponent,
    ButtonComponent,
    TableCellComponent,
    ProgressBarComponent,
    ProductListItemComponent,
    DropdownComponent,
    InputFieldComponent,
    ChipComponent,
    ListItemComponent,
    WorkspacesMenuComponent,
    TextareaComponent,
    AppUiMenuComponent,
    SliderComponent,
    InvaderComponent,
    TabComponent,
    AutocompleteComponent,
    DurationPipe,
    ReviewInputComponent,
    ReviewComponent,
    PlanTreeComponent,
    ProcessorTabPricingComponent,
    JsonEditorComponent,
    ProcessesBarTableComponent,
    ProcessesBarComponent,
    AdminMenuComponent,
    MenuButtonComponent,
    UserAccountComponent,
    ManageUsersComponent,
    ManageNodesComponent,
    ManageSubscriptionsComponent,
    ManageSharingComponent,
    FeedbackDialogComponent,
    ConvertBytesToHigherUnitPipe,
    PaginatorComponent,
    SaveParamsDialogComponent,
    MetadataAttributesDialogComponent

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
    ClipboardModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatProgressBarModule,
    NgxChartsModule,
    KeycloakAngularModule,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger
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
    MatNativeDateModule,
    { provide: RabbitStompService },
    // {
    //   provide: APP_INITIALIZER,
    //   multi: true,
    //   deps: [ConfigurationService],
    //   useFactory: (appConfigService: ConfigurationService) => () => appConfigService.loadConfiguration()
    // },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,

      deps: [KeycloakService, ConfigurationService],
    },
    { provide: MatBottomSheetRef, useValue: {} },
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent],

})
export class AppModule { }
