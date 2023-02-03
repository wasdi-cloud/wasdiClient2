import { Band } from "./band.model"

export interface Product {
    bandsGroups: {
        bands?:Band[],
        nodeName: string 
    }, 
    bbox: string, 
    description: string, 
    fileName: string, 
    metadata: any, 
    metadataFileCreated: string, 
    metadataFielReference: any, 
    name: string, 
    productFriendlyName: string, 
    style: any
}
