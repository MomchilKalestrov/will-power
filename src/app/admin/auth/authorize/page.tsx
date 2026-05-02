'use client';
import Image from 'next/image';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { CircleAlert, Globe } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
    Card,
    CardTitle,
    CardHeader,
    CardContent,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import Icon from '@/components/icons/logo';

import claude from './claude.svg';
import vscode from './vscode.svg';

const CLIENT_META: Record<string, { name: string; icon: any; }> = {
    'seraphimcms-claude': {
        name: 'Claude',
        icon: claude 
    },
    'seraphimcms-vscode': {
        name: 'VS Code',
        icon: vscode
    }
};

const Page: NextPage = () => {
    const t = useTranslations('Admin.Authorize');
    const params = useSearchParams();
    const router = useRouter();
    const session = useSession();

    const serviceInfo: typeof CLIENT_META[ string ] | undefined = CLIENT_META[ params.get('client_id')! ];
    
    return (
        <main className='h-dvh w-dvw flex justify-center items-center'>
            <Card className='w-full max-w-sm'>
                <CardHeader>
                    <div className='grid grid-cols-[auto_1fr_auto_1fr_auto] gap-2 items-center'>
                        <Icon className='size-10' />
                        <div className='border-b-2 border-dashed' />
                        <CircleAlert className='opacity-50' />
                        <div className='border-b-2 border-dashed' />
                        {
                            serviceInfo
                            ?   <Image alt={ serviceInfo.name } src={ serviceInfo.icon } width={ 40 } height={ 40 } />
                            :   <Globe className='size-10' />
                        }
                    </div>
                    <CardTitle className='text-center'>{ t('title') }</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-y-2'>
                    <CardDescription className='text-center'>
                        {
                            serviceInfo
                            ?   t('textWithService', { service: serviceInfo?.name })
                            :   t('text')
                        }
                    </CardDescription>
                    <div className='grid grid-cols-2 gap-x-2 text-muted-foreground text-sm'>
                        <p className='justify-self-end'>{ t('username') }:</p><p>{ session.data?.user.name }</p>
                        <p className='justify-self-end'>{ t('role') }:</p><p>{ session.data?.user.role }</p>
                    </div>
                </CardContent>
                <CardFooter className='grid'>
                    <Button onClick={ () => router.push(params.get('redirect_uri')!) }>{ t('proceed') }</Button>
                </CardFooter>
            </Card>
        </main>
    );
};

export default Page;