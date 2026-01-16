import React from 'react';

const metadata: NodeMetadata = {
    props: {
        url: {
            type: 'file',
            format: 'image'
        }
    },
    attributes: {},
    styles: {},
    enumerators: {},
    acceptChildren: false
};

type Props = {
    url: string;
};

const Component: React.FC<React.PropsWithChildren<Props>> = ({
    url,
    children,
    ...props
}) => (
    children
    ?   <div { ...props }>
            <img { ...props } src={ process.env.NEXT_PUBLIC_BLOB_URL + '/' + url } />
            { children }
        </div>
    :   <img { ...props } src={ process.env.NEXT_PUBLIC_BLOB_URL + '/' + url } />
);

export { metadata, Component };
export { Heading as Icon } from 'lucide-react';