'use client';
import React from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import useNodeTree from '@/hooks/useNodeTree';
import { getPageByName, savePage } from '@/lib/db/actions';
import PropertiesPanel from '@/components/propertiesPanel';
import TreePanel from '@/components/treePanel';
import { ChevronRightIcon } from 'lucide-react';

type Props = {
    page: string
};

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
    const { tree, setTree, findNode, updateNode } = useNodeTree();
    const [ selectedNode, setSelectedNode ] = React.useState<PageNode | undefined>();
    const [ visibleRightPanel, setRightPanelVisibility ] = React.useState<boolean>(true);
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
        <main className='w-screen h-screen flex flex-col overflow-hidden bg-background'>
            <header className='h-16 w-full px-4 border-b bg-background flex justify-end items-center gap-4 shrink-0'>
                <Button variant='outline' onClick={ onReset }>
                    Reset
                </Button>
                <Button onClick={ () => savePage({ name: pageName, rootNode: tree, lastEdited: Date.now() }) }>
                    Save
                </Button>
            </header>
            
            <div className='flex flex-1 overflow-hidden'>
                <Card className='min-w-32 max-w-[33%] resize-x overflow-auto h-full rounded-none border-r border-l-0 border-t-0 border-b-0 bg-muted/20'>
                    <div className='p-4'>
                        { selectedNode && selectedNodeMetadata && (
                            <PropertiesPanel
                                node={ selectedNode }
                                metadata={ selectedNodeMetadata }
                                onNodeUpdate={ updateNode }
                            />
                        ) }
                    </div>
                </Card>
                
                <div className='flex-1 h-full bg-muted/10 z-1'>
                    <iframe 
                        ref={ iframeRef } 
                        src={ `/admin/viewer/${ pageName }` }
                        className='w-full h-full border-0 bg-white'
                        title='Page Editor'
                    />
                </div>
                
                <Card
                    className='min-w-48 overflow-visible resize-x h-full rounded-none border-l border-r-0 border-t-0 border-b-0 bg-muted/20'    
                    style={ {
                        direction: 'rtl',
                        padding: 0,
                        ...(
                            visibleRightPanel
                            ?   {}
                            :   {
                                    minWidth: 0,
                                    maxWidth: 0,
                                }
                        )
                    } }
                >
                    <Button
                        variant='outline'
                        style={ { position: 'absolute', transform: 'translate(-100%)' } }
                        className='z-20 -left-2 top-2 w-10 h-10'
                        onClick={ () => setRightPanelVisibility((v) => !v) }
                    >
                        <ChevronRightIcon style={ !visibleRightPanel ? { transform: 'rotate(180deg)' } : undefined } />
                    </Button>
                    <div className='p-2' style={ { direction: 'ltr' } }>
                        <TreePanel node={ tree } />
                    </div>
                </Card>
            </div>
        </main>
    );
};

export default Editor;