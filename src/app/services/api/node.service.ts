import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(private m_oConstantsService: ConstantsService, private m_oHttp: HttpClient) { 

  }

  /**
   * Get the full list of nodes all ACTIVE nodes
   * @returns 
   */
  getNodesList() {
    return this.m_oHttp.get<any[]>(this.APIURL + '/node/allnodes');
  };

  /**
   * Get the full list of all nodes (including inactive nodes)
   * @returns 
   */
  getFullNodesList() {
    return this.m_oHttp.get<any[]>(this.APIURL + '/node/allnodes?all=true')
  }

  /**
   * Get details of a node (selected by nodeCode)
   * @param sNodeCode 
   * @returns 
   */
  getNodeDetails(sNodeCode: string) {
    return this.m_oHttp.get(this.APIURL + '/node?node='+sNodeCode);
  };

   /**
   * Updates one Node
   * @param oNode 
   * @returns 
   */
    updateNode(oNode) {
      return this.m_oHttp.put(this.APIURL + '/node', oNode, { observe: 'response' });
    };
  
    /**
     * Deletes one node - NOT USED AT THE MOMENT
     * @param sUserId 
     * @returns 
     */
    deleteNode(sNodeCode: string) {
      return this.m_oHttp.delete(this.APIURL + '/node?node=' + sNodeCode);
    }; 

   /**
   * Insert a new Node
   * @param oNode 
   * @returns 
   */
    createNode(oNode) {
      return this.m_oHttp.post(this.APIURL + '/node', oNode, { observe: 'response' });
    };    
}
