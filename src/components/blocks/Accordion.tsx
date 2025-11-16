import React from 'react';
import defaults from './defaults.module.css';

const metadata: NodeMetadata = {
    props: {
        defaultOpen: {
            type: 'number',
            default: 1,
        },
        entries: {
            type: 'custom',
            structure: {
                type: 'array',
                key: 'tabs',
                structure: {
                    type: 'string',
                    key: 'title',
                    default: 'Title'
                }
            }
        },
    },
    attributes: {},
    styles: {
        background: {
            type: 'color',
            default: '#00000000',
            in: 'Container',
        },
        margin: {
            type: 'css-units',
            default: '0px',
            count: 4,
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Container'
        },
        width: {
            type: 'css-units',
            default: '100%',
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Container',
        },
        position: {
            type: 'keyword',
            default: 'static',
            in: 'Container'
        },
        top: {
            type: 'css-units',
            default: '0px',
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Container',
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
            in: 'Container',
            condition: {
                key: 'position',
                value: 'static',
                comparison: 'different'
            }
        },
        'header-color': {
            type: 'color',
            default: '#ffffff',
            in: 'Header'
        },
        'header-font': {
            type: 'font',
            default: 'normal normal 1rem "Times New Roman", sans-serif',
            in: 'Header'
        },
        'header-textAlign': {
            type: 'keyword',
            default: 'start',
            in: 'Header'
        },
        'header-padding': {
            type: 'css-units',
            default: '0px 0px 0px 0px',
            count: 4,
            units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
            in: 'Header'
        },
    },
    enumerators: {
        position: {
            values: [ 'static', 'relative', 'fixed', 'sticky', 'absolute' ],
            icon: false
        },
        'header-textAlign': {
            values: [ 'start', 'center', 'end', 'justify' ],
            icon: false
        }
    },
    acceptChildren: true
};

type Props = {
    onClick?: string;
    entries?: string[];
    defaultOpen?: number;
    style?: Record<string, string | number>;
};

const Component: React.FC<React.PropsWithChildren<Props>> = ({
    onClick = 'console.log("Hello, world!");',
    children,
    entries = [],
    defaultOpen = 1,
    style = {},
    ...props
}) => {
    let iterableChildren = React.Children.toArray(children);
    const {
        container,
        header,
        contents
    } = React.useMemo(() => {
        let buckets: Record<string, Record<string, string | number>> = {
            container: {},
            header: {},
            contents: {}
        };

        for (const [ categorizedKey, value ] of Object.entries(style)) {
            let bucket = 'container';
            let keyOnly = categorizedKey;
            if (categorizedKey.includes('-'))
                [ bucket, keyOnly ] = categorizedKey.split('-');
            buckets[ bucket ][ keyOnly ] = value;
        };

        return buckets;
    }, [ style ]);
    
    return (
        <div className={ defaults.AccordionContainer } style={ container } { ...props }>
            { entries.map((title, index) => (
                <div
                    key={ index }
                    className={ defaults.AccordionWrapper }
                    data-open={ (Number(defaultOpen) === index + 1).toString() }
                >
                    <div
                        className={ defaults.AccordionHeader }
                        style={ header }
                        onClick={ (event) => {
                            const accordion = event.currentTarget?.parentElement?.parentElement;
                            if (accordion)
                                for (const el of accordion.querySelectorAll('[data-open="true"]'))
                                    el.setAttribute('data-open', false.toString());

                            const current = event.currentTarget?.parentElement;
                            if (!current) return;
                            const isOpen = current.getAttribute('data-open') === 'true'; 
                            current.setAttribute('data-open', (!isOpen).toString());
                        } }
                    >{ title }</div>
                    <div style={ contents } className={ defaults.AccordionContents }>
                        {
                            (index < iterableChildren.length - 1) &&
                            iterableChildren[ index ]
                        }
                    </div>
                </div>
            )) }
            { iterableChildren[ iterableChildren.length - 1 ] }
        </div>
    );
};

export { metadata, Component };
export { Rows4 as Icon } from 'lucide-react';