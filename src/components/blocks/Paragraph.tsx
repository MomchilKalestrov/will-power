import React from 'react';

const metadata: NodeMetadata = {
    props: {},
    attributes: {},
    styles: {},
    enumerators: {}
};

const Paragraph: React.FC<React.PropsWithChildren> = ({ children, ...props }) =>
    <p { ...props }>{ children }</p>

export default Paragraph;
export { metadata };
export { Text as Icon } from 'lucide-react';