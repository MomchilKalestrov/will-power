'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plug, ShoppingBag } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import AddPluginDialog from './addPluginDialog';

const Header: React.FC = () => {
    const path = usePathname().split('?')[ 0 ];
    const params = useParams();
    const router = useRouter();

    let name = '';
    if (path === '/admin/plugins')
        name = 'Installed plugins';
    else if (path.startsWith('/admin/plugins/marketplace/author'))
        name = 'Plugin author';
    else if (path.startsWith('/admin/plugins/marketplace/plugin'))
        name = 'Plugin';
    else
        name = 'Plugin marketplace';
    
    return (
        <header className='h-16 px-4 border-b bg-background flex justify-between items-center gap-4'>
            <h2 className='font-bold text-xl'>{ name }</h2>
            <div className='flex gap-2'>
                { path === '/admin/plugins' && <AddPluginDialog /> }
                <Button size='icon'>
                    {
                        params.name
                        ?   <span onClick={ () => router.back() }>
                                <ArrowLeft />
                            </span>
                        :   path === '/admin/plugins/marketplace'
                            ?   <Link href='/admin/plugins'>
                                    <Plug className='rotate-45' />
                                </Link>
                            :   <Link href='/admin/plugins/marketplace'>
                                    <ShoppingBag />
                                </Link>
                    }
                </Button>
            </div>
        </header>
    );
};

export default Header;