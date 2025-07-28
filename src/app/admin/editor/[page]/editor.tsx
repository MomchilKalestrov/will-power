'use client';
import React from 'react';
import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PropertiesPanel from '@/components/propertiesPanel';
import TreePanel from '@/components/treePanel';
import { getPageByName, savePage } from '@/lib/db/actions';
import useNodeTree from '@/hooks/useNodeTree';
import BlockPanel from '@/components/blocksPanel';

type Props = {
    page: string
};

const randomId = (): string => Math.floor(Math.random() * 9999).toString().padStart(4, '0');

const newNode = (type: string): PageNode => ({
    id: type + '-' + randomId(),
    type,
    style: {},
    attributes: {},
    children: [],
    props: {},
    acceptChildren: false
});

const metadataCache = new Map<string, NodeMetadata>();
const getMetadata = (type: string): NodeMetadata | null => {
    if (!type.match(/^[a-zA-Z]+$/)) return null; // check if it's a valid path

    if (metadataCache.has(type))
        return metadataCache.get(type)!;

    const metadata = require(`@/components/blocks/${ type }`).metadata;
    metadataCache.set(type, metadata);
    return metadata;
};

const Editor: React.FC<Props> = ({ page: pageName }) => {
    const { tree, setTree, findNode, updateNode, reparentNode, addNode } = useNodeTree();
    const [ selectedNode, setSelectedNode ] = React.useState<PageNode | undefined>();
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    React.useEffect(() => {
        if (!pageName) return;

        getPageByName(pageName)
            .then((remoteRevision) => {
                if (!remoteRevision)
                    notFound();

                const localRevisionString = localStorage.getItem(pageName);
                if (localRevisionString) {
                    const localRevision: Page = JSON.parse(localRevisionString);
                    if (localRevision.lastEdited < remoteRevision.lastEdited)
                        alert('A newer version is available on remote');
                    setTree(localRevision.rootNode);
                    return;
                }

                setTree(remoteRevision.rootNode);
                localStorage.setItem(pageName, JSON.stringify(remoteRevision));
            });
    }, [ pageName ]);

    React.useEffect(() => {
        if (!iframeRef.current || !tree) return
        
        localStorage.setItem(pageName, JSON.stringify({
            name: pageName,
            rootNode: tree,
            lastEdited: Date.now()
        }));

        iframeRef.current.contentWindow?.postMessage({
            type: 'update-tree',
            payload: tree
        }, '*');
    }, [ tree ]);

    const onMessage = React.useCallback((event: MessageEvent) => {
        switch (event.data.type) {
            case 'select':
                setSelectedNode(findNode(event.data.payload)!);
        }
    }, [ pageName, tree, findNode ]);

    const onReset = React.useCallback(async () => {
        const remoteRevision = await getPageByName(pageName);
        setTree(remoteRevision?.rootNode);
        localStorage.setItem(pageName, JSON.stringify(remoteRevision));
    }, [ pageName ]);
    
    React.useEffect(() => {
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [ pageName ]);

    React.useEffect(() => {
        if (!selectedNode) return;
        const updatedNode = findNode(selectedNode.id);
        if (updatedNode)
            setSelectedNode(updatedNode);
    }, [ tree, findNode, selectedNode ]);
    
    if (!tree) return null;
    
    const selectedNodeMetadata = selectedNode ? getMetadata(selectedNode.type) : null;

    return (
        <>
            <header className='h-16 w-full px-4 border-b bg-background flex justify-between items-center gap-4 shrink-0'>
                <Button className='size-9 p-0' variant='outline' onClick={ () => setSelectedNode(undefined) }>
                    <Plus />
                </Button>
                <section className='flex gap-2'>
                    <Button variant='outline' onClick={ onReset }>
                        Reset
                    </Button>
                    <Button onClick={ () => savePage({ name: pageName, rootNode: tree, lastEdited: Date.now() }) }>
                        Save
                    </Button>
                </section>
            </header>
            <main className='w-screen h-[calc(100dvh_-_var(--spacing)_*_16)] flex flex-col overflow-hidden bg-background'>
                <div className='flex flex-1 overflow-hidden'>
                    <Card className='min-w-32 max-w-[33%] overflow-hidden resize-x h-full rounded-none border-0 border-r bg-muted/20 p-4'>
                        { 
                            (selectedNode && selectedNodeMetadata)
                            ?   <PropertiesPanel
                                    node={ selectedNode }
                                    metadata={ selectedNodeMetadata }
                                    onNodeUpdate={ updateNode }
                                />
                            :   <BlockPanel onNodeAdd={ (type) => addNode(tree.id, newNode(type)) } />
                        }
                    </Card>
                    
                    <iframe 
                        ref={ iframeRef } 
                        src={ `/admin/viewer/${ pageName }` }
                        className='flex-grow h-full border-0'
                        title='Page Editor'
                    />

                    <Card
                        className='min-w-48 max-w-[33%] overflow-hidden resize-x h-full rounded-none border-l border-r-0 border-t-0 border-b-0 bg-muted/20 p-4 shadow-none'    
                        style={ { direction: 'rtl' } }
                    >
                        <div style={ { direction: 'ltr' } }>
                            <TreePanel node={ tree } onParentChange={ reparentNode } />
                        </div>
                    </Card>
                </div>
            </main>
        </>
    );
};

export default Editor;