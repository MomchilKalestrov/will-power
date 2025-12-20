import { NextComponentType, NextPageContext } from 'next';
//@ts-ignore
import '../globals.css';

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin/variables'>> = ({
    children
}) => (
    <>
        <header className='h-16 px-4 border-b bg-background flex justify-between items-center gap-4'>
            <h2 className='font-bold text-xl'>Variables</h2>
            <div id='variables-button-portal' />
        </header>
        { children }
    </>
);

export default Layout;