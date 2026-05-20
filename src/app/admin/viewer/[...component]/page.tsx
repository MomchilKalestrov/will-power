'use client';
import React from 'react';
import { NextPage } from 'next';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import RenderNode from '@/components/renderNode';

import { storage } from '@/lib/utils';

import { getComponentByName } from '@/lib/db/actions/component';

const Page: NextPage = () => {
    const router = useRouter();
    const params = useSearchParams();
    const component = useParams<{ component: string[] }>().component.join('/');
    const [ tree, setTree ] = React.useState<ComponentNode>();

    const onMessage = React.useCallback((event: MessageEvent) => {
        if (!component) return;
        switch (event.data.type) {
            case 'update-tree':
                setTree(storage.parse<Component>(component).rootNode);
                break;
        };
    }, [ component ]);

    const onTreeLoaded = React.useCallback(() =>
        void window.top?.postMessage({
            type: 'status',
            payload: params.get('token')
        }),
        [ params ]
    );

    React.useEffect(() => {
        if (params.get('force') !== 'true')
            router.replace(`/admin/editor/${ component }`);
    }, [ params ]);
    
    React.useEffect(() => {
        const localRevision: ComponentNode | undefined = storage.tryParse<Component | any>(component, {}).rootNode;
        
        if (!localRevision)
            getComponentByName(component)
                .then(response => {
                    if (!response.success)
                        throw new Error('Failed loading the viewer: ' + response.reason);
                    setTree(response.value.rootNode);
                });
        else
            setTree(localRevision);

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [ component ]);

    if (!tree) return null;

    return <RenderNode node={ tree } editor={ true } onTreeLoaded={ onTreeLoaded } />;
};

export default Page;