export interface Workspace {
    activeNode: boolean; 
    apiUrl: string; 
    creationDate: number;
    lastEditDate: number; 
    name: string; 
    nodeCode: string; 
    sharedUsers: Array<string>; 
    slaLink: string; 
    userId: string; 
    workspaceId: string; 
    workspaceName?: string;
}
