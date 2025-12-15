import { Metadata, NextComponentType, NextPageContext } from 'next';
//@ts-ignore
import '../globals.css';
import Header from './header';

export const metadata: Metadata = {
    title: 'Plugins'
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin/plugins'>> = async ({ children }) => (
    <>
        <Header />
        { children }
    </>
);

export default Layout;