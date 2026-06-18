import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef, AfterViewInit
} from '@angular/core';
import { MapEngineService } from '../../../services/map-engine/map-engine.service';

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
  m_sEditMode: 'vertices' | 'move' = 'vertices';
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

  // ── Current user (replace with your real auth service) ──────────────────────
  m_sCurrentUser: string = 'current@user.com';

  // ─────────────────────────────────────────────────────────────────────────────

  constructor(private m_oMapEngineService: MapEngineService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {
    // Init map after view renders
    // setTimeout(() => this.initMap(), 100);

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

  // ═══════════════════════════════════════════════════════════════════════════
  // MAP INIT
  // ═══════════════════════════════════════════════════════════════════════════

  private initMap(): void {
    this.m_oMapEngineService.initMap('labelsMapContainer');
    const oMap = this.m_oMapEngineService.getMap();

    if (oMap) {
      this.m_oMapEngineService.initGeocoder(oMap);
      this.m_oMapEngineService.addManualBoundingBoxControl(oMap, true);

      this.m_oMapEngineService.getManualBoundingBox$().subscribe((oEvent: any) => {
        if (oEvent) {
          this.handleDrawUpdate(oEvent);
        }
      });

      // Give MapLibre one tick to measure the container before rendering tiles
      setTimeout(() => {
        if (typeof oMap.resize === 'function') {
          oMap.resize();
        }
      }, 0);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNDO
  // ═══════════════════════════════════════════════════════════════════════════

  /** Call this BEFORE mutating m_aoFeatures to snapshot the current state. */
  private saveHistory(): void {
    const snapshot = this.m_aoFeatures.map(f => ({ ...f, properties: { ...f.properties } }));
    this.m_aoPastFeatures = [...this.m_aoPastFeatures, snapshot];
    if (this.m_aoPastFeatures.length > 30) {
      this.m_aoPastFeatures.shift();
    }
  }

  onUndo(): void {
    if (this.m_aoPastFeatures.length === 0) return;
    const previous = this.m_aoPastFeatures[this.m_aoPastFeatures.length - 1];
    this.m_aoPastFeatures = this.m_aoPastFeatures.slice(0, -1);
    this.m_aoFeatures = previous;
    this.syncMapFeatures();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAW EVENTS
  // ═══════════════════════════════════════════════════════════════════════════

  private handleDrawUpdate(oEvent: any): void {
    // Adapt this to whatever your MapEngineService emits
    const aoRawFeatures: any[] = oEvent.features || oEvent || [];

    this.saveHistory();

    this.m_aoFeatures = aoRawFeatures.map((oRaw: any) => {
      const sId = oRaw.id || `drawn-${Date.now()}-${Math.random()}`;
      const oExisting = this.m_aoFeatures.find(f => f.id === sId);

      const sMeasurement = this.calcMeasurement(oRaw.geometry);

      if (oExisting) {
        // Shape was edited — keep existing properties, update measurement
        return {
          ...oExisting,
          geometry: oRaw.geometry,
          properties: { ...oExisting.properties, measurement: sMeasurement }
        };
      }

      // Brand-new shape
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
          ...oDynamicProps
        }
      } as LabelFeature;
    });
  }

  /** Push current features back to the map layer. */
  private syncMapFeatures(): void {
    // Adapt to your MapEngineService API — e.g. setFeatureCollection / refreshLayer
    // this.m_oMapEngineService.setFeatures(this.m_aoFeatures);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE / REFRESH / UPLOAD
  // ═══════════════════════════════════════════════════════════════════════════

  onSaveLabels(): void {
    if (this.m_bSaving) return;
    this.m_bSaving = true;

    // TODO: Replace with your real service call, e.g.:
    // this.m_oLabelService.syncLabels(this.m_sImageId, this.buildPayload()).subscribe({
    //   next: () => { /* show success */ },
    //   error: () => { /* show error */ },
    //   complete: () => { this.m_bSaving = false; }
    // });

    // Simulated delay for now:
    setTimeout(() => {
      console.log('💾 Save payload:', this.buildSavePayload());
      this.m_bSaving = false;
    }, 800);
  }

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

  onDelete(sId: string): void {
    if (!confirm('Delete this label?')) return;
    this.saveHistory();
    this.m_aoFeatures = this.m_aoFeatures.filter(f => f.id !== sId);
    this.syncMapFeatures();
    // TODO: sync deletion to backend
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

  private patchFeatureProperty(sId: string, sKey: string, oValue: any): void {
    this.m_aoFeatures = this.m_aoFeatures.map(f => {
      if (f.id !== sId) return f;
      return { ...f, properties: { ...f.properties, [sKey]: oValue } };
    });
  }

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
}
