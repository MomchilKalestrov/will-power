'use client';
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plus, RotateCcw } from 'lucide-react';
import { del } from 'idb-keyval';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PropertiesPanel from '@/components/propertiesPanel';
import TreePanel from '@/components/treePanel';
import { getComponentByName, saveComponent } from '@/lib/db/actions';
import useNodeTree from '@/hooks/useNodeTree';
import BlockPanel from '@/components/blocksPanel';
import ComponentHistoryMenu from './componentHistoryMenu';
import { toast } from 'sonner';
import { storage } from '@/lib/utils';
import Logo from '@/components/icons/logo';
import { useComponentDb } from '@/components/componentDb';

type Props = {
    component: string;
};

const colors: Record<componentType, [ string, string ]> = {
    header: [ 'var(--color-green-900)', 'var(--color-green-300)' ],
    page: [ 'var(--color-cyan-900)', 'var(--color-indigo-300)' ],
    footer: [ 'var(--color-purple-900)', 'var(--color-purple-300)' ],
    component: [ 'var(--color-rose-900)', 'var(--color-rose-300)' ]
};

const randomId = (): string => Math.floor(Math.random() * 9999).toString().padStart(4, '0');

const newNode = (type: string, acceptChildren: boolean): ComponentNode => ({
    id: type + '-' + randomId(),
    type,
    style: {},
    attributes: {},
    children: [],
    props: {},
    acceptChildren
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
    const {
        tree,
        setTree,
        findNode,
        updateNode,
        reparentNode,
        addNode,
        removeNode,
        moveNodeUp,
        moveNodeDown
    } = useNodeTree();
    const [ selectedNode, setSelectedNode ] = React.useState<ComponentNode | undefined>();
    const [ nodeMetadata, setNodeMetadata ] = React.useState<NodeMetadata | undefined>();
    const { getComponent } = useComponentDb();
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    React.useEffect(() => {
        if (!componentName) return;

        getComponentByName(componentName)
            .then((remoteRevision) => {
                if (!remoteRevision)
                    notFound();
                
                setType(remoteRevision.type);

                if (!storage.has(componentName)) {
                    storage.set(componentName, remoteRevision);
                    setTree(remoteRevision.rootNode);
                } else {
                    const localRevision: Component = storage.parse<Component>(componentName);
                    setTree(localRevision.rootNode);
                    if (localRevision.lastEdited < remoteRevision.lastEdited)
                        toast('A newer version is available on remote');
                }
            });
    }, [ componentName ]);

    React.useEffect(() => {
        if (!iframeRef.current || !tree) return;

        storage.set(componentName, {
            ...storage.parse<Component>(componentName),
            rootNode: tree,
            lastEdited: Date.now()
        });

        iframeRef.current.contentWindow?.postMessage({
            type: 'update-tree'
        }, '*');
    }, [ tree ]);

    const onMessage = React.useCallback((event: MessageEvent) => {
        switch (event.data.type) {
            case 'select':
                const node = findNode(event.data.payload)!;
                setSelectedNode(node);
                getComponent(node.type)
                    .then((value) => setNodeMetadata(value!.metadata));
        }
    }, [ findNode, getComponent ]);

    const onReset = React.useCallback(async () => {
        const remoteRevision = await getComponentByName(componentName);
        setTree(remoteRevision?.rootNode);
        storage.set(componentName, remoteRevision);
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

    return (
        <>
            <header
                className='h-16 w-full px-4 border-b bg-background flex justify-between items-center gap-4 shrink-0'
                style={ {
                    '--primary': colors[ type ][ document.body.classList.contains('dark') ? 1 : 0 ]
                } as React.CSSProperties }
            >
                <section className='flex gap-2'>
                    <Button size='icon'>
                        <Link href='/admin/components/page'><Logo /></Link>
                    </Button>
                    <Button size='icon' variant='outline' onClick={ () => setSelectedNode(undefined) }>
                        <Plus />
                    </Button>
                </section>
                <section>
                    <ComponentHistoryMenu
                        type={ type }
                        currentComponentName={ componentName }
                    />
                </section>
                <section className='flex gap-2'>
                    <Button variant='outline' size='icon' onClick={ onReset }>
                        <RotateCcw />
                    </Button>
                    <Button onClick={ ({ currentTarget: button }) => {
                        button.disabled = true;
                        del(`preview-${ componentName }`);
                        saveComponent({
                            ...storage.parse<Component>(componentName),
                            rootNode: tree
                        }).then(() => {
                            button.disabled = false;
                            toast('Saved!');
                        }).catch(() => {
                            button.disabled = false;
                            toast('Failed saving.');
                        })
                    } }>Save</Button>
                </section>
            </header>
            <main
                className='w-screen h-[calc(100dvh_-_var(--spacing)_*_16)] flex flex-col overflow-hidden'
                style={ { '--primary': colors[ type ] } as React.CSSProperties }
            >
                <div className='flex flex-1 overflow-hidden'>
                    <Card className='bg-background min-w-32 w-80 max-w-[33%] overflow-hidden resize-x h-full rounded-none border-0 border-r p-4'>
                        { 
                            (selectedNode && nodeMetadata)
                            ?   <PropertiesPanel
                                    node={ selectedNode }
                                    metadata={ nodeMetadata }
                                    onNodeUpdate={ (id, data) => {
                                        setSelectedNode((state) => ({ ...state!, ...data }));
                                        updateNode(id, data);
                                    } }
                                />
                            :   <BlockPanel onNodeAdd={
                                    (type, acceptChildren) =>
                                        addNode(tree.id, newNode(type, acceptChildren))
                                } />
                        }
                    </Card>
                    
                    <iframe 
                        ref={ iframeRef } 
                        src={ `/admin/viewer/${ componentName }` }
                        className='flex-grow h-full border-0'
                        title='Page Editor'
                    />

                    <Card
                        className='bg-background min-w-48 max-w-[33%] overflow-hidden resize-x h-full rounded-none border-l border-r-0 border-t-0 border-b-0 p-4 shadow-none'    
                        style={ { direction: 'rtl' } }
                    >
                        <div style={ { direction: 'ltr' } } className='h-full'>
                            <TreePanel
                                node={ tree }
                                onParentChange={ (childId, newParentId) => {
                                    try {
                                        reparentNode(childId, newParentId);
                                    } catch (error: Error & any) {
                                        // like fuck you typescript, why can't I write `Error` instead of `Error & any`
                                        if (error.message !== 'The new parent node does not accept children.')
                                            throw error;
                                    }
                                } }
                                hasSelectedNode={ !!selectedNode }
                                onDelete={ () => removeNode(selectedNode!.id) }
                                onMoveUp={ () => moveNodeUp(selectedNode!.id) }
                                onMoveDown={ () => moveNodeDown(selectedNode!.id) }
                            />
                        </div>
                    </Card>
                </div>
            </main>
        </>
    );
};

export default Editor;