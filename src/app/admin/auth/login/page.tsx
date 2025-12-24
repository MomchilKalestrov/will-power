'use client';
import React from 'react';
import { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
    Card,
    CardTitle,
    CardHeader,
    CardContent,
    CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const errors: Record<string, string> = {
    'CredentialsSignin': 'Invalid credentials. Please try again.'
};

const redirectPage: string = '/admin/components/page';

const getToken = async (): Promise<string> => {
    const request = await fetch('/api/get-token');
    return await request.text();
};

const Page: NextPage = () => {
    const params = useSearchParams();
    const router = useRouter();
    const session = useSession();

    const proceed = React.useCallback(async () => {
        // special exception for when loggin in for VSCode (to use the MCP server)
        if (params.get('redirect_uri')) {
            let url = params.get('redirect_uri')!;
            if (!url.endsWith('/'))
                url += '/';
            const newParams = {
                state: params.get('state')!,
                code: await getToken()
            };

            return router.replace(`${ url }?${ new URLSearchParams(newParams).toString() }`);
        };

        router.replace(params.get('callbackUrl') ?? redirectPage);
    }, []);
    
    React.useEffect(() => void (session.status === 'authenticated' && proceed()), [ session ]);

    const onSignIn = React.useCallback(async (data: FormData) => {
        const response = await signIn('credentials', { 
            username: data.get('username'),
            password: data.get('password')
        });
        if (response?.ok) proceed();
    }, [ params ]);
    
    return (
        <main className='h-dvh w-dvw flex justify-center items-center'>
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        {
                            params.has('error')
                            ?   <p className='text-red-900'>
                                    { errors[ params.get('error')! ] }
                                </p>
                            :   'Enter your credentials'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={ onSignIn } className='grid gap-4'>
                        <section className='grid gap-2'>
                            <Label htmlFor='username'>Username</Label>
                            <Input
                                name='username'
                                id='username'
                                required={ true }
                            />
                        </section>
                        <section className='grid gap-2'>
                            <Label htmlFor='password'>Password</Label>
                            <Input
                                name='password'
                                id='password'
                                type='password'
                                required={ true }
                            />
                        </section>
                        <Button>Log in</Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
};

export default Page;