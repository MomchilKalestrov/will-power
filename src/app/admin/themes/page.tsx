'use client';
import { NextPage } from 'next';

import { useThemes } from '@/contexts/themes';

import ThemeCard from './themeCard';

const Page: NextPage = () => {
    const { themes } = useThemes();

    return (
        <div className='p-8 overflow-y-scroll h-[calc(100dvh-var(--spacing)*16)] flex flex-wrap justify-center items-start content-start gap-2'>
            <ThemeCard theme='default' />
            { themes.map(theme => (
                <ThemeCard key={ theme } theme={ theme } />
            )) }
        </div>
    )
};

export default Page;