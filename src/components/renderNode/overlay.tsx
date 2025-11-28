import React from 'react';
import styles from './overlay.module.css'; 

type Props = {
    id: string;
    zIndex: number;
};

const Overlay: React.FC<Props> = ({ id, zIndex }) => {
    const select = React.useCallback(() =>
        window.top?.postMessage({
            type: 'select',
            payload: id
        })
    , [ id ]);

    const onDragStart = React.useCallback((event: React.DragEvent<HTMLSpanElement>) => {
        event.dataTransfer?.setData('text/plain', id);
        if (event.dataTransfer)
            event.dataTransfer.effectAllowed = 'move';
    }, [ id ]);

    const onDragEnter = React.useCallback((event: React.DragEvent<HTMLSpanElement>) => {
        event.preventDefault();
        if (event.dataTransfer?.getData('text/plain') !== id)
            event.currentTarget.setAttribute('data-dragged-over', 'true');
    }, [ id ]);
    
    const onDragOver = React.useCallback((event: React.DragEvent<HTMLSpanElement>) => event.preventDefault(), []);

    const onDragLeave = React.useCallback((event: React.DragEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.currentTarget.setAttribute('data-dragged-over', 'false');
    }, []);

    const onDrop = React.useCallback((event: React.DragEvent<HTMLSpanElement>) => {
        event.currentTarget.setAttribute('data-dragged-over', 'false');
        window.top?.postMessage({
            type: 'reparent',
            payload: {
                child: event.dataTransfer?.getData('text/plain')!,
                parent: id
            }
        })
    }, [ id ]);

    return (
        <span
            onClick={ select }
            style={ { zIndex } }
            className={ styles.Overlay }
            draggable={ true }
            onDragStart={ onDragStart }
            onDragEnter={ onDragEnter }
            onDragOver={ onDragOver }
            onDragLeave={ onDragLeave }
            onDrop={ onDrop }
        ></span>
    );
};

export default Overlay;