import { Component, Input } from '@angular/core';
import { Product } from 'src/app/shared/models/product.model';
import { Band } from 'src/app/shared/models/band.model';

//Angular Material Imports:
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { ConstantsService } from 'src/app/services/constants.service';

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
  m_oActiveBand;
  m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace()
  treeControl: NestedTreeControl<any>
  dataSource: MatTreeNestedDataSource<any>

  constructor(private m_oFileBufferService: FileBufferService, private m_oConstantsService: ConstantsService) {
    this.treeControl = new NestedTreeControl<any>(node => {
      if (node.bandsGroups) {
        return node.bandsGroups.bands
      }
    });
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnChanges() {
    this.dataSource.data = this.productArray;
  }

  hasChild(_: number, node: Product) {
    if (!node.bandsGroups) {
      return !!node
    } else {
      return !!node.bandsGroups.bands && node.bandsGroups.bands.length > 0
    }
  };

  /**
     * Get a list of bands for a product
     * @param oProductItem
     * @returns {Array}
     */
  // EditorController.prototype.getBandsForProduct = function (oProduct) {
  //   var asBands = [];

  //   var aoBands = oProduct.bandsGroups.bands;

  //   var iBandCount = 0;

  //   if (!utilsIsObjectNullOrUndefined(aoBands)) {
  //     iBandCount = aoBands.length;
  //   }

  //   for (var i = 0; i < iBandCount; i++) {
  //     var oBandItem = {};
  //     oBandItem.name = aoBands[i].name;
  //     oBandItem.productName = oProduct.name;
  //     oBandItem.productIndex = oProduct.selfIndex;
  //     oBandItem.height = aoBands[i].height;
  //     oBandItem.width = aoBands[i].width;

  //     if (!utilsIsObjectNullOrUndefined(aoBands[i].published)) {
  //       oBandItem.published = aoBands[i].published;
  //     } else {
  //       if (utilsIsStrNullOrEmpty(aoBands[i].layerId)) oBandItem.published = false;
  //       else oBandItem.published = true;
  //     }

  //     oBandItem.layerId = aoBands[i].layerId;
  //     oBandItem.bVisibleNow = false;
  //     oBandItem.bbox = oProduct.bbox;
  //     oBandItem.geoserverBoundingBox = aoBands[i].geoserverBoundingBox;
  //     oBandItem.geoserverUrl = aoBands[i].geoserverUrl;

  //     asBands.push(oBandItem);
  //   }

  //   return asBands;
  // };


  /**
   * Get the list of products for a Workspace
   */
  getProductListByWorkspace() {
    // if (utilsIsObjectNullOrUndefined(oController.m_oActiveWorkspace)) return;

    // this.m_oProductService.getProductListByWorkspace(oController.m_oActiveWorkspace.workspaceId).then(function (data, status) {

    //   if (utilsIsObjectNullOrUndefined(data.data) == false) {

    //     oController.m_aoProducts = []

    //     //push all products
    //     for (var iIndex = 0; iIndex < data.data.length; iIndex++) {

    //       //check if friendly file name isn't null
    //       if (utilsIsObjectNullOrUndefined(data.data[iIndex].productFriendlyName) == true) {
    //         data.data[iIndex].productFriendlyName = data.data[iIndex].name;
    //       }

    //       // Add the product to the list
    //       oController.m_aoProducts.push(data.data[iIndex]);
    //     }

    //     // i need to make the tree after the products are loaded
    //     oController.m_oTree = oController.generateTree();
    //     oController.m_bIsLoadingTree = false;

    //     if (oController.m_b2DMapModeOn === false) {
    //       oController.m_oMapService.addAllWorkspaceRectanglesOnMap(oController.m_aoProducts);
    //       oController.m_oMapService.flyToWorkspaceBoundingBox(oController.m_aoProducts);

    //     } else {
    //       oController.m_oGlobeService.addAllWorkspaceRectanglesOnMap(oController.m_aoProducts);
    //       oController.m_oGlobeService.flyToWorkspaceBoundingBox(oController.m_aoProducts);
    //     }


    //   }
    // }, (function (data, status) {
    //   var sMessage = this.m_oTranslate.instant("MSG_PRODUCT_LIST_ERROR")
    //   utilsVexDialogAlertTop(sMessage);
    // }));
  };


  /**
     * OPEN BAND IMAGE
     * Called from the tree to open a band
     * @param oBand
     */
  openBandImage(oBand, index) {
    let sFileName = this.productArray[oBand];
    let bAlreadyPublished = oBand.published;

    console.log(sFileName)
    console.log(index)
    console.log(oBand)

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
