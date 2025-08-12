'use client'
import { toBlob } from 'html-to-image';

const SCREENSHOT_WIDTH = 384;
const SCREENSHOT_HEIGHT = 216;

const screenshot = (page: string): Promise<Blob> =>
    new Promise<Blob>((resolve, reject) =>{
        const iframe = document.createElement('iframe') as HTMLIFrameElement;

        iframe.onload = async () => {
            await new Promise<void>(resolve => {
                let count = 5;
                (function loop() {
                    count-- !== 0
                    ?   requestAnimationFrame(loop)
                    :   resolve();
                })();
            });
            
            const blob = await toBlob(iframe.contentDocument?.body!, {
                width: SCREENSHOT_WIDTH,
                height: SCREENSHOT_HEIGHT
            });
            
            if (!blob) return reject(new Error('Couldn\'t create a screenshot'));
            iframe.remove();
            resolve(blob);
        }
        
        iframe.style.width = SCREENSHOT_WIDTH + 'px';
        iframe.style.height = SCREENSHOT_HEIGHT + 'px';
        iframe.src = '/' + page;

        document.body.appendChild(iframe);

    });

export default screenshot;