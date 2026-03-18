import { getTranslations } from 'next-intl/server';
import { Metadata, NextComponentType, NextPageContext } from 'next';
//@ts-ignore
import '../globals.css';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('Admin.Users');
    return { title: t('title') };
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin/users'>> = async ({
    children
}) => {
    const t = await getTranslations('Admin.Users');
    return (
        <>
            <header className='h-16 px-4 border-b bg-background flex justify-between items-center gap-4'>
                <h2 className='font-bold text-xl'>{ t('title') }</h2>
                <div id='add-user-portal' />
            </header>
            { children }
        </>
    );
};

export default Layout;