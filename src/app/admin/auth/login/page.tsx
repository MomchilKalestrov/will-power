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
import { useTranslations } from 'next-intl';

const redirectPage: string = '/admin/components/page';

const getToken = async (): Promise<string> => {
    const request = await fetch('/api/get-token');
    return await request.text();
};

const Page: NextPage = () => {
    const t = useTranslations('Admin.Login');
    const params = useSearchParams();
    const router = useRouter();
    const session = useSession();

    const proceed = React.useCallback(async () => {
        // special exception for when loggin in for VSCode
        if (params.get('redirect_uri')) {
            let url = params.get('redirect_uri')!;
            if (!url.endsWith('/'))
                url += '/';
            
            const redirectUrl = new URL(url);
            redirectUrl.searchParams.append('token', await getToken())

            return router.replace(redirectUrl.toString());
        };

        router.replace(params.get('callbackUrl') ?? redirectPage);
    }, []);
    
    React.useEffect(() => void (session.status === 'authenticated' && proceed()), [ session ]);

    const onSignIn = React.useCallback(async (data: FormData) =>
        void await signIn('credentials', { 
            username: data.get('username'),
            password: data.get('password')
        })
    , [ params ]);
    
    return (
        <main className='h-dvh w-dvw flex justify-center items-center'>
            <Card>
                <CardHeader>
                    <CardTitle>{ t('title') }</CardTitle>
                    <CardDescription>
                        {
                            params.has('error')
                            ?   <p className='text-red-900'>
                                    { t('errorWrong') }
                                </p>
                            :   t('welcomeDesc')
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={ onSignIn } className='grid gap-4'>
                        <section className='grid gap-2'>
                            <Label htmlFor='username'>{ t('labelName') }</Label>
                            <Input
                                name='username'
                                id='username'
                                required={ true }
                            />
                        </section>
                        <section className='grid gap-2'>
                            <Label htmlFor='password'>{ t('labelPassword') }</Label>
                            <Input
                                name='password'
                                id='password'
                                type='password'
                                required={ true }
                            />
                        </section>
                        <Button>{ t('submitButton') }</Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
};

export default Page;