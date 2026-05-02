import 'server-only';

export interface AuthCodeEntry {
    clientId:      string;
    redirectUri:   string;
    codeChallenge: string;

    id:       string;
    username: string;
    role:     User[ 'role' ];
    
    expiresAt: number;
}

export interface RefreshTokenEntry {
    id:       string;
    username: string;
    role:     User[ 'role' ];
    
    expiresAt: number;
}
 
export const authCodeStore     = new Map<string, AuthCodeEntry>();
export const refreshTokenStore = new Map<string, RefreshTokenEntry>();
