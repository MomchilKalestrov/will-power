import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Metadata, NextComponentType, NextPageContext } from 'next';

import { hasAuthority } from '@/lib/utils';

import Header from './header';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

//@ts-ignore
import '../globals.css';

export const metadata: Metadata = {
    title: 'Plugins'
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