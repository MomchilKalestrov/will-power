import { getTranslations } from 'next-intl/server';
import { Metadata, NextComponentType, NextPageContext } from 'next';
//@ts-ignore
import '../globals.css';
import AddThemeDialog from './addThemeDialog';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('Admin.Themes');
    return { title: t('title')};
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin/themes'>> = async ({
    children
}) => {
    const t = await getTranslations('Admin.Themes');
    
    return (
        <>
            <header className='h-16 px-4 border-b bg-background flex justify-between items-center gap-4'>
                <h2 className='font-bold text-xl'>{ t('installedThemes') }</h2>
                <AddThemeDialog />
            </header>
            { children }
        </>
    );
};

export default Layout;