'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';

const paths: Record<string, string> = {
    config: '/admin/config',
    pages: '/admin/pages'
}

const SettingsPopover: React.FC = () => {
    const pathname = usePathname();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size='icon'>
                    <Logo />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='grid w-min p-2' align='start'>
                { Object.entries(paths).reduce<React.JSX.Element[]>((acc, [ name, path ]) => {
                    if (!pathname.startsWith(path))
                        acc.push(
                            <Button variant='ghost' key={ name }>
                                <Link href={ path } className='capitalize'>{ name }</Link>
                            </Button>
                        );
                    return acc;
                }, []) }
            </PopoverContent>
        </Popover>
    );
};
export default SettingsPopover;