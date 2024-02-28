import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  @Input() m_sLabel: string = "EdriftListflood";

  /**
   * Description that appears for "simple list item"
   */
  @Input() m_sDescription: string | number = "";

  /**
   * Product input for
   */
  @Input() m_oProductListItem?: any = {};

  @Input() m_sIcon?: string = "image";

  @Input() m_sImageSize?: string = "1.65GB";

  @Input() m_bIsLightProduct?: boolean = false;

  @Input() m_oInfoCallbackFn?: (args: any) => void;

  @Input() m_oZoomCallbackFn?: (args: any) => void;

  @Input() m_oAddCallbackFn?: (args: any) => void;

  constructor(
    private m_oDialog: MatDialog,
    private m_oMapService: MapService
  ) { }
}
