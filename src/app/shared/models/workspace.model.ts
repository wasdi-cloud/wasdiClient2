export interface Workspace {
    activeNode: boolean;
    apiUrl: string;
    creationDate: number;
    lastEditDate: number;
    name: string;
    nodeCode: string;
    readOnly: boolean;
    sharedUsers: Array<string>;
    slaLink: string;
    userId: string;
    workspaceId: string;
    workspaceName?: string;
}
