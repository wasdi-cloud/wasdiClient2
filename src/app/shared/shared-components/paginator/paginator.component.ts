import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent {
  /**
   * Is the paginator the full paginator (for use with tables) or partial (for use in sidebars)?
   */
  @Input() m_bFullPaginator: boolean = true;

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

  @Output() m_oClickEmitter: EventEmitter<any> = new EventEmitter<any>();

  m_aiItemsPerPage: Array<number> = [10, 15, 20, 25, 50];

  m_iCurrentPage: number = 1;

  m_bIsStepEnabled: boolean = true;

  m_bIsMinusEnabled: boolean = false;

  constructor() { }

  getTotalPages() {
    this.m_iTotalPages = this.m_iTotalItems / this.m_iItemsPerPage;

    return Math.ceil(this.m_iTotalPages);
  }

  getItemsPerPageChange(oEvent) {
    this.m_iItemsPerPage = oEvent.value;
    this.m_iCurrentPage = 1;

    this.isButtonDisabled()
  }

  handlePagination(sLabel) {
    let oController = this;
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
        oPagination.pageIndex = this.m_iCurrentPage;
        break;
      case 'step':
        this.m_iCurrentPage += 1;
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
