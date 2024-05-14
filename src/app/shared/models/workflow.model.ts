export interface Workflow {
    description: string | null, 
    inputFileNames: Array<any> | null,
    inputNodeNames: Array<any> | null, 
    name: string, 
    nodeUrl: string, 
    outputFileNames: Array<any> | null,
    outputNodeNames: Array<any> | null, 
    public: boolean, 
    readOnly: boolean,
    sharedWithMe: boolean, 
    userId: string, 
    workflowId: string
}
