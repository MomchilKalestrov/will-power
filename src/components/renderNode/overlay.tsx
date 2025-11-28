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

    const onDragEnter = React.useCallback((e: React.DragEvent<HTMLSpanElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add(styles.ForceOverlay);
    }, []);
    
    const onDragOver = React.useCallback((e: React.DragEvent<HTMLSpanElement>) => e.preventDefault(), []);

    const onDragLeave = React.useCallback((e: React.DragEvent<HTMLSpanElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove(styles.ForceOverlay);
    }, []);

    const onDrop = React.useCallback((e: React.DragEvent<HTMLSpanElement>) => {
        e.currentTarget.classList.remove(styles.ForceOverlay);
        window.top?.postMessage({
            type: 'reparent',
            payload: {
                child: e.dataTransfer?.getData('text/plain')!,
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