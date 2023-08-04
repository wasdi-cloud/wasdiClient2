import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faFile, faFolder, faX } from '@fortawesome/free-solid-svg-icons';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
@Component({
  selector: 'app-package-manager',
  templateUrl: './package-manager.component.html',
  styleUrls: ['./package-manager.component.css']
})
export class PackageManagerComponent implements OnInit, OnDestroy {
  //Font Awesome Imports:
  faFolder = faFolder;
  faX = faX;

  m_aoPackages: Array<any> = [];

  m_bIsLoading: boolean = true;
  m_sWorkspaceName: string;
  m_sProcessorId: string;
  m_sPackageManagerName = "";
  m_sPackageManagerVersion = "";
  m_bIsEditing: boolean = false;
  m_sPackageName: string = "";
  m_iHookIndex: number;
  //SORTING


  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oDialogRef: MatDialogRef<PackageManagerComponent>,
    private m_oRabbitStompService: RabbitStompService) { }

  ngOnInit(): void {
    this.fetchPackageManagerInfo();
    this.fetchPackages();

    this.m_iHookIndex = this.m_oRabbitStompService.addMessageHook(
      "ENVIRONMENTUPDATE",
      this,
      this.rabbitMessageHook
    )
  }

  ngOnDestroy(): void {
    this.m_oRabbitStompService.removeMessageHook(this.m_iHookIndex);
    console.log("Remove")
  }

  /**
   * Fetch Information for Package Manager (Package Manager Name and Version)
   */
  fetchPackageManagerInfo() { }

  /**
   * Fetch Packages
   */
  fetchPackages() { }

  /**
   * Remove a Package (library): 
   */
  removeLibrary() { }

  /**
   * Add a Package (library): 
   */
  addLibrary() { }

  /**
   * Update the List of Packages:
   */
  updateLibraryList() { }

  /**
   * Update a single package (library): 
   */
  updateLibrary() {

  }

  rabbitMessageHook(oRabbitMessage) {
    this.fetchPackages();
    this.m_bIsLoading = false;
  }

  /**
   * Close Dialog
   */
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
