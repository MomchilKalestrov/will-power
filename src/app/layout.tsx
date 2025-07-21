import './globals.css';

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => (
    <html lang='en'>
        <body>
            { children }
        </body>
    </html>
);

export default RootLayout;