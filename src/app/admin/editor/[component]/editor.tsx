'use client';
import React from 'react';
import { notFound } from 'next/navigation';
import { Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PropertiesPanel from '@/components/propertiesPanel';
import TreePanel from '@/components/treePanel';
import { getComponentByName, saveComponent } from '@/lib/db/actions';
import useNodeTree from '@/hooks/useNodeTree';
import BlockPanel from '@/components/blocksPanel';
import SettingsPopover from '@/components/settingsPopover';

type Props = {
    component: string;
};

const randomId = (): string => Math.floor(Math.random() * 9999).toString().padStart(4, '0');

const newNode = (type: string): ComponentNode => ({
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

const Editor: React.FC<Props> = ({ component: componentName }) => {
    const [ type, setType ] = React.useState<componentType>('page');
    const { tree, setTree, findNode, updateNode, reparentNode, addNode } = useNodeTree();
    const [ selectedNode, setSelectedNode ] = React.useState<ComponentNode | undefined>();
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    React.useEffect(() => {
        if (!componentName) return;

        getComponentByName(componentName)
            .then((remoteRevision) => {
                console.log(remoteRevision);
                if (!remoteRevision)
                    notFound();
                
                setType(remoteRevision.type);
                const localRevisionString = localStorage.getItem(componentName);
                if (localRevisionString) {
                    const localRevision: Component = JSON.parse(localRevisionString);
                    if (localRevision.lastEdited < remoteRevision.lastEdited)
                        alert('A newer version is available on remote');
                    setTree(localRevision.rootNode);
                    return;
                }

                setTree(remoteRevision.rootNode);
                localStorage.setItem(componentName, JSON.stringify(remoteRevision));
            });
    }, [ componentName ]);

    React.useEffect(() => {
        if (!iframeRef.current || !tree) return
        
        localStorage.setItem(componentName, JSON.stringify({
            name: componentName,
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
    }, [ tree, findNode ]);

    const onReset = React.useCallback(async () => {
        const remoteRevision = await getComponentByName(componentName);
        setTree(remoteRevision?.rootNode);
        localStorage.setItem(componentName, JSON.stringify(remoteRevision));
    }, [ componentName ]);
    
    React.useEffect(() => {
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

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
                <section className='flex gap-2'>
                    <SettingsPopover />
                    <Button className='size-9 p-0' variant='outline' onClick={ () => setSelectedNode(undefined) }>
                        <Plus />
                    </Button>
                </section>
                <section className='flex gap-2'>
                    <Button variant='outline' size='icon' onClick={ onReset }>
                        <RotateCcw />
                    </Button>
                    <Button onClick={ () =>
                        saveComponent({
                            type,
                            name: componentName,
                            rootNode: tree,
                            lastEdited: Date.now()
                        })
                    }>
                        Save
                    </Button>
                </section>
            </header>
            <main className='w-screen h-[calc(100dvh_-_var(--spacing)_*_16)] flex flex-col overflow-hidden bg-background'>
                <div className='flex flex-1 overflow-hidden'>
                    <Card className='min-w-32 w-80 max-w-[33%] overflow-hidden resize-x h-full rounded-none border-0 border-r bg-muted/20 p-4'>
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
                        src={ `/admin/viewer/${ componentName }` }
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