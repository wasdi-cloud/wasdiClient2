import { Component, Input, OnChanges } from '@angular/core';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';

@Component({
  selector: 'app-app-reviews',
  templateUrl: './app-reviews.component.html',
  styleUrls: ['./app-reviews.component.css']
})
export class AppReviewsComponent implements OnChanges {
  @Input() oProcessor: any;
  reviews: {
    comment: string,
    date: number,
    id: string,
    processorId: string,
    title: string,
    userId: string,
    vote: number
  }[] = []
  constructor(private oProcessorMediaService: ProcessorMediaService) { }

  ngOnChanges(): void {
    if (this.oProcessor.friendlyName) {
      this.oProcessorMediaService.getProcessorReviews(this.oProcessor.processorName, 0, 4).subscribe(response => {
        this.reviews = response.reviews
      })
    }

  }
}
