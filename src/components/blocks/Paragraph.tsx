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
    enumerators: {}
};

type Props = {
    contents: string;
};

const Paragraph: React.FC<React.PropsWithChildren<Props>> = ({ 
    contents,
    children,
    ...props
}) => (
    <p { ...props }>{ contents }{ children }</p>
)

export default Paragraph;
export { metadata };
export { Text as Icon } from 'lucide-react';