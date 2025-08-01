import React from 'react';
import styles from './overlay.module.css'; 

type Props = {
    id: string;
    zIndex: number
};

const Overlay: React.FC<Props> = ({ id, zIndex }) => {
    const select = React.useCallback(() =>
        window.top?.postMessage({
            type: 'select',
            payload: id
        })
    , [ id ]);

    return (
        <span
            onClick={ select }
            style={ { zIndex } }
            className={ styles.Overlay }
        />
    );
};

export default Overlay;