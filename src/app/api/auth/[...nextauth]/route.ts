import argon2 from 'argon2';
import NextAuth, { type AuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import connect from '@/lib/db';
import User from '@/models/user';

const authOptions: AuthOptions = {
    providers: [
        Credentials({
            name: 'Login',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            authorize: async (credentials) => {
                    if (!credentials) return null;
                    const { username, password } = credentials;

                    try {
                        await connect();
                        
                        const user = await User.findOne({ username }).lean();
                        if (!user || !(await argon2.verify(user.passwordHash!, password)))
                            return null;

                        return {
                            id: user._id.toString(),
                            name: user.username,
                            role: user.role
                        };
                    } catch (error) {
                        console.error('[auth] Error signing in: ' + error);
                        return null;
                    }
                }
        })
    ],
    pages: {
        signIn: '/admin/auth/login'
    },
    callbacks: {
        jwt: ({ token, user }) => {
            if (user) {
                token.id = user.id ?? token.sub;
                token.role = user.role;
                token.name = user.name ?? undefined;
            };
            return token;
        },
        session: ({ session, token }) => {
            session.user = {
                ...session.user,
                id: token.id,
                role: token.role,
                name: token.name ?? session.user?.name
            } as typeof session.user;
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };