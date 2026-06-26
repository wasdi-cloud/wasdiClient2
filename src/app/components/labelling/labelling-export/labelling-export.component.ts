import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {LabellingProjectsStateService} from "../../../services/api/labelling/labelling-projects-state.service";

// import { LabelService } from '...'; // Import your API service later

@Component({
  selector: 'app-labelling-export',
  templateUrl: './labelling-export.component.html',
  styleUrls: ['./labelling-export.component.css'],
  standalone: false
})
export class LabellingExportComponent implements OnInit {

  @Output() m_oTabChange = new EventEmitter<string>();

  m_sProjectId: string | null = null;
  m_sProjectTitle: string = "Current Project"; // You can pull this from state too!
  m_bRawDataHosted: boolean = false;
  m_bReviewMode: boolean = false;

  m_bIncludeRawData: boolean = false;
  m_sLabelFilter: 'validated' | 'all' = 'validated';
  m_bIsGenerating: boolean = false;

  constructor(private m_oProjectState: LabellingProjectsStateService) {
  }

  ngOnInit(): void {
    // ── Grab the active project directly from your state service! ──
    this.m_sProjectId = this.m_oProjectState.m_sActiveProjectId;

    // (Optional) If you have the project object stored in state, grab the title/settings here too:
    // this.m_sProjectTitle = this.m_oProjectState.m_oActiveProject?.name || "Current Project";
  }

  goBackToProject(): void {
    // Navigate back to the workspace, passing the ID back so it can reload
    this.m_oTabChange.emit('labels');
  }

  async handleDownload(): Promise<void> {
    this.m_bIsGenerating = true;

    const oExportPayload = {
      projectId: this.m_sProjectId,
      includeRawData: this.m_bIncludeRawData,
      labelFilter: this.m_bReviewMode ? this.m_sLabelFilter : "all"
    };

    try {
      console.log('Sending export payload:', oExportPayload);

      // TODO: Call your actual service here
      // const blob = await lastValueFrom(this.m_oLabelService.triggerExport(oExportPayload));

      // --- SIMULATED DELAY FOR NOW ---
      const blob = await new Promise<Blob>(resolve => {
        setTimeout(() => resolve(new Blob(['dummy content'], {type: 'application/zip'})), 2500);
      });

      // Create a temporary hidden link to force the browser to download it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ComapVeda_Export_${this.m_sProjectTitle.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Show success notification here (using your NotificationDisplayService)
      console.log("✅ Export package downloaded successfully!");

      // Go back automatically after success
      setTimeout(() => {
        this.goBackToProject();
      }, 1500);

    } catch (error) {
      console.error("Error generating export package.", error);
      // Show error notification here
    } finally {
      this.m_bIsGenerating = false;
    }
  }
}
