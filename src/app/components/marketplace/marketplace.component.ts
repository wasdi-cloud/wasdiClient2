import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.css']
})
export class MarketplaceComponent implements OnInit {
  m_oAppFilter = {
    categories: [],
    publishers: [],
    name: "",
    score: 0,
    minPrice: -1,
    maxPrice: 1000,
    itemsPerPage: 12,
    page: 0,
    orderBy: "name",
    orderDirection: 1
  }

  m_aoApplications: {
    buyed: boolean,
    friendlyName: string,
    imgLink: string,
    isMine: boolean,
    price: number,
    processorDescription: string,
    processorId: string,
    processorName: string,
    publisher: string,
    score: number,
    votes: number,
  }[] = [];

  closeResult = '';

  constructor(private oProcessorService: ProcessorService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.oProcessorService.getMarketplaceList(this.m_oAppFilter).subscribe(response => {
      console.log(response)
    })
  }
  open(content: any) {

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', keyboard: false }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
