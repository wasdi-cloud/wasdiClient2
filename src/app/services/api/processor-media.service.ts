import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Reviews } from 'src/app/shared/models/reviews.model';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessorMediaService {

  APIURL: string = this.oConstantsService.getAPIURL();
  m_sResource: string = "/processormedia";

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  /**
     * Get the list of Application Categories
     * @returns {*}
     */
  getCategories() {
    return this.oHttp.get(this.APIURL + this.m_sResource + '/categories/get');
  };

  /**
   * Get the list of publisher for filtering
   * @returns {*}
   */
  getPublishersFilterList() {
    return this.oHttp.get(this.APIURL + this.m_sResource + '/publisher/getlist');
  };

  /**
   * Upload or Update Processor logo
   * @param sWorkspaceId
   * @param sProcessorId
   * @param oBody
   * @returns {*}
   */
  uploadProcessorLogo(sProcessorId: string, oBody: object) {

    var oOptions = {
      //transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    };

    //return this.oHttp.post(this.APIURL + this.m_sResource + '/logo/upload?processorId=' + encodeURI(sProcessorId), oBody, oOptions);
  };

  /**
   * Upload Processor Image
   * @param sProcessorId
   * @param oBody
   * @returns {*}
   */
  uploadProcessorImage(sProcessorId: string, oBody: object) {

    var oOptions = {
      //transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    };

    //return this.oHttp.post(this.APIURL + this.m_sResource + '/images/upload?processorId=' + encodeURI(sProcessorId), oBody, oOptions);
  };

  /**
   * Removes one of the images of the processor
   * @param sProcessorId
   * @param sImage
   * @returns {*}
   */
  removeProcessorImage(sProcessorId: string, sImage: string) {
    return this.oHttp.delete(this.APIURL + this.m_sResource + '/images/delete?processorId=' + encodeURI(sProcessorId) + "&imageName=" + sImage);
  };

  /**
   * Get the review summary of an application
   * @param sProcessorName
   * @param iPage
   * @param iItemsPerPage
   * @returns {*}
   */
  getProcessorReviews(sProcessorName: string, iPage: number, iItemsPerPage: number) {
    return this.oHttp.get<Reviews>(this.APIURL + this.m_sResource + '/reviews/getlist?processorName=' + sProcessorName + '&page=' + iPage + "&itemsPerPage=" + iItemsPerPage);
  }

  /**
   * Get the comments list of a review
   * @param sReviewId
   * @param iPage
   * @param iItemsPerPage
   * @returns {*}
   */
  getReviewComments(sReviewId: string, iPage: number, iItemsPerPage: number) {
    return this.oHttp.get(this.APIURL + this.m_sResource + '/comments/getlist?reviewId=' + sReviewId + '&page=' + iPage + "&itemsPerPage=" + iItemsPerPage);
  }

  /**
   * Add a new Review
   * @param oReview
   * @returns {*}
   */
  addProcessorReview(oReview: object) {
    return this.oHttp.post(this.APIURL + this.m_sResource + '/reviews/add', oReview);
  }

  /**
   * Add a new Comment to a Review
   * @param oComment
   * @returns {*}
   */
  addReviewComment(oComment: object) {
    return this.oHttp.post(this.APIURL + this.m_sResource + '/comments/add', oComment);
  }

  /**
   * Update a Review
   * @param oReview
   * @returns {*}
   */
  updateProcessorReview(oReview: object) {
    return this.oHttp.post(this.APIURL + this.m_sResource + '/reviews/update', oReview);
  }

  /**
   * Update a Comment of a Review
   * @param oComment
   * @returns {*}
   */
  updateReviewComment(oComment: object) {
    return this.oHttp.post(this.APIURL + this.m_sResource + '/comments/update', oComment);
  }

  /**
   * Delete a review
   * @param oReview
   * @returns {*}
   */
  deleteProcessorReview(sProcessorId: string, sReviewId: string) {
    return this.oHttp.delete(this.APIURL + this.m_sResource + '/reviews/delete?processorId=' + encodeURI(sProcessorId) + '&reviewId=' + encodeURI(sReviewId));
  }

  /**
   * Delete a Comment of a Review
   * @param oComment
   * @returns {*}
   */
  deleteReviewComment(sReviewId: string, sCommentId: string) {
    return this.oHttp.delete(this.APIURL + this.m_sResource + '/comments/delete?reviewId=' + encodeURI(sReviewId) + '&commentId=' + encodeURI(sCommentId));
  }

}
