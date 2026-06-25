import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConstantsService} from "../../constants.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class LabelsService {
  APIURL: string = this.oConstantsService.getAPIURL() + '/labelling/labels';
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  constructor(private m_oHttp: HttpClient, private oConstantsService: ConstantsService) {
  }

  /**
   * get Label By Image
   * @returns
   * @param sDatasetId
   * @param sImageName
   */
  // GET: Fetch labels for a specific image and dataset
  getLabelsByImage(sDatasetId: string, sImageName: string): Observable<any[]> {
    return this.m_oHttp.get<any[]>(`${this.APIURL}/byimage?datasetId=${sDatasetId}&imageName=${sImageName}`);
  }

  // POST: Create a new label
  createLabel(oLabelViewModel: any): Observable<string> {
    return this.m_oHttp.post<string>(this.APIURL, oLabelViewModel);
  }

  // PUT: Update an existing label
  updateLabel(oLabelViewModel: any): Observable<any> {
    return this.m_oHttp.put(this.APIURL, oLabelViewModel);
  }

  // DELETE: Remove a label
  deleteLabel(sLabelId: string): Observable<any> {
    return this.m_oHttp.delete(`${this.APIURL}?labelId=${sLabelId}`);
  }
  /**
   * approve a label
   * @returns
   * @param sDatasetId
   * @param sLabelId
   * @param sImageName
   */
  approve(sDatasetId: string, sLabelId: string, sImageName: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/approve?dataset_id=' + sDatasetId + "&label_id=" + sLabelId + "&image_name=" + sImageName);
  };


  /**
   * reject a label
   * @param sNodeCode
   * @returns
   */
  reject(sDatasetId: string, sLabelId: string, sImageName: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/reject?dataset_id=' + sDatasetId + "&label_id=" + sLabelId + "&image_name=" + sImageName);
  };


}
