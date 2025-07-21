'use client';
import React from 'react';
import { ChevronRight, Type, Box, Text } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    node: PageNode;
    selectedNodeId?: string;
};

const TreePanel: React.FC<Props> = ({ node, selectedNodeId }) => {
    const [ isExpanded, setIsExpanded ] = React.useState<boolean>(true);
    const icons = React.useMemo<{ [ key: string ]: React.ElementType }>(() => ({
        'Container': Box,
        'Paragraph': Text,
    }), [])

    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className='text-sm text-muted-foreground font-sans'>
            <div
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
                    { React.createElement(icons[ node.type ] || Type, { className: 'w-4 h-4' }) }
                    <span className='ml-2 truncate'>{ node.id }</span>
                </div>
            </div>
            {
                isExpanded && hasChildren && (
                    <div className='pl-4 border-l border-muted-foreground/20 ml-[11px]'>
                        {
                            Array.isArray(node.children) && node.children.map((child) => (
                                <TreePanel
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
};

export default TreePanel;