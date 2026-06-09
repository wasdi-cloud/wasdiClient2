import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Router} from "@angular/router";
import {LabellingTemplatesService} from "../../../services/api/labelling/labelling-templates.service";
import {ConstantsService} from "../../../services/constants.service";

@Component({
  selector: 'app-labelling-templates',
  templateUrl: './labelling-templates.component.html',
  styleUrl: './labelling-templates.component.css',
  standalone: false
})
export class LabellingTemplatesComponent implements OnInit {

  // Create an event emitter to talk to the parent
  @Output() m_oTabChange = new EventEmitter<string>();
  // State Management
  m_aoLabelTemplates: any[] = [];
  m_sSearchText: string = '';
  m_bIsLoading: boolean = true;
  m_sError: string | null = null;
  m_sCurrentUserId: string = 'Unknown User';

  constructor(
    private m_oRouter: Router,
    private m_oTemplateService: LabellingTemplatesService,
    private m_oConstantService: ConstantsService
  ) {
  }

  navigateToCreate() {
    // Tell the parent to change the @if statement!
    this.m_oTabChange.emit('create-template');
  }

  navigateToTemplate(sTemplateId: string, sMode: string) {
    // If you plan to use the same component for editing/viewing later,
    // you would emit the tab change and pass the ID via a shared service.
    // For now, let's just emit the tab change.
    this.m_oTabChange.emit('create-template');
  }

  // Filter Logic (Calculated getter)
  get filteredTemplates() {
    return this.m_aoLabelTemplates.filter(item =>
      item.name && item.name.toLowerCase().includes(this.m_sSearchText.toLowerCase())
    );
  }

  ngOnInit(): void {
    // Get Current User Session (matching oUser?.email logic)
    const oUser = this.m_oConstantService.getUser();
    this.m_sCurrentUserId = oUser?.userId || 'Unknown User';
    this.loadLabelTemplates();
  }

  // Fetch Data
  async loadLabelTemplates() {
    this.m_bIsLoading = true;
    this.m_sError = null;
    this.m_oTemplateService.getListByUser().subscribe(
      {
        next: (oResponse) => {
          if (oResponse) {
            console.log(oResponse);
            this.m_aoLabelTemplates = oResponse;
            console.log(this.m_aoLabelTemplates)
          } else {
            this.m_aoLabelTemplates = []
          }
          this.m_bIsLoading = false;

        },
        error: (oError) => {
          console.error("Error fetching templates:", oError);
          this.m_sError = "Could not load templates. Please try again.";
          this.m_bIsLoading = false;

        }
      }
    )
  }

  // Handle Search input change
  onSearchChange(oEvent: any) {
    this.m_sSearchText = oEvent.target.value;
  }

  // Format Date (fixed for millisecond timestamps)
  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';

    // Removed the * 1000 because the backend is already sending milliseconds
    return new Date(Number(timestamp)).toLocaleDateString("en-GB", {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  // Delete Handler
  handleDelete(sTemplateId: string) {
    if (confirm("Are you sure you want to delete this template?")) {
      this.m_aoLabelTemplates = this.m_aoLabelTemplates.filter(t => t.templateId !== sTemplateId);
    }
  }

  // // Navigation Handlers
  // navigateToCreate() {
  //   this.m_oRouter.navigate(['/create-label-template']);
  // }
  //
  // navigateToTemplate(sTemplateId: string, sMode: string) {
  //   // Passes the state object just like React Router's navigate()
  //   this.m_oRouter.navigate(['/create-label-template'], {
  //     state: {templateId: sTemplateId, mode: sMode}
  //   });
  // }
}
