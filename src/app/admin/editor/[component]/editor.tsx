'use client';
import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { del } from 'idb-keyval';
import { Plus, RotateCcw, Settings } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import Logo from '@/components/icons/logo';
import TreePanel from '@/components/treePanel';
import BlockPanel from '@/components/blocksPanel';
import SettingsEditor from '@/components/settingsPanel';
import PropertiesPanel from '@/components/propertiesPanel';

import useNodeTree from '@/hooks/useNodeTree';

import { useComponents } from '@/contexts/components';

import { storage } from '@/lib/utils';
import { componentNodeSchema } from '@/lib/zodSchemas';
import { saveComponent } from '@/lib/db/actions/component';

import ComponentHistoryMenu from './componentHistoryMenu';

type Props = {
    component: Component;
};

const colors: Record<componentType, [ string, string ]> = {
    header: [ 'var(--color-green-900)', 'var(--color-green-300)' ],
    page: [ 'var(--color-cyan-900)', 'var(--color-indigo-300)' ],
    footer: [ 'var(--color-purple-900)', 'var(--color-purple-300)' ],
    component: [ 'var(--color-rose-900)', 'var(--color-rose-300)' ]
};

const newNode = (type: string, acceptChildren: boolean): ComponentNode => ({
    id: crypto.randomUUID(),
    name: type.toLowerCase(),
    type,
    style: {},
    attributes: {},
    children: [],
    props: {},
    acceptChildren
});

const Editor: React.FC<Props> = ({ component: initialComponent }) => {
    const [ component, setComponent ] = React.useState<Component>(initialComponent);
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
    } = useNodeTree(() => {
        if (!storage.has(component.name)) {
            storage.set(component.name, component);
            return component.rootNode;
        };
        
        const localRevision: Component = storage.parse<Component>(component.name);
        if (localRevision.lastEdited < component.lastEdited)
            toast('A newer version is available on the server.');
        return localRevision.rootNode;
    });
    const [ selectedNode, setSelectedNode ] = React.useState<ComponentNode | undefined>();
    const [ nodeMetadata, setNodeMetadata ] = React.useState<NodeMetadata | undefined>();
    const [ settingsOpen, setSettingsOpen ] = React.useState<boolean>(false);
    const { getComponent } = useComponents();
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    React.useEffect(() => {
        if (!iframeRef.current || !tree) return;

        storage.set(component.name, {
            ...component,
            rootNode: tree,
            lastEdited: Date.now()
        });

        iframeRef.current.contentWindow?.postMessage({
            type: 'update-tree'
        }, '*');
    }, [ tree, component ]);

    const onMessage = React.useCallback(async (event: MessageEvent) => {
        switch (event.data.type) {
            case 'select':
                const node = findNode(event.data.payload)!;
                setSelectedNode(node);
                setNodeMetadata((await getComponent(node.type))?.metadata);
                break;
            case 'reparent':
                reparentNode(event.data.payload.child, event.data.payload.parent);
                break;
        }
    }, [ findNode, getComponent ]);

    const onReset = React.useCallback(async () => {
        setTree(component.rootNode);
        storage.set(component.name, component);
        setComponent(component);
    }, [ component ]);

    const onSave = React.useCallback(async ({ currentTarget: button }: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        button.disabled = true;
        
        del(`preview-${ component.name }`);
        const response = await saveComponent({
            ...component,
            rootNode: tree
        })

        button.disabled = false;
        toast(response.success ? 'Saved.' : ('Failed to save: ' + response.reason));
    }, [ component, tree ]);
    
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

    const onCopy = React.useCallback(() => {
        window.focus();
        if (selectedNode !== undefined)
            navigator.clipboard.writeText(JSON.stringify(selectedNode));
    }, [ selectedNode ]);

    const onPaste = React.useCallback(async () => {
        window.focus();
        const rewriteAllIds = (node: ComponentNode) => {
            node.id = crypto.randomUUID();
            node.children?.forEach(rewriteAllIds);
            return node;
        };

        const text = await navigator.clipboard.readText();
        const json = JSON.parse(text);
        const data: ComponentNode = componentNodeSchema.parse(json);

        const parentId =
            selectedNode !== undefined && selectedNode.acceptChildren
            ?   selectedNode.id
            :   'root';
        
        addNode(parentId, rewriteAllIds(data));
    }, [ selectedNode ]);
    
    React.useEffect(() => {
        const wrapper = (event: KeyboardEvent) => {
            if (!event.ctrlKey) return;
            if (event.code === 'KeyV') onPaste();
            if (event.code === 'KeyC') onCopy();
        };
    
        if (iframeRef.current)
            iframeRef.current.contentWindow?.addEventListener('keydown', wrapper);
        window.addEventListener('keydown', wrapper);
        return () => {
            if (iframeRef.current)
                iframeRef.current.contentWindow?.removeEventListener('keydown', wrapper);
            window.removeEventListener('keydown', wrapper);
        };
    }, [ onCopy, onPaste, iframeRef ]);
    
    if (!tree) return null;

    return (
        <>
            <header
                className='h-16 w-full px-4 border-b bg-background flex justify-between items-center gap-4 shrink-0'
                style={ {
                    '--primary': colors[ component.type ][ document.body.classList.contains('dark') ? 1 : 0 ]
                } as React.CSSProperties }
            >
                <section className='flex gap-2'>
                    <Button size='icon'>
                        <Link href='/admin/components/page'><Logo /></Link>
                    </Button>
                    <Button size='icon' variant='outline' onClick={ () => {
                        setSelectedNode(undefined);
                        setSettingsOpen(false);
                    } }><Plus /></Button>
                    {
                        component.type !== 'component' &&
                        <Button size='icon' variant='outline' onClick={ () => {
                            setSelectedNode(undefined);
                            setSettingsOpen(true);
                        } }><Settings /></Button>
                    }
                </section>
                <section>
                    <ComponentHistoryMenu
                        type={ component.type }
                        currentComponentName={ component.name }
                    />
                </section>
                <section className='flex gap-2'>
                    <Button variant='outline' size='icon' onClick={ onReset }>
                        <RotateCcw />
                    </Button>
                    <Button onClick={ onSave }>Save</Button>
                </section>
            </header>
            <main
                className='w-screen h-[calc(100dvh-var(--spacing)*16)] flex flex-col overflow-hidden'
            >
                <div className='flex flex-1 overflow-hidden'>
                    <Card className='bg-background min-w-32 w-80 max-w-[33%] overflow-x-hidden overflow-y-scroll resize-x h-full rounded-none border-0 border-r p-4'>
                        { 
                            (selectedNode && nodeMetadata)
                            ?   <PropertiesPanel
                                    node={ selectedNode }
                                    metadata={ nodeMetadata }
                                    onNodeUpdate={ (id, data) => {
                                        updateNode(id, data);
                                        setSelectedNode(state => ({ ...state!, ...data }));
                                    } }
                                />
                            :   settingsOpen
                                ?   <SettingsEditor
                                        component={ component }
                                        onChange={ props => {
                                            setComponent(state => ({ ...state, ...props } as Component))
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
                        src={ `/admin/viewer/${ component.name }` }
                        className='grow h-full border-0'
                        title='Page Editor'
                    />

                    <Card
                        className='bg-background min-w-48 max-w-[33%] overflow-hidden resize-x h-full rounded-none border-l border-r-0 border-t-0 border-b-0 p-4 shadow-none overflow-y-scroll'    
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
                                onDelete={ () => {
                                    setSelectedNode(undefined);
                                    removeNode(selectedNode!.id);
                                } }
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