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
   * Product input for List item
   */
  @Input() m_oProductListItem?: any = {};

  @Input() m_oProcessorItem?: any = {};

  @Input() m_bHasImg?: boolean = true;
  
  @Input() m_sIcon?: string = "";

  @Input() m_sImageSize?: string = "";

  @Input() m_bIsLightProduct?: boolean = false;

  @Input() m_bIsDisabled?: boolean = false;
  @Input() m_oInfoCallbackFn?: (args: any) => void;

  @Input() m_oZoomCallbackFn?: (args: any) => void;

  @Input() m_oAddCallbackFn?: (args: any) => void;

  @Output() m_oEmitClickEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private m_oDialog: MatDialog,
    private m_oMapService: MapService,
    private m_oProcessorService: ProcessorService
  ) { }

  emitToolbarClick(sLocation: string) {
    this.m_oEmitClickEvent.emit(sLocation)
  }
}
