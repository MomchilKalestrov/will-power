import { getTranslations } from 'next-intl/server';
import { Metadata, NextComponentType, NextPageContext } from 'next';
// @ts-ignore
import '../../globals.css';

export const generateMetadata = async ({ params }: PageProps<'/admin/components/[type]'>): Promise<Metadata> => {
    const { type } = await params;
    const t = await getTranslations('Admin.Components');
    return {
        title: t('headerTitle', { type })
    };
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin/components/[type]'>> = async ({
    children,
    params
}) => {
    const { type } = await params;
    const t = await getTranslations('Admin.Components');

    return (
        <>
            <header className='h-16 px-4 border-b bg-background flex justify-between items-center gap-4'>
                <h2 className='font-bold text-xl capitalize'>{ t('headerTitle', { type }) }</h2>
                <div id='components-portal-cwd' />
                <div id='components-portal' />
            </header>
            { children }
        </>
    );
};

export default Layout;