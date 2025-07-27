import React from 'react';

const metadata: NodeMetadata = {
    props: {},
    attributes: {},
    styles: {},
    enumerators: {}
};

type Props = {
    type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
};

const Header: React.FC<React.PropsWithChildren<Props>> = ({ children, type = 'h1', ...props }) =>
    React.createElement(type, props, children);

export default Header;
export { metadata };
export { Heading as Icon } from 'lucide-react';