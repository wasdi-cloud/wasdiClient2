import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NotificationDisplayService} from "../../../services/notification-display.service";
import {Router} from "@angular/router";
import {LabellingProjectsService} from "../../../services/api/labelling/labelling-projects.service";
import {LabellingTemplatesService} from "../../../services/api/labelling/labelling-templates.service";
import {TemplateStateService} from "../../../services/api/labelling/template-state.service";
import FadeoutUtils from "../../../lib/utils/FadeoutJSUtils";
import {LabellingProjectsStateService} from "../../../services/api/labelling/labelling-projects-state.service";
import {MapEngineService} from "../../../services/map-engine/map-engine.service";

@Component({
  selector: 'app-create-labelling-project',
  standalone: false,
  templateUrl: './create-labelling-project.component.html',
  styleUrl: './create-labelling-project.component.css',
})
export class CreateLabellingProjectComponent implements OnInit{
  @Output() m_oTabChange = new EventEmitter<string>();

  // NEW: Object references so the dropdown component displays correctly
  m_oSelectedMissionObj: any = null;
  m_oSelectedTemplateObj: any = null;

  // State Management
  m_sMode: 'create' | 'view' | 'edit' = 'create';
  m_sProjectId: string | null = null;
  m_bIsLoading: boolean = false;

  // Dropdown Data
  m_aoTemplates: any[] = [];
  m_bLoadingTemplates: boolean = true;
  m_aoMissions = [
    { value: "S2", name: "Sentinel-2" },
    { value: "CUSTOM", name: "Custom Mission" }
  ];

  // Form State (Mapped perfectly to Java DatasetViewModel)
  m_oProject: any = {
    name: "",
    description: "",
    link: "",
    isGlobal: true,
    bbox: "", // WKT String
    isPublic: false,
    startDateStr: "", // UI Date String (YYYY-MM-DD)
    endDateStr: "",   // UI Date String (YYYY-MM-DD)
    annotatorSeeAllLabels: true,
    reviewRequired: false,
    minReviewCount: 1,
    missions: "S2",
    templateId: ""
  };

  // Checkbox state for Tasks array
  m_oTasks = {
    SEMANTING_SEGMENTATION: false,
    OBJECT_DETECTION: false,
    OTHER: false
  };

  constructor(
    private m_oRouter: Router,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProjectService: LabellingProjectsService,
    private m_oTemplateService: LabellingTemplatesService,
    private m_oProjectState: LabellingProjectsStateService,
    private m_oTemplateState: TemplateStateService,
    private m_oMapEngineService:MapEngineService,
  ) {}

  get m_bIsReadOnly(): boolean {
    return this.m_sMode === 'view';
  }
  // --- MAP & AOI LOGIC ---

  onGlobalToggle(bIsGlobal: boolean) {
    this.m_oProject.isGlobal = bIsGlobal;

    // If they unchecked Global, we need to wait 1 tick for Angular to render the
    // <div id="aoiMapContainer">, then tell the MapEngine to initialize it.
    if (!bIsGlobal) {
      setTimeout(() => {
        this.initAoiMap();
      }, 100);
    } else {
      // If they switch back to Global, clear the bbox and map
      this.m_oProject.bbox = "";
      this.m_oMapEngineService.clearMap();
    }
  }

  // --- MAP & AOI LOGIC ---
  private renderExistingAoi() {
    if (!this.m_oProject.bbox || !this.m_oProject.bbox.startsWith('POLYGON')) {
      return; // No shape to draw
    }

    try {
      // 1. Parse "POLYGON((10 20, 30 20, 30 40, 10 40, 10 20))"
      const sClean = this.m_oProject.bbox.replace("POLYGON((", "").replace("))", "");

      // Split into pairs: ["10 20", "30 20", ...]
      const aoPoints = sClean.split(',').map((s: string) => s.trim().split(' '));

      // Extract raw numbers
      const aoLngs = aoPoints.map((pt: string[]) => parseFloat(pt[0]));
      const aoLats = aoPoints.map((pt: string[]) => parseFloat(pt[1]));

      // Get the boundaries
      const fMinLng = Math.min(...aoLngs);
      const fMaxLng = Math.max(...aoLngs);
      const fMinLat = Math.min(...aoLats);
      const fMaxLat = Math.max(...aoLats);

      // 2. Tell the engine to draw it EXACTLY like a manual drawing
      this.m_oMapEngineService.upsertSelectionRectangle(fMinLng, fMinLat, fMaxLng, fMaxLat);

      // 3. Zoom the map perfectly to fit the loaded shape
      const oMap = this.m_oMapEngineService.getMap();
      if (oMap && typeof oMap.fitBounds === 'function') {
        oMap.fitBounds([[fMinLng, fMinLat], [fMaxLng, fMaxLat]], { padding: 40, duration: 1000 });
      }

      console.log("✅ Rendered existing AOI on map.");
    } catch (e) {
      console.error("❌ Failed to parse and render WKT bbox:", e);
    }
  }
  private initAoiMap() {
    this.m_oMapEngineService.initMap('aoiMapContainer');
    const oMap = this.m_oMapEngineService.getMap();

    if (oMap) {
      this.m_oMapEngineService.initGeocoder(oMap);
      this.m_oMapEngineService.addManualBoundingBoxControl(oMap, !this.m_bIsReadOnly);

      // Listen for manual drawing changes

      if (!this.m_bIsReadOnly) {
        this.m_oMapEngineService.getManualBoundingBox$().subscribe((oBounds: any) => {
          if (oBounds) {
            this.convertBoundsToWKT(oBounds);
          } else {
            this.m_oProject.bbox = "";
            console.log("AOI Cleared via Centralized Trash Can");
          }
        });
      }
      // --- NEW: DRAW EXISTING SHAPE IF WE ARE IN EDIT/VIEW MODE ---
      // We wrap it in a tiny timeout to ensure MapLibre's canvas is 100% ready
      setTimeout(() => {
        this.renderExistingAoi();
      }, 250);
    }
  }

  clearAoi() {
    if (this.m_bIsReadOnly) return;
    console.log(this.m_oProject.bbox);
    // 1. Clear the hidden WKT string
    this.m_oProject.bbox = "";

    // 2. Wipe the drawing layer visually WITHOUT refreshing the map!
    this.m_oMapEngineService.resetDrawnItemsLayer();
  }

  private convertBoundsToWKT(oBounds: any) {
    console.log("🛠️ [1] RAW MAP BOUNDS RECEIVED:", oBounds);

    if (!oBounds) {
      console.log("⚠️ [1a] Bounds are null. (Likely cleared by trash can)");
      return;
    }

    try {
      // SCENARIO A: The adapter has a toGeoJSON() method (Our custom adapter does this!)
      if (typeof oBounds.toGeoJSON === 'function') {
        console.log("✅ [2] Detected toGeoJSON function!");
        const oGeoJson = oBounds.toGeoJSON();

        if (oGeoJson.geometry && oGeoJson.geometry.type === 'Polygon') {
          const aoCoords = oGeoJson.geometry.coordinates[0];
          const sCoordString = aoCoords.map((pt: any[]) => `${pt[0]} ${pt[1]}`).join(', ');
          this.m_oProject.bbox = `POLYGON(( ${sCoordString} ))`;
          console.log("🎯 [3] WKT GENERATED SUCCESS (GeoJSON):", this.m_oProject.bbox);
          return;
        }
      }

      // SCENARIO B: Deep Leaflet Bounds format (Adapter uses _bounds._southWest)
      if (oBounds._bounds && oBounds._bounds._southWest && oBounds._bounds._northEast) {
        console.log("✅ [2] Detected Deep _bounds format!");
        const minX = oBounds._bounds._southWest.lng;
        const minY = oBounds._bounds._southWest.lat;
        const maxX = oBounds._bounds._northEast.lng;
        const maxY = oBounds._bounds._northEast.lat;

        this.m_oProject.bbox = `POLYGON(( ${minX} ${minY}, ${maxX} ${minY}, ${maxX} ${maxY}, ${minX} ${maxY}, ${minX} ${minY} ))`;
        console.log("🎯 [3] WKT GENERATED SUCCESS (Bounds):", this.m_oProject.bbox);
        return;
      }

      console.warn("❌ [ERROR] Could not parse bounds. Unrecognized format:", oBounds);
    } catch (oError) {
      console.error("❌ [ERROR] Crashed while parsing bounds:", oError);
    }
  }


  ngOnInit(): void {
    this.m_sMode = this.m_oProjectState.mode;
    this.m_sProjectId = this.m_oProjectState.projectId;

    this.fetchTemplates();

    if (this.m_sProjectId && this.m_sMode !== 'create') {
      this.loadProject(this.m_sProjectId);
    } else {
      const oToday = new Date();
      this.m_oProject.startDateStr = oToday.toISOString().split('T')[0];

      // Default Mission for Create Mode
      this.m_oProject.missions = "S2";
      this.m_oSelectedMissionObj = this.m_aoMissions.find(m => m.value === "S2");
    }
  }

  // --- DATA FETCHING ---
  fetchTemplates() {
    this.m_bLoadingTemplates = true;
    this.m_oTemplateService.getListByUser().subscribe({
      next: (oResponse: any) => {
        // Handle array mapping trap just in case
        this.m_aoTemplates = oResponse?.body ? oResponse.body : oResponse || [];

        // Sync the template object so the dropdown populates!
        this.syncSelectedTemplate();
        this.m_bLoadingTemplates = false;
      },
      error: () => {
        console.error("Failed to load templates");
        this.m_bLoadingTemplates = false;
      }
    });
  }

  loadProject(sId: string) {
    this.m_bIsLoading = true;

    this.m_oProjectService.getDatasetById(sId).subscribe({
      next: (oResponse: any) => {
        const oData = oResponse.body || oResponse;

        if (oData) {
          // Map base properties
          this.m_oProject.name = oData.name || "";
          this.m_oProject.description = oData.description || "";
          this.m_oProject.link = oData.link || "";
          this.m_oProject.isGlobal = oData.isGlobal || false;
          this.m_oProject.bbox = oData.bbox || "";
          this.m_oProject.isPublic = oData.isPublic || false;
          this.m_oProject.annotatorSeeAllLabels = oData.annotatorSeeAllLabels ?? true;
          this.m_oProject.reviewRequired = oData.reviewRequired || false;
          this.m_oProject.minReviewCount = oData.minReviewCount || 1;

          if (!this.m_oProject.isGlobal) {
            setTimeout(() => this.initAoiMap(), 100);
          }

          // Map Dates
          this.m_oProject.startDateStr = this.fromEpochToDateString(oData.startDate);
          this.m_oProject.endDateStr = this.fromEpochToDateString(oData.endDate);

          // Map Tasks
          if (oData.tasks && Array.isArray(oData.tasks)) {
            this.m_oTasks = {
              SEMANTING_SEGMENTATION: oData.tasks.includes('SEMANTING_SEGMENTATION'),
              OBJECT_DETECTION: oData.tasks.includes('OBJECT_DETECTION'),
              OTHER: oData.tasks.includes('OTHER')
            };
          }

          // FIX: Sync Mission Dropdown Object
          this.m_oProject.missions = oData.missions || "S2";
          this.m_oSelectedMissionObj = this.m_aoMissions.find(m => m.value === this.m_oProject.missions) || null;

          // FIX: Sync Template Dropdown Object
          this.m_oProject.templateId = oData.templateId || "";
          this.syncSelectedTemplate();
        }
        this.m_bIsLoading = false;
      },
      error: (oError: any) => {
        console.error("Error loading project:", oError);
        this.m_oNotificationDisplayService.openAlertDialog("Failed to load project details.", "Error", "danger");
        this.m_bIsLoading = false;
      }
    });
  }

  // Helper to match the template ID to the actual object in the array
  private syncSelectedTemplate() {
    if (this.m_oProject.templateId && this.m_aoTemplates.length > 0) {
      this.m_oSelectedTemplateObj = this.m_aoTemplates.find(t => t.id === this.m_oProject.templateId) || null;
    }
  }

  // --- INPUT HANDLERS ---
  getUserInput(oEvent: any, sField: string) {
    this.m_oProject[sField] = oEvent.event ? oEvent.event.target.value : oEvent.target.value;
  }

  // --- INPUT HANDLERS ---

  onMissionChange(oEvent: any) {
    const oSelected = oEvent.value || oEvent;
    this.m_oProject.missions = oSelected.value || oSelected.name || oSelected;
    this.m_oSelectedMissionObj = oSelected; // Update the UI state
  }

  onTemplateChange(oEvent: any) {
    const oSelected = oEvent.value || oEvent;
    this.m_oProject.templateId = oSelected.id || oSelected.templateId || oSelected;
    this.m_oSelectedTemplateObj = oSelected; // Update the UI state
  }

  // Add these two navigation methods:
  viewSelectedTemplate() {
    if (this.m_oProject.templateId) {
      this.m_oTemplateState.setState(this.m_oProject.templateId, 'view');
      this.m_oTabChange.emit('create-template');
    }
  }

  createNewTemplate() {
    this.m_oTemplateState.setState(null, 'create');
    this.m_oTabChange.emit('create-template');
  }



  // --- HELPERS ---
  private toEpochMillis(sDateString: string): number | null {
    if (!sDateString) return null;
    return new Date(sDateString).getTime();
  }

  private fromEpochToDateString(iEpochMillis: number | null): string {
    if (!iEpochMillis) return "";
    const oDate = new Date(iEpochMillis);
    return oDate.toISOString().split('T')[0];
  }

  // --- ACTIONS ---
  closeView() {
    this.m_oTabChange.emit('projects');
  }

  switchToEdit(): void {
    this.m_sMode = 'edit';
    this.m_oProjectState.m_sMode = 'edit';
  }

  onSave() {
    if (this.m_sMode === 'edit') {
      this.updateProject();
    } else {
      this.saveProject();
    }
  }

  private buildPayload() {
    // Extract checked tasks into an array
    const aoTasksList = Object.keys(this.m_oTasks).filter(sKey => (this.m_oTasks as any)[sKey]);

    return {
      name: this.m_oProject.name,
      description: this.m_oProject.description || null,
      link: this.m_oProject.link || null,
      isGlobal: this.m_oProject.isGlobal,
      bbox: this.m_oProject.isGlobal ? null : this.m_oProject.bbox,
      isPublic: this.m_oProject.isPublic,
      startDate: this.toEpochMillis(this.m_oProject.startDateStr),
      endDate: this.toEpochMillis(this.m_oProject.endDateStr),
      annotatorSeeAllLabels: this.m_oProject.annotatorSeeAllLabels,
      reviewRequired: this.m_oProject.reviewRequired,
      minReviewCount: this.m_oProject.reviewRequired ? Number(this.m_oProject.minReviewCount) : 0,
      missions: this.m_oProject.missions,
      tasks: aoTasksList,
      templateId: this.m_oProject.templateId
    };
  }

  saveProject() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oProject.name)) {
      this.m_oNotificationDisplayService.openAlertDialog("Project name is required.", "Error", "danger");
      return;
    }
    if (!this.m_oProject.templateId) {
      this.m_oNotificationDisplayService.openAlertDialog("Please select a Labelling Template.", "Error", "danger");
      return;
    }

    const oPayload = this.buildPayload();

    this.m_oProjectService.createProject(oPayload).subscribe({
      next: () => {
        this.m_oNotificationDisplayService.openSnackBar("Project created successfully!", "Close", "success-snackbar");
        this.closeView();
      },
      error: (oError: any) => {
        // --- FIX: ANGULAR PARSING TRAP ---
        // If status is 200, Java succeeded but Angular choked on the UUID string
        if (oError.status === 200 || oError.status === 201) {
          this.m_oNotificationDisplayService.openSnackBar("Project created successfully!", "Close", "success-snackbar");
          this.closeView();
        } else {
          console.error("Real Backend Error:", oError);
          this.m_oNotificationDisplayService.openAlertDialog("Failed to create project.", "Error", "danger");
        }
      }
    });
  }

  updateProject() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oProject.name)) {
      this.m_oNotificationDisplayService.openAlertDialog("Project name is required.", "Error", "danger");
      return;
    }

    const oPayload = this.buildPayload();

    // Replace with your actual update service method
    this.m_oProjectService.updateProject(this.m_sProjectId, oPayload).subscribe({
      next: () => {
        this.m_oNotificationDisplayService.openSnackBar("Project updated successfully!", "Close", "success-snackbar");
        this.closeView();
      },
      error: (oError: any) => {
        // Same parsing trap interceptor as Create
        if (oError.status === 200 || oError.status === 204) {
          this.m_oNotificationDisplayService.openSnackBar("Project updated successfully!", "Close", "success-snackbar");
          this.closeView();
        } else {
          console.error("Update Error:", oError);
          this.m_oNotificationDisplayService.openAlertDialog("Failed to update project.", "Error", "danger");
        }
      }
    });
  }
}
