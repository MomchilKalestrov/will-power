import { ComponentDbProvider } from '@/components/componentDb';
import './globals.css';

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => (
    <html lang='en'>
        <body>
            <ComponentDbProvider>
                { children }
            </ComponentDbProvider>
        </body>
    </html>
);

export default RootLayout;