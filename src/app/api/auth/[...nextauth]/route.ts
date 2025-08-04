import argon2 from 'argon2';
import NextAuth, { AuthOptions } from 'next-auth';
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
            authorize: (credentials) =>
                new Promise(async (resolve) => {
                    console.log(credentials);
                    if (!credentials) return;
                    const { username, password } = credentials;

                    try {
                        await connect();
                        
                        const user = await User.findOne<User & { passwordHash?: string }>({ username });
                        if (!user || !(await argon2.verify(user.passwordHash!, password)))
                            return resolve(null);
                        
                        let res = { ...user };
                        delete res.passwordHash;

                        resolve(res);
                    } catch (error) {
                        console.error('Error signing in: ' + error);
                        resolve(null);
                    }
                })
        })
    ],
    pages: {
        signIn: '/admin/auth/login'
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };