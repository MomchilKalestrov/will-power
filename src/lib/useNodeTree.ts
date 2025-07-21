'use client';
import React from 'react';

const useNodeTree = (initialTree?: PageNode) => {
    const [tree, setTree] = React.useState<PageNode | undefined>(initialTree);
    const treeRef = React.useRef(tree);

    React.useEffect(() => {
        treeRef.current = tree;
    }, [ tree ]);

    const findNode = React.useCallback((id: string, node?: PageNode): PageNode | null => {
        const startNode = node || treeRef.current;

        if (!startNode) return null;
        if (id === startNode.id) return startNode;
        if (!Array.isArray(startNode.children)) return null;
        
        for (const child of startNode.children) {
            const result = findNode(id, child);
            if (result) return result;
        }

        return null;
    }, []);

    const updateNode = React.useCallback((id: string, data: Partial<Omit<PageNode, 'children' | 'id'>>) => {
        const update = (node: PageNode): PageNode => {
            if (node.id === id) {
                // Make sure props and style are not undefined
                const newProps = { ...(node.props || {}), ...(data.props || {}) };
                const newStyle = { ...(node.style || {}), ...(data.style || {}) };
                
                return { ...node, ...data, props: newProps, style: newStyle };
            }

            if (Array.isArray(node.children)) {
                return { ...node, children: node.children.map(child => update(child)) };
            }

            return node;
        };
        
        setTree(currentTree => currentTree ? update(currentTree) : undefined);
    }, []);

    const addNode = React.useCallback((parentId: string, newNode: PageNode) => {
        const add = (node: PageNode): PageNode => {
            if (node.id === parentId) {
                const children = Array.isArray(node.children) ? [...node.children, { ...newNode, id: crypto.randomUUID() }] : [{ ...newNode, id: crypto.randomUUID() }];
                return { ...node, children };
            }

            if (Array.isArray(node.children)) {
                return { ...node, children: node.children.map(child => add(child)) };
            }

            return node;
        };

        setTree(currentTree => currentTree ? add(currentTree) : undefined);
    }, []);

    const removeNode = React.useCallback((id: string) => {
        const remove = (node: PageNode): PageNode | null => {
            if (Array.isArray(node.children)) {
                const newChildren = node.children.map(child => remove(child)).filter(Boolean) as PageNode[];
                if (newChildren.length !== node.children.length) {
                    return { ...node, children: newChildren };
                }
            }
            return node.id === id ? null : node;
        };
        
        setTree(currentTree => currentTree ? remove(currentTree) ?? undefined : undefined);
    }, []);

    const moveNode = React.useCallback((nodeId: string, newParentId: string, index: number) => {
        let nodeToMove: PageNode | null = null;

        // First, remove the node from its current position
        const remove = (node: PageNode): PageNode | null => {
            if (node.id === nodeId) {
                nodeToMove = { ...node };
                return null;
            }
            if (Array.isArray(node.children)) {
                const newChildren = node.children.map(child => remove(child)).filter(Boolean) as PageNode[];
                return { ...node, children: newChildren };
            }
            return node;
        };

        // Then, add it to the new parent
        const add = (node: PageNode): PageNode => {
            if (node.id === newParentId && nodeToMove) {
                const children = Array.isArray(node.children) ? [...node.children] : [];
                children.splice(index, 0, nodeToMove);
                return { ...node, children };
            }
            if (Array.isArray(node.children)) {
                return { ...node, children: node.children.map(child => add(child)) };
            }
            return node;
        };

        setTree(currentTree => {
            if (!currentTree) return undefined;
            const treeWithoutNode = remove(currentTree);
            if (!treeWithoutNode || !nodeToMove) return currentTree; // Move failed
            return add(treeWithoutNode);
        });
    }, []);

    return { tree, setTree, findNode, updateNode, addNode, removeNode, moveNode };
};

export default useNodeTree;