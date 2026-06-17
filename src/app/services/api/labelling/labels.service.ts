import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConstantsService} from "../../constants.service";

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
   * @param sPartialName
   * @returns
   */
  getByImage(sDatasetId: string, sImageName: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/getByImage?dataset_id=' + sDatasetId + '?image_name=' + sImageName);
  };

  /**
   * add label
   * @returns
   * @param oLabel
   */
  add(oLabel: any) {
    return this.m_oHttp.post(this.APIURL + '/add', oLabel);
  };

  /**
   * edit a label
   * @returns
   * @param oLabel
   */
  edit(oLabel: any) {
    return this.m_oHttp.post(this.APIURL + '/edit', oLabel);
  };

  /**
   * remove a label
   * @returns
   * @param sDatasetId
   * @param sLabelId
   * @param sImageName
   */
  delete(sDatasetId: string, sLabelId: string, sImageName: string) {
    return this.m_oHttp.delete<any>(this.APIURL + '/delete?dataset_id=' + sDatasetId + "&label_id=" + sLabelId + "&image_name=" + sImageName);
  };

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
