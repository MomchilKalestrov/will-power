import React from 'react';
import Link from 'next/link';
import { getAllComponents } from '@/lib/db/actions';
import { metadata as buttonMetadata } from './Button';
import defaults from './defaults.module.css';

let filteredButtonMetadata = JSON.parse(JSON.stringify(buttonMetadata));

delete filteredButtonMetadata.props.onClick;

const metadata: NodeMetadata = {
    ...filteredButtonMetadata,
    props: {
        ...filteredButtonMetadata.props,
        page: {
            type: 'enum'
        },
        title: {
            ...filteredButtonMetadata.props.title,
            default: 'Link'
        }
    },
    enumerators: {
        ...filteredButtonMetadata.enumerators,
        page: {
            values: await getAllComponents('page')
        }
    }
};


type Props = {
    page?: string;
    title?: string;
};

const Component: React.FC<React.PropsWithChildren<Props>> = ({
    page,
    title = 'Link',
    children,
    ...props
}) =>(
    <button
        { ...props }
        className={ defaults.Button }
    >
        {
            page
            ?   <Link href={ page }>
                    { title }{ children }
                </Link>
            :   <>{ title }{ children }</>
        }
    </button>
);

export { metadata, Component };
export { ExternalLink as Icon } from 'lucide-react';
