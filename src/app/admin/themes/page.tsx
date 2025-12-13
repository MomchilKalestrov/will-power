'use client';
import { NextPage } from 'next';

import { useThemes } from '@/contexts/themes';

import AddThemeDialog from './addThemeDialog';
import ThemeCard from './themeCard';

const Page: NextPage = () => {
    const { themes } = useThemes();

    return (
        <div className='p-8 flex flex-wrap justify-center gap-2'>
            <ThemeCard theme='default' />
            { themes.map(theme => (
                <ThemeCard key={ theme } theme={ theme } />
            )) }
            <AddThemeDialog />
        </div>
    )
};

export default Page;