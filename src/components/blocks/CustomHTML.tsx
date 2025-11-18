import React from 'react';

const metadata: NodeMetadata = {
    props: {
        code: {
            type: 'code',
            default: '<div></div>'
        }
    },
    attributes: {},
    styles: {
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
        background: {
            type: 'background',
            default: '#00000000',
            in: 'Styling',
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
    },
    enumerators: {
        position: {
            values: [ 'static', 'relative', 'fixed', 'sticky', 'absolute' ],
            icon: false
        }
    },
    acceptChildren: false
};


const clearAndUpper = (text: string) =>
  text.replace(/-/, "").toUpperCase();

const toCamelCase = (text: string) =>
  text.replace(/-\w/g, clearAndUpper);

type Props = {
    code?: string;
};

const Component: React.FC<Props> = ({
    code = '<div></div>'
}) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = code;
    const node = wrapper.firstChild as HTMLElement | null;
    if (!node) return <></>;
    if (node instanceof Text) return <>{ node.wholeText }</>;
    return React.createElement(node.nodeName.toLowerCase(), {
        ...[ ...node.attributes ]
            .reduce<any>((acc, { name, value }) => {
                switch (name) {
                    case 'class':
                        acc[ 'classList' ] = value;
                        break;
                    case 'style':
                        acc[ name ] =
                            value
                                .split(';')
                                .filter(Boolean)
                                .map(pair => pair.split(':').map(part => part.trim()))
                                .reduce<any>((acc, [ key, value ]) => {
                                    if (key.startsWith('--'))
                                        acc[ key ] = value;
                                    else
                                        acc[ toCamelCase(key) ] = value;
                                    return acc;
                                }, {});
                        break;
                    default:
                        acc[ name ] = value;
                }
                return acc;
            }, {}),
        dangerouslySetInnerHTML: {
            __html: node.innerHTML
        }
    })
};

export { metadata, Component };
export { Code2 as Icon } from 'lucide-react';