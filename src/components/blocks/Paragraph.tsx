import React from 'react';

const metadata: NodeMetadata = {
    props: {
        contents: {
            type: 'string',
            default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        }
    },
    attributes: {},
    styles: {},
    enumerators: {},
    acceptChildren: false
};

type Props = {
    contents?: string;
};

const Component: React.FC<React.PropsWithChildren<Props>> = ({ 
    contents = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    children,
    ...props
}) => (
    <p { ...props }>
        <span dangerouslySetInnerHTML={ { __html: contents } } />
        { children }
    </p>
)

export { metadata, Component };
export { Text as Icon } from 'lucide-react';