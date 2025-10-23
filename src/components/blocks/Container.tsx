import React from 'react';
import defaults from './defaults.module.css';

const metadata: NodeMetadata = {
    props: {
        type: {
            type: 'enum',
            default: 'div'
        }
    },
    attributes: {},
    styles: {
        background: {
            type: 'background',
            default: '#ffffff',
            in: 'Styling'
        },
        boxShadow: {
            type: 'shadow',
            default: 'none',
            in: 'Styling'
        },
        borderRadius: {
            type: 'css-units',
            default: '0px 0px 0px 0px',
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            count: 4,
            in: 'Styling'
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
        boxSizing: {
            type: 'keyword',
            default: 'content-box',
            in: 'Sizing'
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
        padding: {
            type: 'css-units',
            default: '0px 0px 0px 0px',
            count: 4,
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Sizing'
        },
        display: {
            type: 'keyword',
            default: 'flex',
            in: 'Layout'
        },
        gap: {
            type: 'css-units',
            default: '0px',
            count: 2,
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Layout',
            condition: {
                key: 'display',
                value: 'flex',
                or: {
                    key: 'display',
                    value: 'grid'
                }
            }
        },
        // flex
        flexDirection: {
            type: 'keyword',
            default: 'row',
            in: 'Layout',
            condition: {
                key: 'display',
                value: 'flex'
            }
        },
        justifyContent: {
            type: 'keyword',
            default: 'flex-start',
            in: 'Layout',
            condition: {
                key: 'display',
                value: 'flex'
            }
        },
        alignItems: {
            type: 'keyword',
            default: 'stretch',
            in: 'Layout',
            condition: {
                key: 'display',
                value: 'flex'
            }
        },
        flexWrap: {
            type: 'keyword',
            default: 'nowrap',
            in: 'Layout',
            condition: {
                key: 'display',
                value: 'flex'
            }
        },
        // grid
        gridTemplateColumns: {
            type: 'string',
            default: '1fr 1fr',
            in: 'Layout',
            condition: {
                key: 'display',
                value: 'grid'
            }
        },
        gridTemplateRows: {
            type: 'string',
            default: '1fr 1fr',
            in: 'Layout',
            condition: {
                key: 'display',
                value: 'grid'
            }
        }
    },
    enumerators: {
        display: { values: [ 'flex', 'grid' ] },
        flexDirection: {
            values: [ 'row', 'row-reverse', 'column', 'column-reverse' ],
            icon: true
        },
        justifyContent: {
            values: [ 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly' ],
            icon: true
        },
        alignItems: {
            values: [ 'stretch', 'flex-start', 'flex-end', 'center', 'baseline' ],
            icon: true
        },
        flexWrap: {
            values: [ 'nowrap', 'wrap', 'wrap-reverse' ],
            icon: true
        },
        boxSizing: {
            values: [ 'border-box', 'content-box' ],
            icon: false
        },
        position: {
            values: [ 'static', 'relative', 'fixed', 'sticky', 'absolute' ],
            icon: false
        },
        type: {
            values: [ 'div', 'section', 'aside', 'nav', 'header', 'footer' ]            
        }
    },
    acceptChildren: true
};

type Props = {
    type?: 'div' | 'section' | 'aside' | 'nav' | 'header' | 'footer';
};

const Container: React.FC<React.PropsWithChildren<Props>> = ({
    children,
    type: Element = 'div',
    ...props
}) => (
    <Element className={ defaults.Container } { ...props }>{ children }</Element>
);

export default Container;
export { metadata };
export { Box as Icon } from 'lucide-react';