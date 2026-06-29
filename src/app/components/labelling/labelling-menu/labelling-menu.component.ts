import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConstantsService} from "../../../services/constants.service";
import {LabellingProjectsStateService} from "../../../services/api/labelling/labelling-projects-state.service";
import {Router} from "@angular/router";
import { ProductService } from 'src/app/services/api/product.service';
import { Subject, takeUntil } from 'rxjs';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';

@Component({
  selector: 'app-labelling-menu',
  templateUrl: './labelling-menu.component.html',
  styleUrl: './labelling-menu.component.css',
  standalone: false,
})
export class LabellingMenuComponent implements OnInit {
  @Output() m_sSelectedTab: EventEmitter<string> = new EventEmitter<string>();
  @Output() publishBandMessage: EventEmitter<any> = new EventEmitter<any>();

  @Input() m_sActiveTab: string = 'projects';

  m_aoMenuButtons = [
    {
      title: 'projects',
      label: 'LABELLING_MENU_PROJECTS',
      icon: 'person', // Note: You might want to change this to 'folder' or 'list'
    },
    {
      title: 'templates',
      label: 'LABELLING_MENU_TEMPLATES',
      icon: 'supervisor_account', // Maybe 'assignment' or 'category'?
    },
    {
      title: 'labels',
      label: 'LABELLING_MENU_LABELS',
      icon: 'rocket', // Maybe 'map' or 'edit_location'?
    },
  ];

  // List of Project images
  m_aoProjectImages = [ ];

  // Track the single active image
  m_sSelectedImageId: string | null = null;

  private m_oDestroy$ = new Subject<void>();

  /**
  * Message hook to receive the Downloaded File Message from Rabbit
  */
  m_iDownloadedFileHookIndex: number = -1;

  /**
  * Message hook to receive the Publish Band Message from Rabbit
  */
  m_iPublishBandHookIndex: number = -1;


  constructor(
    private m_oConstantsService: ConstantsService,
    public m_oProjectState: LabellingProjectsStateService,
    public m_oProductService: ProductService,
    private m_oRouter:Router,
    private m_oRabbitStompService: RabbitStompService
  ) {
  }

  ngOnInit() {
    //this.loadProjectImages();
    if (this.m_oProjectState.getTargetWorkspaceId()) {
      this.loadProjectImages();
      this.registerRabbitHooks();
    }

    this.m_oProjectState.m_oProjectWorkspaceChanged$
      .pipe(takeUntil(this.m_oDestroy$))
      .subscribe(() => {
        this.onProjectWorkspaceChanged();
      });
  }

  registerRabbitHooks() {
    this.m_oRabbitStompService.subscribe(this.m_oProjectState.getTargetWorkspaceId());

    this.m_iDownloadedFileHookIndex  = this.m_oRabbitStompService.addMessageHook("DOWNLOAD",
      this,
      this.receivedDownloadedFileMessage, false);
    console.log('LabellingMenuComponent.ngOnInit: registered DOWNLOAD hook index=' + this.m_iDownloadedFileHookIndex);

    this.m_iPublishBandHookIndex = this.m_oRabbitStompService.addMessageHook("PUBLISHBAND",
    this,
    this.publishBandMessageHook, false);
    console.log('LabellingMenuComponent.ngOnInit: registered PUBLISHBAND hook index=' + this.m_iPublishBandHookIndex);
  }

  ngOnDestroy(): void {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
    this.m_oProjectState.setActiveImage(null);
    this.m_oRabbitStompService.unsubscribe();

    if (this.m_iDownloadedFileHookIndex != -1) {
      this.m_oRabbitStompService.removeMessageHook(this.m_iDownloadedFileHookIndex);
    }

    if (this.m_iPublishBandHookIndex!= -1) {
      this.m_oRabbitStompService.removeMessageHook(this.m_iPublishBandHookIndex);
    }    
  }

  publishBandMessageHook(oRabbitMessage, oController) {
    oController.receivedPublishBandMessage(oRabbitMessage);
  }

  receivedPublishBandMessage(oRabbitMessage) {
    this.publishBandMessage.emit(oRabbitMessage);
  }

  receivedDownloadedFileMessage(oRabbitMessage, oController) {
    console.log("LabellingMenuComponent.receivedDownloadedFileMessage: ", oRabbitMessage);
    oController.loadProjectImages();
  }

  onProjectWorkspaceChanged(): void {
    if (this.m_oProjectState.getTargetWorkspaceId()) {
      this.loadProjectImages();
      this.registerRabbitHooks();
    }
  }

  private loadProjectImages(): void {
    const sTargetWorkspaceId = this.m_oProjectState.getTargetWorkspaceId();

    this.m_aoProjectImages = [];
    this.m_sSelectedImageId = null;

    if (!sTargetWorkspaceId) {
      return;
    }

    this.m_oProductService.getProductListByWorkspace(sTargetWorkspaceId).subscribe({
      next: oResponse => {

        for (let i = 0; i < oResponse.length; i++) {
          let oProjectImage = {}
          oProjectImage['id'] = oResponse[i].name;
          oProjectImage['name'] = oResponse[i].name;
          oProjectImage['opacity'] = 100;
          this.m_aoProjectImages.push(oProjectImage);
        }
      },
      error: oError => {

      }
    });
  }

  setActiveTab(sInputTab: string) {
    if (this.isDisabled(sInputTab)) {
      return;
    }
    this.m_sActiveTab = sInputTab;
    this.m_sSelectedTab.emit(this.m_sActiveTab);


  }


  onSelectImage(oImage: any) {
    if (this.m_sSelectedImageId !== oImage.id) {
      this.m_sSelectedImageId = oImage.id;

      console.log(`Switched active image to: ${oImage.name}`);
      this.m_oProjectState.setActiveImage(oImage.name);
    }
  }

  onImageSettings(oImage: any, event: Event) {
    event.stopPropagation(); // Prevents the row click from firing
    console.log(`Open Settings Dialog for ${oImage.name}`);
  }

  onEditImageStyle(oImage: any, event: Event) {
    event.stopPropagation(); // Prevents the row click from firing
    console.log(`Open Style Dialog for ${oImage.name}`);
  }

  onOpacityChange(oImage: any, event: Event) {
    const sValue = (event.target as HTMLInputElement).value;
    oImage.opacity = parseInt(sValue, 10);
    // TODO: Update opacity on the map
  }

  isDisabled(sTitle: string): boolean {
    return sTitle === 'labels' && !this.m_oProjectState.m_sActiveProjectId;
  }

  // ── IMAGE ACTIONS ──

  onAddImage() {
    this.m_oRouter.navigate(['/search'], {
      queryParams: { filterWs: true }
    });
  }

  onToggleImageVisibility(oImage: any) {
    oImage.isVisible = !oImage.isVisible;
    console.log(`Toggled visibility for ${oImage.name}: ${oImage.isVisible}`);
    // TODO: Call MapEngineService to show/hide this specific layer
  }


}
