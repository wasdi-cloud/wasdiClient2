import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConstantsService } from '../../../services/constants.service';
import { NotificationDisplayService } from '../../../services/notification-display.service';
// Replace with your actual Project Service path!

import { TemplateStateService } from '../../../services/api/labelling/template-state.service';
import {ProjectService} from "../../../services/api/project.service";
import {LabellingProjectsService} from "../../../services/api/labelling/labelling-projects.service";
import {LabellingProjectsStateService} from "../../../services/api/labelling/labelling-projects-state.service"; // Reusing for tab state if needed

@Component({
  selector: 'app-labelling-projects',
  templateUrl: './labelling-projects.component.html',
  styleUrls: ['./labelling-projects.component.css'],
  standalone: false
})
export class LabellingProjectsComponent implements OnInit {

  @Output() m_oTabChange = new EventEmitter<string>();

  // State Management
  m_aoProjects: any[] = [];
  m_bIsLoading: boolean = true;
  m_sError: string | null = null;
  m_sCurrentUserId: string | null = null;
  m_bIsLoggedIn: boolean = false;

  // Filters
  m_sSearchText: string = '';
  m_sSelectedMission: string = '';
  m_sSelectedTask: string = '';
  m_bIncludeGlobal: boolean = true;

  // Dropdown Options
  m_aoMissions = [
    { value: "", label: "All Missions" },
    { value: "S2", label: "Sentinel-2" },
    { value: "CUSTOM", label: "Custom Mission" }
  ];

  m_aoTasks = [
    { value: "", label: "All Tasks" },
    { value: "SEMANTING_SEGMENTATION", label: "Semantic Segmentation" },
    { value: "OBJECT_DETECTION", label: "Object Detection" },
    { value: "OTHER", label: "Other" }
  ];

  constructor(
    private m_oRouter: Router,
    private m_oProjectService: LabellingProjectsService,
    private m_oConstantService: ConstantsService,
    private m_oProjectState: LabellingProjectsStateService,
    private m_oNotificationService: NotificationDisplayService
  ) {}

  ngOnInit(): void {
    const oUser = this.m_oConstantService.getUser();
    this.m_sCurrentUserId = oUser?.userId  || null;
    this.m_bIsLoggedIn = !!this.m_sCurrentUserId;

    this.loadProjects();
  }

  // --- DATA FETCHING ---
  loadProjects() {
    this.m_bIsLoading = true;
    this.m_sError = null;

    this.m_oProjectService.getProjectsByUser().subscribe({
      next: (oResponse: any) => {
        // FIX 1: Safely extract the array so .filter() doesn't crash!
        let aoData = oResponse.body ? oResponse.body : oResponse;

        if (Array.isArray(aoData)) {
          this.m_aoProjects = aoData;
        } else {
          this.m_aoProjects = [];
        }

        this.m_bIsLoading = false;
      },
      error: (oError: any) => {
        console.error("Error fetching projects:", oError);
        this.m_sError = "Could not load projects. Please try again.";
        this.m_bIsLoading = false;
      }
    });
  }

  // --- FILTER LOGIC ---
  get filteredProjects() {
    let oResult = this.m_aoProjects;

    if (!this.m_bIncludeGlobal) {
      // FIX 2: Java sends p.isGlobal, not p.aoi.isGlobal!
      oResult = oResult.filter(p => !p.isGlobal);
    }

    if (this.m_sSearchText) {
      oResult = oResult.filter(p => p.name && p.name.toLowerCase().includes(this.m_sSearchText.toLowerCase()));
    }

    if (this.m_sSelectedMission) {
      oResult = oResult.filter(p => p.mission === this.m_sSelectedMission);
    }

    if (this.m_sSelectedTask) {
      oResult = oResult.filter(p => p.tasks && p.tasks.includes(this.m_sSelectedTask));
    }

    return oResult;
  }

  get bHasActiveFilters(): boolean {
    return !!this.m_sSearchText || !!this.m_sSelectedMission || !!this.m_sSelectedTask || !this.m_bIncludeGlobal;
  }

  handleClearFilters() {
    this.m_sSearchText = '';
    this.m_sSelectedMission = '';
    this.m_sSelectedTask = '';
    this.m_bIncludeGlobal = true;
  }

  navigateToCreate() {
    console.log("here")
    this.m_oProjectState.setState(null, 'create'); // Clean state
    this.m_oTabChange.emit('create-project');
  }

  // FIX 1: Tell the function to accept the mode ('view' or 'edit')
  navigateToProject(sProjectId: string, sMode: 'view' | 'edit') {
    this.m_oProjectState.setState(sProjectId, sMode); // Pass the requested mode dynamically!
    this.m_oTabChange.emit('create-project');
  }

  // FIX 2: Add the placeholder Open function
  openProject(sProjectId: string) {
    console.log("🚀 Open Project clicked for ID:", sProjectId, "- Placeholder, doing nothing for now!");
    // Future logic: Route to the actual labelling map/workspace!
  }

  handleLeaveProject(oProject: any) {
    // if (oProject.userRole?.toUpperCase() === 'OWNER' && oProject.ownersCount <= 1) {
    //   this.m_oNotificationService.openAlertDialog("You are the only owner. Invite another co-owner or delete the project.", "Warning", "warning");
    //   return;
    // }
    // if (confirm(`Are you sure you want to leave ${oProject.name}?`)) {
    //   this.m_oProjectService.leaveProject(oProject.id, this.m_sCurrentUserId).subscribe({
    //     next: () => {
    //       this.m_oNotificationService.openSnackBar("You have left the project.", "Close", "success-snackbar");
    //       this.loadProjects();
    //     },
    //     error: () => this.m_oNotificationService.openAlertDialog("Failed to leave project.", "Error", "danger")
    //   });
    // }
  }

  handleDeleteProject(oProject: any) {
    // if (confirm(`⚠️ WARNING: Are you sure you want to completely delete "${oProject.name}"? This action cannot be undone.`)) {
    //   this.m_oProjectService.delete(oProject.id).subscribe({
    //     next: () => {
    //       this.m_oNotificationService.openSnackBar("Project deleted successfully.", "Close", "success-snackbar");
    //       this.loadProjects();
    //     },
    //     error: () => this.m_oNotificationService.openAlertDialog("Failed to delete project.", "Error", "danger")
    //   });
    // }
  }

  // Helper for UI Badges
  getRoleBadgeClass(sRole: string): string {
    switch (sRole?.toUpperCase()) {
      case 'OWNER': return 'bg-primary';
      case 'REVIEWER': return 'bg-success';
      case 'ANNOTATOR': return 'bg-warning text-dark';
      case 'GUEST': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }
}
