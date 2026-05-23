'use client';
import React from 'react';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
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
import { Spinner } from '@/components/ui/spinner';

const Page: NextPage = () => {
    const t = useTranslations('Admin.Login');
    const params = useSearchParams();
    const router = useRouter();
    const session = useSession();
    const [ loading, setLoading ] = React.useState<boolean>(false);

    const proceed = React.useCallback(async () => {
        if (params.get('redirect_uri')) {            
            const redirectUrl = new URL(window.location.href);
            redirectUrl.pathname = '/admin/auth/authorize';
            return router.push(redirectUrl.toString());
        };

        router.push(params.get('callbackUrl') ?? '/admin/components/page');
    }, []);
    
    React.useEffect(() => void (session.status === 'authenticated' && proceed()), [ session ]);

    const onSignIn = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.stopPropagation();
        event.preventDefault();

        const data = new FormData(event.currentTarget);

        setLoading(true);
        signIn('credentials', { 
            username: data.get('username'),
            password: data.get('password')
        }).finally(() => setLoading(false));
    }, [ params ]);
    
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
                    <form onSubmit={ onSignIn } className='grid gap-4'>
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
                        <Button disabled={ loading }>
                            { loading && <Spinner /> }
                            { t('submitButton') }
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
};

export default Page;