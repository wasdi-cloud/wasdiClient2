import { Band } from "./band.model"

export interface Product {
    bandsGroups: {
        bands?:Band[],
        nodeName: string,
        id?: number;
    },
    bbox: string,
    description: string,
    fileName: string,
    metadata: any,
    metadataFileCreated: string,
    metadataFileReference: any,
    name: string,
    productFriendlyName: string,
    style: any,
    productSize:string
}
