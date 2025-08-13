'use client';
import React from 'react';
import { NextPage } from 'next';
import useNodeTree from '@/hooks/useNodeTree';
import RenderNode from '@/components/renderNode';
import { useRouter } from 'next/navigation';

type Props = {
    params: Promise<{ page: string }>
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

    React.useEffect(() => {
        if (window.top === window.self)
            router.replace(`/admin/editor/${ page }`);
    }, []);
    
    React.useEffect(() => {
        setTree(JSON.parse(localStorage.getItem(page)!).rootNode);

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [ page ]);

    if (!tree) return null;

    return <RenderNode node={ tree } editor={ true } />;
};

export default Page;