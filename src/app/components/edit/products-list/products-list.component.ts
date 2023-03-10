import { Component, Input } from '@angular/core';
import { Product } from 'src/app/shared/models/product.model';

//Angular Material Imports:
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { ConstantsService } from 'src/app/services/constants.service';

import { faDownload, faShareAlt, faTrash, faInfoCircle, faMap, faGlobeEurope } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from 'src/app/services/api/product.service';
import { CatalogService } from 'src/app/services/api/catalog.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductPropertiesDialogComponent } from './product-properties-dialog/product-properties-dialog.component';

interface ProductNode extends Product {
  selected?: boolean;
  indeterminate?: boolean;
}

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent {
  @Input() productArray: Product[];

  //font awesome icons
  faDownload = faDownload;
  faShare = faShareAlt;
  faTrash = faTrash;
  faInfoCircle = faInfoCircle;
  faGlobe = faGlobeEurope;
  faMap = faMap;
  //searchFilter: Subject<string> = new 

  m_oActiveBand;
  m_oActiveWorkspace;
  treeControl: NestedTreeControl<any>
  dataSource: MatTreeNestedDataSource<any>

  constructor(
    private m_oCatalogService: CatalogService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oFileBufferService: FileBufferService,
    private m_oProductService: ProductService
  ) {
    this.treeControl = new NestedTreeControl<any>(node => {
      if (node.bandsGroups) {
        return node.bandsGroups.bands
      }
    });
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnChanges() {
    this.dataSource.data = this.productArray;
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace()
  }

  hasChild(_: number, node: Product) {
    if (!node.bandsGroups) {
      return !!node
    } else {
      return !!node.bandsGroups.bands && node.bandsGroups.bands.length > 0
    }
  };

  findProductByName(node) {
    let oFoundProduct = this.productArray.find(oProduct => oProduct.fileName === node.fileName);
    return oFoundProduct
  }

  /**
   * Called from the Product list tree and executes a download of the product
   * @param node 
   */
  downloadProduct(node: any) {
    if (node.fileName) {
      this.downloadProductByName(node.fileName)
    }
  }

  /**
   * Takes a file name and creates download file for the product
   * @param sFileName 
   * @returns boolean
   */
  downloadProductByName(sFileName: string) {
    if (!sFileName) {
      return false;
    }
    let sUrl: string;
    if (this.m_oConstantsService.getActiveWorkspace().apiUrl) {
      sUrl = this.m_oConstantsService.getActiveWorkspace().apiUrl;
    }

    this.m_oCatalogService.newDownloadByName(sFileName, this.m_oActiveWorkspace.workspaceId, sUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = sFileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    })
    return true;
  }

  openProductProperties(event: MouseEvent) {
    const oDialogRef = this.m_oDialog.open(ProductPropertiesDialogComponent, {
      height: '85vh',
      width: '60vw'
    })
  }

  deleteProduct(node: any) {
    //Confirm Product Removal
    let bDeleteLayer = true;
    let bDeleteFile = true;

    //Get product from array
    let oFoundProduct = this.productArray.find(oProduct => oProduct.fileName === node.fileName);

    console.log(oFoundProduct);
    console.log(this.m_oActiveWorkspace.workspaceId)

    //Call m_oProductService.deleteProductFromWorkspace()
    this.m_oProductService.deleteProductFromWorkspace(oFoundProduct.fileName, this.m_oActiveWorkspace.workspaceId, bDeleteFile, bDeleteLayer).subscribe(oResponse => {
      if (oResponse.boolValue) {

      }
      console.log(oResponse)
    })

    //in subscription, 

    //if deletion successful, reload product tree

    //if deletion unsuccessful show dialog

  }

  /**
     * OPEN BAND IMAGE
     * Called from the tree to open a band
     * @param oBand
     */
  openBandImage(oBand) {
    let sFileName = this.productArray[oBand];
    let bAlreadyPublished = oBand.published;


    // this.m_oActiveBand = oBand;

    // // Geographical Mode On: geoserver publish band
    // this.m_oFileBufferService.publishBand(sFileName, this.m_oActiveWorkspace.workspaceId, oBand.name).subscribe(response=> {

    //   if (!bAlreadyPublished) {
    //     // var oDialog = utilsVexDialogAlertBottomRightCorner('PUBLISHING BAND ' + oBand.name);
    //     // utilsVexCloseDialogAfter(4000, oDialog);
    //     console.log("Already published")
    //   }

    //   // if (this.m_aoVisibleBands.length === 0) {
    //   //   this.setActiveTab(1);
    //   // }

    //   if (!response && response.messageResult !== "KO" && response.messageResult) {
    //     /*if the band was published*/

    //     if (response.messageCode === "PUBLISHBAND") {
    //       // Already published: we already have the View Model
    //       //this.receivedPublishBandMessage(data.data);
    //     } else {
    //       //this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);
    //       // It is publishing: we will receive Rabbit Message
    //       //if (data.data.messageCode !== "WAITFORRABBIT") this.setTreeNodeAsDeselected(oBand.productName + "_" + oBand.name);
    //     }

    //   } else {
    //     // var sMessage = this.m_oTranslate.instant("MSG_PUBLISH_BAND_ERROR");
    //     // utilsVexDialogAlertTop(sMessage + oBand.name);
    //     //this.setTreeNodeAsDeselected(oBand.productName + "_" + oBand.name);
    //   }
    // // }, (function (data, status) {
    // //   console.log('publish band error');
    // //   // var sMessage = this.m_oTranslate.instant("MSG_PUBLISH_BAND_ERROR");
    // //   // utilsVexDialogAlertTop(sMessage);
    // //   this.setTreeNodeAsDeselected(oBand.productName + "_" + oBand.name);
    // });
  };
}
