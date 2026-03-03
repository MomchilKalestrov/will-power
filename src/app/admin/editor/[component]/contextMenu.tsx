import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clipboard, Copy, Save, Scissors, Trash2 } from 'lucide-react';
import React from 'react';

type Props = {
    onSave: () => void;
    onCut: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onDelete: () => void;
    viewerRef: React.RefObject<HTMLIFrameElement | null>
};

const ContextMenu: React.FC<Props> = ({
    onSave,
    onCut,
    onCopy,
    onPaste,
    onDelete,
    viewerRef
}) => {
    const cardRef = React.useRef<HTMLDivElement>(null);

    const onRightClick = React.useCallback((event: PointerEvent) => {
        if (!cardRef.current) return;

        window.focus();
        event.preventDefault();

        const { width, height } = cardRef.current.getBoundingClientRect();
        let { x, y } = event;

        if (viewerRef.current?.contentWindow && event.view === viewerRef.current.contentWindow) {
            const rect = viewerRef.current.getBoundingClientRect();
            x += rect.left;
            y += rect.top;
        }

        if (width + x >= window.innerWidth)
            x -= width;
        if (height + y >= window.innerHeight)
            y -= height;

        cardRef.current.style.top = y + 'px';
        cardRef.current.style.left = x + 'px';
        cardRef.current.style.display = 'grid';

        let iframe: Element | null | undefined = document.elementFromPoint(x, y);
        if (iframe instanceof HTMLIFrameElement) {
            iframe
                .contentDocument
                ?.elementFromPoint(
                    x - (viewerRef.current?.getBoundingClientRect().left ?? 0),
                    y - (viewerRef.current?.getBoundingClientRect().top ?? 0)
                )
                ?.dispatchEvent(new PointerEvent('click', { ...event, bubbles: true }));
        }

    }, [ cardRef, viewerRef ]);

    const onNormalClick = React.useCallback((event: MouseEvent) => {
        if (!cardRef.current) return;

        const { width, height, x, y } = cardRef.current.getBoundingClientRect();
        
        if (
            event.x > x && event.x < width + x &&
            event.y > y && event.y < height + y
        ) return;

        cardRef.current.style.display = 'none';
    }, [ cardRef ]);

    const wrapper = React.useCallback((callback: () => void) => () => {
        callback();
        if (cardRef.current)
            cardRef.current.style.display = 'none';
    }, [ cardRef ]);

    React.useEffect(() => {
        window.addEventListener('mousedown', onNormalClick);
        window.addEventListener('contextmenu', onRightClick);
        viewerRef.current?.contentWindow?.addEventListener('mousedown', onNormalClick);
        viewerRef.current?.contentWindow?.addEventListener('contextmenu', onRightClick);
        return () => {
            window.removeEventListener('mousedown', onNormalClick);
            window.removeEventListener('contextmenu', onRightClick);
            viewerRef.current?.contentWindow?.removeEventListener('mousedown', onNormalClick);
            viewerRef.current?.contentWindow?.removeEventListener('contextmenu', onRightClick);
        };
    }, [ onRightClick, viewerRef ]);

    return (
        <Card className='p-2 gap-0 fixed hidden z-100' ref={ cardRef }>
            <Button variant='ghost' onClick={ wrapper(onSave) }>
                <Save />Save
            </Button>
            <Button variant='ghost' onClick={ wrapper(onCopy) }>
                <Scissors />Cut
            </Button>
            <Button variant='ghost' onClick={ wrapper(onCopy) }>
                <Copy />Copy
            </Button>
            <Button variant='ghost' onClick={ wrapper(onPaste) }>
                <Clipboard />Paste
            </Button>
            <Button variant='ghost' className='text-destructive' onClick={ wrapper(onDelete) }>
                <Trash2 />Delete
            </Button>
        </Card>
    );
};

export default ContextMenu;