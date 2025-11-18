import React from 'react';

const metadata: NodeMetadata = {
    props: {
        contents: {
            type: 'string',
            default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        },
        className: {
            type: 'line',
            default: ''
        }
    },
    attributes: {},
    styles: {
        color: {
            type: 'color',
            default: '#000000',
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
            default: 'auto',
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