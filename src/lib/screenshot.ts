'use client'
import { toPng } from 'html-to-image';

const SCREENSHOT_WIDTH = 1920;
const SCREENSHOT_HEIGHT = SCREENSHOT_WIDTH * 9 / 16;

const iFrameStyle: React.CSSProperties = {
    position: 'fixed',
    top: '0px',
    left: '0px',
    zIndex: '100',
    transform: 'scale(0.5, 0.5',
    opacity: '0',
    display: 'none',
    width: SCREENSHOT_WIDTH + 'px',
    height: SCREENSHOT_HEIGHT + 'px'
};

const sleep = (time: number): Promise<void> =>
    new Promise<void>(resolve => setTimeout(resolve, time));

const screenshot = (page: string): Promise<string> => {
    return new Promise<string>(async resolve => {
        const token = crypto.randomUUID();

        const iframe = document.createElement('iframe') as HTMLIFrameElement;

        const onReady = async (event: MessageEvent): Promise<void> => {
            await sleep(500); // to make sure the page has *really* rendered properly
            if (event.data.type !== 'status' || event.data.payload !== token) return;

            console.log('proceeding with screenshot for page', page, 'with token', token);
            
            window.removeEventListener('message', onReady);
            
            const dataUrl = await toPng(iframe.contentDocument?.body!, {
                width: SCREENSHOT_WIDTH,
                height: SCREENSHOT_HEIGHT
            });
            
            iframe.remove();
            resolve(dataUrl);
        };

        window.addEventListener('message', onReady);
        
        iframe.src = `/admin/viewer/${ page }?force=true&token=${ token }`;
        for (const [ key, value ] of Object.entries(iFrameStyle))
            iframe.style[ key as any ] = value;

        document.body.appendChild(iframe);
    });
};
    

export default screenshot;