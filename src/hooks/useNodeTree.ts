'use client';
import React from 'react';

const useNodeTree = (initialTree?: PageNode) => {
    const [tree, setTree] = React.useState<PageNode | undefined>(initialTree);
    const treeRef = React.useRef(tree);

    React.useEffect(() => { treeRef.current = tree; }, [ tree ]);

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

    const reparentNode = React.useCallback((childId: string, newParentId: string) => {
        // Prevent a node from becoming its own parent
        if (childId === newParentId) return;

        // Check if the new parent accepts children
        const newParentNode = findNode(newParentId);
        if (newParentNode && !newParentNode.acceptChildren) {
            console.error("The new parent node does not accept children.");
            return;
        }

        // Prevent a node from being moved into one of its own children
        const nodeToMoveInitial = findNode(childId);
        if (nodeToMoveInitial && findNode(newParentId, nodeToMoveInitial)) {
            console.error("Cannot move a node into one of its own children.");
            return;
        }

        let nodeToMove: PageNode | null = null;

        setTree(currentTree => {
            if (!currentTree) return undefined;

            // First, find and remove the node from its current position
            const remove = (node: PageNode): PageNode | null => {
                // If this is the node to move, save it and remove it from the tree by returning null
                if (node.id === childId) {
                    nodeToMove = { ...node };
                    return null;
                }

                // If this node has children, recurse through them
                if (Array.isArray(node.children)) {
                    const newChildren = node.children
                        .map(child => remove(child))
                        .filter(Boolean) as PageNode[];
                    
                    // Return the node with its potentially updated children list
                    return { ...node, children: newChildren };
                }

                return node;
            };

            // Then, add the removed node to its new parent
            const add = (node: PageNode): PageNode => {
                // If this is the new parent, add the node to its children
                if (node.id === newParentId && nodeToMove) {
                    const children = Array.isArray(node.children) ? [...node.children, nodeToMove] : [nodeToMove];
                    return { ...node, children };
                }

                // If this node has children, recurse through them
                if (Array.isArray(node.children)) {
                    return { ...node, children: node.children.map(child => add(child)) };
                }

                return node;
            };

            const treeAfterRemoval = remove(currentTree);

            // If the node to move wasn't found or the tree is empty after removal, do nothing
            if (!nodeToMove || !treeAfterRemoval) {
                return currentTree;
            }

            // Return the new tree with the node in its new position
            return add(treeAfterRemoval);
        });
    }, [findNode]);

    const updateNode = React.useCallback((id: string, data: Partial<Omit<PageNode, 'children'>>) => {
        const update = (node: PageNode): PageNode => {
            if (node.id === id) {
                const newProps = { ...(node.props || {}), ...(data.props || {}) };
                const newStyle = { ...(node.style || {}), ...(data.style || {}) };
                
                return { ...node, ...data, props: newProps, style: newStyle };
            }

            if (Array.isArray(node.children))
                return { ...node, children: node.children.map(child => update(child)) };

            return node;
        };
        
        setTree(currentTree => currentTree ? update(currentTree) : undefined);
    }, []);

    const addNode = React.useCallback((parentId: string, newNode: PageNode) => {
        const parentNode = findNode(parentId);
        if (parentNode && !parentNode.acceptChildren) {
            console.error("The parent node does not accept children.");
            return;
        }

        const add = (node: PageNode): PageNode => {
            if (node.id === parentId) {
                const children = Array.isArray(node.children) ? [...node.children, { ...newNode }] : [{ ...newNode }];
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
        const newParentNode = findNode(newParentId);
        if (newParentNode && !newParentNode.acceptChildren) {
            console.error("The new parent node does not accept children.");
            return;
        }

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

    return { tree, setTree, findNode, updateNode, addNode, removeNode, moveNode, reparentNode };
};

export default useNodeTree;