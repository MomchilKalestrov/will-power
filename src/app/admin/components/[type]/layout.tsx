import { Metadata, NextComponentType, NextPageContext } from 'next';
// @ts-ignore
import '../../globals.css';

export const generateMetadata = async ({ params }: PageProps<'/admin/components/[type]'>): Promise<Metadata> => {
    const { type } = await params;
    return { title: type.charAt(0).toUpperCase() + type.substring(1) + 's' };
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin/components/[type]'>> = async ({
    children,
    params
}) =>(
    <>
        <header className='h-16 px-4 border-b bg-background flex justify-between items-center gap-4'>
            <h2 className='font-bold text-xl capitalize'>{ (await params).type }s</h2>
            <div id='components-portal' />
        </header>
        { children }
    </>
);

export default Layout;