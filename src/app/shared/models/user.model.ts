export interface User {
    authProvider: string;
    grantedAuthorities: Array<string>;
    name: string;
    role: string;
    type: string;
    sessionId: string;
    surname: string;
    userId: string;
    publicNickName: string;
}
