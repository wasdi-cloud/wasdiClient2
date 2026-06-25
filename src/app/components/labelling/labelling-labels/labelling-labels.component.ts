import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef, AfterViewInit, HostListener
} from '@angular/core';
import { MapEngineService } from '../../../services/map-engine/map-engine.service';
import {LabelsService} from "../../../services/api/labelling/labels.service";
import {forkJoin, Observable, of} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {LabellingProjectsStateService} from "../../../services/api/labelling/labelling-projects-state.service";

// ── Lightweight interfaces ────────────────────────────────────────────────────

export interface LabelFeature {
  id: string;
  type: 'Feature';
  geometry: { type: string; coordinates: any };
  properties: { [key: string]: any };
}

export interface TemplateAttribute {
  name: string;
  type: 'text' | 'float' | 'integer' | 'category';
  isOptional?: boolean;
  categoryValues?: { value: string; color: string }[];
}

export interface Collaborator {
  id: string;
  name: string;
}

export interface ReviewNote {
  id: string;
  sender: string;
  note: string;
  resolved: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-labelling-labels',
  templateUrl: './labelling-labels.component.html',
  styleUrl: './labelling-labels.component.css',
  standalone: false
})
export class LabellingLabelsComponent implements OnInit, OnDestroy,AfterViewInit {

  // ── File input ref ──────────────────────────────────────────────────────────
  @ViewChild('m_oFileInput') m_oFileInputRef!: ElementRef<HTMLInputElement>;

  // ── Map ─────────────────────────────────────────────────────────────────────
  private m_oMap: any = null;

  // ── Feature state ───────────────────────────────────────────────────────────
  m_aoFeatures: LabelFeature[] = [];
  m_aoPastFeatures: LabelFeature[][] = [];   // undo stack (max 30)

  // ── Template ────────────────────────────────────────────────────────────────
  m_aoTemplateAttributes: TemplateAttribute[] = [];

  // ── Collaborators ────────────────────────────────────────────────────────────
  m_aoCollaborators: Collaborator[] = [];

  // ── Toolbar state ───────────────────────────────────────────────────────────
  m_sEditMode: 'draw' | 'vertices' | 'move' = 'move';
  m_sStyleBy: 'label' | 'annotator' = 'label';
  m_sFilterCollab: string = 'all';
  m_bShowValidatedOnly: boolean = false;

  // ── Table state ─────────────────────────────────────────────────────────────
  m_bTableExpanded: boolean = false;
  m_sSelectedFeatureId: string | null = null;

  // ── Inline edit state ───────────────────────────────────────────────────────
  m_oEditingCell: { featureId: string | null; attrName: string | null } = {
    featureId: null,
    attrName: null
  };
  m_sEditValue: string = '';

  // ── Loading flags ───────────────────────────────────────────────────────────
  m_bSaving: boolean = false;
  m_bRefreshing: boolean = false;

  // ── Issues modal ─────────────────────────────────────────────────────────────
  m_oActiveIssueFeature: LabelFeature | null = null;
  m_sIssueInput: string = '';

  // ── Current user (todo replace with your real auth service) ──────────────────────
  m_sCurrentUser: string = 'current@user.com';

  m_sCurrentDatasetId: string = null;
  m_sCurrentImageName: string = '';

  // ─────────────────────────────────────────────────────────────────────────────

  constructor(
    private m_oMapEngineService: MapEngineService
    ,private m_oLabelService: LabelsService
    ,private m_oProjectState: LabellingProjectsStateService
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {
      this.m_sCurrentDatasetId=this.m_oProjectState.m_sActiveProjectId
    // TODO: inject and call your real services here, e.g.:
    // this.loadTemplate();
    // this.loadCollaborators();
    // this.loadFeatures();
  }
  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.m_oMapEngineService.clearMap();
  }


  // ── KEYBOARD SHORTCUTS ──
  @HostListener('document:keydown.control.z', ['$event'])
  @HostListener('document:keydown.meta.z', ['$event'])
  onCtrlZ(event: Event): void {   // <--- Change KeyboardEvent to Event
                                  // Prevent the browser's default undo action
    event.preventDefault();

    if (this.m_aoPastFeatures.length > 0) {
      this.onUndo();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAP INIT
  // ═══════════════════════════════════════════════════════════════════════════

  private initMap(): void {
    this.m_oMapEngineService.initMap('labelsMapContainer');
    const oMap = this.m_oMapEngineService.getMap();

    if (oMap) {
      this.m_oMapEngineService.initDrawControl(oMap);

      this.m_oMapEngineService.getDrawEvents$().subscribe((oEvent: any) => {
        if (oEvent) {
          this.handleDrawUpdate(oEvent);
        }
      });

      setTimeout(() => {
        if (typeof oMap.resize === 'function') {
          oMap.resize();
        }

        // ── LISTEN FOR IMAGE SWITCHES FROM THE SIDEBAR ──
        this.m_oProjectState.m_oActiveImage$.subscribe(sImageName => {
          if (sImageName && sImageName !== this.m_sCurrentImageName) {

            this.m_sCurrentImageName = sImageName;

            // 1. Wipe the old labels off the map and table
            this.m_aoFeatures = [];
            this.m_aoPastFeatures = []; // Clear undo history
            this.m_sSelectedFeatureId = null;
            this.m_oMapEngineService.setDrawFeatures([]);

            // 2. Fetch the new labels for the selected image
            this.loadFeatures();
          }
        });

      }, 0);
    }
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // DRAW EVENTS
  // ═══════════════════════════════════════════════════════════════════════════

  private handleDrawUpdate(oEvent: any): void {
    if (!oEvent) return;

    const aoUpdatedFeatures = oEvent.features || [];

    // ── THE FIX: Only save history for actual shape modifications! ──
    if (oEvent.type === 'create' || oEvent.type === 'update' || oEvent.type === 'delete') {
      this.saveHistory();
    }

    if (oEvent.type === 'create') {
      const newFeatures = aoUpdatedFeatures.map((oRaw: any) => this.createNewFeature(oRaw));
      this.m_aoFeatures = [...this.m_aoFeatures, ...newFeatures];
    } else if (oEvent.type === 'update') {
      this.m_aoFeatures = this.m_aoFeatures.map(existingFeature => {
        const updatedRaw = aoUpdatedFeatures.find((f: any) => f.id === existingFeature.id);
        if (updatedRaw) {
          return {
            ...existingFeature,
            geometry: updatedRaw.geometry,
            properties: { ...existingFeature.properties, measurement: this.calcMeasurement(updatedRaw.geometry),isDirty: true }
          };
        }
        return existingFeature;
      });
    } else if (oEvent.type === 'delete') {
      const deletedIds = aoUpdatedFeatures.map((f: any) => f.id);
      deletedIds.forEach((sId: string) => this.onDelete(sId, true));
      // this.m_aoFeatures = this.m_aoFeatures.filter(f => !deletedIds.includes(f.id));

    } else if (oEvent.type === 'selection') {
      this.m_sSelectedFeatureId = aoUpdatedFeatures.length > 0 ? aoUpdatedFeatures[0].id : null;

      // ── THE FIX: FORCE SYNC MAPBOX TO YOUR TOOLBAR ──
    } else if (oEvent.type === 'force_sync') {
      // Whenever Mapbox tries to do its own thing on click, we force it back to the toolbar's choice
      setTimeout(() => {
        if (this.m_sEditMode === 'vertices') {
          this.m_oMapEngineService.changeDrawMode('direct_select', oEvent.featureId);
        } else if (this.m_sEditMode === 'move') {
          this.m_oMapEngineService.changeDrawMode('simple_select', oEvent.featureId);
        }
      }, 0);

      // ── ONLY SYNC BACK IF THE USER DOUBLE CLICKS ──
    } else if (oEvent.type === 'modechange') {
      if (oEvent.mode === 'direct_select') this.m_sEditMode = 'vertices';
      else if (oEvent.mode === 'simple_select') this.m_sEditMode = 'move';
      else if (oEvent.mode === 'draw_polygon') this.m_sEditMode = 'draw';

      const oCanvas = this.m_oMapEngineService.getMap()?.getCanvas();
      if (oCanvas) {
        oCanvas.style.cursor = oEvent.mode === 'draw_polygon' ? 'crosshair' : 'pointer';
      }
    }
  }

  private patchFeatureProperty(sId: string, sKey: string, oValue: any): void {
    this.m_aoFeatures = this.m_aoFeatures.map(f => {
      if (f.id !== sId) return f;
      return {
        ...f,
        properties: {
          ...f.properties,
          [sKey]: oValue,
          isDirty: true // <-- FLAG: Attribute was edited
        }
      };
    });
  }

  onEditModeChange(sMode: 'draw' | 'vertices' | 'move'): void {
    this.m_sEditMode = sMode;

    const oCanvas = this.m_oMapEngineService.getMap()?.getCanvas();
    if (oCanvas) {
      oCanvas.style.cursor = sMode === 'draw' ? 'crosshair' : 'pointer';
    }

    // Pass the currently selected feature ID (if any) so the mode changes correctly
    if (sMode === 'draw') {
      this.m_oMapEngineService.changeDrawMode('draw_polygon');
    } else if (sMode === 'move') {
      this.m_oMapEngineService.changeDrawMode('simple_select', this.m_sSelectedFeatureId || undefined);
    } else if (sMode === 'vertices') {
      this.m_oMapEngineService.changeDrawMode('direct_select', this.m_sSelectedFeatureId || undefined);
    }
  }




  // Helper to construct the full feature object
  private createNewFeature(oRaw: any): LabelFeature {
    const sId = oRaw.id;
    const sMeasurement = this.calcMeasurement(oRaw.geometry);
    const oDynamicProps: { [key: string]: any } = {};
    let sColor = '#3b82f6';

    this.m_aoTemplateAttributes.forEach(attr => {
      oDynamicProps[attr.name] = '';
      if (attr.categoryValues && attr.categoryValues.length > 0) {
        oDynamicProps[attr.name] = attr.categoryValues[0].value;
        sColor = attr.categoryValues[0].color;
      }
    });

    return {
      id: sId,
      type: 'Feature',
      geometry: oRaw.geometry,
      properties: {
        id: sId,
        annotator: this.m_sCurrentUser,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        measurement: sMeasurement,
        portColor: sColor,
        isValidated: false,
        reviewCount: 0,
        reviewers: [],
        reviewNotes: [],
        isNew: true,    // <-- FLAG: This has never been saved
        isDirty: true,  // <-- FLAG: Needs to be saved
        ...oDynamicProps
      }
    } as LabelFeature;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNDO
  // ═══════════════════════════════════════════════════════════════════════════

  /** Call this BEFORE mutating m_aoFeatures to snapshot the current state. */
  private saveHistory(): void {
    // Deep copy the properties so editing an attribute doesn't mutate the past!
    const snapshot = this.m_aoFeatures.map(f => ({
      ...f,
      geometry: { ...f.geometry },
      properties: { ...f.properties }
    }));

    this.m_aoPastFeatures = [...this.m_aoPastFeatures, snapshot];

    // Keep a maximum of 30 undo steps to prevent memory bloat
    if (this.m_aoPastFeatures.length > 30) {
      this.m_aoPastFeatures.shift();
    }
  }

  onUndo(): void {
    if (this.m_aoPastFeatures.length === 0) return;

    // 1. Pop the last state off the stack
    const previousState = this.m_aoPastFeatures.pop();
    if (!previousState) return;

    // 2. Restore the Angular state
    this.m_aoFeatures = previousState;

    // 3. FORCE MAPBOX TO REDRAW THE REVERTED STATE
    if (this.m_oMapEngineService) {
      this.m_oMapEngineService.setDrawFeatures(this.m_aoFeatures);
    }

    console.log(`↩️ Undo triggered! Reverted to ${this.m_aoFeatures.length} shapes.`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAW EVENTS
  // ═══════════════════════════════════════════════════════════════════════════



  /** Push current features back to the map layer. */
  private syncMapFeatures(): void {
    // Adapt to your MapEngineService API — e.g. setFeatureCollection / refreshLayer
    // this.m_oMapEngineService.setFeatures(this.m_aoFeatures);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE / REFRESH / UPLOAD
  // ═══════════════════════════════════════════════════════════════════════════



  onRefresh(): void {
    if (this.m_bRefreshing) return;
    this.m_bRefreshing = true;

    // TODO: Replace with your real service call, e.g.:
    // this.m_oLabelService.getLabelsByImage(this.m_sProjectId, this.m_sImageId).subscribe({
    //   next: (data) => { this.m_aoFeatures = this.mapResponseToFeatures(data); },
    //   complete: () => { this.m_bRefreshing = false; }
    // });

    setTimeout(() => { this.m_bRefreshing = false; }, 600);
  }


  async onFileUpload(oEvent: Event): Promise<void> {
    // const oInput = oEvent.target as HTMLInputElement;
    // const oFile = oInput?.files?.[0];
    // if (!oFile) return;
    //
    // const sExt = oFile.name.split('.').pop()?.toLowerCase();
    // try {
    //   let oGeojson: any = null;
    //
    //   if (sExt === 'geojson' || sExt === 'json') {
    //     const sText = await oFile.text();
    //     oGeojson = JSON.parse(sText);
    //   } else if (sExt === 'zip') {
    //     // shpjs must be installed: npm install shpjs
    //     const shp = (await import('shpjs')).default;
    //     const oBuffer = await oFile.arrayBuffer();
    //     let oResult = await shp(oBuffer);
    //     if (Array.isArray(oResult)) {
    //       oGeojson = { type: 'FeatureCollection', features: oResult.flatMap((g: any) => g.features) };
    //     } else {
    //       oGeojson = oResult;
    //     }
    //   } else {
    //     console.warn('Unsupported file format:', sExt);
    //     return;
    //   }
    //
    //   if (!oGeojson?.features?.length) {
    //     console.warn('No features found in file.');
    //     return;
    //   }
    //
    //   this.saveHistory();
    //
    //   const aoImported: LabelFeature[] = oGeojson.features.map((oRaw: any, i: number) => {
    //     const sId = oRaw.id || `imported-${Date.now()}-${i}`;
    //     return {
    //       ...oRaw,
    //       id: sId,
    //       properties: {
    //         ...oRaw.properties,
    //         id: sId,
    //         annotator: this.m_sCurrentUser,
    //         status: 'Pending',
    //         timestamp: new Date().toISOString(),
    //         measurement: this.calcMeasurement(oRaw.geometry),
    //         portColor: '#3b82f6',
    //         isValidated: false,
    //         reviewCount: 0,
    //         reviewers: [],
    //         reviewNotes: []
    //       }
    //     } as LabelFeature;
    //   });
    //
    //   this.m_aoFeatures = [...this.m_aoFeatures, ...aoImported];
    //   this.syncMapFeatures();
    //   console.log(`✅ Imported ${aoImported.length} features`);
    //
    // } catch (oError) {
    //   console.error('File upload error:', oError);
    // } finally {
    //   oInput.value = '';
    // }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVE / DELETE
  // ═══════════════════════════════════════════════════════════════════════════

  onApprove(oFeature: LabelFeature): void {
    if (this.hasCurrentUserApproved(oFeature)) return;

    // TODO: call your API, then update local state on success:
    // this.m_oLabelService.approveLabel(oFeature.id).subscribe(res => { ... });

    this.m_aoFeatures = this.m_aoFeatures.map(f => {
      if (f.id !== oFeature.id) return f;
      const aoReviewers = [...(f.properties['reviewers'] || []), this.m_sCurrentUser];
      const iCount = aoReviewers.length;
      return {
        ...f,
        properties: {
          ...f.properties,
          reviewers: aoReviewers,
          reviewCount: iCount,
          isValidated: iCount >= 2   // adjust threshold to your minReviewCount
        }
      };
    });
  }



  // ═══════════════════════════════════════════════════════════════════════════
  // ISSUES MODAL
  // ═══════════════════════════════════════════════════════════════════════════

  onOpenIssues(oFeature: LabelFeature): void {
    this.m_oActiveIssueFeature = oFeature;
    this.m_sIssueInput = '';
  }

  onCloseIssues(): void {
    this.m_oActiveIssueFeature = null;
  }

  onSendIssue(): void {
    if (!this.m_sIssueInput.trim() || !this.m_oActiveIssueFeature) return;
    const oNote: ReviewNote = {
      id: Date.now().toString(),
      sender: this.m_sCurrentUser,
      note: this.m_sIssueInput.trim(),
      resolved: false
    };

    // TODO: call this.m_oLabelService.sendNote(featureId, noteText).subscribe(...)

    this.updateFeatureNotes(this.m_oActiveIssueFeature.id, oNote);
    this.m_sIssueInput = '';
  }

  onResolveNote(sNoteId: string): void {
    if (!this.m_oActiveIssueFeature) return;

    // TODO: call this.m_oLabelService.resolveNote(featureId, noteId).subscribe(...)

    const aoUpdated = (this.m_oActiveIssueFeature.properties['reviewNotes'] as ReviewNote[] || [])
      .map(n => n.id === sNoteId ? { ...n, resolved: true } : n);

    this.patchFeatureProperty(this.m_oActiveIssueFeature.id, 'reviewNotes', aoUpdated);

    // Keep the modal in sync
    this.m_oActiveIssueFeature = {
      ...this.m_oActiveIssueFeature,
      properties: { ...this.m_oActiveIssueFeature.properties, reviewNotes: aoUpdated }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INLINE EDIT
  // ═══════════════════════════════════════════════════════════════════════════

  isEditing(sFeatureId: string, sAttrName: string): boolean {
    return this.m_oEditingCell.featureId === sFeatureId &&
      this.m_oEditingCell.attrName === sAttrName;
  }

  onStartEdit(sFeatureId: string, sAttrName: string, sCurrentValue: any, oEvent: Event): void {
    oEvent.stopPropagation();
    this.m_oEditingCell = { featureId: sFeatureId, attrName: sAttrName };
    this.m_sEditValue = sCurrentValue ?? '';
  }

  onSaveEdit(): void {
    const { featureId, attrName } = this.m_oEditingCell;
    if (featureId && attrName) {
      this.patchFeatureProperty(featureId, attrName, this.m_sEditValue);
    }
    this.m_oEditingCell = { featureId: null, attrName: null };
  }

  onEditKeyDown(oEvent: KeyboardEvent): void {
    if (oEvent.key === 'Enter') this.onSaveEdit();
    if (oEvent.key === 'Escape') this.m_oEditingCell = { featureId: null, attrName: null };
  }

  onDropdownChange(sFeatureId: string, sAttrName: string): void {
    this.patchFeatureProperty(sFeatureId, sAttrName, this.m_sEditValue);
    this.m_oEditingCell = { featureId: null, attrName: null };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED / HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  get m_aoFilteredFeatures(): LabelFeature[] {
    return this.m_aoFeatures.filter(f => {
      const oProps = f.properties || {};
      if (this.m_sFilterCollab !== 'all' &&
        oProps['annotator']?.toLowerCase() !== this.m_sFilterCollab.toLowerCase()) {
        return false;
      }
      if (this.m_bShowValidatedOnly && !oProps['isValidated']) {
        return false;
      }
      return true;
    });
  }

  get m_iValidatedCount(): number {
    return this.m_aoFilteredFeatures.filter(f => f.properties['isValidated']).length;
  }

  hasCurrentUserApproved(oFeature: LabelFeature): boolean {
    const aoReviewers: string[] = oFeature.properties['reviewers'] || [];
    return aoReviewers.includes(this.m_sCurrentUser);
  }

  getUnresolvedCount(oFeature: LabelFeature): number {
    const aoNotes: ReviewNote[] = oFeature.properties['reviewNotes'] || [];
    return aoNotes.filter(n => !n.resolved).length;
  }

  getIssueIcon(oFeature: LabelFeature): string {
    const aoNotes: ReviewNote[] = oFeature.properties['reviewNotes'] || [];
    const iUnresolved = aoNotes.filter(n => !n.resolved).length;
    if (iUnresolved > 0) return '🚩';
    if (aoNotes.length > 0) return '💬';
    return '📭';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════



  private updateFeatureNotes(sId: string, oNewNote: ReviewNote): void {
    this.m_aoFeatures = this.m_aoFeatures.map(f => {
      if (f.id !== sId) return f;
      const aoNotes = [...(f.properties['reviewNotes'] || []), oNewNote];
      return { ...f, properties: { ...f.properties, reviewNotes: aoNotes } };
    });

    // Keep modal in sync
    if (this.m_oActiveIssueFeature?.id === sId) {
      const aoNotes = [...(this.m_oActiveIssueFeature.properties['reviewNotes'] || []), oNewNote];
      this.m_oActiveIssueFeature = {
        ...this.m_oActiveIssueFeature,
        properties: { ...this.m_oActiveIssueFeature.properties, reviewNotes: aoNotes }
      };
    }
  }

  private buildSavePayload(): any[] {
    return this.m_aoFeatures.map(f => ({
      labelId: f.id,
      geometryType: f.geometry.type,
      coordinates: f.geometry.coordinates,
      attributes: f.properties,
      reviewCount: f.properties['reviewCount'] || 0,
      reviewers: f.properties['reviewers'] || [],
      reviewNotes: f.properties['reviewNotes'] || [],
      isValidated: f.properties['isValidated'] || false
    }));
  }

  private calcMeasurement(oGeometry: any): string {
    // Lightweight fallback — swap for turf.js if available
    if (!oGeometry) return '0';
    if (oGeometry.type?.includes('Polygon')) return '~area km²';
    if (oGeometry.type?.includes('LineString')) return '~length km';
    return '1 point';
  }

  // Mapper: Transforms Backend LabelViewModel to Mapbox Feature
  private mapViewModelToFeature(vm: any): LabelFeature {
    // 1. Parse the stringified geometry back into a JSON object
    let parsedGeometry;
    try {
      parsedGeometry = JSON.parse(vm.geometry);
    } catch (e) {
      console.error(`Invalid geometry string for label ${vm.id}`, vm.geometry);
      parsedGeometry = { type: 'Point', coordinates: [0, 0] }; // Fallback to prevent crash
    }

    // 2. Unpack the Key/Value array into a flat object for your table columns
    const dynamicProps: { [key: string]: any } = {};
    if (vm.attributes && Array.isArray(vm.attributes)) {
      vm.attributes.forEach((attr: any) => {
        dynamicProps[attr.key] = attr.value;
      });
    }

    return {
      id: vm.id,
      type: 'Feature',
      geometry: parsedGeometry,
      properties: {
        id: vm.id,
        annotator: vm.annotator || 'Unknown',
        status: vm.isValidated ? 'Validated' : 'Pending',
        timestamp: new Date().toISOString(), // Fallback if backend doesn't provide
        measurement: this.calcMeasurement(parsedGeometry),
        portColor: '#3b82f6', // You could logic this out based on your dynamicProps!
        isValidated: vm.isValidated || false,
        reviewCount: vm.reviewCount || 0,
        reviewers: vm.reviewers || [],
        reviewNotes: vm.reviewNotes || [],
        isNew: false,   // <-- FLAG: This came from the DB, so it's not new!
        isDirty: false, // <-- FLAG: It hasn't been edited yet!
        ...dynamicProps
      }
    } as LabelFeature;
  }

  private loadFeatures(): void {
    this.m_bRefreshing = true;

    this.m_oLabelService.getLabelsByImage(this.m_sCurrentDatasetId, this.m_sCurrentImageName).subscribe({
      next: (aoViewModels) => {
        // 1. Map backend data to Mapbox format
        this.m_aoFeatures = aoViewModels.map(vm => this.mapViewModelToFeature(vm));

        // 2. Snapshot history so 'Undo' works properly
        this.saveHistory();

        // 3. Inject the shapes into the Mapbox Engine!
        if (this.m_oMapEngineService) {
          this.m_oMapEngineService.setDrawFeatures(this.m_aoFeatures);
        }

        console.log(`✅ Loaded ${this.m_aoFeatures.length} labels from backend.`);
      },
      error: (err) => {
        console.error("Failed to load features:", err);
      },
      complete: () => {
        this.m_bRefreshing = false;
      }
    });
  }

  // Mapper: Transforms Mapbox Feature to your Backend LabelViewModel
  private mapFeatureToViewModel(f: LabelFeature): any {
    const geomType = f.geometry.type;

    // Convert dynamic attributes to the Key/Value array your backend expects
    const aoAttributes = this.m_aoTemplateAttributes.map(attr => ({
      key: attr.name,
      value: f.properties[attr.name] || ''
    }));

    return {
      id: f.properties['isNew'] ? null : f.id, // Backend generates ID on POST
      geometry: JSON.stringify(f.geometry),    // Pass geometry as string
      isPoint: geomType === 'Point',
      isLine: geomType === 'LineString',
      isPolygon: geomType === 'Polygon',
      isMultiPolygon: geomType === 'MultiPolygon',
      annotator: f.properties['annotator'],
      image: this.m_sCurrentImageName,
      datasetId: this.m_sCurrentDatasetId,
      reviewers: f.properties['reviewers'] || [],
      reviewNotes: f.properties['reviewNotes'] || [],
      attributes: aoAttributes,
      reviewCount: f.properties['reviewCount'] || 0,
      isValidated: f.properties['isValidated'] || false
    };
  }

  // Upsert a single feature (Returns Observable)
  private upsertFeature$(f: LabelFeature): Observable<any> {
    const oPayload = this.mapFeatureToViewModel(f);
    const isNew = f.properties['isNew'];

    const oApiCall$ = isNew
      ? this.m_oLabelService.createLabel(oPayload)
      : this.m_oLabelService.updateLabel(oPayload);

    return oApiCall$.pipe(
      tap((response: any) => {
        // If it was a POST, the backend returned the new real ID
        const sRealId = isNew && typeof response === 'string' ? response : f.id;

        // Update local state: mark as saved and swap ID if it was new
        this.m_aoFeatures = this.m_aoFeatures.map(feature => {
          if (feature.id === f.id) {
            return {
              ...feature,
              id: sRealId,
              properties: { ...feature.properties, id: sRealId, isNew: false, isDirty: false }
            };
          }
          return feature;
        });

        // Tell mapbox draw about the new real ID
        if (isNew && this.m_oMapEngineService) {
          // Optional: You may need a method in adapter to swap Mapbox IDs,
          // but keeping the local mapping is usually enough.
        }
      }),
      catchError(error => {
        console.error(`Failed to save label ${f.id}`, error);
        return of(null); // Continue other saves even if this one fails
      })
    );
  }

  // 1. SAVE SINGLE ROW (Triggered by Table button)
  onSaveSingleLabel(f: LabelFeature): void {
    if (!f.properties['isDirty']) {
      console.log('No changes to save for this label.');
      return;
    }

    this.upsertFeature$(f).subscribe(() => {
      console.log(`✅ Saved single label: ${f.id}`);
    });
  }

  // 2. SAVE ALL DIRTY ROWS (Triggered by Toolbar button)
  onSaveLabels(): void {
    if (this.m_bSaving) return;

    // Find all features that have unsaved changes
    const aoDirtyFeatures = this.m_aoFeatures.filter(f => f.properties['isDirty']);

    if (aoDirtyFeatures.length === 0) {
      console.log('All labels are already up to date!');
      return;
    }

    this.m_bSaving = true;

    // Create an array of API calls
    const aoSaveRequests$ = aoDirtyFeatures.map(f => this.upsertFeature$(f));

    // Run them all in parallel!
    forkJoin(aoSaveRequests$).subscribe({
      next: (results) => {
        console.log(`✅ Bulk saved ${results.length} labels successfully!`);
      },
      complete: () => {
        this.m_bSaving = false;
      }
    });
  }

  // 3. DELETE (Triggered by Table or Map UI)
  onDelete(sId: string, bFromMapEvent: boolean = false): void {
    const oFeature = this.m_aoFeatures.find(f => f.id === sId);
    if (!oFeature) return;

    if (!bFromMapEvent && !confirm('Delete this label?')) return;

    this.saveHistory();

    // 1. Remove from local table
    this.m_aoFeatures = this.m_aoFeatures.filter(f => f.id !== sId);

    // 2. Tell Mapbox Draw to erase it (if it wasn't already deleted from the map UI)
    if (!bFromMapEvent) {
      this.m_oMapEngineService.deleteDrawFeature(sId);
    }

    // 3. Delete from Backend (ONLY if it was previously saved to the DB)
    if (!oFeature.properties['isNew']) {
      this.m_oLabelService.deleteLabel(sId).subscribe({
        next: () => console.log(`🗑️ Deleted label ${sId} from backend.`),
        error: (err) => console.error(`Failed to delete label ${sId}`, err)
      });
    }
  }
}
