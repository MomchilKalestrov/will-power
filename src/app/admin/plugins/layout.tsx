import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { getTranslations } from 'next-intl/server';
import { Metadata, NextComponentType, NextPageContext } from 'next';

import { hasAuthority } from '@/lib/utils';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

import Header from './header';

//@ts-ignore
import '../globals.css';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('Admin.Plugins');
    return { title: t('title') };
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin/plugins'>> = async ({ children }) => {
    const session = await getServerSession(authOptions);

    if (!session?.user.role || !hasAuthority(session?.user.role, 'admin', 0))
        return redirect('/admin/home');

    return (
        <>
            <Header />
            { children }
        </>
    );
};

export default Layout;