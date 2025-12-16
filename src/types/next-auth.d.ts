import NextAuth, { DefaultSession } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface User {
        role?: 'editor' | 'admin' | 'owner';
    }

    interface Session {
        user: {
            role?: 'editor' | 'admin' | 'owner';
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        role?: 'editor' | 'admin' | 'owner';
    }
}