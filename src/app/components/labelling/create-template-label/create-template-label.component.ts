import {Component, EventEmitter, Output} from '@angular/core';
import {Router} from "@angular/router";
import {NotificationDisplayService} from "../../../services/notification-display.service";
import {LabellingTemplatesService} from "../../../services/api/labelling/labelling-templates.service";
import FadeoutUtils from "../../../lib/utils/FadeoutJSUtils";

@Component({
  selector: 'app-create-template-label',
  standalone: false,
  templateUrl: './create-template-label.component.html',
  styleUrl: './create-template-label.component.css',
})
export class CreateTemplateLabelComponent {

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
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTemplateService: LabellingTemplatesService
  ) {}

  ngOnInit(): void {}

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
        .map((s: string) => ({ value: s.trim(), color: 0, colorStr: '#000000' }))
        .filter((obj: any) => obj.value !== "");
    }

    this.m_aoAttributes.push({
      name: this.m_oNewAttribute.name,
      type: sSafeType.toLowerCase(),
      isOptional: this.m_oNewAttribute.isOptional,
      categoryValues: aoCategoryValues
    });

    this.m_oNewAttribute = { name: "", type: "String", isOptional: true, categoryValuesStr: "" };
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

  // --- API CALL & SAVING ---
  saveTemplate() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oTemplate.name)) {
      this.m_oNotificationDisplayService.openAlertDialog("Template name is required.", "Error", "danger");
      return;
    }

    // 1. Convert main feature color
    let iColorInt = 0;
    if (this.m_oTemplate.fixedColourStr) {
      iColorInt = parseInt(this.m_oTemplate.fixedColourStr.replace(/^#/, ''), 16);
    }

    // 2. Format Attributes exactly to the Java AttributeViewModel
    // Format Attributes exactly to the Java AttributeViewModel
    const aoFormattedAttributes = this.m_aoAttributes.map(attr => {

      let aoCategories: string[] = [];
      let aoColours: number[] = [];

      // Split the UI objects into parallel arrays for Java
      if (attr.type.toLowerCase() === 'category' && attr.categoryValues) {
        attr.categoryValues.forEach((cv: any) => {
          aoCategories.push(cv.value);
          aoColours.push(cv.colorStr ? parseInt(cv.colorStr.replace(/^#/, ''), 16) : 0);
        });
      }

      // --- THE FIX: STRICTLY UPPERCASE FOR JAVA ENUMS ---
      const sFormattedType = attr.type.toUpperCase();

      return {
        name: attr.name,
        type: sFormattedType,          // Will now send "CATEGORY", "STRING", "INTEGER"
        isMandatory: !attr.isOptional,
        categories: aoCategories,      // Safely sends [] instead of null
        colours: aoColours             // Safely sends [] instead of null
      };
    });

    // 3. Build the final payload
    const oPayload = {
      name: this.m_oTemplate.name,
      description: this.m_oTemplate.description,
      hasPolygons: this.m_oTemplate.hasPolygons,
      hasLines: this.m_oTemplate.hasLines,
      hasPoints: this.m_oTemplate.hasPoints,
      isFixedColour: this.m_oTemplate.isFixedColour,
      fixedColour: iColorInt,
      colourAttributeName: !this.m_oTemplate.isFixedColour ? this.m_oTemplate.colourAttributeName : null,
      attributes: aoFormattedAttributes
    };

    // Call Service
    this.m_oTemplateService.create(oPayload).subscribe({
      next: (oResponse) => {
        this.m_oNotificationDisplayService.openSnackBar("Template saved successfully!", "Close", "success-snackbar");
        this.closeView();
      },
      error: (oError) => {
        console.error("Backend Error:", oError);
        this.m_oNotificationDisplayService.openAlertDialog("Failed to save template.", "Error", "danger");
      }
    });
  }

  onCancel() {
    this.closeView()
  }
}
