'use client';
import React from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Trash2, Type } from 'lucide-react';
import { useComponentDb } from '@/components/componentDbProvider';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type Props = {
    node: ComponentNode;
    selectedNodeId?: string;
    onParentChange?: (childId: string, newParentId: string) => void;
};

const DragCTX = React.createContext<(childId: string, newParentId: string) => void>(() => null);

const TreePanelNode: React.FC<Props> = ({ node, selectedNodeId, onParentChange: onParentChangeCallback }) => {
    const { getComponent } = useComponentDb();
    const reference = React.useRef<HTMLDivElement>(null);
    const onParentChange = React.useContext(DragCTX);
    const [ isExpanded, setIsExpanded ] = React.useState<boolean>(true);
    const [ Icon, setIcon ] = React.useState<React.ComponentType<any>>(Type);

    React.useEffect(() => {
        getComponent(node.type)
            .then((value) => value?.Icon ? setIcon(() => value.Icon) : null)
            .catch(() => null);
    }, [ node.type ]);

    const onDragStart = (e: DragEvent) => {
        e.dataTransfer?.setData('text/plain', node.id);
        if (e.dataTransfer)
            e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: DragEvent) => e.preventDefault();

    const onDrop = (e: DragEvent) =>
        onParentChange(e.dataTransfer?.getData('text/plain')!, node.id);
    
    React.useEffect(() => {
        const currentRef = reference.current;
        if (!currentRef) return;

        currentRef.addEventListener('dragstart', onDragStart);
        currentRef.addEventListener('dragover', onDragOver);
        currentRef.addEventListener('drop', onDrop);

        return () => {
            currentRef.removeEventListener('dragstart', onDragStart);
            currentRef.removeEventListener('dragover', onDragOver);
            currentRef.removeEventListener('drop', onDrop);
        };
    }, [ reference, node.id ]);

    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const child = (
        <div className='text-sm text-muted-foreground'>
            <div
                ref={ reference }
                draggable={ true }
                onClick={ () => window.postMessage({ type: 'select', payload: node.id }) }
                className={ cn(
                    'flex items-center py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors',
                    selectedNodeId === node.id && 'bg-muted text-foreground'
                ) }
            >
                <div className='flex items-center flex-1 gap-1'>
                    {
                        hasChildren
                        ?   <ChevronRight
                                className={ cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90') }
                                onClick={ handleToggleExpand }
                            />
                        :   <div className='w-4' />
                    }
                    <Icon />
                    <span className='ml-2 truncate'>{ node.id }</span>
                </div>
            </div>
            {
                isExpanded && hasChildren && (
                    <div className='pl-4 border-l border-muted-foreground/20 ml-[11px]'>
                        {
                            Array.isArray(node.children) && node.children.map((child) => (
                                <TreePanelNode
                                    key={ 'child-' + child.id }
                                    node={ child }
                                    selectedNodeId={ selectedNodeId }
                                />
                            ))
                        }
                    </div>
                )
            }
        </div>
    );

    return onParentChangeCallback
    ?   <DragCTX value={ onParentChangeCallback }>{ child }</DragCTX>
    :   child;
};

const TreePanel: React.FC<Props & {
    onDelete?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    hasSelectedNode?: boolean
}> = ({
    onDelete,
    onMoveUp,
    onMoveDown,
    hasSelectedNode,
    ...props
}) => {
    return (
        <div className='h-full flex flex-col gap-2'>
            <div className='overflow-y-scroll flex-1'>
                <TreePanelNode { ...props } />
            </div>
            <div className='flex gap-2'>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={ onMoveUp }
                    disabled={ !hasSelectedNode }
                ><ChevronUp /></Button>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={ onMoveDown }
                    disabled={ !hasSelectedNode }
                ><ChevronDown /></Button>
                <Button
                    variant='destructive'
                    className='flex-1'
                    onClick={ onDelete }
                    disabled={ !hasSelectedNode }
                ><Trash2 /> Delete</Button>
            </div>
        </div>
    )
};

export default TreePanel;