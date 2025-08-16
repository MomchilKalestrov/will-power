'use client'
import { toPng } from 'html-to-image';

const SCREENSHOT_WIDTH = 384;
const SCREENSHOT_HEIGHT = 216;

const screenshot = (page: string): Promise<string> =>
    new Promise<string>((resolve, reject) =>{
        const iframe = document.createElement('iframe') as HTMLIFrameElement;

        const onReady = async (event: MessageEvent) => {
            if (event.source !== iframe.contentWindow) return;
            if (!(event.data.type === 'status' && event.data.payload === 'ready')) return;
            
            window.removeEventListener('message', onReady);
            
            const dataUrl = await toPng(iframe.contentDocument?.body!, {
                width: SCREENSHOT_WIDTH,
                height: SCREENSHOT_HEIGHT
            });
            
            iframe.remove();
            if (!dataUrl) return reject(new Error('Couldn\'t create a screenshot'));
            resolve(dataUrl);
        };

        window.addEventListener('message', onReady);
        
        iframe.style.width = SCREENSHOT_WIDTH * 5 + 'px';
        iframe.style.height = SCREENSHOT_HEIGHT * 5 + 'px';
        iframe.style.opacity = '0';
        iframe.src = `/admin/viewer/${ page }?force=true`;

        document.body.appendChild(iframe);
    });

export default screenshot;