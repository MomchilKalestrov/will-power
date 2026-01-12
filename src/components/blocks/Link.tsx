import React from 'react';
import Link from 'next/link';

import { getAllComponents } from '@/lib/db/actions/component';

import { metadata as buttonMetadata } from './Button';
import defaults from './defaults.module.css';

const filteredButtonMetadata = JSON.parse(JSON.stringify(buttonMetadata));
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
            values: await (async () => {
                const response = await getAllComponents('page');
                return response.success
                ?   response.value
                :   [ 'ERROR: ' + response.reason ];
            })()
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
