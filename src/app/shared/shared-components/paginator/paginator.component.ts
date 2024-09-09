import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent implements OnChanges {
  /**
   * Is the paginator the full paginator (for use with tables) or partial (for use in sidebars)?
   */
  @Input() m_bFullPaginator: boolean = true;

  /**
   * Does the paginator include the dropdown option?
   */
  @Input() m_bShowItemsPerPage: boolean = true;

  /**
   * The default number of items per-page with a default of 10
   */
  @Input() m_iItemsPerPage: number = 10;

  /**
   * The total number of pages - optional as the calculation can be done in the component or the parent
   */
  @Input() m_iTotalPages?: number = 0;

  /**
   * The total number of items
   */
  @Input() m_iTotalItems: number = 0;

  /**
   * Option to show total pages - particularly for view models where the total items cannot be known
   */
  @Input() m_bShowTotalPages?: boolean = true;

  /**
   * Show the maximum page selection in the paginator (first page and last page buttons)
   */
  @Input() m_bMaxPaginator?: boolean = true;

  @Output() m_oClickEmitter: EventEmitter<any> = new EventEmitter<any>();

  @Output() m_iItemsPerPageChange: EventEmitter<any> = new EventEmitter<any>();


  m_aiItemsPerPage: Array<number> = [10, 15, 20, 25, 50];

  m_iCurrentPage: number = 1;

  m_bIsStepEnabled: boolean = true;

  m_bIsMinusEnabled: boolean = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.isButtonDisabled();
  }

  getTotalPages() {
    this.m_iTotalPages = this.m_iTotalItems / this.m_iItemsPerPage;
    return Math.ceil(this.m_iTotalPages);
  }

  getItemsPerPageChange(oEvent) {
    this.m_iItemsPerPage = oEvent.value;
    this.m_iCurrentPage = 1;

    this.isButtonDisabled();

    this.m_iItemsPerPageChange.emit(this.m_iItemsPerPage);
  }

  handlePagination(sLabel) {
    let oController = this;
    // Ensure the current page is within valid bounds (1 to total pages)
    if (this.m_iCurrentPage > oController.getTotalPages()) {
      this.m_iCurrentPage = oController.getTotalPages();
    }
    if (this.m_iCurrentPage < 1) {
      this.m_iCurrentPage = 1;
    }

    let oPagination = {
      previousPageIndex: this.m_iCurrentPage,
      pageIndex: null,
      pageSize: this.m_iItemsPerPage,
      length: this.m_iTotalItems
    }

    switch (sLabel) {
      case 'last':
        oPagination.pageIndex = oController.getTotalPages();
        this.m_iCurrentPage = oController.getTotalPages();
        break
      case 'first':
        oPagination.pageIndex = 1;
        this.m_iCurrentPage = 1;
        break
      case 'minus':
        this.m_iCurrentPage -= 1;

        if (this.m_iCurrentPage < 1) {
          this.m_iCurrentPage = 1;
        }
        oPagination.pageIndex = this.m_iCurrentPage;
        break;
      case 'step':
        this.m_iCurrentPage += 1;
        if (this.m_iCurrentPage > oController.getTotalPages()) {
          this.m_iCurrentPage = oController.getTotalPages();
        }
        oPagination.pageIndex = this.m_iCurrentPage;
        break;
      default:
    }
    this.isButtonDisabled();
    this.m_oClickEmitter.emit(oPagination);
  }

  isButtonDisabled() {
    let oController = this;

    if (oController.m_iItemsPerPage >= oController.m_iTotalItems) {
      oController.m_bIsMinusEnabled = false;
      oController.m_bIsStepEnabled = false;
    }

    if (oController.m_iItemsPerPage <= oController.m_iTotalItems) {
      oController.m_bIsMinusEnabled = true;
      oController.m_bIsStepEnabled = true;
    }
    //  else {
    //   oController.m_bIsMinusEnabled = true;
    //   oController.m_bIsStepEnabled = true;
    // }
    //If the Paginator current index === max page
    if (oController.m_iCurrentPage == 1) {
      oController.m_bIsMinusEnabled = false;
    } else if (oController.m_iCurrentPage > 1) {
      oController.m_bIsMinusEnabled = true;
    }

    if (oController.m_iCurrentPage === oController.getTotalPages()) {
      this.m_bIsStepEnabled = false;
    } else if (oController.m_iCurrentPage !== oController.getTotalPages()) {
      this.m_bIsStepEnabled = true;
    }
  }
}
