'use client';
import React from 'react';
import { NextPage } from 'next';
import useNodeTree from '@/hooks/useNodeTree';
import RenderNode from '@/components/renderNode';
import { notFound, useRouter } from 'next/navigation';
import { getComponentByName } from '@/lib/db/actions/';
import { storage } from '@/lib/utils';

const Page: NextPage<PageProps<'/admin/viewer/[component]'>> = ({ params }) => {
    const router = useRouter();
    const { component } = React.use(params);
    const { tree, setTree } = useNodeTree();

    const onMessage = React.useCallback((event: MessageEvent) => {
        if (!component) return;
        switch (event.data.type) {
            case 'update-tree':
                setTree(storage.parse<Component>(component).rootNode);
                break;
        };
    }, [ component ]);

    const onTreeLoaded = React.useCallback(() => {
        window.top?.postMessage({
            type: 'status',
            payload: 'ready'
        });
    }, []);

    React.useEffect(() => {
        if (
            window.top === window.self &&
            new URLSearchParams(document.location.search).get('force') !== 'true'
        )
            router.replace(`/admin/editor/${ component }`);
    }, []);
    
    React.useEffect(() => {
        const localRevision: ComponentNode | undefined = storage.tryParse<Component | any>(component, {}).rootNode;
        
        if (!localRevision)
            getComponentByName(component).then((component) => {
                if (!component) return notFound();
                setTree(component.rootNode);
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