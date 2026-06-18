import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ConstantsService} from "../../../services/constants.service";
import {LabellingProjectsStateService} from "../../../services/api/labelling/labelling-projects-state.service";

@Component({
  selector: 'app-labelling-menu',
  templateUrl: './labelling-menu.component.html',
  styleUrl: './labelling-menu.component.css',
  standalone: false,
})
export class LabellingMenuComponent {
  @Output() m_sSelectedTab: EventEmitter<string> = new EventEmitter<string>();

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

  // ── MOCK DATA FOR IMAGES (Replace with your actual API call later) ──
  m_aoProjectImages = [
    {id: 'img1', name: 'rome_sentinel_2.tif', opacity: 100},
    {id: 'img2', name: 'rome_classification.tif', opacity: 100}
  ];

  // Track the single active image
  m_sSelectedImageId: string | null = 'img1';

  constructor(
    private m_oConstantsService: ConstantsService,
    public m_oProjectState: LabellingProjectsStateService
  ) {
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
      // TODO: Call this.m_oMapEngineService to swap the active map layer
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
    return sTitle === 'labels' && !this.m_oProjectState.m_sActiveWorkspaceProjectId;
  }

  // ── IMAGE ACTIONS ──

  onAddImage() {
    console.log('Open Add Image Dialog');
    // TODO: Open a dialog to search/import new imagery to this labelling project
  }

  onToggleImageVisibility(oImage: any) {
    oImage.isVisible = !oImage.isVisible;
    console.log(`Toggled visibility for ${oImage.name}: ${oImage.isVisible}`);
    // TODO: Call MapEngineService to show/hide this specific layer
  }


}
