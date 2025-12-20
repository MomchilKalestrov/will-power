import { Metadata, NextComponentType, NextPageContext } from 'next';
//@ts-ignore
import '../globals.css';

export const metadata: Metadata = {
    title: 'Users'
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin/users'>> = ({
    children
}) => (
    <>
        <header className='h-16 px-4 border-b bg-background flex justify-between items-center gap-4'>
            <h2 className='font-bold text-xl'>Users</h2>
            <div id='add-user-portal' />
        </header>
        { children }
    </>
);

export default Layout;