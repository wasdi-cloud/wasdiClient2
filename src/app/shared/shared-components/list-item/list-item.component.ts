import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.css']
})
export class ListItemComponent {
  /**
   * List item with picture, title, description and (optional) toolbar
   */
  @Input() m_bSimpleItem?: boolean = false;

  /**
   * Is the list item a parent? i.e., containing other list items - for providers in the Import Search Results page
   */
  @Input() m_bParentItem?: boolean = false;

  /**
   * Is the list item for a product? e.g., in the Import Search Results page.
   */
  @Input() m_bProductItem?: boolean = false;

  /**
   * Is the list item for a processor? e.g., in the Apps Dialog from the editor
   */
  @Input() m_bProcessorItem?: boolean = false;

  /**
   * Is there a toolbar component in the list item?
   */
  @Input() m_bHasToolbar?: boolean = false;

  /**
   * If the list item is a parent, is it "open"? 
   */
  @Input() m_bParentIsOpen?: boolean = false;

  /**
   * If the list item is selected
   */
  @Input() m_bIsSelected?: boolean = true;

  /**
   * Label that appears in bold for "simple list item"
   */
  @Input() m_sLabel: string = "Name";

  /**
   * Description that appears for "simple list item"
   */
  @Input() m_sDescription: string | number = "";

  /**
   * Product input for List item if it is a Product (e.g., in Search page)
   */
  @Input() m_oProductListItem?: any = {};

  /**
   * Processor input for list items passed by the Apps Dialog (i.e., processor cards)
   */
  @Input() m_oProcessorItem?: any = {};

  /**
   * Does this List item have an image on the left side?
   */
  @Input() m_bHasImg?: boolean = true;

  /**
   * Does the List item have an icon - what is the icon (string corresponds to Google Materials Icons)
   */
  @Input() m_sIcon?: string = "";

  /**
   * Light Product is a product item that displays LESS information
   */
  @Input() m_bIsLightProduct?: boolean = false;

  /**
   * Is the List item disabled? 
   */
  @Input() m_bIsDisabled?: boolean = false;

  /**
   * Callback function for opening the info dialog
   */
  @Input() m_oInfoCallbackFn?: (args: any) => void;

  /**
   * Callback function for zoom to bounds of a product 
   */
  @Input() m_oZoomCallbackFn?: (args: any) => void;

  /**
   * Callback function to open the add to workspace dialog
   */
  @Input() m_oAddCallbackFn?: (args: any) => void;

  /**
   * Click emitter for location of clicked button in Processor Item
   */
  @Output() m_oEmitClickEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private m_oDialog: MatDialog,
    private m_oMapService: MapService,
    private m_oProcessorService: ProcessorService
  ) { }

  /**
   * Emitter function to emit the location of the button clicked to the apps dialog
   * @param sLocation 
   */
  emitToolbarClick(sLocation: string): void {
    this.m_oEmitClickEvent.emit(sLocation);
  }

  /**
   * Extracts date from the product list tiem and removes 'z'
   * @param oProductListItem 
   * @returns sDate
   */
  getFormatDateString(oProductListItem): string {
    let sDate: string;
    // Most missions return the product date in the properties attribute
    if (oProductListItem.properties.date) {
      sDate = oProductListItem.properties.date.slice(0, -1);
    }

    // Some missions return the product date in the summary (e.g., VIIRS, ERA5, etc.)
    if (oProductListItem.summary) {
      // For SOME the date attribute is capitalized ('Date')
      if (oProductListItem.summary.Date) {
        sDate = oProductListItem.summary.Date.slice(0, -1);
      }
      // For others, the date attribute is not ('date')
      if (oProductListItem.summary.date) {
        sDate = oProductListItem.summary.date.slice(0, -1);
      }
    }
    return sDate;
  }
}
