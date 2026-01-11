'use client';
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
    parent: string;
};

const Portal: React.FC<React.PropsWithChildren<Props>> = ({ children, parent }) => {
    const [ isMounted, setMounted ] = React.useState<boolean>(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (isMounted) return ReactDOM.createPortal(children, document.getElementById(parent)!);
};

export default Portal;