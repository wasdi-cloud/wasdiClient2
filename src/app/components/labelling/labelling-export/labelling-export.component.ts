import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LabellingProjectsStateService } from "../../../services/api/labelling/labelling-projects-state.service";
import { LabellingProjectsService } from "../../../services/api/labelling/labelling-projects.service"; // Adjust path!
import { NotificationDisplayService } from '../../../services/notification-display.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-labelling-export',
  templateUrl: './labelling-export.component.html',
  styleUrls: ['./labelling-export.component.css'],
  standalone: false
})
export class LabellingExportComponent implements OnInit {

  @Output() m_oTabChange = new EventEmitter<string>();

  m_sProjectId: string | null = null;
  m_sProjectTitle: string = "Current Project";

// ── THE FIX: Set these to true so the UI shows the toggles! ──
  m_bRawDataHosted: boolean = true;
  m_bReviewMode: boolean = true;

  m_bIncludeRawData: boolean = false; // Default un-checked to save bandwidth
  m_sLabelFilter: 'validated' | 'all' = 'validated'; // Default to validated
  m_bIsGenerating: boolean = false;

  constructor(
    private m_oProjectState: LabellingProjectsStateService,
    private m_oProjectService: LabellingProjectsService, // 👈 Inject your API service
    private m_oNotificationService: NotificationDisplayService
  ) {}

  ngOnInit(): void {
    this.m_sProjectId = this.m_oProjectState.m_sActiveProjectId;
    if (this.m_oProjectState.m_sLabellingProjectName) {
      this.m_sProjectTitle = this.m_oProjectState.m_sLabellingProjectName;
    }
  }

  goBackToProject(): void {
    this.m_oTabChange.emit('labels');
  }

  async handleDownload(): Promise<void> {
    if (!this.m_sProjectId) return;

    this.m_bIsGenerating = true;

    const oExportPayload = {
      projectId: this.m_sProjectId,
      includeRawData: this.m_bIncludeRawData,
      labelFilter: this.m_bReviewMode ? this.m_sLabelFilter : "all"
    };

    try {
      console.log('Sending export payload:', oExportPayload);

      // ── THE REAL API CALL ──
      const blob = await lastValueFrom(this.m_oProjectService.exportDataset(oExportPayload));

      // Create a temporary hidden link to force the browser to download the Blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const sSafeName = this.m_sProjectTitle.replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `ComapVeda_Export_${sSafeName}.zip`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      this.m_oNotificationService.openSnackBar("✅ Export package downloaded successfully!", "Close", "success-snackbar");

      // Go back automatically after success
      setTimeout(() => {
        this.goBackToProject();
      }, 1500);

    } catch (oError: any) {
      console.error("Error generating export package.", oError);

      // ── THE FIX: Gracefully handle the 404 "Empty" response ──
      if (oError.status === 404) {
        // If Java sent a text message, display it! Otherwise, use a friendly default.
        const sErrorMessage = (typeof oError.error === 'string')
          ? oError.error
          : "There are no labels matching your filters to export.";

        this.m_oNotificationService.openAlertDialog(
          sErrorMessage,
          "Nothing to Export",
          "warning" // Use a yellow warning instead of a red danger alert
        );
      } else {
        // Handle actual 500 server crashes
        this.m_oNotificationService.openAlertDialog(
          "Failed to generate export package. Please try again.",
          "Export Error",
          "danger"
        );
      }

    } finally {
      this.m_bIsGenerating = false;
    }
  }
}
