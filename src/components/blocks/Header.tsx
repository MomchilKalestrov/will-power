import React from 'react';

const metadata: NodeMetadata = {
    props: {
        contents: {
            type: 'string',
            default: 'Hello world!'
        },
        type: {
            type: 'enum',
            default: 'h1'
        }
    },
    attributes: {},
    styles: {},
    enumerators: {
        type: {
            values: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]
        }
    }
};

type Props = {
    contents: string;
    type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

const Header: React.FC<React.PropsWithChildren<Props>> = ({
    type: Element = 'h1',
    contents,
    children,
    ...props
}) => (
    <Element { ...props }>{ contents }{ children }</Element>
);

export default Header;
export { metadata };
export { Heading as Icon } from 'lucide-react';