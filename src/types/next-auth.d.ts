import { JWT as DefaultJWT } from 'next-auth/jwt';
import type NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        role?: 'editor' | 'admin' | 'owner';
    };

    interface Session {
        user: {
            id: string;
            name: string;
            role: 'editor' | 'admin' | 'owner';
        };
    };
};

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id?: string;
        role?: 'editor' | 'admin' | 'owner';
    };
};