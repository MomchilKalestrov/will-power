'use client';
import React from 'react';
import { NextPage } from 'next';
import useNodeTree from '@/hooks/useNodeTree';
import RenderNode from '@/components/renderNode';
import { notFound, useRouter } from 'next/navigation';
import { getComponentByName } from '@/lib/db/actions';

type Props = {
    params: Promise<{ page: string }>;
};

const Page: NextPage<Props> = ({ params }) => {
    const router = useRouter();
    const { page } = React.use(params);
    const { tree, setTree } = useNodeTree();

    const onMessage = React.useCallback((event: MessageEvent) => {
        if (!page) return;
        switch (event.data.type) {
            case 'update-tree':
                setTree(JSON.parse(localStorage.getItem(page)!).rootNode);
                break;
        };
    }, [ page ]);

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
            router.replace(`/admin/editor/${ page }`);
    }, []);
    
    React.useEffect(() => {
        const localRevision: ComponentNode | undefined = JSON.parse(localStorage.getItem(page) || '{}').rootNode;
        
        if (!localRevision)
            getComponentByName(page).then((component) => {
                if (!component) return notFound();
                setTree(component.rootNode);
            });
        else
            setTree(localRevision);

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [ page ]);

    if (!tree) return null;

    return <RenderNode node={ tree } editor={ true } onTreeLoaded={ onTreeLoaded } />;
};

export default Page;