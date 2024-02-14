import { Component, Input } from '@angular/core';

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
}
