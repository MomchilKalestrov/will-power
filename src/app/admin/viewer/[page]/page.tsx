'use client';
import React, { useState } from 'react';
import { NextPage } from 'next';
import useNodeTree from '@/hooks/useNodeTree';
import RenderNode from '@/components/renderNode';
import { useRouter } from 'next/navigation';

type Props = {
    params: Promise<{ page: string }>
};

const Page: NextPage<Props> = ({ params }) => {
    const router = useRouter();
    const { tree, setTree } = useNodeTree();
    const [ pageName, setPageName ] = useState<string | undefined>();

    const onMessage = React.useCallback((event: MessageEvent) => {
        if (!pageName) return;
        switch (event.data.type) {
            case 'update-tree':
                setTree(JSON.parse(localStorage.getItem(pageName)!).rootNode);
                break;
        };
    }, [ pageName ]);

    React.useEffect(() => {
        params.then(({ page }) => {
            if (window.top === window.self)
                router.replace(`/admin/editor/${ page }`);
            setPageName(page)
        });
    }, []);
    
    React.useEffect(() => {
        if (!pageName) return;
        
        setTree(JSON.parse(localStorage.getItem(pageName)!).rootNode);

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [ pageName ]);

    if (!tree) return null;

    return <RenderNode node={ tree } editor={ true } />;
};

export default Page;