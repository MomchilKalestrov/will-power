import React from 'react';

const metadata: NodeMetadata = {
    props: {
        code: {
            type: 'code',
            default: '<div></div>'
        }
    },
    attributes: {},
    styles: {},
    enumerators: {},
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