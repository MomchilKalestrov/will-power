import React from 'react';
import defaults from './defaults.module.css';

const metadata: NodeMetadata = {
    props: {
        onClick: {
            type: 'code',
            default: 'console.log("Hello, world!");'
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
    styles: {},
    enumerators: {},
    acceptChildren: true
};

type Props = {
    onClick?: string;
    entries?: string[];
};

const Component: React.FC<React.PropsWithChildren<Props>> = ({
    onClick = 'console.log("Hello, world!");',
    children,
    entries = [],
    ...props
}) => {
    const iterableChildren = React.Children.toArray(children);
    console.log(entries)
    return (
        <div className={ defaults.AccordionContainer } { ...props }>
            { entries.map((title, index) => (
                <div
                    className={ defaults.AccordionWrapper }
                    data-open={ (window.top !== window.self).toString() }
                    onClick={ (event) => {
                        if (!event.currentTarget) return;
                        const isOpen = event.currentTarget.getAttribute('data-open') === 'true'; 
                        event.currentTarget.setAttribute('data-open', (!isOpen).toString())
                    } }
                >
                    <div className={ defaults.AccordionHeader }>
                        { title }
                    </div>
                    <div className={ defaults.AccordionContents }>
                        { iterableChildren[ index ] }
                    </div>
                </div>
            )) }
            { (children as any[])[ (children as any[]).length - 1 ] }
        </div>
    );
};

export { metadata, Component };
export { Rows4 as Icon } from 'lucide-react';