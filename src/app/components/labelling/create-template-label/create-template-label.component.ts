import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Router} from "@angular/router";
import {NotificationDisplayService} from "../../../services/notification-display.service";
import {LabellingTemplatesService} from "../../../services/api/labelling/labelling-templates.service";
import FadeoutUtils from "../../../lib/utils/FadeoutJSUtils";
import {TemplateStateService} from "../../../services/api/labelling/template-state.service";

@Component({
  selector: 'app-create-template-label',
  standalone: false,
  templateUrl: './create-template-label.component.html',
  styleUrl: './create-template-label.component.css',
})
export class CreateTemplateLabelComponent implements OnInit {
  m_sMode: 'create' | 'view' | 'edit' = 'create';
  m_sTemplateId: string | null = null;
  m_bIsLoading: boolean = false;
  // Create an event emitter to talk to the parent
  @Output() m_oTabChange = new EventEmitter<string>();
// Main Template Payload State
  m_oTemplate: any = {
    name: "",
    description: "",
    hasPolygons: false,
    hasLines: false,
    hasPoints: false,
    isFixedColour: true,
    fixedColourStr: "#FF0000", // UI Hex string
    colourAttributeName: ""
  };

  // Attribute Builder State
  m_aoAttributes: Array<any> = [];
  m_aoAttributeTypes: Array<string> = ['String', 'Integer', 'Float', 'Category'];

  m_oNewAttribute: any = {
    name: "",
    type: "String",
    isOptional: true,
    categoryValuesStr: "" // Comma separated string for the UI
  };

  constructor(
    private m_oRouter: Router,
    private m_oTemplateState: TemplateStateService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTemplateService: LabellingTemplatesService
  ) {
  }

  get m_bIsReadOnly(): boolean {
    return this.m_sMode === 'view';
  }

  ngOnInit(): void {
    this.m_sMode = this.m_oTemplateState.mode;
    this.m_sTemplateId = this.m_oTemplateState.templateId;
    if (this.m_sTemplateId) {
      this.loadTemplate(this.m_sTemplateId);
    }
  }

  switchToEdit(): void {
    this.m_sMode = 'edit';
    this.m_oTemplateState.mode = 'edit';
  }

  loadTemplate(sId: string): void {
    this.m_bIsLoading = true;
    this.m_oTemplateService.getById(sId).subscribe({
      next: (oResponse: any) => {
        if (oResponse) {
          // Map API response back to UI state
          this.m_oTemplate.name = oResponse.name;
          this.m_oTemplate.description = oResponse.description;
          this.m_oTemplate.hasPolygons = oResponse.hasPolygons;
          this.m_oTemplate.hasLines = oResponse.hasLines;
          this.m_oTemplate.hasPoints = oResponse.hasPoints;
          this.m_oTemplate.isFixedColour = oResponse.isFixedColour;
          this.m_oTemplate.fixedColourStr = oResponse.fixedColour
            ? '#' + oResponse.fixedColour.toString(16).padStart(6, '0')
            : '#FF0000';
          this.m_oTemplate.colourAttributeName = oResponse.colourAttributeName || '';

          // Map attributes back to UI shape
          this.m_aoAttributes = (oResponse.attributes || []).map((attr: any) => ({
            name: attr.name,
            type: this.mapAttributeTypeToUI(attr.type),  // UI uses lowercase
            isOptional: !attr.isMandatory,
            categoryValues: attr.categories?.map((val: string, i: number) => ({
              value: val,
              color: attr.colours?.[i] || 0,
              colorStr: attr.colours?.[i]
                ? '#' + attr.colours[i].toString(16).padStart(6, '0')
                : '#000000'
            })) || null
          }));
        }
        this.m_bIsLoading = false;
      },
      error: (oError) => {
        console.error('Error loading template:', oError);
        this.m_bIsLoading = false;
      }
    });
  }

  // --- HANDLERS FOR MAIN INPUTS ---
  getUserInput(oEvent: any, sField: string) {
    this.m_oTemplate[sField] = oEvent.event ? oEvent.event.target.value : oEvent.target.value;
  }

  getNewAttributeInput(oEvent: any, sField: string) {
    this.m_oNewAttribute[sField] = oEvent.event ? oEvent.event.target.value : oEvent.target.value;
  }

  onTypeChange(oEvent: any) {
    // Safely extract the string value depending on how app-dropdown is built
    if (typeof oEvent === 'string') {
      this.m_oNewAttribute.type = oEvent;
    } else if (oEvent && oEvent.value) {
      this.m_oNewAttribute.type = oEvent.value; // Common for custom dropdowns
    } else if (oEvent && oEvent.name) {
      this.m_oNewAttribute.type = oEvent.name;
    } else if (oEvent && oEvent.event && oEvent.event.target) {
      this.m_oNewAttribute.type = oEvent.event.target.value;
    } else {
      this.m_oNewAttribute.type = "String"; // Safe fallback
    }
  }

  // --- ATTRIBUTE BUILDER LOGIC ---
  addAttribute() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oNewAttribute.name)) {
      this.m_oNotificationDisplayService.openAlertDialog("Attribute name is required.", "Warning", "warning");
      return;
    }

    let aoCategoryValues = null;
    let sSafeType = String(this.m_oNewAttribute.type || "String");

    if (sSafeType === 'Category') {
      if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oNewAttribute.categoryValuesStr)) {
        this.m_oNotificationDisplayService.openAlertDialog("Please provide comma-separated categories.", "Warning", "warning");
        return;
      }
      aoCategoryValues = this.m_oNewAttribute.categoryValuesStr
        .split(',')
        // NEW: Add colorStr initialized to black (#000000) for the UI picker
        .map((s: string) => ({value: s.trim(), color: 0, colorStr: '#000000'}))
        .filter((obj: any) => obj.value !== "");
    }

    this.m_aoAttributes.push({
      name: this.m_oNewAttribute.name,
      type: sSafeType.toLowerCase(),
      isOptional: this.m_oNewAttribute.isOptional,
      categoryValues: aoCategoryValues
    });

    this.m_oNewAttribute = {name: "", type: "String", isOptional: true, categoryValuesStr: ""};
  }

  // Checks if there are ANY category attributes added
  hasCategoryAttributes(): boolean {
    return this.m_aoAttributes.some(attr => attr.type === 'category');
  }

  // Returns an array of strings (names) for the dropdown
  getCategoryDropdownOptions(): string[] {
    return this.m_aoAttributes
      .filter(attr => attr.type === 'category')
      .map(attr => attr.name);
  }

  // Handles the dropdown selection
  onCategoryAttributeChange(oEvent: any) {
    if (typeof oEvent === 'string') {
      this.m_oTemplate.colourAttributeName = oEvent;
    } else if (oEvent && oEvent.value) {
      this.m_oTemplate.colourAttributeName = oEvent.value;
    }
  }

  // Gets the exact values (and their colors) for the currently selected attribute
  getSelectedCategoryValues(): any[] {
    if (!this.m_oTemplate.colourAttributeName) return [];

    const oSelectedAttr = this.m_aoAttributes.find(a => a.name === this.m_oTemplate.colourAttributeName);
    return oSelectedAttr && oSelectedAttr.categoryValues ? oSelectedAttr.categoryValues : [];
  }

  removeAttribute(index: number) {
    this.m_aoAttributes.splice(index, 1);
  }

  closeView() {
    this.m_oTabChange.emit('templates');
  }

  onSave(): void {
    if (this.m_sMode === 'edit') {
      this.updateTemplate();
    } else {
      this.saveTemplate();
    }
  }

  saveTemplate() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oTemplate.name)) {
      this.m_oNotificationDisplayService.openAlertDialog("Template name is required.", "Error", "danger");
      return;
    }
    this.m_oTemplateService.create(this.buildPayload()).subscribe({
      next: () => {
        this.m_oNotificationDisplayService.openSnackBar("Template saved successfully!", "Close", "success-snackbar");
        this.closeView();
      },
      error: (oError) => {
        console.error("Backend Error:", oError);
        this.m_oNotificationDisplayService.openAlertDialog("Failed to save template.", "Error", "danger");
      }
    });
  }

  updateTemplate() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oTemplate.name)) {
      this.m_oNotificationDisplayService.openAlertDialog("Template name is required.", "Error", "danger");
      return;
    }
    this.m_oTemplateService.update(this.m_sTemplateId,this.buildPayload()).subscribe({
      next: () => {
        this.m_oNotificationDisplayService.openSnackBar("Template updated successfully!", "Close", "success-snackbar");
        this.closeView();
      },
      error: (oError) => {
        console.error("Update error:", oError);
        this.m_oNotificationDisplayService.openAlertDialog("Failed to update template.", "Error", "danger");
      }
    });
  }
  private mapAttributeTypeToUI(sType: string): string {
    if (sType.toUpperCase() === 'TEXT') return 'string';
    return sType.toLowerCase(); // integer, float, category pass through
  }
  private mapAttributeType(sType: string): string {
    if (sType.toLowerCase() === 'string') return 'TEXT';
    return sType.toUpperCase(); // INTEGER, FLOAT, CATEGORY pass through unchanged
  }
  onCancel() {
    this.closeView()
  }

  private buildPayload(): any {
    let iFixedColour: number | null = null;
    if (this.m_oTemplate.isFixedColour && this.m_oTemplate.fixedColourStr) {
      iFixedColour = parseInt(this.m_oTemplate.fixedColourStr.replace(/^#/, ''), 16);
    }

    const aoFormattedAttributes = this.m_aoAttributes.map(attr => {
      let aoCategories: string[] = [];
      let aoColours: number[] = [];
      if (attr.type.toLowerCase() === 'category' && attr.categoryValues) {
        attr.categoryValues.forEach((cv: any) => {
          aoCategories.push(cv.value);
          aoColours.push(cv.colorStr ? parseInt(cv.colorStr.replace(/^#/, ''), 16) : 0);
        });
      }
      return {
        name: attr.name,
        type: this.mapAttributeType(attr.type),
        isMandatory: !attr.isOptional,
        categories: aoCategories,
        colours: aoColours
      };
    });

    return {
      name: this.m_oTemplate.name,
      description: this.m_oTemplate.description,
      hasPolygons: this.m_oTemplate.hasPolygons,
      hasLines: this.m_oTemplate.hasLines,
      hasPoints: this.m_oTemplate.hasPoints,
      isFixedColour: this.m_oTemplate.isFixedColour,
      fixedColour: iFixedColour,
      colourAttributeName: !this.m_oTemplate.isFixedColour ? this.m_oTemplate.colourAttributeName : null,
      attributes: aoFormattedAttributes
    };
  }
}
