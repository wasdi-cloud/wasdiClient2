import { Component, OnInit } from '@angular/core';
import { ConstantsService } from 'src/app/services/constants.service';
import { ProductService } from 'src/app/services/api/product.service';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { Product } from 'src/app/shared/models/product.model';
import { ProcessWorkspaceServiceService } from 'src/app/services/api/process-workspace.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  // Index of the actual Active Tab
  m_iActiveMapPanelTab: number = 0;
  // Default globe zoom
  GLOBE_DEFAULT_ZOOM: number = 2000000;

  //Last file downloaded
  m_oLastDownloadedProduct: any = null;
  //Pixel Info
  m_bIsVisiblePixelInfo: boolean = false;
  // List of the Band Items that are now visible
  m_aoVisibleBands: any[] = [];
  // List of external layers added
  m_aoExternalLayers: any[] = [];
  // Array of products of this workspace
  m_aoProducts: Product[];
  // List of computational nodes
  m_aoNodesList: any[] = [];
  // Flag to know if we are in Info mode on 2d map
  m_bIsModeOnPixelInfo: boolean = false;
  // Here a Workspace is needed... if it is null create a new one..
  m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
  // Actual User
  m_oUser = this.m_oConstantsService.getUser();
  //{}
  m_aoProductsLayersIn3DMapArentGeoreferenced = [];
  //default sort by value
  sSortType = 'default';

  //boolean value for Jupyter Notebook 
  m_bNotebookIsReady = false;

  constructor(private m_oConstantsService: ConstantsService, private m_oProductService: ProductService, private m_oProcessWorkspaceService: ProcessWorkspaceServiceService) {
  }


  ngOnInit(): void {
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();

    //Initalize the map

    //add the GeoSearch Plugin Bar

    //Initalize the globe

    //What to do if workspace is undefined 

    //If workspace is defined => Load Processes
    this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId)

    //load Products
    this.getProductList();

  }

  getProductList() {
    this.m_oProductService.getProductListByWorkspace(this.m_oActiveWorkspace.workspaceId).subscribe(response => {
      this.m_aoProducts = response
      console.log(this.m_aoProducts)
    })
  }
}
