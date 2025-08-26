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
    styles: {
        color: {
            type: 'color',
            default: '#ffffff',
            in: 'Styling'
        },
        background: {
            type: 'color',
            default: '#00000000',
            in: 'Styling',
        },
        font: {
            type: 'font',
            default: 'normal normal 1rem "Times New Roman", sans-serif',
            in: 'Styling'
        },
        textAlign: {
            type: 'keyword',
            default: 'start',
            in: 'Styling'
        },
        margin: {
            type: 'css-units',
            default: '0px',
            count: 4,
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Positioning'
        },
        position: {
            type: 'keyword',
            default: 'static',
            in: 'Positioning'
        },
        top: {
            type: 'css-units',
            default: '0px',
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Positioning',
            condition: {
                key: 'position',
                value: 'static',
                comparison: 'different'
            }
        },
        left: {
            type: 'css-units',
            default: '0px',
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Positioning',
            condition: {
                key: 'position',
                value: 'static',
                comparison: 'different'
            }
        },
        width: {
            type: 'css-units',
            default: '100%',
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Sizing',
        },
        height: {
            type: 'css-units',
            default: '100%',
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Sizing',
        },
        padding: {
            type: 'css-units',
            default: '0px 0px 0px 0px',
            count: 4,
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Sizing'
        },
    },
    enumerators: {
        type: {
            values: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]
        },
        position: {
            values: [ 'static', 'relative', 'fixed', 'sticky', 'absolute' ],
            icon: false
        },
        textAlign: {
            values: [ 'start', 'center', 'end', 'justify' ],
            icon: false
        }
    },
    acceptChildren: false
};

type Props = {
    contents?: string;
    type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

const Header: React.FC<React.PropsWithChildren<Props>> = ({
    type: Element = 'h1',
    contents = 'Hello world!',
    children,
    ...props
}) => (
    <Element { ...props }>
        <span dangerouslySetInnerHTML={ { __html: contents } } />
        { children }
    </Element>
);

export default Header;
export { metadata };
export { Heading as Icon } from 'lucide-react';